# College ERP System

> **A modern, mobile-first, role-based academic management system**

## 🎯 Project Vision

A complete college ERP solution with three specialized portals:
- **Admin Portal**: Structure creation and management (desktop-optimized)
- **Professor Portal**: Daily operations and teaching (mobile-first)
- **Student Portal**: Academic information consumption (mobile-first)

**Core Philosophy**: Admin creates structure → Professor operates within structure → Student consumes structure

---

## 🏗️ Architecture Overview

### Frontend Portals (3 Separate Apps)
```
/admin-portal     → Desktop-first, control center
/professor-portal → Mobile-first, operational
/student-portal   → Mobile-first, read-only
```

### Backend APIs (2 Services)
```
/admin-backend    → High-privilege operations
/academic-backend → Professor + Student operations
```

### Database (1 Unified Supabase)
```
- Supabase Auth (role-based)
- PostgreSQL Database (single source of truth)
- Supabase Storage (timetables, documents)
```

---

## 📋 Key Features

### Admin Portal
- Manage professors and students database
- Create academic structure:
  - **Batches**: Create and manage academic batches (e.g., 2024-2028)
  - **Batch Detail Page** (Accordion UI):
    - Link Courses to Batches
    - Each Course expands to show Branches
    - Add/Create Branches under Courses
    - Add Classes to Branches with auto-suggested labels
- Assign students to classes
- Link professors to subjects
- Upload/create timetables
- Designate CRs and class in-charges
- Global directory search

### Professor Portal
- Daily class timetable (MS Teams style)
- Attendance management (10-student pagination UI)
- Marks/grades upload
- Direct CR communication
- Auto-generated subject groups
- Leave management

### Student Portal
- Personal timetable view
- Attendance overview (subject-wise)
- Marks/results view
- Subject group participation
- Fee payment status
- Notifications

---

## 🎨 Design System

**Color Palette**: Blue (#0066FF), Indigo (#6366F1), Teal (#14B8A6)  
**Theme**: Dark mode with glassmorphism  
**Style**: Modern, sleek, app-like on mobile  

See `DESIGN_SYSTEM.md` for complete details.

---

## 📁 Project Structure

```
college-erp/
├── docs/
│   ├── README.md (this file)
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── DESIGN_SYSTEM.md
│   ├── API_CONTRACTS.md
│   ├── USER_FLOWS.md
│   └── CURSOR_PROMPTS.md
├── admin-portal/
├── professor-portal/
├── student-portal/
├── admin-backend/
├── academic-backend/
└── shared/
    ├── types/
    └── utils/
```
---

college-erp/
├── 📄 package.json              # Root workspace config
├── 📄 tsconfig.base.json        # Shared TypeScript config
├── 📄 .eslintrc.cjs             # ESLint configuration
├── 📄 .prettierrc               # Prettier configuration
├── 📄 .gitignore                # Git ignore patterns
│
├── 📁 docs/                     # Your existing documentation
│
├── 📁 shared/
│   ├── 📁 types/                # @college-erp/types
│   │   └── src/
│   │       ├── index.ts         # Main exports
│   │       ├── common.ts        # UUID, pagination, API response types
│   │       ├── auth.ts          # Authentication types
│   │       ├── user.ts          # User profile types
│   │       ├── academic.ts      # Academic structure types
│   │       ├── attendance.ts    # Attendance types
│   │       ├── marks.ts         # Marks/assessment types
│   │       ├── timetable.ts     # Timetable types
│   │       ├── communication.ts # Groups, notifications
│   │       └── api.ts           # API contract types
│   │
│   └── 📁 utils/                # @college-erp/utils
│       └── src/
│           ├── index.ts
│           ├── date.ts          # Date formatting utilities
│           ├── format.ts        # Text/number formatting
│           ├── validation.ts    # Input validation
│           └── constants.ts     # App constants
│
├── 📁 admin-portal/             # React + Vite (port 5173)
│   ├── src/
│   │   ├── App.tsx              # Router setup
│   │   ├── main.tsx             # Entry point
│   │   ├── index.css            # Tailwind styles
│   │   ├── contexts/AuthContext.tsx
│   │   ├── components/layout/   # Sidebar, Header, Layout
│   │   └── pages/               # Dashboard, Professors, Students, Classes
│   ├── tailwind.config.js       # Design system tokens
│   └── vite.config.ts
│
├── 📁 professor-portal/         # React + Vite (port 5174)
│   └── src/App.tsx              # Mobile-first with bottom nav
│
├── 📁 student-portal/           # React + Vite (port 5175)
│   └── src/App.tsx              # Mobile-first with bottom nav
│
├── 📁 admin-backend/            # Express + TS (port 4001)
│   └── src/
│       ├── index.ts             # Server entry
│       ├── routes/              # Auth, Professors, Students, Academic
│       ├── middleware/          # Error handling
│       └── lib/supabase.ts      # Supabase client
│
└── 📁 academic-backend/         # Express + TS (port 4002)
    └── src/
        ├── index.ts
        ├── routes/              # Timetable, Attendance, Marks, Groups, Notifications
        ├── middleware/
        └── lib/supabase.ts

---

## 🚀 Getting Started

1. Read `ARCHITECTURE.md` for system design
2. Review `DATABASE_SCHEMA.md` for data structure
3. Check `DESIGN_SYSTEM.md` for UI/UX guidelines
4. Use `CURSOR_PROMPTS.md` for AI-assisted development

---

## 🔑 Key Principles

1. **No Data Duplication** - Everything is linked, not copied
2. **Role-Based Access** - Strict separation of concerns
3. **Mobile-First for Operations** - Professors and students use phones
4. **Desktop for Administration** - Complex management needs space
5. **Single Source of Truth** - One database for entire institution

---

## 📱 Responsive Strategy

**Mobile (< 768px)**:
- Bottom tab navigation
- Full-screen cards
- Swipe gestures
- Native app feel

**Desktop (≥ 768px)**:
- Sidebar navigation (admin)
- Top tab navigation (professor/student)
- Grid layouts
- Keyboard shortcuts

---

## 🛠️ Tech Stack

**Frontend**: React + Vite + TypeScript  
**Backend**: Node.js + Express  
**Database**: Supabase (PostgreSQL)  
**Auth**: Supabase Auth  
**Storage**: Supabase Storage  
**Styling**: Tailwind CSS  
**State Management**: React Context / Zustand  

---

## 📖 Documentation Index

- `ARCHITECTURE.md` - System design and data flow
- `DATABASE_SCHEMA.md` - Complete database structure
- `DESIGN_SYSTEM.md` - UI/UX guidelines and components
- `API_CONTRACTS.md` - Backend endpoint specifications
- `USER_FLOWS.md` - Detailed user journeys
- `CURSOR_PROMPTS.md` - AI coding prompts

---

## 🎯 Development Roadmap

### Phase 1: Foundation
- [ ] Database setup (Supabase)
- [ ] Authentication system
- [ ] Admin portal - Dashboard
- [ ] Admin portal - Professor/Student management

### Phase 2: Academic Structure
- [ ] Batch/Course/Branch/Section setup
- [ ] Class management page
- [ ] Timetable creation (image + structured)
- [ ] Professor-subject linking

### Phase 3: Operations
- [ ] Professor portal - Timetable view
- [ ] Attendance system (10-student pagination)
- [ ] Marks upload system
- [ ] Student portal - Timetable view

### Phase 4: Communication
- [ ] CR communication
- [ ] Subject groups
- [ ] Notifications system
- [ ] Announcements

### Phase 5: Advanced Features
- [ ] Fee management
- [ ] Leave management (faculty)
- [ ] Reports and analytics
- [ ] Mobile app (React Native conversion)

---

## 🤝 Contributing

This is a structured, role-based system. When developing:
1. Always check role permissions
2. Never duplicate data across tables
3. Follow the design system strictly
4. Test on both mobile and desktop
5. Ensure accessibility (ARIA labels, keyboard nav)

---

## 📄 License

[Add your license here]

---

**Built with ❤️ for modern educational institutions**
