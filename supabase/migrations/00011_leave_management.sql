-- ============================================
-- Migration: 00011_leave_management
-- Description: Faculty leave types, balance, applications
-- ============================================

-- ============================================
-- LEAVE TYPES
-- ============================================
CREATE TABLE IF NOT EXISTS leave_types (
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

-- ============================================
-- LEAVE BALANCE
-- ============================================
CREATE TABLE IF NOT EXISTS leave_balance (
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

-- ============================================
-- LEAVE APPLICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS leave_applications (
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

CREATE INDEX IF NOT EXISTS idx_leave_applicant ON leave_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_applications(status);

-- ============================================
-- PROFESSOR ATTENDANCE
-- ============================================
CREATE TABLE IF NOT EXISTS professor_attendance (
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
