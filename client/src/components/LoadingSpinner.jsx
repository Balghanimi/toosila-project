/**
 * LoadingSpinner Component
 * Used as fallback for React.lazy() Suspense
 */

import React from 'react';

export default function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: '"Cairo", sans-serif'
    }}>
      {/* Spinner */}
      <div style={{
        width: '60px',
        height: '60px',
        border: '4px solid #e2e8f0',
        borderTop: '4px solid var(--primary, #2563eb)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1.5rem'
      }} />

      {/* Loading Text */}
      <p style={{
        fontSize: '1.125rem',
        fontWeight: '600',
        color: '#64748b',
        margin: 0
      }}>
        جاري التحميل...
      </p>

      {/* Logo/Branding (optional) */}
      <p style={{
        fontSize: '0.875rem',
        color: '#94a3b8',
        marginTop: '0.5rem'
      }}>
        توصيلة
      </p>

      {/* Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
