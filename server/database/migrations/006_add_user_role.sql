-- Migration 006: Add role column to users table for admin access control
-- This migration adds a role column to support role-based access control (RBAC)

-- Add role column with default value 'user'
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' NOT NULL;

-- Add check constraint to ensure role is one of the allowed values
ALTER TABLE users
ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'moderator'));

-- Create index on role column for faster queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Comment on the column
COMMENT ON COLUMN users.role IS 'User role for access control: user (default), admin, moderator';

-- Example: To make a user an admin, run:
-- UPDATE users SET role = 'admin' WHERE email = 'admin@toosila.com';
