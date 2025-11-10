import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

const OffersContext = createContext();

export function OffersProvider({ children }) {
  // إدارة عروض الرحلات (من السائقين)
  const [offers, setOffers] = useState(() => {
    try {
      const raw = localStorage.getItem('offers');
      if (raw) return JSON.parse(raw);
      // بيانات تجريبية للعروض
      const seed = [
        {
          id: 'offer-1',
          from: 'بغداد - الكرخ',
          to: 'البصرة - مركز البصرة',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          seats: 3,
          price: 15000,
          negotiable: true,
          driverName: 'أحمد محمد',
          driverPhone: '07901234567',
          carModel: 'تويوتا كامري 2020',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'offer-2',
          from: 'أربيل - مركز أربيل',
          to: 'السليمانية - مركز السليمانية',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          seats: 2,
          price: 10000,
          negotiable: false,
          driverName: 'سارة أحمد',
          driverPhone: '07701234567',
          carModel: 'هيونداي إلنترا 2019',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'offer-3',
          from: 'النجف - مركز النجف',
          to: 'كربلاء - مركز كربلاء',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          seats: 4,
          price: 8000,
          negotiable: true,
          driverName: 'محمد علي',
          driverPhone: '07801234567',
          carModel: 'نيسان صني 2021',
          createdAt: new Date().toISOString(),
        },
      ];
      return seed;
    } catch (e) {
      console.warn('فشل في قراءة العروض من localStorage', e);
      return [];
    }
  });

  // إدارة طلبات الحجز للعروض
  const [bookings, setBookings] = useState(() => {
    try {
      const raw = localStorage.getItem('bookings');
      if (raw) return JSON.parse(raw);
      return [];
    } catch (e) {
      console.warn('فشل في قراءة طلبات الحجز من localStorage', e);
      return [];
    }
  });

  // دوال إدارة العروض - Memoized with useCallback
  const addOffer = useCallback((offer) => setOffers((prev) => [offer, ...prev]), []);
  const updateOffer = useCallback(
    (id, updates) =>
      setOffers((prev) =>
        prev.map((offer) => (offer.id === id ? { ...offer, ...updates } : offer))
      ),
    []
  );
  const deleteOffer = useCallback(
    (id) => setOffers((prev) => prev.filter((offer) => offer.id !== id)),
    []
  );
  const clearOffers = useCallback(() => setOffers([]), []);

  // دوال إدارة طلبات الحجز - Memoized with useCallback
  const addBooking = useCallback((booking) => setBookings((prev) => [booking, ...prev]), []);
  const updateBooking = useCallback(
    (id, updates) =>
      setBookings((prev) =>
        prev.map((booking) => (booking.id === id ? { ...booking, ...updates } : booking))
      ),
    []
  );
  const deleteBooking = useCallback(
    (id) => setBookings((prev) => prev.filter((booking) => booking.id !== id)),
    []
  );
  const clearBookings = useCallback(() => setBookings([]), []);

  // حفظ العروض في localStorage
  useEffect(() => {
    try {
      localStorage.setItem('offers', JSON.stringify(offers));
    } catch (e) {
      console.warn('فشل في حفظ العروض في localStorage', e);
    }
  }, [offers]);

  // حفظ طلبات الحجز في localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bookings', JSON.stringify(bookings));
    } catch (e) {
      console.warn('فشل في حفظ طلبات الحجز في localStorage', e);
    }
  }, [bookings]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      offers,
      addOffer,
      updateOffer,
      deleteOffer,
      clearOffers,
      bookings,
      addBooking,
      updateBooking,
      deleteBooking,
      clearBookings,
    }),
    [
      offers,
      addOffer,
      updateOffer,
      deleteOffer,
      clearOffers,
      bookings,
      addBooking,
      updateBooking,
      deleteBooking,
      clearBookings,
    ]
  );

  return <OffersContext.Provider value={contextValue}>{children}</OffersContext.Provider>;
}

export function useOffers() {
  const ctx = useContext(OffersContext);
  if (!ctx) throw new Error('useOffers يجب استخدامه داخل OffersProvider');
  return ctx;
}
