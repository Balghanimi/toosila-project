-- Migration: Ensure demand_responses table exists
-- Date: 2025-10-27
-- Purpose: Fix 500 error when creating demand responses

-- Create demand_responses table if it doesn't exist
CREATE TABLE IF NOT EXISTS demand_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id UUID NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    offer_price DECIMAL(10,2) NOT NULL,
    available_seats INTEGER NOT NULL CHECK (available_seats >= 1 AND available_seats <= 7),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(demand_id, driver_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_demand_responses_demand_id ON demand_responses(demand_id);
CREATE INDEX IF NOT EXISTS idx_demand_responses_driver_id ON demand_responses(driver_id);
CREATE INDEX IF NOT EXISTS idx_demand_responses_status ON demand_responses(status);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_demand_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_demand_responses_updated_at ON demand_responses;
CREATE TRIGGER update_demand_responses_updated_at
    BEFORE UPDATE ON demand_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_demand_responses_updated_at();

-- Verify table was created
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'demand_responses'
    ) THEN
        RAISE NOTICE '✅ Table demand_responses exists';
    ELSE
        RAISE EXCEPTION '❌ Table demand_responses was not created!';
    END IF;
END $$;
