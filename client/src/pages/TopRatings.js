import React, { useState } from 'react';
import { useRatings } from '../context/RatingContext';
import { Link } from 'react-router-dom';

const TopRatings = () => {
  const { ratings } = useRatings();
  const [filterType, setFilterType] = useState('all'); // all, driver, passenger
  const [sortBy, setSortBy] = useState('rating'); // rating, date, comment

  const allRatings = Object.values(ratings);

  // فلترة التقييمات
  const getFilteredRatings = () => {
    let filtered = allRatings;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(rating => rating.userType === filterType);
    }
    
    return filtered;
  };

  // ترتيب التقييمات
  const getSortedRatings = () => {
    const filtered = getFilteredRatings();
    
    switch (sortBy) {
      case 'rating':
        return filtered.sort((a, b) => b.rating - a.rating);
      case 'date':
        return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      case 'comment':
        return filtered.filter(r => r.comment && r.comment.trim()).sort((a, b) => b.rating - a.rating);
      default:
        return filtered;
    }
  };

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
          fontSize: '16px'
        }}>
          ⭐
        </span>
      );
    }
    return stars;
  };

  const getRatingText = (rating) => {
    if (rating >= 4.5) return 'ممتاز';
    if (rating >= 3.5) return 'جيد';
    if (rating >= 2.5) return 'متوسط';
    if (rating >= 1.5) return 'سيء';
    return 'سيء جداً';
  };

  const getRatingEmoji = (rating) => {
    if (rating >= 4.5) return '😍';
    if (rating >= 3.5) return '😊';
    if (rating >= 2.5) return '😐';
    if (rating >= 1.5) return '😕';
    return '😞';
  };

  const sortedRatings = getSortedRatings();
  const topRatings = sortedRatings.slice(0, 20); // أفضل 20 تقييم

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
          🏆 أفضل التقييمات والتعليقات
        </h2>
        <p style={{
          margin: '0',
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          تصفح أفضل التقييمات والتعليقات من المستخدمين
        </p>
      </div>

      {/* Filters */}
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#374151'
        }}>
          🔍 فلترة وترتيب التقييمات
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              نوع المستخدم
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="all">جميع التقييمات</option>
              <option value="driver">السائقين فقط</option>
              <option value="passenger">الركاب فقط</option>
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              ترتيب حسب
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="rating">أعلى تقييم</option>
              <option value="date">الأحدث</option>
              <option value="comment">مع التعليقات فقط</option>
            </select>
          </div>
        </div>
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
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>📊</div>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#0369a1',
            marginBottom: '4px'
          }}>
            {topRatings.length}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            تقييم معروض
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #22c55e',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>⭐</div>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#15803d',
            marginBottom: '4px'
          }}>
            {topRatings.length > 0 ? topRatings[0].rating.toFixed(1) : '0.0'}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            أعلى تقييم
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #f59e0b',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>💬</div>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#d97706',
            marginBottom: '4px'
          }}>
            {topRatings.filter(r => r.comment && r.comment.trim()).length}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            مع تعليقات
          </div>
        </div>
      </div>

      {/* Ratings List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {topRatings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280',
            fontSize: '16px'
          }}>
            لا توجد تقييمات تطابق الفلتر المحدد
          </div>
        ) : (
          topRatings.map((rating, index) => (
            <div
              key={rating.id}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                position: 'relative'
              }}
            >
              {/* Rank Badge */}
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '20px',
                background: index < 3 
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                #{index + 1}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    background: rating.userType === 'driver' 
                      ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                      : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {rating.userType === 'driver' ? '🚗 سائق' : '👤 راكب'}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {rating.ratedUserId}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      {formatDate(rating.timestamp)}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {renderStars(rating.rating)}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: getRatingColor(rating.rating)
                    }}>
                      {rating.rating.toFixed(1)}
                    </span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#f3f4f6',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}>
                      <span>{getRatingEmoji(rating.rating)}</span>
                      <span style={{ color: '#6b7280' }}>
                        {getRatingText(rating.rating)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {rating.comment && (
                <div style={{
                  background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#374151',
                  lineHeight: '1.6',
                  fontStyle: 'italic',
                  border: '1px solid #e5e7eb'
                }}>
                  "{rating.comment}"
                </div>
              )}

              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                borderTop: '1px solid #e5e7eb',
                paddingTop: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  رحلة: {rating.tripId}
                </div>
                <Link to={`/user-ratings/${rating.ratedUserId}`}>
                  <button
                    style={{
                      background: '#f0f9ff',
                      color: '#0369a1',
                      border: '1px solid #bae6fd',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    عرض جميع تقييمات المستخدم
                  </button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TopRatings;
