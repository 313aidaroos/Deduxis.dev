-- NOT APPLIED. This file is the record for a later apply on Supabase project
-- uxgtppwqonbznuoyebbb. Do not run it from the Recover pull request.
--
-- Free Recover scan requests from signed-in users (Apixis ID sessions land in auth.users).
-- RLS: a person can insert and read only their own rows.

CREATE TABLE IF NOT EXISTS public.recover_scan_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  organization_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  document_kinds TEXT NOT NULL,
  vendors TEXT,
  annual_spend TEXT,
  contact_email TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'requested',
  CONSTRAINT recover_scan_organization_len CHECK (char_length(organization_name) BETWEEN 2 AND 120),
  CONSTRAINT recover_scan_status_chk CHECK (status IN ('requested', 'in_review', 'closed'))
);

ALTER TABLE public.recover_scan_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own recover scans"
  ON public.recover_scan_requests
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users view own recover scans"
  ON public.recover_scan_requests
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS recover_scan_requests_user_idx
  ON public.recover_scan_requests (user_id, created_at DESC);
