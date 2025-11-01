# Toosila Text-as-Car Logo

## Overview
This is a custom SVG logo where the Arabic text "توصيلة" (Toosila) is integrated with car design elements, making the text itself look like a car.

## Design Features

### 1. Text as Car Body
- The Arabic word "توصيلة" serves as the main car body
- Bold, 40px Cairo/Tajawal font for clear readability
- Green gradient fill matching Toosila brand colors (#34C759)

### 2. Car Elements
- **Windshield/Roof**: Trapezoid shape above the text
- **Car Outline**: Subtle curved outline suggesting car body shape
- **Background**: Light green rounded rectangle behind text

### 3. Wheels
- **Two detailed wheels** positioned below the text
- Multi-layered design: tire, rim, hub, spokes
- Dark colors (#1f2937, #374151, #6b7280) for realistic appearance
- Front wheel at position (215, 62)
- Rear wheel at position (65, 62)

### 4. Lighting Effects
- **Front Headlight** (right side): Yellow/amber (#fbbf24) with animated pulse
- **Rear Light** (left side): Red (#ef4444) for brake/tail light
- Positioned at text level for integration

### 5. Motion Effects
- **Speed lines** on the left side
- Three horizontal lines suggesting movement
- Green gradient matching text color
- Semi-transparent for subtle effect

### 6. Ground Element
- Dashed line at bottom suggesting road/ground
- Light gray (#d1d5db) color
- Completes the car-on-road visual

## Technical Specifications

- **Dimensions**: 280px × 80px
- **ViewBox**: 0 0 280 80
- **Color Scheme**:
  - Primary: #34C759 (Toosila Green)
  - Secondary: #28a745, #22c55e (Green variations)
  - Wheels: #1f2937, #374151, #6b7280
  - Lights: #fbbf24 (amber), #ef4444 (red)

## Usage

### In Header Component
```jsx
<img
  src="/toosila-logo-text.svg"
  alt="توصيلة"
  className={styles.logoText}
/>
```

### CSS Styling
```css
.logoText {
  height: 48px;        /* Desktop */
  width: auto;
  object-fit: contain;
  transition: transform 0.3s ease;
}

/* Mobile */
@media (max-width: 768px) {
  .logoText {
    height: 40px;
  }
}

/* Small mobile */
@media (max-width: 480px) {
  .logoText {
    height: 36px;
  }
}
```

## Design Rationale

1. **Readability First**: Text must be clearly readable as "توصيلة"
2. **Car Integration**: Automotive elements enhance without obscuring
3. **Brand Consistency**: Uses Toosila's primary green (#34C759)
4. **RTL-Friendly**: Designed for right-to-left Arabic layout
5. **Professional**: Clean, modern design suitable for a rideshare platform
6. **Scalable**: Vector format works at all sizes
7. **Dark Mode Compatible**: Colors work on both light and dark backgrounds

## File Location
`client/public/toosila-logo-text.svg`

## Created
November 1, 2025

## Notes
- This logo replaces both the separate logo icon and text in the header
- The text IS the logo, with car elements integrated
- Headlight has a subtle animation (2s pulse) for visual interest
- All elements use gradients for depth and professional appearance
