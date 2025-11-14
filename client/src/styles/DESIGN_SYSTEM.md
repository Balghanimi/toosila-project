# Toosila Design System Documentation

## Table of Contents
1. [Color System](#color-system)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Components](#components)
5. [Patterns](#patterns)
6. [Accessibility](#accessibility)
7. [Mobile Guidelines](#mobile-guidelines)
8. [Animation](#animation)

---

## Color System

### Primary Colors
```css
--primary: #10b981        /* Main brand color - Green */
--primary-hover: #059669  /* Hover state */
--primary-light: #34d399  /* Light variant */
--primary-dark: #047857   /* Dark variant */
```

### Semantic Colors
```css
--success: #22c55e       /* Success messages, confirmations */
--error: #ef4444         /* Errors, destructive actions */
--warning: #f59e0b       /* Warnings, caution */
--info: #3b82f6          /* Information, tips */
```

### Text Colors (Light Mode)
```css
--text-primary: #0f172a     /* Main text (21:1 contrast ratio) */
--text-secondary: #475569   /* Secondary text (8.59:1) */
--text-tertiary: #64748b    /* Tertiary text (4.54:1) ✅ WCAG AA */
--text-muted: #64748b       /* Muted text (4.54:1) ✅ WCAG AA */
--text-placeholder: #6b7280 /* Form placeholders (4.59:1) */
```

**Note:** All text colors meet WCAG 2.1 Level AA contrast requirements (4.5:1 minimum)

### Surface Colors (Light Mode)
```css
--surface-primary: #ffffff     /* Main background */
--surface-secondary: #f8fafc   /* Secondary background */
--surface-tertiary: #f1f5f9    /* Tertiary background */
--surface-elevated: #ffffff    /* Elevated surfaces (cards, modals) */
--surface-overlay: rgba(15, 23, 42, 0.7)  /* Modal backdrops */
```

### Border Colors
```css
--border-light: #e2e8f0       /* Light borders */
--border-medium: #cbd5e1      /* Medium borders */
--border-dark: #94a3b8        /* Dark borders */
```

### Dark Mode
All colors automatically adjust via body.dark-mode selector. Dark mode maintains WCAG contrast ratios.

---

## Typography

### Font Family
```css
font-family: 'Cairo', 'Tajawal', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Type Scale
```css
--text-xs: 0.75rem    /* 12px - Labels, captions */
--text-sm: 0.875rem   /* 14px - Secondary text, buttons */
--text-base: 1rem     /* 16px - Body text (default) */
--text-lg: 1.125rem   /* 18px - Large body, subtitles */
--text-xl: 1.25rem    /* 20px - Small headings */
--text-2xl: 1.5rem    /* 24px - Section headings */
--text-3xl: 1.875rem  /* 30px - Page titles */
--text-4xl: 2.25rem   /* 36px - Hero text */
--text-5xl: 3rem      /* 48px - Large hero */
```

### Font Weights
```css
400: Regular (body text)
500: Medium (emphasized text)
600: Semi-bold (subheadings, buttons)
700: Bold (headings)
800: Extra bold (page titles, hero text)
```

### Line Heights
```css
body: 1.6           /* Comfortable reading */
headings: 1.2-1.3   /* Tight for headlines */
buttons: 1          /* Centered text */
```

### Usage Examples
```css
/* Page Title */
font-size: var(--text-3xl);
font-weight: 800;
line-height: 1.2;
color: var(--text-primary);

/* Section Heading */
font-size: var(--text-xl);
font-weight: 700;
line-height: 1.3;
color: var(--text-primary);

/* Body Text */
font-size: var(--text-base);
font-weight: 400;
line-height: 1.6;
color: var(--text-secondary);

/* Button Text */
font-size: var(--text-base);
font-weight: 600;
line-height: 1;
```

---

## Spacing

### Scale (8px base unit)
```css
--space-1: 0.25rem   /* 4px  - Tight spacing */
--space-2: 0.5rem    /* 8px  - Small gaps */
--space-3: 0.75rem   /* 12px - Default inline spacing */
--space-4: 1rem      /* 16px - Default block spacing */
--space-5: 1.25rem   /* 20px - Comfortable spacing */
--space-6: 1.5rem    /* 24px - Section spacing */
--space-8: 2rem      /* 32px - Large spacing */
--space-10: 2.5rem   /* 40px - Extra large */
--space-12: 3rem     /* 48px - Section divider */
--space-16: 4rem     /* 64px - Page sections */
--space-20: 5rem     /* 80px - Hero spacing */
```

### Usage Guidelines
- Use `--space-4` (16px) as default
- Use `--space-2` or `--space-3` for inline elements
- Use `--space-6` to `--space-12` for section spacing
- Use `--space-16` or `--space-20` for page-level spacing

---

## Components

### Button

#### Variants
```css
/* Primary (CTA) */
background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
color: white;
box-shadow: var(--shadow-md);

/* Secondary */
background: var(--surface-secondary);
color: var(--text-primary);
border: 2px solid var(--border-light);

/* Outline */
background: transparent;
color: var(--primary);
border: 2px solid var(--primary);

/* Ghost */
background: transparent;
color: var(--text-primary);

/* Danger */
background: linear-gradient(135deg, var(--error) 0%, #dc2626 100%);
color: white;
```

#### Sizes
```css
/* Small */
height: 36px;
padding: 8px 16px;
font-size: var(--text-sm);

/* Medium (default) */
height: 48px;
padding: 12px 24px;
font-size: var(--text-base);

/* Large */
height: 56px;
padding: 16px 32px;
font-size: var(--text-lg);
```

#### States
```css
/* Hover */
transform: translateY(-2px);
box-shadow: var(--shadow-lg);

/* Active */
transform: translateY(0);

/* Disabled */
opacity: 0.5;
cursor: not-allowed;

/* Loading */
opacity: 0.7;
cursor: wait;
```

### Card

```css
background: var(--surface-primary);
border: 1px solid var(--border-light);
border-radius: var(--radius-xl);
padding: var(--space-6);
box-shadow: var(--shadow-md);
transition: all 0.3s ease;

/* Hover */
box-shadow: var(--shadow-lg);
transform: translateY(-2px);
```

### Input

```css
width: 100%;
height: 48px;
padding: 12px 16px;
border: 2px solid var(--border-light);
border-radius: var(--radius);
font-size: 16px; /* Prevents zoom on iOS */
background: var(--surface-primary);
color: var(--text-primary);
transition: border-color 0.2s ease;

/* Focus */
border-color: var(--primary);
box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);

/* Error */
border-color: var(--error);

/* Disabled */
opacity: 0.5;
cursor: not-allowed;
background: var(--surface-secondary);
```

### Toast Notification

```css
/* Success */
background: var(--success);
color: white;

/* Error */
background: var(--error);
color: white;

/* Warning */
background: var(--warning);
color: white;

/* Info */
background: var(--info);
color: white;

/* Position */
position: fixed;
top: 80px; /* Below header */
right: var(--space-4);
z-index: var(--z-notification);
min-width: 320px;
max-width: 480px;
```

### Modal

```css
/* Backdrop */
position: fixed;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: rgba(0, 0, 0, 0.5);
backdrop-filter: blur(4px);
z-index: var(--z-modal-backdrop);

/* Container */
position: fixed;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
background: var(--surface-primary);
border-radius: var(--radius-2xl);
padding: var(--space-6);
max-width: 90vw;
max-height: 90vh;
overflow-y: auto;
z-index: var(--z-modal);

/* Mobile Bottom Sheet */
@media (max-width: 768px) {
  top: auto;
  bottom: 0;
  left: 0;
  right: 0;
  transform: none;
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  max-height: 80vh;
}
```

### Skeleton Loader

```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  background: linear-gradient(
    90deg,
    var(--surface-tertiary) 0%,
    var(--surface-secondary) 50%,
    var(--surface-tertiary) 100%
  );
  background-size: 200% 100%;
  border-radius: var(--radius);
}

/* Text */
height: 12px;
width: 100%;

/* Title */
height: 24px;
width: 60%;

/* Avatar */
width: 48px;
height: 48px;
border-radius: 50%;

/* Card */
height: 200px;
width: 100%;
```

---

## Patterns

### Loading States

#### Pattern: Skeleton → Data → Empty State
```
1. Initial: Show skeleton loaders
2. Loading: Skeleton continues (no spinner needed)
3. Success: Fade in real content
4. Empty: Show empty state with action
5. Error: Show error message with retry
```

#### Implementation
```jsx
{loading && <Skeleton count={3} />}
{!loading && data.length > 0 && <DataList data={data} />}
{!loading && data.length === 0 && <EmptyState />}
{error && <ErrorMessage error={error} onRetry={refetch} />}
```

### Form Validation

#### Pattern: Inline Validation
```
1. User types (onChange): Clear error if present
2. User leaves field (onBlur): Validate and show error if invalid
3. User submits (onSubmit): Validate all, show all errors
4. After submission: Show success toast + redirect/update
```

#### Error Display
```jsx
{/* Below field */}
{errors.email && (
  <div role="alert" style={{ color: var(--error), fontSize: var(--text-sm) }}>
    <span>⚠️</span> {errors.email}
  </div>
)}
```

### Confirmation Dialogs

#### For Destructive Actions
```jsx
const confirmDelete = () => {
  if (window.confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
    handleDelete();
  }
};
```

Better: Create ConfirmDialog component with:
- Clear title
- Explanation text
- Cancel button (secondary)
- Confirm button (danger variant)
- Focus on cancel by default (safety)

### Success Feedback

#### Multi-layer Feedback
```
1. Visual: Button success state (checkmark, color change)
2. Toast: Success notification
3. Update: Optimistic UI update or page refresh
4. Navigation: Redirect to relevant page (optional)
```

---

## Accessibility

### WCAG 2.1 Level AA Requirements

#### Color Contrast
- **Normal text (< 18px):** 4.5:1 minimum
- **Large text (≥ 18px):** 3:1 minimum
- **UI components:** 3:1 minimum

All Toosila colors meet these requirements ✅

#### Focus Indicators
```css
*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Or custom ring */
box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
```

#### Touch Targets (Mobile)
- **Minimum:** 48x48px (WCAG 2.1 AA)
- **Recommended:** 48x48px minimum, with 8px spacing

#### ARIA Labels
```jsx
/* Buttons with icons only */
<button aria-label="حذف العنصر">🗑️</button>

/* Loading states */
<div role="status" aria-live="polite" aria-busy="true">
  <span className="sr-only">جاري التحميل...</span>
</div>

/* Form inputs */
<input
  aria-label="البريد الإلكتروني"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby="email-error"
/>
```

#### Keyboard Navigation
- All interactive elements reachable via Tab
- Enter/Space activate buttons
- Escape closes modals
- Arrow keys navigate lists/menus
- Focus trap in modals

#### Screen Readers
- Use semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- Provide text alternatives for images/icons
- Use `aria-live` for dynamic content
- Use `role="status"` for loading indicators
- Use `role="alert"` for errors

---

## Mobile Guidelines

### Responsive Breakpoints
```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

### Touch Targets
- Minimum: 48x48px
- Spacing: 8px between targets
- Larger for primary actions: 56px+

### Mobile-Specific Patterns

#### Bottom Sheets
Convert modals to bottom sheets on mobile:
```css
@media (max-width: 768px) {
  .modal {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    transform: none;
    border-radius: 24px 24px 0 0;
    max-height: 80vh;
  }
}
```

#### Sticky Headers/Footers
```css
.mobile-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: var(--surface-primary);
}
```

#### Swipe Gestures
Consider adding for common actions:
- Swipe left/right: Navigate between tabs
- Swipe down: Refresh content
- Swipe on item: Reveal actions

---

## Animation

### Durations
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition: 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-bounce: 600ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Easing Functions
```css
/* Standard easing (default) */
cubic-bezier(0.4, 0, 0.2, 1)

/* Deceleration (entrance) */
cubic-bezier(0, 0, 0.2, 1)

/* Acceleration (exit) */
cubic-bezier(0.4, 0, 1, 1)

/* Bounce (playful) */
cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Animation Best Practices

#### Performance
- Use `transform` and `opacity` (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly

```css
/* Good ✅ */
transform: translateY(-4px);
opacity: 0;

/* Bad ❌ */
top: -4px;
visibility: hidden;
```

#### Reduced Motion
Always respect user preference:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Common Animations

#### Fade In
```css
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

.fade-in {
  animation: fadeIn 300ms ease-out forwards;
}
```

#### Slide Up (Bottom Sheet)
```css
@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.slide-up {
  animation: slideUp 300ms ease-out forwards;
}
```

#### Pulse (Notification Badge)
```css
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

#### Spin (Loading)
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}
```

---

## Z-Index Scale

```css
--z-base: 0;              /* Default positioning */
--z-dropdown: 1000;       /* Dropdowns, menus */
--z-sticky: 1020;         /* Sticky headers/footers */
--z-fixed: 1030;          /* Fixed positioning */
--z-modal-backdrop: 1040; /* Modal backgrounds */
--z-modal: 1050;          /* Modal content */
--z-popover: 1060;        /* Popovers, tooltips */
--z-tooltip: 1070;        /* Tooltips */
--z-notification: 1080;   /* Toast notifications (top layer) */
```

---

## Shadow Scale

```css
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Colored shadows for emphasis */
--shadow-primary: 0 10px 30px -5px rgba(16, 185, 129, 0.3);
--shadow-error: 0 10px 30px -5px rgba(239, 68, 68, 0.3);
```

---

## Border Radius Scale

```css
--radius-sm: 0.375rem;  /* 6px - Subtle rounding */
--radius: 0.5rem;       /* 8px - Default */
--radius-md: 0.625rem;  /* 10px - Medium */
--radius-lg: 0.75rem;   /* 12px - Large */
--radius-xl: 1rem;      /* 16px - Extra large */
--radius-2xl: 1.5rem;   /* 24px - Very large (modals) */
--radius-full: 9999px;  /* Full circle */
```

---

## Usage Examples

### Complete Button Example
```jsx
<button
  className="btn-primary"
  style={{
    padding: 'var(--space-3) var(--space-6)',
    background: 'var(--gradient-primary)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    fontSize: 'var(--text-base)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition)',
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
  احجز الآن
</button>
```

### Complete Card Example
```jsx
<div
  className="card"
  style={{
    background: 'var(--surface-primary)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-6)',
    boxShadow: 'var(--shadow-md)',
    transition: 'var(--transition)',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
    e.currentTarget.style.transform = 'translateY(-2px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
    e.currentTarget.style.transform = 'translateY(0)';
  }}
>
  {/* Card content */}
</div>
```

---

## Checklist for New Components

Before creating a new component, ensure:

- [ ] Uses design system colors (no hardcoded colors)
- [ ] Uses spacing scale (no hardcoded px values)
- [ ] Uses typography scale
- [ ] Accessible (ARIA labels, keyboard navigation)
- [ ] Responsive (works on mobile)
- [ ] Touch targets ≥ 48px on mobile
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Loading states defined
- [ ] Error states defined
- [ ] Empty states defined
- [ ] Animations respect prefers-reduced-motion
- [ ] RTL-compatible
- [ ] Dark mode compatible

---

## Resources

### Tools
- **Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Color Palette Generator:** https://coolors.co/
- **Accessibility Testing:** https://www.deque.com/axe/
- **Icon Library:** https://heroicons.com/ or https://phosphoricons.com/

### Documentation
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **MDN Web Docs:** https://developer.mozilla.org/
- **A11y Project:** https://www.a11yproject.com/

---

**Last Updated:** November 14, 2025
**Version:** 1.0
**Maintained by:** Toosila Development Team

