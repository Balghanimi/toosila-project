import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './LinesComingSoon.module.css';

// Autocomplete suggestions (hints only, not restrictions)
const AREA_SUGGESTIONS = [
  'النجف',
  'الكوفة',
  'المناذرة',
  'الحيدرية',
  'العباسية',
  'الحنانة',
  'السعد',
  'الجديدة',
  'المشراق',
  'الغدير',
  'كربلاء',
  'بغداد',
  'البصرة',
  'الحلة',
  'الديوانية',
];

const DESTINATION_SUGGESTIONS = [
  'جامعة الكوفة',
  'جامعة بغداد',
  'جامعة كربلاء',
  'جامعة البصرة',
  'الجامعة التقنية الوسطى',
  'كلية الطب',
  'كلية الهندسة',
  'مستشفى الصدر',
  'مستشفى الحكيم',
  'وزارة التربية',
  'شركة نفط الجنوب',
];

const TIME_OPTIONS = ['6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM'];

/**
 * LinesComingSoon - Attractive coming soon page with interest registration
 */
const LinesComingSoon = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState('student');
  const [area, setArea] = useState('');
  const [destination, setDestination] = useState('');
  const [preferredTime, setPreferredTime] = useState('7:00 AM');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [interestCount, setInterestCount] = useState(0);

  // Autocomplete state
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [filteredDests, setFilteredDests] = useState([]);
  const areaRef = useRef(null);
  const destRef = useRef(null);

  // Pre-fill phone if user is logged in
  useEffect(() => {
    if (user?.phone) {
      setPhone(user.phone);
    }
  }, [user]);

  // Fetch interest count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await api.get('/lines/interest/count');
        setInterestCount(response.data.count || 0);
      } catch (err) {
        console.log('Could not fetch interest count');
      }
    };
    fetchCount();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (areaRef.current && !areaRef.current.contains(e.target)) {
        setShowAreaSuggestions(false);
      }
      if (destRef.current && !destRef.current.contains(e.target)) {
        setShowDestSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format phone number
  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 11);
  };

  const handlePhoneChange = (e) => {
    setPhone(formatPhone(e.target.value));
    setError('');
  };

  // Area autocomplete
  const handleAreaChange = (e) => {
    const value = e.target.value;
    setArea(value);
    setError('');

    if (value.length > 0) {
      const filtered = AREA_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredAreas(filtered);
      setShowAreaSuggestions(filtered.length > 0);
    } else {
      setFilteredAreas(AREA_SUGGESTIONS);
      setShowAreaSuggestions(true);
    }
  };

  const handleAreaFocus = () => {
    setFilteredAreas(
      area.length > 0
        ? AREA_SUGGESTIONS.filter((s) => s.toLowerCase().includes(area.toLowerCase()))
        : AREA_SUGGESTIONS
    );
    setShowAreaSuggestions(true);
  };

  const selectArea = (value) => {
    setArea(value);
    setShowAreaSuggestions(false);
  };

  // Destination autocomplete
  const handleDestChange = (e) => {
    const value = e.target.value;
    setDestination(value);
    setError('');

    if (value.length > 0) {
      const filtered = DESTINATION_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDests(filtered);
      setShowDestSuggestions(filtered.length > 0);
    } else {
      setFilteredDests(DESTINATION_SUGGESTIONS);
      setShowDestSuggestions(true);
    }
  };

  const handleDestFocus = () => {
    setFilteredDests(
      destination.length > 0
        ? DESTINATION_SUGGESTIONS.filter((s) => s.toLowerCase().includes(destination.toLowerCase()))
        : DESTINATION_SUGGESTIONS
    );
    setShowDestSuggestions(true);
  };

  const selectDest = (value) => {
    setDestination(value);
    setShowDestSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate phone
    if (!phone || phone.length < 10) {
      setError('يرجى إدخال رقم هاتف صحيح');
      return;
    }

    // Validate area
    if (!area.trim()) {
      setError('يرجى إدخال منطقة سكنك');
      return;
    }

    // Validate destination
    if (!destination.trim()) {
      setError('يرجى إدخال وجهتك');
      return;
    }

    setLoading(true);

    try {
      await api.post('/lines/interest', {
        phone,
        userType,
        area: area.trim(),
        destination: destination.trim(),
        preferredTime,
        userId: user?.id,
      });
      setSuccess(true);
      setInterestCount((prev) => prev + 1);
    } catch (err) {
      if (err.response?.status === 409) {
        setSuccess(true);
      } else {
        setError(err.response?.data?.message || 'حدث خطأ، يرجى المحاولة مرة أخرى');
      }
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: '💰', text: 'وفّر حتى 40% من تكلفة التنقل اليومي' },
    { icon: '🎓', text: 'خط ثابت يومي للجامعة أو العمل' },
    { icon: '👨‍✈️', text: 'سائق موثوق ومواعيد منتظمة' },
    { icon: '📅', text: 'اشتراك شهري بسعر مخفض' },
    { icon: '🛡️', text: 'ضمان المقعد يومياً' },
  ];

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroIcon}>🚌</div>
        <h1 className={styles.heroTitle}>خطوط الاشتراك اليومي</h1>
        <p className={styles.heroSubtitle}>قريباً في منطقتك!</p>
      </div>

      {/* Benefits Section */}
      <div className={styles.benefitsSection}>
        <h2 className={styles.sectionTitle}>ماذا ستحصل؟</h2>
        <div className={styles.benefitsList}>
          {benefits.map((benefit, index) => (
            <div key={index} className={styles.benefitItem}>
              <span className={styles.benefitIcon}>{benefit.icon}</span>
              <span className={styles.benefitText}>{benefit.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Form */}
      <div className={styles.formSection}>
        {!success ? (
          <>
            <h2 className={styles.sectionTitle}>سجّل في قائمة الانتظار</h2>
            <p className={styles.formDescription}>
              ساعدنا نعرف احتياجك وسنبلغك فور توفر خط في منطقتك
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* User Type Selection */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>أنا:</label>
                <div className={styles.userTypeSelector}>
                  <button
                    type="button"
                    className={`${styles.typeButton} ${userType === 'student' ? styles.typeActive : ''}`}
                    onClick={() => setUserType('student')}
                  >
                    <span>🎓</span>
                    <span>طالب</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.typeButton} ${userType === 'employee' ? styles.typeActive : ''}`}
                    onClick={() => setUserType('employee')}
                  >
                    <span>💼</span>
                    <span>موظف</span>
                  </button>
                </div>
              </div>

              {/* Phone Input */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>رقم الهاتف:</label>
                <div className={styles.phoneInputWrapper}>
                  <span className={styles.phonePrefix}>+964</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="07X XXXX XXXX"
                    className={styles.phoneInput}
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Area Input with Autocomplete */}
              <div className={styles.fieldGroup} ref={areaRef}>
                <label className={styles.fieldLabel}>منطقة سكنك:</label>
                <div className={styles.autocompleteWrapper}>
                  <input
                    type="text"
                    value={area}
                    onChange={handleAreaChange}
                    onFocus={handleAreaFocus}
                    placeholder="مثال: الكوفة، حي الأمير..."
                    className={styles.textInput}
                  />
                  {showAreaSuggestions && filteredAreas.length > 0 && (
                    <div className={styles.suggestionsList}>
                      {filteredAreas.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          className={styles.suggestionItem}
                          onClick={() => selectArea(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Destination Input with Autocomplete */}
              <div className={styles.fieldGroup} ref={destRef}>
                <label className={styles.fieldLabel}>وجهتك (جامعة، مدرسة، شركة...):</label>
                <div className={styles.autocompleteWrapper}>
                  <input
                    type="text"
                    value={destination}
                    onChange={handleDestChange}
                    onFocus={handleDestFocus}
                    placeholder="مثال: جامعة الكوفة، مستشفى الصدر..."
                    className={styles.textInput}
                  />
                  {showDestSuggestions && filteredDests.length > 0 && (
                    <div className={styles.suggestionsList}>
                      {filteredDests.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          className={styles.suggestionItem}
                          onClick={() => selectDest(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Preferred Time Dropdown */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>وقت الخروج المفضل:</label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className={styles.selectInput}
                >
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error Message */}
              {error && <div className={styles.errorMessage}>{error}</div>}

              {/* Submit Button */}
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? (
                  <span className={styles.loadingSpinner}></span>
                ) : (
                  <>
                    <span>🔔</span>
                    <span>سجلني في قائمة الانتظار</span>
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✅</div>
            <h3>تم التسجيل بنجاح!</h3>
            <p>
              سنبلغك فور توفر خط من {area} إلى {destination}
            </p>
          </div>
        )}
      </div>

      {/* Interest Counter */}
      {interestCount > 0 && (
        <div className={styles.counterSection}>
          <span className={styles.counterIcon}>👥</span>
          <span className={styles.counterText}>
            <strong>{interestCount.toLocaleString('ar-EG')}</strong> شخص ينتظرون هذه الميزة
          </span>
        </div>
      )}

      {/* Back Button */}
      <button className={styles.backButton} onClick={() => navigate('/')}>
        العودة للرئيسية
      </button>
    </div>
  );
};

export default LinesComingSoon;
