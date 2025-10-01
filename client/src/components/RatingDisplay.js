import React from 'react';
import { useRatings } from '../context/RatingContext';

const RatingDisplay = ({ userId, userType, showCount = true, size = 'medium' }) => {
  const { getUserAverageRating, getUserRatingCount } = useRatings();
  
  const rating = getUserAverageRating(userId);
  const count = getUserRatingCount(userId);

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#10b981'; // أخضر
    if (rating >= 3.5) return '#f59e0b'; // أصفر
    if (rating >= 2.5) return '#f97316'; // برتقالي
    return '#ef4444'; // أحمر
  };

  const getSizeStyles = (size) => {
    switch (size) {
      case 'small':
        return {
          fontSize: '12px',
          starSize: '14px',
          gap: '2px'
        };
      case 'large':
        return {
          fontSize: '16px',
          starSize: '20px',
          gap: '4px'
        };
      default: // medium
        return {
          fontSize: '14px',
          starSize: '16px',
          gap: '3px'
        };
    }
  };

  const styles = getSizeStyles(size);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <span key={i} style={{ color: '#fbbf24', fontSize: styles.starSize }}>
            ⭐
          </span>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <span key={i} style={{ color: '#fbbf24', fontSize: styles.starSize }}>
            ⭐
          </span>
        );
      } else {
        stars.push(
          <span key={i} style={{ color: '#d1d5db', fontSize: styles.starSize }}>
            ⭐
          </span>
        );
      }
    }
    return stars;
  };

  if (rating === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: styles.fontSize,
        color: '#9ca3af'
      }}>
        <span style={{ fontSize: styles.starSize }}>⭐</span>
        <span>لا توجد تقييمات</span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: styles.gap
    }}>
      {/* Stars */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1px'
      }}>
        {renderStars(rating)}
      </div>
      
      {/* Rating Number */}
      <span style={{
        fontSize: styles.fontSize,
        fontWeight: '600',
        color: getRatingColor(rating),
        marginLeft: '4px'
      }}>
        {rating.toFixed(1)}
      </span>
      
      {/* Count */}
      {showCount && (
        <span style={{
          fontSize: styles.fontSize,
          color: '#6b7280',
          marginLeft: '4px'
        }}>
          ({count})
        </span>
      )}
    </div>
  );
};

export default RatingDisplay;
