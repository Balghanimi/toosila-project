import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function UserProfile({ isOpen, onClose }) {
  const { user, logout, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [errors, setErrors] = useState({});

  if (!isOpen || !user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSave = async () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^07\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const result = await updateProfile(formData);
      if (result.success) {
        setIsEditing(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleToggleRole = async () => {
    setIsSwitchingRole(true);
    const newRole = user.userType === 'driver' ? 'passenger' : 'driver';
    const result = await updateProfile({ isDriver: newRole === 'driver' });
    setIsSwitchingRole(false);
    // Profile will auto-update through context
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        width: '100%',
        maxWidth: '460px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '8px'
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: user.userType === 'driver'
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            fontSize: '32px',
            color: 'white',
            transition: 'all 0.3s ease'
          }}>
            {user.userType === 'driver' ? '🚗' : '🧑‍💼'}
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            {user.name}
          </h2>

          {/* Role Toggle Button */}
          <button
            onClick={handleToggleRole}
            disabled={isSwitchingRole}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto 12px auto',
              padding: '8px 16px',
              background: isSwitchingRole ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
              border: 'none',
              borderRadius: '20px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isSwitchingRole ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!isSwitchingRole) {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }}
          >
            <span style={{ fontSize: '18px' }}>
              {user.userType === 'driver' ? '🧑‍💼' : '🚗'}
            </span>
            <span>
              {isSwitchingRole ? 'جاري التبديل...' :
               user.userType === 'driver' ? 'التبديل إلى راكب' : 'التبديل إلى سائق'}
            </span>
            <span style={{ fontSize: '16px' }}>⇄</span>
          </button>

          {/* Current Role Badge */}
          <div style={{
            display: 'inline-block',
            background: user.userType === 'driver' ? '#10b981' : '#3b82f6',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {user.userType === 'driver' ? '🚗 سائق' : '🧑‍💼 راكب'}
          </div>

          {/* Email Verification Status */}
          <div style={{
            display: 'inline-block',
            background: user.emailVerified ? '#10b981' : '#f59e0b',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            marginLeft: '8px'
          }}>
            {user.emailVerified ? '✓ Email Verified' : '⚠ Not Verified'}
          </div>
        </div>

        {/* User Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: '#f0f9ff',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #0ea5e9'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#0369a1' }}>
              {user.rating || '0.0'}
            </div>
            <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: '500' }}>
              التقييم
            </div>
          </div>
          <div style={{
            background: '#f0fdf4',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #10b981'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>
              {user.tripsCount || '0'}
            </div>
            <div style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>
              الرحلات
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0'
            }}>
              المعلومات الشخصية
            </h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  background: 'none',
                  border: '1px solid #3b82f6',
                  color: '#3b82f6',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                تعديل
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Name Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                الاسم
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${errors.name ? '#dc2626' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {errors.name && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                      {errors.name}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  padding: '12px 16px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  color: '#374151'
                }}>
                  {user.name}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                البريد الإلكتروني
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${errors.email ? '#dc2626' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {errors.email && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                      {errors.email}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  padding: '12px 16px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  color: '#374151'
                }}>
                  {user.email}
                </div>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                رقم الهاتف
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${errors.phone ? '#dc2626' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {errors.phone && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                      {errors.phone}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  padding: '12px 16px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  color: '#374151'
                }}>
                  {user.phone}
                </div>
              )}
            </div>

            {/* Join Date */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                تاريخ الانضمام
              </label>
              <div style={{
                padding: '12px 16px',
                background: '#f9fafb',
                borderRadius: '8px',
                fontSize: '16px',
                color: '#374151'
              }}>
                {new Date(user.createdAt).toLocaleDateString('ar-IQ')}
              </div>
            </div>
          </div>

          {/* Edit Buttons */}
          {isEditing && (
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '16px'
            }}>
              <button
                onClick={handleSave}
                disabled={loading}
                style={{
                  flex: 1,
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'جارٍ الحفظ...' : 'حفظ'}
              </button>
              <button
                onClick={handleCancel}
                style={{
                  flex: 1,
                  background: 'none',
                  border: '2px solid #e5e7eb',
                  color: '#374151',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                إلغاء
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <button
            onClick={handleLogout}
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            🚪 تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  );
}

