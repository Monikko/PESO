-- Add soft delete columns to applicants table
-- Run this in your Supabase SQL Editor

-- Add deleted_at timestamp column (nullable)
ALTER TABLE applicants 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add deleted_by column to track who deleted the record (nullable)
ALTER TABLE applicants 
ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- Add comment to columns for documentation
COMMENT ON COLUMN applicants.deleted_at IS 'Timestamp when the applicant was soft-deleted. NULL means not deleted.';
COMMENT ON COLUMN applicants.deleted_by IS 'Email or name of the admin who deleted the applicant.';

-- Create an index on deleted_at for faster queries filtering out deleted records
CREATE INDEX IF NOT EXISTS idx_applicants_deleted_at ON applicants(deleted_at);

-- Optional: Create a view for active (non-deleted) applicants
CREATE OR REPLACE VIEW active_applicants AS
SELECT * FROM applicants
WHERE deleted_at IS NULL;

-- Optional: Create a view for archived (deleted) applicants
CREATE OR REPLACE VIEW archived_applicants AS
SELECT * FROM applicants
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;
