import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Navegation/header';
import BottomNav from './components/BottomNav';
import FloatingDownloadButton from './components/FloatingDownloadButton';
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
import { ConnectionProvider } from './context/ConnectionContext';
import { LinesProvider } from './context/LinesContext';
import ConnectionOverlay from './components/ConnectionOverlay';
import LinesRoute from './components/LinesRoute';
import './App.css';
import './styles/enhancements.css';
import './styles/professional-ui.css';

// Lazy load all pages for code splitting
// const Landing = lazy(() => import('./pages/Landing')); // Deactivated for now
const Home = lazy(() => import('./pages/Home'));
const Messages = lazy(() => import('./pages/Messages'));
const Profile = lazy(() => import('./pages/Profile'));
const Bookings = lazy(() => import('./pages/Bookings'));
const Settings = lazy(() => import('./pages/Settings'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Offers
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
const Contact = lazy(() => import('./pages/Contact'));

// Email Verification
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const EmailVerificationReminder = lazy(() => import('./pages/EmailVerificationReminder'));

// Password Reset
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

// Phone Login
const PhoneLogin = lazy(() => import('./pages/PhoneLogin'));

// Lines Feature
const ModeSelection = lazy(() => import('./pages/ModeSelection'));
const LinesHome = lazy(() => import('./pages/lines/LinesHome'));
const LineDetails = lazy(() => import('./pages/lines/LineDetails'));
const CreateLine = lazy(() => import('./pages/lines/CreateLine'));
const MySubscriptions = lazy(() => import('./pages/lines/MySubscriptions'));
const LinesComingSoon = lazy(() => import('./pages/lines/LinesComingSoon'));

// Admin Pages
const AdminRoute = lazy(() => import('./components/Admin/AdminRoute'));
const AdminLayout = lazy(() => import('./components/Admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const VerificationManagement = lazy(() => import('./pages/admin/VerificationManagement'));
const AdminStatistics = lazy(() => import('./pages/admin/AdminStatistics'));
// const AdminTest = lazy(() => import('./pages/AdminTest')); // Temporarily removed - file not in git

export default function App() {
  return (
    <ConnectionProvider>
      <ConnectionOverlay />
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
                            <LinesProvider>
                              <div>
                                <Header title="توصيلة" />
                                <main className="appContent">
                                  <Suspense fallback={<LoadingSpinner />}>
                                    <Routes>
                                      {/* Main page is now /home - Landing page deactivated for now */}
                                      <Route path="/" element={<Home />} />
                                      {/* <Route path="/landing" element={<Landing />} /> */}
                                      <Route path="/home" element={<Home />} />
                                      <Route path="/dashboard" element={<Dashboard />} />
                                      <Route path="/messages" element={<Messages />} />
                                      <Route path="/profile" element={<Profile />} />
                                      <Route path="/bookings" element={<Bookings />} />
                                      <Route path="/settings" element={<Settings />} />
                                      {/* مسارات العروض */}
                                      {/* Redirect /post-offer to homepage - form is on homepage */}
                                      <Route
                                        path="/post-offer"
                                        element={<Navigate to="/home" replace />}
                                      />
                                      <Route path="/offers" element={<ViewOffers />} />
                                      {/* مسارات الطلبات */}
                                      <Route path="/demands" element={<ViewDemands />} />

                                      {/* إدارة التقييمات */}
                                      <Route path="/ratings" element={<RatingManagement />} />
                                      <Route path="/rating-stats" element={<RatingStats />} />
                                      <Route
                                        path="/user-ratings/:userId"
                                        element={<UserRatings />}
                                      />
                                      <Route path="/top-ratings" element={<TopRatings />} />
                                      <Route path="/recent-ratings" element={<RecentRatings />} />
                                      <Route path="/bad-ratings" element={<BadRatings />} />
                                      <Route
                                        path="/ratings-by-location"
                                        element={<RatingsByLocation />}
                                      />
                                      <Route
                                        path="/ratings-by-user-type"
                                        element={<RatingsByUserType />}
                                      />
                                      <Route path="/ratings-by-date" element={<RatingsByDate />} />
                                      <Route
                                        path="/ratings-by-comments"
                                        element={<RatingsByComments />}
                                      />
                                      <Route
                                        path="/ratings-by-rating"
                                        element={<RatingsByRating />}
                                      />
                                      {/* صفحة اختبار API */}
                                      <Route path="/test-api" element={<TestAPI />} />
                                      {/* صفحة الإشعارات */}
                                      <Route
                                        path="/notifications"
                                        element={<NotificationsPage />}
                                      />
                                      {/* صفحة سياسة الخصوصية */}
                                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                                      {/* صفحة حول التطبيق */}
                                      <Route path="/about" element={<About />} />
                                      {/* صفحة تحميل التطبيق */}
                                      <Route path="/download" element={<Download />} />
                                      {/* صفحة اتصل بنا */}
                                      <Route path="/contact" element={<Contact />} />
                                      {/* Email Verification */}
                                      <Route
                                        path="/verify-email/:token"
                                        element={<VerifyEmail />}
                                      />
                                      <Route
                                        path="/email-verification-reminder"
                                        element={<EmailVerificationReminder />}
                                      />
                                      {/* Password Reset */}
                                      <Route path="/forgot-password" element={<ForgotPassword />} />
                                      <Route
                                        path="/reset-password/:token"
                                        element={<ResetPassword />}
                                      />
                                      {/* Phone Login/Register */}
                                      <Route path="/login" element={<PhoneLogin />} />
                                      <Route path="/register" element={<PhoneLogin />} />

                                      {/* Lines Coming Soon Page (with interest registration) */}
                                      <Route
                                        path="/lines-coming-soon"
                                        element={<LinesComingSoon />}
                                      />

                                      {/* Lines Feature (خطوط الاشتراك اليومي) - Admin Only */}
                                      <Route path="/mode-select" element={<ModeSelection />} />
                                      <Route
                                        path="/lines"
                                        element={
                                          <LinesRoute>
                                            <LinesHome />
                                          </LinesRoute>
                                        }
                                      />
                                      <Route
                                        path="/lines/create"
                                        element={
                                          <LinesRoute>
                                            <CreateLine />
                                          </LinesRoute>
                                        }
                                      />
                                      <Route
                                        path="/lines/:lineId"
                                        element={
                                          <LinesRoute>
                                            <LineDetails />
                                          </LinesRoute>
                                        }
                                      />
                                      <Route
                                        path="/subscriptions"
                                        element={
                                          <LinesRoute>
                                            <MySubscriptions />
                                          </LinesRoute>
                                        }
                                      />

                                      {/* Admin Test Page - temporarily disabled */}
                                      {/* <Route path="/admin-test" element={<AdminTest />} /> */}

                                      {/* Admin Routes */}
                                      <Route
                                        path="/admin"
                                        element={
                                          <AdminRoute>
                                            <AdminLayout />
                                          </AdminRoute>
                                        }
                                      >
                                        <Route index element={<AdminDashboard />} />
                                        <Route path="users" element={<UserManagement />} />
                                        <Route
                                          path="verification"
                                          element={<VerificationManagement />}
                                        />
                                        <Route path="statistics" element={<AdminStatistics />} />
                                      </Route>
                                    </Routes>
                                  </Suspense>
                                </main>
                                <BottomNav />
                                <FloatingDownloadButton />
                              </div>
                            </LinesProvider>
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
  );
}
