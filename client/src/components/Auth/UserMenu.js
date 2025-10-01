import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const UserMenu = ({ onClose }) => {
  const [isAnimated, setIsAnimated] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    setIsAnimated(true);
  }, []);

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 'var(--space-4)',
      paddingTop: '80px',
      backdropFilter: 'blur(8px)',
      opacity: isAnimated ? 1 : 0,
      transition: 'opacity 0.3s ease-out'
    }}>
      <div style={{
        background: 'var(--surface-primary)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        maxWidth: '320px',
        width: '100%',
        boxShadow: 'var(--shadow-2xl)',
        border: '1px solid var(--border-light)',
        transform: isAnimated ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'transform 0.3s ease-out'
      }}>
        {/* User Info */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--space-6)',
          paddingBottom: 'var(--space-4)',
          borderBottom: '1px solid var(--border-light)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: user?.userType === 'driver' 
              ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
              : 'linear-gradient(135deg, var(--secondary) 0%, #4338ca 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-3) auto',
            fontSize: '2rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {user?.userType === 'driver' ? '🚗' : '🧑‍💼'}
          </div>
          
          <h3 style={{
            fontSize: 'var(--text-xl)',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-1)',
            fontFamily: '"Cairo", sans-serif'
          }}>
            {user?.name}
          </h3>
          
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            margin: 0,
            fontFamily: '"Cairo", sans-serif'
          }}>
            {user?.userType === 'driver' ? 'سائق' : 'راكب'} • {user?.city}
          </p>
        </div>

        {/* Menu Items */}
        <div style={{
          display: 'grid',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-6)'
        }}>
          {[
            { icon: '👤', label: 'الملف الشخصي', action: () => console.log('Profile') },
            { icon: '🚗', label: 'رحلاتي', action: () => console.log('My rides') },
            { icon: '⭐', label: 'التقييمات', action: () => console.log('Ratings') },
            { icon: '⚙️', label: 'الإعدادات', action: () => console.log('Settings') },
          ].map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                background: 'transparent',
                border: 'none',
                borderRadius: 'var(--radius)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-base)',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'var(--transition)',
                fontFamily: '"Cairo", sans-serif',
                textAlign: 'start',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--surface-secondary)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: 'var(--text-lg)' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: 'var(--space-3)',
            background: 'var(--surface-secondary)',
            border: '2px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--error)',
            fontSize: 'var(--text-base)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'var(--transition)',
            fontFamily: '"Cairo", sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = 'var(--error)';
            e.target.style.background = 'rgba(239, 68, 68, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = 'var(--border-light)';
            e.target.style.background = 'var(--surface-secondary)';
          }}
        >
          <span>🚪</span>
          تسجيل الخروج
        </button>

        {/* Close overlay */}
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1
          }}
        />
      </div>
    </div>
  );
};

export default UserMenu;
