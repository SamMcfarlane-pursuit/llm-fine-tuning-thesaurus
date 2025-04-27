"""
Analytics models for tracking user activity and application metrics.
"""

from datetime import datetime, timezone
from extensions import db
from sqlalchemy.dialects.postgresql import JSONB

class AnalyticsEvent(db.Model):
    """
    Model for tracking analytics events.
    """
    
    __tablename__ = 'analytics_events'
    
    id = db.Column(db.Integer, primary_key=True)
    event_type = db.Column(db.String(64), index=True, nullable=False)
    event_data = db.Column(JSONB)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    session_id = db.Column(db.String(128), nullable=True)
    ip_address = db.Column(db.String(64), nullable=True)
    user_agent = db.Column(db.String(256), nullable=True)
    referrer = db.Column(db.String(512), nullable=True)
    path = db.Column(db.String(512), nullable=True)
    subscription_tier = db.Column(db.String(20), nullable=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = db.relationship('User', backref=db.backref('analytics_events', lazy='dynamic'))
    
    def __repr__(self):
        return f'<AnalyticsEvent {self.event_type}>'
    
    def to_dict(self):
        """
        Convert event to dictionary.
        """
        return {
            'id': self.id,
            'event_type': self.event_type,
            'event_data': self.event_data,
            'user_id': self.user_id,
            'session_id': self.session_id,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'referrer': self.referrer,
            'path': self.path,
            'subscription_tier': self.subscription_tier,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

class UserMetrics(db.Model):
    """
    Model for storing aggregated user metrics.
    """
    
    __tablename__ = 'user_metrics'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    tutorials_started = db.Column(db.Integer, default=0)
    tutorials_completed = db.Column(db.Integer, default=0)
    quizzes_started = db.Column(db.Integer, default=0)
    quizzes_completed = db.Column(db.Integer, default=0)
    exercises_started = db.Column(db.Integer, default=0)
    exercises_completed = db.Column(db.Integer, default=0)
    searches_performed = db.Column(db.Integer, default=0)
    pages_viewed = db.Column(db.Integer, default=0)
    last_active = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    first_seen = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = db.relationship('User', backref=db.backref('metrics', uselist=False))
    
    def __repr__(self):
        return f'<UserMetrics {self.user_id}>'
    
    def to_dict(self):
        """
        Convert metrics to dictionary.
        """
        return {
            'user_id': self.user_id,
            'tutorials_started': self.tutorials_started,
            'tutorials_completed': self.tutorials_completed,
            'quizzes_started': self.quizzes_started,
            'quizzes_completed': self.quizzes_completed,
            'exercises_started': self.exercises_started,
            'exercises_completed': self.exercises_completed,
            'searches_performed': self.searches_performed,
            'pages_viewed': self.pages_viewed,
            'last_active': self.last_active.isoformat() if self.last_active else None,
            'first_seen': self.first_seen.isoformat() if self.first_seen else None,
            'days_active': (datetime.now(timezone.utc) - self.first_seen).days if self.first_seen else 0
        }

class DailyMetrics(db.Model):
    """
    Model for storing daily application metrics.
    """
    
    __tablename__ = 'daily_metrics'
    
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, index=True, unique=True)
    active_users = db.Column(db.Integer, default=0)
    new_users = db.Column(db.Integer, default=0)
    page_views = db.Column(db.Integer, default=0)
    tutorial_completions = db.Column(db.Integer, default=0)
    quiz_completions = db.Column(db.Integer, default=0)
    exercise_completions = db.Column(db.Integer, default=0)
    searches = db.Column(db.Integer, default=0)
    subscriptions = db.Column(db.Integer, default=0)
    subscription_upgrades = db.Column(db.Integer, default=0)
    subscription_cancellations = db.Column(db.Integer, default=0)
    
    def __repr__(self):
        return f'<DailyMetrics {self.date}>'
    
    def to_dict(self):
        """
        Convert metrics to dictionary.
        """
        return {
            'date': self.date.isoformat() if self.date else None,
            'active_users': self.active_users,
            'new_users': self.new_users,
            'page_views': self.page_views,
            'tutorial_completions': self.tutorial_completions,
            'quiz_completions': self.quiz_completions,
            'exercise_completions': self.exercise_completions,
            'searches': self.searches,
            'subscriptions': self.subscriptions,
            'subscription_upgrades': self.subscription_upgrades,
            'subscription_cancellations': self.subscription_cancellations
        }

class ContentMetrics(db.Model):
    """
    Model for storing metrics for specific content.
    """
    
    __tablename__ = 'content_metrics'
    
    id = db.Column(db.Integer, primary_key=True)
    content_type = db.Column(db.String(64), nullable=False)
    content_id = db.Column(db.String(128), nullable=False)
    views = db.Column(db.Integer, default=0)
    completions = db.Column(db.Integer, default=0)
    average_time_spent = db.Column(db.Float, default=0)
    rating = db.Column(db.Float, default=0)
    rating_count = db.Column(db.Integer, default=0)
    last_updated = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (
        db.UniqueConstraint('content_type', 'content_id', name='uix_content_metrics'),
    )
    
    def __repr__(self):
        return f'<ContentMetrics {self.content_type} {self.content_id}>'
    
    def to_dict(self):
        """
        Convert metrics to dictionary.
        """
        return {
            'content_type': self.content_type,
            'content_id': self.content_id,
            'views': self.views,
            'completions': self.completions,
            'completion_rate': (self.completions / self.views * 100) if self.views > 0 else 0,
            'average_time_spent': self.average_time_spent,
            'rating': self.rating,
            'rating_count': self.rating_count,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }
