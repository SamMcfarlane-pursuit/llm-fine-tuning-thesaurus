#!/usr/bin/env python3
"""
Visual LLM Deployment Readiness Checker
This script checks if your application is ready for deployment.
"""

import os
import sys
import subprocess
import importlib.util

def check_file_exists(filepath, description):
    """Check if a required file exists."""
    if os.path.exists(filepath):
        print(f"✅ {description}: {filepath}")
        return True
    else:
        print(f"❌ {description}: {filepath} (MISSING)")
        return False

def check_python_package(package_name):
    """Check if a Python package is installed."""
    spec = importlib.util.find_spec(package_name)
    if spec is not None:
        print(f"✅ Python package: {package_name}")
        return True
    else:
        print(f"❌ Python package: {package_name} (NOT INSTALLED)")
        return False

def check_heroku_cli():
    """Check if Heroku CLI is installed."""
    try:
        result = subprocess.run(['heroku', '--version'], 
                              capture_output=True, text=True, check=True)
        print(f"✅ Heroku CLI: {result.stdout.strip()}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Heroku CLI: Not installed")
        return False

def check_git():
    """Check if Git is installed and repository is initialized."""
    try:
        # Check if git is installed
        subprocess.run(['git', '--version'], 
                      capture_output=True, text=True, check=True)
        
        # Check if git repo is initialized
        if os.path.exists('.git'):
            print("✅ Git: Repository initialized")
            return True
        else:
            print("⚠️  Git: Repository not initialized (will be done during deployment)")
            return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Git: Not installed")
        return False

def check_environment_variables():
    """Check for important environment variables."""
    env_vars = ['SECRET_KEY', 'FLASK_ENV']
    missing_vars = []
    
    for var in env_vars:
        if os.getenv(var):
            print(f"✅ Environment variable: {var}")
        else:
            print(f"⚠️  Environment variable: {var} (will be set during deployment)")
            missing_vars.append(var)
    
    return len(missing_vars) == 0

def main():
    """Main deployment readiness check."""
    print("🚀 Visual LLM Deployment Readiness Check")
    print("=" * 50)
    
    all_checks_passed = True
    
    # Required files check
    print("\n📁 Required Files:")
    required_files = [
        ('app.py', 'Main application file'),
        ('requirements.txt', 'Python dependencies'),
        ('Procfile', 'Heroku process file'),
        ('runtime.txt', 'Python runtime version'),
        ('templates/', 'Template directory'),
        ('static/', 'Static files directory')
    ]
    
    for filepath, description in required_files:
        if not check_file_exists(filepath, description):
            all_checks_passed = False
    
    # Python packages check
    print("\n🐍 Python Dependencies:")
    required_packages = [
        'flask', 'gunicorn', 'nltk', 'transformers'
    ]
    
    for package in required_packages:
        if not check_python_package(package):
            all_checks_passed = False
    
    # Tools check
    print("\n🔧 Deployment Tools:")
    if not check_heroku_cli():
        print("   Install from: https://devcenter.heroku.com/articles/heroku-cli")
        all_checks_passed = False
    
    if not check_git():
        print("   Install from: https://git-scm.com/downloads")
        all_checks_passed = False
    
    # Environment variables check
    print("\n🌍 Environment Variables:")
    check_environment_variables()  # This is optional for deployment
    
    # Database check
    print("\n🗄️  Database:")
    if os.path.exists('instance/app.db'):
        print("✅ Database: SQLite database exists")
    else:
        print("⚠️  Database: Will be created during deployment")
    
    # Final assessment
    print("\n" + "=" * 50)
    if all_checks_passed:
        print("🎉 READY FOR DEPLOYMENT!")
        print("\nNext steps:")
        print("1. Run: ./deploy_to_heroku.sh")
        print("2. Follow the prompts")
        print("3. Your website will be live!")
    else:
        print("❌ NOT READY FOR DEPLOYMENT")
        print("\nPlease fix the issues marked with ❌ above.")
        print("Then run this script again.")
    
    print("\n📚 Deployment Options:")
    print("• Heroku (Easiest): ./deploy_to_heroku.sh")
    print("• Docker: docker build -t visual-llm . && docker run -p 5000:5000 visual-llm")
    print("• Manual: See DEPLOYMENT_GUIDE.md")
    
    return all_checks_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
