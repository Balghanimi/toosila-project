const { AppError, NotFoundError, ValidationError } = require('../../utils/errors');
const { HTTP_STATUS, ERROR_CODES } = require('../../constants');

describe('AppError & Custom Errors', () => {
  describe('AppError', () => {
    it('should create an AppError with correct properties', () => {
      const error = new AppError('Test error', 400, 'TEST_ERROR');
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.status).toBe('fail');
      expect(error.isOperational).toBe(true);
    });

    it('should set status to "error" for 500 codes', () => {
      const error = new AppError('Server error', 500, 'SERVER_ERROR');
      expect(error.status).toBe('error');
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with details', () => {
      const details = [{ field: 'email', message: 'Invalid email' }];
      const error = new ValidationError('Validation failed', details);
      
      expect(error.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
      expect(error.details).toEqual(details);
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError with correct message', () => {
      const error = new NotFoundError('User');
      
      expect(error.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
      expect(error.code).toBe(ERROR_CODES.NOT_FOUND);
      expect(error.message).toBe('User not found');
      expect(error.resource).toBe('User');
    });
  });
});
