import React, { createContext, useContext, useEffect, useState } from 'react';

const DemandsContext = createContext();

export function DemandsProvider({ children }) {
  // إدارة طلبات الركاب (من الركاب)
  const [demands, setDemands] = useState(() => {
    try {
      const raw = localStorage.getItem('demands');
      if (raw) return JSON.parse(raw);
      // بيانات تجريبية للطلبات
      const seed = [
        {
          id: 'demand-1',
          from: 'بغداد - الكرخ',
          to: 'البصرة - مركز البصرة',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          seats: 2,
          maxPrice: 20000,
          negotiable: true,
          passengerName: 'فاطمة أحمد',
          passengerPhone: '07901234568',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'demand-2',
          from: 'أربيل - مركز أربيل',
          to: 'السليمانية - مركز السليمانية',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          seats: 1,
          maxPrice: 15000,
          negotiable: false,
          passengerName: 'علي محمد',
          passengerPhone: '07701234568',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'demand-3',
          from: 'النجف - مركز النجف',
          to: 'كربلاء - مركز كربلاء',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          seats: 3,
          maxPrice: 12000,
          negotiable: true,
          passengerName: 'زينب حسن',
          passengerPhone: '07801234568',
          createdAt: new Date().toISOString(),
        },
      ];
      return seed;
    } catch (e) {
      console.warn('فشل في قراءة الطلبات من localStorage', e);
      return [];
    }
  });

  // إدارة العروض المقدمة للطلبات
  const [offersToDemands, setOffersToDemands] = useState(() => {
    try {
      const raw = localStorage.getItem('offersToDemands');
      if (raw) return JSON.parse(raw);
      return [];
    } catch (e) {
      console.warn('فشل في قراءة العروض المقدمة للطلبات من localStorage', e);
      return [];
    }
  });

  // دوال إدارة الطلبات
  const addDemand = (demand) => setDemands((prev) => [demand, ...prev]);
  const updateDemand = (id, updates) => setDemands((prev) => 
    prev.map(demand => demand.id === id ? { ...demand, ...updates } : demand)
  );
  const deleteDemand = (id) => setDemands((prev) => prev.filter(demand => demand.id !== id));
  const clearDemands = () => setDemands([]);

  // دوال إدارة العروض المقدمة للطلبات
  const addOfferToDemand = (offer) => setOffersToDemands((prev) => [offer, ...prev]);
  const updateOfferToDemand = (id, updates) => setOffersToDemands((prev) => 
    prev.map(offer => offer.id === id ? { ...offer, ...updates } : offer)
  );
  const deleteOfferToDemand = (id) => setOffersToDemands((prev) => prev.filter(offer => offer.id !== id));
  const clearOffersToDemands = () => setOffersToDemands([]);

  // حفظ الطلبات في localStorage
  useEffect(() => {
    try {
      localStorage.setItem('demands', JSON.stringify(demands));
    } catch (e) {
      console.warn('فشل في حفظ الطلبات في localStorage', e);
    }
  }, [demands]);

  // حفظ العروض المقدمة للطلبات في localStorage
  useEffect(() => {
    try {
      localStorage.setItem('offersToDemands', JSON.stringify(offersToDemands));
    } catch (e) {
      console.warn('فشل في حفظ العروض المقدمة للطلبات في localStorage', e);
    }
  }, [offersToDemands]);

  // تسجيل التغييرات للتطوير
  useEffect(() => {
    console.log('👤 الطلبات الحالية:', demands);
  }, [demands]);

  useEffect(() => {
    console.log('🤝 العروض المقدمة للطلبات الحالية:', offersToDemands);
  }, [offersToDemands]);

  return (
    <DemandsContext.Provider value={{ 
      demands, addDemand, updateDemand, deleteDemand, clearDemands,
      offersToDemands, addOfferToDemand, updateOfferToDemand, deleteOfferToDemand, clearOffersToDemands
    }}>
      {children}
    </DemandsContext.Provider>
  );
}

export function useDemands() {
  const ctx = useContext(DemandsContext);
  if (!ctx) throw new Error('useDemands يجب استخدامه داخل DemandsProvider');
  return ctx;
}
