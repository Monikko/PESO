# Install Recharts Library for Admin Dashboard

## You need to install the recharts library to display the pie charts in the admin dashboard.

### Steps:

1. **Open Terminal in VS Code**
   - Press `Ctrl + ~` (tilde) or `Ctrl + `` (backtick)
   - OR click "Terminal" → "New Terminal" from the menu

2. **Switch to Command Prompt (if using PowerShell)**
   - Click the dropdown arrow next to the "+" in terminal
   - Select "Command Prompt" or "Git Bash"

3. **Run this command:**
   ```bash
   npm install recharts
   ```

4. **Wait for installation to complete**
   - You should see: `added 1 package` or similar message

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Go to the URL shown (probably http://localhost:5173/ or http://localhost:5174/)

7. **Test the admin login:**
   - Email: `admin01@gmail.com`
   - Password: `admin`

---

## What You'll See:

After logging in as admin, you'll see:
- **Admin Dashboard** with your email and an ADMIN badge
- **Two tabs**: 
  - "Palayan City (Per Barangay)" - Pie chart showing job seekers by barangay
  - "Other Places (Per Municipality)" - Pie chart showing job seekers by municipality
- **Pie charts** with colorful slices and percentages
- **Data table** on the right showing the numbers
- **Total count** badge at the top

---

## Troubleshooting:

**If `npm` is not recognized:**
- Try opening "Node.js Command Prompt" from Windows Start menu
- Navigate to: `cd "C:\Users\PC1\Documents\Antigravity\Project PESO"`
- Then run the install command

**If port is already in use:**
- The dev server will automatically try another port
- Just use the URL it shows in the terminal

---

## Admin Features:

✅ Login with admin credentials (admin01@gmail.com / admin)
✅ View job seekers data in beautiful pie charts
✅ Switch between Palayan City (barangay level) and Other Places (municipality level)
✅ See real-time data from Supabase database
✅ Interactive charts with hover tooltips
✅ Data table with counts per location
✅ Logout button to return to login page

---

**Once recharts is installed, everything will work perfectly!** 🎉
