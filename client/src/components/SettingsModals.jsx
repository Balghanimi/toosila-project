import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Modal Wrapper Component
export function Modal({ title, children, onClose }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        animation: 'fadeIn 0.2s ease-in-out',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#111827',
              margin: 0,
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '28px',
              color: '#6b7280',
              cursor: 'pointer',
              padding: 0,
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
              e.currentTarget.style.color = '#111827';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Change Password Modal
export function ChangePasswordModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.new !== formData.confirm) {
      setError('كلمات المرور الجديدة غير متطابقة');
      return;
    }

    if (formData.new.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword(formData.current, formData.new);
      onSuccess('تم تغيير كلمة المرور بنجاح ✅');
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.message || 'فشل تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="🔑 تغيير كلمة المرور" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <Alert type="error" message={error} />}

        <Input
          label="كلمة المرور الحالية"
          type="password"
          value={formData.current}
          onChange={(e) => setFormData({ ...formData, current: e.target.value })}
          required
        />

        <Input
          label="كلمة المرور الجديدة"
          type="password"
          value={formData.new}
          onChange={(e) => setFormData({ ...formData, new: e.target.value })}
          required
        />

        <Input
          label="تأكيد كلمة المرور الجديدة"
          type="password"
          value={formData.confirm}
          onChange={(e) => setFormData({ ...formData, confirm: e.target.value })}
          required
        />

        <Button type="submit" loading={loading}>
          تغيير كلمة المرور
        </Button>
      </form>
    </Modal>
  );
}

// Update Email Modal
export function UpdateEmailModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({ newEmail: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setLoading(true);
    try {
      await authAPI.updateEmail(formData.newEmail, formData.password);
      onSuccess('تم تحديث البريد الإلكتروني بنجاح ✅');
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.message || 'فشل تحديث البريد الإلكتروني');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="📧 تحديث البريد الإلكتروني" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <Alert type="error" message={error} />}

        <Input
          label="البريد الإلكتروني الجديد"
          type="email"
          value={formData.newEmail}
          onChange={(e) => setFormData({ ...formData, newEmail: e.target.value })}
          required
        />

        <Input
          label="كلمة المرور للتأكيد"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <Button type="submit" loading={loading}>
          تحديث البريد الإلكتروني
        </Button>
      </form>
    </Modal>
  );
}

// Delete Account Modal
export function DeleteAccountModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({ password: '', confirmation: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.confirmation !== 'DELETE') {
      setError('يرجى كتابة DELETE بالإنجليزية بأحرف كبيرة');
      return;
    }

    setLoading(true);
    try {
      await authAPI.deleteAccount(formData.password, formData.confirmation);
      onSuccess('تم حذف الحساب بنجاح');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      setError(err.message || 'فشل حذف الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="🗑️ حذف الحساب" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <Alert type="error" message={error} />}

        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <p
            style={{
              color: '#dc2626',
              fontSize: '14px',
              fontFamily: '"Cairo", sans-serif',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            ⚠️ <strong>تحذير:</strong> هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك بشكل
            دائم.
          </p>
        </div>

        <Input
          label="كلمة المرور"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <Input
          label='اكتب "DELETE" بأحرف كبيرة للتأكيد'
          type="text"
          value={formData.confirmation}
          onChange={(e) => setFormData({ ...formData, confirmation: e.target.value })}
          placeholder="DELETE"
          required
        />

        <Button type="submit" loading={loading} danger>
          حذف الحساب نهائياً
        </Button>
      </form>
    </Modal>
  );
}

// Helper Components
function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '8px',
          fontFamily: '"Cairo", sans-serif',
        }}
      >
        {label}
      </label>
      <input
        {...props}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '16px',
          fontFamily: '"Cairo", sans-serif',
          transition: 'all 0.2s',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#10b981';
          e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#d1d5db';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

function Button({ children, loading, danger, ...props }) {
  return (
    <button
      {...props}
      disabled={loading}
      style={{
        width: '100%',
        padding: '12px',
        background: danger
          ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
          : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: '"Cairo", sans-serif',
        opacity: loading ? 0.7 : 1,
        transition: 'all 0.2s',
        marginTop: '8px',
      }}
      onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {loading ? 'جاري المعالجة...' : children}
    </button>
  );
}

function Alert({ type, message }) {
  const colors = {
    error: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
  };

  const color = colors[type];

  return (
    <div
      style={{
        background: color.bg,
        border: `1px solid ${color.border}`,
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px',
      }}
    >
      <p
        style={{
          color: color.text,
          fontSize: '14px',
          fontFamily: '"Cairo", sans-serif',
          margin: 0,
        }}
      >
        {message}
      </p>
    </div>
  );
}

// User Type Modal
export function UserTypeModal({ onClose, onSuccess }) {
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser, toggleUserType } = useAuth();

  const currentIsDriver = currentUser?.isDriver || false;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedType === null) {
      setError('يرجى اختيار نوع الحساب');
      return;
    }

    const newIsDriver = selectedType === 'driver';

    // Check if there's no change
    if (newIsDriver === currentIsDriver) {
      onSuccess('لم يتم إجراء أي تغيير');
      setTimeout(onClose, 1500);
      return;
    }

    setLoading(true);
    try {
      // Use client-side toggle wrapper with explicit mode
      const result = await toggleUserType(newIsDriver);

      if (!result.success) {
        throw new Error(result.error || 'فشل تحديث نوع الحساب');
      }

      const userType = newIsDriver ? 'سائق 🚗' : 'راكب 👤';
      onSuccess(`تم تحديث نوع الحساب إلى ${userType} بنجاح ✅`);

      // No page reload needed - React context handles state update
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.message || 'فشل تحديث نوع الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={currentIsDriver ? '🚗 → 👤 تغيير إلى راكب' : '👤 → 🚗 تغيير إلى سائق'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        {error && <Alert type="error" message={error} />}

        <div
          style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <p
            style={{
              color: '#1e40af',
              fontSize: '14px',
              fontFamily: '"Cairo", sans-serif',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            💡 <strong>ملاحظة:</strong> يمكنك التبديل بين نوعي الحساب في أي وقت. نوع حسابك الحالي:{' '}
            <strong>{currentIsDriver ? 'سائق 🚗' : 'راكب 👤'}</strong>
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            اختر نوع الحساب الجديد:
          </label>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setSelectedType('passenger')}
              style={{
                flex: 1,
                padding: '16px',
                border: `2px solid ${selectedType === 'passenger' ? '#3b82f6' : '#e5e7eb'}`,
                borderRadius: '12px',
                background: selectedType === 'passenger' ? '#eff6ff' : 'white',
                color: selectedType === 'passenger' ? '#1d4ed8' : '#6b7280',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                fontFamily: '"Cairo", sans-serif',
              }}
            >
              <span style={{ fontSize: '32px' }}>👤</span>
              <span>راكب</span>
              {!currentIsDriver && <span style={{ fontSize: '12px', opacity: 0.7 }}>(الحالي)</span>}
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('driver')}
              style={{
                flex: 1,
                padding: '16px',
                border: `2px solid ${selectedType === 'driver' ? '#10b981' : '#e5e7eb'}`,
                borderRadius: '12px',
                background: selectedType === 'driver' ? '#ecfdf5' : 'white',
                color: selectedType === 'driver' ? '#047857' : '#6b7280',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                fontFamily: '"Cairo", sans-serif',
              }}
            >
              <span style={{ fontSize: '32px' }}>🚗</span>
              <span>سائق</span>
              {currentIsDriver && <span style={{ fontSize: '12px', opacity: 0.7 }}>(الحالي)</span>}
            </button>
          </div>
        </div>

        <Button type="submit" loading={loading}>
          تأكيد التغيير
        </Button>
      </form>
    </Modal>
  );
}
