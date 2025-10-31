#!/usr/bin/env python3
"""
XSS Protection Test Suite

This module tests XSS protection implementation including input sanitization and CSP headers.
"""

import unittest
from unittest.mock import patch, MagicMock
import os
import sys

# Add the project root to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from secure_auth_system import InputSanitizer
from markupsafe import escape

class TestInputSanitization(unittest.TestCase):
    """Test input sanitization for XSS protection."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.sanitizer = InputSanitizer()
    
    def test_html_sanitization_basic(self):
        """Test basic HTML sanitization."""
        malicious_html = '<script>alert("XSS")</script><p>Safe content</p>'
        sanitized = self.sanitizer.sanitize_html(malicious_html)
        
        # Script tags should be removed
        self.assertNotIn('<script>', sanitized)
        self.assertNotIn('</script>', sanitized)
        
        # Safe content should remain
        self.assertIn('Safe content', sanitized)
        # Text content from script tags is preserved (this is expected behavior)
        self.assertIn('alert', sanitized)
    
    def test_html_sanitization_advanced(self):
        """Test advanced HTML sanitization scenarios."""
        test_cases = [
            {
                'input': '<img src="x" onerror="alert(1)">',
                'should_not_contain': ['<img', 'onerror'],
                'may_contain': ['alert']  # Text content preserved
            },
            {
                'input': '<a href="javascript:alert(1)">Click me</a>',
                'should_not_contain': ['javascript:'],
                'may_contain': ['alert', 'Click me']  # Text content and safe links preserved
            },
            {
                'input': '<div onclick="malicious()">Content</div>',
                'should_not_contain': ['<div', 'onclick'],
                'may_contain': ['malicious', 'Content']  # Text content preserved
            },
            {
                'input': '<iframe src="evil.com"></iframe>',
                'should_not_contain': ['<iframe', '</iframe>'],
                'may_contain': ['evil.com']  # Text content preserved
            }
        ]
        
        for case in test_cases:
            sanitized = self.sanitizer.sanitize_html(case['input'])
            for forbidden in case['should_not_contain']:
                self.assertNotIn(forbidden, sanitized, 
                    f"Forbidden content '{forbidden}' found in sanitized output: {sanitized}")
    
    def test_text_sanitization(self):
        """Test text sanitization for XSS protection."""
        malicious_texts = [
            '<script>alert("XSS")</script>',
            '<img src=x onerror=alert(1)>',
            '&lt;script&gt;alert(1)&lt;/script&gt;',
            '<svg onload=alert(1)>'
        ]
        
        for text in malicious_texts:
            sanitized = self.sanitizer.sanitize_text(text)
            
            # Should escape HTML entities
            self.assertNotIn('<script>', sanitized)
            self.assertNotIn('<img', sanitized)
            self.assertNotIn('<svg', sanitized)
            
            # Should contain escaped versions
            if '<' in text and not text.startswith('&lt;'):
                self.assertIn('&lt;', sanitized)
    
    def test_email_validation_xss(self):
        """Test email validation against XSS attempts."""
        malicious_emails = [
            'user@domain.com<script>alert(1)</script>',
            'user+<script>@domain.com',
            'user@domain.com"><script>alert(1)</script>',
            'javascript:alert(1)@domain.com'
        ]
        
        for email in malicious_emails:
            is_valid = self.sanitizer.validate_email(email)
            self.assertFalse(is_valid, f"Malicious email '{email}' was incorrectly validated as valid")
    
    def test_username_validation_xss(self):
        """Test username validation against XSS attempts."""
        malicious_usernames = [
            'user<script>alert(1)</script>',
            'user"><script>',
            'user&lt;script&gt;',
            'user javascript:alert(1)'
        ]
        
        for username in malicious_usernames:
            is_valid = self.sanitizer.validate_username(username)
            self.assertFalse(is_valid, f"Malicious username '{username}' was incorrectly validated as valid")
    
    def test_empty_and_none_inputs(self):
        """Test sanitization with empty and None inputs."""
        # Test empty strings
        self.assertEqual(self.sanitizer.sanitize_html(''), '')
        self.assertEqual(self.sanitizer.sanitize_text(''), '')
        
        # Test None inputs
        self.assertEqual(self.sanitizer.sanitize_html(None), '')
        self.assertEqual(self.sanitizer.sanitize_text(None), '')
        
        # Test validation with empty inputs
        self.assertFalse(self.sanitizer.validate_email(''))
        self.assertFalse(self.sanitizer.validate_username(''))
        self.assertFalse(self.sanitizer.validate_email(None))
        self.assertFalse(self.sanitizer.validate_username(None))

class TestCSPHeaders(unittest.TestCase):
    """Test Content Security Policy headers."""
    
    def setUp(self):
        """Set up test fixtures."""
        try:
            from app_production_ready import app
            self.app = app
            self.client = self.app.test_client()
            self.app_context = self.app.app_context()
            self.app_context.push()
        except ImportError:
            self.skipTest("Production app not available")
    
    def tearDown(self):
        """Clean up after tests."""
        if hasattr(self, 'app_context'):
            self.app_context.pop()
    
    def test_csp_headers_present(self):
        """Test that CSP headers are present in responses."""
        response = self.client.get('/')
        
        # Check if CSP header is present
        csp_header = response.headers.get('Content-Security-Policy')
        self.assertIsNotNone(csp_header, "Content-Security-Policy header is missing")
    
    def test_csp_default_src_policy(self):
        """Test default-src CSP policy."""
        response = self.client.get('/')
        csp_header = response.headers.get('Content-Security-Policy', '')
        
        # Should have default-src 'self'
        self.assertIn("default-src 'self'", csp_header)
    
    def test_csp_script_src_policy(self):
        """Test script-src CSP policy."""
        response = self.client.get('/')
        csp_header = response.headers.get('Content-Security-Policy', '')
        
        # Should restrict script sources
        self.assertIn('script-src', csp_header)
        self.assertIn("'self'", csp_header)
    
    def test_csp_style_src_policy(self):
        """Test style-src CSP policy."""
        response = self.client.get('/')
        csp_header = response.headers.get('Content-Security-Policy', '')
        
        # Should restrict style sources
        self.assertIn('style-src', csp_header)
        self.assertIn("'self'", csp_header)
    
    def test_csp_img_src_policy(self):
        """Test img-src CSP policy."""
        response = self.client.get('/')
        csp_header = response.headers.get('Content-Security-Policy', '')
        
        # Should have img-src policy
        self.assertIn('img-src', csp_header)
    
    def test_other_security_headers(self):
        """Test other security headers provided by Talisman."""
        response = self.client.get('/')
        
        # Check for X-Frame-Options
        x_frame_options = response.headers.get('X-Frame-Options')
        if x_frame_options:
            self.assertIn(x_frame_options.upper(), ['DENY', 'SAMEORIGIN'])
        
        # Check for X-Content-Type-Options
        x_content_type = response.headers.get('X-Content-Type-Options')
        if x_content_type:
            self.assertEqual(x_content_type, 'nosniff')

class TestXSSIntegration(unittest.TestCase):
    """Test XSS protection integration."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test-secret-key'
        self.app.config['TESTING'] = True
        
        self.sanitizer = InputSanitizer()
        
        @self.app.route('/test-form', methods=['GET', 'POST'])
        def test_form():
            from flask import request
            if request.method == 'POST':
                user_input = request.form.get('user_input', '')
                sanitized_input = self.sanitizer.sanitize_text(user_input)
                return f'Sanitized: {sanitized_input}'
            return '''
            <form method="POST">
                <input type="text" name="user_input" />
                <input type="submit" value="Submit">
            </form>
            '''
        
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
    
    def tearDown(self):
        """Clean up after tests."""
        self.app_context.pop()
    
    def test_form_input_sanitization(self):
        """Test that form inputs are properly sanitized."""
        malicious_input = '<script>alert("XSS")</script>'
        
        response = self.client.post('/test-form', data={'user_input': malicious_input})
        
        # Should not contain the raw script tag
        self.assertNotIn('<script>', response.get_data(as_text=True))
        
        # Should contain escaped version
        self.assertIn('&lt;script&gt;', response.get_data(as_text=True))
    
    def test_multiple_xss_vectors(self):
        """Test protection against multiple XSS attack vectors."""
        xss_vectors = [
            '<img src=x onerror=alert(1)>',
            '<svg onload=alert(1)>',
            '<iframe src=javascript:alert(1)></iframe>',
            '<object data=javascript:alert(1)></object>',
            '<embed src=javascript:alert(1)>'
        ]
        
        for vector in xss_vectors:
            response = self.client.post('/test-form', data={'user_input': vector})
            response_text = response.get_data(as_text=True)
            
            # Should not contain dangerous elements
            dangerous_elements = ['<img', '<svg', '<iframe', '<object', '<embed']
            for element in dangerous_elements:
                if element in vector:
                    self.assertNotIn(element, response_text, 
                        f"Dangerous element '{element}' found in response for vector: {vector}")

class TestXSSPerformance(unittest.TestCase):
    """Test XSS protection performance."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.sanitizer = InputSanitizer()
    
    def test_sanitization_performance(self):
        """Test that sanitization doesn't significantly impact performance."""
        import time
        
        # Large input to test performance
        large_input = '<p>Safe content</p>' * 1000 + '<script>alert(1)</script>' * 100
        
        start_time = time.time()
        sanitized = self.sanitizer.sanitize_html(large_input)
        end_time = time.time()
        
        # Should complete within reasonable time (1 second)
        self.assertLess(end_time - start_time, 1.0, "Sanitization took too long")
        
        # Should still be effective
        self.assertNotIn('<script>', sanitized)
        self.assertIn('Safe content', sanitized)

if __name__ == '__main__':
    # Run the tests
    unittest.main(verbosity=2)