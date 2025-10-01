import React, { useMemo, useState, useEffect } from 'react';
import { useOffers } from '../../context/OffersContext';
import { useRatings } from '../../context/RatingContext';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../context/MessagesContext';
import { useBookings } from '../../context/BookingContext';
import RatingModal from '../../components/RatingModal';
import RatingDisplay from '../../components/RatingDisplay';
import { ListSkeleton, EmptyOffersState } from '../../components/Skeleton';
import AuthModal from '../../components/Auth/AuthModal';
import ChatModal from '../../components/Chat/ChatModal';
import BookingModal from '../../components/BookingModal';
import DateTimeSelector from '../../components/DateTimeSelector';

export default function ViewOffers() {
  const { offers, clearOffers } = useOffers();
  const { addRating } = useRatings();
  const { user, isAuthenticated } = useAuth();
  const { getUnreadCount } = useMessages();
  const { getUserBookings } = useBookings();
  const [gov, setGov] = useState('');
  const [area, setArea] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerSeats, setPassengerSeats] = useState('1');
  const [errors, setErrors] = useState({});
  const [showChat, setShowChat] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingOffer, setRatingOffer] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedChatOffer, setSelectedChatOffer] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBookingOffer, setSelectedBookingOffer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    setIsAnimated(true);
  }, []);

  // Mock data for demonstration
  const mockOffers = [
    {
      id: 1,
      driverName: 'أحمد علي',
      driverRating: 4.8,
      pickupLocation: 'الكرادة',
      dropLocation: 'الجادرية',
      date: 'اليوم',
      time: '08:00 ص',
      price: '15,000',
      availableSeats: 3,
      carModel: 'كيا سيراتو 2020',
      carColor: 'أبيض',
      isVerified: true,
      completedTrips: 45,
      features: ['تكييف', 'موسيقى', 'واي فاي']
    },
    {
      id: 2,
      driverName: 'سارة محمد',
      driverRating: 4.9,
      pickupLocation: 'الجادرية',
      dropLocation: 'الكاظمية',
      date: 'غداً',
      time: '07:30 ص',
      price: '20,000',
      availableSeats: 2,
      carModel: 'تويوتا كورولا 2021',
      carColor: 'فضي',
      isVerified: true,
      completedTrips: 67,
      features: ['تكييف', 'أمان عالي']
    },
    {
      id: 3,
      driverName: 'عمار حسن',
      driverRating: 4.7,
      pickupLocation: 'السيدية',
      dropLocation: 'الكرادة',
      date: 'اليوم',
      time: '06:00 م',
      price: '12,000',
      availableSeats: 4,
      carModel: 'هيونداي إلنترا 2019',
      carColor: 'أسود',
      isVerified: false,
      completedTrips: 23,
      features: ['تكييف']
    }
  ];

  const handleBookRide = (offer) => {
    setSelectedOffer(offer);
    setShowModal(true);
  };

  const handleSendMessage = (offer) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    // Create a mock driver ID for the offer
    const driverId = `driver_${offer.id}`;
    
    setSelectedChatOffer({
      tripId: `trip_${offer.id}`,
      otherUserId: driverId,
      otherUserName: offer.driverName,
      tripInfo: {
        from: offer.pickupLocation,
        to: offer.dropLocation,
        date: offer.date,
        time: offer.time
      }
    });
    setShowChatModal(true);
  };

  const handleBooking = (offer) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    setSelectedBookingOffer(offer);
    setShowBookingModal(true);
  };

  const handleBookingCreated = (booking) => {
    console.log('Booking created:', booking);
    // You can add additional logic here, like showing a success message
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      paddingBottom: '100px'
    }}>
      <div className="container" style={{
        paddingTop: 'var(--space-6)',
        transform: isAnimated ? 'translateY(0)' : 'translateY(20px)',
        opacity: isAnimated ? 1 : 0,
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--space-6)'
        }}>
          <h1 style={{
            fontSize: 'var(--text-3xl)',
            fontWeight: '800',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-2)',
            fontFamily: '"Cairo", sans-serif'
          }}>
            🔍 البحث عن رحلة
          </h1>
        <p style={{ 
            color: 'var(--text-secondary)',
            fontSize: 'var(--text-lg)',
            fontFamily: '"Cairo", sans-serif',
            fontWeight: '500'
          }}>
            اعثر على الرحلة المناسبة لك
        </p>
      </div>

        {/* Filter Section */}
      <div style={{ 
          background: 'var(--surface-primary)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-light)',
          marginBottom: 'var(--space-6)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-4)'
          }}>
          <div>
            <label style={{ 
              display: 'block', 
                fontSize: 'var(--text-sm)',
              fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-2)',
                fontFamily: '"Cairo", sans-serif'
            }}>
              المحافظة
            </label>
            <select 
              value={gov} 
                onChange={(e) => setGov(e.target.value)}
              style={{
                width: '100%',
                  padding: 'var(--space-3)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--text-base)',
                  background: 'var(--surface-primary)',
                  color: 'var(--text-primary)',
                  fontFamily: '"Cairo", sans-serif',
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
                <option value="">جميع المحافظات</option>
                <option value="بغداد">بغداد</option>
                <option value="البصرة">البصرة</option>
                <option value="النجف">النجف</option>
                <option value="كربلاء">كربلاء</option>
            </select>
          </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-2)',
                fontFamily: '"Cairo", sans-serif'
              }}>
                التاريخ والوقت
              </label>
              <div style={{
                background: 'var(--surface-primary)',
                borderRadius: 'var(--radius)',
                padding: 'var(--space-2)',
                border: '2px solid var(--border-light)',
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
              onClick={() => {
                // Show DateTimeSelector modal
                const modal = document.createElement('div');
                modal.style.cssText = `
                  position: fixed;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: rgba(0,0,0,0.5);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  z-index: 1000;
                  padding: 20px;
                `;
                
                const content = document.createElement('div');
                content.style.cssText = `
                  background: white;
                  border-radius: 12px;
                  padding: 20px;
                  max-width: 400px;
                  width: 100%;
                `;
                
                const closeBtn = document.createElement('button');
                closeBtn.innerHTML = '×';
                closeBtn.style.cssText = `
                  position: absolute;
                  top: 10px;
                  right: 10px;
                  background: none;
                  border: none;
                  font-size: 20px;
                  cursor: pointer;
                `;
                
                closeBtn.onclick = () => document.body.removeChild(modal);
                modal.onclick = (e) => {
                  if (e.target === modal) document.body.removeChild(modal);
                };
                
                content.appendChild(closeBtn);
                modal.appendChild(content);
                document.body.appendChild(modal);
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'var(--border-light)';
              }}
              >
                <span style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  fontFamily: '"Cairo", sans-serif'
                }}>
                  {date ? `${date} - ${time}` : 'اختر التاريخ والوقت'}
                </span>
              </div>
            </div>

          <div>
            <label style={{ 
              display: 'block', 
                fontSize: 'var(--text-sm)',
              fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-2)',
                fontFamily: '"Cairo", sans-serif'
            }}>
                الحد الأقصى للسعر
            </label>
              <select
              value={maxPrice} 
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{
                width: '100%',
                  padding: 'var(--space-3)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--text-base)',
                  background: 'var(--surface-primary)',
                  color: 'var(--text-primary)',
                  fontFamily: '"Cairo", sans-serif',
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
                <option value="">أي سعر</option>
                <option value="10000">10,000 د.ع</option>
                <option value="15000">15,000 د.ع</option>
                <option value="20000">20,000 د.ع</option>
                <option value="25000">25,000 د.ع</option>
              </select>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'center'
          }}>
          <button 
              onClick={() => {
                setGov('');
                setArea('');
                setDate('');
                setTime('');
                setMaxPrice('');
              }}
            style={{
                padding: 'var(--space-3) var(--space-6)',
                border: '2px solid var(--border-light)',
                borderRadius: 'var(--radius)',
                background: 'var(--surface-primary)',
                color: 'var(--text-secondary)',
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'var(--transition)',
                fontFamily: '"Cairo", sans-serif'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'var(--text-secondary)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'var(--border-light)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              مسح الفلاتر
          </button>
        </div>
      </div>

        {/* Results Summary */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--space-6)',
          padding: 'var(--space-4)',
          background: 'var(--surface-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)'
        }}>
          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--text-secondary)',
            margin: 0,
            fontFamily: '"Cairo", sans-serif',
            fontWeight: '500'
          }}>
            🚗 تم العثور على <strong style={{ color: 'var(--primary)' }}>{mockOffers.length}</strong> رحلة متاحة
          </p>
        </div>

      {/* Offers List */}
        <div style={{
          display: 'grid',
          gap: 'var(--space-6)'
        }}>
          {mockOffers.map((offer, index) => (
            <div
              key={offer.id}
              style={{
                background: 'var(--surface-primary)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-6)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border-light)',
                transition: 'var(--transition)',
                position: 'relative',
                overflow: 'hidden',
                animationDelay: `${index * 0.1}s`
              }}
              onMouseEnter={(e) => { 
                e.target.style.transform = 'translateY(-4px)';
                e.target.style.boxShadow = 'var(--shadow-xl)';
              }}
              onMouseLeave={(e) => { 
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              {/* Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-4)',
                paddingBottom: 'var(--space-4)',
                borderBottom: '1px solid var(--border-light)'
              }}>
                <div style={{ 
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 'var(--text-xl)',
                  fontWeight: '700',
                  fontFamily: '"Cairo", sans-serif',
                  boxShadow: 'var(--shadow-md)'
                }}>
                  {offer.driverName.charAt(0)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                    <h3 style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: '700',
                      color: 'var(--text-primary)',
                      margin: 0,
                      fontFamily: '"Cairo", sans-serif'
                    }}>
                      {offer.driverName}
                    </h3>
                    {offer.isVerified && (
                      <div style={{
                        background: 'var(--primary)',
                    color: 'white',
                        fontSize: 'var(--text-xs)',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-full)',
                    fontWeight: '600'
                  }}>
                        ✓ موثق
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                      <span style={{ color: 'var(--warning)' }}>⭐</span>
                      <span style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: '600',
                        color: 'var(--text-primary)'
                      }}>
                        {offer.driverRating}
                  </span>
                    </div>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      fontFamily: '"Cairo", sans-serif'
                    }}>
                      {offer.completedTrips} رحلة مكتملة
                    </div>
                  </div>
                </div>
                
                <div style={{
                  textAlign: 'end'
                }}>
                  <div style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: '800',
                    color: 'var(--primary)',
                    fontFamily: '"Cairo", sans-serif'
                  }}>
                    {offer.price} د.ع
                  </div>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    fontFamily: '"Cairo", sans-serif'
                  }}>
                    للشخص الواحد
                  </div>
                </div>
              </div>

              {/* Route Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
                padding: 'var(--space-4)',
                background: 'var(--surface-secondary)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-1)',
                    fontFamily: '"Cairo", sans-serif'
                  }}>
                    من
                  </div>
                  <div style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    fontFamily: '"Cairo", sans-serif'
                  }}>
                    {offer.pickupLocation}
                  </div>
                </div>

                <div style={{
                  width: '40px',
                  height: '2px',
                  background: 'var(--primary)',
                  position: 'relative',
                  borderRadius: '1px'
                }}>
                  <div style={{
                    position: 'absolute',
                    right: '-6px',
                    top: '-4px',
                    width: '10px',
                    height: '10px',
                    borderTop: '2px solid var(--primary)',
                    borderRight: '2px solid var(--primary)',
                    transform: 'rotate(45deg)'
                  }} />
                </div>

                <div style={{ flex: 1, textAlign: 'end' }}>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-1)',
                    fontFamily: '"Cairo", sans-serif'
                  }}>
                    إلى
                  </div>
                  <div style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    fontFamily: '"Cairo", sans-serif'
                  }}>
                    {offer.dropLocation}
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-5)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: 'var(--text-2xl)',
                    marginBottom: 'var(--space-1)'
                  }}>📅</div>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-1)',
                    fontFamily: '"Cairo", sans-serif'
                  }}>
                    التاريخ
                    </div>
                  <div style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    fontFamily: '"Cairo", sans-serif'
                  }}>
                    {offer.date}
                      </div>
                    </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: 'var(--text-2xl)',
                    marginBottom: 'var(--space-1)'
                  }}>⏰</div>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-1)',
                    fontFamily: '"Cairo", sans-serif'
                  }}>
                    الوقت
                  </div>
                  <div style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    fontFamily: '"Cairo", sans-serif'
                  }}>
                    {offer.time}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: 'var(--text-2xl)',
                    marginBottom: 'var(--space-1)'
                  }}>👥</div>
              <div style={{ 
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-1)',
                    fontFamily: '"Cairo", sans-serif'
                  }}>
                    المقاعد
                  </div>
                <div style={{ 
                    fontSize: 'var(--text-base)',
                    fontWeight: '600',
                    color: 'var(--primary)',
                    fontFamily: '"Cairo", sans-serif'
                  }}>
                    {offer.availableSeats} متاح
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: 'var(--text-2xl)',
                    marginBottom: 'var(--space-1)'
                  }}>🚗</div>
                  <div style={{ 
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-1)',
                    fontFamily: '"Cairo", sans-serif'
                  }}>
                    السيارة
                  </div>
                  <div style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    fontFamily: '"Cairo", sans-serif'
                  }}>
                    {offer.carColor}
                  </div>
                </div>
              </div>

              {/* Features */}
                <div style={{
                  display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-5)'
              }}>
                {offer.features.map((feature, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'var(--surface-tertiary)',
                      color: 'var(--text-secondary)',
                      padding: 'var(--space-1) var(--space-3)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '500',
                      fontFamily: '"Cairo", sans-serif'
                    }}
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: 'var(--space-3)'
              }}>
                  <button
                  onClick={() => handleBooking(offer)}
                    style={{
                    flex: 1,
                    padding: 'var(--space-4)',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                      color: 'white',
                      border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--text-base)',
                    fontWeight: '700',
                      cursor: 'pointer',
                    transition: 'var(--transition)',
                    fontFamily: '"Cairo", sans-serif',
                    boxShadow: 'var(--shadow-md)'
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
                  🎫 احجز الآن
                  </button>

                  <button
                  onClick={() => handleSendMessage(offer)}
                    style={{
                    padding: 'var(--space-4)',
                    background: 'var(--surface-secondary)',
                    color: 'var(--text-primary)',
                    border: '2px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--text-base)',
                      fontWeight: '600',
                      cursor: 'pointer',
                    transition: 'var(--transition)',
                    fontFamily: '"Cairo", sans-serif'
                    }}
                    onMouseEnter={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.color = 'var(--primary)';
                    e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                    e.target.style.borderColor = 'var(--border-light)';
                    e.target.style.color = 'var(--text-primary)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                  💬
                  </button>
                </div>
            </div>
          ))}
      </div>

        {/* Call to Action */}
        <div style={{
          marginTop: 'var(--space-8)',
          textAlign: 'center',
          padding: 'var(--space-8)',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          borderRadius: 'var(--radius-xl)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }} />
          
          <h2 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: '800',
            marginBottom: 'var(--space-2)',
            fontFamily: '"Cairo", sans-serif',
            position: 'relative',
            zIndex: 1
          }}>
            لم تجد الرحلة المناسبة؟
          </h2>
          
          <p style={{
            fontSize: 'var(--text-lg)',
            marginBottom: 'var(--space-4)',
            opacity: 0.9,
            fontFamily: '"Cairo", sans-serif',
            position: 'relative',
            zIndex: 1
          }}>
            انشر رحلتك الخاصة واستقبل طلبات الركاب
          </p>
          
          <button
            onClick={() => window.location.href = '/post-offer'}
          style={{
              padding: 'var(--space-4) var(--space-8)',
              background: 'white',
              color: 'var(--primary)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-lg)',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'var(--transition)',
              fontFamily: '"Cairo", sans-serif',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
              zIndex: 1
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px) scale(1.05)';
              e.target.style.boxShadow = 'var(--shadow-xl)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = 'var(--shadow-lg)';
            }}
          >
            🚗 انشر رحلة جديدة
              </button>
            </div>
          </div>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
      
      {showChatModal && selectedChatOffer && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => {
            setShowChatModal(false);
            setSelectedChatOffer(null);
          }}
          tripId={selectedChatOffer.tripId}
          otherUserId={selectedChatOffer.otherUserId}
          otherUserName={selectedChatOffer.otherUserName}
          tripInfo={selectedChatOffer.tripInfo}
        />
      )}
      
      {/* Booking Modal */}
      {showBookingModal && selectedBookingOffer && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedBookingOffer(null);
          }}
          tripType="offer"
          tripData={selectedBookingOffer}
          onBookingCreated={handleBookingCreated}
        />
      )}
    </div>
  );
}