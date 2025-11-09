/**
 * Enhanced LoadingSpinner Component
 * Accessible loading indicator with multiple variants and sizes
 * Supports WCAG 2.1 compliance with proper ARIA attributes
 */

import React from 'react';

export default function LoadingSpinner({
  size = 'md',
  variant = 'page',
  text = 'جاري التحميل...',
  showText = true
}) {
  // Size configurations
  const sizes = {
    sm: { spinner: '24px', border: '3px', fontSize: '0.875rem' },
    md: { spinner: '40px', border: '4px', fontSize: '1rem' },
    lg: { spinner: '60px', border: '4px', fontSize: '1.125rem' }
  };

  const sizeConfig = sizes[size] || sizes.md;

  // Variant-specific styles
  const variants = {
    page: {
      container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: '"Cairo", sans-serif',
        padding: 'var(--space-4, 1rem)'
      },
      showLogo: true
    },
    inline: {
      container: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2, 0.5rem)',
        fontFamily: '"Cairo", sans-serif'
      },
      showLogo: false
    },
    overlay: {
      container: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        fontFamily: '"Cairo", sans-serif'
      },
      showLogo: false
    },
    card: {
      container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8, 2rem)',
        fontFamily: '"Cairo", sans-serif'
      },
      showLogo: false
    }
  };

  const variantConfig = variants[variant] || variants.page;

  return (
    <div
      style={variantConfig.container}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Spinner */}
      <div
        style={{
          width: sizeConfig.spinner,
          height: sizeConfig.spinner,
          border: `${sizeConfig.border} solid var(--border-light, #e2e8f0)`,
          borderTop: `${sizeConfig.border} solid var(--primary, #10b981)`,
          borderRadius: '50%',
          animation: 'spinner-spin 0.8s linear infinite',
          marginBottom: showText ? 'var(--space-4, 1rem)' : '0'
        }}
        aria-hidden="true"
      />

      {/* Loading Text - Visible */}
      {showText && (
        <p style={{
          fontSize: sizeConfig.fontSize,
          fontWeight: '600',
          color: variant === 'overlay' ? 'white' : 'var(--text-secondary, #64748b)',
          margin: 0,
          textAlign: 'center'
        }}>
          {text}
        </p>
      )}

      {/* Screen Reader Only Text */}
      <span className="sr-only">{text}</span>

      {/* Logo/Branding for page variant */}
      {variantConfig.showLogo && (
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-muted, #94a3b8)',
          marginTop: 'var(--space-2, 0.5rem)'
        }}>
          توصيلة
        </p>
      )}

      {/* Animation Keyframes */}
      <style>{`
        @keyframes spinner-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes spinner-spin {
            0%, 100% { transform: rotate(0deg); }
          }
        }
      `}</style>
    </div>
  );
}
