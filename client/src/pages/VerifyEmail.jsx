import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/VerifyEmail.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/api/email-verification/verify/${token}`
        );

        if (response.data.success) {
          setStatus('success');
          setMessage(
            response.data.message ||
              'تم تأكيد بريدك الإلكتروني بنجاح! Email verified successfully!'
          );

          // Start countdown and redirect
          let timeLeft = 3;
          const timer = setInterval(() => {
            timeLeft -= 1;
            setCountdown(timeLeft);
            if (timeLeft === 0) {
              clearInterval(timer);
              navigate('/login');
            }
          }, 1000);

          return () => clearInterval(timer);
        }
      } catch (error) {
        setStatus('error');
        if (error.response?.data?.error) {
          setMessage(error.response.data.error.message);
        } else {
          setMessage('Failed to verify email. Please try again.');
        }
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        {status === 'verifying' && (
          <>
            <div className="spinner-large"></div>
            <h2>Verifying your email...</h2>
            <p>جاري التحقق من بريدك الإلكتروني...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="success-icon">✓</div>
            <h2>Email Verified!</h2>
            <h3>تم تأكيد البريد الإلكتروني!</h3>
            <p className="success-message">{message}</p>
            <p className="redirect-message">
              Redirecting to login in {countdown} seconds...
            </p>
            <p className="redirect-message-ar">
              سيتم التوجيه لتسجيل الدخول خلال {countdown} ثوانٍ...
            </p>
            <Link to="/login" className="btn-primary">
              Login Now / سجل دخول الآن
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="error-icon">✗</div>
            <h2>Verification Failed</h2>
            <h3>فشل التحقق</h3>
            <p className="error-message">{message}</p>
            <div className="error-actions">
              <Link to="/login" className="btn-secondary">
                Back to Login / العودة لتسجيل الدخول
              </Link>
              <p className="help-text">
                Need help? Contact support / تحتاج مساعدة؟ اتصل بالدعم
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
