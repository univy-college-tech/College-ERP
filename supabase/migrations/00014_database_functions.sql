-- ============================================
-- Migration: 00014_database_functions
-- Description: Common query functions for the application
-- ============================================

-- ============================================
-- Get student attendance summary
-- ============================================
CREATE OR REPLACE FUNCTION get_student_attendance_summary(p_student_id uuid)
RETURNS TABLE (
  subject_id uuid,
  subject_name text,
  subject_code text,
  total_classes int,
  classes_attended int,
  attendance_percentage numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.subject_name,
    s.subject_code,
    cs.total_classes_conducted,
    COALESCE(COUNT(ar.id) FILTER (WHERE ar.status = 'present'), 0)::int,
    CASE 
      WHEN cs.total_classes_conducted > 0 
      THEN ROUND((COUNT(ar.id) FILTER (WHERE ar.status = 'present')::numeric / cs.total_classes_conducted) * 100, 2)
      ELSE 0 
    END
  FROM class_students cst
  JOIN class_subjects cs ON cst.class_id = cs.class_id
  JOIN subjects s ON cs.subject_id = s.id
  LEFT JOIN attendance_sessions ats ON ats.class_subject_id = cs.id
  LEFT JOIN attendance_records ar ON ar.session_id = ats.id AND ar.student_id = p_student_id
  WHERE cst.student_id = p_student_id
  GROUP BY s.id, s.subject_name, s.subject_code, cs.total_classes_conducted;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Get professor's timetable for a week
-- ============================================
CREATE OR REPLACE FUNCTION get_professor_timetable(p_professor_id uuid)
RETURNS TABLE (
  day_of_week text,
  period_number int,
  start_time time,
  end_time time,
  subject_name text,
  class_label text,
  room_number text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ts.day_of_week,
    ts.period_number,
    ts.start_time,
    ts.end_time,
    s.subject_name,
    c.class_label,
    ts.room_number
  FROM timetable_slots ts
  JOIN class_subjects cs ON ts.class_subject_id = cs.id
  JOIN subjects s ON cs.subject_id = s.id
  JOIN classes c ON cs.class_id = c.id
  JOIN timetables t ON ts.timetable_id = t.id
  WHERE cs.professor_id = p_professor_id
    AND t.is_active = true
  ORDER BY 
    CASE ts.day_of_week 
      WHEN 'monday' THEN 1 
      WHEN 'tuesday' THEN 2 
      WHEN 'wednesday' THEN 3 
      WHEN 'thursday' THEN 4 
      WHEN 'friday' THEN 5 
      WHEN 'saturday' THEN 6 
    END,
    ts.period_number;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Get student's class timetable
-- ============================================
CREATE OR REPLACE FUNCTION get_student_timetable(p_student_id uuid)
RETURNS TABLE (
  day_of_week text,
  period_number int,
  start_time time,
  end_time time,
  subject_name text,
  professor_name text,
  room_number text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ts.day_of_week,
    ts.period_number,
    ts.start_time,
    ts.end_time,
    s.subject_name,
    u.full_name,
    ts.room_number
  FROM class_students cst
  JOIN classes c ON cst.class_id = c.id
  JOIN timetables t ON t.class_id = c.id AND t.is_active = true
  JOIN timetable_slots ts ON ts.timetable_id = t.id
  JOIN class_subjects cs ON ts.class_subject_id = cs.id
  JOIN subjects s ON cs.subject_id = s.id
  LEFT JOIN professor_profiles pp ON cs.professor_id = pp.id
  LEFT JOIN users u ON pp.user_id = u.id
  WHERE cst.student_id = p_student_id
  ORDER BY 
    CASE ts.day_of_week 
      WHEN 'monday' THEN 1 WHEN 'tuesday' THEN 2 
      WHEN 'wednesday' THEN 3 WHEN 'thursday' THEN 4 
      WHEN 'friday' THEN 5 WHEN 'saturday' THEN 6 
    END,
    ts.period_number;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Get attendance defaulters for a class
-- ============================================
CREATE OR REPLACE FUNCTION get_attendance_defaulters(
  p_class_id uuid,
  p_threshold numeric DEFAULT 75
)
RETURNS TABLE (
  student_id uuid,
  roll_number text,
  student_name text,
  overall_attendance numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH student_attendance AS (
    SELECT 
      sp.id,
      sp.roll_number,
      u.full_name,
      COALESCE(
        ROUND(
          (COUNT(ar.id) FILTER (WHERE ar.status = 'present')::numeric / 
           NULLIF(SUM(cs.total_classes_conducted), 0)) * 100, 2
        ), 0
      ) as attendance_pct
    FROM class_students cst
    JOIN student_profiles sp ON cst.student_id = sp.id
    JOIN users u ON sp.user_id = u.id
    LEFT JOIN class_subjects cs ON cs.class_id = cst.class_id
    LEFT JOIN attendance_sessions ats ON ats.class_subject_id = cs.id
    LEFT JOIN attendance_records ar ON ar.session_id = ats.id AND ar.student_id = sp.id
    WHERE cst.class_id = p_class_id
    GROUP BY sp.id, sp.roll_number, u.full_name
  )
  SELECT id, roll_number, full_name, attendance_pct
  FROM student_attendance
  WHERE attendance_pct < p_threshold
  ORDER BY attendance_pct ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Ensure only one current academic year
-- ============================================
CREATE OR REPLACE FUNCTION ensure_single_current_academic_year()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_current = true THEN
    UPDATE academic_years SET is_current = false WHERE id != NEW.id AND is_current = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER single_current_academic_year
BEFORE INSERT OR UPDATE ON academic_years
FOR EACH ROW
WHEN (NEW.is_current = true)
EXECUTE FUNCTION ensure_single_current_academic_year();

-- ============================================
-- Ensure only one current semester
-- ============================================
CREATE OR REPLACE FUNCTION ensure_single_current_semester()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_current = true THEN
    UPDATE semesters SET is_current = false WHERE id != NEW.id AND is_current = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER single_current_semester
BEFORE INSERT OR UPDATE ON semesters
FOR EACH ROW
WHEN (NEW.is_current = true)
EXECUTE FUNCTION ensure_single_current_semester();

-- ============================================
-- Auto-create group when class_subject is created
-- ============================================
CREATE OR REPLACE FUNCTION auto_create_class_subject_group()
RETURNS TRIGGER AS $$
DECLARE
  v_class_label text;
  v_subject_name text;
  v_group_id uuid;
BEGIN
  SELECT c.class_label INTO v_class_label FROM classes c WHERE c.id = NEW.class_id;
  SELECT s.subject_name INTO v_subject_name FROM subjects s WHERE s.id = NEW.subject_id;
  
  INSERT INTO groups (group_type, group_name, class_id, class_subject_id, created_by)
  VALUES ('class_subject', v_subject_name || ' - ' || v_class_label, NEW.class_id, NEW.id, NEW.created_by)
  RETURNING id INTO v_group_id;
  
  -- Add professor as admin
  IF NEW.professor_id IS NOT NULL THEN
    INSERT INTO group_members (group_id, user_id, role)
    SELECT v_group_id, pp.user_id, 'admin'
    FROM professor_profiles pp WHERE pp.id = NEW.professor_id;
  END IF;
  
  -- Add all students as members
  INSERT INTO group_members (group_id, user_id, role)
  SELECT v_group_id, sp.user_id, 'member'
  FROM class_students cs
  JOIN student_profiles sp ON cs.student_id = sp.id
  WHERE cs.class_id = NEW.class_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_class_subject_group
AFTER INSERT ON class_subjects
FOR EACH ROW EXECUTE FUNCTION auto_create_class_subject_group();
