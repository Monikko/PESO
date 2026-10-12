# Soft Delete Implementation Guide

## What is Soft Delete?

Instead of permanently deleting applicant records from the database, soft delete marks them as "deleted" by setting a `deleted_at` timestamp. This allows:
- **Recovery**: Restore accidentally deleted records
- **Audit trail**: Track who deleted what and when
- **Data integrity**: Keep historical data for reporting

## Setup Instructions

### Step 1: Add Database Columns

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Copy and paste the contents of `supabase-migrations/add-soft-delete-columns.sql`
5. Click **Run** to execute the SQL

This will add:
- `deleted_at` column (timestamp)
- `deleted_by` column (text)
- Indexes for performance
- Views for active and archived applicants

### Step 2: Deploy the Updated Code

The code changes have already been made to:
- ✅ `src/admin/AdminDashboard.jsx` - Delete button now soft-deletes
- ✅ `src/applicants/Step11.jsx` - Duplicate detection excludes deleted applicants
- ✅ `src/applicants/ApplicantsDashboard.jsx` - Search excludes deleted applicants

Just commit and push to deploy:

```bash
git add .
git commit -m "Implement soft delete for applicants"
git push origin main
```

## How It Works

### When you delete an applicant:

1. Click the **Delete** button in Admin Dashboard
2. Confirm the deletion
3. The system sets:
   - `deleted_at` = current timestamp
   - `deleted_by` = admin email/name
4. The applicant disappears from all lists and searches
5. The data remains in the database for recovery

### All queries automatically exclude deleted records:

```javascript
// Admin Dashboard
.is('deleted_at', null)

// Duplicate Detection
.is('deleted_at', null)

// Applicant Search
.is('deleted_at', null)
```

## Future Enhancements (Optional)

### 1. Restore Functionality

Add a "Restore" button to bring back deleted applicants:

```javascript
await supabase
  .from('applicants')
  .update({
    deleted_at: null,
    deleted_by: null
  })
  .eq('id', applicantId);
```

### 2. Archive View

Show deleted applicants in a separate tab:

```javascript
const { data } = await supabase
  .from('archived_applicants')  // Using the view
  .select('*');
```

### 3. Auto-Purge Old Deleted Records

Set up a cron job to permanently delete records after 90 days:

```sql
-- Run monthly
DELETE FROM applicants
WHERE deleted_at < NOW() - INTERVAL '90 days';
```

## Testing

1. Log in as admin
2. Delete an applicant
3. Verify it disappears from the dashboard
4. Check Supabase table - record still exists with `deleted_at` set
5. Try to register the same person - duplicate detection should NOT trigger (because deleted records are excluded)

## Rollback (If Needed)

To revert to permanent deletion:

```sql
-- Remove soft delete columns
ALTER TABLE applicants DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE applicants DROP COLUMN IF EXISTS deleted_by;
DROP VIEW IF EXISTS active_applicants;
DROP VIEW IF EXISTS archived_applicants;
```

Then change the delete code back to:
```javascript
await supabase.from('applicants').delete().eq('id', applicantId);
```
