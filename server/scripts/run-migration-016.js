#!/usr/bin/env node

/**
 * Migration Script: Convert UUID IDs to INTEGER for demands, offers, bookings
 *
 * This script runs the 016_convert_ids_to_integer.sql migration
 * which converts all demand, offer, and booking IDs from UUID to INTEGER.
 *
 * IMPORTANT: This migration is destructive and should be run in a maintenance window.
 * Make sure to backup your database before running this migration!
 *
 * Usage:
 *   node server/scripts/run-migration-016.js
 *
 * Or with Railway:
 *   railway run node server/scripts/run-migration-016.js
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

const MIGRATION_FILE = path.join(
  __dirname,
  '../database/migrations/016_convert_ids_to_integer.sql'
);
const MIGRATION_NAME = '016_convert_ids_to_integer';

async function runMigration() {
  console.log('🔄 Starting migration: Convert UUID IDs to INTEGER');
  console.log('⚠️  WARNING: This is a destructive migration. Make sure you have a backup!');
  console.log('');

  let client;

  try {
    // Read the migration file
    console.log(`📖 Reading migration file: ${MIGRATION_FILE}`);
    const migrationSQL = fs.readFileSync(MIGRATION_FILE, 'utf8');

    // Get a client from the pool
    client = await pool.connect();
    console.log('✅ Connected to database');

    // Check if migration has already been run
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const checkResult = await client.query(
      'SELECT * FROM schema_migrations WHERE migration_name = $1',
      [MIGRATION_NAME]
    );

    if (checkResult.rows.length > 0) {
      console.log('⚠️  Migration has already been executed on', checkResult.rows[0].executed_at);
      console.log('ℹ️  Skipping migration...');
      return;
    }

    // Get counts before migration
    console.log('\n📊 Counting records before migration...');
    const demandsCount = await client.query('SELECT COUNT(*) FROM demands');
    const offersCount = await client.query('SELECT COUNT(*) FROM offers');
    const bookingsCount = await client.query('SELECT COUNT(*) FROM bookings');
    const demandResponsesCount = await client.query('SELECT COUNT(*) FROM demand_responses');

    console.log(`  - Demands: ${demandsCount.rows[0].count}`);
    console.log(`  - Offers: ${offersCount.rows[0].count}`);
    console.log(`  - Bookings: ${bookingsCount.rows[0].count}`);
    console.log(`  - Demand Responses: ${demandResponsesCount.rows[0].count}`);

    // Begin transaction
    console.log('\n🔒 Starting transaction...');
    await client.query('BEGIN');

    // Execute the migration
    console.log('🚀 Executing migration SQL...');
    await client.query(migrationSQL);

    // Verify counts after migration
    console.log('\n📊 Verifying record counts after migration...');
    const demandsCountAfter = await client.query('SELECT COUNT(*) FROM demands');
    const offersCountAfter = await client.query('SELECT COUNT(*) FROM offers');
    const bookingsCountAfter = await client.query('SELECT COUNT(*) FROM bookings');
    const demandResponsesCountAfter = await client.query('SELECT COUNT(*) FROM demand_responses');

    console.log(`  - Demands: ${demandsCountAfter.rows[0].count}`);
    console.log(`  - Offers: ${offersCountAfter.rows[0].count}`);
    console.log(`  - Bookings: ${bookingsCountAfter.rows[0].count}`);
    console.log(`  - Demand Responses: ${demandResponsesCountAfter.rows[0].count}`);

    // Check if counts match
    const countsMatch =
      demandsCount.rows[0].count === demandsCountAfter.rows[0].count &&
      offersCount.rows[0].count === offersCountAfter.rows[0].count &&
      bookingsCount.rows[0].count === bookingsCountAfter.rows[0].count &&
      demandResponsesCount.rows[0].count === demandResponsesCountAfter.rows[0].count;

    if (!countsMatch) {
      throw new Error('Record counts do not match! Rolling back migration.');
    }

    // Verify ID types changed
    console.log('\n🔍 Verifying schema changes...');
    const schemaCheck = await client.query(`
      SELECT
        table_name,
        column_name,
        data_type
      FROM information_schema.columns
      WHERE table_name IN ('demands', 'offers', 'bookings', 'demand_responses')
        AND column_name = 'id'
      ORDER BY table_name
    `);

    console.log('  ID column types:');
    schemaCheck.rows.forEach((row) => {
      console.log(`    - ${row.table_name}.id: ${row.data_type}`);
      if (row.data_type !== 'integer') {
        throw new Error(`${row.table_name}.id is not INTEGER! Found: ${row.data_type}`);
      }
    });

    // Record migration in schema_migrations table
    await client.query('INSERT INTO schema_migrations (migration_name) VALUES ($1)', [
      MIGRATION_NAME,
    ]);

    // Commit transaction
    console.log('\n✅ Committing transaction...');
    await client.query('COMMIT');

    console.log('\n🎉 Migration completed successfully!');
    console.log('');
    console.log('Summary:');
    console.log('  - demands.id: UUID → INTEGER');
    console.log('  - offers.id: UUID → INTEGER');
    console.log('  - bookings.id: UUID → INTEGER');
    console.log('  - bookings.offer_id: UUID → INTEGER');
    console.log('  - demand_responses.id: UUID → INTEGER');
    console.log('  - demand_responses.demand_id: UUID → INTEGER');
    console.log('  - messages.ride_id: UUID → INTEGER');
    console.log('  - ratings.ride_id: UUID → INTEGER');
    console.log('');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);

    if (client) {
      console.log('🔄 Rolling back transaction...');
      try {
        await client.query('ROLLBACK');
        console.log('✅ Transaction rolled back successfully');
      } catch (rollbackError) {
        console.error('❌ Rollback failed:', rollbackError.message);
      }
    }

    process.exit(1);
  } finally {
    if (client) {
      client.release();
      console.log('🔌 Database connection released');
    }
    await pool.end();
  }
}

// Run the migration
runMigration().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
