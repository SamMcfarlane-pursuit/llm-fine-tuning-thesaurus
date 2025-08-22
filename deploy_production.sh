#!/bin/bash

# Visual LLM Production Deployment Script
# Choose your deployment method: Heroku, Docker, or VPS

echo "🚀 Visual LLM Production Deployment"
echo "===================================="
echo ""
echo "Choose your deployment method:"
echo "1) Heroku (Easiest - Recommended)"
echo "2) Docker + Cloud Platform"
echo "3) VPS/Server Setup"
echo "4) Check deployment readiness"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🟢 Deploying to Heroku..."
        ./deploy_to_heroku.sh
        ;;
    2)
        echo "🔵 Docker deployment..."
        echo "Building Docker image..."
        docker build -t visual-llm .
        echo "✅ Docker image built successfully!"
        echo ""
        echo "Next steps:"
        echo "• For Google Cloud Run: gcloud builds submit --tag gcr.io/PROJECT_ID/visual-llm"
        echo "• For AWS ECS: Push to ECR and deploy"
        echo "• For DigitalOcean: Use App Platform"
        echo "• Local test: docker run -p 5000:5000 visual-llm"
        ;;
    3)
        echo "🟡 VPS deployment setup..."
        echo "This will guide you through VPS setup."
        echo ""
        echo "Required steps:"
        echo "1. Update server: sudo apt update && sudo apt upgrade -y"
        echo "2. Install dependencies: sudo apt install python3 python3-pip nginx supervisor git -y"
        echo "3. Clone repository to server"
        echo "4. Set up virtual environment"
        echo "5. Configure Nginx"
        echo "6. Set up Supervisor"
        echo "7. Configure SSL with Certbot"
        echo ""
        echo "📚 See DEPLOYMENT_GUIDE.md for detailed instructions"
        ;;
    4)
        echo "🔍 Checking deployment readiness..."
        python3 check_deployment_ready.py
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process completed!"
echo "📚 For troubleshooting, see DEPLOYMENT_GUIDE.md"
