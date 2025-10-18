const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database schema...');

    // Test database connection first
    await query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'init-db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    await query(sql);

    console.log('✅ Database schema setup completed successfully!');
    console.log('📊 Tables created/verified:');
    console.log('   - users');
    console.log('   - categories');
    console.log('   - demands');
    console.log('   - offers');
    console.log('   - bookings');
    console.log('   - messages');
    console.log('   - ratings');
    console.log('   - refresh_tokens');

    // Verify tables exist
    const result = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log(`📋 Total tables in database: ${result.rows.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

setupDatabase();
