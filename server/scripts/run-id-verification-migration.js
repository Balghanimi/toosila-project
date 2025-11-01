const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');

async function runMigration() {
  try {
    console.log('🔄 Running ID Verification migration...');

    // Test database connection first
    await query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Read the migration SQL file
    const sqlPath = path.join(__dirname, 'add-id-verification.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the migration
    await query(sql);

    console.log('✅ ID Verification migration completed successfully!');
    console.log('📊 Changes applied:');
    console.log('   - Added verification columns to users table');
    console.log('   - Created verification_documents table');
    console.log('   - Created verification_audit_log table');
    console.log('   - Added necessary indexes');

    // Verify tables and columns exist
    const tablesResult = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('verification_documents', 'verification_audit_log')
      ORDER BY table_name;
    `);

    console.log(`📋 New tables created: ${tablesResult.rows.length}`);
    tablesResult.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Verify new columns in users table
    const columnsResult = await query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name IN ('is_verified', 'verification_status', 'verification_date', 'verified_by')
      ORDER BY column_name;
    `);

    console.log(`📋 New columns in users table: ${columnsResult.rows.length}`);
    columnsResult.rows.forEach(row => {
      console.log(`   ✓ ${row.column_name} (${row.data_type})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

runMigration();
