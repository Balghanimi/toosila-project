// SECURITY: JWT Secret Validation for Production
// This code should be inserted before module.exports = config;

if (typeof config !== 'undefined' && config && config.NODE_ENV === 'production') {
  const MIN_SECRET_LENGTH = 32;

  // Check JWT_SECRET strength
  if (!config.JWT_SECRET || config.JWT_SECRET.length < MIN_SECRET_LENGTH) {
    console.error('❌ SECURITY ERROR: JWT_SECRET must be at least 32 characters in production');
    console.error('   Current length:', config.JWT_SECRET ? config.JWT_SECRET.length : 0);
    console.error('   Generate a strong secret using: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    process.exit(1);
  }

  // Check JWT_REFRESH_SECRET strength
  if (!config.JWT_REFRESH_SECRET || config.JWT_REFRESH_SECRET.length < MIN_SECRET_LENGTH) {
    console.error('❌ SECURITY ERROR: JWT_REFRESH_SECRET must be at least 32 characters in production');
    console.error('   Current length:', config.JWT_REFRESH_SECRET ? config.JWT_REFRESH_SECRET.length : 0);
    console.error('   Generate a strong secret using: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    process.exit(1);
  }

  // Prevent use of default/example secrets
  const dangerousDefaults = [
    'your-super-secret-jwt-key-change-in-production',
    'your-refresh-secret-key',
    'change-me',
    'secret',
    'password',
    '12345678',
    'jwt-secret'
  ];

  const lowerJwtSecret = config.JWT_SECRET.toLowerCase();
  const lowerRefreshSecret = config.JWT_REFRESH_SECRET.toLowerCase();

  if (dangerousDefaults.some(def => lowerJwtSecret.includes(def))) {
    console.error('❌ SECURITY ERROR: JWT_SECRET contains default/weak value');
    console.error('   Please use a cryptographically random secret');
    console.error('   Generate using: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    process.exit(1);
  }

  if (dangerousDefaults.some(def => lowerRefreshSecret.includes(def))) {
    console.error('❌ SECURITY ERROR: JWT_REFRESH_SECRET contains default/weak value');
    console.error('   Please use a cryptographically random secret');
    console.error('   Generate using: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    process.exit(1);
  }

  console.log('✅ JWT secrets validated - length and strength requirements met');
}
