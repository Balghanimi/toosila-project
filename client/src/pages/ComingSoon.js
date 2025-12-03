import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ComingSoon - Page shown when feature is not yet available
 */
const ComingSoon = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: '"Cairo", sans-serif',
        direction: 'rtl',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '400px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🚌</div>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: '800',
            color: '#1f2937',
            marginBottom: '12px',
          }}
        >
          خطوط الاشتراك
        </h1>
        <div
          style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#16a34a',
            marginBottom: '16px',
          }}
        >
          قريباً...
        </div>
        <p
          style={{
            color: '#6b7280',
            fontSize: '1rem',
            lineHeight: '1.8',
            marginBottom: '24px',
          }}
        >
          هذه الميزة قيد التطوير وستكون متاحة قريباً.
          <br />
          سنوفر لك خدمة الاشتراك في خطوط النقل اليومية للطلاب والموظفين.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '14px 32px',
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            fontFamily: '"Cairo", sans-serif',
          }}
        >
          العودة للرئيسية
        </button>
      </div>
    </div>
  );
};

export default ComingSoon;
