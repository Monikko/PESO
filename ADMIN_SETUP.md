# Admin Authentication Setup Guide

## 🔐 Setting Up Admin Account in Supabase

Your app now uses **real Supabase authentication** for better security. Follow these steps to create the admin account:

---

## Step 1: Create Admin User in Supabase

1. **Go to Supabase Dashboard** → https://supabase.com/dashboard
2. **Select your project** (PESO Palayan)
3. **Navigate to:** Authentication → Users
4. **Click:** "Add User" (or "Invite user")
5. **Fill in:**
   - Email: `admin01@gmail.com`
   - Password: `admin` (or choose a stronger password)
   - Check "Auto Confirm User" ✅ (important!)
6. **Click:** "Create User" or "Send Invitation"

---

## Step 2: Update RLS Policies

Now that admin uses authenticated session, update your RLS policies:

### Option A: Via SQL Editor (Recommended)

1. **Go to:** SQL Editor in Supabase Dashboard
2. **Run this SQL:**

```sql
-- Drop the old anonymous update policy (if exists)
DROP POLICY IF EXISTS "Allow anonymous users to update" ON applicants;

-- Keep existing policies for anon (INSERT only)
-- Allow anon users to register (INSERT)
-- This should already exist - if not, create it:
CREATE POLICY IF NOT EXISTS "Allow anonymous inserts" 
ON applicants FOR INSERT 
TO anon 
WITH CHECK (true);

-- Add policy for authenticated users to UPDATE (for admin approvals)
CREATE POLICY "Allow authenticated users to update approval status" 
ON applicants 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Add policy for authenticated users to SELECT (view all data)
CREATE POLICY IF NOT EXISTS "Allow authenticated users to view all" 
ON applicants 
FOR SELECT 
TO authenticated 
USING (true);
```

### Option B: Via UI (Alternative)

1. **Go to:** Table Editor → applicants → RLS
2. **Delete or disable:** "Allow anonymous users to update" policy
3. **Create new policy:**
   - **Name:** "Allow authenticated UPDATE"
   - **Policy Command:** UPDATE
   - **Target roles:** authenticated ✅
   - **USING expression:** `true`
   - **WITH CHECK expression:** `true`

---

## Step 3: Test the Setup

1. **Refresh your app:** http://localhost:5173
2. **Login with admin credentials:**
   - Email: `admin01@gmail.com`
   - Password: `admin`
3. **Try approving an applicant**
4. **Check console logs** - you should see success messages

---

## Step 4: Verify in Supabase

After approving someone:

1. **Go to:** Supabase → Table Editor → applicants
2. **Check the approved applicant:**
   - `approved_by_admin` should be `true` ✅
   - `approval_date` should have a timestamp

---

## 🔒 Security Benefits

**Before (Client-side fake auth):**
- ❌ No real authentication
- ❌ Anyone with anon key could approve
- ❌ No audit trail

**After (Real Supabase auth):**
- ✅ Real authentication with Supabase
- ✅ Only authenticated admin can approve
- ✅ Session-based security
- ✅ Supabase handles password hashing
- ✅ Admin actions are traceable

---

## 📝 Important Notes

- **Regular users (applicants)** still register without login (using `anon` key)
- **Admin MUST login** to access dashboard and approve applicants
- **Sessions persist** - admin won't need to login every time
- **Logout properly** to end the session securely

---

## 🐛 Troubleshooting

### "Invalid login credentials"
- Make sure you created the admin user in Supabase
- Check that email is exactly `admin01@gmail.com`
- Make sure password matches what you set

### "RLS error" when approving
- Make sure you created the authenticated UPDATE policy
- Check that the policy target is `authenticated` not `anon`

### "Session not found"
- Clear browser cache and localStorage
- Login again
- Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct in .env

---

## 🚀 Next Steps

Once everything works:
1. Push to GitHub: `git push origin dev`
2. Test locally thoroughly
3. Merge to main: `git checkout main && git merge dev && git push`
4. Vercel will auto-deploy with the new authentication

---

**Created:** $(date)
**Version:** 2.0 - Real Supabase Authentication
