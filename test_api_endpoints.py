"""
API Endpoint Testing Script
Tests all API endpoints when servers are running
"""
import requests
import json
from datetime import datetime
import time

# Configuration
FLASK_URL = "http://localhost:5000"
FASTAPI_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:8080"

print("\n" + "="*80)
print("API ENDPOINT TESTING")
print("="*80)
print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("\nMake sure all servers are running:")
print("  - Flask API (port 5000)")
print("  - FastAPI (port 8000)")
print("  - Frontend (port 8080)")
print("="*80 + "\n")

input("Press Enter when servers are ready...")

results = []

def test_endpoint(name, method, url, data=None, files=None):
    """Test a single endpoint"""
    try:
        start_time = time.time()
        
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            if files:
                response = requests.post(url, files=files, data=data, timeout=10)
            else:
                response = requests.post(url, json=data, timeout=10)
        
        elapsed = time.time() - start_time
        
        result = {
            "name": name,
            "method": method,
            "url": url,
            "status_code": response.status_code,
            "elapsed_ms": round(elapsed * 1000, 2),
            "success": 200 <= response.status_code < 300
        }
        
        try:
            result["response"] = response.json()
        except:
            result["response"] = response.text[:200]
        
        results.append(result)
        
        status_icon = "✓" if result["success"] else "✗"
        print(f"{status_icon} {name}")
        print(f"  URL: {url}")
        print(f"  Status: {response.status_code}")
        print(f"  Time: {result['elapsed_ms']}ms")
        if result["success"]:
            print(f"  Response: {str(result['response'])[:100]}")
        print()
        
        return result
        
    except requests.exceptions.ConnectionError:
        result = {
            "name": name,
            "method": method,
            "url": url,
            "error": "Connection refused - server not running",
            "success": False
        }
        results.append(result)
        print(f"✗ {name}")
        print(f"  URL: {url}")
        print(f"  Error: Server not responding")
        print()
        return result
        
    except Exception as e:
        result = {
            "name": name,
            "method": method,
            "url": url,
            "error": str(e),
            "success": False
        }
        results.append(result)
        print(f"✗ {name}")
        print(f"  Error: {e}")
        print()
        return result

# Test Flask API
print("\n" + "="*80)
print("TESTING FLASK API (Priority Prediction System)")
print("="*80 + "\n")

test_endpoint("Flask Health Check", "GET", f"{FLASK_URL}/health")

test_endpoint("Sync Weights", "POST", f"{FLASK_URL}/sync_weights")

test_endpoint("Priority Prediction", "POST", f"{FLASK_URL}/predict", data={
    "category": "Infrastructure",
    "impact_scope": "Whole class affected",
    "occurrence_pattern": "Recurring issue",
    "description": "Test report"
})

# Test FastAPI
print("\n" + "="*80)
print("TESTING FASTAPI (Face Recognition System)")
print("="*80 + "\n")

test_endpoint("FastAPI Root", "GET", f"{FASTAPI_URL}/")

test_endpoint("FastAPI Health", "GET", f"{FASTAPI_URL}/health")

test_endpoint("System Stats", "GET", f"{FASTAPI_URL}/system/stats")

test_endpoint("Face Training Status", "GET", f"{FASTAPI_URL}/students/25DIT5697/face-training-status")

# Test Frontend
print("\n" + "="*80)
print("TESTING FRONTEND")
print("="*80 + "\n")

test_endpoint("Frontend Homepage", "GET", FRONTEND_URL)

# Summary
print("\n" + "="*80)
print("TEST SUMMARY")
print("="*80)

total = len(results)
passed = sum(1 for r in results if r.get("success", False))
failed = total - passed

print(f"\nTotal Endpoints Tested: {total}")
print(f"✓ Passed: {passed}")
print(f"✗ Failed: {failed}")
print(f"Success Rate: {(passed/total*100):.1f}%")

# Calculate average response time
successful_times = [r["elapsed_ms"] for r in results if "elapsed_ms" in r]
if successful_times:
    avg_time = sum(successful_times) / len(successful_times)
    print(f"\nAverage Response Time: {avg_time:.2f}ms")

# Save results
filename = f"api_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
with open(filename, 'w') as f:
    json.dump({
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "total": total,
            "passed": passed,
            "failed": failed,
            "success_rate": f"{(passed/total*100):.1f}%"
        },
        "results": results
    }, f, indent=2)

print(f"\nDetailed results saved to: {filename}")
print("\n" + "="*80)

# Show failed endpoints
if failed > 0:
    print("\nFAILED ENDPOINTS:")
    print("-" * 80)
    for result in results:
        if not result.get("success", False):
            print(f"✗ {result['name']}")
            print(f"  URL: {result['url']}")
            if "error" in result:
                print(f"  Error: {result['error']}")
            print()
    print("="*80)

print("\nTesting complete!")
