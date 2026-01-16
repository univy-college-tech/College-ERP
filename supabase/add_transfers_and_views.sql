-- ============================================
-- Migration: Student Transfers & Timetable Enhancements
-- Description: Adds student transfer tracking and ensures proper constraints
-- Run this in Supabase SQL Editor (after add_professor_subjects.sql)
-- ============================================

-- ============================================
-- 1. STUDENT CLASS TRANSFERS - Track student movements between classes
-- ============================================
CREATE TABLE IF NOT EXISTS student_class_transfers (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          uuid REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
  from_class_id       uuid REFERENCES classes(id) ON DELETE SET NULL,
  to_class_id         uuid REFERENCES classes(id) ON DELETE SET NULL NOT NULL,
  transfer_date       date DEFAULT CURRENT_DATE,
  reason              text,
  approved_by         uuid REFERENCES users(id),
  created_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_transfers_student ON student_class_transfers(student_id);
CREATE INDEX IF NOT EXISTS idx_student_transfers_date ON student_class_transfers(transfer_date);

-- ============================================
-- 2. CONSTRAINT: Ensure student is only in ONE active class at a time
-- ============================================

-- First, create a function to check for existing active class
CREATE OR REPLACE FUNCTION check_single_active_class()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    -- Check if student already has another active class
    IF EXISTS (
      SELECT 1 FROM class_students 
      WHERE student_id = NEW.student_id 
        AND is_active = true 
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'Student is already enrolled in another active class. Transfer the student first.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for single active class constraint
DROP TRIGGER IF EXISTS trg_single_active_class ON class_students;
CREATE TRIGGER trg_single_active_class
  BEFORE INSERT OR UPDATE ON class_students
  FOR EACH ROW
  EXECUTE FUNCTION check_single_active_class();

-- ============================================
-- 3. FUNCTION: Transfer student between classes
-- ============================================
CREATE OR REPLACE FUNCTION transfer_student(
  p_student_id uuid,
  p_from_class_id uuid,
  p_to_class_id uuid,
  p_reason text DEFAULT NULL,
  p_approved_by uuid DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_transfer_id uuid;
  v_new_enrollment_id uuid;
BEGIN
  -- Deactivate current class enrollment
  UPDATE class_students 
  SET is_active = false, left_on = CURRENT_DATE
  WHERE student_id = p_student_id 
    AND class_id = p_from_class_id 
    AND is_active = true;
  
  -- Create new class enrollment
  INSERT INTO class_students (class_id, student_id, joined_on, is_active)
  VALUES (p_to_class_id, p_student_id, CURRENT_DATE, true)
  RETURNING id INTO v_new_enrollment_id;
  
  -- Record the transfer
  INSERT INTO student_class_transfers (student_id, from_class_id, to_class_id, reason, approved_by)
  VALUES (p_student_id, p_from_class_id, p_to_class_id, p_reason, p_approved_by)
  RETURNING id INTO v_transfer_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'transfer_id', v_transfer_id,
    'enrollment_id', v_new_enrollment_id
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. VIEW: Class subjects with professor info
-- ============================================
CREATE OR REPLACE VIEW class_subjects_view AS
SELECT 
  cs.id,
  cs.class_id,
  cs.subject_id,
  cs.professor_id,
  cs.is_active,
  s.subject_code,
  s.subject_name,
  s.subject_type,
  s.credits,
  s.lecture_hours,
  s.tutorial_hours,
  s.practical_hours,
  p.id as professor_profile_id,
  p.employee_id,
  p.designation,
  u.full_name as professor_name,
  u.email as professor_email,
  c.class_label,
  c.batch_id,
  c.branch_id
FROM class_subjects cs
JOIN subjects s ON cs.subject_id = s.id
JOIN classes c ON cs.class_id = c.id
LEFT JOIN professor_profiles p ON cs.professor_id = p.id
LEFT JOIN users u ON p.user_id = u.id
WHERE cs.is_active = true AND s.is_active = true;

-- ============================================
-- 5. VIEW: Timetable with full details
-- ============================================
CREATE OR REPLACE VIEW timetable_view AS
SELECT 
  ts.id as slot_id,
  ts.timetable_id,
  ts.day_of_week,
  ts.period_number,
  ts.start_time,
  ts.end_time,
  ts.room_number,
  ts.slot_type,
  cs.id as class_subject_id,
  cs.class_id,
  s.subject_code,
  s.subject_name,
  s.subject_type,
  p.id as professor_id,
  u.full_name as professor_name,
  c.class_label,
  t.semester_id,
  t.effective_from,
  t.effective_to
FROM timetable_slots ts
JOIN class_subjects cs ON ts.class_subject_id = cs.id
JOIN subjects s ON cs.subject_id = s.id
JOIN classes c ON cs.class_id = c.id
JOIN timetables t ON ts.timetable_id = t.id
LEFT JOIN professor_profiles p ON cs.professor_id = p.id
LEFT JOIN users u ON p.user_id = u.id
WHERE t.is_active = true;

-- ============================================
-- 6. INDEX: Improve timetable queries
-- ============================================
CREATE INDEX IF NOT EXISTS idx_timetable_slots_timetable ON timetable_slots(timetable_id);
CREATE INDEX IF NOT EXISTS idx_timetable_slots_day ON timetable_slots(day_of_week);
CREATE INDEX IF NOT EXISTS idx_class_subjects_class ON class_subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_subject ON class_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_professor ON class_subjects(professor_id);

-- ============================================
-- DONE!
-- ============================================
