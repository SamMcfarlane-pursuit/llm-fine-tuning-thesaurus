#!/usr/bin/env python3
"""
Robust Authentication System with Industry-Standard Security Practices
Implements secure password storage, session management, CSRF protection, XSS prevention,
SQL injection protection, multi-factor authentication, and rate limiting.
"""

import os
import secrets
import hashlib
import hmac
import time
import pyotp
import qrcode
import io
import base64
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, List, Tuple
from functools import wraps
from flask import Flask, request, jsonify, session, g, current_app, flash, redirect, url_for
from flask_login import UserMixin, login_user, logout_user, current_user, login_required
from flask_wtf.csrf import CSRFProtect, validate_csrf
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
import bcrypt
import redis
import logging
from dataclasses import dataclass
from enum import Enum
import ipaddress
from urllib.parse import urlparse
import re
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from sqlalchemy import text
from markupsafe import escape
from bleach import clean, ALLOWED_TAGS, ALLOWED_ATTRIBUTES

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SecurityLevel(Enum):
    """Security risk levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class SecurityEvent:
    """Security event data structure."""
    event_type: str
    user_id: Optional[int]
    ip_address: str
    user_agent: str
    timestamp: datetime
    details: Dict[str, Any]
    risk_level: SecurityLevel

class SecurePasswordManager:
    """Secure password management with bcrypt."""
    
    def __init__(self, rounds: int = 12):
        """Initialize with bcrypt rounds (default 12 for good security/performance balance)."""
        self.rounds = rounds
        
    def hash_password(self, password: str) -> str:
        """Hash password with bcrypt and salt."""
        if not password:
            raise ValueError("Password cannot be empty")
            
        # Generate salt and hash password
        salt = bcrypt.gensalt(rounds=self.rounds)
        password_hash = bcrypt.hashpw(password.encode('utf-8'), salt)
        return password_hash.decode('utf-8')
    
    def verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash."""
        if not password or not password_hash:
            return False
            
        try:
            return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return False
    
    def is_password_strong(self, password: str) -> Tuple[bool, List[str]]:
        """Check password strength and return issues."""
        issues = []
        
        if len(password) < 8:
            issues.append("Password must be at least 8 characters long")
        if len(password) > 128:
            issues.append("Password must be less than 128 characters")
        if not re.search(r'[a-z]', password):
            issues.append("Password must contain at least one lowercase letter")
        if not re.search(r'[A-Z]', password):
            issues.append("Password must contain at least one uppercase letter")
        if not re.search(r'\d', password):
            issues.append("Password must contain at least one digit")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            issues.append("Password must contain at least one special character")
        
        # Check for common patterns
        common_patterns = ['123456', 'password', 'qwerty', 'abc123']
        if any(pattern in password.lower() for pattern in common_patterns):
            issues.append("Password contains common patterns")
            
        return len(issues) == 0, issues

class SecureSessionManager:
    """Secure session management with proper expiration and security headers."""
    
    def __init__(self, app: Flask = None):
        self.app = app
        if app:
            self.init_app(app)
    
    def init_app(self, app: Flask):
        """Initialize secure session configuration."""
        # Generate secure secret key if not provided
        if not app.config.get('SECRET_KEY'):
            app.config['SECRET_KEY'] = secrets.token_urlsafe(32)
            logger.warning("Generated new SECRET_KEY. Set SECRET_KEY in production!")
        
        # Session configuration
        app.config.update({
            'SESSION_COOKIE_SECURE': True,  # HTTPS only
            'SESSION_COOKIE_HTTPONLY': True,  # No JavaScript access
            'SESSION_COOKIE_SAMESITE': 'Lax',  # CSRF protection
            'PERMANENT_SESSION_LIFETIME': timedelta(hours=24),  # 24 hour sessions
            'SESSION_REFRESH_EACH_REQUEST': True,  # Refresh session on activity
        })
        
        # Add session security headers
        @app.after_request
        def add_security_headers(response):
            response.headers['X-Content-Type-Options'] = 'nosniff'
            response.headers['X-Frame-Options'] = 'DENY'
            response.headers['X-XSS-Protection'] = '1; mode=block'
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
            return response
    
    def create_session(self, user_id: int, remember_me: bool = False) -> str:
        """Create secure session for user."""
        session_id = secrets.token_urlsafe(32)
        session['user_id'] = user_id
        session['session_id'] = session_id
        session['created_at'] = datetime.now(timezone.utc).isoformat()
        session['ip_address'] = request.remote_addr
        session['user_agent_hash'] = hashlib.sha256(
            request.headers.get('User-Agent', '').encode()
        ).hexdigest()
        
        if remember_me:
            session.permanent = True
        
        return session_id
    
    def validate_session(self) -> bool:
        """Validate current session security."""
        if 'user_id' not in session:
            return False
        
        # Check session age
        if 'created_at' in session:
            created_at = datetime.fromisoformat(session['created_at'])
            if datetime.now(timezone.utc) - created_at > timedelta(hours=24):
                self.destroy_session()
                return False
        
        # Check IP address (optional - can be disabled for mobile users)
        if session.get('ip_address') != request.remote_addr:
            logger.warning(f"Session IP mismatch for user {session.get('user_id')}")
            # Don't automatically destroy - log for monitoring
        
        # Check User-Agent hash
        current_ua_hash = hashlib.sha256(
            request.headers.get('User-Agent', '').encode()
        ).hexdigest()
        if session.get('user_agent_hash') != current_ua_hash:
            logger.warning(f"Session User-Agent mismatch for user {session.get('user_id')}")
            # Don't automatically destroy - log for monitoring
        
        return True
    
    def destroy_session(self):
        """Securely destroy session."""
        session.clear()

class MultiFactorAuth:
    """Multi-factor authentication with TOTP support."""
    
    def __init__(self, app_name: str = "Thesaurus AI"):
        self.app_name = app_name
    
    def generate_secret(self) -> str:
        """Generate TOTP secret for user."""
        return pyotp.random_base32()
    
    def generate_qr_code(self, user_email: str, secret: str) -> str:
        """Generate QR code for TOTP setup."""
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user_email,
            issuer_name=self.app_name
        )
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        return base64.b64encode(img_buffer.getvalue()).decode()
    
    def verify_totp(self, secret: str, token: str) -> bool:
        """Verify TOTP token."""
        if not secret or not token:
            return False
        
        try:
            totp = pyotp.TOTP(secret)
            return totp.verify(token, valid_window=1)  # Allow 1 window tolerance
        except Exception as e:
            logger.error(f"TOTP verification error: {e}")
            return False
    
    def generate_backup_codes(self, count: int = 10) -> List[str]:
        """Generate backup codes for MFA."""
        return [secrets.token_hex(4).upper() for _ in range(count)]

class InputSanitizer:
    """Input sanitization for XSS protection."""
    
    @staticmethod
    def sanitize_html(content: str) -> str:
        """Sanitize HTML content."""
        if not content:
            return ""
        
        # Define allowed tags and attributes
        allowed_tags = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a']
        allowed_attributes = {'a': ['href', 'title']}
        
        return clean(content, tags=allowed_tags, attributes=allowed_attributes, strip=True)
    
    @staticmethod
    def sanitize_text(content: str) -> str:
        """Sanitize plain text content."""
        if not content:
            return ""
        
        # Escape HTML entities
        return escape(content)
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format."""
        if not email:
            return False
        
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_username(username: str) -> bool:
        """Validate username format."""
        if not username:
            return False
        
        # Allow alphanumeric, underscore, hyphen
        pattern = r'^[a-zA-Z0-9_-]{3,64}$'
        return re.match(pattern, username) is not None

class SQLInjectionProtection:
    """SQL injection protection utilities."""
    
    @staticmethod
    def execute_safe_query(db_session, query: str, params: Dict[str, Any]):
        """Execute parameterized query safely."""
        try:
            return db_session.execute(text(query), params)
        except Exception as e:
            logger.error(f"Database query error: {e}")
            raise
    
    @staticmethod
    def validate_sql_params(params: Dict[str, Any]) -> bool:
        """Validate SQL parameters for suspicious content."""
        suspicious_patterns = [
            r'(union|select|insert|update|delete|drop|create|alter)\s',
            r'[\'";]',
            r'--',
            r'/\*.*\*/'
        ]
        
        for value in params.values():
            if isinstance(value, str):
                for pattern in suspicious_patterns:
                    if re.search(pattern, value.lower()):
                        logger.warning(f"Suspicious SQL parameter detected: {value}")
                        return False
        
        return True

class AuthenticationRateLimiter:
    """Rate limiting for authentication attempts."""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client or redis.Redis(host='localhost', port=6379, db=0)
    
    def is_rate_limited(self, identifier: str, max_attempts: int = 5, window_minutes: int = 15) -> bool:
        """Check if identifier is rate limited."""
        key = f"auth_attempts:{identifier}"
        
        try:
            current_attempts = self.redis_client.get(key)
            if current_attempts and int(current_attempts) >= max_attempts:
                return True
            return False
        except Exception as e:
            logger.error(f"Rate limiting check error: {e}")
            return False  # Fail open for availability
    
    def record_attempt(self, identifier: str, window_minutes: int = 15):
        """Record authentication attempt."""
        key = f"auth_attempts:{identifier}"
        
        try:
            pipe = self.redis_client.pipeline()
            pipe.incr(key)
            pipe.expire(key, window_minutes * 60)
            pipe.execute()
        except Exception as e:
            logger.error(f"Rate limiting record error: {e}")
    
    def reset_attempts(self, identifier: str):
        """Reset authentication attempts for identifier."""
        key = f"auth_attempts:{identifier}"
        
        try:
            self.redis_client.delete(key)
        except Exception as e:
            logger.error(f"Rate limiting reset error: {e}")

class SecureAuthSystem:
    """Main secure authentication system."""
    
    def __init__(self, app: Flask = None):
        self.password_manager = SecurePasswordManager()
        self.session_manager = SecureSessionManager()
        self.mfa = MultiFactorAuth()
        self.sanitizer = InputSanitizer()
        self.sql_protection = SQLInjectionProtection()
        self.rate_limiter = AuthenticationRateLimiter()
        
        if app:
            self.init_app(app)
    
    def init_app(self, app: Flask):
        """Initialize secure authentication system."""
        # Initialize session manager
        self.session_manager.init_app(app)
        
        # Initialize CSRF protection
        csrf = CSRFProtect(app)
        
        # Initialize rate limiting
        limiter = Limiter(
            app,
            key_func=get_remote_address,
            default_limits=["200 per day", "50 per hour"]
        )
        
        # Initialize Talisman for security headers
        Talisman(app, force_https=False)  # Set to True in production
        
        # Store instances in app
        app.secure_auth = self
        app.csrf = csrf
        app.limiter = limiter
    
    def authenticate_user(self, email: str, password: str, totp_token: str = None) -> Dict[str, Any]:
        """Authenticate user with email, password, and optional TOTP."""
        # Rate limiting check
        if self.rate_limiter.is_rate_limited(email):
            return {
                'success': False,
                'error': 'Too many login attempts. Please try again later.',
                'rate_limited': True
            }
        
        # Record attempt
        self.rate_limiter.record_attempt(email)
        
        # Sanitize inputs
        email = self.sanitizer.sanitize_text(email)
        
        # Validate email format
        if not self.sanitizer.validate_email(email):
            return {
                'success': False,
                'error': 'Invalid email format'
            }
        
        try:
            # Import here to avoid circular imports
            from models import User
            
            # Find user
            user = User.query.filter_by(email=email).first()
            
            if not user:
                return {
                    'success': False,
                    'error': 'Invalid email or password'
                }
            
            # Verify password
            if not self.password_manager.verify_password(password, user.password_hash):
                return {
                    'success': False,
                    'error': 'Invalid email or password'
                }
            
            # Check if MFA is enabled
            if hasattr(user, 'mfa_secret') and user.mfa_secret:
                if not totp_token:
                    return {
                        'success': False,
                        'error': 'TOTP token required',
                        'mfa_required': True
                    }
                
                if not self.mfa.verify_totp(user.mfa_secret, totp_token):
                    return {
                        'success': False,
                        'error': 'Invalid TOTP token'
                    }
            
            # Reset rate limiting on successful login
            self.rate_limiter.reset_attempts(email)
            
            # Create session
            session_id = self.session_manager.create_session(user.id)
            
            # Update last login
            user.update_last_login()
            
            return {
                'success': True,
                'user': user,
                'session_id': session_id
            }
            
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            return {
                'success': False,
                'error': 'Authentication failed'
            }
    
    def register_user(self, username: str, email: str, password: str, name: str = None) -> Dict[str, Any]:
        """Register new user with secure password storage."""
        # Sanitize inputs
        username = self.sanitizer.sanitize_text(username)
        email = self.sanitizer.sanitize_text(email)
        name = self.sanitizer.sanitize_text(name) if name else None
        
        # Validate inputs
        if not self.sanitizer.validate_username(username):
            return {
                'success': False,
                'error': 'Invalid username format'
            }
        
        if not self.sanitizer.validate_email(email):
            return {
                'success': False,
                'error': 'Invalid email format'
            }
        
        # Check password strength
        is_strong, issues = self.password_manager.is_password_strong(password)
        if not is_strong:
            return {
                'success': False,
                'error': 'Password does not meet requirements',
                'password_issues': issues
            }
        
        try:
            from models import User
            from extensions import db
            
            # Check if user already exists
            if User.query.filter_by(email=email).first():
                return {
                    'success': False,
                    'error': 'Email already registered'
                }
            
            if User.query.filter_by(username=username).first():
                return {
                    'success': False,
                    'error': 'Username already taken'
                }
            
            # Hash password
            password_hash = self.password_manager.hash_password(password)
            
            # Create user
            user = User(
                username=username,
                email=email,
                password_hash=password_hash,
                name=name,
                created_at=datetime.now(timezone.utc)
            )
            
            db.session.add(user)
            db.session.commit()
            
            return {
                'success': True,
                'user': user
            }
            
        except Exception as e:
            logger.error(f"Registration error: {e}")
            return {
                'success': False,
                'error': 'Registration failed'
            }
    
    def setup_mfa(self, user_id: int) -> Dict[str, Any]:
        """Setup MFA for user."""
        try:
            from models import User
            from extensions import db
            
            user = User.query.get(user_id)
            if not user:
                return {
                    'success': False,
                    'error': 'User not found'
                }
            
            # Generate MFA secret
            secret = self.mfa.generate_secret()
            qr_code = self.mfa.generate_qr_code(user.email, secret)
            backup_codes = self.mfa.generate_backup_codes()
            
            # Store secret (you'll need to add mfa_secret field to User model)
            user.mfa_secret = secret
            user.mfa_backup_codes = ','.join(backup_codes)  # Store as comma-separated string
            db.session.commit()
            
            return {
                'success': True,
                'qr_code': qr_code,
                'backup_codes': backup_codes,
                'secret': secret
            }
            
        except Exception as e:
            logger.error(f"MFA setup error: {e}")
            return {
                'success': False,
                'error': 'MFA setup failed'
            }

# Decorators for authentication and authorization
def require_auth(f):
    """Decorator to require authentication."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return redirect(url_for('auth.login'))
        
        # Validate session
        if hasattr(current_app, 'secure_auth'):
            if not current_app.secure_auth.session_manager.validate_session():
                logout_user()
                flash('Session expired. Please log in again.', 'warning')
                return redirect(url_for('auth.login'))
        
        return f(*args, **kwargs)
    return decorated_function

def require_mfa(f):
    """Decorator to require MFA verification."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return redirect(url_for('auth.login'))
        
        # Check if MFA is required and verified
        if hasattr(current_user, 'mfa_secret') and current_user.mfa_secret:
            if not session.get('mfa_verified'):
                return redirect(url_for('auth.verify_mfa'))
        
        return f(*args, **kwargs)
    return decorated_function

def rate_limit_auth(max_attempts: int = 5, window_minutes: int = 15):
    """Decorator for rate limiting authentication endpoints."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if hasattr(current_app, 'secure_auth'):
                identifier = request.remote_addr
                if current_app.secure_auth.rate_limiter.is_rate_limited(
                    identifier, max_attempts, window_minutes
                ):
                    return jsonify({
                        'error': 'Too many attempts. Please try again later.'
                    }), 429
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator