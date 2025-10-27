#!/usr/bin/env node

/**
 * Script to run migration 005: Ensure demand_responses table exists
 * Usage: node server/scripts/run-migration-005.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  console.log('🚀 Starting migration 005: Ensure demand_responses table exists...\n');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../database/migrations/005_ensure_demand_responses_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded successfully');
    console.log('🔗 Connecting to database...');

    // Connect to database
    const client = await pool.connect();
    console.log('✅ Connected to database');

    try {
      console.log('\n🔄 Executing migration...\n');

      // Execute migration
      await client.query(sql);

      console.log('\n✅ Migration completed successfully!');
      console.log('\n📊 Verifying table structure...');

      // Verify table exists and show structure
      const result = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'demand_responses'
        ORDER BY ordinal_position;
      `);

      if (result.rows.length > 0) {
        console.log('\n✅ Table demand_responses structure:');
        console.table(result.rows);
      } else {
        console.log('\n❌ Table demand_responses not found!');
      }

      // Check indexes
      const indexesResult = await client.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'demand_responses';
      `);

      if (indexesResult.rows.length > 0) {
        console.log('\n✅ Indexes on demand_responses:');
        console.table(indexesResult.rows);
      }

      // Check constraints
      const constraintsResult = await client.query(`
        SELECT conname as constraint_name, contype as constraint_type
        FROM pg_constraint
        WHERE conrelid = 'demand_responses'::regclass;
      `);

      if (constraintsResult.rows.length > 0) {
        console.log('\n✅ Constraints on demand_responses:');
        console.table(constraintsResult.rows);
      }

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('\n❌ Migration failed!');
    console.error('Error:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
    if (error.hint) console.error('Hint:', error.hint);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n👋 Database connection closed');
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });
