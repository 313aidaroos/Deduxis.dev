// Change note (Claude, Sep 2026): New. The seat's 200-receipts-per-month cap. See docs/LAUNCH_NOTES.md.
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Legacy Receipt Intelligence seat cap (deduxis.receipts.monthly).
 * Personal is 100 and Business is unlimited; see receiptCap() in lib/catalog.ts.
 */
export const RECEIPT_CAP = 200;
const PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Start of the 30-day period that contains `now`. Periods end at the seat's `renews_at` and
 * step back 30 days at a time, so a seat bought for several months still counts month by month.
 * With no renewal date, fall back to the last 30 days.
 */
export function seatPeriodStart(renewsAt: string | null, now = Date.now()): Date {
  const end = renewsAt ? Date.parse(renewsAt) : NaN;
  if (!Number.isFinite(end) || end <= now) return new Date(now - PERIOD_MS);
  const periodsAhead = Math.ceil((end - now) / PERIOD_MS);
  return new Date(end - periodsAhead * PERIOD_MS);
}

export function periodEnd(start: Date) {
  return new Date(start.getTime() + PERIOD_MS);
}

/** Receipts this user saved in the current period. */
export async function receiptsUsed(supabase: SupabaseClient, userId: string, since: Date): Promise<number> {
  const { count, error } = await supabase
    .from("receipts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since.toISOString());
  if (error) throw new Error(`Could not check receipt quota: ${error.message}`);
  return count ?? 0;
}

/** null when there is room, or when the plan is unlimited (cap === null). */
export function quotaResponse(used: number, start: Date, cap: number | null): NextResponse | null {
  if (cap === null) return null;
  if (used < cap) return null;
  const resets = periodEnd(start).toISOString().slice(0, 10);
  return NextResponse.json(
    { error: `You've used all ${cap} receipts for this month. More open on ${resets}.`, code: "receipt_cap", used, cap, resets },
    { status: 403 }
  );
}
