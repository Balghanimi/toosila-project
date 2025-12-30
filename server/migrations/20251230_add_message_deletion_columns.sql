-- Migration: Add missing message deletion and editing columns
-- Date: 2025-12-30
-- Description: Adds columns required for message editing and deletion features

-- Add deleted_at column for soft delete tracking
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Add deleted_for_everyone column (different from deleted_at)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_for_everyone BOOLEAN DEFAULT false;

-- Add is_edited column to track if message was edited
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;

-- Add last_edited_at column for edit timestamp
ALTER TABLE messages ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP NULL;

-- Add receiver_id column if it doesn't exist (for privacy filtering)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS receiver_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_deleted_for_everyone ON messages(deleted_for_everyone) WHERE deleted_for_everyone = false;
CREATE INDEX IF NOT EXISTS idx_messages_deleted_at ON messages(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_edited ON messages(is_edited) WHERE is_edited = true;

-- Comments for documentation
COMMENT ON COLUMN messages.deleted_for_everyone IS 'If true, message has been deleted for all users and shows as "تم حذف هذه الرسالة"';
COMMENT ON COLUMN messages.is_edited IS 'If true, message has been edited by sender';
COMMENT ON COLUMN messages.last_edited_at IS 'Timestamp of last edit. NULL if never edited or is_edited is false';
COMMENT ON COLUMN messages.receiver_id IS 'ID of the intended recipient. Used for privacy filtering in group conversations';
