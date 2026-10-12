# Duplicate Applicant Removal Guide

## ⚠️ Important: Read Before Proceeding

This guide will help you remove the 57 duplicate applicant records currently in your database. The system now prevents **new** duplicates from being created, but you need to clean up the existing ones.

---

## 🎯 Step-by-Step Instructions

### **Step 1: Backup Your Database** ⚠️

**CRITICAL: Always backup before deleting data!**

1. Go to your Supabase Dashboard
2. Navigate to **Database → Backups**
3. Click **"Create Backup"** and wait for it to complete
4. Note the backup timestamp for reference

---

### **Step 2: Open SQL Editor**

1. In your Supabase Dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"** to create a new SQL query

---

### **Step 3: Preview Duplicates (Optional but Recommended)**

Before deleting, preview what will be removed:

```sql
-- Preview: Show all duplicate applicants
SELECT 
  surname,
  first_name,
  middle_name,
  date_of_birth,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ') as all_ids
FROM applicants
WHERE surname IS NOT NULL 
  AND first_name IS NOT NULL
GROUP BY surname, first_name, middle_name, date_of_birth
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, surname;
```

**What this shows:**
- Each row represents a set of duplicates
- `duplicate_count` shows how many copies exist
- `all_ids` shows the IDs of all duplicate records

**Expected Result:** Should show 27 sets of duplicates (like FERNANDEZ with 10 records, SALADINO with 7 records, etc.)

---

### **Step 4: Delete Duplicates** 🗑️

**This will permanently delete 57 duplicate records!**

Copy and paste this query, then click **"Run"** or press **Ctrl+Enter**:

```sql
-- Delete duplicate applicants, keeping the oldest record
DELETE FROM applicants
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY 
          surname, 
          first_name, 
          COALESCE(middle_name, ''), 
          COALESCE(date_of_birth::text, '')
        ORDER BY created_at ASC, id ASC
      ) AS row_num
    FROM applicants
    WHERE surname IS NOT NULL 
      AND first_name IS NOT NULL
  ) ranked
  WHERE row_num > 1
);
```

**What this does:**
- Groups applicants by name (surname + first name + middle name + date of birth)
- Keeps the **oldest** record (earliest `created_at`)
- Deletes all newer duplicates
- Uses `id` as a tiebreaker for records with identical timestamps

**Expected Result:** Should show `DELETE 57` at the bottom of the SQL editor

---

### **Step 5: Verify Cleanup** ✅

Run this query to confirm all duplicates are gone:

```sql
-- Verify: Check for remaining duplicates
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
```

**Expected Result:** Should return **0 rows** (no duplicates found)

If it returns 0 rows: **🎉 Success! All duplicates have been removed!**

---

### **Step 6: Check Total Count**

Verify your final applicant count:

```sql
-- Check total applicants
SELECT COUNT(*) as total_applicants FROM applicants;
```

**Expected Result:** Should show **165 applicants** (222 - 57 = 165)

---

## 📊 Summary of What Was Removed

**Before Cleanup:**
- Total Records: 222
- Duplicate Sets: 27
- Records to Delete: 57

**Notable Duplicates Removed:**
- FERNANDEZ, REYLIVER: 10 records → kept 1, deleted 9
- SALADINO, JONATHAN: 7 records → kept 1, deleted 6
- SOLIMAN, ANTONETTE: 6 records → kept 1, deleted 5
- LIRIO, VISTANTE: 5 records → kept 1, deleted 4
- And 23 other sets with 2-4 duplicates each

**After Cleanup:**
- Total Records: 165
- Duplicate Sets: 0
- All applicants unique! ✅

---

## 🛡️ Prevention: System Now Active

The application now includes **automatic duplicate detection** that prevents new duplicates:

**How it works:**
1. When an encoder submits an applicant, the system checks existing records
2. Compares: Name (surname + first + middle) + Contact Number + Email
3. If a match is found, shows an alert: **"⚠️ DUPLICATE APPLICANT DETECTED"**
4. Blocks submission and asks the encoder to verify the information

**What's checked:**
- ✅ Same full name (surname, first name, middle name)
- ✅ Same contact number (ignores formatting)
- ✅ Same email address (if provided)

**When it triggers:**
- Name matches AND (Contact number matches OR Email matches)

---

## 🔧 Troubleshooting

**Q: The deletion query says "DELETE 0" instead of "DELETE 57"**
- The duplicates may have already been removed
- Run the verification query (Step 5) to check

**Q: I see fewer than 57 duplicates**
- Some may have been manually deleted already
- This is fine - the query only deletes what exists

**Q: Can I undo the deletion?**
- Only if you created a backup beforehand
- Go to Database → Backups → Restore from your backup

**Q: Will this affect approved applicants?**
- No - the deletion only removes duplicates
- The oldest record (which likely has approval status) is always kept

---

## 📝 Need Help?

If you encounter any issues or have questions:
1. Check that you created a backup first
2. Verify you're in the correct Supabase project
3. Make sure you have admin access to run SQL queries
4. Contact support if you need to restore from backup

---

**Created:** January 13, 2025  
**Last Updated:** January 13, 2025  
**Version:** 1.0
