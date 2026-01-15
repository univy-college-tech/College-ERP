# System Architecture

## 🏛️ High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
├───────────────┬──────────────────┬──────────────────────────┤
│ Admin Portal  │ Professor Portal │ Student Portal           │
│ (Desktop)     │ (Mobile-first)   │ (Mobile-first)          │
└───────┬───────┴────────┬─────────┴──────────┬──────────────┘
        │                │                    │
        │                │                    │
┌───────▼────────────────▼────────────────────▼──────────────┐
│                   API GATEWAY LAYER                         │
├──────────────────────────┬──────────────────────────────────┤
│   Admin Backend API      │   Academic Backend API           │
│   (High Privilege)       │   (Professor + Student)          │
└──────────┬───────────────┴────────────┬─────────────────────┘
           │                            │
           │                            │
┌──────────▼────────────────────────────▼─────────────────────┐
│                    SUPABASE LAYER                            │
├──────────────────────────────────────────────────────────────┤
│  Auth Service  │  PostgreSQL DB  │  Storage (Files)          │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 Academic Hierarchy

```
Institution
    └── Departments
         └── Courses (B.Tech, MBA, etc.)
              └── Batches (2023-2027, 2024-2028)
                   └── Branches (CSE, ECE, IT)
                        └── Sections (A, B, C)
                             └── CLASS ← Operational Unit
                                  ├── Students (50-60)
                                  ├── Subjects (per semester)
                                  ├── Professors (per subject)
                                  ├── Timetable
                                  ├── CR (1 student)
                                  └── Class In-charge (1 professor)
```

**Critical Understanding**: The **CLASS** is where everything converges. It's the actual operational unit.

---

## 🎭 Role-Based Architecture

### Role Hierarchy
```
Super Admin
    ├── Academic Admin
    ├── Department Heads (HODs)
    │
Professors
    ├── Class In-charge
    └── Subject Teachers
    │
Students
    └── Class Representatives (CRs)
    │
Support Staff
    ├── Dean
    ├── Student Cell
    ├── Exam Cell
    └── Placement Cell
```

### Access Control Matrix

| Feature | Admin | Professor | Student | Dean | Student Cell |
|---------|-------|-----------|---------|------|--------------|
| Create Batch/Course | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assign Students | ✅ | ❌ | ❌ | ❌ | ❌ |
| Link Prof to Subject | ✅ | ❌ | ❌ | ❌ | ❌ |
| Take Attendance | ❌ | ✅ | ❌ | ❌ | ❌ |
| Upload Marks | ❌ | ✅ | ❌ | ❌ | ❌ |
| View Own Attendance | ❌ | ❌ | ✅ | ❌ | ❌ |
| View Own Marks | ❌ | ❌ | ✅ | ❌ | ❌ |
| Approve Leaves | ✅ | ❌ | ❌ | ✅ | ❌ |
| Handle Grievances | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🔄 Data Flow Patterns

### 1. Admin Creates Structure
```
Admin Portal
    ↓ (HTTP POST)
Admin Backend API
    ↓ (INSERT)
Supabase Database
    ↓ (Realtime Subscription)
All Portals (Auto-update)
```

### 2. Professor Takes Attendance
```
Professor Portal (Mobile)
    ↓ (Mark 10 students, paginate)
Academic Backend API
    ↓ (Batch INSERT)
attendance_sessions + attendance_records
    ↓ (Trigger Update)
class_subjects.total_classes_conducted++
    ↓ (Realtime)
Student Portal (Attendance % updates)
```

### 3. Student Views Timetable
```
Student Portal
    ↓ (GET /timetable/:classId/:semester)
Academic Backend API
    ↓ (JOIN timetables + timetable_slots + class_subjects)
Supabase Database
    ↓ (Return structured data)
Render MS Teams-style view
```

---

## 🗄️ Database Design Philosophy

### Principles
1. **Normalized to 3NF** - No redundancy
2. **Audit Trail** - Every critical table has created_by, updated_at, is_deleted
3. **Soft Deletes** - Never hard delete, use is_deleted flag
4. **Historical Data** - Academic years/semesters preserve past data
5. **Relationship Integrity** - Foreign keys with CASCADE where appropriate

### Key Tables (Simplified View)

**Identity & Auth**
- `users` → All humans (email, role)
- `student_profiles` → Student-specific data
- `professor_profiles` → Professor-specific data

**Academic Structure**
- `departments` → CSE, ECE, etc.
- `academic_years` → 2024-25, 2025-26
- `semesters` → Odd/Even with dates
- `batches` → 2023-2027, 2024-2028
- `courses` → B.Tech, MBA
- `branches` → CSE, IT (under courses)
- `sections` → A, B, C
- `classes` → **Operational unit** (batch+course+branch+section)

**Operations**
- `class_students` → Students assigned to class
- `class_subjects` → Subjects taught in class (professor link)
- `attendance_sessions` → Each class session
- `attendance_records` → Individual student attendance
- `assessment_components` → Marks columns (Minor 1, Assignment, etc.)
- `student_marks` → Individual marks

**Communication**
- `groups` → Auto-generated per subject-class
- `group_members` → Students + Professor
- `announcements` → College-wide
- `notifications` → User-specific

See `DATABASE_SCHEMA.md` for complete structure.

---

## 🔐 Authentication Flow

### Login Process
```
1. User enters email/password
    ↓
2. Supabase Auth validates credentials
    ↓
3. On success, return JWT token + user metadata
    ↓
4. Frontend queries user role from `users` table
    ↓
5. Route to appropriate portal:
   - role = 'admin' → /admin-portal
   - role = 'professor' → /professor-portal
   - role = 'student' → /student-portal
    ↓
6. Store token in localStorage (with expiry)
    ↓
7. All API calls include Authorization: Bearer <token>
```

### Row Level Security (RLS) Policies

**Example: Students can only see their own data**
```sql
CREATE POLICY "Students view own records"
ON student_profiles
FOR SELECT
USING (auth.uid() = user_id);
```

**Example: Professors can only take attendance for their subjects**
```sql
CREATE POLICY "Professors mark attendance for assigned subjects"
ON attendance_sessions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM class_subjects
    WHERE class_subjects.id = attendance_sessions.class_subject_id
    AND class_subjects.professor_id = (
      SELECT id FROM professor_profiles WHERE user_id = auth.uid()
    )
  )
);
```

---

## 🚀 API Architecture

### Admin Backend API (`/admin-backend`)

**Base URL**: `/api/admin/v1`

**Endpoints**:
```
POST   /professors              → Create professor
GET    /professors              → List all professors
PUT    /professors/:id          → Update professor
DELETE /professors/:id          → Soft delete professor

POST   /students                → Register student
GET    /students                → List all students
PUT    /students/:id            → Update student

POST   /batches                 → Create batch
GET    /batches                 → List batches
POST   /batches/:id/courses     → Add course to batch
POST   /classes                 → Create class
PUT    /classes/:id/students    → Assign students to class
PUT    /classes/:id/subjects    → Add subject to class
PUT    /classes/:id/timetable   → Upload/create timetable
PUT    /classes/:id/cr          → Assign CR
```

### Academic Backend API (`/academic-backend`)

**Base URL**: `/api/academic/v1`

**Endpoints**:
```
GET    /timetable/:classId      → Get class timetable
GET    /my-timetable            → Get logged-in user's timetable

POST   /attendance              → Take attendance
GET    /attendance/:classSubjectId → Get attendance history
PUT    /attendance/:sessionId   → Edit attendance session

POST   /marks                   → Upload marks
GET    /marks/:classSubjectId   → Get marks for subject
GET    /my-marks                → Student's own marks

GET    /groups                  → Get user's groups
POST   /groups/:id/messages     → Send message in group

GET    /notifications           → Get user notifications
PUT    /notifications/:id/read  → Mark as read
```

---

## 📱 Frontend Architecture

### State Management Strategy

**Global State (React Context / Zustand)**:
- User authentication (token, role, profile)
- Current academic year/semester
- Notifications count

**Local State (React useState)**:
- Form inputs
- UI toggles (modals, dropdowns)
- Pagination state

**Server State (React Query / SWR)**:
- Timetables
- Attendance data
- Marks data
- Student/Professor lists

### Component Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Input.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── BottomNav.tsx
│   └── domain/
│       ├── Timetable/
│       │   ├── TimetableGrid.tsx
│       │   ├── TimetableCard.tsx
│       │   └── TimetableSlot.tsx
│       ├── Attendance/
│       │   ├── AttendanceList.tsx
│       │   └── AttendanceMarker.tsx
│       └── Marks/
│           └── MarksTable.tsx
├── pages/
│   ├── admin/
│   ├── professor/
│   └── student/
├── hooks/
│   ├── useAuth.ts
│   ├── useTimetable.ts
│   └── useAttendance.ts
├── services/
│   ├── api.ts
│   ├── auth.ts
│   └── supabase.ts
└── types/
    ├── user.ts
    ├── academic.ts
    └── attendance.ts
```

---

## 🔄 Real-time Updates

### Supabase Realtime Subscriptions

**Example: Live attendance updates**
```typescript
// Professor marks attendance
// → attendance_sessions table updated
// → Trigger broadcasts change
// → Student portal subscribed to changes
// → Student's attendance % updates instantly

supabase
  .channel('attendance-updates')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'attendance_records',
    filter: `student_id=eq.${studentId}`
  }, (payload) => {
    // Refetch attendance summary
    queryClient.invalidateQueries(['attendance', studentId]);
  })
  .subscribe();
```

---

## 🎯 Performance Optimization

### Caching Strategy
- **Timetables**: Cache for 1 hour (rarely changes)
- **Attendance**: Cache for 5 minutes (moderate changes)
- **Notifications**: No cache (real-time critical)

### Lazy Loading
- **Admin Portal**: Load professor/student lists on-demand (paginated)
- **Timetable**: Load only current week by default
- **Attendance**: Load only current semester by default

### Image Optimization
- **Timetable Images**: Upload to Supabase Storage, serve via CDN
- **Profile Pictures**: Compress to WebP, max 200KB
- **Documents**: Store original + generate thumbnail

---

## 🛡️ Security Considerations

### Input Validation
- **Backend**: Use Zod/Joi for all inputs
- **Frontend**: Client-side validation for UX, never trust client

### SQL Injection Prevention
- **Always use parameterized queries**
- **Never concatenate user input into SQL**

### XSS Prevention
- **React auto-escapes by default**
- **Use DOMPurify for rich text content**

### CSRF Protection
- **Use Supabase session tokens (httpOnly cookies)**
- **Verify origin header on all mutations**

---

## 📊 Monitoring & Logging

### Application Logs
```
INFO:  User login successful (user_id: xxx, role: professor)
WARN:  Failed attendance submission (reason: invalid date)
ERROR: Database connection timeout (retry in 5s)
```

### Audit Logs (Database)
```sql
-- Every critical action logged
INSERT INTO audit_logs (
  table_name,
  record_id,
  action_type,
  old_values,
  new_values,
  changed_by,
  changed_at
)
```

### Performance Metrics
- API response times (p50, p95, p99)
- Database query performance
- Frontend bundle size
- Lighthouse scores (mobile/desktop)

---

## 🔄 Deployment Strategy

### Environment Structure
```
Development  → localhost:3000 (local Supabase)
Staging      → staging.erp.college.com (Supabase staging)
Production   → erp.college.com (Supabase production)
```

### CI/CD Pipeline
```
1. Code pushed to GitHub
2. GitHub Actions runs:
   - Linting (ESLint)
   - Type checking (TypeScript)
   - Unit tests (Vitest)
   - Build (Vite)
3. If main branch → Deploy to production
   If develop branch → Deploy to staging
```

---

## 🎯 Scalability Considerations

### Database
- **Indexes** on frequently queried columns (user_id, class_id, date)
- **Partitioning** attendance_records by academic_year
- **Archiving** old academic years to separate tables

### Frontend
- **Code splitting** by portal (admin/professor/student)
- **Lazy loading** routes
- **Virtual scrolling** for large lists

### Backend
- **Connection pooling** (PgBouncer)
- **Rate limiting** (100 requests/min per user)
- **Caching** with Redis for hot data

---

## 🔮 Future Extensions

### Phase 2 Features
- **Library Management** (book issue/return)
- **Hostel Management** (room allocation, mess)
- **Placement Cell** (job postings, applications)
- **Exam Cell** (hall tickets, result publishing)

### Phase 3 - Mobile Apps
- Convert to **React Native** (share components)
- **Offline-first** architecture (sync when online)
- **Push notifications** (attendance marked, fee due)

---

**Next Steps**: Review `DATABASE_SCHEMA.md` for complete data structure.
