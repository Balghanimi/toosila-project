import React, { useState, useRef, useEffect } from 'react';
import { Send, Edit2, Trash2, Copy, X } from 'lucide-react';

/**
 * Context menu for message actions (edit, delete, copy)
 * Shows on long-press (mobile) or right-click (desktop)
 */
const MessageContextMenu = ({
    message,
    isOwnMessage,
    canEdit,
    position,
    onEdit,
    onDeleteForMe,
    onDeleteForAll,
    onCopy,
    onClose,
}) => {
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [onClose]);

    // Handle copy action
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            onCopy();
        } catch (err) {
            console.error('Failed to copy:', err);
        }
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    zIndex: 999,
                }}
                onClick={onClose}
            />

            {/* Menu */}
            <div
                ref={menuRef}
                style={{
                    position: 'fixed',
                    top: position.y,
                    left: position.x,
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    padding: '8px 0',
                    minWidth: '180px',
                    zIndex: 1000,
                    direction: 'rtl',
                    animation: 'fadeIn 0.15s ease-out',
                }}
            >
                {/* Edit option - only for own messages within time limit */}
                {isOwnMessage && canEdit && (
                    <button
                        onClick={() => {
                            onEdit(message);
                            onClose();
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            width: '100%',
                            padding: '12px 16px',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#333',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                    >
                        <Edit2 size={18} color="#10b981" />
                        <span>تعديل</span>
                    </button>
                )}

                {/* Copy option */}
                {!message.isDeleted && (
                    <button
                        onClick={handleCopy}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            width: '100%',
                            padding: '12px 16px',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#333',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                    >
                        <Copy size={18} color="#6b7280" />
                        <span>نسخ</span>
                    </button>
                )}

                {/* Divider */}
                {isOwnMessage && (
                    <div
                        style={{
                            height: '1px',
                            backgroundColor: '#e5e7eb',
                            margin: '4px 0',
                        }}
                    />
                )}

                {/* Delete for me - available for all messages */}
                <button
                    onClick={() => {
                        onDeleteForMe(message);
                        onClose();
                    }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#333',
                        transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                >
                    <Trash2 size={18} color="#6b7280" />
                    <span>حذف لدي</span>
                </button>

                {/* Delete for everyone - only for own messages */}
                {isOwnMessage && (
                    <button
                        onClick={() => {
                            onDeleteForAll(message);
                            onClose();
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            width: '100%',
                            padding: '12px 16px',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#dc2626',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = '#fef2f2')}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                    >
                        <Trash2 size={18} color="#dc2626" />
                        <span>حذف للجميع</span>
                    </button>
                )}
            </div>

            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
        </>
    );
};

export default MessageContextMenu;
