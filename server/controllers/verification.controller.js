const VerificationDocument = require('../models/verificationDocuments.model');
const User = require('../models/users.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @desc   Submit verification document
 * @route  POST /api/verification/submit
 * @access Private
 */
exports.submitVerification = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Check if user already has a pending or approved verification
  const existingDoc = await VerificationDocument.findLatestByUserId(userId);
  if (existingDoc && (existingDoc.status === 'pending' || existingDoc.status === 'approved')) {
    throw new AppError(
      `لديك طلب تحقق ${existingDoc.status === 'pending' ? 'قيد المراجعة' : 'موافق عليه بالفعل'}`,
      400
    );
  }

  // Validate required fields
  const {
    documentType,
    documentNumber,
    frontImageUrl,
    backImageUrl,
    fullName,
    dateOfBirth,
    issueDate,
    expiryDate,
    issuingCountry
  } = req.body;

  if (!documentType || !frontImageUrl || !fullName) {
    throw new AppError('يرجى تقديم جميع البيانات المطلوبة', 400);
  }

  // Validate document type
  if (!['iraqi_id', 'passport'].includes(documentType)) {
    throw new AppError('نوع الوثيقة غير صحيح', 400);
  }

  // For Iraqi ID, back image is required
  if (documentType === 'iraqi_id' && !backImageUrl) {
    throw new AppError('يرجى رفع صورة الوجه الخلفي للهوية العراقية', 400);
  }

  // Create verification document
  const verificationDoc = await VerificationDocument.create({
    userId,
    documentType,
    documentNumber,
    frontImageUrl,
    backImageUrl,
    fullName,
    dateOfBirth,
    issueDate,
    expiryDate,
    issuingCountry: issuingCountry || 'Iraq'
  });

  res.status(201).json({
    success: true,
    message: 'تم إرسال طلب التحقق بنجاح. سيتم مراجعته قريباً',
    data: verificationDoc
  });
});

/**
 * @desc   Get user's verification status
 * @route  GET /api/verification/status
 * @access Private
 */
exports.getVerificationStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId);
  const latestDoc = await VerificationDocument.findLatestByUserId(userId);

  res.json({
    success: true,
    data: {
      isVerified: user.isVerified,
      verificationStatus: user.verificationStatus,
      verificationDate: user.verificationDate,
      latestDocument: latestDoc
    }
  });
});

/**
 * @desc   Get user's verification documents
 * @route  GET /api/verification/documents
 * @access Private
 */
exports.getUserDocuments = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const documents = await VerificationDocument.findByUserId(userId);

  res.json({
    success: true,
    count: documents.length,
    data: documents
  });
});

/**
 * @desc   Get pending verification documents (Admin only)
 * @route  GET /api/verification/admin/pending
 * @access Private/Admin
 */
exports.getPendingVerifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await VerificationDocument.findPending(page, limit);

  res.json({
    success: true,
    ...result
  });
});

/**
 * @desc   Get verification document by ID (Admin only)
 * @route  GET /api/verification/admin/document/:id
 * @access Private/Admin
 */
exports.getVerificationDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const document = await VerificationDocument.findById(id);
  if (!document) {
    throw new AppError('الوثيقة غير موجودة', 404);
  }

  // Get user info
  const user = await User.findById(document.userId);

  // Get audit log
  const auditLog = await VerificationDocument.getAuditLog(id);

  res.json({
    success: true,
    data: {
      document,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isDriver: user.isDriver,
        ratingAvg: user.ratingAvg,
        ratingCount: user.ratingCount
      },
      auditLog
    }
  });
});

/**
 * @desc   Approve verification document (Admin only)
 * @route  POST /api/verification/admin/approve/:id
 * @access Private/Admin
 */
exports.approveVerification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const reviewerId = req.user.id;
  const { notes } = req.body;

  const document = await VerificationDocument.findById(id);
  if (!document) {
    throw new AppError('الوثيقة غير موجودة', 404);
  }

  if (document.status !== 'pending') {
    throw new AppError('يمكن الموافقة على الوثائق قيد المراجعة فقط', 400);
  }

  const approvedDoc = await VerificationDocument.approve(id, reviewerId, notes);

  res.json({
    success: true,
    message: 'تمت الموافقة على التحقق بنجاح',
    data: approvedDoc
  });
});

/**
 * @desc   Reject verification document (Admin only)
 * @route  POST /api/verification/admin/reject/:id
 * @access Private/Admin
 */
exports.rejectVerification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const reviewerId = req.user.id;
  const { rejectionReason } = req.body;

  if (!rejectionReason) {
    throw new AppError('يرجى تقديم سبب الرفض', 400);
  }

  const document = await VerificationDocument.findById(id);
  if (!document) {
    throw new AppError('الوثيقة غير موجودة', 404);
  }

  if (document.status !== 'pending') {
    throw new AppError('يمكن رفض الوثائق قيد المراجعة فقط', 400);
  }

  const rejectedDoc = await VerificationDocument.reject(id, reviewerId, rejectionReason);

  res.json({
    success: true,
    message: 'تم رفض طلب التحقق',
    data: rejectedDoc
  });
});

/**
 * @desc   Get verification statistics (Admin only)
 * @route  GET /api/verification/admin/stats
 * @access Private/Admin
 */
exports.getVerificationStats = asyncHandler(async (req, res) => {
  const stats = await VerificationDocument.getStats();

  res.json({
    success: true,
    data: stats
  });
});

/**
 * @desc   Get user audit log (Admin only)
 * @route  GET /api/verification/admin/audit/:userId
 * @access Private/Admin
 */
exports.getUserAuditLog = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const auditLog = await VerificationDocument.getUserAuditLog(userId);

  res.json({
    success: true,
    count: auditLog.length,
    data: auditLog
  });
});
