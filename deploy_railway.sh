#!/bin/bash
echo "🚀 Deploying Visual LLM to Railway..."

# Install Railway CLI if not present
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login and deploy
railway login
railway link
railway up

echo "✅ Deployment to Railway complete!"
echo "🌐 Your Visual LLM platform is now live!"
