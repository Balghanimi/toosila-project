const AppError = require('../utils/AppError');

/**
 * Middleware to check if user is an admin
 * Uses role-based access control (RBAC) checking the 'role' field in JWT token
 *
 * SECURITY FIX: Changed from hardcoded email list to role-based check
 * The JWT token payload must include: { role: 'admin' } for admin users
 *
 * To create an admin user, set role='admin' in the users table:
 * UPDATE users SET role = 'admin' WHERE email = 'admin@toosila.com';
 */
const checkAdmin = (req, res, next) => {
  // Check if user is authenticated
  if (!req.user) {
    return next(new AppError('يجب تسجيل الدخول أولاً', 401));
  }

  // Check if user has admin role in JWT token payload
  if (!req.user.role || req.user.role !== 'admin') {
    return next(new AppError('غير مصرح لك بالوصول إلى هذا المورد - صلاحيات المشرف مطلوبة', 403));
  }

  next();
};

module.exports = checkAdmin;
