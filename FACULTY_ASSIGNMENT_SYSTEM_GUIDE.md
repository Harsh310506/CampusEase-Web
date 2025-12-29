# Faculty Assignment System - Complete Guide

## Overview

The Faculty Assignment System provides a comprehensive solution for managing faculty-class-subject relationships in CampusEase. This system ensures that:

1. **Faculty see only their assigned classes** during attendance marking
2. **Faculty see only their assigned subjects** for each class
3. **Admins can easily manage assignments** through a dedicated interface
4. **Database integrity is maintained** through proper foreign key relationships

## System Components

### 1. Database Schema (`faculty_assignment_system_schema.sql`)

#### Tables

**faculty_classes**
- Links faculty members to classes and subjects
- Columns:
  - `id` (SERIAL PRIMARY KEY): Unique assignment identifier
  - `faculty_id` (VARCHAR): References faculty.user_id
  - `class_id` (VARCHAR): References classes.class_id
  - `subject_id` (INT): References subjects.subject_id
  - `assigned_at` (TIMESTAMP): When assignment was created
  - `is_active` (BOOLEAN): Soft delete flag
- Unique constraint: `(faculty_id, class_id, subject_id)`
- Indexes:
  - `idx_faculty_classes_faculty` on faculty_id
  - `idx_faculty_classes_class` on class_id
  - `idx_faculty_classes_subject` on subject_id

#### Views

**faculty_assignment_view**
- Comprehensive view joining faculty_classes with faculty, classes, and subjects
- Provides complete assignment information in a single query
- Columns include:
  - Assignment details (id, assigned_at, is_active)
  - Faculty information (faculty_id, faculty_name, faculty_department)
  - Class information (class_id, class_name, department, semester, academic_year)
  - Subject information (subject_id, subject_name, subject_code)

#### Database Functions

**get_faculty_classes(p_faculty_id VARCHAR)**
- Returns all classes assigned to a faculty member
- Includes subject count per class
- Ordered by department, semester, and class name

**get_faculty_subjects_for_class(p_faculty_id VARCHAR, p_class_id VARCHAR)**
- Returns subjects a faculty teaches for a specific class
- Used for filtering attendance subjects
- Ordered by subject name

**can_faculty_teach_subject_to_class(p_faculty_id VARCHAR, p_class_id VARCHAR, p_subject_id INT)**
- Checks if a faculty member is authorized to teach a subject to a class
- Returns BOOLEAN
- Used for access control

**get_faculty_assignment_stats(p_faculty_id VARCHAR)**
- Returns statistics about faculty assignments
- Includes: total_classes, total_subjects, total_assignments, departments

### 2. Service Layer (`facultyAssignmentService.ts`)

#### Key Functions

```typescript
// Get all classes assigned to a faculty
getFacultyClasses(facultyId: string): Promise<ClassDetail[]>

// Get subjects a faculty teaches for a specific class
getFacultySubjectsForClass(facultyId: string, classId: string): Promise<SubjectForClass[]>

// Check authorization
canFacultyTeachSubjectToClass(facultyId: string, classId: string, subjectId: number): Promise<boolean>

// Get all assignments for a faculty
getFacultyAssignments(facultyId: string): Promise<FacultyAssignmentView[]>

// Assign class and subject to faculty (Admin only)
assignClassToFaculty(facultyId: string, classId: string, subjectId: number): Promise<FacultyClassAssignment>

// Remove assignment (Admin only)
removeClassFromFaculty(assignmentId: number): Promise<boolean>

// Delete assignment permanently (Admin only)
deleteClassAssignment(assignmentId: number): Promise<boolean>

// Get all assignments for a specific class
getClassAssignments(classId: string): Promise<FacultyAssignmentView[]>

// Get all subjects assigned to a faculty (across all classes)
getAllFacultySubjects(facultyId: string): Promise<SubjectForClass[]>

// Bulk assign multiple subjects
bulkAssignSubjectsToClass(facultyId: string, classId: string, subjectIds: number[]): Promise<boolean>
```

### 3. User Interface Components

#### Faculty Class Assignment Page (`FacultyClassAssignment.tsx`)

**Purpose**: Admin interface for managing faculty-class-subject assignments

**Features**:
- Select faculty member from dropdown
- Assign class and subject to selected faculty
- View all assignments for selected faculty
- Remove assignments with confirmation
- Statistics cards showing:
  - Total classes assigned
  - Total subjects assigned
  - Total assignments
- Responsive design with loading states
- Error handling for duplicate assignments

**Access**: Admin only

**Route**: `/faculty-class-assignment`

#### Attendance Page Updates (`Attendance.tsx`)

**Changes Made**:

1. **Import faculty assignment services**:
   ```typescript
   import { 
     getFacultyClasses, 
     getFacultySubjectsForClass,
     getAllFacultySubjects 
   } from '@/services/facultyAssignmentService';
   ```

2. **Filter classes by faculty assignment**:
   ```typescript
   // Faculty sees only their assigned classes
   const assignedClasses = await getFacultyClasses(userData.user_id);
   ```

3. **Filter subjects by faculty assignment**:
   ```typescript
   // Faculty sees only their assigned subjects
   const assignedSubjects = await getAllFacultySubjects(userData.user_id);
   ```

4. **Class-specific subject filtering**:
   ```typescript
   // When class is selected, load only subjects for that class
   const classSubjects = await getFacultySubjectsForClass(facultyId, classId);
   ```

5. **User-friendly messages**:
   - "No Classes Assigned" - when faculty has no class assignments
   - "No Subjects Assigned" - when faculty has no subject assignments
   - "No Subjects for This Class" - when faculty doesn't teach any subjects in selected class

### 4. Navigation

#### Header Component Updates

Added new navigation link for admins:
- **Label**: "Faculty Assignment"
- **Route**: `/faculty-class-assignment`
- **Position**: Between "Subject Management" and "Data Analysis"

#### App.tsx Routes

New protected route:
```tsx
<Route 
  path="/faculty-class-assignment" 
  element={<AdminRoute><FacultyClassAssignment /></AdminRoute>} 
/>
```

## Implementation Workflow

### For Admins

1. **Navigate to Faculty Assignment page**
   - Click "Faculty Assignment" in the header navigation

2. **Select a faculty member**
   - Choose from the dropdown list
   - Faculty information is displayed below

3. **Assign class and subject**
   - Select a class from available classes
   - Select a subject the faculty will teach
   - Click "Assign to Faculty" button

4. **View assignments**
   - All assignments are displayed in a table
   - Shows class name, subject, department, semester, academic year

5. **Remove assignments**
   - Click the trash icon next to an assignment
   - Confirm deletion

### For Faculty

1. **Navigate to Attendance page**
   - Click "Attendance" in the header navigation

2. **Select a class**
   - Only assigned classes are shown in the dropdown
   - If no classes are assigned, a helpful message is displayed

3. **Select date and subject**
   - Only subjects assigned for the selected class are shown
   - Subject dropdown updates when class changes

4. **Mark attendance**
   - Normal attendance marking workflow
   - System ensures faculty can only mark for assigned classes/subjects

## Database Setup

### Step 1: Execute Schema SQL

```bash
# In Supabase SQL Editor or psql:
\i faculty_assignment_system_schema.sql
```

Or run the SQL file contents directly in Supabase Dashboard > SQL Editor.

### Step 2: Verify Tables

```sql
-- Check if tables are created
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'faculty_classes';

-- Check sample data
SELECT * FROM faculty_assignment_view WHERE is_active = TRUE;
```

### Step 3: Verify Functions

```sql
-- Test function
SELECT * FROM get_faculty_classes('F001');
```

## Sample Data

The schema includes 20+ sample assignments such as:

- Faculty F001 teaches Data Structures and DBMS in IT-3-A
- Faculty F002 teaches Operating Systems in IT-3-A and CE-4-A
- Faculty F003 teaches Algorithms and AI across multiple classes
- Faculty F004 specializes in Web Development and Software Engineering
- And more...

## Security Considerations

### Database Level
- Foreign key constraints ensure referential integrity
- Unique constraints prevent duplicate assignments
- Soft delete (is_active flag) maintains audit trail
- Indexes optimize query performance

### Application Level
- Admin-only routes protected by AdminRoute component
- Faculty can only see their assigned classes (enforced in service layer)
- Faculty can only see their assigned subjects (enforced in service layer)
- Access checks before marking attendance

### API Level
- All assignment modifications require admin role
- Faculty queries filtered by faculty_id
- Authorization checks using database functions

## Best Practices

### For Admins

1. **Assign subjects by department**
   - Match faculty expertise with subject requirements
   - Consider faculty workload when assigning multiple classes

2. **Use academic year and semester**
   - Keep assignments current
   - Review and update each semester

3. **Regular audit**
   - Review assignments periodically
   - Remove outdated assignments

### For Developers

1. **Always use service layer**
   - Don't query database directly from components
   - Use provided service functions

2. **Handle errors gracefully**
   - Display user-friendly messages
   - Log errors for debugging

3. **Respect role-based access**
   - Check user role before operations
   - Use route protection components

4. **Maintain consistency**
   - Keep assignment logic in service layer
   - Update views when data model changes

## Troubleshooting

### Faculty sees no classes

**Problem**: Faculty member can't see any classes in Attendance page

**Solutions**:
1. Check if assignments exist:
   ```sql
   SELECT * FROM faculty_assignment_view 
   WHERE faculty_id = 'F001' AND is_active = TRUE;
   ```

2. Verify faculty_id matches:
   ```sql
   SELECT user_id FROM faculty WHERE name = 'Faculty Name';
   ```

3. Assign classes through Admin panel

### Faculty sees no subjects for a class

**Problem**: Faculty selected a class but no subjects are shown

**Solutions**:
1. Check class-specific assignments:
   ```sql
   SELECT * FROM get_faculty_subjects_for_class('F001', 'IT-3-A');
   ```

2. Assign subjects for that specific class through Admin panel

### Duplicate assignment error

**Problem**: Error when trying to assign same subject to faculty for a class

**Solution**: This is expected behavior due to unique constraint. Faculty cannot be assigned the same subject twice for the same class.

### Performance issues

**Problem**: Slow loading of assignments

**Solutions**:
1. Verify indexes are created:
   ```sql
   SELECT indexname FROM pg_indexes 
   WHERE tablename = 'faculty_classes';
   ```

2. Use materialized views for heavy queries (if needed)

3. Implement pagination for large datasets

## Future Enhancements

### Planned Features
- [ ] Academic year-wise assignment management
- [ ] Bulk assignment import from CSV
- [ ] Assignment history and audit log
- [ ] Faculty workload calculation
- [ ] Timetable integration
- [ ] Email notifications for new assignments
- [ ] Mobile responsive improvements
- [ ] Assignment templates

### Database Enhancements
- [ ] Add assignment approval workflow
- [ ] Track assignment changes history
- [ ] Add assignment notes/comments
- [ ] Support for co-teaching (multiple faculty per subject)

## API Reference

### Service Functions

#### getFacultyClasses
```typescript
/**
 * Get all classes assigned to a faculty member
 * @param facultyId - Faculty user ID
 * @returns Promise<ClassDetail[]>
 */
getFacultyClasses(facultyId: string): Promise<ClassDetail[]>
```

**Example**:
```typescript
const classes = await getFacultyClasses('F001');
console.log(classes); // [{ class_id: 'IT-3-A', class_name: '...', ... }]
```

#### getFacultySubjectsForClass
```typescript
/**
 * Get subjects a faculty teaches for a specific class
 * @param facultyId - Faculty user ID
 * @param classId - Class identifier
 * @returns Promise<SubjectForClass[]>
 */
getFacultySubjectsForClass(
  facultyId: string, 
  classId: string
): Promise<SubjectForClass[]>
```

**Example**:
```typescript
const subjects = await getFacultySubjectsForClass('F001', 'IT-3-A');
console.log(subjects); // [{ subject_id: 1, subject_name: 'Data Structures', ... }]
```

#### assignClassToFaculty
```typescript
/**
 * Assign a class and subject to a faculty member (Admin only)
 * @param facultyId - Faculty user ID
 * @param classId - Class identifier
 * @param subjectId - Subject ID
 * @returns Promise<FacultyClassAssignment>
 */
assignClassToFaculty(
  facultyId: string,
  classId: string,
  subjectId: number
): Promise<FacultyClassAssignment>
```

**Example**:
```typescript
const assignment = await assignClassToFaculty('F001', 'IT-3-A', 1);
console.log(assignment); // { id: 1, faculty_id: 'F001', ... }
```

## Database Schema Diagram

```
┌─────────────────┐
│    faculty      │
│  (user_id PK)   │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────────────┐      N:1        ┌──────────────────┐
│   faculty_classes       │◄─────────────────│    classes       │
│  (id PK)                │                  │  (class_id PK)   │
│  - faculty_id (FK)      │                  └──────────────────┘
│  - class_id (FK)        │
│  - subject_id (FK)      │      N:1        ┌──────────────────┐
│  - assigned_at          │◄─────────────────│    subjects      │
│  - is_active            │                  │  (subject_id PK) │
└─────────────────────────┘                  └──────────────────┘
         │
         │ Used by
         ▼
┌─────────────────────────────────┐
│  faculty_assignment_view        │
│  (Comprehensive view)           │
│  - All faculty details          │
│  - All class details            │
│  - All subject details          │
│  - Assignment metadata          │
└─────────────────────────────────┘
```

## Conclusion

The Faculty Assignment System provides a robust, scalable solution for managing faculty-class-subject relationships in CampusEase. With proper database design, service layer abstraction, and user-friendly interfaces, it ensures:

- **Data Integrity**: Through foreign keys and constraints
- **Security**: Through role-based access control
- **Performance**: Through strategic indexing and views
- **Usability**: Through intuitive admin and faculty interfaces
- **Maintainability**: Through clean architecture and separation of concerns

For support or questions, please refer to this documentation or contact the development team.
