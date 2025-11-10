import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/EmailVerificationReminder.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const EmailVerificationReminder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [resendStatus, setResendStatus] = useState(null); // null, 'sending', 'success', 'error'
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Get email from navigation state or localStorage
    const userEmail = location.state?.email || localStorage.getItem('userEmail');
    if (userEmail) {
      setEmail(userEmail);
    } else {
      // If no email available, redirect to login
      navigate('/login');
    }
  }, [location, navigate]);

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;

    setResendStatus('sending');
    setMessage('');

    try {
      // Get token from localStorage (if user just registered)
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_URL}/api/email-verification/resend`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setResendStatus('success');
        setMessage(
          'Verification email sent! Check your inbox. / تم إرسال البريد! تحقق من صندوق الوارد.'
        );
        setCountdown(60); // 60 seconds cooldown
      }
    } catch (error) {
      setResendStatus('error');
      if (error.response?.data?.error) {
        setMessage(error.response.data.error.message);
      } else {
        setMessage('Failed to send verification email. Please try again.');
      }
    }
  };

  return (
    <div className="verification-reminder-container">
      <div className="verification-reminder-card">
        <div className="email-icon">📧</div>

        <h2>Check Your Email</h2>
        <h3>تحقق من بريدك الإلكتروني</h3>

        <p className="instruction">We've sent a verification link to:</p>
        <p className="instruction-ar" dir="rtl">
          لقد أرسلنا رابط التحقق إلى:
        </p>

        <p className="email-display">{email}</p>

        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-text">
              <p>Check your inbox (and spam folder)</p>
              <p className="step-text-ar" dir="rtl">
                تحقق من صندوق الوارد (ومجلد البريد المزعج)
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-text">
              <p>Click the verification link</p>
              <p className="step-text-ar" dir="rtl">
                انقر على رابط التحقق
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-text">
              <p>Return to login</p>
              <p className="step-text-ar" dir="rtl">
                عد لتسجيل الدخول
              </p>
            </div>
          </div>
        </div>

        <div className="resend-section">
          <p className="resend-question">Didn't receive the email?</p>
          <p className="resend-question-ar" dir="rtl">
            لم تستلم البريد الإلكتروني؟
          </p>

          <button
            onClick={handleResendEmail}
            disabled={countdown > 0 || resendStatus === 'sending'}
            className={`btn-resend ${countdown > 0 ? 'disabled' : ''}`}
          >
            {resendStatus === 'sending' ? (
              <>
                <span className="spinner-small"></span>
                Sending... / جاري الإرسال...
              </>
            ) : countdown > 0 ? (
              <>
                Resend in {countdown}s / إعادة إرسال خلال {countdown}ث
              </>
            ) : (
              <>Resend Verification Email / إعادة إرسال بريد التحقق</>
            )}
          </button>

          {message && (
            <p className={`message ${resendStatus === 'success' ? 'success' : 'error'}`}>
              {message}
            </p>
          )}
        </div>

        <div className="actions">
          <Link to="/login" className="btn-secondary">
            Back to Login / العودة لتسجيل الدخول
          </Link>
        </div>

        <p className="help-text">Need help? Contact support at support@toosila.com</p>
        <p className="help-text-ar" dir="rtl">
          تحتاج مساعدة؟ اتصل بالدعم على support@toosila.com
        </p>
      </div>
    </div>
  );
};

export default EmailVerificationReminder;
