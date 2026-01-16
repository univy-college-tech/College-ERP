# Supabase Migrations

This folder contains all database migrations for the College ERP system.

## ⚠️ IMPORTANT: Running Migrations in Supabase

Supabase restricts direct access to the `auth` schema. The migrations have been updated to use:
- `auth.uid()` - Built-in Supabase function to get current user ID  
- `auth.users` - Built-in Supabase table for authentication
- All custom functions are in the `public` schema

## Migration Order

Run these in order in the Supabase SQL Editor:

### Core Migrations (Required)
1. `00001_initial_setup.sql` - Extensions, audit_logs, users table
2. `00002_organizational_structure.sql` - Departments, profiles (student, professor, admin)
3. `00003_academic_time_structure.sql` - Academic years, semesters, batches, courses, branches, sections, classes
4. `00004_class_membership_subjects.sql` - Class students, class subjects, class representatives
5. `00005_timetable_system.sql` - Timetables and slots
6. `00006_attendance_system.sql` - Attendance sessions, records, triggers
7. `00007_marks_assessment.sql` - Assessment components, student marks
8. `00008_communication_groups.sql` - Groups, messages, announcements, notifications
9. `00009_addresses_documents.sql` - Addresses, guardians, emergency contacts, documents
10. `00010_fee_financial.sql` - Fee structures, payments, scholarships
11. `00011_leave_management.sql` - Leave types, balance, applications
12. `00012_support_tickets.sql` - Support tickets and messages
13. `00013_rls_policies.sql` - Row Level Security policies
14. `00014_database_functions.sql` - Common query functions

### Additional Migrations (For Enhanced Batch Management)
These migrations add many-to-many relationships for more flexible academic structure:

15. `add_batch_courses.sql` - Links courses to batches (many-to-many), adds views
16. `add_batch_branches.sql` - Links branches to batches (many-to-many), adds batch_id to classes

**⚠️ Important**: Run `add_batch_courses.sql` and `add_batch_branches.sql` to enable the full Batch Detail page functionality in the Admin Portal.

## Running Migrations

### Option 1: Supabase Dashboard (Recommended for first time)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy-paste each migration file content in order
4. Click **Run**

### Option 2: Supabase CLI (For development)
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Option 3: Quick Setup (Combined Migration)
Use `combined_migration.sql` which contains all migrations in one file.

**Note**: For the new batch-course and batch-branch relationships, also run:
- `add_batch_courses.sql`
- `add_batch_branches.sql`

## Common Issues

### Error: permission denied for schema auth
**Solution**: Don't try to create functions in the `auth` schema. Use `auth.uid()` directly instead.

### Error: relation "auth.users" does not exist
**Solution**: This shouldn't happen in Supabase - `auth.users` is always available.

### Error: policy already exists
**Solution**: The policy was already created. You can skip or drop it first:
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

## RLS Summary

| Role | Students Data | Professors Data | Classes | Attendance | Marks |
|------|---------------|-----------------|---------|------------|-------|
| Admin | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Full CRUD |
| Professor | View own classes | View own | View all | Manage own | Manage own |
| Student | View own only | View basic | View own | View own | View own |

## Creating Test Users

After running migrations, create test users:

1. Go to **Authentication → Users** in Supabase Dashboard
2. Click **Add user** → **Create new user**
3. Create users with email/password
4. Then run SQL to set their roles:

```sql
-- For admin (replace 'auth-user-uuid' with the UUID from step 2)
INSERT INTO users (id, email, full_name, role, is_active)
VALUES ('auth-user-uuid', 'admin@college.edu', 'Admin User', 'admin', true);

-- For professor
INSERT INTO users (id, email, full_name, role, is_active)
VALUES ('auth-user-uuid', 'professor@college.edu', 'Prof. Smith', 'professor', true);

-- For student
INSERT INTO users (id, email, full_name, role, is_active)
VALUES ('auth-user-uuid', 'student@college.edu', 'John Student', 'student', true);
```
