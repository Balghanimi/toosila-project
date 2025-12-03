// Determine API base URL based on environment
// Force rebuild - updated 2025-10-22
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://toosila-backend-production.up.railway.app/api'
    : 'http://localhost:5000/api');

const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    // Set default timeout to 30 seconds if not specified
    const timeout = options.timeout || 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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
      // Handle 401 Unauthorized - Token expired or invalid
      if (response.status === 401) {
        console.warn('401 Unauthorized - Token expired or invalid');
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        // Redirect to login with expired parameter
        window.location.href = '/dashboard?expired=true';
        throw new Error(
          'جلستك انتهت. يرجى تسجيل الدخول مرة أخرى / Session expired. Please login again.'
        );
      }

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
        const detailMessages = data.details.map((d) => `${d.field}: ${d.message}`).join(', ');
        errorMessage = `${errorMessage} - ${detailMessages}`;
      }

      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // Handle network errors and timeouts
    if (error.name === 'AbortError') {
      const timeoutError = new Error(
        'انتهت مهلة الطلب. يرجى التحقق من اتصال الإنترنت / Request timeout. Please check your internet connection.'
      );
      console.error('Request timeout:', error);
      throw timeoutError;
    }

    // Handle other network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new Error(
        'خطأ في الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت / Network connection error. Please check your internet connection.'
      );
      console.error('Network error:', error);
      throw networkError;
    }

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
        languagePreference: 'ar',
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
  getById: async (offerId) => {
    return apiRequest(`/offers/${offerId}`, { method: 'GET' });
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
  getById: async (demandId) => {
    return apiRequest(`/demands/${demandId}`, { method: 'GET' });
  },
  create: async (demandData) => {
    return apiRequest('/demands', {
      method: 'POST',
      body: JSON.stringify(demandData),
    });
  },
  update: async (demandId, demandData) => {
    return apiRequest(`/demands/${demandId}`, {
      method: 'PUT',
      body: JSON.stringify(demandData),
    });
  },
  delete: async (demandId) => {
    return apiRequest(`/demands/${demandId}`, {
      method: 'DELETE',
    });
  },
};

export const messagesAPI = {
  getConversations: async () => {
    return apiRequest('/messages/conversations', { method: 'GET' });
  },
  getRideMessages: async (rideType, rideId, page = 1, limit = 50) => {
    return apiRequest(`/messages/${rideType}/${rideId}?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  },
  // Deprecated - use getRideMessages instead
  getConversation: async (userId) => {
    return apiRequest(`/messages/conversation/${userId}`, { method: 'GET' });
  },
  // Deprecated - use getRideMessages instead
  getMessages: async (userId) => {
    return apiRequest(`/messages/conversation/${userId}`, { method: 'GET' });
  },
  sendMessage: async (rideType, rideId, content) => {
    return apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify({ rideType, rideId, content }),
    });
  },
  markAsRead: async (messageId) => {
    return apiRequest(`/messages/${messageId}/read`, { method: 'PUT' });
  },
  markConversationAsRead: async (rideType, rideId) => {
    return apiRequest(`/messages/conversation/${rideType}/${rideId}/read`, { method: 'PUT' });
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
  accept: async (bookingId) => {
    return apiRequest(`/bookings/${bookingId}/accept`, {
      method: 'POST',
    });
  },
  reject: async (bookingId) => {
    return apiRequest(`/bookings/${bookingId}/reject`, {
      method: 'POST',
    });
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

  // جلب الردود لعدة طلبات دفعة واحدة (batch) - Fixes N+1 problem
  getBatch: async (demandIds) => {
    const idsString = Array.isArray(demandIds) ? demandIds.join(',') : demandIds;
    return apiRequest(`/demand-responses/batch?demandIds=${idsString}`, {
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

// Admin API
export const adminAPI = {
  // User Management
  getAllUsers: async (page = 1, limit = 20, filters = {}) => {
    const queryParams = new URLSearchParams({ page, limit, ...filters }).toString();
    return apiRequest(`/auth/users?${queryParams}`, { method: 'GET' });
  },
  getUserById: async (userId) => {
    return apiRequest(`/auth/users/${userId}`, { method: 'GET' });
  },
  deactivateUser: async (userId) => {
    return apiRequest(`/auth/users/${userId}/deactivate`, { method: 'PUT' });
  },

  // Verification Management
  getPendingVerifications: async (page = 1, limit = 20) => {
    const queryParams = new URLSearchParams({ page, limit }).toString();
    return apiRequest(`/verification/admin/pending?${queryParams}`, { method: 'GET' });
  },
  getVerificationDocument: async (docId) => {
    return apiRequest(`/verification/admin/document/${docId}`, { method: 'GET' });
  },
  approveVerification: async (docId) => {
    return apiRequest(`/verification/admin/approve/${docId}`, { method: 'POST' });
  },
  rejectVerification: async (docId, reason) => {
    return apiRequest(`/verification/admin/reject/${docId}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
  getVerificationStats: async () => {
    return apiRequest('/verification/admin/stats', { method: 'GET' });
  },
  getUserAuditLog: async (userId) => {
    return apiRequest(`/verification/admin/audit/${userId}`, { method: 'GET' });
  },

  // Statistics
  getBookingStats: async () => {
    return apiRequest('/bookings/admin/stats', { method: 'GET' });
  },
  getRatingStats: async () => {
    return apiRequest('/ratings/admin/stats', { method: 'GET' });
  },
  getOfferStats: async () => {
    return apiRequest('/offers/admin/stats', { method: 'GET' });
  },
  getDemandStats: async () => {
    return apiRequest('/demands/admin/stats', { method: 'GET' });
  },
  getMessageStats: async () => {
    return apiRequest('/messages/admin/stats', { method: 'GET' });
  },
};

// OTP Phone Verification API
export const otpAPI = {
  // Send OTP to phone number
  send: async (phone) => {
    const response = await apiRequest('/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
    return response;
  },

  // Verify OTP code
  verify: async (phone, code) => {
    const response = await apiRequest('/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    });
    return response;
  },

  // Complete registration for new users
  completeRegistration: async (phone, name, isDriver) => {
    const response = await apiRequest('/otp/complete-registration', {
      method: 'POST',
      body: JSON.stringify({
        phone,
        name,
        is_driver: isDriver,
      }),
    });
    return response;
  },

  // Resend OTP
  resend: async (phone) => {
    const response = await apiRequest('/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
    return response;
  },

  // Login existing user (no OTP required)
  loginExisting: async (phone) => {
    const response = await apiRequest('/otp/login-existing', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
    return response;
  },
};

// Lines API (خطوط الاشتراك اليومي)
export const linesAPI = {
  // Get all lines with filters
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        queryParams.append(key, value);
      }
    });
    return apiRequest(`/lines?${queryParams.toString()}`, { method: 'GET' });
  },

  // Get line by ID
  getById: async (lineId) => {
    return apiRequest(`/lines/${lineId}`, { method: 'GET' });
  },

  // Create new line (for drivers)
  create: async (lineData) => {
    return apiRequest('/lines', {
      method: 'POST',
      body: JSON.stringify(lineData),
    });
  },

  // Update line
  update: async (lineId, lineData) => {
    return apiRequest(`/lines/${lineId}`, {
      method: 'PUT',
      body: JSON.stringify(lineData),
    });
  },

  // Delete line
  delete: async (lineId) => {
    return apiRequest(`/lines/${lineId}`, { method: 'DELETE' });
  },

  // Get driver's own lines
  getMyLines: async () => {
    return apiRequest('/lines/my-lines', { method: 'GET' });
  },

  // Subscribe to a line
  subscribe: async (lineId, subscriptionData) => {
    return apiRequest(`/lines/${lineId}/subscribe`, {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  },

  // Unsubscribe from a line
  unsubscribe: async (lineId) => {
    return apiRequest(`/lines/${lineId}/unsubscribe`, { method: 'DELETE' });
  },

  // Get user's subscriptions
  getMySubscriptions: async (status = null) => {
    const queryParams = status ? `?status=${status}` : '';
    return apiRequest(`/subscriptions/my-subscriptions${queryParams}`, { method: 'GET' });
  },

  // Get line subscribers (for drivers)
  getSubscribers: async (lineId) => {
    return apiRequest(`/lines/${lineId}/subscribers`, { method: 'GET' });
  },

  // Add stop to line
  addStop: async (lineId, stopData) => {
    return apiRequest(`/lines/${lineId}/stops`, {
      method: 'POST',
      body: JSON.stringify(stopData),
    });
  },

  // Remove stop from line
  removeStop: async (lineId, stopId) => {
    return apiRequest(`/lines/${lineId}/stops/${stopId}`, { method: 'DELETE' });
  },
};

export default apiRequest;
