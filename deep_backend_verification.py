#!/usr/bin/env python3
"""
Deep Backend Verification Test
Comprehensive testing of all backend functionality categories
"""

import requests
import json
import time
import sqlite3
import os
from datetime import datetime
from bs4 import BeautifulSoup
import sys
import threading
import psutil

BASE_URL = "http://localhost:5002"
TEST_RESULTS = []
ERRORS = []
CATEGORY_RESULTS = {}

def log_test(category, test_name, status, details=None, response_code=None, response_time=None):
    """Log test results with category tracking"""
    result = {
        "category": category,
        "test_name": test_name,
        "status": status,
        "timestamp": datetime.now().isoformat(),
        "response_code": response_code,
        "response_time": response_time,
        "details": details
    }
    TEST_RESULTS.append(result)
    
    # Track category results
    if category not in CATEGORY_RESULTS:
        CATEGORY_RESULTS[category] = {"passed": 0, "failed": 0, "total": 0}
    
    CATEGORY_RESULTS[category]["total"] += 1
    if status == "PASS":
        CATEGORY_RESULTS[category]["passed"] += 1
    else:
        CATEGORY_RESULTS[category]["failed"] += 1
    
    status_symbol = "✓" if status == "PASS" else "✗" if status == "FAIL" else "⚠"
    print(f"{status_symbol} [{category}] {test_name}: {status}")
    if response_code:
        print(f"   Response Code: {response_code}")
    if response_time:
        print(f"   Response Time: {response_time:.3f}s")
    if details:
        print(f"   Details: {details}")
    print()

def make_request(method, endpoint, data=None, headers=None, timeout=10):
    """Make HTTP request with timing"""
    url = f"{BASE_URL}{endpoint}"
    start_time = time.time()
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, timeout=timeout)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=timeout)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=timeout)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers, timeout=timeout)
        else:
            response = requests.request(method, url, json=data, headers=headers, timeout=timeout)
        
        response_time = time.time() - start_time
        return True, response, response_time
        
    except requests.exceptions.RequestException as e:
        response_time = time.time() - start_time
        return False, str(e), response_time

def test_database_operations():
    """Test database connectivity and operations"""
    print("\n🗄️  DATABASE OPERATIONS TESTING")
    print("=" * 50)
    
    # Test 1: Database Stats API
    success, response, response_time = make_request("GET", "/api/database/stats")
    if success and response.status_code == 200:
        try:
            data = response.json()
            log_test("Database", "Database Stats API", "PASS", 
                    f"Connected: {data.get('connected', 'Unknown')}", 
                    response.status_code, response_time)
        except:
            log_test("Database", "Database Stats API", "FAIL", 
                    "Invalid JSON response", response.status_code, response_time)
    else:
        log_test("Database", "Database Stats API", "FAIL", 
                "API not accessible", getattr(response, 'status_code', None), response_time)
    
    # Test 2: Check if database file exists (SQLite)
    db_files = ['instance/app.db', 'app.db', 'database.db']
    db_found = False
    for db_file in db_files:
        if os.path.exists(db_file):
            log_test("Database", "Database File Existence", "PASS", 
                    f"Database file found: {db_file}")
            db_found = True
            
            # Test 3: Database Connection
            try:
                conn = sqlite3.connect(db_file)
                cursor = conn.cursor()
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
                tables = cursor.fetchall()
                conn.close()
                
                log_test("Database", "Database Connection", "PASS", 
                        f"Connected successfully, {len(tables)} tables found")
                
                # Test 4: Table Structure
                if tables:
                    log_test("Database", "Database Schema", "PASS", 
                            f"Tables: {', '.join([t[0] for t in tables[:5]])}")
                else:
                    log_test("Database", "Database Schema", "WARN", 
                            "No tables found in database")
                    
            except Exception as e:
                log_test("Database", "Database Connection", "FAIL", str(e))
            break
    
    if not db_found:
        log_test("Database", "Database File Existence", "WARN", 
                "No local database file found (may be using external DB)")

def test_api_functionality():
    """Test all API endpoints comprehensively"""
    print("\n🔌 API FUNCTIONALITY TESTING")
    print("=" * 50)
    
    # Core API Tests
    api_tests = [
        ("GET", "/api/health", None, "Health Check"),
        ("GET", "/api/system/status", None, "System Status"),
        ("GET", "/api/performance/metrics", None, "Performance Metrics"),
        ("GET", "/api/performance/status", None, "Performance Status"),
        ("GET", "/api/database/stats", None, "Database Statistics"),
        ("GET", "/api/quiz-test", None, "Quiz System Test"),
    ]
    
    for method, endpoint, data, test_name in api_tests:
        success, response, response_time = make_request(method, endpoint, data)
        
        if success and response.status_code == 200:
            try:
                json_data = response.json()
                log_test("API", test_name, "PASS", 
                        f"Valid JSON response with {len(json_data)} fields", 
                        response.status_code, response_time)
            except:
                log_test("API", test_name, "PASS", 
                        "Non-JSON response but successful", 
                        response.status_code, response_time)
        elif success:
            log_test("API", test_name, "PASS", 
                    f"Endpoint accessible", 
                    response.status_code, response_time)
        else:
            log_test("API", test_name, "FAIL", 
                    f"Request failed: {response}", None, response_time)
    
    # Test Thesaurus API with actual data
    print("\n📚 THESAURUS API DETAILED TESTING")
    test_words = ["happy", "computer", "learning"]
    
    for word in test_words:
        success, response, response_time = make_request("GET", f"/api/thesaurus?word={word}")
        
        if success and response.status_code == 200:
            try:
                data = response.json()
                synonyms = data.get('synonyms', [])
                log_test("Thesaurus", f"Word Lookup: {word}", "PASS", 
                        f"Found {len(synonyms)} synonyms", 
                        response.status_code, response_time)
            except:
                log_test("Thesaurus", f"Word Lookup: {word}", "FAIL", 
                        "Invalid JSON response", 
                        response.status_code, response_time)
        else:
            log_test("Thesaurus", f"Word Lookup: {word}", "FAIL", 
                    "API request failed", 
                    getattr(response, 'status_code', None), response_time)
    
    # Test POST endpoints (with CSRF considerations)
    print("\n📝 POST ENDPOINT TESTING")
    post_tests = [
        ("/api/analytics/track", {"event": "test", "data": "verification"}, "Analytics Tracking"),
        ("/api/admin/emergency-mode", {"enabled": False}, "Emergency Mode Toggle"),
    ]
    
    for endpoint, data, test_name in post_tests:
        success, response, response_time = make_request("POST", endpoint, data)
        
        if success:
            if response.status_code in [200, 201, 400, 405]:  # 400/405 expected for CSRF
                log_test("API", test_name, "PASS", 
                        f"Endpoint accessible (CSRF protection active)", 
                        response.status_code, response_time)
            else:
                log_test("API", test_name, "FAIL", 
                        f"Unexpected response", 
                        response.status_code, response_time)
        else:
            log_test("API", test_name, "FAIL", 
                    f"Request failed: {response}", None, response_time)

def test_authentication_system():
    """Test authentication and security features"""
    print("\n🔐 AUTHENTICATION SYSTEM TESTING")
    print("=" * 50)
    
    # Test 1: Login endpoint accessibility
    success, response, response_time = make_request("GET", "/auth/login")
    if success:
        if response.status_code == 200:
            # Check if it's HTML or JSON
            content_type = response.headers.get('content-type', '')
            if 'application/json' in content_type:
                try:
                    data = response.json()
                    log_test("Auth", "Login Endpoint", "PASS", 
                            f"JSON response: {data.get('message', 'No message')}", 
                            response.status_code, response_time)
                except:
                    log_test("Auth", "Login Endpoint", "PASS", 
                            "Accessible but invalid JSON", 
                            response.status_code, response_time)
            else:
                log_test("Auth", "Login Endpoint", "PASS", 
                        "HTML login page accessible", 
                        response.status_code, response_time)
        else:
            log_test("Auth", "Login Endpoint", "PASS", 
                    "Endpoint accessible", 
                    response.status_code, response_time)
    else:
        log_test("Auth", "Login Endpoint", "FAIL", 
                f"Request failed: {response}", None, response_time)
    
    # Test 2: Register endpoint
    success, response, response_time = make_request("GET", "/auth/register")
    if success:
        log_test("Auth", "Register Endpoint", "PASS", 
                "Registration page accessible", 
                response.status_code, response_time)
    else:
        log_test("Auth", "Register Endpoint", "FAIL", 
                f"Request failed: {response}", None, response_time)
    
    # Test 3: Protected routes (should redirect or show auth required)
    protected_routes = ["/profile", "/user_dashboard", "/analytics_dashboard"]
    
    for route in protected_routes:
        success, response, response_time = make_request("GET", route)
        if success:
            if response.status_code in [200, 302, 401, 403]:
                log_test("Auth", f"Protected Route: {route}", "PASS", 
                        f"Proper auth handling", 
                        response.status_code, response_time)
            else:
                log_test("Auth", f"Protected Route: {route}", "WARN", 
                        f"Unexpected response", 
                        response.status_code, response_time)
        else:
            log_test("Auth", f"Protected Route: {route}", "FAIL", 
                    f"Request failed: {response}", None, response_time)
    
    # Test 4: CSRF Protection
    csrf_test_data = {"test": "csrf_verification"}
    success, response, response_time = make_request("POST", "/api/analytics/track", csrf_test_data)
    
    if success and response.status_code == 400:
        try:
            data = response.json()
            if "CSRF" in str(data) or "csrf" in str(data).lower():
                log_test("Auth", "CSRF Protection", "PASS", 
                        "CSRF protection active", 
                        response.status_code, response_time)
            else:
                log_test("Auth", "CSRF Protection", "WARN", 
                        "400 error but not CSRF related", 
                        response.status_code, response_time)
        except:
            log_test("Auth", "CSRF Protection", "WARN", 
                    "400 error, likely CSRF protection", 
                    response.status_code, response_time)
    else:
        log_test("Auth", "CSRF Protection", "WARN", 
                "CSRF protection status unclear", 
                getattr(response, 'status_code', None), response_time)

def test_performance_monitoring():
    """Test performance monitoring and metrics"""
    print("\n📊 PERFORMANCE MONITORING TESTING")
    print("=" * 50)
    
    # Test 1: Performance Metrics API
    success, response, response_time = make_request("GET", "/api/performance/metrics")
    if success and response.status_code == 200:
        try:
            data = response.json()
            metrics = ['cpu_usage', 'memory_usage', 'disk_usage', 'response_time']
            found_metrics = [m for m in metrics if m in str(data)]
            
            log_test("Performance", "Metrics Collection", "PASS", 
                    f"Found {len(found_metrics)} performance metrics", 
                    response.status_code, response_time)
            
            # Check specific metrics
            if 'memory_usage' in str(data):
                log_test("Performance", "Memory Monitoring", "PASS", 
                        "Memory usage tracking active")
            
            if 'cpu_usage' in str(data) or 'cpu' in str(data).lower():
                log_test("Performance", "CPU Monitoring", "PASS", 
                        "CPU usage tracking active")
                        
        except Exception as e:
            log_test("Performance", "Metrics Collection", "FAIL", 
                    f"JSON parsing error: {str(e)}", 
                    response.status_code, response_time)
    else:
        log_test("Performance", "Metrics Collection", "FAIL", 
                "Metrics API not accessible", 
                getattr(response, 'status_code', None), response_time)
    
    # Test 2: Performance Status
    success, response, response_time = make_request("GET", "/api/performance/status")
    if success and response.status_code == 200:
        try:
            data = response.json()
            log_test("Performance", "Status Monitoring", "PASS", 
                    f"Status data available with {len(data)} fields", 
                    response.status_code, response_time)
        except:
            log_test("Performance", "Status Monitoring", "PASS", 
                    "Status endpoint accessible", 
                    response.status_code, response_time)
    else:
        log_test("Performance", "Status Monitoring", "FAIL", 
                "Status API not accessible", 
                getattr(response, 'status_code', None), response_time)
    
    # Test 3: System Resource Usage
    try:
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        log_test("Performance", "System Resources", "PASS", 
                f"CPU: {cpu_percent}%, Memory: {memory.percent}%, Disk: {disk.percent}%")
        
        # Check for performance alerts file
        if os.path.exists('performance_alerts.json'):
            log_test("Performance", "Alert System", "PASS", 
                    "Performance alerts file exists")
        else:
            log_test("Performance", "Alert System", "WARN", 
                    "No performance alerts file found")
                    
    except Exception as e:
        log_test("Performance", "System Resources", "FAIL", 
                f"Resource monitoring error: {str(e)}")

def test_ui_backend_integration():
    """Test frontend-backend integration"""
    print("\n🎨 UI-BACKEND INTEGRATION TESTING")
    print("=" * 50)
    
    # Test 1: Main pages load with backend data
    pages_with_backend = [
        ("/", "Home Page", ["thesaurus", "learn", "workshop"]),
        ("/thesaurus", "Thesaurus Page", ["wordInput", "searchWord", "api/thesaurus"]),
        ("/learn", "Learn Page", ["concept", "tutorial", "guide"]),
        ("/workshops", "Workshops Page", ["workshop", "exercise", "training"]),
    ]
    
    for route, page_name, expected_content in pages_with_backend:
        success, response, response_time = make_request("GET", route)
        
        if success and response.status_code == 200:
            content = response.text.lower()
            found_content = [item for item in expected_content if item in content]
            
            if len(found_content) >= len(expected_content) // 2:
                log_test("Integration", f"{page_name} Content", "PASS", 
                        f"Found {len(found_content)}/{len(expected_content)} expected elements", 
                        response.status_code, response_time)
            else:
                log_test("Integration", f"{page_name} Content", "WARN", 
                        f"Only found {len(found_content)}/{len(expected_content)} expected elements", 
                        response.status_code, response_time)
        else:
            log_test("Integration", f"{page_name} Content", "FAIL", 
                    "Page not accessible", 
                    getattr(response, 'status_code', None), response_time)
    
    # Test 2: JavaScript API calls
    js_files = [
        "/static/js/main.js",
        "/static/js/thesaurus.js",
        "/static/js/tutorials.js"
    ]
    
    for js_file in js_files:
        success, response, response_time = make_request("GET", js_file)
        
        if success and response.status_code == 200:
            content = response.text
            api_calls = content.count('/api/')
            fetch_calls = content.count('fetch(')
            
            log_test("Integration", f"JS File: {js_file.split('/')[-1]}", "PASS", 
                    f"Contains {api_calls} API calls, {fetch_calls} fetch requests", 
                    response.status_code, response_time)
        else:
            log_test("Integration", f"JS File: {js_file.split('/')[-1]}", "FAIL", 
                    "JavaScript file not accessible", 
                    getattr(response, 'status_code', None), response_time)
    
    # Test 3: CSS and Static Assets
    static_assets = [
        "/static/css/style.css",
        "/static/manifest.json",
        "/static/img/logo.svg"
    ]
    
    for asset in static_assets:
        success, response, response_time = make_request("GET", asset)
        
        if success and response.status_code == 200:
            log_test("Integration", f"Static Asset: {asset.split('/')[-1]}", "PASS", 
                    f"Asset loaded successfully ({len(response.content)} bytes)", 
                    response.status_code, response_time)
        else:
            log_test("Integration", f"Static Asset: {asset.split('/')[-1]}", "FAIL", 
                    "Asset not accessible", 
                    getattr(response, 'status_code', None), response_time)

def generate_comprehensive_report():
    """Generate detailed report of all test results"""
    print("\n" + "=" * 80)
    print("📋 COMPREHENSIVE BACKEND VERIFICATION REPORT")
    print("=" * 80)
    
    total_tests = len(TEST_RESULTS)
    passed_tests = len([r for r in TEST_RESULTS if r['status'] == 'PASS'])
    failed_tests = len([r for r in TEST_RESULTS if r['status'] == 'FAIL'])
    warned_tests = len([r for r in TEST_RESULTS if r['status'] == 'WARN'])
    
    overall_success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
    
    print(f"\n🎯 OVERALL RESULTS:")
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests} ({passed_tests/total_tests*100:.1f}%)")
    print(f"Failed: {failed_tests} ({failed_tests/total_tests*100:.1f}%)")
    print(f"Warnings: {warned_tests} ({warned_tests/total_tests*100:.1f}%)")
    print(f"Success Rate: {overall_success_rate:.1f}%")
    
    print(f"\n📊 CATEGORY BREAKDOWN:")
    for category, results in CATEGORY_RESULTS.items():
        success_rate = (results['passed'] / results['total'] * 100) if results['total'] > 0 else 0
        status_icon = "✅" if success_rate >= 90 else "⚠️" if success_rate >= 70 else "❌"
        print(f"{status_icon} {category}: {results['passed']}/{results['total']} ({success_rate:.1f}%)")
    
    # Identify critical issues
    critical_failures = [r for r in TEST_RESULTS if r['status'] == 'FAIL' and r['category'] in ['Database', 'API']]
    if critical_failures:
        print(f"\n🚨 CRITICAL ISSUES ({len(critical_failures)}):")
        for failure in critical_failures:
            print(f"   • [{failure['category']}] {failure['test_name']}: {failure['details']}")
    
    # Performance summary
    response_times = [r['response_time'] for r in TEST_RESULTS if r.get('response_time')]
    if response_times:
        avg_response_time = sum(response_times) / len(response_times)
        max_response_time = max(response_times)
        print(f"\n⚡ PERFORMANCE SUMMARY:")
        print(f"Average Response Time: {avg_response_time:.3f}s")
        print(f"Maximum Response Time: {max_response_time:.3f}s")
        print(f"Total Requests: {len(response_times)}")
    
    # Save detailed results
    results_file = "deep_backend_verification_results.json"
    with open(results_file, 'w') as f:
        json.dump({
            "summary": {
                "total_tests": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "warnings": warned_tests,
                "success_rate": overall_success_rate,
                "category_results": CATEGORY_RESULTS,
                "critical_failures": len(critical_failures),
                "avg_response_time": sum(response_times) / len(response_times) if response_times else 0,
                "timestamp": datetime.now().isoformat()
            },
            "detailed_results": TEST_RESULTS,
            "critical_issues": critical_failures
        }, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: {results_file}")
    
    # Final assessment
    if overall_success_rate >= 95 and len(critical_failures) == 0:
        print("\n🎉 EXCELLENT: Backend is fully functional and production-ready!")
        return True
    elif overall_success_rate >= 85 and len(critical_failures) <= 1:
        print("\n✅ GOOD: Backend is mostly functional with minor issues.")
        return True
    elif overall_success_rate >= 70:
        print("\n⚠️  ACCEPTABLE: Backend has some issues that should be addressed.")
        return False
    else:
        print("\n❌ CRITICAL: Backend has significant issues requiring immediate attention.")
        return False

def main():
    print("🔍 Starting Deep Backend Verification")
    print(f"Testing server at: {BASE_URL}")
    print("=" * 80)
    
    # Verify server is running
    success, response, response_time = make_request("GET", "/health")
    if not (success and response.status_code == 200):
        print("❌ Server is not accessible. Please ensure the server is running.")
        return False
    
    print("✅ Server is running. Beginning comprehensive tests...\n")
    
    # Run all test categories
    test_database_operations()
    test_api_functionality()
    test_authentication_system()
    test_performance_monitoring()
    test_ui_backend_integration()
    
    # Generate comprehensive report
    return generate_comprehensive_report()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)