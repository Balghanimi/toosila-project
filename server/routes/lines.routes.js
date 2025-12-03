const express = require('express');
const router = express.Router();
const linesController = require('../controllers/lines.controller');
const lineInterestModel = require('../models/lineInterest.model');
const { authenticateToken, optionalAuth } = require('../middlewares/auth');

/**
 * Lines Routes
 * Base path: /api/lines
 */

// ===== Interest Registration (Coming Soon) =====
// These are public routes for the coming soon page

// Register interest in Lines feature
router.post('/interest', optionalAuth, async (req, res) => {
  try {
    const { phone, userType, area, destination, preferredTime } = req.body;
    const userId = req.user?.id || null;

    if (!phone) {
      return res.status(400).json({ message: 'رقم الهاتف مطلوب' });
    }

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ message: 'رقم الهاتف غير صحيح' });
    }

    // Validate area and destination (optional but recommended)
    const cleanArea = area?.trim() || null;
    const cleanDestination = destination?.trim() || null;
    const cleanPreferredTime = preferredTime?.trim() || null;

    const interest = await lineInterestModel.createInterest(
      cleanPhone,
      userType || 'student',
      cleanArea,
      cleanDestination,
      cleanPreferredTime,
      userId
    );
    res.status(201).json({
      success: true,
      message: 'تم تسجيل اهتمامك بنجاح',
      data: interest,
    });
  } catch (error) {
    console.error('Error registering interest:', error);
    res.status(500).json({ message: 'حدث خطأ، يرجى المحاولة مرة أخرى' });
  }
});

// Get interest count (public)
router.get('/interest/count', async (req, res) => {
  try {
    const count = await lineInterestModel.getInterestCount();
    res.json({ count });
  } catch (error) {
    console.error('Error getting interest count:', error);
    res.json({ count: 0 });
  }
});

// ===== Main Lines Routes =====
// Public routes (no authentication required)
router.get('/', linesController.getLines);

// Protected routes (authentication required)
router.use(authenticateToken);

// Driver's own lines
router.get('/my-lines', linesController.getMyLines);

// CRUD operations
router.post('/', linesController.createLine);
router.get('/:id', linesController.getLineById);
router.put('/:id', linesController.updateLine);
router.delete('/:id', linesController.deleteLine);

// Subscribers management (for drivers)
router.get('/:id/subscribers', linesController.getLineSubscribers);

// Subscription actions (for passengers)
router.post('/:id/subscribe', linesController.subscribeToLine);
router.delete('/:id/unsubscribe', linesController.unsubscribeFromLine);

// Stops management (for drivers)
router.post('/:id/stops', linesController.addLineStop);
router.delete('/:id/stops/:stopId', linesController.removeLineStop);

module.exports = router;
