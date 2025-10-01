import React, { useState } from 'react';

const RatingModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  ratedUserName, 
  userType, // 'driver' أو 'passenger'
  tripInfo 
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    
    onSubmit({
      rating,
      comment: comment.trim(),
    });
    
    // إعادة تعيين النموذج
    setRating(0);
    setComment('');
    setHoveredStar(0);
    onClose();
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    setHoveredStar(0);
    onClose();
  };

  if (!isOpen) return null;

  const userTypeText = userType === 'driver' ? 'السائق' : 'الراكب';
  const userTypeEmoji = userType === 'driver' ? '🚗' : '👤';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '8px'
          }}>
            ⭐
          </div>
          <h2 style={{
            margin: '0 0 8px 0',
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937'
          }}>
            تقييم {userTypeText}
          </h2>
          <p style={{
            margin: '0',
            fontSize: '16px',
            color: '#6b7280'
          }}>
            {userTypeEmoji} {ratedUserName}
          </p>
        </div>

        {/* Trip Info */}
        {tripInfo && (
          <div style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '1px solid #0ea5e9'
          }}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#0369a1'
            }}>
              🗺️ تفاصيل الرحلة
            </h3>
            <p style={{
              margin: '0',
              fontSize: '14px',
              color: '#374151'
            }}>
              {tripInfo.from} → {tripInfo.to}
            </p>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              {tripInfo.date}
            </p>
          </div>
        )}

        {/* Rating Form */}
        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              textAlign: 'center'
            }}>
              كيف تقيم تجربتك؟
            </label>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '32px',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'transform 0.2s ease',
                    transform: hoveredStar >= star ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  <span style={{
                    color: (hoveredStar >= star || rating >= star) ? '#fbbf24' : '#d1d5db'
                  }}>
                    ⭐
                  </span>
                </button>
              ))}
            </div>
            <div style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              {rating === 0 && 'اختر تقييمك'}
              {rating === 1 && '😞 سيء جداً'}
              {rating === 2 && '😕 سيء'}
              {rating === 3 && '😐 متوسط'}
              {rating === 4 && '😊 جيد'}
              {rating === 5 && '😍 ممتاز'}
            </div>
          </div>

          {/* Comment */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151'
            }}>
              تعليق (اختياري)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="شاركنا تجربتك مع هذا السائق..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f3f4f6';
              }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={rating === 0}
              style={{
                background: rating === 0 ? '#d1d5db' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: rating === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: rating === 0 ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (rating > 0) {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 8px 15px -3px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (rating > 0) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              ⭐ إرسال التقييم
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
