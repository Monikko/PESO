-- Add approved_by column to track which admin approved each applicant
-- Run this in your Supabase SQL Editor

ALTER TABLE applicants 
ADD COLUMN IF NOT EXISTS approved_by TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN applicants.approved_by IS 'Name of the admin who approved this applicant';

-- Optional: Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_applicants_approved_by ON applicants(approved_by);
