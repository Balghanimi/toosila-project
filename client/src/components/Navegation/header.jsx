import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationBell from '../notifications/NotificationBell';
import UserMenu from '../Auth/UserMenu';
import ThemeToggle from '../ThemeToggle';
import logoHeader from '../../assets/logo-header.png';

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, currentUser } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { pendingBookings, unreadMessages } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

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

  return (
    <>
      <header className={styles.header}>
        {/* Mobile Hamburger Menu - First in JSX (will be on RIGHT in RTL) */}
        <button
          className={styles.hamburgerButton}
          onClick={toggleDrawer}
          aria-label="القائمة"
          aria-expanded={drawerOpen}
        >
          ☰
        </button>

        {/* Logo Section - Second in JSX (will be CENTERED) */}
        <div className={styles.logoSection}>
          <button
            className={styles.logoButton}
            onClick={() => navigate('/')}
            aria-label="الصفحة الرئيسية"
          >
            <img src={logoHeader} alt="توصيلة" className={styles.logoText} />
          </button>
        </div>

        {/* Center Section: Navigation Links (Desktop only, authenticated users) */}
        <nav className={styles.centerNav}>
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
              <button
                className={`${styles.navLink} ${isActive('/messages') ? styles.navLinkActive : ''}`}
                onClick={() => navigate('/messages')}
              >
                الرسائل
                {unreadMessages > 0 && (
                  <span className={styles.navBadge}>
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </button>
            </>
          )}
        </nav>

        {/* Icons Section - Third in JSX (will be on LEFT in RTL) */}
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

          {/* User Avatar - Always visible (shows login icon when not authenticated) */}
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
            {isAuthenticated ? (user.userType === 'driver' ? '🚗' : '🧑‍💼') : '👤'}
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
                      navigate('/messages');
                      toggleDrawer();
                    }}
                    style={{ position: 'relative' }}
                  >
                    💬 الرسائل
                    {unreadMessages > 0 && (
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
                        {unreadMessages > 99 ? '99+' : unreadMessages}
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
                <div
                  style={{
                    marginTop: 'var(--space-3)',
                    paddingTop: 'var(--space-3)',
                    borderTop: '1px solid var(--border-light)',
                  }}
                >
                  <button
                    className={styles.drawerItem}
                    onClick={() => {
                      navigate('/messages');
                      toggleDrawer();
                    }}
                  >
                    💬 مراسلة الدعم الفني
                  </button>
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
