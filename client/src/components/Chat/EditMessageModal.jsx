import React, { useState, useRef, useEffect } from 'react';
import { X, Check } from 'lucide-react';

/**
 * Modal for editing a message
 */
const EditMessageModal = ({ message, onSave, onCancel, isLoading }) => {
  const [content, setContent] = useState(message?.content || '');
  const textareaRef = useRef(null);

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(content.length, content.length);
    }
  }, [content.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim() && content.trim() !== message.content) {
      onSave(content.trim());
    }
  };

  const hasChanges = content.trim() !== message?.content;
  const isValid = content.trim().length >= 2 && content.trim().length <= 1000;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
        onClick={onCancel}
      >
        {/* Modal */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '400px',
            direction: 'rtl',
            animation: 'slideUp 0.2s ease-out',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>تعديل الرسالة</h3>
            <button
              onClick={onCancel}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} color="#6b7280" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit}>
            <div style={{ padding: '20px' }}>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="اكتب رسالتك..."
                maxLength={1000}
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  direction: 'rtl',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#6b7280',
                }}
              >
                <span>{content.length} / 1000</span>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                padding: '16px 20px',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <button
                type="button"
                onClick={onCancel}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  background: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isLoading || !hasChanges || !isValid}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderRadius: '12px',
                  background: hasChanges && isValid ? '#10b981' : '#e5e7eb',
                  color: hasChanges && isValid ? 'white' : '#9ca3af',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: hasChanges && isValid ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isLoading ? (
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                ) : (
                  <>
                    <Check size={18} />
                    حفظ
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default EditMessageModal;
