-- Migration: إنشاء جدول demand_responses
-- الغرض: السماح للسائقين بالرد على طلبات الركاب
-- التاريخ: 2025-10-25

-- إنشاء جدول الردود على الطلبات
CREATE TABLE IF NOT EXISTS demand_responses (
    -- المعرف الفريد للرد
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- معرف الطلب (Foreign Key)
    demand_id UUID NOT NULL REFERENCES demands(id) ON DELETE CASCADE,

    -- معرف السائق (Foreign Key)
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- السعر المقترح من السائق (بالدينار العراقي)
    offer_price DECIMAL(10,2) NOT NULL CHECK (offer_price >= 0),

    -- عدد المقاعد المتاحة التي يقدمها السائق
    available_seats INTEGER NOT NULL CHECK (available_seats >= 1 AND available_seats <= 7),

    -- رسالة اختيارية من السائق
    message TEXT,

    -- حالة الرد (قيد الانتظار، مقبول، مرفوض، ملغي)
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),

    -- تاريخ ووقت الإنشاء
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- تاريخ ووقت آخر تحديث
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- منع السائق من الرد على نفس الطلب مرتين
    CONSTRAINT unique_driver_per_demand UNIQUE(demand_id, driver_id)
);

-- إنشاء فهرس لتسريع البحث عن الردود حسب الطلب
CREATE INDEX IF NOT EXISTS idx_demand_responses_demand ON demand_responses(demand_id);

-- إنشاء فهرس لتسريع البحث عن ردود السائق
CREATE INDEX IF NOT EXISTS idx_demand_responses_driver ON demand_responses(driver_id);

-- إنشاء فهرس لتسريع البحث عن الردود حسب الحالة
CREATE INDEX IF NOT EXISTS idx_demand_responses_status ON demand_responses(status);

-- إنشاء فهرس مركب للاستعلامات الشائعة
CREATE INDEX IF NOT EXISTS idx_demand_responses_demand_status ON demand_responses(demand_id, status);

-- إضافة trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_demand_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_demand_responses_updated_at
    BEFORE UPDATE ON demand_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_demand_responses_updated_at();

-- إضافة تعليقات على الجدول والأعمدة
COMMENT ON TABLE demand_responses IS 'جدول الردود على طلبات الركاب من قبل السائقين';
COMMENT ON COLUMN demand_responses.id IS 'المعرف الفريد للرد';
COMMENT ON COLUMN demand_responses.demand_id IS 'معرف الطلب المرتبط';
COMMENT ON COLUMN demand_responses.driver_id IS 'معرف السائق الذي أرسل الرد';
COMMENT ON COLUMN demand_responses.offer_price IS 'السعر المقترح من السائق (دينار عراقي)';
COMMENT ON COLUMN demand_responses.available_seats IS 'عدد المقاعد المتاحة';
COMMENT ON COLUMN demand_responses.message IS 'رسالة اختيارية من السائق';
COMMENT ON COLUMN demand_responses.status IS 'حالة الرد: pending, accepted, rejected, cancelled';
