#!/usr/bin/env node
require('dotenv').config();
const { query } = require('../config/db');

async function debug() {
  try {
    // Check for user بكر علي
    console.log('\n👤 Searching for user بكر علي...');
    const userResult = await query(`
      SELECT id, name, email, is_driver
      FROM users
      WHERE id::text LIKE '%dd2ee950%'
      ORDER BY created_at DESC
      LIMIT 5
    `);
    console.log('Found users:', JSON.stringify(userResult.rows, null, 2));

    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id;
      console.log('\n📊 Checking bookings for user:', userId);

      // Check bookings for this user
      const bookingsResult = await query(`
        SELECT b.*, o.from_city, o.to_city, u.name as passenger_name
        FROM bookings b
        JOIN offers o ON b.offer_id = o.id
        JOIN users u ON b.passenger_id = u.id
        WHERE b.passenger_id = $1
        ORDER BY b.created_at DESC
      `, [userId]);

      console.log('Bookings count:', bookingsResult.rows.length);
      console.log('Bookings:', JSON.stringify(bookingsResult.rows, null, 2));
    }

    // Check all recent bookings
    console.log('\n📊 All bookings in database:');
    const allBookings = await query(`
      SELECT COUNT(*) as total FROM bookings
    `);
    console.log('Total bookings:', allBookings.rows[0].total);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debug();
