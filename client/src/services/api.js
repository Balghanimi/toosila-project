// Determine API base URL based on environment
// Force rebuild - updated 2025-10-22
const API_BASE_URL = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://toosila-backend-production.up.railway.app/api'
    : 'http://localhost:5000/api');

const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Server returned HTML or other non-JSON response (likely an error page)
      const text = await response.text();
      console.error('Non-JSON response from server:', text.substring(0, 200));
      throw new Error('الخادم غير متاح حالياً، يرجى المحاولة لاحقاً');
    }

    const data = await response.json();

    if (!response.ok) {
      // Log full error response for debugging
      console.error('API Error Response:', data);

      // Extract error message - handle both object and string formats
      let errorMessage = 'حدث خطأ';

      if (typeof data.error === 'object' && data.error !== null) {
        // Backend sends error as object: { code: '...', message: '...' }
        errorMessage = data.error.message || data.message || errorMessage;
      } else if (typeof data.error === 'string') {
        // Backend sends error as string
        errorMessage = data.error;
      } else if (data.message) {
        errorMessage = data.message;
      }

      // If there are validation details, include them
      if (data.details && Array.isArray(data.details) && data.details.length > 0) {
        const detailMessages = data.details.map(d => `${d.field}: ${d.message}`).join(', ');
        errorMessage = `${errorMessage} - ${detailMessages}`;
      }

      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const authAPI = {
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: userData.name.trim(),
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        isDriver: userData.userType === 'driver', // Use selected userType from form
        languagePreference: 'ar'
      }),
    });
  },

  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        password,
      }),
    });
  },

  getProfile: async () => {
    return apiRequest('/auth/profile', {
      method: 'GET',
    });
  },

  updateProfile: async (updates) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  changePassword: async (currentPassword, newPassword) => {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  updateEmail: async (newEmail, password) => {
    return apiRequest('/auth/update-email', {
      method: 'PUT',
      body: JSON.stringify({ newEmail, password }),
    });
  },

  deleteAccount: async (password, confirmation) => {
    return apiRequest('/auth/delete-account', {
      method: 'DELETE',
      body: JSON.stringify({ password, confirmation }),
    });
  },
};

export const offersAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/offers?${queryParams}`, { method: 'GET' });
  },
  create: async (offerData) => {
    return apiRequest('/offers', {
      method: 'POST',
      body: JSON.stringify(offerData),
    });
  },
  update: async (offerId, offerData) => {
    return apiRequest(`/offers/${offerId}`, {
      method: 'PUT',
      body: JSON.stringify(offerData),
    });
  },
  delete: async (offerId) => {
    return apiRequest(`/offers/${offerId}`, { method: 'DELETE' });
  },
};

export const demandsAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/demands?${queryParams}`, { method: 'GET' });
  },
  create: async (demandData) => {
    return apiRequest('/demands', {
      method: 'POST',
      body: JSON.stringify(demandData),
    });
  },
};

export const messagesAPI = {
  getConversations: async () => {
    return apiRequest('/messages/conversations', { method: 'GET' });
  },
  getConversation: async (userId) => {
    return apiRequest(`/messages/conversation/${userId}`, { method: 'GET' });
  },
  getMessages: async (userId) => {
    return apiRequest(`/messages/conversation/${userId}`, { method: 'GET' });
  },
  sendMessage: async (rideType, rideId, content) => {
    return apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify({ ride_type: rideType, ride_id: rideId, content }),
    });
  },
  markAsRead: async (messageId) => {
    return apiRequest(`/messages/${messageId}/read`, { method: 'PUT' });
  },
  getUnreadCount: async () => {
    return apiRequest('/messages/unread-count', { method: 'GET' });
  },
};

export const bookingsAPI = {
  getAll: async () => {
    return apiRequest('/bookings', { method: 'GET' });
  },
  getMyBookings: async () => {
    return apiRequest('/bookings/my/bookings', { method: 'GET' });
  },
  getMyOffers: async () => {
    return apiRequest('/bookings/my/offers', { method: 'GET' });
  },
  create: async (bookingData) => {
    return apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },
  updateStatus: async (bookingId, status) => {
    return apiRequest(`/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
  cancel: async (bookingId) => {
    return apiRequest(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
    });
  },
  getById: async (bookingId) => {
    return apiRequest(`/bookings/${bookingId}`, { method: 'GET' });
  },
  getPendingCount: async () => {
    return apiRequest('/bookings/my/pending-count', { method: 'GET' });
  },
};

export const ratingsAPI = {
  create: async (ratingData) => {
    return apiRequest('/ratings', {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  },
  getUserRatings: async (userId) => {
    return apiRequest(`/ratings/user/${userId}`, { method: 'GET' });
  },
};

export const statsAPI = {
  getUserStats: async () => {
    return apiRequest('/stats/user', { method: 'GET' });
  },
  getRecentActivity: async () => {
    return apiRequest('/stats/recent-activity', { method: 'GET' });
  },
};

export const citiesAPI = {
  getAll: async () => {
    return apiRequest('/cities', { method: 'GET' });
  },
  add: async (cityName) => {
    return apiRequest('/cities', {
      method: 'POST',
      body: JSON.stringify({ name: cityName }),
    });
  },
};

// Demand Responses API
export const demandResponsesAPI = {
  // إنشاء رد على طلب (للسائقين)
  create: async (responseData) => {
    return apiRequest('/demand-responses', {
      method: 'POST',
      body: JSON.stringify(responseData),
    });
  },

  // جلب جميع الردود على طلب معين
  getByDemandId: async (demandId) => {
    return apiRequest(`/demand-responses/demand/${demandId}`, {
      method: 'GET',
    });
  },

  // جلب ردود السائق الحالي
  getMyResponses: async () => {
    return apiRequest('/demand-responses/my-responses', {
      method: 'GET',
    });
  },

  // جلب رد واحد
  getById: async (responseId) => {
    return apiRequest(`/demand-responses/${responseId}`, {
      method: 'GET',
    });
  },

  // تحديث حالة رد (قبول/رفض/إلغاء)
  updateStatus: async (responseId, status) => {
    return apiRequest(`/demand-responses/${responseId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // حذف رد
  delete: async (responseId) => {
    return apiRequest(`/demand-responses/${responseId}`, {
      method: 'DELETE',
    });
  },
};

// Notifications API
export const notificationsAPI = {
  // جلب إشعارات المستخدم مع pagination
  getNotifications: async (limit = 20, offset = 0) => {
    return apiRequest(`/notifications?limit=${limit}&offset=${offset}`, {
      method: 'GET',
    });
  },

  // جلب عدد الإشعارات غير المقروءة
  getUnreadCount: async () => {
    return apiRequest('/notifications/unread-count', {
      method: 'GET',
    });
  },

  // جلب الإشعارات غير المقروءة فقط
  getUnread: async (limit = 20) => {
    return apiRequest(`/notifications/unread?limit=${limit}`, {
      method: 'GET',
    });
  },

  // جلب الإشعارات حسب النوع
  getByType: async (type, limit = 20) => {
    return apiRequest(`/notifications/type/${type}?limit=${limit}`, {
      method: 'GET',
    });
  },

  // تحديد إشعار كمقروء
  markAsRead: async (notificationId) => {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  },

  // تحديد جميع الإشعارات كمقروءة
  markAllAsRead: async () => {
    return apiRequest('/notifications/mark-all-read', {
      method: 'PATCH',
    });
  },

  // حذف إشعار
  delete: async (notificationId) => {
    return apiRequest(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },
};

export default apiRequest;

