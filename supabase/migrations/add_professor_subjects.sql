-- ============================================
-- Migration: Professor-Subjects Relationship
-- Description: Links professors to subjects they can teach
-- Run this in Supabase SQL Editor (after add_batch_courses.sql)
-- ============================================

-- ============================================
-- 1. PROFESSOR_SUBJECTS - Many-to-Many relationship
-- A professor can teach multiple subjects, a subject can be taught by multiple professors
-- ============================================
CREATE TABLE IF NOT EXISTS professor_subjects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id    uuid REFERENCES professor_profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id      uuid REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  is_primary      boolean DEFAULT false,  -- Is this subject their primary expertise?
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(professor_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_professor_subjects_professor ON professor_subjects(professor_id);
CREATE INDEX IF NOT EXISTS idx_professor_subjects_subject ON professor_subjects(subject_id);

-- ============================================
-- DONE!
-- ============================================
