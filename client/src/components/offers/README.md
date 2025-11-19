# Offers Components - Mobile-Optimized 📱

Professional React components for the Offers page (`/offers`) with mobile-first design.

---

## Components

### 1. CollapsibleSearchForm

**Purpose:** Mobile-optimized collapsible search form with smooth animations.

**File:** `CollapsibleSearchForm.jsx` + `CollapsibleSearchForm.module.css`

**Usage:**

```jsx
import CollapsibleSearchForm from './components/offers/CollapsibleSearchForm';

<CollapsibleSearchForm
  filters={filters}
  onFiltersChange={setFilters}
  onSearch={handleSearch}
  onClearFilters={clearFilters}
  mainCities={['بغداد', 'البصرة', 'النجف']}
  allCities={ALL_IRAQ_CITIES}
  isDriver={false}
/>;
```

**Props:**

- `filters` (object) - Current filter values
- `onFiltersChange` (function) - Filter change handler
- `onSearch` (function) - Search button handler
- `onClearFilters` (function) - Clear filters handler
- `mainCities` (array) - Main cities for quick filters
- `allCities` (array) - All cities for advanced filters
- `isDriver` (boolean) - User type (optional)

**Features:**

- ✅ Collapsible (collapsed by default)
- ✅ Auto-collapse after search on mobile
- ✅ Advanced filters toggle
- ✅ 48px+ touch targets
- ✅ 16px+ font size (no iOS zoom)
- ✅ WCAG AA compliant

---

### 2. OfferCard

**Purpose:** Mobile-optimized offer card with clear visual hierarchy.

**File:** `OfferCard.jsx` + `OfferCard.module.css`

**Usage:**

```jsx
import OfferCard from './components/offers/OfferCard';

<OfferCard
  offer={offerData}
  onBookNow={handleBooking}
  formatDate={formatDateFunc}
  formatTime={formatTimeFunc}
  currentUser={user}
/>;
```

**Props:**

- `offer` (object) - Offer data:
  - `price` (number) - Price in IQD
  - `fromCity` (string) - Departure city
  - `toCity` (string) - Destination city
  - `departureTime` (string) - ISO date string
  - `availableSeats` (number) - Available seats
  - `driverName` (string) - Driver name
  - `driverRating` (number) - Driver rating (optional)
  - `vehicleType` (string) - Vehicle type (optional)
  - `additionalInfo` (string) - Extra info (optional)
- `onBookNow` (function) - Book button handler
- `formatDate` (function) - Date formatter
- `formatTime` (function) - Time formatter
- `currentUser` (object) - Current user data

**Features:**

- ✅ Full-width on mobile
- ✅ Large price (32-42px)
- ✅ Clear route (20-24px)
- ✅ Icon-based details
- ✅ 56px book button
- ✅ Touch feedback animations
- ✅ Dark mode support

---

## Installation

These components are ready to use. Just import them in your `ViewOffers.js`:

```jsx
import CollapsibleSearchForm from '../../components/offers/CollapsibleSearchForm';
import OfferCard from '../../components/offers/OfferCard';
```

---

## Responsive Breakpoints

- **≤375px:** Extra small mobile (iPhone SE)
- **≤480px:** Small mobile
- **≤640px:** Mobile (single column)
- **640px-1024px:** Tablet (2 columns)
- **≥1024px:** Desktop (4 columns)

---

## Accessibility

- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation support
- ✅ Focus indicators (3px outline)
- ✅ Touch targets ≥48px (WCAG AA)
- ✅ Color contrast ratios ≥4.5:1
- ✅ Reduced motion support

---

## Performance

- ✅ CSS Modules (tree-shaking)
- ✅ Hardware-accelerated animations
- ✅ Memoized callbacks
- ✅ No layout shifts

---

## Dark Mode

Both components automatically support dark mode via CSS variables:

```css
body.dark-mode .component {
  background: var(--surface-secondary);
  color: var(--text-primary);
}
```

---

## Browser Support

- ✅ iOS Safari 12+
- ✅ Chrome Mobile 70+
- ✅ Firefox Mobile 68+
- ✅ Samsung Internet 10+
- ✅ Desktop browsers (all modern)

---

## License

Part of Toosila Rideshare Application
