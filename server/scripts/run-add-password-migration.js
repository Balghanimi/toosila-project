/**
 * Run migration to add password column to users table
 */
const { query } = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🔄 Starting password column migration...');

  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, 'add-password-column.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute migration
    const result = await query(sql);
    console.log('✅ Migration completed successfully!');
    console.log('Result:', result.rows);

    // Verify column exists
    const verifyResult = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name IN ('password', 'password_changed_at')
      ORDER BY column_name;
    `);

    console.log('\n📋 Verified columns:');
    verifyResult.rows.forEach((row) => {
      console.log(
        `  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
