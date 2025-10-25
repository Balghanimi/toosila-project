/**
 * فئة خطأ مخصصة للتطبيق
 * تستخدم لإنشاء أخطاء مع رسائل ورموز حالة محددة
 */
class AppError extends Error {
  /**
   * @param {string} message - رسالة الخطأ
   * @param {number} statusCode - رمز حالة HTTP
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
