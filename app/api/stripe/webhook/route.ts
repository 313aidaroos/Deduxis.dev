import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { plansByStripePrice } from "@/lib/catalog";
import { createServiceSupabase, stripeClient } from "@/lib/billing/stripe-server";
import {
  chargeMark,
  deduxisInvoiceSubscriptionId,
  draftFromCheckoutSession,
  draftFromInvoice,
  subscriptionFromEvent,
} from "@/lib/billing/stripe-events";
import { ensurePurchase, LedgerNotReady } from "@/lib/billing/purchases";
import {
  markLedgerStatus,
  supabasePurchaseStore,
  upsertCardSubscription,
} from "@/lib/billing/supabase-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripe = stripeClient();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const service = createServiceSupabase();
  if (!service) {
    return NextResponse.json({ error: "Purchase records are not configured." }, { status: 503 });
  }

  const prices = plansByStripePrice();
  const store = supabasePurchaseStore(service);

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const draft = draftFromCheckoutSession(event.data.object, prices);
      if (draft) {
        await ensurePurchase(store, draft);
        if (draft.stripeSubscriptionId) {
          await upsertCardSubscription(service, {
            userId: draft.userId,
            planKey: draft.planKey,
            subscriptionId: draft.stripeSubscriptionId,
            customerId: draft.stripeCustomerId,
            status: "active",
            periodEnd: null,
          });
        }
      }
    } else if (event.type === "invoice.paid") {
      const draft = draftFromInvoice(event.data.object, prices);
      if (draft) {
        await ensurePurchase(store, draft);
        if (draft.stripeSubscriptionId) {
          await upsertCardSubscription(service, {
            userId: draft.userId,
            planKey: draft.planKey,
            subscriptionId: draft.stripeSubscriptionId,
            customerId: draft.stripeCustomerId,
            status: "active",
            periodEnd: null,
          });
        }
      }
    } else if (event.type === "invoice.payment_failed") {
      const subscriptionId = deduxisInvoiceSubscriptionId(event.data.object, prices);
      if (subscriptionId) {
        await upsertCardSubscription(service, {
          userId: null,
          planKey: null,
          subscriptionId,
          customerId: null,
          status: "past_due",
          periodEnd: null,
        });
      }
    } else if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const patch = subscriptionFromEvent(event.data.object, prices);
      if (patch) await upsertCardSubscription(service, patch);
    } else if (
      event.type === "charge.refunded" ||
      event.type === "charge.dispute.created" ||
      event.type === "radar.early_fraud_warning.created"
    ) {
      const mark = chargeMark(event.type, event.data.object);
      if (mark) await markLedgerStatus(service, mark.ids, mark.status);
    }
  } catch (error) {
    if (error instanceof LedgerNotReady) {
      console.error("stripe webhook ledger missing", event.type, event.id);
      return NextResponse.json({ error: "Purchase ledger is not ready." }, { status: 500 });
    }
    console.error("stripe webhook failed", event.type, event.id);
    return NextResponse.json({ error: "Could not record the purchase." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
