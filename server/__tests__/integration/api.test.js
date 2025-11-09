/**
 * Integration Tests for API Endpoints
 * Tests the full request/response cycle for critical endpoints
 */

const request = require('supertest');
const app = require('../../server'); // Will need to be configured
const { cleanDatabase, closeDatabase } = require('../helpers/testDb');
const { createTestUser, createTestDriver, createTestOffer } = require('../helpers/factories');
const { generateTestToken } = require('../helpers/auth');

// Note: These tests would need a test database setup
// They are structured but commented out to avoid actual DB connections during unit testing

describe.skip('API Integration Tests', () => {
  beforeAll(async () => {
    // Setup test database connection
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user', async () => {
        const userData = {
          name: 'Test User',
          email: 'newuser@test.com',
          password: 'Password123!',
          languagePreference: 'ar'
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user).toHaveProperty('id');
        expect(response.body.data.user.email).toBe(userData.email);
        expect(response.body.data.requiresVerification).toBe(true);
      });

      it('should reject duplicate email', async () => {
        const user = await createTestUser({ email: 'existing@test.com' });

        const response = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Another User',
            email: 'existing@test.com',
            password: 'Password123!'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('USER_EXISTS');
      });

      it('should validate email format', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Test User',
            email: 'invalid-email',
            password: 'Password123!'
          })
          .expect(400);

        expect(response.body.error).toBeDefined();
      });
    });

    describe('POST /api/auth/login', () => {
      it('should login with valid credentials', async () => {
        const password = 'Password123!';
        const user = await createTestUser({
          email: 'login@test.com',
          password
        });

        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'login@test.com',
            password
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('token');
        expect(response.body.data.user.email).toBe('login@test.com');
      });

      it('should reject invalid credentials', async () => {
        await createTestUser({ email: 'user@test.com' });

        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'user@test.com',
            password: 'WrongPassword'
          })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
      });
    });
  });

  describe('Offers Endpoints', () => {
    describe('GET /api/offers', () => {
      it('should get all offers', async () => {
        const driver = await createTestDriver();
        await createTestOffer(driver.id);
        await createTestOffer(driver.id, { fromCity: 'الموصل', toCity: 'السليمانية' });

        const response = await request(app)
          .get('/api/offers')
          .expect(200);

        expect(response.body.offers).toHaveLength(2);
        expect(response.body.pagination).toBeDefined();
      });

      it('should filter offers by city', async () => {
        const driver = await createTestDriver();
        await createTestOffer(driver.id, { fromCity: 'بغداد', toCity: 'البصرة' });
        await createTestOffer(driver.id, { fromCity: 'أربيل', toCity: 'الموصل' });

        const response = await request(app)
          .get('/api/offers?fromCity=بغداد')
          .expect(200);

        expect(response.body.offers).toHaveLength(1);
        expect(response.body.offers[0].fromCity).toBe('بغداد');
      });
    });

    describe('POST /api/offers', () => {
      it('should create offer when authenticated as driver', async () => {
        const driver = await createTestDriver();
        const token = generateTestToken(driver);

        const offerData = {
          fromCity: 'بغداد',
          toCity: 'البصرة',
          departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          seats: 3,
          price: 50000
        };

        const response = await request(app)
          .post('/api/offers')
          .set('Authorization', `Bearer ${token}`)
          .send(offerData)
          .expect(201);

        expect(response.body.offer).toHaveProperty('id');
        expect(response.body.offer.fromCity).toBe('بغداد');
      });

      it('should reject unauthenticated requests', async () => {
        const response = await request(app)
          .post('/api/offers')
          .send({
            fromCity: 'بغداد',
            toCity: 'البصرة',
            seats: 3
          })
          .expect(401);

        expect(response.body.error).toBeDefined();
      });
    });
  });

  describe('Bookings Endpoints', () => {
    describe('POST /api/bookings', () => {
      it('should create a booking', async () => {
        const driver = await createTestDriver();
        const passenger = await createTestUser({ email: 'passenger@test.com' });
        const offer = await createTestOffer(driver.id);
        const token = generateTestToken(passenger);

        const response = await request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${token}`)
          .send({
            offerId: offer.id,
            seats: 2,
            message: 'Please confirm'
          })
          .expect(201);

        expect(response.body.booking).toHaveProperty('id');
        expect(response.body.booking.seats).toBe(2);
      });

      it('should prevent booking own offer', async () => {
        const driver = await createTestDriver();
        const offer = await createTestOffer(driver.id);
        const token = generateTestToken(driver);

        const response = await request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${token}`)
          .send({
            offerId: offer.id,
            seats: 1
          })
          .expect(400);

        expect(response.body.message).toContain('cannot book your own');
      });
    });

    describe('PUT /api/bookings/:id/status', () => {
      it('should update booking status', async () => {
        const driver = await createTestDriver();
        const passenger = await createTestUser({ email: 'passenger@test.com' });
        const offer = await createTestOffer(driver.id);
        const booking = await createTestBooking(passenger.id, offer.id);
        const token = generateTestToken(driver);

        const response = await request(app)
          .put(`/api/bookings/${booking.id}/status`)
          .set('Authorization', `Bearer ${token}`)
          .send({ status: 'confirmed' })
          .expect(200);

        expect(response.body.booking.status).toBe('confirmed');
      });
    });
  });

  describe('Messages Endpoints', () => {
    describe('POST /api/messages', () => {
      it('should send a message', async () => {
        const sender = await createTestUser({ email: 'sender@test.com' });
        const recipient = await createTestUser({ email: 'recipient@test.com' });
        const token = generateTestToken(sender);

        const response = await request(app)
          .post('/api/messages')
          .set('Authorization', `Bearer ${token}`)
          .send({
            recipientId: recipient.id,
            content: 'Hello, is the offer still available?'
          })
          .expect(201);

        expect(response.body.messageData).toHaveProperty('id');
        expect(response.body.messageData.content).toContain('Hello');
      });
    });

    describe('GET /api/messages/conversation/:userId', () => {
      it('should get conversation with another user', async () => {
        const user1 = await createTestUser({ email: 'user1@test.com' });
        const user2 = await createTestUser({ email: 'user2@test.com' });
        await createTestMessage(user1.id, user2.id, { content: 'Hi' });
        await createTestMessage(user2.id, user1.id, { content: 'Hello' });
        const token = generateTestToken(user1);

        const response = await request(app)
          .get(`/api/messages/conversation/${user2.id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body.messages).toHaveLength(2);
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.error).toBeDefined();
    });

    it('should handle invalid JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });

    it('should handle rate limiting', async () => {
      // Make multiple rapid requests
      const requests = Array(100).fill().map(() =>
        request(app).get('/api/offers')
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);

      expect(rateLimited).toBe(true);
    });
  });
});

module.exports = {};
