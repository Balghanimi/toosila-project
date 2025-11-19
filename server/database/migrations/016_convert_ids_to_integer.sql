-- Simplified Migration: Convert UUID IDs to INTEGER (One table at a time)
BEGIN;

-- Step 1: Clean up duplicate bookings first
DELETE FROM bookings a USING (
  SELECT MIN(ctid) as ctid, offer_id, passenger_id
  FROM bookings
  GROUP BY offer_id, passenger_id
  HAVING COUNT(*) > 1
) b
WHERE a.offer_id = b.offer_id
  AND a.passenger_id = b.passenger_id
  AND a.ctid <> b.ctid;

-- Step 2: Clean up duplicate demand_responses
DELETE FROM demand_responses a USING (
  SELECT MIN(ctid) as ctid, demand_id, driver_id
  FROM demand_responses
  GROUP BY demand_id, driver_id
  HAVING COUNT(*) > 1
) b
WHERE a.demand_id = b.demand_id
  AND a.driver_id = b.driver_id
  AND a.ctid <> b.ctid;

-- Step 3: Convert demands table
ALTER TABLE demands DROP CONSTRAINT IF EXISTS demands_pkey CASCADE;
ALTER TABLE demands ADD COLUMN id_temp SERIAL;
UPDATE demands SET id_temp = (ROW_NUMBER() OVER (ORDER BY created_at))::integer;
ALTER TABLE demands DROP COLUMN id;
ALTER TABLE demands RENAME COLUMN id_temp TO id;
ALTER TABLE demands ADD PRIMARY KEY (id);

-- Step 4: Convert offers table
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_pkey CASCADE;
ALTER TABLE offers ADD COLUMN id_temp SERIAL;
UPDATE offers SET id_temp = (ROW_NUMBER() OVER (ORDER BY created_at))::integer;
ALTER TABLE offers DROP COLUMN id;
ALTER TABLE offers RENAME COLUMN id_temp TO id;
ALTER TABLE offers ADD PRIMARY KEY (id);

-- Step 5: Convert bookings table
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_pkey CASCADE;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_offer_id_fkey CASCADE;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_offer_id_passenger_id_key CASCADE;
ALTER TABLE bookings ADD COLUMN id_temp SERIAL;
ALTER TABLE bookings ADD COLUMN offer_id_temp INTEGER;
UPDATE bookings b SET offer_id_temp = o.id
FROM offers o WHERE b.offer_id::text = o.id::text;
UPDATE bookings SET id_temp = (ROW_NUMBER() OVER (ORDER BY created_at))::integer;
ALTER TABLE bookings DROP COLUMN id;
ALTER TABLE bookings DROP COLUMN offer_id;
ALTER TABLE bookings RENAME COLUMN id_temp TO id;
ALTER TABLE bookings RENAME COLUMN offer_id_temp TO offer_id;
ALTER TABLE bookings ADD PRIMARY KEY (id);
ALTER TABLE bookings ADD FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD UNIQUE (offer_id, passenger_id);

-- Step 6: Convert demand_responses table
ALTER TABLE demand_responses DROP CONSTRAINT IF EXISTS demand_responses_pkey CASCADE;
ALTER TABLE demand_responses DROP CONSTRAINT IF EXISTS demand_responses_demand_id_fkey CASCADE;
ALTER TABLE demand_responses DROP CONSTRAINT IF EXISTS demand_responses_demand_id_driver_id_key CASCADE;
ALTER TABLE demand_responses ADD COLUMN id_temp SERIAL;
ALTER TABLE demand_responses ADD COLUMN demand_id_temp INTEGER;
UPDATE demand_responses dr SET demand_id_temp = d.id
FROM demands d WHERE dr.demand_id::text = d.id::text;
UPDATE demand_responses SET id_temp = (ROW_NUMBER() OVER (ORDER BY created_at))::integer;
ALTER TABLE demand_responses DROP COLUMN id;
ALTER TABLE demand_responses DROP COLUMN demand_id;
ALTER TABLE demand_responses RENAME COLUMN id_temp TO id;
ALTER TABLE demand_responses RENAME COLUMN demand_id_temp TO demand_id;
ALTER TABLE demand_responses ADD PRIMARY KEY (id);
ALTER TABLE demand_responses ADD FOREIGN KEY (demand_id) REFERENCES demands(id) ON DELETE CASCADE;
ALTER TABLE demand_responses ADD UNIQUE (demand_id, driver_id);

-- Step 7: Fix messages and ratings ride_id references
-- Messages can reference either demands or offers, so we'll keep them as integers
ALTER TABLE messages ALTER COLUMN ride_id TYPE INTEGER USING (ride_id::text)::integer;
ALTER TABLE ratings ALTER COLUMN ride_id TYPE INTEGER USING (ride_id::text)::integer;

-- Step 8: Recreate indexes
DROP INDEX IF EXISTS idx_bookings_offer_id;
DROP INDEX IF EXISTS idx_demand_responses_demand_id;
DROP INDEX IF EXISTS idx_messages_ride_type_ride_id;
DROP INDEX IF EXISTS idx_ratings_ride_id;

CREATE INDEX idx_bookings_offer_id ON bookings(offer_id);
CREATE INDEX idx_demand_responses_demand_id ON demand_responses(demand_id);
CREATE INDEX idx_messages_ride_type_ride_id ON messages(ride_type, ride_id);
CREATE INDEX idx_ratings_ride_id ON ratings(ride_id);

-- Mark migration as complete
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_migrations (migration_name)
VALUES ('016_convert_ids_to_integer')
ON CONFLICT (migration_name) DO NOTHING;

COMMIT;
