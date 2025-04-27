"""
Supabase authentication integration.
"""

from flask import redirect, url_for, flash, request, session, current_app
from flask_login import login_user, current_user
from datetime import datetime, timezone

from . import auth
from models import User, SocialAccount
from extensions import db
from supabase_client import supabase

@auth.route('/login/supabase')
def supabase_login():
    """Login with Supabase."""
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))

    # Redirect to Supabase hosted auth page
    redirect_url = url_for('auth.supabase_callback', _external=True)
    auth_url = f"{current_app.config['SUPABASE_URL']}/auth/v1/authorize?provider=google&redirect_to={redirect_url}"
    return redirect(auth_url)

@auth.route('/login/supabase/callback')
def supabase_callback():
    """Supabase auth callback."""
    # Get access token from query parameters
    access_token = request.args.get('access_token')
    refresh_token = request.args.get('refresh_token')

    if not access_token:
        flash('Login failed: No access token received', 'danger')
        return redirect(url_for('auth.login'))

    try:
        # Set auth session in Supabase client
        supabase.auth.set_session(access_token, refresh_token)

        # Get user info from Supabase
        user_info = supabase.auth.get_user()
        user_data = user_info.user

        if not user_data:
            flash('Failed to get user info from Supabase.', 'danger')
            return redirect(url_for('auth.login'))

        # Check if user exists in our database
        user = User.query.filter_by(email=user_data.email).first()

        if user is None:
            # Create new user
            user = User(
                username=user_data.email.split('@')[0],
                email=user_data.email,
                name=user_data.user_metadata.get('full_name', user_data.email.split('@')[0]),
                avatar_url=user_data.user_metadata.get('avatar_url'),
                oauth_provider='supabase',
                oauth_id=user_data.id
            )
            db.session.add(user)
            db.session.commit()

            # Create user profile in Supabase
            supabase.table('users').insert({
                'id': user_data.id,
                'email': user_data.email,
                'username': user.username,
                'name': user.name,
                'avatar_url': user.avatar_url,
                'created_at': datetime.now(timezone.utc).isoformat()
            }).execute()

        # Update or create social account
        social_account = SocialAccount.query.filter_by(
            user_id=user.id, provider='supabase'
        ).first()

        if social_account is None:
            social_account = SocialAccount(
                user_id=user.id,
                provider='supabase',
                social_id=user_data.id,
                access_token=access_token,
                refresh_token=refresh_token
            )
            db.session.add(social_account)
        else:
            social_account.access_token = access_token
            social_account.refresh_token = refresh_token

        db.session.commit()

        # Log in user
        login_user(user)
        user.update_last_login()

        flash('Successfully logged in with Supabase!', 'success')
        return redirect(url_for('main.index'))

    except Exception as e:
        flash(f'Login failed: {str(e)}', 'danger')
        return redirect(url_for('auth.login'))

@auth.route('/signup/supabase', methods=['POST'])
def supabase_signup():
    """Sign up with Supabase."""
    email = request.form.get('email')
    password = request.form.get('password')

    if not email or not password:
        flash('Email and password are required.', 'danger')
        return redirect(url_for('auth.register'))

    try:
        # Sign up with Supabase
        response = supabase.auth.sign_up({
            'email': email,
            'password': password
        })

        if response.user:
            flash('Registration successful! Please check your email to confirm your account.', 'success')
        else:
            flash('Registration failed. Please try again.', 'danger')

        return redirect(url_for('auth.login'))

    except Exception as e:
        flash(f'Registration failed: {str(e)}', 'danger')
        return redirect(url_for('auth.register'))

@auth.route('/password-reset/supabase', methods=['POST'])
def supabase_password_reset():
    """Request password reset with Supabase."""
    email = request.form.get('email')

    if not email:
        flash('Email is required.', 'danger')
        return redirect(url_for('auth.reset_password_request'))

    try:
        # Request password reset with Supabase
        supabase.auth.reset_password_email(email)
        flash('Password reset email sent. Please check your inbox.', 'info')
        return redirect(url_for('auth.login'))

    except Exception as e:
        flash(f'Password reset request failed: {str(e)}', 'danger')
        return redirect(url_for('auth.reset_password_request'))
