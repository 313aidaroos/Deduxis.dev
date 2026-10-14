import { PRODUCT, planById, type Plan } from "../catalog.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type PurchaseKind = "subscription" | "renewal" | "success_fee";

export type PurchaseDraft = {
  userId: string;
  channel: "card" | "ixis";
  kind: PurchaseKind;
  planKey: string;
  product: typeof PRODUCT;
  amountUsdCents: number | null;
  ixisAmount: number | null;
  idempotencyKey: string;
  description: string;
  stripeCheckoutSessionId: string | null;
  stripeInvoiceId: string | null;
  stripeSubscriptionId: string | null;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  stripeCustomerId: string | null;
  walletReceiptId: string | null;
  walletReservationId: string | null;
};

export type SubscriptionPatch = {
  userId: string | null;
  planKey: string | null;
  subscriptionId: string;
  customerId: string | null;
  status: string;
  periodEnd: string | null;
};

const SUBSCRIPTION_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
  "canceled",
  "unpaid",
  "incomplete",
  "incomplete_expired",
  "paused",
]);

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function stringOf(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function idOf(value: unknown): string | null {
  const direct = stringOf(value);
  if (direct) return direct;
  return stringOf(asRecord(value)?.id);
}

function metaOf(value: unknown): Record<string, string> | null {
  const record = asRecord(value);
  if (!record) return null;
  const out: Record<string, string> = {};
  for (const [key, entry] of Object.entries(record)) {
    if (typeof entry === "string") out[key] = entry;
  }
  return out;
}

function metasOf(...values: unknown[]): Record<string, string>[] {
  return values.map(metaOf).filter((meta): meta is Record<string, string> => meta !== null);
}

function productTag(metas: Record<string, string>[]): string | null {
  for (const meta of metas) {
    if (meta.product) return meta.product;
  }
  return null;
}

function userIdOf(metas: Record<string, string>[], fallback?: unknown): string | null {
  for (const meta of metas) {
    if (meta.user_id && UUID.test(meta.user_id)) return meta.user_id;
  }
  const extra = stringOf(fallback);
  return extra && UUID.test(extra) ? extra : null;
}

function planFromMeta(metas: Record<string, string>[]): Plan | undefined {
  for (const meta of metas) {
    const plan = planById(meta.plan);
    if (plan) return plan;
  }
  return undefined;
}

function priceIdsFromInvoice(invoice: Record<string, unknown>): string[] {
  const lines = asRecord(invoice.lines);
  const data = Array.isArray(lines?.data) ? lines.data : [];
  const ids: string[] = [];
  for (const line of data) {
    const record = asRecord(line);
    if (!record) continue;
    const pricing = asRecord(record.pricing);
    const priceDetails = asRecord(pricing?.price_details);
    const id =
      idOf(priceDetails?.price) ??
      idOf(record.price) ??
      idOf(pricing?.price);
    if (id) ids.push(id);
  }
  return ids;
}

function paymentIds(invoice: Record<string, unknown>): { paymentIntentId: string | null; chargeId: string | null } {
  const payments = asRecord(invoice.payments);
  const data = Array.isArray(payments?.data) ? payments.data : [];
  let paymentIntentId = idOf(invoice.payment_intent);
  let chargeId = idOf(invoice.charge);
  for (const entry of data) {
    const payment = asRecord(asRecord(entry)?.payment);
    paymentIntentId = paymentIntentId ?? idOf(payment?.payment_intent);
    chargeId = chargeId ?? idOf(payment?.charge);
  }
  return { paymentIntentId, chargeId };
}

function belongsToDeduxis(tag: string | null, matchedPlan: Plan | undefined): boolean {
  if (tag && tag !== PRODUCT) return false;
  if (tag === PRODUCT) return true;
  return Boolean(matchedPlan);
}

function moneyDescription(plan: Plan, cents: number, kind: PurchaseKind): string {
  const dollars = (cents / 100).toFixed(2);
  const when = kind === "renewal" ? "Monthly renewal" : "Monthly plan";
  return `Deduxis ${plan.name}. $${dollars}. ${when}. Card.`;
}

export function draftFromCheckoutSession(
  session: unknown,
  prices: Map<string, Plan>,
): PurchaseDraft | null {
  const record = asRecord(session);
  if (!record) return null;
  if (record.mode && record.mode !== "subscription") return null;
  if (record.payment_status !== "paid") return null;

  const metas = metasOf(record.metadata);
  const tag = productTag(metas);
  if (tag && tag !== PRODUCT) return null;

  const linePrice = priceIdsFromInvoice(record)[0];
  const plan = planFromMeta(metas) ?? (linePrice ? prices.get(linePrice) : undefined);
  if (!plan?.subscription) return null;
  if (!belongsToDeduxis(tag, planFromMeta(metas) ?? (linePrice ? prices.get(linePrice) : undefined))) {
    return null;
  }

  const userId = userIdOf(metas, record.client_reference_id);
  const amount = typeof record.amount_total === "number" ? record.amount_total : plan.usdCents;
  if (!userId || amount == null || amount <= 0) return null;

  const invoiceId = idOf(record.invoice);
  const sessionId = stringOf(record.id);
  if (!sessionId) return null;

  return {
    userId,
    channel: "card",
    kind: "subscription",
    planKey: plan.id,
    product: PRODUCT,
    amountUsdCents: amount,
    ixisAmount: null,
    idempotencyKey: invoiceId ? `stripe:invoice:${invoiceId}` : `stripe:session:${sessionId}`,
    description: moneyDescription(plan, amount, "subscription"),
    stripeCheckoutSessionId: sessionId,
    stripeInvoiceId: invoiceId,
    stripeSubscriptionId: idOf(record.subscription),
    stripePaymentIntentId: idOf(record.payment_intent),
    stripeChargeId: null,
    stripeCustomerId: idOf(record.customer),
    walletReceiptId: null,
    walletReservationId: null,
  };
}

export function draftFromInvoice(invoice: unknown, prices: Map<string, Plan>): PurchaseDraft | null {
  const record = asRecord(invoice);
  if (!record) return null;
  const parent = asRecord(record.parent);
  const details = asRecord(parent?.subscription_details);
  const metas = metasOf(record.metadata, details?.metadata);
  const tag = productTag(metas);
  if (tag && tag !== PRODUCT) return null;

  const linePrices = priceIdsFromInvoice(record);
  const matched = linePrices.map((id) => prices.get(id)).find((plan): plan is Plan => Boolean(plan));
  const plan = planFromMeta(metas) ?? matched;
  if (!plan?.subscription) return null;
  if (!belongsToDeduxis(tag, matched ?? planFromMeta(metas))) return null;

  const userId = userIdOf(metas);
  const amount = typeof record.amount_paid === "number" ? record.amount_paid : null;
  const invoiceId = stringOf(record.id);
  if (!userId || amount == null || amount <= 0 || !invoiceId) return null;

  const kind: PurchaseKind = record.billing_reason === "subscription_cycle" ? "renewal" : "subscription";
  const paid = paymentIds(record);

  return {
    userId,
    channel: "card",
    kind,
    planKey: plan.id,
    product: PRODUCT,
    amountUsdCents: amount,
    ixisAmount: null,
    idempotencyKey: `stripe:invoice:${invoiceId}`,
    description: moneyDescription(plan, amount, kind),
    stripeCheckoutSessionId: null,
    stripeInvoiceId: invoiceId,
    stripeSubscriptionId: idOf(details?.subscription),
    stripePaymentIntentId: paid.paymentIntentId,
    stripeChargeId: paid.chargeId,
    stripeCustomerId: idOf(record.customer),
    walletReceiptId: null,
    walletReservationId: null,
  };
}

function periodEndIso(subscription: Record<string, unknown>): string | null {
  const items = asRecord(subscription.items);
  const first = Array.isArray(items?.data) ? asRecord(items.data[0]) : null;
  const unix =
    typeof subscription.current_period_end === "number"
      ? subscription.current_period_end
      : typeof first?.current_period_end === "number"
        ? first.current_period_end
        : null;
  if (!unix) return null;
  const date = new Date(unix * 1000);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Subscription id for a Deduxis invoice, including one that was not paid. */
export function deduxisInvoiceSubscriptionId(invoice: unknown, prices: Map<string, Plan>): string | null {
  const record = asRecord(invoice);
  if (!record) return null;
  const parent = asRecord(record.parent);
  const details = asRecord(parent?.subscription_details);
  const metas = metasOf(record.metadata, details?.metadata);
  const tag = productTag(metas);
  if (tag && tag !== PRODUCT) return null;
  const linePrices = priceIdsFromInvoice(record);
  const matched = linePrices.map((id) => prices.get(id)).find((plan): plan is Plan => Boolean(plan));
  const plan = planFromMeta(metas) ?? matched;
  if (!belongsToDeduxis(tag, matched ?? plan)) return null;
  if (!plan?.subscription && tag !== PRODUCT) return null;
  return idOf(details?.subscription);
}

export function subscriptionFromEvent(
  subscription: unknown,
  prices: Map<string, Plan>,
): SubscriptionPatch | null {
  const record = asRecord(subscription);
  if (!record) return null;
  const subscriptionId = stringOf(record.id);
  const status = stringOf(record.status);
  if (!subscriptionId || !status || !SUBSCRIPTION_STATUSES.has(status)) return null;

  const metas = metasOf(record.metadata);
  const tag = productTag(metas);
  if (tag && tag !== PRODUCT) return null;

  const items = asRecord(record.items);
  const first = Array.isArray(items?.data) ? asRecord(items.data[0]) : null;
  const priceId = idOf(asRecord(first?.price)?.id ?? first?.price);
  const matched = priceId ? prices.get(priceId) : undefined;
  const plan = planFromMeta(metas) ?? matched;
  if (!tag && !matched && !plan) return null;
  if (!belongsToDeduxis(tag, matched ?? plan)) return null;

  return {
    userId: userIdOf(metas),
    planKey: plan?.id ?? null,
    subscriptionId,
    customerId: idOf(record.customer),
    status,
    periodEnd: periodEndIso(record),
  };
}

export type ChargeMark = {
  status: "refunded" | "disputed" | "review";
  ids: string[];
};

function stripeId(value: unknown): string | null {
  const id = idOf(value);
  if (!id || !/^(ch|pi|py|dp)_[A-Za-z0-9]+$/.test(id)) return null;
  return id;
}

/** Ids on a refund, dispute, or early-fraud object, used to find the ledger row. */
export function chargeMark(type: string, object: unknown): ChargeMark | null {
  const record = asRecord(object);
  if (!record) return null;
  if (type === "charge.refunded") {
    const ids = [stripeId(record.id), stripeId(record.payment_intent)].filter((id): id is string => Boolean(id));
    return ids.length ? { status: "refunded", ids } : null;
  }
  if (type === "charge.dispute.created") {
    const ids = [stripeId(record.charge), stripeId(record.payment_intent)].filter((id): id is string => Boolean(id));
    return ids.length ? { status: "disputed", ids } : null;
  }
  if (type === "radar.early_fraud_warning.created") {
    const ids = [stripeId(record.charge), stripeId(record.payment_intent)].filter((id): id is string => Boolean(id));
    return ids.length ? { status: "review", ids } : null;
  }
  return null;
}
