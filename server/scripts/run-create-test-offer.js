#!/usr/bin/env node
/**
 * Create Test Offer Script
 * Executes create-test-offer.sql to add a fresh test offer with available seats
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');

async function createTestOffer() {
  console.log('🚀 Creating test offer with available seats...\n');

  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, 'create-test-offer.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute SQL
    console.log('📝 Executing SQL script...\n');
    const result = await query(sql);

    console.log('\n✅ Test offer created successfully!');
    console.log('\n📊 Recent offers with available seats:');

    // Display the verification query result
    if (result.rows && result.rows.length > 0) {
      result.rows.forEach((row, index) => {
        console.log(`\n${index + 1}. Offer ID: ${row.id}`);
        console.log(`   Route: ${row.route}`);
        console.log(`   Departure: ${row.departure_time}`);
        console.log(`   Total Seats: ${row.total_seats}`);
        console.log(`   Available Seats: ${row.available_seats}`);
        console.log(`   Price: ${row.price} IQD`);
        console.log(`   Driver: ${row.driver_name}`);
      });
    }

    console.log('\n🎯 Next steps:');
    console.log('1. Frontend should display the offer with correct available_seats');
    console.log('2. Try booking 1 seat');
    console.log('3. Verify available_seats updates to (total - 1)');
    console.log('4. Booking should succeed!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test offer:', error);
    process.exit(1);
  }
}

createTestOffer();
