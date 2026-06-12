-- Migration: Add total_ai_visibility counter to profiles
-- Reason: AI Visibility is now free but limited to 10 checks per account
-- Date: 2026-06-12

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_ai_visibility integer DEFAULT 0;
