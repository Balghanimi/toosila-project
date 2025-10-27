import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { demandsAPI, citiesAPI } from '../services/api';

const Home = () => {
  const [mode, setMode] = useState('find'); // 'find', 'offer', or 'demand'
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('today');
  const [departureTime, setDepartureTime] = useState('');
  const [availableSeats, setAvailableSeats] = useState('1');
  const [pricePerSeat, setPricePerSeat] = useState('');
  const [isAnimated, setIsAnimated] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropSuggestions, setShowDropSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [availableCities, setAvailableCities] = useState([]); // Cities from database
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  // Fetch cities from database on component mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await citiesAPI.getAll();
        setAvailableCities(response.cities || []);
      } catch (error) {
        console.error('Error fetching cities:', error);
        // Fallback to empty array if API fails
        setAvailableCities([]);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    setIsAnimated(true);

    // Check if we need to set mode from navigation state
    if (location.state?.mode) {
      setMode(location.state.mode);
      // Clear the state after using it
      navigate(location.pathname, { replace: true, state: {} });
    }

    // Set default time to current time + 1 hour
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const timeString = now.toTimeString().slice(0, 5);
    setDepartureTime(timeString);

    // Close suggestions when clicking outside
    const handleClickOutside = (e) => {
      if (!e.target.closest('input')) {
        setShowPickupSuggestions(false);
        setShowDropSuggestions(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = async () => {
    // Calculate date
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
      // إرسال معايير البحث
      const searchParams = {};
      if (pickupLocation) searchParams.fromCity = pickupLocation;
      if (dropLocation) searchParams.toCity = dropLocation;
      if (calculatedDate) searchParams.departureDate = calculatedDate;

      // إذا كان المستخدم سائق، اذهب إلى صفحة الطلبات (demands)
      // إذا كان راكب، اذهب إلى صفحة العروض (offers)
      if (currentUser && currentUser.isDriver) {
        navigate('/demands', { state: searchParams });
      } else {
        navigate('/offers', { state: searchParams });
      }
    } else if (mode === 'offer') {
      // تمرير بيانات النموذج إلى صفحة نشر العرض
      const offerData = {
        fromCity: pickupLocation,
        toCity: dropLocation,
        departureDate: calculatedDate,
        departureTime: departureTime,
        seats: availableSeats,
        price: pricePerSeat
      };

      navigate('/post-offer', { state: offerData });
    } else if (mode === 'demand') {
      // نشر الطلب مباشرة من الصفحة الرئيسية
      setIsSubmitting(true);
      setSubmitError('');

      try {
        // Save cities to database if they're new
        await saveNewCityIfNeeded(pickupLocation);
        await saveNewCityIfNeeded(dropLocation);

        // إنشاء تاريخ البداية والنهاية
        const earliestDateTime = new Date(`${calculatedDate}T${departureTime}:00`);

        // تاريخ النهاية: يومين بعد تاريخ البداية
        const latestDateTime = new Date(earliestDateTime);
        latestDateTime.setDate(latestDateTime.getDate() + 2);

        const demandData = {
          fromCity: pickupLocation.trim(),
          toCity: dropLocation.trim(),
          earliestTime: earliestDateTime.toISOString(),
          latestTime: latestDateTime.toISOString(),
          seats: parseInt(availableSeats),
          budgetMax: parseFloat(pricePerSeat)
        };

        console.log('Home - Creating demand:', demandData);
        const result = await demandsAPI.create(demandData);
        console.log('Home - Demand created successfully:', result);

        // التوجيه إلى صفحة الطلبات بعد النجاح
        navigate('/demands');
      } catch (err) {
        console.error('Error creating demand:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack
        });
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

  const handlePickupChange = (value) => {
    setPickupLocation(value);
    if (value.trim()) {
      const filtered = availableCities.filter(city =>
        city.includes(value.trim())
      );
      setPickupSuggestions(filtered);
      setShowPickupSuggestions(filtered.length > 0);
    } else {
      setShowPickupSuggestions(false);
    }
  };

  const handleDropChange = (value) => {
    setDropLocation(value);
    if (value.trim()) {
      const filtered = availableCities.filter(city =>
        city.includes(value.trim())
      );
      setDropSuggestions(filtered);
      setShowDropSuggestions(filtered.length > 0);
    } else {
      setShowDropSuggestions(false);
    }
  };

  const selectPickupCity = (city) => {
    setPickupLocation(city);
    setShowPickupSuggestions(false);
  };

  const selectDropCity = (city) => {
    setDropLocation(city);
    setShowDropSuggestions(false);
  };

  // Auto-save new city to database when user enters it
  const saveNewCityIfNeeded = async (cityName) => {
    if (!cityName || cityName.trim().length < 2) return;

    const trimmedCity = cityName.trim();

    // Check if city already exists in our list (case-insensitive)
    const cityExists = availableCities.some(
      city => city.toLowerCase() === trimmedCity.toLowerCase()
    );

    if (!cityExists) {
      try {
        const response = await citiesAPI.add(trimmedCity);
        if (!response.alreadyExists) {
          // Add to local state immediately for better UX
          setAvailableCities(prev => [...prev, trimmedCity].sort());
          console.log('تم إضافة مدينة جديدة:', trimmedCity);
        }
      } catch (error) {
        console.error('Error saving city:', error);
        // Don't show error to user - silent fail is OK for this feature
      }
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleDateString('ar-EG', { month: 'long' });
    return `${day} ${month}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      paddingBottom: '80px'
    }}>
      <div className="container" style={{
        paddingTop: 'var(--space-6)',
        transform: isAnimated ? 'translateY(0)' : 'translateY(20px)',
        opacity: isAnimated ? 1 : 0,
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--space-8)',
          paddingTop: 'var(--space-4)'
        }}>
          <h1 style={{
            fontSize: 'clamp(28px, 6vw, 40px)',
            fontWeight: '800',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-2)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            توصيلة
          </h1>
          <p style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--text-secondary)',
            margin: '0 auto var(--space-6) auto',
            maxWidth: '320px',
            lineHeight: '1.5'
          }}>
            رحلات مشتركة آمنة وموثوقة
          </p>
        </div>

        {/* Error Message */}
        {submitError && (
          <div style={{
            background: '#fee2e2',
            border: '2px solid #ef4444',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-4)',
            color: '#991b1b',
            fontFamily: '"Cairo", sans-serif',
            fontSize: 'var(--text-base)',
            textAlign: 'center',
            fontWeight: '600'
          }}>
            ⚠️ {submitError}
          </div>
        )}

        {/* Main Card */}
        <div style={{
          background: 'var(--surface-primary)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-light)',
          marginBottom: 'var(--space-6)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden'
        }}>

          {/* Background Pattern */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(45deg, var(--primary-light), transparent)',
            borderRadius: '50%',
            opacity: 0.1,
            zIndex: 0
          }} />

          {/* Mode Toggle - Smart based on user role */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: currentUser?.isDriver ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
            gap: 'var(--space-1)',
            marginBottom: 'var(--space-6)',
            background: 'var(--surface-secondary)',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-1)',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Show offer button first for drivers */}
            {currentUser?.isDriver && (
              <button
                onClick={() => setMode('offer')}
                style={{
                  padding: 'var(--space-3) var(--space-2)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  background: mode === 'offer' ? 'var(--primary)' : 'transparent',
                  color: mode === 'offer' ? 'var(--text-white)' : 'var(--text-secondary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  boxShadow: mode === 'offer' ? 'var(--shadow-md)' : 'none',
                  transform: mode === 'offer' ? 'scale(1.02)' : 'scale(1)',
                  fontFamily: '"Cairo", sans-serif'
                }}
              >
                🚗 {t('offerRide')}
              </button>
            )}

            {/* Show demand button first for passengers */}
            {!currentUser?.isDriver && (
              <button
                onClick={() => setMode('demand')}
                style={{
                  padding: 'var(--space-3) var(--space-2)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  background: mode === 'demand' ? '#3b82f6' : 'transparent',
                  color: mode === 'demand' ? 'white' : 'var(--text-secondary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  boxShadow: mode === 'demand' ? 'var(--shadow-md)' : 'none',
                  transform: mode === 'demand' ? 'scale(1.02)' : 'scale(1)',
                  fontFamily: '"Cairo", sans-serif'
                }}
              >
                💺 طلب رحلة
              </button>
            )}

            <button
              onClick={() => setMode('find')}
              style={{
                padding: 'var(--space-3) var(--space-2)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: mode === 'find' ? 'var(--surface-primary)' : 'transparent',
                color: mode === 'find' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'var(--transition)',
                boxShadow: mode === 'find' ? 'var(--shadow-sm)' : 'none',
                transform: mode === 'find' ? 'scale(1.02)' : 'scale(1)',
                fontFamily: '"Cairo", sans-serif'
              }}
            >
              🔍 {t('findRide')}
            </button>
          </div>

          {/* Location Inputs */}
          <div style={{
            position: 'relative',
            background: 'var(--surface-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--border-light)',
            marginBottom: 'var(--space-6)',
            overflow: 'visible',
            transition: 'var(--transition)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {/* Pickup Location */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: 'var(--space-4)',
              borderBottom: '1px solid var(--border-light)',
              position: 'relative'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'var(--primary)',
                marginLeft: 'var(--space-3)',
                flexShrink: 0,
                boxShadow: '0 0 0 3px rgba(52, 199, 89, 0.2)'
              }} />
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  placeholder={t('pickupLocation')}
                  value={pickupLocation}
                  onChange={(e) => handlePickupChange(e.target.value)}
                  onFocus={() => {
                    if (pickupLocation.trim()) {
                      const filtered = availableCities.filter(city => city.includes(pickupLocation.trim()));
                      if (filtered.length > 0) {
                        setPickupSuggestions(filtered);
                        setShowPickupSuggestions(true);
                      }
                    }
                  }}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: 'var(--text-base)',
                    color: 'var(--text-primary)',
                    background: 'transparent',
                    direction: 'rtl',
                    textAlign: 'start',
                    fontFamily: '"Cairo", sans-serif',
                    fontWeight: '500'
                  }}
                />
                {/* Suggestions Dropdown */}
                {showPickupSuggestions && pickupSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    left: 0,
                    background: 'var(--surface-primary)',
                    border: '2px solid var(--border-light)',
                    borderRadius: 'var(--radius)',
                    marginTop: 'var(--space-1)',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                    zIndex: 9999,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {pickupSuggestions.map((city, index) => (
                      <div
                        key={index}
                        onClick={() => selectPickupCity(city)}
                        style={{
                          padding: 'var(--space-3)',
                          cursor: 'pointer',
                          borderBottom: index < pickupSuggestions.length - 1 ? '1px solid var(--border-light)' : 'none',
                          direction: 'rtl',
                          fontFamily: '"Cairo", sans-serif',
                          transition: 'var(--transition)',
                          background: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'var(--surface-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                        }}
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Swap Button */}
            <div style={{
              position: 'absolute',
              left: 'var(--space-4)',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10
            }}>
              <button 
                onClick={swapLocations}
                style={{
                  background: 'var(--surface-primary)',
                  border: '2px solid var(--border-light)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  color: 'var(--primary)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'bold',
                  boxShadow: 'var(--shadow-md)',
                  transform: isSwapping ? 'rotate(180deg) scale(1.1)' : 'rotate(0deg) scale(1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = isSwapping ? 'rotate(180deg) scale(1.2)' : 'scale(1.1)';
                  e.target.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = isSwapping ? 'rotate(180deg) scale(1.1)' : 'scale(1)';
                  e.target.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                ↕
              </button>
            </div>

            {/* Drop Location */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: 'var(--space-4)',
              position: 'relative'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--text-muted)',
                marginLeft: 'var(--space-3)',
                flexShrink: 0
              }} />
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  placeholder={t('dropLocation')}
                  value={dropLocation}
                  onChange={(e) => handleDropChange(e.target.value)}
                  onFocus={() => {
                    if (dropLocation.trim()) {
                      const filtered = availableCities.filter(city => city.includes(dropLocation.trim()));
                      if (filtered.length > 0) {
                        setDropSuggestions(filtered);
                        setShowDropSuggestions(true);
                      }
                    }
                  }}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: 'var(--text-base)',
                    color: 'var(--text-primary)',
                    background: 'transparent',
                    direction: 'rtl',
                    textAlign: 'start',
                    fontFamily: '"Cairo", sans-serif',
                    fontWeight: '500'
                  }}
                />
                {/* Suggestions Dropdown */}
                {showDropSuggestions && dropSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    left: 0,
                    background: 'var(--surface-primary)',
                    border: '2px solid var(--border-light)',
                    borderRadius: 'var(--radius)',
                    marginTop: 'var(--space-1)',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                    zIndex: 9999,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {dropSuggestions.map((city, index) => (
                      <div
                        key={index}
                        onClick={() => selectDropCity(city)}
                        style={{
                          padding: 'var(--space-3)',
                          cursor: 'pointer',
                          borderBottom: index < dropSuggestions.length - 1 ? '1px solid var(--border-light)' : 'none',
                          direction: 'rtl',
                          fontFamily: '"Cairo", sans-serif',
                          transition: 'var(--transition)',
                          background: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'var(--surface-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                        }}
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div style={{ position: 'relative', marginBottom: 'var(--space-6)' }}>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-3)',
              textAlign: 'start',
              fontFamily: '"Cairo", sans-serif'
            }}>
              📅 تاريخ ووقت المغادرة
            </h3>

            <div style={{
              background: 'var(--surface-secondary)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              border: '1px solid var(--border-light)',
              marginBottom: 'var(--space-4)',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-3)'
              }}>
                <span style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  fontFamily: '"Cairo", sans-serif'
                }}>
                  {getCurrentDate()}، {departureTime}
                </span>
                <button
                  onClick={() => {
                    // Toggle between showing date/time inputs
                    const inputs = document.getElementById('datetime-inputs');
                    if (inputs) {
                      inputs.style.display = inputs.style.display === 'none' ? 'block' : 'none';
                    }
                  }}
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    padding: 'var(--space-2) var(--space-3)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    fontFamily: '"Cairo", sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--primary-dark)';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'var(--primary)';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  ✏️ تعديل
                </button>
              </div>

              {/* Hidden datetime inputs */}
              <div id="datetime-inputs" style={{ display: 'none', position: 'relative', zIndex: 100 }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-3)',
                  marginBottom: 'var(--space-3)'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--space-1)',
                      fontFamily: '"Cairo", sans-serif'
                    }}>
                      التاريخ
                    </label>
                    <input
                      type="date"
                      value={selectedDate === 'today' ? new Date().toISOString().split('T')[0] : 
                            selectedDate === 'tomorrow' ? new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0] : 
                            selectedDate}
                      onChange={(e) => {
                        const selectedDateValue = e.target.value;
                        const today = new Date().toISOString().split('T')[0];
                        const tomorrow = new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0];
                        
                        if (selectedDateValue === today) {
                          setSelectedDate('today');
                        } else if (selectedDateValue === tomorrow) {
                          setSelectedDate('tomorrow');
                        } else {
                          setSelectedDate(selectedDateValue);
                        }
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        padding: 'var(--space-2)',
                        border: '2px solid var(--border-light)',
                        borderRadius: 'var(--radius)',
                        fontSize: 'var(--text-sm)',
                        background: 'var(--surface-primary)',
                        color: 'var(--text-primary)',
                        fontFamily: '"Cairo", sans-serif',
                        transition: 'var(--transition)',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--space-1)',
                      fontFamily: '"Cairo", sans-serif'
                    }}>
                      الوقت
                    </label>
                    <input
                      type="time"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'var(--space-2)',
                        border: '2px solid var(--border-light)',
                        borderRadius: 'var(--radius)',
                        fontSize: 'var(--text-sm)',
                        background: 'var(--surface-primary)',
                        color: 'var(--text-primary)',
                        fontFamily: '"Cairo", sans-serif',
                        transition: 'var(--transition)',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: 'var(--space-2)',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={() => {
                      const inputs = document.getElementById('datetime-inputs');
                      if (inputs) inputs.style.display = 'none';
                    }}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      background: 'var(--surface-secondary)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                      fontFamily: '"Cairo", sans-serif'
                    }}
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => {
                      const inputs = document.getElementById('datetime-inputs');
                      if (inputs) inputs.style.display = 'none';
                    }}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                      fontFamily: '"Cairo", sans-serif'
                    }}
                  >
                    حفظ
                  </button>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: 'var(--space-3)'
            }}>
              {['today', 'tomorrow'].map((option) => (
                <button
                  key={option}
                  onClick={() => setSelectedDate(option)}
                  style={{
                    flex: 1,
                    padding: 'var(--space-3) var(--space-4)',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    background: selectedDate === option ? 'var(--primary)' : 'var(--surface-secondary)',
                    color: selectedDate === option ? 'var(--text-white)' : 'var(--text-secondary)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    fontFamily: '"Cairo", sans-serif',
                    boxShadow: selectedDate === option ? 'var(--shadow-md)' : 'none',
                    transform: selectedDate === option ? 'translateY(-1px)' : 'translateY(0)'
                  }}
                >
                  {option === 'today' ? 'اليوم' : 'غداً'}
                </button>
              ))}
            </div>
          </div>

          {/* Seats and Price - Only show for offer and demand modes */}
          {mode !== 'find' && (
            <div style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-6)'
            }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-2)',
                textAlign: 'start',
                fontFamily: '"Cairo", sans-serif'
              }}>
                المقاعد المتاحة
              </label>
              <select
                value={availableSeats}
                onChange={(e) => setAvailableSeats(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--text-base)',
                  background: 'var(--surface-primary)',
                  color: 'var(--text-primary)',
                  direction: 'rtl',
                  fontFamily: '"Cairo", sans-serif',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = 'var(--focus-ring)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-light)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="1">1 مقعد</option>
                <option value="2">2 مقعد</option>
                <option value="3">3 مقعد</option>
                <option value="4">4 مقعد</option>
              </select>
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-2)',
                textAlign: 'start',
                fontFamily: '"Cairo", sans-serif'
              }}>
                السعر لكل مقعد (د.ع)
              </label>
              <input
                type="number"
                value={pricePerSeat}
                onChange={(e) => setPricePerSeat(e.target.value)}
                placeholder="أدخل السعر"
                min="1000"
                step="1000"
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--text-base)',
                  background: 'var(--surface-primary)',
                  color: 'var(--text-primary)',
                  direction: 'rtl',
                  fontFamily: '"Cairo", sans-serif',
                  fontWeight: '500',
                  transition: 'var(--transition)',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = 'var(--focus-ring)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-light)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            </div>
          )}

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={
              isSubmitting ||
              !pickupLocation || !dropLocation ||
              (mode !== 'find' && (!departureTime || !pricePerSeat))
            }
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              padding: 'var(--space-4)',
              fontSize: 'var(--text-lg)',
              fontWeight: '700',
              marginBottom: 'var(--space-6)',
              background: (isSubmitting || !pickupLocation || !dropLocation || (mode !== 'find' && (!departureTime || !pricePerSeat)))
                ? 'var(--text-muted)'
                : mode === 'demand'
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              color: 'var(--text-white)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              cursor: (isSubmitting || !pickupLocation || !dropLocation || (mode !== 'find' && (!departureTime || !pricePerSeat))) ? 'not-allowed' : 'pointer',
              transition: 'var(--transition)',
              fontFamily: '"Cairo", sans-serif',
              boxShadow: (isSubmitting || !pickupLocation || !dropLocation || (mode !== 'find' && (!departureTime || !pricePerSeat))) ? 'none' : 'var(--shadow-lg)',
              transform: (isSubmitting || !pickupLocation || !dropLocation || (mode !== 'find' && (!departureTime || !pricePerSeat))) ? 'translateY(1px)' : 'translateY(0)',
              opacity: (isSubmitting || !pickupLocation || !dropLocation || (mode !== 'find' && (!departureTime || !pricePerSeat))) ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting && pickupLocation && dropLocation && (mode === 'find' || (departureTime && pricePerSeat))) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = 'var(--shadow-xl)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting && pickupLocation && dropLocation && (mode === 'find' || (departureTime && pricePerSeat))) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'var(--shadow-lg)';
              }
            }}
          >
            {isSubmitting ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                جاري النشر...
              </>
            ) : (
              mode === 'find' ? '🔍 البحث' : mode === 'offer' ? '🚗 التالي' : '💺 نشر الطلب'
            )}
          </button>

          {/* Browse Available Offers Button - For passengers in find mode */}
          {mode === 'find' && (
            <button
              onClick={() => navigate('/offers')}
              style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                padding: 'var(--space-4)',
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                marginBottom: 'var(--space-6)',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'var(--text-white)',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                transition: 'var(--transition)',
                fontFamily: '"Cairo", sans-serif',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              <span>🚗</span>
              <span>تصفح الرحلات المتاحة</span>
            </button>
          )}

          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>

        {/* Trust Section */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          color: 'var(--text-white)',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          
          {/* Background Pattern */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            left: '-20%',
            width: '120px',
            height: '120px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            zIndex: 0
          }} />
          
          <div style={{
            position: 'relative',
            zIndex: 1,
            fontSize: '3rem',
            flexShrink: 0
          }}>
            🛡️
          </div>
          
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'start' }}>
            <div style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '700',
              marginBottom: 'var(--space-1)',
              fontFamily: '"Cairo", sans-serif'
            }}>
              تعرف على المزيد حول سياسة الاسترداد
            </div>
            <div style={{
              fontSize: 'var(--text-base)',
              opacity: 0.9,
              fontFamily: '"Cairo", sans-serif',
              fontWeight: '500'
            }}>
              وكيف نحمي أموالك
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;