#!/bin/bash
echo "🚀 Deploying Visual LLM to Render..."

# Create Render service
echo "1. Go to https://render.com"
echo "2. Connect your GitHub repository"
echo "3. Create new Web Service"
echo "4. Use these settings:"
echo "   - Build Command: pip install -r requirements-production.txt"
echo "   - Start Command: gunicorn --bind 0.0.0.0:$PORT app:app"
echo "   - Environment: Python 3"

echo "✅ Render deployment guide complete!"
