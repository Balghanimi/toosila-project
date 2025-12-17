import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * ModeContext - Global mode state for passenger/driver switching
 * Persists mode selection in localStorage
 */
const ModeContext = createContext();

export const ModeProvider = ({ children }) => {
  // Initialize from localStorage or default to 'passenger'
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('userMode');
    return savedMode || 'passenger';
  });

  // Persist mode changes to localStorage
  useEffect(() => {
    localStorage.setItem('userMode', mode);
  }, [mode]);

  const toggleMode = (newMode) => {
    console.log('ModeContext: toggleMode called with:', newMode);
    setMode(newMode);
    console.log('ModeContext: mode will be set to:', newMode);
  };

  return (
    <ModeContext.Provider value={{ mode, setMode: toggleMode }}>{children}</ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};
