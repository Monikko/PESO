# Admin Dashboard - Complete Setup Guide

## 🎯 Overview

Your PESO Palayan City system now has an **Admin Dashboard** that allows monitoring of job seekers with beautiful pie charts and data tables.

---

## 🔐 Admin Login Credentials

- **Email:** `admin01@gmail.com`
- **Password:** `admin`

---

## 📦 Installation Required

You need to install one library for the charts to work:

### Open your terminal and run:
```bash
npm install recharts
```

Then start the server:
```bash
npm run dev
```

*(See INSTALL_RECHARTS.md for detailed instructions)*

---

## 🎨 Features

### 1. **Admin Authentication**
- Special admin login detected automatically
- Admin users are routed to dashboard
- Regular users go to applicant registration

### 2. **Two Chart Views**

#### 📊 Palayan City (Per Barangay)
- Shows job seekers **per barangay** in Palayan City
- Pie chart with colorful slices
- Each slice shows percentage
- Data table lists all barangays with counts
- Example: Atate (120), Aulo (23), Bagong Buhay (10), etc.

#### 📊 Other Places (Per Municipality)
- Shows job seekers from **other municipalities**
- Grouped by City/Municipality name
- Same pie chart format
- Data table with municipality counts

### 3. **Interactive Charts**
- Hover over slices to see exact numbers
- Color-coded legend on the right
- Responsive design
- Professional Excel-like appearance

### 4. **Data Table**
- Numbered list (#, Location, Count)
- Scrollable if many entries
- Sortable (highest to lowest by default)
- Shows total count at the top

---

## 📁 Files Created

### New Files:
- `src/admin/AdminDashboard.jsx` - Main admin dashboard component
- `src/admin/AdminDashboard.css` - Dashboard styling
- `INSTALL_RECHARTS.md` - Installation instructions
- `ADMIN_DASHBOARD_README.md` - This file

### Modified Files:
- `src/App.jsx` - Added routing for admin vs regular users
- `src/auth/LoginPage.jsx` - Added admin credential detection

---

## 🚀 How to Use

### Step 1: Install Dependencies
```bash
npm install recharts
```

### Step 2: Start the Server
```bash
npm run dev
```

### Step 3: Login as Admin
1. Open browser to http://localhost:5173/ (or the port shown)
2. Enter:
   - Email: `admin01@gmail.com`
   - Password: `admin`
3. Click "Sign In"

### Step 4: View Dashboard
- You'll see the Admin Dashboard with two tabs
- Click tabs to switch between views:
  - **Palayan City (Per Barangay)**
  - **Other Places (Per Municipality)**

---

## 🎯 How It Works

### Data Source
- Fetches data from **Supabase** `applicants` table
- Reads `barangay`, `city`, and `province` columns

### Data Grouping

**Palayan City:**
```javascript
// Groups applicants where city contains "PALAYAN"
// Counts by barangay field
```

**Other Places:**
```javascript
// Groups applicants where city does NOT contain "PALAYAN"
// Counts by city/municipality field
```

### Chart Generation
- Uses **recharts** library (React-based charts)
- PieChart with customizable colors
- 20 predefined colors for slices
- Automatic percentage calculation
- Legend shows all locations

---

## 🎨 Color Scheme

The dashboard uses a professional color palette:
- Header: White with shadow
- Active Tab: Blue (#3498db)
- Admin Badge: Red (#e74c3c)
- Chart Colors: 20 distinct colors
- Background: Light gray (#f5f7fa)

---

## 📊 Sample Data View

### Palayan City Tab:
```
List of Job Seekers per Barangay          Total: 1115

[Pie Chart]                               [Data Table]
                                          1. Atate - 120
                                          2. Bo. Militar - 60
                                          3. Caballero - 83
                                          ...
```

### Other Places Tab:
```
List of Job Seekers per Municipality      Total: 214

[Pie Chart]                               [Data Table]
                                          1. Cabanatuan City - 85
                                          2. Gapan City - 42
                                          3. San Jose City - 35
                                          ...
```

---

## 🔄 User Flow

```
Login Page
    ↓
Email: admin01@gmail.com + Password: admin
    ↓
Admin Dashboard (with charts)

OR

Email: anyuser@gmail.com + Any password
    ↓
Applicant Registration Form (existing)
```

---

## 🛠️ Customization

### Change Admin Credentials
Edit `src/auth/LoginPage.jsx`:
```javascript
const isAdmin = email === 'YOUR_EMAIL' && password === 'YOUR_PASSWORD';
```

### Adjust Chart Size
Edit `src/admin/AdminDashboard.jsx`:
```javascript
<ResponsiveContainer width="100%" height={500}> // Change 500
```

### Change Colors
Edit `src/admin/AdminDashboard.jsx`:
```javascript
const COLORS = [
  '#5470C6',  // Blue
  '#91CC75',  // Green
  // Add more colors...
];
```

### Modify Data Fetching
Edit the `fetchData` function in `AdminDashboard.jsx` to:
- Add filters
- Change grouping logic
- Add date ranges

---

## ✅ Testing Checklist

- [ ] Install recharts (`npm install recharts`)
- [ ] Start dev server (`npm run dev`)
- [ ] Login with admin credentials
- [ ] See Admin Dashboard header
- [ ] Click "Palayan City" tab - see chart and data
- [ ] Click "Other Places" tab - see chart and data
- [ ] Hover over chart slices - see tooltips
- [ ] Scroll data table - works smoothly
- [ ] Check total counts at top
- [ ] Click Logout - returns to login page
- [ ] Login with regular email - goes to registration form

---

## 🐛 Troubleshooting

**No data showing:**
- Check if applicants exist in Supabase
- Verify `barangay` and `city` fields are filled
- Check browser console for errors

**Charts not appearing:**
- Make sure recharts is installed
- Check for import errors in console
- Verify Supabase connection

**Can't login as admin:**
- Check exact spelling: `admin01@gmail.com`
- Password is case-sensitive: `admin`
- Clear browser cache if needed

---

## 📱 Responsive Design

The dashboard is fully responsive:
- Desktop: Side-by-side chart and table
- Tablet: Stacked layout
- Mobile: Optimized for small screens

---

## 🎉 You're Done!

Once you run `npm install recharts`, your admin dashboard is ready to use!

**Login as admin and monitor your job seekers with beautiful visualizations!**
