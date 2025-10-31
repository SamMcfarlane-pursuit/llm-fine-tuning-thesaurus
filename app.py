"""
Flask web application for the Visual Thesaurus LLM project.
This provides a web interface for interacting with the thesaurus.
"""
import os
import ssl
import nltk
import logging
import traceback
from flask import Flask, render_template, request, jsonify, redirect, url_for, session, g
import json
import uuid

from flask_login import current_user, login_required
from visual_thesaurus import VisualThesaurus
from thesaurus_utils import ThesaurusLLM
from llm_concepts import LLMConceptsVisualizer
from llm_thesaurus import LLMThesaurus
import models as root_models
from models.auth import User, UserProgress
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

# FREE OLLAMA AI ASSISTANT IMPLEMENTATION
import requests
import subprocess
import time
from typing import Optional, Dict, List
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class FreeOllamaAIAssistant:
    """
    100% FREE Ollama AI Assistant for Visual LLM Education
    No API keys, no costs, unlimited usage
    """

    def __init__(self, base_url="http://localhost:11434"):
        self.base_url = base_url
        self.models = {
            'educational': 'visual-llm-educator',  # Our custom educational AI with teacher personality
            'general': 'llama3.1',                 # Best overall model - Latest Llama
            'fast': 'llama3.2',                    # Fast responses - Smaller Llama
            'code': 'codellama',                   # Code generation specialist
            'small': 'llama3.2',                   # Lightweight but capable
            'math': 'llama3.1',                    # Mathematical reasoning - Most capable
            'fallback': 'mistral'                  # Fallback if Llama models unavailable
        }
        self.current_model = 'general'
        self.llm_knowledge = self._load_educational_content()

        # Create session with connection pooling for high-volume usage
        self.session = requests.Session()

        # Configure retry strategy
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )

        # Mount adapter with retry strategy
        adapter = HTTPAdapter(
            pool_connections=10,
            pool_maxsize=20,
            max_retries=retry_strategy
        )
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)

    def _load_educational_content(self):
        """Educational content for LLM fine-tuning"""
        return {
            'lora': """LoRA (Low-Rank Adaptation) is a parameter-efficient fine-tuning technique that:
            - Reduces trainable parameters by up to 99%
            - Decomposes weight updates into low-rank matrices
            - Maintains model performance while using less memory
            - Enables fine-tuning on consumer GPUs""",

            'qlora': """QLoRA combines quantization with LoRA:
            - Uses 4-bit quantization to reduce memory usage
            - Maintains LoRA's parameter efficiency
            - Enables fine-tuning 70B models on single GPU
            - Preserves model quality despite quantization""",

            'transformer': """The Transformer architecture revolutionized NLP:
            - Uses self-attention instead of recurrence
            - Enables parallel processing of sequences
            - Better at capturing long-range dependencies
            - Foundation for models like BERT, GPT, T5""",

            'attention': """Attention mechanisms allow models to:
            - Focus on relevant parts of input sequences
            - Compute relationships between all positions
            - Handle variable-length sequences efficiently
            - Form the core of transformer architectures""",

            'fine_tuning': """Fine-tuning adapts pre-trained models:
            - Continues training on domain-specific data
            - Uses lower learning rates than pre-training
            - Can be full fine-tuning or parameter-efficient
            - Transfers knowledge to new tasks effectively"""
        }

    def is_available(self) -> bool:
        """Check if Ollama is running"""
        try:
            response = self.session.get(f"{self.base_url}/api/tags", timeout=3)
            return response.status_code == 200
        except:
            return False

    def start_ollama(self) -> bool:
        """Start Ollama service"""
        try:
            subprocess.Popen(['ollama', 'serve'],
                           stdout=subprocess.DEVNULL,
                           stderr=subprocess.DEVNULL)
            time.sleep(3)  # Wait for service to start
            return self.is_available()
        except:
            return False

    def download_model(self, model_name: str) -> bool:
        """Download a model if not present"""
        try:
            print(f"📦 Downloading {model_name}...")
            result = subprocess.run([
                'ollama', 'pull', model_name
            ], capture_output=True, text=True)
            return result.returncode == 0
        except:
            return False

    def get_available_models(self) -> List[str]:
        """Get list of downloaded models"""
        if not self.is_available():
            return []

        try:
            response = self.session.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get('models', [])
                return [model['name'].split(':')[0] for model in models]
            return []
        except:
            return []

    def choose_best_model(self, query: str) -> str:
        """Choose best model based on query content and availability - prioritizing educational model"""
        query_lower = query.lower()
        available_models = self.get_available_models()

        # Educational keywords that benefit from our custom educational model
        educational_keywords = [
            'lora', 'qlora', 'fine-tuning', 'transformer', 'attention', 'peft', 'adapter',
            'explain', 'what is', 'how does', 'why', 'teach', 'learn', 'understand',
            'difference', 'compare', 'example', 'tutorial', 'guide', 'help'
        ]

        # ALWAYS prioritize our custom educational model for educational content
        if any(word in query_lower for word in educational_keywords):
            # For educational content: prioritize our custom model first
            preferred_models = [self.models['educational'], self.models['general'], self.models['math']]
        elif any(word in query_lower for word in ['code', 'python', 'javascript', 'programming', 'function', 'implementation']):
            # For code: prefer educational model (it has coding knowledge), then codellama
            preferred_models = [self.models['educational'], self.models.get('code'), self.models['general']]
        elif any(word in query_lower for word in ['math', 'calculate', 'equation', 'formula', 'statistics', 'parameter']):
            # For math: prefer educational model, then math-capable models
            preferred_models = [self.models['educational'], self.models['math'], self.models['general']]
        elif any(word in query_lower for word in ['quick', 'fast', 'simple', 'brief', 'hello', 'hi']) or len(query) < 30:
            # For quick queries: still try educational model first for consistency
            preferred_models = [self.models['educational'], self.models['fast'], self.models['small']]
        else:
            # For all other content: default to educational model for best teaching experience
            preferred_models = [self.models['educational'], self.models['general'], self.models['fast']]

        # Return the first available model from preferences
        for model in preferred_models:
            if model and model in available_models:
                return model

        # Fallback to any available model (prefer newer models)
        if available_models:
            # Prefer llama3.2 or llama3.1 if available
            for preferred in ['llama3.2', 'llama3.1', 'mistral']:
                if preferred in available_models:
                    return preferred
            return available_models[0]

        # Final fallback
        return self.models.get('fast', 'llama3.2')

    def enhance_prompt(self, user_query: str) -> str:
        """Add comprehensive educational context to prompts for intelligent responses"""
        context = """You are Professor LLM, an expert AI educator specializing in Large Language Model fine-tuning on the Visual LLM platform.

EDUCATIONAL MISSION: Provide comprehensive, detailed, and practical guidance on LLM fine-tuning techniques.

YOUR EXPERTISE INCLUDES:
• LoRA (Low-Rank Adaptation) - mathematical foundations, implementation, optimization
• QLoRA (Quantized LoRA) - 4-bit quantization, memory efficiency, hardware requirements
• Parameter-Efficient Fine-Tuning (PEFT) - methods, comparisons, best practices
• Transformer architectures - attention mechanisms, layer structures, scaling
• Hugging Face ecosystem - transformers, peft, datasets, model hub
• Practical implementation - complete code examples, debugging, optimization
• Hardware considerations - GPU memory, quantization, distributed training

RESPONSE REQUIREMENTS:
✅ Provide detailed, comprehensive explanations (minimum 300 words for technical topics)
✅ Include practical code examples with explanations
✅ Use clear educational structure with headings and bullet points
✅ Explain mathematical concepts in accessible terms
✅ Offer step-by-step implementation guidance
✅ Compare different approaches and their trade-offs
✅ Include best practices and common pitfalls
✅ Maintain encouraging, supportive educational tone

VISUAL LLM PLATFORM CONTEXT:
This is an educational platform focused on teaching LLM fine-tuning techniques. Users are students and practitioners learning about:
- LoRA and QLoRA fine-tuning methods
- Parameter-efficient training techniques
- Practical implementation with real models
- Memory optimization and hardware efficiency
- Production deployment strategies

PLATFORM FEATURES:
- Interactive learning modules and workshops
- Hands-on coding exercises with real models
- Comprehensive tutorials and guides
- Quizzes and assessments for knowledge retention
- AI assistant support across all pages
- Code examples and practical implementations

RESPONSE FORMAT:
- Use educational emojis (🎓, 📚, 💡, 🔍, ✅) for visual appeal
- Structure responses with clear headings and bullet points
- Include code examples when relevant
- Provide step-by-step guidance for complex topics
- Encourage hands-on learning and experimentation

        """

        # Add relevant educational content with enhanced context
        for keyword, content in self.llm_knowledge.items():
            if keyword.lower() in user_query.lower():
                context += f"\nRELEVANT EDUCATIONAL BACKGROUND on {keyword.upper()}:\n{content}\n"

        # Add specific context based on query type
        query_lower = user_query.lower()
        if any(word in query_lower for word in ['code', 'example', 'implementation', 'python']):
            context += "\nNOTE: Provide complete, working code examples with detailed explanations.\n"

        if any(word in query_lower for word in ['difference', 'compare', 'vs', 'versus']):
            context += "\nNOTE: Provide comprehensive comparisons with technical details, pros/cons, and use cases.\n"

        if any(word in query_lower for word in ['how', 'step', 'guide', 'tutorial']):
            context += "\nNOTE: Provide step-by-step guidance with practical implementation details.\n"

        return context + f"\nSTUDENT QUESTION: {user_query}\n\nPlease provide a comprehensive, educational response that includes technical depth, practical examples, and encourages hands-on learning:\n\nRESPONSE:"

    def query(self, user_message: str, model: Optional[str] = None) -> Dict:
        """Query Ollama with educational enhancement"""
        # Auto-setup if needed
        if not self.is_available():
            print("🔧 Ollama not available, attempting to start...")
            if not self.start_ollama():
                return {
                    'response': 'AI assistant is currently offline. Please ensure Ollama is installed and running. Visit https://ollama.ai for installation instructions.',
                    'status': 'offline',
                    'model': 'none'
                }

        # Choose best model
        selected_model = model or self.choose_best_model(user_message)

        # Ensure model is available
        available_models = self.get_available_models()
        if selected_model not in available_models:
            # Try to download the model
            if not self.download_model(selected_model):
                # Fallback to any available model
                if available_models:
                    selected_model = available_models[0]
                else:
                    return {
                        'response': f'No models available. Please download a model first: ollama pull {selected_model}',
                        'status': 'no_models',
                        'model': 'none'
                    }

        enhanced_prompt = self.enhance_prompt(user_message)

        try:
            # Use session with connection pooling for high-volume usage
            response = self.session.post(
                f"{self.base_url}/api/generate",
                json={
                    'model': selected_model,
                    'prompt': enhanced_prompt,
                    'stream': False,
                    'options': {
                        'temperature': 0.7,
                        'top_p': 0.9,
                        'top_k': 40,
                        'num_predict': 2000,    # Increased for comprehensive educational responses
                        'stop': ['Student question:', 'Human:', 'User:', '\n\nStudent:', '\n\nHuman:'],
                        'num_ctx': 4096,        # Increased context window for detailed responses
                        'repeat_penalty': 1.1,  # Reduce repetition
                        'seed': -1,             # Random seed for variety
                        'num_thread': 8,        # Increased threads for better performance
                        'num_gpu': 1,           # Enable GPU if available
                        'low_vram': False       # Allow more memory for detailed responses
                    }
                },
                timeout=45,  # Optimized timeout for loaded models
                headers={'Connection': 'keep-alive'}  # Connection pooling
            )

            if response.status_code == 200:
                result = response.json()
                return {
                    'response': result.get('response', '').strip(),
                    'status': 'success',
                    'model': selected_model,
                    'tokens': result.get('eval_count', 0)
                }
            else:
                return {
                    'response': 'Sorry, I encountered an error processing your request.',
                    'status': 'error',
                    'model': selected_model
                }

        except Exception as e:
            return {
                'response': f'Sorry, I\'m having trouble. Error: {str(e)}',
                'status': 'error',
                'model': selected_model
            }

    def stream_query(self, user_message: str, model: Optional[str] = None):
        """Stream responses for real-time chat"""
        if not self.is_available():
            yield "AI assistant is currently offline. Please ensure Ollama is running."
            return

        selected_model = model or self.choose_best_model(user_message)
        enhanced_prompt = self.enhance_prompt(user_message)

        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    'model': selected_model,
                    'prompt': enhanced_prompt,
                    'stream': True,
                    'options': {
                        'temperature': 0.7,
                        'top_p': 0.9,
                        'max_tokens': 1000
                    }
                },
                stream=True,
                timeout=60
            )

            for line in response.iter_lines():
                if line:
                    try:
                        data = json.loads(line)
                        if 'response' in data:
                            yield data['response']
                        if data.get('done', False):
                            break
                    except json.JSONDecodeError:
                        continue

        except Exception as e:
            yield f"Error: {str(e)}"

# Initialize the FREE AI Assistant
free_ai_assistant = FreeOllamaAIAssistant()

# Initialize Enhanced AI Assistant with comprehensive knowledge base
try:
    from enhanced_ai_assistant import create_enhanced_ai_assistant
    enhanced_ai_assistant = create_enhanced_ai_assistant()
    print("✅ Enhanced AI Assistant initialized with comprehensive knowledge base")
    ENHANCED_KNOWLEDGE_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Enhanced AI Assistant not available: {e}")
    enhanced_ai_assistant = None
    ENHANCED_KNOWLEDGE_AVAILABLE = False

# Initialize Multi-Provider AI Assistant for enhanced performance
try:
    import asyncio
    import aiohttp
    from multi_provider_ai_assistant import MultiProviderAIAssistant

    multi_ai_assistant = MultiProviderAIAssistant()
    print("✅ Multi-provider AI assistant initialized with Groq, HuggingFace, and Ollama support")
    ENHANCED_AI_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Multi-provider AI not available (missing dependencies): {e}")
    multi_ai_assistant = None
    ENHANCED_AI_AVAILABLE = False
except Exception as e:
    print(f"⚠️ Multi-provider AI assistant failed to initialize: {e}")
    multi_ai_assistant = None
    ENHANCED_AI_AVAILABLE = False

# Initialize Enhanced API System for comprehensive provider management
try:
    from enhanced_api_system import EnhancedAPISystem
    enhanced_api = EnhancedAPISystem()
    ENHANCED_API_AVAILABLE = True
    print("✅ Enhanced API System initialized with multiple provider support")
except Exception as e:
    print(f"⚠️ Enhanced API System not available: {e}")
    enhanced_api = None
    ENHANCED_API_AVAILABLE = False

# Initialize Comprehensive AI Assistant (Claude-level quality)
try:
    from comprehensive_ai_assistant import ComprehensiveAIAssistant
    comprehensive_ai = ComprehensiveAIAssistant()
    COMPREHENSIVE_AI_AVAILABLE = True
    print("🧠 Comprehensive AI Assistant initialized with Claude-level capabilities")
except Exception as e:
    print(f"⚠️ Comprehensive AI Assistant not available: {e}")
    comprehensive_ai = None
    COMPREHENSIVE_AI_AVAILABLE = False

# Initialize LoRA Model System for actual fine-tuned model inference
try:
    from lora_model_server import lora_manager, get_lora_response

    print("✅ LoRA Model System initialized")
    print("🔍 Checking for available LoRA adapters...")

    available_models = lora_manager.get_available_models()
    lora_models_available = any(info["adapter_available"] for info in available_models.values())

    if lora_models_available:
        print("✅ LoRA adapters found and ready for inference")
        LORA_MODELS_AVAILABLE = True
    else:
        print("⚠️ No LoRA adapters found - will use fallback responses")
        print("💡 Run 'python train_lora_models.py' to train educational assistant")
        LORA_MODELS_AVAILABLE = False

except ImportError as e:
    print(f"⚠️ LoRA Model System not available (missing dependencies): {e}")
    print("📦 Install: pip install transformers peft torch")
    LORA_MODELS_AVAILABLE = False
except Exception as e:
    print(f"⚠️ LoRA Model System failed to initialize: {e}")
    LORA_MODELS_AVAILABLE = False

# Initialize QLoRA Model System for advanced 4-bit quantized models
try:
    from qlora_model_server import qlora_manager, get_qlora_response

    print("⚡ QLoRA Model System initialized")
    print("🔍 Checking for available QLoRA adapters...")

    available_qlora = qlora_manager.get_available_qlora_models()
    qlora_models_available = any(info["adapter_available"] for info in available_qlora.values())

    if qlora_models_available:
        print("✅ QLoRA adapters found and ready for inference")
        print("⚡ 4-bit quantization enabled for large model fine-tuning")
        QLORA_MODELS_AVAILABLE = True
    else:
        print("⚠️ No QLoRA adapters found - advanced models not available")
        print("💡 Run 'python train_qlora_models.py' to train Llama-2-7B")
        QLORA_MODELS_AVAILABLE = False

except ImportError as e:
    print(f"⚠️ QLoRA Model System not available (missing dependencies): {e}")
    print("📦 Install: pip install transformers peft torch bitsandbytes")
    QLORA_MODELS_AVAILABLE = False
except Exception as e:
    print(f"⚠️ QLoRA Model System failed to initialize: {e}")
    QLORA_MODELS_AVAILABLE = False

# Initialize User Training System for Phase 4 advanced features
try:
    from user_training_system import get_training_manager

    user_training_manager = get_training_manager()
    print("👥 User Training System initialized")
    print("🎓 Users can now train their own LoRA models!")
    USER_TRAINING_AVAILABLE = True

except ImportError as e:
    print(f"⚠️ User Training System not available (missing dependencies): {e}")
    print("📦 Install: pip install transformers peft torch datasets")
    USER_TRAINING_AVAILABLE = False
except Exception as e:
    print(f"⚠️ User Training System failed to initialize: {e}")
    USER_TRAINING_AVAILABLE = False

# Initialize Gamification System for Phase 5 engagement features
try:
    from gamification_system import get_gamification_manager

    gamification_manager = get_gamification_manager()
    print("🎮 Gamification System initialized")
    print("🏆 Badges, achievements, and leaderboards ready!")
    GAMIFICATION_AVAILABLE = True

except ImportError as e:
    print(f"⚠️ Gamification System not available: {e}")
    GAMIFICATION_AVAILABLE = False
except Exception as e:
    print(f"⚠️ Gamification System failed to initialize: {e}")
    GAMIFICATION_AVAILABLE = False

# Initialize Global Expansion System for Phase 6 international features
try:
    from global_expansion_system import get_global_expansion_manager

    global_expansion_manager = get_global_expansion_manager()
    print("🌍 Global Expansion System initialized")
    print("🌐 Multi-language support and accessibility ready!")
    GLOBAL_EXPANSION_AVAILABLE = True

except ImportError as e:
    print(f"⚠️ Global Expansion System not available: {e}")
    GLOBAL_EXPANSION_AVAILABLE = False
except Exception as e:
    print(f"⚠️ Global Expansion System failed to initialize: {e}")
    GLOBAL_EXPANSION_AVAILABLE = False

# Initialize Platform Completion System for Phase 7 final features
try:
    from platform_completion_system import get_platform_completion_manager

    platform_completion_manager = get_platform_completion_manager()
    print("🌟 Platform Completion System initialized")
    print("🎓 University partnerships and certifications ready!")
    PLATFORM_COMPLETION_AVAILABLE = True

except ImportError as e:
    print(f"⚠️ Platform Completion System not available: {e}")
    PLATFORM_COMPLETION_AVAILABLE = False
except Exception as e:
    print(f"⚠️ Platform Completion System failed to initialize: {e}")
    PLATFORM_COMPLETION_AVAILABLE = False

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

# Production configuration setup
try:
    from production_config import get_config, validate_production_env

    # Get environment-specific configuration
    env = os.environ.get('FLASK_ENV', 'development')
    if env == 'production':
        # Validate production environment variables
        validate_production_env()
        print("✅ Production environment validated")

    # Load production configuration
    production_config = get_config()
    app.config.from_object(production_config)

    # Initialize production configuration
    if hasattr(production_config, 'init_app'):
        production_config.init_app(app)

    print(f"🔧 Loaded {env} configuration")

except ImportError:
    # Fallback to existing config if production_config not available
    print("⚠️ Using fallback configuration")
    app_config = config.get(os.environ.get('FLASK_ENV', 'development'))
    app.config.from_object(app_config)
except Exception as e:
    print(f"❌ Configuration error: {e}")
    # Use development config as fallback
    app_config = config.get('development')
    app.config.from_object(app_config)

# Production security enhancements
if os.environ.get('FLASK_ENV') == 'production':
    # Trust proxy headers for HTTPS detection
    from werkzeug.middleware.proxy_fix import ProxyFix
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

# Custom middleware for error handling
class ErrorHandlingMiddleware:
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app
        
    def __call__(self, environ, start_response):
        try:
            return self.wsgi_app(environ, start_response)
        except Exception as e:
            # Log the exception
            logger.critical(f"Unhandled middleware exception: {str(e)}\nTraceback: {traceback.format_exc()}")
            
            # Start the response with a 500 status code
            start_response('500 INTERNAL SERVER ERROR', [
                ('Content-Type', 'text/html')
            ])
            
            # Return the 500 error page content
            with open(os.path.join(os.path.dirname(__file__), 'templates/errors/500.html'), 'rb') as f:
                return [f.read()]

# Apply middleware
app.wsgi_app = ErrorHandlingMiddleware(app.wsgi_app)

# Force HTTPS in production only, not in development
@app.before_request
def force_https():
    # Skip HTTPS redirect for local development
    if '127.0.0.1' in request.host or 'localhost' in request.host:
        return None
    
    if not request.is_secure and request.headers.get('X-Forwarded-Proto') != 'https':
        return redirect(request.url.replace('http://', 'https://'))

print("🔒 Production security enabled")

# Initialize extensions
db.init_app(app)
login_manager.init_app(app)
migrate.init_app(app, db)
oauth.init_app(app)
csrf.init_app(app)

# Initialize production extensions
try:
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address
    from flask_caching import Cache
    from flask_compress import Compress

    # Rate limiting for production
    limiter = Limiter(
        app,
        key_func=get_remote_address,
        default_limits=["200 per day", "50 per hour"],
        storage_uri=app.config.get('RATELIMIT_STORAGE_URL', 'memory://')
    )

    # Caching for performance
    cache = Cache(app)

    # Compression for static files
    compress = Compress(app)

    print("✅ Production extensions initialized (rate limiting, caching, compression)")

except ImportError as e:
    print(f"⚠️ Some production extensions not available: {e}")
    # Create dummy objects to prevent errors
    class DummyLimiter:
        def limit(self, *args, **kwargs):
            def decorator(f):
                return f
            return decorator

    class DummyCache:
        def cached(self, *args, **kwargs):
            def decorator(f):
                return f
            return decorator
        def memoize(self, *args, **kwargs):
            def decorator(f):
                return f
            return decorator

    limiter = DummyLimiter()
    cache = DummyCache()

# Configure session for proper login persistence
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours

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

# Register Enhanced API Systems
from api.llm_assistant_api import llm_api
from api.ollama_training_api import training_api
app.register_blueprint(llm_api)
app.register_blueprint(training_api)

# Initialize OAuth providers
from auth.oauth import init_oauth
init_oauth(app)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    """Handle 404 errors with custom template"""
    logger.warning(f"404 Error: {request.path} - Referrer: {request.referrer}")
    return render_template('errors/404.html'), 404

@app.errorhandler(403)
def forbidden_error(error):
    """Handle 403 errors with custom template"""
    logger.warning(f"403 Error: {request.path} - User: {current_user.id if not current_user.is_anonymous else 'Anonymous'}")
    return render_template('errors/403.html'), 403

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors with custom template and detailed logging"""
    logger.error(f"500 Error: {request.path}\nError: {error}\nTraceback: {traceback.format_exc()}")
    return render_template('errors/500.html'), 500

@app.errorhandler(Exception)
def unhandled_exception(error):
    """Catch all unhandled exceptions"""
    logger.critical(f"Unhandled Exception: {error}\nPath: {request.path}\nTraceback: {traceback.format_exc()}")
    return render_template('errors/500.html'), 500

# Simple fallback thesaurus implementation
class SimpleLLMThesaurus:
    """Simple thesaurus using educational LLM concepts"""

    def __init__(self):
        self.llm_concepts = {
            'lora': {
                'synonyms': ['low-rank adaptation', 'parameter-efficient fine-tuning', 'PEFT', 'adapter tuning'],
                'related': ['qlora', 'fine-tuning', 'adapters', 'parameter efficiency', 'memory optimization'],
                'definition': 'LoRA (Low-Rank Adaptation) is a parameter-efficient fine-tuning technique that reduces trainable parameters by decomposing weight updates into low-rank matrices.'
            },
            'qlora': {
                'synonyms': ['quantized lora', 'quantized low-rank adaptation', '4-bit lora'],
                'related': ['lora', 'quantization', 'fine-tuning', 'memory efficiency', '4-bit training'],
                'definition': 'QLoRA combines 4-bit quantization with LoRA to enable fine-tuning of large language models on consumer hardware.'
            },
            'transformer': {
                'synonyms': ['attention model', 'self-attention network', 'encoder-decoder'],
                'related': ['attention', 'bert', 'gpt', 'encoder', 'decoder', 'multi-head attention'],
                'definition': 'The Transformer is a neural network architecture that uses self-attention mechanisms to process sequential data in parallel.'
            },
            'fine-tuning': {
                'synonyms': ['model adaptation', 'transfer learning', 'domain adaptation'],
                'related': ['lora', 'qlora', 'training', 'optimization', 'learning rate', 'epochs'],
                'definition': 'Fine-tuning is the process of adapting a pre-trained model to a specific task or domain using task-specific data.'
            },
            'attention': {
                'synonyms': ['attention mechanism', 'self-attention', 'multi-head attention'],
                'related': ['transformer', 'query', 'key', 'value', 'softmax', 'weights'],
                'definition': 'Attention mechanisms allow models to focus on relevant parts of the input when making predictions.'
            }
        }

    def get_word_data(self, word):
        word_lower = word.lower()
        if word_lower in self.llm_concepts:
            concept = self.llm_concepts[word_lower]
            return {
                'word': word,
                'synonyms': concept['synonyms'],
                'related': concept['related'],
                'definition': concept['definition']
            }
        return {'word': word, 'synonyms': [], 'related': [], 'definition': f'No definition available for {word}'}

    def get_synonyms(self, word):
        return self.get_word_data(word)['synonyms']

    def get_related_terms(self, word):
        return self.get_word_data(word)['related']

    def search(self, query):
        results = []
        query_lower = query.lower()
        for concept, data in self.llm_concepts.items():
            if (query_lower in concept or
                any(query_lower in syn.lower() for syn in data['synonyms']) or
                any(query_lower in rel.lower() for rel in data['related'])):
                results.append({
                    'term': concept,
                    'definition': data['definition'],
                    'relevance': 1.0
                })
        return results

    def get_related_concepts(self, query):
        return self.search(query)

    def get_learning_resources(self):
        return [
            {'title': 'LoRA Guide', 'url': '/lora-guide', 'type': 'guide'},
            {'title': 'QLoRA Guide', 'url': '/qlora-guide', 'type': 'guide'},
            {'title': 'Workshops', 'url': '/workshops', 'type': 'interactive'},
            {'title': 'Tutorials', 'url': '/tutorials', 'type': 'tutorial'}
        ]

    def get_concept_definition(self, concept):
        return self.get_word_data(concept)['definition']

# Initialize global instances
try:
    # Try to initialize the full ThesaurusLLM if a model is available
    # Check if there's a model path available first
    model_path = os.environ.get('THESAURUS_MODEL_PATH')
    if model_path and os.path.exists(model_path):
        thesaurus = ThesaurusLLM(model_path=model_path)
        print(f"✅ ThesaurusLLM initialized with model: {model_path}")
    else:
        # No model available, use fallback
        raise ValueError("No model path available")
except Exception as e:
    print(f"Info: ThesaurusLLM initialization failed: {e}")
    print("Using simple fallback thesaurus with LLM educational concepts")
    thesaurus = SimpleLLMThesaurus()

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
    # Calculate overall progress based on completed workshops
    overall_progress = 0
    workshops_completed = 0
    completed_workshops = 0  # For achievements
    total_workshops = 5  # Adjust based on actual number of workshops

    # Learning streak data
    current_streak = 0
    streak_progress = 0
    streak_message = "Start your learning journey today!"
    longest_streak = 0
    total_learning_days = 0

    # You can add logic here to calculate actual progress from user data
    # For now, providing default values to prevent template errors

    return render_template('workshop_progress.html',
                         base_template='base-simple.html',
                         overall_progress=overall_progress,
                         workshops_completed=workshops_completed,
                         completed_workshops=completed_workshops,
                         total_workshops=total_workshops,
                         current_streak=current_streak,
                         streak_progress=streak_progress,
                         streak_message=streak_message,
                         longest_streak=longest_streak,
                         total_learning_days=total_learning_days)

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

@app.route('/user-training')
def user_training():
    """User Training System - Phase 4 Feature"""
    return render_template('user_training.html', base_template='base.html')

@app.route('/achievements')
def achievements_dashboard():
    """Gamification Dashboard - Phase 5 Feature"""
    return render_template('gamification_dashboard.html', base_template='base.html')

@app.route('/certifications')
def certifications_dashboard():
    """Certifications Dashboard - Phase 7 Feature"""
    return render_template('certifications_dashboard.html', base_template='base.html')

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

@app.route('/lora_hands_on')
def lora_hands_on():
    return render_template('lora_hands_on.html', base_template='base-simple.html')

@app.route('/qlora_hands_on')
def qlora_hands_on():
    return render_template('qlora_hands_on.html', base_template='base-simple.html')

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

# PyTorch Framework Routes
@app.route('/frameworks/pytorch')
def pytorch_guide():
    return render_template('pytorch.html', base_template='base-simple.html')

@app.route('/frameworks/pytorch/exercises')
def pytorch_exercises():
    return render_template('pytorch_exercises.html', base_template='base-simple.html')

@app.route('/frameworks/pytorch/exercises/basics')
def pytorch_exercises_basics():
    return render_template('pytorch_exercises/basics.html', base_template='base-simple.html')

@app.route('/frameworks/pytorch/exercises/linear-regression')
def pytorch_exercises_linear_regression():
    return render_template('pytorch_exercises/linear_regression.html', base_template='base-simple.html')

@app.route('/frameworks/pytorch/exercises/neural-network-basics')
def pytorch_exercises_neural_network():
    return render_template('pytorch_exercises/neural_network.html', base_template='base-simple.html')

@app.route('/frameworks/pytorch/exercises/data-loading')
def pytorch_exercises_data_loading():
    return render_template('pytorch_exercises/data_loading.html', base_template='base-simple.html')

@app.route('/frameworks/pytorch/exercises/cnn')
def pytorch_exercises_cnn():
    return render_template('pytorch_exercises/cnn.html', base_template='base-simple.html')

@app.route('/frameworks/pytorch/exercises/rnn')
def pytorch_exercises_rnn():
    return render_template('pytorch_exercises/rnn.html', base_template='base-simple.html')

@app.route('/frameworks/pytorch/exercises/custom-datasets')
def pytorch_exercises_custom_datasets():
    return render_template('pytorch_exercises/custom_datasets.html', base_template='base-simple.html')

@app.route('/frameworks/pytorch/exercises/transfer-learning')
def pytorch_exercises_transfer_learning():
    return render_template('pytorch_exercises/transfer_learning.html', base_template='base-simple.html')

@app.route('/frameworks/pytorch/exercises/gan')
def pytorch_exercises_gan():
    return render_template('pytorch_exercises/gan.html', base_template='base-simple.html')

@app.route('/frameworks/pytorch/exercises/attention')
def pytorch_exercises_attention():
    return render_template('pytorch_exercises/attention.html', base_template='base-simple.html')

@app.route('/frameworks/pytorch/exercises/deployment')
def pytorch_exercises_deployment():
    return render_template('pytorch_exercises/deployment.html', base_template='base-simple.html')

@app.route('/frameworks/pytorch/exercises/distributed')
def pytorch_exercises_distributed():
    return render_template('pytorch_exercises/distributed.html', base_template='base-simple.html')

# TensorFlow Framework Routes
@app.route('/frameworks/tensorflow')
def tensorflow_guide():
    return render_template('tensorflow.html', base_template='base-simple.html')

@app.route('/frameworks/tensorflow/exercises')
def tensorflow_exercises():
    return render_template('tensorflow_exercises.html', base_template='base-simple.html')

@app.route('/frameworks/tensorflow/exercises/basics')
def tensorflow_exercises_basics():
    return render_template('tensorflow_exercises/basics.html', base_template='base-simple.html')

@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html', base_template='base-simple.html')

@app.route('/training/ollama')
@login_required
def ollama_training():
    """Ollama model training interface"""
    return render_template('training/ollama_training.html')

@app.route('/training/api')
@login_required
def api_training():
    """Enhanced API training and management interface"""
    return render_template('training/api_training.html')

@app.route('/login')
def login():
    # Redirect to the auth blueprint login route
    return redirect(url_for('auth.login'))

@app.route('/register')
def register():
    # Redirect to the auth blueprint register route
    return redirect(url_for('auth.register'))

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

@app.route('/test-ai-connection')
def test_ai_connection():
    """Comprehensive AI connection test page"""
    return render_template('test_ai_connection.html')

@app.route('/test-free-ai')
def test_free_ai():
    """Test the FREE Ollama AI assistant"""
    return render_template('test_free_ai.html')

@app.route('/test-working-ai')
def test_working_ai():
    return render_template('test-working-ai.html')

@app.route('/test-clean-navigation')
def test_clean_navigation():
    return render_template('test-clean-navigation.html')

@app.route('/auth-test')
def auth_test():
    """Authentication test page to verify all OAuth providers."""
    return render_template('auth_test.html', config=app.config)

@app.route('/analytics')
def analytics_dashboard():
    return render_template('analytics_dashboard.html', base_template='base-simple.html')

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

@app.route('/api/analytics/user-stats')
@csrf.exempt
def get_user_analytics_stats():
    """Get precise analytics data for the current user/session"""
    try:
        # Get session ID for tracking anonymous users
        session_id = session.get('session_id')
        if not session_id:
            session_id = str(uuid.uuid4())
            session['session_id'] = session_id

        # Calculate real metrics from stored events
        user_stats = calculate_user_analytics_stats(session_id)

        return jsonify(user_stats)
    except Exception as e:
        app.logger.error(f"Error getting user analytics stats: {str(e)}")
        return jsonify({'error': str(e)}), 500

def calculate_user_analytics_stats(session_id):
    """Calculate precise analytics stats for a user session"""
    try:
        # Get all events for this session from local storage
        events = get_session_events(session_id)

        # Initialize stats
        stats = {
            'quizzes_completed': 0,
            'quizzes_started': 0,
            'average_score': 0,
            'lessons_viewed': 0,
            'workshops_started': 0,
            'workshops_completed': 0,
            'time_spent': 0,
            'pages_visited': set(),
            'recent_activity': []
        }

        # Process events to calculate metrics
        quiz_scores = []
        page_times = {}
        current_page_start = None

        for event in events:
            event_type = event.get('event_type', '')
            event_data = event.get('event_data', {})
            timestamp = event.get('timestamp', '')
            path = event.get('path', '')

            # Track page views
            if event_type == 'page_view':
                stats['pages_visited'].add(path)
                if 'learn' in path or 'tutorial' in path or 'guide' in path:
                    stats['lessons_viewed'] += 1

                # Add to recent activity
                stats['recent_activity'].append({
                    'timestamp': timestamp,
                    'activity': f"Visited {get_page_title(path)}",
                    'section': get_page_section(path),
                    'status': 'viewed'
                })

            # Track quiz events
            elif event_type == 'quiz_start':
                stats['quizzes_started'] += 1
                stats['recent_activity'].append({
                    'timestamp': timestamp,
                    'activity': f"Started {event_data.get('quiz_name', 'Quiz')}",
                    'section': 'Quizzes',
                    'status': 'started'
                })

            elif event_type == 'quiz_complete':
                stats['quizzes_completed'] += 1
                score = event_data.get('score', 0)
                quiz_scores.append(score)
                stats['recent_activity'].append({
                    'timestamp': timestamp,
                    'activity': f"Completed {event_data.get('quiz_name', 'Quiz')} ({score}%)",
                    'section': 'Quizzes',
                    'status': 'completed'
                })

            # Track workshop events
            elif event_type == 'exercise_start':
                stats['workshops_started'] += 1
                stats['recent_activity'].append({
                    'timestamp': timestamp,
                    'activity': f"Started {event_data.get('exercise_title', 'Workshop Exercise')}",
                    'section': 'Workshops',
                    'status': 'started'
                })

            elif event_type == 'exercise_complete':
                stats['workshops_completed'] += 1
                stats['recent_activity'].append({
                    'timestamp': timestamp,
                    'activity': f"Completed {event_data.get('exercise_title', 'Workshop Exercise')}",
                    'section': 'Workshops',
                    'status': 'completed'
                })

            # Track content engagement for time calculation
            elif event_type == 'content_engagement':
                time_spent = event_data.get('time_spent', 0)
                stats['time_spent'] += time_spent

        # Calculate average quiz score
        if quiz_scores:
            stats['average_score'] = round(sum(quiz_scores) / len(quiz_scores))

        # Convert pages_visited set to count
        stats['pages_visited'] = len(stats['pages_visited'])

        # Sort recent activity by timestamp (most recent first)
        stats['recent_activity'].sort(key=lambda x: x['timestamp'], reverse=True)

        # Limit recent activity to last 10 items
        stats['recent_activity'] = stats['recent_activity'][:10]

        return stats

    except Exception as e:
        app.logger.error(f"Error calculating user analytics stats: {str(e)}")
        # Return default stats if calculation fails
        return {
            'quizzes_completed': 0,
            'average_score': 0,
            'lessons_viewed': 0,
            'time_spent': 0,
            'recent_activity': []
        }

def get_session_events(session_id):
    """Get all events for a session from local storage"""
    try:
        # Try to read from local analytics file
        analytics_file = 'analytics_events.json'
        if os.path.exists(analytics_file):
            with open(analytics_file, 'r') as f:
                all_events = json.load(f)

            # Filter events for this session
            session_events = [event for event in all_events if event.get('session_id') == session_id]
            return session_events

        return []
    except Exception as e:
        app.logger.error(f"Error reading session events: {str(e)}")
        return []

def get_page_title(path):
    """Get human-readable page title from path"""
    page_titles = {
        '/': 'Homepage',
        '/learn': 'Learn Section',
        '/workshops': 'Workshops',
        '/tutorials': 'Tutorials',
        '/frameworks': 'Frameworks',
        '/lora-guide': 'LoRA Guide',
        '/qlora-guide': 'QLoRA Guide',
        '/docker-guide': 'Docker Guide',
        '/huggingface-guide': 'Hugging Face Guide',
        '/langgraph-guide': 'LangGraph Guide',
        '/workshop-exercises': 'Workshop Exercises',
        '/analytics': 'Analytics Dashboard',
        '/lora_hands_on': 'LoRA Hands-On Exercise',
        '/qlora_hands_on': 'QLoRA Hands-On Exercise',
        '/workshop-memory-efficiency': 'Memory Efficiency Workshop'
    }
    return page_titles.get(path, path.replace('/', '').replace('-', ' ').title())

def get_page_section(path):
    """Get section name from path"""
    if '/learn' in path or '/guide' in path:
        return 'Learning'
    elif '/workshop' in path or '/exercise' in path:
        return 'Workshops'
    elif '/tutorial' in path:
        return 'Tutorials'
    elif '/framework' in path:
        return 'Frameworks'
    elif '/quiz' in path:
        return 'Quizzes'
    elif '/analytics' in path:
        return 'Analytics'
    else:
        return 'General'

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

# FREE OLLAMA AI ASSISTANT API ROUTES
@app.route('/api/ai/free/chat', methods=['POST'])
@csrf.exempt
@limiter.limit("30 per hour")  # Rate limit for AI usage
def free_ollama_chat():
    """Main free chat endpoint with enhanced knowledge base and rate limiting"""
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        model = data.get('model')

        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        # Input validation for production
        if len(user_message) > 1000:
            return jsonify({'error': 'Message too long (max 1000 characters)'}), 400

        # First try enhanced knowledge base for comprehensive responses
        if ENHANCED_KNOWLEDGE_AVAILABLE and enhanced_ai_assistant:
            try:
                enhanced_response = enhanced_ai_assistant.get_response(user_message)
                # Check if we got a comprehensive response (not the default fallback)
                if enhanced_response and not enhanced_response.startswith("🎯 **I'm here to help"):
                    return jsonify({
                        'response': enhanced_response,
                        'status': 'success',
                        'model': 'enhanced_knowledge_base',
                        'provider': 'visual_llm_enhanced',
                        'type': 'comprehensive',
                        'unlimited': True
                    })
            except Exception as e:
                app.logger.warning(f"Enhanced knowledge base failed, falling back to Ollama: {e}")

        # Fallback to Ollama for general conversation
        result = free_ai_assistant.query(user_message, model)
        return jsonify(result)
    except Exception as e:
        app.logger.error(f"Error in free AI chat: {str(e)}")
        return jsonify({
            'response': 'Sorry, I encountered an error. Please try again.',
            'status': 'error',
            'model': 'none'
        }), 500

@app.route('/api/ai/free/stream', methods=['POST'])
@csrf.exempt
def free_ollama_stream():
    """Streaming endpoint for real-time responses"""
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        model = data.get('model')

        def generate():
            try:
                for chunk in free_ai_assistant.stream_query(user_message, model):
                    yield f"data: {json.dumps({'content': chunk})}\n\n"
                yield f"data: {json.dumps({'done': True})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return app.response_class(generate(), mimetype='text/plain')
    except Exception as e:
        app.logger.error(f"Error in free AI stream: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/free/models', methods=['GET'])
@csrf.exempt
def free_ollama_models():
    """Get available models"""
    try:
        return jsonify({
            'available': free_ai_assistant.get_available_models(),
            'recommended': free_ai_assistant.models,
            'status': 'online' if free_ai_assistant.is_available() else 'offline',
            'type': 'free_local'
        })
    except Exception as e:
        app.logger.error(f"Error getting free AI models: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/free/setup', methods=['POST'])
@csrf.exempt
def free_ollama_setup():
    """Setup Ollama and download models"""
    try:
        # Try to start Ollama if not running
        if not free_ai_assistant.is_available():
            free_ai_assistant.start_ollama()

        # Download recommended models
        models_to_download = ['llama3.1', 'mistral']
        downloaded = []

        for model in models_to_download:
            if free_ai_assistant.download_model(model):
                downloaded.append(model)

        return jsonify({
            'success': len(downloaded) > 0,
            'downloaded': downloaded,
            'available': free_ai_assistant.get_available_models(),
            'status': 'ready' if free_ai_assistant.is_available() else 'failed'
        })
    except Exception as e:
        app.logger.error(f"Error setting up free AI: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/free/status', methods=['GET'])
@csrf.exempt
def free_ollama_status():
    """Check AI assistant status"""
    try:
        return jsonify({
            'available': free_ai_assistant.is_available(),
            'models': free_ai_assistant.get_available_models(),
            'type': 'free_local',
            'provider': 'ollama',
            'unlimited': True
        })
    except Exception as e:
        app.logger.error(f"Error getting free AI status: {str(e)}")
        return jsonify({'error': str(e)}), 500

# COMPREHENSIVE AI ENDPOINTS - Claude-level Quality
@app.route('/api/ai/comprehensive/chat', methods=['POST'])
@csrf.exempt
@limiter.limit("30 per hour")  # Premium endpoint with lower limit
def comprehensive_ai_chat():
    """Comprehensive AI chat with Claude-level quality and technical expertise"""
    if not COMPREHENSIVE_AI_AVAILABLE or not comprehensive_ai:
        return jsonify({
            'success': False,
            'error': 'Comprehensive AI assistant not available',
            'fallback': 'Try the enhanced AI assistant instead'
        }), 503

    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        context = data.get('context', {})

        if not message:
            return jsonify({
                'success': False,
                'error': 'Message is required'
            }), 400

        # Get comprehensive response
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        response = loop.run_until_complete(comprehensive_ai.get_comprehensive_response(message, context))
        loop.close()

        return jsonify({
            'success': True,
            'response': response.content,
            'confidence': response.confidence,
            'sources': response.sources,
            'code_examples': response.code_examples,
            'related_topics': response.related_topics,
            'difficulty_level': response.difficulty_level,
            'response_time': response.response_time,
            'provider_used': response.provider_used,
            'tokens_used': response.tokens_used,
            'metadata': {
                'comprehensive': True,
                'technical_depth': 'high',
                'educational_quality': 'claude_level'
            }
        })

    except Exception as e:
        app.logger.error(f"Comprehensive AI chat error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'fallback_response': 'I apologize, but I\'m experiencing technical difficulties. Please try again, and I\'ll provide you with comprehensive technical guidance on AI/ML, software development, or any computer science topic.'
        }), 500

# ENHANCED AI ENDPOINTS - Multi-Provider Support
@app.route('/api/ai/enhanced/chat', methods=['POST'])
@csrf.exempt
@limiter.limit("50 per hour")  # Higher limit for enhanced AI
def enhanced_ai_chat():
    """Enhanced AI chat with multi-provider support and rate limiting"""
    if not ENHANCED_AI_AVAILABLE or not multi_ai_assistant:
        # Fallback to free Ollama
        return free_ollama_chat()

    try:
        data = request.get_json()
        message = data.get('message', '')
        provider = data.get('provider')  # Optional preferred provider

        if not message:
            return jsonify({'error': 'No message provided'}), 400

        # Input validation for production
        if len(message) > 1000:
            return jsonify({'error': 'Message too long (max 1000 characters)'}), 400

        # Run async query
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            response = loop.run_until_complete(multi_ai_assistant.query(message, provider))
        finally:
            loop.close()

        return jsonify({
            'response': response.content,
            'model': response.model,
            'provider': response.provider,
            'tokens_used': response.tokens_used,
            'cost': response.cost,
            'success': response.success,
            'enhanced': True
        })

    except Exception as e:
        app.logger.error(f"Enhanced AI error: {str(e)}")
        # Fallback to free Ollama on error
        return free_ollama_chat()

@app.route('/api/ai/enhanced/status', methods=['GET'])
@csrf.exempt
def enhanced_ai_status():
    """Get status of enhanced AI system"""
    if not ENHANCED_AI_AVAILABLE or not multi_ai_assistant:
        return jsonify({
            'enhanced_available': False,
            'fallback_to': 'free_ollama',
            'reason': 'Multi-provider system not initialized'
        })

    # Get provider status
    status = {}
    for name, provider in multi_ai_assistant.providers.items():
        if hasattr(provider, 'available'):
            status[name] = {
                'available': provider.available,
                'type': 'api' if name in ['groq', 'huggingface'] else 'local' if name == 'ollama' else 'static'
            }

    return jsonify({
        'enhanced_available': True,
        'providers': status,
        'fallback_chain': multi_ai_assistant.fallback_chain,
        'total_providers': len(multi_ai_assistant.providers)
    })

# LORA MODEL ENDPOINTS - Real fine-tuned model inference
@app.route('/api/ai/lora/chat', methods=['POST'])
@csrf.exempt
@limiter.limit("20 per hour")  # Lower limit for LoRA models (more resource intensive)
def lora_model_chat():
    """Chat with actual LoRA fine-tuned models"""
    if not LORA_MODELS_AVAILABLE:
        # Fallback to enhanced AI
        return enhanced_ai_chat()

    try:
        data = request.get_json()
        message = data.get('message', '')
        model_name = data.get('model', 'educational_assistant')

        if not message:
            return jsonify({'error': 'No message provided'}), 400

        # Input validation
        if len(message) > 500:
            return jsonify({'error': 'Message too long (max 500 characters for LoRA models)'}), 400

        # Get response from LoRA model
        response = get_lora_response(message, model_name)

        return jsonify({
            'response': response['response'],
            'model': response['model'],
            'adapter': response['adapter'],
            'tokens_generated': response['tokens'],
            'inference_time': response['time'],
            'success': response['success'],
            'type': 'lora_fine_tuned',
            'cost': 0.0  # Free local inference
        })

    except Exception as e:
        app.logger.error(f"LoRA model error: {str(e)}")
        # Fallback to enhanced AI on error
        return enhanced_ai_chat()

@app.route('/api/ai/lora/models', methods=['GET'])
@csrf.exempt
def lora_available_models():
    """Get available LoRA fine-tuned models"""
    if not LORA_MODELS_AVAILABLE:
        return jsonify({
            'lora_available': False,
            'reason': 'LoRA models not initialized',
            'models': {}
        })

    try:
        available_models = lora_manager.get_available_models()

        return jsonify({
            'lora_available': True,
            'models': available_models,
            'total_models': len(available_models),
            'ready_models': sum(1 for info in available_models.values() if info['adapter_available'])
        })

    except Exception as e:
        app.logger.error(f"Error getting LoRA models: {str(e)}")
        return jsonify({'error': 'Failed to get model information'}), 500

@app.route('/api/ai/lora/status', methods=['GET'])
@csrf.exempt
def lora_model_status():
    """Get LoRA model system status"""
    return jsonify({
        'lora_system_available': LORA_MODELS_AVAILABLE,
        'models_loaded': len(lora_manager.lora_adapters) if LORA_MODELS_AVAILABLE else 0,
        'device': lora_manager.device if LORA_MODELS_AVAILABLE else 'unknown',
        'memory_info': {
            'cuda_available': lora_manager.device == 'cuda' if LORA_MODELS_AVAILABLE else False,
            'device_info': lora_manager.device if LORA_MODELS_AVAILABLE else 'unknown'
        }
    })

# QLORA MODEL ENDPOINTS - Advanced 4-bit quantized models
@app.route('/api/ai/qlora/chat', methods=['POST'])
@csrf.exempt
@limiter.limit("10 per hour")  # Lower limit for QLoRA (more resource intensive)
def qlora_model_chat():
    """Chat with QLoRA 4-bit quantized fine-tuned models"""
    if not QLORA_MODELS_AVAILABLE:
        # Fallback to LoRA models
        if LORA_MODELS_AVAILABLE:
            return lora_model_chat()
        else:
            return enhanced_ai_chat()

    try:
        data = request.get_json()
        message = data.get('message', '')
        model_name = data.get('model', 'llama_7b_educational')

        if not message:
            return jsonify({'error': 'No message provided'}), 400

        # Input validation for QLoRA (longer context allowed)
        if len(message) > 1000:
            return jsonify({'error': 'Message too long (max 1000 characters for QLoRA models)'}), 400

        # Get response from QLoRA model
        response = get_qlora_response(message, model_name)

        return jsonify({
            'response': response['response'],
            'model': response['model'],
            'adapter': response['adapter'],
            'quantization': response['quantization'],
            'tokens_generated': response['tokens'],
            'inference_time': response['time'],
            'memory_used': response['memory'],
            'success': response['success'],
            'type': 'qlora_4bit_quantized',
            'cost': 0.0  # Free local inference
        })

    except Exception as e:
        app.logger.error(f"QLoRA model error: {str(e)}")
        # Fallback to LoRA or enhanced AI
        if LORA_MODELS_AVAILABLE:
            return lora_model_chat()
        else:
            return enhanced_ai_chat()

@app.route('/api/ai/qlora/models', methods=['GET'])
@csrf.exempt
def qlora_available_models():
    """Get available QLoRA fine-tuned models"""
    if not QLORA_MODELS_AVAILABLE:
        return jsonify({
            'qlora_available': False,
            'reason': 'QLoRA models not initialized',
            'models': {}
        })

    try:
        available_models = qlora_manager.get_available_qlora_models()

        return jsonify({
            'qlora_available': True,
            'models': available_models,
            'total_models': len(available_models),
            'ready_models': sum(1 for info in available_models.values() if info['adapter_available']),
            'quantization_supported': qlora_manager.quantization_available
        })

    except Exception as e:
        app.logger.error(f"Error getting QLoRA models: {str(e)}")
        return jsonify({'error': 'Failed to get QLoRA model information'}), 500

@app.route('/api/ai/qlora/status', methods=['GET'])
@csrf.exempt
def qlora_model_status():
    """Get QLoRA model system status"""
    if not QLORA_MODELS_AVAILABLE:
        return jsonify({
            'qlora_system_available': False,
            'reason': 'QLoRA system not initialized'
        })

    try:
        system_info = qlora_manager.get_system_info()

        return jsonify({
            'qlora_system_available': True,
            'device': system_info['device'],
            'quantization_available': system_info['quantization_available'],
            'models_loaded': system_info['models_loaded'],
            'total_models': system_info['total_models'],
            'gpu_info': system_info.get('gpu_info', {}),
            'capabilities': {
                '4bit_quantization': system_info['quantization_available'],
                'large_model_support': system_info['device'] == 'cuda',
                'memory_efficient': True
            }
        })

    except Exception as e:
        app.logger.error(f"Error getting QLoRA status: {str(e)}")
        return jsonify({'error': 'Failed to get QLoRA status'}), 500

# USER TRAINING SYSTEM ENDPOINTS - Phase 4 Advanced Features
@app.route('/api/training/create', methods=['POST'])
@csrf.exempt
@limiter.limit("3 per day")  # Free tier limit
def create_training_job():
    """Create a new user training job"""
    if not USER_TRAINING_AVAILABLE:
        return jsonify({
            'success': False,
            'error': 'User training system not available'
        }), 503

    try:
        data = request.get_json()

        # Get user ID (from session or generate temp ID)
        user_id = session.get('user_id', f"temp_{uuid.uuid4().hex[:8]}")
        session['user_id'] = user_id

        # Validate required fields
        required_fields = ['model_name', 'dataset_content']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400

        # Create training job
        result = user_training_manager.create_training_job(
            user_id=user_id,
            model_name=data['model_name'],
            base_model=data.get('base_model', 'microsoft/DialoGPT-small'),
            dataset_content=data['dataset_content'],
            training_config=data.get('config', {})
        )

        return jsonify(result)

    except Exception as e:
        app.logger.error(f"Training job creation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create training job'
        }), 500

@app.route('/api/training/status/<job_id>', methods=['GET'])
@csrf.exempt
def get_training_status(job_id):
    """Get status of a training job"""
    if not USER_TRAINING_AVAILABLE:
        return jsonify({'error': 'User training system not available'}), 503

    try:
        status = user_training_manager.get_job_status(job_id)
        if not status:
            return jsonify({'error': 'Job not found'}), 404

        return jsonify(status)

    except Exception as e:
        app.logger.error(f"Training status error: {str(e)}")
        return jsonify({'error': 'Failed to get training status'}), 500

@app.route('/api/training/jobs', methods=['GET'])
@csrf.exempt
def get_user_training_jobs():
    """Get all training jobs for current user"""
    if not USER_TRAINING_AVAILABLE:
        return jsonify({'error': 'User training system not available'}), 503

    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'jobs': []})

        jobs = user_training_manager.get_user_jobs(user_id)
        return jsonify({'jobs': jobs})

    except Exception as e:
        app.logger.error(f"Get user jobs error: {str(e)}")
        return jsonify({'error': 'Failed to get user jobs'}), 500

@app.route('/api/training/models', methods=['GET'])
@csrf.exempt
def get_user_models():
    """Get all completed models for current user"""
    if not USER_TRAINING_AVAILABLE:
        return jsonify({'error': 'User training system not available'}), 503

    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'models': []})

        models = user_training_manager.get_user_models(user_id)
        return jsonify({'models': models})

    except Exception as e:
        app.logger.error(f"Get user models error: {str(e)}")
        return jsonify({'error': 'Failed to get user models'}), 500

@app.route('/api/training/limits', methods=['GET'])
@csrf.exempt
def get_training_limits():
    """Get training limits for current user"""
    if not USER_TRAINING_AVAILABLE:
        return jsonify({'error': 'User training system not available'}), 503

    try:
        user_id = session.get('user_id', 'anonymous')
        limits = user_training_manager._check_user_limits(user_id)

        return jsonify({
            'limits': limits,
            'system_limits': user_training_manager.user_limits
        })

    except Exception as e:
        app.logger.error(f"Get training limits error: {str(e)}")
        return jsonify({'error': 'Failed to get training limits'}), 500

# GAMIFICATION SYSTEM ENDPOINTS - Phase 5 Engagement Features
@app.route('/api/gamification/profile', methods=['GET'])
@csrf.exempt
def get_user_gamification_profile():
    """Get user's gamification profile"""
    if not GAMIFICATION_AVAILABLE:
        return jsonify({'error': 'Gamification system not available'}), 503

    try:
        user_id = session.get('user_id', f"temp_{uuid.uuid4().hex[:8]}")
        session['user_id'] = user_id

        # Get user achievements and progress
        achievements_data = gamification_manager.get_user_achievements(user_id)

        # Get user rank
        rank_data = gamification_manager.get_user_rank(user_id, "overall")

        return jsonify({
            'user': {
                'user_id': achievements_data['user'].user_id,
                'username': achievements_data['user'].username,
                'level': achievements_data['user'].level,
                'total_xp': achievements_data['user'].total_xp,
                'badges_earned': achievements_data['user'].badges_earned
            },
            'achievements': {
                'unlocked': [
                    {
                        'id': a.id,
                        'name': a.name,
                        'description': a.description,
                        'icon': a.icon,
                        'category': a.category,
                        'points': a.points,
                        'rarity': a.rarity
                    }
                    for a in achievements_data['unlocked_achievements']
                ],
                'total_achievements': achievements_data['total_achievements'],
                'completion_percentage': achievements_data['completion_percentage']
            },
            'rank': rank_data,
            'stats': achievements_data['user'].stats
        })

    except Exception as e:
        app.logger.error(f"Gamification profile error: {str(e)}")
        return jsonify({'error': 'Failed to get gamification profile'}), 500

@app.route('/api/gamification/leaderboard', methods=['GET'])
@csrf.exempt
def get_leaderboard():
    """Get leaderboard"""
    if not GAMIFICATION_AVAILABLE:
        return jsonify({'error': 'Gamification system not available'}), 503

    try:
        category = request.args.get('category', 'overall')
        limit = min(int(request.args.get('limit', 10)), 50)  # Max 50

        leaderboard = gamification_manager.get_leaderboard(category, limit)

        return jsonify({
            'leaderboard': leaderboard,
            'category': category,
            'total_entries': len(leaderboard)
        })

    except Exception as e:
        app.logger.error(f"Leaderboard error: {str(e)}")
        return jsonify({'error': 'Failed to get leaderboard'}), 500

# GLOBAL EXPANSION ENDPOINTS - Phase 6 International Features
@app.route('/api/i18n/languages', methods=['GET'])
@csrf.exempt
def get_supported_languages():
    """Get list of supported languages"""
    if not GLOBAL_EXPANSION_AVAILABLE:
        return jsonify({'error': 'Global expansion system not available'}), 503

    try:
        languages = global_expansion_manager.get_supported_languages()
        return jsonify({
            'languages': languages,
            'total_languages': len(languages),
            'default_language': 'en'
        })
    except Exception as e:
        app.logger.error(f"Get languages error: {str(e)}")
        return jsonify({'error': 'Failed to get supported languages'}), 500

@app.route('/api/i18n/translations/<lang_code>', methods=['GET'])
@csrf.exempt
def get_translations(lang_code):
    """Get translations for a specific language"""
    if not GLOBAL_EXPANSION_AVAILABLE:
        return jsonify({'error': 'Global expansion system not available'}), 503

    try:
        if lang_code not in global_expansion_manager.supported_languages:
            return jsonify({'error': 'Language not supported'}), 400

        translations = global_expansion_manager.translations.get(lang_code, {})
        language_info = global_expansion_manager.supported_languages[lang_code]

        return jsonify({
            'language': language_info,
            'translations': translations,
            'total_keys': len(translations)
        })
    except Exception as e:
        app.logger.error(f"Get translations error: {str(e)}")
        return jsonify({'error': 'Failed to get translations'}), 500

@app.route('/api/i18n/detect-language', methods=['POST'])
@csrf.exempt
def detect_user_language():
    """Detect user's preferred language from Accept-Language header"""
    if not GLOBAL_EXPANSION_AVAILABLE:
        return jsonify({'error': 'Global expansion system not available'}), 503

    try:
        accept_language = request.headers.get('Accept-Language', '')
        detected_lang = global_expansion_manager.detect_user_language(accept_language)

        return jsonify({
            'detected_language': detected_lang,
            'language_info': global_expansion_manager.supported_languages.get(detected_lang, {}),
            'accept_language_header': accept_language
        })
    except Exception as e:
        app.logger.error(f"Language detection error: {str(e)}")
        return jsonify({'error': 'Failed to detect language'}), 500

@app.route('/api/accessibility/config', methods=['GET'])
@csrf.exempt
def get_accessibility_config():
    """Get accessibility configuration"""
    if not GLOBAL_EXPANSION_AVAILABLE:
        return jsonify({'error': 'Global expansion system not available'}), 503

    try:
        config = global_expansion_manager.create_accessibility_config()
        return jsonify(config)
    except Exception as e:
        app.logger.error(f"Accessibility config error: {str(e)}")
        return jsonify({'error': 'Failed to get accessibility config'}), 500

@app.route('/manifest.json', methods=['GET'])
def get_pwa_manifest():
    """Get Progressive Web App manifest"""
    if not GLOBAL_EXPANSION_AVAILABLE:
        return jsonify({'error': 'PWA not available'}), 503

    try:
        manifest = global_expansion_manager.create_mobile_pwa_config()
        return jsonify(manifest)
    except Exception as e:
        app.logger.error(f"PWA manifest error: {str(e)}")
        return jsonify({'error': 'Failed to get PWA manifest'}), 500

# PLATFORM COMPLETION ENDPOINTS - Phase 7 Final Features
@app.route('/api/certifications/programs', methods=['GET'])
@csrf.exempt
def get_certification_programs():
    """Get available certification programs"""
    if not PLATFORM_COMPLETION_AVAILABLE:
        return jsonify({'error': 'Platform completion system not available'}), 503

    try:
        programs = platform_completion_manager.get_certification_programs()
        return jsonify({
            'programs': programs,
            'total_programs': len(programs)
        })
    except Exception as e:
        app.logger.error(f"Get certification programs error: {str(e)}")
        return jsonify({'error': 'Failed to get certification programs'}), 500

@app.route('/api/certifications/progress', methods=['GET'])
@csrf.exempt
def get_certification_progress():
    """Get user's certification progress"""
    if not PLATFORM_COMPLETION_AVAILABLE:
        return jsonify({'error': 'Platform completion system not available'}), 503

    try:
        user_id = session.get('user_id', f"temp_{uuid.uuid4().hex[:8]}")
        session['user_id'] = user_id

        progress = platform_completion_manager.get_user_certification_progress(user_id)
        certifications = platform_completion_manager.get_user_certifications(user_id)

        return jsonify({
            'progress': progress,
            'earned_certifications': certifications,
            'total_earned': len(certifications)
        })
    except Exception as e:
        app.logger.error(f"Get certification progress error: {str(e)}")
        return jsonify({'error': 'Failed to get certification progress'}), 500

@app.route('/api/certifications/award', methods=['POST'])
@csrf.exempt
def award_certification():
    """Award certification to user"""
    if not PLATFORM_COMPLETION_AVAILABLE:
        return jsonify({'error': 'Platform completion system not available'}), 503

    try:
        data = request.get_json()
        user_id = session.get('user_id', f"temp_{uuid.uuid4().hex[:8]}")
        session['user_id'] = user_id

        cert_id = data.get('certification_id')
        if not cert_id:
            return jsonify({'error': 'Certification ID required'}), 400

        result = platform_completion_manager.award_certification(user_id, cert_id)

        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400

    except Exception as e:
        app.logger.error(f"Award certification error: {str(e)}")
        return jsonify({'error': 'Failed to award certification'}), 500

@app.route('/api/platform/analytics', methods=['GET'])
@csrf.exempt
def get_platform_analytics():
    """Get comprehensive platform analytics"""
    if not PLATFORM_COMPLETION_AVAILABLE:
        return jsonify({'error': 'Platform completion system not available'}), 503

    try:
        analytics = platform_completion_manager.get_platform_analytics()
        return jsonify(analytics)
    except Exception as e:
        app.logger.error(f"Platform analytics error: {str(e)}")
        return jsonify({'error': 'Failed to get platform analytics'}), 500

@app.route('/api/partnerships/universities', methods=['GET'])
@csrf.exempt
def get_university_partnerships():
    """Get university partnership information"""
    if not PLATFORM_COMPLETION_AVAILABLE:
        return jsonify({'error': 'Platform completion system not available'}), 503

    try:
        partnerships = platform_completion_manager.get_university_partnerships()
        return jsonify({
            'partnerships': partnerships,
            'total_partnerships': len(partnerships),
            'active_partnerships': sum(1 for p in partnerships.values() if p['status'] == 'active'),
            'total_students': sum(p['students_enrolled'] for p in partnerships.values())
        })
    except Exception as e:
        app.logger.error(f"University partnerships error: {str(e)}")
        return jsonify({'error': 'Failed to get university partnerships'}), 500

# ENHANCED API SYSTEM ENDPOINTS
@app.route('/api/enhanced/chat', methods=['POST'])
@csrf.exempt
@limiter.limit("100 per hour")
def enhanced_api_chat():
    """Enhanced API chat with intelligent provider routing"""
    if not ENHANCED_API_AVAILABLE or not enhanced_api:
        return jsonify({
            'success': False,
            'error': 'Enhanced API system not available',
            'fallback': 'Use /api/ai/enhanced/chat instead'
        }), 503

    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        preferences = data.get('preferences', {})

        if not message:
            return jsonify({
                'success': False,
                'error': 'Message is required'
            }), 400

        # Use async in sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        response = loop.run_until_complete(enhanced_api.smart_query(message, preferences))
        loop.close()

        return jsonify({
            'success': response.success,
            'response': response.content,
            'model': response.model,
            'provider': response.provider,
            'tokens_used': response.tokens_used,
            'cost': response.cost,
            'latency': response.latency,
            'metadata': response.metadata,
            'error': response.error
        })

    except Exception as e:
        app.logger.error(f"Enhanced API chat error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/enhanced/providers', methods=['GET'])
@csrf.exempt
def enhanced_api_providers():
    """Get status of all enhanced API providers"""
    if not ENHANCED_API_AVAILABLE or not enhanced_api:
        return jsonify({
            'success': False,
            'error': 'Enhanced API system not available'
        }), 503

    try:
        status = enhanced_api.get_provider_status()
        return jsonify({
            'success': True,
            'providers': status,
            'total_providers': len(status),
            'enabled_providers': len([p for p in status.values() if p['enabled']])
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Production-ready configuration
    port = int(os.environ.get('PORT', 5037))
    debug = os.environ.get('FLASK_ENV') != 'production'

    if os.environ.get('FLASK_ENV') == 'production':
        print(f"🚀 Starting Visual LLM in PRODUCTION mode on port {port}")
        print("🔒 Security features enabled")
        print("⚡ Performance optimizations active")
        app.run(host='0.0.0.0', port=port, debug=False)
    else:
        print(f"🔧 Starting Visual LLM in DEVELOPMENT mode on port {port}")
        app.run(debug=debug, port=port)
