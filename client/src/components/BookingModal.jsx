/**
 * BookingModal Component
 * نافذة تأكيد الحجز - تظهر في منتصف الشاشة
 * FIXED: Sticky footer + English numerals + ALWAYS centered in viewport
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { formatPrice, formatDate, formatTime, formatSeats } from '../utils/formatters';

const BookingModal = ({ isOpen, onClose, offerDetails, onConfirm }) => {
  const [show, setShow] = useState(false);

  // منع scroll عند فتح Modal + إضافة animation
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Reset any page scroll to ensure modal is visible
      // This ensures the modal overlay starts at viewport top
      window.scrollTo({ top: window.pageYOffset, behavior: 'instant' });

      // Trigger animation after a tiny delay
      setTimeout(() => setShow(true), 10);
    } else {
      document.body.style.overflow = 'unset';
      setShow(false);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // إغلاق عند الضغط على ESC
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
      onConfirm(offerDetails);
    }
    onClose();
  };

  // Modal JSX
  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflow: 'auto',
        opacity: show ? 1 : 0,
        transition: 'opacity 0.2s ease-out',
      }}
    >
      {/* Backdrop - الخلفية المعتمة */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content - المحتوى - GUARANTEED CENTERED */}
      <div
        className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl transform transition-all z-10 flex flex-col"
        style={{
          position: 'relative',
          maxWidth: '28rem',
          width: '100%',
          maxHeight: '85vh',
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          margin: 'auto',
          transform: show ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-2xl p-5 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold" style={{ fontFamily: '"Cairo", sans-serif' }}>
              تأكيد الحجز 🎫
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl leading-none transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20"
              aria-label="إغلاق"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* معلومات الرحلة - Compact */}
          <div className="space-y-3">
            {/* Route - Large and prominent */}
            <div className="text-center pb-3 border-b-2">
              <div className="text-2xl font-bold text-gray-800" style={{ fontFamily: '"Cairo", sans-serif' }}>
                {offerDetails.fromCity} ← {offerDetails.toCity}
              </div>
            </div>

            {/* Price - Eye-catching */}
            <div className="text-center py-3 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1" style={{ fontFamily: '"Cairo", sans-serif' }}>
                السعر
              </div>
              <div
                className="text-3xl font-bold text-green-600"
                style={{ fontFamily: '"Cairo", sans-serif', direction: 'ltr', unicodeBidi: 'embed' }}
              >
                {formatPrice(offerDetails.price)} د.ع
              </div>
            </div>

            {/* Date and Time - Compact */}
            <div className="flex gap-3">
              <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-600 mb-1">📅</div>
                <div className="font-semibold text-sm" style={{ fontFamily: '"Cairo", sans-serif', direction: 'ltr' }}>
                  {formatDate(offerDetails.departureDate)}
                </div>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-600 mb-1">⏰</div>
                <div className="font-semibold text-sm" style={{ fontFamily: '"Cairo", sans-serif', direction: 'ltr' }}>
                  {formatTime(offerDetails.departureTime)}
                </div>
              </div>
            </div>

            {/* Driver and Seats - Compact */}
            <div className="flex gap-3">
              <div className="flex-1 bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1" style={{ fontFamily: '"Cairo", sans-serif' }}>
                  السائق
                </div>
                <div className="font-semibold text-sm" style={{ fontFamily: '"Cairo", sans-serif' }}>
                  {offerDetails.driverName || 'غير متوفر'}
                </div>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1" style={{ fontFamily: '"Cairo", sans-serif' }}>
                  المقاعد المتاحة 💺
                </div>
                <div className="font-semibold text-sm" style={{ fontFamily: '"Cairo", sans-serif', direction: 'ltr' }}>
                  {formatSeats(offerDetails.availableSeats)}
                </div>
              </div>
            </div>
          </div>

          {/* Info Notice - Compact */}
          <div className="bg-blue-50 border-r-4 border-blue-500 p-3 rounded">
            <p className="text-xs text-blue-800" style={{ fontFamily: '"Cairo", sans-serif' }}>
              ℹ️ سيتم إرسال طلب الحجز للسائق للتأكيد النهائي.
            </p>
          </div>
        </div>

        {/* Footer - ALWAYS VISIBLE (Sticky) */}
        <div className="flex-shrink-0 p-4 bg-gray-50 border-t-2 border-gray-200 rounded-b-2xl flex gap-3 shadow-lg sticky bottom-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors text-base"
            style={{ fontFamily: '"Cairo", sans-serif' }}
          >
            إلغاء
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-lg font-semibold transition-all text-base shadow-lg transform hover:scale-105"
            style={{ fontFamily: '"Cairo", sans-serif' }}
          >
            تأكيد الحجز ✅
          </button>
        </div>
      </div>
    </div>
  );

  // Use React Portal to render modal at body level (guarantees proper z-index and positioning)
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
    availableSeats: PropTypes.number,
  }),
  onConfirm: PropTypes.func,
};

export default BookingModal;
