"""
Custom decorators for the application.
"""

from functools import wraps
from flask import redirect, url_for, flash, request
from flask_login import current_user

def subscription_required(feature):
    """
    Decorator to check if user has access to a feature based on subscription.

    Note: All features are now free, so this only checks if the user is authenticated.

    Args:
        feature (str): The feature to check access for.

    Returns:
        function: The decorated function.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Check if user is authenticated
            if not current_user.is_authenticated:
                flash('Please sign in to access this feature.', 'warning')
                return redirect(url_for('auth.login', next=request.url))

            # All features are free, so no need to check subscription
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def admin_required(f):
    """
    Decorator to check if user is an admin.

    Returns:
        function: The decorated function.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if user is authenticated
        if not current_user.is_authenticated:
            flash('Please sign in to access this page.', 'warning')
            return redirect(url_for('auth.login', next=request.url))

        # Check if user is an admin
        if not current_user.is_admin:
            flash('You do not have permission to access this page.', 'danger')
            return redirect(url_for('index'))

        return f(*args, **kwargs)
    return decorated_function
