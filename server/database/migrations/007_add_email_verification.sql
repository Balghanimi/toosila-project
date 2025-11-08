-- Migration 007: Add email verification columns to users table
-- This migration adds email verification functionality to prevent spam accounts

-- Add email verification columns
ALTER TABLE users
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP;

-- Create index on verification_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token) WHERE verification_token IS NOT NULL;

-- Create index on email_verified for filtering
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- Update existing users to be verified (grandfather clause for existing accounts)
UPDATE users SET email_verified = true, email_verified_at = CURRENT_TIMESTAMP
WHERE email_verified IS NULL OR email_verified = false;

-- Add comments
COMMENT ON COLUMN users.verification_token IS 'Hashed verification token sent via email';
COMMENT ON COLUMN users.verification_token_expires IS 'Expiration timestamp for verification token (24 hours)';
COMMENT ON COLUMN users.email_verified IS 'Whether email address has been verified';
COMMENT ON COLUMN users.email_verified_at IS 'Timestamp when email was verified';

-- Note: All newly registered users will require email verification
-- Existing users are automatically verified for backwards compatibility
