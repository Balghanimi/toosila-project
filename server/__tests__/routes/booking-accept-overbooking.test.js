/**
 * Critical Test: Overbooking Prevention in Accept Endpoint
 * Tests the P0 bug fix for seat validation
 */

const request = require('supertest');
const app = require('../../app');
const { pool, query } = require('../../config/db');

// Mock socket to prevent errors
jest.mock('../../socket', () => ({
  notifyNewBooking: jest.fn(),
  notifyBookingStatusUpdate: jest.fn(),
}));

// Mock email service to prevent SMTP/API calls during tests
jest.mock('../../utils/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  sendBookingConfirmationEmail: jest.fn().mockResolvedValue(true),
  sendBookingRequestEmail: jest.fn().mockResolvedValue(true),
  sendBookingStatusEmail: jest.fn().mockResolvedValue(true)
}));

describe('POST /api/bookings/:id/accept - Overbooking Prevention', () => {
  let driverToken;
  let passenger1Token;
  let passenger2Token;
  let driverId;
  let passenger1Id;
  let passenger2Id;
  let passenger3Id;
  let passenger3Token;
  let offerId;
  let booking1Id;
  let booking2Id;

  beforeAll(async () => {
    // Clean up test data
    await query(`DELETE FROM bookings WHERE 1=1`);
    await query(`DELETE FROM offers WHERE 1=1`);
    await query(`DELETE FROM users WHERE email LIKE '%overbooking-test%'`);

    // Create test driver
    const driverRegData = {
      name: 'Test Driver Overbooking',
      email: 'driver-overbooking-test@test.com',
      password: 'Password123!',
      isDriver: true,
    };
    const driverRes = await request(app).post('/api/auth/register').send(driverRegData);
    driverId = driverRes.body.data.user.id;

    // Login driver
    const driverLoginRes = await request(app).post('/api/auth/login').send({
      email: driverRegData.email,
      password: driverRegData.password
    });
    driverToken = driverLoginRes.body.data.token;

    // Create test passenger 1
    const p1RegData = {
      name: 'Test Passenger 1',
      email: 'passenger1-overbooking-test@test.com',
      password: 'Password123!',
      isDriver: false,
    };
    const passenger1Res = await request(app).post('/api/auth/register').send(p1RegData);
    passenger1Id = passenger1Res.body.data.user.id;

    // Login passenger 1
    const p1LoginRes = await request(app).post('/api/auth/login').send({
      email: p1RegData.email,
      password: p1RegData.password
    });
    passenger1Token = p1LoginRes.body.data.token;

    // Create test passenger 2
    const p2RegData = {
      name: 'Test Passenger 2',
      email: 'passenger2-overbooking-test@test.com',
      password: 'Password123!',
      isDriver: false,
    };
    const passenger2Res = await request(app).post('/api/auth/register').send(p2RegData);
    passenger2Id = passenger2Res.body.data.user.id;

    // Login passenger 2
    const p2LoginRes = await request(app).post('/api/auth/login').send({
      email: p2RegData.email,
      password: p2RegData.password
    });
    passenger2Token = p2LoginRes.body.data.token;

    // Create test passenger 3
    const p3RegData = {
      name: 'Test Passenger 3',
      email: 'passenger3-overbooking-test@test.com',
      password: 'Password123!',
      isDriver: false,
    };
    const passenger3Res = await request(app).post('/api/auth/register').send(p3RegData);
    passenger3Id = passenger3Res.body.data.user.id;

    // Login passenger 3
    const p3LoginRes = await request(app).post('/api/auth/login').send({
      email: p3RegData.email,
      password: p3RegData.password
    });
    passenger3Token = p3LoginRes.body.data.token;
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await query(`DELETE FROM bookings WHERE 1=1`);
      await query(`DELETE FROM offers WHERE 1=1`);
      await query(`DELETE FROM users WHERE email LIKE '%overbooking-test%'`);

      // Close pool connection if it exists and has end method
      if (pool && typeof pool.end === 'function') {
        await pool.end();
      }
    } catch (error) {
      console.error('Cleanup error:', error.message);
    }
  });

  test('Should prevent overbooking when accepting multiple bookings', async () => {
    // Step 1: Driver creates offer with 4 seats
    const offerRes = await request(app)
      .post('/api/offers')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        fromCity: 'بغداد',
        toCity: 'البصرة',
        departureTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        seats: 4,
        price: 25000,
      });

    expect(offerRes.status).toBe(201);
    offerId = offerRes.body.offer.id;

    // Step 2: Passenger 1 books 2 seats (Direct Insert)
    const b1Result = await query(
      `INSERT INTO bookings (offer_id, passenger_id, seats, status) VALUES ($1, $2, $3, 'pending') RETURNING id`,
      [offerId, passenger1Id, 2]
    );
    booking1Id = b1Result.rows[0].id;

    // Step 3: Passenger 2 books 3 seats (Direct Insert)
    const b2Result = await query(
      `INSERT INTO bookings (offer_id, passenger_id, seats, status) VALUES ($1, $2, $3, 'pending') RETURNING id`,
      [offerId, passenger2Id, 3]
    );
    booking2Id = b2Result.rows[0].id;

    // Verify both bookings are pending
    const bookingsCheck = await query(
      'SELECT id, seats, status FROM bookings WHERE id IN ($1, $2)',
      [booking1Id, booking2Id]
    );
    expect(bookingsCheck.rows).toHaveLength(2);
    expect(bookingsCheck.rows[0].status).toBe('pending');
    expect(bookingsCheck.rows[1].status).toBe('pending');

    // Step 4: Driver accepts Passenger 1 (2 seats) - Should SUCCEED
    const accept1Res = await request(app)
      .post(`/api/bookings/${booking1Id}/accept`)
      .set('Authorization', `Bearer ${driverToken}`);

    if (accept1Res.status !== 200) {
      console.error('Accept 1 Failed:', JSON.stringify(accept1Res.body, null, 2));
    }
    expect(accept1Res.status).toBe(200);
    expect(accept1Res.body.success).toBe(true);
    expect(accept1Res.body.message).toContain('تم قبول الحجز بنجاح');

    // Verify booking 1 is confirmed
    const booking1Check = await query(
      'SELECT status FROM bookings WHERE id = $1',
      [booking1Id]
    );
    expect(booking1Check.rows[0].status).toBe('confirmed');

    // Step 5: Driver accepts Passenger 2 (3 seats) - Should FAIL (only 2 seats left)
    const accept2Res = await request(app)
      .post(`/api/bookings/${booking2Id}/accept`)
      .set('Authorization', `Bearer ${driverToken}`);

    // ✅ CRITICAL: Should return 400 with seat availability error
    expect(accept2Res.status).toBe(400);
    expect(accept2Res.body.success).toBe(false);
    expect(accept2Res.body.message).toContain('المقاعد المتاحة');
    expect(accept2Res.body.message).toContain('2'); // Only 2 seats available

    // Verify booking 2 is still pending (not confirmed)
    const booking2Check = await query(
      'SELECT status FROM bookings WHERE id = $1',
      [booking2Id]
    );
    expect(booking2Check.rows[0].status).toBe('pending');

    // Verify total confirmed bookings = 2 seats (not 5!)
    const totalSeats = await query(
      `SELECT COALESCE(SUM(seats), 0) as total_booked
       FROM bookings
       WHERE offer_id = $1 AND status = 'confirmed'`,
      [offerId]
    );
    expect(parseInt(totalSeats.rows[0].total_booked)).toBe(2);
  });

  test('Should allow accepting booking if exactly enough seats available', async () => {
    // Create new offer with 3 seats
    const offerRes = await request(app)
      .post('/api/offers')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        fromCity: 'بغداد',
        toCity: 'النجف',
        departureTime: new Date(Date.now() + 86400000).toISOString(),
        seats: 3,
        price: 20000,
      });

    const newOfferId = offerRes.body.offer.id;

    // Direct insert for Passenger 1 (2 seats)
    const b1Result = await query(
      `INSERT INTO bookings (offer_id, passenger_id, seats, status) VALUES ($1, $2, $3, 'pending') RETURNING id`,
      [newOfferId, passenger1Id, 2]
    );
    const newBooking1Id = b1Result.rows[0].id;

    // Direct insert for Passenger 2 (1 seat)
    const b2Result = await query(
      `INSERT INTO bookings (offer_id, passenger_id, seats, status) VALUES ($1, $2, $3, 'pending') RETURNING id`,
      [newOfferId, passenger2Id, 1]
    );
    const newBooking2Id = b2Result.rows[0].id;

    // Accept booking 1 (2 seats)
    await request(app)
      .post(`/api/bookings/${newBooking1Id}/accept`)
      .set('Authorization', `Bearer ${driverToken}`);

    // Accept booking 2 (1 seat) - Should SUCCEED
    const accept2Res = await request(app)
      .post(`/api/bookings/${newBooking2Id}/accept`)
      .set('Authorization', `Bearer ${driverToken}`);

    if (accept2Res.status !== 200) console.error('Accept 2 Failed:', accept2Res.body);
    expect(accept2Res.status).toBe(200);
    expect(accept2Res.body.success).toBe(true);

    // Verify offer is now full
    const totalSeats = await query(
      `SELECT COALESCE(SUM(seats), 0) as total_booked
       FROM bookings
       WHERE offer_id = $1 AND status = 'confirmed'`,
      [newOfferId]
    );
    expect(parseInt(totalSeats.rows[0].total_booked)).toBe(3);
  });

  test('Should handle concurrent accept requests safely with transactions', async () => {
    // Create offer with 4 seats
    const offerRes = await request(app)
      .post('/api/offers')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        fromCity: 'النجف',
        toCity: 'كربلاء',
        departureTime: new Date(Date.now() + 86400000).toISOString(),
        seats: 4,
        price: 15000,
      });

    const concurrentOfferId = offerRes.body.offer.id;

    // Create 3 bookings of 2 seats each via Direct Insert
    const bookingIds = [];
    const passengers = [passenger1Id, passenger2Id, passenger3Id];

    for (let i = 0; i < 3; i++) {
      const res = await query(
        `INSERT INTO bookings (offer_id, passenger_id, seats, status) VALUES ($1, $2, $3, 'pending') RETURNING id`,
        [concurrentOfferId, passengers[i], 2]
      );
      bookingIds.push(res.rows[0].id);
    }

    // Try to accept all 3 bookings simultaneously (should only accept 2)
    const acceptPromises = bookingIds.map((bookingId) =>
      request(app)
        .post(`/api/bookings/${bookingId}/accept`)
        .set('Authorization', `Bearer ${driverToken}`)
    );

    const results = await Promise.all(acceptPromises);

    // Count successful and failed accepts
    const successes = results.filter((r) => r.status === 200);
    const failures = results.filter((r) => r.status === 400);

    // Should have 2 successes (4 seats / 2 seats per booking) and 1 failure
    expect(successes).toHaveLength(2);
    expect(failures).toHaveLength(1);

    // Verify total confirmed bookings = 4 seats
    const totalSeats = await query(
      `SELECT COALESCE(SUM(seats), 0) as total_booked
       FROM bookings
       WHERE offer_id = $1 AND status = 'confirmed'`,
      [concurrentOfferId]
    );
    expect(parseInt(totalSeats.rows[0].total_booked)).toBe(4);
  });
});
