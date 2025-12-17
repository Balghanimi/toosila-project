import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Landing.module.css';
// import '../styles/landing-enhancements.css'; // Phase 1 enhancements
import '../styles/landing-modern.css'; // Modern redesign (GoSwift-inspired)

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

      {/* Popular Routes Section */}
      <section className="popular-routes-section">
        <h2 className="popular-routes-title">وجهات شائعة</h2>
        <div className="popular-routes-grid">
          <div className="route-tile" onClick={() => navigate('/home')} role="button" tabIndex={0}>
            <span className="route-icon">🏙️</span>
            <div className="route-name">بغداد ← البصرة</div>
            <div className="route-subtitle">٣٠+ رحلة</div>
          </div>
          <div className="route-tile" onClick={() => navigate('/home')} role="button" tabIndex={0}>
            <span className="route-icon">⛰️</span>
            <div className="route-name">بغداد ← أربيل</div>
            <div className="route-subtitle">٢٥+ رحلة</div>
          </div>
          <div className="route-tile" onClick={() => navigate('/home')} role="button" tabIndex={0}>
            <span className="route-icon">🕌</span>
            <div className="route-name">بغداد ← كربلاء</div>
            <div className="route-subtitle">٤٠+ رحلة</div>
          </div>
          <div className="route-tile" onClick={() => navigate('/home')} role="button" tabIndex={0}>
            <span className="route-icon">🌊</span>
            <div className="route-name">البصرة ← أربيل</div>
            <div className="route-subtitle">١٥+ رحلة</div>
          </div>
          <div className="route-tile" onClick={() => navigate('/home')} role="button" tabIndex={0}>
            <span className="route-icon">🏛️</span>
            <div className="route-name">بغداد ← الموصل</div>
            <div className="route-subtitle">٢٠+ رحلة</div>
          </div>
          <div className="route-tile" onClick={() => navigate('/home')} role="button" tabIndex={0}>
            <span className="route-icon">⭐</span>
            <div className="route-name">عرض الكل</div>
            <div className="route-subtitle">جميع الوجهات</div>
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="recent-activity-section">
        <h2 className="recent-activity-title">نشاط حديث</h2>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">🚗</span>
            <div className="activity-content">
              <div className="activity-text">محمد حجز رحلة إلى البصرة</div>
              <div className="activity-time">منذ ٥ دقائق</div>
            </div>
            <span className="activity-badge">✓ مؤكدة</span>
          </div>
          <div className="activity-item">
            <span className="activity-icon">🚗</span>
            <div className="activity-content">
              <div className="activity-text">سارة أضافت عرض رحلة إلى أربيل</div>
              <div className="activity-time">منذ ١٥ دقيقة</div>
            </div>
            <span className="activity-badge">✓ نشطة</span>
          </div>
          <div className="activity-item">
            <span className="activity-icon">⭐</span>
            <div className="activity-content">
              <div className="activity-text">أحمد قيّم رحلة بـ ٥ نجوم</div>
              <div className="activity-time">منذ ٣٠ دقيقة</div>
            </div>
            <span className="activity-badge">★ 5.0</span>
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
