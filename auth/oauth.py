"""
OAuth integration for authentication.
"""

from flask import redirect, url_for, flash, current_app, session, request
from flask_login import login_user, current_user
from datetime import datetime, timedelta, timezone
import logging

from . import auth
from models import User
from extensions import db, oauth

# SocialAccount model is now defined in models.py
from models import SocialAccount

# Initialize OAuth providers
# Note: This is a simplified version for development purposes
# In a production environment, you would register these properly

# For Authlib, we register OAuth clients differently
def init_oauth(app):
    """Initialize OAuth providers with the app context."""
    # Register Google OAuth client
    oauth.register(
        name='google',
        client_id=app.config.get('GOOGLE_CLIENT_ID'),
        client_secret=app.config.get('GOOGLE_CLIENT_SECRET'),
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={
            'scope': 'openid email profile',
            'prompt': 'select_account',  # Force account selection for better UX
            'access_type': 'offline'     # Get refresh token for long-term access
        }
    )

    # Register GitHub OAuth client
    oauth.register(
        name='github',
        client_id=app.config.get('GITHUB_CLIENT_ID'),
        client_secret=app.config.get('GITHUB_CLIENT_SECRET'),
        access_token_url='https://github.com/login/oauth/access_token',
        authorize_url='https://github.com/login/oauth/authorize',
        api_base_url='https://api.github.com/',
        client_kwargs={
            'scope': 'user:email',
            'token_endpoint_auth_method': 'client_secret_post'  # Ensure proper token authentication
        }
    )



# OAuth clients are now registered in the init_oauth function


@auth.route('/login/google')
def google():
    """Login with Google."""
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))

    redirect_uri = url_for('auth.google_authorized', _external=True)
    return oauth.google.authorize_redirect(redirect_uri)


@auth.route('/login/github')
def github():
    """Login with GitHub."""
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))

    redirect_uri = url_for('auth.github_authorized', _external=True)
    return oauth.github.authorize_redirect(redirect_uri)





@auth.route('/login/google/authorized')
def google_authorized():
    """Google OAuth callback."""
    try:
        token = oauth.google.authorize_access_token()
        if not token:
            flash('Login failed: Unable to get access token', 'danger')
            return redirect(url_for('auth.login'))

        # Get user info from Google
        resp = oauth.google.get('userinfo')
        user_data = resp.json()

        # Check if user exists
        user = User.query.filter_by(email=user_data.get('email')).first()
    except Exception as e:
        flash(f'Login failed: {str(e)}', 'danger')
        return redirect(url_for('auth.login'))

    if user is None:
        # Create new user
        user = User(
            username=user_data.get('email').split('@')[0],
            email=user_data.get('email'),
            name=user_data.get('name'),
            avatar_url=user_data.get('picture'),
            oauth_provider='google',
            oauth_id=user_data.get('id')
        )
        db.session.add(user)
        db.session.commit()

    # Update or create social account
    social_account = SocialAccount.query.filter_by(
        user_id=user.id, provider='google'
    ).first()

    if social_account is None:
        social_account = SocialAccount(
            user_id=user.id,
            provider='google',
            social_id=user_data.get('id'),
            access_token=token.get('access_token'),
            expires_at=datetime.now(timezone.utc) + timedelta(seconds=token.get('expires_in', 3600))
        )
        db.session.add(social_account)
    else:
        social_account.access_token = token.get('access_token')
        social_account.expires_at = datetime.now(timezone.utc) + timedelta(seconds=token.get('expires_in', 3600))

    db.session.commit()

    # Log in user with remember=True for persistent session
    login_user(user, remember=True)
    user.update_last_login()
    
    # Store provider info in session for consistent experience
    from flask import session
    session['oauth_provider'] = 'google'
    
    flash('Successfully logged in with Google!', 'success')
    return redirect(url_for('index'))


@auth.route('/login/github/authorized')
def github_authorized():
    """GitHub OAuth callback."""
    try:
        token = oauth.github.authorize_access_token()
        if not token:
            flash('Login failed: Unable to get access token', 'danger')
            return redirect(url_for('auth.login'))

        # Get user info from GitHub
        resp = oauth.github.get('user')
        user_data = resp.json()

        # Get email from GitHub (it might be private)
        emails_resp = oauth.github.get('user/emails')
        emails_data = emails_resp.json()

        # Find primary email
        email = None
        for email_data in emails_data:
            if email_data.get('primary'):
                email = email_data.get('email')
                break

        if not email:
            flash('No primary email found in your GitHub account.', 'danger')
            return redirect(url_for('auth.login'))

        # Check if user exists
        user = User.query.filter_by(email=email).first()
    except Exception as e:
        flash(f'Login failed: {str(e)}', 'danger')
        return redirect(url_for('auth.login'))

    if user is None:
        # Create new user
        user = User(
            username=user_data.get('login'),
            email=email,
            name=user_data.get('name'),
            avatar_url=user_data.get('avatar_url'),
            oauth_provider='github',
            oauth_id=str(user_data.get('id'))
        )
        db.session.add(user)
        db.session.commit()

    # Update or create social account
    social_account = SocialAccount.query.filter_by(
        user_id=user.id, provider='github'
    ).first()

    if social_account is None:
        social_account = SocialAccount(
            user_id=user.id,
            provider='github',
            social_id=str(user_data.get('id')),
            access_token=token.get('access_token'),
            expires_at=datetime.now(timezone.utc) + timedelta(seconds=token.get('expires_in', 3600))
        )
        db.session.add(social_account)
    else:
        social_account.access_token = token.get('access_token')
        social_account.expires_at = datetime.now(timezone.utc) + timedelta(seconds=token.get('expires_in', 3600))

    db.session.commit()

    # Log in user with remember=True for persistent session
    login_user(user, remember=True)
    user.update_last_login()
    
    # Store provider info in session for consistent experience
    from flask import session
    session['oauth_provider'] = 'github'
    
    flash('Successfully logged in with GitHub!', 'success')
    return redirect(url_for('index'))





# Token management is handled automatically by Authlib
