/**
 * Script to verify all required indexes exist in the database
 */

const { query } = require('../config/db');

const REQUIRED_INDEXES = [
  // Performance indexes
  { name: 'idx_offers_driver_id', table: 'offers', columns: ['driver_id'] },
  { name: 'idx_bookings_passenger_id', table: 'bookings', columns: ['passenger_id'] },
  { name: 'idx_bookings_offer_id', table: 'bookings', columns: ['offer_id'] },
  { name: 'idx_messages_sender_id', table: 'messages', columns: ['sender_id'] },
  { name: 'idx_ratings_to_user_id', table: 'ratings', columns: ['to_user_id'] },
  { name: 'idx_demand_responses_demand_id', table: 'demand_responses', columns: ['demand_id'] },
  { name: 'idx_demand_responses_driver_id', table: 'demand_responses', columns: ['driver_id'] },
  { name: 'idx_notifications_user_id', table: 'notifications', columns: ['user_id'] },

  // Additional search indexes
  { name: 'idx_users_email', table: 'users', columns: ['email'] },
  { name: 'idx_demands_from_city', table: 'demands', columns: ['from_city'] },
  { name: 'idx_demands_to_city', table: 'demands', columns: ['to_city'] },
  { name: 'idx_demands_is_active', table: 'demands', columns: ['is_active'] },
  { name: 'idx_offers_from_city', table: 'offers', columns: ['from_city'] },
  { name: 'idx_offers_to_city', table: 'offers', columns: ['to_city'] },
  { name: 'idx_offers_departure_time', table: 'offers', columns: ['departure_time'] },
  { name: 'idx_offers_is_active', table: 'offers', columns: ['is_active'] },
  { name: 'idx_bookings_status', table: 'bookings', columns: ['status'] },
  { name: 'idx_messages_ride_type_ride_id', table: 'messages', columns: ['ride_type', 'ride_id'] },
  { name: 'idx_ratings_ride_id', table: 'ratings', columns: ['ride_id'] },
  { name: 'idx_demand_responses_status', table: 'demand_responses', columns: ['status'] },
];

async function verifyIndexes() {
  console.log('🔍 Verifying database indexes...\n');

  try {
    // Get all indexes from the database
    const result = await query(`
      SELECT
        i.relname as index_name,
        t.relname as table_name,
        array_agg(a.attname ORDER BY a.attnum) as column_names
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      WHERE t.relkind = 'r'
        AND t.relname NOT LIKE 'pg_%'
      GROUP BY i.relname, t.relname
      ORDER BY t.relname, i.relname
    `);

    const existingIndexes = new Map(
      result.rows.map(row => [row.index_name, row])
    );

    let missingCount = 0;
    let existingCount = 0;

    console.log('📊 Index Verification Report:\n');
    console.log('─'.repeat(80));
    console.log('| Index Name                           | Table              | Status   |');
    console.log('─'.repeat(80));

    for (const idx of REQUIRED_INDEXES) {
      const exists = existingIndexes.has(idx.name);
      const status = exists ? '✅ EXISTS' : '❌ MISSING';

      if (exists) {
        existingCount++;
      } else {
        missingCount++;
      }

      console.log(
        `| ${idx.name.padEnd(36)} | ${idx.table.padEnd(18)} | ${status} |`
      );
    }

    console.log('─'.repeat(80));
    console.log(`\n📈 Summary:`);
    console.log(`   Total Required: ${REQUIRED_INDEXES.length}`);
    console.log(`   ✅ Existing: ${existingCount}`);
    console.log(`   ❌ Missing: ${missingCount}\n`);

    if (missingCount > 0) {
      console.log('⚠️  Some indexes are missing. Run init-db.sql to create them.');
      process.exit(1);
    } else {
      console.log('🎉 All required indexes exist! Database is optimized.\n');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error verifying indexes:', error.message);
    process.exit(1);
  }
}

verifyIndexes();
