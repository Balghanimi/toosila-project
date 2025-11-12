/**
 * Migration 012: Fix Bookings Unique Constraint
 *
 * Problem: UNIQUE(offer_id, passenger_id) prevents users from booking
 * the same offer multiple times, even after cancellation.
 *
 * Solution: Remove the simple UNIQUE constraint and add a partial
 * unique index that only applies to active bookings (pending, accepted).
 * This allows users to create new bookings for offers they previously
 * cancelled or rejected.
 */

-- Drop existing unique constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_offer_id_passenger_id_key;

-- Create partial unique index for active bookings only
-- Users can only have ONE active (pending/accepted) booking per offer
-- But they can create new bookings after cancellation
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_active_unique
ON bookings(offer_id, passenger_id)
WHERE status IN ('pending', 'accepted');

-- This allows:
-- ✅ Multiple cancelled bookings for same offer+passenger
-- ✅ New booking after cancellation
-- ❌ Multiple active bookings for same offer+passenger
