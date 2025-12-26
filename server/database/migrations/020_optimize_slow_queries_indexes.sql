-- ============================================
-- Migration: 020_optimize_slow_queries_indexes.sql
-- Description: Add missing indexes to fix slow queries (>200ms)
-- Date: 2025-12-26
-- Issues Fixed:
--   1. Slow notifications queries (user_id lookup)
--   2. Slow bookings queries (offer_id lookup)
--   3. Slow messages queries (ride_id + sender_id composite)
-- ============================================

-- ============================================
-- NOTIFICATIONS INDEXES
-- ============================================

-- Index for notifications by user (most common query)
-- Improves: GET /api/notifications (user_id lookup)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created
  ON notifications(user_id, created_at DESC);

-- Composite index for unread notifications by user
-- Improves: GET /api/notifications/unread
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, is_read)
  WHERE is_read = FALSE;

-- ============================================
-- BOOKINGS INDEXES
-- ============================================

-- Index for bookings by offer (JOIN optimization)
-- Improves: Bookings stats queries, offer details with bookings
CREATE INDEX IF NOT EXISTS idx_bookings_offer_status
  ON bookings(offer_id, status);

-- Index for passenger bookings (user's booking history)
-- Improves: GET /api/bookings/my/bookings
CREATE INDEX IF NOT EXISTS idx_bookings_passenger_status
  ON bookings(passenger_id, status, created_at DESC);

-- ============================================
-- MESSAGES INDEXES
-- ============================================

-- Composite index for messages by ride and sender
-- Improves: Privacy-filtered message queries
CREATE INDEX IF NOT EXISTS idx_messages_ride_sender
  ON messages(ride_type, ride_id, sender_id, created_at DESC);

-- Index for sender-only queries (fallback when otherUserId missing)
-- Improves: Queries with currentUserId but no otherUserId
CREATE INDEX IF NOT EXISTS idx_messages_sender_created
  ON messages(sender_id, created_at DESC);

-- ============================================
-- OFFERS/DEMANDS INDEXES (for user_rides CTE)
-- ============================================

-- Composite index for offers by driver with status
-- Improves: user_rides CTE in getConversationList
CREATE INDEX IF NOT EXISTS idx_offers_driver_active
  ON offers(driver_id, is_active, id);

-- Composite index for demands by passenger with status
-- Improves: user_rides CTE in getConversationList
CREATE INDEX IF NOT EXISTS idx_demands_passenger_active
  ON demands(passenger_id, is_active, id);

-- ============================================
-- PERFORMANCE IMPACT ESTIMATES
-- ============================================
/*
Expected improvements:
1. Notifications queries: 200-500ms → 10-50ms (10-20x faster)
2. Bookings queries: 150-300ms → 5-20ms (15-30x faster)
3. Messages queries: 100-250ms → 10-40ms (10-25x faster)
4. user_rides CTE: 300-600ms → 30-100ms (10-20x faster)

Overall: 50-90% reduction in query execution time

Disk space impact:
- Estimated 10-20 MB additional storage per 100,000 records
- Minimal compared to query performance gains
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- To verify indexes were created:
-- SELECT tablename, indexname, indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND tablename IN ('notifications', 'bookings', 'messages', 'offers', 'demands')
-- ORDER BY tablename, indexname;

-- To check index usage after deployment:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

-- ============================================
-- END OF MIGRATION
-- ============================================
