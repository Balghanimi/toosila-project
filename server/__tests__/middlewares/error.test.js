/**
 * Unit Tests for Error Middleware
 * Tests global error handling and custom error classes
 */

const {
  errorHandler,
  notFound,
  asyncHandler,
  AppError
} = require('../../middlewares/error');

describe('Error Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      originalUrl: '/test-route'
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    next = jest.fn();

    // Mock console.error to avoid cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('errorHandler', () => {
    it('should handle generic errors', () => {
      const error = new Error('Test error');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Test error'
      });
    });

    it('should handle errors with custom status', () => {
      const error = new Error('Not found');
      error.status = 404;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Not found'
      });
    });

    it('should handle validation errors', () => {
      const error = {
        name: 'ValidationError',
        errors: {
          field1: { message: 'Field 1 is required' },
          field2: { message: 'Field 2 is invalid' }
        }
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation Error',
        details: ['Field 1 is required', 'Field 2 is invalid']
      });
    });

    it('should handle duplicate key error (MongoDB code 11000)', () => {
      const error = {
        code: 11000,
        keyValue: { email: 'test@example.com' }
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'email already exists'
      });
    });

    it('should handle PostgreSQL unique violation', () => {
      const error = {
        code: '23505',
        message: 'Unique constraint violation'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Duplicate entry'
      });
    });

    it('should handle PostgreSQL foreign key violation', () => {
      const error = {
        code: '23503',
        message: 'Foreign key violation'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Referenced record not found'
      });
    });

    it('should handle PostgreSQL not null violation', () => {
      const error = {
        code: '23502',
        column: 'email',
        message: 'Not null violation'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Required field missing: email'
      });
    });

    it('should handle JWT errors', () => {
      const error = {
        name: 'JsonWebTokenError',
        message: 'Invalid token'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid token'
      });
    });

    it('should handle expired token error', () => {
      const error = {
        name: 'TokenExpiredError',
        message: 'Token expired'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token expired'
      });
    });

    it('should handle rate limit errors', () => {
      const error = {
        status: 429,
        message: 'Too many requests'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Too many requests'
      });
    });

    it('should handle file size limit errors', () => {
      const error = {
        code: 'LIMIT_FILE_SIZE',
        message: 'File too large'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(413);
      expect(res.json).toHaveBeenCalledWith({
        error: 'File too large'
      });
    });

    it('should handle file count limit errors', () => {
      const error = {
        code: 'LIMIT_FILE_COUNT',
        message: 'Too many files'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(413);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Too many files'
      });
    });

    it('should include stack trace in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: 'Error stack trace'
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      errorHandler(error, req, res, next);

      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('notFound', () => {
    it('should create 404 error and pass to next middleware', () => {
      notFound(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain('/test-route');
      expect(error.status).toBe(404);
    });

    it('should include the original URL in error message', () => {
      req.originalUrl = '/api/nonexistent';

      notFound(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error.message).toContain('/api/nonexistent');
    });
  });

  describe('asyncHandler', () => {
    it('should handle successful async function', async () => {
      const successFn = jest.fn().mockResolvedValue('success');
      const wrappedFn = asyncHandler(successFn);

      await wrappedFn(req, res, next);

      expect(successFn).toHaveBeenCalledWith(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });

    it('should catch and pass errors to next middleware', async () => {
      const error = new Error('Async error');
      const failingFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = asyncHandler(failingFn);

      await wrappedFn(req, res, next);

      expect(failingFn).toHaveBeenCalledWith(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle thrown errors in async function', async () => {
      const error = new Error('Thrown error');
      const throwingFn = jest.fn().mockImplementation(() => {
        throw error;
      });
      const wrappedFn = asyncHandler(throwingFn);

      await wrappedFn(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('AppError', () => {
    it('should create custom error with message and status code', () => {
      const error = new AppError('Custom error', 400);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(400);
      expect(error.status).toBe('fail');
      expect(error.isOperational).toBe(true);
    });

    it('should set status to "fail" for 4xx errors', () => {
      const error404 = new AppError('Not found', 404);
      const error400 = new AppError('Bad request', 400);

      expect(error404.status).toBe('fail');
      expect(error400.status).toBe('fail');
    });

    it('should set status to "error" for 5xx errors', () => {
      const error500 = new AppError('Server error', 500);
      const error503 = new AppError('Service unavailable', 503);

      expect(error500.status).toBe('error');
      expect(error503.status).toBe('error');
    });

    it('should capture stack trace', () => {
      const error = new AppError('Test error', 400);

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });

    it('should mark error as operational', () => {
      const error = new AppError('Operational error', 400);

      expect(error.isOperational).toBe(true);
    });
  });
});
