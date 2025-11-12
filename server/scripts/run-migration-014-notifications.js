require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  // Get DATABASE_URL from command line argument or environment
  const DATABASE_URL = process.argv[2] || process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL is required');
    console.error('Usage: node run-migration-014-notifications.js "postgresql://..."');
    process.exit(1);
  }

  // Configure pool with DATABASE_URL
  const poolConfig = {
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for Railway
    },
  };

  const pool = new Pool(poolConfig);

  try {
    console.log('🔄 Starting migration 014: Cleanup orphaned notifications...');
    console.log('');

    // Count notifications before cleanup
    const beforeCount = await pool.query('SELECT COUNT(*) FROM notifications');
    console.log(`📊 Notifications before cleanup: ${beforeCount.rows[0].count}`);
    console.log('');

    // Read migration file
    const migrationPath = path.join(__dirname, '../database/migrations/014_cleanup_orphaned_notifications.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');

    // Execute migration
    await pool.query(migration);

    console.log('✅ Migration 014 completed successfully!');
    console.log('');
    console.log('🔍 Verifying migration...');
    console.log('');

    // Count notifications after cleanup
    const afterCount = await pool.query('SELECT COUNT(*) FROM notifications');
    console.log(`📊 Notifications after cleanup: ${afterCount.rows[0].count}`);
    console.log(`🗑️  Deleted: ${beforeCount.rows[0].count - afterCount.rows[0].count} orphaned notifications`);
    console.log('');

    // Verify triggers exist
    const triggerCheck = await pool.query(`
      SELECT trigger_name, event_manipulation, event_object_table
      FROM information_schema.triggers
      WHERE trigger_name IN ('trg_cleanup_demand_notifications', 'trg_cleanup_booking_notifications')
      ORDER BY trigger_name
    `);

    console.log('✅ Triggers created:');
    triggerCheck.rows.forEach(row => {
      console.log(`   - ${row.trigger_name} on ${row.event_object_table} (${row.event_manipulation})`);
    });
    console.log('');

    // Verify indexes exist
    const indexCheck = await pool.query(`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE indexname IN ('idx_notifications_demand_id', 'idx_notifications_booking_id')
      ORDER BY indexname
    `);

    console.log('✅ Indexes created:');
    indexCheck.rows.forEach(row => {
      console.log(`   - ${row.indexname} on ${row.tablename}`);
    });
    console.log('');

    // Show sample notifications with their data
    const sampleNotifications = await pool.query(`
      SELECT type, data, is_read, created_at
      FROM notifications
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log('📋 Sample recent notifications:');
    if (sampleNotifications.rows.length === 0) {
      console.log('   (No notifications in database)');
    } else {
      sampleNotifications.rows.forEach(row => {
        const demandId = row.data?.demandId || 'N/A';
        const bookingId = row.data?.bookingId || 'N/A';
        console.log(`   - ${row.type} | demand:${demandId} | booking:${bookingId} | read:${row.is_read}`);
      });
    }
    console.log('');

    console.log('✨ Migration 014 verification complete!');
    console.log('');
    console.log('🎯 What changed:');
    console.log('   1. Removed all orphaned notifications');
    console.log('   2. Notifications will auto-delete when demand/booking deleted');
    console.log('   3. Performance indexes added for faster queries');
    console.log('   4. Users will no longer see notifications for deleted items');
    console.log('');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
