-- Migration: 018_create_lines.sql
-- Description: Create tables for Lines feature (daily subscription rides)
-- Date: 2025-12-03

BEGIN;

-- =============================================
-- 1. LINES TABLE (الخطوط)
-- =============================================
CREATE TABLE IF NOT EXISTS lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    line_type VARCHAR(50) NOT NULL CHECK (line_type IN ('students', 'employees', 'general')),
    is_ladies_only BOOLEAN DEFAULT false,
    from_city VARCHAR(100) NOT NULL,
    to_city VARCHAR(100) NOT NULL,
    from_location JSONB,
    to_location JSONB,
    departure_time TIME NOT NULL,
    return_time TIME,
    working_days INTEGER[] DEFAULT '{0,1,2,3,4,5}',
    total_seats INTEGER NOT NULL DEFAULT 4 CHECK (total_seats >= 1 AND total_seats <= 10),
    available_seats INTEGER NOT NULL DEFAULT 4,
    monthly_price INTEGER NOT NULL CHECK (monthly_price > 0),
    weekly_price INTEGER,
    quarterly_price INTEGER,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'full')),
    is_active BOOLEAN DEFAULT true,
    total_subscribers INTEGER DEFAULT 0,
    rating_avg NUMERIC(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. LINE_STOPS TABLE (نقاط التوقف)
-- =============================================
CREATE TABLE IF NOT EXISTS line_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    line_id UUID NOT NULL REFERENCES lines(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location JSONB,
    stop_order INTEGER NOT NULL,
    arrival_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(line_id, stop_order)
);

-- =============================================
-- 3. LINE_SUBSCRIPTIONS TABLE (الاشتراكات)
-- =============================================
CREATE TABLE IF NOT EXISTS line_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    line_id UUID NOT NULL REFERENCES lines(id) ON DELETE CASCADE,
    passenger_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pickup_stop_id UUID REFERENCES line_stops(id),
    subscription_type VARCHAR(50) NOT NULL CHECK (subscription_type IN ('weekly', 'monthly', 'quarterly')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    amount_paid INTEGER NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- 4. INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_lines_driver ON lines(driver_id);
CREATE INDEX IF NOT EXISTS idx_lines_from_city ON lines(from_city);
CREATE INDEX IF NOT EXISTS idx_lines_to_city ON lines(to_city);
CREATE INDEX IF NOT EXISTS idx_lines_type ON lines(line_type);
CREATE INDEX IF NOT EXISTS idx_lines_status ON lines(status);
CREATE INDEX IF NOT EXISTS idx_lines_active ON lines(is_active);

CREATE INDEX IF NOT EXISTS idx_line_stops_line ON line_stops(line_id);
CREATE INDEX IF NOT EXISTS idx_line_stops_order ON line_stops(line_id, stop_order);

CREATE INDEX IF NOT EXISTS idx_subscriptions_line ON line_subscriptions(line_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_passenger ON line_subscriptions(passenger_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON line_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_dates ON line_subscriptions(start_date, end_date);

-- =============================================
-- 5. UPDATED_AT TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- 6. TRIGGERS
-- =============================================
DROP TRIGGER IF EXISTS update_lines_updated_at ON lines;
CREATE TRIGGER update_lines_updated_at
    BEFORE UPDATE ON lines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON line_subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON line_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
