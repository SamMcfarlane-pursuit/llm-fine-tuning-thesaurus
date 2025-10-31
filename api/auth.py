"""
Authentication API endpoints for the Visual Thesaurus LLM application.
"""
from flask import Blueprint, jsonify, request, session
from flask_login import current_user, login_user, logout_user
from models import User, db
from werkzeug.security import check_password_hash
from extensions import csrf
from utils.error_handlers import handle_api_error
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Create a blueprint for authentication API routes
auth_api_bp = Blueprint('auth_api', __name__)

@auth_api_bp.route('/verify-session', methods=['GET'])
@handle_api_error
def verify_session():
    """Verify if the user has a valid session."""
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'email': current_user.email,
                'name': current_user.name,
                'avatar_url': current_user.avatar_url,
                'subscription_tier': current_user.subscription_tier
            }
        })
    else:
        return jsonify({'authenticated': False}), 401

@auth_api_bp.route('/login', methods=['POST'])
@csrf.exempt
@handle_api_error
def login_api():
    """API endpoint for user login."""
    data = request.json
    
    if not data:
        logger.warning(f"Login attempt with missing data from IP: {request.remote_addr}")
        raise ValueError("Missing request data")
    
    if not data.get('email') or not data.get('password'):
        logger.warning(f"Login attempt with incomplete data from IP: {request.remote_addr}")
        raise ValueError("Missing email or password")
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        logger.warning(f"Failed login attempt for email: {data.get('email')} from IP: {request.remote_addr}")
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Update last login time
    user.update_last_login()
    
    # Log in the user
    login_user(user, remember=data.get('remember_me', False))
    
    # Set remember device if requested
    if data.get('remember_device', False):
        session.permanent = True
    
    return jsonify({
        'success': True,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'name': user.name,
            'avatar_url': user.avatar_url,
            'subscription_tier': user.subscription_tier
        }
    })

@auth_api_bp.route('/logout', methods=['POST'])
@csrf.exempt
def logout_api():
    """API endpoint for user logout."""
    logout_user()
    return jsonify({'success': True})

@auth_api_bp.route('/register', methods=['POST'])
@csrf.exempt
def register_api():
    """API endpoint for user registration."""
    data = request.json
    
    if not data or not data.get('email') or not data.get('password') or not data.get('username'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 400
    
    # Create new user
    user = User(
        username=data['username'],
        email=data['email'],
        name=data.get('name', data['username'])
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Log in the new user
    login_user(user)
    user.update_last_login()
    
    return jsonify({
        'success': True,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'name': user.name,
            'subscription_tier': 'free'
        }
    })

@auth_api_bp.route('/check-auth', methods=['GET'])
def check_auth():
    """Check if user is authenticated and return user info."""
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'email': current_user.email,
                'name': current_user.name,
                'avatar_url': current_user.avatar_url,
                'subscription_tier': current_user.subscription_tier
            }
        })
    else:
        return jsonify({'authenticated': False})

@auth_api_bp.route('/update-profile', methods=['POST'])
@csrf.exempt
def update_profile():
    """API endpoint to update user profile."""
    if not current_user.is_authenticated:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.json
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Update username if provided and not taken
    if 'username' in data and data['username'] != current_user.username:
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already taken'}), 400
        current_user.username = data['username']
    
    # Update name if provided
    if 'name' in data:
        current_user.name = data['name']
    
    # Update password if provided
    if 'password' in data and data['password']:
        current_user.set_password(data['password'])
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'user': {
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email,
            'name': current_user.name,
            'avatar_url': current_user.avatar_url,
            'subscription_tier': current_user.subscription_tier
        }
    })
