"""
Pipeline module for the Visual Thesaurus LLM application.
This module provides interactive demos and tutorials for the Hugging Face pipeline API.
"""

from flask import Blueprint

pipeline_bp = Blueprint('pipeline', __name__, url_prefix='/pipeline')

from . import routes
