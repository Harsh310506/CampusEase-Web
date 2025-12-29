# Subject Management System - Complete Implementation

## Overview
This document outlines the complete subject management system for the Campus Ease application. Instead of hardcoding subjects in multiple places, all subjects are now centrally managed through a dedicated Subject Management page accessible only to administrators.

## Architecture

### 1. Database Layer
**Table:** `subjects`

```sql
CREATE TABLE subjects (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  department VARCHAR(50),
  semester INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `idx_subjects_department_semester` - For efficient filtering by department and semester
- `idx_subjects_code` - For quick code lookups
- `idx_subjects_is_active` - For filtering active subjects

**Key Features:**
- Soft delete: `is_active` flag instead of hard delete
- Unique constraints on both `name` and `code`
- Automatic timestamps for tracking

### 2. Service Layer
**File:** `src/services/subjectService.ts`

Provides reusable functions for subject operations:

#### Public Functions:

1. **`fetchAllSubjects()`**
   - Returns all active subjects
   - Sorted by department, semester, and name
   - Used across the application

2. **`fetchSubjectsByDepartmentAndSemester(department, semester)`**
   - Filters subjects by specific department and semester
   - Useful for enrollment forms, timetables

3. **`fetchSubjectsByDepartment(department)`**
   - Gets all subjects for a department across all semesters
   - For department-wise resource browsing

4. **`getSubjectByCode(code)`**
   - Retrieves a single subject by code
   - Case-insensitive matching
   - Returns null if not found

5. **`getSubjectName(subjectId)`**
   - Quick lookup of subject name by ID
   - Fallback to "Unknown Subject" on error

6. **`createSubject(subject)`** - Admin only
   - Creates new subject with validation
   - Auto-uppercase code
   - Handles duplicate checks

7. **`updateSubject(id, updates)`** - Admin only
   - Updates existing subject
   - Preserves created_at timestamp

8. **`deleteSubject(id)`** - Admin only
   - Soft delete by marking inactive
   - No data loss, maintains audit trail

### 3. UI Components

#### Subject Management Page
**File:** `src/pages/SubjectManagement.tsx`

**Admin-only page for managing subjects**

**Features:**
- Create subjects with unique code validation
- Edit subjects with all fields updatable
- Delete subjects (soft delete)
- Search by name, code, or department
- Grouped view by department and semester
- Visual indicators for active subjects

**Access Control:**
- Only accessible to admin users
- Shows "Access Denied" message for non-admins
- Integrated with existing authentication

**UI Elements:**
- Search bar with real-time filtering
- Card-based layout grouped by department/semester
- Dialog for create/edit operations
- Confirmation alert before deletion
- Toast notifications for user feedback

### 4. Integration Points

#### Resources Page
**File:** `src/pages/Resources.tsx`

**Integration:**
- Imports `fetchAllSubjects` and `Subject` type from `subjectService`
- Initializes subjects on component mount via `loadSubjects()`
- Uses centralized subjects in dropdown menus
- Displays subject code along with name for clarity
- Maintains filtering by selected subject

**Changes Made:**
- Replaced hardcoded subjects array with `fetchAllSubjects()`
- Updated subject dropdown to map from database
- Shows subject code for disambiguation
- Preserved all filtering and search functionality

#### Other Integration Points
The service layer is ready for integration with:
- **Attendance Page:** Filter attendance records by subject
- **Timetable Management:** Assign subjects to time slots
- **Class Management:** Link classes to subjects
- **Faculty Management:** Assign faculty to subjects
- **Events:** Create subject-specific events
- **Data Analytics:** Analyze by subject

## Data Flow

### Creating a Subject
1. Admin navigates to `/subject-management`
2. Clicks "Create Subject" button
3. Fills form with name, code, department, semester, description
4. System validates:
   - Name and code are required
   - Code is unique and auto-uppercased
5. Subject saved to database with `is_active = true`
6. Page updates with new subject immediately
7. Toast notification confirms success

### Using Subjects in Resources
1. Admin creates subjects (e.g., "Data Structures", "CS101")
2. Faculty uploads resource, selects subject from dropdown
3. Resource linked to subject via subject name in database
4. Students browse resources and filter by subject
5. All resources for selected subject display with subject code

### Updating a Subject
1. Admin clicks edit button on subject card
2. Edit dialog opens with current values
3. Admin modifies details as needed
4. Update sent to database
5. All references automatically use updated subject info
6. No need to update resources or other records

## Database Setup Instructions

### Option 1: Using SQL File
```bash
# Execute the schema file in Supabase SQL Editor
# File: subjects_schema.sql
```

### Option 2: Manual SQL Execution
1. Open Supabase dashboard
2. Go to SQL Editor
3. Create new query
4. Copy schema from `subjects_schema.sql`
5. Execute
6. Verify table created with 15 default subjects

### Verifying Setup
```sql
-- Check if table exists
SELECT * FROM subjects LIMIT 5;

-- Check subject count
SELECT COUNT(*) FROM subjects WHERE is_active = true;

-- View all departments
SELECT DISTINCT department FROM subjects ORDER BY department;
```

## Usage Examples

### In React Components

#### Fetch all subjects
```tsx
import { fetchAllSubjects } from '@/services/subjectService';

const MyComponent = () => {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const loadSubjects = async () => {
      const data = await fetchAllSubjects();
      setSubjects(data);
    };
    loadSubjects();
  }, []);

  return (
    <select>
      {subjects.map(subject => (
        <option key={subject.id} value={subject.name}>
          {subject.name} ({subject.code})
        </option>
      ))}
    </select>
  );
};
```

#### Get subjects for specific department
```tsx
import { fetchSubjectsByDepartment } from '@/services/subjectService';

const getDeptSubjects = async (dept) => {
  const subjects = await fetchSubjectsByDepartment(dept);
  // Handle subjects...
};
```

## Default Subjects

The system comes with 15 pre-configured subjects:

| Name | Code | Department | Semester |
|------|------|-----------|----------|
| Data Structures | CS101 | CS | 2 |
| Database Management | CS201 | CS | 3 |
| Computer Networks | CS301 | CS | 4 |
| Operating Systems | CS302 | CS | 4 |
| Software Engineering | CS401 | CS | 5 |
| Web Development | CS501 | CS | 5 |
| Machine Learning | CS601 | CS | 6 |
| Computer Graphics | CS602 | CS | 6 |
| Cyber Security | CS701 | CS | 7 |
| Mobile App Development | CS702 | CS | 7 |
| Mathematics | MATH101 | CS | 1 |
| Physics | PHY101 | CS | 1 |
| Chemistry | CHM101 | CS | 1 |
| Object-Oriented Programming | CS102 | CS | 2 |
| Web Technologies | CS202 | CS | 3 |

Admins can create additional subjects as needed.

## Best Practices

### For Administrators
1. **Subject Codes:** Use consistent naming (e.g., CS101, MATH201)
2. **Unique Names:** Each subject should have a unique, descriptive name
3. **Department Assignment:** Assign subject to correct department
4. **Semester Assignment:** Specify appropriate semester level
5. **Description:** Add helpful descriptions for clarity

### For Developers
1. **Always use service layer:** Don't query subjects directly; use `subjectService`
2. **Cache results:** Store subjects in state/context for performance
3. **Error handling:** Wrap service calls in try-catch
4. **Loading states:** Show spinners while fetching subjects
5. **Type safety:** Import `Subject` type from service

### For Data Consistency
1. **Avoid hardcoding:** Never hardcode subject names or codes
2. **Use IDs:** Reference subjects by name (primary key) not position
3. **Soft deletes only:** Mark inactive, don't delete permanently
4. **Maintain codes:** Subject codes should remain stable
5. **Audit trail:** Created_at timestamp tracks when subjects were added

## Future Enhancements

1. **Subject Credits:** Add credit hours field
2. **Prerequisites:** Link prerequisites between subjects
3. **Faculty Assignment:** Assign faculty to subjects
4. **Capacity Management:** Track enrollment limits per subject
5. **Archiving:** Archive old subjects separately from active deletion
6. **Bulk Operations:** Import subjects from CSV
7. **Subject Groups:** Group related subjects (e.g., "Core CS")
8. **Validation Rules:** Add business logic validations per department

## Troubleshooting

### Subjects Not Loading
1. Check database connection
2. Verify subjects table exists
3. Ensure `is_active = true` filter
4. Check browser console for errors

### Duplicate Subject Errors
1. Check unique constraints on name and code
2. Verify code formatting (case-insensitive)
3. Delete inactive subjects if needed

### Subject Not Appearing in Dropdown
1. Verify subject is active (`is_active = true`)
2. Check department/semester filters
3. Clear browser cache
4. Reload page

## Files Modified/Created

### New Files
- `src/pages/SubjectManagement.tsx` - Admin page
- `src/services/subjectService.ts` - Service layer
- `subjects_schema.sql` - Database schema

### Modified Files
- `src/App.tsx` - Added route and import
- `src/components/Header.tsx` - Added navigation link
- `src/pages/Resources.tsx` - Integrated subject service

## API Reference

### Service Functions
All functions are async and handle errors gracefully.

```typescript
// Query functions
fetchAllSubjects(): Promise<Subject[]>
fetchSubjectsByDepartmentAndSemester(dept, sem): Promise<Subject[]>
fetchSubjectsByDepartment(dept): Promise<Subject[]>
getSubjectByCode(code): Promise<Subject | null>
getSubjectName(id): Promise<string>

// Mutation functions (admin only)
createSubject(data): Promise<Subject>
updateSubject(id, updates): Promise<Subject>
deleteSubject(id): Promise<boolean>
```

## Notes
- Subject management is admin-exclusive feature
- All subject operations are logged via timestamps
- Service layer provides consistent error handling
- Components should handle loading and error states
- Subjects are referenced by name in resources table
