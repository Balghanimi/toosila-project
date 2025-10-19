import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

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
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  useEffect(() => {
    setIsAnimated(true);
    // Set default time to current time + 1 hour
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const timeString = now.toTimeString().slice(0, 5);
    setDepartureTime(timeString);
  }, []);

  const handleNext = () => {
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
      // إرسال معايير البحث إلى صفحة العروض
      const searchParams = {};
      if (pickupLocation) searchParams.fromCity = pickupLocation;
      if (dropLocation) searchParams.toCity = dropLocation;
      if (calculatedDate) searchParams.departureDate = calculatedDate;

      navigate('/offers', { state: searchParams });
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
      // تمرير بيانات النموذج إلى صفحة نشر الطلب
      const demandData = {
        fromCity: pickupLocation,
        toCity: dropLocation,
        departureDate: calculatedDate,
        departureTime: departureTime,
        seats: availableSeats,
        price: pricePerSeat
      };

      navigate('/post-demand', { state: demandData });
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

            {/* Show offer button only for drivers */}
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

            {/* Show demand button only for passengers */}
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
          </div>

          {/* Location Inputs */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            background: 'var(--surface-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--border-light)',
            marginBottom: 'var(--space-6)',
            overflow: 'hidden',
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
              <input
                type="text"
                placeholder={t('pickupLocation')}
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                style={{
                  flex: 1,
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
              padding: 'var(--space-4)'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--text-muted)',
                marginLeft: 'var(--space-3)',
                flexShrink: 0
              }} />
              <input
                type="text"
                placeholder={t('dropLocation')}
                value={dropLocation}
                onChange={(e) => setDropLocation(e.target.value)}
                style={{
                  flex: 1,
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
            </div>
          </div>

          {/* Date and Time */}
          <div style={{ position: 'relative', zIndex: 1, marginBottom: 'var(--space-6)' }}>
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
              marginBottom: 'var(--space-4)'
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
              <div id="datetime-inputs" style={{ display: 'none' }}>
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

          {/* Seats and Price */}
          <div style={{
            position: 'relative',
            zIndex: 1,
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
                السعر لكل مقعد
              </label>
              <select
                value={pricePerSeat}
                onChange={(e) => setPricePerSeat(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--text-base)',
                  background: 'var(--surface-primary)',
                  color: pricePerSeat ? 'var(--text-primary)' : 'var(--text-muted)',
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
                <option value="" disabled>اضغط للتحديد</option>
                <option value="10000">10,000 د.ع</option>
                <option value="15000">15,000 د.ع</option>
                <option value="20000">20,000 د.ع</option>
                <option value="25000">25,000 د.ع</option>
                <option value="30000">30,000 د.ع</option>
              </select>
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={!pickupLocation || !dropLocation}
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              padding: 'var(--space-4)',
              fontSize: 'var(--text-lg)',
              fontWeight: '700',
              marginBottom: 'var(--space-6)',
              background: (pickupLocation && dropLocation)
                ? mode === 'demand'
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
                : 'var(--text-muted)',
              color: 'var(--text-white)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              cursor: (pickupLocation && dropLocation) ? 'pointer' : 'not-allowed',
              transition: 'var(--transition)',
              fontFamily: '"Cairo", sans-serif',
              boxShadow: (pickupLocation && dropLocation) ? 'var(--shadow-lg)' : 'none',
              transform: (pickupLocation && dropLocation) ? 'translateY(0)' : 'translateY(1px)',
              opacity: (pickupLocation && dropLocation) ? 1 : 0.6
            }}
            onMouseEnter={(e) => {
              if (pickupLocation && dropLocation) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = 'var(--shadow-xl)';
              }
            }}
            onMouseLeave={(e) => {
              if (pickupLocation && dropLocation) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'var(--shadow-lg)';
              }
            }}
          >
            {mode === 'find' ? '🔍 البحث' : mode === 'offer' ? '🚗 التالي' : '💺 التالي'}
          </button>
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