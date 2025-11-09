const { query } = require('../config/db');
const logger = require('../config/logger');

/**
 * Initialize Audit Logs Table
 * Creates the audit_logs table and necessary indexes
 *
 * Usage: node scripts/initialize-audit-logs.js
 */

async function initializeAuditLogs() {
  console.log('Starting audit logs initialization...\n');

  try {
    // Create audit_logs table
    console.log('Creating audit_logs table...');
    await query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        resource VARCHAR(100),
        resource_id VARCHAR(100),
        ip_address VARCHAR(45),
        user_agent TEXT,
        success BOOLEAN NOT NULL DEFAULT true,
        metadata JSONB,
        severity VARCHAR(20) NOT NULL DEFAULT 'info',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✓ audit_logs table created\n');

    // Create indexes for better query performance
    console.log('Creating indexes...');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
      ON audit_logs(user_id)
    `);
    console.log('✓ Index created: idx_audit_logs_user_id');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action
      ON audit_logs(action)
    `);
    console.log('✓ Index created: idx_audit_logs_action');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_category
      ON audit_logs(category)
    `);
    console.log('✓ Index created: idx_audit_logs_category');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
      ON audit_logs(created_at DESC)
    `);
    console.log('✓ Index created: idx_audit_logs_created_at');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_severity
      ON audit_logs(severity)
    `);
    console.log('✓ Index created: idx_audit_logs_severity');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address
      ON audit_logs(ip_address)
    `);
    console.log('✓ Index created: idx_audit_logs_ip_address');

    // Create composite index for common query patterns
    await query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action
      ON audit_logs(user_id, action)
    `);
    console.log('✓ Index created: idx_audit_logs_user_action');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_category_severity
      ON audit_logs(category, severity)
    `);
    console.log('✓ Index created: idx_audit_logs_category_severity');

    console.log('\n✅ Audit logs system initialized successfully!\n');

    // Verify table structure
    const result = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'audit_logs'
      ORDER BY ordinal_position
    `);

    console.log('Table structure:');
    console.table(result.rows);

    // Verify indexes
    const indexes = await query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'audit_logs'
      ORDER BY indexname
    `);

    console.log('\nIndexes created:');
    indexes.rows.forEach(idx => {
      console.log(`  - ${idx.indexname}`);
    });

    console.log('\n✅ Initialization complete!');
    console.log('\nNext steps:');
    console.log('1. Add audit middleware to routes (see server/middlewares/auditLog.js)');
    console.log('2. Import audit functions in controllers');
    console.log('3. Test audit logging with login/logout');
    console.log('4. Monitor audit logs: SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing audit logs:', error.message);
    logger.error('Failed to initialize audit logs', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Run initialization
initializeAuditLogs();
