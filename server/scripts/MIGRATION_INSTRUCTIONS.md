# Database Migration Instructions

## Add Booking Seats and Message Support

### Migration File
`add-booking-seats-message.sql`

### What This Migration Does
- Adds `seats` column to `bookings` table (INTEGER, default 1, min 1, max 7)
- Adds `message` column to `bookings` table (TEXT, optional)
- Updates existing bookings to have 1 seat

### How to Apply

#### Option 1: Using psql locally
```bash
psql -U your_username -d toosila_db -f server/scripts/add-booking-seats-message.sql
```

#### Option 2: Using Railway CLI
```bash
railway connect
# Then in the PostgreSQL prompt:
\i server/scripts/add-booking-seats-message.sql
```

#### Option 3: Using Railway Dashboard
1. Go to Railway Dashboard
2. Select your PostgreSQL database
3. Open the Query tab
4. Copy and paste the contents of `add-booking-seats-message.sql`
5. Execute the query

### Verification
After running the migration, verify it worked:

```sql
-- Check if columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'bookings' AND column_name IN ('seats', 'message');

-- Should return:
-- seats   | integer | 1
-- message | text    | NULL
```

### Rollback (if needed)
```sql
ALTER TABLE bookings DROP COLUMN IF EXISTS seats;
ALTER TABLE bookings DROP COLUMN IF EXISTS message;
```
