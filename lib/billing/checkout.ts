import { PRODUCT, type Plan } from "../catalog.ts";

const LETTERS = "abcdefghijklmnopqrstuvwxyz";

/** Eight-letter suffix required on the Checkout integration label. */
export function integrationSuffix(bytes: Uint8Array): string {
  if (bytes.length < 8) throw new Error("Need 8 random bytes.");
  let suffix = "";
  for (let i = 0; i < 8; i += 1) suffix += LETTERS[bytes[i]! % 26];
  return suffix;
}

export function integrationIdentifier(suffix: string): string {
  if (!/^[a-z]{8}$/.test(suffix)) throw new Error("Integration suffix must be 8 letters.");
  return `deduxis_checkout_${suffix}`;
}

export function newIntegrationIdentifier(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return integrationIdentifier(integrationSuffix(bytes));
}

/**
 * Arguments for a subscription Checkout Session.
 * One Price per plan. No payment_method_types (Stripe chooses). No tax flag
 * (tax stays off until the owner has a registration). Metadata marks the
 * charge as Deduxis on the shared Apixis Dev LLC account.
 */
export function checkoutSessionParams(input: {
  priceId: string;
  userId: string;
  email: string;
  plan: Plan;
  origin: string;
  integrationIdentifier: string;
}) {
  const origin = input.origin.replace(/\/$/, "");
  const metadata = {
    product: PRODUCT,
    plan: input.plan.id,
    user_id: input.userId,
  };
  return {
    mode: "subscription" as const,
    line_items: [{ price: input.priceId, quantity: 1 }],
    success_url: `${origin}/account/purchases?checkout=return`,
    cancel_url: `${origin}/pricing`,
    client_reference_id: input.userId,
    customer_email: input.email,
    metadata,
    subscription_data: { metadata },
    integration_identifier: input.integrationIdentifier,
  };
}
