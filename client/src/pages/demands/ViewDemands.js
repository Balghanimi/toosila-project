import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { demandsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ViewDemands() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAnimated, setIsAnimated] = useState(false);

  const [filters, setFilters] = useState({
    fromCity: '',
    toCity: '',
    earliestDate: ''
  });

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsAnimated(true);
    fetchDemands();
    // eslint-disable-next-line
  }, []);

  const fetchDemands = async (filterParams = {}) => {
    setLoading(true);
    setError('');

    try {
      const response = await demandsAPI.getAll(filterParams);
      setDemands(response.demands || []);
    } catch (err) {
      console.error('Error fetching demands:', err);
      setError('حدث خطأ أثناء تحميل الطلبات');
    } finally {
      setLoading(false);
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
      earliestDate: ''
    });
    fetchDemands();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
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
            🙋 الطلبات المتاحة
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--text-lg)',
            fontFamily: '"Cairo", sans-serif'
          }}>
            ابحث عن طلب يناسبك
          </p>
        </div>

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
              }}>من</label>
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
              }}>إلى</label>
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
              }}>التاريخ</label>
              <input
                type="date"
                value={filters.earliestDate}
                onChange={(e) => setFilters({...filters, earliestDate: e.target.value})}
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

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button onClick={handleFilter} style={{
                flex: 1, padding: 'var(--space-3)',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                color: 'white', border: 'none', borderRadius: 'var(--radius)',
                fontSize: 'var(--text-base)', fontWeight: '600', cursor: 'pointer',
                fontFamily: '"Cairo", sans-serif', boxShadow: 'var(--shadow-md)'
              }}>🔍 بحث</button>
            <button onClick={handleClearFilters} style={{
                flex: 1, padding: 'var(--space-3)', background: 'var(--surface-secondary)',
                color: 'var(--text-primary)', border: '2px solid var(--border-light)',
                borderRadius: 'var(--radius)', fontSize: 'var(--text-base)',
                fontWeight: '600', cursor: 'pointer', fontFamily: '"Cairo", sans-serif'
              }}>✖️ مسح الفلاتر</button>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fee', border: '2px solid #f88', borderRadius: 'var(--radius)',
            padding: 'var(--space-4)', marginBottom: 'var(--space-6)',
            color: '#c00', fontFamily: '"Cairo", sans-serif'
          }}>{error}</div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-secondary)', fontFamily: '"Cairo", sans-serif' }}>
            <div style={{
              width: '50px', height: '50px', border: '4px solid var(--border-light)',
              borderTop: '4px solid var(--primary)', borderRadius: '50%',
              animation: 'spin 1s linear infinite', margin: '0 auto var(--space-4) auto'
            }} />
            جاري التحميل...
          </div>
        )}

        {!loading && demands.length === 0 && (
          <div style={{
            textAlign: 'center', padding: 'var(--space-8)', background: 'var(--surface-primary)',
            borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🙋</div>
            <h3 style={{
              fontSize: 'var(--text-2xl)', fontWeight: '700', marginBottom: 'var(--space-2)',
              fontFamily: '"Cairo", sans-serif', color: 'var(--text-primary)'
            }}>لا توجد طلبات متاحة</h3>
            <p style={{
              color: 'var(--text-secondary)', fontFamily: '"Cairo", sans-serif',
              marginBottom: 'var(--space-4)'
            }}>لم نعثر على طلبات تطابق بحثك</p>
            {currentUser && !currentUser.isDriver && (
              <button onClick={() => navigate('/post-demand')} style={{
                  padding: 'var(--space-3) var(--space-6)', background: 'var(--primary)',
                  color: 'white', border: 'none', borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-base)', fontWeight: '600', cursor: 'pointer',
                  fontFamily: '"Cairo", sans-serif'
                }}>➕ انشر طلبك الآن</button>
            )}
          </div>
        )}

        {!loading && demands.length > 0 && (
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            {demands.map((demand) => (
              <div key={demand.id} style={{
                  background: 'var(--surface-primary)', borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-5)', boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--border-light)', transition: 'var(--transition)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'start', marginBottom: 'var(--space-4)'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 'var(--text-lg)', fontWeight: '700',
                      color: 'var(--text-primary)', marginBottom: 'var(--space-2)',
                      fontFamily: '"Cairo", sans-serif'
                    }}>{demand.fromCity} ← {demand.toCity}</div>
                    <div style={{
                      display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)', fontFamily: '"Cairo", sans-serif',
                      flexWrap: 'wrap'
                    }}>
                      <span>📅 من: {formatDate(demand.earliestTime)}</span>
                      <span>📅 إلى: {formatDate(demand.latestTime)}</span>
                      <span>💺 {demand.seats} مقعد</span>
                    </div>
                  </div>
                  <div style={{
                    fontSize: 'var(--text-2xl)', fontWeight: '800',
                    color: '#10b981', fontFamily: '"Cairo", sans-serif'
                  }}>{demand.budgetMax.toLocaleString()} د.ع</div>
                </div>
                <div style={{
                  padding: 'var(--space-3)', background: 'var(--surface-secondary)',
                  borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)', fontFamily: '"Cairo", sans-serif'
                }}>👤 الراكب: {demand.name || 'غير متوفر'}</div>
              </div>
            ))}
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
