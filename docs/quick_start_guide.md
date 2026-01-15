# Quick Start Guide

> **Get up and running with College ERP development in minutes**

---

## 📁 Documentation Structure

Your `/docs` folder now contains:

1. **README.md** - Project overview, features, roadmap
2. **ARCHITECTURE.md** - System design, data flow, technical decisions
3. **DATABASE_SCHEMA.md** - Complete database structure with all tables
4. **DESIGN_SYSTEM.md** - UI/UX guidelines, colors, components
5. **CURSOR_PROMPTS.md** - 26 sequential AI prompts for building (⭐ START HERE)
6. **QUICK_START.md** - This file

---

## 🚀 Getting Started (3 Steps)

### Step 1: Read the Vision (5 minutes)
```bash
Open: README.md
```
Understand what you're building and why.

### Step 2: Understand the Structure (10 minutes)
```bash
Open: ARCHITECTURE.md
Skim: DATABASE_SCHEMA.md
```
Get the big picture of how everything connects.

### Step 3: Start Building (Now!)
```bash
Open: CURSOR_PROMPTS.md
Copy Prompt 1 into Cursor
```
Begin with project setup.

---

## 🎯 Your Building Path

### Phase 1: Foundation (Prompts 1-3)
- [ ] Project structure setup
- [ ] Database migration files
- [ ] Shared TypeScript types

**Time**: ~2 hours  
**Output**: Working monorepo with empty portals

---

### Phase 2: Design System (Prompts 4-5)
- [ ] Component library
- [ ] Tailwind configuration

**Time**: ~3 hours  
**Output**: Reusable UI components

---

### Phase 3: Authentication (Prompts 6-7)
- [ ] Auth service with Supabase
- [ ] Login pages for all portals

**Time**: ~2 hours  
**Output**: Working login system with role-based routing

---

### Phase 4: Admin Portal (Prompts 8-12)
- [ ] Dashboard
- [ ] Professor/Student management
- [ ] Academic structure (Batch → Class)
- [ ] **Class Management Page** (most critical)

**Time**: ~8 hours  
**Output**: Fully functional admin control center

---

### Phase 5: Professor Portal (Prompts 13-16)
- [ ] Timetable view (MS Teams style)
- [ ] Attendance system (10-student pagination)
- [ ] Marks upload
- [ ] Groups & CR communication

**Time**: ~6 hours  
**Output**: Mobile-first professor operations portal

---

### Phase 6: Student Portal (Prompts 17-20)
- [ ] Timetable view
- [ ] Attendance view
- [ ] Marks view
- [ ] Groups

**Time**: ~4 hours  
**Output**: Mobile-first student consumption portal

---

### Phase 7: Notifications (Prompts 21-22)
- [ ] Notification system
- [ ] Announcements

**Time**: ~3 hours  
**Output**: Real-time communication system

---

### Phase 8-9: Polish (Prompts 23-26)
- [ ] Reports & analytics
- [ ] Testing
- [ ] Performance optimization
- [ ] Deployment

**Time**: ~6 hours  
**Output**: Production-ready application

---

## 💡 Pro Tips

### Before You Start Each Prompt
1. ✅ Read the prompt completely
2. ✅ Attach relevant `.md` files as context
3. ✅ Review previous output
4. ✅ Test before moving forward

### When Using Cursor
- **Composer Mode**: Use for entire pages/features
- **Chat Mode**: Use for quick fixes/questions
- **Always provide context**: Reference docs, show related files
- **Iterate**: Don't expect perfect code first try

### Development Workflow
```bash
# Terminal 1: Admin Portal
cd admin-portal && npm run dev

# Terminal 2: Professor Portal
cd professor-portal && npm run dev

# Terminal 3: Student Portal
cd student-portal && npm run dev

# Terminal 4: Admin Backend
cd admin-backend && npm run dev

# Terminal 5: Academic Backend
cd academic-backend && npm run dev
```

---

## 🎨 Key Design Principles (Remember These)

### Mobile-First
```
Design for phone → Adapt to desktop
NOT: Design for desktop → Squeeze into mobile
```

### Timetable Layout
```
Desktop: Grid with TIME on LEFT, days horizontal
Mobile: One day, vertical timeline, swipe to change
```

### Cards Don't Show Time
```
❌ Wrong: Time inside card
✅ Right: Card positioned on timeline (position = time)
```

### 10-Student Pagination
```
Attendance UI: Show 10 students at a time
Save → Next 10 → Save → Next 10
(UX decision, not database limitation)
```

---

## 🗂️ Project Structure (After Setup)

```
college-erp/
├── docs/                       ← You are here
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── DESIGN_SYSTEM.md
│   ├── CURSOR_PROMPTS.md
│   └── QUICK_START.md
│
├── admin-portal/               ← Desktop-optimized
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Professors.tsx
│   │   │   ├── Students.tsx
│   │   │   ├── Batches.tsx
│   │   │   └── ClassManagement.tsx ⭐ MOST CRITICAL
│   │   ├── components/
│   │   ├── services/
│   │   └── App.tsx
│   └── package.json
│
├── professor-portal/           ← Mobile-first
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx (Timetable)
│   │   │   ├── Attendance.tsx ⭐ 10-student UI
│   │   │   ├── Marks.tsx
│   │   │   └── Groups.tsx
│   │   └── App.tsx
│   └── package.json
│
├── student-portal/             ← Mobile-first
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx (Timetable)
│   │   │   ├── Attendance.tsx
│   │   │   ├── Marks.tsx
│   │   │   └── Groups.tsx
│   │   └── App.tsx
│   └── package.json
│
├── admin-backend/              ← High-privilege API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── professors.ts
│   │   │   ├── students.ts
│   │   │   ├── batches.ts
│   │   │   └── classes.ts
│   │   ├── middleware/
│   │   └── index.ts
│   └── package.json
│
├── academic-backend/           ← Prof + Student API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── timetable.ts
│   │   │   ├── attendance.ts
│   │   │   ├── marks.ts
│   │   │   └── groups.ts
│   │   ├── middleware/
│   │   └── index.ts
│   └── package.json
│
├── shared/                     ← Shared code
│   ├── types/                  ← TypeScript interfaces
│   ├── components/             ← UI components
│   ├── utils/                  ← Helper functions
│   └── services/               ← API services
│
├── supabase/
│   ├── migrations/             ← Database migrations
│   └── seed.sql                ← Test data
│
└── package.json                ← Workspace config
```

---

## 🔑 Environment Variables

### Create These Files

**admin-portal/.env**
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001
```

**professor-portal/.env**
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3002
```

**student-portal/.env**
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3002
```

**admin-backend/.env**
```
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
PORT=3001
```

**academic-backend/.env**
```
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
PORT=3002
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module '@shared/types'"
```bash
# Solution: Build shared packages first
cd shared/types && npm run build
cd shared/components && npm run build
```

### Issue: "Supabase RLS blocking queries"
```bash
# Solution: Check if user is authenticated
# Check if RLS policy matches user role
# Use Supabase dashboard → SQL Editor to debug
```

### Issue: "Tailwind classes not working"
```bash
# Solution: Check tailwind.config.js content paths
# Restart dev server after config changes
```

### Issue: "CORS errors from backend"
```typescript
// Solution: Add CORS middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
```

---

## 📊 Progress Tracking

### Use This Checklist

**Week 1: Foundation**
- [ ] Project setup (Prompt 1)
- [ ] Database migrations (Prompt 2)
- [ ] Shared types (Prompt 3)
- [ ] Design system (Prompts 4-5)
- [ ] Authentication (Prompts 6-7)

**Week 2: Admin Portal**
- [ ] Dashboard (Prompt 8)
- [ ] Professor management (Prompt 9)
- [ ] Student management (Prompt 10)
- [ ] Academic structure (Prompt 11)
- [ ] Class management (Prompt 12) ⭐

**Week 3: Professor Portal**
- [ ] Timetable (Prompt 13)
- [ ] Attendance (Prompt 14) ⭐
- [ ] Marks (Prompt 15)
- [ ] Groups (Prompt 16)

**Week 4: Student Portal & Polish**
- [ ] Timetable (Prompt 17)
- [ ] Attendance view (Prompt 18)
- [ ] Marks view (Prompt 19)
- [ ] Groups (Prompt 20)
- [ ] Notifications (Prompts 21-22)
- [ ] Testing & deployment (Prompts 23-26)

---

## 🎓 Learning Resources

### If You Get Stuck

**React + TypeScript**
- https://react.dev/learn
- https://www.typescriptlang.org/docs/

**Supabase**
- https://supabase.com/docs
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security

**Tailwind CSS**
- https://tailwindcss.com/docs

**Express + TypeScript**
- https://expressjs.com/
- https://github.com/microsoft/TypeScript-Node-Starter

---

## 🚀 Ready to Build?

### Your Next Steps (Right Now)

1. **Copy all `.md` files to `/docs` folder**
2. **Open `CURSOR_PROMPTS.md`**
3. **Copy Prompt 1 into Cursor**
4. **Start building!**

---

## 💬 Need Help?

### When You're Stuck

1. **Re-read the relevant `.md` file** (usually has the answer)
2. **Check DATABASE_SCHEMA.md** (for data structure questions)
3. **Check DESIGN_SYSTEM.md** (for UI questions)
4. **Check ARCHITECTURE.md** (for "how does X work" questions)
5. **Ask Cursor/Claude** with context from docs

---

## 🎯 Success Markers

You'll know you're on track when:

✅ **After Prompt 1**: All portals run with `npm run dev`  
✅ **After Prompt 7**: You can login and see different portals  
✅ **After Prompt 12**: Admin can create complete academic structure  
✅ **After Prompt 14**: Professor can take attendance (10-student UI works!)  
✅ **After Prompt 18**: Student can see their attendance %  
✅ **After Prompt 26**: Production deployment live  

---

**Now go build something amazing! You have everything you need. 🚀**

---

## 📝 Notes Section (Your Space)

Use this space to track your progress, issues, and decisions:

```
Date: __________
Current Prompt: __________
Issues faced:
-
-
Solutions:
-
-
Next steps:
-
-
```
