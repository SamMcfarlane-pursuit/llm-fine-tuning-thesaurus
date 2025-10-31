#!/usr/bin/env python3
"""
Comprehensive API Endpoint Testing Script
Tests only the endpoints that actually exist in the application
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Tuple, Any

# Configuration
BASE_URL = "http://localhost:5002"
TEST_TIMEOUT = 10

class APITester:
    def __init__(self):
        self.results = []
        self.session = requests.Session()
        self.start_time = time.time()
    
    def test_endpoint(self, name: str, method: str, endpoint: str, 
                     expected_status: List[int], data: Dict = None, 
                     headers: Dict = None) -> bool:
        """Test a single endpoint"""
        url = f"{BASE_URL}{endpoint}"
        start = time.time()
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, timeout=TEST_TIMEOUT, headers=headers)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, timeout=TEST_TIMEOUT, headers=headers)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data, timeout=TEST_TIMEOUT, headers=headers)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, timeout=TEST_TIMEOUT, headers=headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            duration = (time.time() - start) * 1000
            status_code = response.status_code
            success = status_code in expected_status
            
            result = {
                'name': name,
                'method': method.upper(),
                'endpoint': endpoint,
                'url': url,
                'expected_status': expected_status,
                'actual_status': status_code,
                'success': success,
                'response_time_ms': round(duration, 2),
                'timestamp': datetime.now().isoformat()
            }
            
            # Try to get response content for analysis
            try:
                if response.headers.get('content-type', '').startswith('application/json'):
                    result['response_data'] = response.json()
                else:
                    result['response_text'] = response.text[:200]  # First 200 chars
            except:
                result['response_text'] = str(response.content[:200])
            
            self.results.append(result)
            
            status_icon = "✅" if success else "❌"
            status_text = "PASS" if success else "FAIL"
            
            if success:
                print(f"{status_icon} {status_text} {name}: Response time: {duration:.2f}ms")
            else:
                print(f"{status_icon} {status_text} {name}: Expected {expected_status}, got {status_code}")
            
            return success
            
        except requests.exceptions.RequestException as e:
            result = {
                'name': name,
                'method': method.upper(),
                'endpoint': endpoint,
                'url': url,
                'expected_status': expected_status,
                'actual_status': None,
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
            self.results.append(result)
            print(f"❌ FAIL {name}: {str(e)}")
            return False
    
    def run_tests(self):
        """Run all API endpoint tests"""
        print("🚀 Starting Comprehensive API Endpoint Testing...\n")
        
        # Health and System Endpoints
        print("🏥 Testing Health & System Endpoints...")
        self.test_endpoint("Health Check", "GET", "/health", [200])
        self.test_endpoint("API Health Check", "GET", "/api/health", [200])
        self.test_endpoint("Performance Metrics", "GET", "/api/performance/metrics", [200])
        self.test_endpoint("Performance Status", "GET", "/api/performance/status", [200])
        self.test_endpoint("System Status", "GET", "/api/system/status", [200])
        self.test_endpoint("Database Stats", "GET", "/api/database/stats", [200])
        print()
        
        # Core API Endpoints
        print("🔤 Testing Core API Endpoints...")
        self.test_endpoint("Thesaurus API - GET", "GET", "/api/thesaurus", [200, 400])
        self.test_endpoint("Thesaurus API - POST Valid", "POST", "/api/thesaurus", 
                          [200], {"word": "happy"})
        self.test_endpoint("Thesaurus API - POST Invalid", "POST", "/api/thesaurus", 
                          [400], {"invalid": "data"})
        print()
        
        # Analytics Endpoints
        print("📊 Testing Analytics Endpoints...")
        self.test_endpoint("Track Analytics - Valid", "POST", "/api/analytics/track", 
                          [200], {"event": "test", "data": {"test": True}})
        self.test_endpoint("Track Analytics - Invalid", "POST", "/api/analytics/track", 
                          [400], {})
        print()
        
        # Quiz Endpoints
        print("🎯 Testing Quiz Endpoints...")
        self.test_endpoint("Quiz Test Endpoint", "GET", "/api/quiz-test", [200])
        print()
        
        # Admin Endpoints
        print("⚙️ Testing Admin Endpoints...")
        self.test_endpoint("Emergency Mode Toggle", "POST", "/api/admin/emergency-mode", 
                          [401, 403, 405], {"enable": True})
        print()
        
        # Page Routes
        print("🌐 Testing Page Routes...")
        self.test_endpoint("Homepage", "GET", "/", [200])
        self.test_endpoint("Thesaurus Page", "GET", "/thesaurus", [200])
        self.test_endpoint("Learn Page", "GET", "/learn", [200])
        self.test_endpoint("Workshops Page", "GET", "/workshops", [200])
        self.test_endpoint("LoRA Guide", "GET", "/lora_guide", [200])
        self.test_endpoint("QLoRA Guide", "GET", "/qlora_guide", [200])
        self.test_endpoint("Auth Login Page", "GET", "/auth/login", [200])
        self.test_endpoint("Auth Register Page", "GET", "/auth/register", [200])
        print()
        
        # Additional Learning Pages
        print("📚 Testing Learning Pages...")
        self.test_endpoint("Workshop Exercises", "GET", "/workshop_exercises", [200])
        self.test_endpoint("Workshop Progress", "GET", "/workshop_progress", [200])
        self.test_endpoint("Tutorials", "GET", "/tutorials", [200])
        self.test_endpoint("Frameworks", "GET", "/frameworks", [200])
        self.test_endpoint("Docker Guide", "GET", "/docker_guide", [200])
        self.test_endpoint("HuggingFace Guide", "GET", "/huggingface_guide", [200])
        print()
        
        # User and Dashboard Pages
        print("👤 Testing User & Dashboard Pages...")
        self.test_endpoint("User Dashboard", "GET", "/user_dashboard", [200, 302])
        self.test_endpoint("Analytics Dashboard", "GET", "/analytics_dashboard", [200, 302])
        self.test_endpoint("AI Assistant", "GET", "/ai_assistant", [200])
        self.test_endpoint("Profile", "GET", "/profile", [200, 302])
        print()
        
    def generate_summary(self):
        """Generate test summary"""
        total_time = time.time() - self.start_time
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r['success'])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print("=" * 70)
        print("📋 TEST SUMMARY")
        print("=" * 70)
        print(f"⏱️ Total time: {total_time:.2f}s")
        print(f"🧪 Total tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📊 Success rate: {success_rate:.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS:")
            for result in self.results:
                if not result['success']:
                    expected = result.get('expected_status', [])
                    actual = result.get('actual_status', 'Error')
                    print(f"   • {result['name']}: Expected {expected}, got {actual}")
        
        print("\n" + "=" * 70)
        
        # Save detailed results
        with open('existing_api_test_results.json', 'w') as f:
            json.dump({
                'summary': {
                    'total_tests': total_tests,
                    'passed': passed_tests,
                    'failed': failed_tests,
                    'success_rate': success_rate,
                    'total_time': total_time
                },
                'results': self.results
            }, f, indent=2)
        
        print(f"📄 Detailed results saved to: existing_api_test_results.json")
        
        if failed_tests > 0:
            print(f"\n⚠️ Some API endpoints have issues. Check the results above.")
            return False
        else:
            print(f"\n🎉 All API endpoints are working correctly!")
            return True

def main():
    tester = APITester()
    tester.run_tests()
    success = tester.generate_summary()
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())