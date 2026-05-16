-- ============================================
-- Run this ENTIRE block in Supabase SQL Editor
-- Then refresh the schema cache (click the refresh icon in the Table Editor)
-- ============================================

-- Step 1: Create the table (safe to re-run)
CREATE TABLE IF NOT EXISTS public.affiliate_signups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  social_handle TEXT DEFAULT '',
  follower_count TEXT DEFAULT '',
  platform TEXT DEFAULT '',
  audience_niche TEXT DEFAULT '',
  why_you TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT affiliate_signups_pkey PRIMARY KEY (id)
);

-- Step 2: Enable RLS
ALTER TABLE public.affiliate_signups ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop and recreate policies (safe to re-run)
DROP POLICY IF EXISTS "Anyone can insert affiliate signups" ON public.affiliate_signups;
CREATE POLICY "Anyone can insert affiliate signups"
  ON public.affiliate_signups
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view signups" ON public.affiliate_signups;
CREATE POLICY "Authenticated users can view signups"
  ON public.affiliate_signups
  FOR SELECT
  TO authenticated
  USING (true);

-- Step 4: Indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_signups_created_at
  ON public.affiliate_signups (created_at DESC);

-- Step 5: Unique email (prevents duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS idx_affiliate_signups_email
  ON public.affiliate_signups (email);
