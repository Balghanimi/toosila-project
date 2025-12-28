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
const User = require('../../models/users.model');

// Mock dependencies
jest.mock('../../models/messages.model');
jest.mock('../../models/users.model');
jest.mock('../../socket', () => ({
  notifyNewMessage: jest.fn()
}));
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

describe('Messages Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    // Fix for setImmediate usage in controller (run synchronously for tests)
    global.setImmediate = (cb) => cb();

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

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const mockRecipient = {
        id: 2,
        name: 'Recipient User'
      };

      const mockMessage = {
        id: 1,
        senderId: 1,
        recipientId: 2,
        content: 'Test message',
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          senderId: 1,
          recipientId: 2,
          content: 'Test message'
        })
      };

      const { query } = require('../../config/db');

      const mockOffer = {
        id: 1,
        driver_id: 2, // Recipient is driver
        from_city: 'A',
        to_city: 'B'
      };

      req.body = {
        rideType: 'offer',
        rideId: 1,
        content: 'Test message'
      };

      // Mock DB for ride check
      query.mockResolvedValueOnce({ rows: [mockOffer] }); // For ride check
      query.mockResolvedValueOnce({ rows: [] }); // For participants check (if any)

      User.findById = jest.fn().mockResolvedValue(mockRecipient);
      Message.create = jest.fn().mockResolvedValue(mockMessage);

      await sendMessage(req, res, next);

      expect(query).toHaveBeenCalled();
      expect(Message.create).toHaveBeenCalledWith({
        rideType: 'offer',
        rideId: 1,
        senderId: 1,
        content: 'Test message'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.any(String),
        messageData: expect.any(Object)
      });
    });

    it('should allow driver to message on demand without response', async () => {
      // Logic for demands was relaxed
      const { query } = require('../../config/db');

      req.body = { rideType: 'demand', rideId: 10, content: 'Hi' };

      // Mock DB: demand exists
      query.mockResolvedValueOnce({ rows: [{ id: 10, passenger_id: 99 }] }); // Demand check (passenger 99 != user 1)
      query.mockResolvedValueOnce({ rows: [] }); // Participants check

      Message.create = jest.fn().mockResolvedValue({ id: 200, toJSON: () => ({ id: 200 }) });

      await sendMessage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(Message.create).toHaveBeenCalled();
    });

    it('should reject if ride not found', async () => {
      req.body = { rideType: 'offer', rideId: 999, content: 'msg' };
      const { query } = require('../../config/db');
      query.mockResolvedValue({ rows: [] }); // Ride not found

      await sendMessage(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringMatching(/Ride not found|access/i),
        statusCode: 404
      }));
    });

    it('should block driver from starting conversation with self', async () => {
      req.body = { rideType: 'offer', rideId: 1, content: 'msg' };
      const { query } = require('../../config/db');

      // Ride exists, user is driver
      query.mockResolvedValueOnce({ rows: [{ id: 1, driver_id: req.user.id }] });
      // No existing messages from others
      query.mockResolvedValueOnce({ rows: [] });

      await sendMessage(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringMatching(/cannot start a conversation/i),
        statusCode: 400
      }));
    });

    it('should send real-time notification to participants', async () => {
      const mockIo = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
      const { query } = require('../../config/db');

      req.body = { rideType: 'offer', rideId: 1, content: 'Test' };
      req.app.get = jest.fn().mockReturnValue(mockIo);

      // Mocks
      query.mockResolvedValueOnce({ rows: [{ id: 1, driver_id: 2 }] }); // Ride check
      query.mockResolvedValueOnce({ rows: [{ id: 2, name: 'Driver' }] }); // Participants query
      Message.create = jest.fn().mockResolvedValue({ id: 100, toJSON: () => ({ id: 100 }) });
      const { notifyNewMessage } = require('../../socket');

      await sendMessage(req, res, next);

      expect(notifyNewMessage).toHaveBeenCalled();
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
        pagination: { page: 1, limit: 20, total: 2 }
      };

      Message.getConversationList = jest.fn().mockResolvedValue(mockResult);

      await getConversationList(req, res, next); // Pass next

      expect(Message.getConversationList).toHaveBeenCalledWith(1, 1, 20);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read', async () => {
      const { query } = require('../../config/db');

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
      query.mockResolvedValue({ rows: [{ exists: 1 }] }); // Access allowed

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
      const { query } = require('../../config/db');

      const mockMessage = {
        id: 1,
        rideType: 'offer',
        rideId: 100
      };

      req.params.id = '1';
      Message.findById = jest.fn().mockResolvedValue(mockMessage);
      query.mockResolvedValue({ rows: [] }); // Access denied

      await markAsRead(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Access denied',
          statusCode: 403
        })
      );
    });
  });

  describe('markConversationAsRead', () => {
    it('should mark conversation as read', async () => {
      const { query } = require('../../config/db');

      const mockUpdatedMessages = [{ id: 1 }, { id: 2 }, { id: 3 }];

      req.params = { rideType: 'offer', rideId: '100' };

      query.mockResolvedValue({ rows: [{ exists: 1 }] }); // Access allowed
      Message.markRideMessagesAsRead = jest.fn().mockResolvedValue(mockUpdatedMessages);

      await markConversationAsRead(req, res, next);

      expect(query).toHaveBeenCalled(); // Access checked
      expect(Message.markRideMessagesAsRead).toHaveBeenCalledWith('offer', '100', 1);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.any(String),
        updatedCount: 3
      });
    });

    it('should return 403/404 if access denied', async () => {
      const { query } = require('../../config/db');
      req.params = { rideType: 'offer', rideId: '100' };

      query.mockResolvedValue({ rows: [] }); // Access denied

      await markConversationAsRead(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringMatching(/Access denied|not found/i),
        statusCode: 403
      }));
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
