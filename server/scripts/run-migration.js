#!/usr/bin/env node

/**
 * Migration Script: Add seats and message columns to bookings table
 * Run this with: node server/scripts/run-migration.js
 * Or with Railway: railway run node server/scripts/run-migration.js
 */

const { Client } = require('pg');

async function runMigration() {
  // Get database URL from environment (prefer PUBLIC for external connections)
  const databaseUrl = process.env.DATABASE_PUBLIC_URL ||
                      process.env.DATABASE_URL ||
                      process.env.DATABASE_PRIVATE_URL;

  if (!databaseUrl) {
    console.error('❌ Error: DATABASE_URL not found in environment variables');
    console.log('Please run with: railway run node server/scripts/run-migration.js');
    process.exit(1);
  }

  console.log('🔗 Using database URL:', databaseUrl.replace(/:[^:]*@/, ':****@'));

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false } // Always use SSL for Railway
  });

  try {
    console.log('🔌 Connecting to PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Add seats column
    console.log('\n📝 Adding seats column to bookings table...');
    await client.query(`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS seats INTEGER DEFAULT 1 CHECK (seats >= 1 AND seats <= 7);
    `);
    console.log('✅ Seats column added successfully!');

    // Add message column
    console.log('\n📝 Adding message column to bookings table...');
    await client.query(`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS message TEXT;
    `);
    console.log('✅ Message column added successfully!');

    // Update existing bookings
    console.log('\n📝 Updating existing bookings...');
    const updateResult = await client.query(`
      UPDATE bookings SET seats = 1 WHERE seats IS NULL;
    `);
    console.log(`✅ Updated ${updateResult.rowCount} existing booking(s)`);

    // Verify columns exist
    console.log('\n🔍 Verifying migration...');
    const verifyResult = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'bookings' AND column_name IN ('seats', 'message')
      ORDER BY column_name;
    `);

    console.log('\n✅ Migration completed successfully!');
    console.log('\nColumns added:');
    verifyResult.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}): default = ${row.column_default || 'NULL'}`);
    });

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run migration
runMigration();
