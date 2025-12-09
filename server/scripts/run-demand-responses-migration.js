#!/usr/bin/env node

/**
 * Migration Script: إنشاء جدول demand_responses
 * يقوم بتشغيل ملف SQL migration لإنشاء جدول الردود على الطلبات
 *
 * الاستخدام:
 * - محلياً: node server/scripts/run-demand-responses-migration.js
 * - على Railway: railway run node server/scripts/run-demand-responses-migration.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  // جلب DATABASE_URL من متغيرات البيئة
  const databaseUrl = process.env.DATABASE_PUBLIC_URL ||
                      process.env.DATABASE_URL ||
                      process.env.DATABASE_PRIVATE_URL;

  if (!databaseUrl) {
    console.error('❌ خطأ: DATABASE_URL غير موجود في متغيرات البيئة');
    console.log('يرجى تشغيل الأمر باستخدام: railway run node server/scripts/run-demand-responses-migration.js');
    process.exit(1);
  }

  console.log('🔗 الاتصال بقاعدة البيانات...');
  console.log('   URL:', databaseUrl.replace(/:[^:]*@/, ':****@'));

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // الاتصال بقاعدة البيانات
    await client.connect();
    console.log('✅ تم الاتصال بنجاح!\n');

    // قراءة ملف SQL
    const sqlFile = path.join(__dirname, '../migrations/004_create_demand_responses.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📝 تنفيذ migration: 004_create_demand_responses.sql\n');

    // تنفيذ SQL
    await client.query(sql);

    console.log('✅ تم إنشاء جدول demand_responses بنجاح!\n');

    // التحقق من إنشاء الجدول
    console.log('🔍 التحقق من البنية...\n');
    const verifyResult = await client.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'demand_responses'
      ORDER BY ordinal_position;
    `);

    console.log('✅ أعمدة جدول demand_responses:');
    console.log('┌─────────────────────────┬──────────────────┬──────────────┬──────────┐');
    console.log('│ Column Name             │ Data Type        │ Nullable     │ Default  │');
    console.log('├─────────────────────────┼──────────────────┼──────────────┼──────────┤');

    verifyResult.rows.forEach(row => {
      const colName = row.column_name.padEnd(23);
      const dataType = row.data_type.padEnd(16);
      const nullable = row.is_nullable.padEnd(12);
      const colDefault = (row.column_default || '-').substring(0, 8);
      console.log(`│ ${colName} │ ${dataType} │ ${nullable} │ ${colDefault} │`);
    });

    console.log('└─────────────────────────┴──────────────────┴──────────────┴──────────┘\n');

    // التحقق من الفهارس
    const indexesResult = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'demand_responses'
      ORDER BY indexname;
    `);

    console.log('✅ الفهارس (Indexes):');
    indexesResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.indexname}`);
    });

    console.log('\n✅ Migration مكتمل بنجاح! 🎉\n');

  } catch (error) {
    console.error('\n❌ فشل Migration:', error.message);
    console.error('\nتفاصيل الخطأ:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 تم إغلاق الاتصال بقاعدة البيانات\n');
  }
}

// Export function for tests
module.exports = { runMigration };

// CLI interface - only run when executed directly (not when required by tests)
if (require.main === module) {
  runMigration();
}
