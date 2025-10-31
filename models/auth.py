"""
Authentication models for the application.
"""

from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone, timedelta
from extensions import db
from secure_auth_system import SecurePasswordManager

class User(UserMixin, db.Model):
    """User model for authentication."""

    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, index=True)
    email = db.Column(db.String(120), unique=True, index=True)
    password_hash = db.Column(db.String(128))
    name = db.Column(db.String(64))
    avatar_url = db.Column(db.String(256))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    is_admin = db.Column(db.Boolean, default=False)

    # Subscription related fields
    subscription_tier = db.Column(db.String(20), default='free')  # 'free', 'basic', 'premium', 'enterprise'
    subscription_start = db.Column(db.DateTime)
    subscription_end = db.Column(db.DateTime)
    payment_status = db.Column(db.String(20), default='none')  # 'none', 'active', 'past_due', 'canceled'
    stripe_customer_id = db.Column(db.String(128))

    # OAuth related fields
    oauth_provider = db.Column(db.String(20))  # 'google', 'github', 'supabase', etc.
    oauth_id = db.Column(db.String(128))       # ID from the OAuth provider

    # Relationships
    social_accounts = db.relationship('SocialAccount', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    progress = db.relationship('UserProgress', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    # MFA fields
    mfa_secret = db.Column(db.String(32))  # TOTP secret
    mfa_enabled = db.Column(db.Boolean, default=False)
    mfa_backup_codes = db.Column(db.Text)  # Comma-separated backup codes
    
    # Security fields
    failed_login_attempts = db.Column(db.Integer, default=0)
    account_locked_until = db.Column(db.DateTime)
    password_changed_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    def __init__(self, **kwargs):
        super(User, self).__init__(**kwargs)
        self._password_manager = SecurePasswordManager()

    def set_password(self, password):
        """Set user password with secure bcrypt hashing."""
        self.password_hash = self._password_manager.hash_password(password)
        self.password_changed_at = datetime.now(timezone.utc)

    def check_password(self, password):
        """Check if password is correct using secure verification."""
        if self.password_hash:
            return self._password_manager.verify_password(password, self.password_hash)
        return False
    
    def is_account_locked(self):
        """Check if account is locked due to failed login attempts."""
        if self.account_locked_until:
            return datetime.now(timezone.utc) < self.account_locked_until
        return False
    
    def lock_account(self, duration_minutes=30):
        """Lock account for specified duration."""
        self.account_locked_until = datetime.now(timezone.utc) + timedelta(minutes=duration_minutes)
        db.session.commit()
    
    def unlock_account(self):
        """Unlock account and reset failed attempts."""
        self.account_locked_until = None
        self.failed_login_attempts = 0
        db.session.commit()
    
    def increment_failed_login(self):
        """Increment failed login attempts."""
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= 5:
            self.lock_account()
        db.session.commit()
    
    def reset_failed_login(self):
        """Reset failed login attempts on successful login."""
        self.failed_login_attempts = 0
        db.session.commit()

    def update_last_login(self):
        """Update last login time."""
        self.last_login = datetime.now(timezone.utc)
        db.session.commit()

    @classmethod
    def find_by_email(cls, email):
        """Find user by email."""
        return cls.query.filter_by(email=email).first()

    @classmethod
    def find_by_oauth(cls, provider, oauth_id):
        """Find user by OAuth provider and ID."""
        return cls.query.filter_by(oauth_provider=provider, oauth_id=oauth_id).first()

    def is_subscription_active(self):
        """Check if user has an active subscription."""
        if self.subscription_tier == 'free':
            return True

        if not self.subscription_end:
            return False

        return self.subscription_end > datetime.now(timezone.utc) and self.payment_status == 'active'

    def get_subscription_days_remaining(self):
        """Get number of days remaining in subscription."""
        if self.subscription_tier == 'free':
            return float('inf')  # Infinite days for free tier

        if not self.subscription_end:
            return 0

        delta = self.subscription_end - datetime.now(timezone.utc)
        return max(0, delta.days)

    def can_access_feature(self, feature):
        """Check if user can access a specific feature based on subscription tier."""
        # Define feature access by subscription tier
        feature_access = {
            'free': ['basic_tutorials', 'concept_search', 'public_notebooks'],
            'basic': ['basic_tutorials', 'concept_search', 'public_notebooks',
                      'advanced_tutorials', 'progress_tracking', 'bookmarks'],
            'premium': ['basic_tutorials', 'concept_search', 'public_notebooks',
                       'advanced_tutorials', 'progress_tracking', 'bookmarks',
                       'premium_content', 'code_exercises', 'quizzes'],
            'enterprise': ['basic_tutorials', 'concept_search', 'public_notebooks',
                          'advanced_tutorials', 'progress_tracking', 'bookmarks',
                          'premium_content', 'code_exercises', 'quizzes',
                          'team_management', 'custom_models', 'api_access']
        }

        # Check if subscription is active
        if not self.is_subscription_active() and self.subscription_tier != 'free':
            return feature in feature_access['free']

        # Check if feature is available for user's tier
        return feature in feature_access.get(self.subscription_tier, [])

    def __repr__(self):
        return f'<User {self.username}>'


class SocialAccount(db.Model):
    """Model for storing social media accounts linked to a user."""

    __tablename__ = 'social_accounts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    provider = db.Column(db.String(20))  # 'google', 'github', 'supabase', etc.
    social_id = db.Column(db.String(128))
    access_token = db.Column(db.String(256))
    refresh_token = db.Column(db.String(256))
    expires_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.UniqueConstraint('provider', 'social_id', name='unique_social_account'),
    )

    def __repr__(self):
        return f'<SocialAccount {self.provider}:{self.social_id}>'


class UserProgress(db.Model):
    """Model for tracking user progress through tutorials and exercises."""

    __tablename__ = 'user_progress'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    content_type = db.Column(db.String(20))  # 'tutorial', 'exercise', 'quiz', etc.
    content_id = db.Column(db.String(128))   # ID of the tutorial, exercise, etc.
    status = db.Column(db.String(20))        # 'not_started', 'in_progress', 'completed'
    progress_data = db.Column(db.JSON)       # Additional progress data (e.g., quiz scores)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.UniqueConstraint('user_id', 'content_type', 'content_id', name='unique_user_progress'),
    )

    def __repr__(self):
        return f'<UserProgress {self.content_type}:{self.content_id} - {self.status}>'
