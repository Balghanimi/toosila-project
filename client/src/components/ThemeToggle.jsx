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
        width: '60px',
        height: '30px',
        borderRadius: '15px',
        border: 'none',
        cursor: 'pointer',
        background: isDarkMode
          ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
          : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        transition: 'all 0.3s ease',
        boxShadow: isDarkMode
          ? '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 3px rgba(255, 255, 255, 0.1)'
          : '0 2px 8px rgba(251, 191, 36, 0.3), inset 0 1px 3px rgba(255, 255, 255, 0.5)',
        ...style
      }}
      title={isDarkMode ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع المظلم'}
    >
      {/* المؤشر المتحرك */}
      <div
        style={{
          position: 'absolute',
          top: '3px',
          right: isDarkMode ? '3px' : 'calc(100% - 27px)',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: isDarkMode ? '#1e293b' : '#ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px'
        }}
      >
        {isDarkMode ? '🌙' : '☀️'}
      </div>
    </button>
  );
};

export default ThemeToggle;
