# Fix Supabase Access for Admin Dashboard

## 🔴 Error: "Error loading dashboard data"

This error means the admin dashboard can't read data from Supabase. Here's how to fix it:

---

## ✅ Solution 1: Disable RLS (Row Level Security)

RLS is blocking the dashboard from reading applicant data.

### Steps:

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Login to your account
   - Select your project: `pdcfmccokiklgyifkxte`

2. **Go to Table Editor**
   - Click "Table Editor" in left sidebar
   - Find the `applicants` table

3. **Disable RLS**
   - Click the "RLS" button/badge next to the table name
   - You'll see "Enable RLS" or "Disable RLS"
   - Make sure RLS is **DISABLED** (or you see "Enable RLS" button)

4. **Refresh Your App**
   - Go back to your browser
   - Refresh the page (F5)
   - Login as admin again
   - Dashboard should now load! 🎉

---

## ✅ Solution 2: Add RLS Policy (More Secure)

If you want to keep RLS enabled for security, add a policy:

### Steps:

1. **Go to Supabase Dashboard → Authentication → Policies**

2. **Click "New Policy" for applicants table**

3. **Create SELECT Policy:**
   - Policy name: `Allow admin to view all applicants`
   - Target roles: `anon` (or `authenticated`)
   - Policy definition: `true` (allows all reads)
   - Click "Review" then "Save"

4. **Refresh your app**

---

## ✅ Solution 3: Check if Table Exists

If you haven't registered any applicants yet:

### Option A: Register a Test Applicant
1. Logout from admin
2. Login with a regular email (e.g., `test@gmail.com`)
3. Fill out the registration form
4. Submit it
5. Logout and login as admin again

### Option B: Create Table Manually
1. Go to Supabase Dashboard → Table Editor
2. Click "New Table"
3. Name: `applicants`
4. Add columns: `barangay`, `city`, `province` (all text type)
5. Make sure RLS is disabled

---

## 🔍 Check Your Setup

### Verify Supabase Connection:

Open browser console (F12) and check:
- Are there any red errors?
- What does the error message say?

### The dashboard will now show better error messages:

- **RLS Error**: "Row Level Security is blocking access"
- **Table Missing**: "The applicants table doesn't exist yet"
- **No Data**: Shows empty charts with "No data available"

---

## 🎯 Quick Fix Checklist

- [ ] Go to Supabase Dashboard
- [ ] Find `applicants` table
- [ ] Disable RLS or add policy
- [ ] Refresh browser
- [ ] Login as admin (`admin01@gmail.com` / `admin`)
- [ ] Check if charts load

---

## 📊 Expected Result

After fixing, you should see:

**Palayan City Tab:**
- Pie chart with colors
- Data table on the right
- Total count at top

**Other Places Tab:**
- Pie chart with different municipalities
- Data table with counts
- Total count at top

---

## 🐛 Still Having Issues?

### Check Console Logs:
1. Press F12 in browser
2. Go to "Console" tab
3. Look for error messages
4. Share the error message for help

### Verify Environment:
- Check `.env` file has correct Supabase URL and key
- Restart dev server after changing `.env`
- Clear browser cache (Ctrl+Shift+Delete)

---

## 🎉 Once Fixed:

The admin dashboard will automatically:
- Fetch all applicants from Supabase
- Group Palayan City by barangay
- Group other places by municipality
- Display beautiful pie charts
- Show data tables with counts
- Update in real-time when you add applicants

**The most common fix is just disabling RLS!** Try that first. 🚀
