#!/usr/bin/env python3
"""
MULTI-PROVIDER FREE AI ASSISTANT FOR VISUAL LLM
Supports multiple free AI APIs with intelligent fallback system
"""

import os
import requests
import json
import asyncio
import aiohttp
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from flask import Flask, request, jsonify
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AIResponse:
    content: str
    model: str
    provider: str
    tokens_used: int = 0
    cost: float = 0.0
    response_time: float = 0.0
    success: bool = True
    error: Optional[str] = None

class MultiProviderAIAssistant:
    """
    Multi-provider AI assistant with intelligent fallback system
    Supports: Groq, HuggingFace, Ollama, and static fallbacks
    """
    
    def __init__(self):
        self.providers = {
            'groq': GroqProvider(),
            'huggingface': HuggingFaceProvider(),
            'ollama': OllamaProvider(),
            'fallback': FallbackProvider()
        }
        
        # Provider priority order (fastest/best first)
        self.fallback_chain = ['groq', 'huggingface', 'ollama', 'fallback']
        
        # Educational context for Visual LLM
        self.educational_context = self._load_educational_context()
        
        logger.info("🤖 Multi-Provider AI Assistant initialized")
    
    def _load_educational_context(self) -> str:
        """Load educational context for LLM fine-tuning"""
        return """
        You are an AI assistant specialized in LLM fine-tuning education for the Visual LLM platform.
        
        Key topics you should be expert in:
        - LoRA (Low-Rank Adaptation) fine-tuning
        - QLoRA (Quantized LoRA) techniques
        - Parameter-efficient fine-tuning (PEFT)
        - Transformer architectures
        - Hugging Face libraries (transformers, peft, datasets)
        - Fine-tuning best practices
        - Model deployment and optimization
        
        Always provide:
        - Clear, educational explanations
        - Practical code examples when relevant
        - Step-by-step guidance
        - Links to resources when helpful
        - Beginner-friendly language with technical depth
        
        Platform context: Visual LLM is a free educational platform for learning LLM fine-tuning.
        """
    
    async def query(self, message: str, preferred_provider: str = None) -> AIResponse:
        """
        Query AI with intelligent fallback system
        """
        # Enhance message with educational context
        enhanced_message = self._enhance_educational_prompt(message)
        
        # Determine provider order
        providers_to_try = [preferred_provider] if preferred_provider else []
        providers_to_try.extend([p for p in self.fallback_chain if p != preferred_provider])
        
        last_error = None
        
        for provider_name in providers_to_try:
            if provider_name not in self.providers:
                continue
                
            provider = self.providers[provider_name]
            
            try:
                logger.info(f"🔄 Trying provider: {provider_name}")
                response = await provider.query(enhanced_message)
                
                if response.success and response.content:
                    logger.info(f"✅ Success with {provider_name}")
                    return response
                else:
                    logger.warning(f"⚠️ {provider_name} returned empty/failed response")
                    last_error = response.error
                    
            except Exception as e:
                logger.error(f"❌ {provider_name} failed: {str(e)}")
                last_error = str(e)
                continue
        
        # If all providers fail, return fallback response
        logger.warning("🚨 All providers failed, using static fallback")
        return self.providers['fallback'].query(message)
    
    def _enhance_educational_prompt(self, message: str) -> str:
        """Enhance user message with comprehensive educational context"""
        enhanced_prompt = f"""{self.educational_context}

IMPORTANT: This is an educational platform where students are learning complex LLM fine-tuning concepts.

User question: {message}

Please provide a comprehensive, detailed educational response that includes:
1. Clear explanations with technical depth
2. Practical code examples when relevant
3. Step-by-step guidance
4. Real-world applications and use cases
5. Best practices and optimization tips
6. Comparisons with alternative approaches
7. Common pitfalls and how to avoid them

Make your response thorough and educational (aim for 500+ words for technical topics):"""

        return enhanced_prompt

class GroqProvider:
    """
    Groq API Provider - Ultra-Fast AI for Education
    Sign up at: https://console.groq.com

    Features:
    - 500+ tokens/second inference speed
    - Free tier: 14,400 requests/day
    - Multiple model options
    - Perfect for real-time educational assistance
    """

    def __init__(self):
        self.api_key = os.getenv('GROQ_API_KEY')
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"

        # Model selection based on use case
        self.models = {
            'fast': 'llama3-8b-8192',      # Fastest, good for quick responses
            'balanced': 'llama3-70b-8192',  # Best balance of speed and quality
            'quality': 'mixtral-8x7b-32768' # Highest quality, longer context
        }

        # Default to fast model for educational responsiveness
        self.model = self.models['fast']
        self.available = bool(self.api_key)

        if not self.available:
            logger.warning("⚠️ Groq API key not found. Set GROQ_API_KEY environment variable")
            logger.info("📝 Get free API key at: https://console.groq.com")
        else:
            logger.info(f"⚡ Groq provider initialized with {self.model}")
    
    async def query(self, message: str, use_quality_model: bool = False) -> AIResponse:
        """Query Groq API with optimized educational prompting"""
        if not self.available:
            raise Exception("Groq API key not configured")

        # Select model based on query complexity
        model = self.models['quality'] if use_quality_model else self.model

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        # Enhanced educational system prompt for comprehensive responses
        system_prompt = """You are an expert AI education assistant for the Visual LLM platform, specializing in LLM fine-tuning education. You MUST provide comprehensive, detailed, and educational responses.

Your expertise includes:
- LoRA (Low-Rank Adaptation) and QLoRA techniques with technical details
- Parameter-efficient fine-tuning (PEFT) methods and implementations
- Transformer architectures and attention mechanisms with mathematical foundations
- Hugging Face ecosystem (transformers, peft, datasets) with practical examples
- Practical implementation with complete, working code examples
- Best practices for model training, deployment, and optimization
- Memory efficiency, quantization, and hardware considerations

RESPONSE REQUIREMENTS - You MUST include ALL of these:
✅ Comprehensive explanations (minimum 300 words for technical topics)
✅ Technical details and mathematical foundations when relevant
✅ Complete, working code examples with explanations
✅ Step-by-step implementation guidance
✅ Educational context, background, and real-world applications
✅ Comparisons with alternative approaches
✅ Best practices and common pitfalls to avoid
✅ Performance considerations and optimization tips
✅ Encouraging and supportive educational tone

Format responses with:
- Clear headings using **bold** formatting
- Detailed explanations with technical depth
- Complete code blocks with comments
- Bullet points for key concepts and benefits
- Tables for comparisons when helpful
- Emojis for visual appeal and engagement
- Practical examples and use cases

Remember: Students need detailed, thorough explanations to truly understand complex AI concepts. Never give brief or superficial answers. Always provide comprehensive educational content that helps students master the subject."""

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            "max_tokens": 2500,  # Significantly increased for comprehensive educational responses
            "temperature": 0.7,
            "top_p": 0.9,
            "stream": False
        }
        
        import time
        start_time = time.time()

        async with aiohttp.ClientSession() as session:
            async with session.post(self.base_url, headers=headers, json=payload, timeout=20) as response:
                response_time = time.time() - start_time

                if response.status == 200:
                    data = await response.json()
                    content = data['choices'][0]['message']['content']

                    # Add educational enhancement markers
                    if content and len(content) > 100:
                        content += f"\n\n---\n💡 *Powered by Groq's ultra-fast LPU technology - Response time: {response_time:.2f}s*"

                    return AIResponse(
                        content=content,
                        model=model,
                        provider='groq',
                        tokens_used=data.get('usage', {}).get('total_tokens', 0),
                        cost=0.0,  # Free tier!
                        response_time=response_time,
                        success=True
                    )
                else:
                    error_text = await response.text()
                    logger.error(f"Groq API error {response.status}: {error_text}")
                    raise Exception(f"Groq API error {response.status}: {error_text}")

class HuggingFaceProvider:
    """
    Hugging Face Inference API Provider
    Get token at: https://huggingface.co/settings/tokens
    """
    
    def __init__(self):
        self.api_key = os.getenv('HUGGINGFACE_API_KEY')
        self.base_url = "https://api-inference.huggingface.co/models"
        self.model = "microsoft/DialoGPT-large"  # Good for conversation
        self.available = bool(self.api_key)
        
        if not self.available:
            logger.warning("⚠️ HuggingFace API key not found. Set HUGGINGFACE_API_KEY environment variable")
    
    async def query(self, message: str) -> AIResponse:
        """Query HuggingFace Inference API"""
        if not self.available:
            raise Exception("HuggingFace API key not configured")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "inputs": message,
            "parameters": {
                "max_length": 500,
                "temperature": 0.7,
                "do_sample": True
            }
        }
        
        url = f"{self.base_url}/{self.model}"
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=payload, timeout=20) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Handle different response formats
                    if isinstance(data, list) and len(data) > 0:
                        content = data[0].get('generated_text', '')
                    else:
                        content = str(data)
                    
                    return AIResponse(
                        content=content,
                        model=self.model,
                        provider='huggingface',
                        cost=0.0,  # Free tier
                        success=True
                    )
                else:
                    error_text = await response.text()
                    raise Exception(f"HuggingFace API error {response.status}: {error_text}")

class OllamaProvider:
    """
    Enhanced Local Ollama Provider for Intelligent Educational AI
    Provides comprehensive, contextually-aware responses for LLM fine-tuning education
    Install: curl -fsSL https://ollama.ai/install.sh | sh
    """

    def __init__(self):
        self.base_url = "http://localhost:11434"
        self.model = "llama3.1"
        self.available = self._check_availability()
        self.educational_context = self._load_educational_context()

        if self.available:
            logger.info(f"🦙 Enhanced Ollama provider initialized with {self.model}")
        else:
            logger.warning("⚠️ Ollama not available. Install with: curl -fsSL https://ollama.ai/install.sh | sh")

    def _load_educational_context(self) -> str:
        """Load comprehensive educational context for Visual LLM platform"""
        return """You are Professor LLM, an expert AI educator specializing in Large Language Model fine-tuning on the Visual LLM platform.

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

Always provide educational value and encourage hands-on learning!"""

    def _check_availability(self) -> bool:
        """Check if Ollama is running"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=3)
            return response.status_code == 200
        except:
            return False

    def _enhance_educational_prompt(self, message: str) -> str:
        """Enhance user message with comprehensive educational context"""
        enhanced_prompt = f"""{self.educational_context}

STUDENT QUESTION: {message}

Please provide a comprehensive, educational response that includes:
1. Clear explanation of concepts with technical depth
2. Practical code examples when relevant
3. Step-by-step implementation guidance
4. Real-world applications and use cases
5. Best practices and optimization tips
6. Comparisons with alternative approaches
7. Common pitfalls and how to avoid them

Make your response thorough and educational (aim for 500+ words for technical topics):"""

        return enhanced_prompt

    async def query(self, message: str) -> AIResponse:
        """Query local Ollama with enhanced educational prompting"""
        if not self.available:
            raise Exception("Ollama not running. Start with: ollama serve")

        # Enhance the message with educational context
        enhanced_message = self._enhance_educational_prompt(message)

        payload = {
            "model": self.model,
            "prompt": enhanced_message,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "top_k": 40,
                "num_ctx": 4096,  # Increased context window for detailed responses
                "repeat_penalty": 1.1,
                "num_predict": 2000  # Allow longer responses
            }
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(f"{self.base_url}/api/generate", json=payload, timeout=60) as response:
                if response.status == 200:
                    data = await response.json()
                    content = data.get('response', '')

                    # Post-process response for better formatting
                    formatted_content = self._format_educational_response(content)

                    return AIResponse(
                        content=formatted_content,
                        model=self.model,
                        provider='ollama',
                        cost=0.0,  # Always free
                        success=True,
                        tokens_used=len(content.split())  # Approximate token count
                    )
                else:
                    error_text = await response.text()
                    raise Exception(f"Ollama error {response.status}: {error_text}")

    def _format_educational_response(self, content: str) -> str:
        """Format response for better educational presentation"""
        # Ensure proper formatting and structure
        formatted = content.strip()

        # Add educational emojis and formatting if not present
        if not any(emoji in formatted for emoji in ['🎓', '📚', '💡', '🔍', '✅']):
            formatted = f"🎓 **Educational Response:**\n\n{formatted}"

        return formatted

class FallbackProvider:
    """
    Static fallback responses for when all APIs fail
    Ensures the assistant always works
    """
    
    def __init__(self):
        self.responses = {
            'lora': """🎯 **LoRA (Low-Rank Adaptation)** is a parameter-efficient fine-tuning technique:

• **Reduces trainable parameters** by up to 99% while maintaining performance
• **Uses low-rank matrices** to approximate weight updates
• **Freezes original weights** and only trains adapter layers
• **Enables fine-tuning** large models on consumer GPUs

**Key Benefits:**
✅ Memory efficient (8GB GPU can fine-tune 7B models)
✅ Fast training and inference
✅ Easy to merge and deploy

**Example:**
```python
from peft import LoraConfig, get_peft_model
config = LoraConfig(r=16, lora_alpha=32)
model = get_peft_model(base_model, config)
```""",
            
            'qlora': """🚀 **QLoRA (Quantized LoRA)** combines quantization with LoRA:

• **4-bit quantization** reduces memory by 75%
• **Maintains LoRA benefits** with lower resource requirements
• **Enables fine-tuning** 70B models on single consumer GPUs

**Memory Comparison:**
• Full fine-tuning 7B: ~28GB
• LoRA: ~14GB  
• QLoRA: ~6GB

Perfect for consumer hardware!""",
            
            'default': """🎓 **Welcome to Visual LLM!** I'm your AI assistant for LLM fine-tuning education.

**I can help with:**
• LoRA & QLoRA techniques
• Transformer architectures
• PEFT methods
• Implementation examples
• Best practices

**Try asking:**
• "What is LoRA?"
• "How does QLoRA work?"
• "Show me a fine-tuning example"

What would you like to learn?"""
        }
    
    async def query(self, message: str) -> AIResponse:
        """Return appropriate fallback response"""
        message_lower = message.lower()
        
        if 'lora' in message_lower and 'qlora' not in message_lower:
            content = self.responses['lora']
        elif 'qlora' in message_lower:
            content = self.responses['qlora']
        else:
            content = self.responses['default']
        
        return AIResponse(
            content=content,
            model='static-fallback',
            provider='fallback',
            cost=0.0,
            success=True
        )

# Flask Integration
def create_multi_provider_routes(app: Flask):
    """Add multi-provider AI routes to Flask app"""
    
    ai_assistant = MultiProviderAIAssistant()
    
    @app.route('/api/ai/multi/chat', methods=['POST'])
    def multi_provider_chat():
        """Main chat endpoint with multi-provider support"""
        try:
            data = request.get_json()
            message = data.get('message', '')
            provider = data.get('provider')  # Optional preferred provider
            
            if not message:
                return jsonify({'error': 'No message provided'}), 400
            
            # Run async query
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            response = loop.run_until_complete(ai_assistant.query(message, provider))
            loop.close()
            
            return jsonify({
                'response': response.content,
                'model': response.model,
                'provider': response.provider,
                'tokens_used': response.tokens_used,
                'cost': response.cost,
                'success': response.success
            })
            
        except Exception as e:
            logger.error(f"Error in multi-provider chat: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/ai/multi/status', methods=['GET'])
    def multi_provider_status():
        """Get status of all providers"""
        status = {}
        
        for name, provider in ai_assistant.providers.items():
            if hasattr(provider, 'available'):
                status[name] = {
                    'available': provider.available,
                    'type': 'api' if name in ['groq', 'huggingface'] else 'local' if name == 'ollama' else 'static'
                }
        
        return jsonify({
            'providers': status,
            'fallback_chain': ai_assistant.fallback_chain,
            'total_providers': len(ai_assistant.providers)
        })
    
    @app.route('/api/ai/multi/providers', methods=['GET'])
    def available_providers():
        """List available providers with details"""
        providers = {
            'groq': {
                'name': 'Groq',
                'description': 'Ultra-fast inference with Llama models',
                'cost': 'Free (14.4k requests/day)',
                'speed': 'Very Fast',
                'setup': 'API key required'
            },
            'huggingface': {
                'name': 'Hugging Face',
                'description': 'Educational AI models and inference',
                'cost': 'Free tier (1k requests/month)',
                'speed': 'Medium',
                'setup': 'API token required'
            },
            'ollama': {
                'name': 'Ollama',
                'description': 'Local AI models, completely private',
                'cost': 'Free (unlimited)',
                'speed': 'Slow',
                'setup': 'Local installation required'
            },
            'fallback': {
                'name': 'Static Responses',
                'description': 'Educational fallback responses',
                'cost': 'Free (unlimited)',
                'speed': 'Instant',
                'setup': 'Always available'
            }
        }
        
        return jsonify(providers)

if __name__ == "__main__":
    # Test the multi-provider system
    async def test_system():
        ai = MultiProviderAIAssistant()
        
        test_questions = [
            "What is LoRA in LLM fine-tuning?",
            "How does QLoRA work?",
            "Show me a practical fine-tuning example"
        ]
        
        for question in test_questions:
            print(f"\n🔍 Testing: {question}")
            response = await ai.query(question)
            print(f"✅ Provider: {response.provider}")
            print(f"📝 Response: {response.content[:200]}...")
            print(f"💰 Cost: ${response.cost}")
    
    asyncio.run(test_system())
