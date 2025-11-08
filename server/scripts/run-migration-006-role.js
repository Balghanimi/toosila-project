/**
 * Migration script to add role column to users table
 * Run this script to add role-based access control (RBAC) to the system
 *
 * Usage: node server/scripts/run-migration-006-role.js
 */

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
  console.log('🚀 Starting migration 006: Add role column to users table...\n');

  try {
    // Read the migration SQL file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../database/migrations/006_add_user_role.sql'),
      'utf8'
    );

    // Execute the migration
    console.log('📝 Executing migration SQL...');
    await pool.query(migrationSQL);
    console.log('✅ Migration completed successfully!\n');

    // Check if role column was added
    const checkResult = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'role';
    `);

    if (checkResult.rows.length > 0) {
      console.log('✅ Role column added to users table:');
      console.log('   Column name:', checkResult.rows[0].column_name);
      console.log('   Data type:', checkResult.rows[0].data_type);
      console.log('   Default value:', checkResult.rows[0].column_default);
    } else {
      console.log('⚠️  Warning: Role column might not have been added');
    }

    // Check for existing admin users
    console.log('\n📊 Checking for existing users...');
    const usersResult = await pool.query('SELECT id, email, role FROM users LIMIT 10');

    if (usersResult.rows.length > 0) {
      console.log(`   Found ${usersResult.rows.length} users (showing first 10):`);
      usersResult.rows.forEach(user => {
        console.log(`   - ${user.email}: role = ${user.role}`);
      });

      console.log('\n💡 To make a user an admin, run:');
      console.log('   UPDATE users SET role = \'admin\' WHERE email = \'your-admin@example.com\';');
    } else {
      console.log('   No users found in the database yet.');
    }

    console.log('\n✅ Migration 006 completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration();
