# Subject Management System - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CAMPUS EASE APP                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              User Interface Layer (React)                │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │  ┌─────────────────────┐  ┌──────────────────────────┐  │   │
│  │  │ SubjectManagement   │  │   Other Pages           │  │   │
│  │  │ .tsx (ADMIN ONLY)   │  │   - Resources           │  │   │
│  │  │                     │  │   - Attendance          │  │   │
│  │  │ ✅ Create Subject   │  │   - Timetable (future)  │  │   │
│  │  │ ✅ Read Subjects    │  │   - Events (future)     │  │   │
│  │  │ ✅ Update Subject   │  │   - Analytics (future)  │  │   │
│  │  │ ✅ Delete Subject   │  └──────────────────────────┘  │   │
│  │  │ ✅ Search/Filter    │                                │   │
│  │  └─────────────────────┘                                │   │
│  │           △                        △                     │   │
│  │           │                        │                     │   │
│  └───────────┼────────────────────────┼─────────────────────┘   │
│              │                        │                          │
│              │     USES               │     USES                 │
│              │                        │                          │
│  ┌───────────▼─────────────────────────────────────────────┐   │
│  │         Service Layer (TypeScript)                      │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                subjectService.ts                         │   │
│  │                                                          │   │
│  │ Query Functions:                                        │   │
│  │  • fetchAllSubjects()                                   │   │
│  │  • fetchSubjectsByDepartment(dept)                      │   │
│  │  • fetchSubjectsByDepartmentAndSemester(dept, sem)      │   │
│  │  • getSubjectByCode(code)                               │   │
│  │  • getSubjectName(id)                                   │   │
│  │                                                          │   │
│  │ Mutation Functions (Admin Only):                        │   │
│  │  • createSubject(data)                                  │   │
│  │  • updateSubject(id, updates)                           │   │
│  │  • deleteSubject(id)                                    │   │
│  │                                                          │   │
│  │ ✅ Error Handling    ✅ Type Safety    ✅ Validation     │   │
│  └───────────▲─────────────────────────────────────────────┘   │
│              │                                                    │
│              │   SUPABASE CLIENT                                  │
│              │                                                    │
│  ┌───────────▼─────────────────────────────────────────────┐   │
│  │              Database Layer (PostgreSQL)                │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                          │   │
│  │  subjects table:                                        │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │ id (PK)  │  name  │  code  │  description    │   │   │
│  │  │ dept     │  sem   │  active│  created_at     │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │  15 Default Subjects (CS 1-7)                          │   │
│  │  • Data Structures, Database Management                │   │
│  │  • Computer Networks, Operating Systems               │   │
│  │  • Software Engineering, Web Development              │   │
│  │  • Machine Learning, Computer Graphics                │   │
│  │  • Cyber Security, Mobile Development                │   │
│  │  • Mathematics, Physics, Chemistry, OOP               │   │
│  │  • Web Technologies                                    │   │
│  │                                                          │   │
│  │  Indexes: dept+sem, code, is_active                    │   │
│  │  Soft Delete: is_active flag                           │   │
│  └──────────────────────────────────────────────────────┘   │   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Create Subject Flow
```
Admin User
    │
    ├─→ Access /subject-management
    │
    ├─→ Click "Create Subject"
    │
    ├─→ Fill Form:
    │   ├─ Name: "Data Structures"
    │   ├─ Code: "CS101"
    │   ├─ Department: "CS"
    │   ├─ Semester: "2"
    │   └─ Description: "..."
    │
    ├─→ Click "Create Subject"
    │
    ├─→ SubjectManagement.tsx
    │   └─→ handleCreateSubject()
    │       └─→ Validate inputs
    │           └─→ Check unique code
    │
    ├─→ subjectService.ts
    │   └─→ createSubject(data)
    │       └─→ Supabase INSERT
    │
    ├─→ Database
    │   └─→ Insert into subjects table
    │       ├─ id: 16
    │       ├─ name: "Data Structures"
    │       ├─ code: "CS101"
    │       └─ is_active: true
    │
    ├─→ Success Response
    │
    ├─→ UI Updates
    │   └─→ Subject appears in list
    │
    └─→ Toast: "Subject created successfully"


Available Everywhere:
    │
    ├─→ Resources dropdown
    ├─→ Resources filter
    ├─→ Attendance (future)
    ├─→ Timetable (future)
    ├─→ Events (future)
    └─→ Analytics (future)
```

### Use Subject in Resources Flow
```
Faculty Member
    │
    ├─→ Go to Resources page
    │
    ├─→ Click "Upload Resource"
    │
    ├─→ Fill Form:
    │   ├─ Title: "Chapter 3 Notes"
    │   ├─ Description: "..."
    │   ├─ Subject: "Data Structures" ← FROM DATABASE
    │   ├─ Department: "CS"
    │   └─ File: notes.pdf
    │
    ├─→ System loads subjects via:
    │   └─→ fetchAllSubjects()
    │       └─→ Gets from database
    │           └─→ Displays in dropdown
    │
    ├─→ Faculty selects "Data Structures (CS101)"
    │
    ├─→ Resource saved with subject: "Data Structures"
    │
    └─→ Now available for filtering!


Student User
    │
    ├─→ Go to Browse Resources
    │
    ├─→ See subject filter dropdown
    │   ├─ All Subjects
    │   ├─ Data Structures (CS101)
    │   ├─ Database Management (CS201)
    │   ├─ Computer Networks (CS301)
    │   └─ ... (13 more)
    │
    ├─→ Select "Data Structures"
    │
    ├─→ UI filters resources
    │   └─→ Shows only resources with subject: "Data Structures"
    │
    └─→ See all Chapter 3 Notes and related resources
```

### Update Subject Flow
```
Admin User
    │
    ├─→ Go to /subject-management
    │
    ├─→ See all subjects listed
    │
    ├─→ Click edit icon on "Data Structures"
    │
    ├─→ Edit dialog opens with current values:
    │   ├─ Name: "Data Structures" → "Data Structures & Algorithms"
    │   ├─ Code: "CS101" (no change)
    │   ├─ Description: (edit)
    │   └─ Department: "CS" (no change)
    │
    ├─→ Click "Update Subject"
    │
    ├─→ subjectService.ts
    │   └─→ updateSubject(id, updates)
    │       └─→ Supabase UPDATE
    │
    ├─→ Database updated
    │
    ├─→ All references updated automatically:
    │   ├─ Resources dropdown shows new name
    │   ├─ Resources filter shows new name
    │   ├─ Existing resources still linked correctly
    │   └─ No manual updates needed!
    │
    └─→ Toast: "Subject updated successfully"
```

## Component Relationship Diagram

```
                    Header.tsx
                       │
                       │ Admin link
                       ▼
            /subject-management
                       │
                       ▼
         SubjectManagement.tsx
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
    Create        Read/Search      Edit/Delete
    Subject       Subject List     Subject
        │              │              │
        │              │              │
        └──────────────┼──────────────┘
                       │
        ┌──────────────▼──────────────┐
        │   subjectService.ts         │
        │   • Type definitions        │
        │   • CRUD functions          │
        │   • Error handling          │
        └──────────────┬──────────────┘
                       │
        ┌──────────────▼──────────────┐
        │    Supabase Client          │
        │    • Connection pooling     │
        │    • Query optimization    │
        │    • RLS policies          │
        └──────────────┬──────────────┘
                       │
        ┌──────────────▼──────────────┐
        │   PostgreSQL Database       │
        │   subjects table            │
        │   • Normalized schema       │
        │   • Indexes for perf        │
        │   • Soft delete support     │
        └─────────────────────────────┘


INTEGRATION POINTS:

Resources.tsx
    │
    ├─→ imports: fetchAllSubjects
    │
    ├─→ useEffect: loadSubjects()
    │
    ├─→ Subject dropdown:
    │   └─→ {subjects.map(s => <option>{s.name}</option>)}
    │
    └─→ Filter dropdown:
        └─→ {subjects.map(s => <option>{s.name}</option>)}


Future Integrations:
    ├─→ Attendance.tsx (filter by subject)
    ├─→ Timetable.tsx (assign subjects)
    ├─→ ClassManagement.tsx (link classes)
    ├─→ FacultyAssignment.tsx (assign faculty)
    ├─→ Events.tsx (subject-specific)
    └─→ Analytics.tsx (subject metrics)
```

## Database Schema Relationship

```
subjects TABLE
┌──────────────────────────────────────────────────────────┐
│ Column         │ Type      │ Constraints              │
├──────────────────────────────────────────────────────────┤
│ id             │ BIGINT    │ PRIMARY KEY, AUTO-INC    │
│ name           │ VARCHAR   │ NOT NULL, UNIQUE         │
│ code           │ VARCHAR   │ NOT NULL, UNIQUE         │
│ description    │ TEXT      │ NULLABLE                 │
│ department     │ VARCHAR   │ NULLABLE                 │
│ semester       │ INT       │ NULLABLE                 │
│ is_active      │ BOOLEAN   │ DEFAULT TRUE             │
│ created_at     │ TIMESTAMP │ DEFAULT NOW()            │
│ updated_at     │ TIMESTAMP │ DEFAULT NOW()            │
└──────────────────────────────────────────────────────────┘

INDEXES:
├─ idx_subjects_department_semester (department, semester)
├─ idx_subjects_code (code)
└─ idx_subjects_is_active (is_active)

RELATIONSHIPS:
├─ resources.subject → subjects.name (foreign key via name)
├─ attendance.subject → subjects.name (future)
├─ timetable.subject_id → subjects.id (future)
└─ faculty_subjects.subject_id → subjects.id (future)
```

## Access Control Matrix

```
┌────────────┬─────────┬────────┬────────┬────────┐
│ Operation  │ Admin   │ Faculty│ Student│ Guest  │
├────────────┼─────────┼────────┼────────┼────────┤
│ View All   │    ✅   │   ✅   │   ✅   │   ❌   │
│ Search     │    ✅   │   ✅   │   ✅   │   ❌   │
│ Create     │    ✅   │   ❌   │   ❌   │   ❌   │
│ Edit       │    ✅   │   ❌   │   ❌   │   ❌   │
│ Delete     │    ✅   │   ❌   │   ❌   │   ❌   │
│ Use in Form│    ✅   │   ✅   │   ✅   │   ❌   │
└────────────┴─────────┴────────┴────────┴────────┘

Admin can manage at: /subject-management
Others use via: Dropdowns in Resources, Attendance, etc.
```

## State Management Flow

```
SubjectManagement Component State:

┌─────────────────────────────────────────┐
│ Component State (useState)              │
├─────────────────────────────────────────┤
│ subjects[]          - All subjects      │
│ searchTerm          - Filter text       │
│ loading             - Fetch state       │
│ createDialogOpen    - Form visibility   │
│ editingSubject      - Current edit      │
│ formData            - Form values       │
└─────────────────────────────────────────┘
         │
         │ On Mount (useEffect)
         ▼
┌─────────────────────────────────────────┐
│ Load Data (fetchSubjects)               │
├─────────────────────────────────────────┤
│ IF admin:                               │
│   CALL fetchSubjects()                  │
│   • Query all active subjects           │
│   • Sort by department, semester, name  │
│   • Update subjects[] state             │
│ ELSE:                                   │
│   Show access denied                    │
└─────────────────────────────────────────┘
         │
         │ When User Interacts
         ├─→ Search: Filter subjects[]
         ├─→ Create: Add to subjects[]
         ├─→ Edit: Update subjects[]
         └─→ Delete: Remove from subjects[]
```

## Performance Optimization

```
QUERY OPTIMIZATION:

1. Database Indexes:
   ├─ department + semester (GROUP BY queries)
   ├─ code (UNIQUE lookups)
   └─ is_active (WHERE clauses)

2. Caching Opportunities:
   ├─ Component-level state (short-lived)
   ├─ Context API (future, for global state)
   └─ React Query (future, for persistent caching)

3. Query Patterns:
   ├─ Fetch all (sort in DB)
   ├─ Fetch by department (indexed)
   ├─ Fetch by code (indexed + unique)
   └─ Search (text matching in component)

EXPECTED PERFORMANCE:
├─ Load all subjects: < 50ms
├─ Filter by department: < 10ms
├─ Search by code: < 5ms
└─ Create/Update/Delete: < 100ms
```

---

## Summary

This architecture provides:
- ✅ **Separation of Concerns** - UI, Service, Database
- ✅ **Type Safety** - Full TypeScript implementation
- ✅ **Scalability** - Ready for growth
- ✅ **Maintainability** - Clear, documented code
- ✅ **Performance** - Optimized queries
- ✅ **Security** - Role-based access control
- ✅ **Extensibility** - Easy to add features
