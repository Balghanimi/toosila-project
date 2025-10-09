import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { offersAPI, bookingsAPI } from '../../services/api';
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

  const { currentUser } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

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
      const response = await offersAPI.getAll(filterParams);
      setOffers(response.offers || []);
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError('حدث خطأ أثناء تحميل العروض');
    } finally {
      setLoading(false);
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
    setFilters({
      fromCity: '',
      toCity: '',
      departureDate: '',
      minPrice: '',
      maxPrice: '',
      minSeats: '',
      sortBy: 'date'
    });
    setShowAdvancedFilters(false);
    fetchOffers();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
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
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBookNow = (offer) => {
    if (!currentUser) {
      alert('يجب تسجيل الدخول أولاً');
      navigate('/');
      return;
    }

    if (currentUser.isDriver) {
      alert('لا يمكن للسائقين حجز رحلات. قم بالتبديل إلى وضع الراكب من الملف الشخصي');
      return;
    }

    setSelectedOffer(offer);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedOffer) return;

    try {
      await bookingsAPI.create({
        offerId: selectedOffer.id,
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      paddingBottom: '100px'
    }}>
      <div className="container" style={{
        paddingTop: 'var(--space-6)',
        transform: isAnimated ? 'translateY(0)' : 'translateY(20px)',
        opacity: isAnimated ? 1 : 0,
        transition: 'all 0.6s ease'
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
            🚗 العروض المتاحة
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--text-lg)',
            fontFamily: '"Cairo", sans-serif'
          }}>
            ابحث عن رحلتك المثالية
          </p>
        </div>

        {/* Filters */}
        <div style={{
          background: 'var(--surface-primary)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-6)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-light)'
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
                  background: 'var(--surface-primary)'
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
                  background: 'var(--surface-primary)'
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
                  background: 'var(--surface-primary)'
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
                      background: 'var(--surface-primary)'
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
                      background: 'var(--surface-primary)'
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
                      background: 'var(--surface-primary)'
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
                      background: 'var(--surface-primary)'
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
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🚗</div>
            <h3 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              marginBottom: 'var(--space-2)',
              fontFamily: '"Cairo", sans-serif',
              color: 'var(--text-primary)'
            }}>
              لا توجد عروض متاحة
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontFamily: '"Cairo", sans-serif',
              marginBottom: 'var(--space-4)'
            }}>
              لم نعثر على رحلات تطابق بحثك
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
                    {offer.price.toLocaleString()} د.ع
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

        {/* Booking Modal */}
        {showBookingModal && selectedOffer && (
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
              padding: 'var(--space-4)'
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
                boxShadow: 'var(--shadow-xl)'
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
                    fontSize: 'var(--text-xl)',
                    fontWeight: '800',
                    color: 'var(--primary)',
                    fontFamily: '"Cairo", sans-serif'
                  }}
                >
                  💰 {selectedOffer.price.toLocaleString()} د.ع
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
                    resize: 'vertical'
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
      `}</style>
    </div>
  );
}
