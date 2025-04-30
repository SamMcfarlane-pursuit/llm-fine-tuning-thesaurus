"""
Flask web application for the Visual Thesaurus LLM project.
This provides a web interface for interacting with the thesaurus.
"""
import os
import ssl
import nltk
from flask import Flask, render_template, request, jsonify, send_from_directory, redirect, url_for, flash
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
app.register_blueprint(quiz_bp, url_prefix='/quiz')
app.register_blueprint(analytics_bp, url_prefix='/analytics')

# Register subscription blueprint
from subscription import subscription as subscription_bp
app.register_blueprint(subscription_bp, url_prefix='/subscription')

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
            return True

        except Exception as e:
            print(f"Error loading QLoRA model: {e}")
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
            return True
        except Exception as e:
            print(f"Error loading LoRA model: {e}")
            return False
    else:
        print("Model files not found. Please fine-tune the model first.")
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

@app.route('/guide/data-preparation')
def data_preparation():
    """Render the data preparation guide page."""
    return render_template('exercise_data_preparation.html', module_id='data-preparation', topic_id='advanced')

@app.route('/tutorials')
def tutorials():
    """Render the tutorials page with links to Google Colab notebooks."""
    # Get user progress if authenticated
    user_progress = []
    if current_user.is_authenticated:
        from supabase_client import get_user_progress
        user_progress = get_user_progress(current_user.id)

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
                'results_count': 8,
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
    """Redirect to auth profile page."""
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
    """Redirect to auth edit profile page."""
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
@login_required
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
        return render_template('404.html', message=f"Concept '{concept_name}' not found"), 404

@app.route('/api/thesaurus/<word>')
@csrf.exempt
def get_thesaurus_data(word):
    """API endpoint to get thesaurus data for a word or sentence."""
    # Create visualization directory if it doesn't exist
    os.makedirs('static/visualizations', exist_ok=True)

    try:
        # Keep track of the original input
        original_word = word

        # Define common stop words and question words
        stop_words = ['a', 'an', 'the', 'to', 'for', 'in', 'on', 'with', 'about', 'of', 'and', 'or', 'but', 'as', 'if', 'then', 'else', 'when', 'up', 'down', 'out', 'by', 'from', 'at', 'so', 'like']
        question_words = ['how', 'what', 'why', 'when', 'where', 'which', 'who', 'can', 'does', 'is', 'are', 'do', 'did', 'will', 'would', 'should', 'could']

        # Check if input contains multiple words
        if ' ' in word:
            print(f"Processing multi-word input: '{word}'")

            # Check if it's a question
            is_question = '?' in word or any(word.lower().startswith(q) for q in question_words)

            # Process the input to extract key terms
            words = word.lower().replace('?', '').replace(',', ' ').replace('.', ' ').replace('!', ' ').split()

            # Filter out stop words and short words
            key_terms = [w for w in words if w not in stop_words and w not in question_words and len(w) > 2]

            # Domain-specific terms to prioritize
            domain_terms = ['fine-tuning', 'lora', 'qlora', 'peft', 'llm', 'transformer', 'attention', 'embedding',
                           'tokenizer', 'prompt', 'inference', 'hyperparameter', 'training', 'model', 'neural',
                           'network', 'deep', 'learning', 'parameter', 'gradient', 'optimization', 'quantization']

            # First try to find domain-specific terms in the input
            domain_matches = [term for term in domain_terms if term in word.lower()]

            if domain_matches:
                # Use the longest matching domain term
                key_term = max(domain_matches, key=len)
                print(f"Found domain-specific term in input: '{key_term}'")
                word = key_term
            elif key_terms:
                # Try to find compound terms (e.g., "fine tuning" should match "fine-tuning")
                for i in range(len(key_terms) - 1):
                    compound = key_terms[i] + '-' + key_terms[i + 1]
                    if compound in domain_terms or compound.replace('-', '') in domain_terms:
                        print(f"Found compound term: '{compound}'")
                        word = compound
                        break
                else:
                    # If no compound terms found, use the longest key term
                    key_term = max(key_terms, key=len)
                    print(f"Using longest key term from input: '{key_term}'")
                    word = key_term
            else:
                # If no key terms found, use the first non-stop word
                for w in words:
                    if w not in stop_words and w not in question_words and len(w) > 2:
                        word = w
                        print(f"Using first non-stop word: '{word}'")
                        break
                else:
                    # If all else fails, just use the first word
                    word = words[0]
                    print(f"No suitable key terms found, using first word: '{word}'")

            print(f"Final extracted term from input: '{word}'")

        # Try to use domain-specific relationships first
        domain_graph = llm_thesaurus_instance.build_domain_graph(word)

        if domain_graph:
            # Use the domain-specific graph
            visual_thesaurus.graph = domain_graph
            print(f"Using domain-specific graph for '{word}'")
        else:
            # Fall back to WordNet
            visual_thesaurus.build_graph_for_word(word)

            # Try to enhance with domain-specific relationships
            enhanced = llm_thesaurus_instance.enhance_thesaurus_graph(visual_thesaurus, word)
            if enhanced:
                print(f"Enhanced graph for '{word}' with domain-specific relationships")

            # If the graph is still empty, try a default word
            if len(visual_thesaurus.graph.nodes()) == 0:
                # Try some domain-specific default words
                for default_word in ["fine-tuning", "llm", "docker", "happy"]:
                    print(f"No data found for '{word}'. Trying '{default_word}'...")

                    # Try domain-specific graph first
                    domain_graph = llm_thesaurus_instance.build_domain_graph(default_word)
                    if domain_graph:
                        visual_thesaurus.graph = domain_graph
                        word = default_word
                        print(f"Using domain-specific graph for '{default_word}'")
                        break

                    # Fall back to WordNet
                    visual_thesaurus.build_graph_for_word(default_word)
                    if len(visual_thesaurus.graph.nodes()) > 0:
                        word = default_word
                        print(f"Using WordNet graph for '{default_word}'")
                        break

        # Always regenerate the visualization to ensure it uses the latest template
        vis_path = f'static/visualizations/{word}_thesaurus.html'
        visual_thesaurus.visualize_interactive(save_path=vis_path)

        # Get node and edge data for the frontend (for compatibility)
        nodes = []
        for node in visual_thesaurus.graph.nodes():
            nodes.append({
                'id': node,
                'label': visual_thesaurus.graph.nodes[node].get('label', node),
                'color': visual_thesaurus.graph.nodes[node].get('color', 'blue'),
                'size': visual_thesaurus.graph.nodes[node].get('size', 15)
            })

        edges = []
        for edge in visual_thesaurus.graph.edges():
            edges.append({
                'from': edge[0],
                'to': edge[1],
                'color': visual_thesaurus.graph.edges[edge].get('color', 'gray'),
                'label': visual_thesaurus.graph.edges[edge].get('label', '')
            })

        return jsonify({
            'word': word,
            'original_query': original_word,
            'nodes': nodes,
            'edges': edges,
            'visualization_path': f'/static/visualizations/{word}_thesaurus.html'
        })
    except Exception as e:
        print(f"Error generating thesaurus visualization for '{word}': {e}")
        # Try with a default word as fallback
        try:
            default_word = "happy"
            print(f"Falling back to default word: '{default_word}'")
            visual_thesaurus.build_graph_for_word(default_word)

            # Always regenerate the visualization to ensure it uses the latest template
            vis_path = f'static/visualizations/{default_word}_thesaurus.html'
            visual_thesaurus.visualize_interactive(save_path=vis_path)

            return jsonify({
                'word': default_word,
                'original_query': word,
                'message': f"Could not visualize '{word}', showing '{default_word}' instead",
                'visualization_path': f'/static/visualizations/{default_word}_thesaurus.html'
            })
        except Exception as inner_e:
            print(f"Error with fallback visualization: {inner_e}")
            return jsonify({
                'error': f"Could not generate visualization",
                'message': str(e)
            }), 500

@app.route('/api/synonyms/<word>')
@csrf.exempt
def get_synonyms(word):
    """API endpoint to get synonyms for a word using the fine-tuned model."""
    try:
        # If model is not loaded, use WordNet as fallback
        if thesaurus_llm is None:
            from nltk.corpus import wordnet as wn

            # Use the same sentence processing logic as in get_thesaurus_data
            if ' ' in word:
                # Define common stop words and question words
                stop_words = ['a', 'an', 'the', 'to', 'for', 'in', 'on', 'with', 'about', 'of', 'and', 'or', 'but', 'as', 'if', 'then', 'else', 'when', 'up', 'down', 'out', 'by', 'from', 'at', 'so', 'like']
                question_words = ['how', 'what', 'why', 'when', 'where', 'which', 'who', 'can', 'does', 'is', 'are', 'do', 'did', 'will', 'would', 'should', 'could']

                # Process the input to extract key terms
                words = word.lower().replace('?', '').replace(',', ' ').replace('.', ' ').replace('!', ' ').split()

                # Filter out stop words and short words
                key_terms = [w for w in words if w not in stop_words and w not in question_words and len(w) > 2]

                # Domain-specific terms to prioritize
                domain_terms = ['fine-tuning', 'lora', 'qlora', 'peft', 'llm', 'transformer', 'attention', 'embedding',
                               'tokenizer', 'prompt', 'inference', 'hyperparameter', 'training', 'model', 'neural',
                               'network', 'deep', 'learning', 'parameter', 'gradient', 'optimization', 'quantization']

                # First try to find domain-specific terms in the input
                domain_matches = [term for term in domain_terms if term in word.lower()]

                if domain_matches:
                    # Use the longest matching domain term
                    word = max(domain_matches, key=len)
                elif key_terms:
                    # Try to find compound terms (e.g., "fine tuning" should match "fine-tuning")
                    for i in range(len(key_terms) - 1):
                        compound = key_terms[i] + '-' + key_terms[i + 1]
                        if compound in domain_terms or compound.replace('-', '') in domain_terms:
                            word = compound
                            break
                    else:
                        # If no compound terms found, use the longest key term
                        word = max(key_terms, key=len)
                else:
                    # If no key terms found, use the first non-stop word
                    for w in words:
                        if w not in stop_words and w not in question_words and len(w) > 2:
                            word = w
                            break
                    else:
                        # If all else fails, just use the first word
                        word = words[0]

            # Handle case where no synsets are found
            if not wn.synsets(word):
                return jsonify({'word': word, 'synonyms': []})

            synonyms = []
            for synset in wn.synsets(word):
                for lemma in synset.lemmas():
                    if lemma.name() != word and '_' not in lemma.name():
                        synonyms.append(lemma.name())

            # Remove duplicates and limit to 10
            synonyms = list(set(synonyms))[:10]
            return jsonify({'word': word, 'synonyms': synonyms})
        else:
            synonyms = thesaurus_llm.get_synonyms(word)
            return jsonify({'word': word, 'synonyms': synonyms})
    except Exception as e:
        print(f"Error getting synonyms for '{word}': {e}")
        # Return empty list instead of error to avoid breaking the UI
        return jsonify({'word': word, 'synonyms': []})

@app.route('/api/antonyms/<word>')
@csrf.exempt
def get_antonyms(word):
    """API endpoint to get antonyms for a word using the fine-tuned model."""
    try:
        # If model is not loaded, use WordNet as fallback
        if thesaurus_llm is None:
            from nltk.corpus import wordnet as wn

            # Use the same sentence processing logic as in get_thesaurus_data
            if ' ' in word:
                # Define common stop words and question words
                stop_words = ['a', 'an', 'the', 'to', 'for', 'in', 'on', 'with', 'about', 'of', 'and', 'or', 'but', 'as', 'if', 'then', 'else', 'when', 'up', 'down', 'out', 'by', 'from', 'at', 'so', 'like']
                question_words = ['how', 'what', 'why', 'when', 'where', 'which', 'who', 'can', 'does', 'is', 'are', 'do', 'did', 'will', 'would', 'should', 'could']

                # Process the input to extract key terms
                words = word.lower().replace('?', '').replace(',', ' ').replace('.', ' ').replace('!', ' ').split()

                # Filter out stop words and short words
                key_terms = [w for w in words if w not in stop_words and w not in question_words and len(w) > 2]

                # Domain-specific terms to prioritize
                domain_terms = ['fine-tuning', 'lora', 'qlora', 'peft', 'llm', 'transformer', 'attention', 'embedding',
                               'tokenizer', 'prompt', 'inference', 'hyperparameter', 'training', 'model', 'neural',
                               'network', 'deep', 'learning', 'parameter', 'gradient', 'optimization', 'quantization']

                # First try to find domain-specific terms in the input
                domain_matches = [term for term in domain_terms if term in word.lower()]

                if domain_matches:
                    # Use the longest matching domain term
                    word = max(domain_matches, key=len)
                elif key_terms:
                    # Try to find compound terms (e.g., "fine tuning" should match "fine-tuning")
                    for i in range(len(key_terms) - 1):
                        compound = key_terms[i] + '-' + key_terms[i + 1]
                        if compound in domain_terms or compound.replace('-', '') in domain_terms:
                            word = compound
                            break
                    else:
                        # If no compound terms found, use the longest key term
                        word = max(key_terms, key=len)
                else:
                    # If no key terms found, use the first non-stop word
                    for w in words:
                        if w not in stop_words and w not in question_words and len(w) > 2:
                            word = w
                            break
                    else:
                        # If all else fails, just use the first word
                        word = words[0]

            # Handle case where no synsets are found
            if not wn.synsets(word):
                return jsonify({'word': word, 'antonyms': []})

            antonyms = []
            for synset in wn.synsets(word):
                for lemma in synset.lemmas():
                    for antonym in lemma.antonyms():
                        if '_' not in antonym.name():
                            antonyms.append(antonym.name())

            # Remove duplicates
            antonyms = list(set(antonyms))
            return jsonify({'word': word, 'antonyms': antonyms})
        else:
            antonyms = thesaurus_llm.get_antonyms(word)
            return jsonify({'word': word, 'antonyms': antonyms})
    except Exception as e:
        print(f"Error getting antonyms for '{word}': {e}")
        # Return empty list instead of error to avoid breaking the UI
        return jsonify({'word': word, 'antonyms': []})

@app.route('/api/related/<word>')
@csrf.exempt
def get_related_terms(word):
    """API endpoint to get related terms for a word."""
    relation_type = request.args.get('type', 'hypernyms')

    try:
        # If model is not loaded, use WordNet as fallback
        if thesaurus_llm is None:
            from nltk.corpus import wordnet as wn

            # Use the same sentence processing logic as in get_thesaurus_data
            if ' ' in word:
                # Define common stop words and question words
                stop_words = ['a', 'an', 'the', 'to', 'for', 'in', 'on', 'with', 'about', 'of', 'and', 'or', 'but', 'as', 'if', 'then', 'else', 'when', 'up', 'down', 'out', 'by', 'from', 'at', 'so', 'like']
                question_words = ['how', 'what', 'why', 'when', 'where', 'which', 'who', 'can', 'does', 'is', 'are', 'do', 'did', 'will', 'would', 'should', 'could']

                # Process the input to extract key terms
                words = word.lower().replace('?', '').replace(',', ' ').replace('.', ' ').replace('!', ' ').split()

                # Filter out stop words and short words
                key_terms = [w for w in words if w not in stop_words and w not in question_words and len(w) > 2]

                # Domain-specific terms to prioritize
                domain_terms = ['fine-tuning', 'lora', 'qlora', 'peft', 'llm', 'transformer', 'attention', 'embedding',
                               'tokenizer', 'prompt', 'inference', 'hyperparameter', 'training', 'model', 'neural',
                               'network', 'deep', 'learning', 'parameter', 'gradient', 'optimization', 'quantization']

                # First try to find domain-specific terms in the input
                domain_matches = [term for term in domain_terms if term in word.lower()]

                if domain_matches:
                    # Use the longest matching domain term
                    word = max(domain_matches, key=len)
                elif key_terms:
                    # Try to find compound terms (e.g., "fine tuning" should match "fine-tuning")
                    for i in range(len(key_terms) - 1):
                        compound = key_terms[i] + '-' + key_terms[i + 1]
                        if compound in domain_terms or compound.replace('-', '') in domain_terms:
                            word = compound
                            break
                    else:
                        # If no compound terms found, use the longest key term
                        word = max(key_terms, key=len)
                else:
                    # If no key terms found, use the first non-stop word
                    for w in words:
                        if w not in stop_words and w not in question_words and len(w) > 2:
                            word = w
                            break
                    else:
                        # If all else fails, just use the first word
                        word = words[0]

            # Handle case where no synsets are found
            if not wn.synsets(word):
                return jsonify({'word': word, 'relation_type': relation_type, 'terms': []})

            related_terms = []
            for synset in wn.synsets(word):
                if relation_type == 'hypernyms':
                    for hypernym in synset.hypernyms():
                        for lemma in hypernym.lemmas():
                            if '_' not in lemma.name():
                                related_terms.append(lemma.name())
                elif relation_type == 'hyponyms':
                    for hyponym in synset.hyponyms():
                        for lemma in hyponym.lemmas():
                            if '_' not in lemma.name():
                                related_terms.append(lemma.name())

            # Remove duplicates and limit to 10
            related_terms = list(set(related_terms))[:10]
            return jsonify({'word': word, 'relation_type': relation_type, 'terms': related_terms})
        else:
            related_terms = thesaurus_llm.get_related_terms(word, relation_type=relation_type)
            return jsonify({'word': word, 'relation_type': relation_type, 'terms': related_terms})
    except Exception as e:
        print(f"Error getting related terms for '{word}': {e}")
        # Return empty list instead of error to avoid breaking the UI
        return jsonify({'word': word, 'relation_type': relation_type, 'terms': []})

@app.route('/api/ask', methods=['POST'])
@csrf.exempt
def ask_question():
    """API endpoint to ask a question to the model."""
    data = request.json
    question = data.get('question', '')

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    try:
        # If model is not loaded, provide a generic response
        if thesaurus_llm is None:
            # Simple keyword-based responses for common questions
            question_lower = question.lower()

            if 'synonym' in question_lower:
                answer = "Synonyms are words that have the same or similar meanings. For example, 'happy' and 'joyful' are synonyms."
            elif 'antonym' in question_lower:
                answer = "Antonyms are words that have opposite meanings. For example, 'hot' and 'cold' are antonyms."
            elif 'hypernym' in question_lower or 'general' in question_lower:
                answer = "Hypernyms are words with a broader meaning that includes the meanings of more specific words. For example, 'animal' is a hypernym of 'dog'."
            elif 'hyponym' in question_lower or 'specific' in question_lower:
                answer = "Hyponyms are words with a more specific meaning than a general term. For example, 'dog' is a hyponym of 'animal'."
            elif 'fine-tun' in question_lower or 'finetun' in question_lower:
                answer = "Fine-tuning is the process of taking a pre-trained language model and further training it on a specific dataset to adapt it for particular tasks. In this project, we fine-tune a model to understand word relationships for a thesaurus application."
            elif 'lora' in question_lower:
                answer = "LoRA (Low-Rank Adaptation) is a parameter-efficient fine-tuning technique that adds trainable low-rank matrices to the model's weights while keeping the original weights frozen. This reduces memory requirements and training time."
            else:
                answer = "I'm sorry, I don't have a specific answer for that question. Please try asking about synonyms, antonyms, hypernyms, hyponyms, fine-tuning, or LoRA."

            return jsonify({'question': question, 'answer': answer})
        else:
            answer = thesaurus_llm.answer_question(question)
            return jsonify({'question': question, 'answer': answer})
    except Exception as e:
        print(f"Error answering question: {e}")
        return jsonify({'error': 'Error processing your question', 'message': str(e)}), 500

@app.route('/api/llm-concepts')
def get_llm_concepts():
    """API endpoint to get all LLM fine-tuning concepts."""
    concepts = llm_concepts_visualizer.get_all_concepts()
    return jsonify({'concepts': concepts})

@app.route('/api/llm-concept/<concept_name>')
def get_llm_concept(concept_name):
    """API endpoint to get information about a specific LLM fine-tuning concept."""
    concept_info = llm_concepts_visualizer.get_concept_info(concept_name)
    if concept_info:
        return jsonify(concept_info)
    else:
        return jsonify({'error': f"Concept '{concept_name}' not found"}), 404

@app.route('/api/llm-concepts-visualization')
def get_llm_concepts_visualization():
    """API endpoint to get the LLM concepts visualization."""
    try:
        # Create visualization directory if it doesn't exist
        os.makedirs('static/visualizations', exist_ok=True)

        # Always regenerate the visualization to ensure it uses the latest template
        llm_concepts_visualizer.create_web_visualization()

        # Return the path to the visualization
        return jsonify({
            'visualization_path': f'/static/visualizations/llm_concepts.html'
        })
    except Exception as e:
        print(f"Error generating LLM concepts visualization: {e}")
        return jsonify({
            'error': 'Could not generate LLM concepts visualization',
            'message': str(e)
        }), 500

@app.route('/api/progress/update', methods=['POST'])
@csrf.exempt
def update_progress():
    """API endpoint to update user progress."""
    data = request.json

    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400

    content_type = data.get('content_type')
    content_id = data.get('content_id')
    status = data.get('status')
    progress_data = data.get('progress_data')

    if not content_type or not content_id or not status:
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400

    try:
        from user_progress import update_progress
        result = update_progress(content_type, content_id, status, progress_data)

        return jsonify({'success': result})
    except Exception as e:
        print(f"Error updating progress: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analytics/track', methods=['POST'])
@csrf.exempt
def track_analytics_event():
    """API endpoint to track analytics events."""
    data = request.json

    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400

    event_type = data.get('event_type')
    event_data = data.get('event_data')

    if not event_type:
        return jsonify({'success': False, 'error': 'Missing event type'}), 400

    try:
        import analytics
        result = analytics.track_event(event_type, event_data)

        return jsonify({'success': result is not None})
    except Exception as e:
        print(f"Error tracking analytics event: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analytics/real-time')
@login_required
def get_real_time_analytics():
    """API endpoint to get real-time analytics data."""
    try:
        import analytics
        from datetime import datetime, timedelta
        import random  # For demo data

        # In a production environment, this would fetch real data from the analytics system
        # For now, we're using example data with some randomization to simulate real-time changes

        # Get basic stats
        active_users = random.randint(15, 50)  # Simulate 15-50 active users
        page_views_today = random.randint(200, 500)  # Simulate 200-500 page views today
        completion_rate = round(random.uniform(65.0, 85.0), 1)  # Simulate 65-85% completion rate
        conversion_rate = round(random.uniform(8.0, 15.0), 1)  # Simulate 8-15% conversion rate

        # Generate user activity data for the past 7 days
        labels = []
        active_users_data = []
        page_views_data = []

        today = datetime.now().date()
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            labels.append(day.strftime('%a'))

            # Generate random data with an upward trend
            base_users = 30 + (6-i) * 5  # Increasing trend
            base_views = 300 + (6-i) * 50  # Increasing trend

            # Add some randomness
            active_users_data.append(base_users + random.randint(-10, 10))
            page_views_data.append(base_views + random.randint(-50, 50))

        # Generate content performance data
        tutorials = [
            {
                'title': 'Introduction to LLM Fine-Tuning',
                'views': 1250 + random.randint(-20, 20),
                'completions': 980 + random.randint(-10, 10),
                'completion_rate': round(random.uniform(75.0, 82.0), 1),
                'avg_time_spent': round(random.uniform(14.0, 17.0), 1),
                'rating': round(random.uniform(4.5, 4.9), 1)
            },
            {
                'title': 'LoRA Basics',
                'views': 950 + random.randint(-15, 15),
                'completions': 720 + random.randint(-10, 10),
                'completion_rate': round(random.uniform(72.0, 78.0), 1),
                'avg_time_spent': round(random.uniform(20.0, 24.0), 1),
                'rating': round(random.uniform(4.3, 4.7), 1)
            },
            {
                'title': 'QLoRA Implementation',
                'views': 820 + random.randint(-15, 15),
                'completions': 590 + random.randint(-10, 10),
                'completion_rate': round(random.uniform(68.0, 75.0), 1),
                'avg_time_spent': round(random.uniform(28.0, 32.0), 1),
                'rating': round(random.uniform(4.6, 5.0), 1)
            }
        ]

        quizzes = [
            {
                'title': 'LLM Fundamentals Quiz',
                'attempts': 850 + random.randint(-15, 15),
                'completions': 780 + random.randint(-10, 10),
                'pass_rate': round(random.uniform(88.0, 94.0), 1),
                'avg_score': round(random.uniform(80.0, 85.0), 1),
                'difficulty': 25
            },
            {
                'title': 'LoRA Techniques Quiz',
                'attempts': 720 + random.randint(-15, 15),
                'completions': 620 + random.randint(-10, 10),
                'pass_rate': round(random.uniform(83.0, 89.0), 1),
                'avg_score': round(random.uniform(75.0, 82.0), 1),
                'difficulty': 55
            },
            {
                'title': 'Advanced Fine-Tuning Quiz',
                'attempts': 580 + random.randint(-15, 15),
                'completions': 420 + random.randint(-10, 10),
                'pass_rate': round(random.uniform(68.0, 76.0), 1),
                'avg_score': round(random.uniform(65.0, 72.0), 1),
                'difficulty': 85
            }
        ]

        exercises = [
            {
                'title': 'Basic Fine-Tuning Exercise',
                'attempts': 720 + random.randint(-15, 15),
                'completions': 650 + random.randint(-10, 10),
                'completion_rate': round(random.uniform(87.0, 93.0), 1),
                'avg_time_spent': round(random.uniform(23.0, 28.0), 1),
                'difficulty': 30
            },
            {
                'title': 'LoRA Implementation Exercise',
                'attempts': 580 + random.randint(-15, 15),
                'completions': 490 + random.randint(-10, 10),
                'completion_rate': round(random.uniform(81.0, 88.0), 1),
                'avg_time_spent': round(random.uniform(33.0, 38.0), 1),
                'difficulty': 60
            },
            {
                'title': 'QLoRA Advanced Exercise',
                'attempts': 420 + random.randint(-15, 15),
                'completions': 320 + random.randint(-10, 10),
                'completion_rate': round(random.uniform(73.0, 79.0), 1),
                'avg_time_spent': round(random.uniform(43.0, 48.0), 1),
                'difficulty': 85
            }
        ]

        # Generate user journey data
        user_journey = {
            'signup_to_tutorial': round(random.uniform(75.0, 85.0), 1),
            'tutorial_to_quiz': round(random.uniform(60.0, 70.0), 1),
            'quiz_to_subscription': round(random.uniform(25.0, 35.0), 1),
            'average_tutorials_per_user': round(random.uniform(3.5, 4.5), 1),
            'average_quizzes_per_user': round(random.uniform(2.0, 3.0), 1),
            'average_time_to_subscription': random.randint(12, 16)
        }

        return jsonify({
            'active_users': active_users,
            'page_views_today': page_views_today,
            'completion_rate': completion_rate,
            'conversion_rate': conversion_rate,
            'user_activity': {
                'labels': labels,
                'active_users': active_users_data,
                'page_views': page_views_data
            },
            'content_performance': {
                'tutorials': tutorials,
                'quizzes': quizzes,
                'exercises': exercises
            },
            'user_journey': user_journey
        })
    except Exception as e:
        print(f"Error getting real-time analytics: {e}")
        return jsonify({'error': 'Error getting real-time analytics', 'message': str(e)}), 500

@app.route('/api/llm-term/<term>')
def get_llm_term(term):
    """API endpoint to get detailed information about an LLM fine-tuning term."""
    # Use the same sentence processing logic as in get_thesaurus_data
    if ' ' in term:
        print(f"Processing multi-word input: '{term}'")

        # Define common stop words and question words
        stop_words = ['a', 'an', 'the', 'to', 'for', 'in', 'on', 'with', 'about', 'of', 'and', 'or', 'but', 'as', 'if', 'then', 'else', 'when', 'up', 'down', 'out', 'by', 'from', 'at', 'so', 'like']
        question_words = ['how', 'what', 'why', 'when', 'where', 'which', 'who', 'can', 'does', 'is', 'are', 'do', 'did', 'will', 'would', 'should', 'could']

        # Check if it's a question
        is_question = '?' in term or any(term.lower().startswith(q) for q in question_words)
        if is_question:
            print(f"Input appears to be a question: '{term}'")

        # Process the input to extract key terms
        words = term.lower().replace('?', '').replace(',', ' ').replace('.', ' ').replace('!', ' ').split()

        # Filter out stop words and short words
        key_terms = [w for w in words if w not in stop_words and w not in question_words and len(w) > 2]

        # Domain-specific terms to prioritize
        domain_terms = ['fine-tuning', 'lora', 'qlora', 'peft', 'llm', 'transformer', 'attention', 'embedding',
                       'tokenizer', 'prompt', 'inference', 'hyperparameter', 'training', 'model', 'neural',
                       'network', 'deep', 'learning', 'parameter', 'gradient', 'optimization', 'quantization']

        # First try to find domain-specific terms in the input
        domain_matches = [t for t in domain_terms if t in term.lower()]

        if domain_matches:
            # Use the longest matching domain term
            original_term = term
            term = max(domain_matches, key=len)
            print(f"Found domain-specific term in input: '{term}' from '{original_term}'")
        elif key_terms:
            # Try to find compound terms (e.g., "fine tuning" should match "fine-tuning")
            for i in range(len(key_terms) - 1):
                compound = key_terms[i] + '-' + key_terms[i + 1]
                if compound in domain_terms or compound.replace('-', '') in domain_terms:
                    original_term = term
                    term = compound
                    print(f"Found compound term: '{term}' from '{original_term}'")
                    break
            else:
                # If no compound terms found, use the longest key term
                original_term = term
                term = max(key_terms, key=len)
                print(f"Using longest key term: '{term}' from '{original_term}'")
        else:
            # If no key terms found, use the first non-stop word
            for w in words:
                if w not in stop_words and w not in question_words and len(w) > 2:
                    original_term = term
                    term = w
                    print(f"Using first non-stop word: '{term}' from '{original_term}'")
                    break
            else:
                # If all else fails, just use the first word
                original_term = term
                term = words[0]
                print(f"No suitable key terms found, using first word: '{term}' from '{original_term}'")

        print(f"Final extracted term from input: '{term}'")

    # Get the term information from the LLM thesaurus
    domain_terms = llm_thesaurus_instance.domain_terms
    term_info = domain_terms.get(term.lower())

    if term_info:
        # Format the response
        response = {
            'term': term,
            'description': term_info.get('description', 'No description available'),
            'synonyms': term_info.get('synonyms', []),
            'related': term_info.get('related', [])
        }

        # Add detailed explanation based on the term
        if term == 'fine-tuning':
            response['explanation'] = '''
                <h5>Fine-tuning Process</h5>
                <p>Fine-tuning adapts a pre-trained model to specific tasks by training it on a smaller, task-specific dataset. This process leverages the general knowledge learned during pre-training while specializing the model for particular applications.</p>

                <h5>Key Components</h5>
                <ul>
                    <li><strong>Pre-trained Model</strong>: A model like GPT, BERT, or T5 that has been trained on a large corpus of text.</li>
                    <li><strong>Task-specific Dataset</strong>: A smaller dataset relevant to your specific application.</li>
                    <li><strong>Training Procedure</strong>: The process of updating the model's weights based on the task-specific dataset.</li>
                </ul>

                <h5>Benefits</h5>
                <ul>
                    <li>Requires significantly less data than training from scratch</li>
                    <li>Achieves better performance on specific tasks</li>
                    <li>Reduces training time and computational resources</li>
                </ul>
            '''
            response['examples'] = '''
                # Fine-tuning a model with the Transformers library
                from transformers import AutoModelForCausalLM, AutoTokenizer, Trainer, TrainingArguments

                # Load pre-trained model and tokenizer
                model_name = "gpt2"
                model = AutoModelForCausalLM.from_pretrained(model_name)
                tokenizer = AutoTokenizer.from_pretrained(model_name)

                # Prepare your dataset
                # ...

                # Define training arguments
                training_args = TrainingArguments(
                    output_dir="./results",
                    num_train_epochs=3,
                    per_device_train_batch_size=8,
                    save_steps=500,
                    save_total_limit=2,
                )

                # Create Trainer and train the model
                trainer = Trainer(
                    model=model,
                    args=training_args,
                    train_dataset=train_dataset,
                )

                trainer.train()

                # Save the fine-tuned model
                model.save_pretrained("./fine-tuned-model")
                tokenizer.save_pretrained("./fine-tuned-model")
            '''
        elif term == 'lora':
            response['explanation'] = '''
                <h5>Low-Rank Adaptation (LoRA)</h5>
                <p>LoRA is a parameter-efficient fine-tuning technique that freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture.</p>

                <h5>How LoRA Works</h5>
                <p>For a pre-trained weight matrix W, LoRA parameterizes its change during fine-tuning as:</p>
                <p>W + ΔW = W + BA</p>
                <p>Where:</p>
                <ul>
                    <li>W is the frozen pre-trained weight matrix</li>
                    <li>B is a matrix of size d×r</li>
                    <li>A is a matrix of size r×k</li>
                    <li>r is the rank, which is much smaller than min(d,k)</li>
                </ul>

                <h5>Benefits</h5>
                <ul>
                    <li>Significantly reduces the number of trainable parameters</li>
                    <li>Reduces GPU memory requirements</li>
                    <li>Faster training and inference</li>
                    <li>Enables model merging and composition</li>
                </ul>
            '''
            response['examples'] = '''
                # Fine-tuning with LoRA using the PEFT library
                from transformers import AutoModelForCausalLM, AutoTokenizer
                from peft import LoraConfig, get_peft_model, TaskType

                # Load pre-trained model and tokenizer
                model_name = "gpt2"
                model = AutoModelForCausalLM.from_pretrained(model_name)
                tokenizer = AutoTokenizer.from_pretrained(model_name)

                # Define LoRA configuration
                lora_config = LoraConfig(
                    task_type=TaskType.CAUSAL_LM,
                    r=8,                     # Rank of the update matrices
                    lora_alpha=32,           # Parameter for scaling
                    lora_dropout=0.1,        # Dropout probability for LoRA layers
                    target_modules=["c_attn", "c_proj"]  # Attention modules to apply LoRA to
                )

                # Apply LoRA to the model
                peft_model = get_peft_model(model, lora_config)

                # Now train the model as usual
                # ...

                # Save the LoRA adapter only (much smaller than full model)
                peft_model.save_pretrained("./lora-adapter")
            '''
        elif term == 'docker':
            response['explanation'] = '''
                <h5>Docker for ML Model Deployment</h5>
                <p>Docker is a platform that uses containerization to package applications and their dependencies together, ensuring consistent behavior across different environments. For LLM fine-tuning and deployment, Docker provides a standardized environment that simplifies the deployment process and ensures reproducibility.</p>

                <h5>Key Components</h5>
                <ul>
                    <li><strong>Dockerfile</strong>: A text file with instructions to build a Docker image, specifying the base image, dependencies, and configuration</li>
                    <li><strong>Image</strong>: A lightweight, standalone, executable package that includes everything needed to run the application (code, runtime, libraries, environment variables)</li>
                    <li><strong>Container</strong>: A running instance of an image that can be started, stopped, moved, and deleted</li>
                    <li><strong>Docker Compose</strong>: A tool for defining and running multi-container Docker applications</li>
                    <li><strong>Docker Hub</strong>: A cloud-based registry service for sharing container images</li>
                </ul>

                <h5>Docker for LLM Fine-Tuning</h5>
                <p>When fine-tuning LLMs, Docker provides several advantages:</p>
                <ul>
                    <li><strong>GPU Support</strong>: Docker can be configured to use GPUs for accelerated training with NVIDIA Container Toolkit</li>
                    <li><strong>Environment Consistency</strong>: Ensures all dependencies and libraries are consistent across development and production</li>
                    <li><strong>Version Control</strong>: Docker images can be versioned, allowing you to track different model versions</li>
                    <li><strong>Resource Isolation</strong>: Containers can be configured with specific memory and CPU limits</li>
                </ul>

                <h5>Benefits for ML Deployment</h5>
                <ul>
                    <li><strong>Reproducibility</strong>: Ensures the model runs the same way in development and production</li>
                    <li><strong>Isolation</strong>: Prevents conflicts between dependencies and system libraries</li>
                    <li><strong>Portability</strong>: Runs consistently across different environments (local, cloud, on-premises)</li>
                    <li><strong>Scalability</strong>: Easily scale up or down based on demand, especially when used with orchestration tools like Kubernetes</li>
                    <li><strong>CI/CD Integration</strong>: Simplifies continuous integration and deployment pipelines</li>
                </ul>

                <h5>Docker vs. Virtual Machines</h5>
                <p>Docker containers are more lightweight than virtual machines because they share the host system's kernel and isolate the application processes from each other. This results in faster startup times and lower resource overhead, which is particularly important for deploying multiple LLM instances.</p>
            '''
            response['examples'] = '''
                # Dockerfile for deploying a fine-tuned model with GPU support
                FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04

                # Set working directory
                WORKDIR /app

                # Install Python and pip
                RUN apt-get update && apt-get install -y \
                    python3 \
                    python3-pip \
                    && rm -rf /var/lib/apt/lists/*

                # Install dependencies
                COPY requirements.txt .
                RUN pip3 install --no-cache-dir -r requirements.txt

                # Copy model files and code
                COPY ./fine-tuned-model /app/fine-tuned-model
                COPY app.py .

                # Expose port
                EXPOSE 5000

                # Set environment variables
                ENV MODEL_PATH=/app/fine-tuned-model
                ENV CUDA_VISIBLE_DEVICES=0

                # Run the application
                CMD ["python3", "app.py"]

                # Build and run commands with GPU support:
                # docker build -t my-llm-model .
                # docker run --gpus all -p 5000:5000 my-llm-model

                # Docker Compose example (docker-compose.yml):
                # version: "3.8"
                # services:
                #   llm-api:
                #     build: .
                #     ports:
                #       - "5000:5000"
                #     deploy:
                #       resources:
                #         reservations:
                #           devices:
                #             - driver: nvidia
                #               count: 1
                #               capabilities: [gpu]
            '''
        elif term == 'peft':
            response['explanation'] = '''
                <h5>Parameter-Efficient Fine-Tuning (PEFT)</h5>
                <p>PEFT refers to a family of techniques that fine-tune large language models by updating only a small subset of parameters, significantly reducing memory and computational requirements.</p>

                <h5>Popular PEFT Methods</h5>
                <ul>
                    <li><strong>LoRA (Low-Rank Adaptation)</strong>: Adds trainable low-rank matrices to existing weights</li>
                    <li><strong>Prefix Tuning</strong>: Prepends trainable vectors to the hidden states at each layer</li>
                    <li><strong>Prompt Tuning</strong>: Optimizes continuous prompt embeddings while keeping the model frozen</li>
                    <li><strong>Adapter Layers</strong>: Inserts small trainable modules between layers of the frozen model</li>
                </ul>

                <h5>Benefits</h5>
                <ul>
                    <li>Reduces memory requirements by up to 90%</li>
                    <li>Enables fine-tuning of larger models on consumer hardware</li>
                    <li>Faster training and inference</li>
                    <li>Prevents catastrophic forgetting</li>
                </ul>
            '''
            response['examples'] = '''
                # Using the PEFT library for different methods
                from transformers import AutoModelForCausalLM
                from peft import (
                    get_peft_model,
                    LoraConfig,
                    PrefixTuningConfig,
                    PromptTuningConfig,
                    TaskType
                )

                model = AutoModelForCausalLM.from_pretrained("gpt2")

                # LoRA configuration
                lora_config = LoraConfig(
                    task_type=TaskType.CAUSAL_LM,
                    r=8,
                    lora_alpha=32,
                    target_modules=["c_attn"]
                )

                # Prefix Tuning configuration
                prefix_config = PrefixTuningConfig(
                    task_type=TaskType.CAUSAL_LM,
                    num_virtual_tokens=20
                )

                # Prompt Tuning configuration
                prompt_config = PromptTuningConfig(
                    task_type=TaskType.CAUSAL_LM,
                    num_virtual_tokens=10
                )

                # Choose one configuration and apply it
                peft_model = get_peft_model(model, lora_config)
            '''
        elif term == 'transformer':
            response['explanation'] = '''
                <h5>Transformer Architecture</h5>
                <p>The Transformer is a neural network architecture introduced in the paper "Attention Is All You Need" that forms the foundation of modern LLMs like GPT, BERT, and T5.</p>

                <h5>Key Components</h5>
                <ul>
                    <li><strong>Self-Attention Mechanism</strong>: Allows the model to weigh the importance of different words in the input</li>
                    <li><strong>Multi-Head Attention</strong>: Enables the model to focus on different parts of the input simultaneously</li>
                    <li><strong>Feed-Forward Networks</strong>: Process the attention outputs</li>
                    <li><strong>Layer Normalization</strong>: Stabilizes the learning process</li>
                    <li><strong>Positional Encoding</strong>: Provides information about the position of words in the sequence</li>
                </ul>

                <h5>Transformer Variants</h5>
                <ul>
                    <li><strong>Encoder-only</strong>: BERT, RoBERTa (good for classification, NER)</li>
                    <li><strong>Decoder-only</strong>: GPT family (good for text generation)</li>
                    <li><strong>Encoder-Decoder</strong>: T5, BART (good for translation, summarization)</li>
                </ul>
            '''
            response['examples'] = '''
                # Using a pre-trained Transformer model
                from transformers import AutoModelForCausalLM, AutoTokenizer

                # Load a decoder-only Transformer (GPT-2)
                model_name = "gpt2"
                model = AutoModelForCausalLM.from_pretrained(model_name)
                tokenizer = AutoTokenizer.from_pretrained(model_name)

                # Generate text
                input_text = "Fine-tuning is"
                input_ids = tokenizer(input_text, return_tensors="pt").input_ids

                output = model.generate(
                    input_ids,
                    max_length=50,
                    num_return_sequences=1,
                    temperature=0.7
                )

                generated_text = tokenizer.decode(output[0], skip_special_tokens=True)
                print(generated_text)
            '''
        elif term == 'container':
            response['explanation'] = '''
                <h5>Containers for LLM Deployment</h5>
                <p>Containers are lightweight, standalone, and executable software packages that include everything needed to run an application: code, runtime, system tools, libraries, and settings. For LLM deployment, containers provide a consistent and isolated environment that ensures the model runs reliably across different computing environments.</p>

                <h5>Container Architecture</h5>
                <ul>
                    <li><strong>Container Image</strong>: A read-only template with instructions for creating a container</li>
                    <li><strong>Container Runtime</strong>: The software responsible for running containers (e.g., Docker, containerd, CRI-O)</li>
                    <li><strong>Namespaces</strong>: Provide isolation for processes, network, and filesystem</li>
                    <li><strong>Control Groups (cgroups)</strong>: Limit and isolate resource usage (CPU, memory, disk I/O, network)</li>
                </ul>

                <h5>Container Orchestration</h5>
                <p>For managing multiple containers across multiple hosts:</p>
                <ul>
                    <li><strong>Kubernetes</strong>: The most popular container orchestration platform</li>
                    <li><strong>Docker Swarm</strong>: Docker's native clustering and scheduling tool</li>
                    <li><strong>Amazon ECS/EKS</strong>: AWS's container management services</li>
                    <li><strong>Google Kubernetes Engine (GKE)</strong>: Google Cloud's managed Kubernetes service</li>
                    <li><strong>Azure Kubernetes Service (AKS)</strong>: Microsoft Azure's managed Kubernetes service</li>
                </ul>

                <h5>Benefits for LLM Deployment</h5>
                <ul>
                    <li><strong>Consistency</strong>: Eliminates "works on my machine" problems by packaging all dependencies</li>
                    <li><strong>Isolation</strong>: Prevents conflicts between different applications and their dependencies</li>
                    <li><strong>Resource Efficiency</strong>: Uses fewer resources than virtual machines</li>
                    <li><strong>Scalability</strong>: Easily scale up or down based on demand</li>
                    <li><strong>Portability</strong>: Run the same container across different environments (development, testing, production)</li>
                    <li><strong>Microservices Architecture</strong>: Break down complex applications into smaller, manageable services</li>
                </ul>

                <h5>Container Security Considerations</h5>
                <ul>
                    <li><strong>Image Scanning</strong>: Check for vulnerabilities in container images</li>
                    <li><strong>Least Privilege Principle</strong>: Run containers with minimal permissions</li>
                    <li><strong>Resource Limits</strong>: Set CPU and memory limits to prevent DoS attacks</li>
                    <li><strong>Network Segmentation</strong>: Control container-to-container communication</li>
                    <li><strong>Secrets Management</strong>: Securely handle sensitive information like API keys</li>
                </ul>
            '''
            response['examples'] = '''
                # Running an LLM in a container with Docker

                # 1. Create a requirements.txt file
                # transformers==4.30.2
                # torch==2.0.1
                # flask==2.3.2
                # peft==0.4.0

                # 2. Create a simple Flask app (app.py) to serve the model
                from flask import Flask, request, jsonify
                from transformers import AutoModelForCausalLM, AutoTokenizer
                from peft import PeftModel
                import os

                app = Flask(__name__)

                # Load model and tokenizer
                @app.route('/generate', methods=['POST'])
                def generate():
                    data = request.json
                    prompt = data.get('prompt', '')
                    max_length = data.get('max_length', 100)

                    # Generate text
                    input_ids = tokenizer(prompt, return_tensors="pt").input_ids
                    outputs = model.generate(
                        input_ids=input_ids,
                        max_length=max_length,
                        temperature=0.7,
                        top_p=0.9,
                        do_sample=True
                    )
                    response = tokenizer.decode(outputs[0], skip_special_tokens=True)

                    return jsonify({'response': response})

                if __name__ == '__main__':
                    # Load model and tokenizer
                    model_path = os.environ.get('MODEL_PATH', './model')
                    model = AutoModelForCausalLM.from_pretrained(model_path)
                    tokenizer = AutoTokenizer.from_pretrained(model_path)

                    # Start the server
                    app.run(host='0.0.0.0', port=5002)

                # 3. Create a Dockerfile
                # FROM python:3.9-slim
                # WORKDIR /app
                # COPY requirements.txt .
                # RUN pip install --no-cache-dir -r requirements.txt
                # COPY app.py .
                # COPY ./model /app/model
                # EXPOSE 5000
                # CMD ["python", "app.py"]

                # 4. Build and run the container
                # docker build -t llm-api .
                # docker run -p 5000:5000 llm-api

                # 5. Test the API
                # curl -X POST http://localhost:5000/generate \
                #   -H "Content-Type: application/json" \
                #   -d '{"prompt": "Fine-tuning is", "max_length": 100}'
            '''
        elif term == 'kubernetes':
            response['explanation'] = '''
                <h5>Kubernetes for LLM Deployment</h5>
                <p>Kubernetes (K8s) is an open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications. For LLM deployment, Kubernetes provides a robust infrastructure for running models at scale with high availability and efficient resource utilization.</p>

                <h5>Key Kubernetes Concepts</h5>
                <ul>
                    <li><strong>Pods</strong>: The smallest deployable units in Kubernetes, containing one or more containers</li>
                    <li><strong>Deployments</strong>: Manage the creation and updating of pods</li>
                    <li><strong>Services</strong>: Expose pods as network services</li>
                    <li><strong>ConfigMaps and Secrets</strong>: Store configuration data and sensitive information</li>
                    <li><strong>Persistent Volumes</strong>: Provide storage that persists beyond the lifecycle of pods</li>
                    <li><strong>Namespaces</strong>: Virtual clusters within a physical cluster</li>
                </ul>

                <h5>Kubernetes for LLM Workloads</h5>
                <ul>
                    <li><strong>Horizontal Pod Autoscaling</strong>: Automatically scale the number of pods based on CPU utilization or custom metrics</li>
                    <li><strong>GPU Support</strong>: Schedule pods on nodes with GPUs for accelerated inference</li>
                    <li><strong>Resource Quotas</strong>: Limit resource consumption by namespace</li>
                    <li><strong>Affinity/Anti-Affinity</strong>: Control pod placement for optimal performance</li>
                    <li><strong>StatefulSets</strong>: Manage stateful applications with stable network identities</li>
                </ul>

                <h5>Benefits for LLM Deployment</h5>
                <ul>
                    <li><strong>Scalability</strong>: Easily scale from one to thousands of model instances</li>
                    <li><strong>High Availability</strong>: Automatic recovery from failures</li>
                    <li><strong>Resource Efficiency</strong>: Optimal utilization of cluster resources</li>
                    <li><strong>Rolling Updates</strong>: Update models without downtime</li>
                    <li><strong>Load Balancing</strong>: Distribute traffic across model instances</li>
                    <li><strong>Monitoring and Logging</strong>: Built-in tools for observability</li>
                </ul>
            '''
            response['examples'] = '''
                # Kubernetes YAML files for deploying an LLM service

                # 1. Deployment for the LLM service (llm-deployment.yaml)
                apiVersion: apps/v1
                kind: Deployment
                metadata:
                  name: llm-model
                  labels:
                    app: llm-model
                spec:
                  replicas: 3
                  selector:
                    matchLabels:
                      app: llm-model
                  template:
                    metadata:
                      labels:
                        app: llm-model
                    spec:
                      containers:
                      - name: llm-container
                        image: llm-api:latest
                        ports:
                        - containerPort: 5000
                        resources:
                          limits:
                            nvidia.com/gpu: 1
                            memory: "8Gi"
                            cpu: "2"
                          requests:
                            memory: "4Gi"
                            cpu: "1"
                        env:
                        - name: MODEL_PATH
                          value: "/models/llm-model"
                        volumeMounts:
                        - name: model-storage
                          mountPath: /models
                      volumes:
                      - name: model-storage
                        persistentVolumeClaim:
                          claimName: model-pvc

                # 2. Service to expose the LLM deployment (llm-service.yaml)
                apiVersion: v1
                kind: Service
                metadata:
                  name: llm-service
                spec:
                  selector:
                    app: llm-model
                  ports:
                  - port: 80
                    targetPort: 5000
                  type: LoadBalancer

                # 3. Horizontal Pod Autoscaler (llm-hpa.yaml)
                apiVersion: autoscaling/v2
                kind: HorizontalPodAutoscaler
                metadata:
                  name: llm-hpa
                spec:
                  scaleTargetRef:
                    apiVersion: apps/v1
                    kind: Deployment
                    name: llm-model
                  minReplicas: 3
                  maxReplicas: 10
                  metrics:
                  - type: Resource
                    resource:
                      name: cpu
                      target:
                        type: Utilization
                        averageUtilization: 70

                # Apply the configurations
                # kubectl apply -f llm-deployment.yaml
                # kubectl apply -f llm-service.yaml
                # kubectl apply -f llm-hpa.yaml
            '''
        elif term == 'quantization':
            response['explanation'] = '''
                <h5>Quantization for LLMs</h5>
                <p>Quantization is a technique that reduces the precision of the numerical representations in a model, typically from 32-bit floating-point (FP32) to lower precision formats like 16-bit floating-point (FP16), 8-bit integers (INT8), or even 4-bit integers (INT4). This significantly reduces model size and improves inference speed with minimal impact on performance.</p>

                <h5>Types of Quantization</h5>
                <ul>
                    <li><strong>Post-Training Quantization (PTQ)</strong>: Applied after training without requiring retraining</li>
                    <li><strong>Quantization-Aware Training (QAT)</strong>: Incorporates quantization effects during training</li>
                    <li><strong>Dynamic Quantization</strong>: Quantizes weights statically but activations dynamically at runtime</li>
                    <li><strong>Static Quantization</strong>: Quantizes both weights and activations ahead of time</li>
                </ul>

                <h5>Quantization Formats</h5>
                <ul>
                    <li><strong>FP16</strong>: Half-precision floating-point, 16 bits</li>
                    <li><strong>BF16</strong>: Brain Floating Point, 16 bits with different exponent/mantissa ratio than FP16</li>
                    <li><strong>INT8</strong>: 8-bit integer quantization</li>
                    <li><strong>INT4</strong>: 4-bit integer quantization</li>
                    <li><strong>Mixed Precision</strong>: Different precision for different parts of the model</li>
                </ul>

                <h5>Benefits for LLM Deployment</h5>
                <ul>
                    <li><strong>Reduced Memory Footprint</strong>: Up to 75% smaller models with INT8 quantization</li>
                    <li><strong>Faster Inference</strong>: Lower precision operations are faster on most hardware</li>
                    <li><strong>Lower Power Consumption</strong>: Important for edge devices and reducing cloud costs</li>
                    <li><strong>Enables Larger Models</strong>: Run larger models on the same hardware</li>
                </ul>

                <h5>Quantization in QLoRA</h5>
                <p>QLoRA (Quantized Low-Rank Adaptation) combines quantization with LoRA for extremely memory-efficient fine-tuning. It uses 4-bit quantization for the base model while keeping LoRA adapters in higher precision, enabling fine-tuning of models with up to 65 billion parameters on a single GPU.</p>
            '''
            response['examples'] = '''
                # Post-Training Quantization with PyTorch
                import torch

                # Load a pre-trained model
                model = torch.load("path/to/model.pth")

                # Quantize the model to INT8
                quantized_model = torch.quantization.quantize_dynamic(
                    model,  # the original model
                    {torch.nn.Linear},  # a set of layers to dynamically quantize
                    dtype=torch.qint8  # the target dtype for quantized weights
                )

                # Save the quantized model
                torch.save(quantized_model, "path/to/quantized_model.pth")

                # Quantization with Hugging Face Transformers and bitsandbytes
                from transformers import AutoModelForCausalLM, BitsAndBytesConfig

                # Configure 4-bit quantization
                quantization_config = BitsAndBytesConfig(
                    load_in_4bit=True,
                    bnb_4bit_compute_dtype=torch.float16,
                    bnb_4bit_quant_type="nf4",  # normalized float 4
                    bnb_4bit_use_double_quant=True
                )

                # Load model with quantization
                model = AutoModelForCausalLM.from_pretrained(
                    "meta-llama/Llama-2-7b",
                    quantization_config=quantization_config,
                    device_map="auto"
                )

                # QLoRA with quantized model
                from peft import LoraConfig, get_peft_model

                # Define LoRA config
                lora_config = LoraConfig(
                    r=16,
                    lora_alpha=32,
                    target_modules=["q_proj", "v_proj"],
                    lora_dropout=0.05,
                    bias="none"
                )

                # Apply LoRA to quantized model
                qlora_model = get_peft_model(model, lora_config)
            '''
        else:
            # Generic explanation for other terms
            response['explanation'] = f'<p>Detailed explanation for {term} will be available soon.</p>'
            response['examples'] = f'# Example code for {term} will be available soon.'

        return jsonify(response)
    else:
        return jsonify({'error': f"Term '{term}' not found"}), 404

@app.route('/static/visualizations/<path:filename>')
def serve_visualization(filename):
    """Serve visualization files."""
    return send_from_directory(app.config['VISUALIZATIONS_FOLDER'], filename)

@app.route('/api/visualize/<word>')
@csrf.exempt
def get_visualization_data(word):
    """API endpoint to get visualization data for a specific word."""
    try:
        # Create visualization directory if it doesn't exist
        os.makedirs('static/visualizations', exist_ok=True)

        # Try to use domain-specific relationships first
        domain_graph = llm_thesaurus_instance.build_domain_graph(word)

        if domain_graph:
            # Use the domain-specific graph
            visual_thesaurus.graph = domain_graph
            print(f"Using domain-specific graph for '{word}'")
        else:
            # Fall back to WordNet
            visual_thesaurus.build_graph_for_word(word)

            # Try to enhance with domain-specific relationships
            enhanced = llm_thesaurus_instance.enhance_thesaurus_graph(visual_thesaurus, word)
            if enhanced:
                print(f"Enhanced graph for '{word}' with domain-specific relationships")

        # Always regenerate the visualization to ensure it uses the latest template
        vis_path = f'static/visualizations/{word}_thesaurus.html'
        visual_thesaurus.visualize_interactive(save_path=vis_path)

        # Get node and edge data for the frontend
        nodes = []
        for node in visual_thesaurus.graph.nodes():
            nodes.append({
                'id': node,
                'label': visual_thesaurus.graph.nodes[node].get('label', node),
                'color': visual_thesaurus.graph.nodes[node].get('color', 'blue'),
                'size': visual_thesaurus.graph.nodes[node].get('size', 15)
            })

        edges = []
        for edge in visual_thesaurus.graph.edges():
            edges.append({
                'from': edge[0],
                'to': edge[1],
                'color': visual_thesaurus.graph.edges[edge].get('color', 'gray'),
                'label': visual_thesaurus.graph.edges[edge].get('label', '')
            })

        return jsonify({
            'word': word,
            'nodes': nodes,
            'edges': edges,
            'visualization_path': f'/static/visualizations/{word}_thesaurus.html'
        })
    except Exception as e:
        print(f"Error generating visualization for '{word}': {e}")
        return jsonify({
            'error': f"Could not generate visualization for '{word}'",
            'message': str(e)
        }), 500


@app.route('/progress')
@login_required
def learning_progress():
    """Show user's learning progress."""
    # Get user progress from database
    progress = UserProgress.query.filter_by(user_id=current_user.id).all()

    # Get all modules and topics
    modules = [
        {'id': 'lora', 'name': 'LoRA Fine-Tuning', 'topics': [
            {'id': 'intro', 'name': 'Introduction to LoRA'},
            {'id': 'implementation', 'name': 'Implementing LoRA'},
            {'id': 'advanced', 'name': 'Advanced LoRA Techniques'}
        ]},
        {'id': 'qlora', 'name': 'QLoRA Fine-Tuning', 'topics': [
            {'id': 'intro', 'name': 'Introduction to QLoRA'},
            {'id': 'implementation', 'name': 'Implementing QLoRA'},
            {'id': 'advanced', 'name': 'Advanced QLoRA Techniques'}
        ]},
        {'id': 'gpt', 'name': 'Understanding GPT', 'topics': [
            {'id': 'architecture', 'name': 'GPT Architecture'},
            {'id': 'training', 'name': 'GPT Training Methodology'},
            {'id': 'applications', 'name': 'GPT Applications'}
        ]}
    ]

    # Calculate progress percentage
    total_topics = sum(len(module['topics']) for module in modules)
    completed_topics = len([p for p in progress if p.completed])
    progress_percentage = int((completed_topics / total_topics) * 100) if total_topics > 0 else 0

    # Calculate module progress
    module_progress = {}
    for module in modules:
        module_topics = len(module['topics'])
        module_completed = len([p for p in progress if p.module == module['id'] and p.completed])
        module_progress[module['id']] = int((module_completed / module_topics) * 100) if module_topics > 0 else 0

    # Calculate other stats
    modules_started = len(set([p.module for p in progress]))
    modules_completed = len([m['id'] for m in modules if module_progress[m['id']] == 100])

    # Helper function to check if a topic is completed
    def topic_completed(module_id, topic_id):
        for p in progress:
            if p.module == module_id and p.topic == topic_id and p.completed:
                return True
        return False

    return render_template('progress.html',
                           title='My Learning Progress',
                           modules=modules,
                           progress=progress,
                           progress_percentage=progress_percentage,
                           total_topics=total_topics,
                           completed_topics=completed_topics,
                           module_progress=module_progress,
                           modules_started=modules_started,
                           modules_completed=modules_completed,
                           topic_completed=topic_completed,
                           total_time='8 hours',
                           last_activity='Today')


# Load the model when the module is imported
model_loaded = load_model()

if __name__ == '__main__':
    # Get host and port from environment variables or use defaults
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5002))  # Changed default port to 5002

    # Run the application
    app.run(host=host, port=port, debug=os.environ.get('FLASK_ENV') == 'development')
