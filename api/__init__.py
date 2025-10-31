"""
API package for the Visual Thesaurus LLM application.
"""

from flask import Blueprint, jsonify, request
import logging
import traceback
from utils.error_handlers import api_not_found, api_forbidden, api_server_error

api_bp = Blueprint('api', __name__, url_prefix='/api')

# Import and register API routes
from .auth import auth_api_bp
from .ai_assistant_api import ai_assistant_api

api_bp.register_blueprint(auth_api_bp, url_prefix='/auth')
api_bp.register_blueprint(ai_assistant_api, url_prefix='/ai')

# Register error handlers for API routes
@api_bp.errorhandler(404)
def handle_not_found(error):
    return api_not_found(error)

@api_bp.errorhandler(403)
def handle_forbidden(error):
    return api_forbidden(error)

@api_bp.errorhandler(500)
def handle_server_error(error):
    return api_server_error(error)
