-- Migration 014: Cleanup orphaned notifications and add triggers
-- Description: Remove notifications for deleted demands and add automatic cleanup triggers
-- Author: Claude Code
-- Date: 2025-11-12

-- ============================================
-- PART 1: Clean up existing orphaned notifications
-- ============================================

-- حذف الإشعارات اليتيمة (notifications for demands that no longer exist)
DELETE FROM notifications
WHERE type IN ('demand_response', 'response_accepted', 'response_rejected')
AND data->>'demandId' IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM demands WHERE id::text = data->>'demandId'
);

-- حذف الإشعارات اليتيمة (notifications for bookings that no longer exist)
DELETE FROM notifications
WHERE type IN ('booking_created', 'booking_accepted', 'booking_rejected')
AND data->>'bookingId' IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM bookings WHERE id::text = data->>'bookingId'
);

-- ============================================
-- PART 2: Create trigger functions for automatic cleanup
-- ============================================

-- Function: Delete demand-related notifications when demand is deleted
CREATE OR REPLACE FUNCTION cleanup_demand_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- حذف جميع الإشعارات المرتبطة بهذا الطلب
  DELETE FROM notifications
  WHERE type IN ('demand_response', 'response_accepted', 'response_rejected')
  AND data->>'demandId' = OLD.id::text;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Execute cleanup when demand is deleted
DROP TRIGGER IF EXISTS trg_cleanup_demand_notifications ON demands;
CREATE TRIGGER trg_cleanup_demand_notifications
AFTER DELETE ON demands
FOR EACH ROW
EXECUTE FUNCTION cleanup_demand_notifications();

-- Function: Delete booking-related notifications when booking is deleted
CREATE OR REPLACE FUNCTION cleanup_booking_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- حذف جميع الإشعارات المرتبطة بهذا الحجز
  DELETE FROM notifications
  WHERE type IN ('booking_created', 'booking_accepted', 'booking_rejected')
  AND data->>'bookingId' = OLD.id::text;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Execute cleanup when booking is deleted
DROP TRIGGER IF EXISTS trg_cleanup_booking_notifications ON bookings;
CREATE TRIGGER trg_cleanup_booking_notifications
AFTER DELETE ON bookings
FOR EACH ROW
EXECUTE FUNCTION cleanup_booking_notifications();

-- ============================================
-- PART 3: Create index for faster notification cleanup
-- ============================================

-- Index on data->>'demandId' for faster demand notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_demand_id
ON notifications ((data->>'demandId'))
WHERE type IN ('demand_response', 'response_accepted', 'response_rejected');

-- Index on data->>'bookingId' for faster booking notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_booking_id
ON notifications ((data->>'bookingId'))
WHERE type IN ('booking_created', 'booking_accepted', 'booking_rejected');

-- ============================================
-- PART 4: Verification and summary
-- ============================================

DO $$
DECLARE
  deleted_count INTEGER;
  notification_count INTEGER;
BEGIN
  -- Count remaining notifications
  SELECT COUNT(*) INTO notification_count FROM notifications;

  RAISE NOTICE '';
  RAISE NOTICE '✅ Migration 014 completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   - Cleaned up orphaned demand notifications';
  RAISE NOTICE '   - Cleaned up orphaned booking notifications';
  RAISE NOTICE '   - Created automatic cleanup triggers';
  RAISE NOTICE '   - Added performance indexes';
  RAISE NOTICE '   - Total notifications remaining: %', notification_count;
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Benefits:';
  RAISE NOTICE '   - No more orphaned notifications';
  RAISE NOTICE '   - Automatic cleanup when demands/bookings deleted';
  RAISE NOTICE '   - Faster notification queries';
  RAISE NOTICE '';
END $$;
