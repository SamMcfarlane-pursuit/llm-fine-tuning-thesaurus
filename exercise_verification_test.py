#!/usr/bin/env python3
"""
Comprehensive Exercise Functionality Verification Test
Tests all exercise components to ensure proper operation
"""

import requests
import json
import time
from datetime import datetime
from urllib.parse import urljoin

BASE_URL = "http://localhost:5002"
TEST_RESULTS = []

def log_test(category, test_name, status, details="", response_code=None, response_time=None):
    """Log test results"""
    result = {
        "category": category,
        "test_name": test_name,
        "status": status,
        "timestamp": datetime.now().isoformat(),
        "details": details
    }
    if response_code:
        result["response_code"] = response_code
    if response_time:
        result["response_time"] = response_time
    
    TEST_RESULTS.append(result)
    status_icon = "✓" if status == "PASS" else "⚠" if status == "WARN" else "✗"
    print(f"{status_icon} [{category}] {test_name}: {status}")
    if details:
        print(f"   {details}")
    if response_code:
        print(f"   Response Code: {response_code}")
    if response_time:
        print(f"   Response Time: {response_time:.3f}s")

def test_exercise_pages():
    """Test exercise page accessibility"""
    print("\n🎯 EXERCISE PAGE TESTING")
    print("=" * 50)
    
    exercise_pages = [
        "/exercises",
        "/workshop_exercises",
        "/tutorials",
        "/learn"
    ]
    
    for page in exercise_pages:
        try:
            start_time = time.time()
            response = requests.get(urljoin(BASE_URL, page), timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                # Check for key exercise elements
                content = response.text.lower()
                exercise_indicators = [
                    "exercise", "start", "button", "interactive", 
                    "quiz", "tutorial", "learn", "practice"
                ]
                found_indicators = sum(1 for indicator in exercise_indicators if indicator in content)
                
                log_test(
                    "Exercise Pages", 
                    f"Page Access: {page}", 
                    "PASS",
                    f"Found {found_indicators}/{len(exercise_indicators)} exercise indicators",
                    response.status_code,
                    response_time
                )
            else:
                log_test(
                    "Exercise Pages", 
                    f"Page Access: {page}", 
                    "FAIL",
                    "Page not accessible",
                    response.status_code,
                    response_time
                )
        except Exception as e:
            log_test(
                "Exercise Pages", 
                f"Page Access: {page}", 
                "FAIL",
                f"Error: {str(e)}"
            )

def test_exercise_javascript():
    """Test exercise JavaScript files"""
    print("\n📜 EXERCISE JAVASCRIPT TESTING")
    print("=" * 50)
    
    js_files = [
        "/static/js/quiz.js",
        "/static/js/tutorials.js",
        "/static/js/learn-page.js",
        "/static/js/main.js"
    ]
    
    for js_file in js_files:
        try:
            start_time = time.time()
            response = requests.get(urljoin(BASE_URL, js_file), timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                content = response.text
                # Check for exercise-related functions
                exercise_functions = [
                    "function", "exercise", "quiz", "start", 
                    "addEventListener", "onclick", "interactive"
                ]
                found_functions = sum(1 for func in exercise_functions if func in content.lower())
                
                log_test(
                    "Exercise JavaScript", 
                    f"JS File: {js_file.split('/')[-1]}", 
                    "PASS",
                    f"Size: {len(content)} bytes, exercise functions: {found_functions}",
                    response.status_code,
                    response_time
                )
            else:
                log_test(
                    "Exercise JavaScript", 
                    f"JS File: {js_file.split('/')[-1]}", 
                    "WARN",
                    "File not accessible",
                    response.status_code,
                    response_time
                )
        except Exception as e:
            log_test(
                "Exercise JavaScript", 
                f"JS File: {js_file.split('/')[-1]}", 
                "FAIL",
                f"Error: {str(e)}"
            )

def test_exercise_apis():
    """Test exercise-related API endpoints"""
    print("\n🔌 EXERCISE API TESTING")
    print("=" * 50)
    
    api_endpoints = [
        "/api/quiz-test",
        "/quiz/api/random-question",
        "/quiz/api/results",
        "/api/exercises",
        "/api/tutorials"
    ]
    
    for endpoint in api_endpoints:
        try:
            start_time = time.time()
            response = requests.get(urljoin(BASE_URL, endpoint), timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    log_test(
                        "Exercise APIs", 
                        f"API: {endpoint}", 
                        "PASS",
                        f"JSON data with {len(data)} fields",
                        response.status_code,
                        response_time
                    )
                except:
                    log_test(
                        "Exercise APIs", 
                        f"API: {endpoint}", 
                        "PASS",
                        f"Response size: {len(response.text)} bytes",
                        response.status_code,
                        response_time
                    )
            else:
                log_test(
                    "Exercise APIs", 
                    f"API: {endpoint}", 
                    "WARN",
                    "API endpoint not available",
                    response.status_code,
                    response_time
                )
        except Exception as e:
            log_test(
                "Exercise APIs", 
                f"API: {endpoint}", 
                "FAIL",
                f"Error: {str(e)}"
            )

def test_exercise_interactivity():
    """Test exercise interactive elements"""
    print("\n🎮 EXERCISE INTERACTIVITY TESTING")
    print("=" * 50)
    
    # Test main exercise page for interactive elements
    try:
        response = requests.get(urljoin(BASE_URL, "/exercises"), timeout=10)
        if response.status_code == 200:
            content = response.text
            
            # Check for interactive elements
            interactive_elements = {
                "Start Buttons": content.count("start-btn"),
                "Exercise Cards": content.count("exercise-card"),
                "Click Handlers": content.count("onclick"),
                "Form Elements": content.count("<form"),
                "Input Fields": content.count("<input"),
                "JavaScript Functions": content.count("function")
            }
            
            for element, count in interactive_elements.items():
                status = "PASS" if count > 0 else "WARN"
                log_test(
                    "Exercise Interactivity", 
                    element, 
                    status,
                    f"Found {count} instances"
                )
        else:
            log_test(
                "Exercise Interactivity", 
                "Page Access", 
                "FAIL",
                "Cannot access exercises page"
            )
    except Exception as e:
        log_test(
            "Exercise Interactivity", 
            "Interactive Elements", 
            "FAIL",
            f"Error: {str(e)}"
        )

def test_exercise_resources():
    """Test exercise static resources"""
    print("\n📁 EXERCISE RESOURCES TESTING")
    print("=" * 50)
    
    resources = [
        "/static/css/style.css",
        "/static/images/exercises/",
        "/static/notebooks/",
        "/static/sounds/"
    ]
    
    for resource in resources:
        try:
            start_time = time.time()
            response = requests.get(urljoin(BASE_URL, resource), timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                log_test(
                    "Exercise Resources", 
                    f"Resource: {resource}", 
                    "PASS",
                    f"Size: {len(response.content)} bytes",
                    response.status_code,
                    response_time
                )
            else:
                log_test(
                    "Exercise Resources", 
                    f"Resource: {resource}", 
                    "WARN",
                    "Resource may not exist",
                    response.status_code,
                    response_time
                )
        except Exception as e:
            log_test(
                "Exercise Resources", 
                f"Resource: {resource}", 
                "FAIL",
                f"Error: {str(e)}"
            )

def generate_report():
    """Generate comprehensive test report"""
    print("\n" + "=" * 80)
    print("🎯 COMPREHENSIVE EXERCISE VERIFICATION REPORT")
    print("=" * 80)
    
    # Calculate statistics
    total_tests = len(TEST_RESULTS)
    passed = len([r for r in TEST_RESULTS if r["status"] == "PASS"])
    warnings = len([r for r in TEST_RESULTS if r["status"] == "WARN"])
    failed = len([r for r in TEST_RESULTS if r["status"] == "FAIL"])
    
    success_rate = (passed / total_tests * 100) if total_tests > 0 else 0
    
    print(f"\n🎯 OVERALL EXERCISE RESULTS:")
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed} ({passed/total_tests*100:.1f}%)")
    print(f"Failed: {failed} ({failed/total_tests*100:.1f}%)")
    print(f"Warnings: {warnings} ({warnings/total_tests*100:.1f}%)")
    print(f"Success Rate: {success_rate:.1f}%")
    
    # Category breakdown
    categories = {}
    for result in TEST_RESULTS:
        cat = result["category"]
        if cat not in categories:
            categories[cat] = {"passed": 0, "failed": 0, "total": 0}
        categories[cat]["total"] += 1
        if result["status"] == "PASS":
            categories[cat]["passed"] += 1
        elif result["status"] == "FAIL":
            categories[cat]["failed"] += 1
    
    print(f"\n📊 EXERCISE CATEGORY BREAKDOWN:")
    for cat, stats in categories.items():
        success = (stats["passed"] / stats["total"] * 100) if stats["total"] > 0 else 0
        status_icon = "✅" if success >= 80 else "❌" if success < 50 else "⚠️"
        print(f"{status_icon} {cat}: {stats['passed']}/{stats['total']} ({success:.1f}%)")
    
    # Performance metrics
    response_times = [r.get("response_time", 0) for r in TEST_RESULTS if r.get("response_time")]
    if response_times:
        avg_response_time = sum(response_times) / len(response_times)
        max_response_time = max(response_times)
        print(f"\n⚡ EXERCISE PERFORMANCE:")
        print(f"Average Response Time: {avg_response_time:.3f}s")
        print(f"Maximum Response Time: {max_response_time:.3f}s")
        print(f"Total Exercise Requests: {len(response_times)}")
    
    # Save detailed results
    with open("exercise_verification_results.json", "w") as f:
        json.dump({
            "summary": {
                "total_tests": total_tests,
                "passed": passed,
                "failed": failed,
                "warnings": warnings,
                "success_rate": success_rate,
                "category_results": categories,
                "exercise_failures": failed,
                "avg_response_time": sum(response_times) / len(response_times) if response_times else 0,
                "timestamp": datetime.now().isoformat()
            },
            "detailed_results": TEST_RESULTS
        }, f, indent=2)
    
    print(f"\n📄 Detailed exercise results saved to: exercise_verification_results.json")
    
    # Final assessment
    if success_rate >= 90:
        print(f"\n✅ EXCELLENT: Exercise system is functioning excellently.")
        return 0
    elif success_rate >= 75:
        print(f"\n✅ GOOD: Exercise system is functioning well with minor issues.")
        return 0
    elif success_rate >= 50:
        print(f"\n⚠️  ACCEPTABLE: Exercise system has some issues that should be addressed.")
        return 1
    else:
        print(f"\n❌ CRITICAL: Exercise system has significant issues requiring immediate attention.")
        return 1

def main():
    """Main test execution"""
    print("🎯 Starting Comprehensive Exercise Verification...")
    print(f"Testing against: {BASE_URL}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Run all tests
    test_exercise_pages()
    test_exercise_javascript()
    test_exercise_apis()
    test_exercise_interactivity()
    test_exercise_resources()
    
    # Generate report
    exit_code = generate_report()
    return exit_code

if __name__ == "__main__":
    exit(main())