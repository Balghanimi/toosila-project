/**
 * Booking Service
 * Handles business logic for booking operations
 */

const Booking = require('../models/bookings.model');
const Offer = require('../models/offers.model');
const { query } = require('../config/db');
const { NotFoundError, ValidationError, ForbiddenError } = require('../utils/errors');
const { BOOKING_STATUS } = require('../constants');

class BookingService {
  /**
   * Create a new booking
   * @param {number} userId - User ID (passenger)
   * @param {Object} bookingData - Booking data
   * @param {number} bookingData.offerId - Offer ID
   * @param {number} bookingData.seats - Number of seats
   * @param {string} bookingData.message - Optional message
   * @returns {Promise<Object>} Created booking
   */
  async createBooking(userId, bookingData) {
    const { offerId, seats = 1, message } = bookingData;

    // Validate offer exists and is active
    const offer = await Offer.findById(offerId);
    if (!offer) {
      throw new NotFoundError('Offer');
    }

    if (!offer.isActive) {
      throw new ValidationError('Offer is not available');
    }

    // Check if user is not booking their own offer
    if (offer.driverId === userId) {
      throw new ValidationError('You cannot book your own offer');
    }

    // Check seat availability
    const availableSeats = await this.getAvailableSeats(offerId);
    if (seats > availableSeats) {
      throw new ValidationError(`Only ${availableSeats} seat(s) available`);
    }

    // Create booking
    const booking = await Booking.create({
      passengerId: userId,
      offerId,
      seats,
      message,
    });

    return {
      booking: booking.toJSON(),
      offer: {
        fromCity: offer.fromCity,
        toCity: offer.toCity,
        driverId: offer.driverId,
      },
    };
  }

  /**
   * Update booking status
   * @param {number} bookingId - Booking ID
   * @param {number} userId - User ID (must be offer owner or admin)
   * @param {string} userRole - User role
   * @param {string} status - New status
   * @param {number} totalPrice - Optional total price
   * @returns {Promise<Object>} Updated booking
   */
  async updateBookingStatus(bookingId, userId, userRole, status, totalPrice) {
    // Get booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking');
    }

    // Check if user is the offer owner or admin
    const offer = await Offer.findById(booking.offerId);
    if (!offer || (offer.driverId !== userId && userRole !== 'admin')) {
      throw new ForbiddenError('You can only update bookings for your offers');
    }

    // Validate status
    const validStatuses = Object.values(BOOKING_STATUS);
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Invalid status');
    }

    // Handle seat adjustments
    if (status === BOOKING_STATUS.ACCEPTED && booking.status === BOOKING_STATUS.PENDING) {
      await this.confirmBookingSeats(booking, offer, bookingId);
    }

    if (status === BOOKING_STATUS.CANCELLED && booking.status === BOOKING_STATUS.ACCEPTED) {
      await this.restoreBookingSeats(booking, offer);
    }

    // Update booking
    const updatedBooking = await booking.updateStatus(status, totalPrice);

    return {
      booking: updatedBooking.toJSON(),
      offer: {
        fromCity: offer.fromCity,
        toCity: offer.toCity,
        passengerId: booking.passengerId,
      },
    };
  }

  /**
   * Cancel a booking (by passenger)
   * @param {number} bookingId - Booking ID
   * @param {number} userId - User ID (passenger)
   * @param {string} userRole - User role
   * @returns {Promise<Object>} Cancelled booking
   */
  async cancelBooking(bookingId, userId, userRole) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking');
    }

    // Check if user owns the booking
    if (booking.passengerId !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You can only cancel your own bookings');
    }

    // Check if booking can be cancelled
    if (booking.status === BOOKING_STATUS.CANCELLED) {
      throw new ValidationError('Booking is already cancelled');
    }

    if (booking.status === BOOKING_STATUS.COMPLETED) {
      throw new ValidationError('Cannot cancel completed booking');
    }

    const updatedBooking = await booking.updateStatus(BOOKING_STATUS.CANCELLED);
    return updatedBooking.toJSON();
  }

  /**
   * Get available seats for an offer
   * @param {number} offerId - Offer ID
   * @returns {Promise<number>} Number of available seats
   * @private
   */
  async getAvailableSeats(offerId) {
    const offer = await Offer.findById(offerId);
    if (!offer) {
      throw new NotFoundError('Offer');
    }

    const result = await query(
      `SELECT COALESCE(SUM(seats), 0) as total_booked
       FROM bookings
       WHERE offer_id = $1
       AND status IN ($2, $3)`,
      [offerId, BOOKING_STATUS.PENDING, BOOKING_STATUS.ACCEPTED]
    );

    const totalBooked = parseInt(result.rows[0].total_booked) || 0;
    return offer.seats - totalBooked;
  }

  /**
   * Confirm booking and reduce available seats
   * @param {Object} booking - Booking object
   * @param {Object} offer - Offer object
   * @param {number} bookingId - Booking ID
   * @returns {Promise<void>}
   * @private
   */
  async confirmBookingSeats(booking, offer, bookingId) {
    // Check if enough seats are still available
    const result = await query(
      `SELECT COALESCE(SUM(seats), 0) as total_booked
       FROM bookings
       WHERE offer_id = $1
       AND status = $2
       AND id != $3`,
      [booking.offerId, BOOKING_STATUS.ACCEPTED, bookingId]
    );

    const totalBooked = parseInt(result.rows[0].total_booked) || 0;
    const availableSeats = offer.seats - totalBooked;

    if (booking.seats > availableSeats) {
      throw new ValidationError(`Only ${availableSeats} seat(s) available`);
    }

    // Reduce seats in offer
    await offer.updateSeats(offer.seats - booking.seats);
  }

  /**
   * Restore seats when cancelling a confirmed booking
   * @param {Object} booking - Booking object
   * @param {Object} offer - Offer object
   * @returns {Promise<void>}
   * @private
   */
  async restoreBookingSeats(booking, offer) {
    await offer.updateSeats(offer.seats + booking.seats);
  }

  /**
   * Get booking statistics
   * @returns {Promise<Object>} Booking statistics
   */
  async getBookingStats() {
    const result = await query(
      `
      SELECT
        COUNT(*)::int as total,
        COUNT(CASE WHEN status = $1 THEN 1 END)::int as pending,
        COUNT(CASE WHEN status = $2 THEN 1 END)::int as confirmed,
        COUNT(CASE WHEN status = $3 THEN 1 END)::int as cancelled,
        COUNT(CASE WHEN status = $4 THEN 1 END)::int as completed
      FROM bookings
    `,
      [
        BOOKING_STATUS.PENDING,
        BOOKING_STATUS.ACCEPTED,
        BOOKING_STATUS.CANCELLED,
        BOOKING_STATUS.COMPLETED,
      ]
    );

    return result.rows[0];
  }

  /**
   * Get user booking statistics
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User booking statistics
   */
  async getUserBookingStats(userId) {
    const result = await query(
      `SELECT
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = $2 THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = $3 THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = $4 THEN 1 END) as cancelled_bookings,
        COUNT(CASE WHEN status = $5 THEN 1 END) as completed_bookings,
        AVG(total_price) as average_booking_value
      FROM bookings
      WHERE passenger_id = $1`,
      [
        userId,
        BOOKING_STATUS.PENDING,
        BOOKING_STATUS.ACCEPTED,
        BOOKING_STATUS.CANCELLED,
        BOOKING_STATUS.COMPLETED,
      ]
    );

    return result.rows[0];
  }

  /**
   * Get pending bookings count for user (as both passenger and driver)
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Pending counts
   */
  async getPendingCount(userId) {
    // Count bookings received on user's offers (as driver)
    const receivedResult = await query(
      `SELECT COUNT(*) as count
      FROM bookings b
      INNER JOIN offers o ON b.offer_id = o.id
      WHERE o.driver_id = $1 AND b.status = $2`,
      [userId, BOOKING_STATUS.PENDING]
    );

    // Count bookings made by user (as passenger)
    const sentResult = await query(
      `SELECT COUNT(*) as count
      FROM bookings
      WHERE passenger_id = $1 AND status = $2`,
      [userId, BOOKING_STATUS.PENDING]
    );

    const receivedPending = parseInt(receivedResult.rows[0].count);
    const sentPending = parseInt(sentResult.rows[0].count);

    return {
      receivedPending,
      sentPending,
      totalPending: receivedPending + sentPending,
    };
  }

  /**
   * Verify user has access to a booking
   * @param {Object} booking - Booking object
   * @param {number} userId - User ID
   * @param {string} userRole - User role
   * @returns {Promise<boolean>} True if has access
   */
  async verifyBookingAccess(booking, userId, userRole) {
    if (booking.passengerId === userId || userRole === 'admin') {
      return true;
    }

    // Check if user is the offer owner
    const offer = await Offer.findById(booking.offerId);
    if (offer && offer.driverId === userId) {
      return true;
    }

    throw new ForbiddenError('Access denied');
  }
}

module.exports = new BookingService();
