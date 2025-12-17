import React from 'react';
import styles from './RoleToggle.module.css';

/**
 * Professional Role Toggle Component
 * Switches between 'driver' (سائق) and 'passenger' (راكب) modes.
 *
 * @param {string} mode - Current mode: 'passenger' | 'driver'
 * @param {function} onToggle - Callback function(newMode)
 */
const RoleToggle = ({ mode, onToggle }) => {
  // Determine if we are in driver mode for styling
  const isDriver = mode === 'driver';

  return (
    <div className={styles.toggleContainer} dir="ltr">
      {/* Background Slider Pill */}
      <div
        className={`${styles.slider} ${isDriver ? styles.slideRight : styles.slideLeft}`}
      />

      {/* Passenger Button (Left visually in LTR, but logically "Passenger") */}
      {/*
         Note on UI/UX: In the provided image, "Driver" (راكب) is Green/Left and "Passenger" (سائق) is Grey/Right?
         Wait, let's re-examine the image.
         Image shows: [Green Pill: "راكب"] [Grey Text: "سائق"]
         "راكب" means Passenger.
         "سائق" means Driver.
         So Passenger is active in the image (Green).

         If we want the Green Pill to slide:
         - If mode is 'passenger', slider should be on the left (or right depending on order).
         - Let's place "Passenger" (راكب) on the Left and "Driver" (سائق) on the Right for LTR container.
      */}

      <button
        type="button"
        className={`${styles.toggleBtn} ${mode === 'passenger' ? styles.active : ''}`}
        onClick={() => onToggle('passenger')}
        aria-pressed={mode === 'passenger'}
      >
        راكب
      </button>

      <button
        type="button"
        className={`${styles.toggleBtn} ${mode === 'driver' ? styles.active : ''}`}
        onClick={() => onToggle('driver')}
        aria-pressed={mode === 'driver'}
      >
        سائق
      </button>
    </div>
  );
};

export default RoleToggle;
