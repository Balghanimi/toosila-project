import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { otpAPI } from '../services/api';
import './PhoneLogin.css';

const PhoneLogin = () => {
  const [step, setStep] = useState(1); // 1: phone, 2: code, 3: profile
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [isDriver, setIsDriver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [channel, setChannel] = useState('');
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();
  const { login } = useAuth();
  const codeInputsRef = useRef([]);
  const countdownTimerRef = useRef(null);

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, code, name]);

  // Cleanup countdown timer on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  // Format phone display (07X XXX XXXX)
  const formatPhoneDisplay = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 10)
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
  };

  // Start resend countdown
  const startCountdown = () => {
    setCountdown(60);
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Send OTP (or direct login for existing users)
  const handleSendOTP = async () => {
    const cleanedPhone = phone.replace(/\D/g, '');
    if (!cleanedPhone || cleanedPhone.length < 10) {
      setError('الرجاء إدخال رقم هاتف صحيح');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await otpAPI.send(cleanedPhone);

      // Check if user already exists (no OTP needed)
      if (response.userExists) {
        // Direct login for existing user
        console.log('Existing user detected, logging in directly...');
        const loginResponse = await otpAPI.loginExisting(cleanedPhone);
        login(loginResponse.token, loginResponse.user);
        navigate('/');
        return;
      }

      // New user - proceed with OTP verification
      setChannel(response.channel);
      setStep(2);
      startCountdown();
      // Focus first code input after step change
      setTimeout(() => {
        if (codeInputsRef.current[0]) {
          codeInputsRef.current[0].focus();
        }
      }, 100);
    } catch (err) {
      setError(err.message || 'فشل في إرسال رمز التحقق');
    } finally {
      setLoading(false);
    }
  };

  // Handle code input
  const handleCodeChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      codeInputsRef.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (index === 5 && value) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        setTimeout(() => handleVerifyOTP(fullCode), 100);
      }
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
      }
      setCode(newCode);

      // Focus appropriate input
      if (pastedData.length === 6) {
        setTimeout(() => handleVerifyOTP(pastedData), 100);
      } else {
        codeInputsRef.current[pastedData.length]?.focus();
      }
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (codeString = null) => {
    const otpCode = codeString || code.join('');
    if (otpCode.length !== 6) {
      setError('الرجاء إدخال رمز التحقق كاملاً');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cleanedPhone = phone.replace(/\D/g, '');
      const response = await otpAPI.verify(cleanedPhone, otpCode);

      if (response.isNewUser) {
        setStep(3);
      } else {
        // Existing user - login
        login(response.token, response.user);
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'رمز التحقق غير صحيح');
      // Clear code inputs
      setCode(['', '', '', '', '', '']);
      codeInputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Complete registration
  const handleCompleteRegistration = async () => {
    if (!name.trim()) {
      setError('الرجاء إدخال الاسم');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cleanedPhone = phone.replace(/\D/g, '');
      const response = await otpAPI.completeRegistration(cleanedPhone, name.trim(), isDriver);
      login(response.token, response.user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'فشل في إكمال التسجيل');
    } finally {
      setLoading(false);
    }
  };

  // Handle phone input change
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      setPhone(value);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="phone-login-container">
      <div className="phone-login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-icon">🚗</div>
          <h1>توصيلة</h1>
          <p className="logo-subtitle">رحلات مشتركة آمنة وموثوقة</p>
        </div>

        {/* Step 1: Phone Number */}
        {step === 1 && (
          <div className="login-step">
            <h2>مرحباً بك</h2>
            <p>أدخل رقم هاتفك للمتابعة</p>

            <div className="phone-input-container">
              <div className="country-code">
                <span className="flag">🇮🇶</span>
                <span className="code">+964</span>
              </div>
              <input
                type="tel"
                value={formatPhoneDisplay(phone)}
                onChange={handlePhoneChange}
                onKeyPress={(e) => handleKeyPress(e, handleSendOTP)}
                placeholder="7XX XXX XXXX"
                maxLength={14}
                autoFocus
                dir="ltr"
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <button className="submit-btn" onClick={handleSendOTP} disabled={loading}>
              {loading ? (
                <span className="loading-spinner">
                  <span className="spinner"></span>
                  جاري الإرسال...
                </span>
              ) : (
                'إرسال رمز التحقق'
              )}
            </button>

            <p className="terms-text">
              بالمتابعة، أنت توافق على <a href="/privacy-policy">سياسة الخصوصية</a> و
              <a href="/about">شروط الاستخدام</a>
            </p>
          </div>
        )}

        {/* Step 2: OTP Code */}
        {step === 2 && (
          <div className="login-step">
            <h2>رمز التحقق</h2>
            <p>
              تم إرسال رمز التحقق إلى
              <br />
              <strong dir="ltr" className="phone-display">
                +964 {formatPhoneDisplay(phone)}
              </strong>
              <br />
              <span className="channel-info">
                عبر {channel === 'whatsapp' ? 'واتساب 💬' : 'رسالة نصية 📱'}
              </span>
            </p>

            <div className="code-inputs" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (codeInputsRef.current[index] = el)}
                  type="tel"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  maxLength={1}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error && <p className="error-message">{error}</p>}

            <button
              className="submit-btn"
              onClick={() => handleVerifyOTP()}
              disabled={loading || code.join('').length !== 6}
            >
              {loading ? (
                <span className="loading-spinner">
                  <span className="spinner"></span>
                  جاري التحقق...
                </span>
              ) : (
                'تأكيد'
              )}
            </button>

            <div className="resend-section">
              {countdown > 0 ? (
                <p className="countdown-text">
                  إعادة الإرسال بعد <span className="countdown-number">{countdown}</span> ثانية
                </p>
              ) : (
                <button className="resend-btn" onClick={handleSendOTP} disabled={loading}>
                  إعادة إرسال الرمز
                </button>
              )}
            </div>

            <button
              className="back-btn"
              onClick={() => {
                setStep(1);
                setCode(['', '', '', '', '', '']);
                setError('');
              }}
            >
              ← تغيير رقم الهاتف
            </button>
          </div>
        )}

        {/* Step 3: Complete Profile */}
        {step === 3 && (
          <div className="login-step">
            <h2>أكمل معلوماتك</h2>
            <p>مرحباً! أخبرنا المزيد عنك</p>

            <div className="form-group">
              <label htmlFor="name">الاسم الكامل</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleCompleteRegistration)}
                placeholder="أدخل اسمك"
                autoFocus
              />
            </div>

            <div className="user-type-selector">
              <label>كيف ستستخدم توصيلة؟</label>
              <div className="type-options">
                <button
                  type="button"
                  className={`type-option ${!isDriver ? 'active' : ''}`}
                  onClick={() => setIsDriver(false)}
                >
                  <span className="type-icon">👤</span>
                  <span className="type-label">راكب</span>
                  <span className="type-desc">أبحث عن رحلات</span>
                </button>
                <button
                  type="button"
                  className={`type-option ${isDriver ? 'active' : ''}`}
                  onClick={() => setIsDriver(true)}
                >
                  <span className="type-icon">🚗</span>
                  <span className="type-label">سائق</span>
                  <span className="type-desc">أقدم رحلات</span>
                </button>
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button
              className="submit-btn"
              onClick={handleCompleteRegistration}
              disabled={loading || !name.trim()}
            >
              {loading ? (
                <span className="loading-spinner">
                  <span className="spinner"></span>
                  جاري التسجيل...
                </span>
              ) : (
                'ابدأ الآن 🚀'
              )}
            </button>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="step-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}></div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`step-dot ${step >= 3 ? 'active' : ''}`}></div>
        </div>
      </div>
    </div>
  );
};

export default PhoneLogin;
