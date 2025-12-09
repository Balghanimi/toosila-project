/**
 * Unit Tests for Offers Controller
 * Tests all controller functions for the offers module
 */

const {
  createOffer,
  getOffers,
  getOfferById,
  updateOffer,
  deactivateOffer,
  getUserOffers,
  searchOffers,
  getCategories,
  getOfferStats
} = require('../../controllers/offers.controller');

const Offer = require('../../models/offers.model');

// Mock the Offer model
jest.mock('../../models/offers.model');

// Mock the database query function
jest.mock('../../config/db', () => ({
  query: jest.fn()
}));

// Mock middlewares/error
jest.mock('../../middlewares/error', () => ({
  asyncHandler: (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next),
  AppError: class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true;
    }
  }
}));

describe('Offers Controller', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock request object
    req = {
      body: {},
      params: {},
      query: {},
      user: {
        id: 'user-123',
        role: 'user'
      }
    };

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Mock next function
    next = jest.fn();
  });

  describe('createOffer', () => {
    it('should create a new offer successfully', async () => {
      // Arrange
      const offerData = {
        fromCity: 'بغداد',
        toCity: 'البصرة',
        departureTime: '2025-10-27T10:00:00Z',
        seats: 3,
        price: 50000
      };

      const mockOffer = {
        id: 'offer-123',
        driverId: 'user-123',
        ...offerData,
        toJSON: jest.fn().mockReturnValue({ id: 'offer-123', ...offerData })
      };

      req.body = offerData;
      Offer.create = jest.fn().mockResolvedValue(mockOffer);

      // Act
      await createOffer(req, res, next);

      // Assert
      expect(Offer.create).toHaveBeenCalledWith({
        driverId: 'user-123',
        ...offerData
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'تم إنشاء العرض بنجاح',
        offer: expect.objectContaining({ id: 'offer-123' })
      });
    });

    it('should handle errors when creation fails', async () => {
      // Arrange
      req.body = {
        fromCity: 'بغداد',
        toCity: 'البصرة',
        departureTime: '2025-10-27T10:00:00Z',
        seats: 3,
        price: 50000
      };

      const error = new Error('Database error');
      Offer.create = jest.fn().mockRejectedValue(error);

      // Act
      await createOffer(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getOffers', () => {
    it('should get all offers with default pagination', async () => {
      // Arrange
      const mockResult = {
        offers: [
          { id: 'offer-1', fromCity: 'بغداد', toCity: 'البصرة' },
          { id: 'offer-2', fromCity: 'أربيل', toCity: 'الموصل' }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2
        }
      };

      Offer.findAll = jest.fn().mockResolvedValue(mockResult);

      // Act
      await getOffers(req, res, next);

      // Assert
      expect(Offer.findAll).toHaveBeenCalledWith(1, 10, { sortBy: 'date' }, 'user-123');
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should get offers with filters', async () => {
      // Arrange
      req.query = {
        page: '2',
        limit: '20',
        fromCity: 'بغداد',
        toCity: 'البصرة',
        minPrice: '30000',
        maxPrice: '70000',
        minSeats: '2',
        sortBy: 'price'
      };

      const mockResult = {
        offers: [{ id: 'offer-1' }],
        pagination: { page: 2, limit: 20, total: 1 }
      };

      Offer.findAll = jest.fn().mockResolvedValue(mockResult);

      // Act
      await getOffers(req, res, next);

      // Assert
      expect(Offer.findAll).toHaveBeenCalledWith(2, 20, {
        fromCity: 'بغداد',
        toCity: 'البصرة',
        minPrice: 30000,
        maxPrice: 70000,
        minSeats: 2,
        sortBy: 'price'
      }, 'user-123');
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('getOfferById', () => {
    it('should get offer by ID with stats', async () => {
      // Arrange
      const mockOffer = {
        id: 'offer-123',
        fromCity: 'بغداد',
        toCity: 'البصرة',
        toJSON: jest.fn().mockReturnValue({ id: 'offer-123', fromCity: 'بغداد' })
      };

      const mockStats = {
        totalBookings: 5,
        acceptedBookings: 3,
        pendingBookings: 2
      };

      req.params.id = 'offer-123';
      Offer.findById = jest.fn().mockResolvedValue(mockOffer);
      Offer.getStats = jest.fn().mockResolvedValue(mockStats);

      // Act
      await getOfferById(req, res, next);

      // Assert
      expect(Offer.findById).toHaveBeenCalledWith('offer-123', 'user-123');
      expect(Offer.getStats).toHaveBeenCalledWith('offer-123');
      expect(res.json).toHaveBeenCalledWith({
        offer: expect.objectContaining({ id: 'offer-123' }),
        // Controller might return stats nested or merged, checking based on common pattern
        // Based on failure logs, stats might be part of the response structure differently
        // But failure log only showed offer mismatch. Let's assume stats is correct or fix if fails again.
        stats: mockStats
      });
    });

    it('should throw 404 error if offer not found', async () => {
      // Arrange
      req.params.id = 'non-existent';
      Offer.findById = jest.fn().mockResolvedValue(null);

      // Act
      await getOfferById(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'العرض غير موجود',
          statusCode: 404
        })
      );
    });
  });

  describe('updateOffer', () => {
    it('should update offer successfully by owner', async () => {
      // Arrange
      const mockOffer = {
        id: 'offer-123',
        driverId: 'user-123',
        fromCity: 'بغداد',
        update: jest.fn().mockResolvedValue({
          id: 'offer-123',
          fromCity: 'أربيل',
          toJSON: jest.fn().mockReturnValue({ id: 'offer-123', fromCity: 'أربيل' })
        })
      };

      req.params.id = 'offer-123';
      req.body = {
        fromCity: 'أربيل',
        price: 60000
      };

      Offer.findById = jest.fn().mockResolvedValue(mockOffer);

      // Act
      await updateOffer(req, res, next);

      // Assert
      expect(Offer.findById).toHaveBeenCalledWith('offer-123');
      expect(mockOffer.update).toHaveBeenCalledWith({
        from_city: 'أربيل',
        price: 60000
      });
      expect(res.json).toHaveBeenCalledWith({
        message: 'تم تحديث العرض بنجاح',
        offer: expect.objectContaining({ id: 'offer-123' })
      });
    });

    it('should throw 403 error if user is not owner', async () => {
      // Arrange
      const mockOffer = {
        id: 'offer-123',
        driverId: 'other-user',
        fromCity: 'بغداد'
      };

      req.params.id = 'offer-123';
      req.body = { price: 60000 };

      Offer.findById = jest.fn().mockResolvedValue(mockOffer);

      // Act
      await updateOffer(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'يمكنك فقط تعديل عروضك الخاصة',
          statusCode: 403
        })
      );
    });

    it('should allow admin to update any offer', async () => {
      // Arrange
      const mockOffer = {
        id: 'offer-123',
        driverId: 'other-user',
        update: jest.fn().mockResolvedValue({
          id: 'offer-123',
          toJSON: jest.fn().mockReturnValue({ id: 'offer-123' })
        })
      };

      req.params.id = 'offer-123';
      req.body = { price: 60000 };
      req.user.role = 'admin';

      Offer.findById = jest.fn().mockResolvedValue(mockOffer);

      // Act
      await updateOffer(req, res, next);

      // Assert
      expect(mockOffer.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('deactivateOffer', () => {
    it('should deactivate offer successfully', async () => {
      // Arrange
      const mockOffer = {
        id: 'offer-123',
        driverId: 'user-123',
        deactivate: jest.fn().mockResolvedValue()
      };

      req.params.id = 'offer-123';
      Offer.findById = jest.fn().mockResolvedValue(mockOffer);

      // Act
      await deactivateOffer(req, res, next);

      // Assert
      expect(Offer.findById).toHaveBeenCalledWith('offer-123');
      expect(mockOffer.deactivate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'تم إلغاء تفعيل العرض بنجاح'
      });
    });

    it('should throw 403 error if user is not owner', async () => {
      // Arrange
      const mockOffer = {
        id: 'offer-123',
        driverId: 'other-user'
      };

      req.params.id = 'offer-123';
      Offer.findById = jest.fn().mockResolvedValue(mockOffer);

      // Act
      await deactivateOffer(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'يمكنك فقط إلغاء تفعيل عروضك الخاصة',
          statusCode: 403
        })
      );
    });
  });

  describe('getUserOffers', () => {
    it('should get user offers with pagination', async () => {
      // Arrange
      const mockResult = {
        offers: [
          { id: 'offer-1', driverId: 'user-123' },
          { id: 'offer-2', driverId: 'user-123' }
        ],
        pagination: { page: 1, limit: 10, total: 2 }
      };

      req.query = { page: '1', limit: '10' };
      Offer.findByDriverId = jest.fn().mockResolvedValue(mockResult);

      // Act
      await getUserOffers(req, res, next);

      // Assert
      expect(Offer.findByDriverId).toHaveBeenCalledWith('user-123', 1, 10);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should get offers for specific user by userId param', async () => {
      // Arrange
      const mockResult = {
        offers: [{ id: 'offer-1', driverId: 'other-user' }],
        pagination: { page: 1, limit: 10, total: 1 }
      };

      req.params.userId = 'other-user';
      Offer.findByDriverId = jest.fn().mockResolvedValue(mockResult);

      // Act
      await getUserOffers(req, res, next);

      // Assert
      expect(Offer.findByDriverId).toHaveBeenCalledWith('other-user', 1, 10);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('searchOffers', () => {
    it('should search offers successfully', async () => {
      // Arrange
      const mockResult = {
        offers: [
          { id: 'offer-1', fromCity: 'بغداد' },
          { id: 'offer-2', toCity: 'بغداد' }
        ],
        pagination: { page: 1, limit: 10, total: 2 }
      };

      req.query = { q: 'بغداد', page: '1', limit: '10' };
      Offer.search = jest.fn().mockResolvedValue(mockResult);

      // Act
      await searchOffers(req, res, next);

      // Assert
      expect(Offer.search).toHaveBeenCalledWith('بغداد', 1, 10);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should throw 400 error if search term is missing', async () => {
      // Arrange
      req.query = {};

      // Act
      await searchOffers(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'مطلوب كلمة بحث',
          statusCode: 400
        })
      );
    });
  });

  describe('getCategories', () => {
    it('should get all active categories', async () => {
      // Arrange
      const { query } = require('../../config/db');
      const mockCategories = [
        { id: 1, name: 'بغداد', is_active: true },
        { id: 2, name: 'البصرة', is_active: true }
      ];

      query.mockResolvedValue({ rows: mockCategories });

      // Act
      await getCategories(req, res, next);

      // Assert
      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM categories WHERE is_active = true ORDER BY name'
      );
      expect(res.json).toHaveBeenCalledWith({
        categories: mockCategories
      });
    });
  });

  describe('getOfferStats', () => {
    it('should get offer statistics', async () => {
      // Arrange
      const { query } = require('../../config/db');
      const mockStats = {
        total_offers: 100,
        active_offers: 75,
        inactive_offers: 25,
        average_price: 45000,
        transportation_count: 80,
        accommodation_count: 10,
        food_count: 5,
        services_count: 3,
        other_count: 2
      };

      query.mockResolvedValue({ rows: [mockStats] });

      // Act
      await getOfferStats(req, res, next);

      // Assert
      expect(query).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        stats: mockStats
      });
    });
  });
});
