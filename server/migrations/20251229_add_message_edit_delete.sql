-- Migration: Add message editing and deletion support
-- Date: 2025-12-29

-- Add edited_at column to track when a message was edited
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP NULL;

-- Add deleted_at column for "delete for everyone" functionality
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Add deleted_for_user_ids array for "delete for me only" functionality
-- Stores user IDs who have deleted this message from their view
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_for_user_ids UUID[] DEFAULT '{}';

-- Create index for faster query filtering on deleted_for_user_ids
CREATE INDEX IF NOT EXISTS idx_messages_deleted_for_user_ids ON messages USING GIN (deleted_for_user_ids);

-- Comments for documentation
COMMENT ON COLUMN messages.edited_at IS 'Timestamp when message was last edited. NULL if never edited.';
COMMENT ON COLUMN messages.deleted_at IS 'Timestamp when message was deleted for everyone. NULL if not deleted.';
COMMENT ON COLUMN messages.deleted_for_user_ids IS 'Array of user IDs who have deleted this message from their view (delete for me).';
