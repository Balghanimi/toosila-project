const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'toosila',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

async function checkSchema() {
  try {
    // Check if verification_documents table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'verification_documents'
      );
    `);

    console.log('verification_documents table exists:', tableCheck.rows[0].exists);

    if (tableCheck.rows[0].exists) {
      const result = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'verification_documents'
        ORDER BY ordinal_position
      `);

      console.log('\nverification_documents table columns:');
      result.rows.forEach(row => {
        console.log(`- ${row.column_name} (${row.data_type})`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
