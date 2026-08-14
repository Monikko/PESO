# Admin Name Selection - Setup Guide

## 🎯 Overview

After logging in with the admin password, users will be asked to select their name from a list. This helps track **who approved each applicant**.

---

## 📋 **How It Works**

### **Login Flow:**
1. User clicks "Admin Login"
2. Password field appears (email pre-filled: `pesopalayancity002@gmail.com`)
3. User enters password: `pesopalayan002`
4. **NEW:** Name selection screen appears
5. User selects their name from dropdown OR enters custom name
6. User clicks "Continue to Dashboard"
7. Dashboard opens with their name displayed

---

## 🗄️ **Database Setup Required**

You need to add a new column to track who approved each applicant.

### **Step 1: Open Supabase SQL Editor**
1. Go to https://supabase.com/dashboard
2. Select your PESO project
3. Click "SQL Editor" in left sidebar
4. Click "New Query"

### **Step 2: Run the SQL**
Copy and paste this SQL code:

```sql
-- Add approved_by column to track which admin approved each applicant
ALTER TABLE applicants 
ADD COLUMN IF NOT EXISTS approved_by TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN applicants.approved_by IS 'Name of the admin who approved this applicant';

-- Optional: Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_applicants_approved_by ON applicants(approved_by);
```

### **Step 3: Click "Run"**
- Should see: "Success. No rows returned"
- ✅ Column added successfully!

---

## 👥 **Pre-Defined Admin Names**

The system comes with 6 pre-defined names you can customize:

1. Maria Santos
2. Juan Dela Cruz
3. Ana Reyes
4. Pedro Garcia
5. Linda Torres
6. Carlos Mendoza

### **How to Customize Names:**

Edit `src/auth/AdminNameSelection.jsx` and update this array:

```javascript
const predefinedAdmins = [
  'Your Name 1',
  'Your Name 2',
  'Your Name 3',
  'Your Name 4',
  'Your Name 5',
  'Your Name 6'
];
```

---

## 🎨 **What Users See**

### **Name Selection Screen:**
```
┌─────────────────────────────────────┐
│     PESO Palayan City               │
│     Select Your Name                │
├─────────────────────────────────────┤
│ ← Back to Login                     │
│                                     │
│ Who is using the admin dashboard?   │
│ This helps track who approved       │
│ each applicant                      │
│                                     │
│ Select Your Name:                   │
│ ┌─────────────────────────────┐   │
│ │ -- Select Your Name --       │   │
│ │ Maria Santos                 │   │
│ │ Juan Dela Cruz               │   │
│ │ Ana Reyes                    │   │
│ │ ...                          │   │
│ └─────────────────────────────┘   │
│                                     │
│ My name is not in the list          │
│                                     │
│ [Continue to Dashboard]             │
└─────────────────────────────────────┘
```

### **Custom Name Entry:**
If user clicks "My name is not in the list":
```
┌─────────────────────────────────────┐
│ Enter Your Name:                    │
│ ┌─────────────────────────────┐   │
│ │ Enter your full name         │   │
│ └─────────────────────────────┘   │
│                                     │
│ ← Choose from list instead          │
│                                     │
│ [Continue to Dashboard]             │
└─────────────────────────────────────┘
```

### **Admin Dashboard Header:**
```
┌──────────────────────────────────────────┐
│ Admin Dashboard                          │
│                                          │
│                          ADMIN           │
│                          Maria Santos    │
│                          peso...@gmail   │
│                          [Logout]        │
└──────────────────────────────────────────┘
```

---

## 📊 **Database Tracking**

When an admin approves an applicant, the system now stores:

| Column | Value | Description |
|--------|-------|-------------|
| `approved_by_admin` | `true` | Approval status |
| `approval_date` | `2024-01-15 10:30:00` | When approved |
| `approved_by` | `Maria Santos` | **NEW:** Who approved |

---

## 🔍 **Checking Who Approved Applicants**

### **In Supabase:**
```sql
SELECT 
  first_name, 
  surname, 
  approved_by, 
  approval_date 
FROM applicants 
WHERE approved_by_admin = true
ORDER BY approval_date DESC;
```

### **Sample Results:**
```
first_name | surname   | approved_by    | approval_date
-----------|-----------|----------------|------------------
John       | Doe       | Maria Santos   | 2024-01-15 10:30
Jane       | Smith     | Juan Dela Cruz | 2024-01-15 11:45
Pedro      | Gonzales  | Maria Santos   | 2024-01-15 14:20
```

---

## 🧪 **Testing**

### **Test 1: Select from List**
1. Login with password
2. Select "Maria Santos" from dropdown
3. Click "Continue to Dashboard"
4. ✅ Dashboard header shows "Maria Santos"
5. Approve an applicant
6. Check database: `approved_by` = "Maria Santos"

### **Test 2: Custom Name**
1. Login with password
2. Click "My name is not in the list"
3. Type "Roberto Cruz"
4. Click "Continue to Dashboard"
5. ✅ Dashboard header shows "Roberto Cruz"
6. Approve an applicant
7. Check database: `approved_by` = "Roberto Cruz"

### **Test 3: Multiple Admins**
1. Admin A (Maria Santos) logs in and approves John Doe
2. Admin A logs out
3. Admin B (Juan Dela Cruz) logs in and approves Jane Smith
4. Check database:
   - John Doe: `approved_by` = "Maria Santos" ✅
   - Jane Smith: `approved_by` = "Juan Dela Cruz" ✅

---

## ⚙️ **Configuration Options**

### **Change Number of Pre-Defined Names:**
Edit `src/auth/AdminNameSelection.jsx`:

```javascript
const predefinedAdmins = [
  'Admin 1',
  'Admin 2',
  'Admin 3',
  // Add or remove as needed
];
```

### **Make Name Selection Optional:**
To skip name selection (use email instead):

In `src/App.jsx`, replace:
```javascript
setShowNameSelection(true);
```

With:
```javascript
setAdminName(user.email);
setShowNameSelection(false);
```

### **Disable Custom Name Entry:**
In `src/auth/AdminNameSelection.jsx`, remove this button:
```javascript
<button onClick={() => setShowCustomInput(true)}>
  My name is not in the list
</button>
```

---

## 🚀 **Benefits**

✅ **Accountability** - Know who approved each applicant  
✅ **Audit Trail** - Track approval history  
✅ **Multiple Admins** - Same password, different names  
✅ **Simple** - No need for separate admin accounts  
✅ **Flexible** - Pre-defined list + custom entry  
✅ **User-Friendly** - Easy dropdown selection  

---

## 📝 **Summary**

**Files Modified:**
- `src/auth/AdminNameSelection.jsx` (NEW)
- `src/App.jsx` (updated)
- `src/admin/AdminDashboard.jsx` (updated)
- `add_approved_by_column.sql` (NEW)

**Database Changes:**
- Added `approved_by` column to `applicants` table

**User Flow:**
```
Password Login → Name Selection → Dashboard → Approve → Track Who Approved
```

**Next Steps:**
1. ✅ Run the SQL in Supabase
2. ✅ Customize admin names (optional)
3. ✅ Test the flow
4. ✅ Push to GitHub
5. ✅ Deploy to Vercel

---

**Your PESO system now tracks WHO approved each applicant!** 🎉
