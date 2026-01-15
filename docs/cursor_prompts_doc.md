# Cursor AI Building Prompts

> **Copy-paste these prompts into Cursor/Claude Opus to build the ERP system**

---

## 🚀 Phase 1: Project Setup & Foundation

### Prompt 1: Initialize Project Structure
```
I'm building a College ERP system with 3 separate frontend portals (admin, professor, student) and 2 backend APIs, all using a shared Supabase database.

Tech Stack:
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth

Create the complete monorepo folder structure:
college-erp/
├── docs/ (already have documentation)
├── admin-portal/ (React + Vite)
├── professor-portal/ (React + Vite)
├── student-portal/ (React + Vite)
├── admin-backend/ (Node + Express + TS)
├── academic-backend/ (Node + Express + TS)
├── shared/
│   ├── types/ (TypeScript interfaces)
│   └── utils/ (Shared utilities)
└── package.json (workspace config)

Set up:
1. Root package.json with workspaces
2. Each portal with Vite + React + TS + Tailwind
3. Each backend with Express + TypeScript + proper tsconfig
4. Shared types package
5. ESLint + Prettier configuration
6. Git ignore patterns

Use modern best practices. I'll provide detailed specifications after this.
```

---

### Prompt 2: Supabase Setup & Database Schema
```
I have a complete database schema in DATABASE_SCHEMA.md. 

Create:
1. Supabase migration files for all tables in the correct order (respecting foreign key dependencies)
2. Row Level Security (RLS) policies for each table based on roles (admin, professor, student)
3. Database triggers for:
   - Auto-audit logging (audit_logs table)
   - Updating total_classes_conducted counter
   - Ensuring only one current academic year/semester
4. Database functions for common queries

Key RLS rules:
- Students can only view their own data (profiles, marks, attendance)
- Professors can only manage data for their assigned subjects/classes
- Admins have full access
- All role checks use auth.uid() and user_id relationships

Generate the SQL migration files in supabase/migrations/ folder.
```

---

### Prompt 3: Shared Types Package
```
Based on DATABASE_SCHEMA.md, create TypeScript interfaces for all database tables in shared/types/.

Structure:
shared/types/
├── index.ts (exports all types)
├── user.types.ts
├── academic.types.ts
├── attendance.types.ts
├── marks.types.ts
├── communication.types.ts
├── financial.types.ts
└── api.types.ts (API request/response types)

Requirements:
- Use exact PostgreSQL column names
- Use proper TypeScript types (Date for dates, number for decimals, etc.)
- Include enums for status fields
- Add JSDoc comments for clarity
- Create union types for role-based views
- Include utility types (Paginated<T>, ApiResponse<T>, etc.)

Make types strict and exhaustive.
```

---

## 🎨 Phase 2: Design System Implementation

### Prompt 4: Create Design System Components
```
Using DESIGN_SYSTEM.md as reference, create a complete Tailwind-based component library in shared/components/.

Components needed:
1. Buttons: Primary, Secondary, Icon, FAB
2. Cards: Base, Elevated, Timetable (with variants)
3. Inputs: Text, Checkbox, Select, DatePicker
4. Navigation: BottomNav (mobile), Sidebar (desktop), TopBar
5. Modals: Base modal with overlay
6. Toast/Notifications
7. Loading states: Spinner, Skeleton, Progress
8. Empty states
9. Table component
10. Search bar with filters

Requirements:
- Use Tailwind classes (no custom CSS)
- Full TypeScript with prop types
- Accessibility (ARIA labels, keyboard nav)
- Mobile-first responsive
- Use CSS variables from design system
- Dark theme only
- Smooth animations (framer-motion if needed)

Export all components from shared/components/index.ts
```

---

### Prompt 5: Tailwind Configuration
```
Create tailwind.config.js based on DESIGN_SYSTEM.md with:

1. Custom colors (primary, secondary, accent, status, neutral)
2. Custom spacing scale
3. Custom border-radius
4. Custom box-shadows
5. Custom animations (slideIn, shimmer, pulse)
6. Custom breakpoints
7. Font family (Inter)

Also create:
- Global CSS file with CSS variables
- Typography utility classes
- Glassmorphism utilities

Make it consistent across all 3 portals.
```

---

## 🔐 Phase 3: Authentication System

### Prompt 6: Supabase Auth Service
```
Create authentication service in shared/services/auth.ts using Supabase Auth.

Features needed:
1. signIn(email, password) - Login
2. signUp(email, password, role) - Registration
3. signOut() - Logout
4. getCurrentUser() - Get logged-in user
5. getUserRole() - Get user's role from users table
6. redirectToPortal(role) - Redirect to correct portal based on role
7. isAuthenticated() - Check if user is logged in
8. refreshSession() - Refresh JWT token

Also create:
- AuthContext (React Context) for global auth state
- useAuth() hook for consuming auth in components
- ProtectedRoute component (redirects if not authenticated)
- RoleGuard component (checks user role)

Handle token storage in localStorage with expiry.
```

---

### Prompt 7: Login Pages for All Portals
```
Create login page for each portal (admin, professor, student) with:

Design:
- Dark background with gradient
- Centered login card (glassmorphic)
- Email + Password inputs
- "Remember me" checkbox
- "Forgot password?" link
- Login button with loading state
- Role badge at top (Admin/Professor/Student)

Features:
- Form validation (Zod schema)
- Error handling with toast messages
- Auto-redirect after successful login
- Redirect to correct portal based on role
- Responsive (mobile-first)

Use the Button and Input components from design system.
```

---

## 🏛️ Phase 4: Admin Portal - Structure Creation

### Prompt 8: Admin Dashboard
```
Create admin portal dashboard (/admin-portal/src/pages/Dashboard.tsx) with:

Layout:
- Sidebar navigation (always visible on desktop)
- Top header (breadcrumbs, user profile, notifications)
- Main content area

Dashboard content:
1. Stats cards (4 in a row):
   - Total Students
   - Total Professors
   - Total Batches
   - Total Courses
   (Fetch from Supabase, show count with icon)

2. Recent activity feed:
   - Last 10 actions from audit_logs
   - Show: timestamp, user, action, table
   
3. Quick actions:
   - Add Student
   - Add Professor
   - Create Batch
   - Create Class

Use Card, Button components. Implement skeleton loading states.
```

---

### Prompt 9: Professor Management Page
```
Create /admin-portal/src/pages/Professors.tsx:

Features:
1. Header with "Add Professor" button
2. Search bar (name, email, employee ID)
3. Filters: Department, Designation, Status
4. Professors table with columns:
   - Employee ID
   - Name
   - Email
   - Department
   - Designation
   - Status
   - Actions (Edit, Delete)
5. Pagination (20 per page)

Add Professor Modal:
- Form fields: Name, Email, Employee ID, Department, Designation, Joining Date
- Validation with Zod
- Submit to /api/admin/v1/professors
- Success toast + refresh list

Backend:
Create admin-backend/src/routes/professors.ts with:
- POST /api/admin/v1/professors (create)
- GET /api/admin/v1/professors (list with filters, pagination)
- PUT /api/admin/v1/professors/:id (update)
- DELETE /api/admin/v1/professors/:id (soft delete)

All endpoints should check if user role is 'admin' from Supabase Auth.
```

---

### Prompt 10: Student Management Page
```
Similar to professors, create /admin-portal/src/pages/Students.tsx:

Features:
1. Header with "Register Student" button
2. Search (name, roll number, email)
3. Filters: Batch, Course, Status
4. Students table:
   - Roll Number
   - Name
   - Email
   - Current Semester
   - Status
   - Actions

Register Student Modal:
- Fields: Name, Email, Roll Number, Date of Birth, Gender, Admission Year
- Create user in Supabase Auth with role='student'
- Insert into users + student_profiles tables
- Transaction: rollback if any step fails

Backend endpoints:
- POST /api/admin/v1/students
- GET /api/admin/v1/students
- PUT /api/admin/v1/students/:id
- DELETE /api/admin/v1/students/:id (soft delete)
```

---

### Prompt 11: Academic Structure - Batch to Class Flow
```
Create the hierarchical navigation for Admin Portal:

1. Batches Page (/admin-portal/src/pages/Batches.tsx):
   - Grid of batch cards (2023-2027, 2024-2028, etc.)
   - "Create Batch" button
   - Click batch → go to Batch Detail

2. Batch Detail (/admin-portal/src/pages/BatchDetail.tsx?id={batchId}):
   - Show batch info
   - List of courses in this batch
   - "Add Course" button
   - Click course → Course Detail

3. Course Detail (/admin-portal/src/pages/CourseDetail.tsx?batchId={}&courseId={}):
   - Show course info
   - List of branches
   - Click branch → Sections Page

4. Sections Page (/admin-portal/src/pages/Sections.tsx):
   - List sections (A, B, C)
   - Each section → Class Management Page

Use breadcrumb navigation at top. Implement smooth page transitions.

Backend:
Create endpoints for:
- Batches CRUD
- Courses CRUD
- Branches CRUD
- Sections CRUD
```

---

### Prompt 12: Class Management Page (CRITICAL)
```
This is the MOST IMPORTANT admin page. Create /admin-portal/src/pages/ClassManagement.tsx?classId={id}

Layout:
- Header: Class label (2024-CSE-A), breadcrumbs
- Tabs: Students | Subjects | Timetable | CR | In-Charge

TAB 1 - Students:
- "Add Students" dropdown (Manual | Select from Registered)
- Table of assigned students (roll, name, email)
- Remove button for each student

TAB 2 - Subjects:
- "Add Subject" button
- List of subjects with:
  - Subject name, code, semester
  - Assigned professor dropdown (select from professors list)
  - Remove button
- When professor assigned → auto-create group for this class-subject

TAB 3 - Timetable:
- Upload image option (drag-drop)
- OR structured timetable builder:
  - Day-wise (Monday-Saturday)
  - Period-wise (1-8)
  - Drag subjects into slots
  - Save to timetable_slots table

TAB 4 - CR:
- Select one student from class students list
- Save to class_representatives table

TAB 5 - In-Charge:
- Select one professor from professors list
- Save to classes.class_incharge_id

Backend:
- POST /api/admin/v1/classes/:id/students (assign students)
- POST /api/admin/v1/classes/:id/subjects (add subject + professor)
- POST /api/admin/v1/classes/:id/timetable (upload/create timetable)
- PUT /api/admin/v1/classes/:id/cr (assign CR)
- PUT /api/admin/v1/classes/:id/incharge (assign in-charge)
```

---

## 📱 Phase 5: Professor Portal - Operations

### Prompt 13: Professor Home/Timetable Page
```
Create /professor-portal/src/pages/Home.tsx (Mobile-first design):

Layout:
- No sidebar (mobile-first)
- Bottom tab navigation: Home | Classes | Groups | Profile
- Top header: Date, user name, notification bell

Home Page Content:
1. Greeting: "Good Morning, Prof. {name}!"
2. Today's classes (MS Teams style):
   - Vertical timeline on left (9 AM, 10 AM, etc.)
   - Class cards positioned on timeline based on start time
   - Each card shows:
     - Subject name
     - Class (CSE-A)
     - Room number
     - Time duration (card height = duration)
     - "Contact CR" button (icon)
   
Desktop (≥768px):
- Horizontal week view
- Time on left, days (Mon-Sat) horizontal
- Cards placed on grid

Fetch from:
GET /api/academic/v1/my-timetable
(Returns professor's timetable for current week)

Backend:
Query timetable_slots JOINed with class_subjects where professor_id = current user.
```

---

### Prompt 14: Attendance System - Take Attendance Flow
```
Create attendance flow in /professor-portal/src/pages/Attendance.tsx:

STEP 1 - Class Selection:
- Show today's classes
- Each card: Subject, Class, Time, Student count
- "Take Attendance" button

STEP 2 - Attendance Marking (10-student pagination):
- Header: Subject, Class, Date (editable), Time
- Show total classes conducted
- List 10 students at a time:
  - Roll Number
  - Name
  - Checkbox (default checked = present)
- "Save & Next" button
- Progress indicator (1-10, 11-20, etc.)

STEP 3 - Summary:
- Total students
- Present count
- Absent count
- List of absent students
- "Edit" button (go back to any page)
- "Submit" button (finalize attendance)

On submit:
- Create attendance_session
- Bulk insert attendance_records
- Increment total_classes_conducted in class_subjects
- Show success toast

Backend:
POST /api/academic/v1/attendance
Body: {
  class_subject_id, 
  conducted_date, 
  conducted_time,
  attendance_records: [{ student_id, status }]
}
```

---

### Prompt 15: Marks Upload System
```
Create /professor-portal/src/pages/Marks.tsx:

Step 1 - Selection:
- Select class (from assigned classes)
- Select subject
- Show existing assessment components OR create new

Step 2 - Assessment Components:
- "Add Component" button
- List: Minor 1, Minor 2, Assignment, etc.
- Each: name, max marks, weightage

Step 3 - Marks Entry:
- Table with students (roll, name) as rows
- Assessment components as columns
- Editable input cells
- Auto-save on blur
- Validation (marks ≤ max marks)
- Show pending (yellow) / saved (green) states

Backend:
POST /api/academic/v1/marks
Body: {
  class_subject_id,
  component_name,
  max_marks,
  student_marks: [{ student_id, marks_obtained }]
}
```

---

### Prompt 16: Groups & CR Communication
```
Create /professor-portal/src/pages/Groups.tsx:

Features:
1. List of all subject groups (auto-generated)
   - Each: Subject, Class, Member count
   - If professor is class in-charge, highlight that class's CR at top

2. Click group → Group Chat:
   - Message list (scrollable)
   - Text input at bottom
   - Send button
   - Real-time updates (Supabase Realtime)

3. CR Contact section:
   - Show CRs of all assigned classes
   - Class in-charge's CR shown first with badge
   - Direct message button

Backend:
- GET /api/academic/v1/groups (fetch user's groups)
- POST /api/academic/v1/groups/:id/messages (send message)
- Supabase Realtime subscription to group_messages table
```

---

## 🎓 Phase 6: Student Portal - Consumption

### Prompt 17: Student Home/Timetable
```
Create /student-portal/src/pages/Home.tsx (Mobile-first):

Layout:
- Bottom tab nav: Home | Attendance | Marks | Groups

Home Page:
1. Greeting with class info (CSE-A, Semester 3)
2. Today's classes (timeline view):
   - Same mobile layout as professor portal
   - But: No "Contact CR" button
   - Just view-only

3. Upcoming assignments/exams (if any)
4. Recent announcements

Desktop:
- Weekly grid view (like MS Teams)

Fetch: GET /api/academic/v1/my-timetable
(Returns student's class timetable)
```

---

### Prompt 18: Student Attendance View
```
Create /student-portal/src/pages/Attendance.tsx:

Features:
1. Subject-wise attendance cards:
   - Subject name
   - Total classes conducted
   - Classes attended
   - Attendance % (with color: green ≥75%, yellow 65-74%, red <65%)
   - Progress bar

2. Expandable details:
   - Timeline of all attendance sessions
   - Date, Status (Present ✓ / Absent ✗)

3. Overall attendance:
   - Total % across all subjects
   - Visual donut chart

Backend:
GET /api/academic/v1/my-attendance
Returns: [{
  subject_id,
  subject_name,
  total_classes,
  classes_attended,
  attendance_percentage,
  sessions: [{ date, status }]
}]
```

---

### Prompt 19: Student Marks View
```
Create /student-portal/src/pages/Marks.tsx:

Features:
1. Subject-wise marks cards:
   - Subject name
   - List of assessment components:
     - Component name (Minor 1, Assignment, etc.)
     - Marks obtained / Max marks
     - Grade (if applicable)

2. Overall performance:
   - Average across all subjects
   - Subject-wise comparison bar chart

Backend:
GET /api/academic/v1/my-marks
Returns: [{
  subject_id,
  subject_name,
  assessments: [{
    component_name,
    marks_obtained,
    max_marks,
    percentage
  }]
}]
```

---

### Prompt 20: Student Groups
```
Create /student-portal/src/pages/Groups.tsx:

Same as professor portal but:
- Student is just a member (not admin)
- Can view messages, send messages
- Cannot remove members or delete group

Use same group chat component as professor portal.
```

---

## 🔔 Phase 7: Notifications & Announcements

### Prompt 21: Notification System
```
Create notification system:

1. Notification Bell Icon (in all portals):
   - Badge with unread count
   - Click → Dropdown with recent notifications
   - "Mark all as read" button
   - "View all" link

2. Notifications Page:
   - List all notifications (paginated)
   - Filter: All | Unread | Attendance | Marks | Fees
   - Each notification:
     - Icon based on type
     - Title, message
     - Timestamp
     - Action link (deep link to relevant page)

3. Auto-generate notifications:
   - When attendance marked → notify students
   - When marks uploaded → notify students
   - When announcement published → notify targeted audience

Backend:
- POST /api/academic/v1/notifications (create)
- GET /api/academic/v1/notifications (list with filters)
- PUT /api/academic/v1/notifications/:id/read (mark as read)

Use Supabase Realtime for instant push to frontend.
```

---

### Prompt 22: Announcements System
```
Create announcements:

Admin Portal:
- "Create Announcement" page
- Form: Title, Content, Type, Priority, Target Audience
- Target Audience: All / Students / Professors / Specific Class / Specific Department
- Rich text editor for content
- Attach files (optional)
- Publish immediately or schedule

Professor/Student Portals:
- Announcements feed on home page
- Show recent 5, "View all" link
- Filter by type (Academic, Exam, Event, etc.)
- Mark as read

Backend:
- POST /api/admin/v1/announcements (admin creates)
- GET /api/academic/v1/announcements (fetch for user based on targets)
```

---

## 📊 Phase 8: Reports & Analytics (Optional)

### Prompt 23: Admin Reports
```
Create /admin-portal/src/pages/Reports.tsx:

Reports:
1. Attendance Report:
   - Class-wise attendance %
   - Subject-wise attendance %
   - Defaulters list (< 75%)
   - Export to Excel

2. Marks Report:
   - Class-wise performance
   - Subject-wise average
   - Toppers list
   - Export to Excel

3. Fee Report:
   - Total collected
   - Pending fees
   - Defaulters
   - Export to Excel

Use charts (recharts) for visualization.
```

---

## 🧪 Phase 9: Testing & Optimization

### Prompt 24: Testing Setup
```
Set up testing:

1. Unit tests (Vitest):
   - Test utility functions
   - Test API response parsing
   - Test validation schemas

2. Component tests (React Testing Library):
   - Test button clicks
   - Test form submissions
   - Test modal open/close

3. E2E tests (Playwright):
   - Test login flow
   - Test attendance flow end-to-end
   - Test marks upload flow

Create test files for critical components and flows.
```

---

### Prompt 25: Performance Optimization
```
Optimize the application:

1. Code splitting:
   - Lazy load routes
   - Lazy load heavy components
   - Split by portal

2. Image optimization:
   - Compress images
   - Use WebP format
   - Lazy load images

3. Database optimization:
   - Add indexes on frequently queried columns
   - Use database connection pooling
   - Implement caching (Redis) for hot data

4. Frontend optimization:
   - Memoize expensive components
   - Virtualize long lists
   - Debounce search inputs

Run Lighthouse audit and aim for scores >90.
```

---

## 🚀 Final Prompt: Deployment

### Prompt 26: Production Deployment
```
Prepare for production deployment:

1. Environment variables:
   - Create .env.example for each service
   - Document all required variables
   - Use different Supabase projects for dev/staging/prod

2. Build scripts:
   - Optimize production builds
   - Minify and compress
   - Generate source maps (optional)

3. Deployment:
   - Frontend: Deploy to Vercel/Netlify
   - Backend: Deploy to Railway/Render
   - Database: Supabase Cloud

4. CI/CD:
   - GitHub Actions workflow
   - Auto-deploy on push to main branch
   - Run tests before deployment

5. Monitoring:
   - Error tracking (Sentry)
   - Performance monitoring
   - Database query monitoring

Create deployment documentation.
```

---

## 📝 Usage Instructions

### How to Use These Prompts

1. **Sequential**: Start from Prompt 1 and go in order
2. **Context**: Always provide the relevant `.md` files as context
3. **Iterative**: After each prompt, review output, test, then proceed
4. **Customization**: Modify prompts based on your specific needs
5. **Documentation**: Keep updating docs as you build

### Files to Attach with Each Prompt
- `DATABASE_SCHEMA.md` (for any database-related prompts)
- `DESIGN_SYSTEM.md` (for any UI-related prompts)
- `ARCHITECTURE.md` (for understanding overall structure)

---

## 🎯 Success Criteria

After completing all prompts, you should have:
- ✅ 3 fully functional portals
- ✅ 2 working backend APIs
- ✅ Complete authentication system
- ✅ All CRUD operations for academic structure
- ✅ Attendance system (10-student pagination)
- ✅ Marks upload system
- ✅ Timetable viewing (MS Teams style)
- ✅ Groups & communication
- ✅ Notifications system
- ✅ Mobile-responsive (app-like on mobile)
- ✅ Production-ready code

---

**Ready to build! Start with Prompt 1 and let's create this ERP system. 🚀**
