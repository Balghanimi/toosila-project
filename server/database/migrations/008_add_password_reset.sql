-- Migration 008: Add password reset columns to users table
-- This migration adds password reset functionality

-- Add password reset columns
ALTER TABLE users
ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;

-- Create index on reset_password_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_reset_password_token ON users(reset_password_token) WHERE reset_password_token IS NOT NULL;

-- Add comments
COMMENT ON COLUMN users.reset_password_token IS 'Hashed password reset token sent via email';
COMMENT ON COLUMN users.reset_password_expires IS 'Expiration timestamp for reset token (1 hour)';
