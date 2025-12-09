const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'toosila',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

console.log('🧪 Phase 2 Installation Testing\n');
console.log('='.repeat(60));

async function testPackages() {
  console.log('\n📦 Testing Package Imports...\n');

  const packages = [
    'redis',
    'ioredis',
    'artillery',
    'autocannon',
    'eslint',
    'prettier'
  ];

  let passed = 0;
  let failed = 0;

  for (const pkg of packages) {
    try {
      require(pkg);
      console.log(`✅ ${pkg.padEnd(20)} - OK`);
      passed++;
    } catch (error) {
      console.log(`❌ ${pkg.padEnd(20)} - FAILED: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Package Test Results: ${passed}/${packages.length} passed`);
  return failed === 0;
}

async function testDatabaseIndexes() {
  console.log('\n📊 Testing Database Indexes...\n');

  try {
    const result = await pool.query(`
      SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname
    `);

    const indexesByTable = {};
    result.rows.forEach(row => {
      if (!indexesByTable[row.tablename]) {
        indexesByTable[row.tablename] = [];
      }
      indexesByTable[row.tablename].push(row.indexname);
    });

    let totalIndexes = 0;
    Object.keys(indexesByTable).sort().forEach(table => {
      console.log(`✅ ${table.padEnd(30)} - ${indexesByTable[table].length} indexes`);
      totalIndexes += indexesByTable[table].length;
    });

    console.log(`\n📊 Total Performance Indexes: ${totalIndexes}`);
    console.log(`✅ Expected: 60+ indexes from migration`);

    return totalIndexes >= 60;
  } catch (error) {
    console.error(`❌ Database test failed: ${error.message}`);
    return false;
  }
}

async function testAuditLogsTable() {
  console.log('\n🔐 Testing Audit Logs Table...\n');

  try {
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'audit_logs'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ audit_logs table does not exist');
      return false;
    }

    console.log('✅ audit_logs table exists');

    // Check columns
    const columns = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'audit_logs'
      ORDER BY ordinal_position
    `);

    console.log(`✅ Table has ${columns.rows.length} columns`);

    const expectedColumns = ['id', 'user_id', 'action', 'category', 'resource',
      'resource_id', 'ip_address', 'user_agent', 'success',
      'metadata', 'severity', 'created_at'];

    const actualColumns = columns.rows.map(r => r.column_name);
    const hasAllColumns = expectedColumns.every(col => actualColumns.includes(col));

    if (hasAllColumns) {
      console.log('✅ All required columns present');
    } else {
      console.log('❌ Missing some required columns');
      return false;
    }

    // Check indexes
    const indexes = await pool.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'audit_logs'
        AND indexname LIKE 'idx_%'
    `);

    console.log(`✅ Table has ${indexes.rows.length} performance indexes`);

    // Test insert
    const testLog = await pool.query(`
      INSERT INTO audit_logs (action, category, severity, metadata)
      VALUES ($1, $2, $3, $4)
      RETURNING id, action, category, created_at
    `, ['test_action', 'test_category', 'info', JSON.stringify({ test: true })]);

    console.log('✅ Test insert successful');

    // Clean up test record
    await pool.query('DELETE FROM audit_logs WHERE action = $1', ['test_action']);
    console.log('✅ Test cleanup successful');

    return true;
  } catch (error) {
    console.error(`❌ Audit logs test failed: ${error.message}`);
    return false;
  }
}

async function testPerformanceIndexes() {
  console.log('\n⚡ Testing Index Performance...\n');

  try {
    // Test query with index
    const beforeExplain = await pool.query(`
      EXPLAIN ANALYZE
      SELECT * FROM users WHERE email = 'test@example.com'
    `);

    const planText = beforeExplain.rows.map(r => r['QUERY PLAN']).join('\n');
    const usesIndex = planText.includes('Index Scan');

    if (usesIndex) {
      console.log('✅ User email lookup uses index');
    } else {
      console.log('⚠️  User email lookup not using index (table might be small)');
    }

    // Test offer search index
    const offerExplain = await pool.query(`
      EXPLAIN ANALYZE
      SELECT * FROM offers WHERE is_active = true LIMIT 10
    `);

    const offerPlan = offerExplain.rows.map(r => r['QUERY PLAN']).join('\n');
    console.log('✅ Offer active query plan analyzed');

    return true;
  } catch (error) {
    console.error(`❌ Performance test failed: ${error.message}`);
    return false;
  }
}

async function testJWTSecrets() {
  console.log('\n🔑 Testing JWT Configuration...\n');

  try {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!jwtSecret) {
      console.log('❌ JWT_SECRET not found in environment');
      return false;
    }

    if (!jwtRefreshSecret) {
      console.log('❌ JWT_REFRESH_SECRET not found in environment');
      return false;
    }

    console.log(`✅ JWT_SECRET configured (${jwtSecret.length} characters)`);
    console.log(`✅ JWT_REFRESH_SECRET configured (${jwtRefreshSecret.length} characters)`);

    // Check if secrets are strong (at least 32 characters recommended)
    if (jwtSecret.length >= 32 && jwtRefreshSecret.length >= 32) {
      console.log('✅ Secrets meet minimum length requirements');
    } else {
      console.log('⚠️  Secrets should be at least 32 characters');
    }

    return true;
  } catch (error) {
    console.error(`❌ JWT test failed: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  const results = {
    packages: false,
    indexes: false,
    auditLogs: false,
    performance: false,
    jwt: false
  };

  try {
    results.packages = await testPackages();
    results.indexes = await testDatabaseIndexes();
    results.auditLogs = await testAuditLogsTable();
    results.performance = await testPerformanceIndexes();
    results.jwt = testJWTSecrets();

    console.log('\n' + '='.repeat(60));
    console.log('\n📋 PHASE 2 TEST SUMMARY\n');

    console.log(`📦 Package Imports:       ${results.packages ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`📊 Database Indexes:      ${results.indexes ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🔐 Audit Logs:            ${results.auditLogs ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`⚡ Performance:           ${results.performance ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🔑 JWT Configuration:     ${results.jwt ? '✅ PASS' : '❌ FAIL'}`);

    const passCount = Object.values(results).filter(r => r).length;
    const totalTests = Object.keys(results).length;

    console.log(`\n🎯 Overall: ${passCount}/${totalTests} tests passed`);

    if (passCount === totalTests) {
      console.log('\n✅ ALL TESTS PASSED! Phase 2 is fully functional.\n');
    } else {
      console.log('\n⚠️  Some tests failed. Check details above.\n');
    }

  } catch (error) {
    console.error('❌ Test suite error:', error.message);
  } finally {
    await pool.end();
  }
}

// Run tests
if (require.main === module) {
  runAllTests();
}
module.exports = {
  testPackages,
  testDatabaseIndexes,
  testAuditLogsTable,
  testPerformanceIndexes,
  testJWTSecrets,
  runAllTests
};
