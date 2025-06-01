# 🚀 Visual LLM Website Deployment Guide

## Quick Start - Choose Your Deployment Method

### 🟢 Option 1: Heroku (Recommended - Easiest)
**Best for**: Beginners, quick deployment, automatic scaling
**Cost**: Free tier available, then $7/month
**Time**: 5-10 minutes

### 🔵 Option 2: Docker + Cloud (Advanced)
**Best for**: Production use, scalability, custom configurations
**Platforms**: AWS, Google Cloud, DigitalOcean, Azure
**Cost**: $5-20/month depending on resources

### 🟡 Option 3: VPS/Server (Expert)
**Best for**: Full control, custom server setup
**Platforms**: DigitalOcean, Linode, AWS EC2
**Cost**: $5-50/month depending on specs

---

## 🟢 Option 1: Heroku Deployment (EASIEST)

### Prerequisites
- Git installed
- Heroku account (free at heroku.com)
- Heroku CLI installed

### Step 1: Install Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Ubuntu/Debian
curl https://cli-assets.heroku.com/install.sh | sh
```

### Step 2: Login to Heroku
```bash
heroku login
```

### Step 3: Create Heroku App
```bash
# Navigate to your project directory
cd "/Users/samuelmcfarlane/Documents/augment-projects/Thesaurus AI LLM FT"

# Create Heroku app (replace 'your-app-name' with desired name)
heroku create visual-llm-finetuning

# Or let Heroku generate a name
heroku create
```

### Step 4: Set Environment Variables
```bash
# Set required environment variables
heroku config:set FLASK_ENV=production
heroku config:set SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(16))')

# Optional: Set custom domain later
# heroku config:set CUSTOM_DOMAIN=yourdomain.com
```

### Step 5: Deploy
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial deployment"

# Add Heroku remote
heroku git:remote -a your-app-name

# Deploy to Heroku
git push heroku main
```

### Step 6: Initialize Database
```bash
# Run database migrations
heroku run python -c "from app import app, db; app.app_context().push(); db.create_all()"

# Optional: Add sample data
heroku run python seed_quizzes.py
```

### Step 7: Open Your Website
```bash
heroku open
```

**Your website is now live! 🎉**

---

## 🔵 Option 2: Docker + Cloud Deployment

### Step 1: Build Docker Image
```bash
# Build the Docker image
docker build -t visual-llm .

# Test locally
docker run -p 5000:5000 visual-llm
```

### Step 2A: Deploy to Google Cloud Run
```bash
# Install Google Cloud CLI
# https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Build and deploy
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/visual-llm
gcloud run deploy --image gcr.io/YOUR_PROJECT_ID/visual-llm --platform managed
```

### Step 2B: Deploy to AWS ECS
```bash
# Install AWS CLI
# https://aws.amazon.com/cli/

# Configure AWS
aws configure

# Create ECR repository
aws ecr create-repository --repository-name visual-llm

# Build and push
docker tag visual-llm:latest YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/visual-llm:latest
docker push YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/visual-llm:latest

# Deploy using ECS (requires additional setup)
```

### Step 2C: Deploy to DigitalOcean App Platform
```bash
# Create app.yaml
cat > app.yaml << EOF
name: visual-llm
services:
- name: web
  source_dir: /
  github:
    repo: your-username/your-repo
    branch: main
  run_command: gunicorn --worker-tmp-dir /dev/shm app:app
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  routes:
  - path: /
EOF

# Deploy using DigitalOcean CLI or web interface
```

---

## 🟡 Option 3: VPS/Server Deployment

### Step 1: Server Setup (Ubuntu 20.04+)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3 python3-pip python3-venv nginx supervisor git -y

# Install Docker (optional)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Step 2: Application Setup
```bash
# Clone repository
git clone https://github.com/your-username/visual-llm.git
cd visual-llm

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your settings
```

### Step 3: Database Setup
```bash
# Initialize database
python -c "from app import app, db; app.app_context().push(); db.create_all()"

# Add sample data
python seed_quizzes.py
```

### Step 4: Nginx Configuration
```bash
# Create Nginx config
sudo tee /etc/nginx/sites-available/visual-llm << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /static {
        alias /path/to/visual-llm/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/visual-llm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Process Management with Supervisor
```bash
# Create supervisor config
sudo tee /etc/supervisor/conf.d/visual-llm.conf << EOF
[program:visual-llm]
command=/path/to/visual-llm/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:5000 app:app
directory=/path/to/visual-llm
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/visual-llm.log
EOF

# Start application
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start visual-llm
```

### Step 6: SSL Certificate (Optional but Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔧 Environment Variables

Create a `.env` file with these variables:

```bash
# Flask Configuration
FLASK_ENV=production
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=sqlite:///app.db

# Supabase (if using)
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key

# OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email (if using)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

---

## 🚨 Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Static files properly configured
- [ ] SSL certificate installed (for production)
- [ ] Backup strategy in place
- [ ] Monitoring set up
- [ ] Domain name configured
- [ ] Error logging configured

---

## 🔍 Troubleshooting

### Common Issues:

1. **Database not found**
   ```bash
   python -c "from app import app, db; app.app_context().push(); db.create_all()"
   ```

2. **Static files not loading**
   - Check nginx configuration
   - Verify file permissions
   - Clear browser cache

3. **Application won't start**
   - Check logs: `heroku logs --tail` (Heroku) or `/var/log/visual-llm.log` (VPS)
   - Verify all dependencies installed
   - Check environment variables

4. **Memory issues**
   - Reduce worker count in gunicorn
   - Optimize database queries
   - Use smaller instance size

---

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Check application status
curl -f http://your-domain.com/health || echo "App is down"

# Monitor logs
tail -f /var/log/visual-llm.log
```

### Backup Strategy
```bash
# Database backup
sqlite3 instance/app.db ".backup backup-$(date +%Y%m%d).db"

# Full application backup
tar -czf backup-$(date +%Y%m%d).tar.gz /path/to/visual-llm
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Update dependencies
pip install -r requirements.txt

# Restart application
sudo supervisorctl restart visual-llm  # VPS
heroku restart  # Heroku
```

---

## 🎯 Recommended Approach

**For beginners**: Start with **Heroku** - it's the easiest and most reliable option.

**For production**: Use **Docker + Cloud Platform** for better scalability and control.

**For experts**: Use **VPS** for maximum control and cost optimization.

---

## 🆘 Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Review application logs
3. Verify all environment variables are set
4. Test locally first before deploying

Your Visual LLM website will be live and accessible to users worldwide! 🌍
