#!/usr/bin/env python3
"""
Comprehensive API Endpoint Testing Script

This script tests all API endpoints in the Thesaurus AI LLM application
to ensure they are working correctly and returning proper responses.
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5002"
TEST_TIMEOUT = 10

class APITester:
    def __init__(self, base_url=BASE_URL):
        self.base_url = base_url
        self.session = requests.Session()
        self.results = []
        
    def log_result(self, test_name, success, response_code=None, message="", response_time=None):
        """Log test result"""
        result = {
            'test': test_name,
            'success': success,
            'response_code': response_code,
            'message': message,
            'response_time': response_time,
            'timestamp': datetime.now().isoformat()
        }
        self.results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
    def test_endpoint(self, method, endpoint, expected_codes=[200], data=None, headers=None, test_name=None):
        """Generic endpoint testing method"""
        if test_name is None:
            test_name = f"{method} {endpoint}"
            
        try:
            start_time = time.time()
            url = f"{self.base_url}{endpoint}"
            
            if method.upper() == 'GET':
                response = self.session.get(url, headers=headers, timeout=TEST_TIMEOUT)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, headers=headers, timeout=TEST_TIMEOUT)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data, headers=headers, timeout=TEST_TIMEOUT)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, headers=headers, timeout=TEST_TIMEOUT)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            response_time = round((time.time() - start_time) * 1000, 2)
            
            if response.status_code in expected_codes:
                self.log_result(test_name, True, response.status_code, 
                              f"Response time: {response_time}ms", response_time)
                return response
            else:
                self.log_result(test_name, False, response.status_code, 
                              f"Expected {expected_codes}, got {response.status_code}")
                return None
                
        except requests.exceptions.Timeout:
            self.log_result(test_name, False, None, "Request timeout")
            return None
        except requests.exceptions.ConnectionError:
            self.log_result(test_name, False, None, "Connection error - server may not be running")
            return None
        except Exception as e:
            self.log_result(test_name, False, None, f"Error: {str(e)}")
            return None
    
    def test_health_endpoints(self):
        """Test health and monitoring endpoints"""
        print("\n🏥 Testing Health & Monitoring Endpoints...")
        
        # Health check
        response = self.test_endpoint('GET', '/health', test_name="Health Check")
        if response:
            try:
                data = response.json()
                if 'status' in data and 'version' in data:
                    self.log_result("Health Check Data", True, 200, "Valid health data structure")
                else:
                    self.log_result("Health Check Data", False, 200, "Missing required health fields")
            except:
                self.log_result("Health Check Data", False, 200, "Invalid JSON response")
        
        # API health check
        self.test_endpoint('GET', '/api/health', test_name="API Health Check")
        
        # Performance metrics
        self.test_endpoint('GET', '/api/performance/metrics', test_name="Performance Metrics")
        
        # Performance status
        self.test_endpoint('GET', '/api/performance/status', test_name="Performance Status")
        
        # System status
        self.test_endpoint('GET', '/api/system/status', test_name="System Status")
        
        # Database stats
        self.test_endpoint('GET', '/api/database/stats', test_name="Database Stats")
    
    def test_thesaurus_endpoints(self):
        """Test thesaurus functionality"""
        print("\n📚 Testing Thesaurus Endpoints...")
        
        # Thesaurus API info
        response = self.test_endpoint('GET', '/api/thesaurus', test_name="Thesaurus API Info")
        if response:
            try:
                data = response.json()
                if 'message' in data and 'endpoints' in data:
                    self.log_result("Thesaurus API Info Data", True, 200, "Valid API info structure")
                else:
                    self.log_result("Thesaurus API Info Data", False, 200, "Missing API info fields")
            except:
                self.log_result("Thesaurus API Info Data", False, 200, "Invalid JSON response")
        
        # Test thesaurus with valid word
        test_data = {"word": "happy"}
        response = self.test_endpoint('POST', '/api/thesaurus', data=test_data, test_name="Thesaurus Query - Happy")
        if response:
            try:
                data = response.json()
                if 'word' in data and 'synonyms' in data and len(data['synonyms']) > 0:
                    self.log_result("Thesaurus Query Data", True, 200, f"Found {len(data['synonyms'])} synonyms")
                else:
                    self.log_result("Thesaurus Query Data", False, 200, "Missing or empty synonyms")
            except:
                self.log_result("Thesaurus Query Data", False, 200, "Invalid JSON response")
        
        # Test thesaurus with empty word
        test_data = {"word": ""}
        self.test_endpoint('POST', '/api/thesaurus', data=test_data, 
                         expected_codes=[400], test_name="Thesaurus Empty Word")
        
        # Test thesaurus with missing word
        test_data = {}
        self.test_endpoint('POST', '/api/thesaurus', data=test_data, 
                         expected_codes=[400], test_name="Thesaurus Missing Word")
    
    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n🔐 Testing Authentication Endpoints...")
        
        # Session verification (should be unauthenticated)
        response = self.test_endpoint('GET', '/api/auth/verify-session', 
                                    expected_codes=[401], test_name="Session Verification (Unauthenticated)")
        
        # Check auth status
        response = self.test_endpoint('GET', '/api/auth/check-auth', test_name="Check Auth Status")
        if response:
            try:
                data = response.json()
                if 'authenticated' in data:
                    self.log_result("Auth Status Data", True, 200, f"Auth status: {data['authenticated']}")
                else:
                    self.log_result("Auth Status Data", False, 200, "Missing authenticated field")
            except:
                self.log_result("Auth Status Data", False, 200, "Invalid JSON response")
        
        # Test login with invalid credentials
        login_data = {"email": "test@example.com", "password": "wrongpassword"}
        self.test_endpoint('POST', '/api/auth/login', data=login_data, 
                         expected_codes=[401], test_name="Login Invalid Credentials")
        
        # Test login with missing data
        login_data = {"email": "test@example.com"}
        self.test_endpoint('POST', '/api/auth/login', data=login_data, 
                         expected_codes=[400], test_name="Login Missing Password")
        
        # Test register with missing data
        register_data = {"email": "test@example.com"}
        self.test_endpoint('POST', '/api/auth/register', data=register_data, 
                         expected_codes=[400], test_name="Register Missing Fields")
        
        # Test logout
        self.test_endpoint('POST', '/api/auth/logout', test_name="Logout")
    
    def test_ai_assistant_endpoints(self):
        """Test AI assistant endpoints"""
        print("\n🤖 Testing AI Assistant Endpoints...")
        
        # AI assistant status
        response = self.test_endpoint('GET', '/api/ai/status', test_name="AI Assistant Status")
        if response:
            try:
                data = response.json()
                if 'status' in data:
                    self.log_result("AI Status Data", True, 200, f"AI status: {data['status']}")
                else:
                    self.log_result("AI Status Data", False, 200, "Missing status field")
            except:
                self.log_result("AI Status Data", False, 200, "Invalid JSON response")
        
        # AI suggestions
        response = self.test_endpoint('GET', '/api/ai/suggestions', test_name="AI Suggestions")
        if response:
            try:
                data = response.json()
                if 'suggestions' in data:
                    self.log_result("AI Suggestions Data", True, 200, f"Found {len(data['suggestions'])} suggestions")
                else:
                    self.log_result("AI Suggestions Data", False, 200, "Missing suggestions field")
            except:
                self.log_result("AI Suggestions Data", False, 200, "Invalid JSON response")
        
        # AI chat
        chat_data = {"message": "What is LoRA?"}
        response = self.test_endpoint('POST', '/api/ai/chat', data=chat_data, test_name="AI Chat Query")
        if response:
            try:
                data = response.json()
                if 'response' in data:
                    self.log_result("AI Chat Response", True, 200, "Valid chat response received")
                else:
                    self.log_result("AI Chat Response", False, 200, "Missing response field")
            except:
                self.log_result("AI Chat Response", False, 200, "Invalid JSON response")
        
        # AI chat with empty message
        chat_data = {"message": ""}
        self.test_endpoint('POST', '/api/ai/chat', data=chat_data, 
                         expected_codes=[400], test_name="AI Chat Empty Message")
    
    def test_analytics_endpoints(self):
        """Test analytics endpoints"""
        print("\n📊 Testing Analytics Endpoints...")
        
        # Track analytics event
        analytics_data = {
            "event_type": "test_event",
            "page": "/test",
            "action": "api_test"
        }
        self.test_endpoint('POST', '/api/analytics/track', data=analytics_data, test_name="Track Analytics Event")
        
        # Track analytics with empty data
        self.test_endpoint('POST', '/api/analytics/track', data={}, 
                         expected_codes=[400], test_name="Track Analytics Empty Data")
    
    def test_quiz_endpoints(self):
        """Test quiz endpoints"""
        print("\n🎯 Testing Quiz Endpoints...")
        
        # Quiz test endpoint
        self.test_endpoint('GET', '/api/quiz-test', test_name="Quiz Test Endpoint")
    
    def test_admin_endpoints(self):
        """Test admin endpoints"""
        print("\n⚙️ Testing Admin Endpoints...")
        
        # Emergency mode toggle (should require authentication)
        emergency_data = {"enabled": True}
        self.test_endpoint('POST', '/api/admin/emergency-mode', data=emergency_data, 
                         expected_codes=[401, 403, 405], test_name="Emergency Mode Toggle")
    
    def test_page_routes(self):
        """Test main page routes"""
        print("\n🌐 Testing Page Routes...")
        
        pages = [
            ('/', 'Homepage'),
            ('/thesaurus', 'Thesaurus Page'),
            ('/learn', 'Learn Page'),
            ('/workshops', 'Workshops Page'),
            ('/auth/login', 'Login Page'),
            ('/auth/register', 'Register Page')
        ]
        
        for endpoint, name in pages:
            self.test_endpoint('GET', endpoint, test_name=name)
    
    def run_all_tests(self):
        """Run all API endpoint tests"""
        print("🚀 Starting Comprehensive API Endpoint Testing...")
        print(f"📡 Testing server at: {self.base_url}")
        print(f"⏱️ Timeout: {TEST_TIMEOUT} seconds")
        print("="*70)
        
        start_time = time.time()
        
        # Run all test categories
        self.test_health_endpoints()
        self.test_thesaurus_endpoints()
        self.test_auth_endpoints()
        self.test_ai_assistant_endpoints()
        self.test_analytics_endpoints()
        self.test_quiz_endpoints()
        self.test_admin_endpoints()
        self.test_page_routes()
        
        # Calculate results
        total_time = round(time.time() - start_time, 2)
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r['success'])
        failed_tests = total_tests - passed_tests
        
        # Print summary
        print("\n" + "="*70)
        print("📋 TEST SUMMARY")
        print("="*70)
        print(f"⏱️ Total time: {total_time}s")
        print(f"🧪 Total tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📊 Success rate: {round((passed_tests/total_tests)*100, 1)}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['message']}")
        
        print("\n" + "="*70)
        
        # Save detailed results to file
        with open('api_test_results.json', 'w') as f:
            json.dump({
                'summary': {
                    'total_tests': total_tests,
                    'passed': passed_tests,
                    'failed': failed_tests,
                    'success_rate': round((passed_tests/total_tests)*100, 1),
                    'total_time': total_time,
                    'timestamp': datetime.now().isoformat()
                },
                'results': self.results
            }, f, indent=2)
        
        print(f"📄 Detailed results saved to: api_test_results.json")
        
        return passed_tests == total_tests

if __name__ == "__main__":
    tester = APITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All API endpoints are working correctly!")
        exit(0)
    else:
        print("\n⚠️ Some API endpoints have issues. Check the results above.")
        exit(1)