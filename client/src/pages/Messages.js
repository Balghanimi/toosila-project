import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../context/MessagesContext';
import ConversationList from '../components/Chat/ConversationList';
import ChatInterface from '../components/Chat/ChatInterface';
import AuthModal from '../components/Auth/AuthModal';

const Messages = () => {
  const { user, isAuthenticated } = useAuth();
  const { conversations, fetchConversations, loading } = useMessages();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isAnimated, setIsAnimated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle closing chat - memoized for use in effects
  const handleCloseChat = useCallback(() => {
    setSelectedConversation(null);
  }, []);

  useEffect(() => {
    setIsAnimated(true);
  }, []);

  // MOBILE FIX: Handle Android back button when chat is open
  useEffect(() => {
    if (!selectedConversation) return;

    // Push a dummy state when chat opens so back button has something to pop
    window.history.pushState({ chatOpen: true }, '');

    const handlePopState = (event) => {
      // When back button pressed while chat is open, close the chat
      if (selectedConversation) {
        event.preventDefault();
        handleCloseChat();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedConversation, handleCloseChat]);

  // Load conversations when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchConversations();
    }
  }, [user?.id, fetchConversations]);

  // Handle incoming navigation state (from ViewOffers "Message Driver" button)
  useEffect(() => {
    if (location.state && location.state.rideType && location.state.rideId) {
      const { rideType, rideId, driverName, fromCity, toCity } = location.state;
      // Auto-select the conversation based on navigation state
      setSelectedConversation({
        rideType,
        rideId,
        tripId: rideId,
        otherUserName: driverName || 'السائق',
        tripInfo: {
          from: fromCity || '',
          to: toCity || '',
        },
        isNewConversation: true, // Flag to indicate this might be a new conversation
      });
      // Clear the state to prevent re-triggering on page refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleSelectConversation = (conversation) => {
    console.log('[MESSAGES PAGE] Conversation selected:', {
      conversation,
      otherUserId: conversation.otherUserId || conversation.other_user_id,
      otherUserName: conversation.otherUserName || conversation.other_user_name,
      tripId: conversation.tripId || conversation.ride_id,
      rideType: conversation.rideType || conversation.ride_type,
    });
    setSelectedConversation(conversation);
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: '100px' }}>
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--space-8)',
            background: 'var(--surface-primary)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🔒</div>
          <h2
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-2)',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            تسجيل الدخول مطلوب
          </h2>
          <p
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              fontFamily: '"Cairo", sans-serif',
              marginBottom: 'var(--space-4)',
            }}
          >
            يرجى تسجيل الدخول للوصول إلى الرسائل
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              color: 'white',
              border: 'none',
              padding: 'var(--space-3) var(--space-6)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-base)',
              fontWeight: '600',
              fontFamily: '"Cairo", sans-serif',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
            }}
          >
            تسجيل الدخول / إنشاء حساب
          </button>
        </div>

        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            initialMode="login"
          />
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        paddingBottom: '100px',
      }}
    >
      <div
        className="container"
        style={{
          paddingTop: 'var(--space-6)',
          transform: isAnimated ? 'translateY(0)' : 'translateY(20px)',
          opacity: isAnimated ? 1 : 0,
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 'var(--space-6)',
          }}
        >
          <h1
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: '800',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-2)',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            💬 الرسائل
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 'var(--text-lg)',
              fontFamily: '"Cairo", sans-serif',
              fontWeight: '500',
              marginBottom: 'var(--space-3)',
            }}
          >
            تواصل مع السائقين والركاب بسهولة
          </p>
          <button
            onClick={() => navigate('/messages/diagnostics')}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              background: 'var(--surface-secondary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-sm)',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'var(--transition)',
              fontFamily: '"Cairo", sans-serif',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'var(--border-light)';
              e.target.style.color = 'var(--text-secondary)';
            }}
          >
            🔍 تشخيص المشاكل
          </button>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: selectedConversation ? '1fr 1fr' : '1fr',
            gap: 'var(--space-6)',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
          className="messages-grid"
        >
          {/* Conversations List */}
          <div
            style={{
              minHeight: '500px',
              display: selectedConversation ? 'none' : 'block',
            }}
            className="conversations-list"
          >
            <ConversationList
              onSelectConversation={handleSelectConversation}
              selectedConversation={selectedConversation}
              loading={loading}
            />
          </div>

          {/* Chat Interface */}
          {selectedConversation && (
            <div
              style={{
                minHeight: '500px',
                animation: 'slideInRight 0.3s ease-out',
              }}
              className="chat-interface"
            >
              <ChatInterface
                tripId={selectedConversation.tripId || selectedConversation.rideId}
                rideType={selectedConversation.rideType || 'offer'}
                otherUserId={selectedConversation.otherUserId}
                otherUserName={selectedConversation.otherUserName}
                tripInfo={
                  selectedConversation.tripInfo || {
                    from: selectedConversation.fromCity || '',
                    to: selectedConversation.toCity || '',
                  }
                }
                onClose={handleCloseChat}
              />
            </div>
          )}
        </div>

        {/* Empty State */}
        {conversations.length === 0 && (
          <div
            style={{
              marginTop: 'var(--space-8)',
              textAlign: 'center',
              padding: 'var(--space-8)',
              background: 'var(--surface-primary)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>💬</div>
            <h2
              style={{
                fontSize: 'var(--text-xl)',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-2)',
                fontFamily: '"Cairo", sans-serif',
              }}
            >
              لا توجد محادثات بعد
            </h2>
            <p
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--text-secondary)',
                fontFamily: '"Cairo", sans-serif',
                marginBottom: 'var(--space-4)',
              }}
            >
              ابدأ محادثة جديدة من صفحة العروض أو الطلبات
            </p>
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => (window.location.href = '/offers')}
                aria-label="تصفح عروض الرحلات المتاحة"
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background:
                    'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-base)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  fontFamily: '"Cairo", sans-serif',
                  boxShadow: 'var(--shadow-md)',
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
                🚗 تصفح العروض
              </button>
              <button
                onClick={() => (window.location.href = '/demands')}
                aria-label="تصفح طلبات الركاب"
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background: 'var(--surface-secondary)',
                  color: 'var(--text-primary)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-base)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  fontFamily: '"Cairo", sans-serif',
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
                👤 تصفح الطلبات
              </button>
            </div>
          </div>
        )}

        <style>{`
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Messages;
