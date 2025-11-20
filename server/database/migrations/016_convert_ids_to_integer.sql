-- Simplified Migration: Convert UUID IDs to INTEGER
BEGIN;

-- Step 1: Clean up duplicate bookings
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
CREATE SEQUENCE IF NOT EXISTS demands_id_seq;
ALTER TABLE demands DROP CONSTRAINT IF EXISTS demands_pkey CASCADE;
ALTER TABLE demands ADD COLUMN id_new INTEGER;
WITH numbered AS (
  SELECT ctid, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM demands
)
UPDATE demands SET id_new = numbered.rn
FROM numbered WHERE demands.ctid = numbered.ctid;
ALTER TABLE demands DROP COLUMN id;
ALTER TABLE demands RENAME COLUMN id_new TO id;
ALTER TABLE demands ADD PRIMARY KEY (id);
SELECT setval('demands_id_seq', COALESCE((SELECT MAX(id) FROM demands), 0) + 1);
ALTER TABLE demands ALTER COLUMN id SET DEFAULT nextval('demands_id_seq');

-- Step 4: Convert offers table
CREATE SEQUENCE IF NOT EXISTS offers_id_seq;
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_pkey CASCADE;
ALTER TABLE offers ADD COLUMN id_new INTEGER;
WITH numbered AS (
  SELECT ctid, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM offers
)
UPDATE offers SET id_new = numbered.rn
FROM numbered WHERE offers.ctid = numbered.ctid;
ALTER TABLE offers DROP COLUMN id;
ALTER TABLE offers RENAME COLUMN id_new TO id;
ALTER TABLE offers ADD PRIMARY KEY (id);
SELECT setval('offers_id_seq', COALESCE((SELECT MAX(id) FROM offers), 0) + 1);
ALTER TABLE offers ALTER COLUMN id SET DEFAULT nextval('offers_id_seq');

-- Step 5: Convert bookings table
CREATE SEQUENCE IF NOT EXISTS bookings_id_seq;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_pkey CASCADE;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_offer_id_fkey CASCADE;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_offer_id_passenger_id_key CASCADE;
ALTER TABLE bookings ADD COLUMN id_new INTEGER;
ALTER TABLE bookings ADD COLUMN offer_id_new INTEGER;

WITH numbered AS (
  SELECT ctid, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM bookings
)
UPDATE bookings SET id_new = numbered.rn
FROM numbered WHERE bookings.ctid = numbered.ctid;

UPDATE bookings b SET offer_id_new = o.id::integer
FROM offers o WHERE b.offer_id::text = o.id::text;

ALTER TABLE bookings DROP COLUMN id;
ALTER TABLE bookings DROP COLUMN offer_id;
ALTER TABLE bookings RENAME COLUMN id_new TO id;
ALTER TABLE bookings RENAME COLUMN offer_id_new TO offer_id;
ALTER TABLE bookings ADD PRIMARY KEY (id);
ALTER TABLE bookings ADD FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD UNIQUE (offer_id, passenger_id);
SELECT setval('bookings_id_seq', COALESCE((SELECT MAX(id) FROM bookings), 0) + 1);
ALTER TABLE bookings ALTER COLUMN id SET DEFAULT nextval('bookings_id_seq');

-- Step 6: Convert demand_responses table
CREATE SEQUENCE IF NOT EXISTS demand_responses_id_seq;
ALTER TABLE demand_responses DROP CONSTRAINT IF EXISTS demand_responses_pkey CASCADE;
ALTER TABLE demand_responses DROP CONSTRAINT IF EXISTS demand_responses_demand_id_fkey CASCADE;
ALTER TABLE demand_responses DROP CONSTRAINT IF EXISTS demand_responses_demand_id_driver_id_key CASCADE;
ALTER TABLE demand_responses ADD COLUMN id_new INTEGER;
ALTER TABLE demand_responses ADD COLUMN demand_id_new INTEGER;

WITH numbered AS (
  SELECT ctid, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM demand_responses
)
UPDATE demand_responses SET id_new = numbered.rn
FROM numbered WHERE demand_responses.ctid = numbered.ctid;

UPDATE demand_responses dr SET demand_id_new = d.id::integer
FROM demands d WHERE dr.demand_id::text = d.id::text;

ALTER TABLE demand_responses DROP COLUMN id;
ALTER TABLE demand_responses DROP COLUMN demand_id;
ALTER TABLE demand_responses RENAME COLUMN id_new TO id;
ALTER TABLE demand_responses RENAME COLUMN demand_id_new TO demand_id;
ALTER TABLE demand_responses ADD PRIMARY KEY (id);
ALTER TABLE demand_responses ADD FOREIGN KEY (demand_id) REFERENCES demands(id) ON DELETE CASCADE;
ALTER TABLE demand_responses ADD UNIQUE (demand_id, driver_id);
SELECT setval('demand_responses_id_seq', COALESCE((SELECT MAX(id) FROM demand_responses), 0) + 1);
ALTER TABLE demand_responses ALTER COLUMN id SET DEFAULT nextval('demand_responses_id_seq');

-- Step 7: Fix messages and ratings if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='ride_id') THEN
    ALTER TABLE messages ALTER COLUMN ride_id TYPE INTEGER USING CASE
      WHEN ride_id ~ '^[0-9]+$' THEN ride_id::integer
      ELSE NULL
    END;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ratings' AND column_name='ride_id') THEN
    ALTER TABLE ratings ALTER COLUMN ride_id TYPE INTEGER USING CASE
      WHEN ride_id ~ '^[0-9]+$' THEN ride_id::integer
      ELSE NULL
    END;
  END IF;
END $$;

-- Step 8: Recreate indexes
DROP INDEX IF EXISTS idx_bookings_offer_id;
DROP INDEX IF EXISTS idx_demand_responses_demand_id;
DROP INDEX IF EXISTS idx_messages_ride_type_ride_id;
DROP INDEX IF EXISTS idx_ratings_ride_id;

CREATE INDEX idx_bookings_offer_id ON bookings(offer_id);
CREATE INDEX idx_demand_responses_demand_id ON demand_responses(demand_id);
CREATE INDEX IF NOT EXISTS idx_messages_ride_type_ride_id ON messages(ride_type, ride_id);
CREATE INDEX IF NOT EXISTS idx_ratings_ride_id ON ratings(ride_id);

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
