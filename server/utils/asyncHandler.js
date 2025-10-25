/**
 * دالة wrapper للتعامل مع الـ async/await في Express
 * تمنع الحاجة لكتابة try-catch في كل controller
 *
 * @param {Function} fn - الدالة الـ async المراد تغليفها
 * @returns {Function} - دالة Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
