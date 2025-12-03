import React from 'react';
import styles from './LineCard.module.css';

/**
 * LineCard - Display card for a single line
 */
const LineCard = ({ line, onSubscribe }) => {
  const {
    name,
    line_type,
    is_ladies_only,
    from_city,
    to_city,
    departure_time,
    return_time,
    working_days,
    monthly_price,
    available_seats,
    driver_name,
    driver_rating,
    total_subscribers,
  } = line;

  // Format time to HH:MM (English numerals)
  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    // Handle TIME type (HH:MM:SS) or full timestamp
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
  };

  // Get type badge info
  const getTypeBadge = () => {
    switch (line_type) {
      case 'students':
        return { text: '🎓 طلاب', className: styles.badgeStudents };
      case 'employees':
        return { text: '💼 موظفين', className: styles.badgeEmployees };
      default:
        return { text: '👥 عام', className: styles.badgeGeneral };
    }
  };

  // Format working days
  const formatWorkingDays = () => {
    if (!working_days || working_days.length === 0) return 'يومياً';

    const dayNames = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

    if (working_days.length === 6) return 'أيام الدوام';
    if (working_days.length === 7) return 'يومياً';

    return working_days.map((d) => dayNames[d]).join(', ');
  };

  // Format price with commas
  const formatPrice = (price) => {
    if (!price) return '0';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const typeBadge = getTypeBadge();

  return (
    <div className={styles.card}>
      {/* Badges Row */}
      <div className={styles.badgesRow}>
        <span className={`${styles.badge} ${typeBadge.className}`}>{typeBadge.text}</span>
        {is_ladies_only && (
          <span className={`${styles.badge} ${styles.badgeLadies}`}>👩 نسائي فقط</span>
        )}
      </div>

      {/* Line Name */}
      <h3 className={styles.lineName}>{name}</h3>

      {/* Route */}
      <div className={styles.route}>
        <div className={styles.routeCity}>
          <span className={styles.routeIcon}>📍</span>
          <span>{from_city}</span>
        </div>
        <div className={styles.routeArrow}>←</div>
        <div className={styles.routeCity}>
          <span className={styles.routeIcon}>🏁</span>
          <span>{to_city}</span>
        </div>
      </div>

      {/* Times */}
      <div className={styles.timesRow}>
        <div className={styles.timeItem}>
          <span className={styles.timeIcon}>🌅</span>
          <span className={styles.timeLabel}>ذهاب</span>
          <span className={styles.timeValue}>{formatTime(departure_time)}</span>
        </div>
        {return_time && (
          <div className={styles.timeItem}>
            <span className={styles.timeIcon}>🌆</span>
            <span className={styles.timeLabel}>رجوع</span>
            <span className={styles.timeValue}>{formatTime(return_time)}</span>
          </div>
        )}
      </div>

      {/* Working Days */}
      <div className={styles.workingDays}>
        <span className={styles.daysIcon}>📅</span>
        <span>{formatWorkingDays()}</span>
      </div>

      {/* Driver Info */}
      <div className={styles.driverInfo}>
        <div className={styles.driverAvatar}>🚗</div>
        <div className={styles.driverDetails}>
          <span className={styles.driverName}>{driver_name || 'السائق'}</span>
          {driver_rating > 0 && (
            <span className={styles.driverRating}>⭐ {Number(driver_rating).toFixed(1)}</span>
          )}
        </div>
        <div className={styles.subscribers}>
          <span className={styles.subscribersIcon}>👥</span>
          <span>{total_subscribers || 0}</span>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.priceSection}>
          <span className={styles.priceValue}>{formatPrice(monthly_price)}</span>
          <span className={styles.priceCurrency}>د.ع</span>
          <span className={styles.priceLabel}>/ شهرياً</span>
        </div>

        <div className={styles.seatsSection}>
          <span className={styles.seatsIcon}>💺</span>
          <span className={available_seats > 0 ? styles.seatsAvailable : styles.seatsFull}>
            {available_seats > 0 ? `${available_seats} متاح` : 'ممتلئ'}
          </span>
        </div>
      </div>

      {/* Subscribe Button */}
      <button
        className={`${styles.subscribeButton} ${available_seats <= 0 ? styles.buttonDisabled : ''}`}
        onClick={onSubscribe}
        disabled={available_seats <= 0}
      >
        {available_seats > 0 ? 'اشتراك' : 'الخط ممتلئ'}
      </button>
    </div>
  );
};

export default LineCard;
