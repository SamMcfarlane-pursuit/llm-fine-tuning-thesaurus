"""
Database models for the Visual Thesaurus LLM application.
"""
from datetime import datetime, timezone, timedelta
import jwt
from flask import current_app
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import os
import secrets

# SQLAlchemy instance is imported from extensions
from extensions import db

# Secret key for JWT tokens (in a real app, this would be in environment variables)
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', secrets.token_hex(32))

class User(db.Model, UserMixin):
    """User model for authentication."""
    __tablename__ = 'users'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128))
    first_name = db.Column(db.String(64))
    last_name = db.Column(db.String(64))
    is_active = db.Column(db.Boolean, default=True)
    is_confirmed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    last_login = db.Column(db.DateTime)

    # OAuth fields
    oauth_provider = db.Column(db.String(50))  # e.g., 'google', 'github', 'facebook'
    oauth_id = db.Column(db.String(255))       # ID from the OAuth provider
    avatar_url = db.Column(db.String(255))     # Profile picture URL

    # Subscription fields
    subscription_tier = db.Column(db.String(50), default='free')  # e.g., 'free', 'basic', 'premium', 'enterprise'
    subscription_start = db.Column(db.DateTime)  # When the subscription started
    subscription_end = db.Column(db.DateTime)    # When the subscription ends
    payment_status = db.Column(db.String(50), default='none')  # e.g., 'none', 'active', 'past_due', 'canceled'
    stripe_customer_id = db.Column(db.String(255))  # Stripe customer ID

    # Relationships
    progress = db.relationship('UserProgress', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    bookmarks = db.relationship('Bookmark', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    social_accounts = db.relationship('SocialAccount', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    def __init__(self, username, email, password=None, first_name=None, last_name=None,
                 oauth_provider=None, oauth_id=None, avatar_url=None, name=None):
        self.username = username
        self.email = email
        if password:
            self.set_password(password)
        self.first_name = first_name
        self.last_name = last_name
        self.oauth_provider = oauth_provider
        self.oauth_id = oauth_id
        self.avatar_url = avatar_url

        # If name is provided (from OAuth) but not first/last name, split it
        if name and not (first_name or last_name):
            parts = name.split(' ', 1)
            self.first_name = parts[0]
            self.last_name = parts[1] if len(parts) > 1 else ''

    def set_password(self, password):
        """Set the password hash."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Check if the password is correct."""
        return check_password_hash(self.password_hash, password)

    def get_full_name(self):
        """Get the user's full name."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username

    def update_last_login(self):
        """Update the last login time."""
        from datetime import datetime, timezone
        self.last_login = datetime.now(timezone.utc)
        db.session.commit()

    def is_subscription_active(self):
        """Check if the user has an active subscription."""
        # All features are free, so always return True
        return True

    def get_subscription_days_remaining(self):
        """Get the number of days remaining in the subscription."""
        # All features are free, so return a large number
        return 365

    def can_access_feature(self, feature):
        """Check if user can access a feature.

        Args:
            feature (str): The feature to check access for.

        Returns:
            bool: True if user can access the feature, False otherwise.
        """
        # All features are free, so always return True
        return True

    def get_reset_password_token(self, expires_in=3600):
        """Generate a password reset token.

        Args:
            expires_in (int): Token expiration time in seconds (default: 1 hour)

        Returns:
            str: JWT token
        """
        payload = {
            'reset_password': self.id,
            'exp': datetime.now(timezone.utc) + timedelta(seconds=expires_in)
        }
        return jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')

    @staticmethod
    def verify_reset_password_token(token):
        """Verify a password reset token.

        Args:
            token (str): JWT token

        Returns:
            int: User ID if token is valid, None otherwise
        """
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
            return payload['reset_password']
        except Exception:
            return None

    def __repr__(self):
        return f"<User {self.username}>"


class UserProgress(db.Model):
    """Model to track user progress in the LLM fine-tuning journey."""
    __tablename__ = 'user_progress'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    module = db.Column(db.String(64), nullable=False)  # e.g., 'lora', 'qlora', 'gpt'
    topic = db.Column(db.String(64), nullable=False)   # e.g., 'introduction', 'advanced'
    completed = db.Column(db.Boolean, default=False)
    score = db.Column(db.Integer, default=0)           # For quizzes or exercises
    last_accessed = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<UserProgress {self.user_id} - {self.module}/{self.topic}>"


class Bookmark(db.Model):
    """Model for user bookmarks."""
    __tablename__ = 'bookmarks'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(32), nullable=False)    # e.g., 'concept', 'term', 'page'
    item_id = db.Column(db.String(64), nullable=False) # ID or slug of the bookmarked item
    title = db.Column(db.String(128), nullable=False)  # Title for display
    url = db.Column(db.String(256), nullable=False)    # URL to the bookmarked item
    notes = db.Column(db.Text)                         # User notes
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<Bookmark {self.user_id} - {self.type}/{self.item_id}>"


class Quiz(db.Model):
    """Model for quizzes."""
    __tablename__ = 'quizzes'

    id = db.Column(db.Integer, primary_key=True)
    module = db.Column(db.String(64), nullable=False)  # e.g., 'lora', 'qlora', 'gpt'
    topic = db.Column(db.String(64), nullable=False)   # e.g., 'introduction', 'advanced'
    title = db.Column(db.String(128), nullable=False)  # Quiz title
    description = db.Column(db.Text)                   # Quiz description
    passing_score = db.Column(db.Integer, default=70)  # Passing score percentage
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    questions = db.relationship('QuizQuestion', backref='quiz', lazy='dynamic', cascade='all, delete-orphan')
    attempts = db.relationship('QuizAttempt', backref='quiz', lazy='dynamic', cascade='all, delete-orphan')

    def __repr__(self):
        return f"<Quiz {self.module}/{self.topic} - {self.title}>"


class QuizQuestion(db.Model):
    """Model for quiz questions."""
    __tablename__ = 'quiz_questions'

    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)  # The question text
    question_type = db.Column(db.String(32), nullable=False)  # e.g., 'multiple_choice', 'true_false', 'text'
    explanation = db.Column(db.Text)  # Explanation of the correct answer
    points = db.Column(db.Integer, default=1)  # Points for this question
    order = db.Column(db.Integer, default=0)  # Order in the quiz

    # Relationships
    options = db.relationship('QuizOption', backref='question', lazy='dynamic', cascade='all, delete-orphan')

    def __repr__(self):
        return f"<QuizQuestion {self.id} - {self.question_text[:30]}...>"


class QuizOption(db.Model):
    """Model for quiz question options."""
    __tablename__ = 'quiz_options'

    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('quiz_questions.id'), nullable=False)
    option_text = db.Column(db.Text, nullable=False)  # The option text
    is_correct = db.Column(db.Boolean, default=False)  # Whether this option is correct
    order = db.Column(db.Integer, default=0)  # Order of the option

    def __repr__(self):
        return f"<QuizOption {self.id} - {self.option_text[:30]}...>"


class QuizAttempt(db.Model):
    """Model for quiz attempts."""
    __tablename__ = 'quiz_attempts'

    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)  # Score as a percentage
    passed = db.Column(db.Boolean, default=False)  # Whether the user passed the quiz
    started_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = db.Column(db.DateTime)  # When the quiz was completed

    # Relationships
    answers = db.relationship('QuizAnswer', backref='attempt', lazy='dynamic', cascade='all, delete-orphan')

    def __repr__(self):
        return f"<QuizAttempt {self.user_id} - {self.quiz_id} - {self.score}%>"


class QuizAnswer(db.Model):
    """Model for quiz answers."""
    __tablename__ = 'quiz_answers'

    id = db.Column(db.Integer, primary_key=True)
    attempt_id = db.Column(db.Integer, db.ForeignKey('quiz_attempts.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('quiz_questions.id'), nullable=False)
    selected_option_id = db.Column(db.Integer, db.ForeignKey('quiz_options.id'))  # For multiple choice
    text_answer = db.Column(db.Text)  # For text answers
    is_correct = db.Column(db.Boolean, default=False)  # Whether the answer is correct

    # Relationships
    question = db.relationship('QuizQuestion')
    selected_option = db.relationship('QuizOption')

    def __repr__(self):
        return f"<QuizAnswer {self.attempt_id} - {self.question_id} - {self.is_correct}>"


class PopQuiz(db.Model):
    """Model for pop quizzes that appear after reading a topic."""
    __tablename__ = 'pop_quizzes'

    id = db.Column(db.Integer, primary_key=True)
    module = db.Column(db.String(64), nullable=False)  # e.g., 'lora', 'qlora', 'gpt'
    topic = db.Column(db.String(64), nullable=False)   # e.g., 'introduction', 'advanced'
    title = db.Column(db.String(128), nullable=False)  # Quiz title
    description = db.Column(db.Text)                   # Quiz description
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    questions = db.relationship('PopQuizQuestion', backref='pop_quiz', lazy='dynamic', cascade='all, delete-orphan')

    def __repr__(self):
        return f"<PopQuiz {self.module}/{self.topic} - {self.title}>"


class PopQuizQuestion(db.Model):
    """Model for pop quiz questions."""
    __tablename__ = 'pop_quiz_questions'

    id = db.Column(db.Integer, primary_key=True)
    pop_quiz_id = db.Column(db.Integer, db.ForeignKey('pop_quizzes.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)  # The question text
    question_type = db.Column(db.String(32), nullable=False)  # e.g., 'multiple_choice', 'true_false'
    explanation = db.Column(db.Text)  # Explanation of the correct answer
    order = db.Column(db.Integer, default=0)  # Order in the quiz

    # For multiple choice questions
    options = db.Column(db.JSON)  # JSON array of options with format: [{"id": 1, "text": "Option 1", "is_correct": true}, ...]

    # For true/false questions
    correct_answer = db.Column(db.Boolean)  # True or False for true/false questions

    def __repr__(self):
        return f"<PopQuizQuestion {self.id} - {self.question_text[:30]}...>"


class SocialAccount(db.Model):
    """Model for social accounts linked to users."""
    __tablename__ = 'social_accounts'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    provider = db.Column(db.String(50), nullable=False)  # e.g., 'google', 'github', 'supabase'
    social_id = db.Column(db.String(255), nullable=False)  # ID from the provider
    access_token = db.Column(db.String(255), nullable=False)  # OAuth access token
    expires_at = db.Column(db.DateTime, nullable=True)  # When the token expires

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                          onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<SocialAccount {self.user_id} - {self.provider}:{self.social_id}>"


class AnalyticsEvent(db.Model):
    """Model for analytics events."""
    __tablename__ = 'analytics_events'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    event_type = db.Column(db.String(50), nullable=False)  # e.g., 'page_view', 'tutorial_complete'
    event_data = db.Column(db.JSON, default={})  # Additional data for the event
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # Nullable for anonymous users
    session_id = db.Column(db.String(128), nullable=True)  # Session ID for tracking anonymous users
    ip_address = db.Column(db.String(45), nullable=True)  # IP address of the user
    user_agent = db.Column(db.String(255), nullable=True)  # User agent of the user
    referrer = db.Column(db.String(255), nullable=True)  # Referrer URL
    path = db.Column(db.String(255), nullable=True)  # Path of the page
    subscription_tier = db.Column(db.String(50), nullable=True)  # Subscription tier of the user
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))  # When the event occurred

    def __repr__(self):
        return f"<AnalyticsEvent {self.id} - {self.event_type}>"


class ContentMetrics(db.Model):
    """Model for content metrics."""
    __tablename__ = 'content_metrics'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    content_type = db.Column(db.String(50), nullable=False)  # e.g., 'tutorial', 'quiz', 'exercise'
    content_id = db.Column(db.String(128), nullable=False)  # ID of the content
    views = db.Column(db.Integer, default=0)  # Number of views
    completions = db.Column(db.Integer, default=0)  # Number of completions
    avg_time_spent = db.Column(db.Float, default=0)  # Average time spent in minutes
    rating = db.Column(db.Float, default=0)  # Average rating (0-5)
    rating_count = db.Column(db.Integer, default=0)  # Number of ratings
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                          onupdate=lambda: datetime.now(timezone.utc))  # When the metrics were last updated

    def __repr__(self):
        return f"<ContentMetrics {self.content_type}/{self.content_id}>"


class DailyMetrics(db.Model):
    """Model for daily metrics."""
    __tablename__ = 'daily_metrics'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)  # Date of the metrics
    active_users = db.Column(db.Integer, default=0)  # Number of active users
    page_views = db.Column(db.Integer, default=0)  # Number of page views
    new_users = db.Column(db.Integer, default=0)  # Number of new users
    tutorial_completions = db.Column(db.Integer, default=0)  # Number of tutorial completions
    quiz_completions = db.Column(db.Integer, default=0)  # Number of quiz completions
    exercise_completions = db.Column(db.Integer, default=0)  # Number of exercise completions
    subscription_conversions = db.Column(db.Integer, default=0)  # Number of subscription conversions
    search_count = db.Column(db.Integer, default=0)  # Number of searches
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                          onupdate=lambda: datetime.now(timezone.utc))  # When the metrics were last updated

    def __repr__(self):
        return f"<DailyMetrics {self.date}>"

    @classmethod
    def get_or_create(cls, date):
        """Get or create metrics for the given date."""
        metrics = cls.query.filter_by(date=date).first()
        if not metrics:
            metrics = cls(date=date)
            db.session.add(metrics)
            db.session.commit()
        return metrics
