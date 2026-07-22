-- ============================================
-- PESO Palayan Admin RLS Setup Script
-- ============================================
-- This script sets up proper Row Level Security policies
-- for authenticated admin access
-- 
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- Step 1: Drop old anonymous update policy (if exists)
DROP POLICY IF EXISTS "Allow anonymous users to update" ON applicants;

-- Step 2: Ensure anonymous users can INSERT (register as applicants)
-- This allows the registration form to work without login
CREATE POLICY IF NOT EXISTS "Allow anonymous inserts" 
ON applicants 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Step 3: Allow authenticated users to SELECT all applicants
-- This lets admin view all applicants in the dashboard
CREATE POLICY IF NOT EXISTS "Allow authenticated users to view all" 
ON applicants 
FOR SELECT 
TO authenticated 
USING (true);

-- Step 4: Allow authenticated users to UPDATE approval status
-- This is the key policy for admin to approve/unapprove applicants
CREATE POLICY IF NOT EXISTS "Allow authenticated users to update approval status" 
ON applicants 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Step 5: Optional - Allow authenticated users to DELETE
-- Uncomment if you want admin to be able to delete applicants
-- CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete" 
-- ON applicants 
-- FOR DELETE 
-- TO authenticated 
-- USING (true);

-- ============================================
-- Verification Query
-- ============================================
-- Run this to check all policies are created:
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'applicants'
ORDER BY policyname;

-- ============================================
-- Expected Result:
-- ============================================
-- You should see:
-- 1. "Allow anonymous inserts" - INSERT - {anon}
-- 2. "Allow authenticated users to view all" - SELECT - {authenticated}
-- 3. "Allow authenticated users to update approval status" - UPDATE - {authenticated}
-- ============================================
