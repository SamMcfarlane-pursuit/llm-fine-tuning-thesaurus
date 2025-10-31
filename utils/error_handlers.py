"""
Error handling utilities for the application.
Provides consistent error responses and logging for API routes.
"""

import logging
import traceback
from functools import wraps
from flask import jsonify, current_app, request

logger = logging.getLogger(__name__)

def handle_api_error(f):
    """
    Decorator for API routes to handle exceptions consistently.
    Catches exceptions and returns appropriate JSON responses with status codes.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValueError as e:
            logger.warning(f"Value Error in {request.path}: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Invalid input',
                'message': str(e)
            }), 400
        except PermissionError as e:
            logger.warning(f"Permission Error in {request.path}: {str(e)} - User: {getattr(request, 'user', 'Unknown')}")
            return jsonify({
                'success': False,
                'error': 'Permission denied',
                'message': str(e)
            }), 403
        except FileNotFoundError as e:
            logger.warning(f"Not Found Error in {request.path}: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Resource not found',
                'message': str(e)
            }), 404
        except Exception as e:
            logger.error(f"Unhandled exception in {request.path}: {str(e)}\nTraceback: {traceback.format_exc()}")
            return jsonify({
                'success': False,
                'error': 'Internal server error',
                'message': 'An unexpected error occurred'
            }), 500
    return decorated_function

def api_not_found(error):
    """Handle 404 errors for API routes"""
    logger.warning(f"API 404 Error: {request.path} - Referrer: {request.referrer}")
    return jsonify({
        'success': False,
        'error': 'Not found',
        'message': 'The requested resource does not exist'
    }), 404

def api_forbidden(error):
    """Handle 403 errors for API routes"""
    logger.warning(f"API 403 Error: {request.path}")
    return jsonify({
        'success': False,
        'error': 'Forbidden',
        'message': 'You do not have permission to access this resource'
    }), 403

def api_server_error(error):
    """Handle 500 errors for API routes"""
    logger.error(f"API 500 Error: {request.path}\nError: {error}\nTraceback: {traceback.format_exc()}")
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'message': 'An unexpected error occurred'
    }), 500