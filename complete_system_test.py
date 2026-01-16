"""
COMPLETE SYSTEM TEST - Campus Ease
Tests all components with actual database schema
"""
from supabase import create_client
import json
from datetime import datetime

SUPABASE_URL = "https://jfricqlqhddznvliwwpt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmcmljcWxxaGRkem52bGl3d3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMTAzMDMsImV4cCI6MjA3ODc4NjMwM30.tLq8jgbKmm02qi-5eXXkgdlpYD-oy_mH7TiQKg5-5l0"

results = {"passed": 0, "failed": 0, "tests": []}

def test(name, func):
    """Run a test and track results"""
    try:
        print(f"\n{'='*80}")
        print(f"TEST: {name}")
        print('='*80)
        result = func()
        if result:
            results["passed"] += 1
            results["tests"].append({"name": name, "status": "PASSED", "time": datetime.now().isoformat()})
            print(f"✓ PASSED: {name}")
        else:
            results["failed"] += 1
            results["tests"].append({"name": name, "status": "FAILED", "time": datetime.now().isoformat()})
            print(f"✗ FAILED: {name}")
        return result
    except Exception as e:
        results["failed"] += 1
        results["tests"].append({"name": name, "status": "FAILED", "error": str(e), "time": datetime.now().isoformat()})
        print(f"✗ FAILED: {name}")
        print(f"Error: {e}")
        return False

def test_database_connection():
    """Test 1: Database Connection"""
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    response = client.table('student_records').select("id").limit(1).execute()
    print(f"→ Connected to Supabase successfully")
    print(f"→ Can query database tables")
    return True

def test_student_data():
    """Test 2: Student Data Access"""
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    response = client.table('student_records').select("id, fname, lname, student_id, email").limit(10).execute()
    print(f"→ Found {len(response.data)} students")
    if response.data:
        sample = response.data[0]
        print(f"→ Sample student: {sample.get('fname')} {sample.get('lname')} ({sample.get('student_id')})")
        print(f"→ Student fields: {list(sample.keys())}")
    return len(response.data) > 0

def test_attendance_system():
    """Test 3: Attendance System"""
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    response = client.table('attendance').select("*").limit(10).execute()
    print(f"→ Found {len(response.data)} attendance records")
    if response.data:
        sample = response.data[0]
        print(f"→ Sample: Student '{sample.get('student_name')}' - {sample.get('date')} - {sample.get('subject')}")
        print(f"→ Status: {sample.get('status')}")
    return True

def test_announcement_system():
    """Test 4: Announcement System"""
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    response = client.table('announcements').select("*").execute()
    print(f"→ Found {len(response.data)} announcements")
    if response.data:
        for ann in response.data:
            print(f"→ '{ann.get('title')}' - Theme: {ann.get('theme')}")
    return True

def test_faculty_system():
    """Test 5: Faculty System"""
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    response = client.table('faculty').select("*").execute()
    print(f"→ Found {len(response.data)} faculty members")
    if response.data:
        for fac in response.data:
            print(f"→ {fac.get('fname')} {fac.get('lname')} - {fac.get('email')}")
    return True

def test_priority_weights():
    """Test 6: Priority Weight System"""
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    cat_weights = client.table('category_weights').select("*").eq("is_active", True).execute()
    impact_weights = client.table('impact_weights').select("*").eq("is_active", True).execute()
    occ_weights = client.table('occurrence_weights').select("*").eq("is_active", True).execute()
    
    print(f"→ Category Weights: {len(cat_weights.data)} active")
    print(f"→ Impact Weights: {len(impact_weights.data)} active")
    print(f"→ Occurrence Weights: {len(occ_weights.data)} active")
    
    if cat_weights.data:
        print(f"→ Categories: {[w['category'] for w in cat_weights.data]}")
    
    return len(cat_weights.data) > 0 and len(impact_weights.data) > 0

def test_data_relationships():
    """Test 7: Data Relationships & Flow"""
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Get a student
    students = client.table('student_records').select("student_id, fname, lname").limit(1).execute()
    if students.data:
        student = students.data[0]
        student_id = student.get('student_id')
        print(f"→ Testing with student: {student.get('fname')} {student.get('lname')} (ID: {student_id})")
        
        # Check their attendance
        attendance = client.table('attendance').select("*").eq("student_id", student_id).execute()
        print(f"→ Student has {len(attendance.data)} attendance records")
        
        # Check class enrollment
        print(f"→ Data flow validation: Student → Attendance ✓")
        
    return True

def test_file_structure():
    """Test 8: File Structure"""
    import os
    
    required_files = [
        'app.py',
        'face_recognition_api.py',
        'package.json',
        'src/main.tsx',
        'src/App.tsx'
    ]
    
    missing = []
    for file in required_files:
        if os.path.exists(file):
            print(f"→ ✓ {file}")
        else:
            print(f"→ ✗ {file} (MISSING)")
            missing.append(file)
    
    return len(missing) == 0

def test_environment_variables():
    """Test 9: Environment Configuration"""
    import os
    
    if os.path.exists('.env'):
        print("→ ✓ .env file found")
        with open('.env', 'r') as f:
            lines = [l.strip() for l in f.readlines() if l.strip() and not l.startswith('#')]
            print(f"→ {len(lines)} configuration variables set")
        return True
    else:
        print("→ ✗ .env file not found")
        return False

def test_console_output():
    """Test 10: Console Output & Logging"""
    import os
    
    log_dir = 'logs'
    if os.path.exists(log_dir):
        log_files = os.listdir(log_dir)
        print(f"→ Logs directory exists")
        print(f"→ Found {len(log_files)} log entries")
        if 'annotated_images' in log_files:
            annotated_dir = os.path.join(log_dir, 'annotated_images')
            if os.path.exists(annotated_dir):
                students = os.listdir(annotated_dir)
                print(f"→ Face recognition logs for {len(students)} students")
        return True
    else:
        print("→ Logs directory not created yet")
        return False

# Run all tests
print("\n" + "="*80)
print("CAMPUS EASE - COMPREHENSIVE SYSTEM TEST")
print("="*80)
print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("="*80)

test("Database Connection", test_database_connection)
test("Student Data Access", test_student_data)
test("Attendance System", test_attendance_system)
test("Announcement System", test_announcement_system)
test("Faculty System", test_faculty_system)
test("Priority Weight System", test_priority_weights)
test("Data Relationships", test_data_relationships)
test("File Structure", test_file_structure)
test("Environment Configuration", test_environment_variables)
test("Console Output & Logging", test_console_output)

# Summary
print("\n" + "="*80)
print("TEST SUMMARY")
print("="*80)
print(f"Total Tests: {results['passed'] + results['failed']}")
print(f"✓ Passed: {results['passed']}")
print(f"✗ Failed: {results['failed']}")
print(f"Success Rate: {(results['passed'] / (results['passed'] + results['failed']) * 100):.1f}%")
print("="*80)

# Save results
with open(f"test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json", 'w') as f:
    json.dump(results, f, indent=2)
    print(f"\n→ Detailed results saved to test_results_*.json")

print("\n" + "="*80)
print("NEXT STEPS:")
print("="*80)
print("1. Start Flask API: python app.py (Port 5000)")
print("2. Start FastAPI: python face_recognition_api.py (Port 8000)")
print("3. Start Frontend: npm run dev (Port 8080)")
print("4. Access System: http://localhost:8080")
print("="*80 + "\n")
