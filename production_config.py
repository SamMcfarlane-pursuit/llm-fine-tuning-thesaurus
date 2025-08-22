#!/usr/bin/env python3
"""
PRODUCTION CONFIGURATION FOR VISUAL LLM
Secure, optimized settings for public deployment
"""

import os
import secrets
from datetime import timedelta

class ProductionConfig:
    """Production configuration with security and performance optimizations"""
    
    # Security Settings
    SECRET_KEY = os.environ.get('SECRET_KEY') or secrets.token_hex(32)
    WTF_CSRF_SECRET_KEY = os.environ.get('CSRF_SECRET_KEY') or secrets.token_hex(32)
    
    # Database Configuration
    DATABASE_URL = os.environ.get('DATABASE_URL') or os.environ.get('SUPABASE_DATABASE_URL')
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'pool_timeout': 20,
        'max_overflow': 0
    }
    
    # Security Headers
    SECURITY_HEADERS = {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Content-Security-Policy': (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' "
            "https://cdn.jsdelivr.net https://cdnjs.cloudflare.com "
            "https://fonts.googleapis.com; "
            "style-src 'self' 'unsafe-inline' "
            "https://cdn.jsdelivr.net https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://api.groq.com https://api-inference.huggingface.co;"
        )
    }
    
    # Session Configuration
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    
    # OAuth Configuration (Production URLs)
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
    
    # Supabase Configuration
    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    SUPABASE_KEY = os.environ.get('SUPABASE_ANON_KEY')
    SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    
    # AI API Configuration
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
    HUGGINGFACE_API_KEY = os.environ.get('HUGGINGFACE_API_KEY')
    
    # Rate Limiting
    RATELIMIT_STORAGE_URL = os.environ.get('REDIS_URL', 'memory://')
    RATELIMIT_DEFAULT = "100 per hour"
    RATELIMIT_HEADERS_ENABLED = True
    
    # AI Rate Limits (per user)
    AI_RATE_LIMITS = {
        'groq': '50 per hour',
        'huggingface': '20 per hour',
        'ollama': '30 per hour',
        'fallback': '100 per hour'
    }
    
    # Caching Configuration
    CACHE_TYPE = 'redis' if os.environ.get('REDIS_URL') else 'simple'
    CACHE_REDIS_URL = os.environ.get('REDIS_URL')
    CACHE_DEFAULT_TIMEOUT = 300  # 5 minutes
    
    # Email Configuration (for password reset)
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')
    
    # File Upload Configuration
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'ipynb'}
    
    # Logging Configuration
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_TO_STDOUT = True
    
    # Performance Settings
    SEND_FILE_MAX_AGE_DEFAULT = timedelta(hours=12)
    TEMPLATES_AUTO_RELOAD = False
    EXPLAIN_TEMPLATE_LOADING = False
    
    # Production Flags
    DEBUG = False
    TESTING = False
    ENV = 'production'
    
    # Analytics and Monitoring
    GOOGLE_ANALYTICS_ID = os.environ.get('GOOGLE_ANALYTICS_ID')
    SENTRY_DSN = os.environ.get('SENTRY_DSN')
    
    @staticmethod
    def init_app(app):
        """Initialize production-specific app configuration"""
        
        # Security headers middleware
        @app.after_request
        def set_security_headers(response):
            for header, value in ProductionConfig.SECURITY_HEADERS.items():
                response.headers[header] = value
            return response
        
        # Error handling for production
        @app.errorhandler(500)
        def internal_error(error):
            return render_template('errors/500.html'), 500
        
        @app.errorhandler(404)
        def not_found_error(error):
            return render_template('errors/404.html'), 404
        
        @app.errorhandler(403)
        def forbidden_error(error):
            return render_template('errors/403.html'), 403
        
        # Health check endpoint
        @app.route('/health')
        def health_check():
            return {'status': 'healthy', 'version': '1.0.0'}, 200

class DevelopmentConfig:
    """Development configuration for local testing"""
    
    SECRET_KEY = 'dev-secret-key-change-in-production'
    DEBUG = True
    TESTING = False
    
    # Local database
    SQLALCHEMY_DATABASE_URI = 'sqlite:///visual_llm_dev.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # No security headers in development
    SESSION_COOKIE_SECURE = False
    
    # Local AI configuration
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
    HUGGINGFACE_API_KEY = os.environ.get('HUGGINGFACE_API_KEY')
    
    # Relaxed rate limits for development
    RATELIMIT_STORAGE_URL = 'memory://'
    RATELIMIT_DEFAULT = "1000 per hour"
    
    # Simple caching for development
    CACHE_TYPE = 'simple'
    CACHE_DEFAULT_TIMEOUT = 60

class TestingConfig:
    """Testing configuration for automated tests"""
    
    SECRET_KEY = 'testing-secret-key'
    TESTING = True
    DEBUG = True
    
    # In-memory database for testing
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Disable CSRF for testing
    WTF_CSRF_ENABLED = False
    
    # No rate limiting in tests
    RATELIMIT_ENABLED = False

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Get configuration based on environment"""
    env = os.environ.get('FLASK_ENV', 'development')
    return config.get(env, config['default'])

# Environment validation for production
def validate_production_env():
    """Validate required environment variables for production"""
    required_vars = [
        'SECRET_KEY',
        'DATABASE_URL',
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.environ.get(var):
            missing_vars.append(var)
    
    if missing_vars:
        raise EnvironmentError(
            f"Missing required environment variables: {', '.join(missing_vars)}"
        )
    
    return True

# Production deployment checklist
PRODUCTION_CHECKLIST = """
🚀 PRODUCTION DEPLOYMENT CHECKLIST

Required Environment Variables:
□ SECRET_KEY - Flask secret key
□ CSRF_SECRET_KEY - CSRF protection key
□ DATABASE_URL - Production database URL
□ SUPABASE_URL - Supabase project URL
□ SUPABASE_ANON_KEY - Supabase anonymous key
□ SUPABASE_SERVICE_ROLE_KEY - Supabase service key

Optional but Recommended:
□ GROQ_API_KEY - For enhanced AI performance
□ HUGGINGFACE_API_KEY - For educational AI content
□ GITHUB_CLIENT_ID & GITHUB_CLIENT_SECRET - GitHub OAuth
□ GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET - Google OAuth
□ REDIS_URL - For caching and rate limiting
□ MAIL_USERNAME & MAIL_PASSWORD - For email features
□ GOOGLE_ANALYTICS_ID - For analytics
□ SENTRY_DSN - For error monitoring

Security Checklist:
□ DEBUG = False
□ Strong SECRET_KEY set
□ HTTPS enabled
□ Security headers configured
□ Rate limiting enabled
□ Input validation implemented
□ SQL injection protection active

Performance Checklist:
□ Database connection pooling
□ Redis caching configured
□ Static file compression
□ CDN for static assets
□ AI response caching
□ Proper error handling
"""

if __name__ == "__main__":
    # Validate production environment
    try:
        if os.environ.get('FLASK_ENV') == 'production':
            validate_production_env()
            print("✅ Production environment validation passed")
        else:
            print("ℹ️ Running in development mode")
        
        print(PRODUCTION_CHECKLIST)
        
    except EnvironmentError as e:
        print(f"❌ Production environment validation failed: {e}")
        exit(1)
