-- ============================================
-- Migration: 00005_timetable_system
-- Description: Timetables and slots
-- ============================================

-- ============================================
-- TIMETABLES
-- ============================================
CREATE TABLE IF NOT EXISTS timetables (
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

-- ============================================
-- TIMETABLE SLOTS (For structured timetables)
-- ============================================
CREATE TABLE IF NOT EXISTS timetable_slots (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id      uuid REFERENCES timetables(id) ON DELETE CASCADE,
  day_of_week       text CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')),
  period_number     int,
  start_time        time NOT NULL,
  end_time          time NOT NULL,
  class_subject_id  uuid REFERENCES class_subjects(id),
  room_number       text,
  created_at        timestamptz DEFAULT now(),
  UNIQUE(timetable_id, day_of_week, period_number)
);

CREATE INDEX IF NOT EXISTS idx_timetable_slots_day ON timetable_slots(day_of_week);
CREATE INDEX IF NOT EXISTS idx_timetable_slots_timetable ON timetable_slots(timetable_id);
