-- Migration 009: Add read status tracking to messages table
-- Created: 2025-11-10
-- Description: Adds is_read, read_at, read_by, and updated_at columns to messages table

-- Add is_read column
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE NOT NULL;

-- Add read_at column
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP NULL;

-- Add read_by column (UUID of user who read it)
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS read_by UUID NULL REFERENCES users(id) ON DELETE SET NULL;

-- Add updated_at column
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index for unread messages queries (performance optimization)
CREATE INDEX IF NOT EXISTS idx_messages_unread
ON messages(ride_type, ride_id, is_read)
WHERE is_read = FALSE;

-- Create index for read_at queries
CREATE INDEX IF NOT EXISTS idx_messages_read_at
ON messages(read_at)
WHERE read_at IS NOT NULL;

-- Create index for read_by queries
CREATE INDEX IF NOT EXISTS idx_messages_read_by
ON messages(read_by)
WHERE read_by IS NOT NULL;

-- Create trigger function to update updated_at automatically
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists (idempotent)
DROP TRIGGER IF EXISTS trigger_update_messages_updated_at ON messages;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER trigger_update_messages_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_messages_updated_at();

-- Add comment to document the migration
COMMENT ON COLUMN messages.is_read IS 'Whether the message has been read by the recipient';
COMMENT ON COLUMN messages.read_at IS 'Timestamp when the message was read';
COMMENT ON COLUMN messages.read_by IS 'User ID who marked the message as read';
COMMENT ON COLUMN messages.updated_at IS 'Timestamp of last update (auto-updated)';
