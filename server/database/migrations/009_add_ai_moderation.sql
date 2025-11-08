-- Migration: Add AI Content Moderation
-- Description: Add moderation fields to offers and demands tables, create moderation logs table
-- Created: 2025-01-08

-- ============================================
-- 1. Add moderation fields to offers table
-- ============================================

ALTER TABLE offers
ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS moderated_by VARCHAR(50);

-- Add index for moderation status queries
CREATE INDEX IF NOT EXISTS idx_offers_moderation_status ON offers(moderation_status);

-- Add comment
COMMENT ON COLUMN offers.moderation_status IS 'Status: pending, approved, flagged, rejected';
COMMENT ON COLUMN offers.moderation_reason IS 'Reason for flagging or rejection';
COMMENT ON COLUMN offers.moderated_at IS 'Timestamp when moderation was performed';
COMMENT ON COLUMN offers.moderated_by IS 'Who moderated: ai, auto, or admin user_id';

-- ============================================
-- 2. Add moderation fields to demands table
-- ============================================

ALTER TABLE demands
ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS moderated_by VARCHAR(50);

-- Add index for moderation status queries
CREATE INDEX IF NOT EXISTS idx_demands_moderation_status ON demands(moderation_status);

-- Add comment
COMMENT ON COLUMN demands.moderation_status IS 'Status: pending, approved, flagged, rejected';
COMMENT ON COLUMN demands.moderation_reason IS 'Reason for flagging or rejection';
COMMENT ON COLUMN demands.moderated_at IS 'Timestamp when moderation was performed';
COMMENT ON COLUMN demands.moderated_by IS 'Who moderated: ai, auto, or admin user_id';

-- ============================================
-- 3. Create moderation_logs table
-- ============================================

CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('offer', 'demand')),
  content_id INTEGER NOT NULL,
  original_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  reason TEXT,
  confidence DECIMAL(3,2), -- AI confidence score (0.00 to 1.00)
  moderated_by VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB -- Store additional AI response data
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_moderation_logs_content ON moderation_logs(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_created_at ON moderation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_status ON moderation_logs(new_status);

-- Add comments
COMMENT ON TABLE moderation_logs IS 'Audit log of all moderation decisions';
COMMENT ON COLUMN moderation_logs.content_type IS 'Type of content: offer or demand';
COMMENT ON COLUMN moderation_logs.content_id IS 'ID of the moderated content';
COMMENT ON COLUMN moderation_logs.confidence IS 'AI confidence score (0-1)';
COMMENT ON COLUMN moderation_logs.metadata IS 'Additional AI response data (issues, suggestions)';

-- ============================================
-- 4. Update existing records to approved status
-- ============================================

-- Set all existing offers to 'approved' (they were created before moderation)
UPDATE offers
SET moderation_status = 'approved',
    moderated_by = 'auto',
    moderated_at = CURRENT_TIMESTAMP
WHERE moderation_status = 'pending';

-- Set all existing demands to 'approved' (they were created before moderation)
UPDATE demands
SET moderation_status = 'approved',
    moderated_by = 'auto',
    moderated_at = CURRENT_TIMESTAMP
WHERE moderation_status = 'pending';

-- ============================================
-- 5. Grant permissions (if using role-based access)
-- ============================================

-- Grant permissions to application user (adjust role name as needed)
-- GRANT SELECT, INSERT ON moderation_logs TO toosila_app;
-- GRANT UPDATE (moderation_status, moderation_reason, moderated_at, moderated_by) ON offers TO toosila_app;
-- GRANT UPDATE (moderation_status, moderation_reason, moderated_at, moderated_by) ON demands TO toosila_app;

-- ============================================
-- Migration complete
-- ============================================

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 009_add_ai_moderation completed successfully';
  RAISE NOTICE 'Added moderation fields to offers and demands tables';
  RAISE NOTICE 'Created moderation_logs table';
  RAISE NOTICE 'Marked existing content as approved';
END $$;
