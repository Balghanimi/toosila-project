const AppError = require('../utils/AppError');

/**
 * Middleware to check if user is an admin
 * Note: For now, we'll use a simple approach where admins are identified by a specific email domain
 * or can be marked in the database. You can enhance this later.
 *
 * For production, consider adding an 'is_admin' or 'role' column to users table
 */
const checkAdmin = (req, res, next) => {
  // Check if user is authenticated
  if (!req.user) {
    return next(new AppError('يجب تسجيل الدخول أولاً', 401));
  }

  // TODO: Implement proper admin check
  // For now, we'll use a simple email-based check
  // In production, add 'is_admin' or 'role' column to users table

  const adminEmails = [
    'admin@toosila.com',
    'support@toosila.com',
    // Add more admin emails here
  ];

  // Check if user email is in admin list
  if (!adminEmails.includes(req.user.email)) {
    return next(new AppError('غير مصرح لك بالوصول إلى هذا المورد', 403));
  }

  next();
};

module.exports = checkAdmin;
