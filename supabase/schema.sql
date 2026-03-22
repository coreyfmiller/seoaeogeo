-- Vantege user profiles & plan management
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. User profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'pro_plus', 'agency')),
  credits_pro_audits INTEGER NOT NULL DEFAULT 0,
  credits_deep_scans INTEGER NOT NULL DEFAULT 0,
  credits_competitive_intel INTEGER NOT NULL DEFAULT 0,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  free_scan_used BOOLEAN NOT NULL DEFAULT false,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.profiles(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Referral tracking table
CREATE TABLE public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'credited')),
  credited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(referred_id) -- each referred user can only count once
);

-- 2. Monthly usage tracking
CREATE TABLE public.usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  period TEXT NOT NULL, -- e.g. '2026-03'
  pro_audits INTEGER NOT NULL DEFAULT 0,
  deep_scans INTEGER NOT NULL DEFAULT 0,
  competitive_intel INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, period)
);

-- 3. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies — users can only access their own data

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own usage"
  ON public.usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id);

-- 5. Auto-create profile on signup via trigger (with referral code + referred_by)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ref_code TEXT;
  ref_by UUID;
BEGIN
  -- Generate unique 8-char referral code
  ref_code := upper(substr(md5(NEW.id::text || now()::text), 1, 8));

  -- Check if signup included a referral code
  ref_by := NULL;
  IF NEW.raw_user_meta_data->>'referred_by' IS NOT NULL THEN
    SELECT id INTO ref_by FROM public.profiles
    WHERE referral_code = upper(NEW.raw_user_meta_data->>'referred_by')
    LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, referral_code, referred_by)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    ref_code,
    ref_by
  );

  -- Create pending referral record if referred
  IF ref_by IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_id, referred_id, status)
    VALUES (ref_by, NEW.id, 'pending');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER usage_updated_at
  BEFORE UPDATE ON public.usage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
