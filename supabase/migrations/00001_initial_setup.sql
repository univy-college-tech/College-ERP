-- ============================================
-- Migration: 00001_initial_setup
-- Description: Enable UUID extension and create base audit table
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- AUDIT LOGS TABLE (Created first as other triggers depend on it)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name          text NOT NULL,
  record_id           uuid NOT NULL,
  action_type         text NOT NULL CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values          jsonb,
  new_values          jsonb,
  changed_by          uuid,
  changed_at          timestamptz DEFAULT now(),
  ip_address          inet,
  user_agent          text,
  change_reason       text
);

CREATE INDEX IF NOT EXISTS idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_changed_by ON audit_logs(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_changed_at ON audit_logs(changed_at DESC);

-- ============================================
-- USERS TABLE (Core identity table)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id                  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               text UNIQUE NOT NULL,
  full_name           text NOT NULL,
  phone               text,
  role                text NOT NULL CHECK (role IN (
                        'admin', 'professor', 'student', 
                        'dean', 'student_cell', 'staff'
                      )),
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  created_by          uuid,
  updated_at          timestamptz DEFAULT now(),
  is_deleted          boolean DEFAULT false,
  deleted_at          timestamptz,
  deleted_by          uuid,
  version             int DEFAULT 1,
  last_modified_by    uuid,
  last_modified_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;

-- ============================================
-- HELPER FUNCTION: Get current user role
-- Note: Use auth.uid() directly for current user ID (built-in Supabase function)
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid DEFAULT auth.uid())
RETURNS text AS $$
  SELECT role FROM users WHERE id = user_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Get current user role (using auth.uid())
-- ============================================
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================
-- AUTO UPDATE TIMESTAMP FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
