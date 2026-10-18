import type { SupabaseClient } from "@supabase/supabase-js";
import { isReceiptSeat, productKeyForPlan } from "../catalog.ts";
import { isMissingTable } from "./supabase-store.ts";

export type SeatRef = { product_key: string; renews_at: string | null };

const RANK: Record<string, number> = {
  "deduxis.receipts.business.monthly": 3,
  "deduxis.receipts.monthly": 2,
  "deduxis.receipts.personal.monthly": 1,
};

export function bestReceiptSeat(seats: Array<SeatRef | null | undefined>): SeatRef | null {
  const eligible = seats.filter((seat): seat is SeatRef => Boolean(seat && isReceiptSeat(seat.product_key)));
  eligible.sort((a, b) => (RANK[b.product_key] ?? 0) - (RANK[a.product_key] ?? 0));
  return eligible[0] ?? null;
}

/** Active card subscription that includes Receipt Intelligence. Missing table = no card seat. */
export async function activeCardReceiptSeat(
  supabase: SupabaseClient,
  userId: string,
): Promise<SeatRef | null> {
  const { data, error } = await supabase
    .from("billing_subscriptions")
    .select("plan_key, status, current_period_end")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"]);
  if (error) {
    if (isMissingTable(error, "billing_subscriptions")) return null;
    throw new Error("Could not check the card plan.");
  }
  const seats: SeatRef[] = [];
  for (const row of data ?? []) {
    const productKey = productKeyForPlan(row.plan_key as string);
    if (!productKey || !isReceiptSeat(productKey)) continue;
    seats.push({
      product_key: productKey,
      renews_at: (row.current_period_end as string | null) ?? null,
    });
  }
  return bestReceiptSeat(seats);
}
