const linesModel = require('../models/lines.model');

/**
 * Lines Controller - Request handlers for Lines feature
 */

// Error messages in Arabic
const ERRORS = {
  LINE_NOT_FOUND: 'الخط غير موجود',
  LINE_FULL: 'لا توجد مقاعد متاحة في هذا الخط',
  ALREADY_SUBSCRIBED: 'أنت مشترك بالفعل في هذا الخط',
  NOT_LINE_OWNER: 'ليس لديك صلاحية للتعديل على هذا الخط',
  CANNOT_SUBSCRIBE_OWN_LINE: 'لا يمكنك الاشتراك في خطك الخاص',
  SUBSCRIPTION_NOT_FOUND: 'الاشتراك غير موجود',
  MISSING_REQUIRED_FIELDS: 'يرجى ملء جميع الحقول المطلوبة',
  INVALID_SUBSCRIPTION_TYPE: 'نوع الاشتراك غير صالح',
  STOP_NOT_FOUND: 'نقطة التوقف غير موجودة',
  DRIVERS_ONLY: 'هذه العملية متاحة للسائقين فقط',
};

// =============================================
// LINES CONTROLLERS
// =============================================

/**
 * Get all lines with filters
 * GET /api/lines
 */
const getLines = async (req, res) => {
  try {
    const filters = {
      fromCity: req.query.fromCity,
      toCity: req.query.toCity,
      lineType: req.query.lineType,
      isLadiesOnly: req.query.isLadiesOnly === 'true',
      minPrice: req.query.minPrice ? parseInt(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice) : undefined,
      status: req.query.status || 'active',
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const result = await linesModel.getAllLines(filters);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error getting lines:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء جلب الخطوط',
    });
  }
};

/**
 * Get single line by ID
 * GET /api/lines/:id
 */
const getLineById = async (req, res) => {
  try {
    const { id } = req.params;

    const line = await linesModel.getLineById(id);

    if (!line) {
      return res.status(404).json({
        success: false,
        error: ERRORS.LINE_NOT_FOUND,
      });
    }

    // Get stops for this line
    const stops = await linesModel.getLineStops(id);

    res.json({
      success: true,
      line: {
        ...line,
        stops,
      },
    });
  } catch (error) {
    console.error('Error getting line:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء جلب بيانات الخط',
    });
  }
};

/**
 * Create new line (drivers only)
 * POST /api/lines
 */
const createLine = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is a driver
    if (!req.user.isDriver && !req.user.is_driver) {
      return res.status(403).json({
        success: false,
        error: ERRORS.DRIVERS_ONLY,
      });
    }

    const {
      name,
      lineType,
      isLadiesOnly,
      fromCity,
      toCity,
      fromLocation,
      toLocation,
      departureTime,
      returnTime,
      workingDays,
      totalSeats,
      monthlyPrice,
      weeklyPrice,
      quarterlyPrice,
    } = req.body;

    // Validate required fields
    if (!name || !lineType || !fromCity || !toCity || !departureTime || !monthlyPrice) {
      return res.status(400).json({
        success: false,
        error: ERRORS.MISSING_REQUIRED_FIELDS,
      });
    }

    const line = await linesModel.createLine({
      driverId: userId,
      name,
      lineType,
      isLadiesOnly,
      fromCity,
      toCity,
      fromLocation,
      toLocation,
      departureTime,
      returnTime,
      workingDays,
      totalSeats,
      monthlyPrice,
      weeklyPrice,
      quarterlyPrice,
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الخط بنجاح',
      line,
    });
  } catch (error) {
    console.error('Error creating line:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء إنشاء الخط',
    });
  }
};

/**
 * Update line (owner only)
 * PUT /api/lines/:id
 */
const updateLine = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check ownership
    const line = await linesModel.getLineById(id);

    if (!line) {
      return res.status(404).json({
        success: false,
        error: ERRORS.LINE_NOT_FOUND,
      });
    }

    if (line.driver_id !== userId) {
      return res.status(403).json({
        success: false,
        error: ERRORS.NOT_LINE_OWNER,
      });
    }

    const updatedLine = await linesModel.updateLine(id, req.body);

    res.json({
      success: true,
      message: 'تم تحديث الخط بنجاح',
      line: updatedLine,
    });
  } catch (error) {
    console.error('Error updating line:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء تحديث الخط',
    });
  }
};

/**
 * Delete line (owner only)
 * DELETE /api/lines/:id
 */
const deleteLine = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check ownership
    const line = await linesModel.getLineById(id);

    if (!line) {
      return res.status(404).json({
        success: false,
        error: ERRORS.LINE_NOT_FOUND,
      });
    }

    if (line.driver_id !== userId) {
      return res.status(403).json({
        success: false,
        error: ERRORS.NOT_LINE_OWNER,
      });
    }

    await linesModel.deleteLine(id);

    res.json({
      success: true,
      message: 'تم حذف الخط بنجاح',
    });
  } catch (error) {
    console.error('Error deleting line:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء حذف الخط',
    });
  }
};

/**
 * Get my lines (driver's own lines)
 * GET /api/lines/my-lines
 */
const getMyLines = async (req, res) => {
  try {
    const userId = req.user.id;

    const lines = await linesModel.getLinesByDriver(userId);

    res.json({
      success: true,
      lines,
    });
  } catch (error) {
    console.error('Error getting my lines:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء جلب خطوطك',
    });
  }
};

/**
 * Get line subscribers (driver only)
 * GET /api/lines/:id/subscribers
 */
const getLineSubscribers = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check ownership
    const line = await linesModel.getLineById(id);

    if (!line) {
      return res.status(404).json({
        success: false,
        error: ERRORS.LINE_NOT_FOUND,
      });
    }

    if (line.driver_id !== userId) {
      return res.status(403).json({
        success: false,
        error: ERRORS.NOT_LINE_OWNER,
      });
    }

    const subscribers = await linesModel.getSubscriptionsByLine(id);

    res.json({
      success: true,
      subscribers,
    });
  } catch (error) {
    console.error('Error getting subscribers:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء جلب المشتركين',
    });
  }
};

// =============================================
// SUBSCRIPTION CONTROLLERS
// =============================================

/**
 * Subscribe to a line
 * POST /api/lines/:id/subscribe
 */
const subscribeToLine = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const {
      pickupStopId,
      subscriptionType,
      paymentMethod,
    } = req.body;

    // Validate subscription type
    const validTypes = ['weekly', 'monthly', 'quarterly'];
    if (!subscriptionType || !validTypes.includes(subscriptionType)) {
      return res.status(400).json({
        success: false,
        error: ERRORS.INVALID_SUBSCRIPTION_TYPE,
      });
    }

    // Get line
    const line = await linesModel.getLineById(id);

    if (!line) {
      return res.status(404).json({
        success: false,
        error: ERRORS.LINE_NOT_FOUND,
      });
    }

    // Check if user is the driver
    if (line.driver_id === userId) {
      return res.status(400).json({
        success: false,
        error: ERRORS.CANNOT_SUBSCRIBE_OWN_LINE,
      });
    }

    // Check if already subscribed
    const alreadySubscribed = await linesModel.isSubscribed(id, userId);
    if (alreadySubscribed) {
      return res.status(400).json({
        success: false,
        error: ERRORS.ALREADY_SUBSCRIBED,
      });
    }

    // Check available seats
    if (line.available_seats <= 0) {
      return res.status(400).json({
        success: false,
        error: ERRORS.LINE_FULL,
      });
    }

    // Calculate dates and amount
    const startDate = new Date();
    let endDate = new Date();
    let amountPaid = line.monthly_price;

    switch (subscriptionType) {
      case 'weekly':
        endDate.setDate(endDate.getDate() + 7);
        amountPaid = line.weekly_price || Math.round(line.monthly_price / 4);
        break;
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        amountPaid = line.monthly_price;
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        amountPaid = line.quarterly_price || line.monthly_price * 3;
        break;
    }

    const subscription = await linesModel.createSubscription({
      lineId: id,
      passengerId: userId,
      pickupStopId,
      subscriptionType,
      startDate,
      endDate,
      amountPaid,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      message: 'تم الاشتراك في الخط بنجاح',
      subscription,
    });
  } catch (error) {
    console.error('Error subscribing to line:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء الاشتراك',
    });
  }
};

/**
 * Unsubscribe from a line
 * DELETE /api/lines/:id/unsubscribe
 */
const unsubscribeFromLine = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get active subscription
    const subscription = await linesModel.getActiveSubscription(id, userId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: ERRORS.SUBSCRIPTION_NOT_FOUND,
      });
    }

    await linesModel.cancelSubscription(subscription.id, userId);

    res.json({
      success: true,
      message: 'تم إلغاء الاشتراك بنجاح',
    });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء إلغاء الاشتراك',
    });
  }
};

/**
 * Get my subscriptions
 * GET /api/subscriptions/my-subscriptions
 */
const getMySubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const status = req.query.status;

    const subscriptions = await linesModel.getSubscriptionsByPassenger(userId, status);

    res.json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء جلب اشتراكاتك',
    });
  }
};

// =============================================
// LINE STOPS CONTROLLERS
// =============================================

/**
 * Add stop to line
 * POST /api/lines/:id/stops
 */
const addLineStop = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { name, location, stopOrder, arrivalTime } = req.body;

    // Check ownership
    const line = await linesModel.getLineById(id);

    if (!line) {
      return res.status(404).json({
        success: false,
        error: ERRORS.LINE_NOT_FOUND,
      });
    }

    if (line.driver_id !== userId) {
      return res.status(403).json({
        success: false,
        error: ERRORS.NOT_LINE_OWNER,
      });
    }

    if (!name || stopOrder === undefined) {
      return res.status(400).json({
        success: false,
        error: ERRORS.MISSING_REQUIRED_FIELDS,
      });
    }

    const stop = await linesModel.addStop(id, {
      name,
      location,
      stopOrder,
      arrivalTime,
    });

    res.status(201).json({
      success: true,
      message: 'تم إضافة نقطة التوقف بنجاح',
      stop,
    });
  } catch (error) {
    console.error('Error adding stop:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء إضافة نقطة التوقف',
    });
  }
};

/**
 * Remove stop from line
 * DELETE /api/lines/:id/stops/:stopId
 */
const removeLineStop = async (req, res) => {
  try {
    const { id, stopId } = req.params;
    const userId = req.user.id;

    // Check ownership
    const line = await linesModel.getLineById(id);

    if (!line) {
      return res.status(404).json({
        success: false,
        error: ERRORS.LINE_NOT_FOUND,
      });
    }

    if (line.driver_id !== userId) {
      return res.status(403).json({
        success: false,
        error: ERRORS.NOT_LINE_OWNER,
      });
    }

    const removedStop = await linesModel.removeStop(stopId);

    if (!removedStop) {
      return res.status(404).json({
        success: false,
        error: ERRORS.STOP_NOT_FOUND,
      });
    }

    res.json({
      success: true,
      message: 'تم حذف نقطة التوقف بنجاح',
    });
  } catch (error) {
    console.error('Error removing stop:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء حذف نقطة التوقف',
    });
  }
};

module.exports = {
  // Lines
  getLines,
  getLineById,
  createLine,
  updateLine,
  deleteLine,
  getMyLines,
  getLineSubscribers,
  // Subscriptions
  subscribeToLine,
  unsubscribeFromLine,
  getMySubscriptions,
  // Stops
  addLineStop,
  removeLineStop,
};
