import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  planById,
  receiptCap,
  successFeeCents,
  LEGACY_RECEIPTS_PRODUCT,
} from "../lib/catalog.ts";
import { checkoutSessionParams, integrationIdentifier } from "../lib/billing/checkout.ts";
import {
  chargeMark,
  deduxisInvoiceSubscriptionId,
  draftFromCheckoutSession,
  draftFromInvoice,
  subscriptionFromEvent,
} from "../lib/billing/stripe-events.ts";
import { ensurePurchase, memoryStore } from "../lib/billing/purchases.ts";
import { bestReceiptSeat } from "../lib/billing/seat.ts";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const USER = "11111111-1111-4111-8111-111111111111";

test("locked monthly prices, ixis amounts, and receipt caps", () => {
  assert.equal(planById("receipts_personal")?.usdCents, 1000);
  assert.equal(planById("receipts_personal")?.ixis, 1000);
  assert.equal(planById("receipts_business")?.usdCents, 3000);
  assert.equal(planById("receipts_business")?.ixis, 3000);
  assert.equal(planById("monitor")?.usdCents, 10000);
  assert.equal(planById("monitor")?.ixis, 10000);
  assert.equal(planById("recover")?.subscription, false);
  assert.equal(planById("enterprise")?.subscription, false);
  assert.equal(receiptCap("deduxis.receipts.personal.monthly"), 100);
  assert.equal(receiptCap("deduxis.receipts.business.monthly"), null);
  assert.equal(receiptCap(LEGACY_RECEIPTS_PRODUCT), 200);
  assert.equal(receiptCap("deduxis.monitor.monthly"), 0);
});

test("success fees are 25% for Recover and 15% for Monitor", () => {
  assert.equal(successFeeCents(10_000, "recover"), 2500);
  assert.equal(successFeeCents(10_000, "monitor"), 1500);
  assert.equal(successFeeCents(0, "recover"), 0);
  assert.throws(() => successFeeCents(-1, "recover"));
  assert.throws(() => successFeeCents(10.5, "monitor"));
});

test("card checkout is a Deduxis subscription and does not pin payment methods", () => {
  const params = checkoutSessionParams({
    priceId: "price_test_personal",
    userId: USER,
    email: "owner@example.com",
    plan: planById("receipts_personal"),
    origin: "https://deduxis.apixis.dev/",
    integrationIdentifier: integrationIdentifier("abcdefgh"),
  });
  assert.equal(params.mode, "subscription");
  assert.equal(params.metadata.product, "deduxis");
  assert.equal(params.subscription_data.metadata.product, "deduxis");
  assert.equal(params.subscription_data.metadata.plan, "receipts_personal");
  assert.equal(params.client_reference_id, USER);
  assert.equal("payment_method_types" in params, false);
  assert.equal("automatic_tax" in params, false);
  assert.match(params.integration_identifier, /^deduxis_checkout_[a-z]{8}$/);
  assert.equal(params.success_url, "https://deduxis.apixis.dev/account/purchases?checkout=return");
});

test("stripe events ignore other products on the shared account", () => {
  const prices = new Map([["price_personal", planById("receipts_personal")]]);
  const foreign = draftFromInvoice(
    {
      id: "in_other",
      amount_paid: 5000,
      metadata: { product: "renoxis", plan: "receipts_personal", user_id: USER },
      parent: { subscription_details: { subscription: "sub_other", metadata: { product: "renoxis" } } },
    },
    prices,
  );
  assert.equal(foreign, null);
  assert.equal(
    deduxisInvoiceSubscriptionId(
      {
        metadata: { product: "contraxis" },
        parent: { subscription_details: { subscription: "sub_other" } },
      },
      prices,
    ),
    null,
  );
  const skipped = subscriptionFromEvent(
    { id: "sub_other", status: "active", metadata: { product: "lyrixis", user_id: USER } },
    prices,
  );
  assert.equal(skipped, null);
});

test("a paid Deduxis invoice becomes one renewal receipt", () => {
  const prices = new Map([["price_personal", planById("receipts_personal")]]);
  const draft = draftFromInvoice(
    {
      id: "in_2",
      amount_paid: 1000,
      billing_reason: "subscription_cycle",
      customer: "cus_1",
      metadata: {},
      parent: {
        subscription_details: {
          subscription: "sub_1",
          metadata: { product: "deduxis", plan: "receipts_personal", user_id: USER },
        },
      },
      payments: { data: [{ payment: { type: "payment_intent", payment_intent: "pi_123abc" } }] },
    },
    prices,
  );
  assert.ok(draft);
  assert.equal(draft.kind, "renewal");
  assert.equal(draft.product, "deduxis");
  assert.equal(draft.idempotencyKey, "stripe:invoice:in_2");
  assert.equal(draft.stripePaymentIntentId, "pi_123abc");
  assert.equal(draft.amountUsdCents, 1000);

  const unpaid = draftFromCheckoutSession(
    { id: "cs_1", payment_status: "unpaid", mode: "subscription", metadata: { product: "deduxis", plan: "receipts_personal", user_id: USER }, amount_total: 1000 },
    prices,
  );
  assert.equal(unpaid, null);
});

test("the same purchase writes one ledger row and one receipt", async () => {
  const store = memoryStore();
  const draft = draftFromInvoice(
    {
      id: "in_same",
      amount_paid: 3000,
      billing_reason: "subscription_create",
      customer: "cus_9",
      parent: {
        subscription_details: {
          subscription: "sub_9",
          metadata: { product: "deduxis", plan: "receipts_business", user_id: USER },
        },
      },
    },
    new Map(),
  );
  const first = await ensurePurchase(store, draft);
  const second = await ensurePurchase(store, {
    ...draft,
    stripePaymentIntentId: "pi_filled",
  });
  assert.equal(second.created, false);
  assert.equal(first.ledgerId, second.ledgerId);
  assert.equal(store.ledgers.length, 1);
  assert.equal(store.receipts.length, 1);
  assert.equal(store.ledgers[0].stripe_payment_intent_id, "pi_filled");
  assert.match(first.receiptNumber, /^DX-[0-9A-F]{12}$/);
});

test("refunds, disputes, and fraud warnings point at the charge", () => {
  assert.deepEqual(chargeMark("charge.refunded", { id: "ch_abc", payment_intent: "pi_abc" }), {
    status: "refunded",
    ids: ["ch_abc", "pi_abc"],
  });
  assert.equal(chargeMark("charge.dispute.created", { charge: "not-an-id" }), null);
  assert.equal(chargeMark("radar.early_fraud_warning.created", { charge: "ch_warn" })?.status, "review");
});

test("business seat outranks personal, and monitor is not a receipt seat", () => {
  const seat = bestReceiptSeat([
    { product_key: "deduxis.receipts.personal.monthly", renews_at: null },
    { product_key: "deduxis.monitor.monthly", renews_at: null },
    { product_key: "deduxis.receipts.business.monthly", renews_at: "2027-02-01T00:00:00.000Z" },
  ]);
  assert.equal(seat?.product_key, "deduxis.receipts.business.monthly");
});

test("new accounts are not created by a magic link or a password form", () => {
  const login = read("app/login/actions.ts");
  assert.match(login, /shouldCreateUser:\s*false/);
  assert.doesNotMatch(login, /signUp\s*\(/);
  const billing = [
    "app/api/checkout/route.ts",
    "app/api/redeem/route.ts",
    "app/api/stripe/webhook/route.ts",
    "app/api/billing/portal/route.ts",
    "components/plan-pay.tsx",
  ]
    .map(read)
    .join("\n");
  assert.doesNotMatch(billing, /resend|nodemailer|signUp\s*\(/i);
  assert.match(billing, /product: PRODUCT|metadata\.product|"deduxis"/);
});
