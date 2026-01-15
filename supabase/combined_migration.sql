-- ============================================
-- COLLEGE ERP - COMBINED DATABASE MIGRATION
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. EXTENSIONS & BASE TABLES
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name          text NOT NULL,
  record_id           uuid NOT NULL,
  action_type         text NOT NULL CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values          jsonb,
  new_values          jsonb,
  changed_by          uuid,
  changed_at          timestamptz DEFAULT now(),
  ip_address          inet,
  user_agent          text,
  change_reason       text
);

-- Users (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id                  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               text UNIQUE NOT NULL,
  full_name           text NOT NULL,
  phone               text,
  role                text NOT NULL CHECK (role IN ('admin', 'professor', 'student', 'dean', 'student_cell', 'staff')),
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  created_by          uuid,
  updated_at          timestamptz DEFAULT now(),
  is_deleted          boolean DEFAULT false,
  deleted_at          timestamptz,
  deleted_by          uuid,
  version             int DEFAULT 1,
  last_modified_by    uuid,
  last_modified_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- 2. ORGANIZATIONAL STRUCTURE
-- ============================================

CREATE TABLE IF NOT EXISTS departments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_code     text UNIQUE NOT NULL,
  department_name     text NOT NULL,
  hod_id              uuid,
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  roll_number         text UNIQUE NOT NULL,
  enrollment_number   text UNIQUE,
  department_id       uuid REFERENCES departments(id),
  admission_year      int,
  gender              text CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth       date,
  blood_group         text,
  category            text,
  is_hosteller        boolean DEFAULT false,
  created_at          timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS professor_profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  employee_id         text UNIQUE NOT NULL,
  department_id       uuid REFERENCES departments(id),
  designation         text,
  specialization      text,
  qualification       text,
  joined_date         date,
  experience_years    numeric(4,1),
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE departments ADD CONSTRAINT fk_hod FOREIGN KEY (hod_id) REFERENCES professor_profiles(id);

CREATE TABLE IF NOT EXISTS admin_profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  employee_id         text UNIQUE NOT NULL,
  department_id       uuid REFERENCES departments(id),
  designation         text,
  access_level        text CHECK (access_level IN ('super', 'department', 'limited')),
  created_at          timestamptz DEFAULT now()
);

-- ============================================
-- 3. ACADEMIC STRUCTURE
-- ============================================

CREATE TABLE IF NOT EXISTS academic_years (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year_label      text UNIQUE NOT NULL,
  start_date      date NOT NULL,
  end_date        date NOT NULL,
  is_current      boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS semesters (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id    uuid REFERENCES academic_years(id),
  semester_number     int NOT NULL,
  semester_type       text CHECK (semester_type IN ('odd', 'even', 'summer')),
  start_date          date,
  end_date            date,
  is_current          boolean DEFAULT false,
  created_at          timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS batches (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_year      int NOT NULL,
  batch_name      text UNIQUE NOT NULL,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS courses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code     text UNIQUE NOT NULL,
  course_name     text NOT NULL,
  duration_years  int DEFAULT 4,
  degree_type     text,
  department_id   uuid REFERENCES departments(id),
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS branches (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_code     text UNIQUE NOT NULL,
  branch_name     text NOT NULL,
  course_id       uuid REFERENCES courses(id),
  department_id   uuid REFERENCES departments(id),
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name    text NOT NULL,
  max_strength    int DEFAULT 60,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS classes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_label     text NOT NULL,
  batch_id        uuid REFERENCES batches(id),
  branch_id       uuid REFERENCES branches(id),
  section_id      uuid REFERENCES sections(id),
  semester_id     uuid REFERENCES semesters(id),
  class_teacher_id uuid REFERENCES professor_profiles(id),
  current_strength int DEFAULT 0,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(batch_id, branch_id, section_id, semester_id)
);

CREATE TABLE IF NOT EXISTS subjects (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_code        text UNIQUE NOT NULL,
  subject_name        text NOT NULL,
  subject_type        text CHECK (subject_type IN ('theory', 'lab', 'elective', 'open_elective')),
  credits             int DEFAULT 3,
  lecture_hours       int DEFAULT 3,
  tutorial_hours      int DEFAULT 1,
  practical_hours     int DEFAULT 0,
  department_id       uuid REFERENCES departments(id),
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now()
);

-- ============================================
-- 4. CLASS MEMBERSHIP
-- ============================================

CREATE TABLE IF NOT EXISTS class_students (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id    uuid REFERENCES classes(id) ON DELETE CASCADE,
  student_id  uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  joined_on   date DEFAULT CURRENT_DATE,
  left_on     date,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(class_id, student_id)
);

CREATE TABLE IF NOT EXISTS class_subjects (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id                    uuid REFERENCES classes(id) ON DELETE CASCADE,
  subject_id                  uuid REFERENCES subjects(id) ON DELETE CASCADE,
  professor_id                uuid REFERENCES professor_profiles(id),
  total_classes_scheduled     int DEFAULT 0,
  total_classes_conducted     int DEFAULT 0,
  is_active                   boolean DEFAULT true,
  created_at                  timestamptz DEFAULT now(),
  created_by                  uuid,
  UNIQUE(class_id, subject_id)
);

CREATE TABLE IF NOT EXISTS class_representatives (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id            uuid REFERENCES classes(id) ON DELETE CASCADE,
  student_id          uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  representative_type text CHECK (representative_type IN ('CR', 'Vice_CR', 'Sports', 'Cultural')),
  appointed_on        date DEFAULT CURRENT_DATE,
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now()
);

-- ============================================
-- 5. TIMETABLE
-- ============================================

CREATE TABLE IF NOT EXISTS timetables (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id        uuid REFERENCES classes(id) ON DELETE CASCADE,
  semester_id     uuid REFERENCES semesters(id),
  effective_from  date,
  effective_to    date,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS timetable_slots (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id        uuid REFERENCES timetables(id) ON DELETE CASCADE,
  class_subject_id    uuid REFERENCES class_subjects(id),
  day_of_week         text CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')),
  period_number       int,
  start_time          time,
  end_time            time,
  room_number         text,
  slot_type           text CHECK (slot_type IN ('regular', 'lab', 'tutorial', 'break')),
  created_at          timestamptz DEFAULT now(),
  UNIQUE(timetable_id, day_of_week, period_number)
);

-- ============================================
-- 6. ATTENDANCE
-- ============================================

CREATE TABLE IF NOT EXISTS attendance_sessions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_subject_id    uuid REFERENCES class_subjects(id) ON DELETE CASCADE,
  conducted_date      date NOT NULL,
  conducted_time      time,
  recorded_by         uuid REFERENCES professor_profiles(id),
  total_present       int DEFAULT 0,
  total_absent        int DEFAULT 0,
  is_finalized        boolean DEFAULT false,
  created_at          timestamptz DEFAULT now(),
  UNIQUE(class_subject_id, conducted_date)
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    uuid REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id    uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  status        text CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_at     timestamptz DEFAULT now(),
  UNIQUE(session_id, student_id)
);

-- ============================================
-- 7. MARKS & ASSESSMENT
-- ============================================

CREATE TABLE IF NOT EXISTS assessment_components (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_subject_id    uuid REFERENCES class_subjects(id) ON DELETE CASCADE,
  component_name      text NOT NULL,
  component_type      text CHECK (component_type IN ('internal', 'midterm', 'assignment', 'quiz', 'lab', 'project', 'external')),
  max_marks           numeric(5,2) NOT NULL,
  weightage           numeric(5,2),
  conducted_date      date,
  created_at          timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_marks (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id              uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  assessment_component_id uuid REFERENCES assessment_components(id) ON DELETE CASCADE,
  marks_obtained          numeric(5,2),
  is_absent               boolean DEFAULT false,
  remarks                 text,
  entered_by              uuid REFERENCES professor_profiles(id),
  entered_at              timestamptz DEFAULT now(),
  UNIQUE(student_id, assessment_component_id)
);

-- ============================================
-- 8. COMMUNICATION
-- ============================================

CREATE TABLE IF NOT EXISTS groups (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_type          text CHECK (group_type IN ('class', 'class_subject', 'department', 'batch', 'custom')),
  group_name          text NOT NULL,
  class_id            uuid REFERENCES classes(id),
  class_subject_id    uuid REFERENCES class_subjects(id),
  created_by          uuid REFERENCES users(id),
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    uuid REFERENCES groups(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE,
  role        text CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  joined_at   timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS group_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    uuid REFERENCES groups(id) ON DELETE CASCADE,
  sender_id   uuid REFERENCES users(id),
  message     text NOT NULL,
  message_type text CHECK (message_type IN ('text', 'file', 'announcement')) DEFAULT 'text',
  sent_at     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  content         text NOT NULL,
  priority        text CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  created_by      uuid REFERENCES users(id),
  published_at    timestamptz DEFAULT now(),
  expires_at      timestamptz,
  is_active       boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS notifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    uuid REFERENCES users(id) ON DELETE CASCADE,
  title           text NOT NULL,
  message         text,
  notification_type text,
  reference_type  text,
  reference_id    uuid,
  is_read         boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

-- ============================================
-- 9. ADDRESSES & DOCUMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS addresses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address_line1   text NOT NULL,
  address_line2   text,
  city            text NOT NULL,
  state           text NOT NULL,
  country         text DEFAULT 'India',
  pincode         text NOT NULL,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_addresses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE,
  address_id      uuid REFERENCES addresses(id) ON DELETE CASCADE,
  address_type    text CHECK (address_type IN ('permanent', 'current', 'office')),
  is_primary      boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  contact_name    text NOT NULL,
  relationship    text NOT NULL,
  phone           text NOT NULL,
  email           text,
  is_primary      boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guardians (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  guardian_name   text NOT NULL,
  relationship    text NOT NULL,
  occupation      text,
  phone           text NOT NULL,
  email           text,
  annual_income   numeric(12,2),
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE,
  document_type   text NOT NULL,
  document_name   text NOT NULL,
  file_path       text NOT NULL,
  file_size       int,
  mime_type       text,
  is_verified     boolean DEFAULT false,
  verified_by     uuid,
  verified_at     timestamptz,
  uploaded_at     timestamptz DEFAULT now()
);

-- ============================================
-- 10. FEES & FINANCE
-- ============================================

CREATE TABLE IF NOT EXISTS fee_structures (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id    uuid REFERENCES academic_years(id),
  course_id           uuid REFERENCES courses(id),
  fee_type            text CHECK (fee_type IN ('tuition', 'hostel', 'exam', 'lab', 'library', 'other')),
  amount              numeric(10,2) NOT NULL,
  due_date            date,
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_fee_assignments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  fee_structure_id    uuid REFERENCES fee_structures(id),
  total_amount        numeric(10,2) NOT NULL,
  discount_amount     numeric(10,2) DEFAULT 0,
  payable_amount      numeric(10,2) NOT NULL,
  paid_amount         numeric(10,2) DEFAULT 0,
  status              text CHECK (status IN ('pending', 'partial', 'paid', 'overdue')) DEFAULT 'pending',
  created_at          timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fee_payments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id       uuid REFERENCES student_fee_assignments(id) ON DELETE CASCADE,
  amount              numeric(10,2) NOT NULL,
  payment_mode        text CHECK (payment_mode IN ('cash', 'upi', 'card', 'netbanking', 'cheque', 'dd')),
  transaction_id      text,
  receipt_number      text UNIQUE,
  paid_at             timestamptz DEFAULT now(),
  recorded_by         uuid REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS scholarships (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  provider        text,
  amount          numeric(10,2),
  criteria        text,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_scholarships (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  scholarship_id  uuid REFERENCES scholarships(id),
  awarded_amount  numeric(10,2),
  academic_year   uuid REFERENCES academic_years(id),
  status          text CHECK (status IN ('applied', 'approved', 'rejected', 'disbursed')) DEFAULT 'applied',
  applied_at      timestamptz DEFAULT now()
);

-- ============================================
-- 11. LEAVE MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS leave_types (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_type      text UNIQUE NOT NULL,
  max_days        int,
  is_paid         boolean DEFAULT true,
  applicable_for  text CHECK (applicable_for IN ('professor', 'staff', 'all')),
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leave_balance (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE,
  leave_type_id   uuid REFERENCES leave_types(id),
  academic_year_id uuid REFERENCES academic_years(id),
  total_leaves    int NOT NULL,
  used_leaves     int DEFAULT 0,
  remaining_leaves int GENERATED ALWAYS AS (total_leaves - used_leaves) STORED,
  UNIQUE(user_id, leave_type_id, academic_year_id)
);

CREATE TABLE IF NOT EXISTS leave_applications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id    uuid REFERENCES users(id) ON DELETE CASCADE,
  leave_type_id   uuid REFERENCES leave_types(id),
  start_date      date NOT NULL,
  end_date        date NOT NULL,
  reason          text NOT NULL,
  status          text CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
  approved_by     uuid REFERENCES users(id),
  approved_at     timestamptz,
  remarks         text,
  applied_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS professor_attendance (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id    uuid REFERENCES professor_profiles(id) ON DELETE CASCADE,
  attendance_date date NOT NULL,
  check_in        time,
  check_out       time,
  status          text CHECK (status IN ('present', 'absent', 'half_day', 'on_leave')),
  created_at      timestamptz DEFAULT now(),
  UNIQUE(professor_id, attendance_date)
);

-- ============================================
-- 12. SUPPORT TICKETS
-- ============================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by      uuid REFERENCES users(id) ON DELETE CASCADE,
  category        text CHECK (category IN ('academic', 'technical', 'fee', 'hostel', 'other')),
  subject         text NOT NULL,
  description     text NOT NULL,
  priority        text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status          text CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  assigned_to     uuid REFERENCES users(id),
  created_at      timestamptz DEFAULT now(),
  resolved_at     timestamptz
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   uuid REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id   uuid REFERENCES users(id),
  message     text NOT NULL,
  is_internal boolean DEFAULT false,
  sent_at     timestamptz DEFAULT now()
);

-- ============================================
-- 13. HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attendance triggers
CREATE OR REPLACE FUNCTION update_attendance_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE attendance_sessions
  SET 
    total_present = (SELECT COUNT(*) FROM attendance_records WHERE session_id = COALESCE(NEW.session_id, OLD.session_id) AND status = 'present'),
    total_absent = (SELECT COUNT(*) FROM attendance_records WHERE session_id = COALESCE(NEW.session_id, OLD.session_id) AND status = 'absent')
  WHERE id = COALESCE(NEW.session_id, OLD.session_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_classes_conducted()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE class_subjects SET total_classes_conducted = total_classes_conducted + 1 WHERE id = NEW.class_subject_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE class_subjects SET total_classes_conducted = GREATEST(total_classes_conducted - 1, 0) WHERE id = OLD.class_subject_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_session_counts ON attendance_records;
CREATE TRIGGER update_session_counts AFTER INSERT OR UPDATE OR DELETE ON attendance_records FOR EACH ROW EXECUTE FUNCTION update_attendance_counts();

DROP TRIGGER IF EXISTS increment_classes_conducted ON attendance_sessions;
CREATE TRIGGER increment_classes_conducted AFTER INSERT OR DELETE ON attendance_sessions FOR EACH ROW EXECUTE FUNCTION update_classes_conducted();

-- ============================================
-- 14. RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- RLS helper functions
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_professor()
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'professor');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_student()
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'student');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_student_profile_id()
RETURNS uuid AS $$
  SELECT id FROM student_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_professor_profile_id()
RETURNS uuid AS $$
  SELECT id FROM professor_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Users policies
DROP POLICY IF EXISTS "Users can view own" ON users;
CREATE POLICY "Users can view own" ON users FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage users" ON users;
CREATE POLICY "Admins can manage users" ON users FOR ALL USING (is_admin());

-- Student profiles policies
DROP POLICY IF EXISTS "Students view own profile" ON student_profiles;
CREATE POLICY "Students view own profile" ON student_profiles FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage student profiles" ON student_profiles;
CREATE POLICY "Admins manage student profiles" ON student_profiles FOR ALL USING (is_admin());

-- Attendance policies
DROP POLICY IF EXISTS "Students view own attendance" ON attendance_records;
CREATE POLICY "Students view own attendance" ON attendance_records FOR SELECT USING (student_id = get_student_profile_id());

DROP POLICY IF EXISTS "Professors manage attendance" ON attendance_records;
CREATE POLICY "Professors manage attendance" ON attendance_records FOR ALL USING (is_professor() OR is_admin());

-- Marks policies
DROP POLICY IF EXISTS "Students view own marks" ON student_marks;
CREATE POLICY "Students view own marks" ON student_marks FOR SELECT USING (student_id = get_student_profile_id());

DROP POLICY IF EXISTS "Professors admins manage marks" ON student_marks;
CREATE POLICY "Professors admins manage marks" ON student_marks FOR ALL USING (is_professor() OR is_admin());

-- Notifications policies
DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (recipient_id = auth.uid());

-- ============================================
-- DONE! 
-- ============================================
