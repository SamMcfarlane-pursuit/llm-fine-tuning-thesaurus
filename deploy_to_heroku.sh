#!/bin/bash

# 🚀 Visual LLM - Heroku Deployment Script
# This script automates the deployment of Visual LLM to Heroku

set -e  # Exit on any error

echo "🚀 Visual LLM - Heroku Deployment Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Heroku CLI is installed
check_heroku_cli() {
    print_status "Checking Heroku CLI installation..."
    if ! command -v heroku &> /dev/null; then
        print_error "Heroku CLI is not installed!"
        echo "Please install it from: https://devcenter.heroku.com/articles/heroku-cli"
        echo ""
        echo "Installation commands:"
        echo "macOS: brew tap heroku/brew && brew install heroku"
        echo "Ubuntu: curl https://cli-assets.heroku.com/install.sh | sh"
        echo "Windows: Download from the link above"
        exit 1
    fi
    print_success "Heroku CLI is installed"
}

# Check if user is logged in to Heroku
check_heroku_auth() {
    print_status "Checking Heroku authentication..."
    if ! heroku auth:whoami &> /dev/null; then
        print_warning "Not logged in to Heroku"
        print_status "Please log in to Heroku..."
        heroku login
    fi
    print_success "Authenticated with Heroku"
}

# Check if git is initialized
check_git() {
    print_status "Checking Git repository..."
    if [ ! -d ".git" ]; then
        print_warning "Git repository not initialized"
        print_status "Initializing Git repository..."
        git init
        git add .
        git commit -m "Initial commit for deployment"
    fi
    print_success "Git repository ready"
}

# Create Heroku app
create_heroku_app() {
    print_status "Creating Heroku application..."
    
    # Ask for app name
    echo ""
    echo "Enter your desired app name (or press Enter for auto-generated name):"
    read -r APP_NAME
    
    if [ -z "$APP_NAME" ]; then
        print_status "Creating app with auto-generated name..."
        heroku create
    else
        print_status "Creating app with name: $APP_NAME"
        if heroku create "$APP_NAME"; then
            print_success "App created successfully: $APP_NAME"
        else
            print_error "Failed to create app with name: $APP_NAME"
            print_status "Trying with auto-generated name..."
            heroku create
        fi
    fi
    
    # Get the app name
    APP_URL=$(heroku info -s | grep web_url | cut -d= -f2)
    print_success "App URL: $APP_URL"
}

# Set environment variables
set_environment_variables() {
    print_status "Setting environment variables..."
    
    # Generate secret key
    SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(32))')
    
    # Set basic environment variables
    heroku config:set FLASK_ENV=production
    heroku config:set SECRET_KEY="$SECRET_KEY"
    heroku config:set FLASK_APP=app.py
    
    print_success "Environment variables set"
    
    # Optional: Ask for additional environment variables
    echo ""
    print_status "Do you want to set up additional services? (y/n)"
    read -r SETUP_SERVICES
    
    if [ "$SETUP_SERVICES" = "y" ] || [ "$SETUP_SERVICES" = "Y" ]; then
        setup_additional_services
    fi
}

# Setup additional services (Supabase, OAuth, etc.)
setup_additional_services() {
    echo ""
    print_status "Setting up additional services..."
    
    # Supabase setup
    echo "Do you want to set up Supabase? (y/n)"
    read -r SETUP_SUPABASE
    if [ "$SETUP_SUPABASE" = "y" ] || [ "$SETUP_SUPABASE" = "Y" ]; then
        echo "Enter your Supabase URL:"
        read -r SUPABASE_URL
        echo "Enter your Supabase Key:"
        read -r SUPABASE_KEY
        heroku config:set SUPABASE_URL="$SUPABASE_URL"
        heroku config:set SUPABASE_KEY="$SUPABASE_KEY"
        print_success "Supabase configured"
    fi
    
    # Google OAuth setup
    echo "Do you want to set up Google OAuth? (y/n)"
    read -r SETUP_GOOGLE
    if [ "$SETUP_GOOGLE" = "y" ] || [ "$SETUP_GOOGLE" = "Y" ]; then
        echo "Enter your Google Client ID:"
        read -r GOOGLE_CLIENT_ID
        echo "Enter your Google Client Secret:"
        read -r GOOGLE_CLIENT_SECRET
        heroku config:set GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"
        heroku config:set GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET"
        print_success "Google OAuth configured"
    fi
}

# Deploy to Heroku
deploy_app() {
    print_status "Deploying application to Heroku..."
    
    # Add all files to git
    git add .
    
    # Check if there are changes to commit
    if git diff --staged --quiet; then
        print_status "No changes to commit"
    else
        git commit -m "Deploy to Heroku - $(date)"
    fi
    
    # Deploy to Heroku
    print_status "Pushing to Heroku... (this may take a few minutes)"
    git push heroku main
    
    print_success "Application deployed successfully!"
}

# Initialize database
initialize_database() {
    print_status "Initializing database..."
    
    # Create database tables
    heroku run python -c "from app import app, db; app.app_context().push(); db.create_all()"
    
    # Ask if user wants to seed with sample data
    echo ""
    echo "Do you want to add sample quiz data? (y/n)"
    read -r SEED_DATA
    if [ "$SEED_DATA" = "y" ] || [ "$SEED_DATA" = "Y" ]; then
        print_status "Adding sample quiz data..."
        if [ -f "seed_quizzes.py" ]; then
            heroku run python seed_quizzes.py
            print_success "Sample data added"
        else
            print_warning "seed_quizzes.py not found, skipping sample data"
        fi
    fi
    
    print_success "Database initialized"
}

# Final steps
final_steps() {
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "Your Visual LLM website is now live!"
    echo ""
    
    # Get app info
    APP_URL=$(heroku info -s | grep web_url | cut -d= -f2)
    APP_NAME=$(heroku info -s | grep name | cut -d= -f2)
    
    echo "📱 App Name: $APP_NAME"
    echo "🌐 App URL: $APP_URL"
    echo ""
    
    echo "🔧 Useful commands:"
    echo "  View logs: heroku logs --tail"
    echo "  Open app: heroku open"
    echo "  Scale app: heroku ps:scale web=1"
    echo "  Run commands: heroku run python your_script.py"
    echo ""
    
    echo "📊 Monitor your app:"
    echo "  Dashboard: https://dashboard.heroku.com/apps/$APP_NAME"
    echo "  Metrics: https://dashboard.heroku.com/apps/$APP_NAME/metrics"
    echo ""
    
    # Ask if user wants to open the app
    echo "Do you want to open your app now? (y/n)"
    read -r OPEN_APP
    if [ "$OPEN_APP" = "y" ] || [ "$OPEN_APP" = "Y" ]; then
        heroku open
    fi
    
    print_success "Deployment script completed! 🚀"
}

# Error handling
handle_error() {
    print_error "An error occurred during deployment!"
    echo ""
    echo "Common solutions:"
    echo "1. Check your internet connection"
    echo "2. Verify Heroku CLI is properly installed"
    echo "3. Make sure you're logged in to Heroku"
    echo "4. Check if app name is already taken"
    echo "5. Review the error message above"
    echo ""
    echo "For more help, visit: https://devcenter.heroku.com/articles/getting-started-with-python"
    exit 1
}

# Set up error handling
trap 'handle_error' ERR

# Main deployment process
main() {
    echo ""
    print_status "Starting Visual LLM deployment to Heroku..."
    echo ""
    
    # Pre-deployment checks
    check_heroku_cli
    check_heroku_auth
    check_git
    
    # Deployment process
    create_heroku_app
    set_environment_variables
    deploy_app
    initialize_database
    final_steps
}

# Run the main function
main

echo ""
print_success "🎉 Your Visual LLM website is now live and ready for users!"
echo "Share your app URL with others to let them explore LLM fine-tuning!"
