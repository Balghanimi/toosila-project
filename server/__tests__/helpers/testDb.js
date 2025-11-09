/**
 * Test Database Helpers
 * Provides utilities for database setup, teardown, and cleanup during testing
 */

const { query, pool } = require('../../config/db');

/**
 * Clean all test data from the database
 * Useful for beforeEach/afterEach hooks to ensure test isolation
 */
const cleanDatabase = async () => {
  try {
    // Order matters due to foreign key constraints
    // Delete in reverse order of dependencies
    await query('DELETE FROM ratings');
    await query('DELETE FROM messages');
    await query('DELETE FROM bookings');
    await query('DELETE FROM demand_responses');
    await query('DELETE FROM demands');
    await query('DELETE FROM offers');
    await query('DELETE FROM verification_documents');
    await query('DELETE FROM notifications');
    await query('DELETE FROM users WHERE email LIKE \'%@test.com\'');
  } catch (error) {
    console.error('Error cleaning database:', error);
    throw error;
  }
};

/**
 * Truncate all tables (more aggressive cleanup)
 * Use with caution - this removes ALL data
 */
const truncateAllTables = async () => {
  try {
    await query(`
      TRUNCATE TABLE
        ratings,
        messages,
        bookings,
        demand_responses,
        demands,
        offers,
        verification_documents,
        notifications,
        users
      RESTART IDENTITY CASCADE
    `);
  } catch (error) {
    console.error('Error truncating tables:', error);
    throw error;
  }
};

/**
 * Create a test database transaction
 * Allows tests to run in isolation and rollback changes
 */
const createTransaction = async () => {
  const client = await pool.connect();
  await client.query('BEGIN');
  return client;
};

/**
 * Rollback a transaction
 */
const rollbackTransaction = async (client) => {
  await client.query('ROLLBACK');
  client.release();
};

/**
 * Commit a transaction
 */
const commitTransaction = async (client) => {
  await client.query('COMMIT');
  client.release();
};

/**
 * Close all database connections
 * Should be called in afterAll hook
 */
const closeDatabase = async () => {
  await pool.end();
};

/**
 * Check if a table exists
 */
const tableExists = async (tableName) => {
  const result = await query(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = $1
    )`,
    [tableName]
  );
  return result.rows[0].exists;
};

/**
 * Get row count for a table
 */
const getRowCount = async (tableName) => {
  const result = await query(`SELECT COUNT(*) FROM ${tableName}`);
  return parseInt(result.rows[0].count);
};

module.exports = {
  cleanDatabase,
  truncateAllTables,
  createTransaction,
  rollbackTransaction,
  commitTransaction,
  closeDatabase,
  tableExists,
  getRowCount,
  query
};
