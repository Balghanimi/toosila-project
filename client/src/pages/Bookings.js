import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import { useNotifications } from '../context/NotificationContext';
import { bookingsAPI, demandsAPI, demandResponsesAPI, offersAPI } from '../services/api';
import DemandResponsesList from '../components/DemandResponsesList';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import SkeletonLoader from '../components/UI/SkeletonLoader';
import { formatDate, formatTime, formatPrice, formatSeats } from '../utils/formatters';

export default function Bookings() {
  const location = useLocation();
  const { currentUser, loading: authLoading } = useAuth();
  const { mode: globalMode } = useMode();
  const { showSuccess, showError, showInfo, fetchPendingCount } = useNotifications();
  const navigate = useNavigate();

  // Determine if user is in driver mode
  const isDriver = globalMode === 'driver';

  // Get default tab based on user mode
  const getDefaultTab = () => {
    if (location.state?.tab) return location.state.tab;
    return isDriver ? 'received' : 'demands';
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab()); // 'demands', 'myOffers', 'sent', or 'received'
  const [bookings, setBookings] = useState([]);
  const [demands, setDemands] = useState([]);
  const [myOffers, setMyOffers] = useState([]); // Driver's own offers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [highlightedBooking, setHighlightedBooking] = useState(
    location.state?.highlightBookingId || null
  );
  const [editingDemand, setEditingDemand] = useState(null);
  const [expandedDemandId, setExpandedDemandId] = useState(null);
  const [showResponsesFor, setShowResponsesFor] = useState(null); // ID of demand whose responses are shown
  const [editForm, setEditForm] = useState({
    earliestTime: '',
    latestTime: '',
    seats: '',
    budgetMax: '',
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    variant: 'danger',
  });

  // Tab configuration based on user type
  // For Drivers: Active tabs first (received, myOffers), then disabled (sent, demands)
  // For Passengers: Active tabs first (demands, sent), then disabled (myOffers, received)
  const tabs = isDriver
    ? [
        { id: 'received', label: 'الحجوزات الواردة', icon: '🚗', enabled: true },
        { id: 'myOffers', label: 'عروضي', icon: '🚗', enabled: true },
        { id: 'sent', label: 'حجوزاتي', icon: '👤', enabled: false },
        { id: 'demands', label: 'طلباتي', icon: '👤', enabled: false },
      ]
    : [
        { id: 'demands', label: 'طلباتي', icon: '👤', enabled: true },
        { id: 'sent', label: 'حجوزاتي', icon: '👤', enabled: true },
        { id: 'myOffers', label: 'عروضي', icon: '🚗', enabled: false },
        { id: 'received', label: 'الحجوزات الواردة', icon: '🚗', enabled: false },
      ];

  // Handle tab click
  const handleTabClick = (tab) => {
    if (!tab.enabled) {
      const message = isDriver ? 'هذه الميزة متاحة للركاب' : 'هذه الميزة متاحة للسائقين';
      showInfo(message);
      return;
    }
    setActiveTab(tab.id);
  };

  // Update active tab when global mode changes
  useEffect(() => {
    console.log('[Bookings] Global mode changed to:', globalMode);
    const newDefaultTab = globalMode === 'driver' ? 'received' : 'demands';
    setActiveTab(newDefaultTab);
  }, [globalMode]);

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (authLoading) {
      console.log('[Bookings] Auth still loading, waiting...');
      return;
    }

    // Auth finished loading, check if user is logged in
    if (!currentUser) {
      console.log('[Bookings] No user logged in');
      setLoading(false);
      return;
    }

    console.log('[Bookings] User loaded:', currentUser?.name, 'Tab:', activeTab);
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, authLoading, activeTab]);

  // Clear highlighted booking after 3 seconds
  useEffect(() => {
    if (highlightedBooking) {
      const timer = setTimeout(() => {
        setHighlightedBooking(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedBooking]);

  // Handle notification navigation to specific demand
  useEffect(() => {
    if (location.state?.openDemandId && demands.length > 0) {
      const demandId = location.state.openDemandId;

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(demandId)) {
        console.warn('⚠️ Invalid demand ID from notification (not UUID):', demandId);
        showError('معرف الطلب غير صحيح - قد يكون الإشعار قديماً');
        navigate(location.pathname, { replace: true, state: {} });
        return;
      }

      const demand = demands.find((d) => d.id === demandId);

      if (demand) {
        // إذا وُجد الطلب، افتح قسم الردود
        console.log('✅ Found demand from notification:', demandId);
        setExpandedDemandId(demandId);
        setShowResponsesFor(demandId); // فتح قسم الردود تلقائياً

        // تمرير إلى الطلب المحدد
        setTimeout(() => {
          const element = document.getElementById(`demand-${demandId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);

        // إزالة التمييز بعد 8 ثوان (وقت أطول لقراءة الردود)
        setTimeout(() => {
          setExpandedDemandId(null);
        }, 8000);
      } else {
        // إذا لم يُوجد الطلب، اعرض رسالة توضيحية
        console.warn('⚠️ Demand not found (may be deleted):', demandId);
        showError('هذا الطلب لم يعد موجوداً. ربما تم حذفه.');
      }

      // امسح الـ state لمنع إعادة التشغيل عند refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, demands]);

  // Clear location state after using it (for other navigation states)
  useEffect(() => {
    if (location.state && !location.state.openDemandId) {
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

        // جلب الردود لجميع الطلبات دفعة واحدة (يحل مشكلة N+1)
        let demandsWithResponses = myDemands;
        if (myDemands.length > 0) {
          try {
            // فلترة الـ IDs - التأكد من أنها صحيحة (UUID format)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const demandIds = myDemands
              .map((d) => d.id)
              .filter((id) => {
                if (!id || typeof id !== 'string') return false;
                if (!uuidRegex.test(id)) {
                  console.warn(`⚠️ Skipping invalid demand ID (not UUID): ${id}`);
                  return false;
                }
                return true;
              });

            console.log('📤 Sending batch request for demand IDs:', demandIds);

            // دمج الردود مع كل طلب
            if (demandIds.length > 0) {
              const batchResponses = await demandResponsesAPI.getBatch(demandIds);
              demandsWithResponses = myDemands.map((demand) => ({
                ...demand,
                responses: batchResponses.data[demand.id] || [],
              }));
            } else {
              // إذا لم يكن هناك IDs صالحة، استخدم الطلبات بدون ردود
              demandsWithResponses = myDemands.map((demand) => ({
                ...demand,
                responses: [],
              }));
            }
          } catch (error) {
            console.error('❌ Failed to fetch batch responses:', error);
            if (error.message?.includes('uuid')) {
              console.warn(
                '⚠️ UUID Error detected - some demand IDs may be in wrong format (integer instead of UUID)'
              );
              console.warn('💡 Solution: Clean up old notifications with invalid demand IDs');
            }
            // في حالة الفشل، استخدم الطلبات بدون ردود
            demandsWithResponses = myDemands.map((demand) => ({
              ...demand,
              responses: [],
            }));
          }
        }

        setDemands(demandsWithResponses);
      } else if (activeTab === 'myOffers') {
        // جلب عروضي (للسائقين فقط)
        if (!currentUser?.id) {
          console.error('❌ Cannot fetch offers: User ID is missing');
          setMyOffers([]);
          return;
        }
        console.log('🔍 DEBUG - Calling getMyOffers with userId:', currentUser.id);
        console.log('🔍 DEBUG - userId length:', currentUser.id.length);
        console.log('🔍 DEBUG - userId type:', typeof currentUser.id);
        console.log('🔍 DEBUG - Full currentUser:', currentUser);
        const response = await offersAPI.getMyOffers(currentUser.id);
        const driverOffers = response.offers || [];
        console.log('📦 Fetched my offers:', driverOffers);
        setMyOffers(driverOffers);
      } else {
        const response =
          activeTab === 'received'
            ? await bookingsAPI.getMyOffers() // حجوزات على عروضي
            : await bookingsAPI.getMyBookings(); // حجوزاتي على عروض الآخرين

        // Extract bookings from response.data (API returns { success, message, data: { bookings, ... } })
        const bookingsData = response.data?.bookings || response.bookings || [];
        console.log(`📦 Fetched bookings (${activeTab}):`, bookingsData);

        // 🔍 DEBUG: تفاصيل كل حجز
        if (bookingsData.length > 0) {
          console.log('🔍 DEBUG - Bookings Details:');
          bookingsData.forEach((b, idx) => {
            console.log(`  Booking ${idx + 1}:`, {
              id: b.id?.slice(0, 8),
              status: b.status,
              from: b.offer?.fromCity,
              to: b.offer?.toCity,
              passenger: b.user?.name,
              driver: b.offer?.driver?.name,
            });
          });

          // ملخص الحالات
          const statusCounts = bookingsData.reduce((acc, b) => {
            acc[b.status] = (acc[b.status] || 0) + 1;
            return acc;
          }, {});

          console.log('\n📊 STATUS SUMMARY:');
          console.log(statusCounts);

          const pendingCount = statusCounts.pending || 0;
          if (activeTab === 'received') {
            if (pendingCount > 0) {
              console.log(
                `\n✅ ${pendingCount} pending booking(s) - Accept/Reject buttons will show!`
              );
            } else {
              console.log('\n⚠️ NO PENDING BOOKINGS - Accept/Reject buttons will NOT show!');
              console.log(
                '💡 Tip: Buttons only appear for bookings with status="pending" in "received" tab'
              );
            }
          }
        } else {
          console.log(`⚠️ No bookings found for tab: ${activeTab}`);
          if (activeTab === 'received') {
            console.log('\n💡 To see Accept/Reject buttons:');
            console.log('   1. Create an offer (as driver)');
            console.log('   2. Have someone book your offer (as passenger)');
            console.log('   3. Come back to this "Received Bookings" tab');
          }
        }

        setBookings(bookingsData);
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (bookingId, passengerName) => {
    setConfirmDialog({
      isOpen: true,
      title: 'قبول الحجز',
      message: `هل أنت متأكد من قبول حجز ${passengerName || 'الراكب'}؟`,
      variant: 'success',
      onConfirm: async () => {
        try {
          await bookingsAPI.accept(bookingId);
          showSuccess('✅ تم قبول الحجز بنجاح!');
          fetchBookings();
          fetchPendingCount();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (err) {
          showError(err.message || 'حدث خطأ أثناء قبول الحجز');
          setError(err.message || 'حدث خطأ أثناء قبول الحجز');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      },
    });
  };

  const handleReject = (bookingId, passengerName) => {
    setConfirmDialog({
      isOpen: true,
      title: 'رفض الحجز',
      message: `هل أنت متأكد من رفض حجز ${passengerName || 'الراكب'}؟ لا يمكن التراجع عن هذا الإجراء.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await bookingsAPI.reject(bookingId);
          showSuccess('تم رفض الحجز');
          fetchBookings();
          fetchPendingCount();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (err) {
          showError(err.message || 'حدث خطأ أثناء رفض الحجز');
          setError(err.message || 'حدث خطأ أثناء رفض الحجز');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      },
    });
  };

  const handleCancel = (bookingId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'إلغاء الحجز',
      message: 'هل أنت متأكد من إلغاء هذا الحجز؟ لا يمكن التراجع عن هذا الإجراء.',
      variant: 'warning',
      onConfirm: async () => {
        try {
          await bookingsAPI.cancel(bookingId);
          showSuccess('تم إلغاء الحجز بنجاح');
          fetchBookings();
          fetchPendingCount();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (err) {
          showError(err.message || 'حدث خطأ أثناء إلغاء الحجز');
          setError(err.message || 'حدث خطأ أثناء إلغاء الحجز');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      },
    });
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

    console.log('🔄 Starting demand update...', {
      id: editingDemand.id,
      oldData: editingDemand,
      newData: editForm,
    });

    try {
      const updateData = {
        earliestTime: new Date(editForm.earliestTime).toISOString(),
        latestTime: new Date(editForm.latestTime).toISOString(),
        seats: parseInt(editForm.seats),
        budgetMax: parseFloat(editForm.budgetMax),
      };

      console.log('📤 Sending update to API:', updateData);
      const response = await demandsAPI.update(editingDemand.id, updateData);
      console.log('✅ Update successful:', response);

      // تحديث الـ demand في الـ state مباشرة - التغييرات تظهر فوراً!
      setDemands((prevDemands) =>
        prevDemands.map((demand) =>
          demand.id === editingDemand.id
            ? {
                ...demand,
                earliestTime: updateData.earliestTime,
                latestTime: updateData.latestTime,
                seats: updateData.seats,
                budgetMax: updateData.budgetMax,
              }
            : demand
        )
      );

      showSuccess('✅ تم تحديث الطلب بنجاح!');
      setEditingDemand(null);

      // لا حاجة لـ fetchBookings() - الـ state تم تحديثه مباشرة!
    } catch (err) {
      console.error('❌ Update failed:', err);
      showError(err.message || 'حدث خطأ أثناء تحديث الطلب');
    }
  };

  const handleDeleteDemand = (demandId) => {
    console.log('🔍 Attempting to delete demand with ID:', demandId);
    console.log('🔍 ID type:', typeof demandId);
    console.log('🔍 ID length:', demandId?.length);

    setConfirmDialog({
      isOpen: true,
      title: 'حذف الطلب',
      message:
        'هل أنت متأكد من حذف هذا الطلب؟ سيتم حذف جميع الردود المرتبطة به. لا يمكن التراجع عن هذا الإجراء.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await demandsAPI.delete(demandId);
          console.log('✅ Delete API call successful for:', demandId);

          // تحديث الـ state مباشرة - إزالة الطلب المحذوف من القائمة
          setDemands((prevDemands) => prevDemands.filter((demand) => demand.id !== demandId));

          showSuccess('✅ تم حذف الطلب بنجاح!');

          // تحديث عدد الحجوزات المعلقة
          fetchPendingCount();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (err) {
          console.error('❌ Delete error:', err);
          showError(err.message || 'حدث خطأ أثناء حذف الطلب');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      },
    });
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

    // 🔍 DEBUG: لماذا لا تظهر الأزرار؟
    console.log(`🎯 Render Booking ${booking.id?.slice(0, 8)}:`, {
      activeTab,
      isReceived,
      bookingStatus: booking.status,
      canConfirm,
      willShowButtons: canConfirm,
      reason: !canConfirm
        ? !isReceived
          ? 'Not in received tab'
          : `Status is '${booking.status}' not 'pending'`
        : 'Will show buttons ✅',
    });

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
            <div style={{ direction: 'ltr', unicodeBidi: 'embed' }}>
              📅 {formatDate(booking.offer?.departureTime) || 'غير محدد'}
            </div>
            <div style={{ direction: 'ltr', unicodeBidi: 'embed' }}>
              🕐 {formatTime(booking.offer?.departureTime) || '--:--'}
            </div>
            <div style={{ direction: 'ltr', unicodeBidi: 'embed' }}>
              💺 {formatSeats(booking.offer?.seats) || '--'} مقعد
            </div>
            <div style={{ direction: 'ltr', unicodeBidi: 'embed' }}>
              💰 {formatPrice(booking.totalPrice || booking.offer?.price || 0)} د.ع
            </div>
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
                    onClick={() => handleAccept(booking.id, booking.user?.name)}
                    aria-label={`قبول حجز ${booking.user?.name || 'الراكب'} من ${booking.offer?.fromCity} إلى ${booking.offer?.toCity}`}
                    style={{
                      flex: 1,
                      padding: 'var(--space-3)',
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontFamily: '"Cairo", sans-serif',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    ✅ قبول
                  </button>
                  <button
                    onClick={() => handleReject(booking.id, booking.user?.name)}
                    aria-label={`رفض حجز ${booking.user?.name || 'الراكب'}`}
                    style={{
                      flex: 1,
                      padding: 'var(--space-3)',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontFamily: '"Cairo", sans-serif',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
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
                // Navigate to messages with ride context for proper conversation opening
                const recipientName = isReceived ? booking.user?.name : booking.offer?.driver?.name;
                navigate(`/messages`, {
                  state: {
                    rideType: 'offer',
                    rideId: booking.offer?.id || booking.offerId,
                    driverName: recipientName || (isReceived ? 'الراكب' : 'السائق'),
                    fromCity: booking.offer?.fromCity,
                    toCity: booking.offer?.toCity,
                  },
                });
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
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              💬 مراسلة {isReceived ? 'الراكب' : 'السائق'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Show loading while auth is checking
  if (authLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #10B981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ color: '#64748b', fontFamily: '"Cairo", sans-serif' }}>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not logged in
  if (!currentUser) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          padding: '20px',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            background: 'white',
            padding: '40px',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
          }}
        >
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔐</div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '12px',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            يجب تسجيل الدخول
          </h2>
          <p
            style={{
              color: '#64748b',
              marginBottom: '24px',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            لعرض رحلاتك وحجوزاتك، يرجى تسجيل الدخول أولاً
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

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
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-6)',
            background: 'var(--surface-secondary)',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-1)',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls="bookings-panel"
              aria-label={tab.label}
              aria-disabled={!tab.enabled}
              style={{
                padding: 'var(--space-3)',
                border: !tab.enabled ? '2px dashed var(--border-light)' : 'none',
                borderRadius: 'var(--radius-sm)',
                background: !tab.enabled
                  ? 'var(--surface-secondary)'
                  : activeTab === tab.id
                    ? tab.id === 'received'
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : tab.id === 'myOffers'
                        ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                        : 'var(--surface-primary)'
                    : 'transparent',
                color: !tab.enabled
                  ? 'var(--text-muted)'
                  : activeTab === tab.id
                    ? tab.id === 'received' || tab.id === 'myOffers'
                      ? 'white'
                      : 'var(--text-primary)'
                    : 'var(--text-secondary)',
                fontSize: 'var(--text-sm)',
                fontWeight: activeTab === tab.id ? '700' : '600',
                cursor: tab.enabled ? 'pointer' : 'not-allowed',
                fontFamily: '"Cairo", sans-serif',
                boxShadow: activeTab === tab.id && tab.enabled ? 'var(--shadow-sm)' : 'none',
                opacity: tab.enabled ? 1 : 0.5,
                transition: 'all 0.2s ease',
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
                <span>
                  {tab.icon} {tab.label} {!tab.enabled && '🔒'}
                </span>
                {!tab.enabled && (
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                    {tab.icon === '🚗' ? '(للسائقين)' : '(للركاب)'}
                  </span>
                )}
              </div>
            </button>
          ))}
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
            style={{
              display: 'grid',
              gap: 'var(--space-4)',
              padding: 'var(--space-4)',
            }}
            role="status"
            aria-live="polite"
            aria-label="جاري التحميل"
          >
            <SkeletonLoader variant="Card" />
            <SkeletonLoader variant="Card" />
            <SkeletonLoader variant="Card" />
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
                  id={`demand-${demand.id}`}
                  style={{
                    background:
                      expandedDemandId === demand.id
                        ? 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)'
                        : 'var(--surface-primary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)',
                    marginBottom: 'var(--space-6)',
                    boxShadow:
                      expandedDemandId === demand.id
                        ? '0 10px 25px -5px rgba(59, 130, 246, 0.3)'
                        : 'var(--shadow-md)',
                    border:
                      expandedDemandId === demand.id
                        ? '2px solid #3b82f6'
                        : '1px solid transparent',
                    transition: 'all 0.3s ease',
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
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--space-3)',
                      }}
                    >
                      <h4
                        style={{
                          fontSize: 'var(--text-base)',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          fontFamily: '"Cairo", sans-serif',
                        }}
                      >
                        الردود ({demand.responses?.length || 0})
                      </h4>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                        {expandedDemandId === demand.id && demand.responses?.length > 0 && (
                          <span
                            style={{
                              fontSize: 'var(--text-sm)',
                              color: '#3b82f6',
                              fontWeight: '600',
                              fontFamily: '"Cairo", sans-serif',
                              animation: 'pulse 2s infinite',
                            }}
                          >
                            👇 لديك ردود جديدة
                          </span>
                        )}
                        {demand.responses && demand.responses.length > 0 && (
                          <button
                            onClick={() =>
                              setShowResponsesFor(showResponsesFor === demand.id ? null : demand.id)
                            }
                            style={{
                              padding: 'var(--space-2) var(--space-3)',
                              background:
                                showResponsesFor === demand.id
                                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                  : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: 'var(--radius)',
                              fontSize: 'var(--text-sm)',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontFamily: '"Cairo", sans-serif',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {showResponsesFor === demand.id ? '❌ إخفاء الردود' : '👁️ عرض الردود'}
                          </button>
                        )}
                      </div>
                    </div>
                    {demand.responses &&
                    demand.responses.length > 0 &&
                    showResponsesFor === demand.id ? (
                      <DemandResponsesList
                        responses={demand.responses}
                        isOwner={true}
                        onResponseUpdate={fetchBookings}
                      />
                    ) : demand.responses && demand.responses.length > 0 ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: 'var(--space-4)',
                          background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
                          borderRadius: 'var(--radius)',
                          color: '#1e40af',
                          fontFamily: '"Cairo", sans-serif',
                          fontWeight: '600',
                          border: '2px dashed #3b82f6',
                        }}
                      >
                        👆 اضغط على "عرض الردود" للاطلاع على العروض المقدمة
                      </div>
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
        ) : activeTab === 'myOffers' ? (
          // عرض عروضي (للسائقين)
          myOffers.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-8)',
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)',
                border: '2px solid #3b82f6',
              }}
            >
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🚗</div>
              <p
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: '700',
                  color: '#1e40af',
                  marginBottom: 'var(--space-2)',
                  fontFamily: '"Cairo", sans-serif',
                }}
              >
                لم تقم بنشر أي عروض بعد
              </p>
              <div
                style={{
                  marginTop: 'var(--space-4)',
                  padding: 'var(--space-4)',
                  background: 'white',
                  borderRadius: 'var(--radius)',
                  border: '1px solid #3b82f6',
                }}
              >
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: '#1e40af',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  💡 يمكنك نشر عرض رحلة جديد من الصفحة الرئيسية
                </p>
                <button
                  onClick={() => navigate('/home', { state: { mode: 'offer' } })}
                  style={{
                    marginTop: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-6)',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  🚗 نشر عرض رحلة
                </button>
              </div>
            </div>
          ) : (
            <div>
              {myOffers.map((offer) => (
                <div
                  key={offer.id}
                  style={{
                    background: 'var(--surface-primary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)',
                    marginBottom: 'var(--space-4)',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--border-light)',
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
                      🚗 {offer.fromCity} ← {offer.toCity}
                    </h3>
                    <div
                      style={{
                        padding: 'var(--space-1) var(--space-3)',
                        background:
                          offer.status === 'active'
                            ? '#22c55e'
                            : offer.status === 'completed'
                              ? '#3b82f6'
                              : '#6b7280',
                        color: 'white',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: '700',
                        fontFamily: '"Cairo", sans-serif',
                      }}
                    >
                      {offer.status === 'active'
                        ? 'نشط'
                        : offer.status === 'completed'
                          ? 'مكتمل'
                          : 'غير نشط'}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gap: 'var(--space-2)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      fontFamily: '"Cairo", sans-serif',
                      marginBottom: 'var(--space-3)',
                    }}
                  >
                    <div>📅 {formatDate(offer.departureTime)}</div>
                    <div>🕐 {formatTime(offer.departureTime)}</div>
                    <div>💺 {formatSeats(offer.seats)} مقعد متاح</div>
                    <div>💰 {formatPrice(offer.price)} د.ع / مقعد</div>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                      onClick={() => navigate(`/offers/${offer.id}`)}
                      style={{
                        flex: 1,
                        padding: 'var(--space-3)',
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
                      👁️ عرض التفاصيل
                    </button>
                    <button
                      onClick={() => setActiveTab('received')}
                      style={{
                        flex: 1,
                        padding: 'var(--space-3)',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: '"Cairo", sans-serif',
                      }}
                    >
                      📥 الحجوزات الواردة
                    </button>
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
                  htmlFor="edit-earliest-time"
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
                  id="edit-earliest-time"
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
                  htmlFor="edit-latest-time"
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
                  id="edit-latest-time"
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmText="تأكيد"
        cancelText="إلغاء"
      />
    </div>
  );
}
