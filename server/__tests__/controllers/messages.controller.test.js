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

describe('Messages Controller', () => {
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

      req.body = {
        recipientId: 2,
        content: 'Test message'
      };

      User.findById = jest.fn().mockResolvedValue(mockRecipient);
      Message.create = jest.fn().mockResolvedValue(mockMessage);

      await sendMessage(req, res);

      expect(User.findById).toHaveBeenCalledWith(2);
      expect(Message.create).toHaveBeenCalledWith({
        senderId: 1,
        recipientId: 2,
        content: 'Test message'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.any(String),
        messageData: expect.any(Object)
      });
    });

    it('should reject message if recipient not found', async () => {
      req.body = {
        recipientId: 999,
        content: 'Test message'
      };

      User.findById = jest.fn().mockResolvedValue(null);

      await sendMessage(req, res);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Recipient not found',
          statusCode: 404
        })
      );
    });

    it('should reject sending message to self', async () => {
      req.body = {
        recipientId: 1, // Same as req.user.id
        content: 'Test message'
      };

      const mockUser = { id: 1, name: 'Test User' };
      User.findById = jest.fn().mockResolvedValue(mockUser);

      await sendMessage(req, res);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'You cannot send a message to yourself',
          statusCode: 400
        })
      );
    });

    it('should send real-time notification to recipient', async () => {
      const mockIo = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn()
      };

      const mockRecipient = { id: 2 };
      const mockMessage = {
        toJSON: jest.fn().mockReturnValue({ id: 1 })
      };

      req.body = { recipientId: 2, content: 'Test' };
      req.app.get = jest.fn().mockReturnValue(mockIo);

      User.findById = jest.fn().mockResolvedValue(mockRecipient);
      Message.create = jest.fn().mockResolvedValue(mockMessage);

      const { notifyNewMessage } = require('../../socket');

      await sendMessage(req, res);

      expect(notifyNewMessage).toHaveBeenCalled();
    });
  });

  describe('getConversation', () => {
    it('should get conversation between two users', async () => {
      const mockOtherUser = {
        id: 2,
        firstName: 'Other',
        lastName: 'User'
      };

      const mockResult = {
        messages: [
          { id: 1, content: 'Hello' },
          { id: 2, content: 'Hi there' }
        ],
        pagination: { page: 1, limit: 50, total: 2 }
      };

      req.params.userId = '2';
      req.query = { page: '1', limit: '50' };

      User.findById = jest.fn().mockResolvedValue(mockOtherUser);
      Message.getConversation = jest.fn().mockResolvedValue(mockResult);

      await getConversation(req, res);

      expect(User.findById).toHaveBeenCalledWith('2');
      expect(Message.getConversation).toHaveBeenCalledWith(1, 2, 1, 50);
      expect(res.json).toHaveBeenCalledWith({
        ...mockResult,
        otherUser: {
          id: 2,
          firstName: 'Other',
          lastName: 'User'
        }
      });
    });

    it('should return 404 if other user not found', async () => {
      req.params.userId = '999';

      User.findById = jest.fn().mockResolvedValue(null);

      await getConversation(req, res);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found',
          statusCode: 404
        })
      );
    });

    it('should use default pagination values', async () => {
      const mockUser = { id: 2, firstName: 'User', lastName: 'Name' };
      const mockResult = { messages: [] };

      req.params.userId = '2';

      User.findById = jest.fn().mockResolvedValue(mockUser);
      Message.getConversation = jest.fn().mockResolvedValue(mockResult);

      await getConversation(req, res);

      expect(Message.getConversation).toHaveBeenCalledWith(1, 2, 1, 50);
    });
  });

  describe('getInbox', () => {
    it('should get user inbox messages', async () => {
      const mockResult = {
        messages: [
          { id: 1, content: 'Message 1' },
          { id: 2, content: 'Message 2' }
        ],
        pagination: { page: 1, limit: 20, total: 2 }
      };

      Message.findByUserId = jest.fn().mockResolvedValue(mockResult);

      await getInbox(req, res);

      expect(Message.findByUserId).toHaveBeenCalledWith(1, 1, 20);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should support custom pagination', async () => {
      req.query = { page: '3', limit: '30' };

      Message.findByUserId = jest.fn().mockResolvedValue({ messages: [] });

      await getInbox(req, res);

      expect(Message.findByUserId).toHaveBeenCalledWith(1, 3, 30);
    });
  });

  describe('getSentMessages', () => {
    it('should get user sent messages', async () => {
      const mockResult = {
        messages: [
          { id: 1, content: 'Sent message 1' },
          { id: 2, content: 'Sent message 2' }
        ],
        pagination: { page: 1, limit: 20, total: 2 }
      };

      Message.findSentByUserId = jest.fn().mockResolvedValue(mockResult);

      await getSentMessages(req, res);

      expect(Message.findSentByUserId).toHaveBeenCalledWith(1, 1, 20);
      expect(res.json).toHaveBeenCalledWith(mockResult);
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

      await getConversationList(req, res);

      expect(Message.getConversationList).toHaveBeenCalledWith(1, 1, 20);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read', async () => {
      const mockMessage = {
        id: 1,
        recipientId: 1,
        markAsRead: jest.fn().mockResolvedValue({
          id: 1,
          isRead: true,
          toJSON: jest.fn().mockReturnValue({ id: 1, isRead: true })
        })
      };

      req.params.id = '1';
      Message.findById = jest.fn().mockResolvedValue(mockMessage);

      await markAsRead(req, res);

      expect(Message.findById).toHaveBeenCalledWith('1');
      expect(mockMessage.markAsRead).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: expect.any(String),
        messageData: expect.any(Object)
      });
    });

    it('should return 404 if message not found', async () => {
      req.params.id = '999';
      Message.findById = jest.fn().mockResolvedValue(null);

      await markAsRead(req, res);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Message not found',
          statusCode: 404
        })
      );
    });

    it('should reject if user is not recipient', async () => {
      const mockMessage = {
        id: 1,
        recipientId: 2 // Different from req.user.id
      };

      req.params.id = '1';
      Message.findById = jest.fn().mockResolvedValue(mockMessage);

      await markAsRead(req, res);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'You can only mark your own messages as read',
          statusCode: 403
        })
      );
    });
  });

  describe('markConversationAsRead', () => {
    it('should mark conversation as read', async () => {
      const mockOtherUser = { id: 2, name: 'Other User' };
      const mockUpdatedMessages = [{ id: 1 }, { id: 2 }, { id: 3 }];

      req.params.userId = '2';

      User.findById = jest.fn().mockResolvedValue(mockOtherUser);
      Message.markConversationAsRead = jest.fn().mockResolvedValue(mockUpdatedMessages);

      await markConversationAsRead(req, res);

      expect(User.findById).toHaveBeenCalledWith('2');
      expect(Message.markConversationAsRead).toHaveBeenCalledWith(1, 2);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.any(String),
        updatedCount: 3
      });
    });

    it('should return 404 if other user not found', async () => {
      req.params.userId = '999';

      User.findById = jest.fn().mockResolvedValue(null);

      await markConversationAsRead(req, res);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found',
          statusCode: 404
        })
      );
    });
  });

  describe('getUnreadCount', () => {
    it('should get unread message count', async () => {
      Message.getUnreadCount = jest.fn().mockResolvedValue(5);

      await getUnreadCount(req, res);

      expect(Message.getUnreadCount).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        unreadCount: 5
      });
    });

    it('should return 0 for no unread messages', async () => {
      Message.getUnreadCount = jest.fn().mockResolvedValue(0);

      await getUnreadCount(req, res);

      expect(res.json).toHaveBeenCalledWith({
        unreadCount: 0
      });
    });
  });
});
