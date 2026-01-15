-- ============================================
-- Migration: 00003_academic_time_structure
-- Description: Academic years, semesters, batches, courses, branches, sections, classes
-- ============================================

-- ============================================
-- ACADEMIC YEARS
-- ============================================
CREATE TABLE IF NOT EXISTS academic_years (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year_label        text UNIQUE NOT NULL,  -- "2024-2025"
  start_date        date NOT NULL,
  end_date          date NOT NULL,
  is_current        boolean DEFAULT false,
  is_active         boolean DEFAULT true,
  created_at        timestamptz DEFAULT now(),
  created_by        uuid REFERENCES users(id),
  CHECK (start_date < end_date)
);

-- Ensure only ONE current academic year
CREATE UNIQUE INDEX IF NOT EXISTS idx_current_academic_year 
ON academic_years(is_current) 
WHERE is_current = true;

-- ============================================
-- SEMESTERS
-- ============================================
CREATE TABLE IF NOT EXISTS semesters (
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_current_semester 
ON semesters(is_current) 
WHERE is_current = true;

-- ============================================
-- BATCHES (e.g., 2023-2027)
-- ============================================
CREATE TABLE IF NOT EXISTS batches (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_name    text UNIQUE NOT NULL,
  start_year    int NOT NULL,
  end_year      int NOT NULL,
  is_active     boolean DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  created_by    uuid REFERENCES users(id),
  is_deleted    boolean DEFAULT false
);

-- ============================================
-- COURSES (e.g., B.Tech, MBA)
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_name       text NOT NULL,
  course_code       text UNIQUE NOT NULL,
  duration_years    int NOT NULL,
  created_at        timestamptz DEFAULT now(),
  is_deleted        boolean DEFAULT false
);

-- ============================================
-- BRANCHES (e.g., CSE, ECE)
-- ============================================
CREATE TABLE IF NOT EXISTS branches (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     uuid REFERENCES courses(id) ON DELETE CASCADE,
  department_id uuid REFERENCES departments(id),
  branch_name   text NOT NULL,
  branch_code   text NOT NULL,
  is_active     boolean DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  created_by    uuid REFERENCES users(id),
  is_deleted    boolean DEFAULT false,
  UNIQUE(course_id, branch_code)
);

-- ============================================
-- SECTIONS (e.g., A, B, C)
-- ============================================
CREATE TABLE IF NOT EXISTS sections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id       uuid REFERENCES branches(id) ON DELETE CASCADE,
  section_name    text NOT NULL,
  created_at      timestamptz DEFAULT now(),
  is_deleted      boolean DEFAULT false,
  UNIQUE(branch_id, section_name)
);

-- ============================================
-- SUBJECTS
-- ============================================
CREATE TABLE IF NOT EXISTS subjects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_name    text NOT NULL,
  subject_code    text UNIQUE NOT NULL,
  credits         int,
  subject_type    text CHECK (subject_type IN ('theory', 'practical', 'lab', 'project')),
  created_at      timestamptz DEFAULT now(),
  is_deleted      boolean DEFAULT false
);

-- ============================================
-- CLASSES (THE OPERATIONAL CORE)
-- ============================================
CREATE TABLE IF NOT EXISTS classes (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id            uuid REFERENCES batches(id) ON DELETE CASCADE,
  course_id           uuid REFERENCES courses(id) ON DELETE CASCADE,
  branch_id           uuid REFERENCES branches(id) ON DELETE CASCADE,
  section_id          uuid REFERENCES sections(id) ON DELETE CASCADE,
  academic_year_id    uuid REFERENCES academic_years(id),
  current_semester_id uuid REFERENCES semesters(id),
  class_label         text NOT NULL,
  class_incharge_id   uuid REFERENCES professor_profiles(id),
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  created_by          uuid REFERENCES users(id),
  is_deleted          boolean DEFAULT false,
  UNIQUE(batch_id, course_id, branch_id, section_id, academic_year_id)
);

CREATE INDEX IF NOT EXISTS idx_classes_batch ON classes(batch_id);
CREATE INDEX IF NOT EXISTS idx_classes_semester ON classes(current_semester_id);
CREATE INDEX IF NOT EXISTS idx_classes_incharge ON classes(class_incharge_id);
