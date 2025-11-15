/**
 * Critical Test: Overbooking Prevention in Accept Endpoint
 * Tests the P0 bug fix for seat validation
 */

const request = require('supertest');
const app = require('../../app');
const pool = require('../../config/db');

describe('POST /api/bookings/:id/accept - Overbooking Prevention', () => {
  let driverToken;
  let passenger1Token;
  let passenger2Token;
  let driverId;
  let passenger1Id;
  let passenger2Id;
  let offerId;
  let booking1Id;
  let booking2Id;

  beforeAll(async () => {
    // Clean up test data
    await pool.query(`DELETE FROM bookings WHERE 1=1`);
    await pool.query(`DELETE FROM offers WHERE 1=1`);
    await pool.query(`DELETE FROM users WHERE email LIKE '%overbooking-test%'`);

    // Create test driver
    const driverRes = await request(app).post('/api/auth/register').send({
      name: 'Test Driver Overbooking',
      email: 'driver-overbooking-test@test.com',
      password: 'Password123!',
      isDriver: true,
    });
    driverToken = driverRes.body.token;
    driverId = driverRes.body.user.id;

    // Create test passenger 1
    const passenger1Res = await request(app).post('/api/auth/register').send({
      name: 'Test Passenger 1',
      email: 'passenger1-overbooking-test@test.com',
      password: 'Password123!',
      isDriver: false,
    });
    passenger1Token = passenger1Res.body.token;
    passenger1Id = passenger1Res.body.user.id;

    // Create test passenger 2
    const passenger2Res = await request(app).post('/api/auth/register').send({
      name: 'Test Passenger 2',
      email: 'passenger2-overbooking-test@test.com',
      password: 'Password123!',
      isDriver: false,
    });
    passenger2Token = passenger2Res.body.token;
    passenger2Id = passenger2Res.body.user.id;
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query(`DELETE FROM bookings WHERE 1=1`);
    await pool.query(`DELETE FROM offers WHERE 1=1`);
    await pool.query(`DELETE FROM users WHERE email LIKE '%overbooking-test%'`);
    await pool.end();
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

    // Step 2: Passenger 1 books 2 seats
    const booking1Res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${passenger1Token}`)
      .send({
        offerId: offerId,
        seats: 2,
        message: 'Passenger 1 booking',
      });

    expect(booking1Res.status).toBe(201);
    booking1Id = booking1Res.body.booking.id;

    // Step 3: Passenger 2 books 3 seats
    const booking2Res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${passenger2Token}`)
      .send({
        offerId: offerId,
        seats: 3,
        message: 'Passenger 2 booking',
      });

    expect(booking2Res.status).toBe(201);
    booking2Id = booking2Res.body.booking.id;

    // Verify both bookings are pending
    const bookingsCheck = await pool.query(
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

    expect(accept1Res.status).toBe(200);
    expect(accept1Res.body.success).toBe(true);
    expect(accept1Res.body.message).toContain('تم قبول الحجز بنجاح');

    // Verify booking 1 is confirmed
    const booking1Check = await pool.query(
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
    const booking2Check = await pool.query(
      'SELECT status FROM bookings WHERE id = $1',
      [booking2Id]
    );
    expect(booking2Check.rows[0].status).toBe('pending');

    // Verify total confirmed bookings = 2 seats (not 5!)
    const totalSeats = await pool.query(
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

    // Passenger 1 books 2 seats
    const booking1Res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${passenger1Token}`)
      .send({
        offerId: newOfferId,
        seats: 2,
      });

    const newBooking1Id = booking1Res.body.booking.id;

    // Accept booking 1 (2 seats)
    await request(app)
      .post(`/api/bookings/${newBooking1Id}/accept`)
      .set('Authorization', `Bearer ${driverToken}`);

    // Passenger 2 books 1 seat (exactly what's available)
    const booking2Res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${passenger2Token}`)
      .send({
        offerId: newOfferId,
        seats: 1,
      });

    const newBooking2Id = booking2Res.body.booking.id;

    // Accept booking 2 (1 seat) - Should SUCCEED
    const accept2Res = await request(app)
      .post(`/api/bookings/${newBooking2Id}/accept`)
      .set('Authorization', `Bearer ${driverToken}`);

    expect(accept2Res.status).toBe(200);
    expect(accept2Res.body.success).toBe(true);

    // Verify offer is now full
    const totalSeats = await pool.query(
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

    // Create 3 bookings of 2 seats each
    const bookingIds = [];
    for (let i = 0; i < 3; i++) {
      const bookingRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${passenger1Token}`)
        .send({
          offerId: concurrentOfferId,
          seats: 2,
        });
      bookingIds.push(bookingRes.body.booking.id);
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
    const totalSeats = await pool.query(
      `SELECT COALESCE(SUM(seats), 0) as total_booked
       FROM bookings
       WHERE offer_id = $1 AND status = 'confirmed'`,
      [concurrentOfferId]
    );
    expect(parseInt(totalSeats.rows[0].total_booked)).toBe(4);
  });
});
