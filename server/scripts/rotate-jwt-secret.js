const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * JWT Secret Rotation Script
 * Safely rotates JWT secrets while maintaining backward compatibility
 *
 * Usage: node scripts/rotate-jwt-secret.js
 */

const envPath = path.join(__dirname, '../.env');

/**
 * Generate a cryptographically secure random secret
 */
const generateSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Read current .env file
 */
const readEnvFile = () => {
  try {
    return fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    console.error('Error reading .env file:', error.message);
    process.exit(1);
  }
};

/**
 * Write updated .env file
 */
const writeEnvFile = (content) => {
  try {
    // Create backup first
    const backupPath = `${envPath}.backup.${Date.now()}`;
    fs.copyFileSync(envPath, backupPath);
    console.log(`Backup created: ${backupPath}`);

    // Write new content
    fs.writeFileSync(envPath, content, 'utf8');
    console.log('Environment file updated successfully');
  } catch (error) {
    console.error('Error writing .env file:', error.message);
    process.exit(1);
  }
};

/**
 * Update or add environment variable
 */
const updateEnvVariable = (content, key, value) => {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  } else {
    return content + `\n${key}=${value}`;
  }
};

/**
 * Main rotation function
 */
const rotateSecrets = () => {
  console.log('Starting JWT secret rotation...\n');

  // Read current .env
  let envContent = readEnvFile();

  // Extract current secrets
  const currentJwtSecret = envContent.match(/^JWT_SECRET=(.*)$/m)?.[1];
  const currentRefreshSecret = envContent.match(/^JWT_REFRESH_SECRET=(.*)$/m)?.[1];

  if (!currentJwtSecret || !currentRefreshSecret) {
    console.error('Current secrets not found in .env file');
    process.exit(1);
  }

  console.log('Current secrets found');
  console.log(`JWT_SECRET: ${currentJwtSecret.substring(0, 10)}...`);
  console.log(`JWT_REFRESH_SECRET: ${currentRefreshSecret.substring(0, 10)}...\n`);

  // Generate new secrets
  const newJwtSecret = generateSecret();
  const newRefreshSecret = generateSecret();

  console.log('New secrets generated');
  console.log(`New JWT_SECRET: ${newJwtSecret.substring(0, 10)}...`);
  console.log(`New JWT_REFRESH_SECRET: ${newRefreshSecret.substring(0, 10)}...\n`);

  // Store old secrets for graceful transition
  envContent = updateEnvVariable(envContent, 'JWT_SECRET_OLD', currentJwtSecret);
  envContent = updateEnvVariable(envContent, 'JWT_REFRESH_SECRET_OLD', currentRefreshSecret);

  // Update to new secrets
  envContent = updateEnvVariable(envContent, 'JWT_SECRET', newJwtSecret);
  envContent = updateEnvVariable(envContent, 'JWT_REFRESH_SECRET', newRefreshSecret);

  // Add rotation timestamp
  envContent = updateEnvVariable(envContent, 'JWT_SECRET_ROTATED_AT', new Date().toISOString());

  // Write updated .env
  writeEnvFile(envContent);

  console.log('\nJWT secrets rotated successfully!');
  console.log('\nIMPORTANT NEXT STEPS:');
  console.log('1. Update the auth middleware to accept both old and new secrets during transition');
  console.log('2. Deploy the changes to production');
  console.log('3. Wait for all old tokens to expire (typically 7 days)');
  console.log('4. Remove the old secrets from .env file');
  console.log('\nGraceful transition period: Keep old secrets for at least JWT_EXPIRES_IN duration');
};

/**
 * Validate that secrets meet requirements
 */
const validateSecrets = () => {
  const envContent = readEnvFile();
  const jwtSecret = envContent.match(/^JWT_SECRET=(.*)$/m)?.[1];
  const refreshSecret = envContent.match(/^JWT_REFRESH_SECRET=(.*)$/m)?.[1];

  console.log('\nValidating JWT secrets...\n');

  const issues = [];

  // Check JWT_SECRET
  if (!jwtSecret) {
    issues.push('JWT_SECRET is missing');
  } else if (jwtSecret.length < 32) {
    issues.push(`JWT_SECRET is too short (${jwtSecret.length} chars, minimum 32)`);
  } else if (jwtSecret === 'your-super-secret-jwt-key-change-in-production') {
    issues.push('JWT_SECRET is using default value - SECURITY RISK!');
  }

  // Check JWT_REFRESH_SECRET
  if (!refreshSecret) {
    issues.push('JWT_REFRESH_SECRET is missing');
  } else if (refreshSecret.length < 32) {
    issues.push(`JWT_REFRESH_SECRET is too short (${refreshSecret.length} chars, minimum 32)`);
  } else if (refreshSecret === 'your-refresh-secret-key') {
    issues.push('JWT_REFRESH_SECRET is using default value - SECURITY RISK!');
  }

  if (issues.length > 0) {
    console.log('SECURITY ISSUES FOUND:');
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
    console.log('\nRun rotation to fix these issues.');
    return false;
  }

  console.log('✓ JWT_SECRET: OK');
  console.log('✓ JWT_REFRESH_SECRET: OK');
  console.log('\nAll secrets meet security requirements!');
  return true;
};

/**
 * Generate new secrets without rotating (for initial setup)
 */
const generateSecrets = () => {
  console.log('\nGenerating new JWT secrets...\n');

  const jwtSecret = generateSecret();
  const refreshSecret = generateSecret();

  console.log('Add these to your .env file:\n');
  console.log(`JWT_SECRET=${jwtSecret}`);
  console.log(`JWT_REFRESH_SECRET=${refreshSecret}`);
  console.log('\nSecrets generated successfully!');
};

// Export functions for tests and programmatic use
module.exports = {
  rotateSecrets,
  validateSecrets,
  generateSecrets
};

// CLI interface - only run when executed directly (not when required by tests)
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'rotate':
      rotateSecrets();
      break;
    case 'validate':
      validateSecrets();
      break;
    case 'generate':
      generateSecrets();
      break;
    default:
      console.log('JWT Secret Management Tool\n');
      console.log('Usage:');
      console.log('  node scripts/rotate-jwt-secret.js rotate    - Rotate existing secrets');
      console.log('  node scripts/rotate-jwt-secret.js validate  - Validate current secrets');
      console.log('  node scripts/rotate-jwt-secret.js generate  - Generate new secrets\n');
      process.exit(1);
  }
}
