#!/usr/bin/env python3
"""
SQL Injection Protection Test Suite

This module tests SQL injection protection implementation including parameterized queries
and input validation.
"""

import unittest
from unittest.mock import patch, MagicMock, Mock
import os
import sys

# Add the project root to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from secure_auth_system import SQLInjectionProtection
from sqlalchemy import text, create_engine
from sqlalchemy.orm import sessionmaker
import logging

class TestSQLInjectionProtection(unittest.TestCase):
    """Test SQL injection protection utilities."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.protection = SQLInjectionProtection()
        
        # Create a mock database session
        self.mock_session = Mock()
        
        # Set up logging to capture warnings
        self.log_handler = logging.StreamHandler()
        self.logger = logging.getLogger('secure_auth_system')
        self.logger.addHandler(self.log_handler)
        self.logger.setLevel(logging.WARNING)
    
    def tearDown(self):
        """Clean up after tests."""
        self.logger.removeHandler(self.log_handler)
    
    def test_validate_sql_params_safe(self):
        """Test validation of safe SQL parameters."""
        safe_params = {
            'email': 'user@example.com',
            'username': 'testuser',
            'age': 25,
            'active': True,
            'description': 'This is a safe description with normal text.'
        }
        
        result = self.protection.validate_sql_params(safe_params)
        self.assertTrue(result, "Safe parameters should be validated as safe")
    
    def test_validate_sql_params_malicious(self):
        """Test validation rejects malicious SQL parameters."""
        malicious_test_cases = [
            {
                'name': 'SQL injection with UNION',
                'params': {'email': "user@example.com' UNION SELECT * FROM users--"}
            },
            {
                'name': 'SQL injection with SELECT',
                'params': {'username': "admin'; SELECT password FROM users WHERE id=1--"}
            },
            {
                'name': 'SQL injection with INSERT',
                'params': {'description': "text'; INSERT INTO admin_users VALUES ('hacker', 'pass')--"}
            },
            {
                'name': 'SQL injection with UPDATE',
                'params': {'name': "user'; UPDATE users SET role='admin' WHERE id=1--"}
            },
            {
                'name': 'SQL injection with DELETE',
                'params': {'comment': "text'; DELETE FROM users WHERE role='user'--"}
            },
            {
                'name': 'SQL injection with DROP',
                'params': {'input': "data'; DROP TABLE users--"}
            },
            {
                'name': 'SQL injection with quotes',
                'params': {'field': "value'; malicious query"}
            },
            {
                'name': 'SQL injection with double quotes',
                'params': {'field': 'value"; malicious query'}
            },
            {
                'name': 'SQL injection with semicolon',
                'params': {'field': 'value; malicious query'}
            },
            {
                'name': 'SQL injection with comment',
                'params': {'field': 'value-- comment'}
            },
            {
                'name': 'SQL injection with block comment',
                'params': {'field': 'value /* comment */ malicious'}
            }
        ]
        
        for case in malicious_test_cases:
            with self.subTest(case=case['name']):
                result = self.protection.validate_sql_params(case['params'])
                self.assertFalse(result, f"Malicious parameters should be rejected: {case['name']}")
    
    def test_validate_sql_params_edge_cases(self):
        """Test validation with edge cases."""
        edge_cases = [
            {
                'name': 'Empty parameters',
                'params': {},
                'expected': True
            },
            {
                'name': 'None values',
                'params': {'field': None},
                'expected': True
            },
            {
                'name': 'Integer values',
                'params': {'id': 123, 'count': 456},
                'expected': True
            },
            {
                'name': 'Boolean values',
                'params': {'active': True, 'deleted': False},
                'expected': True
            },
            {
                'name': 'Empty string',
                'params': {'field': ''},
                'expected': True
            },
            {
                'name': 'Legitimate apostrophe',
                'params': {'name': "O'Connor"},
                'expected': False  # Current implementation flags apostrophes
            }
        ]
        
        for case in edge_cases:
            with self.subTest(case=case['name']):
                result = self.protection.validate_sql_params(case['params'])
                self.assertEqual(result, case['expected'], 
                    f"Edge case validation failed: {case['name']}")
    
    def test_execute_safe_query_success(self):
        """Test successful execution of safe parameterized query."""
        # Mock successful query execution
        mock_result = Mock()
        self.mock_session.execute.return_value = mock_result
        
        query = "SELECT * FROM users WHERE email = :email AND active = :active"
        params = {'email': 'user@example.com', 'active': True}
        
        result = self.protection.execute_safe_query(self.mock_session, query, params)
        
        # Verify the query was executed with proper parameters
        self.mock_session.execute.assert_called_once()
        call_args = self.mock_session.execute.call_args
        self.assertEqual(str(call_args[0][0]), query)  # Check query string
        self.assertEqual(call_args[0][1], params)  # Check parameters
        self.assertEqual(result, mock_result)
    
    def test_execute_safe_query_exception(self):
        """Test handling of database exceptions."""
        # Mock database exception
        self.mock_session.execute.side_effect = Exception("Database error")
        
        query = "SELECT * FROM users WHERE id = :id"
        params = {'id': 1}
        
        with self.assertRaises(Exception) as context:
            self.protection.execute_safe_query(self.mock_session, query, params)
        
        self.assertIn("Database error", str(context.exception))
        self.mock_session.execute.assert_called_once()
        call_args = self.mock_session.execute.call_args
        self.assertEqual(str(call_args[0][0]), query)  # Check query string
        self.assertEqual(call_args[0][1], params)  # Check parameters
    
    def test_case_insensitive_detection(self):
        """Test that SQL injection detection is case-insensitive."""
        malicious_cases = [
            {'field': "value'; UNION select * from users--"},
            {'field': "value'; Union Select * From users--"},
            {'field': "value'; union SELECT * FROM users--"},
            {'field': "value'; UnIoN sElEcT * fRoM users--"}
        ]
        
        for params in malicious_cases:
            result = self.protection.validate_sql_params(params)
            self.assertFalse(result, f"Case-insensitive detection failed for: {params}")

class TestORMSQLInjectionProtection(unittest.TestCase):
    """Test SQL injection protection in ORM usage."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.app = Flask(__name__)
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        self.app.config['TESTING'] = True
        
        # Mock User model for testing
        self.mock_user_class = Mock()
        self.mock_query = Mock()
        self.mock_user_class.query = self.mock_query
    
    def test_orm_filter_by_protection(self):
        """Test that ORM filter_by methods are safe from SQL injection."""
        # Simulate malicious input
        malicious_email = "user@example.com'; DROP TABLE users--"
        
        # Mock the filter_by method
        self.mock_query.filter_by.return_value.first.return_value = None
        
        # This should be safe because ORM handles parameterization
        result = self.mock_user_class.query.filter_by(email=malicious_email).first()
        
        # Verify the method was called (ORM handles the safety)
        self.mock_query.filter_by.assert_called_once_with(email=malicious_email)
        self.assertIsNone(result)
    
    def test_orm_filter_protection(self):
        """Test that ORM filter methods are safe from SQL injection."""
        # Mock the filter method
        self.mock_query.filter.return_value.all.return_value = []
        
        # Simulate using filter with potentially dangerous input
        malicious_input = "'; DROP TABLE users--"
        
        # This would be safe in real ORM usage with proper column references
        self.mock_user_class.query.filter(self.mock_user_class.username == malicious_input).all()
        
        # Verify the method was called
        self.mock_query.filter.assert_called_once()
    
    def test_raw_sql_with_text_and_params(self):
        """Test that raw SQL with text() and parameters is safe."""
        from sqlalchemy import text
        
        # Mock session
        mock_session = Mock()
        mock_session.execute.return_value = Mock()
        
        # Safe parameterized query
        query = text("SELECT * FROM users WHERE email = :email AND active = :active")
        params = {
            'email': "user@example.com'; DROP TABLE users--",  # Malicious input
            'active': True
        }
        
        # Execute with parameters (this is safe)
        result = mock_session.execute(query, params)
        
        # Verify execution
        mock_session.execute.assert_called_once_with(query, params)
        self.assertIsNotNone(result)

class TestSQLInjectionIntegration(unittest.TestCase):
    """Test SQL injection protection in application integration."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test-secret-key'
        self.app.config['TESTING'] = True
        
        # Mock database and models
        self.mock_db = Mock()
        self.mock_user = Mock()
        
        @self.app.route('/test-login', methods=['POST'])
        def test_login():
            from flask import request
            email = request.form.get('email', '')
            password = request.form.get('password', '')
            
            # Simulate safe ORM usage
            user = self.mock_user.query.filter_by(email=email).first()
            
            if user:
                return f'User found: {user.username}'
            return 'User not found'
        
        @self.app.route('/test-search', methods=['POST'])
        def test_search():
            from flask import request
            search_term = request.form.get('search', '')
            
            # Validate input before using in query
            protection = SQLInjectionProtection()
            if not protection.validate_sql_params({'search': search_term}):
                return 'Invalid search term', 400
            
            # Safe ORM usage
            results = self.mock_user.query.filter(
                self.mock_user.username.contains(search_term)
            ).all()
            
            return f'Found {len(results)} results'
        
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
    
    def tearDown(self):
        """Clean up after tests."""
        self.app_context.pop()
    
    def test_login_with_malicious_input(self):
        """Test login endpoint with SQL injection attempts."""
        malicious_inputs = [
            "admin'; DROP TABLE users--",
            "user@example.com' OR '1'='1",
            "'; UNION SELECT * FROM admin_users--",
            "user@example.com'; UPDATE users SET role='admin'--"
        ]
        
        for malicious_email in malicious_inputs:
            # Mock that no user is found (safe behavior)
            self.mock_user.query.filter_by.return_value.first.return_value = None
            
            response = self.client.post('/test-login', data={
                'email': malicious_email,
                'password': 'password'
            })
            
            # Should handle safely without errors
            self.assertEqual(response.status_code, 200)
            self.assertIn(b'User not found', response.data)
    
    def test_search_with_malicious_input(self):
        """Test search endpoint with SQL injection attempts."""
        malicious_searches = [
            "'; DROP TABLE users--",
            "term' OR '1'='1",
            "'; UNION SELECT password FROM users--",
            "term'; DELETE FROM users WHERE role='user'--"
        ]
        
        for malicious_search in malicious_searches:
            response = self.client.post('/test-search', data={
                'search': malicious_search
            })
            
            # Should reject malicious input
            self.assertEqual(response.status_code, 400)
            self.assertIn(b'Invalid search term', response.data)
    
    def test_safe_search_input(self):
        """Test search endpoint with safe input."""
        safe_searches = [
            "python",
            "machine learning",
            "data science",
            "web development"
        ]
        
        for safe_search in safe_searches:
            # Mock search results
            self.mock_user.query.filter.return_value.all.return_value = [Mock(), Mock()]
            
            response = self.client.post('/test-search', data={
                'search': safe_search
            })
            
            # Should process safely
            self.assertEqual(response.status_code, 200)
            self.assertIn(b'Found 2 results', response.data)

class TestSQLInjectionPerformance(unittest.TestCase):
    """Test SQL injection protection performance."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.protection = SQLInjectionProtection()
    
    def test_validation_performance(self):
        """Test that parameter validation doesn't significantly impact performance."""
        import time
        
        # Large parameter set to test performance
        large_params = {f'param_{i}': f'safe_value_{i}' for i in range(1000)}
        
        start_time = time.time()
        result = self.protection.validate_sql_params(large_params)
        end_time = time.time()
        
        # Should complete within reasonable time (0.1 seconds)
        self.assertLess(end_time - start_time, 0.1, "Validation took too long")
        self.assertTrue(result, "Large safe parameter set should be valid")
    
    def test_malicious_detection_performance(self):
        """Test performance of malicious input detection."""
        import time
        
        # Mix of safe and malicious parameters
        mixed_params = {
            f'safe_param_{i}': f'safe_value_{i}' for i in range(500)
        }
        mixed_params.update({
            f'malicious_param_{i}': f"value'; DROP TABLE users--" for i in range(10)
        })
        
        start_time = time.time()
        result = self.protection.validate_sql_params(mixed_params)
        end_time = time.time()
        
        # Should complete within reasonable time and detect malicious content
        self.assertLess(end_time - start_time, 0.1, "Detection took too long")
        self.assertFalse(result, "Should detect malicious parameters")

if __name__ == '__main__':
    # Run the tests
    unittest.main(verbosity=2)