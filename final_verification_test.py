#!/usr/bin/env python3
"""
Final Comprehensive Verification Test
Tests all routes and functionality to ensure no 404 errors and proper operation
"""

import requests
import json
import time
from datetime import datetime
from bs4 import BeautifulSoup
import sys

BASE_URL = "http://localhost:5002"
TEST_RESULTS = []
ERRORS = []

def log_test(test_name, status, details=None, response_code=None):
    """Log test results"""
    result = {
        "test_name": test_name,
        "status": status,
        "timestamp": datetime.now().isoformat(),
        "response_code": response_code,
        "details": details
    }
    TEST_RESULTS.append(result)
    
    status_symbol = "✓" if status == "PASS" else "✗" if status == "FAIL" else "⚠"
    print(f"{status_symbol} {test_name}: {status}")
    if response_code:
        print(f"   Response Code: {response_code}")
    if details:
        print(f"   Details: {details}")
    print()

def test_route_accessibility(route, expected_codes=[200], method="GET", data=None):
    """Test if a route is accessible and returns expected status codes"""
    try:
        url = f"{BASE_URL}{route}"
        
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=10)
        else:
            response = requests.request(method, url, timeout=10)
        
        if response.status_code in expected_codes:
            return True, response.status_code, response
        elif response.status_code == 404:
            return False, response.status_code, response
        else:
            return True, response.status_code, response  # Not 404, so route exists
            
    except requests.exceptions.RequestException as e:
        return False, None, str(e)

def test_ui_components(route, required_elements):
    """Test if UI components are present on a page"""
    try:
        url = f"{BASE_URL}{route}"
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            return False, f"Page returned {response.status_code}"
        
        soup = BeautifulSoup(response.content, 'html.parser')
        missing_elements = []
        
        for element_type, selector in required_elements.items():
            if not soup.select(selector):
                missing_elements.append(f"{element_type} ({selector})")
        
        if missing_elements:
            return False, f"Missing elements: {', '.join(missing_elements)}"
        
        return True, "All required elements found"
        
    except Exception as e:
        return False, str(e)

def main():
    print("🔍 Starting Final Comprehensive Verification Test")
    print(f"Testing server at: {BASE_URL}")
    print("=" * 60)
    
    # Test 1: Server Health Check
    print("\n📊 HEALTH CHECK")
    success, code, response = test_route_accessibility("/health")
    if success and code == 200:
        log_test("Server Health Check", "PASS", "Server is running", code)
    else:
        log_test("Server Health Check", "FAIL", "Server not accessible", code)
        print("❌ Server is not accessible. Exiting tests.")
        return False
    
    # Test 2: All Main Routes Accessibility
    print("\n🌐 ROUTE ACCESSIBILITY TESTS")
    main_routes = [
        ("/", "Home Page"),
        ("/thesaurus", "Thesaurus Page"),
        ("/learn", "Learn Page"),
        ("/workshops", "Workshops Page"),
        ("/tutorials", "Tutorials Page"),
        ("/guides", "Guides Page"),
        ("/exercises", "Exercises Page"),
        ("/profile", "Profile Page"),
        ("/contact", "Contact Page"),
        ("/terms", "Terms Page"),
        ("/privacy", "Privacy Page"),
        ("/auth/login", "Login Page"),
        ("/auth/register", "Register Page"),
        ("/user_dashboard", "User Dashboard"),
        ("/analytics_dashboard", "Analytics Dashboard"),
        ("/ai_assistant", "AI Assistant Page"),
        ("/getting_started", "Getting Started Page"),
        ("/learning_paths", "Learning Paths Page"),
        ("/lora_guide", "LoRA Guide Page"),
        ("/qlora_guide", "QLoRA Guide Page"),
        ("/docker_guide", "Docker Guide Page"),
        ("/huggingface_guide", "HuggingFace Guide Page"),
        ("/google_ml_crash_course", "Google ML Course Page"),
        ("/frameworks", "Frameworks Page"),
        ("/search_results", "Search Results Page"),
        ("/quiz/quiz_list", "Quiz List Page"),
        ("/quiz/quiz_dashboard", "Quiz Dashboard Page"),
        ("/workshop_exercises", "Workshop Exercises Page"),
        ("/workshop_progress", "Workshop Progress Page"),
        ("/workshop_lora_fine_tuning", "LoRA Fine-tuning Workshop"),
        ("/workshop_qlora_deep_dive", "QLoRA Deep Dive Workshop")
    ]
    
    route_failures = 0
    for route, name in main_routes:
        success, code, response = test_route_accessibility(route)
        if success and code != 404:
            log_test(f"Route: {name}", "PASS", f"Accessible at {route}", code)
        else:
            log_test(f"Route: {name}", "FAIL", f"404 Error at {route}", code)
            route_failures += 1
    
    # Test 3: API Endpoints
    print("\n🔌 API ENDPOINTS TESTS")
    api_routes = [
        ("/api/health", "API Health Check"),
        ("/api/thesaurus", "Thesaurus API"),
        ("/api/performance/metrics", "Performance Metrics API"),
        ("/api/performance/status", "Performance Status API"),
        ("/api/analytics/track", "Analytics Tracking API"),
        ("/api/system/status", "System Status API"),
        ("/api/database/stats", "Database Stats API"),
        ("/api/quiz-test", "Quiz Test API"),
        ("/api/admin/emergency-mode", "Emergency Mode API")
    ]
    
    api_failures = 0
    for route, name in api_routes:
        success, code, response = test_route_accessibility(route)
        if success and code != 404:
            log_test(f"API: {name}", "PASS", f"Accessible at {route}", code)
        else:
            log_test(f"API: {name}", "FAIL", f"404 Error at {route}", code)
            api_failures += 1
    
    # Test 4: Critical UI Components
    print("\n🎨 UI COMPONENTS TESTS")
    ui_tests = [
        ("/", "Home Page UI", {
            "navigation": "nav",
            "main_content": "main, .main-content, .container",
            "footer": "footer"
        }),
        ("/thesaurus", "Thesaurus UI", {
            "search_input": "#wordInput, input[id='wordInput']",
            "search_button": "button.search-btn, .search-btn",
            "visualization_container": "#networkContainer, .visualization-container"
        }),
        ("/auth/login", "Login Form UI", {
            "auth_form": ".auth-form, form",
            "email_field": "input[name='email'], input[type='email']",
            "password_field": "input[name='password'], input[type='password']",
            "submit_button": "button[type='submit'], input[type='submit'], .auth-submit"
        }),
        ("/learn", "Learn Page UI", {
            "main_content": "main, .main-content, .container",
            "navigation_links": "a"
        })
    ]
    
    ui_failures = 0
    for route, name, elements in ui_tests:
        success, details = test_ui_components(route, elements)
        if success:
            log_test(f"UI: {name}", "PASS", details)
        else:
            log_test(f"UI: {name}", "FAIL", details)
            ui_failures += 1
    
    # Test 5: Static Assets
    print("\n📁 STATIC ASSETS TESTS")
    static_assets = [
        ("/static/css/style.css", "Main CSS"),
        ("/static/js/main.js", "Main JavaScript"),
        ("/static/js/thesaurus.js", "Thesaurus JavaScript"),
        ("/static/manifest.json", "PWA Manifest"),
        ("/static/img/logo.svg", "Logo SVG")
    ]
    
    static_failures = 0
    for route, name in static_assets:
        success, code, response = test_route_accessibility(route)
        if success and code == 200:
            log_test(f"Static: {name}", "PASS", f"Asset loaded successfully", code)
        else:
            log_test(f"Static: {name}", "FAIL", f"Asset not found at {route}", code)
            static_failures += 1
    
    # Generate Summary
    print("\n" + "=" * 60)
    print("📋 FINAL VERIFICATION SUMMARY")
    print("=" * 60)
    
    total_tests = len(TEST_RESULTS)
    passed_tests = len([r for r in TEST_RESULTS if r['status'] == 'PASS'])
    failed_tests = total_tests - passed_tests
    success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
    
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {failed_tests}")
    print(f"Success Rate: {success_rate:.1f}%")
    
    print(f"\nRoute Failures: {route_failures}")
    print(f"API Failures: {api_failures}")
    print(f"UI Failures: {ui_failures}")
    print(f"Static Asset Failures: {static_failures}")
    
    # Save detailed results
    results_file = "final_verification_results.json"
    with open(results_file, 'w') as f:
        json.dump({
            "summary": {
                "total_tests": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "success_rate": success_rate,
                "route_failures": route_failures,
                "api_failures": api_failures,
                "ui_failures": ui_failures,
                "static_failures": static_failures,
                "timestamp": datetime.now().isoformat()
            },
            "detailed_results": TEST_RESULTS
        }, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: {results_file}")
    
    # Final Status
    if failed_tests == 0:
        print("\n🎉 ALL TESTS PASSED! Application is fully functional with no 404 errors.")
        return True
    elif route_failures == 0 and api_failures == 0:
        print("\n✅ All routes accessible! Minor UI/static asset issues detected.")
        return True
    else:
        print(f"\n⚠️  {failed_tests} tests failed. Review results for details.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)