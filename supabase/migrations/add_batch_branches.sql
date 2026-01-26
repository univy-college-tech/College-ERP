-- ============================================
-- Migration: Add batch_id to classes and create batch_branches
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Ensure batch_id column exists in classes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'classes' AND column_name = 'batch_id'
  ) THEN
    ALTER TABLE classes ADD COLUMN batch_id uuid REFERENCES batches(id);
    CREATE INDEX IF NOT EXISTS idx_classes_batch ON classes(batch_id);
  END IF;
END $$;

-- 2. Create batch_branches table for linking branches to batches
-- A branch can be offered in multiple batches
CREATE TABLE IF NOT EXISTS batch_branches (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id        uuid REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
  branch_id       uuid REFERENCES branches(id) ON DELETE CASCADE NOT NULL,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(batch_id, branch_id)
);

CREATE INDEX IF NOT EXISTS idx_batch_branches_batch ON batch_branches(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_branches_branch ON batch_branches(branch_id);

-- 3. Enable RLS on batch_branches
ALTER TABLE batch_branches ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (adjust based on your needs)
CREATE POLICY "Allow all on batch_branches" ON batch_branches
  FOR ALL USING (true) WITH CHECK (true);
 
-- ============================================
-- DONE!
-- ============================================

-- After running this, your data model will be:
-- 
-- Course → has many Branches (branches.course_id)
-- Batch → has many Courses (batch_courses)
-- Batch → has many Branches (batch_branches) - which branches are offered in which batch
-- Class → belongs to Batch + Branch (classes.batch_id, classes.branch_id)
