#!/usr/bin/env python3
"""
DEPLOYMENT CONFIGURATION FOR VISUAL LLM
Platform-specific configurations for production deployment
"""

import os
from datetime import timedelta

class BaseDeploymentConfig:
    """Base configuration for all deployment platforms"""
    
    # Security
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'change-this-in-production'
    WTF_CSRF_SECRET_KEY = os.environ.get('CSRF_SECRET_KEY') or 'change-this-too'
    
    # Database
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'pool_timeout': 20
    }
    
    # Session
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    
    # AI Configuration
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
    HUGGINGFACE_API_KEY = os.environ.get('HUGGINGFACE_API_KEY')
    
    # Email
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    
    # Performance
    SEND_FILE_MAX_AGE_DEFAULT = timedelta(hours=12)

class HerokuConfig(BaseDeploymentConfig):
    """Configuration for Heroku deployment"""
    
    # Heroku-specific settings
    DEBUG = False
    TESTING = False
    
    # Database (Heroku Postgres)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', '').replace('postgres://', 'postgresql://')
    
    # Security for HTTPS
    SESSION_COOKIE_SECURE = True
    
    # Supabase (recommended for Heroku)
    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')
    
    # OAuth (Heroku URLs)
    OAUTH_CREDENTIALS = {
        'github': {
            'id': os.environ.get('GITHUB_CLIENT_ID'),
            'secret': os.environ.get('GITHUB_CLIENT_SECRET')
        },
        'google': {
            'id': os.environ.get('GOOGLE_CLIENT_ID'),
            'secret': os.environ.get('GOOGLE_CLIENT_SECRET')
        }
    }
    
    # Rate limiting with Redis
    RATELIMIT_STORAGE_URL = os.environ.get('REDIS_URL', 'memory://')
    
    # Caching
    CACHE_TYPE = 'redis' if os.environ.get('REDIS_URL') else 'simple'
    CACHE_REDIS_URL = os.environ.get('REDIS_URL')

class RailwayConfig(BaseDeploymentConfig):
    """Configuration for Railway deployment"""
    
    DEBUG = False
    TESTING = False
    
    # Railway database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    
    # Security
    SESSION_COOKIE_SECURE = True
    
    # Railway-specific environment variables
    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')
    
    # OAuth
    OAUTH_CREDENTIALS = {
        'github': {
            'id': os.environ.get('GITHUB_CLIENT_ID'),
            'secret': os.environ.get('GITHUB_CLIENT_SECRET')
        },
        'google': {
            'id': os.environ.get('GOOGLE_CLIENT_ID'),
            'secret': os.environ.get('GOOGLE_CLIENT_SECRET')
        }
    }
    
    # Performance
    CACHE_TYPE = 'simple'
    RATELIMIT_STORAGE_URL = 'memory://'

class RenderConfig(BaseDeploymentConfig):
    """Configuration for Render deployment"""
    
    DEBUG = False
    TESTING = False
    
    # Render database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    
    # Security
    SESSION_COOKIE_SECURE = True
    
    # Render environment
    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')
    
    # OAuth
    OAUTH_CREDENTIALS = {
        'github': {
            'id': os.environ.get('GITHUB_CLIENT_ID'),
            'secret': os.environ.get('GITHUB_CLIENT_SECRET')
        },
        'google': {
            'id': os.environ.get('GOOGLE_CLIENT_ID'),
            'secret': os.environ.get('GOOGLE_CLIENT_SECRET')
        }
    }

class VercelConfig(BaseDeploymentConfig):
    """Configuration for Vercel deployment (serverless)"""
    
    DEBUG = False
    TESTING = False
    
    # Vercel with Supabase
    SQLALCHEMY_DATABASE_URI = os.environ.get('SUPABASE_DATABASE_URL')
    
    # Security
    SESSION_COOKIE_SECURE = True
    
    # Supabase integration
    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')
    
    # OAuth
    OAUTH_CREDENTIALS = {
        'github': {
            'id': os.environ.get('GITHUB_CLIENT_ID'),
            'secret': os.environ.get('GITHUB_CLIENT_SECRET')
        },
        'google': {
            'id': os.environ.get('GOOGLE_CLIENT_ID'),
            'secret': os.environ.get('GOOGLE_CLIENT_SECRET')
        }
    }
    
    # Serverless optimizations
    CACHE_TYPE = 'simple'
    RATELIMIT_STORAGE_URL = 'memory://'

# Platform detection and configuration mapping
PLATFORM_CONFIGS = {
    'heroku': HerokuConfig,
    'railway': RailwayConfig,
    'render': RenderConfig,
    'vercel': VercelConfig
}

def get_deployment_config():
    """Detect platform and return appropriate configuration"""
    
    # Platform detection
    if os.environ.get('DYNO'):  # Heroku
        platform = 'heroku'
    elif os.environ.get('RAILWAY_ENVIRONMENT'):  # Railway
        platform = 'railway'
    elif os.environ.get('RENDER'):  # Render
        platform = 'render'
    elif os.environ.get('VERCEL'):  # Vercel
        platform = 'vercel'
    else:
        # Default to Heroku config for unknown platforms
        platform = 'heroku'
    
    config_class = PLATFORM_CONFIGS.get(platform, HerokuConfig)
    print(f"🚀 Detected platform: {platform.upper()}")
    
    return config_class

# Environment variable validation
REQUIRED_PRODUCTION_VARS = [
    'SECRET_KEY',
    'DATABASE_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
]

RECOMMENDED_PRODUCTION_VARS = [
    'GROQ_API_KEY',
    'HUGGINGFACE_API_KEY',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'MAIL_USERNAME',
    'MAIL_PASSWORD'
]

def validate_deployment_environment():
    """Validate required environment variables for deployment"""
    missing_required = []
    missing_recommended = []
    
    for var in REQUIRED_PRODUCTION_VARS:
        if not os.environ.get(var):
            missing_required.append(var)
    
    for var in RECOMMENDED_PRODUCTION_VARS:
        if not os.environ.get(var):
            missing_recommended.append(var)
    
    if missing_required:
        raise EnvironmentError(
            f"Missing required environment variables: {', '.join(missing_required)}"
        )
    
    if missing_recommended:
        print(f"⚠️ Missing recommended variables: {', '.join(missing_recommended)}")
        print("   Some features may not work properly")
    
    print("✅ Environment validation passed")
    return True

# Deployment checklist
DEPLOYMENT_CHECKLIST = """
🚀 VISUAL LLM PRODUCTION DEPLOYMENT CHECKLIST

REQUIRED ENVIRONMENT VARIABLES:
□ SECRET_KEY - Strong random secret key
□ DATABASE_URL - Production database connection
□ SUPABASE_URL - Supabase project URL
□ SUPABASE_ANON_KEY - Supabase anonymous key

RECOMMENDED ENVIRONMENT VARIABLES:
□ GROQ_API_KEY - For enhanced AI performance
□ HUGGINGFACE_API_KEY - For educational AI content
□ GITHUB_CLIENT_ID & GITHUB_CLIENT_SECRET - GitHub OAuth
□ GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET - Google OAuth
□ MAIL_USERNAME & MAIL_PASSWORD - Email functionality

PLATFORM-SPECIFIC SETUP:
□ Domain configured and DNS pointing to platform
□ HTTPS/SSL certificate enabled
□ Environment variables set in platform dashboard
□ Database provisioned and connected
□ Static files configured for serving

SECURITY CHECKLIST:
□ DEBUG = False in production
□ Strong SECRET_KEY generated
□ HTTPS enforced
□ Security headers enabled
□ Rate limiting configured
□ Input validation implemented

PERFORMANCE CHECKLIST:
□ Database connection pooling enabled
□ Caching configured (Redis recommended)
□ Static file compression enabled
□ CDN configured for static assets (optional)
□ AI response optimization enabled

POST-DEPLOYMENT VERIFICATION:
□ Homepage loads correctly
□ User registration/login works
□ AI assistant responds properly
□ Workshop content accessible
□ All navigation links functional
□ Mobile responsiveness verified
□ Performance metrics acceptable
"""

if __name__ == "__main__":
    print("🔧 Visual LLM Deployment Configuration")
    print("=" * 50)
    
    try:
        # Detect platform
        config = get_deployment_config()
        print(f"📋 Configuration: {config.__name__}")
        
        # Validate environment
        if os.environ.get('FLASK_ENV') == 'production':
            validate_deployment_environment()
        
        print("\n" + DEPLOYMENT_CHECKLIST)
        
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        exit(1)
