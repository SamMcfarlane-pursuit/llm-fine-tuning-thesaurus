# Supabase Setup Guide

This guide will help you set up Supabase for the Thesaurus LLM Fine-Tuning application. Supabase provides authentication, database, and storage services that we'll use for user management and data persistence.

## What is Supabase?

Supabase is an open-source Firebase alternative that provides:
- Authentication (including social logins)
- PostgreSQL database
- Storage for files
- Realtime subscriptions
- Edge functions

## Step 1: Create a Supabase Account

1. Go to [Supabase](https://supabase.com/) and sign up for an account
2. Create a new organization if prompted
3. Create a new project
4. Choose a name for your project
5. Set a secure database password (save this for later)
6. Choose a region close to your users
7. Wait for your project to be created (this may take a few minutes)

## Step 2: Get Your API Keys

1. Once your project is created, go to the project dashboard
2. In the left sidebar, click on "Settings" > "API"
3. You'll see two keys:
   - `anon` / `public`: This is your public API key
   - `service_role`: This is your private API key (keep this secret)
4. Copy the URL and the `anon` key to your `.env` file:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-anon-key
   ```

## Step 3: Set Up Authentication

1. In the left sidebar, click on "Authentication" > "Providers"
2. Enable the authentication providers you want to use:
   - Email (enabled by default)
   - Google
   - GitHub
   - Facebook
   - etc.
3. For each provider, you'll need to set up OAuth credentials (see the OAuth setup guide)
4. Configure your site URL and redirect URLs:
   - Site URL: `http://localhost:5002` (for development)
   - Redirect URLs: `http://localhost:5002/auth/login/supabase/callback`

## Step 4: Create Database Tables

Supabase uses PostgreSQL as its database. You'll need to create the following tables:

### Users Table

```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a secure RLS policy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### User Progress Table

```sql
CREATE TABLE user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users NOT NULL,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  status TEXT NOT NULL,
  progress_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id)
);

-- Create a secure RLS policy
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);
```

### Bookmarks Table

```sql
CREATE TABLE bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users NOT NULL,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id)
);

-- Create a secure RLS policy
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);
```

### Quiz Results Table

```sql
CREATE TABLE quiz_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users NOT NULL,
  quiz_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  answers JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quiz_id)
);

-- Create a secure RLS policy
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz results" ON quiz_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz results" ON quiz_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz results" ON quiz_results
  FOR UPDATE USING (auth.uid() = user_id);
```

## Step 5: Set Up Storage

1. In the left sidebar, click on "Storage" > "Policies"
2. Create a new bucket called "avatars"
3. Set the following policies:
   - Allow public access to read files
   - Allow authenticated users to upload files
   - Allow users to update and delete their own files

```sql
-- Allow public access to read files
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Allow authenticated users to upload files
CREATE POLICY "Users can upload avatar images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update and delete their own files
CREATE POLICY "Users can update their own avatar images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatar images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

## Step 6: Test Your Setup

1. Make sure your `.env` file has the correct Supabase URL and key
2. Start your application:
   ```
   PORT=5002 python app.py
   ```
3. Try signing up, logging in, and using the application features
4. Check the Supabase dashboard to see if data is being stored correctly

## Troubleshooting

### Common Issues

1. **Authentication Issues**: Make sure your site URL and redirect URLs are correctly configured in the Supabase dashboard.

2. **Database Errors**: Check your SQL queries and make sure your tables are created correctly.

3. **Storage Issues**: Ensure your storage bucket policies are correctly set up.

4. **CORS Issues**: If you're getting CORS errors, make sure your site URL is correctly configured in the Supabase dashboard.

### Debugging

To enable debug logging for Supabase, add the following to your code:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

This will provide more detailed error messages during Supabase operations.
