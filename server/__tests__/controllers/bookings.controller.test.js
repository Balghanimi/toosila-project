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

const Booking = require('../../models/bookings.model');
const Offer = require('../../models/offers.model');

// Mock dependencies
jest.mock('../../models/bookings.model');
jest.mock('../../models/offers.model');
jest.mock('../../config/db', () => ({
  query: jest.fn()
}));
jest.mock('../../socket', () => ({
  notifyNewBooking: jest.fn(),
  notifyBookingStatusUpdate: jest.fn()
}));

describe('Bookings Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

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
        get: jest.fn().mockReturnValue(null)
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
      const mockOffer = {
        id: 1,
        driverId: 2,
        seats: 3,
        isActive: true,
        fromCity: 'بغداد',
        toCity: 'البصرة'
      };

      const mockBooking = {
        id: 1,
        passengerId: 1,
        offerId: 1,
        seats: 2,
        toJSON: jest.fn().mockReturnValue({ id: 1, seats: 2 })
      };

      const { query } = require('../../config/db');

      req.body = {
        offerId: 1,
        seats: 2,
        message: 'Test booking'
      };

      Offer.findById = jest.fn().mockResolvedValue(mockOffer);
      query.mockResolvedValue({ rows: [{ total_booked: '0' }] });
      Booking.create = jest.fn().mockResolvedValue(mockBooking);

      await createBooking(req, res);

      expect(Offer.findById).toHaveBeenCalledWith(1);
      expect(Booking.create).toHaveBeenCalledWith({
        passengerId: 1,
        offerId: 1,
        seats: 2,
        message: 'Test booking'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.any(String),
        booking: expect.any(Object)
      });
    });

    it('should reject booking if offer not found', async () => {
      req.body = { offerId: 999, seats: 1 };
      Offer.findById = jest.fn().mockResolvedValue(null);

      await createBooking(req, res);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Offer not found',
          statusCode: 404
        })
      );
    });

    it('should reject booking if offer is not active', async () => {
      const mockOffer = {
        id: 1,
        driverId: 2,
        isActive: false
      };

      req.body = { offerId: 1, seats: 1 };
      Offer.findById = jest.fn().mockResolvedValue(mockOffer);

      await createBooking(req, res);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Offer is not available',
          statusCode: 400
        })
      );
    });

    it('should reject booking own offer', async () => {
      const mockOffer = {
        id: 1,
        driverId: 1, // Same as req.user.id
        isActive: true
      };

      req.body = { offerId: 1, seats: 1 };
      Offer.findById = jest.fn().mockResolvedValue(mockOffer);

      await createBooking(req, res);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'You cannot book your own offer',
          statusCode: 400
        })
      );
    });

    it('should reject booking if not enough seats available', async () => {
      const mockOffer = {
        id: 1,
        driverId: 2,
        seats: 3,
        isActive: true
      };

      const { query } = require('../../config/db');

      req.body = { offerId: 1, seats: 3 };
      Offer.findById = jest.fn().mockResolvedValue(mockOffer);
      query.mockResolvedValue({ rows: [{ total_booked: '2' }] }); // 2 already booked, only 1 available

      await createBooking(req, res);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('seat(s) available'),
          statusCode: 400
        })
      );
    });

    it('should default to 1 seat if not specified', async () => {
      const mockOffer = {
        id: 1,
        driverId: 2,
        seats: 3,
        isActive: true,
        fromCity: 'بغداد',
        toCity: 'البصرة'
      };

      const mockBooking = {
        id: 1,
        toJSON: jest.fn().mockReturnValue({ id: 1 })
      };

      const { query } = require('../../config/db');

      req.body = { offerId: 1 }; // No seats specified

      Offer.findById = jest.fn().mockResolvedValue(mockOffer);
      query.mockResolvedValue({ rows: [{ total_booked: '0' }] });
      Booking.create = jest.fn().mockResolvedValue(mockBooking);

      await createBooking(req, res);

      expect(Booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          seats: 1
        })
      );
    });
  });

  describe('getBookings', () => {
    it('should get all bookings with default pagination', async () => {
      const mockResult = {
        bookings: [{ id: 1 }, { id: 2 }],
        total: 2,
        page: 1,
        limit: 10
      };

      Booking.findAll = jest.fn().mockResolvedValue(mockResult);

      await getBookings(req, res);

      expect(Booking.findAll).toHaveBeenCalledWith(1, 10, {});
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should filter bookings by status', async () => {
      const mockResult = {
        bookings: [{ id: 1, status: 'confirmed' }],
        total: 1
      };

      req.query = { status: 'confirmed' };
      Booking.findAll = jest.fn().mockResolvedValue(mockResult);

      await getBookings(req, res);

      expect(Booking.findAll).toHaveBeenCalledWith(1, 10, { status: 'confirmed' });
    });

    it('should filter bookings by userId', async () => {
      req.query = { userId: '5' };
      Booking.findAll = jest.fn().mockResolvedValue({ bookings: [] });

      await getBookings(req, res);

      expect(Booking.findAll).toHaveBeenCalledWith(1, 10, { passengerId: 5 });
    });

    it('should filter bookings by offerId', async () => {
      req.query = { offerId: '10' };
      Booking.findAll = jest.fn().mockResolvedValue({ bookings: [] });

      await getBookings(req, res);

      expect(Booking.findAll).toHaveBeenCalledWith(1, 10, { offerId: 10 });
    });
  });

  describe('getBookingById', () => {
    it('should get booking by ID for passenger', async () => {
      const mockBooking = {
        id: 1,
        passengerId: 1,
        offerId: 1,
        toJSON: jest.fn().mockReturnValue({ id: 1 })
      };

      req.params.id = '1';
      Booking.findById = jest.fn().mockResolvedValue(mockBooking);

      await getBookingById(req, res);

      expect(Booking.findById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        booking: expect.any(Object)
      });
    });

    it('should get booking by ID for offer owner', async () => {
      const mockBooking = {
        id: 1,
        passengerId: 2,
        offerId: 1
      };

      const mockOffer = {
        id: 1,
        driverId: 1 // Same as req.user.id
      };

      req.params.id = '1';
      Booking.findById = jest.fn().mockResolvedValue(mockBooking);
      Offer.findById = jest.fn().mockResolvedValue(mockOffer);

      await getBookingById(req, res);

      expect(res.json).toHaveBeenCalled();
    });

    it('should allow admin to view any booking', async () => {
      const mockBooking = {
        id: 1,
        passengerId: 2,
        offerId: 1,
        toJSON: jest.fn().mockReturnValue({ id: 1 })
      };

      req.params.id = '1';
      req.user.role = 'admin';
      Booking.findById = jest.fn().mockResolvedValue(mockBooking);

      await getBookingById(req, res);

      expect(res.json).toHaveBeenCalled();
    });

    it('should deny access if user is not passenger or driver', async () => {
      const mockBooking = {
        id: 1,
        passengerId: 2,
        offerId: 1
      };

      const mockOffer = {
        id: 1,
        driverId: 3 // Different from req.user.id
      };

      req.params.id = '1';
      Booking.findById = jest.fn().mockResolvedValue(mockBooking);
      Offer.findById = jest.fn().mockResolvedValue(mockOffer);

      await getBookingById(req, res);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Access denied',
          statusCode: 403
        })
      );
    });

    it('should return 404 if booking not found', async () => {
      req.params.id = '999';
      Booking.findById = jest.fn().mockResolvedValue(null);

      await getBookingById(req, res);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Booking not found',
          statusCode: 404
        })
      );
    });
  });

  describe('updateBookingStatus', () => {
    it('should update booking status to confirmed', async () => {
      const mockBooking = {
        id: 1,
        passengerId: 2,
        offerId: 1,
        seats: 2,
        status: 'pending',
        updateStatus: jest.fn().mockResolvedValue({
          id: 1,
          status: 'confirmed',
          toJSON: jest.fn().mockReturnValue({ id: 1, status: 'confirmed' })
        })
      };

      const mockOffer = {
        id: 1,
        driverId: 1,
        seats: 3,
        fromCity: 'بغداد',
        toCity: 'البصرة',
        updateSeats: jest.fn()
      };

      const { query } = require('../../config/db');

      req.params.id = '1';
      req.body = { status: 'confirmed' };

      Booking.findById = jest.fn().mockResolvedValue(mockBooking);
      Offer.findById = jest.fn().mockResolvedValue(mockOffer);
      query.mockResolvedValue({ rows: [{ total_booked: '0' }] });

      await updateBookingStatus(req, res);

      expect(mockOffer.updateSeats).toHaveBeenCalledWith(1); // 3 - 2 = 1
      expect(mockBooking.updateStatus).toHaveBeenCalledWith('confirmed', undefined);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.any(String),
        booking: expect.any(Object)
      });
    });

    it('should restore seats when cancelling confirmed booking', async () => {
      const mockBooking = {
        id: 1,
        passengerId: 2,
        offerId: 1,
        seats: 2,
        status: 'confirmed',
        updateStatus: jest.fn().mockResolvedValue({
          id: 1,
          status: 'cancelled',
          toJSON: jest.fn().mockReturnValue({ id: 1, status: 'cancelled' })
        })
      };

      const mockOffer = {
        id: 1,
        driverId: 1,
        seats: 1,
        fromCity: 'بغداد',
        toCity: 'البصرة',
        updateSeats: jest.fn()
      };

      req.params.id = '1';
      req.body = { status: 'cancelled' };

      Booking.findById = jest.fn().mockResolvedValue(mockBooking);
      Offer.findById = jest.fn().mockResolvedValue(mockOffer);

      await updateBookingStatus(req, res);

      expect(mockOffer.updateSeats).toHaveBeenCalledWith(3); // 1 + 2 = 3
    });

    it('should reject if user is not offer owner', async () => {
      const mockBooking = {
        id: 1,
        offerId: 1
      };

      const mockOffer = {
        id: 1,
        driverId: 2 // Different from req.user.id
      };

      req.params.id = '1';
      req.body = { status: 'confirmed' };

      Booking.findById = jest.fn().mockResolvedValue(mockBooking);
      Offer.findById = jest.fn().mockResolvedValue(mockOffer);

      await updateBookingStatus(req, res);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('your offers'),
          statusCode: 403
        })
      );
    });

    it('should reject invalid status', async () => {
      const mockBooking = {
        id: 1,
        offerId: 1
      };

      const mockOffer = {
        id: 1,
        driverId: 1
      };

      req.params.id = '1';
      req.body = { status: 'invalid_status' };

      Booking.findById = jest.fn().mockResolvedValue(mockBooking);
      Offer.findById = jest.fn().mockResolvedValue(mockOffer);

      await updateBookingStatus(req, res);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid status',
          statusCode: 400
        })
      );
    });

    it('should allow admin to update any booking', async () => {
      const mockBooking = {
        id: 1,
        offerId: 1,
        status: 'pending',
        updateStatus: jest.fn().mockResolvedValue({
          toJSON: jest.fn().mockReturnValue({ id: 1 })
        })
      };

      const mockOffer = {
        id: 1,
        driverId: 2,
        fromCity: 'بغداد',
        toCity: 'البصرة'
      };

      req.params.id = '1';
      req.body = { status: 'cancelled' };
      req.user.role = 'admin';

      Booking.findById = jest.fn().mockResolvedValue(mockBooking);
      Offer.findById = jest.fn().mockResolvedValue(mockOffer);

      await updateBookingStatus(req, res);

      expect(mockBooking.updateStatus).toHaveBeenCalled();
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking successfully', async () => {
      const mockBooking = {
        id: 1,
        passengerId: 1,
        status: 'pending',
        updateStatus: jest.fn().mockResolvedValue({
          toJSON: jest.fn().mockReturnValue({ id: 1, status: 'cancelled' })
        })
      };

      req.params.id = '1';
      Booking.findById = jest.fn().mockResolvedValue(mockBooking);

      await cancelBooking(req, res);

      expect(mockBooking.updateStatus).toHaveBeenCalledWith('cancelled');
      expect(res.json).toHaveBeenCalledWith({
        message: expect.any(String),
        booking: expect.any(Object)
      });
    });

    it('should reject if user is not booking owner', async () => {
      const mockBooking = {
        id: 1,
        passengerId: 2, // Different from req.user.id
        status: 'pending'
      };

      req.params.id = '1';
      Booking.findById = jest.fn().mockResolvedValue(mockBooking);

      await cancelBooking(req, res);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('your own bookings'),
          statusCode: 403
        })
      );
    });

    it('should reject cancelling already cancelled booking', async () => {
      const mockBooking = {
        id: 1,
        passengerId: 1,
        status: 'cancelled'
      };

      req.params.id = '1';
      Booking.findById = jest.fn().mockResolvedValue(mockBooking);

      await cancelBooking(req, res);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Booking is already cancelled',
          statusCode: 400
        })
      );
    });

    it('should reject cancelling completed booking', async () => {
      const mockBooking = {
        id: 1,
        passengerId: 1,
        status: 'completed'
      };

      req.params.id = '1';
      Booking.findById = jest.fn().mockResolvedValue(mockBooking);

      await cancelBooking(req, res);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Cannot cancel completed booking',
          statusCode: 400
        })
      );
    });
  });

  describe('getUserBookings', () => {
    it('should get current user bookings', async () => {
      const mockResult = {
        bookings: [{ id: 1 }],
        total: 1
      };

      Booking.getSentBookings = jest.fn().mockResolvedValue(mockResult);

      await getUserBookings(req, res);

      expect(Booking.getSentBookings).toHaveBeenCalledWith(1, 1, 10);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should get specific user bookings', async () => {
      const mockResult = {
        bookings: [],
        total: 0
      };

      req.params.userId = '5';
      Booking.getSentBookings = jest.fn().mockResolvedValue(mockResult);

      await getUserBookings(req, res);

      expect(Booking.getSentBookings).toHaveBeenCalledWith('5', 1, 10);
    });
  });

  describe('getOfferBookings', () => {
    it('should get bookings for user offers', async () => {
      const mockResult = {
        bookings: [{ id: 1 }, { id: 2 }],
        total: 2
      };

      Booking.getReceivedBookings = jest.fn().mockResolvedValue(mockResult);

      await getOfferBookings(req, res);

      expect(Booking.getReceivedBookings).toHaveBeenCalledWith(1, 1, 10);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('getBookingStats', () => {
    it('should get booking statistics', async () => {
      const { query } = require('../../config/db');
      const mockStats = {
        total: 100,
        pending: 20,
        confirmed: 50,
        cancelled: 15,
        completed: 15
      };

      query.mockResolvedValue({ rows: [mockStats] });

      await getBookingStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockStats
      });
    });
  });

  describe('getUserBookingStats', () => {
    it('should get user booking statistics', async () => {
      const { query } = require('../../config/db');
      const mockStats = {
        total_bookings: 10,
        pending_bookings: 2,
        confirmed_bookings: 5,
        cancelled_bookings: 1,
        completed_bookings: 2,
        average_booking_value: 45000
      };

      query.mockResolvedValue({ rows: [mockStats] });

      await getUserBookingStats(req, res);

      expect(query).toHaveBeenCalledWith(
        expect.any(String),
        [1]
      );
      expect(res.json).toHaveBeenCalledWith({
        stats: mockStats
      });
    });
  });

  describe('getPendingCount', () => {
    it('should get pending bookings count', async () => {
      const { query } = require('../../config/db');

      query
        .mockResolvedValueOnce({ rows: [{ count: '3' }] }) // received pending
        .mockResolvedValueOnce({ rows: [{ count: '2' }] }); // sent pending

      await getPendingCount(req, res);

      expect(res.json).toHaveBeenCalledWith({
        receivedPending: 3,
        sentPending: 2,
        totalPending: 5
      });
    });
  });
});
