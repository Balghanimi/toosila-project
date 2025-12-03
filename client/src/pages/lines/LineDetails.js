import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLines } from '../../context/LinesContext';
import styles from './LineDetails.module.css';

// Helper functions
const formatTime = (time) => {
  if (!time) return '--:--';
  const parts = time.split(':');
  if (parts.length < 2) return time;
  const hour = parseInt(parts[0]);
  const minutes = parts[1];
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const formatPrice = (price) => {
  if (!price) return '0';
  return new Intl.NumberFormat('en-US').format(price);
};

const DAYS = [
  { value: 0, label: 'أحد' },
  { value: 1, label: 'إثنين' },
  { value: 2, label: 'ثلاثاء' },
  { value: 3, label: 'أربعاء' },
  { value: 4, label: 'خميس' },
  { value: 5, label: 'جمعة' },
  { value: 6, label: 'سبت' },
];

const LineDetails = () => {
  const { lineId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { currentLine, loading, error, fetchLineById, subscribeLine } = useLines();

  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [selectedStop, setSelectedStop] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');

  useEffect(() => {
    if (lineId) {
      fetchLineById(lineId);
    }
  }, [lineId, fetchLineById]);

  const handleSubscribe = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setSubscribing(true);
    setSubscribeError('');

    try {
      await subscribeLine(lineId, {
        subscriptionType: selectedPlan,
        pickupStopId: selectedStop || null,
        paymentMethod: 'cash',
      });

      alert('تم الاشتراك بنجاح! ✅');
      navigate('/subscriptions');
    } catch (err) {
      setSubscribeError(err.message || 'حدث خطأ أثناء الاشتراك');
    } finally {
      setSubscribing(false);
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'students':
        return { text: '🎓 طلاب', className: styles.badgeStudents };
      case 'employees':
        return { text: '💼 موظفين', className: styles.badgeEmployees };
      default:
        return { text: '👥 عام', className: styles.badgeGeneral };
    }
  };

  const getPlanPrice = () => {
    if (!currentLine) return 0;
    switch (selectedPlan) {
      case 'weekly':
        return currentLine.weekly_price || Math.round(currentLine.monthly_price / 4);
      case 'quarterly':
        return currentLine.quarterly_price || currentLine.monthly_price * 3;
      default:
        return currentLine.monthly_price;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <span>جاري التحميل...</span>
        </div>
      </div>
    );
  }

  if (error || !currentLine) {
    return (
      <div className={styles.container}>
        <div className={styles.errorBox}>
          <span>❌</span>
          <p>{error || 'الخط غير موجود'}</p>
          <button onClick={() => navigate('/lines')}>العودة للخطوط</button>
        </div>
      </div>
    );
  }

  const typeBadge = getTypeBadge(currentLine.line_type);
  const isOwner = currentUser?.id === currentLine.driver_id;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/lines')}>
          → العودة
        </button>
        <h1 className={styles.headerTitle}>تفاصيل الخط</h1>
        <div className={styles.headerSpacer} />
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Line Info */}
        <div className={styles.section}>
          <div className={styles.badgesRow}>
            <span className={`${styles.badge} ${typeBadge.className}`}>
              {typeBadge.text}
            </span>
            {currentLine.is_ladies_only && (
              <span className={`${styles.badge} ${styles.badgeLadies}`}>
                👩 نسائي
              </span>
            )}
            <span className={`${styles.badge} ${styles.badgeStatus}`}>
              {currentLine.status === 'active' ? '🟢 نشط' : '🔴 متوقف'}
            </span>
          </div>
          <h2 className={styles.lineName}>{currentLine.name}</h2>
        </div>

        {/* Route Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>🛤️ المسار</h3>
          <div className={styles.routeCard}>
            <div className={styles.routePoint}>
              <span className={styles.routeIcon}>📍</span>
              <span className={styles.routeCity}>{currentLine.from_city}</span>
            </div>
            <div className={styles.routeLine} />
            <div className={styles.routePoint}>
              <span className={styles.routeIcon}>🏁</span>
              <span className={styles.routeCity}>{currentLine.to_city}</span>
            </div>
          </div>
        </div>

        {/* Stops */}
        {currentLine.stops && currentLine.stops.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>📍 نقاط التوقف</h3>
            <div className={styles.stopsList}>
              {currentLine.stops.map((stop, index) => (
                <div key={stop.id} className={styles.stopItem}>
                  <span className={styles.stopNumber}>{index + 1}</span>
                  <span className={styles.stopName}>{stop.name}</span>
                  {stop.arrival_time && (
                    <span className={styles.stopTime}>{formatTime(stop.arrival_time)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>⏰ المواعيد</h3>
          <div className={styles.scheduleCard}>
            <div className={styles.scheduleRow}>
              <div className={styles.scheduleItem}>
                <span className={styles.scheduleIcon}>🌅</span>
                <span className={styles.scheduleLabel}>وقت الذهاب</span>
                <span className={styles.scheduleValue}>{formatTime(currentLine.departure_time)}</span>
              </div>
              {currentLine.return_time && (
                <div className={styles.scheduleItem}>
                  <span className={styles.scheduleIcon}>🌆</span>
                  <span className={styles.scheduleLabel}>وقت الرجوع</span>
                  <span className={styles.scheduleValue}>{formatTime(currentLine.return_time)}</span>
                </div>
              )}
            </div>
            <div className={styles.workingDays}>
              <span className={styles.daysLabel}>أيام العمل:</span>
              <div className={styles.daysGrid}>
                {DAYS.map((day) => (
                  <span
                    key={day.value}
                    className={`${styles.dayBadge} ${
                      currentLine.working_days?.includes(day.value) ? styles.dayActive : ''
                    }`}
                  >
                    {day.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Driver Info */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>🚗 السائق</h3>
          <div className={styles.driverCard}>
            <div className={styles.driverAvatar}>🚗</div>
            <div className={styles.driverInfo}>
              <span className={styles.driverName}>{currentLine.driver_name || 'السائق'}</span>
              {currentLine.driver_rating > 0 && (
                <span className={styles.driverRating}>
                  ⭐ {Number(currentLine.driver_rating).toFixed(1)}
                </span>
              )}
            </div>
            <div className={styles.driverStats}>
              <span>👥 {currentLine.total_subscribers || 0} مشترك</span>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>💰 باقات الاشتراك</h3>
          <div className={styles.pricingGrid}>
            {/* Weekly */}
            <button
              className={`${styles.pricingCard} ${selectedPlan === 'weekly' ? styles.pricingSelected : ''}`}
              onClick={() => setSelectedPlan('weekly')}
            >
              <span className={styles.pricingPeriod}>أسبوعي</span>
              <span className={styles.pricingPrice}>
                {formatPrice(currentLine.weekly_price || Math.round(currentLine.monthly_price / 4))}
              </span>
              <span className={styles.pricingCurrency}>د.ع</span>
            </button>

            {/* Monthly */}
            <button
              className={`${styles.pricingCard} ${selectedPlan === 'monthly' ? styles.pricingSelected : ''}`}
              onClick={() => setSelectedPlan('monthly')}
            >
              <span className={styles.pricingBadge}>الأكثر شيوعاً</span>
              <span className={styles.pricingPeriod}>شهري</span>
              <span className={styles.pricingPrice}>{formatPrice(currentLine.monthly_price)}</span>
              <span className={styles.pricingCurrency}>د.ع</span>
            </button>

            {/* Quarterly */}
            <button
              className={`${styles.pricingCard} ${selectedPlan === 'quarterly' ? styles.pricingSelected : ''}`}
              onClick={() => setSelectedPlan('quarterly')}
            >
              <span className={styles.pricingPeriod}>ربع سنوي</span>
              <span className={styles.pricingPrice}>
                {formatPrice(currentLine.quarterly_price || currentLine.monthly_price * 3)}
              </span>
              <span className={styles.pricingCurrency}>د.ع</span>
            </button>
          </div>
        </div>

        {/* Pickup Stop Selection */}
        {currentLine.stops && currentLine.stops.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>📍 اختر نقطة الصعود</h3>
            <select
              className={styles.stopSelect}
              value={selectedStop}
              onChange={(e) => setSelectedStop(e.target.value)}
            >
              <option value="">-- اختر نقطة --</option>
              {currentLine.stops.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Availability */}
        <div className={styles.availabilityCard}>
          <div className={styles.availabilityInfo}>
            <span className={styles.availabilityIcon}>💺</span>
            <span className={styles.availabilityText}>
              {currentLine.available_seats > 0
                ? `${currentLine.available_seats} مقاعد متاحة من ${currentLine.total_seats}`
                : 'الخط ممتلئ حالياً'}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {subscribeError && (
          <div className={styles.errorMessage}>
            {subscribeError}
          </div>
        )}

        {/* Subscribe Button */}
        {!isOwner && (
          <div className={styles.subscribeSection}>
            <div className={styles.totalPrice}>
              <span>المجموع:</span>
              <span className={styles.totalAmount}>{formatPrice(getPlanPrice())} د.ع</span>
            </div>
            <button
              className={styles.subscribeButton}
              onClick={handleSubscribe}
              disabled={subscribing || currentLine.available_seats <= 0}
            >
              {subscribing ? '⏳ جاري الاشتراك...' : 'اشتراك الآن'}
            </button>
          </div>
        )}

        {/* Owner Actions */}
        {isOwner && (
          <div className={styles.ownerActions}>
            <p className={styles.ownerNote}>أنت مالك هذا الخط</p>
            <button
              className={styles.editButton}
              onClick={() => navigate(`/lines/${lineId}/edit`)}
            >
              ✏️ تعديل الخط
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LineDetails;
