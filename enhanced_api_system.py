"""
Enhanced API System for Visual LLM Platform
Integrates multiple AI providers with advanced capabilities
Supports Ollama, OpenAI, Anthropic, Groq, and Hugging Face
"""

import os
import asyncio
import aiohttp
import json
import logging
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from datetime import datetime
import time

logger = logging.getLogger(__name__)

@dataclass
class APIResponse:
    """Standardized API response format"""
    content: str
    model: str
    provider: str
    tokens_used: int
    cost: float
    latency: float
    success: bool
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class ProviderConfig:
    """Configuration for API providers"""
    name: str
    api_key: Optional[str]
    base_url: str
    models: List[str]
    rate_limit: int  # requests per minute
    cost_per_token: float
    enabled: bool = True

class EnhancedAPISystem:
    """
    Advanced API system with multiple provider support
    Intelligent routing, fallback, and cost optimization
    """
    
    def __init__(self):
        self.providers = self._initialize_providers()
        self.usage_stats = {}
        self.rate_limits = {}
        
        logger.info("🚀 Enhanced API System initialized")

    def _initialize_providers(self) -> Dict[str, ProviderConfig]:
        """Initialize all available API providers"""
        providers = {}
        
        # Ollama (Local, Free)
        providers['ollama'] = ProviderConfig(
            name='ollama',
            api_key=None,
            base_url='http://localhost:11434',
            models=['llama3.1', 'codellama', 'mistral', 'phi3'],
            rate_limit=1000,  # High limit for local
            cost_per_token=0.0,  # Free
            enabled=self._check_ollama_availability()
        )
        
        # OpenAI
        providers['openai'] = ProviderConfig(
            name='openai',
            api_key=os.getenv('OPENAI_API_KEY'),
            base_url='https://api.openai.com/v1',
            models=['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
            rate_limit=60,
            cost_per_token=0.00003,  # Approximate
            enabled=bool(os.getenv('OPENAI_API_KEY'))
        )
        
        # Anthropic Claude
        providers['anthropic'] = ProviderConfig(
            name='anthropic',
            api_key=os.getenv('ANTHROPIC_API_KEY'),
            base_url='https://api.anthropic.com',
            models=['claude-3-sonnet', 'claude-3-haiku'],
            rate_limit=50,
            cost_per_token=0.00003,
            enabled=bool(os.getenv('ANTHROPIC_API_KEY'))
        )
        
        # Groq (Fast inference)
        providers['groq'] = ProviderConfig(
            name='groq',
            api_key=os.getenv('GROQ_API_KEY'),
            base_url='https://api.groq.com/openai/v1',
            models=['llama3-70b-8192', 'mixtral-8x7b-32768'],
            rate_limit=100,
            cost_per_token=0.00001,  # Very cheap
            enabled=bool(os.getenv('GROQ_API_KEY'))
        )
        
        # Hugging Face
        providers['huggingface'] = ProviderConfig(
            name='huggingface',
            api_key=os.getenv('HUGGINGFACE_API_KEY'),
            base_url='https://api-inference.huggingface.co',
            models=['microsoft/DialoGPT-large', 'facebook/blenderbot-400M-distill'],
            rate_limit=30,
            cost_per_token=0.00001,
            enabled=bool(os.getenv('HUGGINGFACE_API_KEY'))
        )
        
        # Together AI (Multiple models)
        providers['together'] = ProviderConfig(
            name='together',
            api_key=os.getenv('TOGETHER_API_KEY'),
            base_url='https://api.together.xyz/v1',
            models=['meta-llama/Llama-2-70b-chat-hf', 'mistralai/Mixtral-8x7B-Instruct-v0.1'],
            rate_limit=60,
            cost_per_token=0.00002,
            enabled=bool(os.getenv('TOGETHER_API_KEY'))
        )
        
        return providers

    def _check_ollama_availability(self) -> bool:
        """Check if Ollama is running locally"""
        try:
            import requests
            response = requests.get("http://localhost:11434/api/tags", timeout=2)
            return response.status_code == 200
        except:
            return False

    async def query_provider(self, provider_name: str, message: str, model: Optional[str] = None) -> APIResponse:
        """Query a specific provider"""
        if provider_name not in self.providers:
            raise ValueError(f"Provider {provider_name} not available")
        
        provider = self.providers[provider_name]
        if not provider.enabled:
            raise ValueError(f"Provider {provider_name} is disabled")
        
        # Check rate limits
        if not self._check_rate_limit(provider_name):
            raise ValueError(f"Rate limit exceeded for {provider_name}")
        
        start_time = time.time()
        
        try:
            if provider_name == 'ollama':
                response = await self._query_ollama(provider, message, model)
            elif provider_name == 'openai':
                response = await self._query_openai(provider, message, model)
            elif provider_name == 'anthropic':
                response = await self._query_anthropic(provider, message, model)
            elif provider_name == 'groq':
                response = await self._query_groq(provider, message, model)
            elif provider_name == 'huggingface':
                response = await self._query_huggingface(provider, message, model)
            elif provider_name == 'together':
                response = await self._query_together(provider, message, model)
            else:
                raise ValueError(f"Provider {provider_name} not implemented")
            
            latency = time.time() - start_time
            response.latency = latency
            
            # Update usage stats
            self._update_usage_stats(provider_name, response)
            
            return response
            
        except Exception as e:
            logger.error(f"Provider {provider_name} error: {e}")
            return APIResponse(
                content="",
                model=model or "unknown",
                provider=provider_name,
                tokens_used=0,
                cost=0.0,
                latency=time.time() - start_time,
                success=False,
                error=str(e)
            )

    async def _query_ollama(self, provider: ProviderConfig, message: str, model: Optional[str]) -> APIResponse:
        """Query Ollama local API"""
        model = model or provider.models[0]
        
        payload = {
            "model": model,
            "prompt": message,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "num_ctx": 4096
            }
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{provider.base_url}/api/generate", json=payload, timeout=60) as response:
                if response.status == 200:
                    data = await response.json()
                    content = data.get('response', '')
                    
                    return APIResponse(
                        content=content,
                        model=model,
                        provider='ollama',
                        tokens_used=len(content.split()),  # Approximate
                        cost=0.0,  # Free
                        latency=0.0,  # Will be set by caller
                        success=True
                    )
                else:
                    error_text = await response.text()
                    raise Exception(f"Ollama error {response.status}: {error_text}")

    async def _query_openai(self, provider: ProviderConfig, message: str, model: Optional[str]) -> APIResponse:
        """Query OpenAI API"""
        model = model or 'gpt-3.5-turbo'
        
        headers = {
            'Authorization': f'Bearer {provider.api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": "You are an expert AI assistant specializing in LLM fine-tuning and machine learning education."},
                {"role": "user", "content": message}
            ],
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{provider.base_url}/chat/completions", headers=headers, json=payload, timeout=60) as response:
                if response.status == 200:
                    data = await response.json()
                    content = data['choices'][0]['message']['content']
                    tokens_used = data['usage']['total_tokens']
                    
                    return APIResponse(
                        content=content,
                        model=model,
                        provider='openai',
                        tokens_used=tokens_used,
                        cost=tokens_used * provider.cost_per_token,
                        latency=0.0,
                        success=True,
                        metadata=data['usage']
                    )
                else:
                    error_text = await response.text()
                    raise Exception(f"OpenAI error {response.status}: {error_text}")

    async def _query_groq(self, provider: ProviderConfig, message: str, model: Optional[str]) -> APIResponse:
        """Query Groq API (fast inference)"""
        model = model or 'llama3-70b-8192'
        
        headers = {
            'Authorization': f'Bearer {provider.api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": "You are an expert AI assistant specializing in LLM fine-tuning and machine learning education."},
                {"role": "user", "content": message}
            ],
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{provider.base_url}/chat/completions", headers=headers, json=payload, timeout=30) as response:
                if response.status == 200:
                    data = await response.json()
                    content = data['choices'][0]['message']['content']
                    tokens_used = data['usage']['total_tokens']
                    
                    return APIResponse(
                        content=content,
                        model=model,
                        provider='groq',
                        tokens_used=tokens_used,
                        cost=tokens_used * provider.cost_per_token,
                        latency=0.0,
                        success=True,
                        metadata=data['usage']
                    )
                else:
                    error_text = await response.text()
                    raise Exception(f"Groq error {response.status}: {error_text}")

    async def smart_query(self, message: str, preferences: Optional[Dict[str, Any]] = None) -> APIResponse:
        """
        Intelligent query routing based on preferences and availability
        
        Args:
            message: User message
            preferences: Dict with 'cost', 'speed', 'quality' priorities
        """
        preferences = preferences or {'cost': 'low', 'speed': 'medium', 'quality': 'high'}
        
        # Determine optimal provider based on preferences
        provider_scores = {}
        
        for name, provider in self.providers.items():
            if not provider.enabled:
                continue
            
            score = 0
            
            # Cost preference
            if preferences.get('cost') == 'low':
                score += 100 if provider.cost_per_token == 0 else max(0, 50 - provider.cost_per_token * 1000000)
            
            # Speed preference
            if preferences.get('speed') == 'high':
                if name == 'groq':
                    score += 50  # Groq is fastest
                elif name == 'ollama':
                    score += 40  # Local is fast
                else:
                    score += 20
            
            # Quality preference
            if preferences.get('quality') == 'high':
                if name in ['openai', 'anthropic']:
                    score += 50  # High quality models
                elif name == 'groq':
                    score += 40
                else:
                    score += 20
            
            provider_scores[name] = score
        
        # Sort providers by score
        sorted_providers = sorted(provider_scores.items(), key=lambda x: x[1], reverse=True)
        
        # Try providers in order of preference
        for provider_name, score in sorted_providers:
            try:
                response = await self.query_provider(provider_name, message)
                if response.success:
                    return response
            except Exception as e:
                logger.warning(f"Provider {provider_name} failed: {e}")
                continue
        
        # If all providers fail, return error
        return APIResponse(
            content="All AI providers are currently unavailable. Please try again later.",
            model="fallback",
            provider="none",
            tokens_used=0,
            cost=0.0,
            latency=0.0,
            success=False,
            error="All providers failed"
        )

    def _check_rate_limit(self, provider_name: str) -> bool:
        """Check if provider is within rate limits"""
        current_time = time.time()
        
        if provider_name not in self.rate_limits:
            self.rate_limits[provider_name] = []
        
        # Remove old requests (older than 1 minute)
        self.rate_limits[provider_name] = [
            req_time for req_time in self.rate_limits[provider_name]
            if current_time - req_time < 60
        ]
        
        # Check if under limit
        provider = self.providers[provider_name]
        if len(self.rate_limits[provider_name]) < provider.rate_limit:
            self.rate_limits[provider_name].append(current_time)
            return True
        
        return False

    def _update_usage_stats(self, provider_name: str, response: APIResponse):
        """Update usage statistics"""
        if provider_name not in self.usage_stats:
            self.usage_stats[provider_name] = {
                'requests': 0,
                'tokens': 0,
                'cost': 0.0,
                'avg_latency': 0.0,
                'success_rate': 0.0
            }
        
        stats = self.usage_stats[provider_name]
        stats['requests'] += 1
        stats['tokens'] += response.tokens_used
        stats['cost'] += response.cost
        
        # Update average latency
        stats['avg_latency'] = (stats['avg_latency'] * (stats['requests'] - 1) + response.latency) / stats['requests']

    def get_provider_status(self) -> Dict[str, Any]:
        """Get status of all providers"""
        status = {}
        
        for name, provider in self.providers.items():
            status[name] = {
                'enabled': provider.enabled,
                'models': provider.models,
                'rate_limit': provider.rate_limit,
                'cost_per_token': provider.cost_per_token,
                'usage_stats': self.usage_stats.get(name, {})
            }
        
        return status

    def get_recommendations(self, use_case: str) -> List[str]:
        """Get provider recommendations for specific use cases"""
        recommendations = {
            'development': ['ollama', 'groq', 'huggingface'],
            'production': ['openai', 'anthropic', 'groq'],
            'cost_sensitive': ['ollama', 'groq', 'huggingface'],
            'high_quality': ['openai', 'anthropic', 'groq'],
            'fast_inference': ['groq', 'ollama', 'together'],
            'educational': ['ollama', 'groq', 'huggingface']
        }
        
        return recommendations.get(use_case, ['ollama', 'groq'])
