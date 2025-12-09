/**
 * Setup Test Database
 * Creates toosila_test database if it doesn't exist
 * Run this before running tests: node scripts/setup-test-db.js
 */

require('dotenv').config({ path: '.env.test' });
const { Client } = require('pg');

async function setupTestDatabase() {
  // Connect to default postgres database first
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Connect to default database
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Check if test database exists
    const dbCheckResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = 'toosila_test'`
    );

    if (dbCheckResult.rows.length === 0) {
      console.log('📦 Creating toosila_test database...');
      await client.query('CREATE DATABASE toosila_test');
      console.log('✅ Test database created successfully');
    } else {
      console.log('✅ Test database already exists');
    }

    await client.end();

    // Now connect to the test database and run migrations
    const testDbClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: 'toosila_test',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
    });

    await testDbClient.connect();
    console.log('✅ Connected to test database');

    // Read and execute the schema from init-db.sql
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, 'init-db.sql');

    if (fs.existsSync(schemaPath)) {
      console.log('📦 Running database migrations...');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await testDbClient.query(schema);
      console.log('✅ Database schema initialized');

      // Run additional migrations
      console.log('📦 Running migration 012 (booking seats)...');
      try {
        await testDbClient.query(`
          ALTER TABLE bookings
          ADD COLUMN IF NOT EXISTS seats INTEGER DEFAULT 1
        `);
        console.log('✅ Migration 012 completed');
      } catch (err) {
        console.log('⚠️ Migration 012 skipped:', err.message);
      }

      console.log('📦 Running migration 017 (phone verification)...');
      try {
        await testDbClient.query(`
          ALTER TABLE users
          ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
          ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMPTZ,
          ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE
        `);
        console.log('✅ Migration 017 completed');
      } catch (err) {
        console.log('⚠️ Migration 017 skipped:', err.message);
      }
    } else {
      console.warn('⚠️ init-db.sql not found, skipping schema creation');
    }

    await testDbClient.end();
    console.log('✅ Test database setup complete!');
  } catch (error) {
    console.error('❌ Error setting up test database:', error.message);
    process.exit(1);
  }
}

setupTestDatabase();
