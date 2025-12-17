import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Landing.module.css';
// import '../styles/landing-enhancements.css'; // Phase 1 enhancements
import '../styles/landing-modern.css'; // Modern redesign (GoSwift-inspired)
import '../styles/landing-layout-fix.css'; // Layout improvements (wider, 2-column grid)

/**
 * Landing Page - Service Selection
 * Shows two service cards: Rides (active) and Lines (coming soon)
 */
const Landing = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {currentUser ? (
            <button
              className={styles.profileBtn}
              onClick={() => navigate('/profile')}
              aria-label="الملف الشخصي"
            >
              {currentUser.name?.charAt(0) || '👤'}
            </button>
          ) : (
            <button className={styles.loginBtn} onClick={() => navigate('/login')}>
              دخول
            </button>
          )}
        </div>
        <div className={styles.headerRight}>
          <span className={styles.langToggle}>EN</span>
        </div>
      </header>

      {/* Logo Section */}
      <section className={styles.logoSection}>
        <div className={styles.logoIcon}>🚗</div>
        <h1 className={styles.logoText}>توصيلة</h1>
        <p className={styles.slogan}>رحلات مشتركة.. وخطوط منتظمة</p>
      </section>

      {/* Simple Search Form */}
      <section className={styles.searchSection}>
        <div className={styles.searchCard}>
          <h2 className={styles.searchTitle}>ابحث عن رحلتك</h2>

          <div className={styles.searchForm}>
            <div className={styles.formGroup}>
              <label className={styles.label}>من</label>
              <input
                type="text"
                placeholder="المدينة أو المحافظة"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>إلى</label>
              <input
                type="text"
                placeholder="المدينة أو المحافظة"
                className={styles.input}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>التاريخ</label>
                <input
                  type="date"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>الركاب</label>
                <select className={styles.input}>
                  <option value="1">١</option>
                  <option value="2">٢</option>
                  <option value="3">٣</option>
                  <option value="4">٤</option>
                  <option value="5">٥+</option>
                </select>
              </div>
            </div>

            <button
              className={styles.searchButton}
              onClick={() => navigate('/home')}
            >
              ابحث عن رحلة 🔍
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>🇮🇶 صُنع بفخر في العراق</div>
        <div className={styles.footerLinks}>
          <button onClick={() => navigate('/privacy')}>سياسة الخصوصية</button>
          <span>|</span>
          <button onClick={() => navigate('/contact')}>اتصل بنا</button>
          <span>|</span>
          <button onClick={() => navigate('/about')}>عن توصيلة</button>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
