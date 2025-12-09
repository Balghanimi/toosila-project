/**
 * Unit Tests for Bookings Controller
 * Comprehensive test coverage for all booking endpoints
 */

const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getUserBookings,
  getOfferBookings,
  getBookingStats,
  getUserBookingStats,
  getPendingCount
} = require('../../controllers/bookings.controller');

// Mock dependencies
jest.mock('../../services/booking.service', () => ({
  createBooking: jest.fn(),
  updateBookingStatus: jest.fn(),
  cancelBooking: jest.fn(),
  verifyBookingAccess: jest.fn(),
  getBookingStats: jest.fn(),
  getUserBookingStats: jest.fn(),
  getPendingCount: jest.fn()
}));

jest.mock('../../models/bookings.model', () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  getSentBookings: jest.fn(),
  getReceivedBookings: jest.fn()
}));

jest.mock('../../models/offers.model', () => ({
  findById: jest.fn()
}));

jest.mock('../../config/db', () => ({
  query: jest.fn()
}));

jest.mock('../../socket', () => ({
  notifyNewBooking: jest.fn(),
  notifyBookingStatusUpdate: jest.fn()
}));

// Mock catchAsync to await execution
jest.mock('../../utils/helpers', () => {
  const original = jest.requireActual('../../utils/helpers');
  return {
    ...original,
    catchAsync: (fn) => async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (err) {
        next(err);
      }
    }
  };
});

describe('Bookings Controller', () => {
  let req, res, next;

  // Re-require to ensure we have access to the mocked instances
  const bookingService = require('../../services/booking.service');
  const Booking = require('../../models/bookings.model');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'error').mockImplementation(() => { });

    req = {
      body: {},
      params: {},
      query: {},
      user: {
        id: 1,
        name: 'Test User',
        role: 'user'
      },
      app: {
        get: jest.fn().mockReturnValue(null) // for 'io'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  describe('createBooking', () => {
    it('should create a booking successfully', async () => {
      const mockBookingResult = {
        booking: {
          id: 1,
          passengerId: 1,
          offerId: 1,
          seats: 2,
          status: 'pending'
        },
        offer: {
          fromCity: 'بغداد',
          toCity: 'البصرة',
          driverId: 2
        }
      };

      bookingService.createBooking.mockResolvedValue(mockBookingResult);

      req.body = {
        offerId: 1,
        seats: 2,
        message: 'Test booking'
      };

      await createBooking(req, res, next);

      expect(bookingService.createBooking).toHaveBeenCalledWith(1, {
        offerId: 1,
        seats: 2,
        message: 'Test booking'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String),
        data: {
          booking: mockBookingResult.booking
        }
      });
    });

    it('should handle validation errors from service', async () => {
      const error = new Error('Offer not found');
      error.statusCode = 404;
      bookingService.createBooking.mockRejectedValue(error);

      req.body = { offerId: 999, seats: 1 };

      await createBooking(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should validate missing offerId in controller itself', async () => {
      req.body = { seats: 1 }; // Missing offerId

      await createBooking(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'offerId is required'
      }));
      expect(bookingService.createBooking).not.toHaveBeenCalled();
    });

    it('should validate invalid seats in controller itself', async () => {
      req.body = { offerId: 1, seats: 0 };

      await createBooking(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'seats must be between 1 and 7'
      }));
      expect(bookingService.createBooking).not.toHaveBeenCalled();
    });
  });

  describe('getBookings', () => {
    it('should get all bookings via Model', async () => {
      const mockResult = {
        bookings: [{ id: 1 }],
        total: 1,
        page: 1,
        limit: 10
      };

      Booking.findAll.mockResolvedValue(mockResult);

      await getBookings(req, res, next);

      expect(Booking.findAll).toHaveBeenCalledWith(1, 10, {});
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String),
        data: mockResult
      });
    });

    it('should pass filters to Model', async () => {
      req.query = { status: 'confirmed', userId: '5' };
      Booking.findAll.mockResolvedValue({ bookings: [] });

      await getBookings(req, res, next);

      expect(Booking.findAll).toHaveBeenCalledWith(1, 10, {
        status: 'confirmed',
        passengerId: 5
      });
    });
  });

  describe('getBookingById', () => {
    it('should get booking and verify access', async () => {
      const mockBooking = {
        id: 1,
        passengerId: 1,
        offerId: 1,
        toJSON: jest.fn().mockReturnValue({ id: 1 })
      };

      req.params.id = '1';
      Booking.findById.mockResolvedValue(mockBooking);
      bookingService.verifyBookingAccess.mockResolvedValue(true);

      await getBookingById(req, res, next);

      expect(Booking.findById).toHaveBeenCalledWith('1');
      expect(bookingService.verifyBookingAccess).toHaveBeenCalledWith(mockBooking, 1, 'user');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String),
        data: {
          booking: expect.any(Object)
        }
      });
    });

    it('should return 404 if booking not found', async () => {
      req.params.id = '999';
      Booking.findById.mockResolvedValue(null);

      await getBookingById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        message: 'Booking not found'
      }));
    });
  });

  describe('updateBookingStatus', () => {
    it('should update status via service', async () => {
      const mockResult = {
        booking: { id: 1, status: 'confirmed' },
        offer: { passengerId: 1 }
      };

      bookingService.updateBookingStatus.mockResolvedValue(mockResult);

      req.params.id = '1';
      req.body = { status: 'confirmed' };

      await updateBookingStatus(req, res, next);

      expect(bookingService.updateBookingStatus).toHaveBeenCalledWith(
        '1', 1, 'user', 'confirmed', undefined
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String),
        data: {
          booking: mockResult.booking
        }
      });
    });
  });

  describe('cancelBooking', () => {
    it('should cancel via service', async () => {
      const mockBooking = { id: 1, status: 'cancelled' };
      bookingService.cancelBooking.mockResolvedValue(mockBooking);

      req.params.id = '1';

      await cancelBooking(req, res, next);

      expect(bookingService.cancelBooking).toHaveBeenCalledWith('1', 1, 'user');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String),
        data: {
          booking: mockBooking
        }
      });
    });
  });

  describe('getUserBookings', () => {
    it('should get user bookings via Model', async () => {
      const mockResult = { bookings: [], total: 0 };
      Booking.getSentBookings.mockResolvedValue(mockResult);

      await getUserBookings(req, res, next);

      expect(Booking.getSentBookings).toHaveBeenCalledWith(1, 1, 10);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String),
        data: mockResult
      });
    });
  });

  describe('getOfferBookings', () => {
    it('should get offer bookings via Model', async () => {
      const mockResult = { bookings: [], total: 0 };
      Booking.getReceivedBookings.mockResolvedValue(mockResult);

      await getOfferBookings(req, res, next);

      expect(Booking.getReceivedBookings).toHaveBeenCalledWith(1, 1, 10);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String),
        data: mockResult
      });
    });
  });

  describe('getBookingStats', () => {
    it('should get stats via service', async () => {
      const mockStats = { total: 10 };
      bookingService.getBookingStats.mockResolvedValue(mockStats);

      await getBookingStats(req, res, next);

      expect(bookingService.getBookingStats).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String),
        data: mockStats
      });
    });
  });

  describe('getUserBookingStats', () => {
    it('should get user stats via service', async () => {
      const mockStats = { total_bookings: 5 };
      bookingService.getUserBookingStats.mockResolvedValue(mockStats);

      await getUserBookingStats(req, res, next);

      expect(bookingService.getUserBookingStats).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String),
        data: {
          stats: mockStats
        }
      });
    });
  });

  describe('getPendingCount', () => {
    it('should get pending counts via service', async () => {
      const mockCounts = { totalPending: 5 };
      bookingService.getPendingCount.mockResolvedValue(mockCounts);

      await getPendingCount(req, res, next);

      expect(bookingService.getPendingCount).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String),
        data: mockCounts
      });
    });
  });
});
