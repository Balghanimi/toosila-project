/**
 * Test Data Factories
 * Provides factory functions to create test data with sensible defaults
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { query } = require('../../config/db');

/**
 * Generate a unique email for testing
 */
const generateTestEmail = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `test-${timestamp}-${random}@test.com`;
};

/**
 * Create a test user
 */
const createTestUser = async (overrides = {}) => {
  const defaultData = {
    name: 'Test User',
    email: generateTestEmail(),
    password: 'Password123!',
    isDriver: false,
    role: 'user',
    languagePreference: 'ar',
    emailVerified: true
  };

  const userData = { ...defaultData, ...overrides };

  // Hash password
  const passwordHash = await bcrypt.hash(userData.password, 10);

  const result = await query(
    `INSERT INTO users (
      name, email, password_hash, is_driver, role,
      language_preference, email_verified, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
    RETURNING *`,
    [
      userData.name,
      userData.email,
      passwordHash,
      userData.isDriver,
      userData.role,
      userData.languagePreference,
      userData.emailVerified
    ]
  );

  return result.rows[0];
};

/**
 * Create a test driver
 */
const createTestDriver = async (overrides = {}) => {
  return createTestUser({
    name: 'Test Driver',
    isDriver: true,
    ...overrides
  });
};

/**
 * Create a test admin
 */
const createTestAdmin = async (overrides = {}) => {
  return createTestUser({
    name: 'Test Admin',
    role: 'admin',
    ...overrides
  });
};

/**
 * Create a test offer
 */
const createTestOffer = async (driverId, overrides = {}) => {
  const defaultData = {
    fromCity: 'بغداد',
    toCity: 'البصرة',
    departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    seats: 3,
    price: 50000,
    description: 'Test offer description',
    isActive: true,
    category: 'transportation'
  };

  const offerData = { ...defaultData, ...overrides };

  const result = await query(
    `INSERT INTO offers (
      driver_id, from_city, to_city, departure_time, seats,
      price, description, is_active, category, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING *`,
    [
      driverId,
      offerData.fromCity,
      offerData.toCity,
      offerData.departureTime,
      offerData.seats,
      offerData.price,
      offerData.description,
      offerData.isActive,
      offerData.category
    ]
  );

  return result.rows[0];
};

/**
 * Create a test booking
 */
const createTestBooking = async (passengerId, offerId, overrides = {}) => {
  const defaultData = {
    seats: 1,
    message: 'Test booking message',
    status: 'pending',
    totalPrice: null
  };

  const bookingData = { ...defaultData, ...overrides };

  const result = await query(
    `INSERT INTO bookings (
      passenger_id, offer_id, seats, message, status, total_price, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    RETURNING *`,
    [
      passengerId,
      offerId,
      bookingData.seats,
      bookingData.message,
      bookingData.status,
      bookingData.totalPrice
    ]
  );

  return result.rows[0];
};

/**
 * Create a test demand
 */
const createTestDemand = async (userId, overrides = {}) => {
  const defaultData = {
    fromCity: 'بغداد',
    toCity: 'أربيل',
    departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    seats: 2,
    maxPrice: 60000,
    description: 'Test demand description',
    isActive: true,
    category: 'transportation'
  };

  const demandData = { ...defaultData, ...overrides };

  const result = await query(
    `INSERT INTO demands (
      user_id, from_city, to_city, departure_time, seats,
      max_price, description, is_active, category, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING *`,
    [
      userId,
      demandData.fromCity,
      demandData.toCity,
      demandData.departureTime,
      demandData.seats,
      demandData.maxPrice,
      demandData.description,
      demandData.isActive,
      demandData.category
    ]
  );

  return result.rows[0];
};

/**
 * Create a test message
 */
const createTestMessage = async (senderId, receiverId, overrides = {}) => {
  const defaultData = {
    content: 'Test message content',
    isRead: false,
    relatedOfferId: null,
    relatedBookingId: null
  };

  const messageData = { ...defaultData, ...overrides };

  const result = await query(
    `INSERT INTO messages (
      sender_id, receiver_id, content, is_read,
      related_offer_id, related_booking_id, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING *`,
    [
      senderId,
      receiverId,
      messageData.content,
      messageData.isRead,
      messageData.relatedOfferId,
      messageData.relatedBookingId
    ]
  );

  return result.rows[0];
};

/**
 * Create a test rating
 */
const createTestRating = async (raterId, ratedId, bookingId, overrides = {}) => {
  const defaultData = {
    rating: 5,
    comment: 'Excellent service!',
    raterType: 'passenger'
  };

  const ratingData = { ...defaultData, ...overrides };

  const result = await query(
    `INSERT INTO ratings (
      rater_id, rated_id, booking_id, rating, comment, rater_type, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING *`,
    [
      raterId,
      ratedId,
      bookingId,
      ratingData.rating,
      ratingData.comment,
      ratingData.raterType
    ]
  );

  return result.rows[0];
};

/**
 * Create a test notification
 */
const createTestNotification = async (userId, overrides = {}) => {
  const defaultData = {
    type: 'booking_request',
    title: 'New Booking Request',
    message: 'You have a new booking request',
    isRead: false,
    relatedBookingId: null,
    relatedOfferId: null
  };

  const notificationData = { ...defaultData, ...overrides };

  const result = await query(
    `INSERT INTO notifications (
      user_id, type, title, message, is_read,
      related_booking_id, related_offer_id, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    RETURNING *`,
    [
      userId,
      notificationData.type,
      notificationData.title,
      notificationData.message,
      notificationData.isRead,
      notificationData.relatedBookingId,
      notificationData.relatedOfferId
    ]
  );

  return result.rows[0];
};

/**
 * Create a complete test scenario with user, offer, and booking
 */
const createCompleteBookingScenario = async () => {
  const driver = await createTestDriver({ name: 'Driver User' });
  const passenger = await createTestUser({ name: 'Passenger User' });
  const offer = await createTestOffer(driver.id);
  const booking = await createTestBooking(passenger.id, offer.id);

  return { driver, passenger, offer, booking };
};

module.exports = {
  generateTestEmail,
  createTestUser,
  createTestDriver,
  createTestAdmin,
  createTestOffer,
  createTestBooking,
  createTestDemand,
  createTestMessage,
  createTestRating,
  createTestNotification,
  createCompleteBookingScenario
};
