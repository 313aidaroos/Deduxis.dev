import { NextRequest, NextResponse } from "next/server";
import { appOrigin, stripeClient } from "@/lib/billing/stripe-server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: "Sign-in is temporarily unavailable." },
      { status: 503 },
    );
  }
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  }

  const stripe = stripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Card management is not configured. Nothing was charged." },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("billing_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .not("stripe_customer_id", "is", null)
    .limit(1)
    .maybeSingle();
  if (error || !data?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No card subscription is on file yet." },
      { status: 404 },
    );
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id as string,
      return_url: `${appOrigin(req.nextUrl.origin)}/account/purchases`,
    });
    return NextResponse.json({ url: session.url });
  } catch (portalError) {
    const code =
      portalError && typeof portalError === "object" && "code" in portalError
        ? String((portalError as { code?: unknown }).code ?? "error")
        : "error";
    console.error("billing portal failed", code);
    return NextResponse.json(
      { error: "Card management did not open. Nothing was charged." },
      { status: 502 },
    );
  }
}
