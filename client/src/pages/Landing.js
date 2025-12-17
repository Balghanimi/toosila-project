import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Landing.module.css';
import '../styles/landing-enhancements.css';

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

      {/* Service Selection */}
      <section className={styles.servicesSection}>
        <h2 className={styles.sectionTitle}>اختر نوع الخدمة</h2>

        {/* Stats Banner - Trust Indicators */}
        <div className="landing-stats-banner">
          <div className="landing-stats-item">
            <span className="landing-stats-icon">🚗</span>
            <span className="landing-stats-number">+١٠،٠٠٠</span>
            <span className="landing-stats-label">رحلة ناجحة</span>
          </div>
          <div className="landing-stats-item">
            <span className="landing-stats-icon">⭐</span>
            <span className="landing-stats-number">٤.٨/٥</span>
            <span className="landing-stats-label">تقييم المستخدمين</span>
          </div>
          <div className="landing-stats-item">
            <span className="landing-stats-icon">👥</span>
            <span className="landing-stats-number">+٥،٠٠٠</span>
            <span className="landing-stats-label">مستخدم نشط</span>
          </div>
        </div>

        {/* Card 1: Rides (Active) */}
        <div className={styles.serviceCard}>
          <span className={styles.badgeActive}>✨ متوفر الآن</span>
          <div className={styles.cardIcon + ' ' + styles.iconGreen}>🚗</div>
          <h3 className={styles.cardTitle}>رحلات بين المدن</h3>
          <p className={styles.cardSubtitle}>سافر للمحافظات من باب بيتك!</p>
          <p className={styles.cardDescription}>
            لا كراج ولا انتظار.. اختر سائقك واتفق على السعر وسافر مرتاح
          </p>
          <div className={styles.tags}>
            <span className={styles.tag}>🚗 عروض سائقين</span>
            <span className={styles.tag}>💬 محادثة</span>
            <span className={styles.tag}>⭐ تقييمات</span>
          </div>
          <button className={styles.ctaGreen} onClick={() => navigate('/home')}>
            ابحث عن رحلة ←
          </button>
        </div>

        {/* Card 2: Lines (Coming Soon) */}
        <div className={styles.serviceCard + ' ' + styles.cardComingSoon}>
          <span className={styles.badgeComingSoon}>🔜 قريباً</span>
          <div className={styles.cardIcon + ' ' + styles.iconOrange}>🚌</div>
          <h3 className={styles.cardTitle}>خطوط منتظمة</h3>
          <p className={styles.cardSubtitle}>اشتراكات يومية وشهرية</p>
          <div className={styles.tags}>
            <span className={styles.tag}>🎓 طلاب</span>
            <span className={styles.tag}>💼 موظفين</span>
            <span className={styles.tag}>👩 للنساء</span>
          </div>
          <button className={styles.ctaOrange} onClick={() => navigate('/lines-coming-soon')}>
            🔔 أبلغني عند التوفر
          </button>
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
