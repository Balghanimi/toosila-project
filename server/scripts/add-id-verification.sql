-- Migration: Add ID Verification System
-- Description: Adds support for Iraqi ID card and Passport verification

-- Add verification columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'unverified', -- unverified, pending, verified, rejected
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id);

-- Create verification_documents table
CREATE TABLE IF NOT EXISTS verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(20) NOT NULL, -- 'iraqi_id', 'passport'
    document_number VARCHAR(100),
    front_image_url TEXT NOT NULL,
    back_image_url TEXT, -- Only for Iraqi ID cards
    full_name VARCHAR(255), -- Extracted from document
    date_of_birth DATE,
    issue_date DATE,
    expiry_date DATE,
    issuing_country VARCHAR(100) DEFAULT 'Iraq',
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    rejection_reason TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_document_type CHECK (document_type IN ('iraqi_id', 'passport'))
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_documents_user_id ON verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_documents_status ON verification_documents(status);
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);

-- Create verification_audit_log table for tracking all verification actions
CREATE TABLE IF NOT EXISTS verification_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES verification_documents(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'submitted', 'approved', 'rejected', 'resubmitted'
    performed_by UUID REFERENCES users(id),
    notes TEXT,
    metadata JSONB, -- For storing additional data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_verification_audit_log_user_id ON verification_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_audit_log_document_id ON verification_audit_log(document_id);

-- Add comment to tables
COMMENT ON TABLE verification_documents IS 'Stores uploaded ID documents (Iraqi ID cards and Passports) for user verification';
COMMENT ON TABLE verification_audit_log IS 'Audit trail for all verification-related actions';
COMMENT ON COLUMN users.verification_status IS 'Current verification status: unverified, pending, verified, rejected';
COMMENT ON COLUMN verification_documents.document_type IS 'Type of document: iraqi_id (Iraqi National ID Card) or passport';
