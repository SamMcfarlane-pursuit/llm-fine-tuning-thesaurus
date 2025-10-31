"""
AI Assistant API Module

This module provides comprehensive AI assistant functionality with access to website information,
LLM capabilities, and contextual responses for the Visual LLM platform.
"""

import json
import logging
import traceback
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from flask_login import current_user
from transformers import pipeline, set_seed
import torch
from extensions import csrf
from utils.error_handlers import handle_api_error

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create blueprint
ai_assistant_api = Blueprint('ai_assistant_api', __name__)

# Global cache for AI models
model_cache = {}

# Website knowledge base
WEBSITE_KNOWLEDGE = {
    "platform_info": {
        "name": "Visual LLM",
        "description": "Comprehensive LLM fine-tuning platform with hands-on exercises, workshops, and interactive learning",
        "features": [
            "LoRA and QLoRA fine-tuning tutorials",
            "Interactive workshops with Google Colab integration",
            "Comprehensive quizzes and assessments",
            "Visual thesaurus for LLM concepts",
            "Progress tracking and analytics",
            "Community learning features"
        ]
    },
    "navigation": {
        "learn": "/learn - Comprehensive learning modules and tutorials",
        "workshops": "/workshops - Hands-on coding workshops",
        "quizzes": "/quiz/quiz_list - Interactive quizzes and assessments",
        "frameworks": "/frameworks - Docker, Hugging Face, LangChain guides",
        "thesaurus": "/search_results - Visual thesaurus search",
        "analytics": "/analytics/dashboard - Progress tracking",
        "ai_assistant": "/ai-assistant - Full AI assistant interface"
    },
    "technical_concepts": {
        "lora": {
            "definition": "Low-Rank Adaptation - Parameter-efficient fine-tuning technique",
            "benefits": ["Memory efficient", "Fast training", "Preserves base model"],
            "use_cases": ["Domain adaptation", "Task-specific fine-tuning", "Multi-task learning"]
        },
        "qlora": {
            "definition": "Quantized LoRA - Combines LoRA with 4-bit quantization",
            "benefits": ["Ultra memory efficient", "Consumer hardware friendly", "Maintains performance"],
            "use_cases": ["Large model fine-tuning", "Resource-constrained environments"]
        },
        "peft": {
            "definition": "Parameter-Efficient Fine-Tuning methods",
            "techniques": ["LoRA", "QLoRA", "AdaLoRA", "Prefix Tuning", "P-Tuning"],
            "advantages": ["Reduced memory", "Faster training", "Better generalization"]
        }
    }
}

def get_ai_model(model_name="microsoft/DialoGPT-medium"):
    """Get or create AI model for conversation"""
    if model_name not in model_cache:
        try:
            # Use a conversational model for better responses
            model_cache[model_name] = pipeline(
                "text-generation",
                model=model_name,
                device=0 if torch.cuda.is_available() else -1,
                pad_token_id=50256
            )
            logger.info(f"Loaded AI model: {model_name}")
        except Exception as e:
            logger.error(f"Error loading model {model_name}: {str(e)}")
            # Fallback to a smaller model
            try:
                model_cache[model_name] = pipeline(
                    "text-generation",
                    model="gpt2",
                    device=0 if torch.cuda.is_available() else -1,
                    pad_token_id=50256
                )
                logger.info("Loaded fallback model: gpt2")
            except Exception as e2:
                logger.error(f"Error loading fallback model: {str(e2)}")
                return None

    return model_cache.get(model_name)

def generate_contextual_response(message, context=None, mode=None):
    """Generate contextual AI response based on message, mode, and website knowledge"""
    message_lower = message.lower()

    # Handle mode-specific responses first
    if mode == 'learning':
        return generate_learning_mode_response(message, context)
    elif mode == 'code':
        return generate_code_mode_response(message, context)
    elif mode == 'general':
        return generate_general_mode_response(message, context)

    # Fallback to original logic for backward compatibility
    # Website navigation queries
    if any(word in message_lower for word in ['navigate', 'go to', 'find', 'where is', 'how to access']):
        return generate_navigation_response(message)

    # Technical concept queries
    if any(concept in message_lower for concept in ['lora', 'qlora', 'peft', 'fine-tuning', 'parameter efficient']):
        return generate_technical_response(message)

    # Platform information queries
    if any(word in message_lower for word in ['what is', 'about', 'platform', 'website', 'features']):
        return generate_platform_response(message)

    # Learning path queries
    if any(word in message_lower for word in ['learn', 'tutorial', 'workshop', 'quiz', 'course']):
        return generate_learning_response(message)

    # Code and implementation queries
    if any(word in message_lower for word in ['code', 'implementation', 'example', 'how to implement']):
        return generate_code_response(message)

    # General AI response using LLM
    return generate_ai_response(message)

def generate_learning_mode_response(message, context=None):
    """Generate learning-focused response with enhanced context"""
    message_lower = message.lower()

    # QLoRA vs LoRA comparison queries (check first for specific comparisons)
    if any(term in message_lower for term in ['qlora vs lora', 'lora vs qlora', 'difference between', 'compare']):
        return """🎓 **LoRA vs QLoRA Comparison**

**LoRA (Low-Rank Adaptation):**
• **Memory**: Reduces parameters by ~90%
• **Speed**: 3x faster training than full fine-tuning
• **Quality**: Near full fine-tuning performance
• **Hardware**: Works on most GPUs

**QLoRA (Quantized LoRA):**
• **Memory**: Reduces memory by ~75% (4-bit quantization)
• **Speed**: Similar to LoRA but with lower memory
• **Quality**: Maintains LoRA performance
• **Hardware**: Enables large models on consumer GPUs

**Key Differences:**
• **Quantization**: QLoRA adds 4-bit quantization to LoRA
• **Memory Usage**: QLoRA uses significantly less VRAM
• **Model Size**: QLoRA enables training of larger models
• **Complexity**: QLoRA requires additional quantization setup

**When to Use:**
• **LoRA**: Standard fine-tuning with good GPU memory
• **QLoRA**: Limited VRAM or very large models (7B+)

**Memory Comparison (7B model):**
• Full Fine-tuning: ~28GB VRAM
• LoRA: ~14GB VRAM
• QLoRA: ~6GB VRAM

🚀 **Ready to implement?** Ask "Show me LoRA code" or "Show me QLoRA setup"!"""

    # QLoRA specific queries (check after comparison)
    elif any(term in message_lower for term in ['qlora', 'quantized lora']):
        return """🎓 **QLoRA (Quantized LoRA)**

**What is QLoRA?**
QLoRA combines LoRA with 4-bit quantization to enable fine-tuning of large models on consumer hardware.

**Key Innovations:**
• **4-bit Quantization**: Reduces memory by 75%
• **Double Quantization**: Further compression with minimal quality loss
• **Paged Optimizers**: Handles memory spikes during training

**Memory Savings:**
• 65B model: ~48GB → ~12GB VRAM
• 13B model: ~26GB → ~6GB VRAM
• 7B model: ~14GB → ~4GB VRAM

**Perfect For:**
• Consumer GPUs (RTX 3090, 4090)
• Limited VRAM scenarios
• Experimentation and research

**Learn More:**
• `/workshops` - QLoRA implementation workshop
• `/learn` - Detailed QLoRA concepts
• `/tutorials` - Step-by-step guides

🚀 **Ready to implement?** Ask "Show me QLoRA code example"!"""

    # LoRA specific queries (check after QLoRA)
    elif any(term in message_lower for term in ['lora', 'low-rank adaptation']):
        return """🎓 **LoRA (Low-Rank Adaptation)**

**What is LoRA?**
LoRA is a parameter-efficient fine-tuning technique that reduces the number of trainable parameters by learning rank decomposition matrices.

**Key Benefits:**
• **Memory Efficient**: Reduces GPU memory requirements by 3x
• **Fast Training**: Significantly faster than full fine-tuning
• **Modular**: Easy to swap different LoRA adapters
• **Quality**: Maintains performance comparable to full fine-tuning

**How it Works:**
Instead of updating all parameters, LoRA adds small trainable matrices (A and B) to existing layers:
```
W_new = W_original + A × B
```

**Next Steps:**
• Visit `/learn` for detailed LoRA tutorials
• Try `/workshops` for hands-on LoRA implementation
• Check `/lora-guide` for step-by-step instructions

💡 **Want to see code examples?** Switch to Code mode or ask "Show me LoRA implementation"!"""

    # General learning queries
    elif any(term in message_lower for term in ['learn', 'tutorial', 'guide', 'course']):
        return generate_learning_response(message)

    # Technical concepts
    elif any(term in message_lower for term in ['peft', 'parameter efficient']):
        return generate_technical_response(message)

    # Default learning mode response
    else:
        return f"""🎓 **Learning Mode Active**

I'm here to help you learn about LLM fine-tuning! Here's what I can teach you:

**📚 Core Concepts:**
• LoRA & QLoRA techniques
• Parameter-efficient fine-tuning (PEFT)
• Transformer architectures
• Training strategies

**🔍 Your Question:** "{message}"

**💡 Suggestions:**
• "What is LoRA fine-tuning?"
• "How does QLoRA work?"
• "Explain parameter-efficient methods"
• "Show me the learning path"

**📖 Resources:**
• Visit `/learn` for structured tutorials
• Try `/workshops` for hands-on practice
• Check `/quiz` to test your knowledge

🎯 **Tip:** Switch to Code mode for implementation examples!"""

def generate_code_mode_response(message, context=None):
    """Generate code-focused response with examples"""
    message_lower = message.lower()

    # QLoRA implementation (check first since it contains 'lora')
    if any(term in message_lower for term in ['qlora', 'quantized']):
        return """💻 **QLoRA Implementation Example**

**QLoRA Setup with BitsAndBytes:**
```python
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig
)
from peft import LoraConfig, get_peft_model

# 4-bit quantization config
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16
)

# Load quantized model
model = AutoModelForCausalLM.from_pretrained(
    "microsoft/DialoGPT-medium",
    quantization_config=bnb_config,
    device_map="auto"
)

# LoRA configuration for QLoRA
lora_config = LoraConfig(
    r=64,
    lora_alpha=16,
    target_modules=["c_attn", "c_proj"],
    lora_dropout=0.1,
    bias="none",
    task_type="CAUSAL_LM"
)

model = get_peft_model(model, lora_config)
```

**Memory Monitoring:**
```python
def print_gpu_utilization():
    if torch.cuda.is_available():
        print(f"GPU memory: {torch.cuda.memory_allocated() / 1024**3:.2f} GB")

print_gpu_utilization()  # Check memory usage
```

**🔧 Complete Examples:**
• `/workshops` - Full QLoRA workshop
• Google Colab integration
• Memory optimization techniques

⚡ **Performance tip:** Use gradient checkpointing for even lower memory!"""

    # LoRA implementation (check after QLoRA)
    elif any(term in message_lower for term in ['lora', 'implementation', 'example']):
        return """💻 **LoRA Implementation Example**

**Basic LoRA Setup:**
```python
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM

# Load base model
model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")

# Configure LoRA
lora_config = LoraConfig(
    r=16,                    # rank
    lora_alpha=32,          # scaling parameter
    target_modules=["c_attn"], # target layers
    lora_dropout=0.1,       # dropout
    bias="none",            # bias type
    task_type="CAUSAL_LM"   # task type
)

# Apply LoRA
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
```

**Training Loop:**
```python
from transformers import Trainer, TrainingArguments

training_args = TrainingArguments(
    output_dir="./lora-model",
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    num_train_epochs=3,
    save_steps=500,
    logging_steps=100,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    tokenizer=tokenizer,
)

trainer.train()
```

**🚀 Next Steps:**
• Visit `/workshops` for complete implementation
• Try Google Colab notebooks
• Check `/lora-guide` for detailed walkthrough

💡 **Need help with specific errors?** Ask "Debug my LoRA training"!"""

    # General code queries
    elif any(term in message_lower for term in ['code', 'example', 'implementation']):
        return generate_code_response(message)

    # Default code mode response
    else:
        return f"""💻 **Code Assistant Mode Active**

I'm here to help with implementation and code examples!

**🔧 Your Question:** "{message}"

**💡 What I can help with:**
• LoRA/QLoRA implementation examples
• Training scripts and configurations
• Debugging and troubleshooting
• Best practices and optimizations
• Google Colab setup

**🚀 Quick Examples:**
• "Show me LoRA implementation"
• "QLoRA training script"
• "How to debug CUDA errors"
• "Memory optimization tips"

**📁 Resources:**
• `/workshops` - Hands-on coding exercises
• Google Colab notebooks
• Complete implementation guides

🎯 **Tip:** Be specific about your implementation needs for better help!"""

def generate_general_mode_response(message, context=None):
    """Generate general-purpose response"""
    message_lower = message.lower()

    # Platform information
    if any(term in message_lower for term in ['platform', 'website', 'about', 'what is']):
        return generate_platform_response(message)

    # Navigation help
    elif any(term in message_lower for term in ['navigate', 'find', 'where', 'go to']):
        return generate_navigation_response(message)

    # Features inquiry
    elif any(term in message_lower for term in ['features', 'capabilities', 'what can']):
        return """🌟 **Visual LLM Platform Features**

**🎓 Learning & Education:**
• Comprehensive LLM fine-tuning tutorials
• Interactive workshops with Google Colab
• Progressive learning paths
• Knowledge assessment quizzes

**🤖 AI Assistant:**
• Context-aware responses
• Multiple modes (Learning, Code, General)
• Technical concept explanations
• Implementation guidance

**💻 Hands-on Practice:**
• LoRA & QLoRA implementations
• Real-world code examples
• Debugging assistance
• Best practices guides

**📊 Progress Tracking:**
• Learning analytics dashboard
• Progress visualization
• Achievement tracking
• Performance metrics

**🔧 Technical Tools:**
• Google Colab integration
• Code highlighting and examples
• Interactive diagrams
• Resource management

**🎯 Getting Started:**
• Visit `/learn` for tutorials
• Try `/workshops` for practice
• Use AI Assistant for help
• Check `/analytics` for progress

💡 **Switch modes above for specialized assistance!**"""

    # Default general response
    else:
        return f"""💬 **General Assistant Mode**

**Your Question:** "{message}"

I'm here to help with anything about the Visual LLM platform!

**🎯 I can assist with:**
• Platform navigation and features
• General questions about LLM fine-tuning
• Learning path recommendations
• Technical concept overviews

**🔄 Specialized Modes:**
• **Learning Mode** - Deep technical explanations
• **Code Mode** - Implementation examples and debugging
• **General Mode** - Platform help and navigation

**💡 Popular Questions:**
• "What is this platform about?"
• "How do I get started with LLM fine-tuning?"
• "What learning resources are available?"
• "How do I navigate this website?"

**📚 Quick Links:**
• `/learn` - Start learning
• `/workshops` - Hands-on practice
• `/analytics` - Track progress

🚀 **Tip:** Switch to Learning or Code mode for more specialized help!"""

def generate_navigation_response(message):
    """Generate navigation help response"""
    nav_info = WEBSITE_KNOWLEDGE["navigation"]

    response = "🧭 **Navigation Help**\n\nHere are the main sections of Visual LLM:\n\n"
    for section, path in nav_info.items():
        response += f"• **{section.title()}**: {path}\n"

    response += "\n💡 **Quick Actions:**\n"
    response += "• Click any navigation button in the top menu\n"
    response += "• Use the search functionality for specific topics\n"
    response += "• Check your progress in the Analytics dashboard\n"

    return response

def generate_technical_response(message):
    """Generate technical concept response"""
    message_lower = message.lower()
    concepts = WEBSITE_KNOWLEDGE["technical_concepts"]

    if 'lora' in message_lower and 'qlora' not in message_lower:
        concept = concepts["lora"]
        response = f"🔧 **LoRA (Low-Rank Adaptation)**\n\n"
        response += f"**Definition:** {concept['definition']}\n\n"
        response += f"**Key Benefits:**\n"
        for benefit in concept['benefits']:
            response += f"• {benefit}\n"
        response += f"\n**Use Cases:**\n"
        for use_case in concept['use_cases']:
            response += f"• {use_case}\n"
        response += f"\n📚 **Learn More:** Visit our [LoRA Guide](/lora_guide) for detailed tutorials!"

    elif 'qlora' in message_lower:
        concept = concepts["qlora"]
        response = f"⚡ **QLoRA (Quantized LoRA)**\n\n"
        response += f"**Definition:** {concept['definition']}\n\n"
        response += f"**Key Benefits:**\n"
        for benefit in concept['benefits']:
            response += f"• {benefit}\n"
        response += f"\n**Use Cases:**\n"
        for use_case in concept['use_cases']:
            response += f"• {use_case}\n"
        response += f"\n🚀 **Try It:** Check out our [QLoRA Workshop](/workshop_qlora) with hands-on examples!"

    elif 'peft' in message_lower:
        concept = concepts["peft"]
        response = f"🎯 **PEFT (Parameter-Efficient Fine-Tuning)**\n\n"
        response += f"**Definition:** {concept['definition']}\n\n"
        response += f"**Available Techniques:**\n"
        for technique in concept['techniques']:
            response += f"• {technique}\n"
        response += f"\n**Advantages:**\n"
        for advantage in concept['advantages']:
            response += f"• {advantage}\n"
        response += f"\n📖 **Explore:** Visit our [PEFT Guide](/peft_guide) for comprehensive coverage!"

    else:
        response = "🔬 **LLM Fine-Tuning Concepts**\n\n"
        response += "I can help you with various fine-tuning concepts:\n\n"
        response += "• **LoRA** - Low-Rank Adaptation techniques\n"
        response += "• **QLoRA** - Quantized LoRA for efficiency\n"
        response += "• **PEFT** - Parameter-Efficient Fine-Tuning methods\n"
        response += "• **Implementation** - Code examples and tutorials\n\n"
        response += "Ask me about any specific concept for detailed explanations!"

    return response

def generate_platform_response(message):
    """Generate platform information response"""
    platform = WEBSITE_KNOWLEDGE["platform_info"]

    response = f"🌟 **Welcome to {platform['name']}!**\n\n"
    response += f"{platform['description']}\n\n"
    response += "**🚀 Key Features:**\n"
    for feature in platform['features']:
        response += f"• {feature}\n"

    response += "\n**🎯 Perfect for:**\n"
    response += "• Beginners learning LLM fine-tuning\n"
    response += "• Researchers exploring PEFT methods\n"
    response += "• Developers implementing LoRA/QLoRA\n"
    response += "• Students taking ML courses\n\n"
    response += "**🚀 Get Started:** Visit our [Learning Paths](/learning_paths) to begin your journey!"

    return response

def generate_learning_response(message):
    """Generate learning-focused response"""
    response = "📚 **Learning Resources**\n\n"
    response += "**🎓 Structured Learning:**\n"
    response += "• [Learn & Study](/learn) - Comprehensive tutorials\n"
    response += "• [Workshops](/workshops) - Hands-on coding exercises\n"
    response += "• [Quizzes](/quiz/quiz_list) - Test your knowledge\n\n"

    response += "**🛠️ Practical Experience:**\n"
    response += "• Google Colab integration for live coding\n"
    response += "• Real-world project examples\n"
    response += "• Step-by-step implementation guides\n\n"

    response += "**📊 Track Progress:**\n"
    response += "• [Analytics Dashboard](/analytics/dashboard) - Monitor your learning\n"
    response += "• Quiz scores and completion rates\n"
    response += "• Personalized recommendations\n\n"

    response += "**💡 Recommendation:** Start with our [Beginner Learning Path](/learning_paths) if you're new to LLM fine-tuning!"

    return response

def generate_code_response(message):
    """Generate code and implementation response"""
    response = "💻 **Code & Implementation**\n\n"
    response += "**🔧 Available Examples:**\n"
    response += "• LoRA implementation with Transformers\n"
    response += "• QLoRA setup for large models\n"
    response += "• PEFT library integration\n"
    response += "• Custom training loops\n\n"

    response += "**📝 Code Resources:**\n"
    response += "• [LoRA Hands-On](/lora_hands_on) - Complete implementation\n"
    response += "• [QLoRA Workshop](/workshop_qlora) - Memory-efficient training\n"
    response += "• [Google Colab Notebooks](/google_ml_crash_course) - Interactive coding\n\n"

    response += "**🚀 Quick Start Template:**\n"
    response += "```python\n"
    response += "from peft import LoraConfig, get_peft_model\n"
    response += "from transformers import AutoModelForCausalLM\n\n"
    response += "# Load base model\n"
    response += "model = AutoModelForCausalLM.from_pretrained('model_name')\n\n"
    response += "# Configure LoRA\n"
    response += "lora_config = LoraConfig(r=16, lora_alpha=32)\n"
    response += "model = get_peft_model(model, lora_config)\n"
    response += "```\n\n"
    response += "**📚 Need more details?** Visit our workshops for complete implementations!"

    return response

def generate_ai_response(message):
    """Generate AI response using language model"""
    try:
        # Get AI model
        ai_model = get_ai_model()
        if not ai_model:
            return generate_fallback_response(message)

        # Create context-aware prompt
        prompt = f"As an AI assistant for Visual LLM, a platform for learning LLM fine-tuning, answer this question: {message}\n\nResponse:"

        # Generate response
        result = ai_model(
            prompt,
            max_length=len(prompt.split()) + 100,
            num_return_sequences=1,
            temperature=0.7,
            do_sample=True,
            pad_token_id=50256
        )

        # Extract generated text
        generated_text = result[0]['generated_text']
        response = generated_text.split("Response:")[-1].strip()

        # Add helpful context
        response += "\n\n💡 **Need more help?** I can assist with navigation, technical concepts, code examples, and learning resources!"

        return response

    except Exception as e:
        logger.error(f"Error generating AI response: {str(e)}")
        return generate_fallback_response(message)

def generate_fallback_response(message):
    """Generate fallback response when AI model is unavailable"""
    return """🤖 **AI Assistant**

I'm here to help you with Visual LLM! I can assist with:

**📚 Learning & Navigation:**
• Guide you to tutorials, workshops, and quizzes
• Explain LLM fine-tuning concepts
• Help you find specific resources

**🔧 Technical Support:**
• LoRA and QLoRA implementation details
• PEFT method explanations
• Code examples and best practices

**🧭 Platform Navigation:**
• Find any section of the website
• Track your learning progress
• Access interactive features

**💬 Ask me anything about:**
• "How do I implement LoRA?"
• "Where can I find workshops?"
• "What is QLoRA?"
• "Show me code examples"

What would you like to know about LLM fine-tuning?"""

@ai_assistant_api.route('/chat', methods=['POST'])
@csrf.exempt
@handle_api_error
def chat():
    """Main chat endpoint for AI assistant"""
    data = request.json

    if not data:
        logger.warning(f"Empty request to chat endpoint from IP: {request.remote_addr}")
        raise ValueError("No request data provided")

    if 'message' not in data:
        logger.warning(f"Missing message in chat request from IP: {request.remote_addr}")
        raise ValueError("No message provided")

    message = data['message'].strip()
    context = data.get('context', {})
    mode = data.get('mode', 'general')  # Get mode from unified AI assistant

    if not message:
        logger.warning(f"Empty message in chat request from IP: {request.remote_addr}")
        raise ValueError("Empty message")

    # Log the interaction
    logger.info(f"AI Assistant query ({mode} mode): {message[:100]}...")

    # Generate response with mode and context
    response = generate_contextual_response(message, context, mode)

    # Add metadata
    response_data = {
        'response': response,
        'timestamp': datetime.now().isoformat(),
        'context': {
            'user_authenticated': current_user.is_authenticated,
            'current_page': context.get('current_page', 'unknown'),
            'response_type': 'contextual'
        }
    }

    # Add user-specific data if authenticated
    if current_user.is_authenticated:
        response_data['context']['user_id'] = current_user.id
        response_data['context']['username'] = current_user.username

    return jsonify(response_data)

@ai_assistant_api.route('/suggestions', methods=['GET'])
@csrf.exempt
@handle_api_error
def get_suggestions():
    """Get contextual suggestions based on current page"""
    current_page = request.args.get('page', 'home')

    # Page-specific suggestions
    suggestions = {
        'home': [
            "What is Visual LLM?",
            "How do I get started with LLM fine-tuning?",
            "Show me the learning paths",
            "What workshops are available?"
        ],
        'learn': [
            "Explain LoRA fine-tuning",
            "What is the difference between LoRA and QLoRA?",
            "Show me implementation examples",
            "How do I track my progress?"
        ],
        'workshops': [
            "How do I access Google Colab notebooks?",
            "What prerequisites do I need?",
            "Show me a complete LoRA implementation",
            "Help me with workshop exercises"
        ],
        'quiz': [
            "How are quizzes scored?",
            "What topics are covered?",
            "Can I retake quizzes?",
            "Show me my quiz progress"
        ]
    }

    return jsonify({
        'suggestions': suggestions.get(current_page, suggestions['home']),
        'page': current_page
    })

@ai_assistant_api.route('/status', methods=['GET'])
@csrf.exempt
@handle_api_error
def get_status():
    """Get AI assistant status and capabilities"""
    return jsonify({
        'status': 'online',
        'capabilities': [
            'Contextual responses',
            'Website navigation help',
            'Technical concept explanations',
            'Code examples and tutorials',
            'Learning path guidance',
            'Progress tracking assistance'
        ],
        'models_loaded': list(model_cache.keys()),
        'knowledge_base': {
            'concepts': len(WEBSITE_KNOWLEDGE['technical_concepts']),
            'navigation_items': len(WEBSITE_KNOWLEDGE['navigation']),
            'features': len(WEBSITE_KNOWLEDGE['platform_info']['features'])
        }
    })

@ai_assistant_api.route('/test-error', methods=['GET'])
@csrf.exempt
@handle_api_error
def test_error():
    """Test endpoint to verify error handling"""
    error_type = request.args.get('type', 'server')
    
    if error_type == 'value':
        raise ValueError("Test value error")
    elif error_type == 'permission':
        raise PermissionError("Test permission error")
    elif error_type == 'notfound':
        raise FileNotFoundError("Test not found error")
    else:
        # Default to server error
        raise Exception("Test server error")
