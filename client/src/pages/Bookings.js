import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { bookingsAPI } from '../services/api';

export default function Bookings() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'received'); // 'received' or 'sent'
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [highlightedBooking, setHighlightedBooking] = useState(location.state?.highlightBookingId || null);
  const { currentUser } = useAuth();
  const { showSuccess, showError, fetchPendingCount } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, activeTab, navigate]);

  // Clear highlighted booking after 3 seconds
  useEffect(() => {
    if (highlightedBooking) {
      const timer = setTimeout(() => {
        setHighlightedBooking(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedBooking]);

  // Clear location state after using it
  useEffect(() => {
    if (location.state) {
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = activeTab === 'received'
        ? await bookingsAPI.getMyOffers() // حجوزات على عروضي
        : await bookingsAPI.getMyBookings(); // حجوزاتي على عروض الآخرين

      setBookings(response.bookings || []);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تحميل الحجوزات');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await bookingsAPI.updateStatus(bookingId, newStatus);

      if (newStatus === 'confirmed') {
        showSuccess('✅ تم قبول الحجز بنجاح!');
      } else if (newStatus === 'cancelled') {
        showError('❌ تم رفض الحجز');
      }

      fetchBookings(); // إعادة تحميل القائمة
      fetchPendingCount(); // تحديث عداد الحجوزات المعلقة
    } catch (err) {
      showError(err.message || 'حدث خطأ أثناء تحديث الحجز');
      setError(err.message || 'حدث خطأ أثناء تحديث الحجز');
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) return;

    try {
      await bookingsAPI.cancel(bookingId);
      showSuccess('تم إلغاء الحجز بنجاح');
      fetchBookings();
      fetchPendingCount();
    } catch (err) {
      showError(err.message || 'حدث خطأ أثناء إلغاء الحجز');
      setError(err.message || 'حدث خطأ أثناء إلغاء الحجز');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fbbf24',
      confirmed: '#34c759',
      cancelled: '#dc2626',
      completed: '#3b82f6'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'قيد الانتظار',
      confirmed: 'مؤكد',
      cancelled: 'ملغي',
      completed: 'مكتمل'
    };
    return texts[status] || status;
  };

  const renderBookingCard = (booking) => {
    const isReceived = activeTab === 'received';
    const canConfirm = isReceived && booking.status === 'pending';
    const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
    const isHighlighted = highlightedBooking && booking.id === highlightedBooking;

    return (
      <div
        key={booking.id}
        style={{
          background: isHighlighted
            ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
            : 'var(--surface-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-4)',
          boxShadow: isHighlighted ? 'var(--shadow-xl)' : 'var(--shadow-md)',
          border: isHighlighted ? '3px solid #f59e0b' : '1px solid var(--border-light)',
          position: 'relative',
          transition: 'all 0.3s ease',
          animation: isHighlighted ? 'pulse 1.5s ease-in-out infinite' : 'none'
        }}
      >
        {/* Status Badge */}
        <div
          style={{
            position: 'absolute',
            top: 'var(--space-3)',
            left: 'var(--space-3)',
            padding: 'var(--space-1) var(--space-3)',
            background: getStatusColor(booking.status),
            color: 'white',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-xs)',
            fontWeight: '700',
            fontFamily: '"Cairo", sans-serif'
          }}
        >
          {getStatusText(booking.status)}
        </div>

        {/* Booking Info */}
        <div style={{ marginTop: 'var(--space-2)' }}>
          <h3
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-2)',
              fontFamily: '"Cairo", sans-serif'
            }}
          >
            {booking.offer?.fromCity} ← {booking.offer?.toCity}
          </h3>

          <div
            style={{
              display: 'grid',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-3)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              fontFamily: '"Cairo", sans-serif'
            }}
          >
            <div>📅 {booking.offer?.departureTime ? new Date(booking.offer.departureTime).toLocaleDateString('ar-EG') : 'غير محدد'}</div>
            <div>🕐 {booking.offer?.departureTime ? new Date(booking.offer.departureTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
            <div>💺 {booking.offer?.seats || '--'} مقعد</div>
            <div>💰 {booking.totalPrice || booking.offer?.price || '0'} د.ع</div>
          </div>

          {/* Passenger/Driver Details Card */}
          <div
            style={{
              background: isReceived ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius)',
              marginBottom: 'var(--space-3)',
              border: `2px solid ${isReceived ? '#3b82f6' : '#10b981'}`
            }}
          >
            <div
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                color: isReceived ? '#1e40af' : '#047857',
                marginBottom: 'var(--space-2)',
                fontFamily: '"Cairo", sans-serif'
              }}
            >
              {isReceived ? '👤 معلومات الراكب' : '🚗 معلومات السائق'}
            </div>
            <div
              style={{
                display: 'grid',
                gap: 'var(--space-1)',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                fontFamily: '"Cairo", sans-serif'
              }}
            >
              {isReceived ? (
                <>
                  <div><strong>الاسم:</strong> {booking.user?.name || 'غير متوفر'}</div>
                  {booking.user?.email && <div><strong>البريد:</strong> {booking.user.email}</div>}
                  {booking.user?.phone && <div><strong>الهاتف:</strong> {booking.user.phone}</div>}
                </>
              ) : (
                <>
                  <div><strong>الاسم:</strong> {booking.offer?.driver?.name || 'غير متوفر'}</div>
                  {booking.offer?.driver?.email && <div><strong>البريد:</strong> {booking.offer.driver.email}</div>}
                  {booking.offer?.driver?.phone && <div><strong>الهاتف:</strong> {booking.offer.driver.phone}</div>}
                </>
              )}
            </div>
          </div>

          {/* Message */}
          {booking.message && (
            <div
              style={{
                background: 'var(--surface-secondary)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius)',
                marginBottom: 'var(--space-3)',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                fontFamily: '"Cairo", sans-serif'
              }}
            >
              💬 {booking.message}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {/* Primary Actions Row */}
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {canConfirm && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                    style={{
                      flex: 1,
                      padding: 'var(--space-3)',
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontFamily: '"Cairo", sans-serif'
                    }}
                  >
                    ✅ قبول
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                    style={{
                      flex: 1,
                      padding: 'var(--space-3)',
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontFamily: '"Cairo", sans-serif'
                    }}
                  >
                    ❌ رفض
                  </button>
                </>
              )}

              {!isReceived && canCancel && (
                <button
                  onClick={() => handleCancel(booking.id)}
                  style={{
                    flex: 1,
                    padding: 'var(--space-3)',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: '"Cairo", sans-serif'
                  }}
                >
                  إلغاء الحجز
                </button>
              )}
            </div>

            {/* Message Button - Always Visible */}
            <button
              onClick={() => {
                const recipientId = isReceived ? booking.user?.id : booking.offer?.driver?.id;
                const recipientName = isReceived ? booking.user?.name : booking.offer?.driver?.name;
                navigate(`/messages`, { state: { recipientId, recipientName } });
              }}
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: '"Cairo", sans-serif',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              💬 مراسلة {isReceived ? 'الراكب' : 'السائق'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        paddingBottom: '100px'
      }}
    >
      <div
        className="container"
        style={{
          paddingTop: 'var(--space-6)',
          maxWidth: '600px',
          margin: '0 auto'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h1
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: '800',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-2)',
              fontFamily: '"Cairo", sans-serif'
            }}
          >
            📋 حجوزاتي
          </h1>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-6)',
            background: 'var(--surface-secondary)',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-1)'
          }}
        >
          <button
            onClick={() => setActiveTab('received')}
            style={{
              flex: 1,
              padding: 'var(--space-3)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'received' ? 'var(--surface-primary)' : 'transparent',
              color: activeTab === 'received' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: 'var(--text-base)',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: '"Cairo", sans-serif',
              boxShadow: activeTab === 'received' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            📬 الحجوزات الواردة
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            style={{
              flex: 1,
              padding: 'var(--space-3)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'sent' ? 'var(--surface-primary)' : 'transparent',
              color: activeTab === 'sent' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: 'var(--text-base)',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: '"Cairo", sans-serif',
              boxShadow: activeTab === 'sent' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            📤 حجوزاتي
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: '#fee',
              border: '2px solid #f88',
              borderRadius: 'var(--radius)',
              padding: 'var(--space-4)',
              marginBottom: 'var(--space-4)',
              color: '#c00',
              fontFamily: '"Cairo", sans-serif',
              fontSize: 'var(--text-base)'
            }}
          >
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '4px solid var(--border-light)',
                borderTop: '4px solid var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }}
            />
            <p
              style={{
                marginTop: 'var(--space-4)',
                color: 'var(--text-secondary)',
                fontFamily: '"Cairo", sans-serif'
              }}
            >
              جاري التحميل...
            </p>
          </div>
        ) : bookings.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-8)',
              background: 'var(--surface-primary)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>📭</div>
            <p
              style={{
                fontSize: 'var(--text-lg)',
                color: 'var(--text-secondary)',
                fontFamily: '"Cairo", sans-serif'
              }}
            >
              {activeTab === 'received'
                ? 'لا توجد حجوزات واردة حالياً'
                : 'لم تقم بأي حجوزات بعد'}
            </p>
          </div>
        ) : (
          <div>{bookings.map(renderBookingCard)}</div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.1), 0 4px 6px -2px rgba(245, 158, 11, 0.05);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 20px 25px -5px rgba(245, 158, 11, 0.3), 0 10px 10px -5px rgba(245, 158, 11, 0.15);
          }
        }
      `}</style>
    </div>
  );
}
