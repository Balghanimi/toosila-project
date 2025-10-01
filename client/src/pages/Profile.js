import React from 'react';

const Profile = () => {
  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: '100px' }}>
      {/* Profile Header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <div style={{
          width: '100px',
          height: '100px',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-4) auto',
          boxShadow: 'var(--shadow-xl)',
          border: '4px solid var(--surface-primary)'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        
        <h1 style={{ 
          fontSize: 'var(--text-3xl)', 
          fontWeight: '800', 
          color: 'var(--text-primary)', 
          marginBottom: 'var(--space-2)',
          fontFamily: '"Cairo", sans-serif'
        }}>
          الملف الشخصي
        </h1>
        
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: 'var(--text-lg)',
          fontFamily: '"Cairo", sans-serif',
          fontWeight: '500'
        }}>
          إدارة حسابك ومعلوماتك الشخصية
        </p>
      </div>
      
      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-8)'
      }}>
        {[
          { label: 'الرحلات المكتملة', value: '0', icon: '🚗' },
          { label: 'التقييم العام', value: '5.0', icon: '⭐' },
          { label: 'سنوات العضوية', value: '1', icon: '📅' }
        ].map((stat, index) => (
          <div key={index} style={{
            background: 'var(--surface-primary)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
            transition: 'var(--transition)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'var(--shadow-sm)';
          }}>
            <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
              {stat.icon}
            </div>
            <div style={{ 
              fontSize: 'var(--text-2xl)', 
              fontWeight: '800', 
              color: 'var(--primary)',
              marginBottom: 'var(--space-1)',
              fontFamily: '"Cairo", sans-serif'
            }}>
              {stat.value}
            </div>
            <div style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--text-secondary)',
              fontFamily: '"Cairo", sans-serif',
              fontWeight: '500'
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
      
      {/* Profile Sections */}
      <div style={{
        display: 'grid',
        gap: 'var(--space-4)',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        {[
          { icon: '⚙️', title: 'إعدادات الحساب', desc: 'تحديث المعلومات الشخصية وكلمة المرور', color: 'var(--primary)' },
          { icon: '🗂️', title: 'تاريخ الرحلات', desc: 'عرض جميع رحلاتك السابقة والقادمة', color: 'var(--info)' },
          { icon: '⭐', title: 'التقييمات والمراجعات', desc: 'إدارة تقييماتك ومراجعات الآخرين', color: 'var(--warning)' },
          { icon: '💳', title: 'وسائل الدفع', desc: 'إضافة وإدارة طرق الدفع المختلفة', color: 'var(--success)' },
          { icon: '🔒', title: 'الخصوصية والأمان', desc: 'إعدادات الحماية والخصوصية', color: 'var(--error)' },
          { icon: '🎨', title: 'إعدادات التطبيق', desc: 'تخصيص مظهر التطبيق واللغة', color: 'var(--secondary)' }
        ].map((section, index) => (
          <div key={index} style={{
            background: 'var(--surface-primary)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
            boxShadow: 'var(--shadow-sm)',
            textAlign: 'start',
            transition: 'var(--transition)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = 'var(--shadow-md)';
            e.target.style.borderColor = section.color;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'var(--shadow-sm)';
            e.target.style.borderColor = 'var(--border-light)';
          }}>
            
            {/* Background accent */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '4px',
              height: '100%',
              background: section.color,
              opacity: 0.3
            }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              <div style={{ 
                fontSize: 'var(--text-2xl)',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: `${section.color}20`
              }}>
                {section.icon}
              </div>
              <h3 style={{ 
                fontSize: 'var(--text-lg)', 
                fontWeight: '600', 
                color: 'var(--text-primary)',
                margin: 0,
                fontFamily: '"Cairo", sans-serif'
              }}>
                {section.title}
              </h3>
              <div style={{
                marginRight: 'auto',
                color: 'var(--text-muted)',
                fontSize: 'var(--text-lg)'
              }}>
                ←
              </div>
            </div>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: 'var(--text-base)',
              margin: 0,
              lineHeight: '1.6',
              fontFamily: '"Cairo", sans-serif',
              paddingRight: '52px'
            }}>
              {section.desc}
            </p>
          </div>
        ))}
      </div>
      
      <div style={{
        marginTop: 'var(--space-8)',
        textAlign: 'center',
        padding: 'var(--space-6)',
        background: 'var(--surface-secondary)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-light)'
      }}>
        <p style={{
          fontSize: 'var(--text-base)',
          color: 'var(--text-secondary)',
          fontFamily: '"Cairo", sans-serif',
          fontWeight: '500',
          margin: 0
        }}>
          🚧 هذه الميزة قيد التطوير وستكون متاحة قريباً
        </p>
      </div>
    </div>
  );
};

export default Profile;
