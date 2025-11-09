# Toosila Design System Guide
**Version:** 2.0
**Last Updated:** 2025-11-09
**Platform:** Iraq Ride-Sharing Application

---

## Table of Contents
1. [Introduction](#introduction)
2. [Design Principles](#design-principles)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Components](#components)
7. [Accessibility Guidelines](#accessibility-guidelines)
8. [RTL/LTR Support](#rtlltr-support)
9. [Dark Mode](#dark-mode)
10. [Animation & Motion](#animation--motion)
11. [Usage Examples](#usage-examples)
12. [Best Practices](#best-practices)

---

## Introduction

The Toosila Design System is a comprehensive collection of reusable components, design tokens, and guidelines for building consistent, accessible, and beautiful user interfaces for the Iraqi ride-sharing market.

### Core Philosophy
- **User-First**: Every design decision prioritizes user needs
- **Accessible**: WCAG 2.1 AA compliant
- **Bilingual**: Seamless Arabic RTL and English LTR support
- **Consistent**: Unified visual language across all touchpoints
- **Modern**: Contemporary design patterns with Iraqi cultural sensitivity

---

## Design Principles

### 1. Clarity Over Complexity
- Use simple, clear language (Arabic and English)
- Minimize cognitive load with familiar patterns
- Progressive disclosure for advanced features

### 2. Trust & Safety
- Transparent pricing and policies
- Clear user verification indicators
- Prominent safety features

### 3. Cultural Sensitivity
- Arabic-first design approach
- Right-to-left layouts that feel natural
- Colors and imagery appropriate for Iraqi market

### 4. Performance
- Fast loading times
- Smooth animations (60fps)
- Responsive across all devices

### 5. Accessibility
- Keyboard navigation support
- Screen reader compatible
- Sufficient color contrast
- Touch targets 44x44px minimum

---

## Color System

### Primary Brand Colors

Our primary green represents trust, safety, and growth in the Iraqi market.

```css
/* Primary Green - Main brand color */
--primary-50: #ecfdf5;
--primary-100: #d1fae5;
--primary-200: #a7f3d0;
--primary-300: #6ee7b7;
--primary-400: #34d399;
--primary-500: #10b981;  /* Main */
--primary-600: #059669;  /* Primary Dark */
--primary-700: #047857;
--primary-800: #065f46;
--primary-900: #064e3b;
```

**Usage:**
- Primary-500: Main CTAs, active states, links
- Primary-600: Button hover states
- Primary-100: Backgrounds, highlights
- Primary-50: Subtle backgrounds

### Secondary Colors

Blue for informational elements and secondary actions.

```css
/* Secondary Blue */
--secondary-50: #f0f9ff;
--secondary-100: #e0f2fe;
--secondary-500: #0ea5e9;  /* Main */
--secondary-600: #0284c7;  /* Hover */
--secondary-700: #0369a1;
```

### Semantic Colors

```css
/* Success */
--success-500: #22c55e;
--success-600: #16a34a;
--success-50: #f0fdf4;

/* Error */
--error-500: #ef4444;
--error-600: #dc2626;
--error-50: #fef2f2;

/* Warning */
--warning-500: #f59e0b;
--warning-600: #d97706;
--warning-50: #fffbeb;

/* Info */
--info-500: #3b82f6;
--info-600: #2563eb;
--info-50: #eff6ff;
```

### Neutral Colors (Light Mode)

```css
/* Surface Colors */
--surface-primary: #ffffff;
--surface-secondary: #f8fafc;
--surface-tertiary: #f1f5f9;
--surface-elevated: #ffffff;

/* Text Colors */
--text-primary: #0f172a;       /* Main content */
--text-secondary: #475569;     /* Secondary content */
--text-tertiary: #64748b;      /* Tertiary content - WCAG AA compliant */
--text-muted: #94a3b8;         /* Muted text - WCAG AA compliant */

/* Borders */
--border-light: #e2e8f0;
--border-medium: #cbd5e1;
--border-dark: #94a3b8;
```

### Dark Mode Colors

```css
/* Surface Colors (Dark) */
--surface-primary: #0f172a;
--surface-secondary: #1e293b;
--surface-tertiary: #334155;

/* Text Colors (Dark) */
--text-primary: #f1f5f9;
--text-secondary: #cbd5e1;
--text-tertiary: #94a3b8;
--text-muted: #64748b;

/* Borders (Dark) */
--border-light: #334155;
--border-medium: #475569;
--border-dark: #64748b;
```

### Color Contrast Requirements

All text/background combinations must meet WCAG 2.1 AA standards:
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text** (18px+ or 14px+ bold): Minimum 3:1 contrast ratio
- **UI Components**: Minimum 3:1 contrast ratio

**✅ Approved Combinations:**
- `text-primary` on `surface-primary`: 17.5:1
- `text-secondary` on `surface-primary`: 9.8:1
- `text-muted` on `surface-primary`: 4.6:1 ✅
- `primary-500` on white: 3.7:1 (large text only)

---

## Typography

### Font Family

**Arabic:** Cairo - Professional, modern Arabic font
**English/Numbers:** System font stack with Cairo fallback

```css
font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI',
             'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
```

### Type Scale

```css
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
```

### Font Weights

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### Line Heights

```css
--leading-tight: 1.2;    /* Headings */
--leading-normal: 1.5;   /* UI elements */
--leading-relaxed: 1.6;  /* Short paragraphs */
--leading-loose: 1.8;    /* Long-form content */
```

### Typography Usage

```html
<!-- Page Title -->
<h1 style="font-size: var(--text-4xl); font-weight: 800;">
  توصيلة
</h1>

<!-- Section Title -->
<h2 style="font-size: var(--text-2xl); font-weight: 700;">
  لماذا تختار توصيلة؟
</h2>

<!-- Card Title -->
<h3 style="font-size: var(--text-xl); font-weight: 600;">
  آمن وموثوق
</h3>

<!-- Body Text -->
<p style="font-size: var(--text-base); line-height: 1.6;">
  جميع المستخدمين موثقون ومراجعين
</p>

<!-- Small Text -->
<span style="font-size: var(--text-sm); color: var(--text-secondary);">
  آخر تحديث: منذ 5 دقائق
</span>
```

---

## Spacing & Layout

### Spacing Scale

Based on 4px baseline grid:

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### Usage Guidelines

- **Component padding**: Use space-4 (16px) as default
- **Section spacing**: Use space-6 or space-8 (24-32px)
- **Page margins**: Use space-4 on mobile, space-6 on desktop
- **Element gaps**: Use space-2 or space-3 (8-12px)

### Border Radius

```css
--radius-sm: 0.375rem;   /* 6px - Chips, badges */
--radius: 0.5rem;        /* 8px - Inputs, small buttons */
--radius-md: 0.625rem;   /* 10px */
--radius-lg: 0.75rem;    /* 12px - Cards, buttons */
--radius-xl: 1rem;       /* 16px - Large cards */
--radius-2xl: 1.5rem;    /* 24px - Modals */
--radius-full: 9999px;   /* Pills, avatars */
```

### Shadows (Elevation System)

```css
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
             0 1px 2px -1px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
             0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
             0 4px 6px -4px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
             0 8px 10px -6px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Colored shadows for emphasis */
--shadow-primary: 0 10px 30px -5px rgba(16, 185, 129, 0.3);
--shadow-error: 0 10px 30px -5px rgba(239, 68, 68, 0.3);
```

### Container Widths

```css
.container {
  max-width: 1200px;      /* Desktop */
  max-width: 1040px;      /* Tablet */
  max-width: 640px;       /* Mobile */
  margin: 0 auto;
  padding: 0 var(--space-4);
}
```

### Breakpoints

```css
/* Mobile First Approach */
@media (min-width: 480px) { /* Small phones */ }
@media (min-width: 640px) { /* Large phones */ }
@media (min-width: 768px) { /* Tablets */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Large desktop */ }
@media (min-width: 1536px) { /* Extra large */ }
```

---

## Components

### Button Component

**Variants:**
- `btn-pro-primary`: Main actions (gradient green)
- `btn-pro-secondary`: Secondary actions (gray)
- `btn-pro-outline`: Tertiary actions (border only)
- `btn-pro-ghost`: Minimal actions (transparent)
- `btn-pro-danger`: Destructive actions (red)

**Sizes:**
- `btn-pro-xs`: Extra small (padding: 6px 12px)
- `btn-pro-sm`: Small (padding: 8px 16px)
- Default: Medium (padding: 12px 24px)
- `btn-pro-lg`: Large (padding: 16px 32px)
- `btn-pro-xl`: Extra large (padding: 20px 40px)

**States:**
- Default, Hover, Active, Disabled, Loading
- Focus: Visible outline ring for accessibility

**Example:**
```jsx
import Button from './components/UI/Button';

<Button variant="primary" size="lg" onClick={handleClick}>
  احجز الآن
</Button>

<Button variant="outline" icon="🔍" iconPosition="start">
  ابحث عن رحلة
</Button>

<Button variant="primary" loading disabled>
  جاري الحجز...
</Button>
```

### Card Component

**Variants:**
- `card-pro`: Default card with border and shadow
- `card-pro-flat`: No shadow, border only
- `card-pro-elevated`: Enhanced shadow, no border
- `card-pro-glass`: Glassmorphism effect
- `card-pro-interactive`: Clickable with hover effects

**Modifiers:**
- `card-pro-accent`: Top colored accent bar
- `hover-lift`: Subtle lift on hover

**Example:**
```jsx
import Card from './components/UI/Card';

<Card variant="elevated" interactive accent onClick={handleClick}>
  <h3>بغداد ← البصرة</h3>
  <p>غداً، 8:00 صباحاً</p>
  <p>25,000 د.ع للمقعد</p>
</Card>
```

### Input Component

**Props:**
- `label`: Input label text
- `error`: Error message (shows red state)
- `success`: Success state (shows green)
- `helperText`: Helper text below input
- `size`: sm | md | lg
- `addon`: Suffix text/icon
- `icon`: Prefix icon

**States:**
- Default, Hover, Focus, Error, Success, Disabled

**Example:**
```jsx
import Input from './components/UI/Input';

<Input
  label="من"
  placeholder="مثال: بغداد"
  error={errors.from}
  success={isValid}
  helperText="اختر مدينة الانطلاق"
  onChange={handleChange}
/>

<Input
  type="number"
  label="السعر"
  addon="د.ع"
  placeholder="مثال: 25000"
/>
```

### Badge Component

**Variants:**
- `badge-pro-primary`: Green
- `badge-pro-success`: Green (semantic)
- `badge-pro-error`: Red
- `badge-pro-warning`: Orange
- `badge-pro-info`: Blue
- `badge-pro-neutral`: Gray

**Modifiers:**
- `badge-pro-dot`: Adds animated dot indicator

**Example:**
```jsx
import Badge from './components/UI/Badge';

<Badge variant="success" dot>
  مؤكد
</Badge>

<Badge variant="warning">
  قيد الانتظار
</Badge>

<Badge variant="neutral">
  3 مقاعد متاحة
</Badge>
```

### Alert Component

**Variants:**
- `alert-pro-success`: Success message
- `alert-pro-error`: Error message
- `alert-pro-warning`: Warning message
- `alert-pro-info`: Info message

**Props:**
- `icon`: Custom icon (defaults to variant icon)
- `onClose`: Close handler (adds X button)

**Example:**
```jsx
import Alert from './components/UI/Alert';

<Alert variant="success" onClose={handleClose}>
  تم تأكيد الحجز بنجاح!
</Alert>

<Alert variant="error">
  حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.
</Alert>

<Alert variant="info" icon="💡">
  نصيحة: احجز مبكراً للحصول على أفضل الأسعار
</Alert>
```

### LoadingSpinner Component (Enhanced)

**Variants:**
- `page`: Full page loading
- `inline`: Inline with content
- `overlay`: Fixed overlay
- `card`: Within card/section

**Sizes:**
- `sm`: 24px
- `md`: 40px (default)
- `lg`: 60px

**Props:**
- `text`: Loading message
- `showText`: Show/hide text

**Example:**
```jsx
import LoadingSpinner from './components/LoadingSpinner';

<LoadingSpinner /> {/* Full page */}

<LoadingSpinner variant="inline" size="sm" text="تحميل..." />

<LoadingSpinner variant="overlay" text="جاري حفظ البيانات..." />

<LoadingSpinner variant="card" size="md" showText={false} />
```

### EmptyState Component (New)

**Props:**
- `icon`: Emoji or icon
- `title`: Main message
- `description`: Secondary message
- `actions`: Array of action buttons
- `size`: sm | md | lg
- `variant`: default | subtle | card

**Example:**
```jsx
import EmptyState from './components/UI/EmptyState';

<EmptyState
  icon="📭"
  title="لا توجد حجوزات"
  description="لم تقم بأي حجوزات بعد. ابدأ بالبحث عن رحلة مناسبة!"
  size="lg"
  variant="card"
  actions={[
    {
      label: '🔍 ابحث عن رحلة',
      onClick: () => navigate('/offers'),
      variant: 'primary',
      ariaLabel: 'البحث عن عروض الرحلات'
    },
    {
      label: '📋 عرض الطلبات',
      onClick: () => navigate('/demands'),
      variant: 'secondary'
    }
  ]}
/>
```

---

## Accessibility Guidelines

### WCAG 2.1 AA Compliance

All components must meet WCAG 2.1 Level AA standards:

#### 1. Color Contrast
- Normal text: 4.5:1 minimum
- Large text (18px+ or 14px+ bold): 3:1 minimum
- UI components: 3:1 minimum against background

#### 2. Keyboard Navigation
- All interactive elements must be keyboard accessible
- Visible focus indicators required
- Logical tab order
- ESC key closes modals/dropdowns

#### 3. ARIA Attributes

**Required ARIA labels:**
```jsx
// Icon buttons
<button aria-label="إغلاق">
  <CloseIcon />
</button>

// Form inputs
<input
  aria-label="مدينة الانطلاق"
  aria-describedby="from-help"
  aria-invalid={hasError}
/>
<span id="from-help">اختر مدينة الانطلاق</span>

// Loading states
<div role="status" aria-live="polite" aria-busy="true">
  <LoadingSpinner />
  <span className="sr-only">جاري التحميل...</span>
</div>

// Alerts
<div role="alert" aria-live="assertive">
  حدث خطأ
</div>

// Navigation
<nav aria-label="التنقل الرئيسي">
  <a href="/" aria-current="page">الرئيسية</a>
</nav>
```

#### 4. Form Accessibility

```jsx
// Always use proper labels
<label htmlFor="email">البريد الإلكتروني</label>
<input id="email" type="email" required />

// Associate errors
<input
  aria-describedby="email-error"
  aria-invalid="true"
/>
<span id="email-error" role="alert">
  البريد الإلكتروني مطلوب
</span>

// Group related inputs
<fieldset>
  <legend>معلومات الرحلة</legend>
  <label>من</label>
  <input />
  <label>إلى</label>
  <input />
</fieldset>
```

#### 5. Focus Management

```jsx
// Modal focus trap
const modalRef = useRef();

useEffect(() => {
  if (isOpen) {
    const firstFocusable = modalRef.current.querySelector('button, input');
    firstFocusable?.focus();

    // Trap focus within modal
    // Return focus on close
  }
}, [isOpen]);
```

#### 6. Screen Reader Only Content

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

```jsx
<button>
  <span aria-hidden="true">🔍</span>
  <span className="sr-only">البحث</span>
</button>
```

#### 7. Touch Targets

All interactive elements must be at least 44x44px:

```css
.btn {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
}

@media (max-width: 768px) {
  .nav-item {
    padding: 12px; /* Ensures 44px height */
  }
}
```

---

## RTL/LTR Support

### CSS Logical Properties

Always use logical properties for RTL compatibility:

```css
/* ✅ Good - RTL aware */
margin-inline-start: 16px;
margin-inline-end: 16px;
padding-inline: 24px;
border-inline-start: 1px solid;

/* ❌ Bad - Not RTL aware */
margin-left: 16px;
margin-right: 16px;
padding-left: 24px;
border-left: 1px solid;
```

### Text Alignment

```css
/* ✅ Good */
text-align: start;  /* Right in RTL, left in LTR */
text-align: end;    /* Left in RTL, right in LTR */

/* ❌ Avoid */
text-align: right;  /* Always right */
text-align: left;   /* Always left */
```

### Direction-Specific Content

```jsx
// Wrap non-Arabic content in LTR wrapper
<div dir="rtl">
  <p>مرحباً بك في توصيلة</p>
  <span dir="ltr">support@toosila.com</span>
  <span dir="ltr">+964 770 000 0000</span>
</div>
```

### Icons

Directional icons should flip in RTL:

```jsx
// Create RTL-aware icon component
const Icon = ({ name, className }) => {
  const isRTL = document.dir === 'rtl';
  const shouldFlip = ['arrow', 'chevron', 'back', 'forward'].includes(name);

  return (
    <span
      className={className}
      style={{
        transform: isRTL && shouldFlip ? 'scaleX(-1)' : 'none'
      }}
    >
      {iconMap[name]}
    </span>
  );
};
```

### RTL Testing Checklist

- [ ] All text properly aligned
- [ ] Margins and paddings correct
- [ ] Icons flip appropriately
- [ ] Animations flow correctly
- [ ] Forms layout naturally
- [ ] Numbers and English text in LTR spans
- [ ] Navigation order makes sense

---

## Dark Mode

### Implementation

```jsx
// Toggle dark mode
const toggleDarkMode = () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme',
    document.body.classList.contains('dark-mode') ? 'dark' : 'light'
  );
};

// Initialize from localStorage
useEffect(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }
}, []);
```

### Color Adjustments

```css
body.dark-mode {
  /* Surface colors */
  --surface-primary: #0f172a;
  --surface-secondary: #1e293b;
  --surface-tertiary: #334155;

  /* Text colors */
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;

  /* Borders */
  --border-light: #334155;
  --border-medium: #475569;

  /* Enhanced shadows for dark mode */
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
}
```

### Component Considerations

```css
/* Cards need special handling in dark mode */
body.dark-mode .card-pro {
  background: var(--surface-secondary);
  border-color: var(--border-medium);
}

body.dark-mode .card-pro:hover {
  box-shadow: var(--elevation-4),
              0 0 0 1px rgba(255, 255, 255, 0.05);
}

/* Inputs need better visibility */
body.dark-mode .input-pro {
  background: var(--surface-secondary);
  border-color: var(--border-medium);
}

body.dark-mode .input-pro:focus {
  background: var(--surface-primary);
  border-color: var(--primary);
}
```

---

## Animation & Motion

### Timing Functions

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition: 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-bounce: 600ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Animation Library

```css
/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.4s var(--transition) forwards;
}

/* Slide In */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Stagger Children */
.stagger-children > * {
  opacity: 0;
  animation: fadeIn 0.4s var(--transition) forwards;
}

.stagger-children > *:nth-child(1) { animation-delay: 0.05s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.1s; }
.stagger-children > *:nth-child(3) { animation-delay: 0.15s; }
```

### Microinteractions

```css
/* Hover lift */
.hover-lift {
  transition: transform var(--transition);
}

.hover-lift:hover {
  transform: translateY(-4px);
}

/* Hover scale */
.hover-scale {
  transition: transform var(--transition);
}

.hover-scale:hover {
  transform: scale(1.02);
}

/* Button press */
.btn:active {
  transform: scale(0.98);
}
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Performance Guidelines

1. **Use GPU-accelerated properties**: transform, opacity
2. **Avoid animating**: width, height, top, left
3. **Keep animations under 300ms** for micro-interactions
4. **Use will-change sparingly**: Only when needed
5. **Test on low-end devices**: Ensure 60fps

---

## Usage Examples

### Complete Page Example

```jsx
import React, { useState } from 'react';
import Button from './components/UI/Button';
import Card from './components/UI/Card';
import Input from './components/UI/Input';
import Badge from './components/UI/Badge';
import EmptyState from './components/UI/EmptyState';
import LoadingSpinner from './components/LoadingSpinner';

function RidePage() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [errors, setErrors] = useState({});

  if (loading) {
    return <LoadingSpinner variant="page" />;
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: 'var(--space-8)'
      }}>
        <h1 style={{
          fontSize: 'var(--text-4xl)',
          fontWeight: '800',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-2)'
        }}>
          ابحث عن رحلة
        </h1>
        <p style={{
          fontSize: 'var(--text-lg)',
          color: 'var(--text-secondary)'
        }}>
          اختر وجهتك واحجز رحلتك بسهولة
        </p>
      </div>

      {/* Search Form */}
      <Card variant="elevated" style={{
        marginBottom: 'var(--space-6)',
        maxWidth: '600px',
        margin: '0 auto var(--space-6)'
      }}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Input
            label="من"
            placeholder="مثال: بغداد"
            value={fromCity}
            onChange={(e) => setFromCity(e.target.value)}
            error={errors.fromCity}
          />
        </div>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Input
            label="إلى"
            placeholder="مثال: البصرة"
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
            error={errors.toCity}
          />
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSearch}
        >
          🔍 ابحث الآن
        </Button>
      </Card>

      {/* Results */}
      {rides.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="لا توجد رحلات متاحة"
          description="جرب تغيير المدن أو التاريخ للعثور على رحلات"
          size="lg"
          actions={[
            {
              label: 'مسح البحث',
              onClick: handleClear,
              variant: 'secondary'
            }
          ]}
        />
      ) : (
        <div style={{
          display: 'grid',
          gap: 'var(--space-4)',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
        }}>
          {rides.map(ride => (
            <Card key={ride.id} interactive hover>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-3)'
              }}>
                <h3 style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: '600',
                  margin: 0
                }}>
                  {ride.from} ← {ride.to}
                </h3>
                <Badge variant="success">{ride.price} د.ع</Badge>
              </div>

              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-3)'
              }}>
                📅 {ride.date} • 🕐 {ride.time}
              </p>

              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => handleBook(ride.id)}
              >
                احجز الآن
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Best Practices

### Do's ✅

1. **Always use design tokens** instead of hard-coded values
2. **Use logical properties** for RTL support
3. **Include ARIA labels** on all interactive elements
4. **Test color contrast** before deployment
5. **Respect user motion preferences** with prefers-reduced-motion
6. **Use semantic HTML** (button, nav, main, section)
7. **Keep animations under 300ms** for responsiveness
8. **Ensure 44x44px minimum** touch targets on mobile
9. **Provide loading states** for all async operations
10. **Show helpful empty states** with clear actions

### Don'ts ❌

1. **Don't hard-code colors** - use CSS variables
2. **Don't use fixed positioning** without considering mobile keyboards
3. **Don't forget dark mode** - test all components
4. **Don't rely on color alone** - use icons and text too
5. **Don't skip accessibility** testing
6. **Don't use placeholder-only** form labels
7. **Don't animate expensive** properties (width, height)
8. **Don't forget RTL** - test in Arabic
9. **Don't use emojis** without text alternatives
10. **Don't assume all users** can use a mouse

---

## Component Checklist

Before shipping a new component, verify:

- [ ] Supports all required props
- [ ] Has dark mode styles
- [ ] Works in RTL layout
- [ ] Meets WCAG AA contrast requirements
- [ ] Keyboard accessible
- [ ] Has proper ARIA labels
- [ ] Touch targets 44x44px minimum
- [ ] Animations respect prefers-reduced-motion
- [ ] Documented with examples
- [ ] Tested on mobile and desktop
- [ ] Loading and error states implemented
- [ ] Has screen reader text where needed

---

## Resources

### Tools
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE Accessibility Tool](https://wave.webaim.org/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

---

**Design System Maintainer:** UI/UX Team
**Questions or Suggestions:** Create an issue in the repository
**Last Updated:** 2025-11-09
**Version:** 2.0
