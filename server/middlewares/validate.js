const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your input data',
      details: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 5 })
    .withMessage('كلمة المرور يجب أن تكون 5 أحرف أو أرقام على الأقل'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('isDriver')
    .optional()
    .isBoolean()
    .withMessage('isDriver must be a boolean'),
  body('languagePreference')
    .optional()
    .isIn(['ar', 'en'])
    .withMessage('Language must be either ar or en'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('languagePreference')
    .optional()
    .isIn(['ar', 'en'])
    .withMessage('Language must be either ar or en'),
  handleValidationErrors
];

// Offer validation rules (for ride sharing offers)
const validateOfferCreation = [
  body('fromCity')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('From city must be between 2 and 100 characters'),
  body('toCity')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('To city must be between 2 and 100 characters'),
  body('departureTime')
    .isISO8601()
    .withMessage('Please provide a valid departure time'),
  body('seats')
    .isInt({ min: 1, max: 7 })
    .withMessage('Seats must be between 1 and 7'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  handleValidationErrors
];

const validateOfferUpdate = [
  body('fromCity')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('From city must be between 2 and 100 characters'),
  body('toCity')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('To city must be between 2 and 100 characters'),
  body('departureTime')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid departure time'),
  body('seats')
    .optional()
    .isInt({ min: 1, max: 7 })
    .withMessage('Seats must be between 1 and 7'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  handleValidationErrors
];

// Demand validation rules
const validateDemandCreation = [
  body('fromCity')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('From city must be between 2 and 100 characters'),
  body('toCity')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('To city must be between 2 and 100 characters'),
  body('earliestTime')
    .isISO8601()
    .withMessage('Please provide a valid earliest time'),
  body('latestTime')
    .isISO8601()
    .withMessage('Please provide a valid latest time'),
  body('seats')
    .isInt({ min: 1, max: 7 })
    .withMessage('Seats must be between 1 and 7'),
  body('budgetMax')
    .isFloat({ min: 0 })
    .withMessage('Budget max must be a positive number'),
  handleValidationErrors
];

// Booking validation rules
const validateBookingCreation = [
  body('offerId')
    .custom((value) => {
      // Accept either integer or UUID string
      if (typeof value === 'number' && value > 0) {
        return true;
      }
      if (typeof value === 'string') {
        // Check if it's a UUID (has hyphens) or a number string
        if (value.includes('-') || (!isNaN(value) && parseInt(value, 10) > 0)) {
          return true;
        }
      }
      throw new Error('Please provide a valid offer ID');
    }),
  body('seats')
    .optional()
    .isInt({ min: 1, max: 7 })
    .withMessage('Seats must be between 1 and 7'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message must not exceed 500 characters'),
  handleValidationErrors
];

// Message validation rules
const validateMessageCreation = [
  body('recipientId')
    .isInt({ min: 1 })
    .withMessage('Please provide a valid recipient ID'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters'),
  handleValidationErrors
];

// Rating validation rules
const validateRatingCreation = [
  body('targetUserId')
    .isInt({ min: 1 })
    .withMessage('Please provide a valid user ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment must not exceed 500 characters'),
  handleValidationErrors
];

// Parameter validation
const validateId = [
  param('id')
    .isUUID()
    .withMessage('Please provide a valid UUID'),
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateOfferCreation,
  validateOfferUpdate,
  validateDemandCreation,
  validateBookingCreation,
  validateMessageCreation,
  validateRatingCreation,
  validateId,
  validatePagination
};

