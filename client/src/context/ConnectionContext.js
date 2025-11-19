import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ConnectionContext = createContext();

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
}

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://toosila-backend-production.up.railway.app/api'
    : 'http://localhost:5000/api');

export function ConnectionProvider({ children }) {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = useCallback(async () => {
    if (isChecking) return; // Prevent concurrent checks

    setIsChecking(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.ok === true) {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      // Network error, timeout, or aborted request
      console.warn('Backend health check failed:', error.message);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  }, [isChecking]);

  // Check connection every 10 seconds
  useEffect(() => {
    // Initial check
    checkConnection();

    // Set up interval for periodic checks
    const intervalId = setInterval(() => {
      checkConnection();
    }, 10000); // 10 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [checkConnection]);

  const value = {
    isConnected,
    checkConnection,
  };

  return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>;
}
