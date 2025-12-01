-- Migration: Add Phone Number Verification Support
-- Date: 2025-12-01
-- Description: Adds phone verification fields to users table and creates OTP tracking table

-- Add phone-related columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP;

-- Make email optional (nullable) for phone-based registration
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Create OTP tracking table
CREATE TABLE IF NOT EXISTS otp_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6),
  channel VARCHAR(20) DEFAULT 'whatsapp',
  attempts INT DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for quick lookup by phone
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_requests(phone);

-- Index for cleanup of expired OTPs
CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON otp_requests(expires_at);

-- Index for phone lookup on users table
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Add comment for documentation
COMMENT ON TABLE otp_requests IS 'Stores OTP verification requests for phone number verification';
COMMENT ON COLUMN users.phone IS 'User phone number in +964XXXXXXXXXX format';
COMMENT ON COLUMN users.phone_verified IS 'Whether the phone number has been verified via OTP';
COMMENT ON COLUMN users.phone_verified_at IS 'Timestamp when phone was verified';
