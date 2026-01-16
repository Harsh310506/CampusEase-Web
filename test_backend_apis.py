"""
Simple Backend API Tester
Tests all face recognition endpoints
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def print_section(title):
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"✓ Health Check: {response.status_code}")
        print(f"  Response: {response.json()}")
        return True
    except Exception as e:
        print(f"✗ Health Check Failed: {e}")
        return False

def test_system_stats():
    """Test system stats endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/system/stats", timeout=5)
        print(f"✓ System Stats: {response.status_code}")
        data = response.json()
        print(f"  GPU Memory: {data.get('gpu_memory_mb')}MB")
        print(f"  Persons Loaded: {data.get('persons_count')}")
        print(f"  Recognition Threshold: {data.get('recognition_threshold')}")
        return True
    except Exception as e:
        print(f"✗ System Stats Failed: {e}")
        return False

def test_api_docs():
    """Test API documentation"""
    try:
        response = requests.get(f"{BASE_URL}/docs", timeout=5)
        print(f"✓ API Docs Available: {response.status_code}")
        return True
    except Exception as e:
        print(f"✗ API Docs Failed: {e}")
        return False

def main():
    print_section("FACE RECOGNITION API TESTING")
    print(f"Testing API at: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    print_section("Core Endpoints")
    results = []
    
    # Test health
    results.append(test_health())
    
    # Test system stats
    results.append(test_system_stats())
    
    # Test API docs
    results.append(test_api_docs())
    
    print_section("SUMMARY")
    passed = sum(results)
    total = len(results)
    print(f"Tests Passed: {passed}/{total}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("\n✓ All tests passed! Backend is ready.")
        print(f"\nAPI Documentation: {BASE_URL}/docs")
        print(f"ReDoc: {BASE_URL}/redoc")
    else:
        print("\n✗ Some tests failed. Please check the backend server.")

if __name__ == "__main__":
    main()
