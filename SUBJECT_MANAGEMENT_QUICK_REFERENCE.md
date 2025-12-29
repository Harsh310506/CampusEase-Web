# Subject Management System - Quick Reference

## 🎯 What's New

A complete subject management system that replaces hardcoded subject lists with a centralized database-driven solution.

## 📁 New Files

| File | Purpose |
|------|---------|
| `src/pages/SubjectManagement.tsx` | Admin interface for managing subjects |
| `src/services/subjectService.ts` | Service layer for all subject operations |
| `subjects_schema.sql` | Database schema and default data |
| `SUBJECT_MANAGEMENT_GUIDE.md` | Detailed documentation |
| `SUBJECT_MANAGEMENT_IMPLEMENTATION.md` | Implementation summary |

## 🔧 Modified Files

| File | Changes |
|------|---------|
| `src/App.tsx` | Added SubjectManagement import and route |
| `src/components/Header.tsx` | Added "Subject Management" admin link |
| `src/pages/Resources.tsx` | Integrated subject service, removed hardcoded subjects |

## 🚀 Quick Start

### For Admins
1. Login as admin
2. Click "Subject Management" in header
3. Create subjects with code, name, department, semester
4. All subjects immediately available across app

### For Developers
```tsx
// Import
import { fetchAllSubjects } from '@/services/subjectService';

// Use in component
const [subjects, setSubjects] = useState([]);

useEffect(() => {
  fetchAllSubjects().then(setSubjects);
}, []);

// Display
{subjects.map(s => <option key={s.id}>{s.name}</option>)}
```

## 📊 Database Schema

```
Table: subjects
├── id (Primary Key)
├── name (Unique)
├── code (Unique, Auto-uppercase)
├── description
├── department
├── semester (1-8)
├── is_active (Boolean)
├── created_at (Timestamp)
└── updated_at (Timestamp)
```

## 🔌 Service Functions

### Query Functions (All users)
- `fetchAllSubjects()` - All active subjects
- `fetchSubjectsByDepartment(dept)` - Filter by department
- `fetchSubjectsByDepartmentAndSemester(dept, sem)` - Filter both
- `getSubjectByCode(code)` - Get single subject
- `getSubjectName(id)` - Get subject name

### Mutation Functions (Admins only)
- `createSubject(data)` - Create new subject
- `updateSubject(id, updates)` - Update subject
- `deleteSubject(id)` - Soft delete subject

## ✨ Features

✅ Centralized subject management
✅ Admin-only access control
✅ Real-time search and filtering
✅ Unique code validation
✅ Grouped display by department/semester
✅ Soft delete (non-destructive)
✅ Toast notifications
✅ Type-safe TypeScript
✅ Error handling
✅ Database indexed for performance

## 🔐 Access Control

| Role | Can View | Can Create | Can Edit | Can Delete |
|------|----------|-----------|----------|-----------|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Faculty | ✅ | ❌ | ❌ | ❌ |
| Student | ✅ | ❌ | ❌ | ❌ |

## 📍 Routes

- `/subject-management` - Admin page (admin only)
- Subject service used globally in app

## 🎨 UI Components

**Admin Dashboard:**
- Search bar with real-time filtering
- Cards grouped by department and semester
- Create/Edit/Delete dialogs
- Confirmation alerts
- Toast notifications

## 📋 Default Subjects (15)

15 pre-configured subjects for CS department, semesters 1-7:
- Data Structures, Database Management, Computer Networks
- Operating Systems, Software Engineering, Web Development
- Machine Learning, Computer Graphics, Cyber Security
- Mobile App Development, Mathematics, Physics
- Chemistry, OOP, Web Technologies

## 🔄 Integration Status

### ✅ Integrated
- Resources page - Uses subject dropdown

### 🔌 Ready for Integration
- Attendance page - Filter by subject
- Timetable system - Assign subjects
- Class management - Link to subjects
- Faculty assignment - Assign faculty to subjects
- Events system - Subject-specific events
- Analytics - Analyze by subject

## 🛠 Development Workflow

1. **Add new page using subjects:**
   ```tsx
   import { fetchAllSubjects } from '@/services/subjectService';
   const subjects = await fetchAllSubjects();
   ```

2. **Create form for subject selection:**
   ```tsx
   <Select>
     {subjects.map(s => <SelectItem key={s.id} value={s.name}>{s.name} ({s.code})</SelectItem>)}
   </Select>
   ```

3. **Filter/search by subject:**
   ```tsx
   const filtered = resources.filter(r => r.subject === selectedSubject.name);
   ```

## ⚡ Performance

- **Indexed queries:** Fast department/semester lookups
- **Soft deletes:** No data loss, maintains integrity
- **Caching ready:** Component-level state management
- **Type safety:** Compile-time error detection

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Subjects not loading | Check `is_active = true` in DB |
| Duplicate code error | Subject codes must be unique |
| Subject not in dropdown | Verify it's marked active |
| Permission denied | Only admins can manage subjects |
| Change not appearing | Page might be cached, reload |

## 📚 Documentation Files

- `SUBJECT_MANAGEMENT_GUIDE.md` - Comprehensive guide
- `SUBJECT_MANAGEMENT_IMPLEMENTATION.md` - Implementation details
- Code comments in `subjectService.ts`
- Component documentation in `SubjectManagement.tsx`

## 🎓 Usage Examples

### Create Subject (Admin)
```
Name: "Artificial Intelligence"
Code: "CS501"
Department: "CS"
Semester: 5
Description: "Introduction to AI concepts and applications"
```

### Use in Resource Upload
```
1. Student uploads resource
2. Selects "Artificial Intelligence (CS501)" from dropdown
3. Resource linked to subject
4. Others filter by same subject to find resource
```

### Filter Resources
```
1. Browse Resources page
2. Use subject filter dropdown
3. Select "Artificial Intelligence"
4. See only AI-related resources
```

## 🎯 Future Enhancements

- [ ] Bulk import via CSV
- [ ] Subject analytics dashboard
- [ ] Faculty assignment to subjects
- [ ] Prerequisites between subjects
- [ ] Enrollment capacity limits
- [ ] Subject archiving system
- [ ] Audit log for changes

## ✅ Testing

Run these to verify system works:

```
1. Create new subject ✓
2. Search/filter subjects ✓
3. Edit subject details ✓
4. Delete subject (soft) ✓
5. Use in Resources dropdown ✓
6. Filter resources by subject ✓
7. Non-admin access denied ✓
8. Code auto-uppercase ✓
```

## 📞 Support

- Full docs: `SUBJECT_MANAGEMENT_GUIDE.md`
- Code reference: `src/services/subjectService.ts`
- Admin UI: `src/pages/SubjectManagement.tsx`

---

**Version:** 1.0  
**Status:** Production Ready ✅  
**Last Updated:** December 2024
