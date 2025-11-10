/**
 * Theme Context
 * Context لإدارة الوضع المظلم/الفاتح (Dark/Light Mode)
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // جلب الوضع المحفوظ من localStorage أو استخدام الوضع الفاتح كافتراضي
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('toosila-theme');
    return saved === 'dark';
  });

  // تطبيق الوضع على document.body عند التغيير
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }

    // حفظ التفضيل في localStorage
    localStorage.setItem('toosila-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // دالة لتبديل الوضع
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const value = {
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? 'dark' : 'light',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Hook لاستخدام context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export default ThemeContext;
