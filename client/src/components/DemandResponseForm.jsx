import React, { useState } from 'react';
import { demandResponsesAPI } from '../services/api';

/**
 * مكون نموذج إرسال رد على طلب رحلة
 * للسائقين فقط
 *
 * @param {Object} props
 * @param {Object} props.demand - معلومات الطلب
 * @param {Function} props.onSuccess - دالة تُستدعى عند نجاح إرسال الرد
 * @param {Function} props.onCancel - دالة تُستدعى عند إلغاء النموذج
 */
const DemandResponseForm = ({ demand, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    offerPrice: demand.budgetMax || '',
    availableSeats: demand.seats || 1,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // معالجة تغيير الحقول
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // مسح الخطأ عند التعديل
  };

  // معالجة إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // التحقق من الحقول
    if (!formData.offerPrice || formData.offerPrice <= 0) {
      setError('الرجاء إدخال سعر صالح');
      return;
    }

    if (!formData.availableSeats || formData.availableSeats < demand.seats) {
      setError(`عدد المقاعد يجب أن يكون على الأقل ${demand.seats}`);
      return;
    }

    setIsSubmitting(true);

    try {
      await demandResponsesAPI.create({
        demandId: demand.id,
        offerPrice: parseFloat(formData.offerPrice),
        availableSeats: parseInt(formData.availableSeats),
        message: formData.message
      });

      // استدعاء دالة النجاح
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error creating response:', err);
      setError(err.message || 'حدث خطأ أثناء إرسال العرض');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      background: 'var(--surface-primary)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-6)',
      boxShadow: 'var(--shadow-lg)',
      border: '1px solid var(--border-light)'
    }}>
      {/* العنوان */}
      <h3 style={{
        fontSize: 'var(--text-xl)',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-4)',
        fontFamily: '"Cairo", sans-serif',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)'
      }}>
        <span style={{ fontSize: '1.5rem' }}>💼</span>
        إرسال عرض للراكب
      </h3>

      {/* معلومات الطلب */}
      <div style={{
        background: 'var(--surface-secondary)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-4)',
        marginBottom: 'var(--space-4)',
        fontFamily: '"Cairo", sans-serif'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 'var(--space-3)',
          fontSize: 'var(--text-sm)'
        }}>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>المسار:</span>
            <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginTop: 'var(--space-1)' }}>
              {demand.fromCity} ← {demand.toCity}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>المقاعد المطلوبة:</span>
            <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginTop: 'var(--space-1)' }}>
              {demand.seats} مقعد/مقاعد
            </div>
          </div>
          {demand.budgetMax && (
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>الميزانية القصوى:</span>
              <div style={{ fontWeight: '600', color: 'var(--primary)', marginTop: 'var(--space-1)' }}>
                {Number(demand.budgetMax).toLocaleString()} د.ع
              </div>
            </div>
          )}
        </div>
      </div>

      {/* النموذج */}
      <form onSubmit={handleSubmit}>
        {/* السعر المقترح */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-2)',
            fontFamily: '"Cairo", sans-serif'
          }}>
            💰 السعر المقترح (دينار عراقي)
            <span style={{ color: 'var(--error)', marginRight: 'var(--space-1)' }}>*</span>
          </label>
          <input
            type="number"
            name="offerPrice"
            value={formData.offerPrice}
            onChange={handleChange}
            min="0"
            step="1000"
            required
            placeholder="مثال: 25000"
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              border: '2px solid var(--border-light)',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--text-base)',
              fontFamily: '"Cairo", sans-serif',
              transition: 'var(--transition)',
              textAlign: 'center',
              direction: 'ltr'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
          />
          {demand.budgetMax && formData.offerPrice > demand.budgetMax && (
            <div style={{
              fontSize: 'var(--text-sm)',
              color: '#ff9800',
              marginTop: 'var(--space-2)',
              fontFamily: '"Cairo", sans-serif'
            }}>
              ⚠️ سعرك أعلى من الميزانية القصوى ({Number(demand.budgetMax).toLocaleString()} د.ع)
            </div>
          )}
        </div>

        {/* عدد المقاعد المتاحة */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-2)',
            fontFamily: '"Cairo", sans-serif'
          }}>
            💺 عدد المقاعد المتاحة
            <span style={{ color: 'var(--error)', marginRight: 'var(--space-1)' }}>*</span>
          </label>
          <input
            type="number"
            name="availableSeats"
            value={formData.availableSeats}
            onChange={handleChange}
            min={demand.seats}
            max="7"
            required
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              border: '2px solid var(--border-light)',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--text-base)',
              fontFamily: '"Cairo", sans-serif',
              transition: 'var(--transition)',
              textAlign: 'center',
              direction: 'ltr'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
          />
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            marginTop: 'var(--space-2)',
            fontFamily: '"Cairo", sans-serif'
          }}>
            الحد الأدنى: {demand.seats} مقعد/مقاعد
          </div>
        </div>

        {/* رسالة اختيارية */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-2)',
            fontFamily: '"Cairo", sans-serif'
          }}>
            💬 رسالة للراكب (اختياري)
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="3"
            maxLength="500"
            placeholder="مثال: مرحباً، أنا متاح في الوقت المحدد ولدي مركبة مريحة..."
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              border: '2px solid var(--border-light)',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--text-base)',
              fontFamily: '"Cairo", sans-serif',
              resize: 'vertical',
              transition: 'var(--transition)',
              textAlign: 'center'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
          />
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            marginTop: 'var(--space-2)',
            fontFamily: '"Cairo", sans-serif',
            textAlign: 'left'
          }}>
            {formData.message.length}/500
          </div>
        </div>

        {/* رسالة خطأ */}
        {error && (
          <div style={{
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
            gap: 'var(--space-2)'
          }}>
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* أزرار الإجراءات */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-5)'
        }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              flex: 1,
              padding: 'var(--space-3)',
              background: isSubmitting
                ? 'var(--text-muted)'
                : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--text-base)',
              fontWeight: '700',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontFamily: '"Cairo", sans-serif',
              boxShadow: isSubmitting ? 'none' : 'var(--shadow-md)',
              transition: 'var(--transition)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)'
            }}
          >
            {isSubmitting ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                جاري الإرسال...
              </>
            ) : (
              <>
                <span>✅</span>
                إرسال العرض
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            style={{
              flex: 1,
              padding: 'var(--space-3)',
              background: 'var(--surface-secondary)',
              color: 'var(--text-primary)',
              border: '2px solid var(--border-light)',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--text-base)',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontFamily: '"Cairo", sans-serif',
              transition: 'var(--transition)'
            }}
            onMouseEnter={(e) => !isSubmitting && (e.target.style.borderColor = 'var(--text-secondary)')}
            onMouseLeave={(e) => !isSubmitting && (e.target.style.borderColor = 'var(--border-light)')}
          >
            إلغاء
          </button>
        </div>
      </form>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DemandResponseForm;
