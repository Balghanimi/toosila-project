import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessages } from '../../context/MessagesContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { offersAPI, demandsAPI } from '../../services/api';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import RideDetailsModal from './RideDetailsModal';

const ChatInterface = ({
  tripId,
  rideType = 'offer',
  otherUserId,
  otherUserName,
  tripInfo,
  onClose,
}) => {
  const {
    sendMessage,
    currentConversation,
    fetchConversation,
    fetchRideConversation,
    clearCurrentConversation,
  } = useMessages();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showRideDetails, setShowRideDetails] = useState(false);
  const [rideDetails, setRideDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Handle click on header to show ride details modal
  const handleHeaderClick = async () => {
    if (!tripId) return;

    setLoadingDetails(true);
    try {
      let response;
      if (rideType === 'offer') {
        response = await offersAPI.getById(tripId);
      } else {
        response = await demandsAPI.getById(tripId);
      }

      // Extract the data from the response
      const data = response?.data || response?.offer || response?.demand || response;
      setRideDetails(data);
      setShowRideDetails(true);
    } catch (err) {
      console.error('Error fetching ride details:', err);
      // Fallback to navigation if API fails
      if (rideType === 'offer') {
        navigate('/offers', { state: { highlightOfferId: tripId } });
      } else {
        navigate('/demands', { state: { highlightDemandId: tripId } });
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle booking from the details modal
  const handleBookFromModal = (rideData) => {
    // Navigate to offers page with booking intent
    navigate('/offers', { state: { bookOfferId: rideData.id } });
  };

  // Load messages for this conversation
  useEffect(() => {
    console.log('[CHAT INTERFACE] Loading conversation with:', {
      tripId,
      rideType,
      otherUserId,
      otherUserName,
      currentUserId: user?.id,
    });

    if (tripId && user?.id) {
      // Use ride-based conversation fetching WITH privacy filter by otherUserId
      console.log('[CHAT INTERFACE] Calling fetchRideConversation with otherUserId:', otherUserId);
      fetchRideConversation(rideType, tripId, otherUserId);
    } else if (otherUserId && user?.id) {
      // Fallback to user-based conversation (deprecated)
      console.log('[CHAT INTERFACE] Calling fetchConversation (deprecated)');
      fetchConversation(otherUserId);
    }
  }, [tripId, rideType, otherUserId, user?.id, fetchRideConversation, fetchConversation]);

  // Cleanup: Clear messages when conversation changes to prevent identity mixing
  useEffect(() => {
    return () => {
      console.log('[CHAT INTERFACE] 🧹 Cleaning up conversation state');
      if (clearCurrentConversation) {
        clearCurrentConversation();
      }
    };
  }, [tripId, rideType, otherUserId, clearCurrentConversation]);

  // REAL-TIME POLLING: Auto-refresh messages every 3 seconds when chat is open
  useEffect(() => {
    if (!tripId || !user?.id) return;

    console.log('[CHAT INTERFACE] Starting message polling (3s interval)');
    let isActive = true; // Track if component is still mounted

    // Polling function with error handling
    const pollMessages = async () => {
      if (!isActive) return;

      try {
        if (tripId) {
          await fetchRideConversation(rideType, tripId, otherUserId);
        } else if (otherUserId) {
          await fetchConversation(otherUserId);
        }
      } catch (error) {
        console.error('[CHAT INTERFACE] Polling error:', error);
        // Continue polling even on error - don't break the interval
      }
    };

    // Initial fetch
    pollMessages();

    // Set up interval for subsequent fetches
    const pollInterval = setInterval(pollMessages, 3000); // Poll every 3 seconds

    // Cleanup on unmount
    return () => {
      console.log('[CHAT INTERFACE] Stopping message polling');
      isActive = false; // Prevent state updates after unmount
      clearInterval(pollInterval);
    };
  }, [tripId, rideType, otherUserId, user?.id, fetchRideConversation, fetchConversation]);

  // Handle sending a message (with optimistic update - no loading overlay needed)
  const handleSendMessage = async (content) => {
    if (!user?.id || !tripId || !content.trim()) {
      return;
    }

    setError('');

    try {
      // sendMessage in MessagesContext now handles optimistic updates
      // Message appears instantly, no need to block UI or refetch
      await sendMessage(rideType, tripId, content);

      // Success notification - disappears in 1 second
      showSuccess('✅ تم الإرسال');
    } catch (err) {
      const errorMsg = err.message || 'فشل في إرسال الرسالة. حاول مرة أخرى.';
      setError(errorMsg);
      showError(errorMsg);
      console.error('Error sending message:', err);
    }
  };

  // Format trip info for display
  const formatTripInfo = () => {
    if (!tripInfo) return '';

    const { from, to, date, time } = tripInfo;

    // Build route string
    const route = from && to ? `${from} → ${to}` : '';

    // Safely format date
    let formattedDate = '';
    if (date) {
      try {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          formattedDate = parsedDate.toLocaleDateString('ar-IQ', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });
        }
      } catch {
        formattedDate = '';
      }
    }

    // Build the display string, only including parts that exist
    const parts = [route, formattedDate, time].filter(Boolean);
    return parts.join(' • ');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--surface-primary)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-light)',
        direction: 'rtl',
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4)',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          color: 'white',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div
          onClick={handleHeaderClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            cursor: 'pointer',
            padding: 'var(--space-2)',
            marginRight: 'calc(-1 * var(--space-2))',
            borderRadius: 'var(--radius-lg)',
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
          title={rideType === 'offer' ? 'عرض تفاصيل العرض' : 'عرض تفاصيل الطلب'}
        >
          {/* User Avatar */}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--text-lg)',
              fontWeight: '700',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            {otherUserName?.charAt(0) || '👤'}
          </div>

          {/* User Info */}
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 'var(--text-lg)',
                fontWeight: '700',
                fontFamily: '"Cairo", sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              {otherUserName || 'مستخدم'}
              <span style={{ fontSize: 'var(--text-sm)', opacity: 0.8 }}>🔗</span>
            </h3>
            {tripInfo && (
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--text-sm)',
                  opacity: 0.9,
                  fontFamily: '"Cairo", sans-serif',
                }}
              >
                {formatTripInfo()}
              </p>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-lg)',
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          ✕
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--error-light)',
            color: 'var(--error)',
            fontSize: 'var(--text-sm)',
            fontFamily: '"Cairo", sans-serif',
            textAlign: 'center',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          {error}
        </div>
      )}

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <MessageList messages={currentConversation} currentUserId={user?.id} />
      </div>

      {/* Message Input */}
      <div
        style={{
          padding: 'var(--space-4)',
          background: 'var(--surface-primary)',
          borderTop: '1px solid var(--border-light)',
        }}
      >
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={false}
          placeholder="اكتب رسالتك هنا..."
        />
      </div>

      {/* Loading Details Overlay */}
      {loadingDetails && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--surface-primary)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              fontFamily: '"Cairo", sans-serif',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid var(--border-light)',
                borderTop: '2px solid var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            جاري تحميل التفاصيل...
          </div>
        </div>
      )}

      {/* Ride Details Modal */}
      <RideDetailsModal
        isOpen={showRideDetails}
        onClose={() => setShowRideDetails(false)}
        rideType={rideType}
        rideData={rideDetails}
        onBook={rideType === 'offer' ? handleBookFromModal : null}
      />
    </div>
  );
};

export default ChatInterface;
