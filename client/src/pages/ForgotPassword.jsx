import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/ForgotPassword.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ForgotPassword = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // null, 'sending', 'success', 'error'
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validateEmail = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setStatus('sending');
    setMessage('');

    try {
      const response = await axios.post(`${API_URL}/api/password-reset/request`, { email });

      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message);
        setEmail(''); // Clear email field
      }
    } catch (error) {
      setStatus('error');
      if (error.response?.data?.error) {
        setMessage(error.response.data.error.message);
      } else {
        setMessage('فشل في إرسال الطلب. حاول مرة أخرى.');
      }
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="icon-container">
          <div className="lock-icon">🔒</div>
        </div>

        <h2>نسيت كلمة المرور؟</h2>
        <h3>Forgot Password?</h3>

        <p className="instruction">
          أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
        </p>
        <p className="instruction-en">
          Enter your email and we'll send you a link to reset your password
        </p>

        {status === 'success' ? (
          <div className="success-message-box">
            <div className="success-icon">✓</div>
            <h4>تم إرسال الرسالة!</h4>
            <p>{message}</p>
            <p className="help-text">تحقق من صندوق الوارد (ومجلد البريد المزعج)</p>
            <Link to="/login" className="btn-back">
              العودة لتسجيل الدخول
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label>البريد الإلكتروني / Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({});
                  setStatus(null);
                }}
                placeholder="example@email.com"
                className={errors.email ? 'error' : ''}
                disabled={status === 'sending'}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            {status === 'error' && message && (
              <div className="error-message-box">
                <span className="error-icon">⚠️</span>
                {message}
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={status === 'sending'}>
              {status === 'sending' ? (
                <>
                  <span className="spinner"></span>
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <span>📧</span>
                  إرسال رابط إعادة التعيين
                </>
              )}
            </button>

            <div className="links">
              <Link to="/login" className="link">
                ← العودة لتسجيل الدخول
              </Link>
            </div>
          </form>
        )}

        <div className="info-box">
          <p className="info-title">💡 ملاحظة:</p>
          <ul className="info-list">
            <li>الرابط صالح لمدة ساعة واحدة فقط</li>
            <li>إذا لم تستلم الرسالة، تحقق من مجلد البريد المزعج</li>
            <li>يمكنك طلب رابط جديد بعد انتهاء صلاحية القديم</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
