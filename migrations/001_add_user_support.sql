-- Migration: Add user support to existing tables
-- Supabase Auth provides auth.users table automatically

-- Add user_id to voicings table
ALTER TABLE voicings
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add user_id to paragraph_hearts table
ALTER TABLE paragraph_hearts
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add user_id to pattern_explorations table
ALTER TABLE pattern_explorations
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create index for faster user queries
CREATE INDEX idx_voicings_user_id ON voicings(user_id);
CREATE INDEX idx_paragraph_hearts_user_id ON paragraph_hearts(user_id);
CREATE INDEX idx_pattern_explorations_user_id ON pattern_explorations(user_id);

-- Create index for pattern history queries
CREATE INDEX idx_voicings_pattern_name ON voicings(pattern_name);
CREATE INDEX idx_voicings_created_at ON voicings(created_at DESC);

-- Enable Row Level Security (RLS) on tables
ALTER TABLE voicings ENABLE ROW LEVEL SECURITY;
ALTER TABLE paragraph_hearts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_explorations ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Voicings are viewable by everyone"
ON voicings FOR SELECT
USING (true);

CREATE POLICY "Hearts are viewable by everyone"
ON paragraph_hearts FOR SELECT
USING (true);

CREATE POLICY "Explorations are viewable by everyone"
ON pattern_explorations FOR SELECT
USING (true);

-- Create policies for authenticated users to insert their own data
CREATE POLICY "Users can insert their own voicings"
ON voicings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hearts"
ON paragraph_hearts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own explorations"
ON pattern_explorations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create user_profiles table for additional user data
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
ON user_profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id);
