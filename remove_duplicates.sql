-- Script to remove duplicate applicants from the database
-- This script keeps the FIRST (oldest) submission of each duplicate
-- and deletes the newer duplicates based on:
-- - Same surname (last name)
-- - Same first_name
-- - Same middle_name
-- - Same date_of_birth

-- Step 1: Find duplicates (for review before deletion)
-- Run this first to see what will be deleted
SELECT 
  surname,
  first_name,
  middle_name,
  date_of_birth,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ' ORDER BY created_at) as all_ids,
  STRING_AGG(created_at::text, ', ' ORDER BY created_at) as all_dates
FROM applicants
WHERE surname IS NOT NULL 
  AND first_name IS NOT NULL
GROUP BY surname, first_name, middle_name, date_of_birth
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, surname;

-- Step 2: Delete duplicates (keeping the oldest record)
-- WARNING: This will permanently delete duplicate records!
-- Make sure to backup your database before running this!
DELETE FROM applicants
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY surname, first_name, middle_name, date_of_birth 
        ORDER BY created_at ASC
      ) AS row_num
    FROM applicants
    WHERE surname IS NOT NULL 
      AND first_name IS NOT NULL
  ) ranked
  WHERE row_num > 1
);

-- Step 3: Verify the cleanup
-- Run this after deletion to confirm no more duplicates
SELECT 
  surname,
  first_name,
  middle_name,
  date_of_birth,
  COUNT(*) as count
FROM applicants
WHERE surname IS NOT NULL 
  AND first_name IS NOT NULL
GROUP BY surname, first_name, middle_name, date_of_birth
HAVING COUNT(*) > 1;

-- If the above query returns 0 rows, all duplicates have been removed successfully!
