import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { demandsAPI, offersAPI, citiesAPI } from '../services/api';
import { formatLargeNumber, toEnglishNumber } from '../utils/formatters';
import SearchableCitySelect from '../components/UI/SearchableCitySelect';
import styles from './Home.module.css';

const Home = () => {
  const [mode, setMode] = useState('find');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('today');
  const [departureTime, setDepartureTime] = useState('');
  const [availableSeats, setAvailableSeats] = useState('1');
  const [pricePerSeat, setPricePerSeat] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [availableCities, setAvailableCities] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (submitError && (pickupLocation || dropLocation || selectedDate)) {
      setSubmitError('');
    }
  }, [pickupLocation, dropLocation, selectedDate, submitError]);

  // PERFORMANCE FIX: Cache cities data in localStorage with 24-hour TTL
  useEffect(() => {
    const fetchCities = async () => {
      try {
        // Check cache first
        const cached = localStorage.getItem('cached_cities');
        const cacheTime = localStorage.getItem('cached_cities_time');
        const now = Date.now();
        const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

        if (cached && cacheTime && now - parseInt(cacheTime) < CACHE_TTL) {
          // Use cached data
          setAvailableCities(JSON.parse(cached));
          return;
        }

        // Fetch fresh data
        const response = await citiesAPI.getAll();
        const cities = response.cities || [];
        setAvailableCities(cities);

        // Cache for next time
        localStorage.setItem('cached_cities', JSON.stringify(cities));
        localStorage.setItem('cached_cities_time', now.toString());
      } catch (error) {
        console.error('Error fetching cities:', error);
        // Try to use stale cache if available
        const cached = localStorage.getItem('cached_cities');
        if (cached) {
          setAvailableCities(JSON.parse(cached));
        } else {
          setAvailableCities([]);
        }
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    if (location.state?.mode) {
      setMode(location.state.mode);
      navigate(location.pathname, { replace: true, state: {} });
    }
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const timeString = now.toTimeString().slice(0, 5);
    setDepartureTime(timeString);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = async () => {
    let calculatedDate;
    if (selectedDate === 'today') {
      calculatedDate = new Date().toISOString().split('T')[0];
    } else if (selectedDate === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      calculatedDate = tomorrow.toISOString().split('T')[0];
    } else {
      calculatedDate = selectedDate;
    }

    if (mode === 'find') {
      const searchParams = {};
      if (pickupLocation) searchParams.fromCity = pickupLocation;
      if (dropLocation) searchParams.toCity = dropLocation;
      if (calculatedDate) searchParams.departureDate = calculatedDate;

      if (!pickupLocation && !dropLocation && !calculatedDate) {
        setSubmitError('يرجى اختيار نقطة الانطلاق أو نقطة الوصول أو التاريخ على الأقل للبحث');
        return;
      }

      if (currentUser && currentUser.isDriver) {
        navigate('/demands', { state: searchParams });
      } else {
        navigate('/offers', { state: searchParams });
      }
    } else if (mode === 'offer') {
      setIsSubmitting(true);
      setSubmitError('');

      try {
        await saveNewCityIfNeeded(pickupLocation);
        await saveNewCityIfNeeded(dropLocation);

        // Combine date and time into ISO format
        const departureDateTime = new Date(`${calculatedDate}T${departureTime}:00`);

        const offerData = {
          fromCity: pickupLocation.trim(),
          toCity: dropLocation.trim(),
          departureTime: departureDateTime.toISOString(),
          seats: parseInt(availableSeats),
          price: parseFloat(pricePerSeat),
        };

        await offersAPI.create(offerData);
        showSuccess('تم نشر العرض بنجاح! ✅');
        clearForm();
        setIsSubmitting(false);
        // Optional: navigate to offers page after short delay
        setTimeout(() => {
          navigate('/bookings', { state: { tab: 'myOffers' } });
        }, 1500);
      } catch (err) {
        console.error('Error creating offer:', err);
        showError('حدث خطأ أثناء نشر العرض. حاول مرة أخرى.');
        setSubmitError(err.message || 'حدث خطأ أثناء نشر العرض. حاول مرة أخرى.');
        setIsSubmitting(false);
      }
    } else if (mode === 'demand') {
      setIsSubmitting(true);
      setSubmitError('');

      try {
        await saveNewCityIfNeeded(pickupLocation);
        await saveNewCityIfNeeded(dropLocation);

        const earliestDateTime = new Date(`${calculatedDate}T${departureTime}:00`);
        const latestDateTime = new Date(earliestDateTime);
        latestDateTime.setDate(latestDateTime.getDate() + 2);

        const demandData = {
          fromCity: pickupLocation.trim(),
          toCity: dropLocation.trim(),
          earliestTime: earliestDateTime.toISOString(),
          latestTime: latestDateTime.toISOString(),
          seats: parseInt(availableSeats),
          budgetMax: parseFloat(pricePerSeat),
        };

        await demandsAPI.create(demandData);
        showSuccess('تم نشر الطلب بنجاح! ✅');
        clearForm();
        setIsSubmitting(false);
        // Navigate to bookings page after short delay
        setTimeout(() => {
          navigate('/bookings', { state: { tab: 'demands' } });
        }, 1500);
      } catch (err) {
        console.error('Error creating demand:', err);
        showError('حدث خطأ أثناء نشر الطلب. حاول مرة أخرى.');
        setSubmitError(err.message || 'حدث خطأ أثناء نشر الطلب. حاول مرة أخرى.');
        setIsSubmitting(false);
      }
    }
  };

  const swapLocations = () => {
    setIsSwapping(true);
    setTimeout(() => {
      setPickupLocation(dropLocation);
      setDropLocation(pickupLocation);
      setIsSwapping(false);
    }, 200);
  };

  const saveNewCityIfNeeded = async (cityName) => {
    if (!cityName || cityName.trim().length < 2) return;
    const trimmedCity = cityName.trim();
    const cityExists = availableCities.some(
      (city) => city.toLowerCase() === trimmedCity.toLowerCase()
    );
    if (!cityExists) {
      try {
        const response = await citiesAPI.add(trimmedCity);
        if (!response.alreadyExists) {
          setAvailableCities((prev) => [...prev, trimmedCity].sort());
        }
      } catch (error) {
        console.error('Error saving city:', error);
      }
    }
  };

  // Clear form after successful submission
  const clearForm = () => {
    setPickupLocation('');
    setDropLocation('');
    setSelectedDate('today');
    setAvailableSeats('1');
    setPricePerSeat('');
    // Reset departure time to one hour from now
    const now = new Date();
    now.setHours(now.getHours() + 1);
    setDepartureTime(now.toTimeString().slice(0, 5));
  };

  // Format the selected date in Arabic
  const getFormattedDate = () => {
    let dateObj;
    if (selectedDate === 'today') {
      dateObj = new Date();
    } else if (selectedDate === 'tomorrow') {
      dateObj = new Date();
      dateObj.setDate(dateObj.getDate() + 1);
    } else {
      dateObj = new Date(selectedDate);
    }

    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    return dateObj.toLocaleDateString('ar-IQ', options);
  };

  // Format time in Arabic (12-hour with صباحاً/مساءً)
  const getFormattedTime = () => {
    if (!departureTime) return '';

    const [hours, minutes] = departureTime.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'مساءً' : 'صباحاً';
    const hour12 = hour % 12 || 12;

    return `${toEnglishNumber(hour12)}:${toEnglishNumber(minutes)} ${period}`;
  };

  return (
    <div className={styles.homeContainer}>
      {/* Animated Background Blobs */}
      <div className={styles.backgroundBlob1} />
      <div className={styles.backgroundBlob2} />
      <div className={styles.backgroundBlob3} />

      {/* COMPACT HERO - Reduced whitespace */}
      <section
        className={styles.heroSection}
        style={{ minHeight: 'auto', paddingTop: '20px', paddingBottom: '16px' }}
      >
        <h1 className={styles.heroTitle} style={{ fontSize: '2rem', marginBottom: '8px', marginTop: '0' }}>
          توصيلة
        </h1>
        <p className={styles.heroSubtitle} style={{ fontSize: '0.95rem', marginBottom: '0' }}>
          رحلات مشتركة آمنة وموثوقة في جميع أنحاء العراق
        </p>
      </section>

      {/* Error Message */}
      {submitError && (
        <div className={styles.errorMessage} role="alert" aria-live="assertive">
          ⚠️ {submitError}
        </div>
      )}

      {/* MAIN SEARCH FORM - Clean card design */}
      <div
        className={styles.mainCard}
        style={{
          maxWidth: '500px',
          margin: '0 auto 1.5rem',
          padding: '24px',
        }}
      >
        {/* Mode Buttons - Inside Form */}
        <div
          className={styles.modeButtons}
          role="group"
          aria-label="خيارات البحث والنشر"
          style={{ marginBottom: '1.5rem' }}
        >
          {!currentUser?.isDriver && (
            <button
              onClick={() => setMode('demand')}
              className={`${styles.modeButton} ${mode === 'demand' ? styles.demand : ''}`}
              aria-label="طلب رحلة جديدة"
              aria-pressed={mode === 'demand'}
            >
              💺 طلب رحلة
            </button>
          )}
          {currentUser?.isDriver && (
            <button
              onClick={() => setMode('offer')}
              className={`${styles.modeButton} ${mode === 'offer' ? styles.offer : ''}`}
              aria-label="نشر عرض رحلة جديد"
              aria-pressed={mode === 'offer'}
            >
              🚗 نشر عرض
            </button>
          )}
          <button
            onClick={() => {
              console.log('🔍 ابحث عن رحلة button clicked - navigating to offers');
              if (currentUser && currentUser.isDriver) {
                navigate('/demands');
              } else {
                navigate('/offers');
              }
            }}
            className={`${styles.modeButton} ${mode === 'find' ? styles.find : ''}`}
            aria-label="البحث عن رحلة متاحة"
          >
            🔍 ابحث عن رحلة
          </button>
          <button
            onClick={() => {
              if (currentUser && currentUser.isDriver) {
                navigate('/demands');
              } else {
                navigate('/offers');
              }
            }}
            className={`${styles.modeButton} ${styles.browse}`}
            aria-label={currentUser?.isDriver ? 'تصفح طلبات الركاب' : 'تصفح عروض السائقين'}
          >
            📋 تصفح الرحلات
          </button>
        </div>
        {/* Location Container */}
        <div className={styles.locationContainer}>
          {/* Pickup Location */}
          <div className={styles.locationRow}>
            <div className={`${styles.locationMarker} ${styles.locationMarkerFrom}`} />
            <div className={styles.locationInputWrapper}>
              <SearchableCitySelect
                value={pickupLocation}
                onChange={setPickupLocation}
                cities={availableCities}
                placeholder="اختر مدينة الانطلاق..."
                showAllOption={false}
                id="pickup-city"
              />
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={swapLocations}
            className={styles.swapButton}
            style={{
              transform: isSwapping
                ? 'translateY(-50%) rotate(180deg) scale(1.1)'
                : 'translateY(-50%)',
            }}
            aria-label="تبديل نقطة الانطلاق والوصول"
          >
            ↕
          </button>

          {/* Drop Location */}
          <div className={styles.locationRow}>
            <div className={`${styles.locationMarker} ${styles.locationMarkerTo}`} />
            <div className={styles.locationInputWrapper}>
              <SearchableCitySelect
                value={dropLocation}
                onChange={setDropLocation}
                cities={availableCities}
                placeholder="اختر مدينة الوصول..."
                showAllOption={false}
                id="drop-city"
              />
            </div>
          </div>
        </div>

        {/* Date Time Section */}
        <div className={styles.dateTimeSection}>
          <div className={styles.dateTimeHeader}>
            <div className={styles.dateTimeLabel}>
              📅 {getFormattedDate()} - 🕐 {getFormattedTime()}
            </div>
            <button
              onClick={() => {
                const inputs = document.getElementById('datetime-inputs');
                if (inputs)
                  inputs.style.display = inputs.style.display === 'none' ? 'block' : 'none';
              }}
              className={styles.editButton}
              aria-label="تعديل التاريخ والوقت"
              aria-expanded="false"
            >
              ✏️ تعديل
            </button>
          </div>

          {/* Hidden datetime inputs */}
          <div id="datetime-inputs" style={{ display: 'none' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                  }}
                >
                  التاريخ
                </label>
                <input
                  type="date"
                  value={
                    selectedDate === 'today'
                      ? new Date().toISOString().split('T')[0]
                      : selectedDate === 'tomorrow'
                        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                        : selectedDate
                  }
                  onChange={(e) => {
                    const selectedDateValue = e.target.value;
                    const today = new Date().toISOString().split('T')[0];
                    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split('T')[0];
                    if (selectedDateValue === today) setSelectedDate('today');
                    else if (selectedDateValue === tomorrow) setSelectedDate('tomorrow');
                    else setSelectedDate(selectedDateValue);
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className={styles.input}
                  aria-label="تاريخ المغادرة"
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                  }}
                >
                  الوقت
                </label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className={styles.input}
                  aria-label="وقت المغادرة"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  const inputs = document.getElementById('datetime-inputs');
                  if (inputs) inputs.style.display = 'none';
                }}
                className={styles.editButton}
                aria-label="حفظ التاريخ والوقت"
              >
                حفظ
              </button>
            </div>
          </div>

          <div className={styles.dateButtons} role="group" aria-label="اختيار التاريخ">
            {['today', 'tomorrow'].map((option) => (
              <button
                key={option}
                onClick={() => setSelectedDate(option)}
                className={`${styles.dateButton} ${selectedDate === option ? styles.active : ''}`}
                aria-label={option === 'today' ? 'السفر اليوم' : 'السفر غداً'}
                aria-pressed={selectedDate === option}
              >
                {option === 'today' ? 'اليوم' : 'غداً'}
              </button>
            ))}
          </div>
        </div>

        {/* Seats and Price */}
        {mode !== 'find' && (
          <div className={styles.seatsPrice}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>المقاعد المتاحة</label>
              <select
                value={availableSeats}
                onChange={(e) => setAvailableSeats(e.target.value)}
                className={styles.select}
                aria-label="عدد المقاعد المتاحة"
              >
                <option value="1">1 مقعد</option>
                <option value="2">2 مقعد</option>
                <option value="3">3 مقعد</option>
                <option value="4">4 مقعد</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>السعر لكل مقعد (د.ع)</label>
              <input
                type="number"
                value={pricePerSeat}
                onChange={(e) => setPricePerSeat(e.target.value)}
                placeholder="أدخل السعر"
                min="1000"
                step="1000"
                className={styles.input}
                aria-label="السعر لكل مقعد بالدينار العراقي"
              />
            </div>
          </div>
        )}

        {/* Submit Button - LARGE AND PROMINENT */}
        <button
          onClick={handleNext}
          disabled={isSubmitting}
          className={styles.submitButton}
          style={{
            fontSize: '1.25rem',
            padding: '1rem 2rem',
            fontWeight: '700',
          }}
          aria-label={
            mode === 'find'
              ? 'البحث عن رحلات متاحة'
              : mode === 'offer'
                ? 'نشر عرض الرحلة'
                : 'نشر طلب الرحلة'
          }
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <span className={styles.loading}>
              <span className={styles.spinner} role="status" aria-label="جاري التحميل" />
              جاري المعالجة...
            </span>
          ) : (
            <>
              {mode === 'find' && '🔍 ابحث الآن'}
              {mode === 'offer' && '🚗 نشر العرض'}
              {mode === 'demand' && '💺 نشر الطلب'}
            </>
          )}
        </button>
      </div>

      {/* QUICK BENEFITS BADGES - Below Search */}
      <div
        className={styles.trustIndicators}
        style={{ margin: '2rem auto', justifyContent: 'center', maxWidth: '600px' }}
      >
        <div className={styles.trustItem}>
          <span className={styles.trustIcon}>✓</span>
          <span>آمن وموثوق</span>
        </div>
        <div className={styles.trustItem}>
          <span className={styles.trustIcon}>✓</span>
          <span>أسعار معقولة</span>
        </div>
        <div className={styles.trustItem}>
          <span className={styles.trustIcon}>✓</span>
          <span>تقييمات موثقة</span>
        </div>
      </div>

      {/* STATISTICS BAR - Below Benefits - WITH ENGLISH NUMERALS */}
      <div className={styles.statsBar} style={{ margin: '3rem auto', maxWidth: '800px' }}>
        <div className={styles.statItem}>
          <div className={styles.statNumber} style={{ direction: 'ltr', unicodeBidi: 'embed' }}>
            {toEnglishNumber('500+')}
          </div>
          <div className={styles.statLabel}>رحلة يومياً</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber} style={{ direction: 'ltr', unicodeBidi: 'embed' }}>
            {formatLargeNumber(10000)}+
          </div>
          <div className={styles.statLabel}>مستخدم نشط</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber} style={{ direction: 'ltr', unicodeBidi: 'embed' }}>
            {toEnglishNumber('98%')}
          </div>
          <div className={styles.statLabel}>تقييم إيجابي</div>
        </div>
      </div>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>لماذا تختار توصيلة؟</h2>
        <p className={styles.sectionSubtitle}>نوفر لك تجربة سفر آمنة ومريحة بأفضل الأسعار</p>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🛡️</span>
            <h3 className={styles.featureTitle}>آمن وموثوق</h3>
            <p className={styles.featureDescription}>
              جميع المستخدمين موثقون ومراجعين. نظام تقييم شامل لضمان أفضل تجربة.
            </p>
          </div>

          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>💰</span>
            <h3 className={styles.featureTitle}>أسعار معقولة</h3>
            <p className={styles.featureDescription}>
              وفر حتى{' '}
              <span style={{ direction: 'ltr', unicodeBidi: 'embed' }}>
                {toEnglishNumber('70%')}
              </span>{' '}
              من تكلفة النقل التقليدي مع رحلات مشتركة اقتصادية.
            </p>
          </div>

          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>⚡</span>
            <h3 className={styles.featureTitle}>حجز فوري</h3>
            <p className={styles.featureDescription}>
              ابحث واحجز رحلتك في ثوانٍ. تأكيد فوري ودعم على مدار الساعة.
            </p>
          </div>

          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🌟</span>
            <h3 className={styles.featureTitle}>تقييمات موثوقة</h3>
            <p className={styles.featureDescription}>
              اقرأ تقييمات المستخدمين الحقيقية واختر أفضل الرحلات والسائقين.
            </p>
          </div>

          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>💬</span>
            <h3 className={styles.featureTitle}>تواصل سهل</h3>
            <p className={styles.featureDescription}>
              نظام مراسلة مدمج للتواصل المباشر مع السائقين والركاب.
            </p>
          </div>

          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🗺️</span>
            <h3 className={styles.featureTitle}>تغطية شاملة</h3>
            <p className={styles.featureDescription}>
              رحلات إلى جميع المدن العراقية مع جدول واسع من الأوقات المتاحة.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorksSection}>
        <h2 className={styles.sectionTitle}>كيف يعمل توصيلة؟</h2>
        <p className={styles.sectionSubtitle}>ثلاث خطوات بسيطة للوصول إلى وجهتك</p>

        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>ابحث عن رحلة</h3>
            <p className={styles.stepDescription}>
              اختر مدينة الانطلاق والوجهة، وحدد التاريخ المناسب لك.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>احجز مقعدك</h3>
            <p className={styles.stepDescription}>
              اختر من بين العروض المتاحة واحجز مقعدك مع السائق المفضل.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>استمتع برحلتك</h3>
            <p className={styles.stepDescription}>تواصل مع السائق، وانطلق في رحلة آمنة ومريحة.</p>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <div className={styles.trustBanner}>
        <span className={styles.trustBannerIcon}>🛡️</span>
        <div className={styles.trustBannerContent}>
          <h3 className={styles.trustBannerTitle}>تعرف على المزيد حول سياسة الاسترداد</h3>
          <p className={styles.trustBannerText}>وكيف نحمي أموالك وبياناتك الشخصية</p>
        </div>
        {!isMobile && <span style={{ fontSize: '32px', opacity: 0.8 }}>←</span>}
      </div>
    </div>
  );
};

export default React.memo(Home);
