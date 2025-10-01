import React, { useState } from 'react';
import { useRatings } from '../context/RatingContext';
import { Link } from 'react-router-dom';

const RatingsByDate = () => {
  const { ratings } = useRatings();
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // all, today, week, month, year
  const [selectedDate, setSelectedDate] = useState('');

  const allRatings = Object.values(ratings);

  // فلترة التقييمات حسب التاريخ
  const getFilteredRatings = () => {
    let filtered = allRatings;
    
    if (selectedPeriod !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (selectedPeriod) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }
      
      filtered = filtered.filter(rating => new Date(rating.timestamp) >= filterDate);
    }
    
    if (selectedDate) {
      const selectedDateObj = new Date(selectedDate);
      const nextDay = new Date(selectedDateObj);
      nextDay.setDate(selectedDateObj.getDate() + 1);
      
      filtered = filtered.filter(rating => {
        const ratingDate = new Date(rating.timestamp);
        return ratingDate >= selectedDateObj && ratingDate < nextDay;
      });
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  // حساب الإحصائيات حسب الفترة
  const getStatsByPeriod = () => {
    const now = new Date();
    const periods = {
      today: { start: new Date(now.getFullYear(), now.getMonth(), now.getDate()), name: 'اليوم' },
      week: { start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), name: 'الأسبوع الماضي' },
      month: { start: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()), name: 'الشهر الماضي' },
      year: { start: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()), name: 'السنة الماضية' }
    };
    
    const stats = {};
    
    Object.keys(periods).forEach(period => {
      const periodRatings = allRatings.filter(rating => 
        new Date(rating.timestamp) >= periods[period].start
      );
      
      stats[period] = {
        count: periodRatings.length,
        average: periodRatings.length > 0 
          ? periodRatings.reduce((sum, r) => sum + r.rating, 0) / periodRatings.length 
          : 0,
        name: periods[period].name
      };
    });
    
    return stats;
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

  const getAverageRating = (ratings) => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((total, rating) => total + rating.rating, 0);
    return sum / ratings.length;
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

  const filteredRatings = getFilteredRatings();
  const stats = getStatsByPeriod();

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
          📅 التقييمات حسب التاريخ
        </h2>
        <p style={{
          margin: '0',
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          مراقبة التقييمات حسب الفترات الزمنية المختلفة
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
          🔍 فلترة حسب التاريخ
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
              الفترة الزمنية
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="all">جميع التقييمات</option>
              <option value="today">اليوم</option>
              <option value="week">الأسبوع الماضي</option>
              <option value="month">الشهر الماضي</option>
              <option value="year">السنة الماضية</option>
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
              تاريخ محدد
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
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
            {filteredRatings.length}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            تقييمات معروضة
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
            {filteredRatings.length > 0 ? getAverageRating(filteredRatings).toFixed(1) : '0.0'}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            متوسط التقييم
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #f59e0b',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>📅</div>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#d97706',
            marginBottom: '4px'
          }}>
            {selectedPeriod === 'all' ? 'جميع الفترات' : stats[selectedPeriod]?.name || 'غير محدد'}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            الفترة المحددة
          </div>
        </div>
      </div>

      {/* Period Stats */}
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        <h3 style={{
          margin: '0 0 20px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#374151',
          textAlign: 'center'
        }}>
          📊 إحصائيات الفترات الزمنية
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {Object.keys(stats).map(period => (
            <div
              key={period}
              style={{
                background: 'white',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}
            >
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                {stats[period].name}
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#0369a1',
                marginBottom: '4px'
              }}>
                {stats[period].count}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '8px'
              }}>
                تقييم
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {renderStars(stats[period].average)}
                </div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: getRatingColor(stats[period].average)
                }}>
                  {stats[period].average.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ratings List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {filteredRatings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280',
            fontSize: '16px'
          }}>
            لا توجد تقييمات تطابق الفلتر المحدد
          </div>
        ) : (
          filteredRatings.map((rating) => (
            <div
              key={rating.id}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
              }}
            >
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
                  background: '#f9fafb',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#374151',
                  lineHeight: '1.5',
                  fontStyle: 'italic'
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
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RatingsByDate;
