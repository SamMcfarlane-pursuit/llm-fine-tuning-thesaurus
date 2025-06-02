"""
Configuration settings for the application.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration."""

    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-please-change-in-production')
    DEBUG = False
    TESTING = False
    SESSION_TYPE = 'redis'
    SESSION_PERMANENT = True
    SESSION_USE_SIGNER = True
    SESSION_REDIS = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

    # SQLAlchemy settings
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # OAuth settings
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')

    GITHUB_CLIENT_ID = os.environ.get('GITHUB_CLIENT_ID')
    GITHUB_CLIENT_SECRET = os.environ.get('GITHUB_CLIENT_SECRET')

    FACEBOOK_CLIENT_ID = os.environ.get('FACEBOOK_CLIENT_ID')
    FACEBOOK_CLIENT_SECRET = os.environ.get('FACEBOOK_CLIENT_SECRET')

    # OAuth scopes
    GOOGLE_OAUTH_SCOPES = ['openid', 'email', 'profile']
    GITHUB_OAUTH_SCOPES = ['user:email', 'read:user']
    FACEBOOK_OAUTH_SCOPES = ['email', 'public_profile']

    # Application settings
    APP_NAME = 'Thesaurus LLM Fine-Tuning'
    ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
    APP_URL = os.environ.get('APP_URL', 'http://localhost:5000')

    # File upload settings
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB

    # Supabase settings
    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

    # Analytics settings
    ANALYTICS_ENABLED = True

    # Cache settings
    CACHE_TYPE = 'redis'
    CACHE_REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/1')
    CACHE_DEFAULT_TIMEOUT = 300

    # Security settings
    WTF_CSRF_ENABLED = True
    SECURITY_PASSWORD_SALT = os.environ.get('SECURITY_PASSWORD_SALT', 'thesaurus-llm-salt-2023')

    # Mail settings
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@thesaurus-llm.com')

    # Subscription plans
    SUBSCRIPTION_PLANS = {
        'free': {
            'name': 'Free',
            'price': 0,
            'features': ['Basic tutorials', 'Limited thesaurus search', 'Community support']
        },
        'basic': {
            'name': 'Basic',
            'price': 9.99,
            'features': ['All tutorials', 'Full thesaurus access', 'Basic exercises', 'Email support']
        },
        'premium': {
            'name': 'Premium',
            'price': 19.99,
            'features': ['All tutorials', 'Full thesaurus access', 'All exercises', 'Priority support', 'Advanced analytics']
        },
        'enterprise': {
            'name': 'Enterprise',
            'price': 49.99,
            'features': ['All features', 'Custom tutorials', 'Team management', 'Dedicated support', 'API access']
        }
    }

    @staticmethod
    def init_app(app):
        """Initialize application with this configuration."""
        pass


class DevelopmentConfig(Config):
    """Development configuration."""

    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL', 'sqlite:///dev-app.db')

    # Use filesystem sessions for development (no Redis required)
    SESSION_TYPE = 'filesystem'
    SESSION_PERMANENT = True
    SESSION_USE_SIGNER = True


class TestingConfig(Config):
    """Testing configuration."""

    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('TEST_DATABASE_URL', 'sqlite:///:memory:')
    WTF_CSRF_ENABLED = False


class ProductionConfig(Config):
    """Production configuration."""

    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///app.db')

    # Security settings for production
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

    # Content Security Policy
    CONTENT_SECURITY_POLICY = {
        'default-src': "'self'",
        'script-src': "'self' 'unsafe-inline' https://cdn.jsdelivr.net https://code.jquery.com https://cdnjs.cloudflare.com",
        'style-src': "'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
        'font-src': "'self' https://cdn.jsdelivr.net https://fonts.gstatic.com",
        'img-src': "'self' data: https: blob:",
        'connect-src': "'self' https://api.supabase.io",
        'frame-src': "'self' https://colab.research.google.com",
    }

    @classmethod
    def init_app(cls, app):
        """Initialize application with this configuration."""
        Config.init_app(app)

        # Log to stderr in production
        import logging
        from logging import StreamHandler
        file_handler = StreamHandler()
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)

        # Production-specific middleware
        @app.after_request
        def add_security_headers(response):
            # Add security headers
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
            response.headers['X-Content-Type-Options'] = 'nosniff'
            response.headers['X-Frame-Options'] = 'SAMEORIGIN'
            response.headers['X-XSS-Protection'] = '1; mode=block'

            # Add Content Security Policy
            csp_directives = []
            for directive, value in cls.CONTENT_SECURITY_POLICY.items():
                csp_directives.append(f"{directive} {value}")

            response.headers['Content-Security-Policy'] = '; '.join(csp_directives)

            return response


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
