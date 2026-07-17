-- Enable authentication in Supabase
-- Note: Most of this is done through the Supabase Dashboard UI
-- This file is for reference only

-- Email authentication is enabled by default in Supabase
-- To require email confirmation, go to:
-- Dashboard → Authentication → Providers → Email → Enable "Confirm email"

-- No SQL commands needed for basic auth setup!
-- Everything is configured through the Supabase Dashboard UI

-- However, if you want to create a users profile table (optional):
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
