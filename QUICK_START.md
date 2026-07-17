# Quick Start Guide - Supabase Integration

This is a condensed guide to get you up and running with Supabase in 5 minutes.

## 1. Create Supabase Project (2 minutes)

1. Go to https://app.supabase.com
2. Click "New Project"
3. Name it "Project PESO"
4. Set a strong database password
5. Choose your region
6. Wait for initialization

## 2. Get Your Credentials (30 seconds)

1. Go to **Settings** → **API**
2. Copy:
   - Project URL
   - anon public key

## 3. Configure Your App (30 seconds)

Edit `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Create Database (1 minute)

1. In Supabase, go to **SQL Editor**
2. Click "New query"
3. Copy all content from `supabase-schema.sql`
4. Paste and click "Run"

## 5. Restart Dev Server (30 seconds)

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## Test It!

1. Open http://localhost:5173
2. Fill out the form
3. Submit on Step 11
4. Check Supabase dashboard → **Table Editor** → `applicants`

## Common Issues

### ❌ "Failed to fetch"
- **Fix**: Check your `.env` credentials
- **Fix**: Restart dev server after changing `.env`

### ❌ "Permission denied"
- **Fix**: Make sure you ran the `supabase-schema.sql` script

### ❌ File upload fails
- **Fix**: Verify storage bucket was created by the SQL script

## What You Get

✅ Full database with all form fields  
✅ Photo storage bucket  
✅ Row Level Security policies  
✅ Real-time capabilities  
✅ Automatic timestamps  

## Next Steps

- 📖 Read [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed guide
- 🔧 Customize the schema in `supabase-schema.sql`
- 👥 Build admin panel using `src/admin/ApplicantsList.jsx` as reference
- 🔐 Add authentication for admin users

## Useful Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## File Locations

- **Supabase client**: `src/lib/supabase.js`
- **Database hook**: `src/hooks/useSupabase.js`
- **Helper functions**: `src/lib/supabaseHelpers.js`
- **Form submission**: `src/applicants/Step11.jsx`
- **Admin example**: `src/admin/ApplicantsList.jsx`

## Pro Tips

💡 Use Supabase Table Editor to view data easily  
💡 Check browser DevTools Console for detailed errors  
💡 Storage bucket is public by default for easy uploads  
💡 Row Level Security protects your data automatically  

---

**Need help?** Check the full guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
