"""
LLM Assistant API for Visual LLM Website
Integrates real LLM capabilities with the existing AI assistant
"""

from flask import Blueprint, request, jsonify, session, current_app
from flask_login import current_user
from extensions import csrf
import os
import json
import logging
from typing import Dict, Any, Optional
import time

# Import the enhanced AI assistant and multi-provider system
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from enhanced_ai_assistant import create_enhanced_ai_assistant
    enhanced_ai_available = True
except ImportError:
    enhanced_ai_available = False

try:
    from multi_provider_ai_assistant import MultiProviderAIAssistant
    multi_provider_available = True
except ImportError:
    multi_provider_available = False

# Create blueprint
llm_api = Blueprint('llm_api', __name__)

# Initialize LLM manager
llm_manager = None

def initialize_llm_manager():
    """Initialize the LLM manager with the multi-provider system"""
    global llm_manager
    
    if multi_provider_available:
        try:
            llm_manager = MultiProviderAIAssistant()
            logging.info("✅ Multi-Provider AI Assistant initialized")
            return "multi_provider"
        except Exception as e:
            logging.warning(f"❌ Multi-provider initialization failed: {e}")
    
    logging.error("❌ No LLM providers available")
    return None

# Initialize on import
active_provider = initialize_llm_manager()

@llm_api.route('/api/llm/chat', methods=['POST'])
@csrf.exempt
def llm_chat():
    """
    Main LLM chat endpoint
    Handles user messages and returns LLM responses
    """
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                'error': 'Message is required',
                'success': False
            }), 400
        
        user_message = data['message'].strip()
        if not user_message:
            return jsonify({
                'error': 'Message cannot be empty',
                'success': False
            }), 400
        
        # Get context from the website
        context = get_website_context(data.get('page', ''), data.get('section', ''))
        
        # Check if LLM manager is available
        if not llm_manager:
            return jsonify({
                'response': "I'm currently unavailable. Please try again later.",
                'success': False,
                'provider': 'fallback'
            })
        
        # Get LLM response using async method
        start_time = time.time()
        
        # Create enhanced prompt with context
        enhanced_message = f"{context}\n\nUser Question: {user_message}" if context else user_message
        
        # Use asyncio to call the async query method
        import asyncio
        try:
            # Run the async query method
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            ai_response = loop.run_until_complete(llm_manager.query(enhanced_message))
            loop.close()
            
            response_time = time.time() - start_time
            
            # Log the interaction (optional)
            log_interaction(user_message, ai_response.content, response_time)
            
            return jsonify({
                'response': ai_response.content,
                'success': ai_response.success,
                'provider': ai_response.provider,
                'model': ai_response.model,
                'response_time': round(response_time, 2)
            })
            
        except Exception as e:
            logging.error(f"Async query error: {str(e)}")
            response_time = time.time() - start_time
            
            return jsonify({
                'response': "I'm having trouble processing your request. Please try again.",
                'success': False,
                'provider': 'error',
                'error': str(e),
                'response_time': round(response_time, 2)
            })
        
    except Exception as e:
        logging.error(f"LLM Chat error: {str(e)}")
        return jsonify({
            'response': "I'm having trouble processing your request. Please try again.",
            'success': False,
            'error': str(e)
        }), 500

@llm_api.route('/api/llm/status', methods=['GET'])
@csrf.exempt
def llm_status():
    """
    Check LLM service status
    """
    global llm_manager, active_provider
    
    if not llm_manager:
        # Try to reinitialize
        active_provider = initialize_llm_manager()
    
    return jsonify({
        'available': llm_manager is not None,
        'provider': active_provider,
        'status': 'online' if llm_manager else 'offline'
    })

@llm_api.route('/api/llm/providers', methods=['GET'])
@csrf.exempt
def available_providers():
    """
    List available LLM providers
    """
    providers = {
        'ollama': check_ollama_status(),
        'openai': bool(os.getenv('OPENAI_API_KEY')),
        'gemini': bool(os.getenv('GEMINI_API_KEY')),
        'huggingface': check_huggingface_status()
    }
    
    return jsonify({
        'providers': providers,
        'active': active_provider
    })

def get_website_context(page: str, section: str) -> str:
    """
    Generate context based on the current page/section
    """
    context_map = {
        'learn': "User is on the learning page, interested in LLM fine-tuning basics",
        'workshops': "User is in workshops section, looking for hands-on exercises",
        'lora': "User is learning about LoRA (Low-Rank Adaptation) fine-tuning",
        'qlora': "User is learning about QLoRA (Quantized LoRA) techniques",
        'tutorials': "User is viewing tutorials and guides",
        'frameworks': "User is exploring ML frameworks like PyTorch and TensorFlow",
        'quiz': "User is taking quizzes to test their knowledge",
        'dashboard': "User is on their personal dashboard"
    }
    
    base_context = "This is the Visual LLM website focused on teaching LLM fine-tuning techniques including LoRA, QLoRA, and PEFT methods."
    
    page_context = context_map.get(page, "User is browsing the Visual LLM educational website")
    
    return f"{base_context} {page_context}"

def check_ollama_status() -> bool:
    """Check if Ollama is running locally"""
    try:
        import requests
        response = requests.get("http://localhost:11434/api/tags", timeout=2)
        return response.status_code == 200
    except:
        return False

def check_huggingface_status() -> bool:
    """Check if Hugging Face transformers is available"""
    try:
        import transformers
        return True
    except ImportError:
        return False

def log_interaction(user_message: str, llm_response: str, response_time: float):
    """
    Log LLM interactions for analytics (optional)
    """
    try:
        interaction = {
            'timestamp': time.time(),
            'user_id': current_user.id if current_user.is_authenticated else 'anonymous',
            'message_length': len(user_message),
            'response_length': len(llm_response),
            'response_time': response_time,
            'provider': llm_manager.provider if llm_manager else 'unknown'
        }
        
        # You can save this to database or file for analytics
        logging.info(f"LLM Interaction: {interaction}")
        
    except Exception as e:
        logging.warning(f"Failed to log interaction: {e}")

# Error handlers
@llm_api.errorhandler(429)
def rate_limit_handler(e):
    return jsonify({
        'error': 'Rate limit exceeded. Please wait before sending another message.',
        'success': False
    }), 429

@llm_api.errorhandler(500)
def internal_error_handler(e):
    return jsonify({
        'error': 'Internal server error. Please try again later.',
        'success': False
    }), 500
