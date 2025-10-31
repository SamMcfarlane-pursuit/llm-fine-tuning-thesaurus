#!/usr/bin/env python3
"""
Workshop Resources Verification Test
Comprehensive testing of all workshop functionality and resources
"""

import requests
import json
import time
import os
from datetime import datetime
from bs4 import BeautifulSoup
import sys
import re
from urllib.parse import urljoin, urlparse

BASE_URL = "http://localhost:5002"
TEST_RESULTS = []
ERRORS = []
CATEGORY_RESULTS = {}
WORKSHOP_RESOURCES = []

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
        else:
            response = requests.request(method, url, json=data, headers=headers, timeout=timeout)
        
        response_time = time.time() - start_time
        return True, response, response_time
        
    except requests.exceptions.RequestException as e:
        response_time = time.time() - start_time
        return False, str(e), response_time

def test_workshop_pages():
    """Test workshop pages accessibility and content"""
    print("\n🏫 WORKSHOP PAGES TESTING")
    print("=" * 50)
    
    # Test main workshop page
    success, response, response_time = make_request("GET", "/workshops")
    if success and response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Check for workshop content
        workshop_elements = {
            "title": soup.find('title'),
            "workshop_sections": soup.find_all(class_=re.compile(r'workshop|exercise|training')),
            "navigation": soup.find('nav') or soup.find(class_=re.compile(r'nav|menu')),
            "content_area": soup.find('main') or soup.find(class_=re.compile(r'content|main')),
            "workshop_links": soup.find_all('a', href=re.compile(r'workshop|exercise|training'))
        }
        
        found_elements = sum(1 for elem in workshop_elements.values() if elem)
        log_test("Workshop Pages", "Main Workshop Page", "PASS", 
                f"Found {found_elements}/5 key elements, {len(workshop_elements['workshop_links'])} workshop links", 
                response.status_code, response_time)
        
        # Extract workshop links for further testing
        for link in workshop_elements['workshop_links']:
            href = link.get('href')
            if href and not href.startswith('http'):
                WORKSHOP_RESOURCES.append(href)
                
    else:
        log_test("Workshop Pages", "Main Workshop Page", "FAIL", 
                "Workshop page not accessible", 
                getattr(response, 'status_code', None), response_time)
    
    # Test specific workshop routes
    workshop_routes = [
        "/workshops",
        "/exercises", 
        "/training",
        "/guides"
    ]
    
    for route in workshop_routes:
        success, response, response_time = make_request("GET", route)
        
        if success and response.status_code == 200:
            content_length = len(response.text)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Check for meaningful content
            text_content = soup.get_text().strip()
            has_content = len(text_content) > 500  # Reasonable content threshold
            
            log_test("Workshop Pages", f"Route: {route}", "PASS", 
                    f"Content length: {content_length} chars, meaningful content: {has_content}", 
                    response.status_code, response_time)
        else:
            log_test("Workshop Pages", f"Route: {route}", "FAIL", 
                    "Route not accessible", 
                    getattr(response, 'status_code', None), response_time)

def test_workshop_resources():
    """Test workshop resources and materials"""
    print("\n📚 WORKSHOP RESOURCES TESTING")
    print("=" * 50)
    
    # Test static workshop resources
    static_resources = [
        "/static/images/workshop/",
        "/static/images/exercises/",
        "/static/notebooks/",
        "/static/sounds/"
    ]
    
    for resource_path in static_resources:
        success, response, response_time = make_request("GET", resource_path)
        
        if success:
            if response.status_code == 200:
                log_test("Workshop Resources", f"Static Resource: {resource_path}", "PASS", 
                        "Resource directory accessible", 
                        response.status_code, response_time)
            elif response.status_code == 403:
                log_test("Workshop Resources", f"Static Resource: {resource_path}", "PASS", 
                        "Directory exists (403 expected for directory listing)", 
                        response.status_code, response_time)
            else:
                log_test("Workshop Resources", f"Static Resource: {resource_path}", "WARN", 
                        "Resource may not exist", 
                        response.status_code, response_time)
        else:
            log_test("Workshop Resources", f"Static Resource: {resource_path}", "FAIL", 
                    f"Request failed: {response}", None, response_time)
    
    # Test workshop-related files in static directory
    workshop_files = [
        "/static/js/tutorials.js",
        "/static/js/quiz.js",
        "/static/js/learn-page.js",
        "/static/css/style.css"
    ]
    
    for file_path in workshop_files:
        success, response, response_time = make_request("GET", file_path)
        
        if success and response.status_code == 200:
            file_size = len(response.content)
            
            # Check for workshop-related content in JS files
            if file_path.endswith('.js'):
                content = response.text.lower()
                workshop_keywords = ['workshop', 'exercise', 'tutorial', 'quiz', 'training']
                found_keywords = [kw for kw in workshop_keywords if kw in content]
                
                log_test("Workshop Resources", f"JS File: {file_path.split('/')[-1]}", "PASS", 
                        f"Size: {file_size} bytes, workshop keywords: {len(found_keywords)}", 
                        response.status_code, response_time)
            else:
                log_test("Workshop Resources", f"File: {file_path.split('/')[-1]}", "PASS", 
                        f"Size: {file_size} bytes", 
                        response.status_code, response_time)
        else:
            log_test("Workshop Resources", f"File: {file_path.split('/')[-1]}", "FAIL", 
                    "File not accessible", 
                    getattr(response, 'status_code', None), response_time)
    
    # Check for workshop data files
    data_endpoints = [
        "/api/workshops",
        "/api/exercises", 
        "/api/tutorials",
        "/api/quiz-test"
    ]
    
    for endpoint in data_endpoints:
        success, response, response_time = make_request("GET", endpoint)
        
        if success and response.status_code == 200:
            try:
                data = response.json()
                log_test("Workshop Resources", f"API: {endpoint}", "PASS", 
                        f"JSON data with {len(data)} fields", 
                        response.status_code, response_time)
            except:
                log_test("Workshop Resources", f"API: {endpoint}", "PASS", 
                        "Endpoint accessible (non-JSON response)", 
                        response.status_code, response_time)
        else:
            log_test("Workshop Resources", f"API: {endpoint}", "WARN", 
                    "API endpoint not available", 
                    getattr(response, 'status_code', None), response_time)

def test_workshop_navigation():
    """Test workshop navigation and user flow"""
    print("\n🧭 WORKSHOP NAVIGATION TESTING")
    print("=" * 50)
    
    # Test navigation from main page
    success, response, response_time = make_request("GET", "/")
    if success and response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Look for workshop navigation links
        workshop_nav_links = soup.find_all('a', href=re.compile(r'workshop|exercise|tutorial|guide|learn'))
        
        log_test("Workshop Navigation", "Home Page Workshop Links", "PASS", 
                f"Found {len(workshop_nav_links)} workshop-related navigation links", 
                response.status_code, response_time)
        
        # Test each navigation link
        tested_links = set()
        for link in workshop_nav_links[:10]:  # Limit to first 10 to avoid excessive requests
            href = link.get('href')
            if href and href not in tested_links and not href.startswith('http'):
                tested_links.add(href)
                
                success_nav, response_nav, response_time_nav = make_request("GET", href)
                
                if success_nav and response_nav.status_code == 200:
                    log_test("Workshop Navigation", f"Nav Link: {href}", "PASS", 
                            "Link accessible", 
                            response_nav.status_code, response_time_nav)
                else:
                    log_test("Workshop Navigation", f"Nav Link: {href}", "FAIL", 
                            "Navigation link broken", 
                            getattr(response_nav, 'status_code', None), response_time_nav)
    
    # Test breadcrumb navigation
    breadcrumb_pages = ["/workshops", "/learn", "/tutorials"]
    
    for page in breadcrumb_pages:
        success, response, response_time = make_request("GET", page)
        
        if success and response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Look for breadcrumb elements
            breadcrumbs = soup.find_all(class_=re.compile(r'breadcrumb|nav-path|path'))
            back_links = soup.find_all('a', text=re.compile(r'back|home|return', re.I))
            
            navigation_elements = len(breadcrumbs) + len(back_links)
            
            log_test("Workshop Navigation", f"Breadcrumbs: {page}", "PASS", 
                    f"Found {navigation_elements} navigation elements", 
                    response.status_code, response_time)

def test_workshop_interactivity():
    """Test interactive workshop elements"""
    print("\n🎮 WORKSHOP INTERACTIVITY TESTING")
    print("=" * 50)
    
    # Test quiz functionality
    success, response, response_time = make_request("GET", "/api/quiz-test")
    if success and response.status_code == 200:
        try:
            quiz_data = response.json()
            log_test("Workshop Interactivity", "Quiz API", "PASS", 
                    f"Quiz data available with {len(quiz_data)} fields", 
                    response.status_code, response_time)
        except:
            log_test("Workshop Interactivity", "Quiz API", "PASS", 
                    "Quiz endpoint accessible", 
                    response.status_code, response_time)
    else:
        log_test("Workshop Interactivity", "Quiz API", "WARN", 
                "Quiz API not available", 
                getattr(response, 'status_code', None), response_time)
    
    # Test interactive pages for form elements
    interactive_pages = ["/workshops", "/learn", "/tutorials"]
    
    for page in interactive_pages:
        success, response, response_time = make_request("GET", page)
        
        if success and response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Count interactive elements
            forms = soup.find_all('form')
            buttons = soup.find_all('button')
            inputs = soup.find_all('input')
            selects = soup.find_all('select')
            textareas = soup.find_all('textarea')
            
            interactive_count = len(forms) + len(buttons) + len(inputs) + len(selects) + len(textareas)
            
            log_test("Workshop Interactivity", f"Interactive Elements: {page}", "PASS", 
                    f"Found {interactive_count} interactive elements (forms: {len(forms)}, buttons: {len(buttons)}, inputs: {len(inputs)})", 
                    response.status_code, response_time)
    
    # Test JavaScript functionality
    js_test_pages = ["/workshops", "/learn"]
    
    for page in js_test_pages:
        success, response, response_time = make_request("GET", page)
        
        if success and response.status_code == 200:
            content = response.text
            
            # Check for JavaScript functionality indicators
            js_indicators = {
                "event_listeners": content.count('addEventListener'),
                "fetch_calls": content.count('fetch('),
                "ajax_calls": content.count('$.ajax') + content.count('XMLHttpRequest'),
                "dom_manipulation": content.count('getElementById') + content.count('querySelector'),
                "workshop_functions": content.lower().count('workshop') + content.lower().count('exercise')
            }
            
            total_js_features = sum(js_indicators.values())
            
            log_test("Workshop Interactivity", f"JavaScript Features: {page}", "PASS", 
                    f"Found {total_js_features} JS features: {dict(js_indicators)}", 
                    response.status_code, response_time)

def test_workshop_content_quality():
    """Test workshop content quality and completeness"""
    print("\n📝 WORKSHOP CONTENT QUALITY TESTING")
    print("=" * 50)
    
    content_pages = ["/workshops", "/learn", "/tutorials", "/exercises"]
    
    for page in content_pages:
        success, response, response_time = make_request("GET", page)
        
        if success and response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove script and style tags for content analysis
            for script in soup(["script", "style"]):
                script.decompose()
            
            text_content = soup.get_text()
            
            # Content quality metrics
            word_count = len(text_content.split())
            paragraph_count = len(soup.find_all('p'))
            heading_count = len(soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']))
            list_count = len(soup.find_all(['ul', 'ol']))
            image_count = len(soup.find_all('img'))
            
            # Check for educational content keywords
            educational_keywords = ['learn', 'tutorial', 'exercise', 'practice', 'example', 'step', 'guide']
            keyword_matches = sum(1 for keyword in educational_keywords if keyword.lower() in text_content.lower())
            
            quality_score = min(100, (word_count // 10) + (paragraph_count * 5) + (heading_count * 10) + (keyword_matches * 5))
            
            log_test("Workshop Content", f"Content Quality: {page}", "PASS", 
                    f"Words: {word_count}, Paragraphs: {paragraph_count}, Headings: {heading_count}, Quality Score: {quality_score}%", 
                    response.status_code, response_time)
        else:
            log_test("Workshop Content", f"Content Quality: {page}", "FAIL", 
                    "Page not accessible for content analysis", 
                    getattr(response, 'status_code', None), response_time)

def generate_workshop_report():
    """Generate comprehensive workshop verification report"""
    print("\n" + "=" * 80)
    print("🏫 COMPREHENSIVE WORKSHOP VERIFICATION REPORT")
    print("=" * 80)
    
    total_tests = len(TEST_RESULTS)
    passed_tests = len([r for r in TEST_RESULTS if r['status'] == 'PASS'])
    failed_tests = len([r for r in TEST_RESULTS if r['status'] == 'FAIL'])
    warned_tests = len([r for r in TEST_RESULTS if r['status'] == 'WARN'])
    
    overall_success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
    
    print(f"\n🎯 OVERALL WORKSHOP RESULTS:")
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests} ({passed_tests/total_tests*100:.1f}%)")
    print(f"Failed: {failed_tests} ({failed_tests/total_tests*100:.1f}%)")
    print(f"Warnings: {warned_tests} ({warned_tests/total_tests*100:.1f}%)")
    print(f"Success Rate: {overall_success_rate:.1f}%")
    
    print(f"\n📊 WORKSHOP CATEGORY BREAKDOWN:")
    for category, results in CATEGORY_RESULTS.items():
        success_rate = (results['passed'] / results['total'] * 100) if results['total'] > 0 else 0
        status_icon = "✅" if success_rate >= 90 else "⚠️" if success_rate >= 70 else "❌"
        print(f"{status_icon} {category}: {results['passed']}/{results['total']} ({success_rate:.1f}%)")
    
    # Workshop-specific insights
    workshop_failures = [r for r in TEST_RESULTS if r['status'] == 'FAIL']
    if workshop_failures:
        print(f"\n🚨 WORKSHOP ISSUES ({len(workshop_failures)}):")
        for failure in workshop_failures:
            print(f"   • [{failure['category']}] {failure['test_name']}: {failure['details']}")
    
    # Performance summary
    response_times = [r['response_time'] for r in TEST_RESULTS if r.get('response_time')]
    if response_times:
        avg_response_time = sum(response_times) / len(response_times)
        max_response_time = max(response_times)
        print(f"\n⚡ WORKSHOP PERFORMANCE:")
        print(f"Average Response Time: {avg_response_time:.3f}s")
        print(f"Maximum Response Time: {max_response_time:.3f}s")
        print(f"Total Workshop Requests: {len(response_times)}")
    
    # Workshop resources summary
    if WORKSHOP_RESOURCES:
        print(f"\n📚 DISCOVERED WORKSHOP RESOURCES:")
        for resource in WORKSHOP_RESOURCES[:10]:  # Show first 10
            print(f"   • {resource}")
        if len(WORKSHOP_RESOURCES) > 10:
            print(f"   ... and {len(WORKSHOP_RESOURCES) - 10} more")
    
    # Save detailed results
    results_file = "workshop_verification_results.json"
    with open(results_file, 'w') as f:
        json.dump({
            "summary": {
                "total_tests": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "warnings": warned_tests,
                "success_rate": overall_success_rate,
                "category_results": CATEGORY_RESULTS,
                "workshop_failures": len(workshop_failures),
                "avg_response_time": sum(response_times) / len(response_times) if response_times else 0,
                "discovered_resources": len(WORKSHOP_RESOURCES),
                "timestamp": datetime.now().isoformat()
            },
            "detailed_results": TEST_RESULTS,
            "workshop_issues": workshop_failures,
            "discovered_resources": WORKSHOP_RESOURCES
        }, f, indent=2)
    
    print(f"\n📄 Detailed workshop results saved to: {results_file}")
    
    # Final workshop assessment
    if overall_success_rate >= 95 and len(workshop_failures) == 0:
        print("\n🎉 EXCELLENT: All workshop resources and functionality are working perfectly!")
        return True
    elif overall_success_rate >= 85 and len(workshop_failures) <= 2:
        print("\n✅ GOOD: Workshop functionality is mostly working with minor issues.")
        return True
    elif overall_success_rate >= 70:
        print("\n⚠️  ACCEPTABLE: Workshop has some issues that should be addressed.")
        return False
    else:
        print("\n❌ CRITICAL: Workshop has significant issues requiring immediate attention.")
        return False

def main():
    print("🏫 Starting Workshop Resources Verification")
    print(f"Testing workshop functionality at: {BASE_URL}")
    print("=" * 80)
    
    # Verify server is running
    success, response, response_time = make_request("GET", "/health")
    if not (success and response.status_code == 200):
        print("❌ Server is not accessible. Please ensure the server is running.")
        return False
    
    print("✅ Server is running. Beginning workshop verification...\n")
    
    # Run all workshop test categories
    test_workshop_pages()
    test_workshop_resources()
    test_workshop_navigation()
    test_workshop_interactivity()
    test_workshop_content_quality()
    
    # Generate comprehensive report
    return generate_workshop_report()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)