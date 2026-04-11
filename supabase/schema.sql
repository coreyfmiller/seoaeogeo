
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

-- 7. Persistent scan jobs (for navigation-away recovery)
-- One row per user per scan_type, overwritten each scan. Auto-cleaned after 24h.
CREATE TABLE public.scan_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('pro', 'deep', 'competitive')),
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  progress INTEGER NOT NULL DEFAULT 0,
  phase TEXT,
  result JSONB,
  credits_charged INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, scan_type)
);

ALTER TABLE public.scan_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scan jobs"
  ON public.scan_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to scan_jobs"
  ON public.scan_jobs FOR ALL
  USING (true)
  WITH CHECK (true);

-- 8. Chat usage tracking for Duelly AI rate limiting
-- One row per user per day, upserted on each chat message.
-- Rate limit: 50 messages per user per calendar day (UTC).
CREATE TABLE public.chat_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

ALTER TABLE public.chat_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat usage"
  ON public.chat_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to chat_usage"
  ON public.chat_usage FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER chat_usage_updated_at
  BEFORE UPDATE ON public.chat_usage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
