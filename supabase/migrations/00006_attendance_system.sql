-- ============================================
-- Migration: 00006_attendance_system
-- Description: Attendance sessions and records
-- ============================================

-- ============================================
-- ATTENDANCE SESSIONS
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

CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_sessions(conducted_date);
CREATE INDEX IF NOT EXISTS idx_attendance_class_subject ON attendance_sessions(class_subject_id);

-- ============================================
-- ATTENDANCE RECORDS
-- ============================================
CREATE TABLE IF NOT EXISTS attendance_records (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    uuid REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id    uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  status        text CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_at     timestamptz DEFAULT now(),
  UNIQUE(session_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance_records(session_id);

-- ============================================
-- TRIGGER: Update attendance counts
-- ============================================
CREATE OR REPLACE FUNCTION update_attendance_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE attendance_sessions
  SET 
    total_present = (
      SELECT COUNT(*) FROM attendance_records 
      WHERE session_id = COALESCE(NEW.session_id, OLD.session_id) 
      AND status = 'present'
    ),
    total_absent = (
      SELECT COUNT(*) FROM attendance_records 
      WHERE session_id = COALESCE(NEW.session_id, OLD.session_id) 
      AND status = 'absent'
    )
  WHERE id = COALESCE(NEW.session_id, OLD.session_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_counts
AFTER INSERT OR UPDATE OR DELETE ON attendance_records
FOR EACH ROW EXECUTE FUNCTION update_attendance_counts();

-- ============================================
-- TRIGGER: Update class_subjects conducted counter
-- ============================================
CREATE OR REPLACE FUNCTION update_classes_conducted()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE class_subjects
    SET total_classes_conducted = total_classes_conducted + 1
    WHERE id = NEW.class_subject_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE class_subjects
    SET total_classes_conducted = GREATEST(total_classes_conducted - 1, 0)
    WHERE id = OLD.class_subject_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_classes_conducted
AFTER INSERT OR DELETE ON attendance_sessions
FOR EACH ROW EXECUTE FUNCTION update_classes_conducted();
