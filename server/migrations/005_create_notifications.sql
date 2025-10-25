-- Migration: Create notifications table
-- Description: Table for storing user notifications for various events (responses, bookings, messages, etc.)
-- Author: Claude Code
-- Date: 2025-10-25

-- إنشاء جدول الإشعارات
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- التحقق من أنواع الإشعارات المسموح بها
    CONSTRAINT check_notification_type CHECK (type IN (
        'demand_response',      -- سائق رد على طلب راكب
        'response_accepted',    -- راكب قبل رد السائق
        'response_rejected',    -- راكب رفض رد السائق
        'booking_created',      -- راكب حجز رحلة سائق
        'booking_accepted',     -- سائق قبل حجز الراكب
        'booking_rejected',     -- سائق رفض حجز الراكب
        'new_message',          -- رسالة جديدة في المحادثة
        'trip_reminder'         -- تذكير بالرحلة القادمة
    ))
);

-- إنشاء الفهارس لتحسين الأداء
-- فهرس على user_id للبحث السريع عن إشعارات المستخدم
CREATE INDEX IF NOT EXISTS idx_notifications_user
ON notifications(user_id);

-- فهرس مركب على user_id و is_read للبحث عن الإشعارات غير المقروءة
CREATE INDEX IF NOT EXISTS idx_notifications_unread
ON notifications(user_id, is_read)
WHERE is_read = FALSE;

-- فهرس على created_at للترتيب الزمني
CREATE INDEX IF NOT EXISTS idx_notifications_created
ON notifications(created_at DESC);

-- فهرس على type للفلترة حسب النوع
CREATE INDEX IF NOT EXISTS idx_notifications_type
ON notifications(type);

-- فهرس مركب للاستعلامات المتقدمة
CREATE INDEX IF NOT EXISTS idx_notifications_user_type_read
ON notifications(user_id, type, is_read, created_at DESC);

-- إضافة تعليقات على الجدول والأعمدة
COMMENT ON TABLE notifications IS 'جدول الإشعارات - يخزن جميع إشعارات المستخدمين';
COMMENT ON COLUMN notifications.id IS 'معرف الإشعار الفريد';
COMMENT ON COLUMN notifications.user_id IS 'معرف المستخدم المستلم للإشعار';
COMMENT ON COLUMN notifications.type IS 'نوع الإشعار (demand_response, booking_created, etc.)';
COMMENT ON COLUMN notifications.title IS 'عنوان الإشعار';
COMMENT ON COLUMN notifications.message IS 'محتوى الإشعار';
COMMENT ON COLUMN notifications.data IS 'بيانات إضافية بصيغة JSON (IDs, URLs, etc.)';
COMMENT ON COLUMN notifications.is_read IS 'هل تم قراءة الإشعار';
COMMENT ON COLUMN notifications.created_at IS 'تاريخ ووقت إنشاء الإشعار';

-- عرض نتيجة التنفيذ
DO $$
BEGIN
    RAISE NOTICE '✅ تم إنشاء جدول notifications بنجاح!';
    RAISE NOTICE '✅ تم إنشاء 5 فهارس للأداء الأمثل';
    RAISE NOTICE '✅ Migration 005 مكتمل!';
END $$;
