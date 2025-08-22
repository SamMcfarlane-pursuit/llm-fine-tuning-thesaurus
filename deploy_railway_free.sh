#!/bin/bash
# FREE Railway Deployment for Visual LLM with LoRA Models

echo "🚂 Deploying Visual LLM to Railway (FREE)"
echo "💰 Cost: $5 free credits/month (plenty for educational use)"

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Login to Railway..."
railway login

# Initialize project
echo "🚂 Initializing Railway project..."
railway init

# Set environment variables for free tier
echo "⚙️ Setting free tier environment variables..."
railway variables set FLASK_ENV=production
railway variables set SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")
railway variables set LORA_MODELS_ENABLED=true
railway variables set LORA_CPU_ONLY=true
railway variables set FREE_TIER_MODE=true

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo "✅ FREE deployment complete!"
echo "🌐 Check Railway dashboard for your app URL"
echo "💡 Your LoRA models are now live and accessible!"
