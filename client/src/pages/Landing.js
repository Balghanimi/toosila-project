import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleToggle from '../components/RoleToggle';
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
  const [mode, setMode] = React.useState('passenger'); // 'passenger' | 'driver'
  const [passengers, setPassengers] = React.useState(1);
  const [price, setPrice] = React.useState(5000);

  const handlePassengersChange = (delta) => {
    setPassengers((prev) => Math.max(1, Math.min(5, prev + delta)));
  };

  const handlePriceChange = (delta) => {
    setPrice((prev) => Math.max(1000, prev + delta));
  };

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
        {/* Role Toggle Switch */}
        <div className={styles.toggleWrapper}>
          <RoleToggle mode={mode} onToggle={setMode} />
        </div>

        <div className={styles.searchCard}>
          <h2 className={styles.searchTitle}>
            {mode === 'passenger' ? 'ابحث عن رحلتك' : 'ابدأ رحلتك كسائق'}
          </h2>

          <div className={styles.searchForm}>
            <div className={styles.formGroup}>
              <label className={styles.label}>من</label>
              <input type="text" placeholder="المدينة أو المحافظة" className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>إلى</label>
              <input type="text" placeholder="المدينة أو المحافظة" className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>التاريخ</label>
              <input type="date" className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>عدد المقاعد</label>
              <div className={styles.counterControl}>
                <button
                  type="button"
                  className={styles.counterBtn}
                  onClick={() => handlePassengersChange(-1)}
                  disabled={passengers <= 1}
                >
                  −
                </button>
                <div className={styles.counterDisplay}>
                  <span className={styles.counterIcon}>💺</span>
                  <span className={styles.counterValue}>{passengers}</span>
                </div>
                <button
                  type="button"
                  className={styles.counterBtn}
                  onClick={() => handlePassengersChange(1)}
                  disabled={passengers >= 5}
                >
                  +
                </button>
              </div>
            </div>

            {mode === 'driver' && (
              <div className={styles.formGroup}>
                <label className={styles.label}>السعر</label>
                <div className={styles.counterControl}>
                  <button
                    type="button"
                    className={styles.counterBtn}
                    onClick={() => handlePriceChange(-500)}
                    disabled={price <= 1000}
                  >
                    −
                  </button>
                  <div className={styles.counterDisplay}>
                    <span className={styles.counterIcon}>💵</span>
                    <span className={styles.counterValue}>{price.toLocaleString('ar-IQ')}</span>
                  </div>
                  <button
                    type="button"
                    className={styles.counterBtn}
                    onClick={() => handlePriceChange(500)}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {mode === 'passenger' ? (
              <button className={styles.searchButton} onClick={() => navigate('/home')}>
                ابحث عن رحلة 🔍
              </button>
            ) : (
              <button
                className={styles.searchButton}
                onClick={() => navigate(currentUser ? '/lines/create' : '/login')}
                style={{ backgroundColor: '#28a745' }}
              >
                اعرض رحلة 🚗
              </button>
            )}
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
