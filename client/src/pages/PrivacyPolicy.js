import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const PrivacyPolicy = () => {
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
          ? 'linear-gradient(to bottom, rgba(59, 130, 246, 0.08) 0%, transparent 50%)'
          : 'linear-gradient(to bottom, rgba(59, 130, 246, 0.03) 0%, transparent 50%)',
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
            border: isDarkMode ? '1px solid rgba(59, 130, 246, 0.2)' : 'none',
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

          <button
            onClick={() => navigate(-1)}
            style={{
              position: 'absolute',
              top: isMobile ? 'var(--space-3)' : 'var(--space-4)',
              right: isMobile ? 'var(--space-3)' : 'var(--space-4)',
              background: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff',
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
              e.currentTarget.style.background = '#3b82f6';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff';
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
                fontSize: isMobile ? '2.5rem' : '4rem',
                marginBottom: isMobile ? 'var(--space-3)' : 'var(--space-4)',
              }}
            >
              🔒
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
              سياسة الخصوصية
            </h1>
            <p
              style={{
                fontSize: isMobile ? 'var(--text-base)' : 'var(--text-lg)',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
                fontFamily: '"Cairo", sans-serif',
                marginBottom: 'var(--space-2)',
              }}
            >
              نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية
            </p>
            <div
              style={{
                display: 'inline-block',
                padding: 'var(--space-2) var(--space-4)',
                background: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-sm)',
                color: '#3b82f6',
                fontWeight: '600',
                fontFamily: '"Cairo", sans-serif',
              }}
            >
              آخر تحديث: نوفمبر 2025
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
            border: isDarkMode ? '1px solid rgba(59, 130, 246, 0.2)' : 'none',
            fontFamily: '"Cairo", sans-serif',
            lineHeight: '1.8',
            direction: 'rtl',
          }}
        >
          {/* مقدمة */}
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
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  borderRadius: '12px',
                  padding: isMobile ? 'var(--space-2)' : 'var(--space-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                📱
              </div>
              <h2
                style={{
                  fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                  fontWeight: '700',
                  color: isDarkMode ? '#ffffff' : '#1f2937',
                  margin: 0,
                }}
              >
                مقدمة
              </h2>
            </div>
            <p
              style={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#374151',
                fontSize: 'var(--text-base)',
              }}
            >
              مرحباً بك في سياسة الخصوصية الخاصة بتطبيق توصيلة. نحن نؤمن بأن خصوصيتك حق أساسي،
              ونلتزم بالشفافية الكاملة حول كيفية جمع واستخدام وحماية بياناتك الشخصية. هذه السياسة
              توضح بالتفصيل ممارساتنا المتعلقة بالخصوصية وحقوقك كمستخدم.
            </p>
          </section>

          {/* البيانات التي نجمعها */}
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
                📊
              </div>
              <h2
                style={{
                  fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                  fontWeight: '700',
                  color: isDarkMode ? '#ffffff' : '#1f2937',
                  margin: 0,
                }}
              >
                البيانات التي نجمعها
              </h2>
            </div>
            <div
              style={{
                background: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: isDarkMode ? '1px solid rgba(16, 185, 129, 0.3)' : '2px solid #10b981',
              }}
            >
              <h3
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: '600',
                  color: isDarkMode ? '#10b981' : '#047857',
                  marginBottom: 'var(--space-3)',
                }}
              >
                معلومات التسجيل:
              </h3>
              <ul
                style={{
                  paddingRight: '20px',
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#374151',
                  fontSize: 'var(--text-base)',
                }}
              >
                <li>الاسم الكامل</li>
                <li>عنوان البريد الإلكتروني</li>
                <li>نوع الحساب (سائق أو راكب)</li>
                <li>صورة سيلفي (للسائقين فقط - لأغراض التحقق الأمني)</li>
              </ul>
            </div>

            <div
              style={{
                background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: isDarkMode ? '1px solid rgba(59, 130, 246, 0.3)' : '2px solid #3b82f6',
                marginTop: 'var(--space-4)',
              }}
            >
              <h3
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: '600',
                  color: isDarkMode ? '#3b82f6' : '#1d4ed8',
                  marginBottom: 'var(--space-3)',
                }}
              >
                معلومات الرحلات:
              </h3>
              <ul
                style={{
                  paddingRight: '20px',
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#374151',
                  fontSize: 'var(--text-base)',
                }}
              >
                <li>نقاط الانطلاق والوصول</li>
                <li>تواريخ وأوقات الرحلات</li>
                <li>عدد المقاعد المتاحة/المطلوبة</li>
                <li>تفاصيل الحجوزات</li>
              </ul>
            </div>

            <div
              style={{
                background: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: isDarkMode ? '1px solid rgba(245, 158, 11, 0.3)' : '2px solid #f59e0b',
                marginTop: 'var(--space-4)',
              }}
            >
              <h3
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: '600',
                  color: isDarkMode ? '#f59e0b' : '#92400e',
                  marginBottom: 'var(--space-3)',
                }}
              >
                بيانات الاستخدام:
              </h3>
              <ul
                style={{
                  paddingRight: '20px',
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#374151',
                  fontSize: 'var(--text-base)',
                }}
              >
                <li>سجل النشاط داخل التطبيق</li>
                <li>التقييمات والمراجعات</li>
                <li>الرسائل المتبادلة (مشفرة)</li>
                <li>تفضيلات اللغة والإعدادات</li>
              </ul>
            </div>
          </section>

          {/* كيف نستخدم بياناتك */}
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
                كيف نستخدم بياناتك
              </h2>
            </div>
            <ul
              style={{
                paddingRight: '20px',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#374151',
                fontSize: 'var(--text-base)',
              }}
            >
              <li style={{ marginBottom: 'var(--space-2)' }}>
                <strong style={{ color: isDarkMode ? '#ffffff' : '#1f2937' }}>تسهيل الخدمة:</strong>{' '}
                لربط السائقين والركاب وتنظيم الرحلات
              </li>
              <li style={{ marginBottom: 'var(--space-2)' }}>
                <strong style={{ color: isDarkMode ? '#ffffff' : '#1f2937' }}>التواصل:</strong>{' '}
                لإرسال الإشعارات المهمة حول الحجوزات والرحلات
              </li>
              <li style={{ marginBottom: 'var(--space-2)' }}>
                <strong style={{ color: isDarkMode ? '#ffffff' : '#1f2937' }}>الأمان:</strong>{' '}
                للتحقق من الهوية ومنع الاحتيال
              </li>
              <li style={{ marginBottom: 'var(--space-2)' }}>
                <strong style={{ color: isDarkMode ? '#ffffff' : '#1f2937' }}>تحسين الخدمة:</strong>{' '}
                لتحليل الأداء وتطوير ميزات جديدة
              </li>
              <li style={{ marginBottom: 'var(--space-2)' }}>
                <strong style={{ color: isDarkMode ? '#ffffff' : '#1f2937' }}>الدعم الفني:</strong>{' '}
                لحل المشاكل والإجابة على الاستفسارات
              </li>
            </ul>
          </section>

          {/* حماية البيانات */}
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
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  borderRadius: '12px',
                  padding: 'var(--space-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                🛡️
              </div>
              <h2
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: '700',
                  color: isDarkMode ? '#ffffff' : '#1f2937',
                  margin: 0,
                }}
              >
                كيف نحمي بياناتك
              </h2>
            </div>
            <div
              style={{
                background: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: isDarkMode ? '1px solid rgba(239, 68, 68, 0.3)' : '2px solid #ef4444',
              }}
            >
              <ul
                style={{
                  paddingRight: '20px',
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#374151',
                  fontSize: 'var(--text-base)',
                }}
              >
                <li style={{ marginBottom: 'var(--space-2)' }}>
                  <strong style={{ color: isDarkMode ? '#ffffff' : '#1f2937' }}>التشفير:</strong>{' '}
                  جميع البيانات الحساسة مشفرة باستخدام معايير الصناعة (SSL/TLS)
                </li>
                <li style={{ marginBottom: 'var(--space-2)' }}>
                  <strong style={{ color: isDarkMode ? '#ffffff' : '#1f2937' }}>
                    التخزين الآمن:
                  </strong>{' '}
                  الخوادم محمية بجدران نارية متقدمة ونظم مراقبة على مدار الساعة
                </li>
                <li style={{ marginBottom: 'var(--space-2)' }}>
                  <strong style={{ color: isDarkMode ? '#ffffff' : '#1f2937' }}>
                    الوصول المحدود:
                  </strong>{' '}
                  فقط الموظفون المصرح لهم يمكنهم الوصول للبيانات الحساسة
                </li>
                <li style={{ marginBottom: 'var(--space-2)' }}>
                  <strong style={{ color: isDarkMode ? '#ffffff' : '#1f2937' }}>
                    المراجعة الدورية:
                  </strong>{' '}
                  نجري تدقيقات أمنية منتظمة لضمان سلامة البيانات
                </li>
              </ul>
            </div>
          </section>

          {/* مشاركة البيانات */}
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
                  padding: 'var(--space-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                🤝
              </div>
              <h2
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: '700',
                  color: isDarkMode ? '#ffffff' : '#1f2937',
                  margin: 0,
                }}
              >
                مشاركة البيانات
              </h2>
            </div>
            <p
              style={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#374151',
                fontSize: 'var(--text-base)',
                marginBottom: 'var(--space-3)',
              }}
            >
              نحن <strong style={{ color: isDarkMode ? '#ffffff' : '#1f2937' }}>لا نبيع</strong>{' '}
              بياناتك الشخصية لأطراف ثالثة. قد نشارك بيانات محدودة فقط في الحالات التالية:
            </p>
            <ul
              style={{
                paddingRight: '20px',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#374151',
                fontSize: 'var(--text-base)',
              }}
            >
              <li style={{ marginBottom: 'var(--space-2)' }}>
                مع السائقين والركاب المشاركين في نفس الرحلة (الاسم ومعلومات الاتصال الأساسية فقط)
              </li>
              <li style={{ marginBottom: 'var(--space-2)' }}>
                مع مزودي الخدمات الذين يساعدوننا في تشغيل التطبيق (مثل خدمات الاستضافة) بموجب
                اتفاقيات سرية صارمة
              </li>
              <li style={{ marginBottom: 'var(--space-2)' }}>
                عند الطلب القانوني من السلطات المختصة
              </li>
              <li style={{ marginBottom: 'var(--space-2)' }}>بموافقتك الصريحة المسبقة</li>
            </ul>
          </section>

          {/* حقوقك */}
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
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  borderRadius: '12px',
                  padding: 'var(--space-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ⚖️
              </div>
              <h2
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: '700',
                  color: isDarkMode ? '#ffffff' : '#1f2937',
                  margin: 0,
                }}
              >
                حقوقك كمستخدم
              </h2>
            </div>
            <div
              style={{
                background: isDarkMode ? 'rgba(6, 182, 212, 0.1)' : '#ecfeff',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: isDarkMode ? '1px solid rgba(6, 182, 212, 0.3)' : '2px solid #06b6d4',
              }}
            >
              <ul
                style={{
                  paddingRight: '20px',
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#374151',
                  fontSize: 'var(--text-base)',
                }}
              >
                <li style={{ marginBottom: 'var(--space-2)' }}>
                  <strong style={{ color: isDarkMode ? '#ffffff' : '#1f2937' }}>الوصول:</strong>{' '}
                  يمكنك طلب نسخة من بياناتك الشخصية
                </li>
                <li style={{ marginBottom: 'var(--space-2)' }}>
                  <strong style={{ color: isDarkMode ? '#ffffff' : '#1f2937' }}>التصحيح:</strong>{' '}
                  يمكنك تحديث أو تصحيح معلوماتك في أي وقت
                </li>
                <li style={{ marginBottom: 'var(--space-2)' }}>
                  <strong style={{ color: isDarkMode ? '#ffffff' : '#1f2937' }}>الحذف:</strong>{' '}
                  يمكنك طلب حذف حسابك وبياناتك بشكل دائم
                </li>
                <li style={{ marginBottom: 'var(--space-2)' }}>
                  <strong style={{ color: isDarkMode ? '#ffffff' : '#1f2937' }}>التقييد:</strong>{' '}
                  يمكنك طلب تقييد معالجة بياناتك
                </li>
                <li style={{ marginBottom: 'var(--space-2)' }}>
                  <strong style={{ color: isDarkMode ? '#ffffff' : '#1f2937' }}>الاعتراض:</strong>{' '}
                  يمكنك الاعتراض على معالجة بياناتك في حالات معينة
                </li>
              </ul>
            </div>
          </section>

          {/* ملفات تعريف الارتباط */}
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
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                  borderRadius: '12px',
                  padding: 'var(--space-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                🍪
              </div>
              <h2
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: '700',
                  color: isDarkMode ? '#ffffff' : '#1f2937',
                  margin: 0,
                }}
              >
                ملفات تعريف الارتباط (Cookies)
              </h2>
            </div>
            <p
              style={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#374151',
                fontSize: 'var(--text-base)',
                marginBottom: 'var(--space-3)',
              }}
            >
              نستخدم ملفات تعريف الارتباط لتحسين تجربتك في التطبيق، مثل:
            </p>
            <ul
              style={{
                paddingRight: '20px',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#374151',
                fontSize: 'var(--text-base)',
              }}
            >
              <li>الحفاظ على تسجيل دخولك</li>
              <li>تذكر تفضيلاتك (مثل اللغة والوضع المظلم)</li>
              <li>تحليل استخدام التطبيق لتحسين الأداء</li>
            </ul>
          </section>

          {/* الاتصال بنا */}
          <section
            style={{
              background: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              border: isDarkMode ? '1px solid rgba(16, 185, 129, 0.3)' : '2px solid #10b981',
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
                📧
              </div>
              <h2
                style={{
                  fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                  fontWeight: '700',
                  color: isDarkMode ? '#10b981' : '#047857',
                  margin: 0,
                }}
              >
                اتصل بنا
              </h2>
            </div>
            <p
              style={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#374151',
                fontSize: 'var(--text-base)',
                marginBottom: 'var(--space-3)',
              }}
            >
              إذا كان لديك أي أسئلة أو استفسارات حول سياسة الخصوصية أو حقوقك، يرجى التواصل معنا:
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#374151',
                }}
              >
                <span>📧</span>
                <a
                  href="mailto:support@toosila.com"
                  style={{
                    color: '#3b82f6',
                    textDecoration: 'none',
                    fontWeight: '600',
                  }}
                >
                  support@toosila.com
                </a>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#374151',
                }}
              >
                <span>⚙️</span>
                <span>من خلال قسم الإعدادات في التطبيق</span>
              </div>
            </div>
          </section>

          {/* ملاحظة ختامية */}
          <div
            style={{
              marginTop: 'var(--space-8)',
              padding: isMobile ? 'var(--space-4)' : 'var(--space-6)',
              background: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7',
              borderRadius: 'var(--radius-lg)',
              border: isDarkMode ? '1px solid rgba(245, 158, 11, 0.3)' : '2px solid #f59e0b',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: isMobile ? '2rem' : '3rem', marginBottom: 'var(--space-3)' }}>
              ✨
            </div>
            <p
              style={{
                fontSize: isMobile ? 'var(--text-base)' : 'var(--text-lg)',
                fontWeight: '600',
                color: isDarkMode ? '#f59e0b' : '#92400e',
                marginBottom: 'var(--space-2)',
              }}
            >
              التزامنا تجاهك
            </p>
            <p
              style={{
                fontSize: 'var(--text-base)',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#374151',
              }}
            >
              نحن ملتزمون بحماية خصوصيتك وتوفير تجربة آمنة وموثوقة. سياسة الخصوصية هذه قد تتغير من
              وقت لآخر، وسنقوم بإخطارك بأي تغييرات جوهرية.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
