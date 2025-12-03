import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLines } from '../../context/LinesContext';
import { useAuth } from '../../context/AuthContext';
import styles from './MySubscriptions.module.css';

/**
 * MySubscriptions - Display user's line subscriptions
 */
const MySubscriptions = () => {
  const navigate = useNavigate();
  const { mySubscriptions, fetchMySubscriptions, unsubscribeLine, loading } = useLines();
  const { user } = useAuth();
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (user) {
      fetchMySubscriptions();
    }
  }, [user, fetchMySubscriptions]);

  // Format time to 12-hour format
  const formatTime = (time) => {
    if (!time) return '--:--';
    const parts = time.split(':');
    const hour = parseInt(parts[0]);
    const minutes = parts[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Format price with commas
  const formatPrice = (price) => {
    if (!price) return '0';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get status badge info
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return { text: 'نشط', className: styles.statusActive };
      case 'pending':
        return { text: 'قيد الانتظار', className: styles.statusPending };
      case 'cancelled':
        return { text: 'ملغي', className: styles.statusCancelled };
      case 'expired':
        return { text: 'منتهي', className: styles.statusExpired };
      default:
        return { text: status, className: '' };
    }
  };

  // Get type badge info
  const getTypeBadge = (lineType) => {
    switch (lineType) {
      case 'students':
        return { text: '🎓 طلاب', className: styles.badgeStudents };
      case 'employees':
        return { text: '💼 موظفين', className: styles.badgeEmployees };
      default:
        return { text: '👥 عام', className: styles.badgeGeneral };
    }
  };

  // Handle cancel subscription
  const handleCancel = async (lineId) => {
    if (!window.confirm('هل أنت متأكد من إلغاء الاشتراك؟')) return;

    setCancellingId(lineId);
    try {
      await unsubscribeLine(lineId);
      fetchMySubscriptions();
    } catch (err) {
      alert(err.message || 'حدث خطأ أثناء إلغاء الاشتراك');
    } finally {
      setCancellingId(null);
    }
  };

  // Check if user is logged in
  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.authRequired}>
          <span>🔐</span>
          <p>يجب تسجيل الدخول لعرض اشتراكاتك</p>
          <button onClick={() => navigate('/login')}>تسجيل الدخول</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/lines')}>
          رجوع
        </button>
        <h1 className={styles.headerTitle}>اشتراكاتي</h1>
        <div className={styles.headerSpacer}></div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Stats Card */}
        <div className={styles.statsCard}>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>📋</span>
            <span className={styles.statValue}>{mySubscriptions.length}</span>
            <span className={styles.statLabel}>إجمالي الاشتراكات</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>✅</span>
            <span className={styles.statValue}>
              {mySubscriptions.filter((s) => s.status === 'active').length}
            </span>
            <span className={styles.statLabel}>اشتراكات نشطة</span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className={styles.loadingBox}>
            <div className={styles.spinner}></div>
            <p>جاري التحميل...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && mySubscriptions.length === 0 && (
          <div className={styles.emptyState}>
            <span>📭</span>
            <h3>لا توجد اشتراكات</h3>
            <p>لم تشترك في أي خط بعد</p>
            <button onClick={() => navigate('/lines')}>استعراض الخطوط</button>
          </div>
        )}

        {/* Subscriptions List */}
        {!loading && mySubscriptions.length > 0 && (
          <div className={styles.subscriptionsList}>
            {mySubscriptions.map((sub) => {
              const statusBadge = getStatusBadge(sub.status);
              const typeBadge = getTypeBadge(sub.line_type);

              return (
                <div key={sub.id} className={styles.subscriptionCard}>
                  {/* Card Header */}
                  <div className={styles.cardHeader}>
                    <div className={styles.badgesRow}>
                      <span className={`${styles.badge} ${typeBadge.className}`}>
                        {typeBadge.text}
                      </span>
                      <span className={`${styles.statusBadge} ${statusBadge.className}`}>
                        {statusBadge.text}
                      </span>
                    </div>
                  </div>

                  {/* Line Name */}
                  <h3 className={styles.lineName}>{sub.line_name}</h3>

                  {/* Route */}
                  <div className={styles.route}>
                    <div className={styles.routePoint}>
                      <span>📍</span>
                      <span>{sub.from_city}</span>
                    </div>
                    <span className={styles.routeArrow}>←</span>
                    <div className={styles.routePoint}>
                      <span>🏁</span>
                      <span>{sub.to_city}</span>
                    </div>
                  </div>

                  {/* Times */}
                  <div className={styles.timesRow}>
                    <div className={styles.timeItem}>
                      <span>🌅</span>
                      <span>ذهاب: {formatTime(sub.departure_time)}</span>
                    </div>
                    {sub.return_time && (
                      <div className={styles.timeItem}>
                        <span>🌆</span>
                        <span>رجوع: {formatTime(sub.return_time)}</span>
                      </div>
                    )}
                  </div>

                  {/* Subscription Info */}
                  <div className={styles.subscriptionInfo}>
                    {sub.boarding_stop && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoIcon}>🚏</span>
                        <span className={styles.infoLabel}>محطة الصعود:</span>
                        <span className={styles.infoValue}>{sub.boarding_stop}</span>
                      </div>
                    )}
                    <div className={styles.infoItem}>
                      <span className={styles.infoIcon}>📅</span>
                      <span className={styles.infoLabel}>تاريخ الاشتراك:</span>
                      <span className={styles.infoValue}>{formatDate(sub.subscribed_at)}</span>
                    </div>
                    {sub.end_date && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoIcon}>⏰</span>
                        <span className={styles.infoLabel}>ينتهي في:</span>
                        <span className={styles.infoValue}>{formatDate(sub.end_date)}</span>
                      </div>
                    )}
                  </div>

                  {/* Driver Info */}
                  <div className={styles.driverInfo}>
                    <div className={styles.driverAvatar}>🚗</div>
                    <div className={styles.driverDetails}>
                      <span className={styles.driverName}>{sub.driver_name || 'السائق'}</span>
                      {sub.driver_phone && (
                        <a href={`tel:${sub.driver_phone}`} className={styles.driverPhone}>
                          📞 {sub.driver_phone}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className={styles.priceSection}>
                    <span className={styles.priceLabel}>السعر الشهري:</span>
                    <span className={styles.priceValue}>{formatPrice(sub.monthly_price)}</span>
                    <span className={styles.priceCurrency}>د.ع</span>
                  </div>

                  {/* Actions */}
                  <div className={styles.cardActions}>
                    <button
                      className={styles.detailsButton}
                      onClick={() => navigate(`/lines/${sub.line_id}`)}
                    >
                      تفاصيل الخط
                    </button>
                    {sub.status === 'active' && (
                      <button
                        className={styles.cancelButton}
                        onClick={() => handleCancel(sub.line_id)}
                        disabled={cancellingId === sub.line_id}
                      >
                        {cancellingId === sub.line_id ? 'جاري الإلغاء...' : 'إلغاء الاشتراك'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubscriptions;
