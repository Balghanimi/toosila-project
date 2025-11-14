/**
 * Notification Helpers
 * دوال مساعدة لإنشاء الإشعارات للأحداث المختلفة
 */

const NotificationModel = require('../models/notifications.model');
const { query } = require('../config/db');

/**
 * إنشاء إشعار عند رد سائق على طلب راكب
 * @param {string} demandId - معرف الطلب
 * @param {string} driverId - معرف السائق
 * @param {string} driverName - اسم السائق
 * @returns {Promise<NotificationModel>}
 */
async function notifyDemandResponse(demandId, driverId, driverName) {
  try {
    // جلب معلومات الطلب والراكب
    const result = await query(
      `SELECT d.passenger_id, d.from_city, d.to_city, d.seats
       FROM demands d
       WHERE d.id = $1`,
      [demandId]
    );

    if (result.rows.length === 0) {
      console.error('Demand not found:', demandId);
      return null;
    }

    const demand = result.rows[0];
    const passengerId = demand.passenger_id;

    // التحقق من عدم وجود إشعار مشابه خلال آخر 5 دقائق
    const hasSimilar = await NotificationModel.hasSimilarRecent(
      passengerId,
      'demand_response',
      { demandId, driverId },
      5
    );

    if (hasSimilar) {
      console.log('Similar notification already exists, skipping...');
      return null;
    }

    // إنشاء الإشعار
    const notification = await NotificationModel.create(
      passengerId,
      'demand_response',
      '💬 رد جديد على طلبك',
      `رد السائق ${driverName} على طلبك من ${demand.from_city} إلى ${demand.to_city}. اضغط لعرض الرد`,
      {
        demandId,
        driverId,
        driverName,
        route: `${demand.from_city} - ${demand.to_city}`
      }
    );

    return notification;
  } catch (error) {
    console.error('Error creating demand response notification:', error);
    return null;
  }
}

/**
 * إنشاء إشعار عند قبول/رفض رد السائق
 * @param {string} responseId - معرف الرد
 * @param {boolean} isAccepted - هل تم القبول
 * @returns {Promise<NotificationModel>}
 */
async function notifyResponseStatus(responseId, isAccepted) {
  try {
    // جلب معلومات الرد والسائق والطلب
    const result = await query(
      `SELECT dr.driver_id, dr.offer_price, d.from_city, d.to_city, d.passenger_id,
              u.name as passenger_name
       FROM demand_responses dr
       JOIN demands d ON dr.demand_id = d.id
       JOIN users u ON d.passenger_id = u.id
       WHERE dr.id = $1`,
      [responseId]
    );

    if (result.rows.length === 0) {
      console.error('Response not found:', responseId);
      return null;
    }

    const response = result.rows[0];
    const driverId = response.driver_id;

    const title = isAccepted ? '✅ تم قبول عرضك!' : '❌ تم رفض عرضك';
    const message = isAccepted
      ? `قبل الراكب ${response.passenger_name} عرضك للرحلة من ${response.from_city} إلى ${response.to_city}`
      : `رفض الراكب ${response.passenger_name} عرضك للرحلة من ${response.from_city} إلى ${response.to_city}`;

    // إنشاء الإشعار
    const notification = await NotificationModel.create(
      driverId,
      isAccepted ? 'response_accepted' : 'response_rejected',
      title,
      message,
      {
        responseId,
        passengerId: response.passenger_id,
        passengerName: response.passenger_name,
        route: `${response.from_city} - ${response.to_city}`,
        price: response.offer_price
      }
    );

    return notification;
  } catch (error) {
    console.error('Error creating response status notification:', error);
    return null;
  }
}

/**
 * إنشاء إشعار عند حجز راكب لرحلة سائق
 * @param {string} offerId - معرف العرض
 * @param {string} passengerId - معرف الراكب
 * @param {string} passengerName - اسم الراكب
 * @returns {Promise<NotificationModel>}
 */
async function notifyNewBooking(offerId, passengerId, passengerName) {
  try {
    // جلب معلومات العرض والسائق
    const result = await query(
      `SELECT o.driver_id, o.from_city, o.to_city, o.price_per_seat, o.available_seats
       FROM offers o
       WHERE o.id = $1`,
      [offerId]
    );

    if (result.rows.length === 0) {
      console.error('Offer not found:', offerId);
      return null;
    }

    const offer = result.rows[0];
    const driverId = offer.driver_id;

    // إنشاء الإشعار
    const notification = await NotificationModel.create(
      driverId,
      'booking_created',
      '🎫 حجز جديد على رحلتك',
      `قام ${passengerName} بحجز مقعد في رحلتك من ${offer.from_city} إلى ${offer.to_city}`,
      {
        offerId,
        passengerId,
        passengerName,
        route: `${offer.from_city} - ${offer.to_city}`
      }
    );

    return notification;
  } catch (error) {
    console.error('Error creating new booking notification:', error);
    return null;
  }
}

/**
 * إنشاء إشعار عند قبول/رفض حجز الراكب
 * @param {string} bookingId - معرف الحجز
 * @param {boolean} isAccepted - هل تم القبول
 * @returns {Promise<NotificationModel>}
 */
async function notifyBookingStatus(bookingId, isAccepted) {
  try {
    // جلب معلومات الحجز
    const result = await query(
      `SELECT b.passenger_id, o.from_city, o.to_city, o.driver_id,
              u.name as driver_name, b.seats_booked
       FROM bookings b
       JOIN offers o ON b.offer_id = o.id
       JOIN users u ON o.driver_id = u.id
       WHERE b.id = $1`,
      [bookingId]
    );

    if (result.rows.length === 0) {
      console.error('Booking not found:', bookingId);
      return null;
    }

    const booking = result.rows[0];
    const passengerId = booking.passenger_id;

    const title = isAccepted ? '✅ تم قبول حجزك!' : '❌ تم رفض حجزك';
    const message = isAccepted
      ? `قبل السائق ${booking.driver_name} حجزك للرحلة من ${booking.from_city} إلى ${booking.to_city}`
      : `رفض السائق ${booking.driver_name} حجزك للرحلة من ${booking.from_city} إلى ${booking.to_city}`;

    // إنشاء الإشعار
    const notification = await NotificationModel.create(
      passengerId,
      isAccepted ? 'booking_accepted' : 'booking_rejected',
      title,
      message,
      {
        bookingId,
        driverId: booking.driver_id,
        driverName: booking.driver_name,
        route: `${booking.from_city} - ${booking.to_city}`,
        seatsBooked: booking.seats_booked
      }
    );

    return notification;
  } catch (error) {
    console.error('Error creating booking status notification:', error);
    return null;
  }
}

/**
 * إنشاء إشعار عند رسالة جديدة في المحادثة
 * @param {string} conversationId - معرف المحادثة
 * @param {string} senderId - معرف المرسل
 * @param {string} senderName - اسم المرسل
 * @param {string} messagePreview - معاينة الرسالة (أول 100 حرف)
 * @returns {Promise<NotificationModel>}
 */
async function notifyNewMessage(conversationId, senderId, senderName, messagePreview) {
  try {
    // جلب معلومات المحادثة لتحديد المستقبل
    const result = await query(
      `SELECT user1_id, user2_id
       FROM conversations
       WHERE id = $1`,
      [conversationId]
    );

    if (result.rows.length === 0) {
      console.error('Conversation not found:', conversationId);
      return null;
    }

    const conversation = result.rows[0];
    // المستقبل هو الطرف الآخر في المحادثة
    const recipientId = conversation.user1_id === senderId
      ? conversation.user2_id
      : conversation.user1_id;

    // التحقق من عدم وجود إشعار مشابه خلال آخر دقيقة
    const hasSimilar = await NotificationModel.hasSimilarRecent(
      recipientId,
      'new_message',
      { conversationId, senderId },
      1
    );

    if (hasSimilar) {
      console.log('Similar message notification already exists, skipping...');
      return null;
    }

    // قص معاينة الرسالة إلى 100 حرف
    const preview = messagePreview.length > 100
      ? messagePreview.substring(0, 100) + '...'
      : messagePreview;

    // إنشاء الإشعار
    const notification = await NotificationModel.create(
      recipientId,
      'new_message',
      `💬 رسالة جديدة من ${senderName}`,
      preview,
      {
        conversationId,
        senderId,
        senderName
      }
    );

    return notification;
  } catch (error) {
    console.error('Error creating new message notification:', error);
    return null;
  }
}

/**
 * إنشاء إشعار تذكير بالرحلة القادمة
 * @param {string} userId - معرف المستخدم
 * @param {string} tripType - نوع الرحلة (offer أو booking)
 * @param {string} tripId - معرف الرحلة
 * @param {string} fromCity - مدينة المغادرة
 * @param {string} toCity - مدينة الوصول
 * @param {Date} departureTime - وقت المغادرة
 * @returns {Promise<NotificationModel>}
 */
async function notifyTripReminder(userId, tripType, tripId, fromCity, toCity, departureTime) {
  try {
    const isDriver = tripType === 'offer';
    const role = isDriver ? 'سائق' : 'راكب';

    const notification = await NotificationModel.create(
      userId,
      'trip_reminder',
      `⏰ تذكير: رحلتك قريباً!`,
      `لديك رحلة ${isDriver ? 'كسائق' : 'كراكب'} من ${fromCity} إلى ${toCity} في ${new Date(departureTime).toLocaleString('ar-EG')}`,
      {
        tripType,
        tripId,
        fromCity,
        toCity,
        departureTime
      }
    );

    return notification;
  } catch (error) {
    console.error('Error creating trip reminder notification:', error);
    return null;
  }
}

module.exports = {
  notifyDemandResponse,
  notifyResponseStatus,
  notifyNewBooking,
  notifyBookingStatus,
  notifyNewMessage,
  notifyTripReminder
};
