require('dotenv').config();

const config = {
  // Server configuration
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database configuration
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'toosila',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',
  DB_SSL: process.env.DB_SSL === 'true',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  
  // Frontend configuration
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001',
  // Parse CORS_ORIGIN as array for dynamic origin matching
  corsOrigins: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : (process.env.NODE_ENV === 'production'
        ? ['https://toosila-frontend-production.up.railway.app']
        : ['http://localhost:3000']),
  
  // Email configuration
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@toosila.com',
  
  // File upload configuration
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '10mb',
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  
  // Rate limiting
  // Increased to 500 requests per 15 minutes to handle multiple concurrent API calls per user
  // Each page load triggers 5-10 requests (offers, messages, notifications, bookings, etc.)
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || 500,
  
  // Pagination
  DEFAULT_PAGE_SIZE: process.env.DEFAULT_PAGE_SIZE || 10,
  MAX_PAGE_SIZE: process.env.MAX_PAGE_SIZE || 100,
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];

if (config.NODE_ENV === 'production') {
  requiredEnvVars.push('DB_PASSWORD', 'JWT_REFRESH_SECRET', 'CORS_ORIGIN', 'FRONTEND_URL');
}

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// SECURITY: Validate JWT secrets strength in production
if (config.NODE_ENV === 'production') {
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

module.exports = config;
