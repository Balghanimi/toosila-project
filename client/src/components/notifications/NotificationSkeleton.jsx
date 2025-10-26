/**
 * NotificationSkeleton Component
 * مكون Skeleton لحالة التحميل
 */

import React from 'react';

/**
 * @param {Object} props
 * @param {number} props.count - عدد الـ skeletons المطلوب عرضها
 */
function NotificationSkeleton({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          style={{
            padding: '16px',
            borderBottom: index < count - 1 ? '1px solid #f3f4f6' : 'none'
          }}
        >
          <div style={{
            display: 'flex',
            gap: '12px',
            direction: 'rtl'
          }}>
            {/* أيقونة Skeleton */}
            <div
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#e5e7eb',
                borderRadius: '50%',
                flexShrink: 0,
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            ></div>

            {/* محتوى Skeleton */}
            <div style={{ flex: 1 }}>
              {/* عنوان */}
              <div
                style={{
                  height: '16px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px',
                  width: '75%',
                  marginBottom: '8px',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              ></div>

              {/* رسالة - سطر 1 */}
              <div
                style={{
                  height: '14px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px',
                  width: '100%',
                  marginBottom: '6px',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  animationDelay: '0.1s'
                }}
              ></div>

              {/* رسالة - سطر 2 */}
              <div
                style={{
                  height: '14px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px',
                  width: '60%',
                  marginBottom: '8px',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  animationDelay: '0.2s'
                }}
              ></div>

              {/* الوقت */}
              <div
                style={{
                  height: '12px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px',
                  width: '25%',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  animationDelay: '0.3s'
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}

export default NotificationSkeleton;
