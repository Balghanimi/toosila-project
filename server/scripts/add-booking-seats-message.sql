-- Add seats and message columns to bookings table
-- This migration adds support for booking multiple seats and including messages

-- Add seats column (defaults to 1 for backward compatibility)
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS seats INTEGER DEFAULT 1 CHECK (seats >= 1 AND seats <= 7);

-- Add message column (optional message from passenger to driver)
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS message TEXT;

-- Update existing bookings to have default value of 1 seat
UPDATE bookings SET seats = 1 WHERE seats IS NULL;
