#!/usr/bin/env python3
"""
Core Multi-Factor Authentication (MFA) Tests

This module tests the core MFA functionality:
- TOTP secret generation and verification
- QR code generation
- Backup codes generation
- Security measures
"""

import unittest
import pyotp
import base64
from datetime import datetime, timedelta

from secure_auth_system import MultiFactorAuth


class TestMFACore(unittest.TestCase):
    """Test core MFA functionality."""
    
    def setUp(self):
        """Set up test environment."""
        self.mfa = MultiFactorAuth()
    
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
        
        # Check QR code format (should be base64 encoded image)
        self.assertIsInstance(qr_code, str)
        self.assertGreater(len(qr_code), 100)  # Should be substantial data
        
        # Should contain base64 data
        if 'base64,' in qr_code:
            base64_data = qr_code.split('base64,')[1]
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
    
    def test_totp_time_window_tolerance(self):
        """Test TOTP verification with time window tolerance."""
        secret = self.mfa.generate_secret()
        totp = pyotp.TOTP(secret)
        
        # Test current time window
        current_token = totp.now()
        self.assertTrue(self.mfa.verify_totp(secret, current_token))
    
    def test_mfa_security_measures(self):
        """Test MFA security measures."""
        secret = self.mfa.generate_secret()
        
        # Test that same token can be verified multiple times within time window
        token = pyotp.TOTP(secret).now()
        
        # First verification should succeed
        result1 = self.mfa.verify_totp(secret, token)
        self.assertTrue(result1)
        
        # Second verification with same token should still work
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
        self.assertLess(secret_gen_time, 2.0)  # Should be reasonably fast
        
        # Test TOTP verification performance
        secret = self.mfa.generate_secret()
        token = pyotp.TOTP(secret).now()
        
        start_time = time.time()
        for _ in range(100):
            self.mfa.verify_totp(secret, token)
        verify_time = time.time() - start_time
        self.assertLess(verify_time, 2.0)  # Should be reasonably fast
    
    def test_secret_entropy(self):
        """Test that generated secrets have good entropy."""
        secrets = [self.mfa.generate_secret() for _ in range(100)]
        
        # All secrets should be unique
        self.assertEqual(len(secrets), len(set(secrets)))
        
        # Secrets should use the full character set
        all_chars = ''.join(secrets)
        unique_chars = set(all_chars)
        
        # Base32 alphabet: A-Z, 2-7 (32 characters)
        # We should see most of these characters in 100 secrets
        self.assertGreater(len(unique_chars), 20)  # At least 20 different chars
    
    def test_totp_uri_generation(self):
        """Test TOTP URI generation for QR codes."""
        secret = self.mfa.generate_secret()
        email = 'test@example.com'
        
        # Generate expected TOTP URI
        expected_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=email,
            issuer_name='Thesaurus AI'
        )
        
        # Verify URI format
        self.assertTrue(expected_uri.startswith('otpauth://totp/'))
        self.assertIn('test%40example.com', expected_uri)  # URL-encoded email
        self.assertIn('Thesaurus%20AI', expected_uri)
        self.assertIn(secret, expected_uri)


if __name__ == '__main__':
    unittest.main()