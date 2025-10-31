#!/usr/bin/env python3
"""
Frontend Functionality Testing Script
Tests UI components, forms, and interactive features
"""

import requests
import json
import time
from datetime import datetime
from bs4 import BeautifulSoup
import re

# Configuration
BASE_URL = "http://localhost:5002"
TEST_TIMEOUT = 10

class FrontendTester:
    def __init__(self):
        self.results = []
        self.session = requests.Session()
        self.start_time = time.time()
        self.csrf_token = None
    
    def get_csrf_token(self, url):
        """Extract CSRF token from a page"""
        try:
            response = self.session.get(url, timeout=TEST_TIMEOUT)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                csrf_input = soup.find('input', {'name': 'csrf_token'})
                if csrf_input:
                    return csrf_input.get('value')
                # Also check for meta tag
                csrf_meta = soup.find('meta', {'name': 'csrf-token'})
                if csrf_meta:
                    return csrf_meta.get('content')
        except Exception as e:
            print(f"Error getting CSRF token: {e}")
        return None
    
    def test_page_elements(self, name: str, endpoint: str, expected_elements: list) -> bool:
        """Test if specific elements exist on a page"""
        url = f"{BASE_URL}{endpoint}"
        start = time.time()
        
        try:
            response = self.session.get(url, timeout=TEST_TIMEOUT)
            duration = (time.time() - start) * 1000
            
            if response.status_code != 200:
                self.results.append({
                    'name': name,
                    'type': 'page_elements',
                    'endpoint': endpoint,
                    'success': False,
                    'error': f"Page returned status {response.status_code}",
                    'response_time_ms': round(duration, 2)
                })
                print(f"❌ FAIL {name}: Page returned status {response.status_code}")
                return False
            
            soup = BeautifulSoup(response.text, 'html.parser')
            found_elements = []
            missing_elements = []
            
            for element in expected_elements:
                if isinstance(element, dict):
                    tag = element.get('tag')
                    attrs = element.get('attrs', {})
                    text = element.get('text')
                    
                    if tag:
                        found = soup.find(tag, attrs)
                        if found and (not text or text.lower() in found.get_text().lower()):
                            found_elements.append(element)
                        else:
                            missing_elements.append(element)
                elif isinstance(element, str):
                    # Simple text search
                    if element.lower() in response.text.lower():
                        found_elements.append(element)
                    else:
                        missing_elements.append(element)
            
            success = len(missing_elements) == 0
            
            result = {
                'name': name,
                'type': 'page_elements',
                'endpoint': endpoint,
                'success': success,
                'found_elements': len(found_elements),
                'missing_elements': len(missing_elements),
                'response_time_ms': round(duration, 2),
                'details': {
                    'found': found_elements,
                    'missing': missing_elements
                }
            }
            
            self.results.append(result)
            
            if success:
                print(f"✅ PASS {name}: All {len(expected_elements)} elements found")
            else:
                print(f"❌ FAIL {name}: {len(missing_elements)} elements missing")
            
            return success
            
        except Exception as e:
            self.results.append({
                'name': name,
                'type': 'page_elements',
                'endpoint': endpoint,
                'success': False,
                'error': str(e)
            })
            print(f"❌ FAIL {name}: {str(e)}")
            return False
    
    def test_form_with_csrf(self, name: str, endpoint: str, form_data: dict, expected_status: list) -> bool:
        """Test form submission with CSRF token"""
        url = f"{BASE_URL}{endpoint}"
        start = time.time()
        
        try:
            # First get the page to extract CSRF token
            page_response = self.session.get(url, timeout=TEST_TIMEOUT)
            if page_response.status_code != 200:
                print(f"❌ FAIL {name}: Could not load form page (status {page_response.status_code})")
                return False
            
            csrf_token = self.get_csrf_token(url)
            if csrf_token:
                form_data['csrf_token'] = csrf_token
            
            # Submit the form
            response = self.session.post(url, data=form_data, timeout=TEST_TIMEOUT)
            duration = (time.time() - start) * 1000
            
            success = response.status_code in expected_status
            
            result = {
                'name': name,
                'type': 'form_submission',
                'endpoint': endpoint,
                'success': success,
                'expected_status': expected_status,
                'actual_status': response.status_code,
                'csrf_token_found': csrf_token is not None,
                'response_time_ms': round(duration, 2)
            }
            
            self.results.append(result)
            
            if success:
                print(f"✅ PASS {name}: Form submitted successfully")
            else:
                print(f"❌ FAIL {name}: Expected {expected_status}, got {response.status_code}")
            
            return success
            
        except Exception as e:
            self.results.append({
                'name': name,
                'type': 'form_submission',
                'endpoint': endpoint,
                'success': False,
                'error': str(e)
            })
            print(f"❌ FAIL {name}: {str(e)}")
            return False
    
    def run_tests(self):
        """Run all frontend functionality tests"""
        print("🎨 Starting Frontend Functionality Testing...\n")
        
        # Test Homepage Elements
        print("🏠 Testing Homepage Elements...")
        homepage_elements = [
            {'tag': 'title', 'text': 'Visual LLM'},
            {'tag': 'h1'},
            {'tag': 'nav'},
            'thesaurus',
            'learn',
            'workshops'
        ]
        self.test_page_elements("Homepage UI Elements", "/", homepage_elements)
        print()
        
        # Test Thesaurus Page Elements
        print("📚 Testing Thesaurus Page Elements...")
        thesaurus_elements = [
            {'tag': 'form'},
            {'tag': 'input', 'attrs': {'type': 'text'}},
            {'tag': 'button'},
            'synonym',
            'word'
        ]
        self.test_page_elements("Thesaurus Page UI Elements", "/thesaurus", thesaurus_elements)
        print()
        
        # Test Learning Pages
        print("📖 Testing Learning Page Elements...")
        learn_elements = [
            {'tag': 'h1'},
            {'tag': 'nav'},
            'learning',
            'tutorial'
        ]
        self.test_page_elements("Learn Page UI Elements", "/learn", learn_elements)
        
        workshop_elements = [
            {'tag': 'h1'},
            'workshop',
            'exercise'
        ]
        self.test_page_elements("Workshops Page UI Elements", "/workshops", workshop_elements)
        print()
        
        # Test Authentication Pages
        print("🔐 Testing Authentication Page Elements...")
        login_elements = [
            'login',
            'coming soon'
        ]
        self.test_page_elements("Login Page Elements", "/auth/login", login_elements)
        
        register_elements = [
            'register',
            'coming soon'
        ]
        self.test_page_elements("Register Page Elements", "/auth/register", register_elements)
        print()
        
        # Test Guide Pages
        print("📋 Testing Guide Page Elements...")
        lora_elements = [
            {'tag': 'h1'},
            'lora',
            'fine-tuning'
        ]
        self.test_page_elements("LoRA Guide Elements", "/lora_guide", lora_elements)
        
        qlora_elements = [
            {'tag': 'h1'},
            'qlora',
            'quantized'
        ]
        self.test_page_elements("QLoRA Guide Elements", "/qlora_guide", qlora_elements)
        print()
        
        # Test Dashboard Pages
        print("📊 Testing Dashboard Page Elements...")
        dashboard_elements = [
            {'tag': 'h1'},
            'dashboard'
        ]
        self.test_page_elements("User Dashboard Elements", "/user_dashboard", dashboard_elements)
        
        analytics_elements = [
            {'tag': 'h1'},
            'analytics'
        ]
        self.test_page_elements("Analytics Dashboard Elements", "/analytics_dashboard", analytics_elements)
        print()
        
        # Test AI Assistant Page
        print("🤖 Testing AI Assistant Page Elements...")
        ai_elements = [
            {'tag': 'h1'},
            'assistant',
            'chat'
        ]
        self.test_page_elements("AI Assistant Page Elements", "/ai_assistant", ai_elements)
        print()
    
    def generate_summary(self):
        """Generate test summary"""
        total_time = time.time() - self.start_time
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r['success'])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print("=" * 70)
        print("📋 FRONTEND TEST SUMMARY")
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
                    error_info = result.get('error', 'Unknown error')
                    missing_count = result.get('missing_elements', 0)
                    if isinstance(missing_count, int) and missing_count > 0:
                        error_info = f"{missing_count} elements missing"
                    elif isinstance(missing_count, list):
                        error_info = f"{len(missing_count)} elements missing"
                    print(f"   • {result['name']}: {error_info}")
        
        print("\n" + "=" * 70)
        
        # Save detailed results
        with open('frontend_test_results.json', 'w') as f:
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
        
        print(f"📄 Detailed results saved to: frontend_test_results.json")
        
        if failed_tests > 0:
            print(f"\n⚠️ Some frontend components have issues. Check the results above.")
            return False
        else:
            print(f"\n🎉 All frontend components are working correctly!")
            return True

def main():
    tester = FrontendTester()
    tester.run_tests()
    success = tester.generate_summary()
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())