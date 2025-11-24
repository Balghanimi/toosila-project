#!/usr/bin/env node
/**
 * Verify Test Offer
 * Query recent offers to verify test offer creation and available_seats calculation
 */

require('dotenv').config();
const { query } = require('../config/db');

async function verifyTestOffer() {
  console.log('🔍 Verifying test offers...\n');

  try {
    const result = await query(`
      SELECT
        o.id,
        o.from_city || ' → ' || o.to_city as route,
        o.departure_time,
        o.seats as total_seats,
        (o.seats - COALESCE(SUM(b.seats) FILTER (WHERE b.status IN ('pending', 'accepted')), 0))::int as available_seats,
        o.price,
        u.name as driver_name,
        o.created_at
      FROM offers o
      JOIN users u ON o.driver_id = u.id
      LEFT JOIN bookings b ON o.id = b.offer_id
      WHERE o.is_active = true
      GROUP BY o.id, u.name
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    if (result.rows.length === 0) {
      console.log('❌ No active offers found');
      process.exit(1);
    }

    console.log(`✅ Found ${result.rows.length} active offer(s):\n`);

    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. Offer ID: ${row.id}`);
      console.log(`   Route: ${row.route}`);
      console.log(`   Departure: ${new Date(row.departure_time).toLocaleString('en-US')}`);
      console.log(`   Total Seats: ${row.total_seats}`);
      console.log(`   Available Seats: ${row.available_seats} ⭐`);
      console.log(`   Price: ${row.price} IQD`);
      console.log(`   Driver: ${row.driver_name}`);
      console.log(`   Created: ${new Date(row.created_at).toLocaleString('en-US')}`);
      console.log('');
    });

    // Find offers with available seats
    const availableOffers = result.rows.filter(row => row.available_seats > 0);

    if (availableOffers.length > 0) {
      console.log(`\n🎯 ${availableOffers.length} offer(s) with available seats - Ready for booking!`);
      console.log('\n📱 Next steps:');
      console.log('1. Open frontend: https://toosila-frontend.up.railway.app/offers');
      console.log('2. Look for offer:', availableOffers[0].route);
      console.log('3. Should show:', availableOffers[0].available_seats, 'available seats');
      console.log('4. Try booking 1 seat');
      console.log('5. Backend should accept the booking ✅\n');
    } else {
      console.log('\n⚠️ All offers have 0 available seats - bookings will fail');
      console.log('Run: node scripts/run-create-test-offer.js to create a fresh offer\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error verifying offers:', error);
    process.exit(1);
  }
}

verifyTestOffer();
