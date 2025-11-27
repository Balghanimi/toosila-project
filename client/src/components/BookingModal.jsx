/**
 * BookingModal Component - Redesigned
 * نافذة تأكيد الحجز - تصميم جديد ونظيف
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { formatPrice, formatDate, formatTime } from '../utils/formatters';
import styles from './BookingModal.module.css';

const BookingModal = ({ isOpen, onClose, offerDetails, onConfirm }) => {
  const [show, setShow] = useState(false);
  const [seatCount, setSeatCount] = useState(1);

  // Reset seat count when modal opens
  useEffect(() => {
    if (isOpen) {
      setSeatCount(1);
    }
  }, [isOpen]);

  // Prevent scroll when modal is open + animation
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setShow(true), 10);
    } else {
      document.body.style.overflow = 'unset';
      setShow(false);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !offerDetails) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm({ ...offerDetails, seats: seatCount });
    }
    onClose();
  };

  const handleCallDriver = () => {
    if (offerDetails.driverPhone) {
      window.location.href = `tel:${offerDetails.driverPhone}`;
    }
  };

  const totalPrice = offerDetails.price * seatCount;
  const availableSeats = offerDetails.availableSeats || 4;

  const modalContent = (
    <div className={styles.overlay} style={{ opacity: show ? 1 : 0 }} onClick={onClose}>
      {/* Modal Container */}
      <div
        className={styles.modal}
        style={{ transform: show ? 'scale(1)' : 'scale(0.95)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <button onClick={onClose} className={styles.closeButton} aria-label="إغلاق">
            ✕
          </button>
          <h2 className={styles.title}>تأكيد الحجز</h2>
        </div>

        {/* Route */}
        <div className={styles.route}>
          {offerDetails.fromCity} ← {offerDetails.toCity}
        </div>

        {/* Top Info Row */}
        <div className={styles.topInfoRow}>
          <div className={styles.price}>{formatPrice(offerDetails.price)} د.ع</div>
          <div className={styles.timeDate}>
            <span className={styles.time}>⏰ {formatTime(offerDetails.departureTime)}</span>
            <span className={styles.date}>
              📅 {formatDate(offerDetails.departureDate || offerDetails.departureTime)}
            </span>
          </div>
        </div>

        {/* Driver Section */}
        <div className={styles.driverSection}>
          {offerDetails.driverPhone && (
            <button
              onClick={handleCallDriver}
              className={styles.callButton}
              aria-label="اتصل بالسائق"
            >
              📞
            </button>
          )}
          <div className={styles.driverInfo}>
            <span className={styles.driverLabel}>السائق:</span>
            <span className={styles.driverName}>{offerDetails.driverName || 'غير متوفر'}</span>
          </div>
        </div>

        {/* Info Cards */}
        <div className={styles.infoCards}>
          <div className={styles.infoCard}>
            <span className={styles.cardIcon}>💰</span>
            <span className={styles.cardValue}>{formatPrice(offerDetails.price)} د.ع</span>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.cardIcon}>💺</span>
            <span className={styles.cardValue}>{availableSeats} متاح</span>
          </div>
        </div>

        {/* Seat Selector */}
        <div className={styles.seatSelector}>
          <span className={styles.seatLabel}>عدد المقاعد</span>
          <div className={styles.seatControls}>
            <button
              type="button"
              onClick={() => setSeatCount((prev) => Math.max(1, prev - 1))}
              disabled={seatCount <= 1}
              className={styles.seatButton}
              aria-label="تقليل"
            >
              −
            </button>
            <span className={styles.seatCount}>{seatCount}</span>
            <button
              type="button"
              onClick={() => setSeatCount((prev) => Math.min(availableSeats, prev + 1))}
              disabled={seatCount >= availableSeats}
              className={styles.seatButton}
              aria-label="زيادة"
            >
              +
            </button>
          </div>
        </div>

        {/* Total Section */}
        <div className={styles.totalSection}>
          <span className={styles.totalLabel}>المجموع:</span>
          <span className={styles.totalAmount}>{formatPrice(totalPrice)} د.ع</span>
          <span className={styles.totalBreakdown}>
            ({seatCount}×{formatPrice(offerDetails.price)})
          </span>
        </div>

        {/* Info Message */}
        <div className={styles.infoMessage}>
          <span className={styles.infoIcon}>ℹ️</span>
          <span className={styles.infoText}>سيتم إرسال طلب الحجز للسائق للتأكيد النهائي.</span>
        </div>

        {/* Action Buttons */}
        <button onClick={handleConfirm} className={styles.confirmButton}>
          تأكيد الحجز
        </button>
        <button onClick={onClose} className={styles.cancelLink}>
          إلغاء
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

BookingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  offerDetails: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fromCity: PropTypes.string,
    toCity: PropTypes.string,
    departureDate: PropTypes.string,
    departureTime: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    driverName: PropTypes.string,
    driverPhone: PropTypes.string,
    availableSeats: PropTypes.number,
  }),
  onConfirm: PropTypes.func,
};

export default BookingModal;
