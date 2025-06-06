#!/usr/bin/env python3
"""
Deployment Configuration Checker for Visual LLM
Validates all configuration and dependencies before deployment.
"""

import os
import sys
import importlib
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_environment_variables():
    """Check if all required environment variables are set."""
    print("🔧 Checking Environment Variables...")
    
    required_vars = {
        'FLASK_APP': 'app.py',
        'FLASK_ENV': 'development',
        'SECRET_KEY': None,
        'PORT': '5037',
        'HOST': '0.0.0.0'
    }
    
    optional_vars = {
        'GOOGLE_CLIENT_ID': 'Google OAuth',
        'GOOGLE_CLIENT_SECRET': 'Google OAuth',
        'GITHUB_CLIENT_ID': 'GitHub OAuth',
        'GITHUB_CLIENT_SECRET': 'GitHub OAuth',

        'SUPABASE_URL': 'Supabase Integration',
        'SUPABASE_KEY': 'Supabase Integration',
        'MAIL_USERNAME': 'Email Functionality',
        'MAIL_PASSWORD': 'Email Functionality'
    }
    
    issues = []
    
    # Check required variables
    for var, default in required_vars.items():
        value = os.environ.get(var)
        if not value:
            if default:
                print(f"  ⚠️  {var}: Using default value '{default}'")
            else:
                print(f"  ❌ {var}: MISSING (Required)")
                issues.append(f"Missing required environment variable: {var}")
        else:
            print(f"  ✅ {var}: {value}")
    
    # Check optional variables
    print("\n🔧 Optional Configuration:")
    oauth_configured = 0
    for var, purpose in optional_vars.items():
        value = os.environ.get(var)
        if value and value != f'your-{var.lower().replace("_", "-")}':
            print(f"  ✅ {var}: Configured ({purpose})")
            if 'CLIENT_ID' in var or 'CLIENT_SECRET' in var:
                oauth_configured += 1
        else:
            print(f"  ⚠️  {var}: Not configured ({purpose})")
    
    if oauth_configured >= 2:  # At least one complete OAuth provider
        print(f"  ✅ OAuth: {oauth_configured//2} provider(s) configured")
    else:
        print(f"  ⚠️  OAuth: No complete providers configured")
    
    return issues

def check_dependencies():
    """Check if all required Python packages are installed."""
    print("\n📦 Checking Dependencies...")
    
    required_packages = [
        ('flask', 'flask'),
        ('flask_login', 'flask_login'),
        ('flask_sqlalchemy', 'flask_sqlalchemy'),
        ('flask_migrate', 'flask_migrate'),
        ('flask_mail', 'flask_mail'),
        ('flask_cors', 'flask_cors'),
        ('flask_wtf', 'flask_wtf'),
        ('python_dotenv', 'dotenv'),
        ('nltk', 'nltk'),
        ('torch', 'torch'),
        ('transformers', 'transformers'),
        ('peft', 'peft'),
        ('gunicorn', 'gunicorn'),
        ('werkzeug', 'werkzeug'),
        ('email_validator', 'email_validator'),
        ('requests', 'requests'),
        ('numpy', 'numpy'),
        ('scikit_learn', 'sklearn'),
        ('authlib', 'authlib'),
        ('supabase', 'supabase')
    ]
    
    missing_packages = []
    
    for package_name, import_name in required_packages:
        try:
            importlib.import_module(import_name)
            print(f"  ✅ {package_name}")
        except ImportError:
            print(f"  ❌ {package_name}: NOT INSTALLED")
            missing_packages.append(package_name)
    
    return missing_packages

def check_database():
    """Check database configuration and connectivity."""
    print("\n🗄️  Checking Database...")
    
    database_url = os.environ.get('DATABASE_URL', 'sqlite:///instance/app.db')
    print(f"  📍 Database URL: {database_url}")
    
    if database_url.startswith('sqlite:'):
        db_path = database_url.replace('sqlite:///', '')
        if os.path.exists(db_path):
            print(f"  ✅ SQLite database exists: {db_path}")
        else:
            print(f"  ⚠️  SQLite database not found: {db_path}")
            print(f"     Will be created on first run")
    
    return []

def check_oauth_configuration():
    """Check OAuth provider configurations."""
    print("\n🔐 Checking OAuth Configuration...")
    
    providers = {
        'Google': {
            'client_id': os.environ.get('GOOGLE_CLIENT_ID'),
            'client_secret': os.environ.get('GOOGLE_CLIENT_SECRET'),
            'redirect_uri': 'http://127.0.0.1:5037/auth/login/google/authorized'
        },
        'GitHub': {
            'client_id': os.environ.get('GITHUB_CLIENT_ID'),
            'client_secret': os.environ.get('GITHUB_CLIENT_SECRET'),
            'redirect_uri': 'http://127.0.0.1:5037/auth/login/github/authorized'
        },

    }
    
    configured_providers = []
    
    for provider, config in providers.items():
        client_id = config['client_id']
        client_secret = config['client_secret']
        
        if client_id and client_secret and not client_id.startswith('your-'):
            print(f"  ✅ {provider}: Configured")
            print(f"     Redirect URI: {config['redirect_uri']}")
            configured_providers.append(provider)
        else:
            print(f"  ⚠️  {provider}: Not configured")
            print(f"     Required Redirect URI: {config['redirect_uri']}")
    
    return configured_providers

def check_file_structure():
    """Check if all required files and directories exist."""
    print("\n📁 Checking File Structure...")
    
    required_files = [
        'app.py',
        'config.py',
        'requirements.txt',
        '.env',
        'extensions.py',
        'models.py'
    ]
    
    required_dirs = [
        'templates',
        'static',
        'auth',
        'instance'
    ]
    
    missing_files = []
    
    for file in required_files:
        if os.path.exists(file):
            print(f"  ✅ {file}")
        else:
            print(f"  ❌ {file}: MISSING")
            missing_files.append(file)
    
    for directory in required_dirs:
        if os.path.isdir(directory):
            print(f"  ✅ {directory}/")
        else:
            print(f"  ❌ {directory}/: MISSING")
            missing_files.append(f"{directory}/")
    
    return missing_files

def main():
    """Run all deployment checks."""
    print("🚀 Visual LLM Deployment Configuration Checker")
    print("=" * 50)
    
    all_issues = []
    
    # Run all checks
    env_issues = check_environment_variables()
    missing_packages = check_dependencies()
    db_issues = check_database()
    configured_providers = check_oauth_configuration()
    missing_files = check_file_structure()
    
    all_issues.extend(env_issues)
    all_issues.extend([f"Missing package: {pkg}" for pkg in missing_packages])
    all_issues.extend(db_issues)
    all_issues.extend([f"Missing file: {file}" for file in missing_files])
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 DEPLOYMENT READINESS SUMMARY")
    print("=" * 50)
    
    if not all_issues:
        print("✅ ALL CHECKS PASSED!")
        print("🚀 Your application is ready for deployment!")
        
        if configured_providers:
            print(f"\n🔐 OAuth Providers Ready: {', '.join(configured_providers)}")
        else:
            print("\n⚠️  No OAuth providers configured - users can only use local registration")
        
        print("\n🎯 Next Steps:")
        print("1. Start the application: python app.py")
        print("2. Visit: http://127.0.0.1:5037")
        print("3. Test authentication: http://127.0.0.1:5037/auth-test")
        
    else:
        print("❌ ISSUES FOUND:")
        for issue in all_issues:
            print(f"   • {issue}")
        
        print("\n🔧 To fix these issues:")
        if missing_packages:
            print("   • Install missing packages: pip install -r requirements.txt")
        if env_issues:
            print("   • Update your .env file with required variables")
        if missing_files:
            print("   • Ensure all required files are present")
        
        print("\n📖 For detailed setup instructions, see:")
        print("   • AUTHENTICATION_SETUP_GUIDE.md")
        print("   • DEPLOYMENT_GUIDE.md")
    
    return len(all_issues) == 0

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
