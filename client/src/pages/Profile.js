import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { currentUser, updateProfile, logout } = useAuth();
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
      const result = await updateProfile({
        isDriver: !currentUser.isDriver
      });

      if (result.success) {
        setMessage(
          currentUser.isDriver
            ? 'تم التبديل إلى وضع الراكب بنجاح ✅ جاري تحديث الصفحة...'
            : 'تم التبديل إلى وضع السائق بنجاح ✅ جاري تحديث الصفحة...'
        );

        // Reload page after 1.5 seconds to refresh user state
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(result.error || 'حدث خطأ أثناء التحديث. حاول مرة أخرى.');
      }

    } catch (err) {
      console.error('Error updating profile:', err);
      setError('حدث خطأ أثناء التحديث. حاول مرة أخرى.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: '100px' }}>
      {/* Profile Header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <div
          onClick={() => navigate(currentUser.isDriver ? '/post-offer' : '/')}
          style={{
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-4) auto',
            boxShadow: 'var(--shadow-xl)',
            border: '4px solid var(--surface-primary)',
            fontSize: '3rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(52, 199, 89, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
          }}
          title={currentUser.isDriver ? 'انقر لنشر رحلة' : 'انقر للبحث عن رحلة'}
        >
          {currentUser.isDriver ? '🚗' : '🧑‍💼'}
          {/* Click hint badge */}
          <div style={{
            position: 'absolute',
            bottom: '-5px',
            right: '-5px',
            width: '30px',
            height: '30px',
            background: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            animation: 'bounce 2s infinite'
          }}>
            ✨
          </div>
        </div>

        <h1 style={{
          fontSize: 'var(--text-3xl)',
          fontWeight: '800',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-2)',
          fontFamily: '"Cairo", sans-serif'
        }}>
          {currentUser.name}
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: 'var(--text-lg)',
          fontFamily: '"Cairo", sans-serif',
          fontWeight: '500'
        }}>
          {currentUser.email}
        </p>

        <div style={{
          display: 'inline-block',
          marginTop: 'var(--space-3)',
          padding: 'var(--space-2) var(--space-4)',
          background: currentUser.isDriver ? '#dbeafe' : '#f0fdf4',
          color: currentUser.isDriver ? '#1e40af' : '#15803d',
          borderRadius: 'var(--radius-lg)',
          fontSize: 'var(--text-sm)',
          fontWeight: '600',
          fontFamily: '"Cairo", sans-serif'
        }}>
          {currentUser.isDriver ? '🚗 سائق' : '🧑‍💼 راكب'}
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div style={{
          background: '#d1fae5',
          border: '2px solid #10b981',
          borderRadius: 'var(--radius)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
          color: '#065f46',
          fontFamily: '"Cairo", sans-serif',
          textAlign: 'center',
          fontSize: 'var(--text-base)',
          fontWeight: '600'
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{
          background: '#fee',
          border: '2px solid #f88',
          borderRadius: 'var(--radius)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
          color: '#c00',
          fontFamily: '"Cairo", sans-serif',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* Quick Actions Card - Role-based */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-xl)',
        border: 'none',
        marginBottom: 'var(--space-6)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: 'var(--text-xl)',
            fontWeight: '700',
            color: 'white',
            marginBottom: 'var(--space-2)',
            fontFamily: '"Cairo", sans-serif',
            textAlign: 'center'
          }}>
            ⚡ إجراءات سريعة
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: 'var(--text-sm)',
            fontFamily: '"Cairo", sans-serif',
            marginBottom: 'var(--space-5)',
            textAlign: 'center'
          }}>
            {currentUser.isDriver ? 'ابدأ بنشر رحلتك الآن' : 'ابحث عن رحلتك المثالية'}
          </p>

          {/* Quick Action Button - Driver */}
          {currentUser.isDriver ? (
            <button
              onClick={() => navigate('/post-offer')}
              style={{
                width: '100%',
                padding: 'var(--space-5)',
                background: 'white',
                color: 'var(--primary)',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-lg)',
                fontWeight: '700',
                cursor: 'pointer',
                fontFamily: '"Cairo", sans-serif',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
              }}
            >
              <span style={{ fontSize: '2rem' }}>🚗</span>
              <span>نشر رحلة جديدة</span>
            </button>
          ) : (
            /* Quick Actions for Passenger */
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  width: '100%',
                  padding: 'var(--space-4)',
                  background: 'white',
                  color: 'var(--primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-base)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontFamily: '"Cairo", sans-serif',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>🔍</span>
                <span>البحث عن رحلة</span>
              </button>

              <button
                onClick={() => navigate('/', { state: { mode: 'demand' } })}
                style={{
                  width: '100%',
                  padding: 'var(--space-4)',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '2px solid white',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-base)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontFamily: '"Cairo", sans-serif',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>💺</span>
                <span>نشر طلب رحلة</span>
              </button>
            </div>
          )}

          {/* View My Posts/Requests */}
          <button
            onClick={() => navigate(currentUser.isDriver ? '/offers' : '/demands')}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              background: 'transparent',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--text-sm)',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: '"Cairo", sans-serif',
              transition: 'all 0.3s ease',
              marginTop: 'var(--space-3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.borderColor = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
          >
            {currentUser.isDriver ? '📋 عرض رحلاتي' : '📋 عرض طلباتي'}
          </button>
        </div>
      </div>

      {/* Role Switcher Card */}
      <div style={{
        background: 'var(--surface-primary)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-light)',
        marginBottom: 'var(--space-6)'
      }}>
        <h2 style={{
          fontSize: 'var(--text-xl)',
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-4)',
          fontFamily: '"Cairo", sans-serif'
        }}>
          🔄 تبديل الدور
        </h2>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: 'var(--text-base)',
          fontFamily: '"Cairo", sans-serif',
          marginBottom: 'var(--space-4)',
          lineHeight: '1.6'
        }}>
          يمكنك التبديل بين دور السائق والراكب في أي وقت.
          {currentUser.isDriver
            ? ' حالياً أنت سائق - يمكنك نشر عروض الرحلات.'
            : ' حالياً أنت راكب - يمكنك طلب رحلات.'}
        </p>

        <button
          onClick={toggleDriverStatus}
          disabled={isUpdating}
          style={{
            width: '100%',
            padding: 'var(--space-4)',
            background: isUpdating
              ? 'var(--text-muted)'
              : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--text-lg)',
            fontWeight: '700',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            fontFamily: '"Cairo", sans-serif',
            boxShadow: isUpdating ? 'none' : 'var(--shadow-md)',
            transition: 'var(--transition)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)'
          }}
        >
          {isUpdating ? (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              جاري التحديث...
            </>
          ) : (
            <>
              {currentUser.isDriver ? '🧑‍💼 التبديل إلى راكب' : '🚗 التبديل إلى سائق'}
            </>
          )}
        </button>
      </div>

      {/* Account Info */}
      <div style={{
        background: 'var(--surface-primary)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-light)',
        marginBottom: 'var(--space-6)'
      }}>
        <h2 style={{
          fontSize: 'var(--text-xl)',
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-4)',
          fontFamily: '"Cairo", sans-serif'
        }}>
          📋 معلومات الحساب
        </h2>

        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <div style={{
            padding: 'var(--space-3)',
            background: 'var(--surface-secondary)',
            borderRadius: 'var(--radius)',
            fontFamily: '"Cairo", sans-serif'
          }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
              الاسم
            </div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: '600', color: 'var(--text-primary)' }}>
              {currentUser.name}
            </div>
          </div>

          <div style={{
            padding: 'var(--space-3)',
            background: 'var(--surface-secondary)',
            borderRadius: 'var(--radius)',
            fontFamily: '"Cairo", sans-serif'
          }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
              البريد الإلكتروني
            </div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: '600', color: 'var(--text-primary)' }}>
              {currentUser.email}
            </div>
          </div>

          <div style={{
            padding: 'var(--space-3)',
            background: 'var(--surface-secondary)',
            borderRadius: 'var(--radius)',
            fontFamily: '"Cairo", sans-serif'
          }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
              الدور الحالي
            </div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: '600', color: 'var(--text-primary)' }}>
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
          padding: 'var(--space-4)',
          background: 'var(--surface-secondary)',
          color: '#dc2626',
          border: '2px solid #fecaca',
          borderRadius: 'var(--radius-lg)',
          fontSize: 'var(--text-base)',
          fontWeight: '600',
          cursor: 'pointer',
          fontFamily: '"Cairo", sans-serif',
          transition: 'var(--transition)'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#fee2e2';
          e.target.style.borderColor = '#dc2626';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'var(--surface-secondary)';
          e.target.style.borderColor = '#fecaca';
        }}
      >
        🚪 تسجيل الخروج
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

export default Profile;
