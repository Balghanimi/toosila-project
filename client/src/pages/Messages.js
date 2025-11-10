import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../context/MessagesContext';
import ConversationList from '../components/Chat/ConversationList';
import ChatInterface from '../components/Chat/ChatInterface';

const Messages = () => {
  const { user, isAuthenticated } = useAuth();
  const { conversations, fetchConversations } = useMessages();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    setIsAnimated(true);
  }, []);

  // Load conversations when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchConversations();
    }
  }, [user?.id, fetchConversations]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleCloseChat = () => {
    setSelectedConversation(null);
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
              margin: 0,
            }}
          >
            يرجى تسجيل الدخول للوصول إلى الرسائل
          </p>
        </div>
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
            }}
          >
            تواصل مع السائقين والركاب بسهولة
          </p>
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
        >
          {/* Conversations List */}
          <div
            style={{
              minHeight: '500px',
            }}
          >
            <ConversationList
              onSelectConversation={handleSelectConversation}
              selectedConversation={selectedConversation}
            />
          </div>

          {/* Chat Interface */}
          {selectedConversation && (
            <div
              style={{
                minHeight: '500px',
                animation: 'slideInRight 0.3s ease-out',
              }}
            >
              <ChatInterface
                tripId={selectedConversation.tripId}
                otherUserId={selectedConversation.otherUserId}
                otherUserName={selectedConversation.otherUserName}
                tripInfo={{
                  from: 'الكرادة', // This would come from the actual trip data
                  to: 'الجادرية',
                  date: 'اليوم',
                  time: '08:00 ص',
                }}
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
