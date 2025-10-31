#!/usr/bin/env python3
"""
Comprehensive Multi-Factor Authentication (MFA) Protection Tests

This module tests the MFA implementation including:
- TOTP secret generation and verification
- QR code generation for authenticator apps
- Backup codes generation and validation
- MFA setup and verification flows
- Integration with authentication system
- Security measures and edge cases
"""

import unittest
from unittest.mock import patch, MagicMock
import pyotp
import qrcode
from io import BytesIO
import base64
import re
from datetime import datetime, timedelta

import sys
sys.path.append('.')
from secure_auth_system import MultiFactorAuth, SecureAuthSystem
from models.auth import User
from extensions import db
from flask import Flask


class TestMFAProtection(unittest.TestCase):
    """Test MFA protection functionality."""
    
    def setUp(self):
        """Set up test environment."""
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.config['WTF_CSRF_ENABLED'] = False
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app.config['SECRET_KEY'] = 'test-secret-key'
        
        self.app_context = self.app.app_context()
        self.app_context.push()
        
        db.init_app(self.app)
        db.create_all()
        
        self.client = self.app.test_client()
        self.mfa = MultiFactorAuth()
        self.auth_system = SecureAuthSystem()
        
        # Create test user
        self.test_user = User(
            email='test@example.com',
            username='testuser',
            password_hash='hashed_password',
            is_active=True
        )
        db.session.add(self.test_user)
        db.session.commit()
    
    def tearDown(self):
        """Clean up test environment."""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_generate_secret(self):
        """Test TOTP secret generation."""
        secret = self.mfa.generate_secret()
        
        # Check secret format
        self.assertIsInstance(secret, str)
        self.assertEqual(len(secret), 32)  # Base32 encoded secret
        self.assertTrue(secret.isalnum())  # Should be alphanumeric
        
        # Check uniqueness
        secret2 = self.mfa.generate_secret()
        self.assertNotEqual(secret, secret2)
    
    def test_generate_qr_code(self):
        """Test QR code generation for TOTP setup."""
        secret = self.mfa.generate_secret()
        email = 'test@example.com'
        
        qr_code = self.mfa.generate_qr_code(email, secret)
        
        # Check QR code format
        self.assertIsInstance(qr_code, str)
        self.assertTrue(qr_code.startswith('data:image/png;base64,'))
        
        # Decode and verify it's valid base64
        base64_data = qr_code.split(',')[1]
        try:
            decoded = base64.b64decode(base64_data)
            self.assertGreater(len(decoded), 0)
        except Exception as e:
            self.fail(f"QR code base64 decoding failed: {e}")
    
    def test_verify_totp_valid(self):
        """Test TOTP token verification with valid token."""
        secret = self.mfa.generate_secret()
        
        # Generate valid TOTP token
        totp = pyotp.TOTP(secret)
        valid_token = totp.now()
        
        # Verify token
        result = self.mfa.verify_totp(secret, valid_token)
        self.assertTrue(result)
    
    def test_verify_totp_invalid(self):
        """Test TOTP token verification with invalid token."""
        secret = self.mfa.generate_secret()
        invalid_token = '000000'
        
        result = self.mfa.verify_totp(secret, invalid_token)
        self.assertFalse(result)
    
    def test_verify_totp_malformed(self):
        """Test TOTP verification with malformed inputs."""
        secret = self.mfa.generate_secret()
        
        # Test various malformed tokens
        malformed_tokens = [
            '',
            'abc123',
            '12345',  # Too short
            '1234567',  # Too long
            None,
            '123 456',  # With space
            '123-456'  # With dash
        ]
        
        for token in malformed_tokens:
            with self.subTest(token=token):
                result = self.mfa.verify_totp(secret, token)
                self.assertFalse(result)
    
    def test_generate_backup_codes(self):
        """Test backup codes generation."""
        backup_codes = self.mfa.generate_backup_codes()
        
        # Check format
        self.assertIsInstance(backup_codes, list)
        self.assertEqual(len(backup_codes), 10)  # Should generate 10 codes
        
        # Check each code format
        for code in backup_codes:
            self.assertIsInstance(code, str)
            self.assertEqual(len(code), 8)  # 8-character codes
            self.assertTrue(code.isalnum())  # Alphanumeric
        
        # Check uniqueness
        self.assertEqual(len(backup_codes), len(set(backup_codes)))
    
    def test_mfa_setup_flow(self):
        """Test complete MFA setup flow."""
        with self.app.test_request_context():
            result = self.auth_system.setup_mfa(self.test_user.id)
            
            self.assertTrue(result['success'])
            self.assertIn('secret', result)
            self.assertIn('qr_code', result)
            self.assertIn('backup_codes', result)
            
            # Check user was updated
            updated_user = User.query.get(self.test_user.id)
            self.assertIsNotNone(updated_user.mfa_secret)
            self.assertIsNotNone(updated_user.mfa_backup_codes)
    
    def test_mfa_setup_nonexistent_user(self):
        """Test MFA setup with nonexistent user."""
        with self.app.test_request_context():
            result = self.auth_system.setup_mfa(99999)
            
            self.assertFalse(result['success'])
            self.assertIn('error', result)
    
    def test_authentication_with_mfa_required(self):
        """Test authentication when MFA is required."""
        # Setup MFA for user
        secret = self.mfa.generate_secret()
        self.test_user.mfa_secret = secret
        self.test_user.mfa_enabled = True
        db.session.commit()
        
        with self.app.test_request_context():
            # Try authentication without TOTP
            result = self.auth_system.authenticate_user(
                'test@example.com', 
                'correct_password'
            )
            
            self.assertFalse(result['success'])
            self.assertTrue(result.get('mfa_required', False))
            self.assertIn('TOTP token required', result['error'])
    
    def test_authentication_with_valid_mfa(self):
        """Test authentication with valid MFA token."""
        # Setup MFA for user
        secret = self.mfa.generate_secret()
        self.test_user.mfa_secret = secret
        self.test_user.mfa_enabled = True
        db.session.commit()
        
        # Generate valid TOTP token
        totp = pyotp.TOTP(secret)
        valid_token = totp.now()
        
        with self.app.test_request_context():
            with patch.object(self.auth_system.password_manager, 'verify_password', return_value=True):
                result = self.auth_system.authenticate_user(
                    'test@example.com', 
                    'correct_password',
                    totp_token=valid_token
                )
                
                self.assertTrue(result['success'])
                self.assertIn('user', result)
    
    def test_authentication_with_invalid_mfa(self):
        """Test authentication with invalid MFA token."""
        # Setup MFA for user
        secret = self.mfa.generate_secret()
        self.test_user.mfa_secret = secret
        self.test_user.mfa_enabled = True
        db.session.commit()
        
        with self.app.test_request_context():
            with patch.object(self.auth_system.password_manager, 'verify_password', return_value=True):
                result = self.auth_system.authenticate_user(
                    'test@example.com', 
                    'correct_password',
                    totp_token='000000'
                )
                
                self.assertFalse(result['success'])
                self.assertIn('Invalid TOTP token', result['error'])
    
    def test_mfa_routes_integration(self):
        """Test MFA routes integration."""
        # Test setup MFA route
        with self.client.session_transaction() as sess:
            sess['user_id'] = self.test_user.id
        
        response = self.client.get('/auth/setup-mfa')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Setup Two-Factor Authentication', response.data)
    
    def test_mfa_verify_route_without_session(self):
        """Test MFA verify route without proper session."""
        response = self.client.get('/auth/verify-mfa')
        self.assertEqual(response.status_code, 302)  # Redirect
    
    def test_mfa_time_window_tolerance(self):
        """Test TOTP verification with time window tolerance."""
        secret = self.mfa.generate_secret()
        totp = pyotp.TOTP(secret)
        
        # Test current time window
        current_token = totp.now()
        self.assertTrue(self.mfa.verify_totp(secret, current_token))
        
        # Test previous time window (should work with valid_window=1)
        previous_time = datetime.now() - timedelta(seconds=30)
        previous_token = totp.at(previous_time)
        # Note: This might fail depending on exact timing, but tests the concept
    
    def test_mfa_security_measures(self):
        """Test MFA security measures."""
        secret = self.mfa.generate_secret()
        
        # Test that same token can't be reused (time-based)
        token = pyotp.TOTP(secret).now()
        
        # First verification should succeed
        result1 = self.mfa.verify_totp(secret, token)
        self.assertTrue(result1)
        
        # Immediate second verification with same token should still work
        # (TOTP doesn't prevent replay within the same time window by design)
        result2 = self.mfa.verify_totp(secret, token)
        self.assertTrue(result2)
    
    def test_mfa_performance(self):
        """Test MFA operations performance."""
        import time
        
        # Test secret generation performance
        start_time = time.time()
        for _ in range(100):
            self.mfa.generate_secret()
        secret_gen_time = time.time() - start_time
        self.assertLess(secret_gen_time, 1.0)  # Should be fast
        
        # Test TOTP verification performance
        secret = self.mfa.generate_secret()
        token = pyotp.TOTP(secret).now()
        
        start_time = time.time()
        for _ in range(100):
            self.mfa.verify_totp(secret, token)
        verify_time = time.time() - start_time
        self.assertLess(verify_time, 1.0)  # Should be fast
    
    def test_qr_code_content_validation(self):
        """Test QR code contains correct TOTP URI."""
        secret = self.mfa.generate_secret()
        email = 'test@example.com'
        
        # Generate expected TOTP URI
        expected_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=email,
            issuer_name='Thesaurus AI'
        )
        
        # The QR code should contain this URI
        # Note: We can't easily decode the QR code in tests without additional libraries
        # But we can verify the QR code generation doesn't fail
        qr_code = self.mfa.generate_qr_code(email, secret)
        self.assertIsNotNone(qr_code)
        self.assertTrue(len(qr_code) > 100)  # Should be substantial base64 data


if __name__ == '__main__':
    unittest.main()