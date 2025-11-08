# 🧪 Testing Security Fixes - Step-by-Step Guide

## Prerequisites

Before testing, ensure you have:
- [ ] PostgreSQL database running
- [ ] Node.js installed
- [ ] Server dependencies installed (`npm install` in server directory)
- [ ] Development environment configured

---

## Test 1: JWT Secrets Validation ✅

### Test 1.1: Development Mode (Should Work)
```bash
cd server
# Ensure NODE_ENV is development or not set
npm run dev
```
**Expected:** Server starts successfully with default secrets in development mode

### Test 1.2: Production Mode with Weak Secret (Should Fail)
```bash
cd server
# Create test .env with weak secret
echo "NODE_ENV=production" > .env.test
echo "JWT_SECRET=short" >> .env.test
echo "JWT_REFRESH_SECRET=short" >> .env.test

# Try to start server
NODE_ENV=production JWT_SECRET=short JWT_REFRESH_SECRET=short node server.js
```
**Expected:** Server fails to start with error:
```
❌ SECURITY ERROR: JWT_SECRET must be at least 32 characters in production
```

### Test 1.3: Production Mode with Default Secret (Should Fail)
```bash
NODE_ENV=production JWT_SECRET=your-super-secret-jwt-key-change-in-production JWT_REFRESH_SECRET=test node server.js
```
**Expected:** Server fails with:
```
❌ SECURITY ERROR: JWT_SECRET contains default/weak value
```

### Test 1.4: Production Mode with Strong Secret (Should Work)
```bash
# Generate strong secrets
node server/scripts/generate-jwt-secrets.js

# Copy output and set in .env
# Then try starting server
NODE_ENV=production npm start
```
**Expected:** Server starts with message:
```
✅ JWT secrets validated - length and strength requirements met
```

---

## Test 2: Admin Role-Based Access Control ✅

### Test 2.1: Run Migration
```bash
cd server
node scripts/run-migration-006-role.js
```
**Expected Output:**
```
🚀 Starting migration 006: Add role column to users table...
✅ Migration completed successfully!
✅ Role column added to users table
```

### Test 2.2: Check Database Schema
```bash
psql -d toosila -c "\d users"
```
**Expected:** Should see `role` column in users table

### Test 2.3: Create Admin User
```bash
# Register a test user first (or use existing user)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Test",
    "email": "admin@test.com",
    "password": "TestPassword123!",
    "isDriver": false
  }'

# Update to admin role
psql -d toosila -c "UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';"
```

### Test 2.4: Test Admin Endpoints

**A. Login as admin:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "TestPassword123!"
  }'
```
**Expected:** Returns token with role='admin' in JWT payload

**B. Test admin-only endpoint (as admin):**
```bash
# Use token from login
curl -X GET http://localhost:5000/api/auth/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Expected:** Returns list of all users (200 OK)

**C. Test admin endpoint as regular user:**
```bash
# Login as regular user and try admin endpoint
curl -X GET http://localhost:5000/api/auth/users \
  -H "Authorization: Bearer YOUR_REGULAR_USER_TOKEN"
```
**Expected:** Returns 403 Forbidden with message about admin privileges required

### Test 2.5: Verify JWT Payload
```bash
# Decode JWT token to verify role field
# Use jwt.io or:
node -e "
const jwt = require('jsonwebtoken');
const token = 'YOUR_JWT_TOKEN_HERE';
console.log(jwt.decode(token));
"
```
**Expected:** Should see `role: 'admin'` or `role: 'user'` in payload

---

## Test 3: Email Verification System ✅

### Test 3.1: Install Dependencies
```bash
cd server
npm install nodemailer
```

### Test 3.2: Run Migration
```bash
node scripts/run-migration-007-email-verification.js  # TODO: Create this script

# Or manually:
psql -d toosila -f database/migrations/007_add_email_verification.sql
```
**Expected:** Adds email verification columns to users table

### Test 3.3: Configure Email Service

**Option A: Gmail SMTP (for testing)**
```bash
# Add to server/.env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-specific-password  # Get from Google Account settings
EMAIL_FROM=noreply@toosila.com
FRONTEND_URL=http://localhost:3000
```

**How to get Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Search for "App passwords"
4. Generate new app password for "Mail"
5. Use this password in EMAIL_PASS

**Option B: SendGrid (recommended for production)**
```bash
# Get API key from sendgrid.com
SENDGRID_API_KEY=SG.your_api_key_here
EMAIL_FROM=noreply@toosila.com
FRONTEND_URL=http://localhost:3000
```

### Test 3.4: Test Email Configuration
```bash
node -e "
const { testEmailConfiguration } = require('./utils/emailService');
testEmailConfiguration().then(result => {
  console.log('Email test:', result ? '✅ SUCCESS' : '❌ FAILED');
  process.exit(result ? 0 : 1);
});
"
```
**Expected:** Output shows email service is ready

### Test 3.5: Register Routes in app.js

Add to `server/app.js` (before error handler):
```javascript
const emailVerificationRoutes = require('./routes/emailVerification.routes');
app.use('/api/email-verification', emailVerificationRoutes);
```

### Test 3.6: Test Registration with Email Verification

**A. Register new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "isDriver": false
  }'
```
**Expected (after integration):**
- User created
- Verification email sent
- Message: "Please check your email to verify your account"

**B. Check email:**
- Check inbox for verification email
- Should contain verification link with token
- Click link or copy token

**C. Verify email:**
```bash
curl http://localhost:5000/api/email-verification/verify/YOUR_TOKEN_HERE
```
**Expected:**
```json
{
  "success": true,
  "message": "تم تأكيد بريدك الإلكتروني بنجاح!"
}
```

**D. Check database:**
```bash
psql -d toosila -c "SELECT email, email_verified, email_verified_at FROM users WHERE email = 'test@example.com';"
```
**Expected:** `email_verified` should be `true`

### Test 3.7: Test Resend Verification
```bash
# Login to get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123!"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Resend verification
curl -X POST http://localhost:5000/api/email-verification/resend \
  -H "Authorization: Bearer $TOKEN"
```
**Expected:** New verification email sent

### Test 3.8: Test Expired Token
```bash
# Manually set token expiration in past
psql -d toosila -c "UPDATE users SET verification_token_expires = NOW() - INTERVAL '1 day' WHERE email = 'test@example.com';"

# Try to verify
curl http://localhost:5000/api/email-verification/verify/YOUR_TOKEN
```
**Expected:** Error message about expired or invalid token

### Test 3.9: Test Protected Actions (After Middleware Added)
```bash
# Try to create offer without verification
curl -X POST http://localhost:5000/api/offers \
  -H "Authorization: Bearer $UNVERIFIED_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "from_city": "بغداد",
    "to_city": "أربيل",
    "departure_time": "2025-12-01T10:00:00Z",
    "seats": 3,
    "price": 25000
  }'
```
**Expected:** 403 Forbidden with `requireVerification: true`

---

## Integration Testing Checklist

### Complete User Flow
- [ ] 1. User registers with email
- [ ] 2. Receives verification email (check inbox)
- [ ] 3. Clicks verification link
- [ ] 4. Email is verified in database
- [ ] 5. User can now login successfully
- [ ] 6. User can create offers/demands
- [ ] 7. Unverified user cannot create offers/demands

### Admin Flow
- [ ] 1. Regular user created
- [ ] 2. User promoted to admin in database
- [ ] 3. Admin can access admin endpoints
- [ ] 4. Regular user blocked from admin endpoints
- [ ] 5. JWT token includes correct role

### Security Flow
- [ ] 1. Production mode requires strong JWT secrets
- [ ] 2. Production mode rejects default/weak secrets
- [ ] 3. Email tokens are hashed in database
- [ ] 4. Email tokens expire after 24 hours
- [ ] 5. Cannot reuse expired tokens
- [ ] 6. Cannot verify with invalid token

---

## Troubleshooting

### Email Not Sending
```bash
# Check email configuration
node -e "const config = require('./config/env'); console.log('EMAIL_HOST:', config.EMAIL_HOST); console.log('EMAIL_USER:', config.EMAIL_USER);"

# Test SMTP connection
node -e "
const nodemailer = require('nodemailer');
const config = require('./config/env');
const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: config.EMAIL_PORT,
  auth: {user: config.EMAIL_USER, pass: config.EMAIL_PASS}
});
transporter.verify().then(() => console.log('✅ SMTP OK')).catch(err => console.error('❌ SMTP Error:', err));
"
```

### Migration Failed
```bash
# Check if column already exists
psql -d toosila -c "\d users"

# Manually add if needed
psql -d toosila -c "ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' NOT NULL;"
```

### JWT Validation Failing in Dev
```bash
# Check NODE_ENV
echo $NODE_ENV

# Should be 'development' or not set
# If 'production', validation will be strict
```

---

## Success Criteria

All security fixes are considered successful if:

1. **JWT Secrets:**
   - ✅ Production mode requires 32+ character secrets
   - ✅ Production mode rejects default/weak secrets
   - ✅ Development mode works with defaults
   - ✅ Clear error messages guide configuration

2. **Admin RBAC:**
   - ✅ Admin users can access admin endpoints
   - ✅ Regular users blocked from admin endpoints
   - ✅ Role included in JWT payload
   - ✅ Easy to create/manage admin users

3. **Email Verification:**
   - ✅ New users receive verification email
   - ✅ Verification link works correctly
   - ✅ Verified users can access protected actions
   - ✅ Unverified users blocked from protected actions
   - ✅ Tokens expire after 24 hours
   - ✅ Resend verification works
   - ✅ Existing users grandfathered as verified

---

## Automated Test Script (TODO)

Create `server/scripts/test-security-fixes.sh`:
```bash
#!/bin/bash
echo "🧪 Testing Security Fixes..."

# Test 1: JWT Secrets
echo "\n1. Testing JWT Secrets Validation..."
# Add tests

# Test 2: Admin RBAC
echo "\n2. Testing Admin RBAC..."
# Add tests

# Test 3: Email Verification
echo "\n3. Testing Email Verification..."
# Add tests

echo "\n✅ All tests passed!"
```

---

**Last Updated:** November 4, 2025
**Version:** 1.0
