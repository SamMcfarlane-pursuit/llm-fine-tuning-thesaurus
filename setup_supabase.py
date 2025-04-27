#!/usr/bin/env python3
"""
Supabase setup script.
Creates the necessary tables and policies in Supabase.
"""

import os
import sys
import argparse
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Get Supabase credentials from environment variables
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_KEY must be set in .env file")
    sys.exit(1)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def create_users_table():
    """Create users table."""
    print("Creating users table...")
    
    # SQL for creating users table
    sql = """
    CREATE TABLE IF NOT EXISTS users (
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
    """
    
    try:
        # Execute SQL
        supabase.rpc('exec_sql', {'query': sql}).execute()
        print("Users table created successfully")
        return True
    except Exception as e:
        print(f"Error creating users table: {e}")
        return False

def create_user_progress_table():
    """Create user_progress table."""
    print("Creating user_progress table...")
    
    # SQL for creating user_progress table
    sql = """
    CREATE TABLE IF NOT EXISTS user_progress (
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

    CREATE POLICY "Users can insert their own progress" ON user_progress
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own progress" ON user_progress
      FOR UPDATE USING (auth.uid() = user_id);
    """
    
    try:
        # Execute SQL
        supabase.rpc('exec_sql', {'query': sql}).execute()
        print("User progress table created successfully")
        return True
    except Exception as e:
        print(f"Error creating user progress table: {e}")
        return False

def create_bookmarks_table():
    """Create bookmarks table."""
    print("Creating bookmarks table...")
    
    # SQL for creating bookmarks table
    sql = """
    CREATE TABLE IF NOT EXISTS bookmarks (
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
    """
    
    try:
        # Execute SQL
        supabase.rpc('exec_sql', {'query': sql}).execute()
        print("Bookmarks table created successfully")
        return True
    except Exception as e:
        print(f"Error creating bookmarks table: {e}")
        return False

def create_quiz_results_table():
    """Create quiz_results table."""
    print("Creating quiz_results table...")
    
    # SQL for creating quiz_results table
    sql = """
    CREATE TABLE IF NOT EXISTS quiz_results (
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
    """
    
    try:
        # Execute SQL
        supabase.rpc('exec_sql', {'query': sql}).execute()
        print("Quiz results table created successfully")
        return True
    except Exception as e:
        print(f"Error creating quiz results table: {e}")
        return False

def create_storage_bucket():
    """Create storage bucket for avatars."""
    print("Creating storage bucket for avatars...")
    
    try:
        # Create bucket
        supabase.storage.create_bucket('avatars', {'public': True})
        print("Storage bucket created successfully")
        
        # Set bucket policies
        sql = """
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
        """
        
        # Execute SQL
        supabase.rpc('exec_sql', {'query': sql}).execute()
        print("Storage bucket policies set successfully")
        return True
    except Exception as e:
        print(f"Error creating storage bucket: {e}")
        return False

def setup_supabase():
    """Set up Supabase with all required tables and policies."""
    print("Setting up Supabase...")
    
    # Create tables
    users_success = create_users_table()
    if not users_success:
        print("Failed to create users table. Aborting setup.")
        return False
    
    progress_success = create_user_progress_table()
    if not progress_success:
        print("Failed to create user progress table. Aborting setup.")
        return False
    
    bookmarks_success = create_bookmarks_table()
    if not bookmarks_success:
        print("Failed to create bookmarks table. Aborting setup.")
        return False
    
    quiz_success = create_quiz_results_table()
    if not quiz_success:
        print("Failed to create quiz results table. Aborting setup.")
        return False
    
    # Create storage bucket
    storage_success = create_storage_bucket()
    if not storage_success:
        print("Failed to create storage bucket. Aborting setup.")
        return False
    
    print("Supabase setup completed successfully!")
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Set up Supabase for the application")
    parser.add_argument("--force", action="store_true", help="Force setup even if tables already exist")
    args = parser.parse_args()
    
    if args.force:
        print("Forcing setup...")
    
    setup_supabase()
