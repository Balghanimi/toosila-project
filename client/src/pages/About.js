import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const About = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  // Responsive styles
  const isMobile = window.innerWidth <= 768;

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: isMobile ? 'var(--space-4)' : 'var(--space-6)',
        paddingBottom: '100px',
        background: isDarkMode
          ? 'linear-gradient(to bottom, rgba(52, 199, 89, 0.08) 0%, transparent 50%)'
          : 'linear-gradient(to bottom, rgba(52, 199, 89, 0.03) 0%, transparent 50%)',
      }}
    >
      <div
        className="container"
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: isMobile ? '0 var(--space-3)' : '0 var(--space-4)',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'white',
            borderRadius: isMobile ? 'var(--radius-xl)' : 'var(--radius-2xl)',
            padding: isMobile ? 'var(--space-5) var(--space-4)' : 'var(--space-8) var(--space-6)',
            marginBottom: isMobile ? 'var(--space-4)' : 'var(--space-6)',
            boxShadow: isDarkMode
              ? '0 4px 20px rgba(0, 0, 0, 0.4)'
              : '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: isDarkMode ? '1px solid rgba(52, 199, 89, 0.2)' : 'none',
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
              transition: 'all 0.2s ease',
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

          <div
            style={{
              textAlign: 'center',
              marginTop: isMobile ? 'var(--space-3)' : 'var(--space-4)',
            }}
          >
            <div
              style={{
                fontSize: isMobile ? '3rem' : '5rem',
                marginBottom: isMobile ? 'var(--space-3)' : 'var(--space-4)',
              }}
            >
              🚗
            </div>
            <h1
              style={{
                fontSize: isMobile ? '1.75rem' : '2.5rem',
                fontWeight: '800',
                color: isDarkMode ? '#ffffff' : '#1a1a1a',
                marginBottom: 'var(--space-3)',
                fontFamily: '"Cairo", sans-serif',
              }}
            >
              توصيلة
            </h1>
            <p
              style={{
                fontSize: isMobile ? 'var(--text-base)' : 'var(--text-lg)',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
                fontFamily: '"Cairo", sans-serif',
                marginBottom: 'var(--space-2)',
              }}
            >
              منصة مشاركة الرحلات الذكية
            </p>
            <div
              style={{
                display: 'inline-block',
                padding: 'var(--space-2) var(--space-4)',
                background: isDarkMode ? 'rgba(52, 199, 89, 0.2)' : '#d1fae5',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-sm)',
                color: '#34c759',
                fontWeight: '600',
                fontFamily: '"Cairo", sans-serif',
              }}
            >
              الإصدار 2.1.15
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div
          style={{
            background: isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'white',
            borderRadius: isMobile ? 'var(--radius-xl)' : 'var(--radius-2xl)',
            padding: isMobile ? 'var(--space-5) var(--space-4)' : 'var(--space-8) var(--space-6)',
            boxShadow: isDarkMode
              ? '0 4px 20px rgba(0, 0, 0, 0.4)'
              : '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: isDarkMode ? '1px solid rgba(52, 199, 89, 0.2)' : 'none',
            fontFamily: '"Cairo", sans-serif',
            lineHeight: '1.8',
            direction: 'rtl',
          }}
        >
          {/* عن التطبيق */}
          <section style={{ marginBottom: 'var(--space-8)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? '1.5rem' : '2rem',
                  background: 'linear-gradient(135deg, #34c759 0%, #28a745 100%)',
                  borderRadius: '12px',
                  padding: isMobile ? 'var(--space-2)' : 'var(--space-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                💡
              </div>
              <h2
                style={{
                  fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                  fontWeight: '700',
                  color: isDarkMode ? '#ffffff' : '#1f2937',
                  margin: 0,
                }}
              >
                ما هي توصيلة؟
              </h2>
            </div>
            <p
              style={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#374151',
                fontSize: 'var(--text-base)',
                marginBottom: 'var(--space-3)',
              }}
            >
              <strong style={{ color: isDarkMode ? '#34c759' : '#28a745' }}>توصيلة</strong> هي منصة
              عربية متطورة لمشاركة الرحلات بين المدن والأحياء. نربط السائقين الذين لديهم مقاعد فارغة
              في سياراتهم مع الركاب الذين يبحثون عن رحلات مريحة وآمنة وبأسعار معقولة.
            </p>
            <p
              style={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#374151',
                fontSize: 'var(--text-base)',
              }}
            >
              مهمتنا هي جعل السفر أكثر سهولة واقتصادية وصداقة للبيئة من خلال تقليل عدد السيارات على
              الطرق وتوفير تجربة آمنة وموثوقة لجميع المستخدمين.
            </p>
          </section>

          {/* رؤيتنا */}
          <section style={{ marginBottom: 'var(--space-8)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? '1.5rem' : '2rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  borderRadius: '12px',
                  padding: isMobile ? 'var(--space-2)' : 'var(--space-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                🎯
              </div>
              <h2
                style={{
                  fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                  fontWeight: '700',
                  color: isDarkMode ? '#ffffff' : '#1f2937',
                  margin: 0,
                }}
              >
                رؤيتنا
              </h2>
            </div>
            <p
              style={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#374151',
                fontSize: 'var(--text-base)',
              }}
            >
              أن نكون المنصة الرائدة في العالم العربي لمشاركة الرحلات، حيث نسعى لخلق مجتمع من
              المسافرين الذين يثقون ببعضهم البعض ويساعدون في بناء مستقبل أكثر استدامة من خلال
              الاستخدام الأمثل للموارد المتاحة.
            </p>
          </section>

          {/* الميزات الرئيسية */}
          <section style={{ marginBottom: 'var(--space-8)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? '1.5rem' : '2rem',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  borderRadius: '12px',
                  padding: isMobile ? 'var(--space-2)' : 'var(--space-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ⭐
              </div>
              <h2
                style={{
                  fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                  fontWeight: '700',
                  color: isDarkMode ? '#ffffff' : '#1f2937',
                  margin: 0,
                }}
              >
                الميزات الرئيسية
              </h2>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              {[
                {
                  icon: '🔒',
                  title: 'أمان وموثوقية',
                  desc: 'نظام تقييم شامل وتحقق من الهوية لضمان سلامتك',
                  color: '#ef4444',
                },
                {
                  icon: '🌿',
                  title: 'صديق للبيئة',
                  desc: 'تقليل الانبعاثات الكربونية من خلال مشاركة الرحلات',
                  color: '#10b981',
                },
                {
                  icon: '🚦',
                  title: 'فك الاختناقات المرورية',
                  desc: 'تقليل عدد السيارات على الطرق وتخفيف الازدحام',
                  color: '#f59e0b',
                },
                {
                  icon: '💰',
                  title: 'توفير المال',
                  desc: 'تقليل تكاليف السفر ومشاركة مصاريف الوقود',
                  color: '#34c759',
                },
                {
                  icon: '💬',
                  title: 'رسائل فورية',
                  desc: 'تواصل مباشر وآمن بين السائقين والركاب',
                  color: '#3b82f6',
                },
                {
                  icon: '🔔',
                  title: 'إشعارات ذكية',
                  desc: 'تنبيهات فورية لحالة الحجوزات والرحلات',
                  color: '#8b5cf6',
                },
                {
                  icon: '🌙',
                  title: 'وضع مظلم',
                  desc: 'تجربة مريحة للعين في أي وقت من اليوم',
                  color: '#8b5cf6',
                },
                {
                  icon: '⚡',
                  title: 'سهولة الاستخدام',
                  desc: 'واجهة بديهية وسلسة لتجربة مستخدم ممتازة',
                  color: '#10b981',
                },
                {
                  icon: '💰',
                  title: 'أسعار مناسبة',
                  desc: 'توفير في تكاليف السفر مع مشاركة الرحلات',
                  color: '#06b6d4',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  style={{
                    padding: 'var(--space-4)',
                    background: isDarkMode
                      ? `linear-gradient(135deg, ${feature.color}15 0%, ${feature.color}08 100%)`
                      : `${feature.color}08`,
                    borderRadius: 'var(--radius-lg)',
                    border: isDarkMode
                      ? `1px solid ${feature.color}30`
                      : `2px solid ${feature.color}20`,
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(-4px)';
                    e.currentTarget.style.borderColor = feature.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.borderColor = isDarkMode
                      ? `${feature.color}30`
                      : `${feature.color}20`;
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    <span style={{ fontSize: '1.8rem' }}>{feature.icon}</span>
                    <h3
                      style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: '700',
                        color: isDarkMode ? '#ffffff' : '#1f2937',
                        margin: 0,
                      }}
                    >
                      {feature.title}
                    </h3>
                  </div>
                  <p
                    style={{
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
                      fontSize: 'var(--text-sm)',
                      margin: 0,
                      paddingRight: '45px',
                    }}
                  >
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* كيف يعمل التطبيق */}
          <section style={{ marginBottom: 'var(--space-8)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? '1.5rem' : '2rem',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '12px',
                  padding: isMobile ? 'var(--space-2)' : 'var(--space-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                🔄
              </div>
              <h2
                style={{
                  fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                  fontWeight: '700',
                  color: isDarkMode ? '#ffffff' : '#1f2937',
                  margin: 0,
                }}
              >
                كيف يعمل؟
              </h2>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              {/* للسائقين */}
              <div
                style={{
                  background: isDarkMode ? 'rgba(52, 199, 89, 0.1)' : '#ecfdf5',
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-lg)',
                  border: isDarkMode ? '1px solid rgba(52, 199, 89, 0.3)' : '2px solid #34c759',
                }}
              >
                <h3
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: '700',
                    color: isDarkMode ? '#34c759' : '#047857',
                    marginBottom: 'var(--space-3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>🚗</span>
                  للسائقين
                </h3>
                <ol
                  style={{
                    paddingRight: '20px',
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#374151',
                    fontSize: 'var(--text-base)',
                  }}
                >
                  <li style={{ marginBottom: 'var(--space-2)' }}>
                    سجل حسابك كسائق وأضف معلومات مركبتك
                  </li>
                  <li style={{ marginBottom: 'var(--space-2)' }}>
                    انشر عرض رحلتك مع تحديد الوجهة والسعر والتاريخ
                  </li>
                  <li style={{ marginBottom: 'var(--space-2)' }}>استقبل طلبات الحجز من الركاب</li>
                  <li style={{ marginBottom: 'var(--space-2)' }}>تواصل مع الركاب وأكد الحجوزات</li>
                  <li>انطلق في رحلتك واكسب مع كل رحلة!</li>
                </ol>
              </div>

              {/* للركاب */}
              <div
                style={{
                  background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-lg)',
                  border: isDarkMode ? '1px solid rgba(59, 130, 246, 0.3)' : '2px solid #3b82f6',
                }}
              >
                <h3
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: '700',
                    color: isDarkMode ? '#3b82f6' : '#1d4ed8',
                    marginBottom: 'var(--space-3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>🧑‍💼</span>
                  للركاب
                </h3>
                <ol
                  style={{
                    paddingRight: '20px',
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#374151',
                    fontSize: 'var(--text-base)',
                  }}
                >
                  <li style={{ marginBottom: 'var(--space-2)' }}>سجل حسابك كراكب</li>
                  <li style={{ marginBottom: 'var(--space-2)' }}>
                    ابحث عن الرحلات المتاحة حسب وجهتك
                  </li>
                  <li style={{ marginBottom: 'var(--space-2)' }}>احجز مقعدك مع السائق المناسب</li>
                  <li style={{ marginBottom: 'var(--space-2)' }}>ادفع المبلغ المتفق عليه</li>
                  <li>استمتع برحلة آمنة ومريحة!</li>
                </ol>
              </div>
            </div>
          </section>

          {/* الفوائد البيئية والاقتصادية */}
          <section style={{ marginBottom: 'var(--space-8)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? '1.5rem' : '2rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '12px',
                  padding: isMobile ? 'var(--space-2)' : 'var(--space-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                🌍
              </div>
              <h2
                style={{
                  fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                  fontWeight: '700',
                  color: isDarkMode ? '#ffffff' : '#1f2937',
                  margin: 0,
                }}
              >
                تأثيرنا الإيجابي
              </h2>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
              {[
                {
                  icon: '🌿',
                  title: 'صديق للبيئة',
                  items: [
                    'تقليل الانبعاثات الكربونية من خلال تقليل عدد السيارات على الطرق',
                    'المساهمة في مكافحة التغير المناخي',
                    'تحسين جودة الهواء في المدن',
                  ],
                  color: '#10b981',
                },
                {
                  icon: '🚦',
                  title: 'فك الاختناقات المرورية',
                  items: [
                    'تقليل الازدحام في ساعات الذروة',
                    'توفير الوقت للجميع على الطرق',
                    'تحسين تدفق حركة المرور',
                  ],
                  color: '#f59e0b',
                },
                {
                  icon: '💰',
                  title: 'توفير المال',
                  items: [
                    'تقاسم تكاليف الوقود والصيانة',
                    'تقليل هدر الأموال على وسائل النقل الفردية',
                    'أسعار تنافسية مقارنة بالنقل التقليدي',
                  ],
                  color: '#34c759',
                },
              ].map((benefit, index) => (
                <div
                  key={index}
                  style={{
                    padding: 'var(--space-5)',
                    background: isDarkMode
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%)'
                      : 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
                    borderRadius: 'var(--radius-xl)',
                    border: isDarkMode
                      ? `2px solid ${benefit.color}40`
                      : `2px solid ${benefit.color}20`,
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = benefit.color;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 10px 30px ${benefit.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isDarkMode
                      ? `${benefit.color}40`
                      : `${benefit.color}20`;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      marginBottom: 'var(--space-4)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '2.5rem',
                        minWidth: '50px',
                        textAlign: 'center',
                      }}
                    >
                      {benefit.icon}
                    </div>
                    <h3
                      style={{
                        fontSize: 'var(--text-xl)',
                        fontWeight: '700',
                        color: isDarkMode ? benefit.color : benefit.color,
                        margin: 0,
                      }}
                    >
                      {benefit.title}
                    </h3>
                  </div>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'grid',
                      gap: 'var(--space-3)',
                    }}
                  >
                    {benefit.items.map((item, i) => (
                      <li
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 'var(--space-2)',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#374151',
                          fontSize: 'var(--text-base)',
                          lineHeight: '1.6',
                        }}
                      >
                        <span
                          style={{
                            color: benefit.color,
                            fontWeight: '700',
                            fontSize: '1.2rem',
                            minWidth: '20px',
                          }}
                        >
                          ✓
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* لماذا تختار توصيلة؟ - Marketing Features */}
          <section style={{ marginBottom: 'var(--space-8)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? '1.5rem' : '2rem',
                  background: 'linear-gradient(135deg, #34c759 0%, #28a745 100%)',
                  borderRadius: '12px',
                  padding: isMobile ? 'var(--space-2)' : 'var(--space-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✨
              </div>
              <h2
                style={{
                  fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                  fontWeight: '700',
                  color: isDarkMode ? '#ffffff' : '#1f2937',
                  margin: 0,
                }}
              >
                لماذا تختار توصيلة؟
              </h2>
            </div>
            <p
              style={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
                fontSize: 'var(--text-base)',
                marginBottom: 'var(--space-5)',
              }}
            >
              نوفر لك تجربة سفر آمنة ومريحة بأفضل الأسعار
            </p>

            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              {[
                {
                  icon: '🛡️',
                  title: 'آمن وموثوق',
                  desc: 'جميع المستخدمين موثقون ومراجعين. نظام تقييم شامل لضمان أفضل تجربة.',
                  color: '#34c759',
                },
                {
                  icon: '💰',
                  title: 'أسعار معقولة',
                  desc: 'وفر حتى 70% من تكلفة النقل التقليدي مع رحلات مشتركة اقتصادية.',
                  color: '#f59e0b',
                },
                {
                  icon: '⚡',
                  title: 'حجز فوري',
                  desc: 'ابحث واحجز رحلتك في ثوانٍ. تأكيد فوري ودعم على مدار الساعة.',
                  color: '#3b82f6',
                },
                {
                  icon: '🌟',
                  title: 'تقييمات موثوقة',
                  desc: 'اقرأ تقييمات المستخدمين الحقيقية واختر أفضل الرحلات والسائقين.',
                  color: '#8b5cf6',
                },
                {
                  icon: '💬',
                  title: 'تواصل سهل',
                  desc: 'نظام مراسلة مدمج للتواصل المباشر مع السائقين والركاب.',
                  color: '#10b981',
                },
                {
                  icon: '🗺️',
                  title: 'تغطية شاملة',
                  desc: 'رحلات إلى جميع المدن العراقية مع جدول واسع من الأوقات المتاحة.',
                  color: '#06b6d4',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  style={{
                    padding: 'var(--space-4)',
                    background: isDarkMode
                      ? `linear-gradient(135deg, ${feature.color}15 0%, ${feature.color}08 100%)`
                      : `${feature.color}08`,
                    borderRadius: 'var(--radius-lg)',
                    border: isDarkMode
                      ? `1px solid ${feature.color}30`
                      : `2px solid ${feature.color}20`,
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(-4px)';
                    e.currentTarget.style.borderColor = feature.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.borderColor = isDarkMode
                      ? `${feature.color}30`
                      : `${feature.color}20`;
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    <span style={{ fontSize: '1.8rem' }}>{feature.icon}</span>
                    <h3
                      style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: '700',
                        color: isDarkMode ? '#ffffff' : '#1f2937',
                        margin: 0,
                      }}
                    >
                      {feature.title}
                    </h3>
                  </div>
                  <p
                    style={{
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
                      fontSize: 'var(--text-sm)',
                      margin: 0,
                      paddingRight: '45px',
                    }}
                  >
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* كيف يعمل توصيلة؟ - How It Works Steps */}
          <section style={{ marginBottom: 'var(--space-8)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? '1.5rem' : '2rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  borderRadius: '12px',
                  padding: isMobile ? 'var(--space-2)' : 'var(--space-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                🚀
              </div>
              <h2
                style={{
                  fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                  fontWeight: '700',
                  color: isDarkMode ? '#ffffff' : '#1f2937',
                  margin: 0,
                }}
              >
                خطوات استخدام توصيلة
              </h2>
            </div>
            <p
              style={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
                fontSize: 'var(--text-base)',
                marginBottom: 'var(--space-5)',
              }}
            >
              ثلاث خطوات بسيطة للوصول إلى وجهتك
            </p>

            <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
              {[
                {
                  number: '1',
                  title: 'ابحث عن رحلة',
                  desc: 'اختر مدينة الانطلاق والوجهة، وحدد التاريخ المناسب لك.',
                  color: '#34c759',
                },
                {
                  number: '2',
                  title: 'احجز مقعدك',
                  desc: 'اختر من بين العروض المتاحة واحجز مقعدك مع السائق المفضل.',
                  color: '#3b82f6',
                },
                {
                  number: '3',
                  title: 'استمتع برحلتك',
                  desc: 'تواصل مع السائق، وانطلق في رحلة آمنة ومريحة.',
                  color: '#8b5cf6',
                },
              ].map((step, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-5)',
                    background: isDarkMode
                      ? `linear-gradient(135deg, ${step.color}10 0%, ${step.color}05 100%)`
                      : `linear-gradient(135deg, ${step.color}08 0%, ${step.color}03 100%)`,
                    borderRadius: 'var(--radius-xl)',
                    border: isDarkMode ? `2px solid ${step.color}40` : `2px solid ${step.color}20`,
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = step.color;
                    e.currentTarget.style.boxShadow = `0 10px 30px ${step.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = isDarkMode
                      ? `${step.color}40`
                      : `${step.color}20`;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      fontSize: isMobile ? '2rem' : '2.5rem',
                      fontWeight: '800',
                      color: step.color,
                      minWidth: isMobile ? '40px' : '50px',
                      height: isMobile ? '40px' : '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isDarkMode ? `${step.color}20` : `${step.color}15`,
                      borderRadius: '12px',
                      flexShrink: 0,
                    }}
                  >
                    {step.number}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: isMobile ? 'var(--text-lg)' : 'var(--text-xl)',
                        fontWeight: '700',
                        color: isDarkMode ? '#ffffff' : '#1f2937',
                        marginBottom: 'var(--space-2)',
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      style={{
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
                        fontSize: 'var(--text-base)',
                        margin: 0,
                        lineHeight: '1.6',
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* معلومات التواصل */}
          <section
            style={{
              background: isDarkMode ? 'rgba(52, 199, 89, 0.1)' : '#ecfdf5',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              border: isDarkMode ? '1px solid rgba(52, 199, 89, 0.3)' : '2px solid #34c759',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? '1.5rem' : '2rem',
                }}
              >
                📞
              </div>
              <h2
                style={{
                  fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                  fontWeight: '700',
                  color: isDarkMode ? '#34c759' : '#047857',
                  margin: 0,
                }}
              >
                تواصل معنا
              </h2>
            </div>
            <p
              style={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#374151',
                fontSize: 'var(--text-base)',
                marginBottom: 'var(--space-4)',
              }}
            >
              نحن هنا لمساعدتك! إذا كان لديك أي استفسارات أو اقتراحات، لا تتردد في التواصل معنا:
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              <a
                href="mailto:support@toosila.com"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-3)',
                  background: isDarkMode ? 'rgba(52, 199, 89, 0.15)' : 'white',
                  borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none',
                  color: isDarkMode ? '#34c759' : '#047857',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(-4px)';
                  e.currentTarget.style.background = isDarkMode
                    ? 'rgba(52, 199, 89, 0.25)'
                    : '#f0fdf4';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.background = isDarkMode
                    ? 'rgba(52, 199, 89, 0.15)'
                    : 'white';
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>✉️</span>
                <span>support@toosila.com</span>
              </a>
            </div>
          </section>

          {/* معلومات الإصدار */}
          <div
            style={{
              marginTop: 'var(--space-8)',
              padding: 'var(--space-5)',
              background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
              borderRadius: 'var(--radius-lg)',
              border: isDarkMode ? '1px solid rgba(59, 130, 246, 0.3)' : '2px solid #3b82f6',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
                marginBottom: 'var(--space-2)',
              }}
            >
              <strong style={{ color: isDarkMode ? '#3b82f6' : '#1d4ed8' }}>توصيلة</strong> - تطبيق
              مشاركة الرحلات
            </p>
            <p
              style={{
                fontSize: 'var(--text-xs)',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : '#9ca3af',
                margin: 0,
              }}
            >
              الإصدار 2.1.15 | © 2025 جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
