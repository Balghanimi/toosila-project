# Toosila Project Analysis
# For Lines Feature Implementation

## Generated: 2025-12-03

---

## 1. Frontend Structure

### Directory Structure
```
client/src/
├── assets/           # Static assets (logos, images)
├── components/       # Reusable components
│   ├── Admin/        # Admin-specific components
│   ├── Auth/         # Authentication components
│   ├── Chat/         # Chat/messaging components
│   ├── Navegation/   # Navigation components (header, bottom)
│   ├── notifications/# Notification components
│   ├── offers/       # Offer-related components
│   └── UI/           # Core UI component library
├── config/           # Configuration files
├── context/          # React Context providers
├── hooks/            # Custom React hooks
├── pages/            # Page components
│   ├── admin/        # Admin pages
│   ├── demands/      # Demand pages
│   └── offers/       # Offer pages
├── services/         # API service files
├── styles/           # Global CSS styles
└── utils/            # Utility functions
```

### Page Components (client/src/pages/)
| File | Purpose |
|------|---------|
| Home.js | Main homepage with offer/demand forms |
| Dashboard.js | User dashboard |
| Bookings.js | User's bookings management |
| Messages.js | Messaging system |
| Profile.js | User profile |
| Settings.js | User settings |
| PhoneLogin.js | Phone-based authentication |
| NotificationsPage.jsx | Notifications list |
| About.js, Contact.js, Download.js | Static pages |
| PrivacyPolicy.js | Legal pages |
| offers/ViewOffers.js | Browse driver offers |
| demands/ViewDemands.js | Browse passenger demands |
| admin/AdminDashboard.js | Admin panel |
| admin/UserManagement.js | Admin user management |
| admin/VerificationManagement.js | ID verification |
| admin/AdminStatistics.js | Admin statistics |

### Shared Components (client/src/components/)
| Path | Component | Purpose |
|------|-----------|---------|
| UI/Button.jsx | Button, ButtonGroup | Primary button components |
| UI/Card.jsx | Card | Card container |
| UI/Input.jsx | Input | Form input |
| UI/Badge.jsx | Badge | Status badges |
| UI/Alert.jsx | Alert | Alert messages |
| UI/Toast.jsx | Toast, ToastContainer | Toast notifications |
| UI/ConfirmDialog.jsx | ConfirmDialog | Confirmation modals |
| UI/EmptyState.jsx | EmptyState | Empty state displays |
| UI/SkeletonLoader.jsx | SkeletonCard, SkeletonListItem, etc. | Loading skeletons |
| UI/SearchableCitySelect.jsx | SearchableCitySelect | Creatable city dropdown |
| BottomNav.js | BottomNav | Mobile bottom navigation |
| Navegation/header.jsx | Header | Top header/navbar |
| BookingModal.js | BookingModal | Booking confirmation |
| RatingModal.js | RatingModal | Rating submission |
| Chat/ChatModal.js | ChatModal | Chat interface |
| LoadingSpinner.jsx | LoadingSpinner | Loading indicator |
| ErrorBoundary.js | ErrorBoundary | Error handling |

---

## 2. Backend Structure

### Directory Structure
```
server/
├── config/           # Configuration files (db, env, logger, swagger)
├── controllers/      # Request handlers
├── database/         # Database migrations
├── middlewares/      # Express middlewares
├── models/           # Data models
├── routes/           # API route definitions
├── scripts/          # Utility scripts
├── services/         # Business logic services
├── utils/            # Helper utilities
└── __tests__/        # Test files
```

### Routes (server/routes/)
| File | API Path | Purpose |
|------|----------|---------|
| auth.routes.js | /api/auth | User authentication |
| otp.routes.js | /api/otp | Phone OTP verification |
| offers.routes.js | /api/offers | Driver ride offers |
| demands.routes.js | /api/demands | Passenger ride demands |
| demandResponses.routes.js | /api/demand-responses | Driver responses to demands |
| bookings.routes.js | /api/bookings | Ride bookings |
| messages.routes.js | /api/messages | Chat messages |
| ratings.routes.js | /api/ratings | User ratings |
| notifications.routes.js | /api/notifications | Push notifications |
| cities.routes.js | /api/cities | City list management |
| stats.routes.js | /api/stats | Statistics |
| verification.routes.js | /api/verification | ID verification |
| admin.routes.js | /api/admin | Admin endpoints |
| health.routes.js | /api/health | Health checks |

### Controllers (server/controllers/)
| File | Handles |
|------|---------|
| auth.controller.js | User registration, login, profile |
| offers.controller.js | CRUD for offers |
| demands.controller.js | CRUD for demands |
| demandResponses.controller.js | Driver responses to demands |
| bookings.controller.js | Booking management |
| messages.controller.js | Chat functionality |
| ratings.controller.js | Rating system |
| notifications.controller.js | Notification management |
| cities.controller.js | City management |
| stats.controller.js | Statistics |
| verification.controller.js | ID verification |

### Models (server/models/)
| File | Table/Entity |
|------|--------------|
| users.model.js | users |
| offers.model.js | offers |
| demands.model.js | demands |
| demandResponses.model.js | demand_responses |
| bookings.model.js | bookings |
| messages.model.js | messages |
| ratings.model.js | ratings |
| notifications.model.js | notifications |
| verificationDocuments.model.js | verification_documents |
| emergencyAlerts.model.js | emergency_alerts |

### Main Entry Point
- **server/app.js** - Express app configuration
- **server/server.js** - Server startup (likely)

---

## 3. Database

### Existing Tables (from init-db.sql and migrations)
| Table | Purpose |
|-------|---------|
| users | User accounts (id, name, email, phone, password_hash, is_driver, role, etc.) |
| offers | Driver ride offers (from_city, to_city, departure_time, seats, price) |
| demands | Passenger ride demands (from_city, to_city, earliest_time, latest_time, seats) |
| demand_responses | Driver responses to passenger demands |
| bookings | Confirmed ride bookings |
| messages | Chat messages between users |
| ratings | User ratings (1-5 stars + comment) |
| notifications | User notifications |
| categories | City categories (deprecated?) |
| refresh_tokens | JWT refresh tokens |
| otp_requests | Phone verification OTPs |

### Migration Files Location
- **server/database/migrations/** - Main migrations folder
- **server/migrations/** - Legacy migrations folder

### Key Migrations
| Migration | Purpose |
|-----------|---------|
| 006_add_user_role.sql | Added role column (user/admin/moderator) |
| 007_add_email_verification.sql | Email verification fields |
| 017_add_phone_verification.sql | Phone verification fields |

### Database Configuration
- **server/config/db.js** - PostgreSQL connection pool
- **server/config/env.js** - Environment variables

---

## 4. Shared/Reusable Components

### UI Component Library (client/src/components/UI/)
```javascript
// Import all from index.js
export { Button, ButtonGroup } from './Button';
export { Card } from './Card';
export { Input } from './Input';
export { Badge } from './Badge';
export { Alert } from './Alert';
export { EmptyState } from './EmptyState';
export { Toast, ToastContainer } from './Toast';
export { SkeletonLoader, SkeletonCard, SkeletonListItem } from './SkeletonLoader';
export { ConfirmDialog } from './ConfirmDialog';
```

### Navigation Components
| Component | Path | Props |
|-----------|------|-------|
| Header | components/Navegation/header.jsx | Uses AuthContext, LanguageContext, NotificationContext |
| BottomNav | components/BottomNav.js | Uses AuthContext, LanguageContext, NotificationContext |

### Styling
- **CSS Modules** - Used for component styling (.module.css files)
- **CSS Variables** - Defined in index.css for theming
- **Dark Mode** - Supported via ThemeContext and body.dark-mode class
- **Font** - Cairo (Arabic-friendly)

---

## 5. Routing System

### Router: React Router v6
- **Location**: Defined in `client/src/App.js`

### Route Structure
```jsx
<Routes>
  {/* Main Pages */}
  <Route path="/" element={<Home />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/messages" element={<Messages />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/bookings" element={<Bookings />} />
  <Route path="/settings" element={<Settings />} />

  {/* Offers & Demands */}
  <Route path="/offers" element={<ViewOffers />} />
  <Route path="/demands" element={<ViewDemands />} />

  {/* Auth */}
  <Route path="/login" element={<PhoneLogin />} />
  <Route path="/register" element={<PhoneLogin />} />

  {/* Admin (Protected) */}
  <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
    <Route index element={<AdminDashboard />} />
    <Route path="users" element={<UserManagement />} />
    <Route path="verification" element={<VerificationManagement />} />
    <Route path="statistics" element={<AdminStatistics />} />
  </Route>

  {/* Static Pages */}
  <Route path="/about" element={<About />} />
  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
  <Route path="/download" element={<Download />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/notifications" element={<NotificationsPage />} />
</Routes>
```

### Protected Routes
- **AdminRoute** component (client/src/components/Admin/AdminRoute.jsx)
- Checks `user.role === 'admin'` from AuthContext

---

## 6. State Management

### Method: React Context API
All contexts are in `client/src/context/`

### Context Providers (wrapped in App.js)
| Context | Purpose | Key State |
|---------|---------|-----------|
| AuthContext.js | User authentication | user, isAuthenticated, login, logout, toggleUserType |
| ThemeContext.jsx | Dark/Light mode | theme, toggleTheme |
| LanguageContext.js | i18n (ar/en) | language, t(), toggleLanguage |
| OffersContext.js | Offers data | offers, loading, fetchOffers |
| DemandsContext.js | Demands data | demands, loading, fetchDemands |
| BookingContext.js | Bookings | bookings, createBooking |
| MessagesContext.js | Chat messages | messages, sendMessage |
| NotificationContext.js | Notification polling | pendingBookings, unreadMessages |
| NotificationsContext.jsx | Push notifications | notifications |
| RatingContext.js | Rating system | ratings |
| SocketContext.jsx | WebSocket (future) | socket |
| ConnectionContext.js | Network status | isOnline |

### Provider Hierarchy (from App.js)
```jsx
<ConnectionProvider>
  <ThemeProvider>
    <LanguageProvider>
      <AuthProvider>
        <SocketProvider>
          <NotificationsProvider>
            <NotificationProvider>
              <MessagesProvider>
                <BookingsProvider>
                  <OffersProvider>
                    <DemandsProvider>
                      <RatingProvider>
                        {/* App Content */}
                      </RatingProvider>
                    </DemandsProvider>
                  </OffersProvider>
                </BookingsProvider>
              </MessagesProvider>
            </NotificationProvider>
          </NotificationsProvider>
        </SocketProvider>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
</ConnectionProvider>
```

---

## 7. API Communication

### Method: Native fetch with wrapper
- **File**: `client/src/services/api.js`

### API Base URL
```javascript
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://toosila-backend-production.up.railway.app/api'
    : 'http://localhost:5000/api');
```

### API Request Pattern
```javascript
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  // Error handling, JSON parsing
  return data;
};
```

### Available API Modules
| Module | Example Methods |
|--------|-----------------|
| authAPI | register, login, getProfile, updateProfile |
| offersAPI | getAll, getById, create, update, delete |
| demandsAPI | getAll, getById, create, update, delete |
| bookingsAPI | getAll, getMyBookings, create, updateStatus |
| messagesAPI | getConversations, sendMessage, markAsRead |
| ratingsAPI | create, getUserRatings |
| notificationsAPI | getNotifications, markAsRead, markAllAsRead |
| citiesAPI | getAll, add |
| demandResponsesAPI | create, getByDemandId, updateStatus |
| adminAPI | getAllUsers, getPendingVerifications |
| otpAPI | send, verify, completeRegistration |

---

## 8. Current Home Page Analysis

### File: client/src/pages/Home.js

### Current Modes
The homepage has a mode selector with 3 modes:
1. **offer** - Post a driver offer (for drivers)
2. **demand** - Post a passenger demand (for passengers)
3. **find** - Search for rides (redirects to /offers or /demands)

### Key Features
- City selection (pickup + drop) with SearchableCitySelect
- Date picker (today/tomorrow/custom)
- Time picker
- Seats selector (1-4)
- Price per seat input
- Submit button (creates offer or demand via API)

### Mode Selection UI (current)
```jsx
<div className={styles.modeButtons}>
  {currentUser?.isDriver && (
    <button onClick={() => setMode('offer')}>🚗 نشر رحلة</button>
  )}
  {!currentUser?.isDriver && (
    <button onClick={() => setMode('demand')}>💺 طلب رحلة</button>
  )}
  <button onClick={() => navigate('/offers')}>🔍 ابحث عن رحلة</button>
</div>
```

### Where to Add Lines Mode Selection
The mode buttons section (lines 311-355) is the ideal location to add a top-level mode switcher:
- **Before** mode buttons: Add "رحلات فردية" vs "خطوط" toggle
- This would switch the entire form context

---

## 9. Files That May Need Modification

### For Adding Lines Feature

#### 1. Router (client/src/App.js)
- **Change**: Add new routes for lines
- **Safe**: Yes, just add new Route elements
```jsx
// Add these routes:
<Route path="/lines" element={<ViewLines />} />
<Route path="/lines/post" element={<PostLine />} />
<Route path="/lines/:lineId" element={<LineDetails />} />
```

#### 2. Navigation - BottomNav (client/src/components/BottomNav.js)
- **Change**: Add "الخطوط" tab or sub-menu item
- **Safe**: Yes, add to NAV_ITEMS or MORE_MENU_ITEMS arrays
- **Location**: Lines 238-283 (NAV_ITEMS) or 155-236 (MORE_MENU_ITEMS)

#### 3. Navigation - Header (client/src/components/Navegation/header.jsx)
- **Change**: Add "الخطوط" link in desktop nav
- **Safe**: Yes, add button in centerNav section (lines 65-120)

#### 4. Home Page (client/src/pages/Home.js)
- **Change**: Add mode selector for trips vs lines
- **Safe**: Yes, add toggle before mode buttons (around line 311)
- **Option**: Create separate /lines page instead to avoid complexity

#### 5. API Service (client/src/services/api.js)
- **Change**: Add linesAPI module
- **Safe**: Yes, just add new export
```javascript
export const linesAPI = {
  getAll: async (filters) => apiRequest(`/lines?${...}`, { method: 'GET' }),
  create: async (lineData) => apiRequest('/lines', { method: 'POST', body: JSON.stringify(lineData) }),
  // etc.
};
```

#### 6. Backend Routes (server/app.js)
- **Change**: Register new lines routes
- **Safe**: Yes, add single line
```javascript
app.use('/api/lines', linesRoutes);
```

---

## 10. Recommendations

### New Files to Create

#### Frontend
```
client/src/
├── pages/
│   └── lines/
│       ├── ViewLines.js       # Browse available lines
│       ├── PostLine.js        # Create new line (driver)
│       ├── LineDetails.js     # Line details page
│       └── ViewLines.module.css
├── components/
│   └── lines/
│       ├── LineCard.jsx       # Line display card
│       ├── LineSearchForm.jsx # Search/filter form
│       └── LineSchedule.jsx   # Weekly schedule display
└── context/
    └── LinesContext.js        # Lines state management
```

#### Backend
```
server/
├── routes/
│   └── lines.routes.js        # Line API routes
├── controllers/
│   └── lines.controller.js    # Line request handlers
├── models/
│   └── lines.model.js         # Line data model
└── database/migrations/
    └── 018_create_lines.sql   # Lines table migration
```

### Database Schema Suggestion
```sql
CREATE TABLE lines (
  id SERIAL PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,  -- "خط بغداد-أربيل"
  from_city VARCHAR(255) NOT NULL,
  to_city VARCHAR(255) NOT NULL,
  schedule JSONB NOT NULL,     -- {"days": [1,2,3,4,5], "time": "08:00"}
  price_per_seat DECIMAL(10,2) NOT NULL,
  seats_per_trip INTEGER DEFAULT 4,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE line_bookings (
  id SERIAL PRIMARY KEY,
  line_id INTEGER REFERENCES lines(id),
  passenger_id UUID REFERENCES users(id),
  travel_date DATE NOT NULL,
  seats INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(line_id, passenger_id, travel_date)
);
```

### Reusable Components
These existing components can be reused for Lines:
- **SearchableCitySelect** - For city selection
- **Card, Button, Input** - UI components
- **SkeletonLoader** - Loading states
- **Toast** - Notifications
- **ConfirmDialog** - Confirmations

### Safest Integration Approach

1. **Create separate pages** for Lines (don't modify Home.js heavily)
2. **Add LinesContext** following existing context patterns
3. **Add linesAPI** to api.js following existing patterns
4. **Create lines.routes.js** following existing route patterns
5. **Create lines.model.js** following existing model patterns
6. **Run migration** for new tables
7. **Add navigation links** to BottomNav and Header
8. **Test thoroughly** before deployment

### Estimated New Files
- Frontend: ~8 new files
- Backend: ~4 new files
- Migration: 1 SQL file
- Tests: ~4 test files

---

## Summary

The Toosila project is well-structured with clear separation of concerns:
- **Frontend**: React with Context API, CSS Modules
- **Backend**: Express.js with PostgreSQL
- **Patterns**: Consistent API service patterns, context providers, component structure

Adding the Lines feature should follow existing patterns for minimal disruption. The safest approach is to create new pages/components rather than heavily modifying existing ones.
