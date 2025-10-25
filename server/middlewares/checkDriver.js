/**
 * Middleware: التحقق من أن المستخدم سائق
 * يتحقق من أن المستخدم الحالي لديه صلاحيات السائق (is_driver = true)
 * يجب استخدامه بعد middleware المصادقة (auth)
 */

const AppError = require('../utils/AppError');

/**
 * التحقق من أن المستخدم سائق
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الاستجابة
 * @param {Function} next - الدالة التالية
 */
const checkDriver = (req, res, next) => {
  // التحقق من وجود مستخدم مصادق عليه
  if (!req.user) {
    return next(new AppError('يجب تسجيل الدخول أولاً', 401));
  }

  // التحقق من أن المستخدم سائق
  if (!req.user.isDriver && !req.user.is_driver) {
    return next(new AppError('هذه الميزة متاحة للسائقين فقط', 403));
  }

  next();
};

/**
 * التحقق من أن المستخدم راكب (ليس سائق)
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الاستجابة
 * @param {Function} next - الدالة التالية
 */
const checkPassenger = (req, res, next) => {
  // التحقق من وجود مستخدم مصادق عليه
  if (!req.user) {
    return next(new AppError('يجب تسجيل الدخول أولاً', 401));
  }

  // التحقق من أن المستخدم راكب (ليس سائق)
  if (req.user.isDriver || req.user.is_driver) {
    return next(new AppError('هذه الميزة متاحة للركاب فقط', 403));
  }

  next();
};

module.exports = {
  checkDriver,
  checkPassenger
};
