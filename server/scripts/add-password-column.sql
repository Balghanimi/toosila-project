-- Migration: Add password column to users table
-- Date: 2025-12-18
-- Description: Add password field for secure authentication

-- Add password column (nullable for existing users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Add index for faster password lookups
CREATE INDEX IF NOT EXISTS idx_users_password ON users(password) WHERE password IS NOT NULL;

-- Add timestamp for password changes
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP;

-- Migration complete
SELECT 'Password column added successfully!' AS status;
