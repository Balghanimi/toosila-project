/**
 * Script to set a user as admin
 * Usage: node scripts/set-admin.js <email_or_phone>
 *
 * Examples:
 *   node scripts/set-admin.js admin@toosila.com
 *   node scripts/set-admin.js 07701234567
 */

require('dotenv').config();
const { query, pool } = require('../config/db');

async function setAdmin() {
  const identifier = process.argv[2];

  if (!identifier) {
    console.log('Usage: node scripts/set-admin.js <email_or_phone>');
    console.log('Example: node scripts/set-admin.js admin@toosila.com');
    process.exit(1);
  }

  try {
    // Try to find user by email or phone
    const result = await query(
      `UPDATE users
       SET role = 'admin'
       WHERE email = $1 OR phone = $1
       RETURNING id, name, email, phone, role`,
      [identifier]
    );

    if (result.rows.length === 0) {
      console.error(`No user found with email/phone: ${identifier}`);

      // Show available users
      const users = await query(
        `SELECT id, name, email, phone, role FROM users ORDER BY created_at DESC LIMIT 10`
      );

      console.log('\nAvailable users:');
      users.rows.forEach(u => {
        console.log(`  - ${u.name} (${u.email || u.phone}) - role: ${u.role}`);
      });

      process.exit(1);
    }

    const user = result.rows[0];
    console.log(`\nSuccess! User set as admin:`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email || 'N/A'}`);
    console.log(`  Phone: ${user.phone || 'N/A'}`);
    console.log(`  Role: ${user.role}`);
    console.log(`\nThis user can now access /lines and other admin features.`);
    console.log(`Note: User may need to log out and log back in to see changes.`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setAdmin();
