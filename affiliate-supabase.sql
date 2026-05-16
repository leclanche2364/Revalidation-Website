-- Supabase SQL: Run this in your Supabase SQL Editor
-- Creates the affiliate signup table + RLS for the public website form

-- 1. Create the signups table
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

-- Enable RLS
ALTER TABLE public.affiliate_signups ENABLE ROW LEVEL SECURITY;

-- 2. RLS: anyone can insert (the website form)
CREATE POLICY "Anyone can insert affiliate signups"
  ON public.affiliate_signups
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 3. RLS: only authenticated users (you, in Supabase dashboard) can view
CREATE POLICY "Authenticated users can view signups"
  ON public.affiliate_signups
  FOR SELECT
  TO authenticated
  USING (true);

-- 4. Optional: index for sorting by newest
CREATE INDEX IF NOT EXISTS idx_affiliate_signups_created_at
  ON public.affiliate_signups (created_at DESC);

-- 5. Optional: prevent duplicate email signups
CREATE UNIQUE INDEX IF NOT EXISTS idx_affiliate_signups_email
  ON public.affiliate_signups (email);
