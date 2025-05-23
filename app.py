"""
Flask web application for the Visual Thesaurus LLM project.
This provides a web interface for interacting with the thesaurus.
"""
import os
import ssl
import nltk
from flask import Flask, render_template, request, jsonify, send_from_directory, redirect, url_for, flash, Response
import json
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
from flask_login import current_user, login_required
from visual_thesaurus import VisualThesaurus
from thesaurus_utils import ThesaurusLLM
from llm_concepts import LLMConceptsVisualizer
from llm_thesaurus import LLMThesaurus
from models import UserProgress, Quiz
from auth import auth_bp
from enhanced_visualizations import EnhancedVisualizations
from quiz import quiz_bp
from analytics_routes import analytics_bp
from dotenv import load_dotenv
from extensions import db, login_manager, migrate, oauth, csrf
from utils.email import mail
from config import config

# Load environment variables from .env file if it exists
load_dotenv()

# Fix NLTK SSL certificate issue
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

# Download NLTK data
try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')
    nltk.download('omw-1.4')

# Initialize WordNet
from nltk.corpus import wordnet as wn
# Force initialization of WordNet
_ = wn.synsets('test')

# Configure Flask application
app = Flask(__name__)

# Load configuration from config.py
app_config = config.get(os.environ.get('FLASK_ENV', 'development'))
app.config.from_object(app_config)

# Initialize extensions
db.init_app(app)
login_manager.init_app(app)
migrate.init_app(app, db)
oauth.init_app(app)
csrf.init_app(app)

# Initialize mail with proper configuration
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@thesaurus-llm.com')
mail.init_app(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(quiz_bp)
app.register_blueprint(analytics_bp, url_prefix='/analytics')

# Initialize OAuth providers
from auth.oauth import init_oauth
init_oauth(app)

# Error handlers
@app.errorhandler(401)
def unauthorized(e):
    return render_template('errors/401.html', base_template='base-simple.html'), 401

@app.errorhandler(403)
def forbidden(e):
    return render_template('errors/403.html', base_template='base-simple.html'), 403

@app.errorhandler(404)
def page_not_found(e):
    return render_template('errors/404.html', base_template='base-simple.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    app.logger.error(f"500 error occurred: {str(e)}")
    app.logger.exception("Exception details:")
    return render_template('errors/500.html', base_template='base-simple.html'), 500

@app.errorhandler(502)
def bad_gateway(e):
    app.logger.error(f"502 error occurred: {str(e)}")
    app.logger.exception("Exception details:")
    return render_template('errors/502.html', base_template='base-simple.html'), 502

@app.errorhandler(Exception)
def handle_exception(e):
    app.logger.error(f"Unhandled exception: {str(e)}")
    app.logger.exception("Exception details:")
    return render_template('errors/500.html', base_template='base-simple.html'), 500

# Main routes
@app.route('/')
def index():
    return render_template('index.html', base_template='base-simple.html')

@app.route('/learn')
def learn():
    return render_template('learn.html', base_template='base-simple.html')

@app.route('/workshops')
def workshops():
    return render_template('workshops.html', base_template='base-simple.html')

@app.route('/tutorials')
def tutorials():
    return render_template('tutorials.html', base_template='base-simple.html')

@app.route('/frameworks')
def frameworks():
    return render_template('frameworks.html', base_template='base-simple.html')

@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html', base_template='base-simple.html')

@app.route('/login')
def login():
    return render_template('login.html', base_template='base-simple.html')

@app.route('/register')
def register():
    return render_template('register.html', base_template='base-simple.html')

@app.route('/terms')
def terms():
    return render_template('terms.html', base_template='base-simple.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy.html', base_template='base-simple.html')

# API routes
@app.route('/api/thesaurus/<word>')
@csrf.exempt
def get_thesaurus_data(word):
    try:
        thesaurus = ThesaurusLLM()
        data = thesaurus.get_word_data(word)
        return jsonify(data)
    except Exception as e:
        app.logger.error(f"Error getting thesaurus data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/synonyms/<word>')
@csrf.exempt
def get_synonyms(word):
    try:
        thesaurus = ThesaurusLLM()
        synonyms = thesaurus.get_synonyms(word)
        return jsonify({'synonyms': synonyms})
    except Exception as e:
        app.logger.error(f"Error getting synonyms: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/related/<word>')
@csrf.exempt
def get_related_terms(word):
    try:
        thesaurus = ThesaurusLLM()
        related = thesaurus.get_related_terms(word)
        return jsonify({'related': related})
    except Exception as e:
        app.logger.error(f"Error getting related terms: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=int(os.environ.get('PORT', 5036)))
