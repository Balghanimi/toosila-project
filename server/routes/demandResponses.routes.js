const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { checkDriver } = require('../middlewares/checkDriver');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validate');
const {
  createDemandResponse,
  getResponsesByDemand,
  getMyResponses,
  updateResponseStatus,
  deleteDemandResponse,
  getResponseById
} = require('../controllers/demandResponses.controller');

/**
 * Validation: إنشاء رد على طلب
 */
const validateCreateResponse = [
  body('demandId')
    .notEmpty()
    .withMessage('معرف الطلب مطلوب')
    .isUUID()
    .withMessage('معرف الطلب غير صالح'),
  body('offerPrice')
    .notEmpty()
    .withMessage('السعر المقترح مطلوب')
    .isFloat({ min: 0 })
    .withMessage('السعر المقترح يجب أن يكون رقماً موجباً'),
  body('availableSeats')
    .notEmpty()
    .withMessage('عدد المقاعد المتاحة مطلوب')
    .isInt({ min: 1, max: 7 })
    .withMessage('عدد المقاعد يجب أن يكون بين 1 و 7'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('الرسالة يجب ألا تزيد عن 500 حرف'),
  handleValidationErrors
];

/**
 * Validation: تحديث حالة الرد
 */
const validateUpdateStatus = [
  body('status')
    .notEmpty()
    .withMessage('الحالة مطلوبة')
    .isIn(['accepted', 'rejected', 'cancelled'])
    .withMessage('حالة غير صالحة'),
  handleValidationErrors
];

// ============================================
// Routes
// ============================================

/**
 * POST /api/demand-responses
 * إنشاء رد جديد على طلب
 * للسائقين فقط
 */
router.post(
  '/',
  authenticateToken,
  checkDriver,
  ...validateCreateResponse,
  createDemandResponse
);

/**
 * GET /api/demand-responses/my-responses
 * جلب ردود السائق الحالي على جميع الطلبات
 * للسائقين فقط
 * ملاحظة: يجب أن يكون هذا المسار قبل /:id لتجنب التعارض
 */
router.get(
  '/my-responses',
  authenticateToken,
  checkDriver,
  getMyResponses
);

/**
 * GET /api/demand-responses/demand/:demandId
 * جلب جميع الردود على طلب معين
 * للراكب صاحب الطلب أو السائقين
 */
router.get(
  '/demand/:demandId',
  authenticateToken,
  getResponsesByDemand
);

/**
 * GET /api/demand-responses/:id
 * جلب رد واحد بالمعرف
 * للراكب صاحب الطلب أو السائق صاحب الرد
 */
router.get(
  '/:id',
  authenticateToken,
  getResponseById
);

/**
 * PATCH /api/demand-responses/:id/status
 * تحديث حالة رد (قبول/رفض/إلغاء)
 * للراكب صاحب الطلب (قبول/رفض) أو السائق صاحب الرد (إلغاء)
 */
router.patch(
  '/:id/status',
  authenticateToken,
  ...validateUpdateStatus,
  updateResponseStatus
);

/**
 * DELETE /api/demand-responses/:id
 * حذف رد
 * للسائق صاحب الرد فقط
 */
router.delete(
  '/:id',
  authenticateToken,
  checkDriver,
  deleteDemandResponse
);

module.exports = router;
