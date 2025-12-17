import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { useMode } from '../../context/ModeContext';
import { showLinesInNav, canAccessLines } from '../../config/featureFlags';
import NotificationBell from '../notifications/NotificationBell';
import UserMenu from '../Auth/UserMenu';
import ThemeToggle from '../ThemeToggle';
import RoleToggle from '../RoleToggle';
import logoHeader from '../../assets/logo-header.png';

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, currentUser } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { pendingBookings, unreadMessages } = useNotifications();
  const { mode, setMode } = useMode();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setDrawerOpen((prev) => {
      const newState = !prev;
      // Prevent background scroll when drawer is open
      if (newState) {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden'; // For iOS/safari
      } else {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }
      return newState;
    });
  };

  // Close drawer and reset overflow on route change
  useEffect(() => {
    setDrawerOpen(false);
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }, [location.pathname]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const handleAuthClick = () => {
    if (isAuthenticated) {
      setShowUserMenu(true);
    } else {
      // Navigate to phone login page instead of showing modal
      navigate('/login');
    }
  };

  // Check if current path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Hide header only on specific screens
  const shouldHideHeader = () => {
    const hiddenPaths = ['/lines-coming-soon'];
    return hiddenPaths.some((path) => location.pathname.startsWith(path));
  };

  if (shouldHideHeader()) {
    return null;
  }

  return (
    <>
      <header className={styles.header}>
        {/* Mobile Hamburger Menu - Only visible on mobile */}
        <button
          className={styles.hamburgerButton}
          onClick={toggleDrawer}
          aria-label="القائمة"
          aria-expanded={drawerOpen}
        >
          ☰
        </button>

        {/* Logo Section */}
        <div className={styles.logoSection}>
          <button
            className={styles.logoButton}
            onClick={() => navigate('/')}
            aria-label="الصفحة الرئيسية"
          >
            <img src={logoHeader} alt="توصيلة" className={styles.logoText} />
          </button>
        </div>

        {/* Mobile Role Toggle - Visible only on mobile */}
        <div className={styles.mobileToggle}>
          <RoleToggle mode={mode} onToggle={setMode} />
        </div>

        {/* Center Section: Role Toggle + Navigation Links (Desktop only) */}
        <nav className={styles.centerNav}>
          {/* Role Toggle - Desktop only */}
          <div className={styles.desktopToggle}>
            <RoleToggle mode={mode} onToggle={setMode} />
          </div>

          {isAuthenticated && (
            <>
              <button
                className={`${styles.navLink} ${isActive('/') ? styles.navLinkActive : ''}`}
                onClick={() => navigate('/')}
              >
                الرئيسية
              </button>
              {/* Show Offers only for passengers */}
              {!currentUser?.isDriver && (
                <button
                  className={`${styles.navLink} ${isActive('/offers') ? styles.navLinkActive : ''}`}
                  onClick={() => navigate('/offers')}
                  title="عروض السائقين"
                >
                  <span style={{ marginLeft: '4px' }}>🚗</span>
                  العروض
                </button>
              )}
              {/* Show Demands only for drivers */}
              {currentUser?.isDriver && (
                <button
                  className={`${styles.navLink} ${isActive('/demands') ? styles.navLinkActive : ''}`}
                  onClick={() => navigate('/demands')}
                  title="طلبات الركاب"
                >
                  <span style={{ marginLeft: '4px' }}>🙋</span>
                  الطلبات
                </button>
              )}
              <button
                className={`${styles.navLink} ${isActive('/bookings') ? styles.navLinkActive : ''}`}
                onClick={() => navigate('/bookings')}
              >
                رحلاتي
                {pendingBookings.totalPending > 0 && (
                  <span className={styles.navBadge}>
                    {pendingBookings.totalPending > 9 ? '9+' : pendingBookings.totalPending}
                  </span>
                )}
              </button>
            </>
          )}
        </nav>

        {/* Mobile Action Buttons - Reordered for new layout */}
        <div className={styles.mobileActionButtons}>
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notification Bell - visible only for logged-in users */}
          {isAuthenticated && <NotificationBell />}

          {/* User Avatar */}
          <div
            className={styles.userAvatar}
            onClick={handleAuthClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleAuthClick();
              }
            }}
            aria-label={isAuthenticated ? 'الملف الشخصي' : 'تسجيل الدخول'}
          >
            {isAuthenticated ? (
              currentUser?.isDriver ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              ) : (
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>
                  {currentUser?.name?.charAt(0)?.toUpperCase() || 'م'}
                </span>
              )
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
        </div>

        {/* Desktop Action Buttons - Original layout */}
        <div className={styles.actionButtons}>
          {/* Theme Toggle */}
          <ThemeToggle />

          <button className={styles.languageChip} onClick={toggleLanguage} aria-label="تغيير اللغة">
            {language === 'ar' ? 'ع' : 'EN'}
          </button>

          {/* Notification Bell - visible only for logged-in users */}
          {isAuthenticated && <NotificationBell />}

          <button className={styles.loginButton} onClick={handleAuthClick}>
            {isAuthenticated ? user.name : t('login')}
          </button>

          {/* User Avatar - Modern design with green theme */}
          <div
            className={styles.userAvatar}
            onClick={handleAuthClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleAuthClick();
              }
            }}
            aria-label={isAuthenticated ? 'الملف الشخصي' : 'تسجيل الدخول'}
          >
            {isAuthenticated ? (
              // Show user initial or driver icon
              currentUser?.isDriver ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              ) : (
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>
                  {currentUser?.name?.charAt(0)?.toUpperCase() || 'م'}
                </span>
              )
            ) : (
              // Not authenticated - show person outline icon
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
        </div>
      </header>

      {/* Drawer with dynamic menu */}
      {drawerOpen && (
        <div className={styles.drawer} data-drawer="true">
          <div className={styles.drawerOverlay} onClick={toggleDrawer} />
          <nav ref={drawerRef} className={styles.drawerContent} data-drawer-content="true">
            <div className={styles.drawerHeader}>
              <h3>القائمة</h3>
              <button
                className={styles.drawerClose}
                onClick={toggleDrawer}
                aria-label="إغلاق القائمة"
              >
                ✕
              </button>
            </div>
            <div
              className={styles.drawerBody}
              data-drawer-body="true"
              style={{
                padding: '16px 20px',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {/* الصفحة الرئيسية */}
              <button
                className={styles.drawerItem}
                onClick={() => {
                  navigate('/');
                  toggleDrawer();
                }}
              >
                🏠 الصفحة الرئيسية
              </button>

              {/* قسم السائقين */}
              {currentUser?.isDriver && (
                <>
                  <div className={styles.drawerSection}>قسم السائقين</div>
                  <button
                    className={styles.drawerItem}
                    onClick={() => {
                      navigate('/', { state: { mode: 'offer' } });
                      toggleDrawer();
                    }}
                  >
                    🚗 نشر عرض رحلة
                  </button>
                  <button
                    className={styles.drawerItem}
                    onClick={() => {
                      navigate('/offers');
                      toggleDrawer();
                    }}
                  >
                    📋 عروضي
                  </button>
                </>
              )}

              {/* قسم الركاب */}
              {currentUser && !currentUser.isDriver && (
                <>
                  <div className={styles.drawerSection}>قسم الركاب</div>
                  <button
                    className={styles.drawerItem}
                    onClick={() => {
                      navigate('/', { state: { mode: 'demand' } });
                      toggleDrawer();
                    }}
                  >
                    🙋 نشر طلب رحلة
                  </button>
                  <button
                    className={styles.drawerItem}
                    onClick={() => {
                      navigate('/offers');
                      toggleDrawer();
                    }}
                  >
                    🚗 عرض العروض
                  </button>
                </>
              )}

              {/* قسم الخطوط - Show to everyone if enabled in nav */}
              {showLinesInNav() && (
                <>
                  <div className={styles.drawerSection}>خطوط الاشتراك</div>
                  <button
                    className={styles.drawerItem}
                    onClick={() => {
                      navigate('/lines');
                      toggleDrawer();
                    }}
                  >
                    🚌 {canAccessLines(currentUser) ? 'تصفح الخطوط' : 'الخطوط (قريباً)'}
                  </button>
                  {/* Only show create/subscriptions for users with full access */}
                  {canAccessLines(currentUser) && currentUser?.isDriver && (
                    <button
                      className={styles.drawerItem}
                      onClick={() => {
                        navigate('/lines/create');
                        toggleDrawer();
                      }}
                    >
                      ➕ إنشاء خط جديد
                    </button>
                  )}
                  {canAccessLines(currentUser) && currentUser && (
                    <button
                      className={styles.drawerItem}
                      onClick={() => {
                        navigate('/subscriptions');
                        toggleDrawer();
                      }}
                    >
                      📋 اشتراكاتي
                    </button>
                  )}
                </>
              )}

              {/* القسم المشترك */}
              {currentUser && (
                <>
                  <div className={styles.drawerSection}>المشترك</div>
                  <button
                    className={styles.drawerItem}
                    onClick={() => {
                      navigate('/dashboard');
                      toggleDrawer();
                    }}
                  >
                    📊 لوحة التحكم
                  </button>
                  <button
                    className={styles.drawerItem}
                    onClick={() => {
                      navigate(currentUser.isDriver ? '/demands' : '/offers');
                      toggleDrawer();
                    }}
                  >
                    👀 {currentUser.isDriver ? 'عرض الطلبات' : 'عرض العروض'}
                  </button>
                  <button
                    className={styles.drawerItem}
                    onClick={() => {
                      navigate('/bookings');
                      toggleDrawer();
                    }}
                    style={{ position: 'relative' }}
                  >
                    📋 حجوزاتي
                    {pendingBookings.totalPending > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: 'var(--space-3)',
                          transform: 'translateY(-50%)',
                          background: '#dc2626',
                          color: 'white',
                          borderRadius: '50%',
                          minWidth: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'var(--text-xs)',
                          fontWeight: '700',
                          padding: '0 4px',
                        }}
                      >
                        {pendingBookings.totalPending > 99 ? '99+' : pendingBookings.totalPending}
                      </span>
                    )}
                  </button>
                  <button
                    className={styles.drawerItem}
                    onClick={() => {
                      navigate('/profile');
                      toggleDrawer();
                    }}
                  >
                    👤 الملف الشخصي
                  </button>
                </>
              )}

              {/* إذا لم يكن مسجل دخول */}
              {!currentUser && (
                <>
                  <button
                    className={styles.drawerItem}
                    onClick={() => {
                      navigate('/login');
                      toggleDrawer();
                    }}
                    style={{
                      background: 'var(--primary)',
                      color: 'white',
                      fontWeight: '600',
                      marginBottom: '12px',
                    }}
                  >
                    📱 تسجيل الدخول
                  </button>
                  <p className={styles.placeholder}>يرجى تسجيل الدخول لرؤية القائمة الكاملة</p>
                </>
              )}

              {/* قسم الاتصال بنا */}
              <div className={styles.drawerSection}>اتصل بنا</div>
              <div
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--surface-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.8',
                }}
              >
                <div
                  style={{
                    marginBottom: 'var(--space-2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                  }}
                >
                  <span>📧</span>
                  <a
                    href="mailto:support@toosila.com"
                    style={{ color: 'var(--primary)', textDecoration: 'none' }}
                  >
                    support@toosila.com
                  </a>
                </div>
                <div
                  style={{
                    marginBottom: 'var(--space-2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                  }}
                >
                  <span>📱</span>
                  <a
                    href="tel:+9647700000000"
                    style={{ color: 'var(--primary)', textDecoration: 'none' }}
                  >
                    +964 770 000 0000
                  </a>
                </div>
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* User Menu */}
      {showUserMenu && <UserMenu onClose={() => setShowUserMenu(false)} />}
    </>
  );
};

export default Header;
