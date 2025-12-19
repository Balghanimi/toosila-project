import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
  const { currentUser, logout, toggleUserType } = useAuth();
  const { mode, setMode } = useMode();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!currentUser) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)', textAlign: 'center' }}>
        <h2 style={{ fontFamily: '"Cairo", sans-serif', color: 'var(--text-secondary)' }}>
          الرجاء تسجيل الدخول
        </h2>
      </div>
    );
  }

  const toggleDriverStatus = async () => {
    setIsUpdating(true);
    setMessage('');
    setError('');

    try {
      // Toggle mode using ModeContext
      const newMode = mode === 'driver' ? 'passenger' : 'driver';
      setMode(newMode);

      // Also update AuthContext for consistency
      const result = await toggleUserType();

      setMessage(
        newMode === 'driver'
          ? 'تم التبديل إلى وضع السائق بنجاح ✅'
          : 'تم التبديل إلى وضع الراكب بنجاح ✅'
      );
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('حدث خطأ أثناء التحديث. حاول مرة أخرى.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        paddingTop: 'var(--space-6)',
        paddingBottom: '100px',
        background: isDarkMode
          ? 'linear-gradient(to bottom, rgba(52, 199, 89, 0.08) 0%, transparent 50%)'
          : 'linear-gradient(to bottom, rgba(52, 199, 89, 0.03) 0%, transparent 50%)',
        minHeight: '100vh',
      }}
    >
      {/* Profile Header */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: 'var(--space-8)',
          background: isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'white',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-8) var(--space-4)',
          boxShadow: isDarkMode
            ? '0 4px 20px rgba(0, 0, 0, 0.4)'
            : '0 4px 20px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          overflow: 'hidden',
          border: isDarkMode ? '1px solid rgba(52, 199, 89, 0.2)' : 'none',
        }}
      >
        {/* Decorative background circles */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            left: '-60px',
            width: '200px',
            height: '200px',
            background: isDarkMode
              ? 'linear-gradient(135deg, rgba(52, 199, 89, 0.15) 0%, rgba(52, 199, 89, 0.08) 100%)'
              : 'linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(52, 199, 89, 0.05) 100%)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            right: '-80px',
            width: '250px',
            height: '250px',
            background: isDarkMode
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.06) 100%)'
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            onClick={() =>
              navigate('/home', { state: currentUser.isDriver ? { mode: 'offer' } : undefined })
            }
            role="button"
            tabIndex={0}
            aria-label={currentUser.isDriver ? 'انقر لنشر رحلة جديدة' : 'انقر للبحث عن رحلة'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/home', { state: currentUser.isDriver ? { mode: 'offer' } : undefined });
              }
            }}
            style={{
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #34c759 0%, #28a745 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4) auto',
              boxShadow: '0 10px 30px rgba(52, 199, 89, 0.3)',
              border: '5px solid white',
              fontSize: '4rem',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.15) rotate(5deg)';
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(52, 199, 89, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(52, 199, 89, 0.3)';
            }}
            title={currentUser.isDriver ? 'انقر لنشر رحلة' : 'انقر للبحث عن رحلة'}
          >
            {currentUser.isDriver ? '🚗' : '🧑‍💼'}
            {/* Click hint badge */}
            <div
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
                animation: 'bounce 2s infinite',
                border: '3px solid white',
              }}
            >
              ✨
            </div>
          </div>

          <h1
            style={{
              fontSize: '2rem',
              fontWeight: '800',
              color: isDarkMode ? '#ffffff' : '#1a1a1a',
              marginBottom: 'var(--space-2)',
              fontFamily: '"Cairo", sans-serif',
              textShadow: isDarkMode ? '0 2px 10px rgba(52, 199, 89, 0.3)' : 'none',
            }}
          >
            {currentUser.name}
          </h1>

          <p
            style={{
              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-secondary)',
              fontSize: 'var(--text-base)',
              fontFamily: '"Cairo", sans-serif',
              fontWeight: '500',
              marginBottom: 'var(--space-3)',
            }}
          >
            {currentUser.email}
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-5)',
              background: currentUser.isDriver
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                : 'linear-gradient(135deg, #34c759 0%, #28a745 100%)',
              color: 'white',
              borderRadius: '50px',
              fontSize: 'var(--text-sm)',
              fontWeight: '700',
              fontFamily: '"Cairo", sans-serif',
              boxShadow: currentUser.isDriver
                ? '0 4px 15px rgba(59, 130, 246, 0.3)'
                : '0 4px 15px rgba(52, 199, 89, 0.3)',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{currentUser.isDriver ? '🚗' : '🧑‍💼'}</span>
            <span>{currentUser.isDriver ? 'سائق' : 'راكب'}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div
          style={{
            background: '#d1fae5',
            border: '2px solid #10b981',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
            color: '#065f46',
            fontFamily: '"Cairo", sans-serif',
            textAlign: 'center',
            fontSize: 'var(--text-base)',
            fontWeight: '600',
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            background: '#fee',
            border: '2px solid #f88',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
            color: '#c00',
            fontFamily: '"Cairo", sans-serif',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      {/* Quick Actions Card - Role-based */}
      <div
        style={{
          background: 'linear-gradient(135deg, #34c759 0%, #28a745 100%)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-7)',
          boxShadow: '0 10px 40px rgba(52, 199, 89, 0.3)',
          border: 'none',
          marginBottom: 'var(--space-6)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '250px',
            height: '250px',
            background: 'rgba(255, 255, 255, 0.12)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-10%',
            width: '180px',
            height: '180px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-3)',
            }}
          >
            <span style={{ fontSize: '2rem' }}>⚡</span>
            <h2
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: '800',
                color: 'white',
                fontFamily: '"Cairo", sans-serif',
                margin: 0,
              }}
            >
              إجراءات سريعة
            </h2>
          </div>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.95)',
              fontSize: 'var(--text-base)',
              fontFamily: '"Cairo", sans-serif',
              marginBottom: 'var(--space-6)',
              textAlign: 'center',
              fontWeight: '500',
            }}
          >
            {currentUser.isDriver ? 'ابدأ بنشر رحلتك الآن' : 'ابحث عن رحلتك المثالية'}
          </p>

          {/* Quick Action Button - Driver */}
          {currentUser.isDriver ? (
            <button
              onClick={() => navigate('/home', { state: { mode: 'offer' } })}
              style={{
                width: '100%',
                padding: 'var(--space-5)',
                background: 'white',
                color: '#34c759',
                border: 'none',
                borderRadius: 'var(--radius-xl)',
                fontSize: 'var(--text-xl)',
                fontWeight: '800',
                cursor: 'pointer',
                fontFamily: '"Cairo", sans-serif',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-3)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px) scale(1.02)';
                e.target.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.25)';
              }}
            >
              <span style={{ fontSize: '2.5rem' }}>🚗</span>
              <span>نشر رحلة جديدة</span>
            </button>
          ) : (
            /* Quick Actions for Passenger */
            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              <button
                onClick={() => navigate('/home')}
                style={{
                  width: '100%',
                  padding: 'var(--space-5)',
                  background: 'white',
                  color: '#34c759',
                  border: 'none',
                  borderRadius: 'var(--radius-xl)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontFamily: '"Cairo", sans-serif',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
                  transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-3)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px) scale(1.02)';
                  e.target.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.25)';
                }}
              >
                <span style={{ fontSize: '2rem' }}>🔍</span>
                <span>البحث عن رحلة</span>
              </button>

              <button
                onClick={() => navigate('/home', { state: { mode: 'demand' } })}
                style={{
                  width: '100%',
                  padding: 'var(--space-5)',
                  background: 'rgba(255, 255, 255, 0.25)',
                  color: 'white',
                  border: '3px solid white',
                  borderRadius: 'var(--radius-xl)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontFamily: '"Cairo", sans-serif',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-3)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px) scale(1.02)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                }}
              >
                <span style={{ fontSize: '2rem' }}>💺</span>
                <span>نشر طلب رحلة</span>
              </button>
            </div>
          )}

          {/* View My Posts/Requests */}
          <button
            onClick={() => navigate(currentUser.isDriver ? '/offers' : '/demands')}
            style={{
              width: '100%',
              padding: 'var(--space-4)',
              background: 'transparent',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-base)',
              fontWeight: '700',
              cursor: 'pointer',
              fontFamily: '"Cairo", sans-serif',
              transition: 'all 0.3s ease',
              marginTop: 'var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.15)';
              e.target.style.borderColor = 'white';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>📋</span>
            <span>{currentUser.isDriver ? 'عرض رحلاتي' : 'عرض طلباتي'}</span>
          </button>
        </div>
      </div>

      {/* Role Switcher Card */}
      <div
        style={{
          background: isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'white',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-7)',
          boxShadow: isDarkMode
            ? '0 4px 20px rgba(0, 0, 0, 0.4)'
            : '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: isDarkMode ? '1px solid rgba(52, 199, 89, 0.2)' : 'none',
          marginBottom: 'var(--space-6)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative gradient bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #34c759 0%, #3b82f6 100%)',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <span style={{ fontSize: '1.8rem' }}>🔄</span>
          <h2
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: '800',
              color: isDarkMode ? '#ffffff' : 'var(--text-primary)',
              fontFamily: '"Cairo", sans-serif',
              margin: 0,
            }}
          >
            تبديل الدور
          </h2>
        </div>

        <p
          style={{
            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-secondary)',
            fontSize: 'var(--text-base)',
            fontFamily: '"Cairo", sans-serif',
            marginBottom: 'var(--space-4)',
            lineHeight: '1.6',
          }}
        >
          يمكنك التبديل بين دور السائق والراكب في أي وقت.
          {mode === 'driver'
            ? ' حالياً أنت سائق - يمكنك نشر عروض الرحلات.'
            : ' حالياً أنت راكب - يمكنك طلب رحلات.'}
        </p>

        <button
          onClick={toggleDriverStatus}
          disabled={isUpdating}
          style={{
            width: '100%',
            padding: 'var(--space-5)',
            background: isUpdating
              ? '#d1d5db'
              : 'linear-gradient(135deg, #34c759 0%, #28a745 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-xl)',
            fontSize: 'var(--text-lg)',
            fontWeight: '800',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            fontFamily: '"Cairo", sans-serif',
            boxShadow: isUpdating ? 'none' : '0 6px 20px rgba(52, 199, 89, 0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-3)',
          }}
          onMouseEnter={(e) => {
            if (!isUpdating) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(52, 199, 89, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isUpdating) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 6px 20px rgba(52, 199, 89, 0.3)';
            }
          }}
        >
          {isUpdating ? (
            <>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              جاري التحديث...
            </>
          ) : (
            <>{mode === 'driver' ? '🧑‍💼 التبديل إلى راكب' : '🚗 التبديل إلى سائق'}</>
          )}
        </button>
      </div>

      {/* Account Info */}
      <div
        style={{
          background: isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'white',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-7)',
          boxShadow: isDarkMode
            ? '0 4px 20px rgba(0, 0, 0, 0.4)'
            : '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: isDarkMode ? '1px solid rgba(59, 130, 246, 0.2)' : 'none',
          marginBottom: 'var(--space-6)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative gradient bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-5)',
          }}
        >
          <span style={{ fontSize: '1.8rem' }}>📋</span>
          <h2
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: '800',
              color: isDarkMode ? '#ffffff' : 'var(--text-primary)',
              fontFamily: '"Cairo", sans-serif',
              margin: 0,
            }}
          >
            معلومات الحساب
          </h2>
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <div
            style={{
              padding: 'var(--space-4)',
              background: isDarkMode
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)'
                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
              borderRadius: 'var(--radius-lg)',
              fontFamily: '"Cairo", sans-serif',
              border: isDarkMode
                ? '2px solid rgba(59, 130, 246, 0.25)'
                : '2px solid rgba(59, 130, 246, 0.1)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = isDarkMode
                ? 'rgba(59, 130, 246, 0.5)'
                : 'rgba(59, 130, 246, 0.3)';
              e.currentTarget.style.transform = 'translateX(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isDarkMode
                ? 'rgba(59, 130, 246, 0.25)'
                : 'rgba(59, 130, 246, 0.1)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <div
              style={{
                fontSize: 'var(--text-sm)',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'var(--text-secondary)',
                marginBottom: 'var(--space-2)',
                fontWeight: '600',
              }}
            >
              👤 الاسم
            </div>
            <div
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: '700',
                color: isDarkMode ? '#ffffff' : 'var(--text-primary)',
              }}
            >
              {currentUser.name}
            </div>
          </div>

          <div
            style={{
              padding: 'var(--space-4)',
              background: isDarkMode
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)'
                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
              borderRadius: 'var(--radius-lg)',
              fontFamily: '"Cairo", sans-serif',
              border: isDarkMode
                ? '2px solid rgba(139, 92, 246, 0.25)'
                : '2px solid rgba(139, 92, 246, 0.1)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = isDarkMode
                ? 'rgba(139, 92, 246, 0.5)'
                : 'rgba(139, 92, 246, 0.3)';
              e.currentTarget.style.transform = 'translateX(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isDarkMode
                ? 'rgba(139, 92, 246, 0.25)'
                : 'rgba(139, 92, 246, 0.1)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <div
              style={{
                fontSize: 'var(--text-sm)',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'var(--text-secondary)',
                marginBottom: 'var(--space-2)',
                fontWeight: '600',
              }}
            >
              ✉️ البريد الإلكتروني
            </div>
            <div
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: '700',
                color: isDarkMode ? '#ffffff' : 'var(--text-primary)',
              }}
            >
              {currentUser.email}
            </div>
          </div>

          <div
            style={{
              padding: 'var(--space-4)',
              background: isDarkMode
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)'
                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
              borderRadius: 'var(--radius-lg)',
              fontFamily: '"Cairo", sans-serif',
              border: isDarkMode
                ? '2px solid rgba(59, 130, 246, 0.25)'
                : '2px solid rgba(59, 130, 246, 0.1)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = isDarkMode
                ? 'rgba(59, 130, 246, 0.5)'
                : 'rgba(59, 130, 246, 0.3)';
              e.currentTarget.style.transform = 'translateX(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isDarkMode
                ? 'rgba(59, 130, 246, 0.25)'
                : 'rgba(59, 130, 246, 0.1)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <div
              style={{
                fontSize: 'var(--text-sm)',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'var(--text-secondary)',
                marginBottom: 'var(--space-2)',
                fontWeight: '600',
              }}
            >
              🎭 الدور الحالي
            </div>
            <div
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: '700',
                color: isDarkMode ? '#ffffff' : 'var(--text-primary)',
              }}
            >
              {currentUser.isDriver ? '🚗 سائق' : '🧑‍💼 راكب'}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        style={{
          width: '100%',
          padding: 'var(--space-5)',
          background: isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'white',
          color: '#ef4444',
          border: isDarkMode ? '2px solid rgba(239, 68, 68, 0.3)' : '2px solid #fecaca',
          borderRadius: 'var(--radius-xl)',
          fontSize: 'var(--text-lg)',
          fontWeight: '700',
          cursor: 'pointer',
          fontFamily: '"Cairo", sans-serif',
          transition: 'all 0.3s ease',
          boxShadow: isDarkMode
            ? '0 2px 10px rgba(0, 0, 0, 0.3)'
            : '0 2px 10px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = isDarkMode ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2';
          e.target.style.borderColor = '#ef4444';
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = isDarkMode
            ? '0 4px 15px rgba(239, 68, 68, 0.3)'
            : '0 4px 15px rgba(220, 38, 38, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'white';
          e.target.style.borderColor = isDarkMode ? 'rgba(239, 68, 68, 0.3)' : '#fecaca';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = isDarkMode
            ? '0 2px 10px rgba(0, 0, 0, 0.3)'
            : '0 2px 10px rgba(0, 0, 0, 0.05)';
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>🚪</span>
        <span>تسجيل الخروج</span>
      </button>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-8px,0);
          }
          70% {
            transform: translate3d(0,-4px,0);
          }
          90% {
            transform: translate3d(0,-2px,0);
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(Profile);
