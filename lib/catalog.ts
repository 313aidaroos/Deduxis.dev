/**
 * Locked Deduxis prices (Awad, 2026-10-06, Monitor fee updated the same night).
 * Card charges use a Stripe Price id from the environment (one Price per plan,
 * on the single Apixis Dev LLC account). Ixis charges use the Wallet product key.
 * This module does not call Stripe or the Wallet.
 */

export const PRODUCT = "deduxis" as const;

export const IXIS_PER_DOLLAR = 100;

/** Older Wallet seat. Still honored for access. Not sold. */
export const LEGACY_RECEIPTS_PRODUCT = "deduxis.receipts.monthly";

export type PlanId =
  | "receipts_personal"
  | "receipts_business"
  | "monitor"
  | "recover"
  | "enterprise";

export type Plan = {
  id: PlanId;
  name: string;
  /** Null when the plan is not a fixed monthly price. */
  usdCents: number | null;
  ixis: number | null;
  /** Wallet catalog key. Null when the plan is not bought with Ixis up front. */
  productKey: string | null;
  /** Env var holding the Stripe Price id. Null when there is no card subscription. */
  stripePriceEnv: string | null;
  /** Receipt Intelligence cap. Null means unlimited. Undefined means this plan is not a receipt seat. */
  receiptCap: number | null | undefined;
  /** Success fee in basis points, charged only when money is recovered. */
  successFeeBps: number | null;
  /** Monthly card or Ixis checkout is offered for this plan. */
  subscription: boolean;
};

export const PLANS: readonly Plan[] = [
  {
    id: "receipts_personal",
    name: "Receipts Personal",
    usdCents: 1000,
    ixis: 1000,
    productKey: "deduxis.receipts.personal.monthly",
    stripePriceEnv: "STRIPE_PRICE_RECEIPTS_PERSONAL",
    receiptCap: 100,
    successFeeBps: null,
    subscription: true,
  },
  {
    id: "receipts_business",
    name: "Receipts Business",
    usdCents: 3000,
    ixis: 3000,
    productKey: "deduxis.receipts.business.monthly",
    stripePriceEnv: "STRIPE_PRICE_RECEIPTS_BUSINESS",
    receiptCap: null,
    successFeeBps: null,
    subscription: true,
  },
  {
    id: "recover",
    name: "Recover",
    usdCents: null,
    ixis: null,
    productKey: null,
    stripePriceEnv: null,
    receiptCap: undefined,
    successFeeBps: 2500,
    subscription: false,
  },
  {
    id: "monitor",
    name: "Monitor",
    usdCents: 10000,
    ixis: 10000,
    productKey: "deduxis.monitor.monthly",
    stripePriceEnv: "STRIPE_PRICE_MONITOR",
    receiptCap: undefined,
    successFeeBps: 1500,
    subscription: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    usdCents: null,
    ixis: null,
    productKey: null,
    stripePriceEnv: null,
    receiptCap: undefined,
    successFeeBps: null,
    subscription: false,
  },
];

const BY_ID = new Map(PLANS.map((plan) => [plan.id, plan]));

export function planById(id: string | null | undefined): Plan | undefined {
  if (!id) return undefined;
  return BY_ID.get(id as PlanId);
}

export function subscriptionPlan(id: string | null | undefined): Plan | undefined {
  const plan = planById(id);
  if (!plan?.subscription || !plan.productKey || plan.usdCents == null || plan.ixis == null) {
    return undefined;
  }
  return plan;
}

export function productKeyForPlan(id: string | null | undefined): string | null {
  return planById(id)?.productKey ?? null;
}

export function isReceiptSeat(productKey: string | null | undefined): boolean {
  return (
    productKey === "deduxis.receipts.personal.monthly" ||
    productKey === "deduxis.receipts.business.monthly" ||
    productKey === LEGACY_RECEIPTS_PRODUCT
  );
}

/** Cap for a receipt seat. Null is unlimited. Unknown keys return 0 so they cannot upload. */
export function receiptCap(productKey: string | null | undefined): number | null {
  if (productKey === "deduxis.receipts.business.monthly") return null;
  if (productKey === "deduxis.receipts.personal.monthly") return 100;
  if (productKey === LEGACY_RECEIPTS_PRODUCT) return 200;
  return 0;
}

export function stripePriceId(plan: Plan, env: NodeJS.ProcessEnv = process.env): string | null {
  if (!plan.stripePriceEnv) return null;
  const value = env[plan.stripePriceEnv]?.trim();
  return value ? value : null;
}

/** Price id → plan, from the configured env vars. Empty when the owner has not set them. */
export function plansByStripePrice(env: NodeJS.ProcessEnv = process.env): Map<string, Plan> {
  const map = new Map<string, Plan>();
  for (const plan of PLANS) {
    const price = stripePriceId(plan, env);
    if (price) map.set(price, plan);
  }
  return map;
}

/**
 * Success fee on money that actually came back.
 * `recoveredCents` is a non-negative integer. The result is rounded to the nearest cent.
 */
export function successFeeCents(recoveredCents: number, planId: "recover" | "monitor"): number {
  if (!Number.isInteger(recoveredCents) || recoveredCents < 0) {
    throw new Error("Recovered amount must be a non-negative number of cents.");
  }
  const plan = planById(planId);
  const bps = plan?.successFeeBps;
  if (bps == null) throw new Error("This plan has no success fee.");
  return Math.round((recoveredCents * bps) / 10000);
}
