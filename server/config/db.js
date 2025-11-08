require('dotenv').config();
const { Pool } = require('pg');

// Database Configuration
// Priority: DATABASE_URL (Railway/Production) > Individual env vars (Local development)
let poolConfig;

if (process.env.DATABASE_URL) {
  // Railway/Production: Use DATABASE_URL
  if (process.env.NODE_ENV === 'development') {
    console.log('📦 Using DATABASE_URL for database connection');
  }
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 20, // Maximum number of clients in the pool
    min: 2, // Minimum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 10000, // Return error after 10 seconds if connection not acquired
    maxUses: 7500 // Close and replace connection after 7500 uses
  };
} else {
  // Local development: Use individual env vars
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Using individual env vars for database connection');
  }
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'toosila',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 10, // Lower for local development
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    maxUses: 7500
  };
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Connecting to:', {
      host: poolConfig.host,
      port: poolConfig.port,
      database: poolConfig.database,
      user: poolConfig.user
    });
  }
}

const pool = new Pool(poolConfig);

// Test database connection
pool.on('connect', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Connected to PostgreSQL database');
  }
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
  // Don't exit the process, just log the error
  // process.exit(-1);
});

// Monitor pool health
pool.on('acquire', () => {
  if (process.env.NODE_ENV === 'development') {
    const totalCount = pool.totalCount;
    const idleCount = pool.idleCount;
    const waitingCount = pool.waitingCount;
    if (totalCount >= poolConfig.max * 0.8) {
      console.warn(`⚠️ Pool usage high: ${totalCount}/${poolConfig.max} connections (idle: ${idleCount}, waiting: ${waitingCount})`);
    }
  }
});

pool.on('remove', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`ℹ️ Client removed from pool (total: ${pool.totalCount})`);
  }
});

// Helper function to execute queries
const query = async (text, params) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Helper function to get a client from the pool
const getClient = async () => {
  return await pool.connect();
};

module.exports = {
  pool,
  query,
  getClient
};

