#!/usr/bin/env python3
"""
Performance Optimization Module for Thesaurus AI LLM
Provides comprehensive performance enhancements for concurrent user handling.
"""

import os
import time
import redis
import sqlite3
import threading
from functools import wraps
from typing import Dict, Any, Optional, Callable
from flask import Flask, request, jsonify, g
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache
from contextlib import contextmanager
import logging
from datetime import datetime, timedelta
import hashlib
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseConnectionPool:
    """
    SQLite connection pool for improved database performance.
    Manages multiple database connections to handle concurrent requests.
    """
    
    def __init__(self, database_path: str, pool_size: int = 10):
        self.database_path = database_path
        self.pool_size = pool_size
        self.connections = []
        self.lock = threading.Lock()
        self._initialize_pool()
    
    def _initialize_pool(self):
        """Initialize the connection pool."""
        for _ in range(self.pool_size):
            conn = sqlite3.connect(
                self.database_path,
                check_same_thread=False,
                timeout=30.0
            )
            conn.row_factory = sqlite3.Row
            # Enable WAL mode for better concurrent access
            conn.execute('PRAGMA journal_mode=WAL')
            conn.execute('PRAGMA synchronous=NORMAL')
            conn.execute('PRAGMA cache_size=10000')
            conn.execute('PRAGMA temp_store=MEMORY')
            self.connections.append(conn)
        logger.info(f"Initialized database pool with {self.pool_size} connections")
    
    @contextmanager
    def get_connection(self):
        """Get a connection from the pool."""
        with self.lock:
            if self.connections:
                conn = self.connections.pop()
            else:
                # Create new connection if pool is empty
                conn = sqlite3.connect(
                    self.database_path,
                    check_same_thread=False,
                    timeout=30.0
                )
                conn.row_factory = sqlite3.Row
        
        try:
            yield conn
        finally:
            with self.lock:
                if len(self.connections) < self.pool_size:
                    self.connections.append(conn)
                else:
                    conn.close()
    
    def close_all(self):
        """Close all connections in the pool."""
        with self.lock:
            for conn in self.connections:
                conn.close()
            self.connections.clear()

class AdvancedCache:
    """
    Advanced caching system with multiple backends and intelligent invalidation.
    """
    
    def __init__(self, app: Flask = None):
        self.app = app
        self.redis_client = None
        self.memory_cache = {}
        self.cache_stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'deletes': 0
        }
        
        if app:
            self.init_app(app)
    
    def init_app(self, app: Flask):
        """Initialize caching with Flask app."""
        self.app = app
        
        # Try to connect to Redis
        try:
            redis_url = app.config.get('REDIS_URL', 'redis://localhost:6379/0')
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            self.redis_client.ping()
            logger.info("Connected to Redis for caching")
        except Exception as e:
            logger.warning(f"Redis not available, using memory cache: {e}")
            self.redis_client = None
    
    def _generate_key(self, key: str, namespace: str = 'default') -> str:
        """Generate a namespaced cache key."""
        return f"{namespace}:{key}"
    
    def get(self, key: str, namespace: str = 'default') -> Optional[Any]:
        """Get value from cache."""
        cache_key = self._generate_key(key, namespace)
        
        try:
            if self.redis_client:
                value = self.redis_client.get(cache_key)
                if value:
                    self.cache_stats['hits'] += 1
                    return json.loads(value)
            else:
                if cache_key in self.memory_cache:
                    entry = self.memory_cache[cache_key]
                    if entry['expires'] > time.time():
                        self.cache_stats['hits'] += 1
                        return entry['value']
                    else:
                        del self.memory_cache[cache_key]
            
            self.cache_stats['misses'] += 1
            return None
            
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            self.cache_stats['misses'] += 1
            return None
    
    def set(self, key: str, value: Any, timeout: int = 300, namespace: str = 'default') -> bool:
        """Set value in cache."""
        cache_key = self._generate_key(key, namespace)
        
        try:
            if self.redis_client:
                serialized = json.dumps(value)
                self.redis_client.setex(cache_key, timeout, serialized)
            else:
                self.memory_cache[cache_key] = {
                    'value': value,
                    'expires': time.time() + timeout
                }
            
            self.cache_stats['sets'] += 1
            return True
            
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False
    
    def delete(self, key: str, namespace: str = 'default') -> bool:
        """Delete value from cache."""
        cache_key = self._generate_key(key, namespace)
        
        try:
            if self.redis_client:
                self.redis_client.delete(cache_key)
            else:
                self.memory_cache.pop(cache_key, None)
            
            self.cache_stats['deletes'] += 1
            return True
            
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False
    
    def clear_namespace(self, namespace: str) -> bool:
        """Clear all keys in a namespace."""
        try:
            if self.redis_client:
                pattern = f"{namespace}:*"
                keys = self.redis_client.keys(pattern)
                if keys:
                    self.redis_client.delete(*keys)
            else:
                keys_to_delete = [k for k in self.memory_cache.keys() if k.startswith(f"{namespace}:")]
                for key in keys_to_delete:
                    del self.memory_cache[key]
            
            return True
            
        except Exception as e:
            logger.error(f"Cache clear namespace error: {e}")
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        total_requests = self.cache_stats['hits'] + self.cache_stats['misses']
        hit_rate = (self.cache_stats['hits'] / total_requests * 100) if total_requests > 0 else 0
        
        return {
            **self.cache_stats,
            'hit_rate': round(hit_rate, 2),
            'total_requests': total_requests,
            'backend': 'redis' if self.redis_client else 'memory'
        }

class SmartRateLimiter:
    """
    Intelligent rate limiting with adaptive thresholds and user-based limits.
    """
    
    def __init__(self, app: Flask = None):
        self.app = app
        self.redis_client = None
        self.rate_limits = {
            'default': {'requests': 100, 'window': 3600},  # 100 requests per hour
            'api': {'requests': 1000, 'window': 3600},     # 1000 API calls per hour
            'auth': {'requests': 10, 'window': 900},       # 10 auth attempts per 15 min
            'premium': {'requests': 5000, 'window': 3600}, # Premium users
        }
        
        if app:
            self.init_app(app)
    
    def init_app(self, app: Flask):
        """Initialize rate limiter with Flask app."""
        self.app = app
        
        try:
            redis_url = app.config.get('REDIS_URL', 'redis://localhost:6379/0')
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            self.redis_client.ping()
            logger.info("Connected to Redis for rate limiting")
        except Exception as e:
            logger.warning(f"Redis not available for rate limiting: {e}")
            self.redis_client = None
    
    def _get_client_id(self) -> str:
        """Get client identifier for rate limiting."""
        # Try to get user ID if authenticated
        if hasattr(g, 'current_user') and g.current_user:
            return f"user:{g.current_user.id}"
        
        # Fall back to IP address
        return f"ip:{get_remote_address()}"
    
    def _get_rate_limit(self, endpoint: str, user_tier: str = 'default') -> Dict[str, int]:
        """Get rate limit for endpoint and user tier."""
        if endpoint in self.rate_limits:
            base_limit = self.rate_limits[endpoint]
        else:
            base_limit = self.rate_limits['default']
        
        # Adjust for user tier
        if user_tier == 'premium':
            return self.rate_limits['premium']
        elif user_tier == 'basic':
            return {
                'requests': base_limit['requests'] * 2,
                'window': base_limit['window']
            }
        
        return base_limit
    
    def is_allowed(self, endpoint: str = 'default', user_tier: str = 'default') -> Dict[str, Any]:
        """Check if request is allowed under rate limit."""
        client_id = self._get_client_id()
        rate_limit = self._get_rate_limit(endpoint, user_tier)
        
        key = f"rate_limit:{endpoint}:{client_id}"
        window = rate_limit['window']
        limit = rate_limit['requests']
        
        try:
            if self.redis_client:
                # Use Redis sliding window
                now = time.time()
                pipeline = self.redis_client.pipeline()
                
                # Remove old entries
                pipeline.zremrangebyscore(key, 0, now - window)
                
                # Count current requests
                pipeline.zcard(key)
                
                # Add current request
                pipeline.zadd(key, {str(now): now})
                
                # Set expiration
                pipeline.expire(key, window)
                
                results = pipeline.execute()
                current_requests = results[1]
                
                if current_requests >= limit:
                    return {
                        'allowed': False,
                        'limit': limit,
                        'remaining': 0,
                        'reset_time': now + window
                    }
                
                return {
                    'allowed': True,
                    'limit': limit,
                    'remaining': limit - current_requests - 1,
                    'reset_time': now + window
                }
            
            else:
                # Fallback to simple in-memory tracking
                return {
                    'allowed': True,
                    'limit': limit,
                    'remaining': limit - 1,
                    'reset_time': time.time() + window
                }
                
        except Exception as e:
            logger.error(f"Rate limiting error: {e}")
            # Allow request on error
            return {
                'allowed': True,
                'limit': limit,
                'remaining': limit - 1,
                'reset_time': time.time() + window
            }

def cached(timeout: int = 300, namespace: str = 'default', key_func: Optional[Callable] = None):
    """
    Decorator for caching function results.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(g, 'cache'):
                return f(*args, **kwargs)
            
            # Generate cache key
            if key_func:
                cache_key = key_func(*args, **kwargs)
            else:
                # Default key generation
                key_parts = [f.__name__]
                key_parts.extend(str(arg) for arg in args)
                key_parts.extend(f"{k}:{v}" for k, v in sorted(kwargs.items()))
                cache_key = hashlib.md5(':'.join(key_parts).encode()).hexdigest()
            
            # Try to get from cache
            result = g.cache.get(cache_key, namespace)
            if result is not None:
                return result
            
            # Execute function and cache result
            result = f(*args, **kwargs)
            g.cache.set(cache_key, result, timeout, namespace)
            
            return result
        
        return decorated_function
    return decorator

def rate_limited(endpoint: str = 'default'):
    """
    Decorator for rate limiting endpoints.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(g, 'rate_limiter'):
                return f(*args, **kwargs)
            
            # Get user tier if available
            user_tier = 'default'
            if hasattr(g, 'current_user') and g.current_user:
                user_tier = getattr(g.current_user, 'subscription_tier', 'default')
            
            # Check rate limit
            limit_result = g.rate_limiter.is_allowed(endpoint, user_tier)
            
            if not limit_result['allowed']:
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'limit': limit_result['limit'],
                    'reset_time': limit_result['reset_time']
                }), 429
            
            # Add rate limit headers
            response = f(*args, **kwargs)
            if hasattr(response, 'headers'):
                response.headers['X-RateLimit-Limit'] = str(limit_result['limit'])
                response.headers['X-RateLimit-Remaining'] = str(limit_result['remaining'])
                response.headers['X-RateLimit-Reset'] = str(int(limit_result['reset_time']))
            
            return response
        
        return decorated_function
    return decorator

class PerformanceOptimizer:
    """
    Main performance optimization manager.
    """
    
    def __init__(self, app: Flask = None):
        self.app = app
        self.db_pool = None
        self.cache = None
        self.rate_limiter = None
        
        if app:
            self.init_app(app)
    
    def init_app(self, app: Flask):
        """Initialize performance optimizations with Flask app."""
        self.app = app
        
        # Initialize database connection pool
        db_path = app.config.get('SQLALCHEMY_DATABASE_URI', 'sqlite:///app.db')
        if db_path.startswith('sqlite:///'):
            db_file = db_path.replace('sqlite:///', '')
            pool_size = app.config.get('DB_POOL_SIZE', 10)
            self.db_pool = DatabaseConnectionPool(db_file, pool_size)
            logger.info(f"Initialized database connection pool with {pool_size} connections")
        
        # Initialize advanced cache
        self.cache = AdvancedCache(app)
        
        # Initialize smart rate limiter
        self.rate_limiter = SmartRateLimiter(app)
        
        # Add to Flask g object for easy access
        @app.before_request
        def before_request():
            g.db_pool = self.db_pool
            g.cache = self.cache
            g.rate_limiter = self.rate_limiter
        
        # Add performance monitoring endpoint
        @app.route('/api/performance/stats')
        def performance_stats():
            stats = {
                'cache': self.cache.get_stats() if self.cache else None,
                'database_pool': {
                    'size': len(self.db_pool.connections) if self.db_pool else 0,
                    'available': len(self.db_pool.connections) if self.db_pool else 0
                },
                'timestamp': datetime.utcnow().isoformat()
            }
            return jsonify(stats)
        
        logger.info("Performance optimization system initialized")
    
    def cleanup(self):
        """Clean up resources."""
        if self.db_pool:
            self.db_pool.close_all()
        logger.info("Performance optimization cleanup completed")

# Global instance
performance_optimizer = PerformanceOptimizer()

# Export key components
__all__ = [
    'PerformanceOptimizer',
    'DatabaseConnectionPool',
    'AdvancedCache',
    'SmartRateLimiter',
    'cached',
    'rate_limited',
    'performance_optimizer'
]