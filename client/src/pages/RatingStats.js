import React from 'react';
import { useRatings } from '../context/RatingContext';

const RatingStats = () => {
  const { ratings, getUserRatings, getUserAverageRating, getUserRatingCount } = useRatings();

  // حساب الإحصائيات العامة
  const totalRatings = Object.keys(ratings).length;
  const allRatings = Object.values(ratings);
  
  const averageRating = totalRatings > 0 
    ? allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
    : 0;

  const ratingDistribution = [1, 2, 3, 4, 5].map(star => ({
    star,
    count: allRatings.filter(r => r.rating === star).length,
    percentage: totalRatings > 0 ? (allRatings.filter(r => r.rating === star).length / totalRatings) * 100 : 0
  }));

  const driverRatings = allRatings.filter(r => r.userType === 'driver');
  const passengerRatings = allRatings.filter(r => r.userType === 'passenger');

  const averageDriverRating = driverRatings.length > 0
    ? driverRatings.reduce((sum, r) => sum + r.rating, 0) / driverRatings.length
    : 0;

  const averagePassengerRating = passengerRatings.length > 0
    ? passengerRatings.reduce((sum, r) => sum + r.rating, 0) / passengerRatings.length
    : 0;

  // الحصول على أفضل وأسوأ المستخدمين
  const getAllUsers = () => {
    const users = new Set();
    allRatings.forEach(rating => {
      users.add(rating.ratedUserId);
    });
    return Array.from(users);
  };

  const usersWithStats = getAllUsers().map(userId => ({
    userId,
    averageRating: getUserAverageRating(userId),
    ratingCount: getUserRatingCount(userId),
    ratings: getUserRatings(userId)
  })).sort((a, b) => b.averageRating - a.averageRating);

  const topUsers = usersWithStats.slice(0, 5);
  const bottomUsers = usersWithStats.slice(-5).reverse();

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

  return (
    <div style={{
      maxWidth: 1200,
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
          📈 إحصائيات التقييمات
        </h2>
        <p style={{
          margin: '0',
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          تحليل شامل لأداء المستخدمين وجودة الخدمة
        </p>
      </div>

      {/* Overall Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #0ea5e9',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#0369a1' }}>
            {totalRatings}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>إجمالي التقييمات</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #22c55e',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⭐</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#15803d' }}>
            {averageRating.toFixed(1)}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>متوسط التقييم العام</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #f59e0b',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🚗</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>
            {driverRatings.length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>تقييمات السائقين</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #ec4899',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>👤</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#be185d' }}>
            {passengerRatings.length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>تقييمات الركاب</div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        marginBottom: '32px'
      }}>
        <h3 style={{
          margin: '0 0 20px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#374151',
          textAlign: 'center'
        }}>
          📊 توزيع التقييمات
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                minWidth: '80px'
              }}>
                {renderStars(star)}
              </div>
              <div style={{
                flex: 1,
                height: '8px',
                background: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${percentage}%`,
                  background: getRatingColor(star),
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{
                minWidth: '60px',
                textAlign: 'right',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                {count} ({percentage.toFixed(1)}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top and Bottom Users */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Top Users */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #22c55e'
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#15803d',
            textAlign: 'center'
          }}>
            🏆 أفضل المستخدمين
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {topUsers.map((user, index) => (
              <div key={user.userId} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #d1fae5'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    background: '#22c55e',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {index + 1}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      {user.userId}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      {user.ratingCount} تقييم
                    </div>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {renderStars(user.averageRating)}
                  </div>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: getRatingColor(user.averageRating)
                  }}>
                    {user.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Users */}
        <div style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #ef4444'
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#dc2626',
            textAlign: 'center'
          }}>
            ⚠️ المستخدمين الذين يحتاجون تحسين
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {bottomUsers.map((user, index) => (
              <div key={user.userId} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #fecaca'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    background: '#ef4444',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {index + 1}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      {user.userId}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      {user.ratingCount} تقييم
                    </div>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {renderStars(user.averageRating)}
                  </div>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: getRatingColor(user.averageRating)
                  }}>
                    {user.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #0ea5e9',
        textAlign: 'center'
      }}>
        <h3 style={{
          margin: '0 0 20px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#0369a1'
        }}>
          📊 مقارنة الأداء
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #bae6fd'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚗</div>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#0369a1',
              marginBottom: '4px'
            }}>
              {averageDriverRating.toFixed(1)}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              متوسط تقييم السائقين
            </div>
          </div>
          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #bae6fd'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>👤</div>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#0369a1',
              marginBottom: '4px'
            }}>
              {averagePassengerRating.toFixed(1)}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              متوسط تقييم الركاب
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingStats;
