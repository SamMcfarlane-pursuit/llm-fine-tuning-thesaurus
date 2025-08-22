#!/bin/bash

# Visual LLM Enhanced Local Deployment Script
# This script sets up and runs the Visual LLM website locally

echo "🚀 Visual LLM Local Deployment Starting..."
echo "============================================"

# Create virtual environment if it doesn't exist
if [ ! -d "thesaurus_env" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv thesaurus_env
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source thesaurus_env/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install required packages
echo "📚 Installing required packages..."
pip install -r requirements.txt

# Set up environment variables
echo "🌍 Setting up environment variables..."
export FLASK_ENV=development
export FLASK_DEBUG=1
export SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(16))')

# Optional: Set Supabase credentials if available
if [ -f ".env" ]; then
    echo "📄 Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  No .env file found. Using default settings."
fi

# Initialize database if needed
echo "🗄️  Initializing database..."
python3 -c "
from app import app, db
with app.app_context():
    db.create_all()
    print('Database initialized successfully!')
"

# Stop any existing Flask applications
echo "🛑 Stopping any existing Flask applications..."
pkill -f "python.*app.py" 2>/dev/null || true
pkill -f "flask run" 2>/dev/null || true

# Start the Flask application
echo "🌟 Starting Visual LLM website..."
echo "📍 Local URL: http://localhost:5000"
echo "📍 Network URL: http://0.0.0.0:5000"
echo "🔄 Press Ctrl+C to stop the server"
echo "============================================"

# Run with gunicorn for better performance
if command -v gunicorn &> /dev/null; then
    echo "🚀 Starting with Gunicorn (Production-like)..."
    gunicorn --bind 0.0.0.0:5000 --workers 2 --timeout 120 --reload app:app
else
    echo "🐍 Starting with Flask development server..."
    python3 -c "
from app import app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
"
fi
