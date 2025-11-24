#!/usr/bin/env node
/**
 * Check Bookings Table Schema
 * Verify actual column types in the database
 */

require('dotenv').config();
const { query } = require('../config/db');

async function checkSchema() {
  console.log('🔍 Checking bookings table schema...\n');

  try {
    // Get column information
    const result = await query(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'bookings'
      ORDER BY ordinal_position
    `);

    if (result.rows.length === 0) {
      console.log('❌ Bookings table does not exist!');
      process.exit(1);
    }

    console.log('✅ Bookings table schema:\n');
    result.rows.forEach(col => {
      console.log(`  ${col.column_name}`);
      console.log(`    Type: ${col.data_type}`);
      console.log(`    Nullable: ${col.is_nullable}`);
      console.log(`    Default: ${col.column_default || 'none'}`);
      console.log('');
    });

    // Check if there are ANY bookings
    const countResult = await query('SELECT COUNT(*) as total FROM bookings');
    console.log(`📊 Total bookings in database: ${countResult.rows[0].total}\n`);

    // Check recent booking attempts (if any exist)
    const recentResult = await query(`
      SELECT
        id,
        offer_id,
        passenger_id,
        status,
        seats,
        created_at
      FROM bookings
      ORDER BY created_at DESC
      LIMIT 5
    `);

    if (recentResult.rows.length > 0) {
      console.log('📝 Recent bookings:');
      recentResult.rows.forEach((row, index) => {
        console.log(`\n${index + 1}. Booking ID: ${row.id}`);
        console.log(`   Offer ID: ${row.offer_id} (type: ${typeof row.offer_id})`);
        console.log(`   Passenger ID: ${row.passenger_id} (type: ${typeof row.passenger_id})`);
        console.log(`   Status: ${row.status}`);
        console.log(`   Seats: ${row.seats}`);
        console.log(`   Created: ${new Date(row.created_at).toLocaleString()}`);
      });
    } else {
      console.log('⚠️ No bookings found in database');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

checkSchema();
