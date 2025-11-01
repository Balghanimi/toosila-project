const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verification.controller');
const { authenticateToken } = require('../middlewares/auth');
const checkAdmin = require('../middlewares/checkAdmin');

// User routes (require authentication)
router.post('/submit', authenticateToken, verificationController.submitVerification);
router.get('/status', authenticateToken, verificationController.getVerificationStatus);
router.get('/documents', authenticateToken, verificationController.getUserDocuments);

// Admin routes (require authentication and admin role)
router.get('/admin/pending', authenticateToken, checkAdmin, verificationController.getPendingVerifications);
router.get('/admin/document/:id', authenticateToken, checkAdmin, verificationController.getVerificationDocument);
router.post('/admin/approve/:id', authenticateToken, checkAdmin, verificationController.approveVerification);
router.post('/admin/reject/:id', authenticateToken, checkAdmin, verificationController.rejectVerification);
router.get('/admin/stats', authenticateToken, checkAdmin, verificationController.getVerificationStats);
router.get('/admin/audit/:userId', authenticateToken, checkAdmin, verificationController.getUserAuditLog);

module.exports = router;
