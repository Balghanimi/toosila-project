import React from 'react';

// مكون Skeleton للبطاقات
export const CardSkeleton = () => {
  return (
    <div style={{
      background: 'var(--bg-primary)',
      border: '1px solid var(--border-light)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: 'var(--shadow-sm)',
      direction: 'rtl'
    }}>
      {/* Header Skeleton */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '16px',
        gap: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'var(--bg-hover)',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
        <div style={{ flex: 1 }}>
          <div style={{
            height: '16px',
            background: 'var(--bg-hover)',
            borderRadius: '4px',
            marginBottom: '8px',
            width: '60%',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
          <div style={{
            height: '12px',
            background: 'var(--bg-hover)',
            borderRadius: '4px',
            width: '40%',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
        </div>
      </div>

      {/* Route Skeleton */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '16px',
        gap: '12px'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: 'var(--bg-hover)',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
        <div style={{ flex: 1 }}>
          <div style={{
            height: '14px',
            background: 'var(--bg-hover)',
            borderRadius: '4px',
            marginBottom: '4px',
            width: '80%',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
        </div>
        <div style={{
          width: '20px',
          height: '20px',
          background: 'var(--bg-hover)',
          borderRadius: '4px',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
        <div style={{ flex: 1 }}>
          <div style={{
            height: '14px',
            background: 'var(--bg-hover)',
            borderRadius: '4px',
            marginBottom: '4px',
            width: '70%',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
        </div>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: 'var(--bg-hover)',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
      </div>

      {/* Details Skeleton */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          height: '12px',
          background: 'var(--bg-hover)',
          borderRadius: '4px',
          width: '90%',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
        <div style={{
          height: '12px',
          background: 'var(--bg-hover)',
          borderRadius: '4px',
          width: '80%',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
        <div style={{
          height: '12px',
          background: 'var(--bg-hover)',
          borderRadius: '4px',
          width: '70%',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
      </div>

      {/* Button Skeleton */}
      <div style={{
        height: '36px',
        background: 'var(--bg-hover)',
        borderRadius: '8px',
        width: '100%',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
    </div>
  );
};

// مكون Skeleton للقائمة
export const ListSkeleton = ({ count = 3 }) => {
  return (
    <div>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
};

// مكون الحالة الفارغة
export const EmptyState = ({ 
  title = "لا توجد نتائج", 
  description = "لم نجد أي نتائج مطابقة لبحثك",
  actionText = "إضافة جديد",
  onAction,
  icon = "🔍"
}) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '60px 20px',
      direction: 'rtl'
    }}>
      <div style={{
        fontSize: '64px',
        marginBottom: '24px',
        opacity: 0.6
      }}>
        {icon}
      </div>
      
      <h3 style={{
        fontSize: '24px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        margin: '0 0 12px 0'
      }}>
        {title}
      </h3>
      
      <p style={{
        fontSize: '16px',
        color: 'var(--text-secondary)',
        margin: '0 auto 32px auto',
        lineHeight: '1.5',
        maxWidth: '400px'
      }}>
        {description}
      </p>
      
      {onAction && (
        <button
          onClick={onAction}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'var(--primary-hover)';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'var(--primary)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

// مكون الحالة الفارغة للرحلات
export const EmptyOffersState = ({ onAddOffer }) => {
  return (
    <EmptyState
      title="لا توجد رحلات بعد"
      description="لا توجد رحلات متاحة حالياً — جرّب تغيير التاريخ أو المدينة، أو انشر رحلة جديدة"
      actionText="🚗 انشر رحلة"
      onAction={onAddOffer}
      icon="🚗"
    />
  );
};

// مكون الحالة الفارغة للطلبات
export const EmptyDemandsState = ({ onAddDemand }) => {
  return (
    <EmptyState
      title="لا توجد طلبات مقاعد"
      description="لا توجد طلبات مقاعد حالياً — انشر طلب مقعد جديد"
      actionText="👤 طلب مقعد"
      onAction={onAddDemand}
      icon="👤"
    />
  );
};

// مكون الحالة الفارغة للتقييمات
export const EmptyRatingsState = () => {
  return (
    <EmptyState
      title="لا توجد تقييمات بعد"
      description="لم يتم إضافة أي تقييمات بعد — ابدأ بتقييم السائقين والركاب بعد الرحلات"
      icon="⭐"
    />
  );
};

const SkeletonComponents = {
  CardSkeleton,
  ListSkeleton,
  EmptyState,
  EmptyOffersState,
  EmptyDemandsState,
  EmptyRatingsState
};

export default SkeletonComponents;
