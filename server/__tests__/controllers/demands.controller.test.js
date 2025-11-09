/**
 * Unit Tests for Demands Controller
 * Comprehensive test coverage for demand endpoints
 */

const {
  createDemand,
  getDemands,
  getDemandById,
  updateDemand,
  deactivateDemand,
  getUserDemands,
  searchDemands,
  getCategories
} = require('../../controllers/demands.controller');

const Demand = require('../../models/demands.model');

// Mock dependencies
jest.mock('../../models/demands.model');
jest.mock('../../config/db', () => ({
  query: jest.fn()
}));

describe('Demands Controller', () => {
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
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  describe('createDemand', () => {
    it('should create a demand successfully', async () => {
      const demandData = {
        fromCity: 'بغداد',
        toCity: 'أربيل',
        earliestTime: '2025-10-27T08:00:00Z',
        latestTime: '2025-10-27T12:00:00Z',
        seats: 2,
        budgetMax: 60000
      };

      const mockDemand = {
        id: 1,
        passengerId: 1,
        ...demandData,
        toJSON: jest.fn().mockReturnValue({ id: 1, ...demandData })
      };

      req.body = demandData;
      Demand.create = jest.fn().mockResolvedValue(mockDemand);

      await createDemand(req, res);

      expect(Demand.create).toHaveBeenCalledWith({
        passengerId: 1,
        ...demandData
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String),
        demand: expect.any(Object)
      });
    });

    it('should handle errors during demand creation', async () => {
      req.body = {
        fromCity: 'بغداد',
        toCity: 'أربيل'
      };

      Demand.create = jest.fn().mockRejectedValue(new Error('Database error'));

      await createDemand(req, res);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getDemands', () => {
    it('should get all demands with default pagination', async () => {
      const mockResult = {
        demands: [
          { id: 1, fromCity: 'بغداد' },
          { id: 2, fromCity: 'البصرة' }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2
        }
      };

      Demand.findAll = jest.fn().mockResolvedValue(mockResult);

      await getDemands(req, res);

      expect(Demand.findAll).toHaveBeenCalledWith(1, 10, {});
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should filter demands by fromCity and toCity', async () => {
      const mockResult = {
        demands: [{ id: 1 }],
        pagination: { page: 1, limit: 10, total: 1 }
      };

      req.query = {
        fromCity: 'بغداد',
        toCity: 'أربيل',
        page: '2',
        limit: '20'
      };

      Demand.findAll = jest.fn().mockResolvedValue(mockResult);

      await getDemands(req, res);

      expect(Demand.findAll).toHaveBeenCalledWith(2, 20, {
        fromCity: 'بغداد',
        toCity: 'أربيل'
      });
    });

    it('should filter demands by budget and dates', async () => {
      req.query = {
        maxBudget: '50000',
        earliestDate: '2025-10-27',
        latestDate: '2025-10-30'
      };

      Demand.findAll = jest.fn().mockResolvedValue({ demands: [] });

      await getDemands(req, res);

      expect(Demand.findAll).toHaveBeenCalledWith(1, 10, {
        maxBudget: 50000,
        earliestDate: '2025-10-27',
        latestDate: '2025-10-30'
      });
    });

    it('should filter demands by passengerId', async () => {
      req.query = { passengerId: '5' };
      Demand.findAll = jest.fn().mockResolvedValue({ demands: [] });

      await getDemands(req, res);

      expect(Demand.findAll).toHaveBeenCalledWith(1, 10, { passengerId: '5' });
    });
  });

  describe('getDemandById', () => {
    it('should get demand by ID successfully', async () => {
      const mockDemand = {
        id: 1,
        fromCity: 'بغداد',
        toCity: 'أربيل',
        toJSON: jest.fn().mockReturnValue({ id: 1, fromCity: 'بغداد' })
      };

      req.params.id = '1';
      Demand.findById = jest.fn().mockResolvedValue(mockDemand);

      await getDemandById(req, res);

      expect(Demand.findById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        demand: expect.any(Object)
      });
    });

    it('should return 404 if demand not found', async () => {
      req.params.id = '999';
      Demand.findById = jest.fn().mockResolvedValue(null);

      await getDemandById(req, res);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'الطلب غير موجود',
          statusCode: 404
        })
      );
    });
  });

  describe('updateDemand', () => {
    it('should update demand successfully by owner', async () => {
      const mockDemand = {
        id: 1,
        passengerId: 1,
        update: jest.fn().mockResolvedValue({
          id: 1,
          fromCity: 'الموصل',
          toJSON: jest.fn().mockReturnValue({ id: 1, fromCity: 'الموصل' })
        })
      };

      req.params.id = '1';
      req.body = {
        fromCity: 'الموصل',
        budgetMax: 70000
      };

      Demand.findById = jest.fn().mockResolvedValue(mockDemand);

      await updateDemand(req, res);

      expect(Demand.findById).toHaveBeenCalledWith('1');
      expect(mockDemand.update).toHaveBeenCalledWith({
        from_city: 'الموصل',
        budget_max: 70000
      });
      expect(res.json).toHaveBeenCalledWith({
        message: expect.any(String),
        demand: expect.any(Object)
      });
    });

    it('should reject update if user is not owner', async () => {
      const mockDemand = {
        id: 1,
        passengerId: 2 // Different from req.user.id
      };

      req.params.id = '1';
      req.body = { budgetMax: 70000 };

      Demand.findById = jest.fn().mockResolvedValue(mockDemand);

      await updateDemand(req, res);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'يمكنك فقط تعديل طلباتك الخاصة',
          statusCode: 403
        })
      );
    });

    it('should allow admin to update any demand', async () => {
      const mockDemand = {
        id: 1,
        passengerId: 2,
        update: jest.fn().mockResolvedValue({
          toJSON: jest.fn().mockReturnValue({ id: 1 })
        })
      };

      req.params.id = '1';
      req.body = { budgetMax: 70000 };
      req.user.role = 'admin';

      Demand.findById = jest.fn().mockResolvedValue(mockDemand);

      await updateDemand(req, res);

      expect(mockDemand.update).toHaveBeenCalled();
    });

    it('should return 404 if demand not found', async () => {
      req.params.id = '999';
      req.body = { budgetMax: 70000 };

      Demand.findById = jest.fn().mockResolvedValue(null);

      await updateDemand(req, res);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'الطلب غير موجود',
          statusCode: 404
        })
      );
    });
  });

  describe('deactivateDemand', () => {
    it('should deactivate demand successfully', async () => {
      const mockDemand = {
        id: 1,
        passengerId: 1,
        deactivate: jest.fn().mockResolvedValue(true)
      };

      req.params.id = '1';
      Demand.findById = jest.fn().mockResolvedValue(mockDemand);

      await deactivateDemand(req, res);

      expect(mockDemand.deactivate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: expect.any(String)
      });
    });

    it('should reject deactivation if user is not owner', async () => {
      const mockDemand = {
        id: 1,
        passengerId: 2
      };

      req.params.id = '1';
      Demand.findById = jest.fn().mockResolvedValue(mockDemand);

      await deactivateDemand(req, res);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'يمكنك فقط إلغاء تفعيل طلباتك الخاصة',
          statusCode: 403
        })
      );
    });

    it('should allow admin to deactivate any demand', async () => {
      const mockDemand = {
        id: 1,
        passengerId: 2,
        deactivate: jest.fn().mockResolvedValue(true)
      };

      req.params.id = '1';
      req.user.role = 'admin';

      Demand.findById = jest.fn().mockResolvedValue(mockDemand);

      await deactivateDemand(req, res);

      expect(mockDemand.deactivate).toHaveBeenCalled();
    });
  });

  describe('getUserDemands', () => {
    it('should get current user demands', async () => {
      const mockResult = {
        demands: [{ id: 1 }, { id: 2 }],
        pagination: { page: 1, limit: 10, total: 2 }
      };

      Demand.findByPassengerId = jest.fn().mockResolvedValue(mockResult);

      await getUserDemands(req, res);

      expect(Demand.findByPassengerId).toHaveBeenCalledWith(1, 1, 10);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should get specific user demands', async () => {
      const mockResult = {
        demands: [],
        pagination: { page: 1, limit: 10, total: 0 }
      };

      req.params.userId = '5';
      Demand.findByPassengerId = jest.fn().mockResolvedValue(mockResult);

      await getUserDemands(req, res);

      expect(Demand.findByPassengerId).toHaveBeenCalledWith('5', 1, 10);
    });

    it('should support custom pagination', async () => {
      req.query = { page: '2', limit: '20' };
      Demand.findByPassengerId = jest.fn().mockResolvedValue({ demands: [] });

      await getUserDemands(req, res);

      expect(Demand.findByPassengerId).toHaveBeenCalledWith(1, 2, 20);
    });
  });

  describe('searchDemands', () => {
    it('should search demands successfully', async () => {
      const mockResult = {
        demands: [
          { id: 1, fromCity: 'بغداد' },
          { id: 2, toCity: 'بغداد' }
        ],
        pagination: { page: 1, limit: 10, total: 2 }
      };

      req.query = { q: 'بغداد', page: '1', limit: '10' };
      Demand.search = jest.fn().mockResolvedValue(mockResult);

      await searchDemands(req, res);

      expect(Demand.search).toHaveBeenCalledWith('بغداد', 1, 10);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 if search term is missing', async () => {
      req.query = {};

      await searchDemands(req, res);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'مطلوب كلمة بحث',
          statusCode: 400
        })
      );
    });

    it('should handle empty search results', async () => {
      const mockResult = {
        demands: [],
        pagination: { page: 1, limit: 10, total: 0 }
      };

      req.query = { q: 'nonexistent' };
      Demand.search = jest.fn().mockResolvedValue(mockResult);

      await searchDemands(req, res);

      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('getCategories', () => {
    it('should get all active categories', async () => {
      const { query } = require('../../config/db');
      const mockCategories = [
        { id: 1, name: 'بغداد', is_active: true },
        { id: 2, name: 'البصرة', is_active: true },
        { id: 3, name: 'أربيل', is_active: true }
      ];

      query.mockResolvedValue({ rows: mockCategories });

      await getCategories(req, res);

      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM categories WHERE is_active = true ORDER BY name'
      );
      expect(res.json).toHaveBeenCalledWith({
        categories: mockCategories
      });
    });

    it('should handle empty categories', async () => {
      const { query } = require('../../config/db');
      query.mockResolvedValue({ rows: [] });

      await getCategories(req, res);

      expect(res.json).toHaveBeenCalledWith({
        categories: []
      });
    });
  });
});
