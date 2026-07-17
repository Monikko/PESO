# Supabase Setup Guide for Project PESO

This guide will help you set up Supabase as the database for Project PESO.

## Prerequisites

- A Supabase account (free tier available at [supabase.com](https://supabase.com))
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: Project PESO (or your preferred name)
   - **Database Password**: Create a strong password (save it securely!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free (or your preferred plan)
4. Click "Create new project" and wait for it to initialize (takes ~2 minutes)

## Step 2: Get Your API Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 3: Configure Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file
4. **Important**: Never commit the `.env` file to git! (It's already in `.gitignore`)

## Step 4: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Open the `supabase-schema.sql` file in this project
4. Copy all the SQL code and paste it into the Supabase SQL Editor
5. Click "Run" to create all tables, policies, and storage buckets

This will create:
- `applicants` table with all necessary columns
- Row Level Security (RLS) policies for data protection
- Storage bucket for applicant photos and documents
- Indexes for better query performance
- Triggers for automatic timestamp updates

## Step 5: Configure Storage

The SQL script already creates the storage bucket, but verify it:

1. Go to **Storage** in your Supabase dashboard
2. You should see a bucket named `applicant-files`
3. This bucket is configured for public uploads and access

## Step 6: Test the Connection

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Open your application in the browser
3. Try filling out the applicant form
4. Submit the form on Step 11

5. Check if the data was saved:
   - Go to Supabase dashboard → **Table Editor** → `applicants`
   - You should see your submitted record

## Step 7: View Your Data

### In Supabase Dashboard:
- **Table Editor**: View and edit records in a spreadsheet-like interface
- **SQL Editor**: Run custom queries
- **Storage**: View uploaded files

### Using the API:
The `useSupabase` hook provides these functions:
- `submitApplicant(data)` - Insert new applicant
- `getApplicants()` - Get all applicants
- `getApplicantById(id)` - Get single applicant
- `updateApplicant(id, updates)` - Update applicant
- `deleteApplicant(id)` - Delete applicant
- `uploadFile(file, bucket)` - Upload files to storage

## Security Features

### Row Level Security (RLS)
The database is configured with RLS policies:
- **Anonymous users** can INSERT (submit forms)
- **Authenticated users** can SELECT, UPDATE, DELETE
- This protects your data while allowing form submissions

### API Keys
- **anon key**: Safe to use in frontend code, limited by RLS policies
- **service_role key**: Full database access, NEVER expose in frontend

## Optional: Create Admin User

To manage applicants, you'll need authentication:

1. Go to **Authentication** → **Users** in Supabase
2. Click "Add user" → "Create new user"
3. Enter email and password
4. This user can now log in and manage applicant data

## Troubleshooting

### "Failed to fetch" error
- Check that your `.env` file has correct credentials
- Restart the dev server after changing `.env`
- Check browser console for detailed error messages

### "Permission denied" error
- Verify RLS policies are created (run the SQL script again)
- Check that you're using the correct API key

### File upload fails
- Verify the storage bucket exists
- Check storage policies in **Storage** → **Policies**
- Ensure file size is under 50MB (Supabase default limit)

### Data not appearing
- Check **Table Editor** in Supabase dashboard
- Open browser DevTools → Network tab to see API requests
- Check for errors in browser console

## Next Steps

### Build an Admin Panel
You can create an admin interface to:
- View all submitted applications
- Search and filter applicants
- Update application status
- Export data to CSV/Excel

### Add Authentication
Implement user authentication to:
- Allow applicants to create accounts
- Let users save drafts and return later
- Enable users to update their information

### Set Up Realtime
Use Supabase Realtime to:
- Show live application updates
- Notify admins of new submissions
- Display real-time statistics

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

## Support

If you encounter issues:
1. Check the Supabase Status page: [status.supabase.com](https://status.supabase.com)
2. Search Supabase discussions: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
3. Join Supabase Discord: [discord.supabase.com](https://discord.supabase.com)
