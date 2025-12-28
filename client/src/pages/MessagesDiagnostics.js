import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { messagesAPI } from '../services/api';
import io from 'socket.io-client';

const MessagesDiagnostics = () => {
  const { user } = useAuth();
  const [diagnostics, setDiagnostics] = useState({
    browser: '',
    platform: '',
    userAgent: '',
    socketConnected: false,
    socketId: null,
    lastMessages: [],
    apiStatus: 'checking',
    errors: [],
  });

  useEffect(() => {
    // Get browser info
    const browserInfo = {
      browser:
        navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')
          ? 'Safari'
          : navigator.userAgent.includes('Chrome')
            ? 'Chrome'
            : 'Other',
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
    };

    setDiagnostics((prev) => ({ ...prev, ...browserInfo }));

    // Test Socket.io connection
    if (user) {
      const token = localStorage.getItem('token');
      const API_BASE_URL =
        process.env.REACT_APP_API_URL ||
        (process.env.NODE_ENV === 'production'
          ? 'https://toosila-backend-production.up.railway.app'
          : 'http://localhost:5000');

      const socket = io(API_BASE_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('[DIAGNOSTICS] Socket connected:', socket.id);
        setDiagnostics((prev) => ({
          ...prev,
          socketConnected: true,
          socketId: socket.id,
        }));
      });

      socket.on('disconnect', (reason) => {
        console.log('[DIAGNOSTICS] Socket disconnected:', reason);
        setDiagnostics((prev) => ({
          ...prev,
          socketConnected: false,
          errors: [...prev.errors, `Socket disconnected: ${reason}`],
        }));
      });

      socket.on('connect_error', (error) => {
        console.error('[DIAGNOSTICS] Socket connection error:', error);
        setDiagnostics((prev) => ({
          ...prev,
          socketConnected: false,
          errors: [...prev.errors, `Socket error: ${error.message}`],
        }));
      });

      // Test API
      messagesAPI
        .getConversations()
        .then((response) => {
          setDiagnostics((prev) => ({
            ...prev,
            apiStatus: 'success',
            lastMessages: response.conversations?.slice(0, 5) || [],
          }));
        })
        .catch((error) => {
          setDiagnostics((prev) => ({
            ...prev,
            apiStatus: 'error',
            errors: [...prev.errors, `API error: ${error.message}`],
          }));
        });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: '"Cairo", sans-serif',
      direction: 'rtl',
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      color: '#2c3e50',
    },
    section: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: '#34495e',
      borderBottom: '2px solid #3498db',
      paddingBottom: '8px',
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #ecf0f1',
    },
    label: {
      fontWeight: '600',
      color: '#7f8c8d',
    },
    value: {
      color: '#2c3e50',
    },
    status: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 'bold',
    },
    statusSuccess: {
      background: '#d4edda',
      color: '#155724',
    },
    statusError: {
      background: '#f8d7da',
      color: '#721c24',
    },
    statusWarning: {
      background: '#fff3cd',
      color: '#856404',
    },
    errorList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    errorItem: {
      background: '#f8d7da',
      color: '#721c24',
      padding: '10px',
      borderRadius: '6px',
      marginBottom: '8px',
      fontSize: '14px',
    },
    messageItem: {
      background: '#f8f9fa',
      padding: '10px',
      borderRadius: '6px',
      marginBottom: '8px',
      fontSize: '14px',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>🔍 تشخيص نظام الرسائل</h1>

      {/* Browser Information */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>معلومات المتصفح</h2>
        <div style={styles.infoRow}>
          <span style={styles.label}>المتصفح:</span>
          <span style={styles.value}>{diagnostics.browser}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>النظام:</span>
          <span style={styles.value}>{diagnostics.platform}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>اللغة:</span>
          <span style={styles.value}>{diagnostics.language}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Cookies مفعلة:</span>
          <span style={styles.value}>{diagnostics.cookiesEnabled ? '✅ نعم' : '❌ لا'}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>متصل بالإنترنت:</span>
          <span style={styles.value}>{diagnostics.onLine ? '✅ نعم' : '❌ لا'}</span>
        </div>
      </div>

      {/* Socket.io Status */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>حالة الاتصال الفوري (Socket.io)</h2>
        <div style={styles.infoRow}>
          <span style={styles.label}>الحالة:</span>
          <span
            style={{
              ...styles.status,
              ...(diagnostics.socketConnected ? styles.statusSuccess : styles.statusError),
            }}
          >
            {diagnostics.socketConnected ? '✅ متصل' : '❌ غير متصل'}
          </span>
        </div>
        {diagnostics.socketId && (
          <div style={styles.infoRow}>
            <span style={styles.label}>Socket ID:</span>
            <span style={styles.value}>{diagnostics.socketId}</span>
          </div>
        )}
      </div>

      {/* API Status */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>حالة API</h2>
        <div style={styles.infoRow}>
          <span style={styles.label}>الحالة:</span>
          <span
            style={{
              ...styles.status,
              ...(diagnostics.apiStatus === 'success'
                ? styles.statusSuccess
                : diagnostics.apiStatus === 'error'
                  ? styles.statusError
                  : styles.statusWarning),
            }}
          >
            {diagnostics.apiStatus === 'success'
              ? '✅ يعمل'
              : diagnostics.apiStatus === 'error'
                ? '❌ خطأ'
                : '⏳ جاري الفحص'}
          </span>
        </div>
      </div>

      {/* Last Messages */}
      {diagnostics.lastMessages.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>آخر المحادثات ({diagnostics.lastMessages.length})</h2>
          {diagnostics.lastMessages.map((conv, index) => (
            <div key={index} style={styles.messageItem}>
              <div>
                <strong>{conv.other_user_name || 'مستخدم'}</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                {conv.from_city} ← {conv.to_city}
              </div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                {conv.last_message?.substring(0, 50)}...
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Errors */}
      {diagnostics.errors.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>الأخطاء ({diagnostics.errors.length})</h2>
          <ul style={styles.errorList}>
            {diagnostics.errors.map((error, index) => (
              <li key={index} style={styles.errorItem}>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* User Agent (collapsed) */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>User Agent</h2>
        <div
          style={{
            fontSize: '12px',
            color: '#7f8c8d',
            wordBreak: 'break-all',
            fontFamily: 'monospace',
          }}
        >
          {diagnostics.userAgent}
        </div>
      </div>

      {/* Instructions */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📋 التعليمات</h2>
        <ol style={{ paddingRight: '20px', lineHeight: '1.8' }}>
          <li>تأكد من أن الاتصال الفوري (Socket.io) متصل ✅</li>
          <li>تأكد من أن API يعمل بشكل صحيح ✅</li>
          <li>إذا كان Socket غير متصل، حاول تحديث الصفحة</li>
          <li>إذا كانت هناك أخطاء، التقط صورة للشاشة وأرسلها للدعم الفني</li>
          <li>على iPhone: تأكد من تفعيل JavaScript في إعدادات Safari</li>
        </ol>
      </div>
    </div>
  );
};

export default MessagesDiagnostics;
