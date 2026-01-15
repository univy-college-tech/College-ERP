-- ============================================
-- Migration: 00008_communication_groups
-- Description: Groups, messages, announcements, notifications
-- ============================================

-- ============================================
-- GROUPS
-- ============================================
CREATE TABLE IF NOT EXISTS groups (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_type        text CHECK (group_type IN ('class_subject', 'class_general', 'cr_professor', 'admin')),
  group_name        text NOT NULL,
  class_id          uuid REFERENCES classes(id),
  class_subject_id  uuid REFERENCES class_subjects(id),
  created_by        uuid REFERENCES users(id),
  created_at        timestamptz DEFAULT now(),
  is_deleted        boolean DEFAULT false
);

-- ============================================
-- GROUP MEMBERS
-- ============================================
CREATE TABLE IF NOT EXISTS group_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      uuid REFERENCES groups(id) ON DELETE CASCADE,
  user_id       uuid REFERENCES users(id) ON DELETE CASCADE,
  role          text CHECK (role IN ('admin', 'member', 'moderator')),
  joined_at     timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);

-- ============================================
-- GROUP MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS group_messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      uuid REFERENCES groups(id) ON DELETE CASCADE,
  sender_id     uuid REFERENCES users(id),
  message_text  text NOT NULL,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_group ON group_messages(group_id, created_at DESC);

-- ============================================
-- ANNOUNCEMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text NOT NULL,
  content             text NOT NULL,
  announcement_type   text CHECK (announcement_type IN ('general', 'academic', 'exam', 'event', 'urgent', 'holiday')),
  priority            text CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  target_audience     text CHECK (target_audience IN ('all', 'students', 'professors', 'staff', 'specific_class', 'specific_department')),
  published_by        uuid REFERENCES users(id),
  published_at        timestamptz DEFAULT now(),
  expires_at          timestamptz,
  attachment_url      text,
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now()
);

-- ============================================
-- ANNOUNCEMENT TARGETS
-- ============================================
CREATE TABLE IF NOT EXISTS announcement_targets (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id     uuid REFERENCES announcements(id) ON DELETE CASCADE,
  target_type         text CHECK (target_type IN ('class', 'department', 'batch', 'course', 'user')),
  target_id           uuid,
  created_at          timestamptz DEFAULT now()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id        uuid REFERENCES users(id) ON DELETE CASCADE,
  notification_type   text CHECK (notification_type IN ('announcement', 'attendance', 'marks', 'fee', 'leave', 'exam', 'message', 'alert')),
  title               text NOT NULL,
  message             text NOT NULL,
  related_entity_type text,
  related_entity_id   uuid,
  is_read             boolean DEFAULT false,
  read_at             timestamptz,
  priority            text CHECK (priority IN ('low', 'medium', 'high')),
  action_url          text,
  created_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- NOTIFICATION PREFERENCES
-- ============================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  email_enabled       boolean DEFAULT true,
  push_enabled        boolean DEFAULT true,
  sms_enabled         boolean DEFAULT false,
  announcement_email  boolean DEFAULT true,
  attendance_email    boolean DEFAULT true,
  marks_email         boolean DEFAULT true,
  fee_email           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);
