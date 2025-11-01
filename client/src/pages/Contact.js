import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Contact = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const contactMethods = [
    {
      icon: '📱',
      title: 'الهاتف',
      value: '0780887488',
      link: 'tel:+9640780887488',
      description: 'اتصل بنا مباشرة',
      external: false
    },
    {
      icon: '💬',
      title: 'واتساب',
      value: '0780887488',
      link: 'https://wa.me/9640780887488',
      description: 'راسلنا عبر الواتساب',
      external: true
    },
    {
      icon: '✈️',
      title: 'تيليجرام',
      value: '@AAL_GHANIMI',
      link: 'https://t.me/AAL_GHANIMI',
      description: 'تواصل معنا على تيليجرام',
      external: true
    }
  ];

  const handleContactClick = (method) => {
    if (method.external) {
      window.open(method.link, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = method.link;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: isMobile ? '70px' : 'var(--space-6)',
      paddingBottom: isMobile ? '90px' : '100px',
      background: isDarkMode
        ? 'linear-gradient(to bottom, rgba(52, 199, 89, 0.08) 0%, transparent 50%)'
        : 'linear-gradient(to bottom, rgba(52, 199, 89, 0.03) 0%, transparent 50%)'
    }}>
      <div className="container" style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: isMobile ? '0 16px' : '0 var(--space-4)',
        width: '100%',
        boxSizing: 'border-box'
      }}>

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

          {/* Back button */}
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
            }}>📞</div>
            <h1 style={{
              fontSize: isMobile ? '1.75rem' : '2.5rem',
              fontWeight: '800',
              color: isDarkMode ? '#ffffff' : '#1a1a1a',
              marginBottom: 'var(--space-3)',
              fontFamily: '"Cairo", sans-serif'
            }}>
              اتصل بنا
            </h1>
            <p style={{
              fontSize: isMobile ? 'var(--text-base)' : 'var(--text-lg)',
              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
              fontFamily: '"Cairo", sans-serif',
              marginBottom: 'var(--space-2)'
            }}>
              نحن هنا للإجابة على استفساراتك
            </p>
          </div>
        </div>

        {/* QR Code Section */}
        <div style={{
          background: isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'white',
          borderRadius: isMobile ? 'var(--radius-xl)' : 'var(--radius-2xl)',
          padding: isMobile ? 'var(--space-6) var(--space-4)' : 'var(--space-8) var(--space-6)',
          marginBottom: isMobile ? 'var(--space-4)' : 'var(--space-6)',
          boxShadow: isDarkMode
            ? '0 4px 20px rgba(0, 0, 0, 0.4)'
            : '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: isDarkMode ? '1px solid rgba(52, 199, 89, 0.2)' : 'none',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
            fontWeight: '700',
            color: isDarkMode ? '#ffffff' : '#1f2937',
            marginBottom: 'var(--space-4)',
            fontFamily: '"Cairo", sans-serif'
          }}>
            امسح الكود للتواصل
          </h2>

          {/* QR Code Image */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 'var(--space-4)'
          }}>
            <div style={{
              background: 'white',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
              display: 'inline-block'
            }}>
              <img
                src="/images/telegram-qr.png"
                alt="QR Code للتواصل عبر تيليجرام"
                style={{
                  width: isMobile ? '200px' : '280px',
                  height: isMobile ? '200px' : '280px',
                  objectFit: 'contain',
                  maxWidth: '100%'
                }}
                onError={(e) => {
                  // Fallback if image doesn't exist
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div style="
                      width: ${isMobile ? '200px' : '280px'};
                      height: ${isMobile ? '200px' : '280px'};
                      max-width: 100%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: ${isMobile ? '4rem' : '7rem'};
                      background: linear-gradient(135deg, #34c759 0%, #10b981 100%);
                      border-radius: 16px;
                    ">✈️</div>
                  `;
                }}
              />
            </div>
          </div>

          <p style={{
            fontSize: 'var(--text-base)',
            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
            fontFamily: '"Cairo", sans-serif'
          }}>
            امسح الكود باستخدام كاميرا هاتفك للتواصل معنا عبر تيليجرام
          </p>
        </div>

        {/* Contact Methods */}
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
            }}>📬</div>
            <h2 style={{
              fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
              fontWeight: '700',
              color: isDarkMode ? '#ffffff' : '#1f2937',
              margin: 0
            }}>
              طرق التواصل
            </h2>
          </div>

          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            {contactMethods.map((method, index) => (
              <div
                key={index}
                onClick={() => handleContactClick(method)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleContactClick(method);
                  }
                }}
                style={{
                  padding: isMobile ? 'var(--space-4)' : 'var(--space-5)',
                  background: isDarkMode
                    ? 'linear-gradient(135deg, rgba(52, 199, 89, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(52, 199, 89, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
                  borderRadius: 'var(--radius-lg)',
                  border: isDarkMode
                    ? '2px solid rgba(52, 199, 89, 0.2)'
                    : '2px solid rgba(52, 199, 89, 0.1)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  gap: 'var(--space-4)',
                  alignItems: 'center',
                  textDecoration: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#34c759';
                  e.currentTarget.style.transform = 'translateX(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(52, 199, 89, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDarkMode
                    ? 'rgba(52, 199, 89, 0.2)'
                    : 'rgba(52, 199, 89, 0.1)';
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontSize: '3rem',
                  minWidth: '60px',
                  textAlign: 'center'
                }}>
                  {method.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: isMobile ? 'var(--text-lg)' : 'var(--text-xl)',
                    fontWeight: '700',
                    color: isDarkMode ? '#10b981' : '#047857',
                    marginBottom: 'var(--space-2)'
                  }}>
                    {method.title}
                  </h3>
                  <p style={{
                    fontSize: isMobile ? 'var(--text-lg)' : 'var(--text-xl)',
                    color: isDarkMode ? '#ffffff' : '#1a1a1a',
                    fontWeight: '600',
                    margin: '0 0 var(--space-2) 0',
                    direction: method.title === 'تيليجرام' ? 'ltr' : 'rtl',
                    textAlign: method.title === 'تيليجرام' ? 'right' : 'inherit'
                  }}>
                    {method.value}
                  </p>
                  <p style={{
                    fontSize: 'var(--text-base)',
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
                    margin: 0
                  }}>
                    {method.description}
                  </p>
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  color: isDarkMode ? '#10b981' : '#047857'
                }}>
                  ←
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Hours */}
        <div style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, rgba(52, 199, 89, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)'
            : 'linear-gradient(135deg, rgba(52, 199, 89, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
          borderRadius: isMobile ? 'var(--radius-xl)' : 'var(--radius-2xl)',
          padding: isMobile ? 'var(--space-5)' : 'var(--space-6)',
          marginTop: isMobile ? 'var(--space-4)' : 'var(--space-6)',
          textAlign: 'center',
          border: isDarkMode
            ? '2px solid rgba(52, 199, 89, 0.3)'
            : '2px solid rgba(52, 199, 89, 0.15)',
          fontFamily: '"Cairo", sans-serif'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>⏰</div>
          <h3 style={{
            fontSize: isMobile ? 'var(--text-lg)' : 'var(--text-xl)',
            fontWeight: '700',
            color: isDarkMode ? '#10b981' : '#047857',
            marginBottom: 'var(--space-2)'
          }}>
            ساعات العمل
          </h3>
          <p style={{
            fontSize: 'var(--text-base)',
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#374151',
            lineHeight: '1.8',
            margin: 0
          }}>
            نحن متاحون للرد على استفساراتك من السبت إلى الخميس<br />
            من الساعة 9 صباحاً حتى 8 مساءً
          </p>
        </div>

      </div>
    </div>
  );
};

export default Contact;
