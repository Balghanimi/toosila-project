/**
 * Script to set admin role for a user
 * Usage: node scripts/set-admin-role.js <email>
 * Example: node scripts/set-admin-role.js admin@toosila.com
 */

require('dotenv').config();
const pool = require('../config/db');

async function setAdminRole(email) {
  if (!email) {
    console.error('❌ Error: Email address is required');
    console.log('Usage: node scripts/set-admin-role.js <email>');
    console.log('Example: node scripts/set-admin-role.js admin@toosila.com');
    process.exit(1);
  }

  try {
    console.log(`🔍 Looking for user with email: ${email}`);

    // Check if user exists
    const checkResult = await pool.query(
      'SELECT id, name, email, role FROM users WHERE email = $1',
      [email]
    );

    if (checkResult.rows.length === 0) {
      console.error(`❌ Error: No user found with email: ${email}`);
      console.log('\n💡 Available users:');
      const allUsers = await pool.query('SELECT id, name, email, role FROM users LIMIT 10');
      console.table(allUsers.rows);
      process.exit(1);
    }

    const user = checkResult.rows[0];
    console.log('\n📋 Current user details:');
    console.table([user]);

    if (user.role === 'admin') {
      console.log('✅ User already has admin role!');
      process.exit(0);
    }

    // Update user role to admin
    console.log('\n🔄 Updating user role to admin...');
    await pool.query('UPDATE users SET role = $1 WHERE email = $2', ['admin', email]);

    // Verify the update
    const verifyResult = await pool.query(
      'SELECT id, name, email, role FROM users WHERE email = $1',
      [email]
    );

    console.log('\n✅ Admin role set successfully!');
    console.log('📋 Updated user details:');
    console.table(verifyResult.rows);

    console.log('\n🎉 Done! User can now access admin panel at:');
    console.log('   https://your-app.railway.app/admin');
    console.log('\n💡 Make sure to log out and log back in for changes to take effect.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting admin role:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];
setAdminRole(email);
