import { NextRequest, NextResponse } from "next/server";
import { subscriptionPlan, stripePriceId } from "@/lib/catalog";
import { checkoutSessionParams, newIntegrationIdentifier } from "@/lib/billing/checkout";
import { appOrigin, createServiceSupabase, stripeClient } from "@/lib/billing/stripe-server";
import { ledgerReady } from "@/lib/billing/supabase-store";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: "Sign-in is temporarily unavailable. Nothing was charged." },
      { status: 503 },
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !user.id) {
    return NextResponse.json(
      { error: "Sign in to continue.", redirect: "/login?next=/pricing" },
      { status: 401 },
    );
  }

  let planId = "";
  try {
    const body = await req.json();
    planId = typeof body?.plan === "string" ? body.plan : "";
  } catch {
    planId = "";
  }
  const plan = subscriptionPlan(planId);
  if (!plan) {
    return NextResponse.json({ error: "That plan cannot be bought by card." }, { status: 400 });
  }

  const priceId = stripePriceId(plan);
  const stripe = stripeClient();
  const service = createServiceSupabase();
  if (!priceId || !stripe || !service) {
    return NextResponse.json(
      { error: "Card checkout is not configured. Nothing was charged." },
      { status: 503 },
    );
  }

  const ready = await ledgerReady(service);
  if (!ready) {
    return NextResponse.json(
      { error: "The purchase ledger is not on this database yet. Nothing was charged." },
      { status: 503 },
    );
  }

  try {
    const session = await stripe.checkout.sessions.create(
      checkoutSessionParams({
        priceId,
        userId: user.id,
        email: user.email,
        plan,
        origin: appOrigin(req.nextUrl.origin),
        integrationIdentifier: newIntegrationIdentifier(),
      }),
    );
    if (!session.url) {
      return NextResponse.json(
        { error: "Card checkout did not start. Nothing was charged." },
        { status: 502 },
      );
    }
    return NextResponse.json({ url: session.url });
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: unknown }).code ?? "error")
        : "error";
    console.error("checkout session failed", code);
    return NextResponse.json(
      { error: "Card checkout did not start. Nothing was charged." },
      { status: 502 },
    );
  }
}
