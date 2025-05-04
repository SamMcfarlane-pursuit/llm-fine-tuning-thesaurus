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
# Removed subscription_required decorator
# CSRF protection is imported from extensions
from visual_thesaurus import VisualThesaurus
from thesaurus_utils import ThesaurusLLM
from llm_concepts import LLMConceptsVisualizer
from llm_thesaurus import LLMThesaurus
from models import UserProgress
from auth import auth_bp
from quiz import quiz_bp
from analytics_routes import analytics_bp
from dotenv import load_dotenv
from extensions import db, login_manager, migrate, oauth, csrf
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

# Initialize OAuth providers
from auth.oauth import init_oauth
init_oauth(app)

# CSRF protection is already initialized above

# CSRF protection will be handled at the route level

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')

# Import and register quiz blueprint from quiz module
from quiz import quiz_bp
app.register_blueprint(quiz_bp)

app.register_blueprint(analytics_bp, url_prefix='/analytics')

# Register subscription blueprint
from subscription import subscription as subscription_bp
app.register_blueprint(subscription_bp, url_prefix='/subscription')

# Register AI Thesaurus LLM blueprint if available
try:
    from ai_thesaurus_llm.app_integration import init_app as init_thesaurus_llm

    # Register the blueprint without initializing the model
    init_thesaurus_llm(app)

    # Add a route to check if the AI Thesaurus LLM is available
    @app.route('/api/thesaurus-llm/status')
    def thesaurus_llm_status():
        return jsonify({
            'status': 'available',
            'message': 'AI Thesaurus LLM is available but not initialized with a model. Use the integration script to initialize it.'
        })

    print("AI Thesaurus LLM blueprint registered successfully!")
except ImportError:
    print("AI Thesaurus LLM module not found. Skipping blueprint registration.")

# Initialize middleware
import middleware
middleware.init_app(app)

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    """Handle 404 errors by showing a custom page."""
    return render_template('errors/404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    """Handle 500 errors by showing a custom page and logging the error."""
    # Log the error for debugging
    app.logger.error(f"500 error occurred: {str(e)}")
    app.logger.exception("Exception details:")
    return render_template('errors/500.html'), 500

@app.errorhandler(502)
def bad_gateway_error(e):
    """Handle 502 Bad Gateway errors by showing a custom page and logging the error."""
    # Log the error for debugging
    app.logger.error(f"502 Bad Gateway error occurred: {str(e)}")
    app.logger.exception("Exception details:")
    return render_template('errors/500.html', error_code=502, error_message="Bad Gateway"), 502



@app.errorhandler(Exception)
def handle_exception(e):
    """Handle all unhandled exceptions."""
    app.logger.error(f"Unhandled exception: {str(e)}")
    app.logger.exception("Exception details:")
    return render_template('errors/500.html'), 500

# Add a catch-all route for UUID-like paths
@app.route('/<path:uuid_path>')
def catch_all_handler(uuid_path):
    """
    Catch-all route for paths that might cause 502 errors.
    This will handle paths that look like UUIDs and redirect to the home page.
    """
    # Check if the path looks like a UUID (8-4-4-4-12 format)
    import re
    uuid_pattern = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)

    if uuid_pattern.match(uuid_path):
        app.logger.warning(f"Caught UUID-like path: {uuid_path}")
        flash("The page you were looking for doesn't exist. You've been redirected to the home page.", "warning")
        return redirect(url_for('index'))

    # If it's not a UUID, check if it's a specific UUID we're looking for
    if uuid_path == '6d8e68e0-9e3d-4c53-9944-7437fa991895' or uuid_path == '3dae26b2-9368-420e-8174-f220103049b0':
        app.logger.warning(f"Caught specific UUID path: {uuid_path}")
        flash("The page you were looking for doesn't exist. You've been redirected to the home page.", "warning")
        return redirect(url_for('index'))

    # If it's not a UUID, return a 404
    return render_template('errors/404.html'), 404



# Configure paths
app.config['STATIC_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
app.config['VISUALIZATIONS_FOLDER'] = os.path.join(app.config['STATIC_FOLDER'], 'visualizations')

# Ensure visualization directory exists
os.makedirs(app.config['VISUALIZATIONS_FOLDER'], exist_ok=True)

# Create database tables
with app.app_context():
    db.create_all()

    # Import and add quiz data
    from add_quizzes_to_app import add_quizzes
    add_quizzes()

# Initialize the visual thesaurus
visual_thesaurus = VisualThesaurus()

# Initialize the LLM concepts visualizer
llm_concepts_visualizer = LLMConceptsVisualizer()

# Initialize the LLM thesaurus
llm_thesaurus_instance = LLMThesaurus()

# Global variables for the model
model = None
tokenizer = None
thesaurus_llm = None

def load_model():
    """Load the fine-tuned model."""
    global model, tokenizer, thesaurus_llm

    # Check for QLoRA model first
    if os.path.exists("./thesaurus_model_final"):
        try:
            print("Loading QLoRA fine-tuned model...")
            from transformers import BitsAndBytesConfig
            import torch

            # Configure 4-bit quantization
            bnb_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_use_double_quant=True,
                bnb_4bit_quant_type="nf4",
                bnb_4bit_compute_dtype=torch.float16
            )

            # Check if we have a merged model or adapter
            if os.path.exists("./thesaurus_model_final"):
                print("Loading model...")
                # Load the model directly
                model = AutoModelForCausalLM.from_pretrained(
                    "./thesaurus_model_final",
                    quantization_config=bnb_config,
                    device_map="auto"
                )
                tokenizer = AutoTokenizer.from_pretrained("./thesaurus_model_final")
            else:
                # Load the base model with the adapter
                from peft import PeftConfig, PeftModel

                # Get the base model name from the config
                config = PeftConfig.from_pretrained("./thesaurus_model_final")
                print(f"Loading base model: {config.base_model_name_or_path}")

                # Load the base model with quantization
                base_model = AutoModelForCausalLM.from_pretrained(
                    config.base_model_name_or_path,
                    quantization_config=bnb_config,
                    device_map="auto"
                )

                # Load the tokenizer
                tokenizer = AutoTokenizer.from_pretrained(config.base_model_name_or_path)

                # Load the LoRA adapter
                model = PeftModel.from_pretrained(base_model, "./thesaurus_model_final")

            # Initialize the ThesaurusLLM
            thesaurus_llm = ThesaurusLLM(model=model, tokenizer=tokenizer)

            print("QLoRA model loaded successfully!")
            app.logger.info("QLoRA model loaded successfully!")
            return True

        except Exception as e:
            print(f"Error loading QLoRA model: {e}")
            app.logger.error(f"Error loading QLoRA model: {e}")
            # Fall back to LoRA model
            print("Falling back to LoRA model...")

    # Check for LoRA model as fallback
    if os.path.exists("./thesaurus-model-lora"):
        try:
            print("Loading LoRA fine-tuned model...")
            # Load the base model
            base_model = AutoModelForCausalLM.from_pretrained("gpt2")

            # Load the fine-tuned model
            model = PeftModel.from_pretrained(base_model, "./thesaurus-model-lora")
            tokenizer = AutoTokenizer.from_pretrained("./thesaurus-model-lora")

            # Initialize the ThesaurusLLM
            thesaurus_llm = ThesaurusLLM("./thesaurus-model-lora")

            print("LoRA model loaded successfully!")
            app.logger.info("LoRA model loaded successfully!")
            return True
        except Exception as e:
            print(f"Error loading LoRA model: {e}")
            app.logger.error(f"Error loading LoRA model: {e}")
            return False
    else:
        print("Model files not found. Please fine-tune the model first.")
        app.logger.warning("Model files not found. Please fine-tune the model first.")
        return False

@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')

@app.route('/visualize/<word>')
def visualize(word):
    """Render the visualization page for a specific word."""
    return render_template('visualize.html', word=word)

@app.route('/learn')
def learn():
    """Render the learning page with LLM fine-tuning concepts."""
    return render_template('learn.html')

@app.route('/learn/exercise8')
def learn_exercise8():
    """Render the Exercise 8 page with framework comparison."""
    return render_template('exercise8.html')

@app.route('/llm-thesaurus')
def llm_thesaurus():
    """Render the LLM fine-tuning thesaurus page (legacy route)."""
    return redirect(url_for('thesaurus'))

@app.route('/thesaurus')
def thesaurus():
    """Render the thesaurus search page."""
    # Regenerate the fine-tuning visualization to ensure it uses the latest template
    try:
        word = "fine-tuning"
        domain_graph = llm_thesaurus_instance.build_domain_graph(word)
        if domain_graph:
            visual_thesaurus.graph = domain_graph
            vis_path = f'static/visualizations/{word}_thesaurus.html'
            visual_thesaurus.visualize_interactive(save_path=vis_path)
    except Exception as e:
        print(f"Error regenerating visualization: {e}")

    return render_template('thesaurus.html')

@app.route('/concepts-learning')
def integrated_learning():
    """Render the integrated concepts and learning page."""
    # Get the concept from the query parameter, default to "fine-tuning"
    concept = request.args.get('concept', 'fine-tuning').lower()

    # Sanitize the concept name (remove special characters)
    import re
    concept = re.sub(r'[^a-z0-9\-]', '', concept)

    # Regenerate the visualization for the requested concept
    try:
        domain_graph = llm_thesaurus_instance.build_domain_graph(concept)
        if domain_graph:
            visual_thesaurus.graph = domain_graph
            vis_path = f'static/visualizations/{concept}_thesaurus.html'
            visual_thesaurus.visualize_interactive(save_path=vis_path)
    except Exception as e:
        print(f"Error regenerating visualization for {concept}: {e}")
        # Fallback to fine-tuning if there's an error
        concept = "fine-tuning"
        try:
            domain_graph = llm_thesaurus_instance.build_domain_graph(concept)
            if domain_graph:
                visual_thesaurus.graph = domain_graph
                vis_path = f'static/visualizations/{concept}_thesaurus.html'
                visual_thesaurus.visualize_interactive(save_path=vis_path)
        except Exception as e:
            print(f"Error regenerating fallback visualization: {e}")

    return render_template('integrated_learning.html', initial_concept=concept)

@app.route('/advanced-qlora')
def advanced_qlora():
    """Render the advanced QLoRA fine-tuning page."""
    return render_template('advanced_qlora.html', module_id='qlora', topic_id='advanced')

@app.route('/workshops')
@login_required
def workshops():
    """Render the workshops overview page."""
    return render_template('workshops.html')

@app.route('/workshop/qlora-deep-dive')
@login_required
def workshop_qlora():
    """Render the QLoRA deep dive workshop page."""
    return render_template('workshop_qlora.html', module_id='qlora', topic_id='deep-dive')

@app.route('/workshop/memory-efficiency')
@login_required
def workshop_memory_efficiency():
    """Render the memory efficiency in LLM fine-tuning workshop page."""
    return render_template('workshop_memory_efficiency.html', module_id='memory', topic_id='efficiency')

@app.route('/workshop/lora-basics')
@login_required
def workshop_lora_basics():
    """Render the LoRA basics workshop page."""
    return render_template('workshop_lora_basics.html', module_id='lora', topic_id='basics')

@app.route('/guide/lora-implementation')
def lora_guide():
    """Render the LoRA implementation guide page."""
    return render_template('lora_guide.html', module_id='lora', topic_id='implementation')

@app.route('/guide/lora-hands-on')
def lora_hands_on():
    """Render the LoRA hands-on example page."""
    return render_template('guides/lora_hands_on.html', module_id='lora', topic_id='hands-on')

@app.route('/guide/instruction-tuning')
def instruction_tuning_guide():
    """Render the Instruction Fine-Tuning guide page."""
    return render_template('instruction_tuning_guide.html', module_id='fine-tuning', topic_id='instruction')

@app.route('/guide/understanding-gpt')
def gpt_guide():
    """Render the comprehensive GPT guide page."""
    return render_template('gpt_guide.html', module_id='gpt', topic_id='architecture')

@app.route('/guide/finetuning-comparison')
def finetuning_comparison():
    """Render the fine-tuning methods comparison page."""
    return render_template('finetuning_comparison.html', module_id='fine-tuning', topic_id='comparison')

@app.route('/guide/pipeline-inference')
def pipeline_inference():
    """Render the pipeline inference guide page."""
    return render_template('exercise_pipeline.html', module_id='inference', topic_id='pipeline')

@app.route('/pipeline')
def pipeline():
    """Render the Hugging Face pipeline interactive page."""
    return render_template('pipeline.html')

@app.route('/guide/data-preparation')
def data_preparation():
    """Render the data preparation guide page."""
    return render_template('guides/data_preparation.html', module_id='data-preparation', topic_id='advanced')

@app.route('/guide/qlora-implementation')
def qlora_implementation():
    """Render the QLoRA implementation guide page."""
    return render_template('guides/qlora_implementation.html', module_id='qlora', topic_id='implementation')

@app.route('/guide/<guide_name>')
def guide(guide_name):
    """Generic guide route that maps guide_name to the appropriate route."""
    guide_routes = {
        'lora-implementation': lora_guide,
        'lora-hands-on': lora_hands_on,
        'instruction-tuning': instruction_tuning_guide,
        'understanding-gpt': gpt_guide,
        'finetuning-comparison': finetuning_comparison,
        'pipeline-inference': pipeline_inference,
        'data-preparation': data_preparation,
        'qlora-implementation': qlora_implementation,
        'peft-guide': peft_guide
    }

    if guide_name in guide_routes:
        return guide_routes[guide_name]()
    else:
        flash(f"Guide '{guide_name}' not found", "error")
        return redirect(url_for('index'))

@app.route('/tutorials')
def tutorials():
    """Render the tutorials page with links to Google Colab notebooks."""
    # Get user progress if authenticated
    user_progress = []
    if current_user.is_authenticated:
        try:
            from supabase_client import get_user_progress
            user_progress = get_user_progress(current_user.id)
        except Exception as e:
            app.logger.error(f"Error getting user progress: {e}")
            # Fallback to database progress if Supabase is not available
            user_progress = UserProgress.query.filter_by(user_id=current_user.id).all()

    return render_template('tutorials.html', user_progress=user_progress)

@app.route('/peft-guide')
def peft_guide():
    """Render the Parameter-Efficient Fine-Tuning guide page."""
    return render_template('peft_guide.html')

@app.route('/contact')
def contact():
    """Render the contact page."""
    return render_template('contact.html')

@app.route('/user-progress')
@login_required
def user_progress():
    """Render the user progress page."""
    # Get user progress from Supabase
    progress = []
    try:
        from supabase_client import get_user_progress
        progress = get_user_progress(current_user.id)
    except Exception as e:
        print(f"Error getting user progress: {e}")

    # Get user stats
    user_stats = {}
    try:
        from user_progress import get_user_completion_stats
        user_stats = get_user_completion_stats(current_user.id)
    except Exception as e:
        print(f"Error getting user stats: {e}")

    return render_template('user_progress.html', progress=progress, user_stats=user_stats)

@app.route('/user-activity')
@login_required
def user_activity():
    """Render the user activity page with real-time analytics."""
    from datetime import datetime, timedelta

    # Get user activity data
    user_activity = {
        'learning_time_hours': 12.5,  # Example value
        'tutorials_completed': 8,     # Example value
        'quizzes_completed': 5,       # Example value
        'exercises_completed': 3,     # Example value
        'timeline': [
            {
                'type': 'tutorial',
                'title': 'Completed Tutorial: Introduction to LLM Fine-Tuning',
                'description': 'You spent 25 minutes on this tutorial.',
                'link': '/tutorials/intro-to-llm-fine-tuning',
                'timestamp': datetime.now().strftime('%b %d, %Y at %I:%M %p')
            },
            {
                'type': 'quiz',
                'title': 'Completed Quiz: LLM Fundamentals',
                'description': 'You answered 8 out of 10 questions correctly.',
                'link': '/quiz/1',
                'timestamp': (datetime.now() - timedelta(days=1)).strftime('%b %d, %Y at %I:%M %p')
            },
            {
                'type': 'exercise',
                'title': 'Completed Exercise: LoRA Implementation',
                'description': 'You spent 45 minutes on this exercise.',
                'link': '/workshop/lora-basics',
                'timestamp': (datetime.now() - timedelta(days=2)).strftime('%b %d, %Y at %I:%M %p')
            },
            {
                'type': 'search',
                'title': 'Searched for: QLoRA parameters',
                'description': 'Found 12 results.',
                'link': '/thesaurus?q=QLoRA+parameters',
                'timestamp': (datetime.now() - timedelta(days=3)).strftime('%b %d, %Y at %I:%M %p')
            }
        ],
        'learning_patterns': {
            'labels': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            'data': [45, 60, 30, 90, 75, 120, 60]  # Minutes per day
        },
        'activity_distribution': {
            'tutorials': 25,
            'quizzes': 15,
            'exercises': 10,
            'searches': 50
        },
        'recent_content': [
            {
                'title': 'Introduction to LLM Fine-Tuning',
                'type': 'tutorial',
                'last_viewed': (datetime.now() - timedelta(days=1)).strftime('%b %d, %Y'),
                'progress': 100,
                'link': '/tutorials/intro-to-llm-fine-tuning'
            },
            {
                'title': 'LoRA Basics',
                'type': 'tutorial',
                'last_viewed': (datetime.now() - timedelta(days=3)).strftime('%b %d, %Y'),
                'progress': 75,
                'link': '/tutorials/lora-basics'
            },
            {
                'title': 'QLoRA Deep Dive',
                'type': 'exercise',
                'last_viewed': (datetime.now() - timedelta(days=5)).strftime('%b %d, %Y'),
                'progress': 50,
                'link': '/workshop/qlora-deep-dive'
            }
        ],
        'recent_searches': [
            {
                'term': 'QLoRA parameters',
                'results_count': 12,
                'timestamp': (datetime.now() - timedelta(days=3)).strftime('%b %d, %Y')
            },
            {
                'term': 'parameter efficient fine-tuning',
                'results_count': 7,
                'timestamp': (datetime.now() - timedelta(days=5)).strftime('%b %d, %Y')
            },
            {
                'term': 'gradient checkpointing',
                'results_count': 5,
                'timestamp': (datetime.now() - timedelta(days=7)).strftime('%b %d, %Y')
            }
        ],
        'popular_terms': [
            {'term': 'QLoRA', 'size': 24},
            {'term': 'fine-tuning', 'size': 22},
            {'term': 'LoRA', 'size': 20},
            {'term': 'parameters', 'size': 18},
            {'term': 'quantization', 'size': 18},
            {'term': 'gradient checkpointing', 'size': 16},
            {'term': 'memory efficiency', 'size': 16},
            {'term': 'PEFT', 'size': 14},
            {'term': 'adapters', 'size': 14},
            {'term': 'transformers', 'size': 12}
        ],
        'achievements': [
            {
                'title': 'First Tutorial',
                'description': 'Complete your first tutorial',
                'icon': 'bi-1-circle',
                'unlocked': True,
                'date': '2023-01-15',
                'progress': 100
            },
            {
                'title': 'Quiz Master',
                'description': 'Complete 5 quizzes',
                'icon': 'bi-trophy',
                'unlocked': True,
                'date': '2023-02-20',
                'progress': 100
            },
            {
                'title': 'Code Warrior',
                'description': 'Complete 3 coding exercises',
                'icon': 'bi-code-slash',
                'unlocked': True,
                'date': '2023-03-10',
                'progress': 100
            },
            {
                'title': 'Dedicated Learner',
                'description': 'Spend 10 hours learning',
                'icon': 'bi-clock-history',
                'unlocked': True,
                'date': '2023-04-05',
                'progress': 100
            }
        ]
    }

    # In a production environment, this would fetch real data from the analytics system
    # For now, we're using example data to demonstrate the functionality

    return render_template('user_activity.html', user_activity=user_activity)

@app.route('/frameworks')
def frameworks():
    """Render the frameworks overview page."""
    return render_template('frameworks.html')

@app.route('/frameworks/tensorflow')
def tensorflow():
    """Render the TensorFlow main page."""
    return render_template('tensorflow.html')

@app.route('/frameworks/pytorch')
def pytorch():
    """Render the PyTorch main page."""
    return render_template('pytorch.html')

@app.route('/frameworks/comparison')
def frameworks_comparison():
    """Render the frameworks comparison page."""
    return render_template('frameworks_comparison.html')

@app.route('/docker-guide')
def docker_guide():
    """Render the Docker guide for LLM fine-tuning."""
    return render_template('docker_guide.html')

@app.route('/login')
def login():
    """Redirect to auth login page."""
    return redirect(url_for('auth.login'))

@app.route('/register')
def register():
    """Redirect to auth register page."""
    return redirect(url_for('auth.register'))

@app.route('/profile')
@login_required
def profile():
    """Render the profile page."""
    return redirect(url_for('auth.profile'))

@app.route('/huggingface-guide')
def huggingface_guide():
    """Render the Hugging Face integration guide."""
    return render_template('huggingface_guide.html')

@app.route('/qlora-guide')
def qlora_guide_main():
    """Render the main QLoRA guide page."""
    return render_template('qlora_guide.html')

@app.route('/qlora-guide-part1')
def qlora_guide_part1():
    """Render part 1 of the QLoRA guide."""
    return render_template('qlora_guide_part1.html')

@app.route('/qlora-guide-part2')
def qlora_guide_part2():
    """Render part 2 of the QLoRA guide."""
    return render_template('qlora_guide_part2.html')

@app.route('/qlora-guide-part3')
def qlora_guide_part3():
    """Render part 3 of the QLoRA guide."""
    return render_template('qlora_guide_part3.html')

@app.route('/terms')
def terms():
    """Render the terms of service page."""
    return render_template('terms.html')

@app.route('/privacy')
def privacy():
    """Render the privacy policy page."""
    return render_template('privacy.html')

@app.route('/oauth_login/<provider>')
def oauth_login(provider):
    """Redirect to OAuth login for the specified provider."""
    return redirect(url_for(f'auth.{provider}'))

@app.route('/edit-profile')
@login_required
def edit_profile():
    """Render the edit profile page."""
    return redirect(url_for('auth.profile'))

@app.route('/view-model/<int:model_id>')
@login_required
def view_model(model_id):
    """View a specific model."""
    # This is a placeholder route - implement actual model viewing logic
    return render_template('model_viewer.html', model_id=model_id)

@app.route('/download-model/<int:model_id>')
@login_required
def download_model(model_id):
    """Download a specific model."""
    # This is a placeholder route - implement actual model download logic
    from flask import send_file
    import os

    # For now, just return a message
    flash(f"Model download functionality will be implemented soon.", "info")
    return redirect(url_for('profile'))

@app.route('/create-model')
def create_model():
    """Create a new model."""
    # This is a placeholder route - implement actual model creation logic
    return render_template('create_model.html')

@app.route('/view-quiz-result/<int:result_id>')
@login_required
def view_quiz_result(result_id):
    """View a specific quiz result."""
    # This is a placeholder route - implement actual quiz result viewing logic
    return render_template('quiz/quiz_result.html', result_id=result_id)

@app.route('/frameworks/tensorflow/exercises')
def tensorflow_exercises():
    """Render the TensorFlow exercises overview page."""
    return render_template('tensorflow_exercises.html')

@app.route('/frameworks/pytorch/exercises')
def pytorch_exercises():
    """Render the PyTorch exercises overview page."""
    return render_template('pytorch_exercises.html')

@app.route('/frameworks/tensorflow/exercises/<exercise_name>')
def tensorflow_exercise(exercise_name):
    """Render a specific TensorFlow exercise page."""
    return render_template(f'tensorflow_exercises/{exercise_name}.html')

@app.route('/frameworks/pytorch/exercises/<exercise_name>')
def pytorch_exercise(exercise_name):
    """Render a specific PyTorch exercise page."""
    return render_template(f'pytorch_exercises/{exercise_name}.html')

@app.route('/exercises')
def exercises():
    """Render the main exercises overview page."""
    return render_template('exercises.html')

@app.route('/notebooks/<path:filename>')
def serve_notebook(filename):
    """Serve notebook files directly."""
    return send_from_directory('static/notebooks', filename)

@app.route('/view-notebook/<notebook_name>')
def view_notebook(notebook_name):
    """Render a notebook viewer page."""
    notebook_filename = f"{notebook_name}.ipynb"

    # Map notebook names to friendly display names
    notebook_display_names = {
        'Data_Preparation_Tutorial': 'Data Preparation for LLM Fine-Tuning',
        'Tuning_Approaches_Comparison': 'Comparison of LLM Fine-Tuning Approaches',
        'LoRA_Fine_Tuning_Tutorial': 'LoRA Fine-Tuning Tutorial',
        'QLoRA_Fine_Tuning_Tutorial': 'QLoRA Fine-Tuning Tutorial',
        'Pipeline_Inference_Tutorial': 'Pipeline Inference Tutorial',
        'Gradient_Checkpointing_Tutorial': 'Gradient Checkpointing for Memory Optimization',
        'Mixed_Precision_Training_Tutorial': 'Mixed Precision Training for Faster Fine-Tuning',
        'Model_Deployment_Tutorial': 'Deploying Fine-Tuned Models to Production'
    }

    # Map notebook names to Colab URLs
    colab_urls = {
        'Data_Preparation_Tutorial': 'https://colab.research.google.com/drive/1-RfhVkZ3YFMbG5X5BWgO6CkVQs4Hh-Wy?usp=sharing',
        'Tuning_Approaches_Comparison': 'https://colab.research.google.com/drive/1Ej_MlmHpKJxmvADlFMJgJ8aF9Kt6d-0I?usp=sharing',
        'LoRA_Fine_Tuning_Tutorial': 'https://colab.research.google.com/drive/1Ej9vBLxCG9aJ8Hn0Z9NMZ9iQBKD7qkDQ?usp=sharing',
        'QLoRA_Fine_Tuning_Tutorial': 'https://colab.research.google.com/drive/1EjBWMQrjBbfxGk9GXRpRebRNwFicK-WR?usp=sharing',
        'Pipeline_Inference_Tutorial': 'https://colab.research.google.com/drive/1EjCXGQNMnMM_1RLyoKBfCLKzRtKS8Aw-?usp=sharing',
        'Gradient_Checkpointing_Tutorial': 'https://colab.research.google.com/drive/1EjDWMQrjBbfxGk9GXRpRebRNwFicK-WR?usp=sharing',
        'Mixed_Precision_Training_Tutorial': 'https://colab.research.google.com/drive/1EjDWMQrjBbfxGk9GXRpRebRNwFicK-WR?usp=sharing',
        'Model_Deployment_Tutorial': 'https://colab.research.google.com/drive/1EjCXGQNMnMM_1RLyoKBfCLKzRtKS8Aw-?usp=sharing'
    }

    display_name = notebook_display_names.get(notebook_name, notebook_name)
    colab_url = colab_urls.get(notebook_name, '')

    # Track user progress if authenticated
    user_progress = {}
    if current_user.is_authenticated:
        from user_progress import get_tutorial_progress, update_tutorial_progress

        # Mark tutorial as in progress
        update_tutorial_progress(notebook_name, 'in_progress')

        # Get current progress
        user_progress = get_tutorial_progress(notebook_name)

    return render_template('notebook_viewer.html',
                           notebook_name=display_name,
                           notebook_filename=notebook_filename,
                           colab_url=colab_url,
                           user_progress=user_progress)

@app.route('/concept/<concept_name>')
def concept_detail(concept_name):
    """Render the detail page for a specific LLM fine-tuning concept."""
    concept_info = llm_concepts_visualizer.get_concept_info(concept_name)
    if concept_info:
        return render_template('concept.html', concept=concept_info)
    else:
        return jsonify({'error': f"Concept '{concept_name}' not found"}), 404

@app.route('/api/thesaurus/<word>')
@csrf.exempt
def get_thesaurus_data(word):
    """Get thesaurus data for a specific word."""
    domain_graph = llm_thesaurus_instance.build_domain_graph(word)
    if domain_graph:
        # Convert the NetworkX graph to a serializable format
        nodes = []
        for node in domain_graph.nodes():
            nodes.append({
                'id': node,
                'label': domain_graph.nodes[node].get('label', node),
                'color': domain_graph.nodes[node].get('color', 'blue'),
                'size': domain_graph.nodes[node].get('size', 15)
            })

        edges = []
        for edge in domain_graph.edges():
            edges.append({
                'from': edge[0],
                'to': edge[1],
                'color': domain_graph.edges[edge].get('color', 'gray'),
                'label': domain_graph.edges[edge].get('label', '')
            })

        # Generate visualization path
        vis_path = f'static/visualizations/{word}_thesaurus.html'
        visual_thesaurus.graph = domain_graph
        visual_thesaurus.visualize_interactive(save_path=vis_path)

        return jsonify({
            'word': word,
            'nodes': nodes,
            'edges': edges,
            'visualization_path': vis_path
        })
    else:
        return jsonify({'error': f"Word '{word}' not found"}), 404

@app.route('/api/synonyms/<word>')
@csrf.exempt
def get_synonyms(word):
    """Get synonyms for a specific word."""
    domain_info = llm_thesaurus_instance.get_domain_relationships(word)
    if domain_info:
        synonyms = domain_info.get("synonyms", [])
        return jsonify({
            'word': word,
            'synonyms': synonyms
        })
    else:
        return jsonify({'word': word, 'synonyms': []}), 200

@app.route('/api/related-concepts/<topic>')
@csrf.exempt
def get_related_concepts(topic):
    """Get related concepts for a specific topic."""
    # First check if the topic is in our domain terms
    domain_info = llm_thesaurus_instance.get_domain_relationships(topic)
    if domain_info:
        related = domain_info.get("related", [])
        synonyms = domain_info.get("synonyms", [])
        # Combine related and synonyms for a more comprehensive list
        all_related = list(set(related + synonyms))
        return jsonify({
            'topic': topic,
            'related': all_related
        })
    else:
        # If not in domain terms, try to get related terms from WordNet
        try:
            from nltk.corpus import wordnet as wn
            synsets = wn.synsets(topic)
            related = []

            for synset in synsets[:3]:  # Limit to first 3 synsets to avoid too many results
                # Get lemma names (synonyms)
                for lemma in synset.lemmas():
                    if lemma.name() != topic:
                        related.append(lemma.name().replace('_', ' '))

                # Get hypernyms (more general terms)
                for hypernym in synset.hypernyms():
                    related.append(hypernym.lemmas()[0].name().replace('_', ' '))

                # Get hyponyms (more specific terms)
                for hyponym in synset.hyponyms():
                    related.append(hyponym.lemmas()[0].name().replace('_', ' '))

            # Remove duplicates and limit to 10 related terms
            related = list(set(related))[:10]

            return jsonify({
                'topic': topic,
                'related': related
            })
        except Exception as e:
            print(f"Error getting related concepts from WordNet: {e}")
            return jsonify({'topic': topic, 'related': []}), 200

@app.route('/api/learning-resources/<topic>')
@csrf.exempt
def get_learning_resources(topic):
    """Get learning resources for a specific topic."""
    # Map topics to learning resources
    topic_resources = {
        'fine-tuning': [
            {
                'title': 'Introduction to LLM Fine-Tuning',
                'description': 'Learn the basics of fine-tuning large language models',
                'url': '/learn#fine-tuning-basics'
            },
            {
                'title': 'Fine-Tuning Methods Comparison',
                'description': 'Compare different fine-tuning approaches',
                'url': '/guide/finetuning-comparison'
            }
        ],
        'lora': [
            {
                'title': 'LoRA Implementation Guide',
                'description': 'Step-by-step guide to implementing LoRA',
                'url': '/guide/lora-implementation'
            },
            {
                'title': 'LoRA Hands-On Workshop',
                'description': 'Practical workshop on using LoRA for fine-tuning',
                'url': '/workshop/lora-basics'
            }
        ],
        'qlora': [
            {
                'title': 'QLoRA Deep Dive',
                'description': 'In-depth exploration of QLoRA fine-tuning',
                'url': '/workshop/qlora-deep-dive'
            },
            {
                'title': 'Advanced QLoRA Techniques',
                'description': 'Advanced techniques for QLoRA fine-tuning',
                'url': '/advanced-qlora'
            }
        ],
        'gpt': [
            {
                'title': 'Understanding GPT Architecture',
                'description': 'Comprehensive guide to GPT architecture',
                'url': '/guide/understanding-gpt'
            }
        ],
        'data-preparation': [
            {
                'title': 'Data Preparation for LLM Fine-Tuning',
                'description': 'Learn how to prepare data for fine-tuning',
                'url': '/guide/data-preparation'
            }
        ],
        'inference': [
            {
                'title': 'Pipeline Inference Guide',
                'description': 'Guide to using the Hugging Face pipeline for inference',
                'url': '/guide/pipeline-inference'
            }
        ],
        'docker': [
            {
                'title': 'Docker for LLM Fine-Tuning',
                'description': 'Guide to using Docker for LLM fine-tuning',
                'url': '/guide/docker'
            }
        ]
    }

    # Check if the topic is in our map
    resources = []

    # First check for exact match
    if topic.lower() in topic_resources:
        resources = topic_resources[topic.lower()]
    else:
        # Check for partial matches
        for key, value in topic_resources.items():
            if key in topic.lower() or topic.lower() in key:
                resources.extend(value)

    # If no resources found, return empty list
    if not resources:
        # Try to find related topics
        domain_info = llm_thesaurus_instance.get_domain_relationships(topic)
        if domain_info:
            related = domain_info.get("related", [])
            synonyms = domain_info.get("synonyms", [])

            # Check if any related terms have resources
            for term in related + synonyms:
                if term.lower() in topic_resources:
                    resources.extend(topic_resources[term.lower()])

    # Remove duplicates
    unique_resources = []
    urls = set()
    for resource in resources:
        if resource['url'] not in urls:
            unique_resources.append(resource)
            urls.add(resource['url'])

    return jsonify({
        'topic': topic,
        'resources': unique_resources
    })

@app.route('/api/concept-definition/<concept>')
@csrf.exempt
def get_concept_definition(concept):
    """Get definition for a specific concept."""
    # First check if the concept is in our domain terms
    domain_info = llm_thesaurus_instance.get_domain_relationships(concept)
    if domain_info and 'description' in domain_info:
        return jsonify({
            'concept': concept,
            'definition': domain_info['description']
        })
    else:
        # If not in domain terms, try to get definition from WordNet
        try:
            from nltk.corpus import wordnet as wn
            synsets = wn.synsets(concept)

            if synsets:
                # Get the first definition
                definition = synsets[0].definition()
                return jsonify({
                    'concept': concept,
                    'definition': definition
                })
            else:
                return jsonify({
                    'concept': concept,
                    'definition': f"No definition available for '{concept}'"
                })
        except Exception as e:
            print(f"Error getting concept definition from WordNet: {e}")
            return jsonify({
                'concept': concept,
                'definition': f"No definition available for '{concept}'"
            })

@app.route('/api/related/<word>')
@csrf.exempt
def get_related_terms(word):
    """Get related terms for a specific word."""
    domain_info = llm_thesaurus_instance.get_domain_relationships(word)
    if domain_info:
        related_terms = domain_info.get("related", [])
        return jsonify({
            'word': word,
            'terms': related_terms
        })
    else:
        return jsonify({'word': word, 'terms': []}), 200

@app.route('/api/llm-concepts')
@csrf.exempt
def get_llm_concepts():
    """Get all LLM concepts."""
    concepts = llm_concepts_visualizer.get_all_concepts()
    return jsonify({
        'concepts': concepts
    })

@app.route('/api/llm-concepts-visualization')
@csrf.exempt
def get_llm_concepts_visualization():
    """Get visualization data for LLM concepts."""
    visualization_data = llm_concepts_visualizer.get_visualization_data()
    return jsonify(visualization_data)

@app.route('/api/analytics/track', methods=['POST'])
@csrf.exempt
def track_analytics():
    """Track analytics events."""
    try:
        data = request.json
        event_type = data.get('event_type')
        event_data = data.get('event_data', {})

        # Log the event for debugging
        app.logger.info(f"Analytics event: {event_type} - {event_data}")

        # In a production environment, you would store this in a database
        # For now, we'll just return success
        return jsonify({'status': 'success'}), 200
    except Exception as e:
        app.logger.error(f"Error tracking analytics: {e}")
        return jsonify({'error': 'Error tracking analytics', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5035, debug=True)
