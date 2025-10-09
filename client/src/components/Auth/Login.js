import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Login({ onSwitchToRegister, onClose }) {
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData);
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
      maxWidth: '420px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      position: 'relative'
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
          padding: '8px'
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
          تسجيل الدخول
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          margin: '0'
        }}>
          أهلاً بك في توصيلة
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
        {/* Email/Phone Input */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            البريد الإلكتروني أو رقم الهاتف
          </label>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com أو 07XXXXXXXXX"
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

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
              required
              style={{
                width: '100%',
                padding: '12px 48px 12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
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
          {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
        </button>
      </form>

      {/* Demo Users Info */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: '#f0f9ff',
        borderRadius: '8px',
        border: '1px solid #0ea5e9'
      }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          fontWeight: '600',
          color: '#0369a1'
        }}>
          🧪 مستخدمين تجريبيين:
        </h4>
        <div style={{ fontSize: '12px', color: '#0369a1', lineHeight: '1.6' }}>
          <div><strong>سائق:</strong> driver@test.com (أي كلمة مرور)</div>
          <div><strong>راكب:</strong> passenger@test.com (أي كلمة مرور)</div>
        </div>
      </div>

      {/* Switch to Register */}
      <div style={{
        textAlign: 'center',
        marginTop: '24px',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        ليس لديك حساب؟{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
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
          إنشاء حساب جديد
        </button>
      </div>
    </div>
  );
}

