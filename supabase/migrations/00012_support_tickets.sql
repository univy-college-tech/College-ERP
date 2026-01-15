-- ============================================
-- Migration: 00012_support_tickets
-- Description: Support system for students
-- ============================================

-- ============================================
-- SUPPORT TICKETS
-- ============================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      uuid REFERENCES student_profiles(id),
  category        text CHECK (category IN ('academic', 'harassment', 'fees', 'technical', 'other')),
  subject         text NOT NULL,
  description     text NOT NULL,
  priority        text CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status          text CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  assigned_to     uuid REFERENCES official_profiles(id),
  created_at      timestamptz DEFAULT now(),
  resolved_at     timestamptz
);

CREATE INDEX IF NOT EXISTS idx_tickets_student ON support_tickets(student_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);

-- ============================================
-- TICKET MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id     uuid REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id     uuid REFERENCES users(id),
  message       text NOT NULL,
  is_internal   boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages ON ticket_messages(ticket_id, created_at);
