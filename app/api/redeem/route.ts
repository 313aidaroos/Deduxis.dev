// Redeem an Ixis subscription through the Wallet, then record a Deduxis receipt and ledger row.
import { NextRequest, NextResponse } from "next/server";
import { subscriptionPlan } from "@/lib/catalog";
import { createServiceSupabase } from "@/lib/billing/stripe-server";
import { ensurePurchase, LedgerNotReady } from "@/lib/billing/purchases";
import type { PurchaseDraft } from "@/lib/billing/stripe-events";
import { ledgerReady, supabasePurchaseStore } from "@/lib/billing/supabase-store";
import { PRODUCT } from "@/lib/catalog";
import { apixisOwner } from "@/lib/apixis-login";
import { buyIxisUrl, redeem, WalletError } from "@/lib/apixis-wallet";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: "Sign-in is temporarily unavailable. Nothing was charged." },
      { status: 503 },
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.email || !user.id) {
      return NextResponse.json(
        { error: "Sign in to continue.", redirect: "/login?next=/pricing" },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => null);
    const plan = subscriptionPlan(typeof body?.plan === "string" ? body.plan : "");
    const idempotencyKey = typeof body?.idempotencyKey === "string" ? body.idempotencyKey : "";
    if (!plan?.productKey || plan.ixis == null || plan.usdCents == null) {
      return NextResponse.json({ error: "That plan cannot be bought with Ixis." }, { status: 400 });
    }
    if (!UUID.test(idempotencyKey)) {
      return NextResponse.json({ error: "Missing idempotencyKey" }, { status: 400 });
    }

    const service = createServiceSupabase();
    if (!service) {
      return NextResponse.json(
        { error: "Ixis checkout is not configured. Nothing was charged." },
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

    const store = supabasePurchaseStore(service);
    const localKey = `ixis:${plan.productKey}:${idempotencyKey}`;
    const existing = await store.findLedger(localKey);
    if (existing) {
      return NextResponse.json({
        success: true,
        receiptId: existing.wallet_receipt_id,
        receiptNumber: `DX-${existing.id.replace(/-/g, "").slice(-12).toUpperCase()}`,
      });
    }

    const owner = (await apixisOwner(user.email)) ?? user.email;
    const draftBase: PurchaseDraft = {
      userId: user.id,
      channel: "ixis",
      kind: "subscription",
      planKey: plan.id,
      product: PRODUCT,
      amountUsdCents: plan.usdCents,
      ixisAmount: plan.ixis,
      idempotencyKey: localKey,
      description: `Deduxis ${plan.name}. ${plan.ixis.toLocaleString("en-US")} Ixis. Monthly plan.`,
      stripeCheckoutSessionId: null,
      stripeInvoiceId: null,
      stripeSubscriptionId: null,
      stripePaymentIntentId: null,
      stripeChargeId: null,
      stripeCustomerId: null,
      walletReceiptId: null,
      walletReservationId: null,
    };

    const result = await redeem({
      owner,
      productKey: plan.productKey,
      idempotencyKey,
      provision: async (reservation) => {
        const saved = await ensurePurchase(store, {
          ...draftBase,
          walletReservationId: reservation.reservationId,
        });
        return saved;
      },
      unprovision: async (_reservation, saved) => {
        if (saved.created) await store.deleteLedger(saved.ledgerId);
      },
    });

    if (!result.ok) {
      const buyUrl = buyIxisUrl("deduxis", `${req.nextUrl.origin}/pricing`);
      return NextResponse.json(
        {
          error: "Not enough Ixis. Nothing else was charged.",
          insufficient: true,
          needed: result.needed,
          buyUrl,
        },
        { status: 402 },
      );
    }

    if (result.receiptId) {
      await store.setWalletReceipt(result.result.ledgerId, result.receiptId);
    }

    return NextResponse.json({
      success: true,
      receiptId: result.receiptId,
      receiptNumber: result.result.receiptNumber,
    });
  } catch (error) {
    if (error instanceof LedgerNotReady) {
      return NextResponse.json(
        { error: "The purchase ledger is not on this database yet. Nothing was charged." },
        { status: 503 },
      );
    }
    if (error instanceof WalletError) {
      const unknown = error.status === 404 || /unknown product/i.test(error.message);
      console.error("redeem failed", error.status, error.code ?? "");
      return NextResponse.json(
        {
          error: unknown
            ? "This plan is not in the Ixis catalog yet. Nothing was charged."
            : "Ixis checkout did not finish. If you were charged, the receipt is in Apixis Wallet.",
        },
        { status: unknown ? 503 : error.status },
      );
    }
    console.error("redeem failed");
    return NextResponse.json(
      { error: "Ixis checkout did not finish. Nothing was charged if the hold was released." },
      { status: 500 },
    );
  }
}
