import React from 'react';
import { useConnection } from '../context/ConnectionContext';
import '../styles/ConnectionOverlay.css';

export default function ConnectionOverlay() {
  const { isConnected, checkConnection } = useConnection();

  if (isConnected) {
    return null; // Don't render anything when connected
  }

  return (
    <div className="connection-overlay">
      <div className="connection-overlay-content">
        <div className="connection-icon">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        </div>
        <h2 className="connection-title">
          <span className="ar">اتصال منقطع</span>
          <span className="divider"> / </span>
          <span className="en">Connection Lost</span>
        </h2>
        <p className="connection-message">
          <span className="ar">لا يمكن الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.</span>
          <br />
          <span className="en">
            Unable to connect to the server. Please check your internet connection.
          </span>
        </p>
        <button className="connection-retry-btn" onClick={checkConnection}>
          <span className="ar">إعادة المحاولة</span>
          <span className="divider"> / </span>
          <span className="en">Retry</span>
        </button>
      </div>
    </div>
  );
}
