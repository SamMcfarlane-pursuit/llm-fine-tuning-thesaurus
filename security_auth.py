#!/usr/bin/env python3
"""
Enhanced Security Authentication System for Thesaurus AI LLM
Provides secure session management, password hashing, and user data protection.
"""

import os
import jwt
import bcrypt
import secrets
import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, List, Tuple
from functools import wraps
from flask import Flask, request, jsonify, session, g, current_app
from flask_login import UserMixin, login_user, logout_user, current_user
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
import base64

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SecurityLevel(Enum):
    """Security levels for different operations."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AuthenticationError(Exception):
    """Custom exception for authentication errors."""
    def __init__(self, message: str, code: str = None, details: Dict = None):
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(message)

@dataclass
class SecurityEvent:
    """Represents a security event for logging and monitoring."""
    event_type: str
    user_id: Optional[int]
    ip_address: str
    user_agent: str
    timestamp: datetime
    details: Dict[str, Any]
    risk_level: SecurityLevel

class PasswordManager:
    """
    Secure password management with bcrypt hashing and validation.
    """
    
    def __init__(self, rounds: int = 12):
        self.rounds = rounds
        self.min_length = 8
        self.max_length = 128
        
        # Password complexity requirements
        self.require_uppercase = True
        self.require_lowercase = True
        self.require_digits = True
        self.require_special = True
        self.special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
        
        # Common passwords to reject
        self.common_passwords = {
            'password', '123456', '123456789', 'qwerty', 'abc123',
            'password123', 'admin', 'letmein', 'welcome', 'monkey'
        }
    
    def validate_password_strength(self, password: str) -> Tuple[bool, List[str]]:
        """Validate password strength and return issues."""
        issues = []
        
        if len(password) < self.min_length:
            issues.append(f"Password must be at least {self.min_length} characters long")
        
        if len(password) > self.max_length:
            issues.append(f"Password must be at most {self.max_length} characters long")
        
        if self.require_uppercase and not re.search(r'[A-Z]', password):
            issues.append("Password must contain at least one uppercase letter")
        
        if self.require_lowercase and not re.search(r'[a-z]', password):
            issues.append("Password must contain at least one lowercase letter")
        
        if self.require_digits and not re.search(r'\d', password):
            issues.append("Password must contain at least one digit")
        
        if self.require_special and not any(char in self.special_chars for char in password):
            issues.append(f"Password must contain at least one special character: {self.special_chars}")
        
        if password.lower() in self.common_passwords:
            issues.append("Password is too common, please choose a more secure password")
        
        # Check for repeated characters
        if len(set(password)) < len(password) * 0.5:
            issues.append("Password contains too many repeated characters")
        
        return len(issues) == 0, issues
    
    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt."""
        is_valid, issues = self.validate_password_strength(password)
        if not is_valid:
            raise AuthenticationError(f"Password validation failed: {'; '.join(issues)}")
        
        # Generate salt and hash
        salt = bcrypt.gensalt(rounds=self.rounds)
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify a password against its hash."""
        try:
            return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return False
    
    def generate_secure_password(self, length: int = 16) -> str:
        """Generate a cryptographically secure password."""
        if length < self.min_length:
            length = self.min_length
        
        # Ensure we have at least one character from each required category
        password_chars = []
        
        if self.require_uppercase:
            password_chars.append(secrets.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ'))
        
        if self.require_lowercase:
            password_chars.append(secrets.choice('abcdefghijklmnopqrstuvwxyz'))
        
        if self.require_digits:
            password_chars.append(secrets.choice('0123456789'))
        
        if self.require_special:
            password_chars.append(secrets.choice(self.special_chars))
        
        # Fill the rest with random characters
        all_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' + self.special_chars
        for _ in range(length - len(password_chars)):
            password_chars.append(secrets.choice(all_chars))
        
        # Shuffle the password
        secrets.SystemRandom().shuffle(password_chars)
        return ''.join(password_chars)

class SessionManager:
    """
    Secure session management with Redis backend and encryption.
    """
    
    def __init__(self, app: Flask = None):
        self.app = app
        self.redis_client = None
        self.encryption_key = None
        self.session_timeout = 3600  # 1 hour default
        self.max_sessions_per_user = 5
        
        if app:
            self.init_app(app)
    
    def init_app(self, app: Flask):
        """Initialize session manager with Flask app."""
        self.app = app
        
        # Initialize Redis connection
        try:
            redis_url = app.config.get('REDIS_URL', 'redis://localhost:6379/0')
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            self.redis_client.ping()
            logger.info("Connected to Redis for session management")
        except Exception as e:
            logger.warning(f"Redis not available for sessions: {e}")
            self.redis_client = None
        
        # Initialize encryption
        secret_key = app.config.get('SECRET_KEY', 'dev-key-change-in-production')
        self.encryption_key = self._derive_encryption_key(secret_key)
        
        # Session configuration
        self.session_timeout = app.config.get('SESSION_TIMEOUT', 3600)
        self.max_sessions_per_user = app.config.get('MAX_SESSIONS_PER_USER', 5)
    
    def _derive_encryption_key(self, secret_key: str) -> Fernet:
        """Derive encryption key from secret key."""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b'session_salt_2023',
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(secret_key.encode()))
        return Fernet(key)
    
    def _encrypt_data(self, data: str) -> str:
        """Encrypt session data."""
        return self.encryption_key.encrypt(data.encode()).decode()
    
    def _decrypt_data(self, encrypted_data: str) -> str:
        """Decrypt session data."""
        return self.encryption_key.decrypt(encrypted_data.encode()).decode()
    
    def create_session(self, user_id: int, user_data: Dict[str, Any]) -> str:
        """Create a new secure session."""
        session_id = secrets.token_urlsafe(32)
        
        # Prepare session data
        session_data = {
            'user_id': user_id,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'last_activity': datetime.now(timezone.utc).isoformat(),
            'ip_address': request.remote_addr,
            'user_agent': request.headers.get('User-Agent', ''),
            'user_data': user_data
        }
        
        try:
            if self.redis_client:
                # Store encrypted session data
                encrypted_data = self._encrypt_data(str(session_data))
                self.redis_client.setex(
                    f"session:{session_id}",
                    self.session_timeout,
                    encrypted_data
                )
                
                # Track user sessions
                user_sessions_key = f"user_sessions:{user_id}"
                self.redis_client.sadd(user_sessions_key, session_id)
                self.redis_client.expire(user_sessions_key, self.session_timeout)
                
                # Limit concurrent sessions
                self._enforce_session_limit(user_id)
                
            else:
                # Fallback to Flask session
                session['session_data'] = session_data
            
            logger.info(f"Created session for user {user_id}: {session_id}")
            return session_id
            
        except Exception as e:
            logger.error(f"Session creation error: {e}")
            raise AuthenticationError("Failed to create session")
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve session data."""
        try:
            if self.redis_client:
                encrypted_data = self.redis_client.get(f"session:{session_id}")
                if encrypted_data:
                    session_data = eval(self._decrypt_data(encrypted_data))
                    
                    # Update last activity
                    session_data['last_activity'] = datetime.now(timezone.utc).isoformat()
                    updated_encrypted = self._encrypt_data(str(session_data))
                    self.redis_client.setex(
                        f"session:{session_id}",
                        self.session_timeout,
                        updated_encrypted
                    )
                    
                    return session_data
            else:
                return session.get('session_data')
            
            return None
            
        except Exception as e:
            logger.error(f"Session retrieval error: {e}")
            return None
    
    def destroy_session(self, session_id: str) -> bool:
        """Destroy a session."""
        try:
            if self.redis_client:
                # Get session data to find user_id
                session_data = self.get_session(session_id)
                if session_data:
                    user_id = session_data.get('user_id')
                    if user_id:
                        self.redis_client.srem(f"user_sessions:{user_id}", session_id)
                
                # Delete session
                self.redis_client.delete(f"session:{session_id}")
            else:
                session.clear()
            
            logger.info(f"Destroyed session: {session_id}")
            return True
            
        except Exception as e:
            logger.error(f"Session destruction error: {e}")
            return False
    
    def _enforce_session_limit(self, user_id: int):
        """Enforce maximum sessions per user."""
        if not self.redis_client:
            return
        
        user_sessions_key = f"user_sessions:{user_id}"
        sessions = self.redis_client.smembers(user_sessions_key)
        
        if len(sessions) > self.max_sessions_per_user:
            # Remove oldest sessions
            sessions_to_remove = len(sessions) - self.max_sessions_per_user
            for session_id in list(sessions)[:sessions_to_remove]:
                self.destroy_session(session_id)

class SecurityMonitor:
    """
    Security monitoring and threat detection system.
    """
    
    def __init__(self, app: Flask = None):
        self.app = app
        self.redis_client = None
        self.security_events = []
        self.threat_thresholds = {
            'failed_logins': {'count': 5, 'window': 300},  # 5 failures in 5 minutes
            'suspicious_requests': {'count': 20, 'window': 60},  # 20 requests in 1 minute
            'invalid_tokens': {'count': 3, 'window': 300},  # 3 invalid tokens in 5 minutes
        }
        
        if app:
            self.init_app(app)
    
    def init_app(self, app: Flask):
        """Initialize security monitor with Flask app."""
        self.app = app
        
        try:
            redis_url = app.config.get('REDIS_URL', 'redis://localhost:6379/0')
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            self.redis_client.ping()
            logger.info("Connected to Redis for security monitoring")
        except Exception as e:
            logger.warning(f"Redis not available for security monitoring: {e}")
            self.redis_client = None
    
    def log_security_event(self, event: SecurityEvent):
        """Log a security event."""
        try:
            # Store in memory
            self.security_events.append(event)
            
            # Store in Redis if available
            if self.redis_client:
                event_key = f"security_event:{event.timestamp.isoformat()}:{secrets.token_hex(8)}"
                event_data = {
                    'type': event.event_type,
                    'user_id': event.user_id,
                    'ip_address': event.ip_address,
                    'user_agent': event.user_agent,
                    'timestamp': event.timestamp.isoformat(),
                    'details': str(event.details),
                    'risk_level': event.risk_level.value
                }
                self.redis_client.hmset(event_key, event_data)
                self.redis_client.expire(event_key, 86400)  # Keep for 24 hours
            
            # Check for threats
            self._check_threats(event)
            
            logger.info(f"Security event logged: {event.event_type} from {event.ip_address}")
            
        except Exception as e:
            logger.error(f"Security event logging error: {e}")
    
    def _check_threats(self, event: SecurityEvent):
        """Check for security threats based on event patterns."""
        if not self.redis_client:
            return
        
        ip_address = event.ip_address
        current_time = event.timestamp.timestamp()
        
        # Check failed login attempts
        if event.event_type == 'failed_login':
            key = f"failed_logins:{ip_address}"
            threshold = self.threat_thresholds['failed_logins']
            
            # Count recent failures
            self.redis_client.zadd(key, {str(current_time): current_time})
            self.redis_client.zremrangebyscore(key, 0, current_time - threshold['window'])
            
            failure_count = self.redis_client.zcard(key)
            if failure_count >= threshold['count']:
                self._handle_threat('brute_force_attack', ip_address, {
                    'failure_count': failure_count,
                    'window': threshold['window']
                })
        
        # Check suspicious request patterns
        elif event.event_type in ['invalid_request', 'suspicious_activity']:
            key = f"suspicious_requests:{ip_address}"
            threshold = self.threat_thresholds['suspicious_requests']
            
            self.redis_client.zadd(key, {str(current_time): current_time})
            self.redis_client.zremrangebyscore(key, 0, current_time - threshold['window'])
            
            request_count = self.redis_client.zcard(key)
            if request_count >= threshold['count']:
                self._handle_threat('suspicious_activity', ip_address, {
                    'request_count': request_count,
                    'window': threshold['window']
                })
    
    def _handle_threat(self, threat_type: str, ip_address: str, details: Dict):
        """Handle detected security threats."""
        logger.warning(f"Security threat detected: {threat_type} from {ip_address}")
        
        # Block IP temporarily
        if self.redis_client:
            block_key = f"blocked_ip:{ip_address}"
            self.redis_client.setex(block_key, 3600, threat_type)  # Block for 1 hour
        
        # Log threat event
        threat_event = SecurityEvent(
            event_type=f"threat_{threat_type}",
            user_id=None,
            ip_address=ip_address,
            user_agent="",
            timestamp=datetime.now(timezone.utc),
            details=details,
            risk_level=SecurityLevel.HIGH
        )
        self.log_security_event(threat_event)
    
    def is_ip_blocked(self, ip_address: str) -> bool:
        """Check if an IP address is blocked."""
        if not self.redis_client:
            return False
        
        return self.redis_client.exists(f"blocked_ip:{ip_address}")

class EnhancedAuthenticator:
    """
    Main authentication system with enhanced security features.
    """
    
    def __init__(self, app: Flask = None):
        self.app = app
        self.password_manager = PasswordManager()
        self.session_manager = SessionManager()
        self.security_monitor = SecurityMonitor()
        self.jwt_secret = None
        self.jwt_algorithm = 'HS256'
        self.jwt_expiration = 3600  # 1 hour
        
        if app:
            self.init_app(app)
    
    def init_app(self, app: Flask):
        """Initialize authenticator with Flask app."""
        self.app = app
        self.session_manager.init_app(app)
        self.security_monitor.init_app(app)
        
        # JWT configuration
        self.jwt_secret = app.config.get('JWT_SECRET_KEY', app.config.get('SECRET_KEY', 'dev-key'))
        self.jwt_expiration = app.config.get('JWT_EXPIRATION', 3600)
        
        # Add security middleware
        @app.before_request
        def security_check():
            # Check if IP is blocked
            if self.security_monitor.is_ip_blocked(request.remote_addr):
                return jsonify({'error': 'Access denied'}), 403
            
            # Add security headers
            @app.after_request
            def add_security_headers(response):
                response.headers['X-Content-Type-Options'] = 'nosniff'
                response.headers['X-Frame-Options'] = 'DENY'
                response.headers['X-XSS-Protection'] = '1; mode=block'
                response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
                return response
        
        logger.info("Enhanced authentication system initialized")
    
    def authenticate_user(self, username: str, password: str) -> Dict[str, Any]:
        """Authenticate a user with username and password."""
        try:
            # Log authentication attempt
            self.security_monitor.log_security_event(SecurityEvent(
                event_type='login_attempt',
                user_id=None,
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', ''),
                timestamp=datetime.now(timezone.utc),
                details={'username': username},
                risk_level=SecurityLevel.MEDIUM
            ))
            
            # Here you would typically query your user database
            # For this example, we'll assume you have a User model
            from models import User
            user = User.query.filter_by(username=username).first()
            
            if not user or not self.password_manager.verify_password(password, user.password_hash):
                # Log failed login
                self.security_monitor.log_security_event(SecurityEvent(
                    event_type='failed_login',
                    user_id=user.id if user else None,
                    ip_address=request.remote_addr,
                    user_agent=request.headers.get('User-Agent', ''),
                    timestamp=datetime.now(timezone.utc),
                    details={'username': username, 'reason': 'invalid_credentials'},
                    risk_level=SecurityLevel.HIGH
                ))
                raise AuthenticationError("Invalid credentials")
            
            # Create session
            user_data = {
                'username': user.username,
                'email': user.email,
                'subscription_tier': getattr(user, 'subscription_tier', 'free')
            }
            
            session_id = self.session_manager.create_session(user.id, user_data)
            
            # Generate JWT token
            token = self.generate_jwt_token(user.id, user_data)
            
            # Log successful login
            self.security_monitor.log_security_event(SecurityEvent(
                event_type='successful_login',
                user_id=user.id,
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', ''),
                timestamp=datetime.now(timezone.utc),
                details={'username': username},
                risk_level=SecurityLevel.LOW
            ))
            
            return {
                'user_id': user.id,
                'username': user.username,
                'session_id': session_id,
                'token': token,
                'expires_at': (datetime.now(timezone.utc) + timedelta(seconds=self.jwt_expiration)).isoformat()
            }
            
        except AuthenticationError:
            raise
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            raise AuthenticationError("Authentication failed")
    
    def generate_jwt_token(self, user_id: int, user_data: Dict[str, Any]) -> str:
        """Generate a JWT token for the user."""
        payload = {
            'user_id': user_id,
            'user_data': user_data,
            'iat': datetime.now(timezone.utc),
            'exp': datetime.now(timezone.utc) + timedelta(seconds=self.jwt_expiration),
            'jti': secrets.token_hex(16)  # JWT ID for token revocation
        }
        
        return jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)
    
    def verify_jwt_token(self, token: str) -> Dict[str, Any]:
        """Verify and decode a JWT token."""
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise AuthenticationError("Token has expired")
        except jwt.InvalidTokenError:
            raise AuthenticationError("Invalid token")
    
    def logout_user(self, session_id: str = None, token: str = None):
        """Logout a user by destroying their session."""
        try:
            if session_id:
                self.session_manager.destroy_session(session_id)
            
            # Log logout
            self.security_monitor.log_security_event(SecurityEvent(
                event_type='logout',
                user_id=getattr(current_user, 'id', None),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', ''),
                timestamp=datetime.now(timezone.utc),
                details={'session_id': session_id},
                risk_level=SecurityLevel.LOW
            ))
            
        except Exception as e:
            logger.error(f"Logout error: {e}")

def require_auth(security_level: SecurityLevel = SecurityLevel.MEDIUM):
    """
    Decorator to require authentication for endpoints.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Check for JWT token in Authorization header
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                try:
                    authenticator = current_app.extensions.get('authenticator')
                    if authenticator:
                        payload = authenticator.verify_jwt_token(token)
                        g.current_user_id = payload['user_id']
                        g.current_user_data = payload['user_data']
                        return f(*args, **kwargs)
                except AuthenticationError:
                    pass
            
            # Check for session
            session_id = request.headers.get('X-Session-ID') or session.get('session_id')
            if session_id:
                authenticator = current_app.extensions.get('authenticator')
                if authenticator:
                    session_data = authenticator.session_manager.get_session(session_id)
                    if session_data:
                        g.current_user_id = session_data['user_id']
                        g.current_user_data = session_data['user_data']
                        return f(*args, **kwargs)
            
            return jsonify({'error': 'Authentication required'}), 401
        
        return decorated_function
    return decorator

# Global instance
enhanced_authenticator = EnhancedAuthenticator()

# Export key components
__all__ = [
    'EnhancedAuthenticator',
    'PasswordManager',
    'SessionManager',
    'SecurityMonitor',
    'SecurityEvent',
    'SecurityLevel',
    'AuthenticationError',
    'require_auth',
    'enhanced_authenticator'
]