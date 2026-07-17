-- Temporarily disable Row Level Security for testing
-- Run this in your Supabase SQL Editor

-- Disable RLS on the applicants table
ALTER TABLE applicants DISABLE ROW LEVEL SECURITY;

-- This will allow all inserts without policy checks
-- You can re-enable it later with: ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
