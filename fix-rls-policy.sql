-- Fix Row Level Security Policy for Anonymous Inserts
-- Run this in your Supabase SQL Editor

-- Drop the existing policy
DROP POLICY IF EXISTS "Allow anonymous inserts" ON applicants;

-- Create a new policy that allows all inserts from anon role
CREATE POLICY "Allow anonymous inserts" ON applicants
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Also create a policy for authenticated inserts
CREATE POLICY "Allow authenticated inserts" ON applicants
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Verify RLS is enabled
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
