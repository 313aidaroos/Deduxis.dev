import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";

/** Service role, server only. Used so a purchase can be written without a browser session (Stripe webhooks). */
export function createServiceSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function stripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-09-30.endive" });
}

export function appOrigin(fallback: string): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  return (configured || fallback).replace(/\/$/, "");
}
