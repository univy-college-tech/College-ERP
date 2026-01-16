-- ============================================
-- Migration: Add Batch-Course Relationship
-- Description: Links courses to batches and fixes section-branch relationship
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. BATCH_COURSES - Many-to-Many relationship
-- A batch can have multiple courses, a course can be in multiple batches
-- ============================================
CREATE TABLE IF NOT EXISTS batch_courses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id        uuid REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
  course_id       uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(batch_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_batch_courses_batch ON batch_courses(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_courses_course ON batch_courses(course_id);

-- Enable RLS on batch_courses
ALTER TABLE batch_courses ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (adjust based on your needs)
CREATE POLICY "Allow all on batch_courses" ON batch_courses
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 2. Fix SECTIONS table - Add branch_id for proper hierarchy
-- ============================================

-- Add branch_id to sections if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sections' AND column_name = 'branch_id'
  ) THEN
    ALTER TABLE sections ADD COLUMN branch_id uuid REFERENCES branches(id);
  END IF;
END $$;

-- Add is_active to sections if it doesn't exist  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sections' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE sections ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Create index on section's branch_id
CREATE INDEX IF NOT EXISTS idx_sections_branch ON sections(branch_id);

-- Make section_name unique per branch (not globally)
-- First drop the constraint if exists, then add the new unique constraint
DO $$
BEGIN
  -- Add unique constraint for branch_id + section_name
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_section_per_branch'
  ) THEN
    ALTER TABLE sections ADD CONSTRAINT unique_section_per_branch UNIQUE (branch_id, section_name);
  END IF;
END $$;

-- ============================================
-- 3. VIEWS for easier querying
-- ============================================

-- View: Complete academic hierarchy
CREATE OR REPLACE VIEW academic_hierarchy AS
SELECT 
  b.id as batch_id,
  b.batch_year,
  b.batch_name,
  c.id as course_id,
  c.course_code,
  c.course_name,
  c.duration_years,
  br.id as branch_id,
  br.branch_code,
  br.branch_name,
  s.id as section_id,
  s.section_name,
  s.max_strength
FROM batches b
JOIN batch_courses bc ON b.id = bc.batch_id
JOIN courses c ON bc.course_id = c.id
LEFT JOIN branches br ON c.id = br.course_id
LEFT JOIN sections s ON br.id = s.branch_id
WHERE b.is_active = true 
  AND c.is_active = true 
  AND (br.is_active = true OR br.is_active IS NULL)
  AND (s.is_active = true OR s.is_active IS NULL);

-- ============================================
-- DONE!
-- ============================================
