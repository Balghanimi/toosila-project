/**
 * Run Migration 017: Phone Verification System
 * Adds phone verification fields and OTP tracking table
 */

const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');

async function runMigration() {
  try {
    console.log('🚀 Starting Migration 017: Phone Verification System...\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '../database/migrations/017_add_phone_verification.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute migration
    console.log('📝 Adding phone columns to users table...');
    console.log('📝 Making email optional...');
    console.log('📝 Creating otp_requests table...');
    console.log('📝 Creating indexes...');

    await query(migrationSQL);

    console.log('\n✅ Migration 017 completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Added phone, phone_verified, phone_verified_at to users table');
    console.log('   - Made email column optional (nullable)');
    console.log('   - Created otp_requests table for OTP tracking');
    console.log('   - Created 3 indexes for performance');
    console.log('\n🎉 Phone verification system is ready!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
