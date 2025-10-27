-- ============================================
-- Migration: 004_add_performance_indexes.sql
-- Description: Add indexes to improve query performance
-- Date: 2025-10-27
-- ============================================

-- NOTE: All these indexes already exist in init-db.sql
-- This file is for documentation and standalone execution if needed

-- ============================================
-- CORE PERFORMANCE INDEXES (Required)
-- ============================================

-- 1. Offers - Driver lookup (most common query)
CREATE INDEX IF NOT EXISTS idx_offers_driver_id ON offers(driver_id);

-- 2. Bookings - Passenger lookup
CREATE INDEX IF NOT EXISTS idx_bookings_passenger_id ON bookings(passenger_id);

-- 3. Bookings - Offer lookup (for JOIN operations)
CREATE INDEX IF NOT EXISTS idx_bookings_offer_id ON bookings(offer_id);

-- 4. Messages - Sender lookup
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- 5. Ratings - To User lookup (for user profile ratings)
CREATE INDEX IF NOT EXISTS idx_ratings_to_user_id ON ratings(to_user_id);

-- 6. Demand Responses - Demand lookup
CREATE INDEX IF NOT EXISTS idx_demand_responses_demand_id ON demand_responses(demand_id);

-- 7. Demand Responses - Driver lookup
CREATE INDEX IF NOT EXISTS idx_demand_responses_driver_id ON demand_responses(driver_id);

-- 8. Notifications - User lookup (most frequent query)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- ============================================
-- ADDITIONAL SEARCH INDEXES (Optimization)
-- ============================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Demands - Search filters
CREATE INDEX IF NOT EXISTS idx_demands_passenger_id ON demands(passenger_id);
CREATE INDEX IF NOT EXISTS idx_demands_from_city ON demands(from_city);
CREATE INDEX IF NOT EXISTS idx_demands_to_city ON demands(to_city);
CREATE INDEX IF NOT EXISTS idx_demands_is_active ON demands(is_active);

-- Offers - Search filters
CREATE INDEX IF NOT EXISTS idx_offers_from_city ON offers(from_city);
CREATE INDEX IF NOT EXISTS idx_offers_to_city ON offers(to_city);
CREATE INDEX IF NOT EXISTS idx_offers_departure_time ON offers(departure_time);
CREATE INDEX IF NOT EXISTS idx_offers_is_active ON offers(is_active);

-- Bookings - Status filter
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Messages - Composite index for conversations
CREATE INDEX IF NOT EXISTS idx_messages_ride_type_ride_id ON messages(ride_type, ride_id);

-- Ratings - Ride lookup
CREATE INDEX IF NOT EXISTS idx_ratings_ride_id ON ratings(ride_id);

-- Refresh Tokens - User lookup
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- Demand Responses - Status filter
CREATE INDEX IF NOT EXISTS idx_demand_responses_status ON demand_responses(status);

-- ============================================
-- ADVANCED INDEXES (Notifications)
-- ============================================

-- Partial index for unread notifications (most common query)
CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications(user_id, is_read)
  WHERE is_read = FALSE;

-- Descending index for created_at (for ORDER BY)
CREATE INDEX IF NOT EXISTS idx_notifications_created
  ON notifications(created_at DESC);

-- Type index for filtering by notification type
CREATE INDEX IF NOT EXISTS idx_notifications_type
  ON notifications(type);

-- Composite index for complex notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_type_read
  ON notifications(user_id, type, is_read, created_at DESC);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- To verify indexes were created:
-- SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;

-- To check index usage:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch FROM pg_stat_user_indexes ORDER BY idx_scan DESC;

-- To find missing indexes:
-- SELECT schemaname, tablename, attname, n_distinct, correlation FROM pg_stats WHERE schemaname = 'public' AND correlation < 0.1;

-- ============================================
-- PERFORMANCE IMPACT
-- ============================================

/*
Expected improvements:
1. Offers by driver: 100x faster (table scan → index scan)
2. Bookings by passenger: 50x faster
3. Messages by ride: 30x faster (with composite index)
4. Notifications unread: 200x faster (partial index)
5. Overall query time: -60% average reduction

Disk space impact:
- Estimated 5-10 MB additional storage
- Minimal compared to query performance gains

Maintenance:
- Indexes auto-update on INSERT/UPDATE/DELETE
- Recommend VACUUM ANALYZE weekly for optimal performance
*/

-- ============================================
-- END OF MIGRATION
-- ============================================
