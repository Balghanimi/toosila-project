-- Migration: Convert UUID IDs to INTEGER for demands, offers, bookings, and related tables
-- This migration preserves all existing data by creating new integer IDs and remapping relationships

-- Step 1: Add new integer ID columns to main tables
ALTER TABLE demands ADD COLUMN IF NOT EXISTS id_new SERIAL;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS id_new SERIAL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS id_new SERIAL;
ALTER TABLE demand_responses ADD COLUMN IF NOT EXISTS id_new SERIAL;

-- Step 2: Create temporary mapping tables to track UUID to INTEGER conversions
CREATE TEMPORARY TABLE demand_id_map AS
SELECT id as old_id, ROW_NUMBER() OVER (ORDER BY created_at) as new_id
FROM demands;

CREATE TEMPORARY TABLE offer_id_map AS
SELECT id as old_id, ROW_NUMBER() OVER (ORDER BY created_at) as new_id
FROM offers;

CREATE TEMPORARY TABLE booking_id_map AS
SELECT id as old_id, ROW_NUMBER() OVER (ORDER BY created_at) as new_id
FROM bookings;

CREATE TEMPORARY TABLE demand_response_id_map AS
SELECT id as old_id, ROW_NUMBER() OVER (ORDER BY created_at) as new_id
FROM demand_responses;

-- Step 3: Update id_new with sequential integers based on creation order
UPDATE demands d SET id_new = m.new_id FROM demand_id_map m WHERE d.id = m.old_id;
UPDATE offers o SET id_new = m.new_id FROM offer_id_map m WHERE o.id = m.old_id;
UPDATE bookings b SET id_new = m.new_id FROM booking_id_map m WHERE b.id = m.old_id;
UPDATE demand_responses dr SET id_new = m.new_id FROM demand_response_id_map m WHERE dr.id = m.old_id;

-- Step 4: Add new integer foreign key columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS offer_id_new INTEGER;
ALTER TABLE demand_responses ADD COLUMN IF NOT EXISTS demand_id_new INTEGER;

-- Step 5: Populate new foreign key columns using the mapping
UPDATE bookings b
SET offer_id_new = m.new_id
FROM offer_id_map m
WHERE b.offer_id = m.old_id;

UPDATE demand_responses dr
SET demand_id_new = m.new_id
FROM demand_id_map m
WHERE dr.demand_id = m.old_id;

-- Step 6: Add new integer columns to messages and ratings for ride_id
ALTER TABLE messages ADD COLUMN IF NOT EXISTS ride_id_new INTEGER;
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS ride_id_new INTEGER;

-- Step 7: Update messages ride_id_new based on ride_type
-- For offers
UPDATE messages m
SET ride_id_new = om.new_id
FROM offer_id_map om
WHERE m.ride_type = 'offer' AND m.ride_id = om.old_id;

-- For demands
UPDATE messages m
SET ride_id_new = dm.new_id
FROM demand_id_map dm
WHERE m.ride_type = 'demand' AND m.ride_id = dm.old_id;

-- Step 8: Update ratings ride_id_new (assuming they can reference either offers or demands)
-- Try to match with offers first
UPDATE ratings r
SET ride_id_new = om.new_id
FROM offer_id_map om
WHERE r.ride_id = om.old_id;

-- Then try demands for any remaining NULL values
UPDATE ratings r
SET ride_id_new = dm.new_id
FROM demand_id_map dm
WHERE r.ride_id = dm.old_id AND r.ride_id_new IS NULL;

-- Step 9: Drop old constraints and indexes
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_offer_id_fkey;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_pkey;
ALTER TABLE demand_responses DROP CONSTRAINT IF EXISTS demand_responses_demand_id_fkey;
ALTER TABLE demand_responses DROP CONSTRAINT IF EXISTS demand_responses_pkey;
ALTER TABLE demand_responses DROP CONSTRAINT IF EXISTS demand_responses_demand_id_driver_id_key;
ALTER TABLE demands DROP CONSTRAINT IF EXISTS demands_pkey;
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_pkey;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_offer_id_passenger_id_key;

-- Step 10: Drop old UUID columns
ALTER TABLE bookings DROP COLUMN id;
ALTER TABLE bookings DROP COLUMN offer_id;
ALTER TABLE demand_responses DROP COLUMN id;
ALTER TABLE demand_responses DROP COLUMN demand_id;
ALTER TABLE demands DROP COLUMN id;
ALTER TABLE offers DROP COLUMN id;
ALTER TABLE messages DROP COLUMN ride_id;
ALTER TABLE ratings DROP COLUMN ride_id;

-- Step 11: Rename new columns to original names
ALTER TABLE demands RENAME COLUMN id_new TO id;
ALTER TABLE offers RENAME COLUMN id_new TO id;
ALTER TABLE bookings RENAME COLUMN id_new TO id;
ALTER TABLE bookings RENAME COLUMN offer_id_new TO offer_id;
ALTER TABLE demand_responses RENAME COLUMN id_new TO id;
ALTER TABLE demand_responses RENAME COLUMN demand_id_new TO demand_id;
ALTER TABLE messages RENAME COLUMN ride_id_new TO ride_id;
ALTER TABLE ratings RENAME COLUMN ride_id_new TO ride_id;

-- Step 12: Add primary key constraints
ALTER TABLE demands ADD PRIMARY KEY (id);
ALTER TABLE offers ADD PRIMARY KEY (id);
ALTER TABLE bookings ADD PRIMARY KEY (id);
ALTER TABLE demand_responses ADD PRIMARY KEY (id);

-- Step 13: Add foreign key constraints
ALTER TABLE bookings
    ADD CONSTRAINT bookings_offer_id_fkey
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE;

ALTER TABLE demand_responses
    ADD CONSTRAINT demand_responses_demand_id_fkey
    FOREIGN KEY (demand_id) REFERENCES demands(id) ON DELETE CASCADE;

-- Step 14: Add unique constraints
ALTER TABLE bookings
    ADD CONSTRAINT bookings_offer_id_passenger_id_key
    UNIQUE(offer_id, passenger_id);

ALTER TABLE demand_responses
    ADD CONSTRAINT demand_responses_demand_id_driver_id_key
    UNIQUE(demand_id, driver_id);

-- Step 15: Update sequences to start from the correct value
SELECT setval('demands_id_seq', (SELECT MAX(id) FROM demands) + 1);
SELECT setval('offers_id_seq', (SELECT MAX(id) FROM offers) + 1);
SELECT setval('bookings_id_seq', (SELECT MAX(id) FROM bookings) + 1);
SELECT setval('demand_responses_id_seq', (SELECT MAX(id) FROM demand_responses) + 1);

-- Step 16: Recreate indexes with integer columns
DROP INDEX IF EXISTS idx_bookings_offer_id;
DROP INDEX IF EXISTS idx_demand_responses_demand_id;
DROP INDEX IF EXISTS idx_messages_ride_type_ride_id;
DROP INDEX IF EXISTS idx_ratings_ride_id;

CREATE INDEX idx_bookings_offer_id ON bookings(offer_id);
CREATE INDEX idx_demand_responses_demand_id ON demand_responses(demand_id);
CREATE INDEX idx_messages_ride_type_ride_id ON messages(ride_type, ride_id);
CREATE INDEX idx_ratings_ride_id ON ratings(ride_id);

-- Verification queries (optional - comment out in production)
-- SELECT 'Demands count:', COUNT(*) FROM demands;
-- SELECT 'Offers count:', COUNT(*) FROM offers;
-- SELECT 'Bookings count:', COUNT(*) FROM bookings;
-- SELECT 'Demand responses count:', COUNT(*) FROM demand_responses;
-- SELECT 'Messages count:', COUNT(*) FROM messages;
-- SELECT 'Ratings count:', COUNT(*) FROM ratings;

COMMENT ON TABLE demands IS 'Updated to use INTEGER IDs instead of UUID';
COMMENT ON TABLE offers IS 'Updated to use INTEGER IDs instead of UUID';
COMMENT ON TABLE bookings IS 'Updated to use INTEGER IDs instead of UUID';
COMMENT ON TABLE demand_responses IS 'Updated to use INTEGER IDs instead of UUID';
