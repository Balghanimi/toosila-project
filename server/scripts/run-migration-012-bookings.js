#!/usr/bin/env node

/**
 * Run Migration 012 on Remote Database (Railway)
 *
 * Fixes the UNIQUE constraint issue that prevents users from booking
 * the same offer after cancellation.
 *
 * Usage:
 *   1. Get DATABASE_URL from Railway dashboard
 *   2. Windows: set DATABASE_URL=your_url && node server/scripts/run-migration-012-bookings.js
 *   3. Linux/Mac: DATABASE_URL="your_url" node server/scripts/run-migration-012-bookings.js
 */

const { Pool } = require('pg');

// Read DATABASE_URL from environment or command line
const DATABASE_URL = process.env.DATABASE_URL || process.argv[2];

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL not provided!');
  console.error('');
  console.error('Usage:');
  console.error('  Windows:');
  console.error('    set DATABASE_URL=postgresql://user:pass@host:port/db');
  console.error('    node server/scripts/run-migration-012-bookings.js');
  console.error('');
  console.error('  Linux/Mac:');
  console.error('    DATABASE_URL="postgresql://user:pass@host:port/db" node server/scripts/run-migration-012-bookings.js');
  console.error('');
  console.error('Or get it from Railway Dashboard → Database → Variables → DATABASE_URL');
  process.exit(1);
}

console.log('🚀 Starting migration 012...');
console.log(`📡 Connecting to database...`);

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Railway
  },
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('✅ Connected successfully!');
    console.log('');
    console.log('📝 Running Migration 012: Fix Bookings Unique Constraint...');
    console.log('');

    await client.query('BEGIN');

    // Check existing constraint
    const checkConstraint = await client.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'bookings'
        AND constraint_type = 'UNIQUE'
        AND constraint_name = 'bookings_offer_id_passenger_id_key'
    `);

    if (checkConstraint.rows.length > 0) {
      console.log('  📌 Dropping old UNIQUE constraint...');
      await client.query(`
        ALTER TABLE bookings
        DROP CONSTRAINT IF EXISTS bookings_offer_id_passenger_id_key
      `);
      console.log('  ✅ Old constraint dropped');
    } else {
      console.log('  ⏭️  Old constraint does not exist');
    }

    console.log('');
    console.log('  📌 Creating partial unique index for active bookings...');

    // Create partial unique index
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_active_unique
      ON bookings(offer_id, passenger_id)
      WHERE status IN ('pending', 'accepted')
    `);

    console.log('  ✅ Partial unique index created');

    await client.query('COMMIT');

    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('✅ Migration 012 completed successfully!');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('📋 Summary:');
    console.log('  ✓ Removed strict UNIQUE(offer_id, passenger_id) constraint');
    console.log('  ✓ Added partial unique index for active bookings only');
    console.log('  ✓ Users can now re-book offers after cancellation');
    console.log('  ✓ Still prevents multiple active bookings per offer');
    console.log('');
    console.log('🎉 Your booking system is now more flexible!');
    console.log('');

    // Verify the changes
    const verifyIndex = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'bookings'
        AND indexname = 'idx_bookings_active_unique'
    `);

    if (verifyIndex.rows.length > 0) {
      console.log('✅ Verification:');
      console.log(`  - Index: ${verifyIndex.rows[0].indexname}`);
      console.log(`  - Definition: ${verifyIndex.rows[0].indexdef}`);
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('');
    console.error('═══════════════════════════════════════════');
    console.error('❌ Migration failed!');
    console.error('═══════════════════════════════════════════');
    console.error('Error:', error.message);
    console.error('');
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('✨ Migration script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error.message);
    process.exit(1);
  });
