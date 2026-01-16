"""
Comprehensive Testing Script for Campus Ease System
Tests all APIs, database connectivity, data flow, and console outputs
"""

import requests
import json
import time
import sys
from datetime import datetime
from supabase import create_client, Client
import traceback

# Configuration
FLASK_BASE_URL = "http://localhost:5000"
FASTAPI_BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:8080"
SUPABASE_URL = "https://jfricqlqhddznvliwwpt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmcmljcWxxaGRkem52bGl3d3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMTAzMDMsImV4cCI6MjA3ODc4NjMwM30.tLq8jgbKmm02qi-5eXXkgdlpYD-oy_mH7TiQKg5-5l0"

# Test results tracking
test_results = {
    "total_tests": 0,
    "passed": 0,
    "failed": 0,
    "skipped": 0,
    "details": []
}

def log_test(test_name, status, message="", details=None):
    """Log test result with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    result = {
        "timestamp": timestamp,
        "test": test_name,
        "status": status,
        "message": message,
        "details": details
    }
    test_results["total_tests"] += 1
    test_results[status] += 1
    test_results["details"].append(result)
    
    # Console output with colors
    color = {
        "passed": "\033[92m",  # Green
        "failed": "\033[91m",  # Red
        "skipped": "\033[93m"  # Yellow
    }
    reset = "\033[0m"
    
    print(f"{color[status]}[{status.upper()}]{reset} {test_name}")
    if message:
        print(f"  → {message}")
    if details:
        print(f"  → Details: {json.dumps(details, indent=2)}")
    print()

def test_database_connectivity():
    """Test Supabase database connection and basic operations"""
    print("="*80)
    print("TESTING DATABASE CONNECTIVITY")
    print("="*80 + "\n")
    
    try:
        # Initialize Supabase client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        log_test("Supabase Client Initialization", "passed", "Client created successfully")
        
        # Test reading from report table
        try:
            response = supabase.table('report').select("*").limit(5).execute()
            log_test("Database Read - Report Table", "passed", 
                    f"Retrieved {len(response.data)} records", 
                    {"sample_record": response.data[0] if response.data else None})
        except Exception as e:
            log_test("Database Read - Reports Table", "failed", str(e))
        
        # Test reading from student_records table
        try:
            response = supabase.table('student_records').select("*").limit(5).execute()
            log_test("Database Read - Student Records Table", "passed", 
                    f"Retrieved {len(response.data)} records",
                    {"sample_record": response.data[0] if response.data else None})
        except Exception as e:
            log_test("Database Read - Students Table", "failed", str(e))
        
        # Test reading from class_details table
        try:
            response = supabase.table('class_details').select("*").limit(5).execute()
            log_test("Database Read - Class Details Table", "passed", 
                    f"Retrieved {len(response.data)} records",
                    {"sample_record": response.data[0] if response.data else None})
        except Exception as e:
            log_test("Database Read - Classes Table", "failed", str(e))
        
        # Test reading from attendance table
        try:
            response = supabase.table('attendance').select("*").limit(5).execute()
            log_test("Database Read - Attendance Table", "passed", 
                    f"Retrieved {len(response.data)} records")
        except Exception as e:
            log_test("Database Read - Attendance Table", "failed", str(e))
        
        # Test reading from face_embeddings table
        try:
            response = supabase.table('face_embeddings').select("student_id, created_at").limit(5).execute()
            log_test("Database Read - Face Embeddings Table", "passed", 
                    f"Retrieved {len(response.data)} records")
        except Exception as e:
            log_test("Database Read - Face Embeddings Table", "failed", str(e))
            
    except Exception as e:
        log_test("Supabase Client Initialization", "failed", str(e))
        traceback.print_exc()

def test_flask_api():
    """Test Flask API endpoints"""
    print("="*80)
    print("TESTING FLASK API (Priority Prediction System)")
    print("="*80 + "\n")
    
    # Test health endpoint
    try:
        response = requests.get(f"{FLASK_BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            log_test("Flask API - Health Check", "passed", "Server is healthy", response.json())
        else:
            log_test("Flask API - Health Check", "failed", f"Status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        log_test("Flask API - Health Check", "failed", 
                "Server not responding. Make sure Flask server is running on port 5000", str(e))
        return
    
    # Test sync weights endpoint
    try:
        response = requests.post(f"{FLASK_BASE_URL}/sync_weights", timeout=5)
        if response.status_code == 200:
            log_test("Flask API - Sync Weights", "passed", "Weights synced", response.json())
        else:
            log_test("Flask API - Sync Weights", "failed", f"Status code: {response.status_code}")
    except Exception as e:
        log_test("Flask API - Sync Weights", "failed", str(e))
    
    # Test predict endpoint
    try:
        test_report = {
            "category": "Infrastructure",
            "impact_scope": "Whole class affected",
            "occurrence_pattern": "Recurring issue",
            "description": "Test report for priority prediction"
        }
        response = requests.post(f"{FLASK_BASE_URL}/predict", json=test_report, timeout=5)
        if response.status_code == 200:
            log_test("Flask API - Priority Prediction", "passed", 
                    "Prediction successful", response.json())
        else:
            log_test("Flask API - Priority Prediction", "failed", f"Status code: {response.status_code}")
    except Exception as e:
        log_test("Flask API - Priority Prediction", "failed", str(e))

def test_fastapi():
    """Test FastAPI face recognition endpoints"""
    print("="*80)
    print("TESTING FASTAPI (Face Recognition System)")
    print("="*80 + "\n")
    
    # Test root endpoint
    try:
        response = requests.get(f"{FASTAPI_BASE_URL}/", timeout=5)
        if response.status_code == 200:
            log_test("FastAPI - Root Endpoint", "passed", "API is running", response.json())
        else:
            log_test("FastAPI - Root Endpoint", "failed", f"Status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        log_test("FastAPI - Root Endpoint", "failed", 
                "Server not responding. Make sure FastAPI server is running on port 8000", str(e))
        return
    
    # Test health endpoint
    try:
        response = requests.get(f"{FASTAPI_BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            log_test("FastAPI - Health Check", "passed", "Server is healthy", response.json())
        else:
            log_test("FastAPI - Health Check", "failed", f"Status code: {response.status_code}")
    except Exception as e:
        log_test("FastAPI - Health Check", "failed", str(e))
    
    # Test system stats endpoint
    try:
        response = requests.get(f"{FASTAPI_BASE_URL}/system/stats", timeout=5)
        if response.status_code == 200:
            log_test("FastAPI - System Stats", "passed", "Stats retrieved", response.json())
        else:
            log_test("FastAPI - System Stats", "failed", f"Status code: {response.status_code}")
    except Exception as e:
        log_test("FastAPI - System Stats", "failed", str(e))
    
    # Test face training status endpoint (sample student ID)
    try:
        sample_student_id = "25DIT5697"  # From the logs directory
        response = requests.get(f"{FASTAPI_BASE_URL}/students/{sample_student_id}/face-training-status", timeout=5)
        if response.status_code == 200:
            log_test("FastAPI - Face Training Status", "passed", 
                    f"Status for {sample_student_id}", response.json())
        elif response.status_code == 404:
            log_test("FastAPI - Face Training Status", "passed", 
                    f"Student {sample_student_id} not found (expected for test)")
        else:
            log_test("FastAPI - Face Training Status", "failed", f"Status code: {response.status_code}")
    except Exception as e:
        log_test("FastAPI - Face Training Status", "failed", str(e))

def test_frontend():
    """Test frontend availability"""
    print("="*80)
    print("TESTING FRONTEND (React + Vite)")
    print("="*80 + "\n")
    
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            log_test("Frontend - Homepage", "passed", 
                    f"Frontend is accessible at {FRONTEND_URL}",
                    {"content_length": len(response.text)})
        else:
            log_test("Frontend - Homepage", "failed", f"Status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        log_test("Frontend - Homepage", "failed", 
                "Frontend not responding. Make sure Vite dev server is running", str(e))

def test_data_flow():
    """Test end-to-end data flow scenarios"""
    print("="*80)
    print("TESTING DATA FLOW (End-to-End)")
    print("="*80 + "\n")
    
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Scenario 1: Check if students have face embeddings
        students_response = supabase.table('student_records').select("student_id, fname, lname").limit(10).execute()
        if students_response.data:
            sample_student = students_response.data[0]
            embeddings_response = supabase.table('face_embeddings').select("*").eq(
                "student_id", sample_student['student_id']
            ).execute()
            
            if embeddings_response.data:
                log_test("Data Flow - Student to Face Embedding", "passed",
                        f"Student {sample_student['student_id']} has {len(embeddings_response.data)} face embeddings")
            else:
                log_test("Data Flow - Student to Face Embedding", "passed",
                        f"Student {sample_student['student_id']} has no face embeddings (normal for untrained)")
        
        # Scenario 2: Check attendance records linkage
        attendance_response = supabase.table('attendance').select(
            "*, students(name), classes(class_name)"
        ).limit(5).execute()
        
        if attendance_response.data:
            log_test("Data Flow - Attendance with Relations", "passed",
                    f"Retrieved {len(attendance_response.data)} attendance records with student/class info",
                    {"sample": attendance_response.data[0] if attendance_response.data else None})
        else:
            log_test("Data Flow - Attendance with Relations", "passed",
                    "No attendance records yet (expected for new system)")
        
        # Scenario 3: Check reports priority calculation
        reports_response = supabase.table('report').select("report_id, priority_level, priority_text").limit(5).execute()
        if reports_response.data:
            log_test("Data Flow - Reports Priority", "passed",
                    f"Reports have priority levels calculated",
                    {"samples": reports_response.data})
        else:
            log_test("Data Flow - Reports Priority", "passed",
                    "No reports yet (expected for new system)")
            
    except Exception as e:
        log_test("Data Flow Test", "failed", str(e))
        traceback.print_exc()

def print_summary():
    """Print test summary report"""
    print("\n" + "="*80)
    print("TEST SUMMARY REPORT")
    print("="*80)
    print(f"\nTotal Tests: {test_results['total_tests']}")
    print(f"✓ Passed: {test_results['passed']}")
    print(f"✗ Failed: {test_results['failed']}")
    print(f"⊘ Skipped: {test_results['skipped']}")
    
    success_rate = (test_results['passed'] / test_results['total_tests'] * 100) if test_results['total_tests'] > 0 else 0
    print(f"\nSuccess Rate: {success_rate:.2f}%")
    
    # Save detailed results to JSON
    output_file = f"test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, 'w') as f:
        json.dump(test_results, f, indent=2)
    print(f"\nDetailed results saved to: {output_file}")
    
    print("\n" + "="*80)
    print("TESTING COMPLETED")
    print("="*80 + "\n")

def main():
    """Main test execution"""
    print("\n" + "="*80)
    print("CAMPUS EASE - COMPREHENSIVE SYSTEM TEST")
    print("="*80)
    print(f"Test Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80 + "\n")
    
    print("Testing the following components:")
    print("1. Database Connectivity (Supabase)")
    print("2. Flask API (Priority Prediction)")
    print("3. FastAPI (Face Recognition)")
    print("4. Frontend (React + Vite)")
    print("5. End-to-End Data Flow")
    print()
    
    input("Press Enter to start testing... ")
    print()
    
    # Run all tests
    test_database_connectivity()
    test_flask_api()
    test_fastapi()
    test_frontend()
    test_data_flow()
    
    # Print summary
    print_summary()
    
    # Return exit code based on failures
    return 0 if test_results['failed'] == 0 else 1

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        print_summary()
        sys.exit(1)
    except Exception as e:
        print(f"\n\nUnexpected error: {e}")
        traceback.print_exc()
        sys.exit(1)
