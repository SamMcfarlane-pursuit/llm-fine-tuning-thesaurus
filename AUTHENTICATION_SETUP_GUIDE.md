# 🔐 Complete Authentication Setup Guide for Visual LLM

This guide will help you set up **Google**, **GitHub**, and **Supabase** authentication for your Visual LLM application.

## 🎯 Quick Setup Overview

Your application currently runs at: `http://127.0.0.1:5037`

**Required Redirect URIs for all providers:**
- Google: `http://127.0.0.1:5037/auth/login/google/authorized`
- GitHub: `http://127.0.0.1:5037/auth/login/github/authorized`
- Supabase: `http://127.0.0.1:5037/auth/login/supabase/callback`

---

## 🟢 1. Google OAuth Setup

### Step 1: Create Google OAuth Application
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Configure:
   - **Name**: Visual LLM Authentication
   - **Authorized JavaScript origins**: `http://127.0.0.1:5037`
   - **Authorized redirect URIs**: `http://127.0.0.1:5037/auth/login/google/authorized`

### Step 2: Update Environment Variables
```bash
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
```

---

## 🔵 2. GitHub OAuth Setup

### Step 1: Create GitHub OAuth App
1. Go to [GitHub Settings](https://github.com/settings/profile)
2. Navigate to **Developer settings** → **OAuth Apps**
3. Click **New OAuth App**
4. Configure:
   - **Application name**: Visual LLM Fine-tuning Platform
   - **Homepage URL**: `http://127.0.0.1:5037`
   - **Authorization callback URL**: `http://127.0.0.1:5037/auth/login/github/authorized`

### Step 2: Update Environment Variables
```bash
GITHUB_CLIENT_ID=your-actual-github-client-id
GITHUB_CLIENT_SECRET=your-actual-github-client-secret
```

---

## 🟡 3. Supabase Setup

### Step 1: Create Supabase Project
1. Go to [Supabase](https://supabase.com/)
2. Create new project
3. Get your project URL and anon key from **Settings** → **API**

### Step 2: Configure Authentication
1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Set:
   - **Site URL**: `http://127.0.0.1:5037`
   - **Redirect URLs**: `http://127.0.0.1:5037/auth/login/supabase/callback`

### Step 3: Update Environment Variables
```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

---

## 🧪 Testing Authentication

### Test Each Provider:

1. **Start the application** (if not already running):
   ```bash
   cd "/Users/samuelmcfarlane/Documents/augment-projects/Thesaurus AI LLM FT"
   source thesaurus_env/bin/activate
   python app.py
   ```

2. **Visit**: `http://127.0.0.1:5037/auth/login`

3. **Test each sign-in button**:
   - ✅ Google Sign-In
   - ✅ GitHub Sign-In
   - ✅ Supabase Sign-In

### Expected Flow:
1. Click provider button → Redirect to provider
2. Authorize application → Redirect back to app
3. User logged in → Redirect to dashboard

---

## 🔧 Troubleshooting

### Common Issues:

**1. Redirect URI Mismatch**
- Ensure exact match between provider settings and app URLs
- Check for trailing slashes

**2. Invalid Client Credentials**
- Verify client ID and secret are correctly copied
- Check for extra spaces or characters

**3. HTTPS Requirements**
- Some providers require HTTPS in production
- Use `OAUTHLIB_INSECURE_TRANSPORT=1` for local development

**4. Scope Issues**
- Ensure proper scopes are requested
- Check provider documentation for required permissions

### Debug Steps:
1. Check browser developer console for errors
2. Verify environment variables are loaded
3. Check application logs for OAuth errors
4. Test with provider's OAuth playground tools

---

## 🚀 Next Steps

After setting up authentication:

1. **Test User Registration**: Try signing up with each provider
2. **Test User Login**: Verify existing users can sign in
3. **Test Cross-Platform**: Sign in with one provider, then try another
4. **Test User Data**: Verify user profiles are created correctly
5. **Test Session Management**: Check login persistence across page reloads

---

## 📋 Checklist

- [ ] Google OAuth configured and tested
- [ ] GitHub OAuth configured and tested  
- [ ] Supabase configured and tested
- [ ] Facebook OAuth configured and tested
- [ ] All redirect URIs match exactly
- [ ] Environment variables updated
- [ ] Application restarted with new config
- [ ] Cross-platform authentication tested
- [ ] User data persistence verified

Your Visual LLM platform will have robust multi-provider authentication! 🎉
