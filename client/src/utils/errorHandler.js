/**
 * Get user-friendly error message from error object
 * @param {Error|Object} error - The error object
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Network error
  if (!error.response && error.message && error.message.includes('Network')) {
    return 'غير قادر على الاتصال. يرجى التحقق من اتصال الإنترنت الخاص بك. / Unable to connect. Please check your internet connection.';
  }

  // If error is a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // Server error with response
  const status = error.response?.status;
  const message = error.response?.data?.message || error.message;

  // 5xx Server errors
  if (status >= 500) {
    return 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً. / Something went wrong on our end. Please try again later.';
  }

  // 404 Not Found
  if (status === 404) {
    return 'المورد المطلوب غير موجود. / The requested resource was not found.';
  }

  // 401 Unauthorized
  if (status === 401) {
    return 'يرجى تسجيل الدخول للمتابعة. / Please log in to continue.';
  }

  // 403 Forbidden
  if (status === 403) {
    return 'ليس لديك إذن لتنفيذ هذا الإجراء. / You do not have permission to perform this action.';
  }

  // 400 Bad Request
  if (status === 400) {
    return message || 'البيانات المدخلة غير صحيحة. / Invalid data submitted.';
  }

  // Return server message or generic error
  return message || 'حدث خطأ. يرجى المحاولة مرة أخرى. / An error occurred. Please try again.';
};

/**
 * Handle API errors with optional alert
 * @param {Error|Object} error - The error object
 * @param {boolean} showAlert - Whether to show alert (default: false)
 * @returns {string} - User-friendly error message
 */
export const handleApiError = (error, showAlert = false) => {
  const message = getErrorMessage(error);

  // Log for debugging
  console.error('API Error:', error);

  if (showAlert) {
    alert(message);
  }

  return message;
};

/**
 * Format validation errors from server
 * @param {Object} validationErrors - Validation errors object
 * @returns {Object} - Formatted errors for form display
 */
export const formatValidationErrors = (validationErrors) => {
  const errors = {};

  if (Array.isArray(validationErrors)) {
    validationErrors.forEach((err) => {
      if (err.field && err.message) {
        errors[err.field] = err.message;
      }
    });
  } else if (typeof validationErrors === 'object') {
    Object.keys(validationErrors).forEach((key) => {
      errors[key] = validationErrors[key];
    });
  }

  return errors;
};
