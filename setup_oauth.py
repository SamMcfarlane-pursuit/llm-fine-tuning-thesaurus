#!/usr/bin/env python3
"""
OAuth Setup Helper for Visual LLM
Interactive script to configure OAuth providers.
"""

import os
import re
from dotenv import load_dotenv, set_key

def update_env_file(key, value):
    """Update .env file with new key-value pair."""
    env_file = '.env'
    if os.path.exists(env_file):
        set_key(env_file, key, value)
        print(f"✅ Updated {key} in .env file")
    else:
        print(f"❌ .env file not found")

def validate_url(url):
    """Validate URL format."""
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return url_pattern.match(url) is not None

def setup_google_oauth():
    """Setup Google OAuth configuration."""
    print("\n🔍 Google OAuth Setup")
    print("=" * 40)
    print("1. Go to: https://console.cloud.google.com/")
    print("2. Create a new project or select existing")
    print("3. Navigate to APIs & Services → Credentials")
    print("4. Create OAuth client ID (Web application)")
    print("5. Add redirect URI: http://127.0.0.1:5037/auth/login/google/authorized")
    print()
    
    client_id = input("Enter Google Client ID: ").strip()
    if client_id:
        update_env_file('GOOGLE_CLIENT_ID', client_id)
        
        client_secret = input("Enter Google Client Secret: ").strip()
        if client_secret:
            update_env_file('GOOGLE_CLIENT_SECRET', client_secret)
            print("✅ Google OAuth configured successfully!")
            return True
    
    print("⚠️  Google OAuth setup skipped")
    return False

def setup_github_oauth():
    """Setup GitHub OAuth configuration."""
    print("\n🐙 GitHub OAuth Setup")
    print("=" * 40)
    print("1. Go to: https://github.com/settings/profile")
    print("2. Navigate to Developer settings → OAuth Apps")
    print("3. Click 'New OAuth App'")
    print("4. Set Homepage URL: http://127.0.0.1:5037")
    print("5. Set Authorization callback URL: http://127.0.0.1:5037/auth/login/github/authorized")
    print()
    
    client_id = input("Enter GitHub Client ID: ").strip()
    if client_id:
        update_env_file('GITHUB_CLIENT_ID', client_id)
        
        client_secret = input("Enter GitHub Client Secret: ").strip()
        if client_secret:
            update_env_file('GITHUB_CLIENT_SECRET', client_secret)
            print("✅ GitHub OAuth configured successfully!")
            return True
    
    print("⚠️  GitHub OAuth setup skipped")
    return False



def setup_supabase():
    """Setup Supabase configuration."""
    print("\n⚡ Supabase Setup")
    print("=" * 40)
    print("1. Go to: https://supabase.com/")
    print("2. Create new project")
    print("3. Go to Settings → API")
    print("4. Copy Project URL and anon public key")
    print()
    
    url = input("Enter Supabase Project URL: ").strip()
    if url and validate_url(url):
        update_env_file('SUPABASE_URL', url)
        
        key = input("Enter Supabase Anon Key: ").strip()
        if key:
            update_env_file('SUPABASE_KEY', key)
            print("✅ Supabase configured successfully!")
            return True
    elif url:
        print("❌ Invalid URL format")
    
    print("⚠️  Supabase setup skipped")
    return False

def main():
    """Main setup function."""
    print("🔐 Visual LLM OAuth Setup Helper")
    print("=" * 50)
    print("This script will help you configure OAuth providers for your Visual LLM application.")
    print("You can skip any provider by pressing Enter without entering values.")
    print()
    
    # Load current environment
    load_dotenv()
    
    configured_providers = []
    
    # Setup each provider
    if setup_google_oauth():
        configured_providers.append("Google")
    
    if setup_github_oauth():
        configured_providers.append("GitHub")
    
    if setup_supabase():
        configured_providers.append("Supabase")
    
    # Summary
    print("\n" + "=" * 50)
    print("🎉 Setup Complete!")
    print("=" * 50)
    
    if configured_providers:
        print(f"✅ Configured providers: {', '.join(configured_providers)}")
        print("\n🚀 Next steps:")
        print("1. Restart your application: python app.py")
        print("2. Visit: http://127.0.0.1:5037/auth-test")
        print("3. Test each configured provider")
    else:
        print("⚠️  No providers configured")
        print("Users will only be able to register with email/password")
    
    print("\n📖 For detailed instructions, see:")
    print("   • AUTHENTICATION_SETUP_GUIDE.md")
    print("   • Run deployment checker: python deployment_checker.py")

if __name__ == '__main__':
    main()
