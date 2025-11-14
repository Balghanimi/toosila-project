import React from 'react';

/**
 * Professional Skeleton Loader Component
 * Creates shimmer loading placeholders for different content types
 * Accessible and respects reduced-motion preferences
 */

const SkeletonLoader = ({
  variant = 'text',
  width = '100%',
  height,
  count = 1,
  circle = false,
  className = '',
  animate = true,
}) => {
  const variants = {
    text: { height: '12px', borderRadius: 'var(--radius-sm)' },
    title: { height: '24px', borderRadius: 'var(--radius-sm)' },
    subtitle: { height: '18px', borderRadius: 'var(--radius-sm)' },
    button: { height: '48px', borderRadius: 'var(--radius-lg)' },
    avatar: { width: '48px', height: '48px', borderRadius: '50%' },
    card: { height: '200px', borderRadius: 'var(--radius-xl)' },
    thumbnail: { width: '80px', height: '80px', borderRadius: 'var(--radius)' },
  };

  const variantStyle = variants[variant] || variants.text;

  const skeletonStyle = {
    display: 'block',
    width: circle ? height || variantStyle.width : width,
    height: height || variantStyle.height,
    background:
      'linear-gradient(90deg, var(--surface-tertiary) 25%, var(--surface-secondary) 50%, var(--surface-tertiary) 75%)',
    backgroundSize: '200% 100%',
    borderRadius: circle ? '50%' : variantStyle.borderRadius,
    animation: animate ? 'skeleton-shimmer 1.5s ease-in-out infinite' : 'none',
  };

  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={className}
      style={{
        ...skeletonStyle,
        marginBottom: index < count - 1 ? 'var(--space-2)' : 0,
      }}
      aria-hidden="true"
    />
  ));

  return (
    <>
      <div role="status" aria-live="polite" aria-busy="true">
        {skeletons}
        <span className="sr-only">جاري التحميل...</span>
      </div>

      <style>{`
        @keyframes skeleton-shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes skeleton-shimmer {
            0%, 100% {
              background-position: 0 0;
            }
          }
        }
      `}</style>
    </>
  );
};

/**
 * Predefined Skeleton Patterns for Common Use Cases
 */

// Card Skeleton (for lists of cards)
export const SkeletonCard = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          style={{
            background: 'var(--surface-primary)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            marginBottom: index < count - 1 ? 'var(--space-4)' : 0,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <SkeletonLoader variant="avatar" />
            <div style={{ flex: 1 }}>
              <SkeletonLoader variant="subtitle" width="60%" />
              <div style={{ height: 'var(--space-1)' }} />
              <SkeletonLoader variant="text" width="40%" />
            </div>
          </div>

          {/* Content */}
          <SkeletonLoader variant="text" count={3} />
          <div style={{ height: 'var(--space-4)' }} />

          {/* Footer */}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <SkeletonLoader variant="button" width="48%" />
            <SkeletonLoader variant="button" width="48%" />
          </div>
        </div>
      ))}
    </>
  );
};

// List Item Skeleton
export const SkeletonListItem = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-4)',
            background: 'var(--surface-primary)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: index < count - 1 ? 'var(--space-2)' : 0,
          }}
        >
          <SkeletonLoader variant="avatar" />
          <div style={{ flex: 1 }}>
            <SkeletonLoader variant="subtitle" width="70%" />
            <div style={{ height: 'var(--space-1)' }} />
            <SkeletonLoader variant="text" width="50%" />
          </div>
          <SkeletonLoader width="60px" height="32px" />
        </div>
      ))}
    </>
  );
};

// Message Skeleton (for chat interfaces)
export const SkeletonMessage = ({ count = 3, align = 'right' }) => {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            justifyContent: align === 'left' ? 'flex-start' : 'flex-end',
            marginBottom: 'var(--space-3)',
          }}
        >
          <div
            style={{
              maxWidth: '70%',
              background: 'var(--surface-secondary)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-3)',
            }}
          >
            <SkeletonLoader variant="text" count={2} />
            <div style={{ height: 'var(--space-2)' }} />
            <SkeletonLoader width="60px" height="10px" />
          </div>
        </div>
      ))}
    </>
  );
};

// Stats Skeleton (for dashboard)
export const SkeletonStats = ({ count = 4 }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`,
        gap: 'var(--space-4)',
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          style={{
            background: 'var(--surface-primary)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
          }}
        >
          <SkeletonLoader variant="avatar" width="48px" height="48px" />
          <div style={{ height: 'var(--space-3)' }} />
          <SkeletonLoader variant="title" width="40%" />
          <div style={{ height: 'var(--space-2)' }} />
          <SkeletonLoader variant="text" width="60%" />
        </div>
      ))}
    </div>
  );
};

// Table Skeleton
export const SkeletonTable = ({ rows = 5, columns = 4 }) => {
  return (
    <div
      style={{
        background: 'var(--surface-primary)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          background: 'var(--surface-secondary)',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        {Array.from({ length: columns }, (_, i) => (
          <SkeletonLoader key={i} variant="subtitle" height="16px" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: 'var(--space-3)',
            padding: 'var(--space-4)',
            borderBottom: rowIndex < rows - 1 ? '1px solid var(--border-light)' : 'none',
          }}
        >
          {Array.from({ length: columns }, (_, colIndex) => (
            <SkeletonLoader key={colIndex} variant="text" />
          ))}
        </div>
      ))}
    </div>
  );
};

// Form Skeleton
export const SkeletonForm = ({ fields = 4 }) => {
  return (
    <div
      style={{
        background: 'var(--surface-primary)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
      }}
    >
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} style={{ marginBottom: index < fields - 1 ? 'var(--space-4)' : 0 }}>
          <SkeletonLoader variant="text" width="120px" height="14px" />
          <div style={{ height: 'var(--space-2)' }} />
          <SkeletonLoader variant="button" />
        </div>
      ))}
      <div style={{ height: 'var(--space-6)' }} />
      <SkeletonLoader variant="button" width="100%" />
    </div>
  );
};

export default SkeletonLoader;
