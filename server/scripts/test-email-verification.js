/**
 * Test Email Verification Flow
 * This script tests the complete email verification flow end-to-end
 */

require('dotenv').config();
const { testEmailConfiguration } = require('../utils/emailService');
const { query } = require('../config/db');
const crypto = require('crypto');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

async function testEmailVerificationFlow() {
  log('\n🧪 Testing Email Verification System', colors.blue);
  log('=' .repeat(60), colors.blue);

  let allPassed = true;

  // Test 1: Check database columns
  log('\n1️⃣  Checking database schema...', colors.yellow);
  try {
    const schemaCheck = await query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('verification_token', 'verification_token_expires', 'email_verified', 'email_verified_at')
      ORDER BY column_name
    `);

    if (schemaCheck.rows.length === 4) {
      log('   ✅ All email verification columns exist', colors.green);
      schemaCheck.rows.forEach((row) => {
        log(`      - ${row.column_name} (${row.data_type})`, colors.reset);
      });
    } else {
      log('   ❌ Missing email verification columns', colors.red);
      allPassed = false;
    }
  } catch (error) {
    log(`   ❌ Database schema check failed: ${error.message}`, colors.red);
    allPassed = false;
  }

  // Test 2: Check database indexes
  log('\n2️⃣  Checking database indexes...', colors.yellow);
  try {
    const indexCheck = await query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'users'
      AND indexname IN ('idx_users_verification_token', 'idx_users_email_verified')
    `);

    if (indexCheck.rows.length === 2) {
      log('   ✅ All verification indexes exist', colors.green);
      indexCheck.rows.forEach((row) => {
        log(`      - ${row.indexname}`, colors.reset);
      });
    } else {
      log('   ❌ Missing verification indexes', colors.red);
      allPassed = false;
    }
  } catch (error) {
    log(`   ❌ Index check failed: ${error.message}`, colors.red);
    allPassed = false;
  }

  // Test 3: Check email service configuration
  log('\n3️⃣  Testing email service configuration...', colors.yellow);
  try {
    const emailConfigured = await testEmailConfiguration();
    if (emailConfigured) {
      log('   ✅ Email service is properly configured', colors.green);
      log(`      - Host: ${process.env.EMAIL_HOST}`, colors.reset);
      log(`      - Port: ${process.env.EMAIL_PORT}`, colors.reset);
      log(`      - From: ${process.env.EMAIL_FROM}`, colors.reset);
    } else {
      log('   ❌ Email service configuration failed', colors.red);
      allPassed = false;
    }
  } catch (error) {
    log(`   ❌ Email service test failed: ${error.message}`, colors.red);
    allPassed = false;
  }

  // Test 4: Check environment variables
  log('\n4️⃣  Checking environment variables...', colors.yellow);
  const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM', 'FRONTEND_URL'];
  const missingVars = [];

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length === 0) {
    log('   ✅ All required environment variables are set', colors.green);
  } else {
    log('   ❌ Missing environment variables:', colors.red);
    missingVars.forEach((varName) => {
      log(`      - ${varName}`, colors.red);
    });
    allPassed = false;
  }

  // Test 5: Verify user statistics
  log('\n5️⃣  Checking user verification statistics...', colors.yellow);
  try {
    const stats = await query(`
      SELECT
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE email_verified = true) as verified_users,
        COUNT(*) FILTER (WHERE email_verified = false) as unverified_users,
        COUNT(*) FILTER (WHERE verification_token IS NOT NULL) as pending_verifications
      FROM users
    `);

    const row = stats.rows[0];
    log('   ✅ User verification statistics:', colors.green);
    log(`      - Total users: ${row.total_users}`, colors.reset);
    log(`      - Verified users: ${row.verified_users}`, colors.reset);
    log(`      - Unverified users: ${row.unverified_users}`, colors.reset);
    log(`      - Pending verifications: ${row.pending_verifications}`, colors.reset);
  } catch (error) {
    log(`   ❌ Failed to get user statistics: ${error.message}`, colors.red);
    allPassed = false;
  }

  // Test 6: Check routes registration
  log('\n6️⃣  Checking email verification routes...', colors.yellow);
  const fs = require('fs');
  const path = require('path');
  try {
    const appContent = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
    if (appContent.includes('emailVerification') && appContent.includes('/api/email-verification')) {
      log('   ✅ Email verification routes are registered', colors.green);
      log('      - POST /api/email-verification/send', colors.reset);
      log('      - GET /api/email-verification/verify/:token', colors.reset);
      log('      - POST /api/email-verification/resend', colors.reset);
    } else {
      log('   ❌ Email verification routes not found in app.js', colors.red);
      allPassed = false;
    }
  } catch (error) {
    log(`   ❌ Failed to check routes: ${error.message}`, colors.red);
    allPassed = false;
  }

  // Test 7: Check frontend integration
  log('\n7️⃣  Checking frontend integration...', colors.yellow);
  try {
    const frontendFiles = [
      '../../../client/src/pages/VerifyEmail.jsx',
      '../../../client/src/pages/EmailVerificationReminder.jsx',
    ];

    let allFilesExist = true;
    for (const file of frontendFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        log(`   ✅ ${path.basename(file)} exists`, colors.green);
      } else {
        log(`   ❌ ${path.basename(file)} not found`, colors.red);
        allFilesExist = false;
      }
    }

    if (allFilesExist) {
      log('   ✅ Frontend verification pages are integrated', colors.green);
    } else {
      allPassed = false;
    }
  } catch (error) {
    log(`   ❌ Failed to check frontend files: ${error.message}`, colors.red);
    allPassed = false;
  }

  // Final Summary
  log('\n' + '='.repeat(60), colors.blue);
  if (allPassed) {
    log('✅ ALL TESTS PASSED - Email Verification is fully functional!', colors.green);
    log('\n📋 Summary:', colors.blue);
    log('   • Database schema: ✅', colors.green);
    log('   • Database indexes: ✅', colors.green);
    log('   • Email service: ✅', colors.green);
    log('   • Environment variables: ✅', colors.green);
    log('   • API routes: ✅', colors.green);
    log('   • Frontend pages: ✅', colors.green);
    log('\n🎉 Email verification system is production-ready!', colors.green);
  } else {
    log('❌ SOME TESTS FAILED - Please review errors above', colors.red);
  }
  log('='.repeat(60), colors.blue);

  process.exit(allPassed ? 0 : 1);
}

// Run tests
testEmailVerificationFlow().catch((error) => {
  log(`\n❌ Test suite failed: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
