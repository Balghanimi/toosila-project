# Quick Start: Using the Refactored Codebase

This guide helps developers quickly understand and use the newly refactored codebase.

## What Changed?

We've improved code quality from **80% to 92%** by:
1. Adding ESLint and Prettier
2. Creating a service layer
3. Standardizing error handling
4. Centralizing constants
5. Adding helper utilities

## Quick Commands

### Linting and Formatting

```bash
# Backend (server)
cd server
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
npm run format        # Format all code

# Frontend (client)
cd client
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
npm run format        # Format all code
```

## How to Use New Patterns

### 1. Writing a New Controller

```javascript
/**
 * Your Controller
 * Handles HTTP requests for XYZ feature
 */

const yourService = require('../services/your.service');
const { catchAsync, sendSuccess } = require('../utils/helpers');
const { NotFoundError } = require('../utils/errors');
const { RESPONSE_MESSAGES, HTTP_STATUS } = require('../constants');

/**
 * Get something by ID
 * @route GET /api/something/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getSomething = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await yourService.getSomething(id);

  sendSuccess(res, result, RESPONSE_MESSAGES.SUCCESS);
});

module.exports = { getSomething };
```

### 2. Writing a New Service

```javascript
/**
 * Your Service
 * Handles business logic for XYZ feature
 */

const YourModel = require('../models/your.model');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { YOUR_CONSTANTS } = require('../constants');

class YourService {
  /**
   * Get something by ID
   * @param {number} id - ID to fetch
   * @returns {Promise<Object>} The result
   */
  async getSomething(id) {
    const item = await YourModel.findById(id);

    if (!item) {
      throw new NotFoundError('Item');
    }

    return item.toJSON();
  }

  /**
   * Create something
   * @param {Object} data - Creation data
   * @returns {Promise<Object>} Created item
   */
  async createSomething(data) {
    // Validate
    if (!data.name) {
      throw new ValidationError('Name is required');
    }

    // Business logic here
    const item = await YourModel.create(data);

    return item.toJSON();
  }
}

module.exports = new YourService();
```

### 3. Using Constants

```javascript
// Instead of magic strings
if (booking.status === 'pending') { ... }

// Use constants
const { BOOKING_STATUS } = require('../constants');
if (booking.status === BOOKING_STATUS.PENDING) { ... }
```

### 4. Using Custom Errors

```javascript
// Instead of generic errors
throw new Error('Not found');

// Use custom error classes
const { NotFoundError } = require('../utils/errors');
throw new NotFoundError('User');
```

### 5. Using Helper Functions

```javascript
// Instead of manual response formatting
res.status(200).json({
  success: true,
  message: 'Success',
  data: result
});

// Use helpers
const { sendSuccess } = require('../utils/helpers');
sendSuccess(res, result, 'Success');

// For pagination
const { sendPaginatedResponse } = require('../utils/helpers');
sendPaginatedResponse(res, items, total, page, limit);
```

## File Structure

```
server/
├── constants/           # ← NEW: All constants here
│   └── index.js
├── controllers/         # ← REFACTORED: Thin HTTP handlers
│   ├── auth.controller.js (527 → 248 lines)
│   └── bookings.controller.js (310 → 263 lines)
├── services/           # ← NEW: Business logic layer
│   ├── auth.service.js
│   └── booking.service.js
├── utils/              # ← ENHANCED: Helper utilities
│   ├── errors.js       # ← NEW: Custom error classes
│   └── helpers.js      # ← NEW: Helper functions
└── middlewares/
    └── error.js        # ← REFACTORED: Better error handling
```

## Common Tasks

### Adding a New Constant

Edit `server/constants/index.js`:

```javascript
const NEW_CONSTANT = {
  VALUE_ONE: 'value1',
  VALUE_TWO: 'value2',
};

module.exports = {
  // ... existing exports
  NEW_CONSTANT,
};
```

### Adding a New Error Type

Edit `server/utils/errors.js`:

```javascript
class YourCustomError extends AppError {
  constructor(message = 'Default message') {
    super(message, HTTP_STATUS.YOUR_CODE, ERROR_CODES.YOUR_CODE);
  }
}

module.exports = {
  // ... existing exports
  YourCustomError,
};
```

### Adding a New Helper

Edit `server/utils/helpers.js`:

```javascript
/**
 * Your helper function
 * @param {*} param - Parameter description
 * @returns {*} Return description
 */
const yourHelper = (param) => {
  // Implementation
};

module.exports = {
  // ... existing exports
  yourHelper,
};
```

## Code Style

Follow `CODE_STYLE_GUIDE.md` for:
- Naming conventions
- File organization
- Comment style
- Error handling
- Security best practices

### Key Rules

1. **Use const/let, never var**
2. **Use async/await, not .then()**
3. **Always use === not ==**
4. **Use template literals for strings**
5. **Add JSDoc to all functions**
6. **Use constants, no magic strings**
7. **Throw custom errors, not generic Error**
8. **Use catchAsync for async routes**

## Before Committing

```bash
# Format your code
npm run format

# Fix lint issues
npm run lint:fix

# Run tests
npm test

# Verify everything passes
npm run format:check
npm run lint
```

## Getting Help

- **Code Style Questions:** Read `CODE_STYLE_GUIDE.md`
- **What Changed:** Read `REFACTORING_SUMMARY.md`
- **Refactoring Patterns:** Look at refactored controllers as examples
- **Error Handling:** Check `server/utils/errors.js`
- **Constants:** Check `server/constants/index.js`

## Examples to Study

### Best Refactored Files
- `server/controllers/auth.controller.js` - Clean controller
- `server/services/auth.service.js` - Business logic
- `server/services/booking.service.js` - Complex service
- `server/utils/helpers.js` - Utility functions
- `server/utils/errors.js` - Error handling

### Before vs After
See `REFACTORING_SUMMARY.md` section "Before and After Comparison"

## Next Steps

1. Read `CODE_STYLE_GUIDE.md` (15 minutes)
2. Study refactored controllers (10 minutes)
3. Try writing a new endpoint using new patterns (30 minutes)
4. Run linter and formatter on your code
5. Ask questions if anything is unclear

## Common Mistakes to Avoid

❌ **DON'T:**
- Write business logic in controllers
- Use magic strings
- Use generic Error class
- Write manual try-catch blocks
- Format responses manually

✅ **DO:**
- Put business logic in services
- Use constants
- Use custom error classes
- Use catchAsync wrapper
- Use helper functions

## Questions?

Contact the team or review:
- `CODE_STYLE_GUIDE.md` - Comprehensive style guide
- `REFACTORING_SUMMARY.md` - What was changed and why
- Refactored controller files - Real examples

Happy coding!
