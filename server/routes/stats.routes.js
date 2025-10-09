const express = require('express');
const router = express.Router();
const { getUserStats, getRecentActivity } = require('../controllers/stats.controller');
const { authenticateToken } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticateToken);

// Get user statistics
router.get('/user', getUserStats);

// Get recent activity
router.get('/recent-activity', getRecentActivity);

module.exports = router;
