import React, { useMemo, useState } from 'react';
import { useDemands } from '../../context/DemandsContext';
import { useRatings } from '../../context/RatingContext';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../context/MessagesContext';
import { useBookings } from '../../context/BookingContext';
import RatingModal from '../../components/RatingModal';
import RatingDisplay from '../../components/RatingDisplay';
import { ListSkeleton, EmptyDemandsState } from '../../components/Skeleton';
import AuthModal from '../../components/Auth/AuthModal';
import ChatModal from '../../components/Chat/ChatModal';
import BookingModal from '../../components/BookingModal';

export default function ViewDemands() {
  const { demands, clearDemands } = useDemands();
  const { addRating } = useRatings();
  const { user, isAuthenticated } = useAuth();
  const { getUnreadCount } = useMessages();
  const { getUserBookings } = useBookings();
  const [gov, setGov] = useState('');
  const [area, setArea] = useState('');
  const [date, setDate] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedChatDemand, setSelectedChatDemand] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBookingDemand, setSelectedBookingDemand] = useState(null);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [carModel, setCarModel] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [errors, setErrors] = useState({});
  
  // Rating modal states
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingDemand, setRatingDemand] = useState(null);
  const [currentUserId] = useState('current_user'); // سيتم ربطه بنظام المستخدمين لاحقاً
  const [isLoading, setIsLoading] = useState(false);

  // محاكاة التحميل (لاحقاً سيتم ربطه بقاعدة البيانات)
  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  // تشغيل التحميل عند تغيير الفلاتر
  React.useEffect(() => {
    if (gov || area || date || maxPrice) {
      simulateLoading();
    }
  }, [gov, area, date, maxPrice]);

  // دالة للانتقال إلى صفحة إضافة طلب مقعد
  const handleAddDemand = () => {
    window.location.href = '/post-demand';
  };

  const governorates = useMemo(() => {
    const set = new Set();
    demands.forEach((r) => {
      const g = (r.from || '').split(' - ')[0];
      if (g) set.add(g);
    });
    return Array.from(set);
  }, [demands]);

  const areas = useMemo(() => {
    if (!gov) return [];
    const set = new Set();
    demands.forEach((r) => {
      const [g, a] = (r.from || '').split(' - ');
      if (g === gov && a) set.add(a);
    });
    return Array.from(set);
  }, [demands, gov]);

  const filtered = useMemo(() => {
    return demands.filter((r) => {
      const matchesGov = gov ? (r.from || '').startsWith(gov) : true;
      const matchesArea = area ? (r.from || '').includes(` - ${area}`) : true;
      const matchesDate = date ? new Date(r.date).toISOString().slice(0,10) === date : true;
      const matchesPrice = maxPrice ? Number(r.maxPrice) <= Number(maxPrice) : true;
      return matchesGov && matchesArea && matchesDate && matchesPrice;
    });
  }, [demands, gov, area, date, maxPrice]);

  // معالجة التقييم
  const handleRating = (ratingData) => {
    const ratingInfo = {
      tripId: ratingDemand.id,
      ratedUserId: ratingDemand.passengerPhone, // استخدام رقم الهاتف كمعرف مؤقت
      raterUserId: currentUserId,
      rating: ratingData.rating,
      comment: ratingData.comment,
      userType: 'passenger'
    };

    addRating(ratingInfo);
    alert('تم إرسال التقييم بنجاح! شكراً لك');
  };

  // معالجة إرسال الرسائل
  const handleSendMessage = (demand) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    // Create a mock passenger ID for the demand
    const passengerId = `passenger_${demand.id}`;
    
    setSelectedChatDemand({
      tripId: `trip_${demand.id}`,
      otherUserId: passengerId,
      otherUserName: demand.passengerName,
      tripInfo: {
        from: demand.pickupLocation,
        to: demand.dropLocation,
        date: demand.date,
        time: demand.time
      }
    });
    setShowChatModal(true);
  };

  const handleBooking = (demand) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    setSelectedBookingDemand(demand);
    setShowBookingModal(true);
  };

  const handleBookingCreated = (booking) => {
    console.log('Booking created:', booking);
    // You can add additional logic here, like showing a success message
  };

  // فتح نافذة التقييم
  const openRatingModal = (demand) => {
    setRatingDemand(demand);
    setShowRatingModal(true);
  };

  if (!demands.length) {
    return <div style={{ padding: '2rem' }}>لا توجد طلبات بعد. يمكنك إضافة طلب من صفحة "طلب مقعد".</div>;
  }

  return (
    <div style={{ 
      maxWidth: 900, 
      margin: '1rem auto', 
      padding: '0 16px',
      background: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '20px 0 16px 0',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '20px'
      }}>
        <h2 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '24px',
          fontWeight: '700',
          color: '#1f2937',
          textAlign: 'center'
        }}>
          📋 طلبات المقاعد
        </h2>
        <p style={{ 
          margin: '0',
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          للسائقين - تصفح الطلبات المتاحة
        </p>
      </div>

      {/* Filters */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
        padding: '20px', 
        borderRadius: '12px', 
        border: '1px solid #22c55e',
        marginBottom: '20px'
      }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '16px',
          fontWeight: '600',
          color: '#15803d',
          textAlign: 'center'
        }}>
          🔍 فلترة الطلبات
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontSize: '14px',
              fontWeight: '600',
              color: '#15803d'
            }}>
              المحافظة
            </label>
            <select 
              value={gov} 
              onChange={(e) => { setGov(e.target.value); setArea(''); }}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #22c55e',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white'
              }}
            >
              <option value="">كل المحافظات</option>
              {governorates.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontSize: '14px',
              fontWeight: '600',
              color: '#15803d'
            }}>
              المنطقة
            </label>
            <select 
              value={area} 
              onChange={(e) => setArea(e.target.value)} 
              disabled={!gov}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #22c55e',
                borderRadius: '8px',
                fontSize: '14px',
                background: gov ? 'white' : '#f9fafb'
              }}
            >
              <option value="">كل المناطق</option>
              {areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontSize: '14px',
              fontWeight: '600',
              color: '#15803d'
            }}>
              التاريخ
            </label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #22c55e',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white'
              }}
            />
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontSize: '14px',
              fontWeight: '600',
              color: '#15803d'
            }}>
              السعر الأقصى
            </label>
            <input 
              type="number" 
              placeholder="مثال: 20000" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #22c55e',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white'
              }}
            />
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <button 
            onClick={clearDemands}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            مسح الكل (اختبار)
          </button>
        </div>
      </div>

      {/* Demands List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {isLoading ? (
          <ListSkeleton count={3} />
        ) : filtered.length === 0 ? (
          <EmptyDemandsState onAddDemand={handleAddDemand} />
        ) : (
          filtered.map((r) => {
          const formattedDate = (() => {
            try { return new Intl.DateTimeFormat('ar-IQ', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(r.date)); } catch { return r.date; }
          })();
          const formattedPrice = (() => {
            try { return new Intl.NumberFormat('ar-IQ', { style: 'currency', currency: 'IQD', maximumFractionDigits: 0 }).format(r.maxPrice); } catch { return `${r.maxPrice} IQD`; }
          })();
          
          return (
            <div
              key={r.id}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.transform = 'translateY(-4px)'; 
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)'; 
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.transform = 'translateY(0)'; 
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)'; 
              }}
            >
              {/* Route Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '700', 
                  color: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ 
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    👤
                  </span>
                  {r.from}
                  <span style={{ margin: '0 8px', color: '#9CA3AF', fontSize: '16px' }}>→</span>
                  {r.to}
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
                }}>
                  💰 أقصى سعر: {formattedPrice}
                  <span style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    padding: '2px 8px', 
                    borderRadius: '10px',
                    fontSize: '11px'
                  }}>
                    {r.negotiable ? 'قابل للتفاوض' : 'ثابت'}
                  </span>
                </div>
              </div>

              {/* Passenger Info */}
              <div style={{ 
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #22c55e',
                marginBottom: '16px'
              }}>
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  👤 معلومات الراكب
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '12px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <div>
                    <strong style={{ color: '#15803d' }}>الاسم:</strong> {r.passengerName}
                  </div>
                  <div>
                    <strong style={{ color: '#15803d' }}>الهاتف:</strong> {r.passengerPhone}
                  </div>
                  <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                    <strong style={{ color: '#15803d' }}>التقييم:</strong>
                    <div style={{ marginTop: '4px' }}>
                      <RatingDisplay 
                        userId={r.passengerPhone} 
                        userType="passenger" 
                        size="small"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f3f4f6',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    color: '#374151'
                  }}>
                    🕒 {formattedDate}
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    💺 {r.seats} مقعد مطلوب
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ 
                display: 'flex', 
                gap: '12px',
                justifyContent: 'flex-end',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => openRatingModal(r)}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  ⭐ تقييم الراكب
                </button>
                
                <button
                  onClick={() => handleSendMessage(r)}
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(34, 197, 94, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(34, 197, 94, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(34, 197, 94, 0.3)';
                  }}
                >
                  💬 إرسال رسالة
                </button>
                
                <button
                  onClick={() => handleBooking(r)}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  🎫 احجز الرحلة
                </button>
                <button
                  onClick={() => { setSelectedDemand(r); setShowModal(true); setErrors({}); }}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(245, 158, 11, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(245, 158, 11, 0.3)';
                  }}
                >
                  🚗 تقديم عرض للسائق
                </button>
              </div>
            </div>
          );
        })
      )}
      </div>

      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{ background: '#fff', borderRadius: 12, padding: 16, width: 'min(520px, 92vw)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>تقديم عرض للسائق</h3>
            {selectedDemand ? (
              <div style={{ marginBottom: 12, color: '#374151' }}>
                <strong>{selectedDemand.from}</strong>
                <span style={{ margin: '0 6px', color: '#9CA3AF' }}>→</span>
                <strong>{selectedDemand.to}</strong>
                <div style={{ fontSize: 14, marginTop: 4 }}>
                  <strong>الراكب:</strong> {selectedDemand.passengerName} | <strong>أقصى سعر:</strong> {selectedDemand.maxPrice} دينار
                </div>
              </div>
            ) : null}
            <div style={{ display: 'grid', gap: 10 }}>
              <div>
                <input
                  placeholder="اسم السائق"
                  value={driverName}
                  onChange={(e) => { setDriverName(e.target.value); if (errors.driverName) setErrors((p) => ({ ...p, driverName: undefined })); }}
                  aria-invalid={!!errors.driverName}
                />
                {errors.driverName ? <div style={{ color: 'crimson', fontSize: 12 }}>{errors.driverName}</div> : null}
              </div>
              <div>
                <input
                  placeholder="رقم الهاتف"
                  inputMode="tel"
                  value={driverPhone}
                  onChange={(e) => { setDriverPhone(e.target.value); if (errors.driverPhone) setErrors((p) => ({ ...p, driverPhone: undefined })); }}
                  aria-invalid={!!errors.driverPhone}
                />
                {errors.driverPhone ? <div style={{ color: 'crimson', fontSize: 12 }}>{errors.driverPhone}</div> : null}
              </div>
              <div>
                <input
                  placeholder="نوع السيارة"
                  value={carModel}
                  onChange={(e) => { setCarModel(e.target.value); if (errors.carModel) setErrors((p) => ({ ...p, carModel: undefined })); }}
                  aria-invalid={!!errors.carModel}
                />
                {errors.carModel ? <div style={{ color: 'crimson', fontSize: 12 }}>{errors.carModel}</div> : null}
              </div>
              <div>
                <input
                  placeholder="السعر المقترح (دينار)"
                  type="number"
                  min={250}
                  step={250}
                  value={offerPrice}
                  onChange={(e) => { setOfferPrice(e.target.value); if (errors.offerPrice) setErrors((p) => ({ ...p, offerPrice: undefined })); }}
                  aria-invalid={!!errors.offerPrice}
                />
                {errors.offerPrice ? <div style={{ color: 'crimson', fontSize: 12 }}>{errors.offerPrice}</div> : null}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button onClick={() => setShowModal(false)} style={{ background: '#e5e7eb', color: '#111827' }}>إلغاء</button>
              <button
                onClick={() => {
                  const newErrors = {};
                  if (!driverName.trim()) newErrors.driverName = 'اسم السائق مطلوب';
                  if (!driverPhone.trim() || driverPhone.trim().length < 7) newErrors.driverPhone = 'رقم هاتف غير صالح';
                  if (!carModel.trim()) newErrors.carModel = 'نوع السيارة مطلوب';
                  const price = Number(offerPrice);
                  if (!offerPrice || Number.isNaN(price) || price <= 0) newErrors.offerPrice = 'سعر غير صالح';
                  if (selectedDemand && price > selectedDemand.maxPrice) newErrors.offerPrice = 'السعر أعلى من الحد الأقصى المطلوب';
                  setErrors(newErrors);
                  if (Object.keys(newErrors).length) return;
                  alert('تم إرسال العرض للراكب (تجريبي)');
                  setShowModal(false);
                  setDriverName('');
                  setDriverPhone('');
                  setCarModel('');
                  setOfferPrice('');
                }}
              >
                إرسال العرض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRating}
        ratedUserName={ratingDemand?.passengerName || ''}
        userType="passenger"
        tripInfo={ratingDemand ? {
          from: ratingDemand.from,
          to: ratingDemand.to,
          date: ratingDemand.date
        } : null}
      />
      
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
      
      {/* Chat Modal */}
      {showChatModal && selectedChatDemand && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => {
            setShowChatModal(false);
            setSelectedChatDemand(null);
          }}
          tripId={selectedChatDemand.tripId}
          otherUserId={selectedChatDemand.otherUserId}
          otherUserName={selectedChatDemand.otherUserName}
          tripInfo={selectedChatDemand.tripInfo}
        />
      )}
      
      {/* Booking Modal */}
      {showBookingModal && selectedBookingDemand && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedBookingDemand(null);
          }}
          tripType="demand"
          tripData={selectedBookingDemand}
          onBookingCreated={handleBookingCreated}
        />
      )}
    </div>
  );
}
