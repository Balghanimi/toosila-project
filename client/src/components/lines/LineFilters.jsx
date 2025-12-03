import React from 'react';
import styles from './LineFilters.module.css';

/**
 * LineFilters - Quick filter buttons for lines
 */
const LineFilters = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'الكل', icon: '📋' },
    { id: 'students', label: 'طلاب', icon: '🎓' },
    { id: 'employees', label: 'موظفين', icon: '💼' },
    { id: 'ladies', label: 'نسائي', icon: '👩' },
    { id: 'morning', label: 'صباحي', icon: '🌅' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.filtersRow}>
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={`${styles.filterButton} ${activeFilter === filter.id ? styles.active : ''}`}
            onClick={() => onFilterChange(filter.id)}
          >
            <span className={styles.filterIcon}>{filter.icon}</span>
            <span className={styles.filterLabel}>{filter.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LineFilters;
