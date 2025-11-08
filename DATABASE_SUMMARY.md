# Toosila Database Architecture - Quick Summary

## Database Type
**PostgreSQL** with raw SQL queries (no ORM)

## Connection
- **Production**: DATABASE_URL (Railway)
- **Development**: Individual env vars (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
- **Driver**: pg library (v8.16.3)
- **Connection Pool**: Managed by pg library with graceful shutdown

## Tables (12 total)

### Core Tables (10)
1. **users** - User accounts (drivers/passengers)
   - Indexes: email, verification_status
   
2. **categories** - City/route categories
   - 10 default Iraqi cities
   
3. **demands** - Passenger ride requests
   - Indexes: passenger_id, from_city, to_city, is_active
   
4. **offers** - Driver ride offers
   - Indexes: driver_id, from_city, to_city, departure_time, is_active
   
5. **bookings** - Passenger bookings on driver offers
   - Indexes: passenger_id, offer_id, status
   - Unique: (offer_id, passenger_id)
   
6. **messages** - Communication
   - Indexes: sender_id, (ride_type, ride_id)
   
7. **ratings** - User reviews
   - Indexes: to_user_id, ride_id
   - Unique: (ride_id, from_user_id)
   
8. **refresh_tokens** - JWT tokens
   - Indexes: user_id
   
9. **demand_responses** - Driver responses to passenger demands
   - Indexes: demand_id, driver_id, status
   - Unique: (demand_id, driver_id)
   - Has auto-update trigger for updated_at
   
10. **notifications** - System notifications
    - Indexes: user_id, unread (partial), created_at, type, (user_id, type, is_read, created_at)

### Verification Tables (2)
11. **verification_documents** - ID verification (Iraqi ID, Passport)
    - Indexes: user_id, status
    
12. **verification_audit_log** - Verification audit trail
    - Indexes: user_id, document_id

## Index Strategy
- **26+ indexes total**
- Core lookups: Foreign keys + common filters
- Composite indexes: For multi-column queries
- Partial indexes: For common WHERE conditions (e.g., unread notifications)
- Performance: ~60% average query improvement, up to 200x faster for specific queries

## Migrations
- **init-db.sql**: Complete schema setup with all tables and indexes
- **add-booking-seats-message.sql**: Multi-seat booking support
- **add-id-verification.sql**: Verification system (documents + audit log)
- **Migration runners**: JavaScript migration scripts support Railway database URLs

## Data Access Pattern
- **No ORM**: Uses raw SQL with pg library
- **Model Layer**: JavaScript classes with static factory methods
- **Security**: Parameterized queries prevent SQL injection
- **Pagination**: Implemented via LIMIT/OFFSET
- **Filtering**: Dynamic WHERE clause construction

## Environment Variables
```
DB_HOST=localhost (or use DATABASE_URL in production)
DB_PORT=5432
DB_NAME=toosila
DB_USER=postgres
DB_PASSWORD=<required>
DB_SSL=true/false
```

## Constraints & Features
- Foreign keys with CASCADE delete
- Unique constraints on key pairs
- Check constraints on enums and ranges
- Auto-updated timestamps
- Default values for status fields
- JSON support for notifications data

## Performance Optimization
- Partial index on unread notifications (~200x faster)
- Composite indexes for JOIN operations
- Descending indexes for sorting
- Query logging with duration tracking
- Connection pooling for efficiency

## Setup Commands
```bash
npm run setup              # Initial environment setup
npm run db:setup          # Create database and tables
node scripts/verify-indexes.js  # Verify all indexes exist
```

## Security
- Password hashing (excluded from JSON)
- Verification system for user accounts
- Audit logging for sensitive operations
- Parameterized queries prevent SQL injection
- NOT NULL constraints on critical fields
