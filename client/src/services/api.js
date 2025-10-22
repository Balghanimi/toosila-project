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

    const data = await response.json();

    if (!response.ok) {
      // Log full error response for debugging
      console.error('API Error Response:', data);

      // Extract error message - data.error is a string, not an object
      let errorMessage = data.error || data.message || 'حدث خطأ';

      // If there are validation details, include them
      if (data.details && data.details.length > 0) {
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
        isDriver: false, // Default to passenger, can be changed later in profile
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

  changePassword: async (oldPassword, newPassword) => {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword }),
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

export default apiRequest;

