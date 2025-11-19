const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const logger = require('../config/logger');

/**
 * @swagger
 * /admin/check-schema:
 *   get:
 *     summary: Check current database schema
 *     description: Inspect ID column types for demands, offers, bookings, and demand_responses tables
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Schema information retrieved successfully
 *       500:
 *         description: Failed to retrieve schema
 */
router.get('/check-schema', async (req, res) => {
  try {
    const tables = ['demands', 'offers', 'bookings', 'demand_responses'];
    const schemas = {};

    for (const table of tables) {
      const result = await pool.query(
        `
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = $1 AND column_name = 'id'
      `,
        [table]
      );

      schemas[table] = result.rows[0] || { error: 'table not found' };
    }

    res.json({ success: true, schemas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /admin/run-migration:
 *   post:
 *     summary: Run database migration 016 (UUID to INTEGER)
 *     description: Executes the migration to convert demands, offers, bookings IDs from UUID to INTEGER
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Migration completed successfully
 *       500:
 *         description: Migration failed
 */
router.post('/run-migration', async (req, res) => {
  const MIGRATION_NAME = '016_convert_ids_to_integer';
  let client;

  try {
    logger.info('🔄 Starting migration via API: Convert UUID IDs to INTEGER');
    console.log('🔄 Starting migration via API');

    const migrationPath = path.join(
      __dirname,
      '../database/migrations/016_convert_ids_to_integer.sql'
    );

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Get a client from the pool
    client = await pool.connect();
    console.log('✅ Connected to database');

    // Check if migration has already been run
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const checkResult = await client.query(
      'SELECT * FROM schema_migrations WHERE migration_name = $1',
      [MIGRATION_NAME]
    );

    if (checkResult.rows.length > 0) {
      const message = `Migration has already been executed on ${checkResult.rows[0].executed_at}`;
      logger.warn(message);
      return res.status(400).json({
        success: false,
        message,
        executedAt: checkResult.rows[0].executed_at,
      });
    }

    // Get counts before migration
    console.log('📊 Counting records before migration...');
    const demandsCount = await client.query('SELECT COUNT(*) FROM demands');
    const offersCount = await client.query('SELECT COUNT(*) FROM offers');
    const bookingsCount = await client.query('SELECT COUNT(*) FROM bookings');
    const demandResponsesCount = await client.query('SELECT COUNT(*) FROM demand_responses');

    const beforeCounts = {
      demands: parseInt(demandsCount.rows[0].count),
      offers: parseInt(offersCount.rows[0].count),
      bookings: parseInt(bookingsCount.rows[0].count),
      demandResponses: parseInt(demandResponsesCount.rows[0].count),
    };

    console.log('Before counts:', beforeCounts);

    // Begin transaction
    console.log('🔒 Starting transaction...');
    await client.query('BEGIN');

    // Execute the migration
    console.log('🚀 Executing migration SQL...');
    await client.query(migrationSQL);

    // Verify counts after migration
    console.log('📊 Verifying record counts after migration...');
    const demandsCountAfter = await client.query('SELECT COUNT(*) FROM demands');
    const offersCountAfter = await client.query('SELECT COUNT(*) FROM offers');
    const bookingsCountAfter = await client.query('SELECT COUNT(*) FROM bookings');
    const demandResponsesCountAfter = await client.query('SELECT COUNT(*) FROM demand_responses');

    const afterCounts = {
      demands: parseInt(demandsCountAfter.rows[0].count),
      offers: parseInt(offersCountAfter.rows[0].count),
      bookings: parseInt(bookingsCountAfter.rows[0].count),
      demandResponses: parseInt(demandResponsesCountAfter.rows[0].count),
    };

    console.log('After counts:', afterCounts);

    // Check if counts match
    const countsMatch =
      beforeCounts.demands === afterCounts.demands &&
      beforeCounts.offers === afterCounts.offers &&
      beforeCounts.bookings === afterCounts.bookings &&
      beforeCounts.demandResponses === afterCounts.demandResponses;

    if (!countsMatch) {
      throw new Error(
        `Record counts do not match! Before: ${JSON.stringify(beforeCounts)}, After: ${JSON.stringify(afterCounts)}`
      );
    }

    // Verify ID types changed
    console.log('🔍 Verifying schema changes...');
    const schemaCheck = await client.query(`
      SELECT
        table_name,
        column_name,
        data_type
      FROM information_schema.columns
      WHERE table_name IN ('demands', 'offers', 'bookings', 'demand_responses')
        AND column_name = 'id'
      ORDER BY table_name
    `);

    const schemaTypes = {};
    schemaCheck.rows.forEach((row) => {
      schemaTypes[row.table_name] = row.data_type;
      console.log(`  - ${row.table_name}.id: ${row.data_type}`);
      if (row.data_type !== 'integer') {
        throw new Error(`${row.table_name}.id is not INTEGER! Found: ${row.data_type}`);
      }
    });

    // Record migration in schema_migrations table
    await client.query('INSERT INTO schema_migrations (migration_name) VALUES ($1)', [
      MIGRATION_NAME,
    ]);

    // Commit transaction
    console.log('✅ Committing transaction...');
    await client.query('COMMIT');

    const successMessage = 'Migration completed successfully!';
    console.log(`🎉 ${successMessage}`);
    logger.info(successMessage, { beforeCounts, afterCounts, schemaTypes });

    res.json({
      success: true,
      message: successMessage,
      details: {
        migrationName: MIGRATION_NAME,
        beforeCounts,
        afterCounts,
        schemaTypes,
        changes: [
          'demands.id: UUID → INTEGER',
          'offers.id: UUID → INTEGER',
          'bookings.id: UUID → INTEGER',
          'bookings.offer_id: UUID → INTEGER',
          'demand_responses.id: UUID → INTEGER',
          'demand_responses.demand_id: UUID → INTEGER',
          'messages.ride_id: UUID → INTEGER',
          'ratings.ride_id: UUID → INTEGER',
        ],
      },
    });
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    logger.error('Migration failed', { error: error.message, stack: error.stack });

    if (client) {
      console.log('🔄 Rolling back transaction...');
      try {
        await client.query('ROLLBACK');
        console.log('✅ Transaction rolled back successfully');
      } catch (rollbackError) {
        console.error('❌ Rollback failed:', rollbackError.message);
        logger.error('Rollback failed', { error: rollbackError.message });
      }
    }

    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Migration failed. Transaction has been rolled back.',
    });
  } finally {
    if (client) {
      client.release();
      console.log('🔌 Database connection released');
    }
  }
});

/**
 * @swagger
 * /admin/migration-status:
 *   get:
 *     summary: Check migration status
 *     description: Check if migration 016 has been executed
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Migration status
 */
router.get('/migration-status', async (req, res) => {
  const MIGRATION_NAME = '016_convert_ids_to_integer';

  try {
    const result = await pool.query(`SELECT * FROM schema_migrations WHERE migration_name = $1`, [
      MIGRATION_NAME,
    ]);

    if (result.rows.length > 0) {
      res.json({
        executed: true,
        executedAt: result.rows[0].executed_at,
        migrationName: MIGRATION_NAME,
      });
    } else {
      res.json({
        executed: false,
        migrationName: MIGRATION_NAME,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;
