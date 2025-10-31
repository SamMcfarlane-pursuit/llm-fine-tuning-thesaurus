#!/usr/bin/env python3
"""
Functionality Test Script for Thesaurus AI Application
Tests core functions without CSRF requirements
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:5002"

def test_health_endpoint():
    """Test health endpoint"""
    print("\n🔍 Testing Health Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed - Status: {data.get('status', 'unknown')}")
            print(f"   Memory usage: {data.get('performance', {}).get('memory_usage', 'N/A')}%")
            print(f"   CPU usage: {data.get('performance', {}).get('cpu_usage', 'N/A')}%")
            return True
        else:
            print(f"❌ Health check failed - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_system_status():
    """Test system status endpoint"""
    print("\n🔍 Testing System Status...")
    try:
        response = requests.get(f"{BASE_URL}/api/system/status", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ System status check passed - Status: {data.get('status', 'unknown')}")
            features = data.get('features', {})
            print(f"   Rate limiting: {'✅' if features.get('rate_limiting') else '❌'}")
            print(f"   Performance monitoring: {'✅' if features.get('performance_monitoring') else '❌'}")
            print(f"   Crash prevention: {'✅' if features.get('crash_prevention') else '❌'}")
            return True
        else:
            print(f"❌ System status failed - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ System status error: {e}")
        return False

def test_database_stats():
    """Test database stats endpoint"""
    print("\n🔍 Testing Database Stats...")
    try:
        response = requests.get(f"{BASE_URL}/api/database/stats", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Database stats check passed - Status: {data.get('status', 'unknown')}")
            db_data = data.get('data', {})
            print(f"   Database type: {db_data.get('database_type', 'N/A')}")
            print(f"   Connection status: {db_data.get('connection_status', 'N/A')}")
            return True
        else:
            print(f"❌ Database stats failed - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Database stats error: {e}")
        return False

def test_thesaurus_get():
    """Test thesaurus GET endpoint"""
    print("\n🔍 Testing Thesaurus GET Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/thesaurus", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Thesaurus GET passed - Message: {data.get('message', 'N/A')}")
            print(f"   Rate limit: {data.get('rate_limit', 'N/A')}")
            print(f"   Max connections: {data.get('max_connections', 'N/A')}")
            return True
        else:
            print(f"❌ Thesaurus GET failed - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Thesaurus GET error: {e}")
        return False

def test_performance_metrics():
    """Test performance metrics endpoint"""
    print("\n🔍 Testing Performance Metrics...")
    try:
        response = requests.get(f"{BASE_URL}/api/performance/metrics", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Performance metrics passed")
            print(f"   CPU usage: {data.get('cpu_usage', 'N/A')}%")
            print(f"   Memory usage: {data.get('memory_usage', 'N/A')}%")
            print(f"   Active connections: {data.get('active_connections', 'N/A')}")
            return True
        else:
            print(f"❌ Performance metrics failed - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Performance metrics error: {e}")
        return False

def test_home_page():
    """Test home page loading"""
    print("\n🔍 Testing Home Page...")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        if response.status_code == 200:
            content = response.text
            if "Thesaurus" in content and "<!DOCTYPE html>" in content:
                print("✅ Home page loads successfully with expected content")
                return True
            else:
                print("❌ Home page missing expected content")
                return False
        else:
            print(f"❌ Home page failed - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Home page error: {e}")
        return False

def test_error_handling():
    """Test error handling with invalid endpoint"""
    print("\n🔍 Testing Error Handling...")
    try:
        response = requests.get(f"{BASE_URL}/invalid-endpoint-test", timeout=10)
        if response.status_code == 404:
            print("✅ Error handling works correctly (404 for invalid endpoint)")
            return True
        else:
            print(f"❌ Unexpected status for invalid endpoint: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error handling test error: {e}")
        return False

def run_all_tests():
    """Run all functionality tests"""
    print("="*70)
    print("🧪 THESAURUS AI FUNCTIONALITY TEST SUITE")
    print("="*70)
    print(f"🕐 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tests = [
        ("Health Endpoint", test_health_endpoint),
        ("System Status", test_system_status),
        ("Database Stats", test_database_stats),
        ("Thesaurus GET", test_thesaurus_get),
        ("Performance Metrics", test_performance_metrics),
        ("Home Page", test_home_page),
        ("Error Handling", test_error_handling)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        if test_func():
            passed += 1
        time.sleep(0.5)  # Small delay between tests
    
    print("\n" + "="*70)
    print("📊 TEST RESULTS SUMMARY")
    print("="*70)
    print(f"✅ Passed: {passed}/{total} tests")
    print(f"❌ Failed: {total - passed}/{total} tests")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! Application is fully functional.")
    else:
        print(f"⚠️  {total - passed} test(s) failed. Please review the issues above.")
    
    print(f"🕐 Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    return passed == total

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)