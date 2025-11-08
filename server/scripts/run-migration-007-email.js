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
  console.log('🚀 Starting migration 007: Add email verification columns to users table...\n');

  try {
    // Read the migration SQL file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../database/migrations/007_add_email_verification.sql'),
      'utf8'
    );

    // Execute the migration
    console.log('📝 Executing migration SQL...');
    await pool.query(migrationSQL);
    console.log('✅ Migration completed successfully!\n');

    // Check if email verification columns were added
    const checkResult = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
        AND column_name IN ('verification_token', 'verification_token_expires', 'email_verified', 'email_verified_at')
      ORDER BY column_name;
    `);

    if (checkResult.rows.length > 0) {
      console.log('✅ Email verification columns added to users table:');
      checkResult.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}${col.column_default ? ` (default: ${col.column_default})` : ''}`);
      });
    }

    // Check for existing users and their verification status
    console.log('\n📊 Checking existing users...');
    const usersResult = await pool.query('SELECT id, email, email_verified FROM users LIMIT 10');

    if (usersResult.rows.length > 0) {
      console.log(`   Found ${usersResult.rows.length} users (showing first 10):`);
      usersResult.rows.forEach(user => {
        console.log(`   - ${user.email}: email_verified = ${user.email_verified}`);
      });

      console.log('\n💡 Note: Existing users are automatically verified (grandfather clause)');
    } else {
      console.log('   No existing users found');
    }

    console.log('\n✅ Migration 007 completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
