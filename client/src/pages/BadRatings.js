import React, { useState } from 'react';
import { useRatings } from '../context/RatingContext';
import { Link } from 'react-router-dom';

const BadRatings = () => {
  const { ratings } = useRatings();
  const [filterType, setFilterType] = useState('all'); // all, driver, passenger
  const [minRating, setMinRating] = useState(3); // أقل من 3 نجوم

  const allRatings = Object.values(ratings);

  // فلترة التقييمات السيئة
  const getBadRatings = () => {
    let filtered = allRatings.filter(rating => rating.rating < minRating);
    
    if (filterType !== 'all') {
      filtered = filtered.filter(rating => rating.userType === filterType);
    }
    
    return filtered.sort((a, b) => a.rating - b.rating); // ترتيب من الأسوأ للأقل سوءاً
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

  const getSeverityColor = (rating) => {
    if (rating <= 1) return '#dc2626'; // أحمر داكن
    if (rating <= 2) return '#ea580c'; // برتقالي داكن
    return '#d97706'; // أصفر داكن
  };

  const getSeverityText = (rating) => {
    if (rating <= 1) return 'حرج جداً';
    if (rating <= 2) return 'حرج';
    return 'يحتاج تحسين';
  };

  const badRatings = getBadRatings();

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
          ⚠️ التقييمات السيئة والتعليقات السلبية
        </h2>
        <p style={{
          margin: '0',
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          مراقبة التقييمات السلبية لتحسين جودة الخدمة
        </p>
      </div>

      {/* Filters */}
      <div style={{
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #fecaca',
        marginBottom: '24px'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#dc2626'
        }}>
          🔍 فلترة التقييمات السلبية
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
              الحد الأدنى للتقييم السيء
            </label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value={2}>أقل من 2 نجوم</option>
              <option value={3}>أقل من 3 نجوم</option>
              <option value={4}>أقل من 4 نجوم</option>
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
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #fecaca',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>⚠️</div>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#dc2626',
            marginBottom: '4px'
          }}>
            {badRatings.length}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            تقييمات سلبية
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #fecaca',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>💬</div>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#dc2626',
            marginBottom: '4px'
          }}>
            {badRatings.filter(r => r.comment && r.comment.trim()).length}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            مع تعليقات سلبية
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #fecaca',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>📊</div>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#dc2626',
            marginBottom: '4px'
          }}>
            {badRatings.length > 0 
              ? (badRatings.reduce((sum, r) => sum + r.rating, 0) / badRatings.length).toFixed(1)
              : '0.0'
            }
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            متوسط التقييمات السلبية
          </div>
        </div>
      </div>

      {/* Ratings List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {badRatings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280',
            fontSize: '16px'
          }}>
            لا توجد تقييمات سلبية تطابق الفلتر المحدد
          </div>
        ) : (
          badRatings.map((rating, index) => (
            <div
              key={rating.id}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                position: 'relative'
              }}
            >
              {/* Severity Badge */}
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '20px',
                background: getSeverityColor(rating.rating),
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {getSeverityText(rating.rating)}
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
                      background: '#fef2f2',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      border: '1px solid #fecaca'
                    }}>
                      <span>{getRatingEmoji(rating.rating)}</span>
                      <span style={{ color: '#dc2626' }}>
                        {getRatingText(rating.rating)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {rating.comment && (
                <div style={{
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#374151',
                  lineHeight: '1.6',
                  fontStyle: 'italic',
                  border: '1px solid #fecaca'
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
                      background: '#fef2f2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    عرض ملف المستخدم
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

export default BadRatings;
