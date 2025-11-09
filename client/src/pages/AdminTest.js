import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Test Page to Verify Admin Panel Works
 * This page is accessible to everyone at /admin-test
 */
const AdminTest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '600px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        fontFamily: 'Cairo, sans-serif',
        direction: 'rtl'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#1e293b',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          ✅ لوحة الإدارة جاهزة!
        </h1>

        <div style={{
          background: '#f0fdf4',
          border: '2px solid #22c55e',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#15803d', marginBottom: '12px' }}>
            📊 حالة المستخدم الحالي:
          </h2>

          {user ? (
            <div style={{ fontSize: '15px', color: '#334155' }}>
              <p><strong>الاسم:</strong> {user.name}</p>
              <p><strong>البريد:</strong> {user.email}</p>
              <p><strong>الدور:</strong> {user.role || 'user'}</p>
              <p><strong>هل أنت مدير؟</strong> {user.role === 'admin' ? '✅ نعم' : '❌ لا'}</p>
            </div>
          ) : (
            <p style={{ fontSize: '15px', color: '#dc2626', fontWeight: '600' }}>
              ⚠️ لم تسجل الدخول بعد
            </p>
          )}
        </div>

        <div style={{
          background: '#fffbeb',
          border: '2px solid #f59e0b',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#b45309', marginBottom: '12px' }}>
            🔑 كيفية الوصول للوحة الإدارة:
          </h2>

          <ol style={{ fontSize: '14px', color: '#334155', paddingRight: '20px' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>قم بتعيين دور المدير في قاعدة البيانات:</strong>
              <pre style={{
                background: '#1e293b',
                color: '#10b981',
                padding: '12px',
                borderRadius: '8px',
                marginTop: '8px',
                fontSize: '12px',
                overflow: 'auto',
                direction: 'ltr',
                textAlign: 'left'
              }}>
                UPDATE users SET role = 'admin'{'\n'}WHERE email = 'your@email.com';
              </pre>
            </li>
            <li style={{ marginBottom: '8px' }}>سجل الدخول بحساب المدير</li>
            <li style={{ marginBottom: '8px' }}>اضغط على صورتك الشخصية (أعلى يمين الصفحة)</li>
            <li style={{ marginBottom: '8px' }}>ستجد زر "⚡ لوحة الإدارة" باللون الأخضر</li>
          </ol>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {user?.role === 'admin' ? (
            <button
              onClick={() => navigate('/admin')}
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              🎉 افتح لوحة الإدارة
            </button>
          ) : (
            <div style={{
              padding: '16px',
              background: '#fef2f2',
              border: '2px solid #ef4444',
              borderRadius: '12px',
              color: '#dc2626',
              fontSize: '14px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              ⛔ لا يمكنك الوصول - يجب أن تكون مديراً
            </div>
          )}

          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px',
              background: '#f1f5f9',
              color: '#334155',
              border: '2px solid #cbd5e1',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🏠 العودة للصفحة الرئيسية
          </button>
        </div>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#eff6ff',
          borderRadius: '12px',
          fontSize: '13px',
          color: '#1e40af'
        }}>
          <strong>💡 نصيحة:</strong> إذا كنت تملك صلاحيات المدير، ستظهر لك لوحة الإدارة في قائمة المستخدم (أعلى يمين الشاشة).
        </div>
      </div>
    </div>
  );
};

export default AdminTest;
