const { query } = require('../config/db');

/**
 * نموذج الردود على الطلبات (Demand Responses Model)
 * يتعامل مع جدول demand_responses في قاعدة البيانات
 */
class DemandResponse {
  constructor(data) {
    this.id = data.id;
    this.demandId = data.demand_id;
    this.driverId = data.driver_id;
    this.offerPrice = data.offer_price;
    this.availableSeats = data.available_seats;
    this.message = data.message;
    this.status = data.status;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;

    // بيانات إضافية إذا كانت موجودة (من JOIN queries)
    if (data.driver_name) this.driverName = data.driver_name;
    if (data.driver_rating) this.driverRating = data.driver_rating;
    if (data.driver_rating_count) this.driverRatingCount = data.driver_rating_count;
    if (data.from_city) this.fromCity = data.from_city;
    if (data.to_city) this.toCity = data.to_city;
  }

  /**
   * إنشاء رد جديد على طلب
   * @param {Object} responseData - بيانات الرد
   * @returns {Promise<DemandResponse>}
   */
  static async create(responseData) {
    const { demandId, driverId, offerPrice, availableSeats, message } = responseData;

    const result = await query(
      `INSERT INTO demand_responses
       (demand_id, driver_id, offer_price, available_seats, message, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [demandId, driverId, offerPrice, availableSeats, message || null]
    );

    return new DemandResponse(result.rows[0]);
  }

  /**
   * البحث عن رد بواسطة المعرف
   * @param {string} id - معرف الرد
   * @returns {Promise<DemandResponse|null>}
   */
  static async findById(id) {
    const result = await query(
      `SELECT dr.*,
              u.name as driver_name,
              u.rating_avg as driver_rating,
              u.rating_count as driver_rating_count
       FROM demand_responses dr
       JOIN users u ON dr.driver_id = u.id
       WHERE dr.id = $1`,
      [id]
    );

    return result.rows.length > 0 ? new DemandResponse(result.rows[0]) : null;
  }

  /**
   * جلب جميع الردود على طلب معين
   * @param {string} demandId - معرف الطلب
   * @returns {Promise<DemandResponse[]>}
   */
  static async findByDemandId(demandId) {
    const result = await query(
      `SELECT dr.*,
              u.name as driver_name,
              u.rating_avg as driver_rating,
              u.rating_count as driver_rating_count
       FROM demand_responses dr
       JOIN users u ON dr.driver_id = u.id
       WHERE dr.demand_id = $1
       ORDER BY
         CASE dr.status
           WHEN 'accepted' THEN 1
           WHEN 'pending' THEN 2
           WHEN 'rejected' THEN 3
           WHEN 'cancelled' THEN 4
         END,
         dr.created_at DESC`,
      [demandId]
    );

    return result.rows.map(row => new DemandResponse(row));
  }

  /**
   * جلب جميع ردود سائق معين
   * @param {string} driverId - معرف السائق
   * @returns {Promise<DemandResponse[]>}
   */
  static async findByDriverId(driverId) {
    const result = await query(
      `SELECT dr.*,
              d.from_city,
              d.to_city,
              d.earliest_time,
              d.latest_time,
              d.seats as requested_seats,
              d.budget_max,
              u.name as passenger_name
       FROM demand_responses dr
       JOIN demands d ON dr.demand_id = d.id
       JOIN users u ON d.passenger_id = u.id
       WHERE dr.driver_id = $1
       ORDER BY dr.created_at DESC`,
      [driverId]
    );

    return result.rows.map(row => new DemandResponse(row));
  }

  /**
   * التحقق من وجود رد من سائق على طلب معين
   * @param {string} demandId - معرف الطلب
   * @param {string} driverId - معرف السائق
   * @returns {Promise<boolean>}
   */
  static async existsByDemandAndDriver(demandId, driverId) {
    const result = await query(
      `SELECT id FROM demand_responses
       WHERE demand_id = $1 AND driver_id = $2`,
      [demandId, driverId]
    );

    return result.rows.length > 0;
  }

  /**
   * تحديث حالة الرد
   * @param {string} id - معرف الرد
   * @param {string} status - الحالة الجديدة
   * @returns {Promise<DemandResponse|null>}
   */
  static async updateStatus(id, status) {
    const result = await query(
      `UPDATE demand_responses
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    return result.rows.length > 0 ? new DemandResponse(result.rows[0]) : null;
  }

  /**
   * رفض جميع الردود الأخرى على طلب معين (عند قبول رد واحد)
   * @param {string} demandId - معرف الطلب
   * @param {string} acceptedResponseId - معرف الرد المقبول
   * @returns {Promise<number>} - عدد الردود المرفوضة
   */
  static async rejectOtherResponses(demandId, acceptedResponseId) {
    const result = await query(
      `UPDATE demand_responses
       SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
       WHERE demand_id = $1
         AND id != $2
         AND status = 'pending'`,
      [demandId, acceptedResponseId]
    );

    return result.rowCount;
  }

  /**
   * حذف رد
   * @param {string} id - معرف الرد
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    const result = await query(
      `DELETE FROM demand_responses WHERE id = $1`,
      [id]
    );

    return result.rowCount > 0;
  }

  /**
   * عد الردود حسب الحالة لطلب معين
   * @param {string} demandId - معرف الطلب
   * @returns {Promise<Object>} - عدد الردود لكل حالة
   */
  static async countByStatus(demandId) {
    const result = await query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
         COUNT(*) FILTER (WHERE status = 'accepted') as accepted_count,
         COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
         COUNT(*) as total_count
       FROM demand_responses
       WHERE demand_id = $1`,
      [demandId]
    );

    return result.rows[0];
  }

  /**
   * تحويل الكائن إلى JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      demandId: this.demandId,
      driverId: this.driverId,
      offerPrice: parseFloat(this.offerPrice),
      availableSeats: this.availableSeats,
      message: this.message,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      // بيانات إضافية
      ...(this.driverName && { driverName: this.driverName }),
      ...(this.driverRating && { driverRating: parseFloat(this.driverRating) }),
      ...(this.driverRatingCount && { driverRatingCount: this.driverRatingCount }),
      ...(this.fromCity && { fromCity: this.fromCity }),
      ...(this.toCity && { toCity: this.toCity })
    };
  }
}

module.exports = DemandResponse;
