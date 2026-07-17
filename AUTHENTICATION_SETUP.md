# Authentication Setup Guide

This guide will help you set up email and Google OAuth authentication for Project PESO.

## ✅ What's Already Done

- ✅ Authentication UI (Login/Signup pages)
- ✅ Email & Password authentication
- ✅ Google OAuth integration
- ✅ Email verification system
- ✅ Protected routes (requires login to access form)

## 📋 Setup Steps

### Step 1: Enable Email Authentication in Supabase

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your "Project PESO" project
3. Click **Authentication** in the left sidebar
4. Click **Providers**
5. Find **Email** and make sure it's **enabled**
6. **Enable "Confirm email"** (this sends verification emails)
7. Click **Save**

### Step 2: Configure Email Templates (Optional)

1. Still in **Authentication** → **Email Templates**
2. Customize the "Confirm signup" email template if desired
3. The default template works fine and includes the verification link

### Step 3: Set Up Google OAuth

#### A. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure consent screen if prompted:
   - Choose **External** user type
   - Fill in app name: "Project PESO"
   - Add your email
   - Skip optional fields
   - Save

6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "Project PESO Web Client"
   - **Authorized redirect URIs**: Add this URL:
     ```
     https://pdcfmccokiklgyifkxte.supabase.co/auth/v1/callback
     ```
   - Click **Create**

7. Copy the **Client ID** and **Client Secret**

#### B. Configure Google OAuth in Supabase

1. Go back to Supabase dashboard
2. **Authentication** → **Providers**
3. Find **Google** and enable it
4. Paste your **Client ID**
5. Paste your **Client Secret**
6. Click **Save**

### Step 4: Test the Authentication

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5173

3. You should see the login page!

## 🧪 Testing Authentication

### Test Email Signup:

1. Click **Sign Up** tab
2. Enter an email and password (min 6 characters)
3. Click **Sign Up**
4. You'll see "Check Your Email" screen
5. Go to your email inbox
6. Click the verification link in the email from Supabase
7. You'll be redirected and automatically logged in
8. You should see the applicant form!

### Test Email Login:

1. After verifying your email, you can log out
2. Go back to the login page
3. Click **Sign In** tab
4. Enter your email and password
5. Click **Sign In**
6. You should be logged in and see the form

### Test Google OAuth:

1. Click **Continue with Google** button
2. You'll be redirected to Google's login page
3. Choose your Google account
4. Grant permissions
5. You'll be redirected back and automatically logged in
6. You should see the applicant form!

## 🔒 Security Features

### Email Verification
- Users must verify their email before they can access the form
- Verification links expire after 24 hours
- Users can request a new verification email

### Password Requirements
- Minimum 6 characters
- Passwords are hashed and never stored in plain text

### Session Management
- Sessions are automatically managed by Supabase
- Users stay logged in across page refreshes
- Automatic token refresh

## 📱 User Flow

```
New User Flow:
1. Visit site → See Login Page
2. Click "Sign Up" → Enter email & password
3. Click "Sign Up" → See "Check Your Email"
4. Check email → Click verification link
5. Redirected → Automatically logged in
6. Access → Applicant Form

Existing User Flow:
1. Visit site → See Login Page
2. Enter email & password → Click "Sign In"
3. Logged in → Applicant Form

Google OAuth Flow:
1. Visit site → See Login Page
2. Click "Continue with Google"
3. Select Google account → Grant permissions
4. Logged in → Applicant Form
```

## 🎨 Customization

### Change Logo/Branding

Edit `src/auth/LoginPage.jsx`:
```jsx
<h1 className="auth-logo">Your App Name</h1>
<p className="auth-subtitle">Your Tagline</p>
```

### Change Colors

Edit `src/auth/AuthPages.css`:
```css
/* Change gradient background */
.auth-container {
  background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}

/* Change button color */
.primary-button {
  background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

## 🚀 Production Considerations

### Before Deploying:

1. **Update Redirect URLs** in Google OAuth:
   - Add your production domain
   - Example: `https://yourapp.com/auth/callback`

2. **Configure Site URL** in Supabase:
   - Go to **Authentication** → **URL Configuration**
   - Set your production URL

3. **Email Configuration**:
   - Consider using a custom SMTP server
   - Configure in Supabase → **Project Settings** → **Auth**

4. **Enable RLS** (if disabled for testing):
   ```sql
   ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
   ```

## 🛠️ Troubleshooting

### Email not received?
- Check spam folder
- Verify email is enabled in Supabase
- Check Supabase logs in **Authentication** → **Logs**

### Google OAuth not working?
- Verify redirect URI is correct
- Check Client ID and Secret are correct
- Ensure Google OAuth is enabled in Supabase

### "Invalid login credentials" error?
- Email must be verified first
- Password must match
- Account must exist (sign up first)

### User stays logged in after closing browser?
- This is expected behavior
- Use the logout button to sign out
- Sessions persist for security

## 📝 API Reference

### useAuth Hook

```jsx
import { useAuth } from './auth/AuthContext';

const { 
  user,           // Current user object or null
  loading,        // Loading state
  signUp,         // (email, password) => Promise
  signIn,         // (email, password) => Promise
  signInWithGoogle, // () => Promise
  signOut,        // () => Promise
  resendVerification // (email) => Promise
} = useAuth();
```

### Check if User is Logged In

```jsx
if (user) {
  // User is logged in
  console.log('Email:', user.email);
} else {
  // User is not logged in
}
```

### Sign Out

```jsx
const handleLogout = async () => {
  await signOut();
  // User will be automatically redirected to login
};
```

## 🔐 Database User Management

### View Registered Users

1. Go to Supabase dashboard
2. Click **Authentication** → **Users**
3. See all registered users
4. You can manually verify, delete, or ban users

### User Metadata

Each user has:
- `id` - Unique UUID
- `email` - Email address
- `email_confirmed_at` - Verification timestamp
- `created_at` - Registration date
- `last_sign_in_at` - Last login

## 📧 Email Verification Process

1. User signs up with email/password
2. Supabase sends verification email automatically
3. Email contains a unique verification link
4. User clicks link → email is verified
5. User is automatically logged in
6. User can now access the application

If verification email is not received, users can request a new one (you can add this feature using `resendVerification` function).

## ✨ Features Included

✅ Email & Password authentication  
✅ Google OAuth (one-click login)  
✅ Email verification required  
✅ Beautiful modern UI  
✅ Loading states  
✅ Error handling  
✅ Success messages  
✅ Responsive design  
✅ Session persistence  
✅ Protected routes  
✅ Automatic redirects  

Your authentication system is production-ready! 🎉
