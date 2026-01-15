-- ============================================
-- Migration: 00013_rls_policies
-- Description: Row Level Security policies for all tables
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_professor()
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'professor');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_student()
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'student');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_student_profile_id()
RETURNS uuid AS $$
  SELECT id FROM student_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_professor_profile_id()
RETURNS uuid AS $$
  SELECT id FROM professor_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================
-- USERS POLICIES
-- ============================================
CREATE POLICY "Users can view own" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins can view all" ON users FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage" ON users FOR ALL USING (is_admin());

-- ============================================
-- STUDENT PROFILES POLICIES
-- ============================================
CREATE POLICY "Students view own" ON student_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins manage" ON student_profiles FOR ALL USING (is_admin());

-- ============================================
-- ATTENDANCE POLICIES
-- ============================================
CREATE POLICY "Students view own attendance" ON attendance_records
  FOR SELECT USING (student_id = get_student_profile_id());

CREATE POLICY "Professors manage attendance" ON attendance_records
  FOR ALL USING (is_professor() OR is_admin());

-- ============================================
-- MARKS POLICIES
-- ============================================
CREATE POLICY "Students view own marks" ON student_marks
  FOR SELECT USING (student_id = get_student_profile_id());

CREATE POLICY "Professors/Admins manage marks" ON student_marks
  FOR ALL USING (is_professor() OR is_admin());

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (recipient_id = auth.uid());
