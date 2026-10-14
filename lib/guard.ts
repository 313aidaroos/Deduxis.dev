// Change note (Claude, Sep 2026): New. `guard({seat, route, max})`: sign-in, seat check (returns the seat for the receipt cap) and rate limit in one call. See docs/LAUNCH_NOTES.md.
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { entitlements } from "@/lib/apixis-wallet";
import { isOwner } from "@/lib/owners";
import { activeCardReceiptSeat, bestReceiptSeat, type SeatRef } from "@/lib/billing/seat";

export const SEAT_PRODUCT = "deduxis.receipts.monthly";

type Guarded =
  | { ok: true; user: User; seat: SeatRef | null; owner: boolean }
  | { ok: false; response: NextResponse };

// Per-instance limiter for AI calls (serverless instances don't share memory: a speed bump,
// not a quota).
const buckets = new Map<string, number[]>();
function limited(key: string, max: number, windowMs: number, now = Date.now()) {
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 5000) buckets.clear();
  return recent.length > max;
}

/** Signed-in user, optionally with an active Receipt Intelligence seat, within the rate limit. */
export async function guard(opts: {
  seat?: boolean;
  route: string;
  max: number;
  windowMs?: number;
}): Promise<Guarded> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            "Sign-in is temporarily unavailable. Please try again shortly.",
        },
        { status: 503 },
      ),
    };
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Sign in to continue." },
        { status: 401 },
      ),
    };
  }
  // Owner bypass (lib/owners.ts): proven owner session skips the seat check (and, in the
  // callers, the receipt cap). No entitlement is written and the Wallet is not charged.
  let owner = false;
  if (opts.seat) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    owner = isOwner(user, session?.access_token);
  }
  let seat: SeatRef | null = null;
  if (opts.seat && !owner) {
    let card: SeatRef | null = null;
    try {
      card = await activeCardReceiptSeat(supabase, user.id);
    } catch {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "We could not check your plan. Please try again shortly." },
          { status: 503 },
        ),
      };
    }
    let wallet: SeatRef | null = null;
    try {
      const owned = await entitlements(user.email, "deduxis");
      wallet = bestReceiptSeat(
        owned
          .filter((entry) => entry.status === "active")
          .map((entry) => ({
            product_key: entry.product_key,
            renews_at: entry.renews_at,
          })),
      );
    } catch {
      if (!card) {
        return {
          ok: false,
          response: NextResponse.json(
            { error: "We could not check your plan. Please try again shortly." },
            { status: 503 },
          ),
        };
      }
    }
    seat = bestReceiptSeat([card, wallet]);
    if (!seat) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "No active seat. Redeem a seat at /pricing." },
          { status: 403 },
        ),
      };
    }
  }
  if (
    limited(
      `${opts.route}:${user.id}`,
      opts.max,
      opts.windowMs ?? 60 * 60 * 1000,
    )
  ) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Too many requests. Please wait a bit." },
        { status: 429 },
      ),
    };
  }
  return { ok: true, user, seat, owner };
}
