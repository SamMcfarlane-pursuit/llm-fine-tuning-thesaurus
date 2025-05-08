#!/bin/bash
# Deployment script for the Visual LLM Thesaurus application

# Exit on error
set -e

# Print commands
set -x

# Check if we're on the deployment branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "deployment" ]; then
    echo "Error: You must be on the deployment branch to deploy."
    echo "Current branch: $CURRENT_BRANCH"
    echo "Run 'git checkout deployment' and try again."
    exit 1
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "Error: You have uncommitted changes."
    echo "Please commit or stash your changes before deploying."
    exit 1
fi

# Pull the latest changes
echo "Pulling latest changes from deployment branch..."
git pull origin deployment

# Check if the required files exist
required_files=("Procfile" "requirements.txt" "runtime.txt" "app.py" "config.py")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "Error: Required file $file not found."
        exit 1
    fi
done

# Create a virtual environment if it doesn't exist
if [ ! -d "thesaurus_env" ]; then
    echo "Creating virtual environment..."
    python3 -m venv thesaurus_env
fi

# Activate the virtual environment
echo "Activating virtual environment..."
source thesaurus_env/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Run tests if they exist
if [ -d "tests" ]; then
    echo "Running tests..."
    python -m pytest
fi

# Deploy to the platform of your choice
echo "Deploying to platform..."
# Uncomment the appropriate command for your deployment platform

# For Heroku:
# git push heroku deployment:main

# For Render:
# git push render deployment:main

# For Vercel:
# vercel --prod

# For AWS Elastic Beanstalk:
# eb deploy

# For Digital Ocean App Platform:
# doctl apps create --spec app.yaml

# For Google Cloud Run:
# gcloud run deploy visual-llm --source .

# For Azure App Service:
# az webapp up --name visual-llm --resource-group visual-llm-group --sku F1

# Print deployment instructions
echo "Deployment completed successfully!"
echo ""
echo "If you're deploying manually, follow these steps:"
echo "1. Create a new app on your deployment platform"
echo "2. Connect your GitHub repository to the app"
echo "3. Set the deployment branch to 'deployment'"
echo "4. Set the following environment variables:"
echo "   - SECRET_KEY: A secure random string"
echo "   - DATABASE_URL: Your database connection string"
echo "   - FLASK_ENV: production"
echo "   - MAIL_SERVER: Your mail server (e.g., smtp.gmail.com)"
echo "   - MAIL_PORT: Your mail port (e.g., 587)"
echo "   - MAIL_USE_TLS: true"
echo "   - MAIL_USERNAME: Your email address"
echo "   - MAIL_PASSWORD: Your email password or app password"
echo "   - MAIL_DEFAULT_SENDER: Your default sender email"
echo "   - GOOGLE_CLIENT_ID: Your Google OAuth client ID"
echo "   - GOOGLE_CLIENT_SECRET: Your Google OAuth client secret"
echo "   - GITHUB_CLIENT_ID: Your GitHub OAuth client ID"
echo "   - GITHUB_CLIENT_SECRET: Your GitHub OAuth client secret"
echo "   - SUPABASE_URL: Your Supabase URL"
echo "   - SUPABASE_KEY: Your Supabase key"
echo "   - APP_URL: Your application URL"
echo "5. Deploy the app"
echo ""
echo "For more information, refer to the documentation of your deployment platform."
