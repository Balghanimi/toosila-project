/**
 * Run Migration 010: Emergency Alert System
 * Adds SOS/Emergency button functionality
 */

const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');

async function runMigration() {
  try {
    console.log('🚀 Starting Migration 010: Emergency Alert System...\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '../database/migrations/010_add_emergency_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute migration
    console.log('📝 Creating emergency_alerts table...');
    console.log('📝 Creating emergency_contacts table...');
    console.log('📝 Creating indexes...');

    await query(migrationSQL);

    console.log('\n✅ Migration 010 completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - emergency_alerts table created');
    console.log('   - emergency_contacts table created');
    console.log('   - 6 indexes created for performance');
    console.log('\n🎉 Emergency alert system is ready!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
