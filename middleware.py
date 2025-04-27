"""
Middleware for the application.
Handles request processing, analytics tracking, and other cross-cutting concerns.
"""

import uuid
from datetime import datetime, timezone
from flask import request, session, g
from flask_login import current_user
import analytics

def init_app(app):
    """
    Initialize middleware for the application.
    
    Args:
        app: Flask application
    """
    @app.before_request
    def before_request():
        """
        Process request before it's handled by a view function.
        - Set up request context
        - Track page views
        - Manage user sessions
        """
        # Skip tracking for static files and certain paths
        if request.path.startswith('/static') or request.path.startswith('/favicon'):
            return
        
        # Ensure session has a unique ID
        if 'session_id' not in session:
            session['session_id'] = str(uuid.uuid4())
            session.permanent = True
        
        # Set start time for request duration tracking
        g.start_time = datetime.now(timezone.utc)
        
        # Track page view
        if request.method == 'GET' and not request.path.startswith('/api'):
            track_page_view()
    
    @app.after_request
    def after_request(response):
        """
        Process response after it's been generated.
        - Track response time
        - Log errors
        
        Args:
            response: Flask response object
        
        Returns:
            Flask response object
        """
        # Skip processing for static files
        if request.path.startswith('/static') or request.path.startswith('/favicon'):
            return response
        
        # Calculate request duration
        if hasattr(g, 'start_time'):
            duration = (datetime.now(timezone.utc) - g.start_time).total_seconds()
            
            # Track long requests for monitoring
            if duration > 1.0:  # More than 1 second
                app.logger.warning(f"Slow request: {request.path} took {duration:.2f}s")
            
            # Add timing header for debugging
            response.headers['X-Response-Time'] = f"{duration:.3f}s"
        
        # Track errors
        if response.status_code >= 400:
            track_error(response.status_code)
        
        return response

def track_page_view():
    """
    Track a page view in analytics.
    """
    # Create event data
    event_data = {
        'path': request.path,
        'referrer': request.referrer,
        'user_agent': request.user_agent.string,
        'ip_address': request.remote_addr
    }
    
    # Add user data if authenticated
    if current_user.is_authenticated:
        event_data['user_id'] = current_user.id
        event_data['subscription_tier'] = current_user.subscription_tier
    
    # Track the event
    analytics.track_event(analytics.EVENT_PAGE_VIEW, event_data)

def track_error(status_code):
    """
    Track an error in analytics.
    
    Args:
        status_code: HTTP status code
    """
    # Create event data
    event_data = {
        'status_code': status_code,
        'path': request.path,
        'method': request.method,
        'referrer': request.referrer,
        'user_agent': request.user_agent.string,
        'ip_address': request.remote_addr
    }
    
    # Add user data if authenticated
    if current_user.is_authenticated:
        event_data['user_id'] = current_user.id
        event_data['subscription_tier'] = current_user.subscription_tier
    
    # Track the event
    analytics.track_event('error', event_data)
