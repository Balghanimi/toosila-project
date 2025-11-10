import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    offers: 'العروض',
    demands: 'الطلبات',
    messages: 'الرسائل',
    profile: 'الملف الشخصي',

    // Auth
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    phoneNumber: 'رقم الهاتف',
    name: 'الاسم',
    city: 'المدينة',
    birthYear: 'سنة الميلاد',
    userType: 'نوع المستخدم',
    driver: 'سائق',
    passenger: 'راكب',
    verifyPhone: 'تحقق من رقم الهاتف',
    enterOTP: 'أدخل رمز التحقق',
    resendOTP: 'إعادة إرسال الرمز',
    verify: 'تحقق',
    completeProfile: 'إكمال الملف الشخصي',

    // Home Page
    findRide: 'ابحث عن رحلة',
    offerRide: 'انشر رحلة',
    pickupLocation: 'موقع الانطلاق',
    dropLocation: 'موقع الوصول',
    departureTime: 'وقت المغادرة',
    availableSeats: 'المقاعد المتاحة',
    pricePerSeat: 'السعر لكل مقعد',
    search: 'بحث',
    next: 'التالي',

    // Post Offer
    postRide: 'نشر رحلة',
    fromLocation: 'من',
    toLocation: 'إلى',
    date: 'التاريخ',
    time: 'الوقت',
    seats: 'المقاعد',
    price: 'السعر',
    driverInfo: 'معلومات السائق',
    carInfo: 'معلومات السيارة',
    features: 'المميزات',
    notes: 'ملاحظات',
    publish: 'نشر',
    cancel: 'إلغاء',
    back: 'رجوع',

    // View Offers
    searchOffers: 'البحث في العروض',
    filterBy: 'فلترة حسب',
    governorate: 'المحافظة',
    area: 'المنطقة',
    maxPrice: 'أقصى سعر',
    clearFilters: 'مسح الفلاتر',
    noOffersFound: 'لم يتم العثور على عروض',
    bookRide: 'حجز الرحلة',
    contactDriver: 'تواصل مع السائق',

    // Common
    today: 'اليوم',
    tomorrow: 'غداً',
    edit: 'تعديل',
    save: 'حفظ',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    confirm: 'تأكيد',
    close: 'إغلاق',

    // DateTime
    selectDateTime: 'اختر التاريخ والوقت',
    suggestedTimes: 'أوقات مقترحة',
    currentSelection: 'التحديد الحالي',

    // Features
    ac: 'تكييف',
    wifi: 'واي فاي',
    music: 'موسيقى',
    smoking: 'تدخين',
    pets: 'حيوانات أليفة',
    luggage: 'أمتعة',

    // User Menu
    myProfile: 'ملفي الشخصي',
    myRides: 'رحلاتي',
    myRatings: 'تقييماتي',
    settings: 'الإعدادات',
    help: 'المساعدة',

    // Messages
    noMessages: 'لا توجد رسائل',
    sendMessage: 'إرسال رسالة',
    typeMessage: 'اكتب رسالة...',

    // Profile
    personalInfo: 'المعلومات الشخصية',
    rideHistory: 'تاريخ الرحلات',
    statistics: 'الإحصائيات',
    totalTrips: 'إجمالي الرحلات',
    completedTrips: 'الرحلات المكتملة',
    averageRating: 'متوسط التقييم',

    // Rating
    rateDriver: 'قيم السائق',
    ratePassenger: 'قيم الراكب',
    rating: 'التقييم',
    comment: 'تعليق',
    submitRating: 'إرسال التقييم',

    // Time formats
    am: 'ص',
    pm: 'م',

    // Days
    sunday: 'الأحد',
    monday: 'الإثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',

    // Months
    january: 'يناير',
    february: 'فبراير',
    march: 'مارس',
    april: 'أبريل',
    may: 'مايو',
    june: 'يونيو',
    july: 'يوليو',
    august: 'أغسطس',
    september: 'سبتمبر',
    october: 'أكتوبر',
    november: 'نوفمبر',
    december: 'ديسمبر',
  },

  en: {
    // Navigation
    home: 'Home',
    offers: 'Offers',
    demands: 'Demands',
    messages: 'Messages',
    profile: 'Profile',

    // Auth
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    phoneNumber: 'Phone Number',
    name: 'Name',
    city: 'City',
    birthYear: 'Birth Year',
    userType: 'User Type',
    driver: 'Driver',
    passenger: 'Passenger',
    verifyPhone: 'Verify Phone',
    enterOTP: 'Enter OTP Code',
    resendOTP: 'Resend OTP',
    verify: 'Verify',
    completeProfile: 'Complete Profile',

    // Home Page
    findRide: 'Find a Ride',
    offerRide: 'Offer a Ride',
    pickupLocation: 'Pickup Location',
    dropLocation: 'Drop Location',
    departureTime: 'Departure Time',
    availableSeats: 'Available Seats',
    pricePerSeat: 'Price per Seat',
    search: 'Search',
    next: 'Next',

    // Post Offer
    postRide: 'Post Ride',
    fromLocation: 'From',
    toLocation: 'To',
    date: 'Date',
    time: 'Time',
    seats: 'Seats',
    price: 'Price',
    driverInfo: 'Driver Info',
    carInfo: 'Car Info',
    features: 'Features',
    notes: 'Notes',
    publish: 'Publish',
    cancel: 'Cancel',
    back: 'Back',

    // View Offers
    searchOffers: 'Search Offers',
    filterBy: 'Filter by',
    governorate: 'Governorate',
    area: 'Area',
    maxPrice: 'Max Price',
    clearFilters: 'Clear Filters',
    noOffersFound: 'No offers found',
    bookRide: 'Book Ride',
    contactDriver: 'Contact Driver',

    // Common
    today: 'Today',
    tomorrow: 'Tomorrow',
    edit: 'Edit',
    save: 'Save',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    close: 'Close',

    // DateTime
    selectDateTime: 'Select Date & Time',
    suggestedTimes: 'Suggested Times',
    currentSelection: 'Current Selection',

    // Features
    ac: 'AC',
    wifi: 'WiFi',
    music: 'Music',
    smoking: 'Smoking',
    pets: 'Pets',
    luggage: 'Luggage',

    // User Menu
    myProfile: 'My Profile',
    myRides: 'My Rides',
    myRatings: 'My Ratings',
    settings: 'Settings',
    help: 'Help',

    // Messages
    noMessages: 'No Messages',
    sendMessage: 'Send Message',
    typeMessage: 'Type a message...',

    // Profile
    personalInfo: 'Personal Info',
    rideHistory: 'Ride History',
    statistics: 'Statistics',
    totalTrips: 'Total Trips',
    completedTrips: 'Completed Trips',
    averageRating: 'Average Rating',

    // Rating
    rateDriver: 'Rate Driver',
    ratePassenger: 'Rate Passenger',
    rating: 'Rating',
    comment: 'Comment',
    submitRating: 'Submit Rating',

    // Time formats
    am: 'AM',
    pm: 'PM',

    // Days
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',

    // Months
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get from localStorage or default to Arabic
    const savedLanguage = localStorage.getItem('app-language');
    return savedLanguage || 'ar';
  });

  const [direction, setDirection] = useState(language === 'ar' ? 'rtl' : 'ltr');

  useEffect(() => {
    // Update direction when language changes
    const newDirection = language === 'ar' ? 'rtl' : 'ltr';
    setDirection(newDirection);

    // Update document direction
    document.documentElement.dir = newDirection;
    document.documentElement.lang = language;

    // Save to localStorage
    localStorage.setItem('app-language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  const formatDate = (date, options = {}) => {
    const defaultOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    return new Date(date).toLocaleDateString(locale, { ...defaultOptions, ...options });
  };

  const formatTime = (time, options = {}) => {
    const defaultOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };

    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString(locale, {
      ...defaultOptions,
      ...options,
    });
  };

  const value = {
    language,
    direction,
    toggleLanguage,
    t,
    formatDate,
    formatTime,
    isRTL: direction === 'rtl',
    isArabic: language === 'ar',
    isEnglish: language === 'en',
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export default LanguageContext;
