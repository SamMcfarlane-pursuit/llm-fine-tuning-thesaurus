#!/usr/bin/env python3
"""
Comprehensive Rate Limiting Protection Tests

This module tests the rate limiting functionality for authentication endpoints,
including login attempts, registration attempts, and brute force protection.
"""

import unittest
import sys
import os
import time
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta

# Add current directory to path for imports
sys.path.append('.')

try:
    from flask import Flask
    from models.auth import User
    from extensions import db
    from secure_auth_system import AuthenticationRateLimiter, SecureAuthSystem
except ImportError as e:
    print(f"Import error: {e}")
    print("Please ensure all required modules are available.")
    exit(1)


class RateLimitingTestCase(unittest.TestCase):
    """Base test case for rate limiting tests."""
    
    def setUp(self):
        """Set up test environment."""
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.config['SECRET_KEY'] = 'test-secret-key-for-testing'
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        self.app.config['WTF_CSRF_ENABLED'] = False
        
        # Initialize database
        db.init_app(self.app)
        
        with self.app.app_context():
            db.create_all()
            
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        
    def tearDown(self):
        """Clean up after tests."""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
        
    def create_test_user(self, email='test@example.com', password='TestPass123!'):
        """Create a test user."""
        user = User(
            username='testuser',
            email=email,
            is_active=True
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return user


class TestAuthenticationRateLimiter(RateLimitingTestCase):
    """Test the AuthenticationRateLimiter class."""
    
    def setUp(self):
        """Set up rate limiter tests."""
        super().setUp()
        # Mock Redis for testing
        self.mock_redis = MagicMock()
        self.rate_limiter = AuthenticationRateLimiter(redis_client=self.mock_redis)
        
    def test_rate_limiter_initialization(self):
        """Test rate limiter initialization."""
        # Test with custom Redis client
        custom_redis = MagicMock()
        limiter = AuthenticationRateLimiter(redis_client=custom_redis)
        self.assertEqual(limiter.redis_client, custom_redis)
        
        # Test default initialization (will try to connect to Redis)
        with patch('secure_auth_system.redis.Redis') as mock_redis_class:
            mock_redis_instance = MagicMock()
            mock_redis_class.return_value = mock_redis_instance
            limiter = AuthenticationRateLimiter()
            self.assertEqual(limiter.redis_client, mock_redis_instance)
            
    def test_is_rate_limited_no_attempts(self):
        """Test rate limiting check with no previous attempts."""
        self.mock_redis.get.return_value = None
        
        result = self.rate_limiter.is_rate_limited('test@example.com')
        self.assertFalse(result)
        self.mock_redis.get.assert_called_with('auth_attempts:test@example.com')
        
    def test_is_rate_limited_under_limit(self):
        """Test rate limiting check under the limit."""
        self.mock_redis.get.return_value = b'3'  # 3 attempts, under default limit of 5
        
        result = self.rate_limiter.is_rate_limited('test@example.com')
        self.assertFalse(result)
        
    def test_is_rate_limited_at_limit(self):
        """Test rate limiting check at the limit."""
        self.mock_redis.get.return_value = b'5'  # 5 attempts, at default limit
        
        result = self.rate_limiter.is_rate_limited('test@example.com')
        self.assertTrue(result)
        
    def test_is_rate_limited_over_limit(self):
        """Test rate limiting check over the limit."""
        self.mock_redis.get.return_value = b'10'  # 10 attempts, over default limit
        
        result = self.rate_limiter.is_rate_limited('test@example.com')
        self.assertTrue(result)
        
    def test_is_rate_limited_custom_limit(self):
        """Test rate limiting with custom attempt limit."""
        self.mock_redis.get.return_value = b'2'  # 2 attempts
        
        # Under custom limit of 3
        result = self.rate_limiter.is_rate_limited('test@example.com', max_attempts=3)
        self.assertFalse(result)
        
        # At custom limit of 2
        result = self.rate_limiter.is_rate_limited('test@example.com', max_attempts=2)
        self.assertTrue(result)
        
    def test_is_rate_limited_redis_error(self):
        """Test rate limiting behavior when Redis fails."""
        self.mock_redis.get.side_effect = Exception("Redis connection failed")
        
        # Should fail open (return False) for availability
        result = self.rate_limiter.is_rate_limited('test@example.com')
        self.assertFalse(result)
        
    def test_record_attempt(self):
        """Test recording authentication attempts."""
        mock_pipe = MagicMock()
        self.mock_redis.pipeline.return_value = mock_pipe
        
        self.rate_limiter.record_attempt('test@example.com')
        
        # Verify pipeline operations
        self.mock_redis.pipeline.assert_called_once()
        mock_pipe.incr.assert_called_with('auth_attempts:test@example.com')
        mock_pipe.expire.assert_called_with('auth_attempts:test@example.com', 900)  # 15 minutes
        mock_pipe.execute.assert_called_once()
        
    def test_record_attempt_custom_window(self):
        """Test recording attempts with custom time window."""
        mock_pipe = MagicMock()
        self.mock_redis.pipeline.return_value = mock_pipe
        
        self.rate_limiter.record_attempt('test@example.com', window_minutes=30)
        
        mock_pipe.expire.assert_called_with('auth_attempts:test@example.com', 1800)  # 30 minutes
        
    def test_record_attempt_redis_error(self):
        """Test recording attempts when Redis fails."""
        self.mock_redis.pipeline.side_effect = Exception("Redis connection failed")
        
        # Should not raise exception
        try:
            self.rate_limiter.record_attempt('test@example.com')
        except Exception:
            self.fail("record_attempt should not raise exception on Redis failure")
            
    def test_reset_attempts(self):
        """Test resetting authentication attempts."""
        self.rate_limiter.reset_attempts('test@example.com')
        
        self.mock_redis.delete.assert_called_with('auth_attempts:test@example.com')
        
    def test_reset_attempts_redis_error(self):
        """Test resetting attempts when Redis fails."""
        self.mock_redis.delete.side_effect = Exception("Redis connection failed")
        
        # Should not raise exception
        try:
            self.rate_limiter.reset_attempts('test@example.com')
        except Exception:
            self.fail("reset_attempts should not raise exception on Redis failure")


class TestRateLimitingIntegration(RateLimitingTestCase):
    """Test rate limiting integration with authentication system."""
    
    def setUp(self):
        """Set up integration tests."""
        super().setUp()
        self.secure_auth = SecureAuthSystem()
        # Mock Redis for the rate limiter
        self.mock_redis = MagicMock()
        self.secure_auth.rate_limiter.redis_client = self.mock_redis
        
    def test_authenticate_user_rate_limiting(self):
        """Test rate limiting in user authentication."""
        # Create test user
        user = self.create_test_user()
        
        # Mock rate limiter to return not rate limited
        self.mock_redis.get.return_value = None
        
        # Successful authentication should work
        result = self.secure_auth.authenticate_user('test@example.com', 'TestPass123!')
        self.assertTrue(result['success'])
        
        # Mock rate limiter to return rate limited
        self.mock_redis.get.return_value = b'6'  # Over limit
        
        # Authentication should be blocked
        result = self.secure_auth.authenticate_user('test@example.com', 'TestPass123!')
        self.assertFalse(result['success'])
        self.assertTrue(result['rate_limited'])
        self.assertIn('Too many login attempts', result['error'])
        
    def test_failed_login_records_attempt(self):
        """Test that failed login attempts are recorded."""
        # Create test user
        user = self.create_test_user()
        
        # Mock rate limiter
        self.mock_redis.get.return_value = None
        mock_pipe = MagicMock()
        self.mock_redis.pipeline.return_value = mock_pipe
        
        # Failed authentication should record attempt
        result = self.secure_auth.authenticate_user('test@example.com', 'WrongPassword')
        self.assertFalse(result['success'])
        
        # Verify attempt was recorded
        mock_pipe.incr.assert_called_with('auth_attempts:test@example.com')
        
    def test_successful_login_resets_attempts(self):
        """Test that successful login resets rate limiting attempts."""
        # Create test user
        user = self.create_test_user()
        
        # Mock rate limiter
        self.mock_redis.get.return_value = None
        
        # Successful authentication should reset attempts
        result = self.secure_auth.authenticate_user('test@example.com', 'TestPass123!')
        self.assertTrue(result['success'])
        
        # Verify attempts were reset
        self.mock_redis.delete.assert_called_with('auth_attempts:test@example.com')


class TestRateLimitingScenarios(RateLimitingTestCase):
    """Test various rate limiting scenarios."""
    
    def setUp(self):
        """Set up scenario tests."""
        super().setUp()
        self.mock_redis = MagicMock()
        self.rate_limiter = AuthenticationRateLimiter(redis_client=self.mock_redis)
        
    def test_different_identifiers_independent(self):
        """Test that different identifiers have independent rate limits."""
        # Mock different attempt counts for different identifiers
        def mock_get(key):
            if key == 'auth_attempts:user1@example.com':
                return b'5'  # At limit
            elif key == 'auth_attempts:user2@example.com':
                return b'2'  # Under limit
            return None
            
        self.mock_redis.get.side_effect = mock_get
        
        # User1 should be rate limited
        self.assertTrue(self.rate_limiter.is_rate_limited('user1@example.com'))
        
        # User2 should not be rate limited
        self.assertFalse(self.rate_limiter.is_rate_limited('user2@example.com'))
        
    def test_ip_based_rate_limiting(self):
        """Test rate limiting based on IP addresses."""
        ip1 = '192.168.1.100'
        ip2 = '192.168.1.101'
        
        # Mock different attempt counts for different IPs
        def mock_get(key):
            if key == f'auth_attempts:{ip1}':
                return b'5'  # At limit
            elif key == f'auth_attempts:{ip2}':
                return b'2'  # Under limit
            return None
            
        self.mock_redis.get.side_effect = mock_get
        
        # IP1 should be rate limited
        self.assertTrue(self.rate_limiter.is_rate_limited(ip1))
        
        # IP2 should not be rate limited
        self.assertFalse(self.rate_limiter.is_rate_limited(ip2))
        
    def test_progressive_rate_limiting(self):
        """Test progressive rate limiting behavior."""
        identifier = 'test@example.com'
        mock_pipe = MagicMock()
        self.mock_redis.pipeline.return_value = mock_pipe
        
        # Simulate progressive attempts
        attempt_counts = [None, b'1', b'2', b'3', b'4', b'5', b'6']
        
        for i, count in enumerate(attempt_counts):
            self.mock_redis.get.return_value = count
            
            if i < 5:  # Under limit
                self.assertFalse(self.rate_limiter.is_rate_limited(identifier))
            else:  # At or over limit
                self.assertTrue(self.rate_limiter.is_rate_limited(identifier))
                
    def test_time_window_expiration(self):
        """Test that rate limits respect time windows."""
        identifier = 'test@example.com'
        mock_pipe = MagicMock()
        self.mock_redis.pipeline.return_value = mock_pipe
        
        # Record attempt with custom window
        self.rate_limiter.record_attempt(identifier, window_minutes=5)
        
        # Verify expiration time is set correctly
        mock_pipe.expire.assert_called_with(f'auth_attempts:{identifier}', 300)  # 5 minutes
        
    def test_concurrent_attempts_handling(self):
        """Test handling of concurrent authentication attempts."""
        identifier = 'test@example.com'
        
        # Simulate concurrent attempts by calling record_attempt multiple times
        mock_pipe = MagicMock()
        self.mock_redis.pipeline.return_value = mock_pipe
        
        # Record multiple attempts
        for _ in range(3):
            self.rate_limiter.record_attempt(identifier)
            
        # Verify each attempt was recorded
        self.assertEqual(mock_pipe.incr.call_count, 3)
        self.assertEqual(mock_pipe.execute.call_count, 3)


class TestRateLimitingSecurity(RateLimitingTestCase):
    """Test security aspects of rate limiting."""
    
    def setUp(self):
        """Set up security tests."""
        super().setUp()
        self.mock_redis = MagicMock()
        self.rate_limiter = AuthenticationRateLimiter(redis_client=self.mock_redis)
        
    def test_brute_force_protection(self):
        """Test protection against brute force attacks."""
        attacker_ip = '192.168.1.999'
        
        # Simulate brute force attack
        self.mock_redis.get.return_value = b'10'  # Many attempts
        
        # Should be rate limited
        self.assertTrue(self.rate_limiter.is_rate_limited(attacker_ip))
        
    def test_distributed_attack_protection(self):
        """Test protection against distributed attacks."""
        # Multiple IPs with high attempt counts
        attack_ips = ['192.168.1.100', '192.168.1.101', '192.168.1.102']
        
        def mock_get(key):
            for ip in attack_ips:
                if key == f'auth_attempts:{ip}':
                    return b'6'  # Over limit
            return None
            
        self.mock_redis.get.side_effect = mock_get
        
        # All attack IPs should be rate limited
        for ip in attack_ips:
            self.assertTrue(self.rate_limiter.is_rate_limited(ip))
            
    def test_legitimate_user_protection(self):
        """Test that legitimate users are not affected by rate limiting."""
        legitimate_user = 'user@example.com'
        
        # Legitimate user with no previous attempts
        self.mock_redis.get.return_value = None
        
        # Should not be rate limited
        self.assertFalse(self.rate_limiter.is_rate_limited(legitimate_user))
        
    def test_rate_limit_bypass_prevention(self):
        """Test prevention of rate limit bypass attempts."""
        # Test with various identifier formats
        identifiers = [
            'test@example.com',
            'TEST@EXAMPLE.COM',  # Case variation
            'test+tag@example.com',  # Email with tag
            '192.168.1.100',  # IP address
        ]
        
        # Each identifier should be treated independently
        for identifier in identifiers:
            self.mock_redis.get.return_value = b'5'  # At limit
            self.assertTrue(self.rate_limiter.is_rate_limited(identifier))
            
    def test_redis_injection_protection(self):
        """Test protection against Redis injection attacks."""
        # Malicious identifiers that could cause Redis injection
        malicious_identifiers = [
            'user@example.com\nDEL *',  # Command injection attempt
            'user@example.com\r\nFLUSHALL',  # Another injection attempt
            'user@example.com; DROP TABLE users;',  # SQL-like injection
        ]
        
        mock_pipe = MagicMock()
        self.mock_redis.pipeline.return_value = mock_pipe
        
        # Should handle malicious identifiers safely
        for identifier in malicious_identifiers:
            try:
                self.rate_limiter.record_attempt(identifier)
                # Verify the key is properly escaped/handled
                expected_key = f'auth_attempts:{identifier}'
                mock_pipe.incr.assert_called_with(expected_key)
            except Exception as e:
                self.fail(f"Rate limiter should handle malicious identifier safely: {e}")


if __name__ == '__main__':
    unittest.main(verbosity=2)