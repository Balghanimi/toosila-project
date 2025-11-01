import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'

  if (!isOpen) return null;

  const handleSwitchToRegister = () => setMode('register');
  const handleSwitchToLogin = () => setMode('login');

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px 20px 100px 20px',
      backdropFilter: 'blur(4px)',
      overflowY: 'auto'
    }}>
      <div
        style={{
          width: '100%',
          maxWidth: mode === 'register' ? '480px' : '440px',
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto',
          animation: 'fadeInScale 0.3s ease-out',
          transformOrigin: 'center',
          margin: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {mode === 'login' ? (
          <Login 
            onSwitchToRegister={handleSwitchToRegister}
            onClose={onClose}
          />
        ) : (
          <Register 
            onSwitchToLogin={handleSwitchToLogin}
            onClose={onClose}
          />
        )}
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

