import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { demandsAPI, demandResponsesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DemandResponseForm from '../../components/DemandResponseForm';
import DemandResponsesList from '../../components/DemandResponsesList';

export default function ViewDemands() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAnimated, setIsAnimated] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const [filters, setFilters] = useState({
    fromCity: '',
    toCity: '',
    earliestDate: '',
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // States for demand response functionality
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [showResponses, setShowResponses] = useState(false);
  const [demandResponses, setDemandResponses] = useState([]);
  const [responsesLoading, setResponsesLoading] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if user is a driver
  const isDriver = currentUser?.isDriver || false;

  useEffect(() => {
    // Redirect passengers to offers page
    if (currentUser && !isDriver) {
      navigate('/offers', { replace: true, state: location.state });
      return;
    }

    setIsAnimated(true);
    fetchDemands();
    // eslint-disable-next-line
  }, [currentUser, isDriver]);

  // Handle notification navigation
  useEffect(() => {
    if (location.state?.openDemandId && location.state?.action === 'viewResponses') {
      // Find the demand in the list
      const demand = demands.find((d) => d.id === location.state.openDemandId);
      if (demand) {
        // Open the responses modal
        handleViewResponses(demand, { stopPropagation: () => {} });
      }
      // Clear the state to prevent reopening on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line
  }, [location.state, demands]);

  const fetchDemands = async (filterParams = {}) => {
    setLoading(true);
    setError('');

    try {
      // Add page and limit to params
      filterParams.page = 1;
      filterParams.limit = 20;

      const response = await demandsAPI.getAll(filterParams);
      setDemands(response.demands || []);

      // Save pagination data
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
      setPage(1);
    } catch (err) {
      console.error('Error fetching demands:', err);
      setError('حدث خطأ أثناء تحميل الطلبات');
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
      if (filters.earliestDate) filterParams.earliestDate = filters.earliestDate;

      filterParams.page = page + 1;
      filterParams.limit = 20;

      const response = await demandsAPI.getAll(filterParams);
      setDemands((prev) => [...prev, ...(response.demands || [])]);

      setPage(page + 1);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error('Error loading more:', err);
      setError('فشل تحميل المزيد');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleFilter = () => {
    const filterParams = {};
    if (filters.fromCity) filterParams.fromCity = filters.fromCity;
    if (filters.toCity) filterParams.toCity = filters.toCity;
    if (filters.earliestDate) filterParams.earliestDate = filters.earliestDate;

    fetchDemands(filterParams);
  };

  const handleClearFilters = () => {
    setFilters({
      fromCity: '',
      toCity: '',
      earliestDate: '',
    });
    fetchDemands();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const handleSendOffer = (demand, e) => {
    e.stopPropagation();
    setSelectedDemand(demand);
    setShowResponseForm(true);
  };

  const handleViewResponses = async (demand, e) => {
    e.stopPropagation();
    setSelectedDemand(demand);
    setShowResponses(true);
    setResponsesLoading(true);

    try {
      const response = await demandResponsesAPI.getByDemandId(demand.id);
      setDemandResponses(response.data.responses || []);
    } catch (err) {
      console.error('Error fetching responses:', err);
      setError('حدث خطأ أثناء تحميل الردود');
    } finally {
      setResponsesLoading(false);
    }
  };

  const handleResponseSuccess = () => {
    setShowResponseForm(false);
    setSelectedDemand(null);
    alert('تم إرسال عرضك بنجاح! 🎉');
  };

  const handleResponseUpdate = async () => {
    if (selectedDemand) {
      try {
        const response = await demandResponsesAPI.getByDemandId(selectedDemand.id);
        setDemandResponses(response.data.responses || []);
      } catch (err) {
        console.error('Error refreshing responses:', err);
      }
    }
  };

  const closeModals = () => {
    setShowResponseForm(false);
    setShowResponses(false);
    setSelectedDemand(null);
    setDemandResponses([]);
  };

  // Handle card click to view demand details
  const handleDemandClick = (demand) => {
    setSelectedDemand(demand);
    setShowResponses(true);
    setResponsesLoading(true);

    demandResponsesAPI.getByDemandId(demand.id)
      .then(response => {
        setDemandResponses(response.data.responses || []);
      })
      .catch(err => {
        console.error('Error fetching responses:', err);
        setError('حدث خطأ أثناء تحميل الردود');
      })
      .finally(() => {
        setResponsesLoading(false);
      });
  };

  // Main cities (most popular routes)
  const MAIN_CITIES = ['بغداد', 'البصرة', 'النجف', 'أربيل', 'الموصل'];

  // All Iraqi cities (for advanced filters)
  const IRAQ_CITIES = [
    'بغداد',
    'البصرة',
    'النجف',
    'أربيل',
    'الموصل',
    'كربلاء',
    'ذي قار',
    'ديالى',
    'الأنبار',
    'واسط',
    'ميسان',
  ];

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
          transform: isAnimated ? 'translateY(0)' : 'translateY(20px)',
          opacity: isAnimated ? 1 : 0,
          transition: 'all 0.6s ease',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: 'var(--space-6)',
          }}
        >
          <h1
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: '800',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-2)',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            🙋 الطلبات المتاحة
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 'var(--text-lg)',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            ابحث عن طلب يناسبك
          </p>
        </div>

        <div
          style={{
            background: 'var(--surface-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-6)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-light)',
            overflow: 'visible',
          }}
        >
          <h3
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              marginBottom: 'var(--space-4)',
              fontFamily: '"Cairo", sans-serif',
              color: 'var(--text-primary)',
            }}
          >
            🔍 البحث السريع
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  marginBottom: 'var(--space-2)',
                  fontFamily: '"Cairo", sans-serif',
                  color: 'var(--text-secondary)',
                }}
              >
                من (المدن الرئيسية)
              </label>
              <select
                value={filters.fromCity}
                onChange={(e) => setFilters({ ...filters, fromCity: e.target.value })}
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
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                  backgroundImage:
                    "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'left 10px center',
                  backgroundSize: '20px',
                  paddingLeft: '40px',
                  paddingRight: '40px',
                  position: 'relative',
                  zIndex: 10,
                }}
              >
                <option value="">جميع المدن الرئيسية</option>
                {MAIN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  marginBottom: 'var(--space-2)',
                  fontFamily: '"Cairo", sans-serif',
                  color: 'var(--text-secondary)',
                }}
              >
                إلى (المدن الرئيسية)
              </label>
              <select
                value={filters.toCity}
                onChange={(e) => setFilters({ ...filters, toCity: e.target.value })}
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
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                  backgroundImage:
                    "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'left 10px center',
                  backgroundSize: '20px',
                  paddingLeft: '40px',
                  paddingRight: '40px',
                  position: 'relative',
                  zIndex: 10,
                }}
              >
                <option value="">جميع المدن الرئيسية</option>
                {MAIN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  marginBottom: 'var(--space-2)',
                  fontFamily: '"Cairo", sans-serif',
                  color: 'var(--text-secondary)',
                }}
              >
                التاريخ
              </label>
              <input
                type="date"
                value={filters.earliestDate}
                onChange={(e) => setFilters({ ...filters, earliestDate: e.target.value })}
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
                  paddingRight: 'var(--space-3)',
                }}
              />
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              background: showAdvancedFilters
                ? 'linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(52, 199, 89, 0.05) 100%)'
                : 'transparent',
              color: 'var(--primary)',
              border: '2px solid var(--border-light)',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--text-sm)',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: '"Cairo", sans-serif',
              marginBottom: 'var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              transition: 'all 0.3s ease',
              boxShadow: showAdvancedFilters ? 'var(--shadow-sm)' : 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.background =
                'linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(52, 199, 89, 0.05) 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-light)';
              if (!showAdvancedFilters) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <span>{showAdvancedFilters ? '🔼' : '🔽'}</span>
            <span>{showAdvancedFilters ? 'إخفاء الفلاتر المتقدمة' : 'فلاتر متقدمة'}</span>
          </button>

          {/* Advanced Filters Section */}
          <div
            style={{
              maxHeight: showAdvancedFilters ? '1000px' : '0',
              overflow: 'hidden',
              transition:
                'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out, margin 0.3s ease-in-out',
              opacity: showAdvancedFilters ? 1 : 0,
              marginBottom: showAdvancedFilters ? 'var(--space-4)' : 0,
            }}
          >
            <div
              style={{
                padding: 'var(--space-4)',
                background: 'var(--surface-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '2px dashed var(--border-light)',
              }}
            >
              <h4
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: '600',
                  marginBottom: 'var(--space-4)',
                  fontFamily: '"Cairo", sans-serif',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                }}
              >
                <span>🎛️</span>
                <span>خيارات البحث المتقدم</span>
              </h4>

              {/* Full City Lists */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  background: 'var(--surface-primary)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-light)',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      marginBottom: 'var(--space-2)',
                      fontFamily: '"Cairo", sans-serif',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    من (جميع المدن)
                  </label>
                  <select
                    value={filters.fromCity}
                    onChange={(e) => setFilters({ ...filters, fromCity: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 'var(--space-2)',
                      border: '2px solid var(--border-light)',
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-sm)',
                      fontFamily: '"Cairo", sans-serif',
                      background: 'var(--surface-primary)',
                      textAlign: 'center',
                      textAlignLast: 'center',
                      direction: 'rtl',
                    }}
                  >
                    <option value="">جميع المدن</option>
                    {IRAQ_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      marginBottom: 'var(--space-2)',
                      fontFamily: '"Cairo", sans-serif',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    إلى (جميع المدن)
                  </label>
                  <select
                    value={filters.toCity}
                    onChange={(e) => setFilters({ ...filters, toCity: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 'var(--space-2)',
                      border: '2px solid var(--border-light)',
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-sm)',
                      fontFamily: '"Cairo", sans-serif',
                      background: 'var(--surface-primary)',
                      textAlign: 'center',
                      textAlignLast: 'center',
                      direction: 'rtl',
                    }}
                  >
                    <option value="">جميع المدن</option>
                    {IRAQ_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

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
                boxShadow: 'var(--shadow-md)',
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
                fontFamily: '"Cairo", sans-serif',
              }}
            >
              ✖️ مسح الفلاتر
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: '#fee',
              border: '2px solid #f88',
              borderRadius: 'var(--radius)',
              padding: 'var(--space-4)',
              marginBottom: 'var(--space-6)',
              color: '#c00',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            {error}
          </div>
        )}

        {loading && (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-8)',
              color: 'var(--text-secondary)',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                border: '4px solid var(--border-light)',
                borderTop: '4px solid var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto var(--space-4) auto',
              }}
            />
            جاري التحميل...
          </div>
        )}

        {!loading && demands.length === 0 && (
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
            <h3
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: '700',
                marginBottom: 'var(--space-2)',
                fontFamily: '"Cairo", sans-serif',
                color: 'var(--text-primary)',
              }}
            >
              لا توجد طلبات متاحة
            </h3>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontFamily: '"Cairo", sans-serif',
                marginBottom: 'var(--space-4)',
              }}
            >
              لم نعثر على طلبات تطابق بحثك
            </p>
            {currentUser && !currentUser.isDriver && (
              <button
                onClick={() => navigate('/', { state: { mode: 'demand' } })}
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-base)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: '"Cairo", sans-serif',
                }}
              >
                ➕ انشر طلبك الآن
              </button>
            )}
          </div>
        )}

        {!loading && demands.length > 0 && (
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            {demands.map((demand) => (
              <div
                key={demand.id}
                onClick={() => handleDemandClick(demand)}
                style={{
                  background: 'var(--surface-primary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-5)',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--border-light)',
                  transition: 'var(--transition)',
                  cursor: 'pointer',
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
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: 'var(--space-4)',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--space-2)',
                        fontFamily: '"Cairo", sans-serif',
                      }}
                    >
                      {demand.fromCity} ← {demand.toCity}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: 'var(--space-4)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-secondary)',
                        fontFamily: '"Cairo", sans-serif',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span>📅 من: {formatDate(demand.earliestTime)}</span>
                      <span>📅 إلى: {formatDate(demand.latestTime)}</span>
                      <span>💺 {demand.seats} مقعد</span>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--text-2xl)',
                      fontWeight: '800',
                      color: '#10b981',
                      fontFamily: '"Cairo", sans-serif',
                    }}
                  >
                    {demand.budgetMax ? Number(demand.budgetMax).toLocaleString() : '0'} د.ع
                  </div>
                </div>
                <div
                  style={{
                    padding: 'var(--space-3)',
                    background: 'var(--surface-secondary)',
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    fontFamily: '"Cairo", sans-serif',
                    marginBottom: currentUser && currentUser.isDriver ? 'var(--space-3)' : '0',
                  }}
                >
                  👤 الراكب: {demand.name || 'غير متوفر'}
                </div>

                {/* Action buttons for drivers */}
                {currentUser && currentUser.isDriver && (
                  <div
                    style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}
                  >
                    <button
                      onClick={(e) => handleSendOffer(demand, e)}
                      style={{
                        flex: 1,
                        padding: 'var(--space-3)',
                        background:
                          'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: '"Cairo", sans-serif',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'var(--transition)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      }}
                    >
                      💼 إرسال عرض
                    </button>
                    <button
                      onClick={(e) => handleViewResponses(demand, e)}
                      style={{
                        flex: 1,
                        padding: 'var(--space-3)',
                        background: 'var(--surface-secondary)',
                        color: 'var(--text-primary)',
                        border: '2px solid var(--border-light)',
                        borderRadius: 'var(--radius)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: '"Cairo", sans-serif',
                        transition: 'var(--transition)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-light)';
                      }}
                    >
                      📋 عرض العروض
                    </button>
                  </div>
                )}

                {/* Action button for passengers to view responses on their own demands */}
                {currentUser && !currentUser.isDriver && demand.passengerId === currentUser.id && (
                  <button
                    onClick={(e) => handleViewResponses(demand, e)}
                    style={{
                      width: '100%',
                      marginTop: 'var(--space-3)',
                      padding: 'var(--space-3)',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontFamily: '"Cairo", sans-serif',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'var(--transition)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }}
                  >
                    📋 عرض الردود ({demand.responseCount || 0})
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination Info and Load More Button */}
        {!loading && demands.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-4)',
              marginTop: 'var(--space-6)',
              padding: 'var(--space-4)',
              background: 'var(--surface-primary)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-light)',
            }}
          >
            <p
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                fontFamily: '"Cairo", sans-serif',
                margin: 0,
              }}
            >
              عرض {demands.length} من {total} نتيجة
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
                  opacity: loadingMore ? 0.7 : 1,
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
      </div>

      {/* Modal for sending offer */}
      {showResponseForm && selectedDemand && (
        <div
          onClick={closeModals}
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
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface-primary)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: 'var(--shadow-2xl)',
            }}
          >
            <DemandResponseForm
              demand={selectedDemand}
              onSuccess={handleResponseSuccess}
              onCancel={closeModals}
            />
          </div>
        </div>
      )}

      {/* Modal for viewing responses */}
      {showResponses && selectedDemand && (
        <div
          onClick={closeModals}
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
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface-primary)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: 'var(--shadow-2xl)',
              padding: 'var(--space-6)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-4)',
                paddingBottom: 'var(--space-4)',
                borderBottom: '2px solid var(--border-light)',
              }}
            >
              <h2
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: '700',
                  fontFamily: '"Cairo", sans-serif',
                  color: 'var(--text-primary)',
                }}
              >
                📋 الردود على الطلب
              </h2>
              <button
                onClick={closeModals}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 'var(--text-2xl)',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: 'var(--space-2)',
                  lineHeight: 1,
                }}
              >
                ✖️
              </button>
            </div>

            <div
              style={{
                background: 'var(--surface-secondary)',
                borderRadius: 'var(--radius)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-4)',
                fontFamily: '"Cairo", sans-serif',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: '600',
                  marginBottom: 'var(--space-2)',
                }}
              >
                {selectedDemand.fromCity} ← {selectedDemand.toCity}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                💺 {selectedDemand.seats} مقعد | 💰{' '}
                {selectedDemand.budgetMax ? Number(selectedDemand.budgetMax).toLocaleString() : '0'}{' '}
                د.ع
              </div>
            </div>

            {responsesLoading ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: 'var(--space-8)',
                  color: 'var(--text-secondary)',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid var(--border-light)',
                    borderTop: '4px solid var(--primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto var(--space-4) auto',
                  }}
                />
                جاري تحميل الردود...
              </div>
            ) : (
              <DemandResponsesList
                responses={demandResponses}
                isOwner={currentUser && selectedDemand.passengerId === currentUser.id}
                onResponseUpdate={handleResponseUpdate}
              />
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
