const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function createUser() {
  try {
    const password = 'test123';
    const hash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, email_verified, is_driver, language_preference)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name`,
      ['Alien Gmech', 'aliengmech@gmail.com', hash, true, false, 'ar']
    );

    console.log('\n✅ User created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', result.rows[0].email);
    console.log('👤 Name:', result.rows[0].name);
    console.log('🔑 Password: test123');
    console.log('✓ Email Verified: Yes');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎉 You can now login with these credentials!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === '23505') {
      console.log('ℹ️ User already exists. Use "Forgot Password" to reset.');
    }
  } finally {
    await pool.end();
  }
}

createUser();
