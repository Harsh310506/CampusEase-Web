"""
Database Structure and Connectivity Test
"""
from supabase import create_client
import json

SUPABASE_URL = "https://jfricqlqhddznvliwwpt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmcmljcWxxaGRkem52bGl3d3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMTAzMDMsImV4cCI6MjA3ODc4NjMwM30.tLq8jgbKmm02qi-5eXXkgdlpYD-oy_mH7TiQKg5-5l0"

print("\n" + "="*80)
print("DATABASE CONNECTIVITY & STRUCTURE TEST")
print("="*80 + "\n")

try:
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✓ Supabase client initialized successfully\n")
    
    # Test common tables
    tables_to_test = [
        'student_records',
        'reports', 
        'classes',
        'attendance',
        'face_embeddings',
        'announcements',
        'events',
        'faculty',
        'category_weights',
        'impact_weights',
        'occurrence_weights'
    ]
    
    print("TESTING DATABASE TABLES:")
    print("-" * 80)
    
    available_tables = []
    missing_tables = []
    
    for table_name in tables_to_test:
        try:
            response = client.table(table_name).select("*").limit(1).execute()
            count_response = client.table(table_name).select("*", count="exact").limit(0).execute()
            count = count_response.count if hasattr(count_response, 'count') else "?"
            
            print(f"✓ {table_name:25} - Available ({count} records)")
            available_tables.append(table_name)
            
            # Show sample record if exists
            if response.data:
                print(f"  Sample: {list(response.data[0].keys())[:5]}")
                
        except Exception as e:
            print(f"✗ {table_name:25} - Not accessible ({str(e)[:50]})")
            missing_tables.append(table_name)
    
    print("\n" + "="*80)
    print(f"SUMMARY: {len(available_tables)}/{len(tables_to_test)} tables accessible")
    print("="*80 + "\n")
    
    # Test specific queries
    print("TESTING SPECIFIC QUERIES:")
    print("-" * 80)
    
    # Test 1: Get students with face embeddings
    try:
        response = client.table('student_records').select("student_id, name").limit(5).execute()
        print(f"✓ Student Records Query: {len(response.data)} students found")
        if response.data:
            student_id = response.data[0]['student_id']
            embeddings = client.table('face_embeddings').select("*").eq("student_id", student_id).execute()
            print(f"  → Student {student_id} has {len(embeddings.data)} face embeddings")
    except Exception as e:
        print(f"✗ Student Records Query: {e}")
    
    # Test 2: Get reports with priority
    try:
        response = client.table('report').select("report_id, priority_level, priority_text").limit(5).execute()
        print(f"✓ Reports Query: {len(response.data)} reports found")
        if response.data:
            print(f"  → Sample priorities: {[r.get('priority_text', 'N/A') for r in response.data[:3]]}")
    except Exception as e:
        print(f"✗ Reports Query: {e}")
    
    # Test 3: Get attendance records
    try:
        response = client.table('attendance').select("*").limit(5).execute()
        print(f"✓ Attendance Query: {len(response.data)} records found")
    except Exception as e:
        print(f"✗ Attendance Query: {e}")
    
    # Test 4: Get classes
    try:
        response = client.table('class_details').select("*").limit(5).execute()
        print(f"✓ Classes Query: {len(response.data)} classes found")
        if response.data:
            print(f"  → Sample classes: {[c.get('class_name', 'N/A') for c in response.data[:3]]}")
    except Exception as e:
        print(f"✗ Classes Query: {e}")
    
    print("\n" + "="*80)
    print("DATABASE TEST COMPLETED SUCCESSFULLY")
    print("="*80 + "\n")
    
except Exception as e:
    print(f"\n✗ ERROR: Failed to connect to database")
    print(f"Error: {e}\n")
    import traceback
    traceback.print_exc()
