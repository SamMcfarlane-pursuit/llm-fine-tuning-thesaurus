"""
API package for the Visual Thesaurus LLM application.
"""

from flask import Blueprint

api_bp = Blueprint('api', __name__, url_prefix='/api')

# Import and register API routes
from .auth import auth_api_bp
from .ai_assistant_api import ai_assistant_api

api_bp.register_blueprint(auth_api_bp, url_prefix='/auth')
api_bp.register_blueprint(ai_assistant_api, url_prefix='/ai')
