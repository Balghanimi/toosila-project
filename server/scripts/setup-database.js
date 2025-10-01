const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database schema...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'init-db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await query(sql);
    
    console.log('✅ Database schema setup completed successfully!');
    console.log('📊 Tables created:');
    console.log('   - users');
    console.log('   - categories');
    console.log('   - demands');
    console.log('   - offers');
    console.log('   - bookings');
    console.log('   - messages');
    console.log('   - ratings');
    console.log('   - refresh_tokens');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
