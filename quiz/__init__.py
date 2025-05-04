"""
Quiz module for the Visual Thesaurus LLM project.
This module provides quiz functionality for testing knowledge of LLM fine-tuning concepts.
"""
from flask import Blueprint

quiz_bp = Blueprint('quiz', __name__, url_prefix='/quiz')

from . import routes
