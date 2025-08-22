#!/usr/bin/env python3
"""
VISUAL LLM DEPLOYMENT SCRIPT
Automated deployment to various platforms
"""

import os
import sys
import subprocess
import secrets
import json
from pathlib import Path

class VisualLLMDeployer:
    """Automated deployment for Visual LLM"""
    
    def __init__(self):
        self.platform = None
        self.app_name = None
        self.env_vars = {}
    
    def generate_secret_key(self):
        """Generate secure secret key"""
        return secrets.token_hex(32)
    
    def detect_platform(self):
        """Detect deployment platform"""
        if subprocess.run(['which', 'heroku'], capture_output=True).returncode == 0:
            return 'heroku'
        elif subprocess.run(['which', 'railway'], capture_output=True).returncode == 0:
            return 'railway'
        else:
            return None
    
    def setup_environment_variables(self):
        """Setup required environment variables"""
        print("🔧 Setting up environment variables...")
        
        # Required variables
        self.env_vars['SECRET_KEY'] = self.generate_secret_key()
        self.env_vars['CSRF_SECRET_KEY'] = self.generate_secret_key()
        self.env_vars['FLASK_ENV'] = 'production'
        
        # Get Supabase credentials
        print("\n📊 Supabase Database Setup:")
        print("1. Visit https://supabase.com and create a project")
        print("2. Go to Settings > API")
        
        supabase_url = input("Enter Supabase URL: ").strip()
        supabase_key = input("Enter Supabase Anon Key: ").strip()
        
        if supabase_url and supabase_key:
            self.env_vars['SUPABASE_URL'] = supabase_url
            self.env_vars['SUPABASE_ANON_KEY'] = supabase_key
            self.env_vars['DATABASE_URL'] = f"{supabase_url}/rest/v1/"
        
        # Optional AI API keys
        print("\n🤖 AI API Setup (Optional but Recommended):")
        print("For enhanced AI performance, add API keys:")
        
        groq_key = input("Enter Groq API key (or press Enter to skip): ").strip()
        if groq_key:
            self.env_vars['GROQ_API_KEY'] = groq_key
        
        hf_key = input("Enter HuggingFace token (or press Enter to skip): ").strip()
        if hf_key:
            self.env_vars['HUGGINGFACE_API_KEY'] = hf_key
        
        # Optional OAuth
        print("\n🔐 OAuth Setup (Optional):")
        github_id = input("Enter GitHub Client ID (or press Enter to skip): ").strip()
        if github_id:
            github_secret = input("Enter GitHub Client Secret: ").strip()
            self.env_vars['GITHUB_CLIENT_ID'] = github_id
            self.env_vars['GITHUB_CLIENT_SECRET'] = github_secret
        
        google_id = input("Enter Google Client ID (or press Enter to skip): ").strip()
        if google_id:
            google_secret = input("Enter Google Client Secret: ").strip()
            self.env_vars['GOOGLE_CLIENT_ID'] = google_id
            self.env_vars['GOOGLE_CLIENT_SECRET'] = google_secret
    
    def deploy_heroku(self):
        """Deploy to Heroku"""
        print("🚀 Deploying to Heroku...")
        
        # Get app name
        self.app_name = input("Enter Heroku app name (or press Enter for auto-generated): ").strip()
        
        try:
            # Create Heroku app
            if self.app_name:
                subprocess.run(['heroku', 'create', self.app_name], check=True)
            else:
                result = subprocess.run(['heroku', 'create'], capture_output=True, text=True, check=True)
                # Extract app name from output
                self.app_name = result.stdout.split('https://')[1].split('.herokuapp.com')[0]
            
            print(f"✅ Created Heroku app: {self.app_name}")
            
            # Set environment variables
            for key, value in self.env_vars.items():
                subprocess.run(['heroku', 'config:set', f'{key}={value}', '--app', self.app_name], check=True)
            
            print("✅ Environment variables set")
            
            # Add database
            subprocess.run(['heroku', 'addons:create', 'heroku-postgresql:mini', '--app', self.app_name], check=True)
            print("✅ PostgreSQL database added")
            
            # Deploy
            subprocess.run(['git', 'push', 'heroku', 'main'], check=True)
            print("✅ Code deployed")
            
            # Run migrations
            subprocess.run(['heroku', 'run', 'python', '-c', 
                          '"from app import app, db; app.app_context().push(); db.create_all()"',
                          '--app', self.app_name], check=True)
            print("✅ Database initialized")
            
            print(f"\n🎉 Deployment successful!")
            print(f"🌐 Your app is live at: https://{self.app_name}.herokuapp.com")
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Deployment failed: {e}")
            return False
        
        return True
    
    def deploy_railway(self):
        """Deploy to Railway"""
        print("🚀 Deploying to Railway...")
        
        try:
            # Login to Railway
            subprocess.run(['railway', 'login'], check=True)
            
            # Create project
            subprocess.run(['railway', 'init'], check=True)
            
            # Set environment variables
            for key, value in self.env_vars.items():
                subprocess.run(['railway', 'variables', 'set', f'{key}={value}'], check=True)
            
            print("✅ Environment variables set")
            
            # Deploy
            subprocess.run(['railway', 'up'], check=True)
            print("✅ Code deployed")
            
            print(f"\n🎉 Deployment successful!")
            print("🌐 Check Railway dashboard for your app URL")
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Deployment failed: {e}")
            return False
        
        return True
    
    def create_env_file(self):
        """Create .env file for local development"""
        env_content = []
        for key, value in self.env_vars.items():
            env_content.append(f"{key}={value}")
        
        with open('.env', 'w') as f:
            f.write('\n'.join(env_content))
        
        print("✅ Created .env file for local development")
    
    def validate_deployment(self):
        """Validate deployment"""
        print("\n🧪 Validating deployment...")
        
        try:
            subprocess.run([sys.executable, 'validate_production.py'], check=True)
        except subprocess.CalledProcessError:
            print("⚠️ Validation script not available")
    
    def deploy(self):
        """Main deployment function"""
        print("🚀 Visual LLM Deployment Script")
        print("=" * 50)
        
        # Check if git repo is clean
        try:
            result = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True)
            if result.stdout.strip():
                print("⚠️ You have uncommitted changes. Please commit them first:")
                print("   git add .")
                print("   git commit -m 'Ready for deployment'")
                return False
        except:
            print("⚠️ Not a git repository. Please initialize git first:")
            print("   git init")
            print("   git add .")
            print("   git commit -m 'Initial commit'")
            return False
        
        # Setup environment variables
        self.setup_environment_variables()
        
        # Create .env file
        self.create_env_file()
        
        # Detect platform
        self.platform = self.detect_platform()
        
        if not self.platform:
            print("❌ No supported deployment platform detected")
            print("Please install Heroku CLI or Railway CLI")
            return False
        
        print(f"\n🎯 Detected platform: {self.platform.upper()}")
        
        # Deploy based on platform
        if self.platform == 'heroku':
            success = self.deploy_heroku()
        elif self.platform == 'railway':
            success = self.deploy_railway()
        else:
            print(f"❌ Platform {self.platform} not supported yet")
            return False
        
        if success:
            # Validate deployment
            self.validate_deployment()
            
            print("\n" + "=" * 50)
            print("🎉 DEPLOYMENT COMPLETE!")
            print("=" * 50)
            print("Your Visual LLM platform is now live and accessible!")
            print("\n📋 Next Steps:")
            print("1. Test your application thoroughly")
            print("2. Set up custom domain (optional)")
            print("3. Configure monitoring and analytics")
            print("4. Share your educational platform with the world!")
            
            if self.platform == 'heroku' and self.app_name:
                print(f"\n🌐 Live URL: https://{self.app_name}.herokuapp.com")
        
        return success

def main():
    """Main function"""
    deployer = VisualLLMDeployer()
    success = deployer.deploy()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
