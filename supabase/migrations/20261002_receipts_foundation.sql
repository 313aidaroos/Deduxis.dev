-- Applied live 2026-10-02 (Claude) on Supabase uxgtppwqonbznuoyebbb: the project had no tables or bucket,
-- so receipt upload/list/export could not work. Same tables as ../schema.sql plus the private storage bucket.
-- RLS: owner only (auth.uid() = user_id); files live under "<uid>/..." and only that user can read/write/delete them.
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  merchant TEXT NOT NULL,
  receipt_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2),
  payment_method TEXT,
  category TEXT NOT NULL,
  notes TEXT,
  image_path TEXT NOT NULL,
  extracted_data JSONB NOT NULL,
  CONSTRAINT receipts_user_id_idx CHECK (length(merchant) > 0)
);
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own receipts" ON public.receipts FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert own receipts" ON public.receipts FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own receipts" ON public.receipts FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own receipts" ON public.receipts FOR DELETE USING ((select auth.uid()) = user_id);
CREATE INDEX IF NOT EXISTS receipts_user_id_date_idx ON public.receipts(user_id, receipt_date DESC);

CREATE TABLE IF NOT EXISTS public.category_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, merchant)
);
ALTER TABLE public.category_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own category overrides" ON public.category_overrides FOR ALL
  USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('receipts', 'receipts', false, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/heic','image/gif'])
ON CONFLICT (id) DO NOTHING;
CREATE POLICY "receipts own read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = (select auth.uid())::text);
CREATE POLICY "receipts own insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'receipts' AND (storage.foldername(name))[1] = (select auth.uid())::text);
CREATE POLICY "receipts own delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = (select auth.uid())::text);
