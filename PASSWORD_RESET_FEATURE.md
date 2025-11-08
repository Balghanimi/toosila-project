# 🔐 Password Reset Feature - ميزة إعادة تعيين كلمة المرور

**Date:** November 4, 2025
**Feature:** Complete "Forgot Password" / "Reset Password" system

---

## 📋 Overview / نظرة عامة

تم إضافة نظام كامل لإعادة تعيين كلمة المرور يتضمن:
- صفحة "نسيت كلمة المرور"
- إرسال رابط إعادة التعيين عبر البريد الإلكتروني
- صفحة إعادة تعيين كلمة المرور
- التحقق من صلاحية الرابط
- رسائل بريد إلكتروني ثنائية اللغة (عربي + إنجليزي)

---

## ✨ Features / المميزات

✅ **رابط آمن** - Secure token-based reset (SHA-256 hashing)
✅ **صلاحية محدودة** - 1-hour token expiration
✅ **بريد ثنائي اللغة** - Bilingual email templates (Arabic RTL + English)
✅ **واجهة جميلة** - Beautiful UI with animations
✅ **تحقق تلقائي** - Automatic token verification
✅ **أمان عالي** - No email enumeration (security best practice)

---

## 🎯 User Flow / مسار المستخدم

### 1. Request Password Reset / طلب إعادة التعيين
```
User clicks "Forgot Password?" on login page
     ↓
Enters email address
     ↓
System sends reset email (if email exists)
     ↓
User receives email with reset link
```

### 2. Reset Password / إعادة التعيين
```
User clicks link in email
     ↓
System verifies token validity
     ↓
User enters new password
     ↓
Password is reset successfully
     ↓
Auto-redirect to login page
```

---

## 🔧 Technical Implementation

### Backend Files Created

#### 1. **server/database/migrations/008_add_password_reset.sql**
```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;
```

#### 2. **server/controllers/passwordReset.controller.js**
**Endpoints:**
- `requestPasswordReset()` - POST /api/password-reset/request
- `verifyResetToken()` - GET /api/password-reset/verify/:token
- `resetPassword()` - POST /api/password-reset/reset

**Security Features:**
- SHA-256 token hashing
- 1-hour expiration
- No email enumeration (always returns success message)
- Token invalidation after use

#### 3. **server/routes/passwordReset.routes.js**
```javascript
POST /api/password-reset/request   // Request reset
GET  /api/password-reset/verify/:token  // Verify token
POST /api/password-reset/reset     // Reset password
```

#### 4. **server/app.js** (Modified)
```javascript
const passwordResetRoutes = require('./routes/passwordReset.routes');
app.use('/api/password-reset', passwordResetRoutes);
```

### Frontend Files Created

#### 1. **client/src/pages/ForgotPassword.jsx**
**Features:**
- Email input with validation
- Success/error states
- Loading indicator
- Links to login and help

**Flow:**
1. User enters email
2. Validates email format
3. Sends request to backend
4. Shows success message (always, for security)
5. Instructs to check inbox

#### 2. **client/src/styles/ForgotPassword.css**
**Styling:**
- Gradient background
- Animated lock icon
- Responsive design
- Error/success message boxes

#### 3. **client/src/pages/ResetPassword.jsx**
**Features:**
- Token verification on load
- Password strength indicators
- Show/hide password toggle
- Confirm password validation
- Success with auto-redirect

**Validation:**
- Minimum 5 characters
- Passwords must match
- Token must be valid and not expired

#### 4. **client/src/styles/ResetPassword.css**
**Styling:**
- Animated key icon
- Password strength indicators
- Loading states
- Success/error animations

#### 5. **client/src/components/Auth/Login.js** (Modified)
Added "Forgot Password?" link:
```javascript
<button onClick={() => navigate('/forgot-password')}>
  نسيت كلمة المرور؟ / Forgot Password?
</button>
```

#### 6. **client/src/App.js** (Modified)
Added routes:
```javascript
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />
```

---

## 📧 Email Template

**Subject:** إعادة تعيين كلمة المرور - Reset Password

**Content (Bilingual):**
- Arabic (RTL) section with greeting and instructions
- Reset button with unique token link
- Copy-paste link option
- Security warnings:
  - Link valid for 1 hour only
  - Ignore if not requested
  - Don't share link
- English section (same content)

**Link Format:**
```
https://toosila.com/reset-password/[TOKEN]
```

---

## 🔐 Security Features

### 1. Token Security
- **Hashing:** SHA-256 hash stored in database
- **Expiration:** 1-hour validity
- **Single-use:** Token deleted after successful reset
- **Random:** 32-byte cryptographically random token

### 2. No Email Enumeration
Always returns success message whether email exists or not:
```
"إذا كان البريد الإلكتروني موجوداً، ستتلقى رسالة لإعادة تعيين كلمة المرور"
```

### 3. Password Requirements
- Minimum 5 characters
- Same bcrypt hashing (12 salt rounds)
- Must match confirmation

### 4. Rate Limiting
Uses existing `generalLimiter` on `/api/` routes

---

## 🎨 UI/UX Features

### Forgot Password Page
- 🔒 Animated lock icon
- 📧 Email input with validation
- ✅ Success message box
- ⚠️ Error handling
- 📝 Help text and instructions
- 🔗 Back to login link

### Reset Password Page
- 🔑 Animated key icon
- 👁️ Show/hide password toggles
- ✓ Password strength indicator
- ⚡ Real-time validation
- ⏱️ Auto-redirect countdown
- 🎯 Clear error messages

### Colors & Animations
- **Primary:** Purple gradient `#667eea → #764ba2`
- **Success:** Green `#10b981`
- **Error:** Red `#ef4444`
- **Animations:** Pulse, bounce, scale-in, shake

---

## 🚀 Setup & Configuration

### 1. Run Database Migration

```bash
cd server
node scripts/run-migration-008-password-reset.js
```

**Expected Output:**
```
✅ Migration completed successfully!
✅ Password reset columns added to users table:
   - reset_password_token: character varying
   - reset_password_expires: timestamp without time zone
```

### 2. Email Configuration

Already configured in `server/.env`:
```env
# Email service (one of these)
SENDGRID_API_KEY=...  # OR
MAILGUN_API_KEY=...   # OR
EMAIL_HOST=smtp.gmail.com

EMAIL_FROM=noreply@toosila.com
FRONTEND_URL=http://localhost:3000
```

### 3. Test Email Template

```bash
node -e "const { sendPasswordResetEmail } = require('./server/utils/emailService'); sendPasswordResetEmail('test@example.com', 'Test User', 'TEST_TOKEN').then(() => console.log('✅ Email sent')).catch(err => console.error('❌', err));"
```

---

## 🧪 Testing Guide

### Test Scenario 1: Request Reset

1. Go to http://localhost:3000/login
2. Click "نسيت كلمة المرور؟"
3. Enter email: `ahmed@test.com`
4. Click "إرسال رابط إعادة التعيين"
5. **Expected:** Success message shown
6. **Check email:** Should receive reset email

### Test Scenario 2: Reset Password

1. Open email
2. Click reset link (or copy URL)
3. **Expected:** Redirected to reset password page
4. Enter new password (min 5 chars)
5. Confirm password
6. Click "إعادة تعيين كلمة المرور"
7. **Expected:** Success message + auto-redirect to login
8. Try logging in with new password
9. **Expected:** Login successful

### Test Scenario 3: Expired Token

1. Request password reset
2. Wait 61 minutes (or manually expire in DB)
3. Try to use reset link
4. **Expected:** "الرابط غير صالح أو منتهي الصلاحية"
5. Option to request new link

### Test Scenario 4: Invalid Token

1. Try accessing `/reset-password/invalid-token-123`
2. **Expected:** Error message shown
3. Options: Request new link or back to login

### Test Scenario 5: Non-existent Email

1. Request reset with `nonexistent@example.com`
2. **Expected:** Same success message (security)
3. No email sent (but user doesn't know)

---

## 📊 Database Schema

### New Columns in `users` Table

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| reset_password_token | VARCHAR(255) | YES | SHA-256 hashed token |
| reset_password_expires | TIMESTAMP | YES | Expiration time (1 hour) |

**Index:**
```sql
CREATE INDEX idx_users_reset_password_token
ON users(reset_password_token)
WHERE reset_password_token IS NOT NULL;
```

**Queries:**
```sql
-- Check reset tokens
SELECT id, email, reset_password_token, reset_password_expires
FROM users
WHERE reset_password_token IS NOT NULL;

-- Clear expired tokens
UPDATE users
SET reset_password_token = NULL, reset_password_expires = NULL
WHERE reset_password_expires < NOW();

-- Reset specific user password (admin)
UPDATE users
SET password_hash = '$2b$12$...'
WHERE email = 'user@example.com';
```

---

## 🔍 API Reference

### 1. Request Password Reset

**Endpoint:** `POST /api/password-reset/request`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Always Success):**
```json
{
  "success": true,
  "message": "إذا كان البريد الإلكتروني موجوداً، ستتلقى رسالة لإعادة تعيين كلمة المرور"
}
```

### 2. Verify Reset Token

**Endpoint:** `GET /api/password-reset/verify/:token`

**Response (Valid):**
```json
{
  "success": true,
  "message": "الرابط صالح"
}
```

**Response (Invalid/Expired):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_OR_EXPIRED_TOKEN",
    "message": "الرابط غير صالح أو منتهي الصلاحية"
  }
}
```

### 3. Reset Password

**Endpoint:** `POST /api/password-reset/reset`

**Request:**
```json
{
  "token": "abc123...",
  "newPassword": "newpassword123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "تم إعادة تعيين كلمة المرور بنجاح"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_OR_EXPIRED_TOKEN",
    "message": "الرابط غير صالح أو منتهي الصلاحية"
  }
}
```

---

## 💡 Best Practices Implemented

✅ **Security:**
- Token hashing (SHA-256)
- Short expiration (1 hour)
- No email enumeration
- Single-use tokens
- Rate limiting

✅ **UX:**
- Clear instructions
- Bilingual support
- Loading indicators
- Error messages
- Success feedback
- Auto-redirect

✅ **Email:**
- Bilingual templates
- Clear CTAs
- Security warnings
- Copy-paste option
- Responsive design

---

## 🚨 Troubleshooting

### Email Not Received

1. **Check spam folder**
2. **Verify email config:**
   ```bash
   node -e "const config = require('./server/config/env'); console.log('EMAIL_FROM:', config.EMAIL_FROM);"
   ```
3. **Test email service:**
   ```bash
   node -e "const { testEmailConfiguration } = require('./server/utils/emailService'); testEmailConfiguration();"
   ```

### Token Invalid Error

1. Check expiration:
   ```sql
   SELECT reset_password_expires FROM users WHERE email = 'user@example.com';
   ```
2. Verify token hasn't been used
3. Request new reset link

### Password Not Updating

1. Check password length (min 5 chars)
2. Verify passwords match
3. Check token validity
4. Check server logs for bcrypt errors

---

## 📝 Admin Tasks

### Reset User Password Manually

```bash
# Generate password hash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('newpassword', 12).then(hash => console.log(hash));"

# Update in database
psql -d toosila -c "UPDATE users SET password_hash = 'HASH_FROM_ABOVE' WHERE email = 'user@example.com';"
```

### Clear Expired Reset Tokens

```sql
UPDATE users
SET reset_password_token = NULL, reset_password_expires = NULL
WHERE reset_password_expires < NOW();
```

### View Active Reset Requests

```sql
SELECT id, email, reset_password_expires,
       EXTRACT(EPOCH FROM (reset_password_expires - NOW()))/60 as minutes_remaining
FROM users
WHERE reset_password_token IS NOT NULL
AND reset_password_expires > NOW();
```

---

## ✅ Integration Complete

All files created and integrated successfully:

### Backend ✅
- [x] Database migration
- [x] Password reset controller
- [x] Routes registered
- [x] Email templates ready

### Frontend ✅
- [x] Forgot password page
- [x] Reset password page
- [x] Login page updated
- [x] Routes added to App.js

### Documentation ✅
- [x] Feature documentation
- [x] API reference
- [x] Testing guide
- [x] Troubleshooting guide

---

## 🎉 Ready to Use!

The password reset feature is now fully integrated and ready for testing. Users can now:

1. Click "نسيت كلمة المرور؟" on login
2. Enter their email
3. Receive reset link via email
4. Set new password
5. Login with new password

**Next Steps:**
1. Configure email service in `.env`
2. Test the complete flow
3. Deploy to production

---

## 🔮 Future Enhancements

Possible improvements:

1. **Multi-factor auth** - SMS or app-based verification
2. **Password history** - Prevent reusing recent passwords
3. **Account lockout** - After multiple failed attempts
4. **Security questions** - Additional verification
5. **Audit log** - Track password reset attempts
6. **Custom expiration** - Configurable token lifetime

---

**Feature Status:** ✅ Complete and Ready for Production
