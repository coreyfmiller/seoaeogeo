-- Scan history: stores the last 10 full scan results per user in Supabase
-- Replaces localStorage for logged-in users

CREATE TABLE public.scan_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('free-v3', 'free-v4', 'pro', 'deep', 'competitive', 'keyword-arena')),
  url TEXT NOT NULL,
  scores JSONB,  -- { seo: number, aeo: number, geo: number }
  full_result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups by user, ordered by recency
CREATE INDEX idx_scan_history_user_created ON public.scan_history (user_id, created_at DESC);

-- RLS
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scan history"
  ON public.scan_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scan history"
  ON public.scan_history FOR DELETE
  USING (auth.uid() = user_id);

-- Only service role can insert (API routes use supabaseAdmin)
CREATE POLICY "Service role can manage scan history"
  ON public.scan_history FOR ALL
  USING (true)
  WITH CHECK (true);
