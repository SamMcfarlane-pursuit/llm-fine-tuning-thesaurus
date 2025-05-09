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

# Log mail configuration for debugging
app.logger.info(f"Mail server: {app.config['MAIL_SERVER']}")
app.logger.info(f"Mail port: {app.config['MAIL_PORT']}")
app.logger.info(f"Mail use TLS: {app.config['MAIL_USE_TLS']}")
app.logger.info(f"Mail username: {app.config['MAIL_USERNAME']}")
app.logger.info(f"Mail default sender: {app.config['MAIL_DEFAULT_SENDER']}")

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

# Register pipeline API blueprint
try:
    from api.pipeline_api import pipeline_api
    app.register_blueprint(pipeline_api, url_prefix='/api')
    print("Pipeline API blueprint registered successfully!")
except ImportError:
    print("Pipeline API module not found. Skipping blueprint registration.")

# Register pipeline blueprint
try:
    from pipeline import pipeline_bp
    app.register_blueprint(pipeline_bp)
    print("Pipeline blueprint registered successfully!")
except ImportError:
    print("Pipeline module not found. Skipping blueprint registration.")

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
@app.errorhandler(401)
def unauthorized(e):
    """Handle 401 errors by showing a custom page."""
    return render_template('errors/401.html'), 401

@app.errorhandler(403)
def forbidden(e):
    """Handle 403 errors by showing a custom page."""
    return render_template('errors/403.html'), 403

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
def bad_gateway(e):
    """Handle 502 errors by showing a custom page."""
    # Log the error for debugging
    app.logger.error(f"502 error occurred: {str(e)}")
    app.logger.exception("Exception details:")
    return render_template('errors/502.html'), 502



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

    # Import and add LoRA concepts quiz
    try:
        from create_lora_quiz import create_lora_quiz
        create_lora_quiz()
        print("LoRA concepts quiz added successfully!")
    except Exception as e:
        print(f"Error adding LoRA concepts quiz: {e}")

    # Add a route for the LoRA concepts quiz
    @app.route('/quiz/lora/concepts')
    def lora_concepts_quiz():
        """Redirect to the LoRA concepts quiz."""
        # Find the quiz for this module and topic
        quiz = Quiz.query.filter_by(module='lora', topic='concepts').first_or_404()
        return redirect(url_for('quiz.quiz_detail', quiz_id=quiz.id))

# Initialize the visual thesaurus
visual_thesaurus = VisualThesaurus()

# Initialize the LLM concepts visualizer
llm_concepts_visualizer = LLMConceptsVisualizer()

# Initialize the LLM thesaurus
llm_thesaurus_instance = LLMThesaurus()

# Initialize the enhanced visualizations
enhanced_visualizations = EnhancedVisualizations()

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

@app.route('/learn/fine-tuning-methods-comparison')
def learn_fine_tuning_methods_comparison():
    """Render the fine-tuning methods comparison page."""
    return render_template('finetuning_comparison.html', module_id='fine-tuning', topic_id='comparison')

@app.route('/learn/exercise8')
def learn_exercise8():
    """Render the Exercise 8 page with framework comparison."""
    return render_template('exercise8.html')

# Routes for LoRA implementation and hands-on exercise are defined below

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

@app.route('/learn-and-explore')
def learn_and_explore():
    """Render the enhanced learn and explore page that combines learning concepts and thesaurus content."""
    # Get the concept from the query parameter, default to "fine-tuning"
    concept = request.args.get('concept', 'fine-tuning').lower()

    # Sanitize the concept name (remove special characters)
    import re
    concept = re.sub(r'[^a-z0-9\-]', '', concept)

    # Get related concepts for the sidebar
    related_concepts = []
    try:
        # Get related concepts from the thesaurus
        domain_graph = llm_thesaurus_instance.build_domain_graph(concept)
        if domain_graph:
            # Extract related concepts from the graph
            for node in domain_graph.nodes():
                if node != concept:
                    related_concepts.append(node)

            # Generate both visualizations - standard and enhanced
            visual_thesaurus.graph = domain_graph
            vis_path = f'static/visualizations/{concept}_thesaurus.html'
            visual_thesaurus.visualize_interactive(save_path=vis_path)

            # Generate the enhanced category-specific visualization
            enhanced_vis_path = f'static/visualizations/{concept}_enhanced.html'
            enhanced_visualizations.create_category_visualization(domain_graph, concept, enhanced_vis_path)
    except Exception as e:
        print(f"Error generating visualization for {concept}: {e}")
        # Fallback to fine-tuning if there's an error
        concept = "fine-tuning"
        try:
            domain_graph = llm_thesaurus_instance.build_domain_graph(concept)
            if domain_graph:
                # Extract related concepts from the graph
                for node in domain_graph.nodes():
                    if node != concept:
                        related_concepts.append(node)

                # Generate both visualizations - standard and enhanced
                visual_thesaurus.graph = domain_graph
                vis_path = f'static/visualizations/{concept}_thesaurus.html'
                visual_thesaurus.visualize_interactive(save_path=vis_path)

                # Generate the enhanced category-specific visualization
                enhanced_vis_path = f'static/visualizations/{concept}_enhanced.html'
                enhanced_visualizations.create_category_visualization(domain_graph, concept, enhanced_vis_path)
        except Exception as e:
            print(f"Error generating fallback visualization: {e}")

    try:
        # Get learning resources for the concept
        learning_resources = get_learning_resources(concept)

        # Get hands-on exercises for the concept
        exercises = get_exercises_for_concept(concept)

        return render_template(
            'learn_and_explore.html',
            concept=concept,
            related_concepts=related_concepts[:10],  # Limit to 10 related concepts
            learning_resources=learning_resources,
            exercises=exercises
        )
    except Exception as e:
        app.logger.error(f"Error rendering learn_and_explore: {e}")
        # Provide default resources and exercises if there's an error
        default_resources = [
            {
                "title": "Introduction to LLM Fine-Tuning",
                "description": "Learn the basics of fine-tuning large language models for specific tasks.",
                "link": "/guide/finetuning-comparison",
                "type": "guide"
            },
            {
                "title": "LoRA Implementation Guide",
                "description": "Step-by-step guide to implementing LoRA for LLM fine-tuning.",
                "link": "/guide/lora-implementation",
                "type": "guide"
            },
            {
                "title": "QLoRA Implementation Guide",
                "description": "Comprehensive guide to implementing QLoRA for memory-efficient fine-tuning.",
                "link": "/guide/qlora-implementation",
                "type": "guide"
            }
        ]

        default_exercises = [
            {
                "title": "LoRA Hands-on Exercise",
                "description": "Implement LoRA fine-tuning on a pre-trained model.",
                "link": "/guide/lora-hands-on",
                "difficulty": "intermediate"
            },
            {
                "title": "QLoRA Implementation Exercise",
                "description": "Implement QLoRA fine-tuning on a large language model.",
                "link": "/guide/qlora-implementation",
                "difficulty": "advanced"
            }
        ]

        return render_template(
            'learn_and_explore.html',
            concept=concept,
            related_concepts=related_concepts[:10],  # Limit to 10 related concepts
            learning_resources=default_resources,
            exercises=default_exercises
        )

def get_learning_resources(concept):
    """Get learning resources for a specific concept."""
    try:
        # This would typically come from a database, but for now we'll use a static mapping
        resources_map = {
            "fine-tuning": [
                {
                    "title": "Introduction to LLM Fine-Tuning",
                    "description": "Learn the basics of fine-tuning large language models for specific tasks.",
                    "link": "/guide/finetuning-comparison",
                    "type": "guide"
                },
                {
                    "title": "Fine-Tuning vs Pre-Training",
                    "description": "Understand the differences between pre-training and fine-tuning in LLMs.",
                    "link": "/guide/finetuning-comparison",
                    "type": "guide"
                },
                {
                    "title": "Fine-Tuning Techniques",
                    "description": "Overview of various fine-tuning techniques.",
                    "link": "/guide/finetuning-comparison",
                    "type": "guide"
                }
            ],
            "lora": [
                {
                    "title": "LoRA Implementation Guide",
                    "description": "Step-by-step guide to implementing LoRA for LLM fine-tuning.",
                    "link": "/guide/lora-implementation",
                    "type": "guide"
                },
                {
                    "title": "Hands-on LoRA Example",
                    "description": "Practical example of using LoRA for fine-tuning.",
                    "link": "/guide/lora-hands-on",
                    "type": "exercise"
                },
                {
                    "title": "LoRA Basics",
                    "description": "Learn the fundamentals of Low-Rank Adaptation (LoRA).",
                    "link": "/guide/lora-implementation",
                    "type": "guide"
                }
            ],
            "qlora": [
                {
                    "title": "QLoRA Implementation Guide",
                    "description": "Comprehensive guide to implementing QLoRA for memory-efficient fine-tuning.",
                    "link": "/guide/qlora-implementation",
                    "type": "guide"
                },
                {
                    "title": "Advanced QLoRA Techniques",
                    "description": "Advanced techniques and optimizations for QLoRA fine-tuning.",
                    "link": "/advanced-qlora",
                    "type": "guide"
                },
                {
                    "title": "QLoRA vs LoRA",
                    "description": "Comparison between QLoRA and LoRA approaches.",
                    "link": "/guide/qlora-implementation",
                    "type": "guide"
                }
            ],
            "quantization": [
                {
                    "title": "Introduction to Model Quantization",
                    "description": "Learn the basics of quantizing large language models.",
                    "link": "/guide/qlora-implementation",
                    "type": "guide"
                },
                {
                    "title": "4-bit Quantization Techniques",
                    "description": "Detailed guide to 4-bit quantization methods for LLMs.",
                    "link": "/guide/qlora-implementation",
                    "type": "guide"
                },
                {
                    "title": "Memory Efficiency Techniques",
                    "description": "Overview of memory-efficient techniques including quantization.",
                    "link": "/guide/qlora-implementation",
                    "type": "guide"
                }
            ],
            "peft": [
                {
                    "title": "Parameter-Efficient Fine-Tuning Guide",
                    "description": "Comprehensive guide to PEFT techniques for LLMs.",
                    "link": "/peft-guide",
                    "type": "guide"
                },
                {
                    "title": "PEFT vs Full Fine-Tuning",
                    "description": "Comparison of parameter-efficient methods with traditional fine-tuning.",
                    "link": "/peft-guide",
                    "type": "guide"
                },
                {
                    "title": "PEFT Methods Overview",
                    "description": "Overview of different parameter-efficient fine-tuning methods.",
                    "link": "/peft-guide",
                    "type": "guide"
                }
            ]
        }

        # Default resources if the concept is not in our map
        default_resources = [
            {
                "title": "Introduction to LLM Fine-Tuning",
                "description": "Learn the basics of fine-tuning large language models for specific tasks.",
                "link": "/guide/finetuning-comparison",
                "type": "guide"
            },
            {
                "title": "LoRA Implementation Guide",
                "description": "Step-by-step guide to implementing LoRA for LLM fine-tuning.",
                "link": "/guide/lora-implementation",
                "type": "guide"
            },
            {
                "title": "QLoRA Implementation Guide",
                "description": "Comprehensive guide to implementing QLoRA for memory-efficient fine-tuning.",
                "link": "/guide/qlora-implementation",
                "type": "guide"
            }
        ]

        return resources_map.get(concept, default_resources)
    except Exception as e:
        app.logger.error(f"Error in get_learning_resources: {e}")
        # Return a safe default if there's an error
        return [
            {
                "title": "Introduction to LLM Fine-Tuning",
                "description": "Learn the basics of fine-tuning large language models for specific tasks.",
                "link": "/guide/finetuning-comparison",
                "type": "guide"
            },
            {
                "title": "LoRA Implementation Guide",
                "description": "Step-by-step guide to implementing LoRA for LLM fine-tuning.",
                "link": "/guide/lora-implementation",
                "type": "guide"
            },
            {
                "title": "QLoRA Implementation Guide",
                "description": "Comprehensive guide to implementing QLoRA for memory-efficient fine-tuning.",
                "link": "/guide/qlora-implementation",
                "type": "guide"
            }
        ]

def get_exercises_for_concept(concept):
    """Get hands-on exercises for a specific concept."""
    try:
        # This would typically come from a database, but for now we'll use a static mapping
        exercises_map = {
            "fine-tuning": [
                {
                    "title": "Basic Fine-Tuning Exercise",
                    "description": "Learn how to fine-tune a small language model on a custom dataset.",
                    "link": "/guide/instruction-tuning",
                    "difficulty": "beginner"
                },
                {
                    "title": "Instruction Fine-Tuning",
                    "description": "Fine-tune a model to follow specific instructions.",
                    "link": "/guide/instruction-tuning",
                    "difficulty": "intermediate"
                }
            ],
            "lora": [
                {
                    "title": "LoRA Hands-on Exercise",
                    "description": "Implement LoRA fine-tuning on a pre-trained model.",
                    "link": "/guide/lora-hands-on",
                    "difficulty": "intermediate"
                },
                {
                    "title": "LoRA Hyperparameter Tuning",
                    "description": "Experiment with different LoRA hyperparameters to optimize performance.",
                    "link": "/guide/lora-hands-on",
                    "difficulty": "advanced"
                }
            ],
            "qlora": [
                {
                    "title": "QLoRA Implementation Exercise",
                    "description": "Implement QLoRA fine-tuning on a large language model.",
                    "link": "/guide/qlora-implementation",
                    "difficulty": "advanced"
                },
                {
                    "title": "Memory-Efficient Fine-Tuning",
                    "description": "Optimize memory usage during fine-tuning with QLoRA.",
                    "link": "/guide/qlora-implementation",
                    "difficulty": "advanced"
                }
            ],
            "quantization": [
                {
                    "title": "4-bit Quantization Exercise",
                    "description": "Apply 4-bit quantization to a pre-trained model.",
                    "link": "/guide/qlora-implementation",
                    "difficulty": "intermediate"
                },
                {
                    "title": "Post-Training Quantization",
                    "description": "Apply quantization to a model after training.",
                    "link": "/guide/qlora-implementation",
                    "difficulty": "intermediate"
                }
            ],
            "peft": [
                {
                    "title": "PEFT Methods Comparison",
                    "description": "Compare different parameter-efficient fine-tuning methods.",
                    "link": "/peft-guide",
                    "difficulty": "advanced"
                },
                {
                    "title": "Implementing Adapter Layers",
                    "description": "Add adapter layers to a pre-trained model for efficient fine-tuning.",
                    "link": "/peft-guide",
                    "difficulty": "advanced"
                }
            ]
        }

        # Default exercises if the concept is not in our map
        default_exercises = [
            {
                "title": "LoRA Hands-on Exercise",
                "description": "Implement LoRA fine-tuning on a pre-trained model.",
                "link": "/guide/lora-hands-on",
                "difficulty": "intermediate"
            },
            {
                "title": "QLoRA Implementation Exercise",
                "description": "Implement QLoRA fine-tuning on a large language model.",
                "link": "/guide/qlora-implementation",
                "difficulty": "advanced"
            }
        ]

        return exercises_map.get(concept, default_exercises)
    except Exception as e:
        app.logger.error(f"Error in get_exercises_for_concept: {e}")
        # Return a safe default if there's an error
        return [
            {
                "title": "LoRA Hands-on Exercise",
                "description": "Implement LoRA fine-tuning on a pre-trained model.",
                "link": "/guide/lora-hands-on",
                "difficulty": "intermediate"
            },
            {
                "title": "QLoRA Implementation Exercise",
                "description": "Implement QLoRA fine-tuning on a large language model.",
                "link": "/guide/qlora-implementation",
                "difficulty": "advanced"
            }
        ]

@app.route('/advanced-qlora')
def advanced_qlora():
    """Render the advanced QLoRA fine-tuning page."""
    return render_template('advanced_qlora.html', module_id='qlora', topic_id='advanced')

@app.route('/workshops')
def workshops():
    """Render the workshops overview page."""
    return render_template('workshops.html')

@app.route('/workshop-progress')
def workshop_progress():
    """Render the workshop progress tracking page."""
    # Sample data for workshop progress
    workshops = [
        {
            'title': 'LoRA Fine-Tuning Workshop',
            'status': 'completed',
            'progress': 100,
            'modules_completed': 4,
            'total_modules': 4,
            'url': '/workshop/lora-basics',
            'modules': [
                {
                    'title': 'Module 1: Introduction to LoRA',
                    'description': 'Understanding the fundamentals of Low-Rank Adaptation',
                    'status': 'completed',
                    'url': '/workshop/lora-basics#module-1'
                },
                {
                    'title': 'Module 2: LoRA Implementation',
                    'description': 'Step-by-step implementation of LoRA with PEFT library',
                    'status': 'completed',
                    'url': '/workshop/lora-basics#module-2'
                },
                {
                    'title': 'Module 3: Hyperparameter Tuning',
                    'description': 'Optimizing LoRA parameters for best performance',
                    'status': 'completed',
                    'url': '/workshop/lora-basics#module-3'
                },
                {
                    'title': 'Module 4: Advanced Applications',
                    'description': 'Real-world applications and case studies',
                    'status': 'completed',
                    'url': '/workshop/lora-basics#module-4'
                }
            ]
        },
        {
            'title': 'QLoRA Deep Dive Workshop',
            'status': 'in_progress',
            'progress': 60,
            'modules_completed': 3,
            'total_modules': 5,
            'url': '/workshop/qlora-deep-dive',
            'modules': [
                {
                    'title': 'Module 1: Quantization Basics',
                    'description': 'Understanding model quantization techniques',
                    'status': 'completed',
                    'url': '/workshop/qlora-deep-dive#module-1'
                },
                {
                    'title': 'Module 2: NF4 Format',
                    'description': 'Deep dive into the NF4 quantization format',
                    'status': 'completed',
                    'url': '/workshop/qlora-deep-dive#module-2'
                },
                {
                    'title': 'Module 3: QLoRA Implementation',
                    'description': 'Implementing QLoRA with the PEFT library',
                    'status': 'completed',
                    'url': '/workshop/qlora-deep-dive#module-3'
                },
                {
                    'title': 'Module 4: Memory Optimization',
                    'description': 'Advanced memory optimization techniques',
                    'status': 'in-progress',
                    'url': '/workshop/qlora-deep-dive#module-4'
                },
                {
                    'title': 'Module 5: Scaling to Larger Models',
                    'description': 'Techniques for fine-tuning 13B+ parameter models',
                    'status': 'not-started',
                    'url': '/workshop/qlora-deep-dive#module-5'
                }
            ]
        },
        {
            'title': 'Advanced PEFT Techniques Workshop',
            'status': 'in_progress',
            'progress': 25,
            'modules_completed': 1,
            'total_modules': 4,
            'url': '/workshop/advanced-peft',
            'modules': [
                {
                    'title': 'Module 1: Introduction to Advanced PEFT',
                    'description': 'Overview of parameter-efficient fine-tuning methods',
                    'status': 'completed',
                    'url': '/workshop/advanced-peft#module-1'
                },
                {
                    'title': 'Module 2: Prefix Tuning Implementation',
                    'description': 'Implementing Prefix Tuning for sequence generation',
                    'status': 'in-progress',
                    'url': '/workshop/advanced-peft#module-2'
                },
                {
                    'title': 'Module 3: P-Tuning v2 Implementation',
                    'description': 'Implementing P-Tuning v2 for natural language understanding',
                    'status': 'not-started',
                    'url': '/workshop/advanced-peft#module-3'
                },
                {
                    'title': 'Module 4: Adapter Layers Implementation',
                    'description': 'Implementing Adapter Layers for multi-task learning',
                    'status': 'not-started',
                    'url': '/workshop/advanced-peft#module-4'
                }
            ]
        },
        {
            'title': 'Memory Efficiency Workshop',
            'status': 'not_started',
            'progress': 0,
            'modules_completed': 0,
            'total_modules': 4,
            'url': '/workshop/memory-efficiency',
            'modules': [
                {
                    'title': 'Module 1: Memory Challenges in LLM Fine-Tuning',
                    'description': 'Understanding memory bottlenecks in LLM training',
                    'status': 'not-started',
                    'url': '/workshop/memory-efficiency#module-1'
                },
                {
                    'title': 'Module 2: Gradient Checkpointing',
                    'description': 'Trading computation for memory with gradient checkpointing',
                    'status': 'not-started',
                    'url': '/workshop/memory-efficiency#module-2'
                },
                {
                    'title': 'Module 3: Mixed Precision Training',
                    'description': 'Using FP16 and BF16 formats for memory-efficient training',
                    'status': 'not-started',
                    'url': '/workshop/memory-efficiency#module-3'
                },
                {
                    'title': 'Module 4: Memory-Efficient Optimizers',
                    'description': 'Optimizers designed for memory efficiency',
                    'status': 'not-started',
                    'url': '/workshop/memory-efficiency#module-4'
                }
            ]
        }
    ]

    # Calculate overall progress statistics
    total_workshops = len(workshops)
    completed_workshops = sum(1 for w in workshops if w['status'] == 'completed')
    in_progress_workshops = sum(1 for w in workshops if w['status'] == 'in_progress')

    # Calculate percentages
    completed_percentage = int((completed_workshops / total_workshops) * 100) if total_workshops > 0 else 0
    in_progress_percentage = int((in_progress_workshops / total_workshops) * 100) if total_workshops > 0 else 0
    not_started_percentage = 100 - completed_percentage - in_progress_percentage

    # Calculate overall progress
    total_modules = sum(w['total_modules'] for w in workshops)
    completed_modules = sum(w['modules_completed'] for w in workshops)
    overall_progress = int((completed_modules / total_modules) * 100) if total_modules > 0 else 0

    # Sample streak data
    current_streak = 5
    longest_streak = 12
    total_learning_days = 28
    streak_progress = int((current_streak / 7) * 100)  # Progress toward 7-day streak
    streak_message = "Keep going! You're on your way to a 7-day streak."

    # Next steps recommendations
    next_steps = [
        {
            'title': 'Complete QLoRA Workshop',
            'description': 'Continue with Module 4: Memory Optimization',
            'icon': 'bi-arrow-right-circle',
            'url': '/workshop/qlora-deep-dive#module-4'
        },
        {
            'title': 'Explore Prefix Tuning',
            'description': 'Continue with the Advanced PEFT Techniques Workshop',
            'icon': 'bi-lightbulb',
            'url': '/workshop/advanced-peft#module-2'
        },
        {
            'title': 'Start Memory Efficiency Workshop',
            'description': 'Learn techniques to optimize memory usage in LLM fine-tuning',
            'icon': 'bi-cpu',
            'url': '/workshop/memory-efficiency'
        }
    ]

    return render_template(
        'workshop_progress.html',
        workshops=workshops,
        total_workshops=total_workshops,
        completed_workshops=completed_workshops,
        in_progress_workshops=in_progress_workshops,
        completed_percentage=completed_percentage,
        in_progress_percentage=in_progress_percentage,
        not_started_percentage=not_started_percentage,
        overall_progress=overall_progress,
        current_streak=current_streak,
        longest_streak=longest_streak,
        total_learning_days=total_learning_days,
        streak_progress=streak_progress,
        streak_message=streak_message,
        next_steps=next_steps
    )

@app.route('/workshop/qlora-deep-dive')
def workshop_qlora():
    """Render the QLoRA deep dive workshop page."""
    return render_template('workshop_qlora.html', module_id='qlora', topic_id='deep-dive')

@app.route('/workshop/memory-efficiency')
def workshop_memory_efficiency():
    """Render the memory efficiency in LLM fine-tuning workshop page."""
    return render_template('workshop_memory_efficiency.html', module_id='memory', topic_id='efficiency')

@app.route('/workshop/lora-basics')
def workshop_lora_basics():
    """Render the LoRA basics workshop page."""
    return render_template('workshop_lora_basics.html', module_id='lora', topic_id='basics')

@app.route('/workshop/advanced-peft')
def workshop_advanced_peft():
    """Render the advanced PEFT techniques workshop page."""
    return render_template('workshop_advanced_peft.html', module_id='peft', topic_id='advanced')

@app.route('/guide/lora-implementation')
def lora_guide():
    """Render the LoRA implementation guide page."""
    return render_template('lora_implementation_guide.html', module_id='lora', topic_id='implementation')

@app.route('/guide/lora-hands-on')
def lora_hands_on_guide():
    """Render the LoRA hands-on example page."""
    # Open the notebook in Google Colab
    notebook_url = url_for('static', filename='notebooks/lora_fine_tuning.ipynb', _external=True)
    colab_url = f"https://colab.research.google.com/github/googlecolab/colabtools/blob/master/notebooks/colab-github-demo.ipynb?{notebook_url}"
    return render_template('lora_hands_on.html', notebook_url=notebook_url, colab_url=colab_url)

@app.route('/guide/qlora-hands-on')
def qlora_hands_on_guide():
    """Render the QLoRA hands-on example page."""
    # Open the notebook in Google Colab
    notebook_url = url_for('static', filename='notebooks/qlora_fine_tuning.ipynb', _external=True)
    colab_url = f"https://colab.research.google.com/github/googlecolab/colabtools/blob/master/notebooks/colab-github-demo.ipynb?{notebook_url}"
    return render_template('qlora_hands_on.html', notebook_url=notebook_url, colab_url=colab_url)

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

@app.route('/guide/model-deployment')
def model_deployment():
    """Render the model deployment guide page."""
    return render_template('guides/model_deployment.html', module_id='deployment', topic_id='production')

# Pipeline routes are now handled by the pipeline blueprint

@app.route('/google-ml-crash-course')
def google_ml_crash_course():
    """Render the Google ML Crash Course page."""
    return render_template('google_ml_crash_course.html')

@app.route('/view-google-ml-notebook/<notebook_name>')
def view_google_ml_notebook(notebook_name):
    """Render a Google ML Crash Course notebook viewer page."""
    notebook_filename = f"{notebook_name}.ipynb"

    # Get last modified date
    import datetime
    import os

    notebook_path = os.path.join('colab_tutorials', 'google_ml_crash_course', notebook_filename)

    if os.path.exists(notebook_path):
        last_modified = datetime.datetime.fromtimestamp(os.path.getmtime(notebook_path))
        last_updated = last_modified.strftime('%B %d, %Y')
    else:
        last_updated = 'Recently'

    # Map notebook names to display names
    notebook_display_names = {
        'Intro_to_Pandas_DataFrame': 'Introduction to Pandas DataFrames',
        'Intro_to_RAPIDS_cuDF': 'Introduction to RAPIDS cuDF',
        'TensorFlow_with_GPUs_for_LLM_Finetuning': 'TensorFlow with GPUs for LLM Fine-tuning',
        'TPUs_for_LLM_Finetuning': 'TPUs for LLM Fine-tuning'
    }

    # Map notebook names to Colab URLs
    colab_urls = {
        'Intro_to_Pandas_DataFrame': f"https://colab.research.google.com/github/SamMcfarlane-pursuit/llm-fine-tuning-thesaurus/blob/main/colab_tutorials/google_ml_crash_course/{notebook_filename}",
        'Intro_to_RAPIDS_cuDF': f"https://colab.research.google.com/github/SamMcfarlane-pursuit/llm-fine-tuning-thesaurus/blob/main/colab_tutorials/google_ml_crash_course/{notebook_filename}",
        'TensorFlow_with_GPUs_for_LLM_Finetuning': f"https://colab.research.google.com/github/SamMcfarlane-pursuit/llm-fine-tuning-thesaurus/blob/main/colab_tutorials/google_ml_crash_course/{notebook_filename}",
        'TPUs_for_LLM_Finetuning': f"https://colab.research.google.com/github/SamMcfarlane-pursuit/llm-fine-tuning-thesaurus/blob/main/colab_tutorials/google_ml_crash_course/{notebook_filename}"
    }

    display_name = notebook_display_names.get(notebook_name, notebook_name)
    colab_url = colab_urls.get(notebook_name, '')

    # Track user progress if authenticated
    user_progress = {}
    if current_user.is_authenticated:
        from user_progress import get_tutorial_progress, update_tutorial_progress

        # Mark tutorial as in progress
        update_tutorial_progress(f"google_ml_{notebook_name}", 'in_progress')

        # Get current progress
        user_progress = get_tutorial_progress(f"google_ml_{notebook_name}")

    return render_template('enhanced_notebook_viewer.html',
                          notebook_name=display_name,
                          notebook_filename=f"google_ml_crash_course/{notebook_filename}",
                          colab_url=colab_url,
                          user_progress=user_progress,
                          last_updated=last_updated)

@app.route('/guide/data-preparation')
def data_preparation():
    """Render the data preparation guide page."""
    return render_template('guides/data_preparation.html', module_id='data-preparation', topic_id='advanced')

@app.route('/guide/qlora-implementation')
def qlora_implementation():
    """Render the QLoRA implementation guide page."""
    return render_template('guides/qlora_implementation.html', module_id='qlora', topic_id='implementation')

@app.route('/guides')
def guides():
    """Render the guides overview page or redirect to the first guide."""
    # Redirect to the guides section with all available guides
    return render_template('guides_overview.html')

@app.route('/guide/<guide_name>')
def guide(guide_name):
    """Generic guide route that maps guide_name to the appropriate route."""
    guide_routes = {
        'lora-implementation': lora_guide,
        'lora-hands-on': lora_hands_on_guide,
        'qlora-hands-on': qlora_hands_on_guide,
        'instruction-tuning': instruction_tuning_guide,
        'understanding-gpt': gpt_guide,
        'finetuning-comparison': finetuning_comparison,
        'pipeline-inference': pipeline_inference,
        'data-preparation': data_preparation,
        'qlora-implementation': qlora_implementation,
        'model-deployment': model_deployment,
        'peft-guide': peft_guide,
        'langgraph': langgraph_guide,
        'langchain': langchain_guide,
        'docker': docker_guide,
        'huggingface': huggingface_guide
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

@app.route('/getting-started')
def getting_started():
    """Render the getting started guide page."""
    return render_template('getting_started_page.html')

@app.route('/huggingface-guide')
def huggingface_guide():
    """Render the Hugging Face integration guide."""
    return render_template('huggingface_guide.html')

@app.route('/langgraph-guide')
def langgraph_guide():
    """Render the LangGraph guide for LLM fine-tuning."""
    return render_template('langgraph_guide.html')

@app.route('/langchain-guide')
def langchain_guide():
    """Render the LangChain guide for LLM fine-tuning."""
    return render_template('langchain_guide.html')

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

@app.route('/workshop-steps')
def workshop_steps():
    """Render the workshop steps visualization page."""
    return render_template('workshop_steps.html')

@app.route('/workshop-exercises')
def workshop_exercises():
    """Render the workshop exercises page with improved visibility."""
    return render_template('workshop_exercises.html')

@app.route('/workshop/full-fine-tuning')
def workshop_full_fine_tuning():
    """Render the full fine-tuning workshop page."""
    return render_template('workshop_full_fine_tuning.html')

@app.route('/workshop/lora-fine-tuning')
def workshop_lora_fine_tuning():
    """Render the LoRA fine-tuning workshop page."""
    return render_template('workshop_lora_fine_tuning.html')

@app.route('/workshop/qlora-deep-dive')
def workshop_qlora_deep_dive():
    """Render the QLoRA deep dive workshop page."""
    return render_template('workshop_qlora.html')

@app.route('/interactive-tutorials')
def interactive_tutorials():
    """Render the interactive tutorials page."""
    # Get user progress if authenticated
    user_progress = []
    if current_user.is_authenticated:
        from user_progress import get_all_user_progress
        user_progress = get_all_user_progress()

    return render_template('tutorials.html', user_progress=user_progress)

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
        # Original tutorials
        'Data_Preparation_Tutorial': 'Data Preparation for LLM Fine-Tuning',
        'Tuning_Approaches_Comparison': 'Comparison of LLM Fine-Tuning Approaches',
        'LoRA_Fine_Tuning_Tutorial': 'LoRA Fine-Tuning Tutorial',
        'QLoRA_Fine_Tuning_Tutorial': 'QLoRA Fine-Tuning Tutorial',
        'Pipeline_Inference_Tutorial': 'Pipeline Inference Tutorial',
        'Gradient_Checkpointing_Tutorial': 'Gradient Checkpointing for Memory Optimization',
        'Mixed_Precision_Training_Tutorial': 'Mixed Precision Training for Faster Fine-Tuning',
        'Model_Deployment_Tutorial': 'Deploying Fine-Tuned Models to Production',

        # Google ML Crash Course notebooks
        'TensorFlow_with_GPUs_for_LLM_Finetuning': 'TensorFlow with GPUs for LLM Fine-Tuning',
        'TPUs_for_LLM_Finetuning': 'TPUs for LLM Fine-Tuning',
        'Intro_to_Pandas_DataFrame': 'Introduction to Pandas DataFrame for LLM Data Preparation',
        'Intro_to_RAPIDS_cuDF': 'Introduction to RAPIDS cuDF for Accelerated Data Processing'
    }

    # Map notebook names to Colab URLs
    colab_urls = {
        # Original tutorials
        'Data_Preparation_Tutorial': 'https://colab.research.google.com/drive/1-RfhVkZ3YFMbG5X5BWgO6CkVQs4Hh-Wy?usp=sharing',
        'Tuning_Approaches_Comparison': 'https://colab.research.google.com/drive/1Ej_MlmHpKJxmvADlFMJgJ8aF9Kt6d-0I?usp=sharing',
        'LoRA_Fine_Tuning_Tutorial': 'https://colab.research.google.com/drive/1Ej9vBLxCG9aJ8Hn0Z9NMZ9iQBKD7qkDQ?usp=sharing',
        'QLoRA_Fine_Tuning_Tutorial': 'https://colab.research.google.com/drive/1EjBWMQrjBbfxGk9GXRpRebRNwFicK-WR?usp=sharing',
        'Pipeline_Inference_Tutorial': 'https://colab.research.google.com/drive/1EjCXGQNMnMM_1RLyoKBfCLKzRtKS8Aw-?usp=sharing',
        'Gradient_Checkpointing_Tutorial': 'https://colab.research.google.com/drive/1EjDWMQrjBbfxGk9GXRpRebRNwFicK-WR?usp=sharing',
        'Mixed_Precision_Training_Tutorial': 'https://colab.research.google.com/drive/1EjDWMQrjBbfxGk9GXRpRebRNwFicK-WR?usp=sharing',
        'Model_Deployment_Tutorial': 'https://colab.research.google.com/drive/1EjCXGQNMnMM_1RLyoKBfCLKzRtKS8Aw-?usp=sharing',

        # Google ML Crash Course notebooks
        'TensorFlow_with_GPUs_for_LLM_Finetuning': 'https://colab.research.google.com/github/tensorflow/tensorflow/blob/master/tensorflow/lite/g3doc/examples/bert_qa/notebook.ipynb',
        'TPUs_for_LLM_Finetuning': 'https://colab.research.google.com/github/tensorflow/tpu/blob/master/tools/colab/shakespeare_with_tpu_and_keras.ipynb',
        'Intro_to_Pandas_DataFrame': 'https://colab.research.google.com/github/google/ml-style-transfer/blob/master/Style_Transfer_with_TensorFlow_Lite.ipynb',
        'Intro_to_RAPIDS_cuDF': 'https://colab.research.google.com/github/rapidsai/notebooks-contrib/blob/main/getting_started_tutorials/intro_tutorials/01_Introduction_to_RAPIDS.ipynb'
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

    # Get last modified date
    import datetime
    import os

    notebook_path = os.path.join('colab_tutorials', notebook_filename)

    if os.path.exists(notebook_path):
        last_modified = datetime.datetime.fromtimestamp(os.path.getmtime(notebook_path))
        last_updated = last_modified.strftime('%B %d, %Y')
    else:
        last_updated = 'Recently'

    # Get related tutorials
    related_tutorials = []
    if notebook_name == 'LoRA_Fine_Tuning_Tutorial':
        related_tutorials = [
            {
                'title': 'QLoRA Fine-Tuning Tutorial',
                'description': 'Learn how to use QLoRA for memory-efficient fine-tuning',
                'url': '/view-notebook/QLoRA_Fine_Tuning_Tutorial'
            },
            {
                'title': 'Pipeline Inference Tutorial',
                'description': 'Learn how to use the pipeline API with fine-tuned models',
                'url': '/view-notebook/Pipeline_Inference_Tutorial'
            }
        ]
    elif notebook_name == 'QLoRA_Fine_Tuning_Tutorial':
        related_tutorials = [
            {
                'title': 'LoRA Fine-Tuning Tutorial',
                'description': 'Learn how to use LoRA for parameter-efficient fine-tuning',
                'url': '/view-notebook/LoRA_Fine_Tuning_Tutorial'
            },
            {
                'title': 'Pipeline Inference Tutorial',
                'description': 'Learn how to use the pipeline API with fine-tuned models',
                'url': '/view-notebook/Pipeline_Inference_Tutorial'
            }
        ]
    elif notebook_name == 'Pipeline_Inference_Tutorial':
        related_tutorials = [
            {
                'title': 'LoRA Fine-Tuning Tutorial',
                'description': 'Learn how to use LoRA for parameter-efficient fine-tuning',
                'url': '/view-notebook/LoRA_Fine_Tuning_Tutorial'
            },
            {
                'title': 'QLoRA Fine-Tuning Tutorial',
                'description': 'Learn how to use QLoRA for memory-efficient fine-tuning',
                'url': '/view-notebook/QLoRA_Fine_Tuning_Tutorial'
            }
        ]

    return render_template('enhanced_notebook_viewer.html',
                           notebook_name=display_name,
                           notebook_filename=notebook_filename,
                           colab_url=colab_url,
                           user_progress=user_progress,
                           last_updated=last_updated,
                           related_tutorials=related_tutorials)

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
                'url': '/docker-guide'
            }
        ],
        'huggingface': [
            {
                'title': 'Hugging Face Integration Guide',
                'description': 'Comprehensive guide to using Hugging Face for LLM fine-tuning',
                'url': '/huggingface-guide'
            }
        ],
        'langgraph': [
            {
                'title': 'LangGraph for LLM Fine-Tuning',
                'description': 'Guide to using LangGraph for building applications with fine-tuned LLMs',
                'url': '/langgraph-guide'
            }
        ],
        'langchain': [
            {
                'title': 'LangChain for LLM Fine-Tuning',
                'description': 'Guide to using LangChain for building applications with fine-tuned LLMs',
                'url': '/langchain-guide'
            }
        ],
        'gpu': [
            {
                'title': 'TensorFlow with GPUs for LLM Fine-Tuning',
                'description': 'Learn how to use TensorFlow with GPU acceleration for fine-tuning language models',
                'url': '/view-notebook/TensorFlow_with_GPUs_for_LLM_Finetuning'
            },
            {
                'title': 'RAPIDS cuDF for Accelerated Data Processing',
                'description': 'Learn how to use RAPIDS cuDF to accelerate data processing for LLM fine-tuning',
                'url': '/view-notebook/Intro_to_RAPIDS_cuDF'
            }
        ],
        'tpu': [
            {
                'title': 'TPUs for LLM Fine-Tuning',
                'description': 'Learn how to use TPUs for accelerated fine-tuning of large language models',
                'url': '/view-notebook/TPUs_for_LLM_Finetuning'
            }
        ],
        'pandas': [
            {
                'title': 'Introduction to Pandas DataFrame',
                'description': 'Learn how to use Pandas for data preparation in LLM fine-tuning',
                'url': '/view-notebook/Intro_to_Pandas_DataFrame'
            }
        ],
        'tensorflow': [
            {
                'title': 'TensorFlow with GPUs for LLM Fine-Tuning',
                'description': 'Learn how to use TensorFlow with GPU acceleration for fine-tuning language models',
                'url': '/view-notebook/TensorFlow_with_GPUs_for_LLM_Finetuning'
            },
            {
                'title': 'TPUs for LLM Fine-Tuning',
                'description': 'Learn how to use TPUs for accelerated fine-tuning of large language models',
                'url': '/view-notebook/TPUs_for_LLM_Finetuning'
            }
        ],
        'hardware': [
            {
                'title': 'TensorFlow with GPUs for LLM Fine-Tuning',
                'description': 'Learn how to use TensorFlow with GPU acceleration for fine-tuning language models',
                'url': '/view-notebook/TensorFlow_with_GPUs_for_LLM_Finetuning'
            },
            {
                'title': 'TPUs for LLM Fine-Tuning',
                'description': 'Learn how to use TPUs for accelerated fine-tuning of large language models',
                'url': '/view-notebook/TPUs_for_LLM_Finetuning'
            },
            {
                'title': 'RAPIDS cuDF for Accelerated Data Processing',
                'description': 'Learn how to use RAPIDS cuDF to accelerate data processing for LLM fine-tuning',
                'url': '/view-notebook/Intro_to_RAPIDS_cuDF'
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

@app.route('/category-visualization/<concept>')
def category_visualization(concept):
    """Render the enhanced category-specific visualization for a concept."""
    try:
        # Sanitize the concept name
        import re
        concept = re.sub(r'[^a-z0-9\-]', '', concept.lower())

        # Special case for hardware category
        if concept in ['gpu', 'tpu', 'hardware']:
            category = 'hardware'

            # Check if visualization file exists, if not, use the one we created
            vis_path = f'static/visualizations/{concept}_enhanced.html'
            if not os.path.exists(vis_path):
                # Use the GPU visualization as a fallback
                concept = 'gpu'
                vis_path = f'static/visualizations/gpu_enhanced.html'

            # Get related concepts for hardware
            related_concepts = [
                'gpu', 'tpu', 'cuda', 'tensor cores', 'mixed precision',
                'parallel processing', 'vram', 'tensorflow', 'pytorch'
            ]

            # Return the visualization page
            return render_template(
                'category_visualization.html',
                concept=concept,
                category=category,
                visualization_path=f'/static/visualizations/{concept}_enhanced.html',
                related_concepts=related_concepts
            )

        # Normal flow for other categories
        domain_graph = llm_thesaurus_instance.build_domain_graph(concept)

        if domain_graph:
            # Determine the category for the concept
            category = enhanced_visualizations.get_category_for_concept(concept)

            # Create the visualization file
            vis_path = f'static/visualizations/{concept}_enhanced.html'
            enhanced_visualizations.create_category_visualization(domain_graph, concept, vis_path)

            # Get related concepts
            domain_info = llm_thesaurus_instance.get_domain_relationships(concept)
            related_concepts = []
            if domain_info:
                # Get synonyms and related terms
                synonyms = domain_info.get("synonyms", [])
                related = domain_info.get("related", [])

                # Combine and limit to 10 concepts
                related_concepts = list(set(synonyms + related))[:10]

            # Return the visualization page
            return render_template(
                'category_visualization.html',
                concept=concept,
                category=category,
                visualization_path=f'/static/visualizations/{concept}_enhanced.html',
                related_concepts=related_concepts
            )
        else:
            # Fallback to fine-tuning if the concept is not found
            flash(f"Concept '{concept}' not found. Showing visualization for 'fine-tuning' instead.", "warning")
            return redirect(url_for('category_visualization', concept='fine-tuning'))
    except Exception as e:
        app.logger.error(f"Error in category_visualization: {e}")
        flash(f"Error generating visualization: {str(e)}", "error")
        return redirect(url_for('index'))

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

@app.route('/api/ask', methods=['POST'])
@csrf.exempt
def ask_ai_assistant():
    """API endpoint for the AI assistant."""
    try:
        data = request.json
        question = data.get('question', '')

        if not question:
            return jsonify({'error': 'No question provided'}), 400

        # Log the question for debugging
        app.logger.info(f"AI Assistant question: {question}")

        # Process the question and generate a response
        # This is a simple implementation - in a production environment,
        # you would use a more sophisticated approach

        # Check for specific keywords to provide targeted responses
        question_lower = question.lower()

        # Website-specific questions
        if any(term in question_lower for term in ['website', 'site', 'platform']):
            if any(term in question_lower for term in ['about', 'what is', 'purpose']):
                answer = """**About the Visual Thesaurus LLM Website**

This website is a comprehensive platform for learning about LLM fine-tuning techniques with hands-on exercises. Key features include:

1. **Visual Thesaurus**: Interactive visualization of relationships between LLM fine-tuning concepts
2. **Comprehensive Guides**: Detailed explanations of all fine-tuning techniques (LoRA, QLoRA, etc.)
3. **Hands-on Exercises**: Interactive code examples using Google Colab integration
4. **Workshops**: Step-by-step tutorials for implementing different fine-tuning approaches
5. **Search Functionality**: Find related terms and concepts across the platform
6. **AI Assistant**: Get instant answers to your questions (that's me!)

The platform is designed to be a complete resource for anyone looking to learn about and implement LLM fine-tuning, from beginners to advanced practitioners."""

            elif any(term in question_lower for term in ['navigate', 'use', 'find']):
                answer = """**How to Navigate the Website**

Here's how to get the most out of our platform:

1. **Top Navigation Bar**: Access all main sections (Learn, Thesaurus, Workshops, Guides)
2. **Visual Thesaurus**: Click on any concept to see its definition and related terms
3. **Search Bar**: Search for specific concepts or techniques
4. **Workshops**: Follow step-by-step tutorials with interactive code examples
5. **Guides**: Read comprehensive explanations of fine-tuning techniques
6. **AI Assistant** (that's me!): Click the robot icon in the bottom right to ask questions
7. **Light/Dark Mode**: Toggle between light and dark mode using the button in the top right

If you're new to the platform, I recommend starting with the [LoRA Implementation Guide](/guide/lora-implementation) or the [Fine-Tuning Comparison Guide](/guide/finetuning-comparison) to get a good overview of the different techniques."""

            elif any(term in question_lower for term in ['feature', 'offer', 'provide']):
                answer = """**Key Features of the Visual Thesaurus LLM Platform**

Our platform offers a comprehensive set of features for learning about LLM fine-tuning:

1. **Visual Thesaurus**: Interactive visualization of relationships between concepts
2. **Comprehensive Guides**: Detailed explanations of all fine-tuning techniques
3. **Hands-on Exercises**: Interactive code examples with Google Colab integration
4. **Workshops**: Step-by-step tutorials for implementing different approaches
5. **Search Functionality**: Find related terms and concepts across the platform
6. **AI Assistant**: Get instant answers to your questions (that's me!)
7. **Voice Interaction**: Speak to the AI assistant and listen to responses
8. **Light/Dark Mode**: Choose your preferred visual theme
9. **User Authentication**: Sign in with Gmail, GitHub, or other platforms
10. **Mobile Compatibility**: Access the platform on any device

All content is focused specifically on LLM fine-tuning, with real data and concise explanations."""

        # Accessibility questions
        elif any(term in question_lower for term in ['accessibility', 'accessible', 'disability']):
            answer = """**Accessibility Features of the Website**

Our platform is designed to be accessible to all users, including those with disabilities:

1. **High Contrast Mode**: The website uses high contrast colors for better visibility
2. **Screen Reader Compatibility**: All content is structured for screen readers
3. **Keyboard Navigation**: Full keyboard accessibility throughout the site
4. **Text Scaling**: Content scales properly when browser text size is increased
5. **Voice Interaction**: Speak to the AI assistant and listen to responses
6. **Alt Text**: All images have descriptive alt text
7. **Focus Indicators**: Clear visual indicators for keyboard focus
8. **Readable Fonts**: Fonts chosen for maximum readability
9. **Mobile Accessibility**: Fully accessible on mobile devices
10. **Color Schemes**: Color schemes designed for users with color vision deficiencies

If you encounter any accessibility issues, please let us know through the feedback form."""

        # Voice assistant questions
        elif any(term in question_lower for term in ['voice', 'speak', 'talk', 'listen']):
            answer = """**Voice Interaction with the AI Assistant**

You can interact with me (the AI assistant) using voice commands:

1. **Speak to Me**: Click the microphone button in the chat window to start speaking
2. **Listen to Responses**: Click the speaker button to have me read my responses aloud
3. **Stop Listening**: Click the microphone button again to stop voice recognition
4. **Stop Speaking**: Click the speaker button again to stop me from speaking

The voice functionality works best in modern browsers like Chrome, Edge, or Safari. Firefox has limited support for some voice features.

To get started:
1. Click the robot icon in the bottom right to open the chat
2. Click the microphone button (next to the send button)
3. Speak your question clearly
4. I'll process your question and respond
5. Click the speaker button to hear my response read aloud

Voice interaction is fully integrated with the text chat, so you can switch between voice and text at any time."""

        # Sign-in and authentication questions
        elif any(term in question_lower for term in ['sign in', 'login', 'register', 'account', 'authentication']):
            answer = """**Sign-in and Authentication**

Our platform offers several authentication options:

1. **Email/Password**: Traditional sign-in with email verification
2. **Google Authentication**: Sign in with your Google account
3. **GitHub Authentication**: Sign in with your GitHub account
4. **Facebook Authentication**: Sign in with your Facebook account

**Benefits of creating an account:**
- Save your progress in workshops and tutorials
- Bookmark favorite guides and resources
- Access exclusive content
- Sync your progress across devices

**Password Reset:**
If you forget your password, you can reset it by:
1. Clicking "Sign In" in the top right
2. Selecting "Forgot Password"
3. Entering your email address
4. Following the instructions in the reset email

All authentication is handled securely through Supabase, and we never store your passwords in plain text."""

        # LoRA-specific questions
        elif 'lora' in question_lower and 'qlora' not in question_lower:
            answer = """**LoRA (Low-Rank Adaptation)** is a parameter-efficient fine-tuning technique that significantly reduces memory usage and training time.

**How LoRA works:**
1. It freezes the pre-trained model weights
2. Injects trainable rank decomposition matrices into each layer of the Transformer architecture
3. These low-rank matrices capture the task-specific adaptations

**Key benefits:**
- Reduces trainable parameters by 10,000x in some cases
- Maintains 95%+ of full fine-tuning performance
- Enables fine-tuning on consumer GPUs (even 8GB VRAM)
- Allows for easy model switching by swapping adapters

**Implementation Resources:**
- [LoRA Implementation Guide](/guide/lora-implementation): Comprehensive explanation with code examples
- [LoRA Hands-on Exercise](/guide/lora-hands-on): Interactive Google Colab notebook
- [LoRA Workshop](/workshop/lora-fine-tuning): Step-by-step tutorial

**Related Concepts:**
- QLoRA (Quantized LoRA)
- PEFT (Parameter-Efficient Fine-Tuning)
- Adapter Tuning
- Rank Decomposition"""

        # QLoRA-specific questions
        elif 'qlora' in question_lower:
            answer = """**QLoRA (Quantized Low-Rank Adaptation)** combines quantization with LoRA for extremely memory-efficient fine-tuning.

**How QLoRA works:**
1. Quantizes the pre-trained model weights to 4-bit precision (4-bit NormalFloat or 4-bit Integer)
2. Uses a double quantization technique to further reduce memory
3. Keeps a small set of 16-bit parameters for the LoRA adapters
4. Uses paged optimizers to manage memory efficiently

**Key benefits:**
- Fine-tune 65B+ parameter models on a single consumer GPU (even 16GB VRAM)
- Maintains full fine-tuning quality (often better than standard LoRA)
- Reduces memory usage by up to 4x compared to standard LoRA
- Enables fine-tuning of larger models for better performance

**Implementation Resources:**
- [QLoRA Implementation Guide](/guide/qlora-implementation): Comprehensive explanation with code examples
- [QLoRA Deep Dive Workshop](/workshop/qlora-deep-dive): Advanced techniques and optimizations
- [Memory Efficiency Workshop](/workshop/memory-efficiency): Comparison with other memory-saving techniques

**Related Concepts:**
- LoRA (Low-Rank Adaptation)
- Quantization
- BitsAndBytes
- 4-bit NormalFloat (NF4)"""

        # Tutorial and workshop questions
        elif any(term in question_lower for term in ['tutorial', 'workshop', 'learn', 'guide']):
            answer = """**Learning Resources on Our Platform**

Our platform offers several interactive tutorials and workshops to help you master LLM fine-tuning:

1. **Comprehensive Guides:**
   - [LoRA Implementation Guide](/guide/lora-implementation)
   - [QLoRA Implementation Guide](/guide/qlora-implementation)
   - [Fine-Tuning Comparison Guide](/guide/finetuning-comparison)
   - [Instruction Tuning Guide](/guide/instruction-tuning)
   - [Understanding GPT Architecture](/guide/understanding-gpt)
   - [Data Preparation Guide](/guide/data-preparation)
   - [Pipeline Inference Guide](/guide/pipeline-inference)

2. **Hands-on Workshops:**
   - [Full Fine-Tuning Workshop](/workshop/full-fine-tuning)
   - [LoRA Fine-Tuning Workshop](/workshop/lora-fine-tuning)
   - [QLoRA Deep Dive Workshop](/workshop/qlora-deep-dive)
   - [Memory Efficiency Workshop](/workshop/memory-efficiency)
   - [Advanced PEFT Workshop](/workshop/advanced-peft)

3. **Interactive Tutorials:**
   - [LoRA Hands-on Exercise](/guide/lora-hands-on)
   - [Google Colab Integration](/tutorials)
   - [Hugging Face Pipeline Tutorial](/tutorials)

All tutorials include interactive code examples that you can run directly in your browser or in Google Colab. Each workshop includes quizzes to test your knowledge and assignments to apply what you've learned."""

        # Memory and GPU questions
        elif 'memory' in question_lower or 'gpu' in question_lower:
            answer = """**Memory Optimization Techniques for LLM Fine-Tuning**

Here are comprehensive strategies to reduce memory usage during fine-tuning:

**1. Parameter-Efficient Fine-Tuning (PEFT)**
- **LoRA**: Trains only low-rank adapter matrices (reduces parameters by 10,000x)
- **QLoRA**: Combines 4-bit quantization with LoRA (4x more efficient than LoRA)
- **Prefix Tuning**: Adds trainable continuous vectors to each transformer layer
- **Prompt Tuning**: Adds trainable vectors only to the input layer

**2. Quantization Techniques**
- **Post-Training Quantization**: Convert weights to INT8/INT4 after training
- **Quantization-Aware Training**: Train with simulated quantization
- **Mixed Precision Training**: Use FP16 or BF16 instead of FP32

**3. Optimization Techniques**
- **Gradient Checkpointing**: Trade computation for memory by recomputing activations
- **Gradient Accumulation**: Update weights after multiple forward/backward passes
- **Optimizer States**: Use memory-efficient optimizers like AdamW with 8-bit states
- **Activation Offloading**: Move activations to CPU when not needed

**GPU Requirements:**
- **Full Fine-Tuning**: 16GB+ VRAM for 7B models
- **LoRA Fine-Tuning**: 8GB+ VRAM for 7B models
- **QLoRA Fine-Tuning**: 4GB+ VRAM for 7B models (16GB for 65B models)

Check out our [Memory Efficiency Workshop](/workshop/memory-efficiency) for hands-on examples of these techniques."""

        # Fine-tuning overview questions
        elif 'fine-tun' in question_lower:
            answer = """**LLM Fine-Tuning Overview**

Fine-tuning is the process of adapting a pre-trained language model to a specific task or domain by training it on a smaller, task-specific dataset.

**Key Fine-Tuning Approaches:**

1. **Full Fine-Tuning**
   - Updates all model parameters
   - Requires significant GPU memory (16GB+ for 7B models)
   - Provides best performance but is resource-intensive
   - Learn more in our [Full Fine-Tuning Workshop](/workshop/full-fine-tuning)

2. **Parameter-Efficient Fine-Tuning (PEFT)**
   - **LoRA**: Updates low-rank adapter matrices instead of full weights
   - **QLoRA**: Combines quantization with LoRA for extreme memory efficiency
   - **Prefix/Prompt Tuning**: Adds trainable vectors to inputs or activations
   - Learn more in our [LoRA Workshop](/workshop/lora-fine-tuning) and [QLoRA Workshop](/workshop/qlora-deep-dive)

3. **Instruction Tuning**
   - Fine-tunes models to follow specific instructions
   - Uses instruction-response pairs for training
   - Creates more helpful, honest, and harmless models
   - Learn more in our [Instruction Tuning Guide](/guide/instruction-tuning)

Our platform provides comprehensive resources for all these approaches, including interactive tutorials, workshops, and implementation guides."""

        # Mobile compatibility questions
        elif any(term in question_lower for term in ['mobile', 'phone', 'tablet', 'ipad', 'responsive']):
            answer = """**Mobile Compatibility**

Our platform is fully responsive and works on all mobile devices:

1. **Responsive Design**: Automatically adapts to any screen size
2. **Touch-Friendly Interface**: All interactive elements are optimized for touch
3. **Mobile Navigation**: Simplified navigation menu on smaller screens
4. **Readable Text**: Font sizes adjusted for mobile readability
5. **Optimized Visualizations**: Thesaurus visualizations work on mobile devices
6. **Mobile Authentication**: Sign-in works seamlessly on mobile
7. **Offline Capability**: Some content available offline after initial load
8. **Performance Optimization**: Fast loading even on slower mobile connections

The AI assistant (that's me!) is also fully functional on mobile devices, including voice interaction capabilities. You can speak to me and listen to my responses on your mobile device.

For the best experience with code examples and notebooks, we recommend using a tablet or desktop, as coding on a small screen can be challenging. However, all content is accessible and readable on any device."""

        # Thesaurus questions
        elif any(term in question_lower for term in ['thesaurus', 'visualization', 'graph', 'concept map']):
            answer = """**Visual Thesaurus LLM Feature**

The Visual Thesaurus is a core feature of our platform that provides an interactive visualization of relationships between LLM fine-tuning concepts:

1. **Interactive Graph**: Click on any concept to see its definition and related terms
2. **Relationship Visualization**: See how different concepts are connected
3. **Synonyms and Related Terms**: Discover alternative terminology
4. **Domain-Specific Relationships**: Focused specifically on LLM fine-tuning concepts
5. **Search Functionality**: Find concepts and see their place in the knowledge graph
6. **Category Visualization**: View concepts grouped by category
7. **Zoom and Pan**: Explore the concept map at different levels of detail

**How to Use the Visual Thesaurus:**
1. Navigate to the [Thesaurus](/thesaurus) section
2. Click on any concept to see its definition
3. Explore related concepts by following the connections
4. Use the search bar to find specific concepts
5. Zoom in/out using the mouse wheel or pinch gesture on mobile
6. Pan around the visualization by clicking and dragging

The Visual Thesaurus processes full sentences, not just individual words, making it a powerful tool for understanding the relationships between complex concepts in LLM fine-tuning."""

        # Default response for other questions
        else:
            answer = """I'm your AI assistant for the Visual Thesaurus LLM platform. I can help you with:

1. **Learning about LLM fine-tuning techniques** like LoRA, QLoRA, and full fine-tuning
2. **Navigating the website** and finding specific resources
3. **Understanding the Visual Thesaurus** feature
4. **Accessing workshops and tutorials** on our platform
5. **Using the voice interaction features** (you can speak to me!)
6. **Finding information about website accessibility**
7. **Troubleshooting sign-in and authentication issues**
8. **Getting started with hands-on exercises**

Feel free to ask specific questions about any of these topics! You can also check out our [Guides](/guides) page for comprehensive explanations of LLM fine-tuning techniques."""

        return jsonify({
            'answer': answer,
            'status': 'success'
        }), 200

    except Exception as e:
        app.logger.error(f"Error in AI Assistant: {e}")
        return jsonify({
            'error': 'Error processing question',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    import argparse

    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Run the Thesaurus AI LLM Fine-Tuning web application')
    parser.add_argument('--port', type=int, default=5035, help='Port to run the server on')
    parser.add_argument('--host', type=str, default='0.0.0.0', help='Host to run the server on')
    parser.add_argument('--debug', action='store_true', default=True, help='Run in debug mode')

    args = parser.parse_args()

    print(f"Starting server on {args.host}:{args.port} (debug={args.debug})")
    app.run(host=args.host, port=args.port, debug=args.debug)
