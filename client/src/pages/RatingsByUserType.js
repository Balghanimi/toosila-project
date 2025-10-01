import React, { useState } from 'react';
import { useRatings } from '../context/RatingContext';
import { Link } from 'react-router-dom';

const RatingsByUserType = () => {
  const { ratings } = useRatings();
  const [selectedType, setSelectedType] = useState('all'); // all, driver, passenger

  const allRatings = Object.values(ratings);

  // فلترة التقييمات حسب نوع المستخدم
  const getFilteredRatings = () => {
    if (selectedType === 'all') return allRatings;
    return allRatings.filter(rating => rating.userType === selectedType);
  };

  // حساب الإحصائيات لكل نوع
  const getStatsByType = () => {
    const driverRatings = allRatings.filter(r => r.userType === 'driver');
    const passengerRatings = allRatings.filter(r => r.userType === 'passenger');
    
    return {
      driver: {
        count: driverRatings.length,
        average: driverRatings.length > 0 
          ? driverRatings.reduce((sum, r) => sum + r.rating, 0) / driverRatings.length 
          : 0,
        ratings: driverRatings
      },
      passenger: {
        count: passengerRatings.length,
        average: passengerRatings.length > 0 
          ? passengerRatings.reduce((sum, r) => sum + r.rating, 0) / passengerRatings.length 
          : 0,
        ratings: passengerRatings
      }
    };
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
  const stats = getStatsByType();

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
          👥 التقييمات حسب نوع المستخدم
        </h2>
        <p style={{
          margin: '0',
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          مقارنة التقييمات بين السائقين والركاب
        </p>
      </div>

      {/* Filter */}
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
          🔍 فلترة حسب نوع المستخدم
        </h3>
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setSelectedType('all')}
            style={{
              background: selectedType === 'all' ? '#3b82f6' : '#f3f4f6',
              color: selectedType === 'all' ? 'white' : '#374151',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            📊 جميع التقييمات
          </button>
          <button
            onClick={() => setSelectedType('driver')}
            style={{
              background: selectedType === 'driver' ? '#3b82f6' : '#f3f4f6',
              color: selectedType === 'driver' ? 'white' : '#374151',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🚗 السائقين فقط
          </button>
          <button
            onClick={() => setSelectedType('passenger')}
            style={{
              background: selectedType === 'passenger' ? '#22c55e' : '#f3f4f6',
              color: selectedType === 'passenger' ? 'white' : '#374151',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            👤 الركاب فقط
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #0ea5e9',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🚗</div>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#0369a1',
            marginBottom: '4px'
          }}>
            {stats.driver.count}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            تقييمات السائقين
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#0369a1'
          }}>
            {stats.driver.average.toFixed(1)} ⭐
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #22c55e',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>👤</div>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#15803d',
            marginBottom: '4px'
          }}>
            {stats.passenger.count}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            تقييمات الركاب
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#15803d'
          }}>
            {stats.passenger.average.toFixed(1)} ⭐
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #f59e0b',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#d97706',
            marginBottom: '4px'
          }}>
            {filteredRatings.length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            تقييمات معروضة
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#d97706'
          }}>
            {filteredRatings.length > 0 
              ? (filteredRatings.reduce((sum, r) => sum + r.rating, 0) / filteredRatings.length).toFixed(1)
              : '0.0'
            } ⭐
          </div>
        </div>
      </div>

      {/* Comparison */}
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
          📊 مقارنة الأداء
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {/* Drivers */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '16px'
              }}>
                🚗
              </div>
              <div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  السائقين
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  {stats.driver.count} تقييم
                </div>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {renderStars(stats.driver.average)}
              </div>
              <span style={{
                fontSize: '20px',
                fontWeight: '700',
                color: getRatingColor(stats.driver.average)
              }}>
                {stats.driver.average.toFixed(1)}
              </span>
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              fontStyle: 'italic'
            }}>
              {getRatingText(stats.driver.average)}
            </div>
          </div>

          {/* Passengers */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '16px'
              }}>
                👤
              </div>
              <div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  الركاب
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  {stats.passenger.count} تقييم
                </div>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {renderStars(stats.passenger.average)}
              </div>
              <span style={{
                fontSize: '20px',
                fontWeight: '700',
                color: getRatingColor(stats.passenger.average)
              }}>
                {stats.passenger.average.toFixed(1)}
              </span>
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              fontStyle: 'italic'
            }}>
              {getRatingText(stats.passenger.average)}
            </div>
          </div>
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
          ))
        )}
      </div>
    </div>
  );
};

export default RatingsByUserType;
