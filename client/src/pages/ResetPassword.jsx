import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/ResetPassword.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ResetPassword = () => {
  const { user } = useAuth();
  const { token } = useParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState(null); // null, 'resetting', 'success', 'error'
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [countdown, setCountdown] = useState(3);

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerifying(false);
        setTokenValid(false);
        setMessage('رابط غير صالح / Invalid link');
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/api/password-reset/verify/${token}`
        );

        if (response.data.success) {
          setTokenValid(true);
        }
      } catch (error) {
        setTokenValid(false);
        if (error.response?.data?.error) {
          setMessage(error.response.data.error.message);
        } else {
          setMessage('الرابط غير صالح أو منتهي الصلاحية');
        }
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  // Countdown for redirect after success
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      navigate('/login');
    }
  }, [status, countdown, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'كلمة المرور مطلوبة';
    } else if (formData.newPassword.length < 5) {
      newErrors.newPassword = 'كلمة المرور يجب أن تكون 5 أحرف على الأقل';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setStatus('resetting');
    setMessage('');

    try {
      const response = await axios.post(
        `${API_URL}/api/password-reset/reset`,
        {
          token,
          newPassword: formData.newPassword
        }
      );

      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message);
      }
    } catch (error) {
      setStatus('error');
      if (error.response?.data?.error) {
        setMessage(error.response.data.error.message);
      } else {
        setMessage('فشل في إعادة تعيين كلمة المرور. حاول مرة أخرى.');
      }
    }
  };

  if (verifying) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="spinner-large"></div>
          <h2>جاري التحقق من الرابط...</h2>
          <p>Verifying link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="error-icon-large">✗</div>
          <h2>رابط غير صالح</h2>
          <h3>Invalid Link</h3>
          <p className="error-message">{message}</p>
          <div className="actions">
            <Link to="/forgot-password" className="btn-secondary">
              طلب رابط جديد / Request New Link
            </Link>
            <Link to="/login" className="btn-primary">
              تسجيل الدخول / Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="success-icon-large">✓</div>
          <h2>تم بنجاح!</h2>
          <h3>Success!</h3>
          <p className="success-message">{message}</p>
          <p className="redirect-message">
            سيتم التوجيه لتسجيل الدخول خلال {countdown} ثوانٍ...
          </p>
          <p className="redirect-message-en">
            Redirecting to login in {countdown} seconds...
          </p>
          <Link to="/login" className="btn-primary">
            تسجيل الدخول الآن / Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="icon-container">
          <div className="key-icon">🔑</div>
        </div>

        <h2>إعادة تعيين كلمة المرور</h2>
        <h3>Reset Password</h3>

        <p className="instruction">
          أدخل كلمة المرور الجديدة
        </p>
        <p className="instruction-en">
          Enter your new password
        </p>

        <form onSubmit={handleSubmit} className="reset-password-form">
          {/* New Password */}
          <div className="form-group">
            <label>كلمة المرور الجديدة / New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="أدخل كلمة المرور الجديدة"
                className={errors.newPassword ? 'error' : ''}
                disabled={status === 'resetting'}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.newPassword && (
              <span className="error-text">{errors.newPassword}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label>تأكيد كلمة المرور / Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="أعد كتابة كلمة المرور"
                className={errors.confirmPassword ? 'error' : ''}
                disabled={status === 'resetting'}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Password Requirements */}
          <div className="password-requirements">
            <p className="requirement-title">متطلبات كلمة المرور:</p>
            <ul>
              <li className={formData.newPassword.length >= 5 ? 'valid' : ''}>
                ✓ 5 أحرف على الأقل
              </li>
            </ul>
          </div>

          {status === 'error' && message && (
            <div className="error-message-box">
              <span className="error-icon">⚠️</span>
              {message}
            </div>
          )}

          <button
            type="submit"
            className="btn-submit"
            disabled={status === 'resetting'}
          >
            {status === 'resetting' ? (
              <>
                <span className="spinner"></span>
                جاري إعادة التعيين...
              </>
            ) : (
              <>
                <span>🔐</span>
                إعادة تعيين كلمة المرور
              </>
            )}
          </button>

          <div className="links">
            <Link to="/login" className="link">
              ← العودة لتسجيل الدخول
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
