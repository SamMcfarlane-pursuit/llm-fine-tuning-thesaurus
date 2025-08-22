#!/bin/bash
# FREE Render Deployment for Visual LLM with LoRA Models

echo "🎨 Deploying Visual LLM to Render (FREE)"
echo "💰 Cost: Completely free (with sleep after 15min inactivity)"

echo "📋 Manual Render Deployment Steps:"
echo "1. Go to https://render.com and sign up"
echo "2. Connect your GitHub repository"
echo "3. Create new Web Service"
echo "4. Use these settings:"
echo "   - Build Command: pip install -r requirements_free.txt"
echo "   - Start Command: gunicorn app:app --bind 0.0.0.0:$PORT"
echo "   - Environment: Python 3"
echo "5. Add environment variables:"
echo "   - FLASK_ENV=production"
echo "   - LORA_MODELS_ENABLED=true"
echo "   - FREE_TIER_MODE=true"
echo "6. Deploy!"

echo "✅ Follow these steps for FREE Render deployment"
