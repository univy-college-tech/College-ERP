-- ============================================
-- Migration: 00002_organizational_structure
-- Description: Departments and profile tables
-- ============================================

-- ============================================
-- DEPARTMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS departments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_name     text NOT NULL,
  department_code     text UNIQUE NOT NULL,
  department_type     text CHECK (department_type IN ('academic', 'administrative', 'support')),
  hod_id              uuid, -- Will be updated after professor_profiles created
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  created_by          uuid REFERENCES users(id),
  is_deleted          boolean DEFAULT false,
  deleted_at          timestamptz,
  deleted_by          uuid REFERENCES users(id)
);

-- ============================================
-- STUDENT PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS student_profiles (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE,
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

CREATE INDEX IF NOT EXISTS idx_student_roll ON student_profiles(roll_number);
CREATE INDEX IF NOT EXISTS idx_student_user ON student_profiles(user_id);

-- ============================================
-- PROFESSOR PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS professor_profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE,
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

CREATE INDEX IF NOT EXISTS idx_professor_employee ON professor_profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_professor_user ON professor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_professor_department ON professor_profiles(department_id);

-- Add HOD reference to departments
ALTER TABLE departments 
ADD CONSTRAINT fk_departments_hod 
FOREIGN KEY (hod_id) REFERENCES professor_profiles(id);

-- ============================================
-- ADMIN PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS admin_profiles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  admin_level   text CHECK (admin_level IN ('super_admin', 'academic_admin', 'staff')),
  permissions   jsonb,
  created_at    timestamptz DEFAULT now()
);

-- ============================================
-- OFFICIAL PROFILES (Dean, Student Cell, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS official_profiles (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  office_type       text CHECK (office_type IN ('dean', 'student_cell', 'exam_cell', 'training_cell', 'placement_cell')),
  office_name       text NOT NULL,
  authority_level   int DEFAULT 1,
  created_at        timestamptz DEFAULT now()
);
