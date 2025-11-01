import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Navegation/header';
import BottomNav from './components/BottomNav';
import LoadingSpinner from './components/LoadingSpinner';
import { OffersProvider } from './context/OffersContext';
import { DemandsProvider } from './context/DemandsContext';
import { RatingProvider } from './context/RatingContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { MessagesProvider } from './context/MessagesContext';
import { BookingsProvider } from './context/BookingContext';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';
import './styles/enhancements.css';

// Lazy load all pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Messages = lazy(() => import('./pages/Messages'));
const Profile = lazy(() => import('./pages/Profile'));
const Bookings = lazy(() => import('./pages/Bookings'));
const Settings = lazy(() => import('./pages/Settings'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Offers
const PostOfferModern = lazy(() => import('./pages/offers/PostOfferModern'));
const ViewOffers = lazy(() => import('./pages/offers/ViewOffers'));

// Demands
const ViewDemands = lazy(() => import('./pages/demands/ViewDemands'));

// Rating Management
const RatingManagement = lazy(() => import('./pages/RatingManagement'));
const RatingStats = lazy(() => import('./pages/RatingStats'));
const UserRatings = lazy(() => import('./pages/UserRatings'));
const TopRatings = lazy(() => import('./pages/TopRatings'));
const RecentRatings = lazy(() => import('./pages/RecentRatings'));
const BadRatings = lazy(() => import('./pages/BadRatings'));
const RatingsByLocation = lazy(() => import('./pages/RatingsByLocation'));
const RatingsByUserType = lazy(() => import('./pages/RatingsByUserType'));
const RatingsByDate = lazy(() => import('./pages/RatingsByDate'));
const RatingsByComments = lazy(() => import('./pages/RatingsByComments'));
const RatingsByRating = lazy(() => import('./pages/RatingsByRating'));
const TestAPI = lazy(() => import('./pages/SimpleTestAPI'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const About = lazy(() => import('./pages/About'));
const Download = lazy(() => import('./pages/Download'));

export default function App() {
  return (
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
                    <div>
                    <Header title="توصيلة" />
                    <main className="appContent">
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/messages" element={<Messages />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/bookings" element={<Bookings />} />
                      <Route path="/settings" element={<Settings />} />
                      {/* مسارات العروض */}
                      <Route path="/post-offer" element={<PostOfferModern />} />
                      <Route path="/offers" element={<ViewOffers />} />
                      {/* مسارات الطلبات */}
                      <Route path="/demands" element={<ViewDemands />} />

                      {/* إدارة التقييمات */}
                      <Route path="/ratings" element={<RatingManagement />} />
                      <Route path="/rating-stats" element={<RatingStats />} />
                      <Route path="/user-ratings/:userId" element={<UserRatings />} />
                      <Route path="/top-ratings" element={<TopRatings />} />
                      <Route path="/recent-ratings" element={<RecentRatings />} />
                      <Route path="/bad-ratings" element={<BadRatings />} />
                      <Route path="/ratings-by-location" element={<RatingsByLocation />} />
                      <Route path="/ratings-by-user-type" element={<RatingsByUserType />} />
                      <Route path="/ratings-by-date" element={<RatingsByDate />} />
                      <Route path="/ratings-by-comments" element={<RatingsByComments />} />
                      <Route path="/ratings-by-rating" element={<RatingsByRating />} />
                      {/* صفحة اختبار API */}
                      <Route path="/test-api" element={<TestAPI />} />
                      {/* صفحة الإشعارات */}
                      <Route path="/notifications" element={<NotificationsPage />} />
                      {/* صفحة سياسة الخصوصية */}
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      {/* صفحة حول التطبيق */}
                      <Route path="/about" element={<About />} />
                      {/* صفحة تحميل التطبيق */}
                      <Route path="/download" element={<Download />} />
                    </Routes>
                  </Suspense>
                </main>
                <BottomNav />
                </div>
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
  );
}
