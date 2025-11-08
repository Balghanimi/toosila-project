const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined
});

async function runMigration() {
  console.log('🚀 Starting migration 008: Add password reset columns to users table...\n');

  try {
    // Read the migration SQL file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../database/migrations/008_add_password_reset.sql'),
      'utf8'
    );

    // Execute the migration
    console.log('📝 Executing migration SQL...');
    await pool.query(migrationSQL);
    console.log('✅ Migration completed successfully!\n');

    // Check if password reset columns were added
    const checkResult = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
        AND column_name IN ('reset_password_token', 'reset_password_expires')
      ORDER BY column_name;
    `);

    if (checkResult.rows.length > 0) {
      console.log('✅ Password reset columns added to users table:');
      checkResult.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    }

    console.log('\n✅ Migration 008 completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
