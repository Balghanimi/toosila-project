import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Register({ onSwitchToLogin, onClose }) {
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'passenger', // default to passenger
    selfieImage: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Camera and selfie functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err) {
      setFormErrors(prev => ({ ...prev, selfie: 'لم نتمكن من الوصول إلى الكاميرا' }));
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
        setFormData(prev => ({ ...prev, selfieImage: file }));
        setSelfiePreview(URL.createObjectURL(blob));
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, selfieImage: file }));
      setSelfiePreview(URL.createObjectURL(file));
      if (formErrors.selfie) {
        setFormErrors(prev => ({ ...prev, selfie: '' }));
      }
    }
  };

  const removeSelfie = () => {
    setFormData(prev => ({ ...prev, selfieImage: null }));
    setSelfiePreview(null);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'الاسم مطلوب';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'الاسم يجب أن يكون حرفين على الأقل';
    }

    if (!formData.email.trim()) {
      errors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.password) {
      errors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 5) {
      errors.password = 'كلمة المرور يجب أن تكون 5 أحرف أو أرقام على الأقل';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'كلمة المرور غير متطابقة';
    }

    // Validate selfie for drivers only
    if (formData.userType === 'driver' && !formData.selfieImage) {
      errors.selfie = 'صورة السيلفي مطلوبة للسائقين';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await register(formData);
    if (result.success) {
      onClose();
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '32px',
      width: '100%',
      maxWidth: '460px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'none',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          color: '#6b7280',
          padding: '8px',
          zIndex: 1
        }}
      >
        ×
      </button>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1f2937',
          margin: '0 0 8px 0'
        }}>
          إنشاء حساب جديد
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          margin: '0'
        }}>
          انضم إلى مجتمع توصيلة
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '24px',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* User Type Selector */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            أريد التسجيل كـ
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, userType: 'passenger' }))}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: `2px solid ${formData.userType === 'passenger' ? '#3b82f6' : '#e5e7eb'}`,
                borderRadius: '8px',
                background: formData.userType === 'passenger' ? '#eff6ff' : 'white',
                color: formData.userType === 'passenger' ? '#1d4ed8' : '#6b7280',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '20px' }}>👤</span>
              راكب
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, userType: 'driver' }))}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: `2px solid ${formData.userType === 'driver' ? '#10b981' : '#e5e7eb'}`,
                borderRadius: '8px',
                background: formData.userType === 'driver' ? '#ecfdf5' : 'white',
                color: formData.userType === 'driver' ? '#047857' : '#6b7280',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '20px' }}>🚗</span>
              سائق
            </button>
          </div>
        </div>

        {/* Name Input */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            الاسم الكامل
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="أدخل اسمك الكامل"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `2px solid ${formErrors.name ? '#dc2626' : '#e5e7eb'}`,
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => !formErrors.name && (e.target.style.borderColor = '#3b82f6')}
            onBlur={(e) => !formErrors.name && (e.target.style.borderColor = '#e5e7eb')}
          />
          {formErrors.name && (
            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
              {formErrors.name}
            </div>
          )}
        </div>

        {/* Email Input */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            البريد الإلكتروني
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `2px solid ${formErrors.email ? '#dc2626' : '#e5e7eb'}`,
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => !formErrors.email && (e.target.style.borderColor = '#3b82f6')}
            onBlur={(e) => !formErrors.email && (e.target.style.borderColor = '#e5e7eb')}
          />
          {formErrors.email && (
            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
              {formErrors.email}
            </div>
          )}
        </div>

        {/* Selfie Upload for Drivers Only */}
        {formData.userType === 'driver' && (
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              📸 صورة سيلفي (مطلوبة للسائقين)
            </label>

            {!selfiePreview ? (
              <div style={{
                border: `2px dashed ${formErrors.selfie ? '#dc2626' : '#d1d5db'}`,
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                background: '#f9fafb'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤳</div>
                <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>
                  التقط صورة سيلفي واضحة لوجهك
                </p>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={startCamera}
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    📷 التقط صورة
                  </button>

                  <label style={{
                    padding: '10px 20px',
                    background: 'white',
                    color: '#10b981',
                    border: '2px solid #10b981',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📁 ارفع صورة
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '12px' }}>
                  الصورة ستُستخدم للتحقق من هويتك وزيادة الأمان
                </p>
              </div>
            ) : (
              <div style={{
                border: '2px solid #10b981',
                borderRadius: '12px',
                padding: '16px',
                background: '#f0fdf4'
              }}>
                <div style={{
                  position: 'relative',
                  width: '150px',
                  height: '150px',
                  margin: '0 auto 12px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid #10b981'
                }}>
                  <img
                    src={selfiePreview}
                    alt="Selfie preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <p style={{ textAlign: 'center', color: '#059669', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                  ✅ تم التقاط الصورة بنجاح
                </p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={removeSelfie}
                    style={{
                      padding: '8px 16px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ حذف
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      removeSelfie();
                      startCamera();
                    }}
                    style={{
                      padding: '8px 16px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    📷 التقط صورة جديدة
                  </button>
                </div>
              </div>
            )}

            {formErrors.selfie && (
              <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>
                {formErrors.selfie}
              </div>
            )}

            {/* Camera Modal */}
            {showCamera && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.9)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    borderRadius: '12px',
                    transform: 'scaleX(-1)' // Mirror effect
                  }}
                />
                <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    style={{
                      padding: '14px 32px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50px',
                      fontSize: '16px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    📸 التقط الصورة
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    style={{
                      padding: '14px 32px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50px',
                      fontSize: '16px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    ✖️ إلغاء
                  </button>
                </div>
              </div>
            )}

            {/* Hidden canvas for capturing photo */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        )}

        {/* Password Input */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            كلمة المرور
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="أدخل كلمة المرور (5 أحرف أو أرقام على الأقل)"
              style={{
                width: '100%',
                padding: '12px 48px 12px 16px',
                border: `2px solid ${formErrors.password ? '#dc2626' : '#e5e7eb'}`,
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => !formErrors.password && (e.target.style.borderColor = '#3b82f6')}
              onBlur={(e) => !formErrors.password && (e.target.style.borderColor = '#e5e7eb')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#6b7280'
              }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {formErrors.password && (
            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
              {formErrors.password}
            </div>
          )}
          
          {/* Password Instructions */}
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '6px',
            padding: '8px 12px',
            marginTop: '6px',
            fontSize: '12px',
            color: '#0369a1'
          }}>
            💡 <strong>تعليمات كلمة المرور:</strong>
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
              <li>أقل عدد 5 أحرف أو أرقام</li>
              <li>يمكن أن تكون أرقام فقط: مثل 12345</li>
              <li>يمكن أن تكون أحرف فقط: مثل abcde</li>
              <li>يمكن أن تكون مختلطة: مثل test1</li>
            </ul>
          </div>
        </div>

        {/* Confirm Password Input */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            تأكيد كلمة المرور
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="أعد كتابة كلمة المرور"
              style={{
                width: '100%',
                padding: '12px 48px 12px 16px',
                border: `2px solid ${formErrors.confirmPassword ? '#dc2626' : '#e5e7eb'}`,
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => !formErrors.confirmPassword && (e.target.style.borderColor = '#3b82f6')}
              onBlur={(e) => !formErrors.confirmPassword && (e.target.style.borderColor = '#e5e7eb')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#6b7280'
              }}
            >
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {formErrors.confirmPassword && (
            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
              {formErrors.confirmPassword}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            padding: '14px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            marginTop: '8px'
          }}
        >
          {loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء حساب'}
        </button>
      </form>

      {/* Switch to Login */}
      <div style={{
        textAlign: 'center',
        marginTop: '24px',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        لديك حساب بالفعل؟{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          style={{
            background: 'none',
            border: 'none',
            color: '#3b82f6',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          تسجيل الدخول
        </button>
      </div>
    </div>
  );
}

