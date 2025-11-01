const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verification.controller');
const auth = require('../middlewares/auth');
const checkAdmin = require('../middlewares/checkAdmin');

// User routes (require authentication)
router.post('/submit', auth, verificationController.submitVerification);
router.get('/status', auth, verificationController.getVerificationStatus);
router.get('/documents', auth, verificationController.getUserDocuments);

// Admin routes (require authentication and admin role)
router.get('/admin/pending', auth, checkAdmin, verificationController.getPendingVerifications);
router.get('/admin/document/:id', auth, checkAdmin, verificationController.getVerificationDocument);
router.post('/admin/approve/:id', auth, checkAdmin, verificationController.approveVerification);
router.post('/admin/reject/:id', auth, checkAdmin, verificationController.rejectVerification);
router.get('/admin/stats', auth, checkAdmin, verificationController.getVerificationStats);
router.get('/admin/audit/:userId', auth, checkAdmin, verificationController.getUserAuditLog);

module.exports = router;
