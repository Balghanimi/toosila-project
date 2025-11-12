-- ============================================
-- Migration: 013_add_demands_response_count.sql
-- Description: Add response_count column to demands table for performance
-- Date: 2025-11-12
-- ============================================

-- Add response_count column to demands table
ALTER TABLE demands
ADD COLUMN IF NOT EXISTS response_count INTEGER DEFAULT 0 NOT NULL;

-- Populate existing counts
UPDATE demands
SET response_count = (
  SELECT COUNT(*)
  FROM demand_responses
  WHERE demand_responses.demand_id = demands.id
);

-- Create index on response_count for sorting/filtering
CREATE INDEX IF NOT EXISTS idx_demands_response_count ON demands(response_count);

-- Create function to update response count
CREATE OR REPLACE FUNCTION update_demand_response_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE demands
    SET response_count = response_count + 1
    WHERE id = NEW.demand_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE demands
    SET response_count = GREATEST(0, response_count - 1)
    WHERE id = OLD.demand_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update count on INSERT/DELETE
DROP TRIGGER IF EXISTS trg_update_demand_response_count ON demand_responses;
CREATE TRIGGER trg_update_demand_response_count
AFTER INSERT OR DELETE ON demand_responses
FOR EACH ROW
EXECUTE FUNCTION update_demand_response_count();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- SELECT id, response_count FROM demands WHERE response_count > 0 LIMIT 10;
-- SELECT d.id, d.response_count, COUNT(dr.id) as actual_count
-- FROM demands d
-- LEFT JOIN demand_responses dr ON d.id = dr.demand_id
-- GROUP BY d.id
-- LIMIT 10;

-- ============================================
-- PERFORMANCE IMPACT
-- ============================================
/*
Expected improvements:
1. Demand list queries: 10-50x faster (removes expensive LEFT JOIN + COUNT)
2. No more JOIN needed for response count
3. Real-time count updates via trigger
4. Minimal storage overhead (4 bytes per demand row)

Before: SELECT with LEFT JOIN + GROUP BY + COUNT
After: Simple SELECT with indexed integer column
*/
