const { query } = require('../config/db');

class VerificationDocument {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.documentType = data.document_type;
    this.documentNumber = data.document_number;
    this.frontImageUrl = data.front_image_url;
    this.backImageUrl = data.back_image_url;
    this.fullName = data.full_name;
    this.dateOfBirth = data.date_of_birth;
    this.issueDate = data.issue_date;
    this.expiryDate = data.expiry_date;
    this.issuingCountry = data.issuing_country;
    this.status = data.status;
    this.rejectionReason = data.rejection_reason;
    this.submittedAt = data.submitted_at;
    this.reviewedAt = data.reviewed_at;
    this.reviewedBy = data.reviewed_by;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  /**
   * Create a new verification document
   */
  static async create(documentData) {
    const {
      userId,
      documentType,
      documentNumber,
      frontImageUrl,
      backImageUrl,
      fullName,
      dateOfBirth,
      issueDate,
      expiryDate,
      issuingCountry = 'Iraq'
    } = documentData;

    const result = await query(
      `INSERT INTO verification_documents (
        user_id, document_type, document_number,
        front_image_url, back_image_url, full_name,
        date_of_birth, issue_date, expiry_date, issuing_country
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        userId, documentType, documentNumber,
        frontImageUrl, backImageUrl, fullName,
        dateOfBirth, issueDate, expiryDate, issuingCountry
      ]
    );

    // Update user verification status to 'pending'
    await query(
      `UPDATE users
       SET verification_status = 'pending', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [userId]
    );

    // Log the submission
    await query(
      `INSERT INTO verification_audit_log (user_id, document_id, action, performed_by)
       VALUES ($1, $2, 'submitted', $1)`,
      [userId, result.rows[0].id]
    );

    return new VerificationDocument(result.rows[0]);
  }

  /**
   * Find verification document by ID
   */
  static async findById(id) {
    const result = await query(
      'SELECT * FROM verification_documents WHERE id = $1',
      [id]
    );
    return result.rows.length > 0 ? new VerificationDocument(result.rows[0]) : null;
  }

  /**
   * Find all verification documents for a user
   */
  static async findByUserId(userId) {
    const result = await query(
      `SELECT * FROM verification_documents
       WHERE user_id = $1
       ORDER BY submitted_at DESC`,
      [userId]
    );
    return result.rows.map(row => new VerificationDocument(row));
  }

  /**
   * Find latest verification document for a user
   */
  static async findLatestByUserId(userId) {
    const result = await query(
      `SELECT * FROM verification_documents
       WHERE user_id = $1
       ORDER BY submitted_at DESC
       LIMIT 1`,
      [userId]
    );
    return result.rows.length > 0 ? new VerificationDocument(result.rows[0]) : null;
  }

  /**
   * Get all pending verification documents (for admin review)
   */
  static async findPending(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT vd.*, u.name as user_name, u.email as user_email
       FROM verification_documents vd
       JOIN users u ON vd.user_id = u.id
       WHERE vd.status = 'pending'
       ORDER BY vd.submitted_at ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM verification_documents WHERE status = 'pending'`
    );

    return {
      documents: result.rows.map(row => new VerificationDocument(row)),
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    };
  }

  /**
   * Approve verification document
   */
  static async approve(documentId, reviewerId, notes = null) {
    // Get the document first
    const doc = await VerificationDocument.findById(documentId);
    if (!doc) {
      throw new Error('Document not found');
    }

    // Update document status
    const result = await query(
      `UPDATE verification_documents
       SET status = 'approved',
           reviewed_at = CURRENT_TIMESTAMP,
           reviewed_by = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [reviewerId, documentId]
    );

    // Update user verification status
    await query(
      `UPDATE users
       SET is_verified = true,
           verification_status = 'verified',
           verification_date = CURRENT_TIMESTAMP,
           verified_by = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [reviewerId, doc.userId]
    );

    // Log the approval
    await query(
      `INSERT INTO verification_audit_log (
        user_id, document_id, action, performed_by, notes
      )
      VALUES ($1, $2, 'approved', $3, $4)`,
      [doc.userId, documentId, reviewerId, notes]
    );

    return new VerificationDocument(result.rows[0]);
  }

  /**
   * Reject verification document
   */
  static async reject(documentId, reviewerId, rejectionReason) {
    // Get the document first
    const doc = await VerificationDocument.findById(documentId);
    if (!doc) {
      throw new Error('Document not found');
    }

    // Update document status
    const result = await query(
      `UPDATE verification_documents
       SET status = 'rejected',
           rejection_reason = $1,
           reviewed_at = CURRENT_TIMESTAMP,
           reviewed_by = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [rejectionReason, reviewerId, documentId]
    );

    // Update user verification status
    await query(
      `UPDATE users
       SET verification_status = 'rejected',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [doc.userId]
    );

    // Log the rejection
    await query(
      `INSERT INTO verification_audit_log (
        user_id, document_id, action, performed_by, notes
      )
      VALUES ($1, $2, 'rejected', $3, $4)`,
      [doc.userId, documentId, reviewerId, rejectionReason]
    );

    return new VerificationDocument(result.rows[0]);
  }

  /**
   * Get verification statistics
   */
  static async getStats() {
    const result = await query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
        COUNT(*) FILTER (WHERE document_type = 'iraqi_id') as iraqi_id_count,
        COUNT(*) FILTER (WHERE document_type = 'passport') as passport_count,
        COUNT(DISTINCT user_id) FILTER (WHERE status = 'approved') as verified_users_count
      FROM verification_documents
    `);

    return result.rows[0];
  }

  /**
   * Get audit log for a document
   */
  static async getAuditLog(documentId) {
    const result = await query(
      `SELECT val.*, u.name as performed_by_name, u.email as performed_by_email
       FROM verification_audit_log val
       LEFT JOIN users u ON val.performed_by = u.id
       WHERE val.document_id = $1
       ORDER BY val.created_at DESC`,
      [documentId]
    );

    return result.rows;
  }

  /**
   * Get audit log for a user
   */
  static async getUserAuditLog(userId) {
    const result = await query(
      `SELECT val.*, u.name as performed_by_name, u.email as performed_by_email
       FROM verification_audit_log val
       LEFT JOIN users u ON val.performed_by = u.id
       WHERE val.user_id = $1
       ORDER BY val.created_at DESC`,
      [userId]
    );

    return result.rows;
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      documentType: this.documentType,
      documentNumber: this.documentNumber,
      frontImageUrl: this.frontImageUrl,
      backImageUrl: this.backImageUrl,
      fullName: this.fullName,
      dateOfBirth: this.dateOfBirth,
      issueDate: this.issueDate,
      expiryDate: this.expiryDate,
      issuingCountry: this.issuingCountry,
      status: this.status,
      rejectionReason: this.rejectionReason,
      submittedAt: this.submittedAt,
      reviewedAt: this.reviewedAt,
      reviewedBy: this.reviewedBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = VerificationDocument;
