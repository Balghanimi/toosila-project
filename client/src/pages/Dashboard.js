import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { statsAPI } from '../services/api';
import SkeletonLoader from '../components/UI/SkeletonLoader';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { pendingBookings, unreadMessages, showError } = useNotifications();
  const [stats, setStats] = useState({
    totalOffers: 0,
    activeOffers: 0,
    completedOffers: 0,
    totalDemands: 0,
    activeDemands: 0,
    completedTrips: 0,
    pendingBookingsAsDriver: 0,
    pendingBookingsAsPassenger: 0,
    totalPendingBookings: 0,
    rating: 0,
    ratingCount: 0,
  });
  const [recentActivity, setRecentActivity] = useState({
    recentBookings: [],
    recentOffers: [],
    recentDemands: [],
  });
  const [loading, setLoading] = useState(true);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    setIsAnimated(true);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchStats();
      fetchRecentActivity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await statsAPI.getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      showError('فشل في تحميل الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const data = await statsAPI.getRecentActivity();
      setRecentActivity(data);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: '100px' }}>
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--space-8)',
            background: 'var(--surface-primary)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🔒</div>
          <h2
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-2)',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            تسجيل الدخول مطلوب
          </h2>
          <p
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              fontFamily: '"Cairo", sans-serif',
              margin: 0,
            }}
          >
            يرجى تسجيل الدخول للوصول إلى لوحة التحكم
          </p>
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
          transform: isAnimated ? 'translateY(0)' : 'translateY(20px)',
          opacity: isAnimated ? 1 : 0,
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
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
            📊 لوحة التحكم
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 'var(--text-lg)',
              fontFamily: '"Cairo", sans-serif',
              fontWeight: '500',
            }}
          >
            مرحباً {currentUser?.name || 'بك'}! إليك نظرة عامة على نشاطك
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
          }}
        >
          {/* Pending Bookings Card */}
          <div
            onClick={() => navigate('/bookings')}
            role="button"
            tabIndex={0}
            aria-label={`${pendingBookings.totalPending} حجز معلق - انقر لعرض الحجوزات`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/bookings');
              }
            }}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              color: 'white',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-lg)',
              transition: 'var(--transition)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
          >
            <div
              role="img"
              aria-label="أيقونة الحجوزات المعلقة"
              style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}
            >
              📋
            </div>
            <div
              style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: '800',
                marginBottom: 'var(--space-1)',
                fontFamily: '"Cairo", sans-serif',
              }}
            >
              {pendingBookings.totalPending}
            </div>
            <div
              style={{
                fontSize: 'var(--text-sm)',
                opacity: 0.9,
                fontFamily: '"Cairo", sans-serif',
                fontWeight: '600',
              }}
            >
              حجوزات معلقة
            </div>
            {pendingBookings.totalPending > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 'var(--space-3)',
                  left: 'var(--space-3)',
                  background: '#dc2626',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--text-xs)',
                  fontWeight: '700',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              >
                !
              </div>
            )}
          </div>

          {/* Unread Messages Card */}
          <div
            onClick={() => navigate('/messages')}
            role="button"
            tabIndex={0}
            aria-label={`${unreadMessages} رسالة غير مقروءة - انقر لعرض الرسائل`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/messages');
              }
            }}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              color: 'white',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-lg)',
              transition: 'var(--transition)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
          >
            <div
              role="img"
              aria-label="أيقونة المحادثات النشطة"
              style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}
            >
              💬
            </div>
            <div
              style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: '800',
                marginBottom: 'var(--space-1)',
                fontFamily: '"Cairo", sans-serif',
              }}
            >
              {unreadMessages}
            </div>
            <div
              style={{
                fontSize: 'var(--text-sm)',
                opacity: 0.9,
                fontFamily: '"Cairo", sans-serif',
                fontWeight: '600',
              }}
            >
              رسائل غير مقروءة
            </div>
            {unreadMessages > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 'var(--space-3)',
                  left: 'var(--space-3)',
                  background: '#dc2626',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--text-xs)',
                  fontWeight: '700',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              >
                !
              </div>
            )}
          </div>

          {/* Rating Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              color: 'white',
              boxShadow: 'var(--shadow-lg)',
              transition: 'var(--transition)',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>⭐</div>
            <div
              style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: '800',
                marginBottom: 'var(--space-1)',
                fontFamily: '"Cairo", sans-serif',
              }}
            >
              {stats.rating.toFixed(1)}
            </div>
            <div
              style={{
                fontSize: 'var(--text-sm)',
                opacity: 0.9,
                fontFamily: '"Cairo", sans-serif',
                fontWeight: '600',
              }}
            >
              التقييم ({stats.ratingCount} تقييم)
            </div>
          </div>

          {/* Completed Trips Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              color: 'white',
              boxShadow: 'var(--shadow-lg)',
              transition: 'var(--transition)',
            }}
          >
            <div
              role="img"
              aria-label="أيقونة الرحلات المكتملة"
              style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}
            >
              🚗
            </div>
            <div
              style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: '800',
                marginBottom: 'var(--space-1)',
                fontFamily: '"Cairo", sans-serif',
              }}
            >
              {stats.completedTrips}
            </div>
            <div
              style={{
                fontSize: 'var(--text-sm)',
                opacity: 0.9,
                fontFamily: '"Cairo", sans-serif',
                fontWeight: '600',
              }}
            >
              رحلات مكتملة
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          style={{
            background: 'var(--surface-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            boxShadow: 'var(--shadow-md)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-4)',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            ⚡ إجراءات سريعة
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-3)',
            }}
          >
            {/* للسائقين: تصفح الطلبات أولاً (الأهم!) */}
            {currentUser?.isDriver && (
              <button
                onClick={() => navigate('/demands')}
                style={{
                  padding: 'var(--space-4)',
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
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>🔍</span>
                تصفح الطلبات
              </button>
            )}

            {/* للركاب: تصفح العروض أولاً */}
            {!currentUser?.isDriver && (
              <button
                onClick={() => navigate('/offers')}
                style={{
                  padding: 'var(--space-4)',
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
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>🔍</span>
                تصفح العروض
              </button>
            )}

            {/* للسائقين: نشر رحلة جديدة (ثانوي) */}
            {currentUser?.isDriver && (
              <button
                onClick={() => navigate('/post-offer')}
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--surface-secondary)',
                  color: 'var(--text-primary)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-base)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  fontFamily: '"Cairo", sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.color = 'var(--primary)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'var(--border-light)';
                  e.target.style.color = 'var(--text-primary)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>🚗</span>
                نشر رحلة جديدة
              </button>
            )}

            {/* للركاب: نشر طلب رحلة (ثانوي) */}
            {!currentUser?.isDriver && (
              <button
                onClick={() => navigate('/', { state: { mode: 'demand' } })}
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--surface-secondary)',
                  color: 'var(--text-primary)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-base)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  fontFamily: '"Cairo", sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.color = 'var(--primary)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'var(--border-light)';
                  e.target.style.color = 'var(--text-primary)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>👤</span>
                نشر طلب رحلة
              </button>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div
          style={{
            background: 'var(--surface-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-4)',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            📅 النشاط الأخير
          </h2>

          {loading ? (
            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              <SkeletonLoader variant="ListItem" />
              <SkeletonLoader variant="ListItem" />
              <SkeletonLoader variant="ListItem" />
            </div>
          ) : recentActivity.recentBookings?.length > 0 ||
            recentActivity.recentOffers?.length > 0 ||
            recentActivity.recentDemands?.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gap: 'var(--space-4)',
              }}
            >
              {/* Recent Bookings */}
              {recentActivity.recentBookings?.length > 0 && (
                <div>
                  <h3
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--space-3)',
                      fontFamily: '"Cairo", sans-serif',
                    }}
                  >
                    📋 الحجوزات الأخيرة
                  </h3>
                  <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                    {recentActivity.recentBookings.slice(0, 3).map((booking, index) => (
                      <div
                        key={index}
                        style={{
                          padding: 'var(--space-3)',
                          background: 'var(--surface-secondary)',
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--border-light)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 'var(--text-sm)',
                              fontWeight: '600',
                              color: 'var(--text-primary)',
                              fontFamily: '"Cairo", sans-serif',
                            }}
                          >
                            {booking.passenger_name}
                          </div>
                          <div
                            style={{
                              fontSize: 'var(--text-xs)',
                              color: 'var(--text-secondary)',
                              fontFamily: '"Cairo", sans-serif',
                            }}
                          >
                            {booking.from_city} → {booking.to_city}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--text-secondary)',
                            fontFamily: '"Cairo", sans-serif',
                          }}
                        >
                          {new Date(booking.created_at).toLocaleDateString('ar-IQ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Offers */}
              {recentActivity.recentOffers?.length > 0 && (
                <div>
                  <h3
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--space-3)',
                      fontFamily: '"Cairo", sans-serif',
                    }}
                  >
                    🚗 العروض الأخيرة
                  </h3>
                  <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                    {recentActivity.recentOffers.slice(0, 3).map((offer, index) => (
                      <div
                        key={index}
                        style={{
                          padding: 'var(--space-3)',
                          background: 'var(--surface-secondary)',
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--border-light)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 'var(--text-sm)',
                              fontWeight: '600',
                              color: 'var(--text-primary)',
                              fontFamily: '"Cairo", sans-serif',
                            }}
                          >
                            {offer.from_city} → {offer.to_city}
                          </div>
                          <div
                            style={{
                              fontSize: 'var(--text-xs)',
                              color: 'var(--text-secondary)',
                              fontFamily: '"Cairo", sans-serif',
                            }}
                          >
                            {offer.available_seats} مقاعد • {offer.price} د.ع
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--text-secondary)',
                            fontFamily: '"Cairo", sans-serif',
                          }}
                        >
                          {new Date(offer.created_at).toLocaleDateString('ar-IQ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Demands */}
              {recentActivity.recentDemands?.length > 0 && (
                <div>
                  <h3
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--space-3)',
                      fontFamily: '"Cairo", sans-serif',
                    }}
                  >
                    👤 الطلبات الأخيرة
                  </h3>
                  <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                    {recentActivity.recentDemands.slice(0, 3).map((demand, index) => (
                      <div
                        key={index}
                        style={{
                          padding: 'var(--space-3)',
                          background: 'var(--surface-secondary)',
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--border-light)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 'var(--text-sm)',
                              fontWeight: '600',
                              color: 'var(--text-primary)',
                              fontFamily: '"Cairo", sans-serif',
                            }}
                          >
                            {demand.from_city} → {demand.to_city}
                          </div>
                          <div
                            style={{
                              fontSize: 'var(--text-xs)',
                              color: 'var(--text-secondary)',
                              fontFamily: '"Cairo", sans-serif',
                            }}
                          >
                            {new Date(demand.earliest_time).toLocaleTimeString('ar-IQ', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--text-secondary)',
                            fontFamily: '"Cairo", sans-serif',
                          }}
                        >
                          {new Date(demand.created_at).toLocaleDateString('ar-IQ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-8)',
                color: 'var(--text-secondary)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>📊</div>
              <p
                style={{
                  fontFamily: '"Cairo", sans-serif',
                  fontSize: 'var(--text-base)',
                }}
              >
                لا يوجد نشاط حديث
              </p>
            </div>
          )}
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Dashboard;
