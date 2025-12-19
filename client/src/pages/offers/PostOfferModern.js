import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMode } from '../../context/ModeContext';
import { offersAPI } from '../../services/api';

export default function PostOfferModern() {
  const [isAnimated, setIsAnimated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fromCity: '',
    toCity: '',
    departureDate: '',
    departureTime: '',
    seats: '1',
    price: '',
  });

  const [errors, setErrors] = useState({});
  const { currentUser } = useAuth();
  const { mode } = useMode();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect passengers to offers page
  useEffect(() => {
    if (mode === 'passenger') {
      navigate('/offers', { replace: true });
    }
  }, [mode, navigate]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    setIsAnimated(true);

    // استقبال البيانات من الصفحة الرئيسية إذا كانت موجودة
    if (location.state && location.state.fromCity && location.state.toCity) {
      const newFormData = {
        fromCity: location.state.fromCity || '',
        toCity: location.state.toCity || '',
        departureDate: location.state.departureDate || '',
        departureTime: location.state.departureTime || '',
        seats: location.state.seats || '1',
        price: location.state.price || '',
      };

      setFormData((prev) => ({
        ...prev,
        ...newFormData,
      }));

      // البيانات تم تعبئتها من الصفحة الرئيسية
      // المستخدم يمكنه الآن تعديل البيانات قبل النشر
      // (تم إزالة النشر التلقائي للسماح بتعديل التاريخ والوقت)
    } else {
      // إذا لم تكن هناك بيانات من الصفحة الرئيسية، ارجع للصفحة الرئيسية
      navigate('/', { replace: true });
      return;
    }
    // eslint-disable-next-line
  }, [currentUser, navigate]);

  // Check if user is a driver (using mode for consistency)
  if (currentUser && mode === 'passenger') {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-4)',
        }}
      >
        <div
          style={{
            background: 'var(--surface-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-8)',
            boxShadow: 'var(--shadow-xl)',
            textAlign: 'center',
            maxWidth: '500px',
            border: '2px solid #fbbf24',
          }}
        >
          <div
            style={{
              fontSize: '4rem',
              marginBottom: 'var(--space-4)',
            }}
          >
            🚫
          </div>
          <h2
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '800',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-3)',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            هذه الصفحة للسائقين فقط
          </h2>
          <p
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-6)',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            يجب التبديل إلى وضع السائق لنشر عرض رحلة
          </p>
          <button
            onClick={() => navigate('/profile')}
            style={{
              padding: 'var(--space-4) var(--space-6)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-lg)',
              fontWeight: '700',
              cursor: 'pointer',
              fontFamily: '"Cairo", sans-serif',
              boxShadow: 'var(--shadow-lg)',
              width: '100%',
            }}
          >
            الذهاب إلى الملف الشخصي للتبديل 🔄
          </button>
        </div>
      </div>
    );
  }

  const IRAQ_CITIES = [
    'بغداد',
    'البصرة',
    'النجف',
    'أربيل',
    'الموصل',
    'كربلاء',
    'ذي قار',
    'ديالى',
    'الأنبار',
    'واسط',
    'ميسان',
  ];

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    setError('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fromCity) newErrors.fromCity = 'اختر مدينة الانطلاق';
    if (!formData.toCity) newErrors.toCity = 'اختر مدينة الوصول';
    if (formData.fromCity === formData.toCity) {
      newErrors.toCity = 'مدينة الوصول يجب أن تختلف عن مدينة الانطلاق';
    }
    if (!formData.departureDate) newErrors.departureDate = 'اختر تاريخ المغادرة';
    if (!formData.departureTime) newErrors.departureTime = 'اختر وقت المغادرة';
    if (!formData.seats || parseInt(formData.seats) < 1) {
      newErrors.seats = 'أدخل عدد مقاعد صحيح';
    }
    if (!formData.price || parseFloat(formData.price) < 1000) {
      newErrors.price = 'أدخل سعر صحيح (الحد الأدنى 1000 د.ع)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // دالة منفصلة للنشر يمكن استدعاؤها من useEffect أو من الزر
  const submitOffer = async (data = formData) => {
    setIsSubmitting(true);
    setError('');

    try {
      // Combine date and time into ISO format
      const departureDateTime = new Date(`${data.departureDate}T${data.departureTime}:00`);

      const offerData = {
        fromCity: data.fromCity,
        toCity: data.toCity,
        departureTime: departureDateTime.toISOString(),
        seats: parseInt(data.seats),
        price: parseFloat(data.price),
      };

      await offersAPI.create(offerData);
      setSuccess(true);

      setTimeout(() => {
        navigate('/offers');
      }, 2000);
    } catch (err) {
      console.error('Error creating offer:', err);
      setError(err.message || 'حدث خطأ أثناء نشر الرحلة. حاول مرة أخرى.');
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    await submitOffer();
  };

  if (success) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-4)',
        }}
      >
        <div
          style={{
            background: 'var(--surface-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-8)',
            boxShadow: 'var(--shadow-xl)',
            textAlign: 'center',
            maxWidth: '500px',
            animation: 'fadeInUp 0.5s ease-out',
          }}
        >
          <div
            style={{
              fontSize: '5rem',
              marginBottom: 'var(--space-4)',
              animation: 'bounce 1s infinite',
            }}
          >
            ✅
          </div>
          <h2
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: '800',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-3)',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            تم نشر رحلتك بنجاح! 🎉
          </h2>
          <p
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--text-secondary)',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            جاري تحويلك إلى صفحة العروض...
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
          maxWidth: '600px',
          margin: '0 auto',
          transform: isAnimated ? 'translateY(0)' : 'translateY(20px)',
          opacity: isAnimated ? 1 : 0,
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 'var(--space-8)',
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
            🚗 نشر رحلة جديدة
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 'var(--text-lg)',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            شارك رحلتك مع ركاب آخرين
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: '#fee',
              border: '2px solid #f88',
              borderRadius: 'var(--radius)',
              padding: 'var(--space-4)',
              marginBottom: 'var(--space-6)',
              color: '#c00',
              fontFamily: '"Cairo", sans-serif',
              fontSize: 'var(--text-base)',
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              background: 'var(--surface-primary)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border-light)',
              display: 'grid',
              gap: 'var(--space-6)',
            }}
          >
            {/* Route */}
            <div>
              <h3
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: '600',
                  marginBottom: 'var(--space-4)',
                  fontFamily: '"Cairo", sans-serif',
                  color: 'var(--text-primary)',
                }}
              >
                🛣️ المسار
              </h3>

              <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      marginBottom: 'var(--space-2)',
                      fontFamily: '"Cairo", sans-serif',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    من (مدينة الانطلاق)
                  </label>
                  <select
                    value={formData.fromCity}
                    onChange={(e) => updateField('fromCity', e.target.value)}
                    style={{
                      width: '100%',
                      padding: 'var(--space-3)',
                      border: `2px solid ${errors.fromCity ? '#f88' : 'var(--border-light)'}`,
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)',
                      fontFamily: '"Cairo", sans-serif',
                      background: 'var(--surface-primary)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="">اختر المدينة</option>
                    {IRAQ_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {errors.fromCity && (
                    <p
                      style={{
                        color: '#c00',
                        fontSize: 'var(--text-sm)',
                        marginTop: 'var(--space-1)',
                        fontFamily: '"Cairo", sans-serif',
                      }}
                    >
                      {errors.fromCity}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      marginBottom: 'var(--space-2)',
                      fontFamily: '"Cairo", sans-serif',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    إلى (مدينة الوصول)
                  </label>
                  <select
                    value={formData.toCity}
                    onChange={(e) => updateField('toCity', e.target.value)}
                    style={{
                      width: '100%',
                      padding: 'var(--space-3)',
                      border: `2px solid ${errors.toCity ? '#f88' : 'var(--border-light)'}`,
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)',
                      fontFamily: '"Cairo", sans-serif',
                      background: 'var(--surface-primary)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="">اختر المدينة</option>
                    {IRAQ_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {errors.toCity && (
                    <p
                      style={{
                        color: '#c00',
                        fontSize: 'var(--text-sm)',
                        marginTop: 'var(--space-1)',
                        fontFamily: '"Cairo", sans-serif',
                      }}
                    >
                      {errors.toCity}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* DateTime */}
            <div>
              <h3
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: '600',
                  marginBottom: 'var(--space-4)',
                  fontFamily: '"Cairo", sans-serif',
                  color: 'var(--text-primary)',
                }}
              >
                📅 التاريخ والوقت
              </h3>

              <div
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      marginBottom: 'var(--space-2)',
                      fontFamily: '"Cairo", sans-serif',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    التاريخ
                  </label>
                  <input
                    type="date"
                    value={formData.departureDate}
                    onChange={(e) => updateField('departureDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: 'var(--space-3)',
                      border: `2px solid ${errors.departureDate ? '#f88' : 'var(--border-light)'}`,
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)',
                      fontFamily: '"Cairo", sans-serif',
                      background: 'var(--surface-primary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  {errors.departureDate && (
                    <p
                      style={{
                        color: '#c00',
                        fontSize: 'var(--text-sm)',
                        marginTop: 'var(--space-1)',
                        fontFamily: '"Cairo", sans-serif',
                      }}
                    >
                      {errors.departureDate}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      marginBottom: 'var(--space-2)',
                      fontFamily: '"Cairo", sans-serif',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    الوقت
                  </label>
                  <input
                    type="time"
                    value={formData.departureTime}
                    onChange={(e) => updateField('departureTime', e.target.value)}
                    style={{
                      width: '100%',
                      padding: 'var(--space-3)',
                      border: `2px solid ${errors.departureTime ? '#f88' : 'var(--border-light)'}`,
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)',
                      fontFamily: '"Cairo", sans-serif',
                      background: 'var(--surface-primary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  {errors.departureTime && (
                    <p
                      style={{
                        color: '#c00',
                        fontSize: 'var(--text-sm)',
                        marginTop: 'var(--space-1)',
                        fontFamily: '"Cairo", sans-serif',
                      }}
                    >
                      {errors.departureTime}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Seats & Price */}
            <div>
              <h3
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: '600',
                  marginBottom: 'var(--space-4)',
                  fontFamily: '"Cairo", sans-serif',
                  color: 'var(--text-primary)',
                }}
              >
                💺 التفاصيل
              </h3>

              <div
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      marginBottom: 'var(--space-2)',
                      fontFamily: '"Cairo", sans-serif',
                      color: 'var(--text-secondary)',
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    المقاعد المتاحة
                  </label>
                  <select
                    value={formData.seats}
                    onChange={(e) => updateField('seats', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0 var(--space-3)',
                      border: `2px solid ${errors.seats ? '#f88' : 'var(--border-light)'}`,
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)',
                      fontFamily: '"Cairo", sans-serif',
                      background: 'var(--surface-primary)',
                      color: 'var(--text-primary)',
                      textAlign: 'center',
                      height: '48px',
                      lineHeight: '48px',
                      verticalAlign: 'middle',
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <option key={num} value={num}>
                        {num} مقعد
                      </option>
                    ))}
                  </select>
                  {errors.seats && (
                    <p
                      style={{
                        color: '#c00',
                        fontSize: 'var(--text-sm)',
                        marginTop: 'var(--space-1)',
                        fontFamily: '"Cairo", sans-serif',
                      }}
                    >
                      {errors.seats}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      marginBottom: 'var(--space-2)',
                      fontFamily: '"Cairo", sans-serif',
                      color: 'var(--text-secondary)',
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    السعر لكل مقعد (د.ع)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateField('price', e.target.value)}
                    placeholder="15000"
                    min="1000"
                    step="1000"
                    style={{
                      width: '100%',
                      padding: 'var(--space-3)',
                      border: `2px solid ${errors.price ? '#f88' : 'var(--border-light)'}`,
                      borderRadius: 'var(--radius)',
                      textAlign: 'center',
                      height: '48px',
                      fontSize: 'var(--text-base)',
                      fontFamily: '"Cairo", sans-serif',
                      background: 'var(--surface-primary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  {errors.price && (
                    <p
                      style={{
                        color: '#c00',
                        fontSize: 'var(--text-sm)',
                        marginTop: 'var(--space-1)',
                        fontFamily: '"Cairo", sans-serif',
                      }}
                    >
                      {errors.price}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: 'var(--space-4)',
                background: isSubmitting
                  ? 'var(--text-muted)'
                  : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-lg)',
                fontWeight: '700',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontFamily: '"Cairo", sans-serif',
                boxShadow: isSubmitting ? 'none' : 'var(--shadow-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                width: '100%',
              }}
            >
              {isSubmitting ? (
                <>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  جاري النشر...
                </>
              ) : (
                '🚗 نشر الرحلة'
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-15px,0);
          }
          70% {
            transform: translate3d(0,-7px,0);
          }
          90% {
            transform: translate3d(0,-2px,0);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
