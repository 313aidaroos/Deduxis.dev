import type { SupabaseClient } from "@supabase/supabase-js";
import { LedgerNotReady, type LedgerInsert, type PurchaseStore, type StripeLinks } from "./purchases.ts";
import type { SubscriptionPatch } from "./stripe-events.ts";
import { PRODUCT } from "../catalog.ts";

type DbError = { code?: string; message?: string } | null;

export function isMissingTable(error: DbError, table: string): boolean {
  if (!error) return false;
  if (error.code === "42P01") return true;
  return new RegExp(table, "i").test(error.message ?? "") && /does not exist|schema cache/i.test(error.message ?? "");
}

function linksFrom(row: Record<string, unknown>): StripeLinks {
  const text = (key: string) => (typeof row[key] === "string" ? (row[key] as string) : null);
  return {
    stripe_checkout_session_id: text("stripe_checkout_session_id"),
    stripe_invoice_id: text("stripe_invoice_id"),
    stripe_subscription_id: text("stripe_subscription_id"),
    stripe_payment_intent_id: text("stripe_payment_intent_id"),
    stripe_charge_id: text("stripe_charge_id"),
    stripe_customer_id: text("stripe_customer_id"),
    wallet_receipt_id: text("wallet_receipt_id"),
    wallet_reservation_id: text("wallet_reservation_id"),
  };
}

export function supabasePurchaseStore(db: SupabaseClient): PurchaseStore {
  return {
    async insertLedger(row: LedgerInsert) {
      const { data, error } = await db.from("purchase_ledger").insert(row).select("id").single();
      if (isMissingTable(error, "purchase_ledger")) throw new LedgerNotReady();
      if (error?.code === "23505") return { conflict: true };
      if (error || !data?.id) {
        console.error("ledger insert failed", error?.code ?? "unknown");
        throw new Error("Could not record the purchase.");
      }
      return { id: data.id as string };
    },
    async findLedger(idempotencyKey) {
      const { data, error } = await db
        .from("purchase_ledger")
        .select(
          "id, stripe_checkout_session_id, stripe_invoice_id, stripe_subscription_id, stripe_payment_intent_id, stripe_charge_id, stripe_customer_id, wallet_receipt_id, wallet_reservation_id",
        )
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();
      if (isMissingTable(error, "purchase_ledger")) throw new LedgerNotReady();
      if (error || !data?.id) return null;
      return { id: data.id as string, ...linksFrom(data as Record<string, unknown>) };
    },
    async insertReceipt(row) {
      const { error } = await db.from("purchase_receipts").insert(row);
      if (!error || error.code === "23505") return;
      if (isMissingTable(error, "purchase_receipts")) throw new LedgerNotReady();
      console.error("receipt insert failed", error.code ?? "unknown");
      throw new Error("Could not write the receipt.");
    },
    async fillLinks(id, links) {
      const { data, error } = await db
        .from("purchase_ledger")
        .select(
          "stripe_checkout_session_id, stripe_invoice_id, stripe_subscription_id, stripe_payment_intent_id, stripe_charge_id, stripe_customer_id, wallet_receipt_id, wallet_reservation_id",
        )
        .eq("id", id)
        .maybeSingle();
      if (error || !data) return;
      const current = linksFrom(data as Record<string, unknown>);
      const patch: Partial<StripeLinks> = {};
      for (const key of Object.keys(links) as (keyof StripeLinks)[]) {
        if (!current[key] && links[key]) patch[key] = links[key];
      }
      if (Object.keys(patch).length === 0) return;
      await db.from("purchase_ledger").update(patch).eq("id", id);
    },
    async deleteLedger(id) {
      await db.from("purchase_ledger").delete().eq("id", id);
    },
    async setWalletReceipt(id, walletReceiptId) {
      await db.from("purchase_ledger").update({ wallet_receipt_id: walletReceiptId }).eq("id", id);
    },
  };
}

export async function ledgerReady(db: SupabaseClient): Promise<boolean> {
  const { error } = await db.from("purchase_ledger").select("id").limit(1);
  if (!error) return true;
  if (isMissingTable(error, "purchase_ledger")) return false;
  console.error("ledger check failed", error.code ?? "unknown");
  return false;
}

export async function upsertCardSubscription(db: SupabaseClient, patch: SubscriptionPatch): Promise<void> {
  if (!patch.userId || !patch.planKey) {
    if (!patch.subscriptionId) return;
    const { error } = await db
      .from("billing_subscriptions")
      .update({
        status: patch.status,
        current_period_end: patch.periodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", patch.subscriptionId);
    if (error && !isMissingTable(error, "billing_subscriptions")) {
      console.error("subscription status update failed", error.code ?? "unknown");
    }
    return;
  }
  const { error } = await db.from("billing_subscriptions").upsert(
    {
      user_id: patch.userId,
      plan_key: patch.planKey,
      product: PRODUCT,
      stripe_subscription_id: patch.subscriptionId,
      stripe_customer_id: patch.customerId,
      status: patch.status,
      current_period_end: patch.periodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );
  if (error && !isMissingTable(error, "billing_subscriptions")) {
    console.error("subscription upsert failed", error.code ?? "unknown");
  }
}

export async function markLedgerStatus(
  db: SupabaseClient,
  ids: string[],
  status: "refunded" | "disputed" | "review",
): Promise<void> {
  const clean = ids.filter((id) => /^(ch|pi|py|dp)_[A-Za-z0-9]+$/.test(id));
  if (clean.length === 0) return;
  const filter = clean
    .flatMap((id) => [`stripe_charge_id.eq.${id}`, `stripe_payment_intent_id.eq.${id}`])
    .join(",");
  const { error } = await db.from("purchase_ledger").update({ status }).or(filter);
  if (error && !isMissingTable(error, "purchase_ledger")) {
    console.error("ledger status update failed", error.code ?? "unknown");
  }
}
