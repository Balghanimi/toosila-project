import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Download = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const isMobile = window.innerWidth <= 768;
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);

  // Detect device type
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isMobileDevice = isIOS || isAndroid;

  // PWA Install prompt
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);

  React.useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('App installed');
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallInstructions(true);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: isMobile ? 'var(--space-4)' : 'var(--space-6)',
      paddingBottom: '100px',
      background: isDarkMode
        ? 'linear-gradient(to bottom, rgba(52, 199, 89, 0.08) 0%, transparent 50%)'
        : 'linear-gradient(to bottom, rgba(52, 199, 89, 0.03) 0%, transparent 50%)'
    }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: isMobile ? '0 var(--space-3)' : '0 var(--space-4)' }}>
        {/* Header */}
        <div style={{
          background: isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'white',
          borderRadius: isMobile ? 'var(--radius-xl)' : 'var(--radius-2xl)',
          padding: isMobile ? 'var(--space-5) var(--space-4)' : 'var(--space-8) var(--space-6)',
          marginBottom: isMobile ? 'var(--space-4)' : 'var(--space-6)',
          boxShadow: isDarkMode
            ? '0 4px 20px rgba(0, 0, 0, 0.4)'
            : '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: isDarkMode ? '1px solid rgba(52, 199, 89, 0.2)' : 'none',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative gradient bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #34c759 0%, #10b981 100%)'
          }} />

          <button
            onClick={() => navigate(-1)}
            style={{
              position: 'absolute',
              top: isMobile ? 'var(--space-3)' : 'var(--space-4)',
              right: isMobile ? 'var(--space-3)' : 'var(--space-4)',
              background: isDarkMode ? 'rgba(52, 199, 89, 0.2)' : '#d1fae5',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: isMobile ? '22px' : '20px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#34c759';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(52, 199, 89, 0.2)' : '#d1fae5';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ←
          </button>

          <div style={{ textAlign: 'center', marginTop: isMobile ? 'var(--space-3)' : 'var(--space-4)' }}>
            <div style={{
              fontSize: isMobile ? '3rem' : '5rem',
              marginBottom: isMobile ? 'var(--space-3)' : 'var(--space-4)'
            }}>📱</div>
            <h1 style={{
              fontSize: isMobile ? '1.75rem' : '2.5rem',
              fontWeight: '800',
              color: isDarkMode ? '#ffffff' : '#1a1a1a',
              marginBottom: 'var(--space-3)',
              fontFamily: '"Cairo", sans-serif'
            }}>
              تنزيل تطبيق توصيلة
            </h1>
            <p style={{
              fontSize: isMobile ? 'var(--text-base)' : 'var(--text-lg)',
              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
              fontFamily: '"Cairo", sans-serif',
              marginBottom: 'var(--space-2)'
            }}>
              استمتع بتجربة أفضل مع تطبيق الموبايل
            </p>
          </div>
        </div>

        {/* Install Button */}
        <div style={{
          background: 'linear-gradient(135deg, #34c759 0%, #28a745 100%)',
          borderRadius: isMobile ? 'var(--radius-xl)' : 'var(--radius-2xl)',
          padding: isMobile ? 'var(--space-5)' : 'var(--space-8)',
          marginBottom: isMobile ? 'var(--space-4)' : 'var(--space-6)',
          boxShadow: '0 10px 40px rgba(52, 199, 89, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Pattern */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '250px',
            height: '250px',
            background: 'rgba(255, 255, 255, 0.12)',
            borderRadius: '50%',
            zIndex: 0
          }} />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>
              {isMobileDevice ? (isIOS ? '🍎' : '🤖') : '💻'}
            </div>
            <h2 style={{
              fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
              fontWeight: '800',
              color: 'white',
              marginBottom: 'var(--space-3)',
              fontFamily: '"Cairo", sans-serif'
            }}>
              {isMobileDevice
                ? (isIOS ? 'تثبيت على iPhone/iPad' : 'تثبيت على Android')
                : 'تثبيت كتطبيق على الكمبيوتر'}
            </h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.95)',
              fontSize: 'var(--text-base)',
              marginBottom: 'var(--space-6)',
              fontFamily: '"Cairo", sans-serif'
            }}>
              {isMobileDevice
                ? 'اضغط على الزر أدناه لتثبيت التطبيق على جهازك'
                : 'يمكنك تثبيت توصيلة كتطبيق على جهاز الكمبيوتر الخاص بك'}
            </p>

            <button
              onClick={handleInstallClick}
              style={{
                padding: isMobile ? 'var(--space-4) var(--space-6)' : 'var(--space-5) var(--space-8)',
                background: 'white',
                color: '#34c759',
                border: 'none',
                borderRadius: 'var(--radius-xl)',
                fontSize: isMobile ? 'var(--text-lg)' : 'var(--text-xl)',
                fontWeight: '800',
                cursor: 'pointer',
                fontFamily: '"Cairo", sans-serif',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-3)',
                margin: '0 auto'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px) scale(1.05)';
                e.target.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.25)';
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>⬇️</span>
              <span>تثبيت التطبيق الآن</span>
            </button>
          </div>
        </div>

        {/* Installation Instructions */}
        {showInstallInstructions && (
          <div style={{
            background: isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'white',
            borderRadius: isMobile ? 'var(--radius-xl)' : 'var(--radius-2xl)',
            padding: isMobile ? 'var(--space-5) var(--space-4)' : 'var(--space-8) var(--space-6)',
            marginBottom: isMobile ? 'var(--space-4)' : 'var(--space-6)',
            boxShadow: isDarkMode
              ? '0 4px 20px rgba(0, 0, 0, 0.4)'
              : '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: isDarkMode ? '1px solid rgba(52, 199, 89, 0.2)' : 'none',
            fontFamily: '"Cairo", sans-serif',
            direction: 'rtl'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-4)'
            }}>
              <div style={{
                fontSize: isMobile ? '1.5rem' : '2rem',
                background: 'linear-gradient(135deg, #34c759 0%, #28a745 100%)',
                borderRadius: '12px',
                padding: isMobile ? 'var(--space-2)' : 'var(--space-3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>📖</div>
              <h2 style={{
                fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                fontWeight: '700',
                color: isDarkMode ? '#ffffff' : '#1f2937',
                margin: 0
              }}>
                طريقة التثبيت
              </h2>
            </div>

            {isIOS ? (
              <div>
                <h3 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: '600',
                  color: isDarkMode ? '#10b981' : '#047857',
                  marginBottom: 'var(--space-3)'
                }}>
                  على iPhone أو iPad:
                </h3>
                <ol style={{
                  paddingRight: '20px',
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : '#374151',
                  fontSize: 'var(--text-base)',
                  lineHeight: '1.8'
                }}>
                  <li style={{ marginBottom: 'var(--space-3)' }}>
                    <strong>افتح Safari</strong> - يجب استخدام متصفح Safari
                  </li>
                  <li style={{ marginBottom: 'var(--space-3)' }}>
                    اضغط على زر <strong>المشاركة</strong> 📤 أسفل الشاشة
                  </li>
                  <li style={{ marginBottom: 'var(--space-3)' }}>
                    اختر <strong>"إضافة إلى الشاشة الرئيسية"</strong> ➕
                  </li>
                  <li style={{ marginBottom: 'var(--space-3)' }}>
                    اضغط <strong>"إضافة"</strong> في أعلى اليمين
                  </li>
                  <li>
                    ستجد أيقونة توصيلة على الشاشة الرئيسية! 🎉
                  </li>
                </ol>
              </div>
            ) : isAndroid ? (
              <div>
                <h3 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: '600',
                  color: isDarkMode ? '#10b981' : '#047857',
                  marginBottom: 'var(--space-3)'
                }}>
                  على Android:
                </h3>
                <ol style={{
                  paddingRight: '20px',
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : '#374151',
                  fontSize: 'var(--text-base)',
                  lineHeight: '1.8'
                }}>
                  <li style={{ marginBottom: 'var(--space-3)' }}>
                    افتح الموقع في <strong>Chrome</strong> أو <strong>Firefox</strong>
                  </li>
                  <li style={{ marginBottom: 'var(--space-3)' }}>
                    اضغط على <strong>القائمة</strong> ⋮ (ثلاث نقاط)
                  </li>
                  <li style={{ marginBottom: 'var(--space-3)' }}>
                    اختر <strong>"تثبيت التطبيق"</strong> أو <strong>"إضافة إلى الشاشة الرئيسية"</strong>
                  </li>
                  <li style={{ marginBottom: 'var(--space-3)' }}>
                    اضغط <strong>"تثبيت"</strong>
                  </li>
                  <li>
                    ستجد أيقونة توصيلة على الشاشة الرئيسية! 🎉
                  </li>
                </ol>
              </div>
            ) : (
              <div>
                <h3 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: '600',
                  color: isDarkMode ? '#10b981' : '#047857',
                  marginBottom: 'var(--space-3)'
                }}>
                  على الكمبيوتر:
                </h3>
                <ol style={{
                  paddingRight: '20px',
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : '#374151',
                  fontSize: 'var(--text-base)',
                  lineHeight: '1.8'
                }}>
                  <li style={{ marginBottom: 'var(--space-3)' }}>
                    افتح الموقع في <strong>Chrome</strong> أو <strong>Edge</strong>
                  </li>
                  <li style={{ marginBottom: 'var(--space-3)' }}>
                    ابحث عن أيقونة <strong>التثبيت</strong> 💻 في شريط العنوان (يمين أو يسار)
                  </li>
                  <li style={{ marginBottom: 'var(--space-3)' }}>
                    اضغط على <strong>"تثبيت"</strong>
                  </li>
                  <li>
                    سيتم فتح توصيلة كتطبيق مستقل! 🎉
                  </li>
                </ol>
              </div>
            )}

            <button
              onClick={() => setShowInstallInstructions(false)}
              style={{
                marginTop: 'var(--space-4)',
                padding: 'var(--space-3) var(--space-5)',
                background: isDarkMode ? 'rgba(52, 199, 89, 0.2)' : '#d1fae5',
                color: isDarkMode ? '#10b981' : '#047857',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: '"Cairo", sans-serif',
                transition: 'all 0.2s ease',
                display: 'block',
                margin: 'var(--space-4) auto 0'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#34c759';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = isDarkMode ? 'rgba(52, 199, 89, 0.2)' : '#d1fae5';
                e.target.style.color = isDarkMode ? '#10b981' : '#047857';
              }}
            >
              أغلق
            </button>
          </div>
        )}

        {/* Benefits Section */}
        <div style={{
          background: isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'white',
          borderRadius: isMobile ? 'var(--radius-xl)' : 'var(--radius-2xl)',
          padding: isMobile ? 'var(--space-5) var(--space-4)' : 'var(--space-8) var(--space-6)',
          boxShadow: isDarkMode
            ? '0 4px 20px rgba(0, 0, 0, 0.4)'
            : '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: isDarkMode ? '1px solid rgba(52, 199, 89, 0.2)' : 'none',
          fontFamily: '"Cairo", sans-serif',
          direction: 'rtl'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-5)'
          }}>
            <div style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '12px',
              padding: isMobile ? 'var(--space-2)' : 'var(--space-3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>✨</div>
            <h2 style={{
              fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
              fontWeight: '700',
              color: isDarkMode ? '#ffffff' : '#1f2937',
              margin: 0
            }}>
              لماذا تثبيت التطبيق؟
            </h2>
          </div>

          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            {[
              { icon: '⚡', title: 'فتح أسرع', desc: 'الوصول الفوري إلى التطبيق من الشاشة الرئيسية' },
              { icon: '🔔', title: 'إشعارات فورية', desc: 'احصل على إشعارات حول الرحلات والرسائل' },
              { icon: '📱', title: 'تجربة أفضل', desc: 'واجهة مخصصة وسلسة مثل التطبيقات الأصلية' },
              { icon: '💾', title: 'يعمل بدون إنترنت', desc: 'الوصول إلى بعض الميزات حتى بدون اتصال' },
              { icon: '🔒', title: 'آمن ومحمي', desc: 'جميع بياناتك محمية ومشفرة' },
              { icon: '📦', title: 'لا يأخذ مساحة كبيرة', desc: 'حجم صغير مقارنة بالتطبيقات التقليدية' }
            ].map((benefit, index) => (
              <div
                key={index}
                style={{
                  padding: 'var(--space-4)',
                  background: isDarkMode
                    ? 'linear-gradient(135deg, rgba(52, 199, 89, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(52, 199, 89, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
                  borderRadius: 'var(--radius-lg)',
                  border: isDarkMode
                    ? '2px solid rgba(52, 199, 89, 0.2)'
                    : '2px solid rgba(52, 199, 89, 0.1)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  gap: 'var(--space-3)',
                  alignItems: 'flex-start'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#34c759';
                  e.currentTarget.style.transform = 'translateX(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDarkMode
                    ? 'rgba(52, 199, 89, 0.2)'
                    : 'rgba(52, 199, 89, 0.1)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{
                  fontSize: '2rem',
                  minWidth: '40px',
                  textAlign: 'center'
                }}>
                  {benefit.icon}
                </div>
                <div>
                  <h3 style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: '700',
                    color: isDarkMode ? '#10b981' : '#047857',
                    marginBottom: 'var(--space-2)'
                  }}>
                    {benefit.title}
                  </h3>
                  <p style={{
                    fontSize: 'var(--text-base)',
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
                    margin: 0,
                    lineHeight: '1.6'
                  }}>
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Download;
