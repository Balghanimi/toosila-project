/**
 * BookingModal Component
 * نافذة تأكيد الحجز - تظهر في منتصف الشاشة
 */

import { useEffect } from 'react';
import PropTypes from 'prop-types';

const BookingModal = ({ isOpen, onClose, offerDetails, onConfirm }) => {
  // منع scroll عند فتح Modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
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

  return (
    <>
      {/* Backdrop - الخلفية المعتمة */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container - الحاوية الرئيسية */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Modal Content - المحتوى */}
          <div
            className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl transform transition-all animate-modalSlideUp sm:animate-modalSlideIn max-h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-3xl sm:rounded-t-2xl p-6 text-white sticky top-0 z-10">
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

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* معلومات الرحلة */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600" style={{ fontFamily: '"Cairo", sans-serif' }}>
                    المسار:
                  </span>
                  <span
                    className="font-semibold text-lg"
                    style={{ fontFamily: '"Cairo", sans-serif' }}
                  >
                    {offerDetails.fromCity} ← {offerDetails.toCity}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600" style={{ fontFamily: '"Cairo", sans-serif' }}>
                    التاريخ:
                  </span>
                  <span className="font-semibold" style={{ fontFamily: '"Cairo", sans-serif' }}>
                    {new Date(offerDetails.departureDate).toLocaleDateString('ar-EG')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600" style={{ fontFamily: '"Cairo", sans-serif' }}>
                    الوقت:
                  </span>
                  <span className="font-semibold" style={{ fontFamily: '"Cairo", sans-serif' }}>
                    {offerDetails.departureTime}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600" style={{ fontFamily: '"Cairo", sans-serif' }}>
                    السعر:
                  </span>
                  <span
                    className="font-bold text-green-600 text-xl"
                    style={{ fontFamily: '"Cairo", sans-serif' }}
                  >
                    {offerDetails.price ? parseFloat(offerDetails.price).toLocaleString() : '0'}{' '}
                    د.ع
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600" style={{ fontFamily: '"Cairo", sans-serif' }}>
                    السائق:
                  </span>
                  <span className="font-semibold" style={{ fontFamily: '"Cairo", sans-serif' }}>
                    {offerDetails.driverName || 'غير متوفر'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600" style={{ fontFamily: '"Cairo", sans-serif' }}>
                    المقاعد المتاحة:
                  </span>
                  <span className="font-semibold" style={{ fontFamily: '"Cairo", sans-serif' }}>
                    {offerDetails.availableSeats} مقعد
                  </span>
                </div>
              </div>

              {/* معلومات إضافية */}
              <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
                <p
                  className="text-sm text-blue-800"
                  style={{ fontFamily: '"Cairo", sans-serif' }}
                >
                  ℹ️ سيتم إرسال طلب الحجز للسائق. سيتلقى السائق إشعاراً وسيتواصل معك للتأكيد
                  النهائي.
                </p>
              </div>
            </div>

            {/* Footer - الأزرار */}
            <div className="p-6 bg-gray-50 rounded-b-3xl sm:rounded-b-2xl flex gap-3 flex-col sm:flex-row sticky bottom-0">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors text-lg"
                style={{ fontFamily: '"Cairo", sans-serif' }}
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 px-6 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors text-lg shadow-lg"
                style={{ fontFamily: '"Cairo", sans-serif' }}
              >
                تأكيد الحجز ✅
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
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
