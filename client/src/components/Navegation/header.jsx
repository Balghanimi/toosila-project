import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Header.module.css';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import AuthModal from '../Auth/AuthModal';
import UserMenu from '../Auth/UserMenu';

const Header = ({ title = 'توصيلة' }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();

  // Dynamic page titles based on routes
  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/': 'توصيلة',
      '/post-offer': 'انشر رحلة',
      '/offers': 'العروض المتاحة',
      '/post-demand': 'طلب مقعد',
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

      {/* Simple Drawer Placeholder */}
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
              <p className={styles.placeholder}>محتوى الدرج قيد التطوير...</p>
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



