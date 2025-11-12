import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { bookingsAPI, demandsAPI, demandResponsesAPI } from '../services/api';
import DemandResponsesList from '../components/DemandResponsesList';

export default function Bookings() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'demands'); // 'demands', 'sent', or 'received'
  const [bookings, setBookings] = useState([]);
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [highlightedBooking, setHighlightedBooking] = useState(
    location.state?.highlightBookingId || null
  );
  const [editingDemand, setEditingDemand] = useState(null);
  const [editForm, setEditForm] = useState({
    earliestTime: '',
    latestTime: '',
    seats: '',
    budgetMax: '',
  });
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
      if (activeTab === 'demands') {
        // جلب طلباتي (demands)
        const response = await demandsAPI.getAll({ passengerId: currentUser?.id });
        const myDemands = response.demands || [];

        console.log('📦 Fetched demands:', myDemands);
        console.log('📦 First demand ID:', myDemands[0]?.id);

        // جلب الردود لكل طلب
        const demandsWithResponses = await Promise.all(
          myDemands.map(async (demand) => {
            try {
              const responsesData = await demandResponsesAPI.getByDemandId(demand.id);
              return {
                ...demand,
                responses: responsesData.responses || [],
              };
            } catch {
              return {
                ...demand,
                responses: [],
              };
            }
          })
        );

        setDemands(demandsWithResponses);
      } else {
        const response =
          activeTab === 'received'
            ? await bookingsAPI.getMyOffers() // حجوزات على عروضي
            : await bookingsAPI.getMyBookings(); // حجوزاتي على عروض الآخرين

        setBookings(response.bookings || []);
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تحميل البيانات');
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

  const handleEditDemand = (demand) => {
    setEditingDemand(demand);
    setEditForm({
      earliestTime: new Date(demand.earliestTime).toISOString().slice(0, 16),
      latestTime: new Date(demand.latestTime).toISOString().slice(0, 16),
      seats: demand.seats,
      budgetMax: demand.budgetMax,
    });
  };

  const handleUpdateDemand = async () => {
    if (!editingDemand) return;

    try {
      await demandsAPI.update(editingDemand.id, {
        earliestTime: new Date(editForm.earliestTime).toISOString(),
        latestTime: new Date(editForm.latestTime).toISOString(),
        seats: parseInt(editForm.seats),
        budgetMax: parseFloat(editForm.budgetMax),
      });
      showSuccess('✅ تم تحديث الطلب بنجاح!');
      setEditingDemand(null);
      fetchBookings();
    } catch (err) {
      showError(err.message || 'حدث خطأ أثناء تحديث الطلب');
    }
  };

  const handleDeleteDemand = async (demandId) => {
    console.log('🔍 Attempting to delete demand with ID:', demandId);
    console.log('🔍 ID type:', typeof demandId);
    console.log('🔍 ID length:', demandId?.length);

    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;

    try {
      await demandsAPI.delete(demandId);
      showSuccess('✅ تم حذف الطلب بنجاح!');
      fetchBookings();
    } catch (err) {
      console.error('❌ Delete error:', err);
      showError(err.message || 'حدث خطأ أثناء حذف الطلب');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fbbf24',
      confirmed: '#34c759',
      cancelled: '#dc2626',
      completed: '#3b82f6',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'قيد الانتظار',
      confirmed: 'مؤكد',
      cancelled: 'ملغي',
      completed: 'مكتمل',
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
          animation: isHighlighted ? 'pulse 1.5s ease-in-out infinite' : 'none',
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
            fontFamily: '"Cairo", sans-serif',
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
              fontFamily: '"Cairo", sans-serif',
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
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            <div>
              📅{' '}
              {booking.offer?.departureTime
                ? new Date(booking.offer.departureTime).toLocaleDateString('ar-EG')
                : 'غير محدد'}
            </div>
            <div>
              🕐{' '}
              {booking.offer?.departureTime
                ? new Date(booking.offer.departureTime).toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '--:--'}
            </div>
            <div>💺 {booking.offer?.seats || '--'} مقعد</div>
            <div>💰 {booking.totalPrice || booking.offer?.price || '0'} د.ع</div>
          </div>

          {/* Passenger/Driver Details Card */}
          <div
            style={{
              background: isReceived
                ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
                : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius)',
              marginBottom: 'var(--space-3)',
              border: `2px solid ${isReceived ? '#3b82f6' : '#10b981'}`,
            }}
          >
            <div
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                color: isReceived ? '#1e40af' : '#047857',
                marginBottom: 'var(--space-2)',
                fontFamily: '"Cairo", sans-serif',
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
                fontFamily: '"Cairo", sans-serif',
              }}
            >
              {isReceived ? (
                <>
                  <div>
                    <strong>الاسم:</strong> {booking.user?.name || 'غير متوفر'}
                  </div>
                  {booking.user?.email && (
                    <div>
                      <strong>البريد:</strong> {booking.user.email}
                    </div>
                  )}
                  {booking.user?.phone && (
                    <div>
                      <strong>الهاتف:</strong> {booking.user.phone}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <strong>الاسم:</strong> {booking.offer?.driver?.name || 'غير متوفر'}
                  </div>
                  {booking.offer?.driver?.email && (
                    <div>
                      <strong>البريد:</strong> {booking.offer.driver.email}
                    </div>
                  )}
                  {booking.offer?.driver?.phone && (
                    <div>
                      <strong>الهاتف:</strong> {booking.offer.driver.phone}
                    </div>
                  )}
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
                fontFamily: '"Cairo", sans-serif',
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
                    aria-label={`قبول حجز ${booking.user?.name || 'الراكب'} من ${booking.offer?.fromCity} إلى ${booking.offer?.toCity}`}
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
                      fontFamily: '"Cairo", sans-serif',
                    }}
                  >
                    ✅ قبول
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                    aria-label={`رفض حجز ${booking.user?.name || 'الراكب'}`}
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
                      fontFamily: '"Cairo", sans-serif',
                    }}
                  >
                    ❌ رفض
                  </button>
                </>
              )}

              {!isReceived && canCancel && (
                <button
                  onClick={() => handleCancel(booking.id)}
                  aria-label={`إلغاء حجزي مع ${booking.offer?.driver?.name || 'السائق'}`}
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
                    fontFamily: '"Cairo", sans-serif',
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
              aria-label={`مراسلة ${isReceived ? booking.user?.name || 'الراكب' : booking.offer?.driver?.name || 'السائق'}`}
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
                boxShadow: 'var(--shadow-sm)',
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
        paddingBottom: '100px',
      }}
    >
      <div
        className="container"
        style={{
          paddingTop: 'var(--space-6)',
          maxWidth: '600px',
          margin: '0 auto',
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
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            📋 حجوزاتي
          </h1>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="أنواع الحجوزات"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-6)',
            background: 'var(--surface-secondary)',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-1)',
          }}
        >
          <button
            onClick={() => setActiveTab('demands')}
            role="tab"
            aria-selected={activeTab === 'demands'}
            aria-controls="bookings-panel"
            aria-label="طلباتي التي أنشأتها"
            style={{
              padding: 'var(--space-3)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'demands' ? 'var(--surface-primary)' : 'transparent',
              color: activeTab === 'demands' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: 'var(--text-sm)',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: '"Cairo", sans-serif',
              boxShadow: activeTab === 'demands' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            🙋 طلباتي
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            role="tab"
            aria-selected={activeTab === 'sent'}
            aria-controls="bookings-panel"
            aria-label="حجوزاتي على عروض الآخرين"
            style={{
              padding: 'var(--space-3)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'sent' ? 'var(--surface-primary)' : 'transparent',
              color: activeTab === 'sent' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: 'var(--text-sm)',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: '"Cairo", sans-serif',
              boxShadow: activeTab === 'sent' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            📤 حجوزاتي
          </button>
          <button
            onClick={() => setActiveTab('received')}
            role="tab"
            aria-selected={activeTab === 'received'}
            aria-controls="bookings-panel"
            aria-label="الحجوزات الواردة على عروضي - للسائقين"
            style={{
              padding: 'var(--space-3)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background:
                activeTab === 'received'
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
              color: activeTab === 'received' ? 'white' : '#065f46',
              fontSize: 'var(--text-sm)',
              fontWeight: '700',
              cursor: 'pointer',
              fontFamily: '"Cairo", sans-serif',
              boxShadow:
                activeTab === 'received'
                  ? '0 4px 6px -1px rgba(16, 185, 129, 0.3), 0 2px 4px -1px rgba(16, 185, 129, 0.2)'
                  : 'none',
              border: '2px solid #10b981',
              position: 'relative',
              transition: 'all 0.3s ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <div>🚗 الحجوزات الواردة</div>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: '500',
                  opacity: 0.9,
                }}
              >
                (للسائقين)
              </div>
            </div>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              background: '#fee',
              border: '2px solid #f88',
              borderRadius: 'var(--radius)',
              padding: 'var(--space-4)',
              marginBottom: 'var(--space-4)',
              color: '#c00',
              fontFamily: '"Cairo", sans-serif',
              fontSize: 'var(--text-base)',
            }}
          >
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div
            style={{ textAlign: 'center', padding: 'var(--space-8)' }}
            role="status"
            aria-live="polite"
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '4px solid var(--border-light)',
                borderTop: '4px solid var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
              }}
              aria-label="جاري التحميل"
            />
            <p
              style={{
                marginTop: 'var(--space-4)',
                color: 'var(--text-secondary)',
                fontFamily: '"Cairo", sans-serif',
              }}
            >
              جاري التحميل...
            </p>
          </div>
        ) : activeTab === 'demands' ? (
          // عرض الطلبات (Demands)
          demands.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-8)',
                background: 'var(--surface-primary)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🙋</div>
              <p
                style={{
                  fontSize: 'var(--text-lg)',
                  color: 'var(--text-secondary)',
                  fontFamily: '"Cairo", sans-serif',
                }}
              >
                لم تقم بإنشاء أي طلبات بعد
              </p>
            </div>
          ) : (
            <div>
              {demands.map((demand) => (
                <div
                  key={demand.id}
                  style={{
                    background: 'var(--surface-primary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)',
                    marginBottom: 'var(--space-6)',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  {/* معلومات الطلب */}
                  <div
                    style={{
                      marginBottom: 'var(--space-4)',
                      paddingBottom: 'var(--space-4)',
                      borderBottom: '2px solid var(--border-light)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 'var(--space-3)',
                      }}
                    >
                      <h3
                        style={{
                          fontSize: 'var(--text-xl)',
                          fontWeight: '700',
                          color: 'var(--text-primary)',
                          fontFamily: '"Cairo", sans-serif',
                        }}
                      >
                        📍 {demand.fromCity} ← {demand.toCity}
                      </h3>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                          onClick={() => handleEditDemand(demand)}
                          style={{
                            padding: 'var(--space-2) var(--space-3)',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontFamily: '"Cairo", sans-serif',
                          }}
                        >
                          ✏️ تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteDemand(demand.id)}
                          style={{
                            padding: 'var(--space-2) var(--space-3)',
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontFamily: '"Cairo", sans-serif',
                          }}
                        >
                          🗑️ حذف
                        </button>
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gap: 'var(--space-2)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-secondary)',
                        fontFamily: '"Cairo", sans-serif',
                      }}
                    >
                      <div>
                        📅 من:{' '}
                        {demand.earliestTime
                          ? new Date(demand.earliestTime).toLocaleDateString('ar-EG')
                          : 'غير محدد'}
                      </div>
                      <div>
                        🕐{' '}
                        {demand.earliestTime
                          ? new Date(demand.earliestTime).toLocaleTimeString('ar-EG', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '--:--'}
                      </div>
                      <div>
                        📅 إلى:{' '}
                        {demand.latestTime
                          ? new Date(demand.latestTime).toLocaleDateString('ar-EG')
                          : 'غير محدد'}
                      </div>
                      <div>💺 {demand.seats} مقعد</div>
                      <div>💰 {demand.budgetMax} د.ع (الحد الأقصى)</div>
                    </div>
                  </div>

                  {/* الردود على الطلب */}
                  <div>
                    <h4
                      style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--space-3)',
                        fontFamily: '"Cairo", sans-serif',
                      }}
                    >
                      الردود ({demand.responses?.length || 0})
                    </h4>
                    {demand.responses && demand.responses.length > 0 ? (
                      <DemandResponsesList
                        responses={demand.responses}
                        isOwner={true}
                        onResponseUpdate={fetchBookings}
                      />
                    ) : (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: 'var(--space-6)',
                          background: 'var(--surface-secondary)',
                          borderRadius: 'var(--radius)',
                          color: 'var(--text-secondary)',
                          fontFamily: '"Cairo", sans-serif',
                        }}
                      >
                        لا توجد ردود على هذا الطلب بعد
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : bookings.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-8)',
              background:
                activeTab === 'received'
                  ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                  : 'var(--surface-primary)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)',
              border: activeTab === 'received' ? '2px solid #10b981' : 'none',
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>
              {activeTab === 'received' ? '🚗' : '📭'}
            </div>
            <p
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: '700',
                color: activeTab === 'received' ? '#065f46' : 'var(--text-secondary)',
                marginBottom: 'var(--space-2)',
                fontFamily: '"Cairo", sans-serif',
              }}
            >
              {activeTab === 'received'
                ? 'لا توجد حجوزات واردة على عروضك'
                : 'لم تقم بأي حجوزات بعد'}
            </p>
            {activeTab === 'received' && (
              <div
                style={{
                  marginTop: 'var(--space-4)',
                  padding: 'var(--space-4)',
                  background: 'white',
                  borderRadius: 'var(--radius)',
                  border: '1px solid #10b981',
                }}
              >
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: '#047857',
                    marginBottom: 'var(--space-2)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  💡 <strong>للسائقين:</strong> هذا القسم يعرض حجوزات الركاب على عروضك
                </p>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: '#047857',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  لاستقبال حجوزات، قم بإنشاء عرض جديد من صفحة "العروض"
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>{bookings.map(renderBookingCard)}</div>
        )}
      </div>

      {/* Edit Demand Modal */}
      {editingDemand && (
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
          onClick={() => setEditingDemand(null)}
        >
          <div
            style={{
              background: 'var(--surface-primary)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              maxWidth: '500px',
              width: '100%',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-4)',
                fontFamily: '"Cairo", sans-serif',
              }}
            >
              ✏️ تعديل الطلب
            </h2>

            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              {/* Earliest Time */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 'var(--space-2)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  📅 أقرب وقت للمغادرة
                </label>
                <input
                  type="datetime-local"
                  value={editForm.earliestTime}
                  onChange={(e) => setEditForm({ ...editForm, earliestTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    border: '2px solid var(--border-light)',
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--text-base)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                />
              </div>

              {/* Latest Time */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 'var(--space-2)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  📅 آخر وقت للمغادرة
                </label>
                <input
                  type="datetime-local"
                  value={editForm.latestTime}
                  onChange={(e) => setEditForm({ ...editForm, latestTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    border: '2px solid var(--border-light)',
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--text-base)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                />
              </div>

              {/* Seats */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 'var(--space-2)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  💺 عدد المقاعد
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={editForm.seats}
                  onChange={(e) => setEditForm({ ...editForm, seats: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    border: '2px solid var(--border-light)',
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--text-base)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                />
              </div>

              {/* Budget Max */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 'var(--space-2)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  💰 الميزانية القصوى (د.ع)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={editForm.budgetMax}
                  onChange={(e) => setEditForm({ ...editForm, budgetMax: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    border: '2px solid var(--border-light)',
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--text-base)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-6)',
              }}
            >
              <button
                onClick={handleUpdateDemand}
                style={{
                  flex: 1,
                  padding: 'var(--space-3)',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--text-base)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontFamily: '"Cairo", sans-serif',
                }}
              >
                ✅ حفظ التغييرات
              </button>
              <button
                onClick={() => setEditingDemand(null)}
                style={{
                  flex: 1,
                  padding: 'var(--space-3)',
                  background: 'var(--surface-secondary)',
                  color: 'var(--text-primary)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--text-base)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontFamily: '"Cairo", sans-serif',
                }}
              >
                ❌ إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

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
