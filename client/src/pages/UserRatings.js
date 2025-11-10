import React from 'react';
import { useRatings } from '../context/RatingContext';
import { useParams, Link } from 'react-router-dom';

const UserRatings = () => {
  const { userId } = useParams();
  const { getUserRatings, getUserAverageRating, getUserRatingCount } = useRatings();

  const userRatings = getUserRatings(userId);
  const averageRating = getUserAverageRating(userId);
  const ratingCount = getUserRatingCount(userId);

  const formatDate = (timestamp) => {
    try {
      return new Intl.DateTimeFormat('ar-IQ', {
        dateStyle: 'medium',
        timeStyle: 'short',
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
        <span
          key={i}
          style={{
            color: i <= rating ? '#fbbf24' : '#d1d5db',
            fontSize: '16px',
          }}
        >
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

  if (!userId) {
    return (
      <div
        style={{
          maxWidth: 800,
          margin: '1rem auto',
          padding: '0 16px',
          textAlign: 'center',
        }}
      >
        <h2>المستخدم غير موجود</h2>
        <Link to="/ratings">
          <button
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            العودة لإدارة التقييمات
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 800,
        margin: '1rem auto',
        padding: '0 16px',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 0 16px 0',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h2
              style={{
                margin: '0 0 8px 0',
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
              }}
            >
              📊 تقييمات المستخدم
            </h2>
            <p
              style={{
                margin: '0',
                fontSize: '16px',
                color: '#6b7280',
                fontWeight: '600',
              }}
            >
              {userId}
            </p>
          </div>
          <Link to="/ratings">
            <button
              style={{
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              ← العودة
            </button>
          </Link>
        </div>

        {/* User Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #0ea5e9',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>⭐</div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#0369a1',
                marginBottom: '4px',
              }}
            >
              {averageRating.toFixed(1)}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>متوسط التقييم</div>
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #22c55e',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>📊</div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#15803d',
                marginBottom: '4px',
              }}
            >
              {ratingCount}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>عدد التقييمات</div>
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #f59e0b',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>
              {getRatingEmoji(averageRating)}
            </div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#d97706',
                marginBottom: '4px',
              }}
            >
              {getRatingText(averageRating)}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>التقييم العام</div>
          </div>
        </div>
      </div>

      {/* Ratings List */}
      {userRatings.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280',
            fontSize: '16px',
          }}
        >
          لا توجد تقييمات لهذا المستخدم
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {userRatings.map((rating) => (
            <div
              key={rating.id}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      background:
                        rating.userType === 'driver'
                          ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                          : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    {rating.userType === 'driver' ? '🚗 سائق' : '👤 راكب'}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '14px',
                        color: '#6b7280',
                      }}
                    >
                      {formatDate(rating.timestamp)}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {renderStars(rating.rating)}
                  </div>
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: getRatingColor(rating.rating),
                    }}
                  >
                    {rating.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              {rating.comment && (
                <div
                  style={{
                    background: '#f9fafb',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    fontSize: '14px',
                    color: '#374151',
                    lineHeight: '1.5',
                    fontStyle: 'italic',
                  }}
                >
                  "{rating.comment}"
                </div>
              )}

              <div
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '8px',
                }}
              >
                رحلة: {rating.tripId}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserRatings;
