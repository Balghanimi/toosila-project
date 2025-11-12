/**
 * Emergency Alerts Model
 * Handles SOS/Emergency alerts triggered by users
 */

const { query } = require('../config/db');

class EmergencyAlert {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.bookingId = data.booking_id;
    this.alertType = data.alert_type;
    this.severity = data.severity;
    this.status = data.status;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.locationAccuracy = data.location_accuracy;
    this.message = data.message;
    this.audioRecordingUrl = data.audio_recording_url;
    this.acknowledgedAt = data.acknowledged_at;
    this.acknowledgedBy = data.acknowledged_by;
    this.resolvedAt = data.resolved_at;
    this.resolvedBy = data.resolved_by;
    this.resolutionNotes = data.resolution_notes;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  /**
   * Create a new emergency alert
   */
  static async create(alertData) {
    const {
      userId,
      bookingId = null,
      alertType = 'sos',
      severity = 'high',
      latitude = null,
      longitude = null,
      locationAccuracy = null,
      message = null,
    } = alertData;

    const result = await query(
      `INSERT INTO emergency_alerts (
        user_id, booking_id, alert_type, severity,
        latitude, longitude, location_accuracy, message
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [userId, bookingId, alertType, severity, latitude, longitude, locationAccuracy, message]
    );

    return new EmergencyAlert(result.rows[0]);
  }

  /**
   * Find alert by ID
   */
  static async findById(id) {
    const result = await query('SELECT * FROM emergency_alerts WHERE id = $1', [id]);
    return result.rows.length > 0 ? new EmergencyAlert(result.rows[0]) : null;
  }

  /**
   * Find all alerts for a user
   */
  static async findByUserId(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT * FROM emergency_alerts
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) FROM emergency_alerts WHERE user_id = $1',
      [userId]
    );

    return {
      alerts: result.rows.map(row => new EmergencyAlert(row)),
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
    };
  }

  /**
   * Get all active alerts (for admin dashboard)
   */
  static async findActive(page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT ea.*, u.name as user_name, u.email as user_email, u.phone as user_phone
       FROM emergency_alerts ea
       JOIN users u ON ea.user_id = u.id
       WHERE ea.status IN ('active', 'acknowledged')
       ORDER BY ea.severity DESC, ea.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM emergency_alerts WHERE status IN ('active', 'acknowledged')`
    );

    return {
      alerts: result.rows.map(row => ({...new EmergencyAlert(row), userName: row.user_name, userEmail: row.user_email, userPhone: row.user_phone})),
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
    };
  }

  /**
   * Get all alerts (admin - with filters)
   */
  static async findAll(filters = {}, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.status) {
      conditions.push(`ea.status = $${paramIndex++}`);
      params.push(filters.status);
    }

    if (filters.severity) {
      conditions.push(`ea.severity = $${paramIndex++}`);
      params.push(filters.severity);
    }

    if (filters.alertType) {
      conditions.push(`ea.alert_type = $${paramIndex++}`);
      params.push(filters.alertType);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT ea.*, u.name as user_name, u.email as user_email
       FROM emergency_alerts ea
       JOIN users u ON ea.user_id = u.id
       ${whereClause}
       ORDER BY ea.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM emergency_alerts ea ${whereClause}`,
      params
    );

    return {
      alerts: result.rows.map(row => ({...new EmergencyAlert(row), userName: row.user_name, userEmail: row.user_email})),
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
    };
  }

  /**
   * Acknowledge alert (admin action)
   */
  static async acknowledge(alertId, adminId) {
    const result = await query(
      `UPDATE emergency_alerts
       SET status = 'acknowledged',
           acknowledged_at = CURRENT_TIMESTAMP,
           acknowledged_by = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND status = 'active'
       RETURNING *`,
      [adminId, alertId]
    );

    return result.rows.length > 0 ? new EmergencyAlert(result.rows[0]) : null;
  }

  /**
   * Resolve alert (admin action)
   */
  static async resolve(alertId, adminId, resolutionNotes = null) {
    const result = await query(
      `UPDATE emergency_alerts
       SET status = 'resolved',
           resolved_at = CURRENT_TIMESTAMP,
           resolved_by = $1,
           resolution_notes = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND status IN ('active', 'acknowledged')
       RETURNING *`,
      [adminId, resolutionNotes, alertId]
    );

    return result.rows.length > 0 ? new EmergencyAlert(result.rows[0]) : null;
  }

  /**
   * Mark as false alarm
   */
  static async markFalseAlarm(alertId, adminId, notes = null) {
    const result = await query(
      `UPDATE emergency_alerts
       SET status = 'false_alarm',
           resolved_at = CURRENT_TIMESTAMP,
           resolved_by = $1,
           resolution_notes = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [adminId, notes, alertId]
    );

    return result.rows.length > 0 ? new EmergencyAlert(result.rows[0]) : null;
  }

  /**
   * Get emergency statistics
   */
  static async getStats() {
    const result = await query(`
      SELECT
        COUNT(*) as total_alerts,
        COUNT(*) FILTER (WHERE status = 'active') as active_count,
        COUNT(*) FILTER (WHERE status = 'acknowledged') as acknowledged_count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
        COUNT(*) FILTER (WHERE status = 'false_alarm') as false_alarm_count,
        COUNT(*) FILTER (WHERE severity = 'critical') as critical_count,
        COUNT(*) FILTER (WHERE severity = 'high') as high_count,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count
      FROM emergency_alerts
    `);

    return result.rows[0];
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      bookingId: this.bookingId,
      alertType: this.alertType,
      severity: this.severity,
      status: this.status,
      latitude: this.latitude,
      longitude: this.longitude,
      locationAccuracy: this.locationAccuracy,
      message: this.message,
      audioRecordingUrl: this.audioRecordingUrl,
      acknowledgedAt: this.acknowledgedAt,
      acknowledgedBy: this.acknowledgedBy,
      resolvedAt: this.resolvedAt,
      resolvedBy: this.resolvedBy,
      resolutionNotes: this.resolutionNotes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = EmergencyAlert;
