import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Navegation/header';
import BottomNav from './components/BottomNav';
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
// الصفحات
import Home from './pages/Home';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Bookings from './pages/Bookings';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
// العروض
import PostOfferModern from './pages/offers/PostOfferModern';
import ViewOffers from './pages/offers/ViewOffers';
// الطلبات
import ViewDemands from './pages/demands/ViewDemands';
// إدارة التقييمات
import RatingManagement from './pages/RatingManagement';
import RatingStats from './pages/RatingStats';
import UserRatings from './pages/UserRatings';
import TopRatings from './pages/TopRatings';
import RecentRatings from './pages/RecentRatings';
import BadRatings from './pages/BadRatings';
import RatingsByLocation from './pages/RatingsByLocation';
import RatingsByUserType from './pages/RatingsByUserType';
import RatingsByDate from './pages/RatingsByDate';
import RatingsByComments from './pages/RatingsByComments';
import RatingsByRating from './pages/RatingsByRating';
import TestAPI from './pages/SimpleTestAPI';
import NotificationsPage from './pages/NotificationsPage';
import './App.css';

export default function App() {
  return (
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
                  </Routes>
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
  );
}
