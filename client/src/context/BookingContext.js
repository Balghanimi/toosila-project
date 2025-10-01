import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingsProvider');
  }
  return context;
};

export const BookingsProvider = ({ children }) => {
  const [bookings, setBookings] = useState({});
  const [bookingRequests, setBookingRequests] = useState({});

  // Load bookings from localStorage on app start
  useEffect(() => {
    try {
      const savedBookings = localStorage.getItem('bookings');
      const savedRequests = localStorage.getItem('bookingRequests');
      
      if (savedBookings) {
        setBookings(JSON.parse(savedBookings));
      }
      if (savedRequests) {
        setBookingRequests(JSON.parse(savedRequests));
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  }, []);

  // Save bookings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('bookings', JSON.stringify(bookings));
    } catch (error) {
      console.error('Error saving bookings:', error);
    }
  }, [bookings]);

  // Save booking requests to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('bookingRequests', JSON.stringify(bookingRequests));
    } catch (error) {
      console.error('Error saving booking requests:', error);
    }
  }, [bookingRequests]);

  // Generate unique booking ID
  const generateBookingId = () => {
    return 'booking_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // Create a booking request
  const createBookingRequest = (passengerId, driverId, tripId, tripInfo, passengerInfo) => {
    const bookingId = generateBookingId();
    const timestamp = new Date().toISOString();
    
    const bookingRequest = {
      id: bookingId,
      passengerId,
      driverId,
      tripId,
      tripInfo,
      passengerInfo,
      status: 'pending', // pending, accepted, rejected, cancelled, completed
      timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
      messages: [],
      paymentStatus: 'pending', // pending, paid, refunded
      rating: null
    };

    // Add to booking requests
    setBookingRequests(prev => ({
      ...prev,
      [bookingId]: bookingRequest
    }));

    return bookingRequest;
  };

  // Accept a booking request
  const acceptBooking = (bookingId) => {
    setBookingRequests(prev => {
      if (!prev[bookingId]) return prev;
      
      const updatedRequest = {
        ...prev[bookingId],
        status: 'accepted',
        updatedAt: new Date().toISOString()
      };

      // Move to confirmed bookings
      setBookings(prevBookings => ({
        ...prevBookings,
        [bookingId]: updatedRequest
      }));

      // Remove from pending requests
      const { [bookingId]: removed, ...remaining } = prev;
      return remaining;
    });
  };

  // Reject a booking request
  const rejectBooking = (bookingId, reason = '') => {
    setBookingRequests(prev => {
      if (!prev[bookingId]) return prev;
      
      return {
        ...prev,
        [bookingId]: {
          ...prev[bookingId],
          status: 'rejected',
          rejectionReason: reason,
          updatedAt: new Date().toISOString()
        }
      };
    });
  };

  // Cancel a booking
  const cancelBooking = (bookingId, reason = '', cancelledBy = 'passenger') => {
    setBookings(prev => {
      if (!prev[bookingId]) return prev;
      
      return {
        ...prev,
        [bookingId]: {
          ...prev[bookingId],
          status: 'cancelled',
          cancellationReason: reason,
          cancelledBy,
          updatedAt: new Date().toISOString()
        }
      };
    });
  };

  // Complete a booking
  const completeBooking = (bookingId) => {
    setBookings(prev => {
      if (!prev[bookingId]) return prev;
      
      return {
        ...prev,
        [bookingId]: {
          ...prev[bookingId],
          status: 'completed',
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    });
  };

  // Get bookings for a user
  const getUserBookings = (userId, userType = 'passenger') => {
    const userBookings = [];
    
    // Check confirmed bookings
    Object.values(bookings).forEach(booking => {
      if ((userType === 'passenger' && booking.passengerId === userId) ||
          (userType === 'driver' && booking.driverId === userId)) {
        userBookings.push(booking);
      }
    });

    // Check pending requests
    Object.values(bookingRequests).forEach(request => {
      if ((userType === 'passenger' && request.passengerId === userId) ||
          (userType === 'driver' && request.driverId === userId)) {
        userBookings.push(request);
      }
    });

    // Sort by creation date (newest first)
    return userBookings.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  // Get booking by ID
  const getBookingById = (bookingId) => {
    return bookings[bookingId] || bookingRequests[bookingId] || null;
  };

  // Get pending requests for a driver
  const getDriverPendingRequests = (driverId) => {
    return Object.values(bookingRequests).filter(
      request => request.driverId === driverId && request.status === 'pending'
    );
  };

  // Get booking statistics
  const getBookingStats = (userId, userType = 'passenger') => {
    const userBookings = getUserBookings(userId, userType);
    
    const stats = {
      total: userBookings.length,
      pending: 0,
      accepted: 0,
      completed: 0,
      cancelled: 0,
      rejected: 0
    };

    userBookings.forEach(booking => {
      stats[booking.status] = (stats[booking.status] || 0) + 1;
    });

    return stats;
  };

  // Add message to booking
  const addBookingMessage = (bookingId, message) => {
    const booking = getBookingById(bookingId);
    if (!booking) return;

    const updatedMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    if (bookings[bookingId]) {
      setBookings(prev => ({
        ...prev,
        [bookingId]: {
          ...prev[bookingId],
          messages: [...(prev[bookingId].messages || []), updatedMessage]
        }
      }));
    } else if (bookingRequests[bookingId]) {
      setBookingRequests(prev => ({
        ...prev,
        [bookingId]: {
          ...prev[bookingId],
          messages: [...(prev[bookingId].messages || []), updatedMessage]
        }
      }));
    }
  };

  // Update payment status
  const updatePaymentStatus = (bookingId, status) => {
    setBookings(prev => {
      if (!prev[bookingId]) return prev;
      
      return {
        ...prev,
        [bookingId]: {
          ...prev[bookingId],
          paymentStatus: status,
          updatedAt: new Date().toISOString()
        }
      };
    });
  };

  // Add rating to booking
  const addBookingRating = (bookingId, rating, comment) => {
    setBookings(prev => {
      if (!prev[bookingId]) return prev;
      
      return {
        ...prev,
        [bookingId]: {
          ...prev[bookingId],
          rating: {
            score: rating,
            comment,
            timestamp: new Date().toISOString()
          },
          updatedAt: new Date().toISOString()
        }
      };
    });
  };

  // Clear all bookings (for testing)
  const clearAllBookings = () => {
    setBookings({});
    setBookingRequests({});
  };

  const value = {
    bookings,
    bookingRequests,
    createBookingRequest,
    acceptBooking,
    rejectBooking,
    cancelBooking,
    completeBooking,
    getUserBookings,
    getBookingById,
    getDriverPendingRequests,
    getBookingStats,
    addBookingMessage,
    updatePaymentStatus,
    addBookingRating,
    clearAllBookings
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};


