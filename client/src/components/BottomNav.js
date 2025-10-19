import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';

// Simple outline SVG icons
const Icons = {
  carpool: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10h-1V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4H2L.5 11.1c-.8.2-1.5 1-1.5 1.9v3c0 .6.4 1 1 1h2"/>
      <circle cx="7" cy="17" r="2"/>
      <circle cx="17" cy="17" r="2"/>
      <path d="M5 9h10"/>
    </svg>
  ),
  myRides: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 19c-5 0-8-3-8-8s3-8 8-8 8 3 8 8-3 8-8 8z"/>
      <path d="M12 8l4 4-4 4"/>
      <path d="M8 12h8"/>
    </svg>
  ),
  messages: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <path d="M8 10h8"/>
      <path d="M8 14h6"/>
    </svg>
  ),
  profile: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
};

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { unreadMessages } = useNotifications();
  const currentPath = location.pathname;

  // Get total unread message count (using NotificationContext polling instead)
  const totalUnreadCount = unreadMessages;

  const NAV_ITEMS = [
    {
      key: 'carpool',
      label: t('home'),
      icon: Icons.carpool,
      paths: ['/', '/offers', '/post-offer']
    },
    {
      key: 'dashboard',
      label: 'لوحة التحكم',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
      ),
      paths: ['/dashboard', '/bookings']
    },
    {
      key: 'messages',
      label: t('messages'),
      icon: Icons.messages,
      paths: ['/messages', '/chat']
    },
    {
      key: 'profile',
      label: t('profile'),
      icon: Icons.profile,
      paths: ['/profile', '/settings', '/ratings']
    },
  ];

  // Determine active item based on current path
  const getActiveKey = () => {
    const activeItem = NAV_ITEMS.find(item => 
      item.paths.some(path => {
        if (path === '/') return currentPath === '/';
        return currentPath.startsWith(path);
      })
    );
    return activeItem?.key || 'carpool';
  };

  const activeKey = getActiveKey();

  const handleNavigation = (item) => {
    // Navigate to the primary path for each section
    const navigationMap = {
      'carpool': '/',
      'dashboard': '/dashboard',
      'messages': '/messages',
      'profile': '/profile'
    };

    const targetPath = navigationMap[item.key];
    if (targetPath) {
      navigate(targetPath);
    }
  };

  // Hide bottom nav on certain screens
  const shouldHideBottomNav = () => {
    const hiddenPaths = ['/login', '/register', '/auth', '/onboarding'];
    return hiddenPaths.some(path => currentPath.startsWith(path));
  };

  if (shouldHideBottomNav()) {
    return null;
  }

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      height: '72px',
      padding: 'var(--space-2) 0',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border-light)',
      boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.12)',
      direction: 'rtl',
      fontFamily: '"Cairo", sans-serif'
    }}>
      {NAV_ITEMS.map((item, index) => {
        const isActive = activeKey === item.key;
        
        return (
          <button
            key={item.key}
            onClick={() => handleNavigation(item)}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-1)',
              height: '100%',
              border: 'none',
              background: 'transparent',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'var(--transition)',
              padding: 'var(--space-2) var(--space-1)',
              fontSize: 'var(--text-xs)',
              fontWeight: '600',
              fontFamily: '"Cairo", sans-serif',
              direction: 'rtl',
              outline: 'none',
              borderRadius: 'var(--radius)',
              transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
              animationDelay: `${index * 0.1}s`
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.target.style.color = 'var(--text-secondary)';
                e.target.style.background = 'var(--surface-secondary)';
                e.target.style.transform = 'translateY(-1px) scale(1.05)';
              } else {
                e.target.style.transform = 'translateY(-3px) scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.target.style.color = 'var(--text-muted)';
                e.target.style.background = 'transparent';
                e.target.style.transform = 'translateY(0) scale(1)';
              } else {
                e.target.style.transform = 'translateY(-2px) scale(1)';
              }
            }}
            onTouchStart={(e) => {
              e.target.style.transform = isActive ? 'translateY(-1px) scale(0.95)' : 'translateY(1px) scale(0.95)';
            }}
            onTouchEnd={(e) => {
              setTimeout(() => {
                e.target.style.transform = isActive ? 'translateY(-2px) scale(1)' : 'translateY(0) scale(1)';
              }, 150);
            }}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
          >
            {/* Active indicator with animation */}
            <div style={{
              position: 'absolute',
              top: '-2px',
              left: '25%',
              right: '25%',
              height: '3px',
              background: isActive 
                ? 'linear-gradient(90deg, var(--primary) 0%, var(--primary-dark) 100%)'
                : 'transparent',
              borderRadius: '0 0 var(--radius) var(--radius)',
              transition: 'var(--transition)',
              transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
              transformOrigin: 'center',
              boxShadow: isActive ? '0 2px 8px rgba(52, 199, 89, 0.3)' : 'none'
            }} />
            
            {/* Icon with enhanced styling */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              color: 'inherit',
              borderRadius: '50%',
              background: isActive ? 'rgba(52, 199, 89, 0.1)' : 'transparent',
              transition: 'var(--transition)',
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
              position: 'relative'
            }}>
              {item.icon}
              
              {/* Notification badge for messages */}
              {item.key === 'messages' && totalUnreadCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  minWidth: '18px',
                  height: '18px',
                  background: 'var(--error)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--text-xs)',
                  fontWeight: '700',
                  color: 'white',
                  border: '2px solid white',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
                  animation: 'pulse 2s infinite'
                }}>
                  {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                </div>
              )}
            </div>
            
            {/* Label with enhanced typography */}
            <span style={{
              fontSize: 'var(--text-xs)',
              fontWeight: isActive ? '700' : '600',
              lineHeight: '1',
              textAlign: 'center',
              color: 'inherit',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              transition: 'var(--transition)',
              transform: isActive ? 'scale(1.05)' : 'scale(1)'
            }}>
              {item.label}
            </span>

            {/* Ripple effect container */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              pointerEvents: 'none'
            }} />
          </button>
        );
      })}
      
      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 4px 16px rgba(220, 38, 38, 0.5);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
          }
        }
      `}</style>
    </nav>
  );
};

export default BottomNav;
