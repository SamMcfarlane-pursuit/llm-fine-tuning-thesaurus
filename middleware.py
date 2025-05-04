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
        try:
            # Skip tracking for static files and certain paths
            if request.path.startswith('/static') or request.path.startswith('/favicon'):
                return

            # Ensure session has a unique ID
            if 'session_id' not in session:
                session['session_id'] = str(uuid.uuid4())
                session.permanent = True

            # Regenerate session ID periodically for security
            if 'session_created' not in session:
                session['session_created'] = datetime.now(timezone.utc).timestamp()
            else:
                # Regenerate session ID every 30 minutes
                session_age = datetime.now(timezone.utc).timestamp() - session['session_created']
                if session_age > 1800:  # 30 minutes in seconds
                    old_session_id = session.get('session_id')
                    # Create new session ID
                    session['session_id'] = str(uuid.uuid4())
                    session['session_created'] = datetime.now(timezone.utc).timestamp()
                    app.logger.info(f"Regenerated session ID from {old_session_id} to {session['session_id']}")

            # Set start time for request duration tracking
            g.start_time = datetime.now(timezone.utc)

            # Track user activity timestamp if authenticated
            if current_user.is_authenticated:
                g.user_id = current_user.id
                session['last_activity'] = datetime.now(timezone.utc).timestamp()

            # Track page view
            if request.method == 'GET' and not request.path.startswith('/api'):
                track_page_view()
        except Exception as e:
            app.logger.error(f"Error in before_request middleware: {str(e)}")
            # Continue processing the request even if middleware fails

    @app.after_request
    def after_request(response):
        """
        Process response after it's been generated.
        - Track response time
        - Log errors
        - Set security headers

        Args:
            response: Flask response object

        Returns:
            Flask response object
        """
        try:
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

            # Add security headers for all responses
            response.headers['X-Content-Type-Options'] = 'nosniff'
            response.headers['X-Frame-Options'] = 'SAMEORIGIN'
            response.headers['X-XSS-Protection'] = '1; mode=block'

            # Set Cache-Control for better performance
            if request.path.startswith('/static'):
                # Cache static assets for 1 day
                response.headers['Cache-Control'] = 'public, max-age=86400'
            else:
                # No caching for dynamic content
                response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'

            # Track errors
            if response.status_code >= 400:
                track_error(response.status_code)

            # Add user ID to response headers if authenticated (for debugging)
            if hasattr(g, 'user_id'):
                response.headers['X-User-ID'] = str(g.user_id)

            return response
        except Exception as e:
            app.logger.error(f"Error in after_request middleware: {str(e)}")
            return response

def track_page_view():
    """
    Track a page view in analytics.
    """
    try:
        # Create event data
        event_data = {
            'path': request.path,
            'referrer': request.referrer or '',
            'user_agent': getattr(request.user_agent, 'string', ''),
            'ip_address': request.remote_addr or '',
            'session_id': session.get('session_id', ''),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }

        # Add user data if authenticated
        if current_user.is_authenticated:
            event_data['user_id'] = current_user.id
            event_data['subscription_tier'] = getattr(current_user, 'subscription_tier', 'free')
            event_data['email'] = getattr(current_user, 'email', '')
        else:
            event_data['user_id'] = 'anonymous'
            event_data['subscription_tier'] = 'none'

        # Track the event (non-blocking)
        try:
            analytics.track_event(analytics.EVENT_PAGE_VIEW, event_data)
        except Exception as e:
            # Log error but don't interrupt request processing
            print(f"Analytics error: {str(e)}")
    except Exception as e:
        # Log error but don't interrupt request processing
        print(f"Error tracking page view: {str(e)}")

def track_error(status_code):
    """
    Track an error in analytics.

    Args:
        status_code: HTTP status code
    """
    try:
        # Create event data
        event_data = {
            'status_code': status_code,
            'path': request.path,
            'method': request.method,
            'referrer': request.referrer or '',
            'user_agent': getattr(request.user_agent, 'string', ''),
            'ip_address': request.remote_addr or '',
            'session_id': session.get('session_id', ''),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }

        # Add request parameters (safely)
        try:
            # Add query parameters (GET)
            if request.args:
                event_data['query_params'] = dict(request.args)

            # Add form data (POST) - exclude sensitive fields
            if request.form:
                form_data = dict(request.form)
                # Remove sensitive fields
                for sensitive_field in ['password', 'token', 'secret', 'key']:
                    if sensitive_field in form_data:
                        form_data[sensitive_field] = '[REDACTED]'
                event_data['form_data'] = form_data
        except Exception:
            # If we can't get parameters, continue without them
            pass

        # Add user data if authenticated
        if current_user.is_authenticated:
            event_data['user_id'] = current_user.id
            event_data['subscription_tier'] = getattr(current_user, 'subscription_tier', 'free')
            event_data['email'] = getattr(current_user, 'email', '')
        else:
            event_data['user_id'] = 'anonymous'
            event_data['subscription_tier'] = 'none'

        # Track the event (non-blocking)
        try:
            analytics.track_event('error', event_data)
        except Exception as e:
            # Log error but don't interrupt request processing
            print(f"Analytics error: {str(e)}")
    except Exception as e:
        # Log error but don't interrupt request processing
        print(f"Error tracking error event: {str(e)}")
