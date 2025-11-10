import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { demandResponsesAPI } from '../services/api';

/**
 * مكون عرض قائمة الردود على طلب رحلة
 *
 * @param {Object} props
 * @param {Array} props.responses - قائمة الردود
 * @param {boolean} props.isOwner - هل المستخدم الحالي صاحب الطلب
 * @param {Function} props.onResponseUpdate - دالة تُستدعى عند تحديث رد
 */
const DemandResponsesList = ({ responses, isOwner, onResponseUpdate }) => {
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(null); // معرف الرد الذي يتم معالجته
  const [error, setError] = useState('');

  // معالجة قبول رد
  const handleAccept = async (responseId) => {
    if (!window.confirm('هل أنت متأكد من قبول هذا العرض؟ سيتم رفض جميع العروض الأخرى.')) {
      return;
    }

    setActionLoading(responseId);
    setError('');

    try {
      await demandResponsesAPI.updateStatus(responseId, 'accepted');
      if (onResponseUpdate) {
        onResponseUpdate();
      }
    } catch (err) {
      console.error('Error accepting response:', err);
      setError(err.message || 'حدث خطأ أثناء قبول العرض');
    } finally {
      setActionLoading(null);
    }
  };

  // معالجة رفض رد
  const handleReject = async (responseId) => {
    if (!window.confirm('هل أنت متأكد من رفض هذا العرض؟')) {
      return;
    }

    setActionLoading(responseId);
    setError('');

    try {
      await demandResponsesAPI.updateStatus(responseId, 'rejected');
      if (onResponseUpdate) {
        onResponseUpdate();
      }
    } catch (err) {
      console.error('Error rejecting response:', err);
      setError(err.message || 'حدث خطأ أثناء رفض العرض');
    } finally {
      setActionLoading(null);
    }
  };

  // الحصول على لون الحالة
  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return { bg: '#d1fae5', text: '#065f46', icon: '✅' };
      case 'rejected':
        return { bg: '#fee2e2', text: '#991b1b', icon: '❌' };
      case 'cancelled':
        return { bg: '#f3f4f6', text: '#6b7280', icon: '🚫' };
      default: // pending
        return { bg: '#fef3c7', text: '#92400e', icon: '⏳' };
    }
  };

  // الحصول على نص الحالة
  const getStatusText = (status) => {
    switch (status) {
      case 'accepted':
        return 'مقبول';
      case 'rejected':
        return 'مرفوض';
      case 'cancelled':
        return 'ملغي';
      default: // pending
        return 'قيد الانتظار';
    }
  };

  if (!responses || responses.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--space-8)',
          background: 'var(--surface-secondary)',
          borderRadius: 'var(--radius-xl)',
          color: 'var(--text-secondary)',
          fontFamily: '"Cairo", sans-serif',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>📭</div>
        <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
          لا توجد عروض حتى الآن
        </h3>
        <p style={{ fontSize: 'var(--text-sm)' }}>لم يتقدم أي سائق بعرض لهذا الطلب</p>
      </div>
    );
  }

  return (
    <div>
      {/* رسالة خطأ */}
      {error && (
        <div
          style={{
            background: '#fee',
            border: '2px solid #f88',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
            color: '#c00',
            fontSize: 'var(--text-sm)',
            fontFamily: '"Cairo", sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* قائمة الردود */}
      <div
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
        }}
      >
        {responses.map((response) => {
          const statusStyle = getStatusColor(response.status);
          const isProcessing = actionLoading === response.id;

          return (
            <div
              key={response.id}
              style={{
                background: 'var(--surface-primary)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-5)',
                boxShadow:
                  response.status === 'accepted'
                    ? '0 4px 20px rgba(52, 199, 89, 0.2)'
                    : 'var(--shadow-md)',
                border:
                  response.status === 'accepted'
                    ? '2px solid var(--primary)'
                    : '1px solid var(--border-light)',
                transition: 'var(--transition)',
                opacity: isProcessing ? 0.6 : 1,
              }}
            >
              {/* Header - اسم السائق والحالة */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--space-4)',
                  flexWrap: 'wrap',
                  gap: 'var(--space-2)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background:
                        'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      color: 'white',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  >
                    🚗
                  </div>
                  <div>
                    <div
                      onClick={() => navigate(`/user-ratings/${response.driverId}`)}
                      style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: '700',
                        color: '#8b5cf6',
                        fontFamily: '"Cairo", sans-serif',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        display: 'inline-block',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#7c3aed';
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#8b5cf6';
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      {response.driverName || 'سائق'} 👤
                    </div>
                    {response.driverRating && (
                      <div
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--text-secondary)',
                          fontFamily: '"Cairo", sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-1)',
                          marginTop: 'var(--space-1)',
                        }}
                      >
                        <span>⭐</span>
                        {parseFloat(response.driverRating).toFixed(1)}
                        {response.driverRatingCount && (
                          <span style={{ marginRight: 'var(--space-1)' }}>
                            ({response.driverRatingCount} تقييم)
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: '#8b5cf6',
                            marginRight: 'var(--space-2)',
                            fontWeight: '600',
                          }}
                        >
                          اضغط لعرض الملف
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* شارة الحالة */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-2) var(--space-3)',
                    background: statusStyle.bg,
                    color: statusStyle.text,
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    fontFamily: '"Cairo", sans-serif',
                  }}
                >
                  <span>{statusStyle.icon}</span>
                  {getStatusText(response.status)}
                </div>
              </div>

              {/* تفاصيل العرض */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: 'var(--space-4)',
                  marginBottom: 'var(--space-4)',
                  padding: 'var(--space-4)',
                  background: 'var(--surface-secondary)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--space-1)',
                      fontFamily: '"Cairo", sans-serif',
                    }}
                  >
                    💰 السعر المقترح
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--text-xl)',
                      fontWeight: '700',
                      color: 'var(--primary)',
                      fontFamily: '"Cairo", sans-serif',
                    }}
                  >
                    {response.offerPrice ? parseFloat(response.offerPrice).toLocaleString() : '0'}{' '}
                    د.ع
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--space-1)',
                      fontFamily: '"Cairo", sans-serif',
                    }}
                  >
                    💺 المقاعد المتاحة
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--text-xl)',
                      fontWeight: '700',
                      color: 'var(--text-primary)',
                      fontFamily: '"Cairo", sans-serif',
                    }}
                  >
                    {response.availableSeats} مقعد/مقاعد
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--space-1)',
                      fontFamily: '"Cairo", sans-serif',
                    }}
                  >
                    📅 تاريخ الإرسال
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      fontFamily: '"Cairo", sans-serif',
                    }}
                  >
                    {new Date(response.createdAt).toLocaleDateString('ar-EG')}
                  </div>
                </div>
              </div>

              {/* رسالة السائق */}
              {response.message && (
                <div
                  style={{
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: 'var(--radius)',
                    padding: 'var(--space-3)',
                    marginBottom: 'var(--space-4)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: '#0369a1',
                      fontWeight: '600',
                      marginBottom: 'var(--space-2)',
                      fontFamily: '"Cairo", sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                    }}
                  >
                    <span>💬</span>
                    رسالة من السائق:
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--text-base)',
                      color: '#0c4a6e',
                      fontFamily: '"Cairo", sans-serif',
                      lineHeight: '1.6',
                    }}
                  >
                    {response.message}
                  </div>
                </div>
              )}

              {/* أزرار الإجراءات (للراكب فقط وإذا كانت الحالة pending) */}
              {isOwner && response.status === 'pending' && (
                <div
                  style={{
                    display: 'flex',
                    gap: 'var(--space-3)',
                    marginTop: 'var(--space-4)',
                  }}
                >
                  <button
                    onClick={() => handleAccept(response.id)}
                    disabled={isProcessing}
                    style={{
                      flex: 1,
                      padding: 'var(--space-3)',
                      background: isProcessing
                        ? 'var(--text-muted)'
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)',
                      fontWeight: '700',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      fontFamily: '"Cairo", sans-serif',
                      boxShadow: isProcessing ? 'none' : 'var(--shadow-md)',
                      transition: 'var(--transition)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 'var(--space-2)',
                    }}
                    onMouseEnter={(e) =>
                      !isProcessing && (e.target.style.transform = 'translateY(-2px)')
                    }
                    onMouseLeave={(e) =>
                      !isProcessing && (e.target.style.transform = 'translateY(0)')
                    }
                  >
                    ✅ قبول العرض
                  </button>

                  <button
                    onClick={() => handleReject(response.id)}
                    disabled={isProcessing}
                    style={{
                      flex: 1,
                      padding: 'var(--space-3)',
                      background: isProcessing ? 'var(--text-muted)' : 'var(--surface-secondary)',
                      color: isProcessing ? 'var(--text-muted)' : '#dc2626',
                      border: `2px solid ${isProcessing ? 'var(--border-light)' : '#fecaca'}`,
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)',
                      fontWeight: '600',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      fontFamily: '"Cairo", sans-serif',
                      transition: 'var(--transition)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 'var(--space-2)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isProcessing) {
                        e.target.style.background = '#fee2e2';
                        e.target.style.borderColor = '#dc2626';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isProcessing) {
                        e.target.style.background = 'var(--surface-secondary)';
                        e.target.style.borderColor = '#fecaca';
                      }
                    }}
                  >
                    ❌ رفض العرض
                  </button>
                </div>
              )}

              {/* أزرار المراسلة وعرض الملف - يظهران بعد القبول */}
              {isOwner && response.status === 'accepted' && (
                <div
                  style={{
                    marginTop: 'var(--space-4)',
                    padding: 'var(--space-4)',
                    background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                    borderRadius: 'var(--radius-lg)',
                    border: '2px solid #0ea5e9',
                  }}
                >
                  <div
                    style={{
                      marginBottom: 'var(--space-3)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: '700',
                        color: '#0c4a6e',
                        marginBottom: 'var(--space-1)',
                        fontFamily: '"Cairo", sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                      }}
                    >
                      <span>✅</span>
                      تم قبول العرض
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: '#075985',
                        fontFamily: '"Cairo", sans-serif',
                      }}
                    >
                      يمكنك الآن التواصل مع السائق والاطلاع على ملفه الشخصي
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 'var(--space-3)',
                    }}
                  >
                    {/* زر الاتصال */}
                    {response.driverPhone && (
                      <a
                        href={`tel:${response.driverPhone}`}
                        style={{
                          padding: 'var(--space-3) var(--space-4)',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius)',
                          fontSize: 'var(--text-base)',
                          fontWeight: '700',
                          cursor: 'pointer',
                          fontFamily: '"Cairo", sans-serif',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                          transition: 'var(--transition)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 'var(--space-2)',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                        }}
                      >
                        <span>📞</span>
                        اتصال بالسائق
                      </a>
                    )}

                    {/* زر المراسلة */}
                    <button
                      onClick={() => navigate('/messages')}
                      style={{
                        padding: 'var(--space-3) var(--space-4)',
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        fontSize: 'var(--text-base)',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontFamily: '"Cairo", sans-serif',
                        boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
                        transition: 'var(--transition)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-2)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(14, 165, 233, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.3)';
                      }}
                    >
                      <span>💬</span>
                      مراسلة السائق
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DemandResponsesList;
