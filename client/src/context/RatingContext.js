import React, { createContext, useContext, useState, useEffect } from 'react';

const RatingContext = createContext();

export const useRatings = () => {
  const context = useContext(RatingContext);
  if (!context) {
    throw new Error('useRatings must be used within a RatingProvider');
  }
  return context;
};

export const RatingProvider = ({ children }) => {
  const [ratings, setRatings] = useState({});

  // تحميل التقييمات من localStorage عند بدء التطبيق
  useEffect(() => {
    const savedRatings = localStorage.getItem('ratings');
    if (savedRatings) {
      try {
        setRatings(JSON.parse(savedRatings));
      } catch (error) {
        console.error('Error loading ratings:', error);
      }
    }
  }, []);

  // حفظ التقييمات في localStorage عند التغيير
  useEffect(() => {
    localStorage.setItem('ratings', JSON.stringify(ratings));
  }, [ratings]);

  // إضافة تقييم جديد
  const addRating = (ratingData) => {
    const { tripId, ratedUserId, raterUserId, rating, comment, userType } = ratingData;

    const newRating = {
      id: `${tripId}_${ratedUserId}_${raterUserId}`,
      tripId,
      ratedUserId,
      raterUserId,
      rating, // من 1 إلى 5
      comment,
      userType, // 'driver' أو 'passenger'
      timestamp: new Date().toISOString(),
    };

    setRatings((prev) => ({
      ...prev,
      [newRating.id]: newRating,
    }));

    return newRating;
  };

  // الحصول على تقييمات مستخدم معين
  const getUserRatings = (userId) => {
    return Object.values(ratings).filter((rating) => rating.ratedUserId === userId);
  };

  // حساب متوسط التقييم لمستخدم معين
  const getUserAverageRating = (userId) => {
    const userRatings = getUserRatings(userId);
    if (userRatings.length === 0) return 0;

    const totalRating = userRatings.reduce((sum, rating) => sum + rating.rating, 0);
    return Math.round((totalRating / userRatings.length) * 10) / 10; // تقريب لرقم عشري واحد
  };

  // الحصول على عدد التقييمات لمستخدم معين
  const getUserRatingCount = (userId) => {
    return getUserRatings(userId).length;
  };

  // التحقق من وجود تقييم بين مستخدمين معينين لرحلة معينة
  const hasRated = (tripId, ratedUserId, raterUserId) => {
    const ratingId = `${tripId}_${ratedUserId}_${raterUserId}`;
    return ratings[ratingId] !== undefined;
  };

  // حذف تقييم
  const removeRating = (ratingId) => {
    setRatings((prev) => {
      const newRatings = { ...prev };
      delete newRatings[ratingId];
      return newRatings;
    });
  };

  // مسح جميع التقييمات
  const clearAllRatings = () => {
    setRatings({});
  };

  const value = {
    ratings,
    addRating,
    getUserRatings,
    getUserAverageRating,
    getUserRatingCount,
    hasRated,
    removeRating,
    clearAllRatings,
  };

  return <RatingContext.Provider value={value}>{children}</RatingContext.Provider>;
};
