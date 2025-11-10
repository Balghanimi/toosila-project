import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const PhoneAuth = ({ onClose, mode = 'login' }) => {
  const [step, setStep] = useState(1); // 1: phone, 2: otp, 3: profile
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isAnimated, setIsAnimated] = useState(false);

  // Profile data for registration
  const [profileData, setProfileData] = useState({
    name: '',
    userType: 'passenger', // driver or passenger
    city: '',
    birthYear: '',
  });

  const { login, register, setError: setAuthError } = useAuth();
  const otpRefs = useRef([]);

  useEffect(() => {
    setIsAnimated(true);
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const IRAQI_CITIES = [
    'بغداد',
    'البصرة',
    'أربيل',
    'الموصل',
    'كربلاء',
    'النجف',
    'السليمانية',
    'دهوك',
    'الأنبار',
    'نينوى',
    'كركوك',
    'صلاح الدين',
  ];

  const validateIraqiPhone = (phoneNumber) => {
    // Iraqi phone format: 07xxxxxxxxx (11 digits total)
    const iraqiPhoneRegex = /^07[0-9]{9}$/;
    return iraqiPhoneRegex.test(phoneNumber);
  };

  const formatPhoneDisplay = (phoneNumber) => {
    if (phoneNumber.length >= 3) {
      return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    return phoneNumber;
  };

  const sendOTP = async () => {
    if (!validateIraqiPhone(phone)) {
      setError('يرجى إدخال رقم هاتف عراقي صحيح (07xxxxxxxxx)');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate OTP sending
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In real app, this would call your backend API
      console.log(`Sending OTP to ${phone}`);

      setStep(2);
      setCountdown(60);
      setError('');
    } catch (err) {
      setError('فشل في إرسال رمز التحقق. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('يرجى إدخال رمز التحقق كاملاً');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate OTP verification
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For demo purposes, accept any 6-digit code
      if (otpCode === '123456' || otpCode.length === 6) {
        if (mode === 'login') {
          // Try to login existing user
          try {
            await login({ phone });
            onClose();
          } catch (loginError) {
            // User doesn't exist, redirect to registration
            setStep(3);
          }
        } else {
          // Registration mode
          setStep(3);
        }
      } else {
        setError('رمز التحقق غير صحيح');
      }
    } catch (err) {
      setError('فشل في التحقق. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const completeRegistration = async () => {
    if (!profileData.name.trim()) {
      setError('يرجى إدخال الاسم الكامل');
      return;
    }
    if (!profileData.city) {
      setError('يرجى اختيار المدينة');
      return;
    }
    if (!profileData.birthYear || profileData.birthYear < 1960 || profileData.birthYear > 2006) {
      setError('يرجى إدخال سنة ميلاد صحيحة');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await register({
        phone,
        name: profileData.name,
        userType: profileData.userType,
        city: profileData.city,
        birthYear: profileData.birthYear,
        isVerified: true,
        joinDate: new Date().toISOString(),
      });

      onClose();
    } catch (err) {
      setError('فشل في إنشاء الحساب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const resendOTP = () => {
    if (countdown > 0) return;
    setOtp(['', '', '', '', '', '']);
    sendOTP();
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <div
              style={{
                textAlign: 'center',
                marginBottom: 'var(--space-6)',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-4) auto',
                  fontSize: '2rem',
                }}
              >
                📱
              </div>
              <h2
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-2)',
                  fontFamily: '"Cairo", sans-serif',
                }}
              >
                تسجيل الدخول
              </h2>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--text-base)',
                  fontFamily: '"Cairo", sans-serif',
                }}
              >
                أدخل رقم هاتفك لإرسال رمز التحقق
              </p>
            </div>

            <div style={{ marginBottom: 'var(--space-6)' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: 'var(--space-2)',
                  fontFamily: '"Cairo", sans-serif',
                }}
              >
                رقم الهاتف
              </label>
              <div
                style={{
                  position: 'relative',
                }}
              >
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only digits
                    if (value.length <= 11) {
                      setPhone(value);
                      setError('');
                    }
                  }}
                  placeholder="07xxxxxxxxx"
                  style={{
                    width: '100%',
                    padding: 'var(--space-4) var(--space-6) var(--space-4) var(--space-4)',
                    border: `2px solid ${error ? 'var(--error)' : 'var(--border-light)'}`,
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--text-lg)',
                    background: 'var(--surface-primary)',
                    color: 'var(--text-primary)',
                    fontFamily: '"Cairo", sans-serif',
                    fontWeight: '600',
                    direction: 'ltr',
                    textAlign: 'center',
                    letterSpacing: '1px',
                    transition: 'var(--transition)',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.boxShadow = 'var(--focus-ring)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = error ? 'var(--error)' : 'var(--border-light)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: 'var(--space-4)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'var(--surface-secondary)',
                    padding: 'var(--space-1) var(--space-2)',
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    fontWeight: '600',
                  }}
                >
                  🇮🇶 +964
                </div>
              </div>
              {phone && (
                <div
                  style={{
                    marginTop: 'var(--space-2)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  {formatPhoneDisplay(phone)}
                </div>
              )}
              {error && (
                <p
                  style={{
                    color: 'var(--error)',
                    fontSize: 'var(--text-sm)',
                    marginTop: 'var(--space-2)',
                    textAlign: 'center',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  {error}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <div
              style={{
                textAlign: 'center',
                marginBottom: 'var(--space-6)',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-4) auto',
                  fontSize: '2rem',
                }}
              >
                🔐
              </div>
              <h2
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-2)',
                  fontFamily: '"Cairo", sans-serif',
                }}
              >
                رمز التحقق
              </h2>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--text-base)',
                  fontFamily: '"Cairo", sans-serif',
                  lineHeight: '1.5',
                }}
              >
                أدخل الرمز المرسل إلى
                <br />
                <strong style={{ color: 'var(--primary)' }}>{formatPhoneDisplay(phone)}</strong>
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                justifyContent: 'center',
                marginBottom: 'var(--space-6)',
              }}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  maxLength={1}
                  style={{
                    width: '50px',
                    height: '60px',
                    border: `2px solid ${error ? 'var(--error)' : 'var(--border-light)'}`,
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--text-xl)',
                    fontWeight: '700',
                    textAlign: 'center',
                    background: 'var(--surface-primary)',
                    color: 'var(--text-primary)',
                    transition: 'var(--transition)',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.boxShadow = 'var(--focus-ring)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = error ? 'var(--error)' : 'var(--border-light)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              ))}
            </div>

            <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
              <button
                onClick={resendOTP}
                disabled={countdown > 0}
                style={{
                  background: 'none',
                  border: 'none',
                  color: countdown > 0 ? 'var(--text-muted)' : 'var(--primary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                  fontFamily: '"Cairo", sans-serif',
                  textDecoration: countdown > 0 ? 'none' : 'underline',
                }}
              >
                {countdown > 0 ? `إعادة الإرسال بعد ${countdown}s` : 'إعادة إرسال الرمز'}
              </button>
            </div>

            {error && (
              <p
                style={{
                  color: 'var(--error)',
                  fontSize: 'var(--text-sm)',
                  textAlign: 'center',
                  fontFamily: '"Cairo", sans-serif',
                  marginBottom: 'var(--space-4)',
                }}
              >
                {error}
              </p>
            )}
          </div>
        );

      case 3:
        return (
          <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <div
              style={{
                textAlign: 'center',
                marginBottom: 'var(--space-6)',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-4) auto',
                  fontSize: '2rem',
                }}
              >
                👤
              </div>
              <h2
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-2)',
                  fontFamily: '"Cairo", sans-serif',
                }}
              >
                إكمال الملف الشخصي
              </h2>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--text-base)',
                  fontFamily: '"Cairo", sans-serif',
                }}
              >
                نحتاج بعض المعلومات لإنشاء حسابك
              </p>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              {/* Name */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-2)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="أدخل اسمك الكامل"
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
                    outline: 'none',
                  }}
                />
              </div>

              {/* User Type */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-3)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  نوع المستخدم
                </label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 'var(--space-3)',
                  }}
                >
                  {[
                    { value: 'passenger', label: 'راكب', icon: '🧑‍🤝‍🧑', desc: 'أبحث عن رحلات' },
                    { value: 'driver', label: 'سائق', icon: '🚗', desc: 'أقدم رحلات' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setProfileData((prev) => ({ ...prev, userType: type.value }))}
                      style={{
                        padding: 'var(--space-4)',
                        border: `2px solid ${profileData.userType === type.value ? 'var(--primary)' : 'var(--border-light)'}`,
                        borderRadius: 'var(--radius-lg)',
                        background:
                          profileData.userType === type.value
                            ? 'rgba(52, 199, 89, 0.1)'
                            : 'var(--surface-primary)',
                        color:
                          profileData.userType === type.value
                            ? 'var(--primary)'
                            : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
                        {type.icon}
                      </div>
                      <div
                        style={{
                          fontSize: 'var(--text-base)',
                          fontWeight: '600',
                          marginBottom: 'var(--space-1)',
                          fontFamily: '"Cairo", sans-serif',
                        }}
                      >
                        {type.label}
                      </div>
                      <div
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontFamily: '"Cairo", sans-serif',
                        }}
                      >
                        {type.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* City */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-2)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  المدينة
                </label>
                <select
                  value={profileData.city}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, city: e.target.value }))}
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
                    outline: 'none',
                  }}
                >
                  <option value="">اختر المدينة</option>
                  {IRAQI_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Birth Year */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-2)',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  سنة الميلاد
                </label>
                <input
                  type="number"
                  value={profileData.birthYear}
                  onChange={(e) =>
                    setProfileData((prev) => ({ ...prev, birthYear: parseInt(e.target.value) }))
                  }
                  placeholder="1990"
                  min="1960"
                  max="2006"
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
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {error && (
              <p
                style={{
                  color: 'var(--error)',
                  fontSize: 'var(--text-sm)',
                  textAlign: 'center',
                  fontFamily: '"Cairo", sans-serif',
                  marginTop: 'var(--space-4)',
                }}
              >
                {error}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getActionButton = () => {
    switch (step) {
      case 1:
        return (
          <button
            onClick={sendOTP}
            disabled={!validateIraqiPhone(phone) || isLoading}
            style={{
              width: '100%',
              padding: 'var(--space-4)',
              background:
                !validateIraqiPhone(phone) || isLoading
                  ? 'var(--text-muted)'
                  : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-lg)',
              fontWeight: '700',
              cursor: !validateIraqiPhone(phone) || isLoading ? 'not-allowed' : 'pointer',
              transition: 'var(--transition)',
              fontFamily: '"Cairo", sans-serif',
              boxShadow: !validateIraqiPhone(phone) || isLoading ? 'none' : 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
            }}
          >
            {isLoading ? (
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
                جاري الإرسال...
              </>
            ) : (
              '📱 إرسال رمز التحقق'
            )}
          </button>
        );

      case 2:
        return (
          <button
            onClick={verifyOTP}
            disabled={otp.join('').length !== 6 || isLoading}
            style={{
              width: '100%',
              padding: 'var(--space-4)',
              background:
                otp.join('').length !== 6 || isLoading
                  ? 'var(--text-muted)'
                  : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-lg)',
              fontWeight: '700',
              cursor: otp.join('').length !== 6 || isLoading ? 'not-allowed' : 'pointer',
              transition: 'var(--transition)',
              fontFamily: '"Cairo", sans-serif',
              boxShadow: otp.join('').length !== 6 || isLoading ? 'none' : 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
            }}
          >
            {isLoading ? (
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
                جاري التحقق...
              </>
            ) : (
              '🔐 التحقق من الرمز'
            )}
          </button>
        );

      case 3:
        return (
          <button
            onClick={completeRegistration}
            disabled={!profileData.name || !profileData.city || !profileData.birthYear || isLoading}
            style={{
              width: '100%',
              padding: 'var(--space-4)',
              background:
                !profileData.name || !profileData.city || !profileData.birthYear || isLoading
                  ? 'var(--text-muted)'
                  : 'linear-gradient(135deg, var(--success) 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-lg)',
              fontWeight: '700',
              cursor:
                !profileData.name || !profileData.city || !profileData.birthYear || isLoading
                  ? 'not-allowed'
                  : 'pointer',
              transition: 'var(--transition)',
              fontFamily: '"Cairo", sans-serif',
              boxShadow:
                !profileData.name || !profileData.city || !profileData.birthYear || isLoading
                  ? 'none'
                  : 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
            }}
          >
            {isLoading ? (
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
                جاري إنشاء الحساب...
              </>
            ) : (
              '✅ إنشاء الحساب'
            )}
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--space-4)',
        backdropFilter: 'blur(8px)',
        opacity: isAnimated ? 1 : 0,
        transition: 'opacity 0.3s ease-out',
      }}
    >
      <div
        style={{
          background: 'var(--surface-primary)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          maxWidth: '400px',
          width: '100%',
          boxShadow: 'var(--shadow-2xl)',
          border: '1px solid var(--border-light)',
          position: 'relative',
          transform: isAnimated ? 'scale(1)' : 'scale(0.9)',
          transition: 'transform 0.3s ease-out',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 'var(--space-4)',
            left: 'var(--space-4)',
            background: 'var(--surface-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontSize: 'var(--text-lg)',
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'var(--surface-tertiary)';
            e.target.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'var(--surface-secondary)';
            e.target.style.color = 'var(--text-secondary)';
          }}
        >
          ×
        </button>

        {/* Content */}
        {renderStepContent()}

        {/* Action Button */}
        <div style={{ marginTop: 'var(--space-6)' }}>{getActionButton()}</div>

        {/* Demo Info */}
        {step === 2 && (
          <div
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              background: 'var(--surface-secondary)',
              borderRadius: 'var(--radius)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-secondary)',
                margin: 0,
                fontFamily: '"Cairo", sans-serif',
              }}
            >
              💡 للتجربة: استخدم أي رمز من 6 أرقام
            </p>
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

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PhoneAuth;
