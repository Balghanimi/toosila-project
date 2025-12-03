-- Migration: 019_line_interests
-- Description: Create table for collecting interest in Lines feature
-- Created: 2024-12-03
-- Updated: 2024-12-03 - Added area, destination, preferred_time fields

-- Line Interests Table
-- Stores users interested in the Lines feature before launch
CREATE TABLE IF NOT EXISTS line_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  user_type VARCHAR(20) DEFAULT 'student' CHECK (user_type IN ('student', 'employee')),
  area VARCHAR(100),
  destination VARCHAR(100),
  preferred_time VARCHAR(20),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_line_interests_phone ON line_interests(phone);
CREATE INDEX IF NOT EXISTS idx_line_interests_user_type ON line_interests(user_type);
CREATE INDEX IF NOT EXISTS idx_line_interests_area ON line_interests(area);
CREATE INDEX IF NOT EXISTS idx_line_interests_destination ON line_interests(destination);
CREATE INDEX IF NOT EXISTS idx_line_interests_notified ON line_interests(notified);
CREATE INDEX IF NOT EXISTS idx_line_interests_created_at ON line_interests(created_at);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_line_interests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_line_interests_updated_at ON line_interests;
CREATE TRIGGER trigger_line_interests_updated_at
  BEFORE UPDATE ON line_interests
  FOR EACH ROW
  EXECUTE FUNCTION update_line_interests_updated_at();

-- Comments
COMMENT ON TABLE line_interests IS 'Stores users interested in Lines feature before launch';
COMMENT ON COLUMN line_interests.phone IS 'User phone number (unique identifier)';
COMMENT ON COLUMN line_interests.user_type IS 'Type of user: student or employee';
COMMENT ON COLUMN line_interests.area IS 'User residential area (free text)';
COMMENT ON COLUMN line_interests.destination IS 'User destination - university, school, company, etc. (free text)';
COMMENT ON COLUMN line_interests.preferred_time IS 'Preferred departure time';
COMMENT ON COLUMN line_interests.user_id IS 'Optional reference to registered user';
COMMENT ON COLUMN line_interests.notified IS 'Whether user has been notified about launch';
