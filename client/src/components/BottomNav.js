import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

// Simple outline SVG icons
const Icons = {
  carpool: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10h-1V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4H2L.5 11.1c-.8.2-1.5 1-1.5 1.9v3c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M5 9h10" />
    </svg>
  ),
  myRides: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M9 19c-5 0-8-3-8-8s3-8 8-8 8 3 8 8-3 8-8 8z" />
      <path d="M12 8l4 4-4 4" />
      <path d="M8 12h8" />
    </svg>
  ),
  messages: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 10h8" />
      <path d="M8 14h6" />
    </svg>
  ),
  profile: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  more: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="19" r="1.5" fill="currentColor" />
    </svg>
  ),
};

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { unreadMessages } = useNotifications();
  const { currentUser } = useAuth();
  const currentPath = location.pathname;
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Get total unread message count (using NotificationContext polling instead)
  const totalUnreadCount = unreadMessages;

  // Responsive detection
  const isSmallMobile = window.innerWidth <= 375;

  // Check for updates function
  const checkForUpdates = async () => {
    setIsCheckingUpdate(true);

    try {
      // Simulate checking for updates (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate random update availability for demo
      const hasUpdate = Math.random() > 0.5;
      setUpdateAvailable(hasUpdate);

      if (hasUpdate) {
        alert('تحديث جديد متاح! سيتم إعادة تحميل الصفحة...');
        // In production, trigger actual update
        setTimeout(() => window.location.reload(), 1000);
      } else {
        alert('✅ التطبيق محدّث! لا توجد تحديثات جديدة.');
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      alert('حدث خطأ أثناء التحقق من التحديثات');
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  // More menu items
  const MORE_MENU_ITEMS = [
    {
      key: 'settings',
      label: 'الإعدادات',
      icon: '⚙️',
      action: () => navigate('/settings'),
    },
    {
      key: 'statistics',
      label: 'الإحصائيات',
      icon: '📊',
      action: () => navigate('/rating-stats'),
    },
    {
      key: 'about',
      label: 'حول التطبيق',
      icon: 'ℹ️',
      action: () => navigate('/about'),
    },
    {
      key: 'contact',
      label: 'اتصل بنا',
      icon: '📞',
      action: () => (window.location.href = 'mailto:support@toosila.com'),
    },
    {
      key: 'help',
      label: 'المساعدة',
      icon: '❓',
      action: () =>
        alert('للمساعدة والدعم، يرجى التواصل معنا عبر البريد الإلكتروني أو من خلال قسم الإعدادات'),
    },
    {
      key: 'privacy',
      label: 'سياسة الخصوصية',
      icon: '🔒',
      action: () => navigate('/privacy-policy'),
    },
    {
      key: 'features',
      label: 'الميزات',
      icon: '💡',
      action: () =>
        alert(
          'ميزات توصيلة:\n\n• مشاركة الرحلات الآمنة\n• نظام تقييم شامل\n• رسائل فورية\n• إشعارات ذكية\n• دعم الوضع المظلم'
        ),
    },
    {
      key: 'download',
      label: 'تنزيل التطبيق',
      icon: '📱',
      action: () => navigate('/download'),
    },
    {
      key: 'share',
      label: 'مشاركة التطبيق',
      icon: '📤',
      action: () => {
        if (navigator.share) {
          navigator.share({
            title: 'تطبيق توصيلة',
            text: 'جرب تطبيق توصيلة لمشاركة الرحلات!',
            url: window.location.origin,
          });
        } else {
          alert('شارك توصيلة مع أصدقائك!');
        }
      },
    },
  ];

  const NAV_ITEMS = [
    {
      key: 'carpool',
      label: t('home'),
      icon: Icons.carpool,
      paths: ['/', '/offers', '/post-offer'],
    },
    {
      key: 'mytrips',
      label: 'رحلاتي',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
      paths: ['/bookings', '/dashboard'],
    },
    {
      key: 'messages',
      label: t('messages'),
      icon: Icons.messages,
      paths: ['/messages', '/chat'],
    },
    {
      key: 'profile',
      label: t('profile'),
      icon: Icons.profile,
      paths: ['/profile', '/settings', '/ratings'],
    },
    {
      key: 'more',
      label: 'المزيد',
      icon: Icons.more,
      paths: [],
    },
  ];

  // Determine active item based on current path
  const getActiveKey = () => {
    const activeItem = NAV_ITEMS.find((item) =>
      item.paths.some((path) => {
        if (path === '/') return currentPath === '/';
        return currentPath.startsWith(path);
      })
    );
    return activeItem?.key || 'carpool';
  };

  const activeKey = getActiveKey();

  const handleNavigation = (item) => {
    // Handle "More" button differently
    if (item.key === 'more') {
      setShowMoreMenu(!showMoreMenu);
      return;
    }

    // Navigate to the primary path for each section
    const navigationMap = {
      carpool: currentUser && currentUser.isDriver ? '/demands' : '/offers',
      mytrips: '/bookings',
      messages: '/messages',
      profile: '/profile',
    };

    const targetPath = navigationMap[item.key];
    if (targetPath) {
      navigate(targetPath);
    }
  };

  // Hide bottom nav on certain screens
  const shouldHideBottomNav = () => {
    const hiddenPaths = ['/login', '/register', '/auth', '/onboarding'];
    return hiddenPaths.some((path) => currentPath.startsWith(path));
  };

  if (shouldHideBottomNav()) {
    return null;
  }

  return (
    <>
      {/* More Menu Modal */}
      {showMoreMenu && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '24px 24px 0 0',
              padding: '24px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '70vh',
              overflowY: 'auto',
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.2)',
              animation: 'slideUp 0.3s ease',
              fontFamily: '"Cairo", sans-serif',
              direction: 'rtl',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: '2px solid #f0f0f0',
              }}
            >
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  color: '#1a1a1a',
                  margin: 0,
                }}
              >
                المزيد
              </h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                }}
              >
                ✖
              </button>
            </div>

            {/* Menu Items Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isSmallMobile ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
                gap: isSmallMobile ? '12px' : '16px',
                marginBottom: '16px',
              }}
            >
              {MORE_MENU_ITEMS.map((menuItem) => (
                <button
                  key={menuItem.key}
                  onClick={() => {
                    menuItem.action();
                    setShowMoreMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: isSmallMobile ? '6px' : '8px',
                    padding: isSmallMobile ? '14px 6px' : '16px 8px',
                    background: '#f9fafb',
                    border: '2px solid #e5e7eb',
                    borderRadius: isSmallMobile ? '12px' : '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: '"Cairo", sans-serif',
                    minHeight: '44px',
                    minWidth: '44px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#34c759';
                    e.currentTarget.style.borderColor = '#34c759';
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(52, 199, 89, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: isSmallMobile ? '24px' : '28px' }}>{menuItem.icon}</div>
                  <span
                    style={{
                      fontSize: isSmallMobile ? '10px' : '11px',
                      fontWeight: '600',
                      color: '#374151',
                      textAlign: 'center',
                      lineHeight: '1.2',
                    }}
                  >
                    {menuItem.label}
                  </span>
                </button>
              ))}
            </div>

            {/* App Version with Update Button */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '12px',
                alignItems: 'center',
                padding: '16px',
                background: 'linear-gradient(135deg, #34c759 0%, #28a745 100%)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                marginTop: '16px',
              }}
            >
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>
                  إصدار التطبيق
                </div>
                <div style={{ fontSize: '16px', fontWeight: '800' }}>2.1.15 - 25/10/2024</div>
              </div>

              {/* Update Check Button */}
              <button
                onClick={checkForUpdates}
                disabled={isCheckingUpdate}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '12px 16px',
                  background: isCheckingUpdate
                    ? 'rgba(255, 255, 255, 0.3)'
                    : updateAvailable
                      ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
                      : 'rgba(255, 255, 255, 0.95)',
                  color: isCheckingUpdate ? 'white' : updateAvailable ? 'white' : '#34c759',
                  border: isCheckingUpdate
                    ? '2px solid rgba(255, 255, 255, 0.5)'
                    : '2px solid white',
                  borderRadius: '12px',
                  cursor: isCheckingUpdate ? 'not-allowed' : 'pointer',
                  fontFamily: '"Cairo", sans-serif',
                  fontSize: '11px',
                  fontWeight: '700',
                  transition: 'all 0.3s ease',
                  minWidth: '90px',
                  boxShadow: isCheckingUpdate ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
                onMouseEnter={(e) => {
                  if (!isCheckingUpdate) {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCheckingUpdate) {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }
                }}
              >
                {isCheckingUpdate ? (
                  <>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    <span style={{ fontSize: '10px' }}>جاري الفحص...</span>
                  </>
                ) : updateAvailable ? (
                  <>
                    <div style={{ fontSize: '20px', animation: 'bounce 1s infinite' }}>🔄</div>
                    <span>تحديث متاح!</span>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '20px' }}>✓</div>
                    <span>محدّث</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          height: '72px',
          padding: 'var(--space-2) 0',
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '2px solid transparent',
          borderImage:
            'linear-gradient(90deg, rgba(52, 199, 89, 0.3) 0%, rgba(52, 199, 89, 0.1) 50%, rgba(52, 199, 89, 0.3) 100%) 1',
          boxShadow: '0 -8px 32px rgba(52, 199, 89, 0.08), 0 -2px 8px rgba(0, 0, 0, 0.05)',
          direction: 'rtl',
          fontFamily: '"Cairo", sans-serif',
        }}
      >
        {NAV_ITEMS.map((item, index) => {
          const isActive = item.key === 'more' ? showMoreMenu : activeKey === item.key;

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
                gap: '4px',
                height: '100%',
                border: 'none',
                background: 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'var(--transition)',
                padding: '8px 4px',
                fontSize: '11px',
                fontWeight: '600',
                fontFamily: '"Cairo", sans-serif',
                direction: 'rtl',
                outline: 'none',
                borderRadius: 'var(--radius)',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                animationDelay: `${index * 0.1}s`,
                minWidth: 0,
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
                e.target.style.transform = isActive
                  ? 'translateY(-1px) scale(0.95)'
                  : 'translateY(1px) scale(0.95)';
              }}
              onTouchEnd={(e) => {
                setTimeout(() => {
                  e.target.style.transform = isActive
                    ? 'translateY(-2px) scale(1)'
                    : 'translateY(0) scale(1)';
                }, 150);
              }}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              {/* Active indicator with animation */}
              <div
                style={{
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
                  boxShadow: isActive ? '0 2px 8px rgba(52, 199, 89, 0.3)' : 'none',
                }}
              />

              {/* Icon with enhanced styling */}
              <div
                style={{
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
                  position: 'relative',
                }}
              >
                {item.icon}

                {/* Notification badge for messages */}
                {item.key === 'messages' && totalUnreadCount > 0 && (
                  <div
                    style={{
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
                      animation: 'pulse 2s infinite',
                    }}
                  >
                    {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                  </div>
                )}
              </div>

              {/* Label with enhanced typography */}
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: isActive ? '700' : '600',
                  lineHeight: '1.2',
                  textAlign: 'center',
                  color: 'inherit',
                  whiteSpace: 'nowrap',
                  overflow: 'visible',
                  maxWidth: '100%',
                  transition: 'var(--transition)',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {item.label}
              </span>

              {/* Ripple effect container */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                  pointerEvents: 'none',
                }}
              />
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

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-8px,0);
          }
          70% {
            transform: translate3d(0,-4px,0);
          }
          90% {
            transform: translate3d(0,-2px,0);
          }
        }

        /* Dark mode support for bottom nav */
        body.dark-mode nav {
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%) !important;
          border-image: linear-gradient(90deg, rgba(52, 199, 89, 0.4) 0%, rgba(52, 199, 89, 0.2) 50%, rgba(52, 199, 89, 0.4) 100%) 1 !important;
          box-shadow: 0 -8px 32px rgba(52, 199, 89, 0.12), 0 -2px 8px rgba(0, 0, 0, 0.3) !important;
        }
      `}</style>
      </nav>
    </>
  );
};

export default BottomNav;
