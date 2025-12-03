import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ModeSelection.module.css';

/**
 * ModeSelection - Entry screen for choosing between Trips and Lines
 */
const ModeSelection = () => {
  const navigate = useNavigate();

  const handleSelectMode = (mode) => {
    // Save preference to localStorage
    localStorage.setItem('preferred_mode', mode);

    if (mode === 'trips') {
      navigate('/');
    } else {
      navigate('/lines');
    }
  };

  const handleSkip = () => {
    // Default to trips
    localStorage.setItem('preferred_mode', 'trips');
    navigate('/');
  };

  return (
    <div className={styles.container}>
      {/* Background decorations */}
      <div className={styles.bgCircle1} />
      <div className={styles.bgCircle2} />

      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>مرحباً بك في توصيلة</h1>
          <p className={styles.subtitle}>اختر طريقة التنقل المناسبة لك</p>
        </div>

        {/* Mode Cards */}
        <div className={styles.cardsContainer}>
          {/* Trips Card */}
          <button
            className={styles.modeCard}
            onClick={() => handleSelectMode('trips')}
          >
            <div className={styles.cardIcon}>🚗</div>
            <h2 className={styles.cardTitle}>رحلات</h2>
            <p className={styles.cardDescription}>
              رحلات فردية من مدينة إلى أخرى
            </p>
            <ul className={styles.cardFeatures}>
              <li>حجز رحلة واحدة</li>
              <li>اختيار التاريخ والوقت</li>
              <li>دفع لكل رحلة</li>
            </ul>
            <div className={styles.cardBadge}>مرن</div>
          </button>

          {/* Lines Card */}
          <button
            className={styles.modeCard}
            onClick={() => handleSelectMode('lines')}
          >
            <div className={styles.cardIcon}>🚌</div>
            <h2 className={styles.cardTitle}>خطوط</h2>
            <p className={styles.cardDescription}>
              اشتراك يومي للطلاب والموظفين
            </p>
            <ul className={styles.cardFeatures}>
              <li>اشتراك شهري/أسبوعي</li>
              <li>مواعيد ثابتة يومياً</li>
              <li>توفير أكثر</li>
            </ul>
            <div className={`${styles.cardBadge} ${styles.badgeNew}`}>جديد</div>
          </button>
        </div>

        {/* Skip Button */}
        <button className={styles.skipButton} onClick={handleSkip}>
          تخطي واختر لاحقاً
        </button>

        {/* Info Note */}
        <p className={styles.infoNote}>
          يمكنك التبديل بين الوضعين في أي وقت من القائمة
        </p>
      </div>
    </div>
  );
};

export default ModeSelection;
