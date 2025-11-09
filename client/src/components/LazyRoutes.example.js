/**
 * Example: Lazy Loading Routes for Better Performance
 *
 * This file demonstrates how to implement code splitting
 * to reduce initial bundle size and improve load times.
 *
 * BEFORE: All routes loaded upfront (300-400KB)
 * AFTER:  Routes loaded on-demand (200-250KB initial, 20-30% reduction)
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ============================================================================
// CRITICAL ROUTES - Load immediately (shown on every page)
// ============================================================================
import HomePage from './pages/HomePage';
import Navigation from './components/Navigation';

// ============================================================================
// NON-CRITICAL ROUTES - Lazy load (only when user navigates to them)
// ============================================================================

// Auth pages - only needed when user wants to login/register
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Main features - load when user navigates to them
const Offers = lazy(() => import('./pages/Offers'));
const Demands = lazy(() => import('./pages/Demands'));
const Bookings = lazy(() => import('./pages/Bookings'));
const Messages = lazy(() => import('./pages/Messages'));

// Profile and settings - rarely visited, perfect for lazy loading
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

// Admin pages - only for admin users
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminTest = lazy(() => import('./pages/AdminTest'));

// ============================================================================
// LOADING COMPONENT
// ============================================================================

const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    color: '#4A90E2'
  }}>
    <div>
      <div className="spinner" style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #4A90E2',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 10px'
      }} />
      جاري التحميل...
    </div>
  </div>
);

// ============================================================================
// APP COMPONENT WITH LAZY ROUTES
// ============================================================================

function App() {
  return (
    <Router>
      <Navigation />

      {/* Wrap lazy-loaded routes with Suspense */}
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Home page - loaded immediately */}
          <Route path="/" element={<HomePage />} />

          {/* Auth routes - lazy loaded */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Main feature routes - lazy loaded */}
          <Route path="/offers" element={<Offers />} />
          <Route path="/demands" element={<Demands />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/messages" element={<Messages />} />

          {/* User routes - lazy loaded */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />

          {/* Admin routes - lazy loaded */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/test" element={<AdminTest />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

// ============================================================================
// PERFORMANCE BENEFITS
// ============================================================================

/*
BEFORE LAZY LOADING:
- Initial bundle: 300-400KB
- All routes loaded upfront
- Slower initial page load
- Wasted bandwidth for unused features

AFTER LAZY LOADING:
- Initial bundle: 200-250KB (20-30% smaller)
- Routes loaded on-demand
- Faster initial page load
- Only load what users actually use

EXAMPLE METRICS:
- Initial load time: 2.5s → 1.5s (40% faster)
- Time to interactive: 3.0s → 2.0s (33% faster)
- Network transferred: 350KB → 230KB (34% reduction)

HOW TO IMPLEMENT IN YOUR APP:
1. Copy this pattern to your App.js or Routes.js
2. Replace imports with lazy(() => import(...))
3. Wrap routes in <Suspense> with fallback
4. Test with: npm run build && npx source-map-explorer 'build/static/js/*.js'
*/

// ============================================================================
// ADDITIONAL OPTIMIZATION TIPS
// ============================================================================

/*
1. Component-Level Code Splitting:
   const HeavyComponent = lazy(() => import('./HeavyComponent'));

2. Conditional Loading:
   const AdminPanel = lazy(() =>
     user.isAdmin
       ? import('./AdminPanel')
       : import('./UnauthorizedPage')
   );

3. Prefetching (load before user clicks):
   <link rel="prefetch" href="/static/js/offers.chunk.js" />

4. Bundle Analysis:
   npm run build
   npx source-map-explorer 'build/static/js/*.js'

5. Remove Unused Dependencies:
   npx depcheck
   npm uninstall [unused-package]
*/
