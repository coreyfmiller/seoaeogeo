-- Promo codes system
-- Run this in Supabase SQL Editor

-- Promo codes table
CREATE TABLE public.promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  credits INTEGER NOT NULL DEFAULT 0,
  credits_pro_audits INTEGER NOT NULL DEFAULT 0,  -- deprecated, use credits
  credits_deep_scans INTEGER NOT NULL DEFAULT 0,  -- deprecated, use credits
  credits_competitive_intel INTEGER NOT NULL DEFAULT 0,  -- deprecated, use credits
  max_uses INTEGER NOT NULL DEFAULT 1,
  times_used INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migration: add credits column to existing table
-- ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 0;

-- Track who redeemed what (one redemption per user per code)
CREATE TABLE public.promo_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id UUID REFERENCES public.promo_codes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(code_id, user_id)
);

-- Track whether admin has copied the code (hides from admin list, code still works for users)
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS copied_by_admin BOOLEAN NOT NULL DEFAULT false;

-- RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;

-- Admin can read all promo codes
CREATE POLICY "Admins can manage promo codes"
  ON public.promo_codes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Users can read promo codes (needed for redemption validation)
CREATE POLICY "Users can read promo codes"
  ON public.promo_codes FOR SELECT
  USING (true);

-- Users can read their own redemptions
CREATE POLICY "Users can read own redemptions"
  ON public.promo_redemptions FOR SELECT
  USING (auth.uid() = user_id);
