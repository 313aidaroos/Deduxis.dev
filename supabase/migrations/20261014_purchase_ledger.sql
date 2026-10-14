-- NOT APPLIED. Record for a later apply on Supabase project
-- uxgtppwqonbznuoyebbb. Do not run this from the pull request.
--
-- Card and Ixis purchases: one ledger row and one receipt per charge.
-- Service role writes. A signed-in person can read only their own rows.

CREATE TABLE IF NOT EXISTS public.purchase_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  channel TEXT NOT NULL,
  kind TEXT NOT NULL,
  plan_key TEXT NOT NULL,
  product TEXT NOT NULL DEFAULT 'deduxis',
  amount_usd_cents INTEGER,
  ixis_amount INTEGER,
  status TEXT NOT NULL DEFAULT 'paid',
  idempotency_key TEXT NOT NULL UNIQUE,
  stripe_checkout_session_id TEXT,
  stripe_invoice_id TEXT,
  stripe_subscription_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  stripe_customer_id TEXT,
  wallet_receipt_id TEXT,
  wallet_reservation_id TEXT,
  description TEXT NOT NULL,
  CONSTRAINT purchase_ledger_channel_chk CHECK (channel IN ('card', 'ixis')),
  CONSTRAINT purchase_ledger_kind_chk CHECK (kind IN ('subscription', 'renewal', 'success_fee')),
  CONSTRAINT purchase_ledger_product_chk CHECK (product = 'deduxis'),
  CONSTRAINT purchase_ledger_status_chk CHECK (status IN ('paid', 'refunded', 'disputed', 'review')),
  CONSTRAINT purchase_ledger_usd_chk CHECK (amount_usd_cents IS NULL OR amount_usd_cents >= 0),
  CONSTRAINT purchase_ledger_ixis_chk CHECK (ixis_amount IS NULL OR ixis_amount >= 0)
);

CREATE TABLE IF NOT EXISTS public.purchase_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ledger_id UUID NOT NULL UNIQUE REFERENCES public.purchase_ledger(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  receipt_number TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_key TEXT NOT NULL,
  product TEXT NOT NULL DEFAULT 'deduxis',
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL,
  current_period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT billing_subscriptions_product_chk CHECK (product = 'deduxis'),
  CONSTRAINT billing_subscriptions_status_chk CHECK (
    status IN (
      'active',
      'trialing',
      'past_due',
      'canceled',
      'unpaid',
      'incomplete',
      'incomplete_expired',
      'paused'
    )
  )
);

ALTER TABLE public.purchase_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own purchase ledger"
  ON public.purchase_ledger
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users view own purchase receipts"
  ON public.purchase_receipts
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users view own billing subscriptions"
  ON public.billing_subscriptions
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS purchase_ledger_user_idx
  ON public.purchase_ledger (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS purchase_receipts_user_idx
  ON public.purchase_receipts (user_id, created_at DESC);
