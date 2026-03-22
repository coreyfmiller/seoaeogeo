-- Migration: Add free_scan_used and is_admin columns to profiles
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Add free_scan_used column (one-time free Pro scan tracking)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS free_scan_used BOOLEAN NOT NULL DEFAULT false;

-- Add is_admin column if it doesn't exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Update RLS policy to allow users to read free_scan_used
-- (existing "Users can read own profile" policy already covers SELECT *)
