import React, { useState } from 'react';
import { useRatings } from '../context/RatingContext';
import { Link } from 'react-router-dom';

const RatingsByLocation = () => {
  const { ratings } = useRatings();
  const [selectedGov, setSelectedGov] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  const allRatings = Object.values(ratings);

  // استخراج المحافظات والمناطق من التقييمات
  const getLocations = () => {
    const locations = {};

    allRatings.forEach((rating) => {
      // محاولة استخراج المحافظة والمنطقة من tripId أو من بيانات أخرى
      // هذا مثال بسيط - في التطبيق الحقيقي ستحتاج لربط التقييمات بالرحلة
      const tripId = rating.tripId;

      // محاولة استخراج المحافظة من tripId (افتراض)
      const govs = [
        'بغداد',
        'البصرة',
        'الموصل',
        'أربيل',
        'النجف',
        'كربلاء',
        'الديوانية',
        'السماوة',
        'الناصرية',
      ];
      const areas = {
        بغداد: ['الكرخ', 'الرصافة', 'الأعظمية', 'مدينة الصدر', 'الدورة', 'الكاظمية'],
        البصرة: ['مركز البصرة', 'الزبير', 'أبو الخصيب', 'القرنة', 'شط العرب'],
        الموصل: ['الموصل', 'تلعفر', 'سنجار', 'الحمدانية'],
        أربيل: ['أربيل', 'كويه', 'مخمور', 'سوران'],
        النجف: ['النجف', 'الكوفة', 'المناذرة'],
        كربلاء: ['كربلاء', 'عين التمر', 'الهندية'],
        الديوانية: ['الديوانية', 'عفك', 'الحمزة'],
        السماوة: ['السماوة', 'الرميثة'],
        الناصرية: ['الناصرية', 'الشطرة', 'سوق الشيوخ', 'الرفاعي'],
      };

      // محاولة تحديد المحافظة بناءً على tripId
      const gov = govs.find((g) => tripId.includes(g)) || 'غير محدد';

      if (!locations[gov]) {
        locations[gov] = {
          ratings: [],
          areas: {},
        };
      }

      locations[gov].ratings.push(rating);

      // محاولة تحديد المنطقة
      if (areas[gov]) {
        const area = areas[gov].find((a) => tripId.includes(a)) || 'غير محدد';

        if (!locations[gov].areas[area]) {
          locations[gov].areas[area] = [];
        }

        locations[gov].areas[area].push(rating);
      }
    });

    return locations;
  };

  const locations = getLocations();
  const governorates = Object.keys(locations);

  // حساب متوسط التقييم لمحافظة معينة
  const getAverageRating = (ratings) => {
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
  };

  // حساب عدد التقييمات لمحافظة معينة
  const getRatingCount = (ratings) => {
    return ratings.length;
  };

  // فلترة التقييمات حسب المحافظة والمنطقة
  const getFilteredRatings = () => {
    if (!selectedGov) return allRatings;

    const govRatings = locations[selectedGov]?.ratings || [];

    if (!selectedArea) return govRatings;

    return locations[selectedGov]?.areas[selectedArea] || [];
  };

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
            fontSize: '14px',
          }}
        >
          ⭐
        </span>
      );
    }
    return stars;
  };

  const filteredRatings = getFilteredRatings();

  return (
    <div
      style={{
        maxWidth: 1200,
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
        <h2
          style={{
            margin: '0 0 8px 0',
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            textAlign: 'center',
          }}
        >
          🗺️ التقييمات حسب الموقع
        </h2>
        <p
          style={{
            margin: '0',
            fontSize: '14px',
            color: '#6b7280',
            textAlign: 'center',
          }}
        >
          مراقبة التقييمات حسب المحافظات والمناطق
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '24px',
        }}
      >
        <h3
          style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#374151',
          }}
        >
          🔍 فلترة حسب الموقع
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
              }}
            >
              المحافظة
            </label>
            <select
              value={selectedGov}
              onChange={(e) => {
                setSelectedGov(e.target.value);
                setSelectedArea('');
              }}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            >
              <option value="">جميع المحافظات</option>
              {governorates.map((gov) => (
                <option key={gov} value={gov}>
                  {gov} ({getRatingCount(locations[gov].ratings)} تقييم)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
              }}
            >
              المنطقة
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              disabled={!selectedGov}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                background: selectedGov ? 'white' : '#f9fafb',
              }}
            >
              <option value="">جميع المناطق</option>
              {selectedGov &&
                Object.keys(locations[selectedGov].areas).map((area) => (
                  <option key={area} value={area}>
                    {area} ({getRatingCount(locations[selectedGov].areas[area])} تقييم)
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
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
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>📊</div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#0369a1',
              marginBottom: '4px',
            }}
          >
            {filteredRatings.length}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>تقييمات معروضة</div>
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
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>⭐</div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#15803d',
              marginBottom: '4px',
            }}
          >
            {filteredRatings.length > 0 ? getAverageRating(filteredRatings).toFixed(1) : '0.0'}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>متوسط التقييم</div>
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
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>🗺️</div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#d97706',
              marginBottom: '4px',
            }}
          >
            {selectedGov ? selectedGov : 'جميع المحافظات'}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>المحافظة المحددة</div>
        </div>
      </div>

      {/* Governorates Overview */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '24px',
        }}
      >
        <h3
          style={{
            margin: '0 0 20px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#374151',
            textAlign: 'center',
          }}
        >
          📊 نظرة عامة على المحافظات
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          {governorates.map((gov) => {
            const govRatings = locations[gov].ratings;
            const avgRating = getAverageRating(govRatings);
            const ratingCount = getRatingCount(govRatings);

            return (
              <div
                key={gov}
                style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setSelectedGov(gov)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '8px',
                  }}
                >
                  {gov}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {renderStars(avgRating)}
                  </div>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: getRatingColor(avgRating),
                    }}
                  >
                    {avgRating.toFixed(1)}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#6b7280',
                  }}
                >
                  {ratingCount} تقييم
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ratings List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {filteredRatings.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280',
              fontSize: '16px',
            }}
          >
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
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1f2937',
                      }}
                    >
                      {rating.ratedUserId}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
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
                      fontSize: '18px',
                      fontWeight: '700',
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
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>رحلة: {rating.tripId}</div>
                <Link to={`/user-ratings/${rating.ratedUserId}`}>
                  <button
                    style={{
                      background: '#f0f9ff',
                      color: '#0369a1',
                      border: '1px solid #bae6fd',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
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

export default RatingsByLocation;
