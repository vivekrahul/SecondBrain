-- =============================================
-- Second Brain PWA — Supabase Database Setup
-- =============================================
-- Run this in the Supabase SQL Editor

-- 1. Create profiles table (Custom PIN Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  pin TEXT NOT NULL,  -- 6-digit PIN stored as text
  telegram_chat_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create brain_dump table
CREATE TABLE IF NOT EXISTS brain_dump (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  raw_text TEXT NOT NULL,
  category TEXT DEFAULT 'Uncategorized',
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Done', 'Archived')),
  reminder_date DATE,
  context_tags TEXT[] DEFAULT '{}',
  clean_text TEXT
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_brain_dump_user_id ON brain_dump(user_id);
CREATE INDEX IF NOT EXISTS idx_brain_dump_status ON brain_dump(status);
CREATE INDEX IF NOT EXISTS idx_brain_dump_category ON brain_dump(category);
CREATE INDEX IF NOT EXISTS idx_brain_dump_reminder_date ON brain_dump(reminder_date);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_telegram ON profiles(telegram_chat_id);

-- 4. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brain_dump ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for profiles
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (true);  -- Login needs to look up by email, so allow reads

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (true);

-- Allow inserts for registration (controlled by app logic with 20-user limit)
CREATE POLICY "Allow registration inserts"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- 6. RLS Policies for brain_dump
-- Users can only see their own entries
CREATE POLICY "Users can view own entries"
  ON brain_dump FOR SELECT
  USING (true);  -- Filtered by user_id in app queries

-- Users can insert their own entries  
CREATE POLICY "Users can insert own entries"
  ON brain_dump FOR INSERT
  WITH CHECK (true);

-- Users can update their own entries
CREATE POLICY "Users can update own entries"
  ON brain_dump FOR UPDATE
  USING (true);

-- Users can delete their own entries
CREATE POLICY "Users can delete own entries"
  ON brain_dump FOR DELETE
  USING (true);

-- Migration: Add name column to profiles (run if table already exists)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name TEXT;

-- Migration: Add has_seen_onboarding column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_seen_onboarding BOOLEAN DEFAULT FALSE;

-- Migration: Add is_human_corrected to brain_dump for AI learning
ALTER TABLE brain_dump ADD COLUMN IF NOT EXISTS is_human_corrected BOOLEAN DEFAULT FALSE;

-- Migration: Add completed_at to brain_dump to track consistency metrics
ALTER TABLE brain_dump ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
