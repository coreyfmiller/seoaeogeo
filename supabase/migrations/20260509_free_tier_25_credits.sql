-- Migration: Update new user signup credits from 20 to 25
-- Reason: Free tier gives 5 AI Visibility checks (5 credits each = 25 total)
-- Date: 2026-05-09

-- Recreate the handle_new_user function with 25 credits instead of 20
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ref_code TEXT;
  ref_by UUID;
BEGIN
  -- Generate unique referral code
  ref_code := substr(md5(NEW.id::text || now()::text), 1, 8);

  -- Check if user was referred
  ref_by := NULL;
  IF NEW.raw_user_meta_data->>'referred_by' IS NOT NULL THEN
    SELECT id INTO ref_by FROM public.profiles
    WHERE referral_code = NEW.raw_user_meta_data->>'referred_by'
    LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, referral_code, referred_by, credits, chat_messages_remaining)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    ref_code,
    ref_by,
    25,
    100
  );

  -- Create pending referral record if referred
  IF ref_by IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_id, referred_id, status)
    VALUES (ref_by, NEW.id, 'pending');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
