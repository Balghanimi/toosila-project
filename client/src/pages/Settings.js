import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, changeLanguage, t } = useLanguage();

  const settingsGroups = [
    {
      title: '⚙️ الإعدادات العامة',
      items: [
        {
          icon: '🌐',
          label: 'اللغة',
          value: language === 'ar' ? 'العربية' : 'English',
          action: () => changeLanguage(language === 'ar' ? 'en' : 'ar')
        },
        {
          icon: '🔔',
          label: 'الإشعارات',
          value: 'مفعلة',
          action: () => console.log('Toggle notifications')
        }
      ]
    },
    {
      title: '👤 إعدادات الحساب',
      items: [
        {
          icon: '📧',
          label: 'البريد الإلكتروني',
          value: user?.email || 'غير محدد',
          action: () => navigate('/profile')
        },
        {
          icon: '📱',
          label: 'رقم الهاتف',
          value: user?.phone || 'غير محدد',
          action: () => navigate('/profile')
        },
        {
          icon: '🏙️',
          label: 'المدينة',
          value: user?.city || 'غير محددة',
          action: () => navigate('/profile')
        }
      ]
    },
    {
      title: '🚗 إعدادات السائق',
      items: user?.isDriver ? [
        {
          icon: '🚙',
          label: 'معلومات السيارة',
          value: 'إدارة',
          action: () => console.log('Manage vehicle')
        },
        {
          icon: '💳',
          label: 'طرق الدفع',
          value: 'إدارة',
          action: () => console.log('Payment methods')
        }
      ] : []
    },
    {
      title: '📋 أخرى',
      items: [
        {
          icon: '📜',
          label: 'الشروط والأحكام',
          value: '',
          action: () => console.log('Terms')
        },
        {
          icon: '🔒',
          label: 'سياسة الخصوصية',
          value: '',
          action: () => console.log('Privacy')
        },
        {
          icon: 'ℹ️',
          label: 'عن التطبيق',
          value: 'v1.0.0',
          action: () => console.log('About')
        }
      ]
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      paddingTop: '80px',
      paddingBottom: '100px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: 'var(--space-4)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-6)'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'var(--surface-primary)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-md)',
              fontSize: 'var(--text-lg)'
            }}
          >
            ←
          </button>
          <h1 style={{
            fontSize: 'var(--text-3xl)',
            fontWeight: '800',
            color: 'var(--text-primary)',
            margin: 0,
            fontFamily: '"Cairo", sans-serif'
          }}>
            ⚙️ الإعدادات
          </h1>
        </div>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          group.items.length > 0 && (
            <div key={groupIndex} style={{ marginBottom: 'var(--space-6)' }}>
              <h2 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-3)',
                fontFamily: '"Cairo", sans-serif'
              }}>
                {group.title}
              </h2>

              <div style={{
                background: 'var(--surface-primary)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border-light)'
              }}>
                {group.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={item.action}
                    style={{
                      width: '100%',
                      padding: 'var(--space-4)',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: itemIndex < group.items.length - 1
                        ? '1px solid var(--border-light)'
                        : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                      fontFamily: '"Cairo", sans-serif'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--surface-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)'
                    }}>
                      <span style={{ fontSize: 'var(--text-xl)' }}>{item.icon}</span>
                      <span style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: '500',
                        color: 'var(--text-primary)'
                      }}>
                        {item.label}
                      </span>
                    </div>

                    {item.value && (
                      <span style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-secondary)'
                      }}>
                        {item.value}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
