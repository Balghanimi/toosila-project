import React, { useEffect } from 'react';
import ChatInterface from './ChatInterface';

const ChatModal = ({ 
  isOpen, 
  onClose, 
  tripId, 
  otherUserId, 
  otherUserName, 
  tripInfo 
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 'var(--space-4)',
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.3s ease-out'
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        height: '80vh',
        maxHeight: '600px',
        animation: 'slideInUp 0.3s ease-out'
      }}
      onClick={(e) => e.stopPropagation()}>
        <ChatInterface
          tripId={tripId}
          otherUserId={otherUserId}
          otherUserName={otherUserName}
          tripInfo={tripInfo}
          onClose={onClose}
        />
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatModal;
