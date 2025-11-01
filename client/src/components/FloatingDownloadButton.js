import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const FloatingDownloadButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Check if app is already installed
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  // Handle PWA install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Show button after 3 seconds on mobile, unless already installed or on download page
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    const isDownloadPage = location.pathname === '/download';

    if (!isInstalled && !isDownloadPage && isMobile) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isInstalled]);

  // Don't show on download page or if already installed
  if (location.pathname === '/download' || isInstalled) {
    return null;
  }

  const handleClick = async () => {
    // If there's a deferred prompt, show it
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('App installed');
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      // Otherwise, navigate to download page
      navigate('/download');
    }
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Action Button */}
      <div
        onClick={handleClick}
        style={{
          position: 'fixed',
          bottom: '90px', // Above bottom navigation
          right: '20px',
          zIndex: 9999,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #34c759 0%, #28a745 100%)',
          boxShadow: '0 8px 24px rgba(52, 199, 89, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          animation: isAnimating ? 'pulse 2s infinite' : 'none',
          border: '3px solid white'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.15)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(52, 199, 89, 0.5), 0 6px 16px rgba(0, 0, 0, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(52, 199, 89, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)';
        }}
      >
        <div style={{
          fontSize: '2rem',
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
        }}>
          📱
        </div>

        {/* Badge notification */}
        <div style={{
          position: 'absolute',
          top: '-5px',
          left: '-5px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: '#ff3b30',
          color: 'white',
          fontSize: '14px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid white',
          animation: 'bounce 2s infinite'
        }}>
          ⬇️
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: isDarkMode ? '#1e293b' : 'white',
            color: isDarkMode ? 'white' : '#1a1a1a',
            border: '2px solid #34c759',
            fontSize: '12px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            padding: 0,
            lineHeight: 1
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ff3b30';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.borderColor = '#ff3b30';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDarkMode ? '#1e293b' : 'white';
            e.currentTarget.style.color = isDarkMode ? 'white' : '#1a1a1a';
            e.currentTarget.style.borderColor = '#34c759';
          }}
        >
          ×
        </button>
      </div>

      {/* Tooltip */}
      <div style={{
        position: 'fixed',
        bottom: '95px',
        right: '90px',
        zIndex: 9998,
        background: isDarkMode ? '#1e293b' : 'white',
        color: isDarkMode ? 'white' : '#1a1a1a',
        padding: '12px 16px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        fontSize: '14px',
        fontWeight: '600',
        fontFamily: '"Cairo", sans-serif',
        whiteSpace: 'nowrap',
        border: `2px solid ${isDarkMode ? 'rgba(52, 199, 89, 0.3)' : 'rgba(52, 199, 89, 0.2)'}`,
        animation: isAnimating ? 'slideInRight 0.5s ease-out' : 'none',
        pointerEvents: 'none'
      }}>
        نزّل التطبيق الآن! 🚀
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '-8px',
          transform: 'translateY(-50%)',
          width: 0,
          height: 0,
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          borderLeft: `8px solid ${isDarkMode ? '#1e293b' : 'white'}`
        }} />
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default FloatingDownloadButton;
