import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOffers } from '../../context/OffersContext';
import DateTimeSelector from '../../components/DateTimeSelector';

export default function PostOfferModern() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnimated, setIsAnimated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    fromLocation: '',
    toLocation: '',
    date: '',
    time: '',
    seats: '',
    price: '',
    driverName: '',
    driverPhone: '',
    carModel: '',
    carColor: '',
    features: [],
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  const { addOffer } = useOffers();
  const navigate = useNavigate();

  useEffect(() => {
    setIsAnimated(true);
    // Set default date and time
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setFormData(prev => ({
      ...prev,
      date: tomorrow.toISOString().split('T')[0],
      time: '08:00'
    }));
  }, []);

  const IRAQ_LOCATIONS = [
    'بغداد - الكرخ', 'بغداد - الرصافة', 'بغداد - الكرادة', 'بغداد - الجادرية',
    'بغداد - الأعظمية', 'بغداد - مدينة الصدر', 'بغداد - الكاظمية',
    'البصرة - المركز', 'البصرة - الزبير', 'أربيل - المركز', 'الموصل - المركز',
    'كربلاء - المركز', 'النجف - المركز', 'السليمانية - المركز'
  ];

  const CAR_COLORS = ['أبيض', 'أسود', 'فضي', 'رمادي', 'أحمر', 'أزرق'];
  const CAR_FEATURES = ['تكييف', 'موسيقى', 'واي فاي', 'شاحن هاتف', 'لا تدخين', 'أمان عالي'];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch(step) {
      case 1:
        if (!formData.fromLocation) newErrors.fromLocation = 'اختر نقطة الانطلاق';
        if (!formData.toLocation) newErrors.toLocation = 'اختر نقطة الوصول';
        if (!formData.date) newErrors.date = 'اختر التاريخ';
        if (!formData.time) newErrors.time = 'اختر الوقت';
        break;
      case 2:
        if (!formData.seats) newErrors.seats = 'اختر عدد المقاعد';
        if (!formData.price) newErrors.price = 'أدخل السعر';
        if (!formData.driverName) newErrors.driverName = 'أدخل اسم السائق';
        if (!formData.driverPhone) newErrors.driverPhone = 'أدخل رقم الهاتف';
        break;
      default:
        // No validation needed for other steps
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      addOffer({
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      });
      setCurrentStep(3);
    } catch (error) {
      console.error('Error submitting offer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-6)',
              textAlign: 'center',
              fontFamily: '"Cairo", sans-serif'
            }}>
              🗺️ تفاصيل الرحلة
            </h2>

            <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
              {/* Route Section */}
              <div style={{
                background: 'var(--surface-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: '1px solid var(--border-light)'
              }}>
                <h3 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-4)',
                  fontFamily: '"Cairo", sans-serif'
                }}>
                  🛣️ المسار
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-4)'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--space-2)',
                      fontFamily: '"Cairo", sans-serif'
                    }}>
                      من
                    </label>
                    <select
                      value={formData.fromLocation}
                      onChange={(e) => updateFormData('fromLocation', e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'var(--space-3)',
                        border: `2px solid ${errors.fromLocation ? 'var(--error)' : 'var(--border-light)'}`,
                        borderRadius: 'var(--radius)',
                        fontSize: 'var(--text-base)',
                        background: 'var(--surface-primary)',
                        color: 'var(--text-primary)',
                        fontFamily: '"Cairo", sans-serif',
                        transition: 'var(--transition)',
                        outline: 'none'
                      }}
                    >
                      <option value="">اختر نقطة الانطلاق</option>
                      {IRAQ_LOCATIONS.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                    {errors.fromLocation && (
                      <p style={{ color: 'var(--error)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                        {errors.fromLocation}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--space-2)',
                      fontFamily: '"Cairo", sans-serif'
                    }}>
                      إلى
                    </label>
                    <select
                      value={formData.toLocation}
                      onChange={(e) => updateFormData('toLocation', e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'var(--space-3)',
                        border: `2px solid ${errors.toLocation ? 'var(--error)' : 'var(--border-light)'}`,
                        borderRadius: 'var(--radius)',
                        fontSize: 'var(--text-base)',
                        background: 'var(--surface-primary)',
                        color: 'var(--text-primary)',
                        fontFamily: '"Cairo", sans-serif',
                        transition: 'var(--transition)',
                        outline: 'none'
                      }}
                    >
                      <option value="">اختر نقطة الوصول</option>
                      {IRAQ_LOCATIONS.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                    {errors.toLocation && (
                      <p style={{ color: 'var(--error)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                        {errors.toLocation}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Date & Time Section */}
              {/* Date and Time */}
              <DateTimeSelector
                date={formData.date}
                time={formData.time}
                onDateChange={(date) => updateFormData('date', date)}
                onTimeChange={(time) => updateFormData('time', time)}
                errors={errors}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-6)',
              textAlign: 'center',
              fontFamily: '"Cairo", sans-serif'
            }}>
              👤 المعلومات الشخصية والسيارة
            </h2>

            <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
              {/* Trip Details */}
              <div style={{
                background: 'var(--surface-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: '1px solid var(--border-light)'
              }}>
                <h3 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-4)',
                  fontFamily: '"Cairo", sans-serif'
                }}>
                  💺 تفاصيل الرحلة
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-4)'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--space-2)',
                      fontFamily: '"Cairo", sans-serif'
                    }}>
                      عدد المقاعد المتاحة
                    </label>
                    <select
                      value={formData.seats}
                      onChange={(e) => updateFormData('seats', e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'var(--space-3)',
                        border: `2px solid ${errors.seats ? 'var(--error)' : 'var(--border-light)'}`,
                        borderRadius: 'var(--radius)',
                        fontSize: 'var(--text-base)',
                        background: 'var(--surface-primary)',
                        color: 'var(--text-primary)',
                        fontFamily: '"Cairo", sans-serif',
                        transition: 'var(--transition)',
                        outline: 'none'
                      }}
                    >
                      <option value="">اختر عدد المقاعد</option>
                      {[1,2,3,4,5,6,7].map(num => (
                        <option key={num} value={num}>{num} مقعد</option>
                      ))}
                    </select>
                    {errors.seats && (
                      <p style={{ color: 'var(--error)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                        {errors.seats}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--space-2)',
                      fontFamily: '"Cairo", sans-serif'
                    }}>
                      السعر لكل مقعد (د.ع)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => updateFormData('price', e.target.value)}
                      placeholder="15000"
                      min="1000"
                      step="500"
                      style={{
                        width: '100%',
                        padding: 'var(--space-3)',
                        border: `2px solid ${errors.price ? 'var(--error)' : 'var(--border-light)'}`,
                        borderRadius: 'var(--radius)',
                        fontSize: 'var(--text-base)',
                        background: 'var(--surface-primary)',
                        color: 'var(--text-primary)',
                        fontFamily: '"Cairo", sans-serif',
                        transition: 'var(--transition)',
                        outline: 'none'
                      }}
                    />
                    {errors.price && (
                      <p style={{ color: 'var(--error)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                        {errors.price}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Driver Info */}
              <div style={{
                background: 'var(--surface-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: '1px solid var(--border-light)'
              }}>
                <h3 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-4)',
                  fontFamily: '"Cairo", sans-serif'
                }}>
                  👤 معلومات السائق
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-4)'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--space-2)',
                      fontFamily: '"Cairo", sans-serif'
                    }}>
                      اسم السائق
                    </label>
                    <input
                      type="text"
                      value={formData.driverName}
                      onChange={(e) => updateFormData('driverName', e.target.value)}
                      placeholder="أدخل اسم السائق"
                      style={{
                        width: '100%',
                        padding: 'var(--space-3)',
                        border: `2px solid ${errors.driverName ? 'var(--error)' : 'var(--border-light)'}`,
                        borderRadius: 'var(--radius)',
                        fontSize: 'var(--text-base)',
                        background: 'var(--surface-primary)',
                        color: 'var(--text-primary)',
                        fontFamily: '"Cairo", sans-serif',
                        transition: 'var(--transition)',
                        outline: 'none'
                      }}
                    />
                    {errors.driverName && (
                      <p style={{ color: 'var(--error)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                        {errors.driverName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--space-2)',
                      fontFamily: '"Cairo", sans-serif'
                    }}>
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      value={formData.driverPhone}
                      onChange={(e) => updateFormData('driverPhone', e.target.value)}
                      placeholder="07xxxxxxxxx"
                      style={{
                        width: '100%',
                        padding: 'var(--space-3)',
                        border: `2px solid ${errors.driverPhone ? 'var(--error)' : 'var(--border-light)'}`,
                        borderRadius: 'var(--radius)',
                        fontSize: 'var(--text-base)',
                        background: 'var(--surface-primary)',
                        color: 'var(--text-primary)',
                        fontFamily: '"Cairo", sans-serif',
                        transition: 'var(--transition)',
                        outline: 'none'
                      }}
                    />
                    {errors.driverPhone && (
                      <p style={{ color: 'var(--error)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                        {errors.driverPhone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Car Info */}
              <div style={{
                background: 'var(--surface-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: '1px solid var(--border-light)'
              }}>
                <h3 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-4)',
                  fontFamily: '"Cairo", sans-serif'
                }}>
                  🚗 معلومات السيارة
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-4)',
                  marginBottom: 'var(--space-4)'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--space-2)',
                      fontFamily: '"Cairo", sans-serif'
                    }}>
                      موديل السيارة
                    </label>
                    <input
                      type="text"
                      value={formData.carModel}
                      onChange={(e) => updateFormData('carModel', e.target.value)}
                      placeholder="تويوتا كورولا 2020"
                      style={{
                        width: '100%',
                        padding: 'var(--space-3)',
                        border: '2px solid var(--border-light)',
                        borderRadius: 'var(--radius)',
                        fontSize: 'var(--text-base)',
                        background: 'var(--surface-primary)',
                        color: 'var(--text-primary)',
                        fontFamily: '"Cairo", sans-serif',
                        transition: 'var(--transition)',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--space-2)',
                      fontFamily: '"Cairo", sans-serif'
                    }}>
                      لون السيارة
                    </label>
                    <select
                      value={formData.carColor}
                      onChange={(e) => updateFormData('carColor', e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'var(--space-3)',
                        border: '2px solid var(--border-light)',
                        borderRadius: 'var(--radius)',
                        fontSize: 'var(--text-base)',
                        background: 'var(--surface-primary)',
                        color: 'var(--text-primary)',
                        fontFamily: '"Cairo", sans-serif',
                        transition: 'var(--transition)',
                        outline: 'none'
                      }}
                    >
                      <option value="">اختر لون السيارة</option>
                      {CAR_COLORS.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-3)',
                    fontFamily: '"Cairo", sans-serif'
                  }}>
                    مميزات السيارة (اختياري)
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: 'var(--space-2)'
                  }}>
                    {CAR_FEATURES.map(feature => (
                      <button
                        key={feature}
                        type="button"
                        onClick={() => toggleFeature(feature)}
                        style={{
                          padding: 'var(--space-2) var(--space-3)',
                          border: `2px solid ${formData.features.includes(feature) ? 'var(--primary)' : 'var(--border-light)'}`,
                          borderRadius: 'var(--radius)',
                          background: formData.features.includes(feature) ? 'var(--primary)' : 'var(--surface-primary)',
                          color: formData.features.includes(feature) ? 'white' : 'var(--text-secondary)',
                          fontSize: 'var(--text-sm)',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'var(--transition)',
                          fontFamily: '"Cairo", sans-serif'
                        }}
                      >
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div style={{ 
            animation: 'fadeInUp 0.5s ease-out',
            textAlign: 'center'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-6) auto',
              fontSize: '3rem',
              animation: 'bounce 1s infinite'
            }}>
              ✅
            </div>

            <h2 style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: '800',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-4)',
              fontFamily: '"Cairo", sans-serif'
            }}>
              تم نشر رحلتك بنجاح! 🎉
            </h2>

            <p style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-8)',
              fontFamily: '"Cairo", sans-serif',
              lineHeight: '1.6'
            }}>
              سيتمكن الركاب الآن من رؤية رحلتك والتواصل معك.<br />
              ستصلك إشعارات عند وجود طلبات حجز جديدة.
            </p>

            <div style={{
              display: 'flex',
              gap: 'var(--space-4)',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => navigate('/offers')}
                style={{
                  padding: 'var(--space-4) var(--space-6)',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-base)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  fontFamily: '"Cairo", sans-serif',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                🔍 عرض جميع الرحلات
              </button>

              <button
                onClick={() => navigate('/')}
                style={{
                  padding: 'var(--space-4) var(--space-6)',
                  background: 'var(--surface-secondary)',
                  color: 'var(--text-primary)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-base)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  fontFamily: '"Cairo", sans-serif'
                }}
              >
                🏠 العودة للرئيسية
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      paddingBottom: '100px'
    }}>
      <div className="container" style={{
        paddingTop: 'var(--space-6)',
        transform: isAnimated ? 'translateY(0)' : 'translateY(20px)',
        opacity: isAnimated ? 1 : 0,
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--space-8)'
        }}>
          <h1 style={{
            fontSize: 'var(--text-3xl)',
            fontWeight: '800',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-2)',
            fontFamily: '"Cairo", sans-serif'
          }}>
            🚗 نشر رحلة جديدة
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--text-lg)',
            fontFamily: '"Cairo", sans-serif',
            fontWeight: '500'
          }}>
            شارك رحلتك مع ركاب آخرين
          </p>
        </div>

        {/* Progress Steps */}
        {currentStep < 3 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-8)',
            padding: 'var(--space-4)',
            background: 'var(--surface-primary)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-light)'
          }}>
            {[1, 2].map((stepNumber, index) => (
              <React.Fragment key={stepNumber}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: stepNumber <= currentStep 
                      ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
                      : 'var(--surface-tertiary)',
                    color: stepNumber <= currentStep ? 'white' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--text-lg)',
                    fontWeight: '700',
                    transition: 'var(--transition)',
                    boxShadow: stepNumber <= currentStep ? 'var(--shadow-md)' : 'none'
                  }}>
                    {stepNumber < currentStep ? '✅' : stepNumber === currentStep ? '📍' : '⚪'}
                  </div>
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    color: stepNumber <= currentStep ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontFamily: '"Cairo", sans-serif'
                  }}>
                    {stepNumber === 1 && 'تفاصيل الرحلة'}
                    {stepNumber === 2 && 'المعلومات الشخصية'}
                  </span>
                </div>
                {index < 1 && (
                  <div style={{
                    width: '40px',
                    height: '2px',
                    background: stepNumber < currentStep ? 'var(--primary)' : 'var(--border-light)',
                    borderRadius: '1px',
                    transition: 'var(--transition)'
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div style={{
          background: 'var(--surface-primary)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-light)',
          marginBottom: 'var(--space-6)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            {renderStepContent()}
          </div>
        </div>

        {/* Navigation Buttons */}
        {currentStep < 3 && (
          <div style={{
            display: 'flex',
            gap: 'var(--space-4)',
            justifyContent: 'space-between'
          }}>
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              style={{
                padding: 'var(--space-4) var(--space-6)',
                background: 'var(--surface-secondary)',
                color: currentStep === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                border: '2px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                transition: 'var(--transition)',
                fontFamily: '"Cairo", sans-serif',
                opacity: currentStep === 1 ? 0.5 : 1
              }}
            >
              ← السابق
            </button>

            {currentStep < 2 ? (
              <button
                onClick={handleNext}
                style={{
                  padding: 'var(--space-4) var(--space-6)',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-base)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  fontFamily: '"Cairo", sans-serif',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                التالي →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  padding: 'var(--space-4) var(--space-8)',
                  background: isSubmitting
                    ? 'var(--text-muted)'
                    : 'linear-gradient(135deg, var(--success) 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: '700',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'var(--transition)',
                  fontFamily: '"Cairo", sans-serif',
                  boxShadow: isSubmitting ? 'none' : 'var(--shadow-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)'
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    جاري النشر...
                  </>
                ) : (
                  <>
                    🚗 نشر الرحلة
                  </>
                )}
              </button>
            )}
          </div>
        )}
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
