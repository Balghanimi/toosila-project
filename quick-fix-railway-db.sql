-- Quick Fix for Railway Production Database
-- Run this SQL directly on Railway PostgreSQL to fix the is_read column error

BEGIN;

-- Add is_read column
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE NOT NULL;

-- Add read_at column
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP NULL;

-- Add read_by column
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_by UUID NULL REFERENCES users(id) ON DELETE SET NULL;

-- Add updated_at column
ALTER TABLE messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(ride_type, ride_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at) WHERE read_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_read_by ON messages(read_by) WHERE read_by IS NOT NULL;

-- Create trigger function
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS trigger_update_messages_updated_at ON messages;
CREATE TRIGGER trigger_update_messages_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_messages_updated_at();

COMMIT;

-- Verify the changes
SELECT 'Migration completed successfully!' AS status;
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'messages'
AND column_name IN ('is_read', 'read_at', 'read_by', 'updated_at');
