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
import analytics
from quiz.routes import quiz_bp as quiz_module

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

# Register API blueprints
from api import api_bp
app.register_blueprint(api_bp)

# Initialize OAuth providers
from auth.oauth import init_oauth
init_oauth(app)

# Initialize global instances
try:
    thesaurus = ThesaurusLLM()
except Exception as e:
    print(f"Warning: ThesaurusLLM initialization failed: {e}")
    print("Running without custom thesaurus model - using basic functionality")
    thesaurus = None

quiz = quiz_module

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

@app.route('/workshop-exercises')
def workshop_exercises():
    return render_template('workshop_exercises.html', base_template='base-simple.html')

@app.route('/workshop-progress')
def workshop_progress():
    return render_template('workshop_progress.html', base_template='base-simple.html')

@app.route('/docker-guide')
def docker_guide():
    return render_template('docker_guide.html', base_template='base-simple.html')

@app.route('/huggingface-guide')
def huggingface_guide():
    return render_template('huggingface_guide.html', base_template='base-simple.html')

@app.route('/langchain-guide')
def langchain_guide():
    return render_template('langchain_guide.html', base_template='base-simple.html')

@app.route('/langgraph-guide')
def langgraph_guide():
    return render_template('langgraph_guide.html', base_template='base-simple.html')

@app.route('/workshop-full-fine-tuning')
def workshop_full_fine_tuning():
    return render_template('workshop_full_fine_tuning.html', base_template='base-simple.html')

@app.route('/workshop-lora-fine-tuning')
def workshop_lora_fine_tuning():
    return render_template('workshop_lora_fine_tuning.html', base_template='base-simple.html')

@app.route('/workshop-qlora-deep-dive')
def workshop_qlora_deep_dive():
    return render_template('workshop_qlora.html', base_template='base-simple.html')

@app.route('/workshop-advanced-peft')
def workshop_advanced_peft():
    return render_template('workshop_advanced_peft.html', base_template='base-simple.html')

@app.route('/workshop-memory-efficiency')
def workshop_memory_efficiency():
    return render_template('workshop_memory_efficiency.html', base_template='base-simple.html')

@app.route('/google-ml-crash-course')
def google_ml_crash_course():
    return render_template('google_ml_crash_course.html', base_template='base-simple.html')

@app.route('/learning-paths')
def learning_paths():
    return render_template('learning_paths.html', base_template='base-simple.html')

@app.route('/dashboard')
def user_dashboard():
    return render_template('user_dashboard.html', base_template='base-simple.html')

@app.route('/search')
def search_results():
    query = request.args.get('q', '')
    return render_template('search_results.html', base_template='base-simple.html', query=query)

@app.route('/ai-assistant')
def ai_assistant():
    return render_template('ai_assistant.html', base_template='base-simple.html')

@app.route('/ai-assistant-demo')
def ai_assistant_demo():
    return render_template('ai_assistant_demo.html', base_template='base-simple.html')

@app.route('/lora-guide')
def lora_guide():
    return render_template('lora_guide.html', base_template='base-simple.html')

@app.route('/qlora-guide')
def qlora_guide():
    return render_template('qlora_guide.html', base_template='base-simple.html')

@app.route('/terms')
def terms():
    return render_template('terms.html', base_template='base-simple.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy.html', base_template='base-simple.html')

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

@app.route('/contact')
def contact():
    return render_template('contact.html', base_template='base-simple.html')

@app.route('/getting_started')
def getting_started():
    return render_template('getting_started.html', base_template='base-simple.html')

@app.route('/interactive_tutorials')
def interactive_tutorials():
    return render_template('interactive_tutorials.html', base_template='base-simple.html')

@app.route('/test-ai-assistant')
def test_ai_assistant():
    return render_template('test_ai_assistant.html', base_template='base-simple.html')

@app.route('/test-ai-simple')
def test_ai_simple():
    return render_template('test_ai_simple.html')

@app.route('/test-working-ai')
def test_working_ai():
    return render_template('test-working-ai.html')

# API routes
@app.route('/api/thesaurus/<word>')
@csrf.exempt
def get_thesaurus_data(word):
    try:
        if thesaurus is None:
            return jsonify({'error': 'Thesaurus service not available'}), 503
        data = thesaurus.get_word_data(word)
        return jsonify(data)
    except Exception as e:
        app.logger.error(f"Error getting thesaurus data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/synonyms/<word>')
@csrf.exempt
def get_synonyms(word):
    try:
        if thesaurus is None:
            return jsonify({'error': 'Thesaurus service not available'}), 503
        synonyms = thesaurus.get_synonyms(word)
        return jsonify({'synonyms': synonyms})
    except Exception as e:
        app.logger.error(f"Error getting synonyms: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/related/<word>')
@csrf.exempt
def get_related_terms(word):
    try:
        if thesaurus is None:
            return jsonify({'error': 'Thesaurus service not available'}), 503
        related = thesaurus.get_related_terms(word)
        return jsonify({'related': related})
    except Exception as e:
        app.logger.error(f"Error getting related terms: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/llm-concepts')
@csrf.exempt
def get_llm_concepts():
    try:
        llm_concepts = LLMConceptsVisualizer()
        concepts = llm_concepts.get_concepts()
        return jsonify({'concepts': concepts})
    except Exception as e:
        app.logger.error(f"Error getting LLM concepts: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/llm-concepts-visualization')
@csrf.exempt
def get_llm_concepts_visualization():
    try:
        llm_concepts = LLMConceptsVisualizer()
        visualization_data = llm_concepts.get_visualization_data()
        return jsonify(visualization_data)
    except Exception as e:
        app.logger.error(f"Error getting LLM concepts visualization: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/track', methods=['POST'])
@csrf.exempt
def track_analytics():
    try:
        data = request.get_json()
        analytics.track_event(data)
        return jsonify({'success': True})
    except Exception as e:
        app.logger.error(f"Error tracking analytics: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/quiz/submit', methods=['POST'])
@csrf.exempt
def submit_quiz():
    try:
        data = request.get_json()
        quiz_results = quiz.submit_quiz(data)
        return jsonify(quiz_results)
    except Exception as e:
        app.logger.error(f"Error submitting quiz: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/quiz/results/<quiz_id>')
@csrf.exempt
def get_quiz_results(quiz_id):
    try:
        quiz_results = quiz.get_quiz_results(quiz_id)
        return jsonify(quiz_results)
    except Exception as e:
        app.logger.error(f"Error getting quiz results: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/progress')
@login_required
def get_user_progress():
    try:
        user_progress = user_progress.get_progress(current_user)
        return jsonify(user_progress)
    except Exception as e:
        app.logger.error(f"Error getting user progress: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/search')
@csrf.exempt
def search():
    try:
        query = request.args.get('query')
        if thesaurus is None:
            return jsonify({'error': 'Thesaurus service not available'}), 503
        results = thesaurus.search(query)
        return jsonify({'results': results})
    except Exception as e:
        app.logger.error(f"Error searching: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/related-concepts')
@csrf.exempt
def get_related_concepts():
    try:
        query = request.args.get('query')
        if thesaurus is None:
            return jsonify({'error': 'Thesaurus service not available'}), 503
        related_concepts = thesaurus.get_related_concepts(query)
        return jsonify({'related_concepts': related_concepts})
    except Exception as e:
        app.logger.error(f"Error getting related concepts: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/learning-resources')
@csrf.exempt
def get_learning_resources():
    try:
        if thesaurus is None:
            return jsonify({'error': 'Thesaurus service not available'}), 503
        learning_resources = thesaurus.get_learning_resources()
        return jsonify({'learning_resources': learning_resources})
    except Exception as e:
        app.logger.error(f"Error getting learning resources: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/concept-definition')
@csrf.exempt
def get_concept_definition():
    try:
        concept = request.args.get('concept')
        if thesaurus is None:
            return jsonify({'error': 'Thesaurus service not available'}), 503
        definition = thesaurus.get_concept_definition(concept)
        return jsonify({'definition': definition})
    except Exception as e:
        app.logger.error(f"Error getting concept definition: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=int(os.environ.get('PORT', 5037)))
