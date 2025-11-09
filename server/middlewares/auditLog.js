const { query } = require('../config/db');
const logger = require('../config/logger');

/**
 * Audit Log Middleware
 * Comprehensive security event logging for compliance and forensics
 */

// Audit event severity levels
const SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical'
};

// Audit event categories
const CATEGORY = {
  AUTH: 'authentication',
  AUTHZ: 'authorization',
  DATA: 'data_modification',
  ADMIN: 'admin_action',
  SECURITY: 'security_event'
};

/**
 * Create audit log entry in database
 */
const createAuditLog = async (logData) => {
  try {
    const {
      userId,
      action,
      category,
      resource,
      resourceId,
      ipAddress,
      userAgent,
      success,
      metadata,
      severity
    } = logData;

    await query(
      `INSERT INTO audit_logs (
        user_id, action, category, resource, resource_id,
        ip_address, user_agent, success, metadata, severity,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
      [
        userId || null,
        action,
        category,
        resource || null,
        resourceId || null,
        ipAddress || null,
        userAgent || null,
        success,
        metadata ? JSON.stringify(metadata) : null,
        severity
      ]
    );

    // Also log to Winston for immediate visibility
    const logLevel = severity === SEVERITY.CRITICAL ? 'error' : severity === SEVERITY.WARNING ? 'warn' : 'info';
    logger[logLevel]('Audit log created', {
      userId,
      action,
      category,
      resource,
      success,
      severity
    });
  } catch (error) {
    // Never fail the request due to audit logging issues
    logger.error('Failed to create audit log', {
      error: error.message,
      logData
    });
  }
};

/**
 * Middleware to log authentication attempts
 */
const auditAuthAttempt = (success) => {
  return async (req, res, next) => {
    const { email } = req.body;

    await createAuditLog({
      userId: success ? req.user?.id : null,
      action: success ? 'login_success' : 'login_failure',
      category: CATEGORY.AUTH,
      resource: 'user',
      resourceId: success ? req.user?.id : null,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success,
      metadata: { email },
      severity: success ? SEVERITY.INFO : SEVERITY.WARNING
    });

    next();
  };
};

/**
 * Middleware to log user registration
 */
const auditRegistration = async (req, res, next) => {
  const { email, name, isDriver } = req.body;

  await createAuditLog({
    userId: null, // Not yet created
    action: 'user_registration',
    category: CATEGORY.AUTH,
    resource: 'user',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    success: true,
    metadata: { email, name, isDriver },
    severity: SEVERITY.INFO
  });

  next();
};

/**
 * Middleware to log password changes
 */
const auditPasswordChange = async (req, res, next) => {
  await createAuditLog({
    userId: req.user.id,
    action: 'password_change',
    category: CATEGORY.AUTH,
    resource: 'user',
    resourceId: req.user.id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    success: true,
    metadata: { email: req.user.email },
    severity: SEVERITY.WARNING
  });

  next();
};

/**
 * Middleware to log password reset requests
 */
const auditPasswordResetRequest = async (req, res, next) => {
  const { email } = req.body;

  await createAuditLog({
    userId: null,
    action: 'password_reset_request',
    category: CATEGORY.AUTH,
    resource: 'user',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    success: true,
    metadata: { email },
    severity: SEVERITY.WARNING
  });

  next();
};

/**
 * Middleware to log email changes
 */
const auditEmailChange = async (req, res, next) => {
  const { newEmail } = req.body;

  await createAuditLog({
    userId: req.user.id,
    action: 'email_change',
    category: CATEGORY.AUTH,
    resource: 'user',
    resourceId: req.user.id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    success: true,
    metadata: { oldEmail: req.user.email, newEmail },
    severity: SEVERITY.WARNING
  });

  next();
};

/**
 * Middleware to log account deletion
 */
const auditAccountDeletion = async (req, res, next) => {
  await createAuditLog({
    userId: req.user.id,
    action: 'account_deletion',
    category: CATEGORY.AUTH,
    resource: 'user',
    resourceId: req.user.id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    success: true,
    metadata: { email: req.user.email },
    severity: SEVERITY.CRITICAL
  });

  next();
};

/**
 * Middleware to log authorization failures
 */
const auditAuthorizationFailure = (resource, action) => {
  return async (req, res, next) => {
    await createAuditLog({
      userId: req.user?.id,
      action: `unauthorized_${action}`,
      category: CATEGORY.AUTHZ,
      resource,
      resourceId: req.params.id || null,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: false,
      metadata: {
        attemptedAction: action,
        path: req.path
      },
      severity: SEVERITY.WARNING
    });

    next();
  };
};

/**
 * Middleware to log role changes
 */
const auditRoleChange = async (req, res, next) => {
  const { userId, newRole } = req.body;

  await createAuditLog({
    userId: req.user.id, // Admin performing the action
    action: 'role_change',
    category: CATEGORY.ADMIN,
    resource: 'user',
    resourceId: userId,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    success: true,
    metadata: {
      adminId: req.user.id,
      targetUserId: userId,
      newRole
    },
    severity: SEVERITY.CRITICAL
  });

  next();
};

/**
 * Middleware to log data modifications
 */
const auditDataModification = (action, resource) => {
  return async (req, res, next) => {
    // Store original handler
    const originalJson = res.json.bind(res);

    // Override res.json to capture success
    res.json = function(data) {
      const success = res.statusCode < 400;

      // Create audit log
      createAuditLog({
        userId: req.user?.id,
        action,
        category: CATEGORY.DATA,
        resource,
        resourceId: req.params.id || data?.data?.id || null,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        success,
        metadata: {
          method: req.method,
          path: req.path
        },
        severity: SEVERITY.INFO
      }).catch(err => {
        logger.error('Failed to create audit log for data modification', {
          error: err.message
        });
      });

      // Call original json method
      return originalJson(data);
    };

    next();
  };
};

/**
 * Middleware to log admin actions
 */
const auditAdminAction = (action) => {
  return async (req, res, next) => {
    await createAuditLog({
      userId: req.user.id,
      action,
      category: CATEGORY.ADMIN,
      resource: req.params.resource || null,
      resourceId: req.params.id || null,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
      metadata: {
        method: req.method,
        path: req.path,
        body: req.body
      },
      severity: SEVERITY.CRITICAL
    });

    next();
  };
};

/**
 * Middleware to log security events
 */
const auditSecurityEvent = (eventType, severity = SEVERITY.WARNING) => {
  return async (req, res, next) => {
    await createAuditLog({
      userId: req.user?.id,
      action: eventType,
      category: CATEGORY.SECURITY,
      resource: null,
      resourceId: null,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: false,
      metadata: {
        path: req.path,
        method: req.method
      },
      severity
    });

    next();
  };
};

/**
 * Middleware to log failed validation attempts
 */
const auditValidationFailure = async (req, res, next) => {
  await createAuditLog({
    userId: req.user?.id,
    action: 'validation_failure',
    category: CATEGORY.SECURITY,
    resource: null,
    resourceId: null,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    success: false,
    metadata: {
      path: req.path,
      method: req.method
    },
    severity: SEVERITY.INFO
  });

  next();
};

/**
 * Initialize audit logs table if it doesn't exist
 */
const initializeAuditLogTable = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        resource VARCHAR(100),
        resource_id INTEGER,
        ip_address VARCHAR(45),
        user_agent TEXT,
        success BOOLEAN NOT NULL DEFAULT true,
        metadata JSONB,
        severity VARCHAR(20) NOT NULL DEFAULT 'info',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create indexes for better query performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON audit_logs(category);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);
    `);

    logger.info('Audit log table initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize audit log table', {
      error: error.message
    });
  }
};

/**
 * Get audit logs with filtering and pagination
 */
const getAuditLogs = async (filters = {}, page = 1, limit = 50) => {
  const offset = (page - 1) * limit;
  let whereClause = 'WHERE 1=1';
  const values = [];
  let paramCount = 1;

  if (filters.userId) {
    whereClause += ` AND user_id = $${paramCount}`;
    values.push(filters.userId);
    paramCount++;
  }

  if (filters.action) {
    whereClause += ` AND action = $${paramCount}`;
    values.push(filters.action);
    paramCount++;
  }

  if (filters.category) {
    whereClause += ` AND category = $${paramCount}`;
    values.push(filters.category);
    paramCount++;
  }

  if (filters.severity) {
    whereClause += ` AND severity = $${paramCount}`;
    values.push(filters.severity);
    paramCount++;
  }

  if (filters.startDate) {
    whereClause += ` AND created_at >= $${paramCount}`;
    values.push(filters.startDate);
    paramCount++;
  }

  if (filters.endDate) {
    whereClause += ` AND created_at <= $${paramCount}`;
    values.push(filters.endDate);
    paramCount++;
  }

  if (filters.ipAddress) {
    whereClause += ` AND ip_address = $${paramCount}`;
    values.push(filters.ipAddress);
    paramCount++;
  }

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) FROM audit_logs ${whereClause}`,
    values
  );
  const totalCount = parseInt(countResult.rows[0].count);

  // Get paginated results
  values.push(limit, offset);
  const result = await query(
    `SELECT * FROM audit_logs ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
    values
  );

  return {
    logs: result.rows,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
};

module.exports = {
  createAuditLog,
  auditAuthAttempt,
  auditRegistration,
  auditPasswordChange,
  auditPasswordResetRequest,
  auditEmailChange,
  auditAccountDeletion,
  auditAuthorizationFailure,
  auditRoleChange,
  auditDataModification,
  auditAdminAction,
  auditSecurityEvent,
  auditValidationFailure,
  initializeAuditLogTable,
  getAuditLogs,
  SEVERITY,
  CATEGORY
};
