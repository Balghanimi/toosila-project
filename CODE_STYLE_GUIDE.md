# Toosila Code Style Guide

## Table of Contents
1. [General Principles](#general-principles)
2. [File Organization](#file-organization)
3. [Naming Conventions](#naming-conventions)
4. [Code Formatting](#code-formatting)
5. [JavaScript/Node.js Guidelines](#javascriptnodejs-guidelines)
6. [React Guidelines](#react-guidelines)
7. [Error Handling](#error-handling)
8. [Database Queries](#database-queries)
9. [Comments and Documentation](#comments-and-documentation)
10. [Security Best Practices](#security-best-practices)

## General Principles

### DRY (Don't Repeat Yourself)
- Extract repeated code into reusable functions
- Use helper utilities for common operations
- Create services for business logic

### KISS (Keep It Simple, Stupid)
- Write simple, readable code
- Avoid over-engineering
- One function should do one thing

### YAGNI (You Aren't Gonna Need It)
- Don't add functionality until it's needed
- Focus on current requirements

## File Organization

### Backend Structure
```
server/
├── config/          # Configuration files
├── constants/       # Application constants
├── controllers/     # HTTP request handlers (thin layer)
├── middlewares/     # Express middlewares
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic layer
├── utils/           # Utility functions and helpers
└── server.js        # Entry point
```

### Frontend Structure
```
client/src/
├── components/      # Reusable components
├── context/         # React contexts
├── pages/           # Page components
├── services/        # API service layer
├── utils/           # Utility functions
└── App.js           # Main app component
```

## Naming Conventions

### Variables and Functions
- Use **camelCase** for variables and functions
- Use descriptive names that explain purpose
- Boolean variables should start with `is`, `has`, `should`, `can`

```javascript
// Good
const userName = 'Ali';
const isDriver = true;
const hasVerifiedEmail = false;

function getUserProfile(userId) { }
function validateEmail(email) { }

// Bad
const un = 'Ali';
const driver = true;
const verified = false;

function get(id) { }
function validate(e) { }
```

### Constants
- Use **UPPER_SNAKE_CASE** for constants
- Group related constants in objects

```javascript
// Good
const MAX_LOGIN_ATTEMPTS = 5;
const { BOOKING_STATUS, USER_ROLES } = require('./constants');

// Bad
const maxLoginAttempts = 5;
const bookingStatus = { pending: 'pending' };
```

### Classes and Components
- Use **PascalCase** for classes and React components

```javascript
// Good
class AuthService { }
class UserProfile extends React.Component { }
function BookingCard() { }

// Bad
class authService { }
function bookingCard() { }
```

### Files
- Use **camelCase** for JavaScript files
- Use **PascalCase** for React component files
- Use **.controller.js**, **.service.js**, **.model.js** suffixes

```
// Good
auth.controller.js
booking.service.js
users.model.js
BookingCard.js

// Bad
AuthController.js
Booking-Service.js
Users_Model.js
```

### Private Methods
- Prefix private methods with underscore

```javascript
class AuthService {
  // Public method
  async loginUser(email, password) { }

  // Private method
  _generateToken(user) { }
}
```

## Code Formatting

### Prettier Configuration
We use Prettier for automatic code formatting:
- **Semicolons**: Always use semicolons
- **Quotes**: Single quotes for strings
- **Print Width**: 100 characters
- **Tab Width**: 2 spaces
- **Trailing Commas**: ES5 style

### Indentation
- Use **2 spaces** for indentation (no tabs)
- Align continuation lines logically

### Line Length
- Keep lines under **100 characters**
- Break long lines logically

### Spacing
- Space after keywords: `if (condition)` not `if(condition)`
- Space around operators: `a + b` not `a+b`
- No space before function parentheses: `function name()` not `function name ()`

## JavaScript/Node.js Guidelines

### Use Modern JavaScript
- Always use `const` and `let`, never use `var`
- Use `const` by default, `let` when reassignment is needed

```javascript
// Good
const API_URL = 'https://api.toosila.com';
let counter = 0;

// Bad
var API_URL = 'https://api.toosila.com';
var counter = 0;
```

### Use Async/Await Over Promises
- Prefer `async/await` over `.then()` chains
- Always handle errors with try-catch or error handler

```javascript
// Good
const getUserData = async (userId) => {
  const user = await User.findById(userId);
  return user;
};

// Bad
const getUserData = (userId) => {
  return User.findById(userId).then(user => user);
};
```

### Use Arrow Functions
- Use arrow functions for callbacks and short functions
- Use regular functions for methods

```javascript
// Good
const numbers = [1, 2, 3].map((n) => n * 2);
const double = (x) => x * 2;

// For object methods, use regular functions
const user = {
  name: 'Ali',
  greet() {
    return `Hello, ${this.name}`;
  }
};
```

### Destructuring
- Use destructuring for objects and arrays

```javascript
// Good
const { name, email } = req.body;
const [first, second] = array;

// Bad
const name = req.body.name;
const email = req.body.email;
```

### Template Literals
- Use template literals for string concatenation

```javascript
// Good
const greeting = `Hello, ${name}!`;
const url = `/api/users/${userId}`;

// Bad
const greeting = 'Hello, ' + name + '!';
const url = '/api/users/' + userId;
```

### Object Shorthand
- Use object property and method shorthand

```javascript
// Good
const name = 'Ali';
const user = { name, email, greet() { } };

// Bad
const user = { name: name, email: email, greet: function() { } };
```

### Equality Operators
- Always use `===` and `!==`, never use `==` or `!=`

```javascript
// Good
if (value === null) { }
if (count !== 0) { }

// Bad
if (value == null) { }
if (count != 0) { }
```

## React Guidelines

### Component Structure
```javascript
// Imports
import React, { useState, useEffect } from 'react';
import { SomeComponent } from './SomeComponent';

// Component definition
function MyComponent({ prop1, prop2 }) {
  // State declarations
  const [state, setState] = useState(initialValue);

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // Event handlers
  const handleClick = () => {
    // Handler logic
  };

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// PropTypes (if used)
MyComponent.propTypes = { };

// Export
export default MyComponent;
```

### Hooks
- Use hooks at the top level of the component
- Never call hooks inside loops, conditions, or nested functions
- Custom hooks should start with `use`

```javascript
// Good
function useAuth() {
  const [user, setUser] = useState(null);
  return { user, setUser };
}

function Component() {
  const { user } = useAuth();
  // ...
}
```

### Event Handlers
- Prefix event handlers with `handle`
- Pass functions, not function calls, to event handlers

```javascript
// Good
const handleSubmit = (e) => {
  e.preventDefault();
  // Logic
};

<button onClick={handleSubmit}>Submit</button>

// Bad
<button onClick={handleSubmit()}>Submit</button>
```

## Error Handling

### Use Custom Error Classes
```javascript
const { NotFoundError, ValidationError } = require('../utils/errors');

// Good
if (!user) {
  throw new NotFoundError('User');
}

// Bad
if (!user) {
  throw new Error('User not found');
}
```

### Use Error Handler Wrapper
```javascript
const { catchAsync } = require('../utils/helpers');

// Good
const getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError('User');
  sendSuccess(res, { user });
});

// Bad
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## Database Queries

### Use Parameterized Queries
- Always use parameterized queries to prevent SQL injection

```javascript
// Good
const query = 'SELECT * FROM users WHERE email = $1';
const result = await pool.query(query, [email]);

// Bad - SQL Injection risk
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

### Keep Queries in Models
- Database queries belong in model files, not controllers

```javascript
// Good - in users.model.js
static async findByEmail(email) {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0] ? new User(result.rows[0]) : null;
}

// Bad - in controller
const query = 'SELECT * FROM users WHERE email = $1';
const result = await pool.query(query, [email]);
```

## Comments and Documentation

### JSDoc for Functions
- Document all public functions with JSDoc

```javascript
/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @returns {Promise<Object>} Created user object
 * @throws {ConflictError} If email already exists
 */
async function registerUser(userData) {
  // Implementation
}
```

### Inline Comments
- Use comments to explain "why", not "what"
- Keep comments up-to-date

```javascript
// Good
// Skip verification for admin users (they're pre-verified)
if (user.role !== 'admin' && !user.email_verified) {
  throw new EmailNotVerifiedError();
}

// Bad
// Check if user is admin and email is verified
if (user.role !== 'admin' && !user.email_verified) {
  throw new EmailNotVerifiedError();
}
```

### TODO Comments
```javascript
// TODO: Add pagination support
// FIXME: This validation is too lenient
// NOTE: This is a temporary workaround
```

## Security Best Practices

### Password Handling
- Always hash passwords with bcrypt
- Use salt rounds of 12 or higher
- Never log or expose passwords

```javascript
const { BCRYPT } = require('../constants');
const passwordHash = await bcrypt.hash(password, BCRYPT.SALT_ROUNDS);
```

### Input Validation
- Validate all user input
- Sanitize data before processing
- Use express-validator for request validation

### Authentication
- Use JWT tokens with appropriate expiry
- Never expose sensitive data in tokens
- Verify tokens on protected routes

### Environment Variables
- Store secrets in `.env` file
- Never commit `.env` to version control
- Validate required environment variables on startup

```javascript
// Good
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

// Bad
const JWT_SECRET = 'hardcoded-secret';
```

### SQL Injection Prevention
- Always use parameterized queries
- Never concatenate user input into SQL

### XSS Prevention
- Sanitize user input
- Use Content Security Policy headers
- Escape output in templates

## Import Order

Organize imports in this order:
1. Node.js built-in modules
2. Third-party modules
3. Local modules (models, utils, etc.)
4. Constants and configs

```javascript
// Node.js built-ins
const crypto = require('crypto');

// Third-party
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Local modules
const User = require('../models/users.model');
const { sendEmail } = require('../utils/emailService');

// Constants
const { BCRYPT, USER_ROLES } = require('../constants');
```

## Console Logging

### In Development
- Use `console.log()` for debugging (remove before commit)

### In Production
- Use logger for all logging
- Log at appropriate levels (info, warn, error)
- Include context in logs

```javascript
const logger = require('../config/logger');

// Good
logger.info('User registered', { userId: user.id, email: user.email });
logger.error('Database connection failed', { error: error.message });

// Bad
console.log('User registered:', user);
console.error('Error:', error);
```

## Testing

### File Naming
- Test files should end with `.test.js`
- Place tests next to the code or in `__tests__` directory

### Test Structure
```javascript
describe('AuthService', () => {
  describe('registerUser', () => {
    it('should create a new user', async () => {
      // Arrange
      const userData = { email: 'test@example.com', password: 'password123' };

      // Act
      const result = await authService.registerUser(userData);

      // Assert
      expect(result.user.email).toBe(userData.email);
    });
  });
});
```

## Performance Tips

1. **Avoid unnecessary renders** - Use `React.memo`, `useMemo`, `useCallback`
2. **Database queries** - Use indexes, limit results, avoid N+1 queries
3. **Caching** - Cache frequently accessed data
4. **Async operations** - Don't block the event loop

## Version Control

### Commit Messages
- Use present tense: "Add feature" not "Added feature"
- Keep first line under 50 characters
- Add detailed description if needed

```
feat: add user authentication service

- Extract auth logic from controller to service
- Add custom error classes
- Improve error handling
```

### Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

## Tools

- **ESLint**: Linting JavaScript code
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **Jest**: Testing framework

## Conclusion

Following this style guide will help maintain code quality, consistency, and readability across the Toosila project. When in doubt, prioritize clarity and simplicity over cleverness.
