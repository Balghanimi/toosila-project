import React from 'react';

const RideDetailsModal = ({ isOpen, onClose, rideType, rideData, onBook }) => {
  if (!isOpen || !rideData) return null;

  const formatPrice = (price) => {
    if (!price) return 'غير محدد';
    try {
      return new Intl.NumberFormat('ar-IQ', {
        style: 'currency',
        currency: 'IQD',
        maximumFractionDigits: 0,
      }).format(price);
    } catch {
      return `${price} د.ع`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('ar-IQ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      // If it's a full datetime, extract time
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        return date.toLocaleTimeString('ar-IQ', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return timeString;
    } catch {
      return timeString;
    }
  };

  // Extract data based on ride type (handle different field naming conventions)
  const isOffer = rideType === 'offer';
  const fromCity = rideData.fromCity || rideData.from_city || rideData.pickupLocation || 'غير محدد';
  const toCity = rideData.toCity || rideData.to_city || rideData.dropLocation || 'غير محدد';
  const price = rideData.price || rideData.maxPrice || rideData.max_price;
  const date = rideData.date || rideData.departure_time || rideData.departureTime;
  const time = rideData.time || formatTime(rideData.departure_time || rideData.departureTime);
  const seats = rideData.seats || rideData.available_seats || rideData.availableSeats;
  const driverName = rideData.driverName || rideData.driver_name || rideData.name;
  const passengerName = rideData.passengerName || rideData.passenger_name || rideData.name;
  const notes = rideData.notes || rideData.description || '';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: 'var(--space-4)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface-primary)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xl)',
          width: '100%',
          maxWidth: '450px',
          maxHeight: '80vh',
          overflow: 'hidden',
          direction: 'rtl',
          animation: 'slideUp 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--space-4)',
            background: isOffer
              ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
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
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            {isOffer ? '🚗 تفاصيل العرض' : '🙋 تفاصيل الطلب'}
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

        {/* Content */}
        <div
          style={{
            padding: 'var(--space-4)',
            maxHeight: '50vh',
            overflowY: 'auto',
          }}
        >
          {/* Route Section */}
          <div
            style={{
              background: 'var(--surface-secondary)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              marginBottom: 'var(--space-4)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-3)',
              }}
            >
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div
                  style={{
                    fontSize: 'var(--text-2xl)',
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  📍
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  {fromCity}
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-muted)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  نقطة الانطلاق
                </div>
              </div>

              <div
                style={{
                  fontSize: 'var(--text-2xl)',
                  color: 'var(--primary)',
                }}
              >
                ←
              </div>

              <div style={{ textAlign: 'center', flex: 1 }}>
                <div
                  style={{
                    fontSize: 'var(--text-2xl)',
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  🎯
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  {toCity}
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-muted)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  الوجهة
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {/* Date */}
            <div
              style={{
                background: 'var(--surface-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-3)',
                border: '1px solid var(--border-light)',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--text-lg)',
                  marginBottom: 'var(--space-1)',
                }}
              >
                📅
              </div>
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                  fontFamily: '"Cairo", sans-serif',
                  marginBottom: 'var(--space-1)',
                }}
              >
                التاريخ
              </div>
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  fontFamily: '"Cairo", sans-serif',
                }}
              >
                {formatDate(date)}
              </div>
            </div>

            {/* Time */}
            {time && (
              <div
                style={{
                  background: 'var(--surface-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-3)',
                  border: '1px solid var(--border-light)',
                }}
              >
                <div
                  style={{
                    fontSize: 'var(--text-lg)',
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  ⏰
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-muted)',
                    fontFamily: '"Cairo", sans-serif',
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  الوقت
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  {time}
                </div>
              </div>
            )}

            {/* Price */}
            <div
              style={{
                background: 'var(--surface-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-3)',
                border: '1px solid var(--border-light)',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--text-lg)',
                  marginBottom: 'var(--space-1)',
                }}
              >
                💰
              </div>
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                  fontFamily: '"Cairo", sans-serif',
                  marginBottom: 'var(--space-1)',
                }}
              >
                السعر
              </div>
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: '700',
                  color: 'var(--primary)',
                  fontFamily: '"Cairo", sans-serif',
                }}
              >
                {formatPrice(price)}
              </div>
            </div>

            {/* Seats */}
            {seats && (
              <div
                style={{
                  background: 'var(--surface-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-3)',
                  border: '1px solid var(--border-light)',
                }}
              >
                <div
                  style={{
                    fontSize: 'var(--text-lg)',
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  💺
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-muted)',
                    fontFamily: '"Cairo", sans-serif',
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  المقاعد المتاحة
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  {seats}
                </div>
              </div>
            )}
          </div>

          {/* Driver/Passenger Info */}
          <div
            style={{
              background: 'var(--surface-secondary)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-3)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              marginBottom: notes ? 'var(--space-3)' : 0,
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: isOffer
                  ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
                  : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-lg)',
                color: 'white',
                fontWeight: '700',
                fontFamily: '"Cairo", sans-serif',
              }}
            >
              {(isOffer ? driverName : passengerName)?.charAt(0) || '👤'}
            </div>
            <div>
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                  fontFamily: '"Cairo", sans-serif',
                }}
              >
                {isOffer ? 'السائق' : 'الراكب'}
              </div>
              <div
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  fontFamily: '"Cairo", sans-serif',
                }}
              >
                {isOffer ? driverName || 'غير محدد' : passengerName || 'غير محدد'}
              </div>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div
              style={{
                background: 'var(--surface-tertiary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-3)',
                border: '1px solid var(--border-light)',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                  fontFamily: '"Cairo", sans-serif',
                  marginBottom: 'var(--space-1)',
                }}
              >
                ملاحظات
              </div>
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  fontFamily: '"Cairo", sans-serif',
                  lineHeight: 1.5,
                }}
              >
                {notes}
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
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: 'var(--space-3)',
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
            إغلاق
          </button>
          {isOffer && onBook && (
            <button
              onClick={() => {
                onClose();
                onBook(rideData);
              }}
              style={{
                flex: 1,
                padding: 'var(--space-3)',
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
              احجز الآن
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default RideDetailsModal;
