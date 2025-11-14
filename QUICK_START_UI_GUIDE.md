# Toosila UI/UX Quick Start Guide

**Quick reference for developers - bookmark this page!**

---

## 📋 Table of Contents
1. [New Components](#new-components)
2. [Design System Tokens](#design-system-tokens)
3. [Common Patterns](#common-patterns)
4. [Quick Fixes](#quick-fixes)
5. [Checklist](#checklist)

---

## 🎨 New Components

### Toast Notifications
Replace inline notifications with Toast component:

```jsx
import { Toast } from './components/UI';

// Success
<Toast variant="success" message="تم الحفظ بنجاح!" duration={3000} />

// Error
<Toast variant="error" message="حدث خطأ" description="الرجاء المحاولة مرة أخرى" />

// With action
<Toast
  variant="warning"
  message="تحذير"
  action={{ label: 'تراجع', onClick: handleUndo }}
/>
```

### Skeleton Loaders
Replace loading spinners with skeletons:

```jsx
import { SkeletonCard, SkeletonLoader } from './components/UI';

// Card list
{loading ? <SkeletonCard count={3} /> : <CardList data={data} />}

// Custom
{loading ? (
  <SkeletonLoader variant="title" />
  <SkeletonLoader variant="text" count={3} />
) : <Content />}
```

### Confirm Dialog
Replace window.confirm() with ConfirmDialog:

```jsx
import { ConfirmDialog } from './components/UI';

const [showConfirm, setShowConfirm] = useState(false);

<ConfirmDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="حذف العنصر"
  message="هل أنت متأكد؟"
  variant="danger"
/>
```

---

## 🎯 Design System Tokens

### Colors
```jsx
// Text
color: 'var(--text-primary)'      // Main text
color: 'var(--text-secondary)'    // Secondary text
color: 'var(--text-muted)'        // Muted text

// Background
background: 'var(--surface-primary)'    // Main background
background: 'var(--surface-secondary)'  // Secondary background

// Semantic
background: 'var(--primary)'   // Primary action
background: 'var(--success)'   // Success state
background: 'var(--error)'     // Error state
background: 'var(--warning)'   // Warning state
```

### Spacing
```jsx
padding: 'var(--space-2)'   // 8px  - Tight
padding: 'var(--space-4)'   // 16px - Default
padding: 'var(--space-6)'   // 24px - Comfortable
padding: 'var(--space-8)'   // 32px - Spacious
```

### Typography
```jsx
fontSize: 'var(--text-sm)'   // 14px - Small
fontSize: 'var(--text-base)' // 16px - Body (default)
fontSize: 'var(--text-xl)'   // 20px - Subheading
fontSize: 'var(--text-2xl)'  // 24px - Heading
fontSize: 'var(--text-3xl)'  // 30px - Page title
```

### Other
```jsx
borderRadius: 'var(--radius-lg)'  // 12px - Large
boxShadow: 'var(--shadow-md)'     // Medium shadow
transition: 'var(--transition)'    // 300ms ease
```

---

## 🔄 Common Patterns

### Loading Pattern
```jsx
{loading && <SkeletonCard count={3} />}
{!loading && data.length > 0 && data.map(...)}
{!loading && data.length === 0 && <EmptyState />}
{error && <ErrorMessage error={error} />}
```

### Form Validation
```jsx
const [errors, setErrors] = useState({});

// On change - clear error
onChange={(e) => {
  setField(e.target.value);
  if (errors.field) setErrors({...errors, field: ''});
}}

// On blur - validate
onBlur={() => {
  if (!field) setErrors({...errors, field: 'هذا الحقل مطلوب'});
}}

// On submit - validate all
onSubmit={(e) => {
  e.preventDefault();
  const newErrors = validateAll();
  if (Object.keys(newErrors).length === 0) {
    handleSubmit();
  } else {
    setErrors(newErrors);
  }
}}
```

### Button with Loading
```jsx
<button
  onClick={handleAction}
  disabled={loading}
  style={{
    background: loading ? '#9ca3af' : 'var(--primary)',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
  }}
>
  {loading ? 'جاري المعالجة...' : 'إرسال'}
</button>
```

### Hover Effect
```jsx
<div
  style={{
    transition: 'var(--transition)',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
  }}
>
  {/* content */}
</div>
```

---

## ⚡ Quick Fixes

### Fix: Hardcoded Colors
```jsx
// ❌ Before
style={{ color: '#64748b' }}

// ✅ After
style={{ color: 'var(--text-muted)' }}
```

### Fix: Hardcoded Spacing
```jsx
// ❌ Before
style={{ padding: '16px', marginBottom: '24px' }}

// ✅ After
style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}
```

### Fix: Basic Loading Spinner
```jsx
// ❌ Before
{loading && <div>Loading...</div>}

// ✅ After
{loading && <SkeletonCard count={3} />}
```

### Fix: window.confirm()
```jsx
// ❌ Before
if (window.confirm('هل أنت متأكد؟')) {
  handleDelete();
}

// ✅ After
setShowConfirm(true);
// + Add ConfirmDialog component
```

### Fix: Generic Error
```jsx
// ❌ Before
showError('حدث خطأ');

// ✅ After
showError('فشل في حفظ البيانات. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.');
```

### Fix: Missing Focus Indicator
```jsx
// ❌ Before
button { outline: none; }

// ✅ After
button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Fix: Small Touch Target (Mobile)
```jsx
// ❌ Before
<button style={{ width: '32px', height: '32px' }}>×</button>

// ✅ After
<button style={{
  minWidth: '48px',
  minHeight: '48px',
  padding: 'var(--space-2)'
}}>×</button>
```

---

## ✅ Checklist for New Components

Before creating a component, ensure:

**Design System**
- [ ] Uses CSS variables (no hardcoded colors/spacing)
- [ ] Uses typography scale
- [ ] Follows spacing guidelines

**Accessibility**
- [ ] Has proper ARIA labels
- [ ] Keyboard navigable
- [ ] Focus indicators visible
- [ ] Color contrast ≥ 4.5:1
- [ ] Screen reader friendly

**Mobile**
- [ ] Touch targets ≥ 48x48px
- [ ] Works on 320px viewport
- [ ] Responsive layout
- [ ] Modal becomes bottom sheet

**States**
- [ ] Loading state defined
- [ ] Error state defined
- [ ] Empty state defined
- [ ] Disabled state styled
- [ ] Hover state defined

**Performance**
- [ ] Uses transforms for animations (not top/left)
- [ ] Respects prefers-reduced-motion
- [ ] No memory leaks
- [ ] Cleans up timers/listeners

---

## 📊 Component Reference

| Component | Import | Best For |
|-----------|--------|----------|
| Toast | `import { Toast } from './components/UI'` | Success/error feedback |
| SkeletonLoader | `import { SkeletonLoader } from './components/UI'` | Loading states |
| SkeletonCard | `import { SkeletonCard } from './components/UI'` | Card list loading |
| ConfirmDialog | `import { ConfirmDialog } from './components/UI'` | Destructive actions |
| EmptyState | `import { EmptyState } from './components/UI'` | Empty lists |
| Button | `import { Button } from './components/UI'` | All buttons |
| Card | `import { Card } from './components/UI'` | Content cards |

---

## 🎨 Color Contrast Quick Check

All text must meet WCAG 2.1 AA:
- Normal text: **4.5:1** minimum
- Large text (≥18px): **3:1** minimum

✅ Approved Combinations:
```jsx
// Light mode
--text-primary on --surface-primary   // 21:1 ✅
--text-secondary on --surface-primary // 8.59:1 ✅
--text-muted on --surface-primary     // 4.54:1 ✅
```

❌ Don't Use:
```jsx
// These fail WCAG AA
--text-light on --surface-primary     // Too low
#94a3b8 on white                      // 3.12:1 ❌
```

---

## 🚀 Priority Actions

### This Week
1. Replace all `window.confirm()` with `ConfirmDialog`
2. Add `SkeletonCard` to Dashboard, Bookings, Messages
3. Use `Toast` for all success/error messages
4. Fix color contrast issues (use approved colors only)

### Next Week
1. Create Form component library
2. Add focus indicators to all buttons
3. Test keyboard navigation
4. Mobile touch target audit

### This Month
1. Full accessibility audit (axe-core)
2. Screen reader testing
3. Cross-browser testing
4. Performance optimization

---

## 📚 Full Documentation

For complete details, see:
- **Audit:** `/UI_UX_AUDIT_FINDINGS.md`
- **Design System:** `/client/src/styles/DESIGN_SYSTEM.md`
- **Summary:** `/UI_UX_IMPROVEMENTS_SUMMARY.md`

---

## 🆘 Need Help?

**Common Issues:**
- Component not rendering? Check imports in `/components/UI/index.js`
- Style not applying? Make sure CSS variable is defined in `colors.css` or `index.css`
- Animation janky? Use `transform` instead of `top`/`left`
- Contrast too low? Use approved color combinations above

**Resources:**
- Contrast Checker: https://webaim.org/resources/contrastchecker/
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Axe DevTools: https://www.deque.com/axe/devtools/

---

**Last Updated:** November 14, 2025
**Quick Reference v1.0**

