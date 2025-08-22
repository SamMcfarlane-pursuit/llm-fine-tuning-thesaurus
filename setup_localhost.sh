#!/bin/bash

# Visual LLM Localhost Setup Script
# Complete setup for local development and testing

echo "🏠 Visual LLM Localhost Setup"
echo "============================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists python3; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3.9+ from https://python.org"
    exit 1
fi

if ! command_exists pip3; then
    echo "❌ pip3 is required but not installed."
    echo "Please install pip3"
    exit 1
fi

echo "✅ Python 3 and pip3 are available"

# Create virtual environment
echo "📦 Setting up virtual environment..."
if [ ! -d "thesaurus_env" ]; then
    python3 -m venv thesaurus_env
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
source thesaurus_env/bin/activate
echo "✅ Virtual environment activated"

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt
echo "✅ Dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📄 Creating .env file..."
    cat > .env << EOF
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(16))')

# Database
DATABASE_URL=sqlite:///instance/app.db

# Optional: Add your OAuth credentials here
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
# GITHUB_CLIENT_ID=your-github-client-id
# GITHUB_CLIENT_SECRET=your-github-client-secret

# Optional: Add your Supabase credentials here
# SUPABASE_URL=your-supabase-url
# SUPABASE_KEY=your-supabase-key

# Email Configuration (optional)
# MAIL_SERVER=smtp.gmail.com
# MAIL_PORT=587
# MAIL_USE_TLS=True
# MAIL_USERNAME=your-email@gmail.com
# MAIL_PASSWORD=your-app-password
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Create instance directory
mkdir -p instance
echo "✅ Instance directory ready"

# Initialize database
echo "🗄️  Initializing database..."
python3 -c "
from app import app, db
with app.app_context():
    db.create_all()
    print('✅ Database initialized successfully!')
"

# Seed database with sample data
echo "🌱 Seeding database with sample data..."
if [ -f "seed_quizzes.py" ]; then
    python3 seed_quizzes.py
    echo "✅ Sample quizzes added"
fi

# Make scripts executable
chmod +x deploy.sh
chmod +x deploy_production.sh
chmod +x start_servers.sh
chmod +x stop_servers.sh
echo "✅ Scripts made executable"

echo ""
echo "🎉 Localhost setup completed successfully!"
echo ""
echo "🚀 To start your Visual LLM website:"
echo "   ./deploy.sh"
echo ""
echo "🌐 Your website will be available at:"
echo "   http://localhost:5000"
echo ""
echo "📚 Additional commands:"
echo "   ./start_servers.sh  - Start all services"
echo "   ./stop_servers.sh   - Stop all services"
echo "   ./deploy_production.sh - Deploy to production"
echo ""
echo "🔧 Configuration:"
echo "   Edit .env file to add OAuth credentials"
echo "   See DEPLOYMENT_GUIDE.md for production deployment"
echo ""
echo "✨ Happy coding!"
