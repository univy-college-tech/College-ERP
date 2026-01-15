-- ============================================
-- Migration: 00009_addresses_documents
-- Description: Addresses, guardians, emergency contacts, documents
-- ============================================

-- ============================================
-- ADDRESSES
-- ============================================
CREATE TABLE IF NOT EXISTS addresses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address_line1   text NOT NULL,
  address_line2   text,
  city            text NOT NULL,
  state           text NOT NULL,
  country         text DEFAULT 'India',
  postal_code     text NOT NULL,
  address_type    text CHECK (address_type IN ('current', 'permanent', 'office')),
  is_verified     boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

-- ============================================
-- USER ADDRESSES
-- ============================================
CREATE TABLE IF NOT EXISTS user_addresses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE,
  address_id      uuid REFERENCES addresses(id) ON DELETE CASCADE,
  address_type    text CHECK (address_type IN ('current', 'permanent', 'correspondence')),
  is_primary      boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(user_id, address_type)
);

-- ============================================
-- EMERGENCY CONTACTS
-- ============================================
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES users(id) ON DELETE CASCADE,
  contact_name        text NOT NULL,
  relationship        text NOT NULL,
  phone_primary       text NOT NULL,
  phone_secondary     text,
  email               text,
  address_id          uuid REFERENCES addresses(id),
  is_primary          boolean DEFAULT false,
  created_at          timestamptz DEFAULT now()
);

-- ============================================
-- GUARDIANS (For Students)
-- ============================================
CREATE TABLE IF NOT EXISTS guardians (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  guardian_type       text CHECK (guardian_type IN ('father', 'mother', 'legal_guardian')),
  full_name           text NOT NULL,
  phone               text NOT NULL,
  email               text,
  occupation          text,
  annual_income       decimal(12,2),
  address_id          uuid REFERENCES addresses(id),
  is_primary          boolean DEFAULT false,
  created_at          timestamptz DEFAULT now()
);

-- ============================================
-- DOCUMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES users(id) ON DELETE CASCADE,
  document_type       text CHECK (document_type IN (
                        'aadhar', 'pan', 'passport', 'driving_license', 
                        'birth_certificate', 'tenth_marksheet', 'twelfth_marksheet',
                        'degree_certificate', 'transfer_certificate', 'character_certificate',
                        'migration_certificate', 'income_certificate', 'caste_certificate',
                        'passport_photo', 'signature'
                      )),
  document_number     text,
  document_url        text NOT NULL,
  issued_date         date,
  expiry_date         date,
  verified_by         uuid REFERENCES users(id),
  verified_at         timestamptz,
  is_verified         boolean DEFAULT false,
  created_at          timestamptz DEFAULT now(),
  uploaded_by         uuid REFERENCES users(id),
  UNIQUE(user_id, document_type)
);

CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
