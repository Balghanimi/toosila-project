import React, { useState, useEffect } from 'react';
import { useBookings } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';

const BookingModal = ({
  isOpen,
  onClose,
  tripType, // 'offer' or 'demand'
  tripData, // The offer or demand data
  onBookingCreated,
}) => {
  const { createBookingRequest } = useBookings();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    passengerName: '',
    passengerPhone: '',
    passengerSeats: 1,
    specialRequests: '',
    pickupTime: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Details, 2: Confirmation, 3: Success

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        passengerName: user?.name || '',
        passengerPhone: user?.phone || '',
        passengerSeats: tripType === 'offer' ? tripData?.seats || 1 : 1,
        specialRequests: '',
        pickupTime: '',
        notes: '',
      });
      setErrors({});
      setStep(1);
    }
  }, [isOpen, user, tripData, tripType]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.passengerName.trim()) {
      newErrors.passengerName = 'اسم الراكب مطلوب';
    }

    if (!formData.passengerPhone.trim()) {
      newErrors.passengerPhone = 'رقم الهاتف مطلوب';
    } else if (!/^(\+964|0)?[0-9]{10}$/.test(formData.passengerPhone.replace(/\s/g, ''))) {
      newErrors.passengerPhone = 'رقم الهاتف غير صحيح';
    }

    if (formData.passengerSeats < 1) {
      newErrors.passengerSeats = 'عدد المقاعد يجب أن يكون على الأقل 1';
    }

    if (tripType === 'offer' && formData.passengerSeats > tripData.seats) {
      newErrors.passengerSeats = `عدد المقاعد المتاحة: ${tripData.seats}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Determine IDs based on trip type
      const passengerId = user?.id || 'current_user';
      const driverId = tripType === 'offer' ? `driver_${tripData.id}` : user?.id || 'current_user';

      const tripInfo = {
        from: tripData.pickupLocation || tripData.from,
        to: tripData.dropLocation || tripData.to,
        date: tripData.date,
        time: tripData.time,
        price: tripData.price || tripData.maxPrice,
        seats: tripData.seats || formData.passengerSeats,
      };

      const passengerInfo = {
        name: formData.passengerName,
        phone: formData.passengerPhone,
        seats: formData.passengerSeats,
        specialRequests: formData.specialRequests,
        pickupTime: formData.pickupTime,
        notes: formData.notes,
      };

      const booking = createBookingRequest(
        passengerId,
        driverId,
        `trip_${tripData.id}`,
        tripInfo,
        passengerInfo
      );

      setStep(3);

      if (onBookingCreated) {
        onBookingCreated(booking);
      }

      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error creating booking:', error);
      setErrors({ submit: 'حدث خطأ في إنشاء الحجز. حاول مرة أخرى.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    try {
      return new Intl.NumberFormat('ar-IQ', {
        style: 'currency',
        currency: 'IQD',
        maximumFractionDigits: 0,
      }).format(price);
    } catch {
      return `${price} دينار عراقي`;
    }
  };

  const formatDate = (date) => {
    try {
      return new Intl.DateTimeFormat('ar-IQ', {
        dateStyle: 'full',
        timeStyle: 'short',
      }).format(new Date(date));
    } catch {
      return date;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--space-4)',
      }}
    >
      <div
        style={{
          background: 'var(--surface-primary)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xl)',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'hidden',
          direction: 'rtl',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--space-4)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            color: 'white',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 'var(--text-lg)',
              fontWeight: '700',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            {step === 1 && '📝 تفاصيل الحجز'}
            {step === 2 && '✅ تأكيد الحجز'}
            {step === 3 && '🎉 تم إنشاء الحجز'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              fontSize: 'var(--text-lg)',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            ✕
          </button>
        </div>

        {/* Progress Steps */}
        <div
          style={{
            padding: 'var(--space-3)',
            background: 'var(--surface-secondary)',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)',
          }}
        >
          {[1, 2, 3].map((stepNumber) => (
            <div
              key={stepNumber}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: step >= stepNumber ? 'var(--primary)' : 'var(--surface-tertiary)',
                color: step >= stepNumber ? 'white' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                fontFamily: '"Cairo", sans-serif',
                transition: 'var(--transition)',
              }}
            >
              {stepNumber}
            </div>
          ))}
        </div>

        {/* Content */}
        <div
          style={{
            padding: 'var(--space-4)',
            maxHeight: '60vh',
            overflowY: 'auto',
          }}
        >
          {/* Step 1: Form Details */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Trip Summary */}
              <div
                style={{
                  background: 'var(--surface-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-3)',
                  border: '1px solid var(--border-light)',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 var(--space-2) 0',
                    fontSize: 'var(--text-base)',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  📍 تفاصيل الرحلة
                </h4>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  <div>من: {tripData.pickupLocation || tripData.from}</div>
                  <div>إلى: {tripData.dropLocation || tripData.to}</div>
                  <div>التاريخ: {formatDate(tripData.date)}</div>
                  <div>السعر: {formatPrice(tripData.price || tripData.maxPrice)}</div>
                </div>
              </div>

              {/* Form Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: 'var(--space-1)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      fontFamily: '"Cairo", sans-serif',
                    }}
                  >
                    اسم الراكب *
                  </label>
                  <input
                    type="text"
                    value={formData.passengerName}
                    onChange={(e) => handleInputChange('passengerName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: 'var(--space-3)',
                      border: `2px solid ${errors.passengerName ? 'var(--error)' : 'var(--border-light)'}`,
                      borderRadius: 'var(--radius-lg)',
                      fontSize: 'var(--text-base)',
                      fontFamily: '"Cairo", sans-serif',
                      background: 'var(--surface-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      transition: 'var(--transition)',
                    }}
                    placeholder="أدخل اسمك الكامل"
                  />
                  {errors.passengerName && (
                    <div
                      style={{
                        color: 'var(--error)',
                        fontSize: 'var(--text-xs)',
                        marginTop: 'var(--space-1)',
                        fontFamily: '"Cairo", sans-serif',
                      }}
                    >
                      {errors.passengerName}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: 'var(--space-1)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      fontFamily: '"Cairo", sans-serif',
                    }}
                  >
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    value={formData.passengerPhone}
                    onChange={(e) => handleInputChange('passengerPhone', e.target.value)}
                    style={{
                      width: '100%',
                      padding: 'var(--space-3)',
                      border: `2px solid ${errors.passengerPhone ? 'var(--error)' : 'var(--border-light)'}`,
                      borderRadius: 'var(--radius-lg)',
                      fontSize: 'var(--text-base)',
                      fontFamily: '"Cairo", sans-serif',
                      background: 'var(--surface-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      transition: 'var(--transition)',
                    }}
                    placeholder="07XX XXX XXXX"
                  />
                  {errors.passengerPhone && (
                    <div
                      style={{
                        color: 'var(--error)',
                        fontSize: 'var(--text-xs)',
                        marginTop: 'var(--space-1)',
                        fontFamily: '"Cairo", sans-serif',
                      }}
                    >
                      {errors.passengerPhone}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: 'var(--space-1)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      fontFamily: '"Cairo", sans-serif',
                    }}
                  >
                    عدد المقاعد *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={tripType === 'offer' ? tripData.seats : 10}
                    value={formData.passengerSeats}
                    onChange={(e) =>
                      handleInputChange('passengerSeats', parseInt(e.target.value) || 1)
                    }
                    style={{
                      width: '100%',
                      padding: 'var(--space-3)',
                      border: `2px solid ${errors.passengerSeats ? 'var(--error)' : 'var(--border-light)'}`,
                      borderRadius: 'var(--radius-lg)',
                      fontSize: 'var(--text-base)',
                      fontFamily: '"Cairo", sans-serif',
                      background: 'var(--surface-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      transition: 'var(--transition)',
                    }}
                  />
                  {errors.passengerSeats && (
                    <div
                      style={{
                        color: 'var(--error)',
                        fontSize: 'var(--text-xs)',
                        marginTop: 'var(--space-1)',
                        fontFamily: '"Cairo", sans-serif',
                      }}
                    >
                      {errors.passengerSeats}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: 'var(--space-1)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      fontFamily: '"Cairo", sans-serif',
                    }}
                  >
                    طلبات خاصة (اختياري)
                  </label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: 'var(--space-3)',
                      border: '2px solid var(--border-light)',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: 'var(--text-base)',
                      fontFamily: '"Cairo", sans-serif',
                      background: 'var(--surface-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      transition: 'var(--transition)',
                      resize: 'vertical',
                    }}
                    placeholder="أي طلبات خاصة أو ملاحظات..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Confirmation */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Booking Summary */}
              <div
                style={{
                  background: 'var(--surface-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  border: '1px solid var(--border-light)',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 var(--space-3) 0',
                    fontSize: 'var(--text-lg)',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  📋 ملخص الحجز
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>الراكب:</span>
                    <span style={{ fontWeight: '600' }}>{formData.passengerName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>الهاتف:</span>
                    <span style={{ fontWeight: '600' }}>{formData.passengerPhone}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>المقاعد:</span>
                    <span style={{ fontWeight: '600' }}>{formData.passengerSeats}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>المسار:</span>
                    <span style={{ fontWeight: '600' }}>
                      {tripData.pickupLocation || tripData.from} →{' '}
                      {tripData.dropLocation || tripData.to}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>التاريخ:</span>
                    <span style={{ fontWeight: '600' }}>{formatDate(tripData.date)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>السعر:</span>
                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>
                      {formatPrice(tripData.price || tripData.maxPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div
                style={{
                  background: 'var(--surface-tertiary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-3)',
                  border: '1px solid var(--border-light)',
                }}
              >
                <h5
                  style={{
                    margin: '0 0 var(--space-2) 0',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  📋 الشروط والأحكام
                </h5>
                <ul
                  style={{
                    margin: 0,
                    padding: '0 0 0 var(--space-4)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-secondary)',
                    fontFamily: '"Cairo", sans-serif',
                    lineHeight: '1.5',
                  }}
                >
                  <li>الحجز قابل للإلغاء قبل ساعة من موعد الرحلة</li>
                  <li>يتم الدفع عند بداية الرحلة</li>
                  <li>في حالة الإلغاء المتأخر، قد يتم خصم رسوم</li>
                  <li>السائق ملتزم بمواعيد الرحلة المتفق عليها</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-4)',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--success) 0%, #16a34a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  animation: 'bounce 1s ease-in-out',
                }}
              >
                ✅
              </div>

              <div>
                <h3
                  style={{
                    margin: '0 0 var(--space-2) 0',
                    fontSize: 'var(--text-xl)',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  تم إنشاء الحجز بنجاح!
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--text-base)',
                    color: 'var(--text-secondary)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  سيتم إشعار السائق بطلب الحجز وسيتم التواصل معك قريباً
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: 'var(--space-4)',
            background: 'var(--surface-secondary)',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'flex-end',
          }}
        >
          {step === 1 && (
            <>
              <button
                onClick={onClose}
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background: 'var(--surface-primary)',
                  color: 'var(--text-primary)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-base)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  fontFamily: '"Cairo", sans-serif',
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = 'var(--text-muted)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'var(--border-light)';
                }}
              >
                إلغاء
              </button>
              <button
                onClick={handleNext}
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background:
                    'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-base)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  fontFamily: '"Cairo", sans-serif',
                  boxShadow: 'var(--shadow-md)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                التالي
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background: 'var(--surface-primary)',
                  color: 'var(--text-primary)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-base)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  fontFamily: '"Cairo", sans-serif',
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = 'var(--text-muted)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'var(--border-light)';
                }}
              >
                السابق
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background: isSubmitting
                    ? 'var(--text-muted)'
                    : 'linear-gradient(135deg, var(--success) 0%, #16a34a 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-base)',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'var(--transition)',
                  fontFamily: '"Cairo", sans-serif',
                  boxShadow: 'var(--shadow-md)',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = 'var(--shadow-lg)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'var(--shadow-md)';
                  }
                }}
              >
                {isSubmitting ? 'جاري الحجز...' : 'تأكيد الحجز'}
              </button>
            </>
          )}

          {step === 3 && (
            <button
              onClick={onClose}
              style={{
                padding: 'var(--space-3) var(--space-6)',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'var(--transition)',
                fontFamily: '"Cairo", sans-serif',
                boxShadow: 'var(--shadow-md)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              إغلاق
            </button>
          )}
        </div>

        <style>{`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default BookingModal;
