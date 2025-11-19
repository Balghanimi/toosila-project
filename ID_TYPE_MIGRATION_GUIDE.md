# ID Type Migration Guide: UUID → INTEGER

## Overview

This migration converts the ID fields for `demands`, `offers`, `bookings`, and `demand_responses` tables from UUID to INTEGER (SERIAL) type. This fixes the "invalid input syntax for type uuid: 79312398" error and improves query performance.

## What Changed

### Database Schema Changes

**Before:**

```sql
demands.id: UUID
offers.id: UUID
bookings.id: UUID
bookings.offer_id: UUID
demand_responses.id: UUID
demand_responses.demand_id: UUID
messages.ride_id: UUID
ratings.ride_id: UUID
```

**After:**

```sql
demands.id: INTEGER (SERIAL)
offers.id: INTEGER (SERIAL)
bookings.id: INTEGER (SERIAL)
bookings.offer_id: INTEGER
demand_responses.id: INTEGER (SERIAL)
demand_responses.demand_id: INTEGER
messages.ride_id: INTEGER
ratings.ride_id: INTEGER
```

### Code Changes

1. **Validation Middleware** (`server/middlewares/validate.js`)
   - `validateId`: Changed from `isUUID()` to `isInt({ min: 1 })`
   - `validateBookingCreation`: Changed `offerId` validation from custom UUID check to `isInt({ min: 1 })`

2. **Database Schema** (`server/scripts/init-db.sql`)
   - Updated CREATE TABLE statements to use SERIAL instead of UUID
   - Updated foreign key references to use INTEGER

3. **Models** (no changes needed)
   - `demands.model.js`: Already uses INTEGER logic
   - `offers.model.js`: Already uses INTEGER logic
   - `bookings.model.js`: Already uses INTEGER logic
   - `demand_responses.model.js`: Already uses INTEGER logic

## Migration Process

### Prerequisites

⚠️ **IMPORTANT: Backup your database before running this migration!**

```bash
# Using Railway CLI
railway run pg_dump $DATABASE_URL > backup_before_migration.sql

# Or using psql
pg_dump $DATABASE_URL > backup_before_migration.sql
```

### Running the Migration

**Option 1: Using the migration script (Recommended)**

```bash
# Local development
cd server
node scripts/run-migration-016.js

# Production (Railway)
railway run node server/scripts/run-migration-016.js
```

**Option 2: Running SQL directly**

```bash
# Using Railway CLI
railway run psql $DATABASE_URL < server/database/migrations/016_convert_ids_to_integer.sql

# Or using psql
psql $DATABASE_URL -f server/database/migrations/016_convert_ids_to_integer.sql
```

### Verification

After running the migration, verify the changes:

```sql
-- Check ID column types
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('demands', 'offers', 'bookings', 'demand_responses')
  AND column_name IN ('id', 'offer_id', 'demand_id')
ORDER BY table_name, column_name;

-- Verify record counts
SELECT
  (SELECT COUNT(*) FROM demands) as demands_count,
  (SELECT COUNT(*) FROM offers) as offers_count,
  (SELECT COUNT(*) FROM bookings) as bookings_count,
  (SELECT COUNT(*) FROM demand_responses) as demand_responses_count;

-- Test a sample query
SELECT * FROM demands LIMIT 5;
SELECT * FROM offers LIMIT 5;
SELECT * FROM bookings LIMIT 5;
```

## API Impact

### Before Migration

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "fromCity": "Baghdad",
  "toCity": "Erbil"
}
```

### After Migration

```json
{
  "id": 1,
  "fromCity": "Baghdad",
  "toCity": "Erbil"
}
```

### Frontend Changes Needed

If your frontend was expecting UUID strings, you may need to update:

1. **API Calls**: Accept integer IDs instead of UUIDs
2. **Validation**: Update ID validation to check for integers
3. **URL Parameters**: Integer IDs in routes like `/demands/:id`

## Rollback Plan

If you need to rollback the migration:

1. Stop the application
2. Restore from backup:
   ```bash
   railway run psql $DATABASE_URL < backup_before_migration.sql
   ```
3. Revert code changes:
   ```bash
   git revert <commit-hash>
   ```

## Testing Checklist

After migration, test the following:

- [ ] Create a new demand
- [ ] View demands list
- [ ] View single demand by ID
- [ ] Update demand
- [ ] Delete demand
- [ ] Create a new offer
- [ ] View offers list
- [ ] Create booking
- [ ] View bookings
- [ ] Accept/reject booking
- [ ] Send message
- [ ] Create rating
- [ ] Create demand response
- [ ] View demand responses

## Performance Benefits

INTEGER IDs provide several benefits:

1. **Smaller storage**: 4 bytes vs 16 bytes for UUID
2. **Faster indexing**: Integer comparisons are faster
3. **Better cache efficiency**: More IDs fit in memory
4. **Sequential allocation**: Better for B-tree indexes

## Notes

- User IDs remain as UUID (not changed by this migration)
- Message IDs and Rating IDs remain as UUID (only ride_id changed)
- Notification IDs remain as UUID
- All existing data is preserved during migration
- Foreign key relationships are maintained
- Indexes are recreated after migration

## Support

If you encounter any issues:

1. Check the error logs
2. Verify database connection
3. Ensure migrations table exists
4. Contact the development team

## Migration Execution Log

```
Date: [TO BE FILLED]
Executed by: [TO BE FILLED]
Environment: [development/production]
Status: [pending/success/failed]
Notes: [any relevant notes]
```
