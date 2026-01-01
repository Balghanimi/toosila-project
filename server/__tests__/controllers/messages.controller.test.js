/**
 * Unit Tests for Messages Controller
 * Comprehensive test coverage for messaging endpoints
 */

const {
  sendMessage,
  getConversation,
  getInbox,
  getSentMessages,
  getConversationList,
  markAsRead,
  markConversationAsRead,
  getUnreadCount
} = require('../../controllers/messages.controller');

const Message = require('../../models/messages.model');

// Mock dependencies
jest.mock('../../models/messages.model');
jest.mock('../../models/users.model');

// Create a mock query function that we can control
const mockQuery = jest.fn();
jest.mock('../../config/db', () => ({
  query: (...args) => mockQuery(...args)
}));

// Mock socket notifications
const mockNotifyNewMessage = jest.fn();
jest.mock('../../socket', () => ({
  notifyNewMessage: (...args) => mockNotifyNewMessage(...args)
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

describe('Messages Controller', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    mockQuery.mockReset();
    mockNotifyNewMessage.mockReset();

    // Mock setImmediate to run synchronously
    jest.spyOn(global, 'setImmediate').mockImplementation((cb) => {
      try { cb(); } catch (e) { /* ignore errors in notifications */ }
    });

    req = {
      body: {},
      params: {},
      query: {},
      user: {
        id: 1,
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
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

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const mockMessage = {
        id: 1,
        senderId: 1,
        content: 'Test message',
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          senderId: 1,
          content: 'Test message'
        })
      };

      req.body = {
        rideType: 'offer',
        rideId: 1,
        content: 'Test message'
      };

      // Mock: Offer exists, user is NOT the driver
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, driver_id: 2, from_city: 'A', to_city: 'B' }] });
      // Mock: Participants for notification
      mockQuery.mockResolvedValueOnce({ rows: [] });

      Message.create = jest.fn().mockResolvedValue(mockMessage);

      await sendMessage(req, res, next);

      expect(Message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          rideType: 'offer',
          rideId: 1,
          senderId: 1,
          content: 'Test message',
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.any(String),
        messageData: expect.any(Object)
      });
    });

    it('should allow driver to message on demand without response', async () => {
      req.body = { rideType: 'demand', rideId: 10, content: 'Hi' };

      // Mock: Demand check returns demand (user has access)
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 10, passenger_id: 99, from_city: 'A', to_city: 'B' }]
      });
      // Mock: Participants for notification
      mockQuery.mockResolvedValueOnce({ rows: [] });

      Message.create = jest.fn().mockResolvedValue({
        id: 200,
        toJSON: () => ({ id: 200, rideType: 'demand', rideId: 10, content: 'Hi' })
      });

      await sendMessage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(Message.create).toHaveBeenCalled();
    });

    it('should reject if ride not found', async () => {
      req.body = { rideType: 'offer', rideId: 999, content: 'msg' };

      // Mock: Offer not found
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await sendMessage(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeDefined();
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });

    it('should block driver from starting conversation with self', async () => {
      req.body = { rideType: 'offer', rideId: 1, content: 'msg' };

      // Mock: Offer exists, user IS the driver
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, driver_id: 1, from_city: 'A', to_city: 'B' }]
      });
      // Mock: No existing messages from other users
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await sendMessage(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeDefined();
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(next.mock.calls[0][0].message).toMatch(/cannot start a conversation/i);
    });

    it('should send real-time notification to participants', async () => {
      const mockIo = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
      req.app.get = jest.fn().mockReturnValue(mockIo);

      req.body = { rideType: 'offer', rideId: 1, content: 'Test' };

      // Mock: Offer exists, user is NOT the driver
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, driver_id: 2, from_city: 'A', to_city: 'B' }]
      });
      // Mock: Participants for notification
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 2, name: 'Driver' }]
      });

      Message.create = jest.fn().mockResolvedValue({
        id: 100,
        toJSON: () => ({ id: 100, rideType: 'offer', rideId: 1, content: 'Test' })
      });

      await sendMessage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockNotifyNewMessage).toHaveBeenCalled();
    });
  });

  describe('getConversation', () => {
    it('should return 410 for deprecated endpoint', async () => {
      await getConversation(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 410 }));
    });
  });

  describe('getInbox', () => {
    it('should return 410 for deprecated endpoint', async () => {
      await getInbox(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 410 }));
    });
  });

  describe('getSentMessages', () => {
    it('should return 410 for deprecated endpoint', async () => {
      await getSentMessages(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 410 }));
    });
  });

  describe('getConversationList', () => {
    it('should get user conversation list', async () => {
      const mockResult = {
        conversations: [
          { userId: 2, lastMessage: 'Hello', unreadCount: 3 },
          { userId: 3, lastMessage: 'Hi', unreadCount: 0 }
        ],
        pagination: { page: 1, limit: 50, total: 2 }
      };

      Message.getConversationList = jest.fn().mockResolvedValue(mockResult);

      await getConversationList(req, res, next);

      expect(Message.getConversationList).toHaveBeenCalledWith(1, 1, 50);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read', async () => {
      const mockMessage = {
        id: 1,
        rideType: 'offer',
        rideId: 100,
        recipientId: 1
      };

      const updatedMessageMock = {
        id: 1,
        isRead: true,
        toJSON: jest.fn().mockReturnValue({ id: 1, isRead: true })
      };

      req.params.id = '1';
      Message.findById = jest.fn().mockResolvedValue(mockMessage);
      Message.markAsRead = jest.fn().mockResolvedValue(updatedMessageMock);

      // Mock: Access allowed
      mockQuery.mockResolvedValueOnce({ rows: [{ exists: 1 }] });

      await markAsRead(req, res, next);

      expect(Message.findById).toHaveBeenCalledWith('1');
      expect(Message.markAsRead).toHaveBeenCalledWith('1', 1);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.any(String),
        messageData: expect.any(Object)
      });
    });

    it('should return 404 if message not found', async () => {
      req.params.id = '999';
      Message.findById = jest.fn().mockResolvedValue(null);

      await markAsRead(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Message not found',
          statusCode: 404
        })
      );
    });

    it('should reject if access denied', async () => {
      const mockMessage = {
        id: 1,
        rideType: 'offer',
        rideId: 100
      };

      req.params.id = '1';
      Message.findById = jest.fn().mockResolvedValue(mockMessage);

      // Mock: Access denied
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await markAsRead(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(403);
    });
  });

  describe('markConversationAsRead', () => {
    it('should mark conversation as read', async () => {
      const mockUpdatedMessages = [{ id: 1 }, { id: 2 }, { id: 3 }];

      req.params = { rideType: 'offer', rideId: '100' };

      // Mock: Access allowed
      mockQuery.mockResolvedValueOnce({ rows: [{ exists: 1 }] });
      Message.markRideMessagesAsRead = jest.fn().mockResolvedValue(mockUpdatedMessages);

      await markConversationAsRead(req, res, next);

      expect(mockQuery).toHaveBeenCalled();
      expect(Message.markRideMessagesAsRead).toHaveBeenCalledWith('offer', '100', 1);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.any(String),
        updatedCount: 3
      });
    });

    it('should return 403 if access denied', async () => {
      req.params = { rideType: 'offer', rideId: '100' };

      // Mock: Access denied
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await markConversationAsRead(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(403);
    });
  });

  describe('getUnreadCount', () => {
    it('should get unread message count', async () => {
      Message.getUnreadCount = jest.fn().mockResolvedValue(5);

      await getUnreadCount(req, res, next);

      expect(Message.getUnreadCount).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        unreadCount: 5
      });
    });

    it('should return 0 for no unread messages', async () => {
      Message.getUnreadCount = jest.fn().mockResolvedValue(0);

      await getUnreadCount(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        unreadCount: 0
      });
    });
  });
});
