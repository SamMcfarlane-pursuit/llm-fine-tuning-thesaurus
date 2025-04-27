"""
Authentication blueprint.
"""

from flask import Blueprint

auth = Blueprint('auth', __name__)

from . import views, oauth, supabase_auth

# Export the blueprint
auth_bp = auth
