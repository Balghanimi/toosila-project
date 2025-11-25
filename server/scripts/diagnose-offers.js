#!/usr/bin/env node
require('dotenv').config();
const { query } = require('../config/db');

async function diagnose() {
  try {
    console.log('\n🔍 DIAGNOSING OFFERS AVAILABLE SEATS...\n');

    // Check offers and their bookings
    const result = await query(`
      SELECT
        o.id,
        o.from_city,
        o.to_city,
        o.seats as total_seats,
        o.departure_time,
        o.is_active,
        COUNT(b.id) as booking_count,
        COALESCE(SUM(CASE WHEN b.status IN ('pending', 'confirmed') THEN b.seats ELSE 0 END), 0) as booked_seats,
        (o.seats - COALESCE(SUM(CASE WHEN b.status IN ('pending', 'confirmed') THEN b.seats ELSE 0 END), 0))::int as calculated_available
      FROM offers o
      LEFT JOIN bookings b ON o.id = b.offer_id
      WHERE o.is_active = true
      GROUP BY o.id
      ORDER BY o.departure_time ASC
      LIMIT 10
    `);

    console.log('📊 Offers Analysis:');
    console.log('='.repeat(80));

    result.rows.forEach((offer, idx) => {
      console.log(`\n${idx + 1}. ${offer.from_city} → ${offer.to_city}`);
      console.log(`   Offer ID: ${offer.id.slice(0, 8)}...`);
      console.log(`   Total Seats: ${offer.total_seats}`);
      console.log(`   Bookings Count: ${offer.booking_count}`);
      console.log(`   Booked Seats: ${offer.booked_seats}`);
      console.log(`   Calculated Available: ${offer.calculated_available}`);
      console.log(`   Departure: ${new Date(offer.departure_time).toLocaleString('ar-EG')}`);
      console.log(`   Active: ${offer.is_active}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\n✅ Total Active Offers: ${result.rows.length}`);
    console.log(`✅ Offers with >0 available: ${result.rows.filter(o => o.calculated_available > 0).length}`);
    console.log(`⚠️  Offers with 0 available: ${result.rows.filter(o => o.calculated_available === 0).length}`);

    // Now check what the actual model returns
    console.log('\n\n🔍 CHECKING WHAT offers.model.js RETURNS...\n');
    const Offer = require('../models/offers.model');
    const offersData = await Offer.findAll();

    console.log('📦 Offers from Model:');
    console.log(`   Total returned: ${offersData.offers?.length || 0}`);

    if (offersData.offers && offersData.offers.length > 0) {
      offersData.offers.forEach((offer, idx) => {
        console.log(`\n${idx + 1}. ${offer.fromCity} → ${offer.toCity}`);
        console.log(`   Available Seats (from model): ${offer.availableSeats}`);
        console.log(`   Total Seats: ${offer.seats}`);
        console.log(`   Departure: ${new Date(offer.departureTime).toLocaleString('en-US')}`);
      });
    } else {
      console.log('   ⚠️ No offers returned (all filtered out or none exist)');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

diagnose();
