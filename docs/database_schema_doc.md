# Database Schema

> **Enterprise-grade, normalized, extensible database design for complete college ERP**

---

## 🎯 Design Principles

1. ✅ **Single Source of Truth** - No data duplication
2. ✅ **Normalized to 3NF** - Eliminate redundancy
3. ✅ **Audit Trail** - Track all changes
4. ✅ **Soft Deletes** - Never lose data
5. ✅ **Role-Based Access** - RLS policies for security
6. ✅ **Historical Preservation** - Academic years maintain past data
7. ✅ **Extensible** - Easy to add new modules

---

## 📋 Table of Contents

1. [Auth & Identity](#auth--identity)
2. [Organizational Structure](#organizational-structure)
3. [Academic Time Management](#academic-time-management)
4. [Academic Structure](#academic-structure)
5. [Class & Membership](#class--membership)
6. [Subjects & Teaching](#subjects--teaching)
7. [Timetable System](#timetable-system)
8. [Attendance System](#attendance-system)
9. [Marks/Assessment System](#marksassessment-system)
10. [Communication & Groups](#communication--groups)
11. [Person Management](#person-management)
12. [Fee & Financial](#fee--financial)
13. [Faculty Leave & Attendance](#faculty-leave--attendance)
14. [Notifications](#notifications)
15. [Support System](#support-system)
16. [Audit & History](#audit--history)

---

## 1. Auth & Identity

### `users` (All humans in the system)
```sql
CREATE TABLE users (
  id                  uuid PRIMARY KEY REFERENCES auth.users(id),
  email               text UNIQUE NOT NULL,
  full_name           text NOT NULL,
  phone               text,
  role                text NOT NULL CHECK (role IN (
                        'admin', 'professor', 'student', 
                        'dean', 'student_cell', 'staff'
                      )),
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  created_by          uuid REFERENCES users(id),
  updated_at          timestamptz DEFAULT now(),
  is_deleted          boolean DEFAULT false,
  deleted_at          timestamptz,
  deleted_by          uuid REFERENCES users(id),
  version             int DEFAULT 1,
  last_modified_by    uuid REFERENCES users(id),
  last_modified_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;
```

---

## 2. Organizational Structure

### `departments`
```sql
CREATE TABLE departments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_name     text NOT NULL,
  department_code     text UNIQUE NOT NULL,
  department_type     text CHECK (department_type IN ('academic', 'administrative', 'support')),
  hod_id              uuid REFERENCES professor_profiles(id),
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  created_by          uuid REFERENCES users(id),
  is_deleted          boolean DEFAULT false,
  deleted_at          timestamptz,
  deleted_by          uuid REFERENCES users(id)
);
```

### `student_profiles`
```sql
CREATE TABLE student_profiles (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid REFERENCES users(id) UNIQUE,
  roll_number             text UNIQUE NOT NULL,
  registration_number     text UNIQUE,
  admission_number        text UNIQUE,
  date_of_birth           date NOT NULL,
  gender                  text CHECK (gender IN ('male', 'female', 'other')),
  blood_group             text,
  category                text CHECK (category IN ('general', 'obc', 'sc', 'st', 'ews')),
  religion                text,
  nationality             text DEFAULT 'Indian',
  mother_tongue           text,
  current_semester        int,
  admission_year          int NOT NULL,
  admission_type          text CHECK (admission_type IN ('regular', 'lateral_entry', 'management')),
  previous_education      jsonb,
  status                  text DEFAULT 'active' CHECK (status IN ('active', 'dropped', 'graduated', 'suspended', 'transferred')),
  is_active               boolean DEFAULT true,
  created_at              timestamptz DEFAULT now(),
  created_by              uuid REFERENCES users(id),
  is_deleted              boolean DEFAULT false,
  deleted_at              timestamptz,
  deleted_by              uuid REFERENCES users(id)
);
```

### `professor_profiles`
```sql
CREATE TABLE professor_profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES users(id) UNIQUE,
  employee_id         text UNIQUE NOT NULL,
  department_id       uuid REFERENCES departments(id) NOT NULL,
  designation         text NOT NULL,
  qualification       text,
  specialization      text,
  date_of_birth       date,
  gender              text CHECK (gender IN ('male', 'female', 'other')),
  joining_date        date NOT NULL,
  employment_type     text CHECK (employment_type IN ('permanent', 'contract', 'visiting', 'adjunct')),
  salary_grade        text,
  bank_account        text,
  pan_number          text,
  reporting_to        uuid REFERENCES professor_profiles(id),
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  created_by          uuid REFERENCES users(id),
  is_deleted          boolean DEFAULT false,
  deleted_at          timestamptz,
  deleted_by          uuid REFERENCES users(id)
);
```

### `admin_profiles`
```sql
CREATE TABLE admin_profiles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES users(id) UNIQUE,
  admin_level   text CHECK (admin_level IN ('super_admin', 'academic_admin', 'staff')),
  permissions   jsonb,
  created_at    timestamptz DEFAULT now()
);
```

### `official_profiles` (Dean, Student Cell, etc.)
```sql
CREATE TABLE official_profiles (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES users(id) UNIQUE,
  office_type       text CHECK (office_type IN ('dean', 'student_cell', 'exam_cell', 'training_cell', 'placement_cell')),
  office_name       text NOT NULL,
  authority_level   int DEFAULT 1,
  created_at        timestamptz DEFAULT now()
);
```

---

## 3. Academic Time Management

### `academic_years`
```sql
CREATE TABLE academic_years (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year_label        text UNIQUE NOT NULL,  -- "2024-2025"
  start_date        date NOT NULL,
  end_date          date NOT NULL,
  is_current        boolean DEFAULT false,  -- Only ONE can be true
  is_active         boolean DEFAULT true,
  created_at        timestamptz DEFAULT now(),
  created_by        uuid REFERENCES users(id),
  CHECK (start_date < end_date)
);

-- Ensure only ONE current academic year
CREATE UNIQUE INDEX idx_current_academic_year 
ON academic_years(is_current) 
WHERE is_current = true;
```

### `semesters`
```sql
CREATE TABLE semesters (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id    uuid REFERENCES academic_years(id) ON DELETE CASCADE,
  semester_type       text NOT NULL CHECK (semester_type IN ('odd', 'even')),
  semester_number     int NOT NULL,  -- 1, 2, 3, 4, 5, 6, 7, 8
  start_date          date NOT NULL,
  end_date            date NOT NULL,
  is_current          boolean DEFAULT false,
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  UNIQUE(academic_year_id, semester_type),
  CHECK (start_date < end_date)
);

CREATE UNIQUE INDEX idx_current_semester 
ON semesters(is_current) 
WHERE is_current = true;
```

---

## 4. Academic Structure

### `batches`
```sql
CREATE TABLE batches (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_name    text UNIQUE NOT NULL,  -- "2023-2027"
  start_year    int NOT NULL,
  end_year      int NOT NULL,
  is_active     boolean DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  created_by    uuid REFERENCES users(id),
  is_deleted    boolean DEFAULT false
);
```

### `courses`
```sql
CREATE TABLE courses (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_name       text NOT NULL,  -- "B.Tech", "MBA"
  course_code       text UNIQUE NOT NULL,
  duration_years    int NOT NULL,
  is_active         boolean DEFAULT true,
  created_at        timestamptz DEFAULT now(),
  is_deleted        boolean DEFAULT false
);
```

### `batch_courses` ⭐ **(MANY-TO-MANY: Batch ↔ Course)**
```sql
-- Links which courses are offered in which batches
CREATE TABLE batch_courses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id        uuid REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
  course_id       uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(batch_id, course_id)
);

CREATE INDEX idx_batch_courses_batch ON batch_courses(batch_id);
CREATE INDEX idx_batch_courses_course ON batch_courses(course_id);
```

### `branches`
```sql
CREATE TABLE branches (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     uuid REFERENCES courses(id) ON DELETE CASCADE,
  department_id uuid REFERENCES departments(id),
  branch_name   text NOT NULL,  -- "Computer Science"
  branch_code   text NOT NULL,  -- "CSE"
  is_active     boolean DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  created_by    uuid REFERENCES users(id),
  is_deleted    boolean DEFAULT false,
  UNIQUE(course_id, branch_code)
);
```

### `batch_branches` ⭐ **(MANY-TO-MANY: Batch ↔ Branch)**
```sql
-- Links which branches are offered in which batches
-- A branch (e.g., CSE under B.Tech) can be offered in multiple batches
CREATE TABLE batch_branches (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id        uuid REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
  branch_id       uuid REFERENCES branches(id) ON DELETE CASCADE NOT NULL,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(batch_id, branch_id)
);

CREATE INDEX idx_batch_branches_batch ON batch_branches(batch_id);
CREATE INDEX idx_batch_branches_branch ON batch_branches(branch_id);
```

### `sections`
```sql
CREATE TABLE sections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id       uuid REFERENCES branches(id) ON DELETE CASCADE,
  section_name    text NOT NULL,  -- "A", "B", "C"
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  is_deleted      boolean DEFAULT false,
  UNIQUE(branch_id, section_name)
);
```

### `classes` ⭐ **(OPERATIONAL CORE)**
```sql
-- The CLASS is the operational unit where students, subjects, and timetables converge
-- Each class belongs to a specific batch and branch
CREATE TABLE classes (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id            uuid REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
  branch_id           uuid REFERENCES branches(id) ON DELETE CASCADE NOT NULL,
  class_label         text NOT NULL,  -- "2024-CSE-A"
  class_incharge_id   uuid REFERENCES professor_profiles(id),
  current_strength    int DEFAULT 0,
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  created_by          uuid REFERENCES users(id),
  is_deleted          boolean DEFAULT false,
  UNIQUE(batch_id, branch_id, class_label)
);

CREATE INDEX idx_classes_batch ON classes(batch_id);
CREATE INDEX idx_classes_branch ON classes(branch_id);
```

---

## 5. Class & Membership

### `class_students` ⭐ **(CRITICAL JUNCTION)**
```sql
CREATE TABLE class_students (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id      uuid REFERENCES classes(id) ON DELETE CASCADE,
  student_id    uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  is_cr         boolean DEFAULT false,
  joined_at     timestamptz DEFAULT now(),
  UNIQUE(class_id, student_id)
);

-- Only ONE CR per class
CREATE UNIQUE INDEX idx_one_cr_per_class 
ON class_students(class_id) 
WHERE is_cr = true;
```

### `class_representatives` (Explicit CR Tracking)
```sql
CREATE TABLE class_representatives (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id      uuid REFERENCES classes(id) ON DELETE CASCADE UNIQUE,
  student_id    uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  assigned_at   timestamptz DEFAULT now(),
  assigned_by   uuid REFERENCES users(id)
);
```

---

## 6. Subjects & Teaching

### `subjects`
```sql
CREATE TABLE subjects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_name    text NOT NULL,
  subject_code    text UNIQUE NOT NULL,
  credits         int,
  subject_type    text CHECK (subject_type IN ('theory', 'practical', 'lab', 'project')),
  created_at      timestamptz DEFAULT now(),
  is_deleted      boolean DEFAULT false
);
```

### `class_subjects` ⭐ **(TEACHING ASSIGNMENT)**
```sql
CREATE TABLE class_subjects (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id                uuid REFERENCES classes(id) ON DELETE CASCADE,
  subject_id              uuid REFERENCES subjects(id) ON DELETE CASCADE,
  professor_id            uuid REFERENCES professor_profiles(id),
  semester_id             uuid REFERENCES semesters(id) NOT NULL,
  total_classes_planned   int DEFAULT 0,
  total_classes_conducted int DEFAULT 0,
  is_active               boolean DEFAULT true,
  created_at              timestamptz DEFAULT now(),
  created_by              uuid REFERENCES users(id),
  is_deleted              boolean DEFAULT false,
  UNIQUE(class_id, subject_id, semester_id)
);

CREATE INDEX idx_class_subjects_professor ON class_subjects(professor_id);
CREATE INDEX idx_class_subjects_class ON class_subjects(class_id);
```

---

## 7. Timetable System

### `timetables`
```sql
CREATE TABLE timetables (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id        uuid REFERENCES classes(id) ON DELETE CASCADE,
  semester_id     uuid REFERENCES semesters(id) NOT NULL,
  type            text NOT NULL CHECK (type IN ('image', 'structured')),
  image_url       text,  -- Only if type = 'image'
  effective_from  date,
  effective_to    date,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  created_by      uuid REFERENCES users(id),
  is_deleted      boolean DEFAULT false,
  UNIQUE(class_id, semester_id)
);
```

### `timetable_slots` (For Structured Timetables)
```sql
CREATE TABLE timetable_slots (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id      uuid REFERENCES timetables(id) ON DELETE CASCADE,
  day_of_week       text CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')),
  period_number     int,  -- 1, 2, 3, etc.
  start_time        time NOT NULL,
  end_time          time NOT NULL,
  class_subject_id  uuid REFERENCES class_subjects(id),
  room_number       text,
  created_at        timestamptz DEFAULT now(),
  UNIQUE(timetable_id, day_of_week, period_number)
);

CREATE INDEX idx_timetable_slots_day ON timetable_slots(day_of_week);
```

---

## 8. Attendance System

### `attendance_sessions`
```sql
CREATE TABLE attendance_sessions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_subject_id    uuid REFERENCES class_subjects(id) ON DELETE CASCADE,
  conducted_date      date NOT NULL,
  conducted_time      time,
  recorded_by         uuid REFERENCES professor_profiles(id),
  total_present       int,
  total_absent        int,
  is_finalized        boolean DEFAULT false,
  created_at          timestamptz DEFAULT now(),
  UNIQUE(class_subject_id, conducted_date)
);

CREATE INDEX idx_attendance_date ON attendance_sessions(conducted_date);
```

### `attendance_records`
```sql
CREATE TABLE attendance_records (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    uuid REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id    uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  status        text CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_at     timestamptz DEFAULT now(),
  UNIQUE(session_id, student_id)
);

CREATE INDEX idx_attendance_student ON attendance_records(student_id);
```

---

## 9. Marks/Assessment System

### `assessment_components`
```sql
CREATE TABLE assessment_components (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_subject_id    uuid REFERENCES class_subjects(id) ON DELETE CASCADE,
  component_name      text NOT NULL,  -- "Minor 1", "Assignment", "Project"
  component_type      text CHECK (component_type IN ('assignment', 'quiz', 'minor', 'major', 'internal', 'project')),
  max_marks           int NOT NULL,
  weightage_percent   decimal(5,2),
  conducted_date      date,
  created_at          timestamptz DEFAULT now(),
  is_deleted          boolean DEFAULT false,
  UNIQUE(class_subject_id, component_name)
);
```

### `student_marks`
```sql
CREATE TABLE student_marks (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  component_id      uuid REFERENCES assessment_components(id) ON DELETE CASCADE,
  marks_obtained    decimal(5,2) NOT NULL,
  remarks           text,
  uploaded_by       uuid REFERENCES professor_profiles(id),
  uploaded_at       timestamptz DEFAULT now(),
  is_deleted        boolean DEFAULT false,
  UNIQUE(student_id, component_id)
);

CREATE INDEX idx_marks_student ON student_marks(student_id);
```

---

## 10. Communication & Groups

### `groups`
```sql
CREATE TABLE groups (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_type      text CHECK (group_type IN ('class_subject', 'class_general', 'cr_professor', 'admin')),
  group_name      text NOT NULL,
  class_id        uuid REFERENCES classes(id),
  class_subject_id uuid REFERENCES class_subjects(id),
  created_by      uuid REFERENCES users(id),
  created_at      timestamptz DEFAULT now(),
  is_deleted      boolean DEFAULT false
);
```

### `group_members`
```sql
CREATE TABLE group_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      uuid REFERENCES groups(id) ON DELETE CASCADE,
  user_id       uuid REFERENCES users(id) ON DELETE CASCADE,
  role          text CHECK (role IN ('admin', 'member', 'moderator')),
  joined_at     timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);
```

### `group_messages` (Optional)
```sql
CREATE TABLE group_messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      uuid REFERENCES groups(id) ON DELETE CASCADE,
  sender_id     uuid REFERENCES users(id),
  message_text  text NOT NULL,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_messages_group ON group_messages(group_id, created_at DESC);
```

---

## 11. Person Management

### `addresses`
```sql
CREATE TABLE addresses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address_line1   text NOT NULL,
  address_line2   text,
  city            text NOT NULL,
  state           text NOT NULL,
  country         text DEFAULT 'India',
  postal_code     text NOT NULL,
  address_type    text CHECK (address_type IN ('current', 'permanent', 'office')),
  is_verified     boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);
```

### `user_addresses`
```sql
CREATE TABLE user_addresses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE,
  address_id      uuid REFERENCES addresses(id) ON DELETE CASCADE,
  address_type    text CHECK (address_type IN ('current', 'permanent', 'correspondence')),
  is_primary      boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(user_id, address_type)
);
```

### `emergency_contacts`
```sql
CREATE TABLE emergency_contacts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES users(id) ON DELETE CASCADE,
  contact_name        text NOT NULL,
  relationship        text NOT NULL,
  phone_primary       text NOT NULL,
  phone_secondary     text,
  email               text,
  address_id          uuid REFERENCES addresses(id),
  is_primary          boolean DEFAULT false,
  created_at          timestamptz DEFAULT now()
);
```

### `guardians` (For Students)
```sql
CREATE TABLE guardians (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  guardian_type       text CHECK (guardian_type IN ('father', 'mother', 'legal_guardian')),
  full_name           text NOT NULL,
  phone               text NOT NULL,
  email               text,
  occupation          text,
  annual_income       decimal(12,2),
  address_id          uuid REFERENCES addresses(id),
  is_primary          boolean DEFAULT false,
  created_at          timestamptz DEFAULT now()
);
```

### `documents`
```sql
CREATE TABLE documents (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES users(id) ON DELETE CASCADE,
  document_type       text CHECK (document_type IN (
                        'aadhar', 'pan', 'passport', 'driving_license', 
                        'birth_certificate', 'tenth_marksheet', 'twelfth_marksheet',
                        'degree_certificate', 'transfer_certificate', 'character_certificate',
                        'migration_certificate', 'income_certificate', 'caste_certificate',
                        'passport_photo', 'signature'
                      )),
  document_number     text,
  document_url        text NOT NULL,
  issued_date         date,
  expiry_date         date,
  verified_by         uuid REFERENCES users(id),
  verified_at         timestamptz,
  is_verified         boolean DEFAULT false,
  created_at          timestamptz DEFAULT now(),
  uploaded_by         uuid REFERENCES users(id),
  UNIQUE(user_id, document_type)
);
```

---

## 12. Fee & Financial

### `fee_structures`
```sql
CREATE TABLE fee_structures (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id           uuid REFERENCES courses(id),
  branch_id           uuid REFERENCES branches(id),
  academic_year_id    uuid REFERENCES academic_years(id),
  semester_id         uuid REFERENCES semesters(id),
  fee_category        text CHECK (fee_category IN (
                        'tuition', 'hostel', 'library', 'exam', 'lab', 
                        'transport', 'sports', 'development', 'caution_deposit', 'other'
                      )),
  amount              decimal(10,2) NOT NULL,
  is_mandatory        boolean DEFAULT true,
  due_date            date,
  description         text,
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  created_by          uuid REFERENCES users(id),
  CHECK (amount >= 0)
);
```

### `student_fee_assignments`
```sql
CREATE TABLE student_fee_assignments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  fee_structure_id    uuid REFERENCES fee_structures(id),
  academic_year_id    uuid REFERENCES academic_years(id),
  semester_id         uuid REFERENCES semesters(id),
  total_amount        decimal(10,2) NOT NULL,
  amount_paid         decimal(10,2) DEFAULT 0,
  amount_pending      decimal(10,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
  waiver_amount       decimal(10,2) DEFAULT 0,
  due_date            date NOT NULL,
  status              text CHECK (status IN ('pending', 'partially_paid', 'paid', 'overdue', 'waived')),
  created_at          timestamptz DEFAULT now(),
  CHECK (amount_paid >= 0),
  CHECK (waiver_amount >= 0)
);
```

### `fee_payments`
```sql
CREATE TABLE fee_payments (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id              uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  fee_assignment_id       uuid REFERENCES student_fee_assignments(id),
  amount_paid             decimal(10,2) NOT NULL,
  payment_date            date NOT NULL,
  payment_mode            text CHECK (payment_mode IN ('cash', 'card', 'upi', 'net_banking', 'cheque', 'dd', 'online')),
  transaction_id          text UNIQUE,
  reference_number        text,
  receipt_number          text UNIQUE NOT NULL,
  payment_gateway         text,
  payment_status          text CHECK (payment_status IN ('pending', 'success', 'failed', 'refunded')),
  remarks                 text,
  received_by             uuid REFERENCES users(id),
  created_at              timestamptz DEFAULT now(),
  CHECK (amount_paid > 0)
);
```

### `scholarships`
```sql
CREATE TABLE scholarships (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scholarship_name    text NOT NULL,
  scholarship_type    text CHECK (scholarship_type IN ('merit', 'need_based', 'sports', 'minority', 'government', 'institutional')),
  amount              decimal(10,2),
  percentage          decimal(5,2),
  eligibility_criteria jsonb,
  valid_from          date,
  valid_to            date,
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  created_by          uuid REFERENCES users(id),
  CHECK (amount >= 0 OR percentage >= 0)
);
```

### `student_scholarships`
```sql
CREATE TABLE student_scholarships (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  scholarship_id      uuid REFERENCES scholarships(id),
  academic_year_id    uuid REFERENCES academic_years(id),
  awarded_amount      decimal(10,2) NOT NULL,
  award_date          date,
  status              text CHECK (status IN ('applied', 'approved', 'disbursed', 'rejected')),
  approved_by         uuid REFERENCES users(id),
  disbursed_date      date,
  remarks             text,
  created_at          timestamptz DEFAULT now(),
  CHECK (awarded_amount > 0)
);
```

---

## 13. Faculty Leave & Attendance

### `leave_types`
```sql
CREATE TABLE leave_types (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_name              text NOT NULL,
  leave_code              text UNIQUE NOT NULL,
  max_days_per_year       int,
  requires_approval       boolean DEFAULT true,
  can_be_carried_forward  boolean DEFAULT false,
  applicable_to           text CHECK (applicable_to IN ('professor', 'staff', 'all')),
  is_active               boolean DEFAULT true,
  created_at              timestamptz DEFAULT now()
);
```

### `leave_balance`
```sql
CREATE TABLE leave_balance (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES users(id) ON DELETE CASCADE,
  leave_type_id       uuid REFERENCES leave_types(id),
  academic_year_id    uuid REFERENCES academic_years(id),
  total_allocated     int NOT NULL,
  total_used          int DEFAULT 0,
  total_remaining     int GENERATED ALWAYS AS (total_allocated - total_used) STORED,
  carried_forward     int DEFAULT 0,
  created_at          timestamptz DEFAULT now(),
  UNIQUE(user_id, leave_type_id, academic_year_id),
  CHECK (total_used >= 0)
);
```

### `leave_applications`
```sql
CREATE TABLE leave_applications (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id        uuid REFERENCES users(id) ON DELETE CASCADE,
  leave_type_id       uuid REFERENCES leave_types(id),
  from_date           date NOT NULL,
  to_date             date NOT NULL,
  total_days          int GENERATED ALWAYS AS (to_date - from_date + 1) STORED,
  reason              text NOT NULL,
  status              text CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  applied_at          timestamptz DEFAULT now(),
  reviewed_by         uuid REFERENCES users(id),
  reviewed_at         timestamptz,
  review_remarks      text,
  supporting_doc_url  text,
  CHECK (from_date <= to_date)
);
```

### `professor_attendance`
```sql
CREATE TABLE professor_attendance (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id        uuid REFERENCES professor_profiles(id) ON DELETE CASCADE,
  attendance_date     date NOT NULL,
  check_in_time       time,
  check_out_time      time,
  status              text CHECK (status IN ('present', 'absent', 'half_day', 'on_leave', 'holiday')),
  marked_by           uuid REFERENCES users(id),
  remarks             text,
  created_at          timestamptz DEFAULT now(),
  UNIQUE(professor_id, attendance_date)
);
```

---

## 14. Notifications

### `announcements`
```sql
CREATE TABLE announcements (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text NOT NULL,
  content             text NOT NULL,
  announcement_type   text CHECK (announcement_type IN ('general', 'academic', 'exam', 'event', 'urgent', 'holiday')),
  priority            text CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  target_audience     text CHECK (target_audience IN ('all', 'students', 'professors', 'staff', 'specific_class', 'specific_department')),
  published_by        uuid REFERENCES users(id),
  published_at        timestamptz DEFAULT now(),
  expires_at          timestamptz,
  attachment_url      text,
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now()
);
```

### `announcement_targets`
```sql
CREATE TABLE announcement_targets (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id     uuid REFERENCES announcements(id) ON DELETE CASCADE,
  target_type         text CHECK (target_type IN ('class', 'department', 'batch', 'course', 'user')),
  target_id           uuid,
  created_at          timestamptz DEFAULT now()
);
```

### `notifications`
```sql
CREATE TABLE notifications (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id        uuid REFERENCES users(id) ON DELETE CASCADE,
  notification_type   text CHECK (notification_type IN ('announcement', 'attendance', 'marks', 'fee', 'leave', 'exam', 'message', 'alert')),
  title               text NOT NULL,
  message             text NOT NULL,
  related_entity_type text,
  related_entity_id   uuid,
  is_read             boolean DEFAULT false,
  read_at             timestamptz,
  priority            text CHECK (priority IN ('low', 'medium', 'high')),
  action_url          text,
  created_at          timestamptz DEFAULT now()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read);
```

### `notification_preferences`
```sql
CREATE TABLE notification_preferences (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  email_enabled       boolean DEFAULT true,
  push_enabled        boolean DEFAULT true,
  sms_enabled         boolean DEFAULT false,
  announcement_email  boolean DEFAULT true,
  attendance_email    boolean DEFAULT true,
  marks_email         boolean DEFAULT true,
  fee_email           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);
```

---

## 15. Support System

### `support_tickets`
```sql
CREATE TABLE support_tickets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      uuid REFERENCES student_profiles(id),
  category        text CHECK (category IN ('academic', 'harassment', 'fees', 'technical', 'other')),
  subject         text NOT NULL,
  description     text NOT NULL,
  priority        text CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status          text CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to     uuid REFERENCES official_profiles(id),
  created_at      timestamptz DEFAULT now(),
  resolved_at     timestamptz
);
```

### `ticket_messages`
```sql
CREATE TABLE ticket_messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id     uuid REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id     uuid REFERENCES users(id),
  message       text NOT NULL,
  is_internal   boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);
```

---

## 16. Audit & History

### `audit_logs`
```sql
CREATE TABLE audit_logs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name          text NOT NULL,
  record_id           uuid NOT NULL,
  action_type         text NOT NULL CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values          jsonb,
  new_values          jsonb,
  changed_by          uuid REFERENCES users(id),
  changed_at          timestamptz DEFAULT now(),
  ip_address          inet,
  user_agent          text,
  change_reason       text
);

CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_changed_by ON audit_logs(changed_by);
CREATE INDEX idx_audit_changed_at ON audit_logs(changed_at DESC);
```

---

## 🔧 Database Triggers

### Auto-Audit Trigger
```sql
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs(table_name, record_id, action_type, old_values, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), OLD.last_modified_by);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs(table_name, record_id, action_type, old_values, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), NEW.last_modified_by);
    NEW.version = OLD.version + 1;
    NEW.last_modified_at = now();
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs(table_name, record_id, action_type, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), NEW.created_by);
    RETURN NEW;
  END IF;
END;
$ LANGUAGE plpgsql;

-- Apply to critical tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_classes AFTER INSERT OR UPDATE OR DELETE ON classes
FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_attendance_sessions AFTER INSERT OR UPDATE OR DELETE ON attendance_sessions
FOR EACH ROW EXECUTE FUNCTION log_audit_trail();
```

### Update Class Conducted Counter
```sql
CREATE OR REPLACE FUNCTION update_classes_conducted()
RETURNS TRIGGER AS $
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE class_subjects
    SET total_classes_conducted = total_classes_conducted + 1
    WHERE id = NEW.class_subject_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE class_subjects
    SET total_classes_conducted = total_classes_conducted - 1
    WHERE id = OLD.class_subject_id;
  END IF;
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER increment_classes_conducted
AFTER INSERT OR DELETE ON attendance_sessions
FOR EACH ROW EXECUTE FUNCTION update_classes_conducted();