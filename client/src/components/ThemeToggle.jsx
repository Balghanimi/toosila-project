/**
 * ThemeToggle Component
 * زر التبديل بين الوضع المظلم والفاتح
 */

import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ style = {} }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        background: isDarkMode ? '#1e293b' : '#f8fafc',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isDarkMode
          ? '0 2px 6px rgba(0, 0, 0, 0.3)'
          : '0 2px 6px rgba(0, 0, 0, 0.1)',
        flexShrink: 0,
        fontSize: '16px',
        ...style,
      }}
      title={isDarkMode ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع المظلم'}
      aria-label={isDarkMode ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع المظلم'}
    >
      {isDarkMode ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle;
