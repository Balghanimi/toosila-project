import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationBell from '../notifications/NotificationBell';
import AuthModal from '../Auth/AuthModal';
import UserMenu from '../Auth/UserMenu';

const Header = ({ title = 'توصيلة' }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, currentUser } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { pendingBookings, unreadMessages } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamic page titles based on routes
  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/': 'توصيلة',
      '/post-offer': 'انشر رحلة',
      '/offers': 'العروض المتاحة',
      '/demands': 'الطلبات المتاحة',
      '/ratings': 'إدارة التقييمات',
      '/rating-stats': 'إحصائيات التقييمات',
      '/top-ratings': 'أفضل التقييمات',
      '/recent-ratings': 'أحدث التقييمات',
      '/bad-ratings': 'التقييمات السيئة',
      '/ratings-by-location': 'التقييمات حسب الموقع',
      '/ratings-by-user-type': 'التقييمات حسب نوع المستخدم',
      '/ratings-by-date': 'التقييمات حسب التاريخ',
      '/ratings-by-comments': 'التقييمات حسب التعليقات',
      '/ratings-by-rating': 'التقييمات حسب الدرجة'
    };
    return titles[path] || title;
  };


  const toggleDrawer = () => {
    setDrawerOpen(prev => !prev);
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      setShowUserMenu(true);
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.left}>
          <button 
            className={styles.hamburgerButton} 
            onClick={toggleDrawer}
            aria-label="القائمة"
            aria-expanded={drawerOpen}
          >
            ☰
          </button>
        </div>
        
        <div className={styles.center}>
          <h1 className={styles.title}>{getPageTitle()}</h1>
        </div>
        
        <div className={styles.right}>
          <div className={styles.rightActions}>
            <button
              className={styles.languageChip}
              onClick={toggleLanguage}
              aria-label="تغيير اللغة"
            >
              {language === 'ar' ? 'ع' : 'EN'}
            </button>

            {/* Notification Bell - visible only for logged-in users */}
            {isAuthenticated && <NotificationBell />}

            <button
              className={styles.loginButton}
              onClick={handleAuthClick}
            >
              {isAuthenticated ? user.name : t('login')}
            </button>
            {isAuthenticated && (
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
                aria-label="الملف الشخصي"
              >
                {user.userType === 'driver' ? '🚗' : '🧑‍💼'}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Drawer with dynamic menu */}
      {drawerOpen && (
        <div className={styles.drawer}>
          <div className={styles.drawerOverlay} onClick={toggleDrawer} />
          <nav className={styles.drawerContent}>
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
            <div className={styles.drawerBody}>
              {/* الصفحة الرئيسية */}
              <button
                className={styles.drawerItem}
                onClick={() => { navigate('/'); toggleDrawer(); }}
              >
                🏠 الصفحة الرئيسية
              </button>

              {/* قسم السائقين */}
              {currentUser?.isDriver && (
                <>
                  <div className={styles.drawerSection}>قسم السائقين</div>
                  <button
                    className={styles.drawerItem}
                    onClick={() => { navigate('/post-offer'); toggleDrawer(); }}
                  >
                    🚗 نشر عرض رحلة
                  </button>
                  <button
                    className={styles.drawerItem}
                    onClick={() => { navigate('/offers'); toggleDrawer(); }}
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
                    onClick={() => { navigate('/', { state: { mode: 'demand' } }); toggleDrawer(); }}
                  >
                    🙋 نشر طلب رحلة
                  </button>
                  <button
                    className={styles.drawerItem}
                    onClick={() => { navigate('/demands'); toggleDrawer(); }}
                  >
                    📋 طلباتي
                  </button>
                </>
              )}

              {/* القسم المشترك */}
              {currentUser && (
                <>
                  <div className={styles.drawerSection}>المشترك</div>
                  <button
                    className={styles.drawerItem}
                    onClick={() => { navigate('/dashboard'); toggleDrawer(); }}
                  >
                    📊 لوحة التحكم
                  </button>
                  <button
                    className={styles.drawerItem}
                    onClick={() => { navigate(currentUser.isDriver ? '/demands' : '/offers'); toggleDrawer(); }}
                  >
                    👀 {currentUser.isDriver ? 'عرض الطلبات' : 'عرض العروض'}
                  </button>
                  <button
                    className={styles.drawerItem}
                    onClick={() => { navigate('/bookings'); toggleDrawer(); }}
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
                          padding: '0 4px'
                        }}
                      >
                        {pendingBookings.totalPending > 99 ? '99+' : pendingBookings.totalPending}
                      </span>
                    )}
                  </button>
                  <button
                    className={styles.drawerItem}
                    onClick={() => { navigate('/messages'); toggleDrawer(); }}
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
                          padding: '0 4px'
                        }}
                      >
                        {unreadMessages > 99 ? '99+' : unreadMessages}
                      </span>
                    )}
                  </button>
                  <button
                    className={styles.drawerItem}
                    onClick={() => { navigate('/profile'); toggleDrawer(); }}
                  >
                    👤 الملف الشخصي
                  </button>
                </>
              )}

              {/* إذا لم يكن مسجل دخول */}
              {!currentUser && (
                <p className={styles.placeholder}>
                  يرجى تسجيل الدخول لرؤية القائمة الكاملة
                </p>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="login"
        />
      )}

      {/* User Menu */}
      {showUserMenu && (
        <UserMenu 
          onClose={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
};

export default Header;



