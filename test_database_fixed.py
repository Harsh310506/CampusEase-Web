"""
Simplified Database Test with Correct Table Names
Tests only what exists in the actual database
"""
from supabase import create_client
import sys

SUPABASE_URL = "https://jfricqlqhddznvliwwpt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmcmljcWxxaGRkem52bGl3d3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMTAzMDMsImV4cCI6MjA3ODc4NjMwM30.tLq8jgbKmm02qi-5eXXkgdlpYD-oy_mH7TiQKg5-5l0"

print("\n" + "="*80)
print("FIXED DATABASE TEST - Using Correct Table Names")
print("="*80 + "\n")

passed = 0
failed = 0

try:
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("[OK] Supabase client initialized\n")
    
    # Test 1: student_records (correct name)
    try:
        response = client.table('student_records').select("student_id, fname, lname, email").limit(5).execute()
        print(f"✓ student_records table: {len(response.data)} records")
        if response.data:
            print(f"  Sample: {response.data[0]['fname']} {response.data[0]['lname']}")
        passed += 1
    except Exception as e:
        print(f"✗ student_records table: {e}")
        failed += 1
    
    # Test 2: attendance
    try:
        response = client.table('attendance').select("student_name, date, status").limit(5).execute()
        print(f"✓ attendance table: {len(response.data)} records")
        if response.data:
            print(f"  Sample: {response.data[0]['student_name']} - {response.data[0]['status']}")
        passed += 1
    except Exception as e:
        print(f"✗ attendance table: {e}")
        failed += 1
    
    # Test 3: report (singular, not reports)
    try:
        response = client.table('report').select("*").limit(5).execute()
        print(f"✓ report table: {len(response.data)} records")
        passed += 1
    except Exception as e:
        print(f"✗ report table: {e}")
        failed += 1
    
    # Test 4: class_details (not classes)
    try:
        response = client.table('class_details').select("*").limit(5).execute()
        print(f"✓ class_details table: {len(response.data)} records")
        if response.data:
            print(f"  Sample: {list(response.data[0].keys())[:3]}")
        passed += 1
    except Exception as e:
        print(f"✗ class_details table: {e}")
        failed += 1
    
    # Test 5: announcements
    try:
        response = client.table('announcements').select("title, theme").limit(3).execute()
        print(f"✓ announcements table: {len(response.data)} records")
        passed += 1
    except Exception as e:
        print(f"✗ announcements table: {e}")
        failed += 1
    
    # Test 6: faculty
    try:
        response = client.table('faculty').select("fname, lname, email").limit(3).execute()
        print(f"✓ faculty table: {len(response.data)} records")
        passed += 1
    except Exception as e:
        print(f"✗ faculty table: {e}")
        failed += 1
    
    # Test 7: category_weights
    try:
        response = client.table('category_weights').select("category, weight").execute()
        print(f"✓ category_weights table: {len(response.data)} records")
        passed += 1
    except Exception as e:
        print(f"✗ category_weights table: {e}")
        failed += 1
    
    # Test 8: impact_weights
    try:
        response = client.table('impact_weights').select("impact_scope, weight").execute()
        print(f"✓ impact_weights table: {len(response.data)} records")
        passed += 1
    except Exception as e:
        print(f"✗ impact_weights table: {e}")
        failed += 1
    
    # Test 9: occurrence_weights
    try:
        response = client.table('occurrence_weights').select("occurrence_pattern, weight").execute()
        print(f"✓ occurrence_weights table: {len(response.data)} records")
        passed += 1
    except Exception as e:
        print(f"✗ occurrence_weights table: {e}")
        failed += 1
    
    print("\n" + "="*80)
    print(f"RESULTS: {passed} passed, {failed} failed")
    print("="*80 + "\n")
    
    if failed == 0:
        print("✅ All database tests PASSED!")
        sys.exit(0)
    else:
        print(f"⚠️  {failed} tests failed")
        sys.exit(1)
        
except Exception as e:
    print(f"\n✗ ERROR: {e}\n")
    import traceback
    traceback.print_exc()
    sys.exit(1)
