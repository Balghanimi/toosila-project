import React from 'react';
import { useRatings } from '../context/RatingContext';
import { Link } from 'react-router-dom';

const RecentRatings = () => {
  const { ratings } = useRatings();

  const allRatings = Object.values(ratings)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 50); // آخر 50 تقييم

  const formatDate = (timestamp) => {
    try {
      return new Intl.DateTimeFormat('ar-IQ', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      }).format(new Date(timestamp));
    } catch {
      return timestamp;
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const ratingDate = new Date(timestamp);
    const diffInMinutes = Math.floor((now - ratingDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `منذ ${diffInWeeks} أسبوع`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `منذ ${diffInMonths} شهر`;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#10b981';
    if (rating >= 3.5) return '#f59e0b';
    if (rating >= 2.5) return '#f97316';
    return '#ef4444';
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ 
          color: i <= rating ? '#fbbf24' : '#d1d5db',
          fontSize: '14px'
        }}>
          ⭐
        </span>
      );
    }
    return stars;
  };

  const getRatingEmoji = (rating) => {
    if (rating >= 4.5) return '😍';
    if (rating >= 3.5) return '😊';
    if (rating >= 2.5) return '😐';
    if (rating >= 1.5) return '😕';
    return '😞';
  };

  return (
    <div style={{
      maxWidth: 1000,
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
          🕒 التقييمات الحديثة
        </h2>
        <p style={{
          margin: '0',
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          آخر التقييمات والتعليقات من المستخدمين
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #0ea5e9',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>🕒</div>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#0369a1',
            marginBottom: '4px'
          }}>
            {allRatings.length}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            آخر التقييمات
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #22c55e',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>💬</div>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#15803d',
            marginBottom: '4px'
          }}>
            {allRatings.filter(r => r.comment && r.comment.trim()).length}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            مع تعليقات
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #f59e0b',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>⭐</div>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#d97706',
            marginBottom: '4px'
          }}>
            {allRatings.length > 0 
              ? (allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length).toFixed(1)
              : '0.0'
            }
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            متوسط التقييم
          </div>
        </div>
      </div>

      {/* Ratings List */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {allRatings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280',
            fontSize: '16px'
          }}>
            لا توجد تقييمات حديثة
          </div>
        ) : (
          allRatings.map((rating) => (
            <div
              key={rating.id}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    background: rating.userType === 'driver' 
                      ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                      : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: '600'
                  }}>
                    {rating.userType === 'driver' ? '🚗' : '👤'}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {rating.ratedUserId}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>🕒</span>
                      <span>{getTimeAgo(rating.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}>
                    {renderStars(rating.rating)}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#f3f4f6',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}>
                    <span>{getRatingEmoji(rating.rating)}</span>
                    <span style={{
                      fontWeight: '600',
                      color: getRatingColor(rating.rating)
                    }}>
                      {rating.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {rating.comment && (
                <div style={{
                  background: '#f9fafb',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  fontSize: '13px',
                  color: '#374151',
                  lineHeight: '1.4',
                  fontStyle: 'italic',
                  border: '1px solid #e5e7eb'
                }}>
                  "{rating.comment}"
                </div>
              )}

              <div style={{
                fontSize: '11px',
                color: '#6b7280',
                borderTop: '1px solid #e5e7eb',
                paddingTop: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  رحلة: {rating.tripId}
                </div>
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <span style={{
                    fontSize: '10px',
                    color: '#9ca3af'
                  }}>
                    {formatDate(rating.timestamp)}
                  </span>
                  <Link to={`/user-ratings/${rating.ratedUserId}`}>
                    <button
                      style={{
                        background: '#f0f9ff',
                        color: '#0369a1',
                        border: '1px solid #bae6fd',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      عرض الملف
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentRatings;
