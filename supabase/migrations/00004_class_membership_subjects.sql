-- ============================================
-- Migration: 00004_class_membership_subjects
-- Description: Class students, class subjects, class representatives
-- ============================================

-- ============================================
-- CLASS STUDENTS (Junction table)
-- ============================================
CREATE TABLE IF NOT EXISTS class_students (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id      uuid REFERENCES classes(id) ON DELETE CASCADE,
  student_id    uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  is_cr         boolean DEFAULT false,
  joined_at     timestamptz DEFAULT now(),
  UNIQUE(class_id, student_id)
);

-- Only ONE CR per class
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_cr_per_class 
ON class_students(class_id) 
WHERE is_cr = true;

CREATE INDEX IF NOT EXISTS idx_class_students_class ON class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student ON class_students(student_id);

-- ============================================
-- CLASS REPRESENTATIVES (Explicit tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS class_representatives (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id      uuid REFERENCES classes(id) ON DELETE CASCADE UNIQUE,
  student_id    uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  assigned_at   timestamptz DEFAULT now(),
  assigned_by   uuid REFERENCES users(id)
);

-- ============================================
-- CLASS SUBJECTS (Teaching assignment)
-- ============================================
CREATE TABLE IF NOT EXISTS class_subjects (
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

CREATE INDEX IF NOT EXISTS idx_class_subjects_professor ON class_subjects(professor_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_class ON class_subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_semester ON class_subjects(semester_id);
