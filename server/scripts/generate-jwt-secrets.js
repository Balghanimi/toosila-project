#!/usr/bin/env node
/**
 * Generate Strong JWT Secrets
 * Creates cryptographically secure random secrets for JWT tokens
 *
 * Usage: node server/scripts/generate-jwt-secrets.js
 */

const crypto = require('crypto');

console.log('\n🔐 Generating Strong JWT Secrets...\n');
console.log('═'.repeat(60));

// Generate JWT_SECRET
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('\nJWT_SECRET (Access Token):');
console.log(jwtSecret);
console.log(`Length: ${jwtSecret.length} characters ✅`);

// Generate JWT_REFRESH_SECRET
const jwtRefreshSecret = crypto.randomBytes(32).toString('hex');
console.log('\nJWT_REFRESH_SECRET (Refresh Token):');
console.log(jwtRefreshSecret);
console.log(`Length: ${jwtRefreshSecret.length} characters ✅`);

console.log('\n' + '═'.repeat(60));
console.log('\n📝 Add these to your .env file:\n');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);

console.log('\n⚠️  SECURITY WARNINGS:');
console.log('  • Never commit these secrets to git');
console.log('  • Use different secrets for dev/staging/production');
console.log('  • Store production secrets in secure environment variables');
console.log('  • Rotate secrets periodically (every 90 days recommended)');
console.log('\n');
