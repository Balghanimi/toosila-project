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
        position: 'relative',
        width: '36px',
        height: '20px',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        background: isDarkMode
          ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
          : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        transition: 'all 0.3s ease',
        boxShadow: isDarkMode
          ? '0 2px 4px rgba(0, 0, 0, 0.3)'
          : '0 2px 4px rgba(251, 191, 36, 0.4)',
        flexShrink: 0,
        ...style,
      }}
      title={isDarkMode ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع المظلم'}
      aria-label={isDarkMode ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع المظلم'}
    >
      {/* المؤشر المتحرك */}
      <div
        style={{
          position: 'absolute',
          top: '2px',
          right: isDarkMode ? '2px' : 'calc(100% - 18px)',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: isDarkMode ? '#1e293b' : '#ffffff',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '9px',
        }}
      >
        {isDarkMode ? '🌙' : '☀️'}
      </div>
    </button>
  );
};

export default ThemeToggle;
