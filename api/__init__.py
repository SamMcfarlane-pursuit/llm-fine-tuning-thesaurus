"""
API package for the Visual Thesaurus LLM application.
"""

from flask import Blueprint

api_bp = Blueprint('api', __name__, url_prefix='/api')

# Import and register API routes
from .auth import auth_api_bp
api_bp.register_blueprint(auth_api_bp, url_prefix='/auth')
