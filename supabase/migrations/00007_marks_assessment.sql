-- ============================================
-- Migration: 00007_marks_assessment
-- Description: Assessment components and student marks
-- ============================================

-- ============================================
-- ASSESSMENT COMPONENTS
-- ============================================
CREATE TABLE IF NOT EXISTS assessment_components (
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

CREATE INDEX IF NOT EXISTS idx_assessment_class_subject ON assessment_components(class_subject_id);

-- ============================================
-- STUDENT MARKS
-- ============================================
CREATE TABLE IF NOT EXISTS student_marks (
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

CREATE INDEX IF NOT EXISTS idx_marks_student ON student_marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_component ON student_marks(component_id);

-- ============================================
-- VALIDATE MARKS (Cannot exceed max_marks)
-- ============================================
CREATE OR REPLACE FUNCTION validate_marks()
RETURNS TRIGGER AS $$
DECLARE
  max_marks_val int;
BEGIN
  SELECT max_marks INTO max_marks_val 
  FROM assessment_components 
  WHERE id = NEW.component_id;
  
  IF NEW.marks_obtained < 0 OR NEW.marks_obtained > max_marks_val THEN
    RAISE EXCEPTION 'Marks must be between 0 and %', max_marks_val;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_marks_validity
BEFORE INSERT OR UPDATE ON student_marks
FOR EACH ROW EXECUTE FUNCTION validate_marks();
