import React from 'react';
import {
  formatPrice,
  formatDate as formatDateUtil,
  formatTime as formatTimeUtil,
  formatSeats,
  toEnglishNumber,
} from '../../utils/formatters';
import styles from './OfferCard.module.css';

/**
 * Mobile-Optimized Offer Card Component
 * Features:
 * - Full-width design for mobile
 * - Large, readable text (16px+)
 * - Touch-friendly buttons (48px+)
 * - Clear visual hierarchy
 * - Accessible and WCAG compliant
 * - English numerals (0-9) everywhere
 */
const OfferCard = ({ offer, onBookNow, onMessageDriver, formatDate, formatTime, currentUser }) => {
  const handleBookClick = () => {
    onBookNow(offer);
  };

  const handleMessageClick = () => {
    if (onMessageDriver) {
      onMessageDriver(offer);
    }
  };

  // Check if current user is the driver of this offer
  const isOwnOffer =
    currentUser && (currentUser.id === offer.driverId || currentUser.id === offer.driver_id);

  // User booking status (from API response)
  const userHasBooking = offer.userHasBooking || offer.user_has_booking || false;
  const userBookingStatus = offer.userBookingStatus || offer.user_booking_status || null;

  return (
    <div className={styles.offerCard}>
      {/* Price - Most prominent - ENGLISH NUMERALS */}
      <div className={styles.priceSection}>
        <div className={styles.price} style={{ direction: 'ltr', unicodeBidi: 'embed' }}>
          {formatPrice(offer.price)}
          <span className={styles.currency}>د.ع</span>
        </div>
      </div>

      {/* Route - Second most important */}
      <div className={styles.routeSection}>
        <div className={styles.route}>
          <span className={styles.cityFrom}>{offer.fromCity || 'غير محدد'}</span>
          <span className={styles.arrow}>←</span>
          <span className={styles.cityTo}>{offer.toCity || 'غير محدد'}</span>
        </div>
      </div>

      {/* Details Row - Icons + Text - ENGLISH NUMERALS */}
      <div className={styles.detailsRow}>
        <div className={styles.detail}>
          <span className={styles.detailIcon}>📅</span>
          <span className={styles.detailText} style={{ direction: 'ltr', unicodeBidi: 'embed' }}>
            {formatDate ? formatDate(offer.departureTime) : formatDateUtil(offer.departureTime)}
          </span>
        </div>

        <div className={styles.detail}>
          <span className={styles.detailIcon}>🕐</span>
          <span className={styles.detailText} style={{ direction: 'ltr', unicodeBidi: 'embed' }}>
            {formatTime ? formatTime(offer.departureTime) : formatTimeUtil(offer.departureTime)}
          </span>
        </div>

        <div className={styles.detail}>
          <span className={styles.detailIcon}>👥</span>
          <span className={styles.detailText} style={{ direction: 'ltr', unicodeBidi: 'embed' }}>
            {formatSeats(offer.availableSeats)} متاح
          </span>
        </div>
      </div>

      {/* Driver Info - ENGLISH NUMERALS */}
      {offer.driverName && (
        <div className={styles.driverSection}>
          <span className={styles.driverIcon}>🚗</span>
          <span className={styles.driverText}>
            السائق: <strong>{offer.driverName}</strong>
          </span>
          {offer.driverRating && (
            <span className={styles.rating} style={{ direction: 'ltr', unicodeBidi: 'embed' }}>
              ⭐ {toEnglishNumber(offer.driverRating.toFixed(1))}
            </span>
          )}
        </div>
      )}

      {/* Additional Info (if available) */}
      {(offer.vehicleType || offer.additionalInfo) && (
        <div className={styles.additionalInfo}>
          {offer.vehicleType && <span className={styles.badge}>{offer.vehicleType}</span>}
          {offer.additionalInfo && <p className={styles.infoText}>{offer.additionalInfo}</p>}
        </div>
      )}

      {/* Action Buttons */}
      {currentUser && (
        <div className={styles.actionButtons}>
          {/* Show booking status badge if user has a booking */}
          {userHasBooking ? (
            <div
              className={`${styles.bookingStatusBadge} ${
                userBookingStatus === 'confirmed' ? styles.confirmed : styles.pending
              }`}
            >
              <span className={styles.bookingStatusIcon}>
                {userBookingStatus === 'confirmed' ? '✓' : '⏳'}
              </span>
              <span>
                {userBookingStatus === 'confirmed' ? 'تم تأكيد حجزك' : 'حجزك قيد الانتظار'}
              </span>
            </div>
          ) : (
            <button type="button" onClick={handleBookClick} className={styles.bookButton}>
              <span>احجز الآن</span>
              <span className={styles.buttonIcon}>🎫</span>
            </button>
          )}
          {/* Message Driver Button - Only show if not own offer */}
          {!isOwnOffer && (
            <button type="button" onClick={handleMessageClick} className={styles.messageButton}>
              <span>مراسلة السائق</span>
              <span className={styles.buttonIcon}>💬</span>
            </button>
          )}
        </div>
      )}

      {/* Login Prompt for Non-authenticated Users */}
      {!currentUser && (
        <div className={styles.loginPrompt}>
          <span>يجب تسجيل الدخول للحجز أو المراسلة</span>
        </div>
      )}
    </div>
  );
};

export default OfferCard;
