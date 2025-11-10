import React from 'react';
import styles from './bottom.module.css';

const NAV_ITEMS = [
  { key: 'home', label: 'الرئيسية', icon: '🏠' },
  { key: 'post-offer', label: 'نشر رحلة', icon: '🚗' },
  { key: 'offers', label: 'البحث عن رحلات', icon: '🔎' },
];

export default function BottomNav({ current = 'home', onChange }) {
  return (
    <nav className={styles.bottomBar}>
      {NAV_ITEMS.map((item) => {
        const isActive = current === item.key;
        return (
          <button
            key={item.key}
            className={`${styles.item} ${isActive ? styles.active : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange && onChange(item.key)}
          >
            <span className={styles.icon} aria-hidden>
              {item.icon}
            </span>
            <span className={styles.label}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
