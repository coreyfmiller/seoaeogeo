-- Migration: Add unified credits column + grant 20 on signup
-- Run this in Supabase SQL Editor

-- 1. Add unified credits column (new signups get 20)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 20;

-- 2. Add is_admin if missing
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- 3. Migrate existing users: sum old pools into unified credits
UPDATE public.profiles
SET credits = COALESCE(credits_pro_audits, 0) + COALESCE(credits_deep_scans, 0) + COALESCE(credits_competitive_intel, 0)
WHERE credits = 20 AND (credits_pro_audits > 0 OR credits_deep_scans > 0 OR credits_competitive_intel > 0);

-- 4. Update the signup trigger to grant 20 credits
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $
DECLARE
  ref_code TEXT;
  ref_by UUID;
BEGIN
  ref_code := upper(substr(md5(NEW.id::text || now()::text), 1, 8));

  ref_by := NULL;
  IF NEW.raw_user_meta_data->>'referred_by' IS NOT NULL THEN
    SELECT id INTO ref_by FROM public.profiles
    WHERE referral_code = upper(NEW.raw_user_meta_data->>'referred_by')
    LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, referral_code, referred_by, credits)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    ref_code,
    ref_by,
    20
  );

  IF ref_by IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_id, referred_id, status)
    VALUES (ref_by, NEW.id, 'pending');
  END IF;

  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;
