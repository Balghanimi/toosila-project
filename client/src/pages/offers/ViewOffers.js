import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { offersAPI, demandsAPI, bookingsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function ViewOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAnimated, setIsAnimated] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [bookingMessage, setBookingMessage] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    fromCity: '',
    toCity: '',
    departureDate: '',
    minPrice: '',
    maxPrice: '',
    minSeats: '',
    sortBy: 'date' // date, price, rating
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const { currentUser, user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if user is a driver
  const isDriver = user?.isDriver || currentUser?.isDriver || false;

  useEffect(() => {
    setIsAnimated(true);

    // استقبال معايير البحث من Home
    if (location.state) {
      const searchParams = location.state;
      setFilters(prev => ({
        ...prev,
        fromCity: searchParams.fromCity || '',
        toCity: searchParams.toCity || '',
        departureDate: searchParams.departureDate || ''
      }));
      fetchOffers(searchParams);
    } else {
      fetchOffers();
    }
    // eslint-disable-next-line
  }, [location.state]);

  const fetchOffers = async (filterParams = {}) => {
    setLoading(true);
    setError('');

    try {
      // Add page and limit to params
      filterParams.page = 1;
      filterParams.limit = 20;

      let response;
      // If user is a driver, show demands (passenger requests)
      // If user is a passenger, show offers (driver offers)
      if (isDriver) {
        response = await demandsAPI.getAll(filterParams);
        setOffers(response.demands || []);
      } else {
        response = await offersAPI.getAll(filterParams);
        setOffers(response.offers || []);
      }

      // Save pagination data
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
      setPage(1);
    } catch (err) {
      console.error('Error fetching offers/demands:', err);
      setError(isDriver ? 'حدث خطأ أثناء تحميل الطلبات' : 'حدث خطأ أثناء تحميل العروض');
    } finally {
      setLoading(false);
    }
  };

  // Load More function
  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return;

    setLoadingMore(true);
    try {
      const filterParams = {};
      if (filters.fromCity) filterParams.fromCity = filters.fromCity;
      if (filters.toCity) filterParams.toCity = filters.toCity;
      if (filters.departureDate) filterParams.departureDate = filters.departureDate;
      if (filters.minPrice) filterParams.minPrice = filters.minPrice;
      if (filters.maxPrice) filterParams.maxPrice = filters.maxPrice;
      if (filters.minSeats) filterParams.minSeats = filters.minSeats;
      if (filters.sortBy) filterParams.sortBy = filters.sortBy;

      filterParams.page = page + 1;
      filterParams.limit = 20;

      let response;
      if (isDriver) {
        response = await demandsAPI.getAll(filterParams);
        setOffers(prev => [...prev, ...(response.demands || [])]);
      } else {
        response = await offersAPI.getAll(filterParams);
        setOffers(prev => [...prev, ...(response.offers || [])]);
      }

      setPage(page + 1);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error('Error loading more:', err);
      showError('فشل تحميل المزيد');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleFilter = () => {
    const filterParams = {};
    if (filters.fromCity) filterParams.fromCity = filters.fromCity;
    if (filters.toCity) filterParams.toCity = filters.toCity;
    if (filters.departureDate) filterParams.departureDate = filters.departureDate;
    if (filters.minPrice) filterParams.minPrice = filters.minPrice;
    if (filters.maxPrice) filterParams.maxPrice = filters.maxPrice;
    if (filters.minSeats) filterParams.minSeats = filters.minSeats;
    if (filters.sortBy) filterParams.sortBy = filters.sortBy;

    fetchOffers(filterParams);
  };

  const handleClearFilters = () => {
    // العودة للصفحة الرئيسية عند مسح الفلتر
    navigate('/');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) return 'غير محدد';

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateOnly = date.toISOString().split('T')[0];
    const todayOnly = today.toISOString().split('T')[0];
    const tomorrowOnly = tomorrow.toISOString().split('T')[0];

    if (dateOnly === todayOnly) return 'اليوم';
    if (dateOnly === tomorrowOnly) return 'غداً';

    return date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '--:--';

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) return '--:--';

    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBookNow = (offer) => {
    if (!currentUser) {
      showError('⚠️ يجب تسجيل الدخول أولاً للحجز');
      // Scroll to top to show login button
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentUser.isDriver) {
      showError('⚠️ لا يمكن للسائقين حجز رحلات. هذا الحساب مسجل كسائق');
      return;
    }

    setSelectedOffer(offer);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedOffer) return;

    console.log('Selected Offer:', selectedOffer);
    console.log('Offer ID:', selectedOffer.id);

    // Make sure we have a valid offerId
    const offerId = selectedOffer.id || selectedOffer.offerId;

    if (!offerId) {
      showError('خطأ: معرّف العرض غير موجود');
      return;
    }

    // Validate offerId - can be either integer or UUID string
    // If it's a UUID (contains hyphens), keep it as string
    // If it's a number string, convert to integer
    let validOfferId;
    if (typeof offerId === 'string' && offerId.includes('-')) {
      // It's a UUID - keep as string
      validOfferId = offerId;
    } else {
      // Try to convert to integer
      validOfferId = parseInt(offerId, 10);
      if (isNaN(validOfferId) || validOfferId < 1) {
        showError('خطأ: معرّف العرض غير صالح');
        console.error('Invalid offerId:', offerId);
        return;
      }
    }

    console.log('Valid Offer ID to send:', validOfferId);

    try {
      await bookingsAPI.create({
        offerId: validOfferId,
        message: bookingMessage,
        seats: 1 // يمكن تحسينه لاحقاً لاختيار عدد المقاعد
      });

      setShowBookingModal(false);
      setBookingMessage('');
      setSelectedOffer(null);
      showSuccess('✅ تم إرسال طلب الحجز بنجاح! يمكنك متابعة حالته من صفحة الحجوزات');
      navigate('/bookings');
    } catch (err) {
      showError(err.message || 'حدث خطأ أثناء الحجز');
    }
  };

  const IRAQ_CITIES = [
    'بغداد - الكرخ', 'بغداد - الرصافة', 'بغداد - الكرادة',
    'البصرة - المركز', 'أربيل - المركز', 'الموصل - المركز',
    'كربلاء - المركز', 'النجف - المركز', 'السليمانية - المركز'
  ];

  return (
    <div className="offers-page-background" style={{
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 50%, rgba(52, 199, 89, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(52, 199, 89, 0.04) 0%, transparent 50%),
        radial-gradient(circle at 40% 20%, rgba(52, 199, 89, 0.03) 0%, transparent 40%),
        linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)
      `,
      paddingBottom: '100px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative geometric shapes */}
      <div className="blur-circle-1" style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(52, 199, 89, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div className="blur-circle-2" style={{
        position: 'absolute',
        bottom: '20%',
        left: '10%',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(52, 199, 89, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(50px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Subtle dot pattern overlay */}
      <div className="dot-pattern" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `radial-gradient(circle, rgba(52, 199, 89, 0.08) 1px, transparent 1px)`,
        backgroundSize: '30px 30px',
        opacity: 0.3,
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div className="container" style={{
        paddingTop: 'var(--space-6)',
        transform: isAnimated ? 'translateY(0)' : 'translateY(20px)',
        opacity: isAnimated ? 1 : 0,
        transition: 'all 0.6s ease',
        position: 'relative',
        zIndex: 1
      }}>

        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--space-6)'
        }}>
          <h1 style={{
            fontSize: 'var(--text-3xl)',
            fontWeight: '800',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-2)',
            fontFamily: '"Cairo", sans-serif'
          }}>
            {isDriver ? '📋 طلبات الركاب' : '🚗 العروض المتاحة'}
          </h1>
          <p style={{
            color: 'var(--text-primary)',
            fontSize: 'var(--text-lg)',
            fontFamily: '"Cairo", sans-serif',
            fontWeight: '600'
          }}>
            {isDriver ? 'ابحث عن ركاب يحتاجون رحلة' : 'ابحث عن رحلتك المثالية'}
          </p>
        </div>

        {/* Filters */}
        <div style={{
          background: 'var(--surface-primary)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-6)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-light)',
          overflow: 'visible'
        }}>
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: '600',
            marginBottom: 'var(--space-4)',
            fontFamily: '"Cairo", sans-serif',
            color: 'var(--text-primary)'
          }}>
            🔍 البحث والتصفية
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-4)'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                marginBottom: 'var(--space-2)',
                fontFamily: '"Cairo", sans-serif',
                color: 'var(--text-secondary)'
              }}>
                من
              </label>
              <select
                value={filters.fromCity}
                onChange={(e) => setFilters({...filters, fromCity: e.target.value})}
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--text-base)',
                  fontFamily: '"Cairo", sans-serif',
                  background: 'var(--surface-primary)',
                  textAlign: 'center',
                  textAlignLast: 'center',
                  direction: 'rtl',
                  paddingLeft: 'var(--space-3)',
                  paddingRight: 'var(--space-3)',
                  position: 'relative',
                  zIndex: 10
                }}
              >
                <option value="">جميع المدن</option>
                {IRAQ_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                marginBottom: 'var(--space-2)',
                fontFamily: '"Cairo", sans-serif',
                color: 'var(--text-secondary)'
              }}>
                إلى
              </label>
              <select
                value={filters.toCity}
                onChange={(e) => setFilters({...filters, toCity: e.target.value})}
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--text-base)',
                  fontFamily: '"Cairo", sans-serif',
                  background: 'var(--surface-primary)',
                  textAlign: 'center',
                  textAlignLast: 'center',
                  direction: 'rtl',
                  paddingLeft: 'var(--space-3)',
                  paddingRight: 'var(--space-3)',
                  position: 'relative',
                  zIndex: 10
                }}
              >
                <option value="">جميع المدن</option>
                {IRAQ_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                marginBottom: 'var(--space-2)',
                fontFamily: '"Cairo", sans-serif',
                color: 'var(--text-secondary)'
              }}>
                التاريخ
              </label>
              <input
                type="date"
                value={filters.departureDate}
                onChange={(e) => setFilters({...filters, departureDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--text-base)',
                  fontFamily: '"Cairo", sans-serif',
                  background: 'var(--surface-primary)',
                  textAlign: 'center',
                  direction: 'rtl',
                  paddingLeft: 'var(--space-3)',
                  paddingRight: 'var(--space-3)'
                }}
              />
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{
              width: '100%',
              padding: 'var(--space-2)',
              background: 'transparent',
              color: 'var(--primary)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--text-sm)',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: '"Cairo", sans-serif',
              marginBottom: 'var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)'
            }}
          >
            {showAdvancedFilters ? '🔼' : '🔽'} فلاتر متقدمة
          </button>

          {/* Advanced Filters Section */}
          {showAdvancedFilters && (
            <div style={{
              padding: 'var(--space-4)',
              background: 'var(--surface-secondary)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 'var(--space-4)',
              border: '2px dashed var(--border-light)'
            }}>
              <h4 style={{
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                marginBottom: 'var(--space-3)',
                fontFamily: '"Cairo", sans-serif',
                color: 'var(--text-primary)'
              }}>
                🎛️ خيارات إضافية
              </h4>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-3)'
              }}>
                {/* Min Price */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    marginBottom: 'var(--space-2)',
                    fontFamily: '"Cairo", sans-serif',
                    color: 'var(--text-secondary)'
                  }}>
                    💰 السعر الأدنى
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                    placeholder="0"
                    min="0"
                    style={{
                      width: '100%',
                      padding: 'var(--space-2)',
                      border: '2px solid var(--border-light)',
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-sm)',
                      fontFamily: '"Cairo", sans-serif',
                      background: 'var(--surface-primary)',
                      textAlign: 'center'
                    }}
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    marginBottom: 'var(--space-2)',
                    fontFamily: '"Cairo", sans-serif',
                    color: 'var(--text-secondary)'
                  }}>
                    💰 السعر الأعلى
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                    placeholder="∞"
                    min="0"
                    style={{
                      width: '100%',
                      padding: 'var(--space-2)',
                      border: '2px solid var(--border-light)',
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-sm)',
                      fontFamily: '"Cairo", sans-serif',
                      background: 'var(--surface-primary)',
                      textAlign: 'center'
                    }}
                  />
                </div>

                {/* Min Seats */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    marginBottom: 'var(--space-2)',
                    fontFamily: '"Cairo", sans-serif',
                    color: 'var(--text-secondary)'
                  }}>
                    🪑 الحد الأدنى للمقاعد
                  </label>
                  <input
                    type="number"
                    value={filters.minSeats}
                    onChange={(e) => setFilters({...filters, minSeats: e.target.value})}
                    placeholder="1"
                    min="1"
                    max="7"
                    style={{
                      width: '100%',
                      padding: 'var(--space-2)',
                      border: '2px solid var(--border-light)',
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-sm)',
                      fontFamily: '"Cairo", sans-serif',
                      background: 'var(--surface-primary)',
                      textAlign: 'center'
                    }}
                  />
                </div>

                {/* Sort By */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    marginBottom: 'var(--space-2)',
                    fontFamily: '"Cairo", sans-serif',
                    color: 'var(--text-secondary)'
                  }}>
                    🔀 ترتيب حسب
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                    style={{
                      width: '100%',
                      padding: 'var(--space-2)',
                      border: '2px solid var(--border-light)',
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-sm)',
                      fontFamily: '"Cairo", sans-serif',
                      background: 'var(--surface-primary)',
                      textAlign: 'center',
                      textAlignLast: 'center'
                    }}
                  >
                    <option value="date">التاريخ (الأقرب أولاً)</option>
                    <option value="price_asc">السعر (الأرخص أولاً)</option>
                    <option value="price_desc">السعر (الأغلى أولاً)</option>
                    <option value="rating">التقييم (الأعلى أولاً)</option>
                    <option value="seats">المقاعد (الأكثر أولاً)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              onClick={handleFilter}
              style={{
                flex: 1,
                padding: 'var(--space-3)',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: '"Cairo", sans-serif',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              🔍 بحث
            </button>
            <button
              onClick={handleClearFilters}
              style={{
                flex: 1,
                padding: 'var(--space-3)',
                background: 'var(--surface-secondary)',
                color: 'var(--text-primary)',
                border: '2px solid var(--border-light)',
                borderRadius: 'var(--radius)',
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: '"Cairo", sans-serif'
              }}
            >
              ✖️ مسح الفلاتر
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fee',
            border: '2px solid #f88',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
            color: '#c00',
            fontFamily: '"Cairo", sans-serif'
          }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-8)',
            color: 'var(--text-secondary)',
            fontFamily: '"Cairo", sans-serif'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid var(--border-light)',
              borderTop: '4px solid var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto var(--space-4) auto'
            }} />
            جاري التحميل...
          </div>
        )}

        {/* Offers List */}
        {!loading && offers.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-8)',
            background: 'var(--surface-primary)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>
              {isDriver ? '📋' : '🚗'}
            </div>
            <h3 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              marginBottom: 'var(--space-2)',
              fontFamily: '"Cairo", sans-serif',
              color: 'var(--text-primary)'
            }}>
              {isDriver ? 'لا توجد طلبات متاحة' : 'لا توجد عروض متاحة'}
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontFamily: '"Cairo", sans-serif',
              marginBottom: 'var(--space-4)'
            }}>
              {isDriver ? 'لم نعثر على طلبات تطابق بحثك' : 'لم نعثر على رحلات تطابق بحثك'}
            </p>
            {currentUser && currentUser.isDriver && (
              <button
                onClick={() => navigate('/post-offer')}
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-base)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: '"Cairo", sans-serif'
                }}
              >
                ➕ انشر رحلتك الآن
              </button>
            )}
          </div>
        )}

        {!loading && offers.length > 0 && (
          <div style={{
            display: 'grid',
            gap: 'var(--space-4)'
          }}>
            {offers.map((offer) => (
              <div
                key={offer.id}
                style={{
                  background: 'var(--surface-primary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-5)',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--border-light)',
                  transition: 'var(--transition)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: 'var(--space-4)'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: '700',
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--space-2)',
                      fontFamily: '"Cairo", sans-serif'
                    }}>
                      {offer.fromCity} ← {offer.toCity}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: 'var(--space-4)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      fontFamily: '"Cairo", sans-serif'
                    }}>
                      <span>📅 {formatDate(offer.departureTime)}</span>
                      <span>🕐 {formatTime(offer.departureTime)}</span>
                      <span>💺 {offer.seats} مقعد</span>
                    </div>
                  </div>

                  <div style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: '800',
                    color: 'var(--primary)',
                    fontFamily: '"Cairo", sans-serif'
                  }}>
                    {offer.price ? Number(offer.price).toLocaleString() : '0'} د.ع
                  </div>
                </div>

                <div style={{
                  padding: 'var(--space-3)',
                  background: 'var(--surface-secondary)',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  fontFamily: '"Cairo", sans-serif',
                  marginBottom: 'var(--space-3)'
                }}>
                  👤 السائق: {offer.name || 'غير متوفر'}
                </div>

                {/* Book Now Button */}
                {currentUser && !currentUser.isDriver && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookNow(offer);
                    }}
                    style={{
                      width: '100%',
                      padding: 'var(--space-3)',
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontFamily: '"Cairo", sans-serif',
                      boxShadow: 'var(--shadow-md)',
                      transition: 'var(--transition)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = 'var(--shadow-lg)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'var(--shadow-md)';
                    }}
                  >
                    🎫 احجز الآن
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination Info and Load More Button */}
        {!loading && offers.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-4)',
            marginTop: 'var(--space-6)',
            padding: 'var(--space-4)',
            background: 'var(--surface-primary)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-light)'
          }}>
            <p style={{
              fontSize: 'var(--text-base)',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              fontFamily: '"Cairo", sans-serif',
              margin: 0
            }}>
              عرض {offers.length} من {total} نتيجة
            </p>

            {page < totalPages && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background: loadingMore
                    ? 'var(--surface-secondary)'
                    : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                  color: loadingMore ? 'var(--text-secondary)' : 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-base)',
                  fontWeight: '600',
                  cursor: loadingMore ? 'not-allowed' : 'pointer',
                  fontFamily: '"Cairo", sans-serif',
                  boxShadow: loadingMore ? 'none' : 'var(--shadow-md)',
                  transition: 'var(--transition)',
                  opacity: loadingMore ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loadingMore) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = 'var(--shadow-lg)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loadingMore) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'var(--shadow-md)';
                  }
                }}
              >
                {loadingMore ? '⏳ جاري التحميل...' : '📥 تحميل المزيد'}
              </button>
            )}
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && selectedOffer && (
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
              zIndex: 1000,
              padding: 'var(--space-4)',
              overflowY: 'auto'
            }}
            onClick={() => setShowBookingModal(false)}
          >
            <div
              style={{
                background: 'var(--surface-primary)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-6)',
                maxWidth: '500px',
                width: '100%',
                boxShadow: 'var(--shadow-xl)',
                margin: 'auto',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: '800',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-4)',
                  fontFamily: '"Cairo", sans-serif',
                  textAlign: 'center'
                }}
              >
                🎫 تأكيد الحجز
              </h2>

              {/* Driver Information */}
              {selectedOffer.name && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)',
                    marginBottom: 'var(--space-4)',
                    color: 'white',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  <div
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      marginBottom: 'var(--space-2)',
                      fontFamily: '"Cairo", sans-serif',
                      opacity: 0.9
                    }}
                  >
                    معلومات السائق
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 'var(--space-1)'
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: '700',
                        fontFamily: '"Cairo", sans-serif'
                      }}
                    >
                      👤 {selectedOffer.name}
                    </div>
                    {selectedOffer.ratingAvg && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-1)',
                          fontSize: 'var(--text-base)',
                          fontWeight: '600',
                          fontFamily: '"Cairo", sans-serif'
                        }}
                      >
                        ⭐ {Number(selectedOffer.ratingAvg).toFixed(1)}
                        {selectedOffer.ratingCount && (
                          <span style={{ fontSize: 'var(--text-sm)', opacity: 0.9 }}>
                            ({selectedOffer.ratingCount})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Trip Details */}
              <div
                style={{
                  background: 'var(--surface-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  marginBottom: 'var(--space-4)'
                }}
              >
                <div
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: '700',
                    marginBottom: 'var(--space-2)',
                    fontFamily: '"Cairo", sans-serif'
                  }}
                >
                  {selectedOffer.fromCity} ← {selectedOffer.toCity}
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    fontFamily: '"Cairo", sans-serif',
                    marginBottom: 'var(--space-1)'
                  }}
                >
                  📅 {formatDate(selectedOffer.departureTime)} - 🕐 {formatTime(selectedOffer.departureTime)}
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    fontFamily: '"Cairo", sans-serif',
                    marginBottom: 'var(--space-2)'
                  }}
                >
                  💺 {selectedOffer.seats} مقعد متاح
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: '800',
                    color: 'var(--primary)',
                    fontFamily: '"Cairo", sans-serif'
                  }}
                >
                  💰 {selectedOffer.price ? Number(selectedOffer.price).toLocaleString() : '0'} د.ع
                </div>
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    marginBottom: 'var(--space-2)',
                    fontFamily: '"Cairo", sans-serif',
                    color: 'var(--text-secondary)'
                  }}
                >
                  رسالة للسائق (اختياري)
                </label>
                <textarea
                  value={bookingMessage}
                  onChange={(e) => setBookingMessage(e.target.value)}
                  placeholder="مثال: مرحباً، أود الحجز من موقع محدد..."
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: 'var(--space-3)',
                    border: '2px solid var(--border-light)',
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--text-base)',
                    fontFamily: '"Cairo", sans-serif',
                    resize: 'vertical',
                    textAlign: 'center'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setBookingMessage('');
                    setSelectedOffer(null);
                  }}
                  style={{
                    flex: 1,
                    padding: 'var(--space-3)',
                    background: 'var(--surface-secondary)',
                    color: 'var(--text-primary)',
                    border: '2px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--text-base)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: '"Cairo", sans-serif'
                  }}
                >
                  إلغاء
                </button>
                <button
                  onClick={handleConfirmBooking}
                  style={{
                    flex: 1,
                    padding: 'var(--space-3)',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--text-base)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontFamily: '"Cairo", sans-serif',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  ✅ تأكيد الحجز
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Dark mode background adjustments */
        body.dark-mode .offers-page-background {
          background:
            radial-gradient(circle at 20% 50%, rgba(52, 199, 89, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(52, 199, 89, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(52, 199, 89, 0.05) 0%, transparent 40%),
            linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
        }

        body.dark-mode .offers-page-background .dot-pattern {
          background-image: radial-gradient(circle, rgba(52, 199, 89, 0.12) 1px, transparent 1px) !important;
          opacity: 0.2 !important;
        }

        body.dark-mode .offers-page-background .blur-circle-1 {
          background: radial-gradient(circle, rgba(52, 199, 89, 0.12) 0%, transparent 70%) !important;
        }

        body.dark-mode .offers-page-background .blur-circle-2 {
          background: radial-gradient(circle, rgba(52, 199, 89, 0.10) 0%, transparent 70%) !important;
        }
      `}</style>
    </div>
  );
}
