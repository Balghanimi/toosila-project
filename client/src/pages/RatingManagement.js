import React, { useState } from 'react';
import { useRatings } from '../context/RatingContext';
import { Link } from 'react-router-dom';
import { EmptyRatingsState } from '../components/Skeleton';

const RatingManagement = () => {
  const { ratings, getUserRatingCount, removeRating, clearAllRatings } = useRatings();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, driver, passenger

  // الحصول على جميع المستخدمين الذين لديهم تقييمات
  const getAllUsers = () => {
    const users = new Set();
    Object.values(ratings).forEach(rating => {
      users.add(rating.ratedUserId);
    });
    return Array.from(users);
  };

  // فلترة التقييمات
  const getFilteredRatings = () => {
    let filtered = Object.values(ratings);
    
    if (selectedUserId) {
      filtered = filtered.filter(rating => rating.ratedUserId === selectedUserId);
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(rating => rating.userType === filterType);
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
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

  const filteredRatings = getFilteredRatings();
  const allUsers = getAllUsers();

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
          📊 إدارة التقييمات
        </h2>
        <p style={{
          margin: '0',
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          مراقبة وإدارة جميع التقييمات في النظام
        </p>
      </div>

      {/* Statistics */}
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
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#0369a1' }}>
            {Object.keys(ratings).length}
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
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#15803d' }}>
            {allUsers.length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>مستخدمين تم تقييمهم</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #f59e0b',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⭐</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>
            {Object.keys(ratings).length > 0 
              ? (Object.values(ratings).reduce((sum, r) => sum + r.rating, 0) / Object.values(ratings).length).toFixed(1)
              : '0.0'
            }
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>متوسط التقييم العام</div>
        </div>
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
          🔍 فلترة التقييمات
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
              مستخدم محدد
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="">جميع المستخدمين</option>
              {allUsers.map(userId => (
                <option key={userId} value={userId}>
                  {userId} ({getUserRatingCount(userId)} تقييم)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link to="/rating-stats">
            <button
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              📈 عرض الإحصائيات
            </button>
          </Link>
          <Link to="/top-ratings">
            <button
              style={{
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              🏆 أفضل التقييمات
            </button>
          </Link>
          <Link to="/recent-ratings">
            <button
              style={{
                background: '#22c55e',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              🕒 التقييمات الحديثة
            </button>
          </Link>
          <Link to="/bad-ratings">
            <button
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              ⚠️ التقييمات السيئة
            </button>
          </Link>
          <Link to="/ratings-by-location">
            <button
              style={{
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              🗺️ التقييمات حسب الموقع
            </button>
          </Link>
          <Link to="/ratings-by-user-type">
            <button
              style={{
                background: '#ec4899',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              👥 التقييمات حسب النوع
            </button>
          </Link>
          <Link to="/ratings-by-date">
            <button
              style={{
                background: '#06b6d4',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              📅 التقييمات حسب التاريخ
            </button>
          </Link>
          <Link to="/ratings-by-comments">
            <button
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              💬 التقييمات حسب التعليقات
            </button>
          </Link>
          <Link to="/ratings-by-rating">
            <button
              style={{
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              ⭐ التقييمات حسب النجوم
            </button>
          </Link>
          <button
            onClick={clearAllRatings}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              marginLeft: '8px'
            }}
          >
            🗑️ مسح جميع التقييمات
          </button>
        </div>
      </div>

      {/* Ratings List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {filteredRatings.length === 0 ? (
          ratings.length === 0 ? (
            <EmptyRatingsState />
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: 'var(--text-secondary)',
              fontSize: '16px'
            }}>
              لا توجد تقييمات تطابق الفلتر المحدد
            </div>
          )
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
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: getRatingColor(rating.rating)
                  }}>
                    {rating.rating.toFixed(1)}
                  </span>
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
                  lineHeight: '1.5'
                }}>
                  "{rating.comment}"
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                color: '#6b7280'
              }}>
                <div>
                  رحلة: {rating.tripId}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
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
                      عرض تفاصيل المستخدم
                    </button>
                  </Link>
                  <button
                    onClick={() => removeRating(rating.id)}
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
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RatingManagement;
