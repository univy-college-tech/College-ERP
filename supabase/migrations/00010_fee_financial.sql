-- ============================================
-- Migration: 00010_fee_financial
-- Description: Fee structures, payments, scholarships
-- ============================================

-- ============================================
-- FEE STRUCTURES
-- ============================================
CREATE TABLE IF NOT EXISTS fee_structures (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id           uuid REFERENCES courses(id),
  branch_id           uuid REFERENCES branches(id),
  academic_year_id    uuid REFERENCES academic_years(id),
  semester_id         uuid REFERENCES semesters(id),
  fee_category        text CHECK (fee_category IN (
                        'tuition', 'hostel', 'library', 'exam', 'lab', 
                        'transport', 'sports', 'development', 'caution_deposit', 'other'
                      )),
  amount              decimal(10,2) NOT NULL,
  is_mandatory        boolean DEFAULT true,
  due_date            date,
  description         text,
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  created_by          uuid REFERENCES users(id),
  CHECK (amount >= 0)
);

-- ============================================
-- STUDENT FEE ASSIGNMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS student_fee_assignments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  fee_structure_id    uuid REFERENCES fee_structures(id),
  academic_year_id    uuid REFERENCES academic_years(id),
  semester_id         uuid REFERENCES semesters(id),
  total_amount        decimal(10,2) NOT NULL,
  amount_paid         decimal(10,2) DEFAULT 0,
  amount_pending      decimal(10,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
  waiver_amount       decimal(10,2) DEFAULT 0,
  due_date            date NOT NULL,
  status              text CHECK (status IN ('pending', 'partially_paid', 'paid', 'overdue', 'waived')),
  created_at          timestamptz DEFAULT now(),
  CHECK (amount_paid >= 0),
  CHECK (waiver_amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_fee_assignments_student ON student_fee_assignments(student_id);

-- ============================================
-- FEE PAYMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS fee_payments (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id              uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  fee_assignment_id       uuid REFERENCES student_fee_assignments(id),
  amount_paid             decimal(10,2) NOT NULL,
  payment_date            date NOT NULL,
  payment_mode            text CHECK (payment_mode IN ('cash', 'card', 'upi', 'net_banking', 'cheque', 'dd', 'online')),
  transaction_id          text UNIQUE,
  reference_number        text,
  receipt_number          text UNIQUE NOT NULL,
  payment_gateway         text,
  payment_status          text CHECK (payment_status IN ('pending', 'success', 'failed', 'refunded')),
  remarks                 text,
  received_by             uuid REFERENCES users(id),
  created_at              timestamptz DEFAULT now(),
  CHECK (amount_paid > 0)
);

-- ============================================
-- SCHOLARSHIPS
-- ============================================
CREATE TABLE IF NOT EXISTS scholarships (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scholarship_name    text NOT NULL,
  scholarship_type    text CHECK (scholarship_type IN ('merit', 'need_based', 'sports', 'minority', 'government', 'institutional')),
  amount              decimal(10,2),
  percentage          decimal(5,2),
  eligibility_criteria jsonb,
  valid_from          date,
  valid_to            date,
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  created_by          uuid REFERENCES users(id),
  CHECK (amount >= 0 OR percentage >= 0)
);

-- ============================================
-- STUDENT SCHOLARSHIPS
-- ============================================
CREATE TABLE IF NOT EXISTS student_scholarships (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  scholarship_id      uuid REFERENCES scholarships(id),
  academic_year_id    uuid REFERENCES academic_years(id),
  awarded_amount      decimal(10,2) NOT NULL,
  award_date          date,
  status              text CHECK (status IN ('applied', 'approved', 'disbursed', 'rejected')),
  approved_by         uuid REFERENCES users(id),
  disbursed_date      date,
  remarks             text,
  created_at          timestamptz DEFAULT now(),
  CHECK (awarded_amount > 0)
);
