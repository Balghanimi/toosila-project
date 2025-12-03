const express = require('express');
const router = express.Router();
const linesController = require('../controllers/lines.controller');
const { authenticateToken } = require('../middlewares/auth');

/**
 * Subscriptions Routes
 * Base path: /api/subscriptions
 */

// All routes require authentication
router.use(authenticateToken);

// Get my subscriptions (for passengers)
router.get('/my-subscriptions', linesController.getMySubscriptions);

module.exports = router;
