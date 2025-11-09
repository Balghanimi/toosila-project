# Phase 1 Missing Packages Audit

## Status: MISSING PACKAGES IDENTIFIED ⚠️

---

## 📦 Required vs Installed Packages

### Backend (server/package.json)

#### ✅ Already Installed
- winston@^3.18.3
- winston-daily-rotate-file@^5.0.0
- swagger-jsdoc@^6.2.8
- swagger-ui-express@^5.0.1
- supertest@^7.1.4 (devDependencies)

#### ❌ MISSING - Required by Monitoring Wizard
- **@sentry/node** - Backend error tracking
- **@sentry/profiling-node** - Performance profiling (optional but used in config)

---

### Frontend (client/package.json)

#### ✅ Already Installed
- @testing-library/react@^16.3.0
- @testing-library/jest-dom@^6.8.0
- @playwright/test@^1.55.1

#### ❌ MISSING - Required by Monitoring Wizard
- **@sentry/react** - Frontend error tracking with React integration

---

## 🔧 Installation Commands

### Complete Installation (All Missing Packages)

**Run these commands:**

```bash
# Backend packages
cd server
npm install @sentry/node @sentry/profiling-node

# Frontend packages
cd ../client
npm install @sentry/react
```

### Single Combined Command

From project root:

```bash
cd server && npm install @sentry/node @sentry/profiling-node && cd ../client && npm install @sentry/react && cd ..
```

---

## 📋 Package Details

### @sentry/node
- **Version:** ^7.91.0 (or latest)
- **Purpose:** Backend error tracking and monitoring
- **Used in:**
  - `server/config/sentry.js`
  - `server/middlewares/error.js` (via captureException)

### @sentry/profiling-node
- **Version:** ^7.91.0 (or latest)
- **Purpose:** Performance profiling integration
- **Used in:**
  - `server/config/sentry.js` (nodeProfilingIntegration)

### @sentry/react
- **Version:** ^7.91.0 (or latest)
- **Purpose:** Frontend error tracking with React integration
- **Used in:**
  - `client/src/config/sentry.js`
  - `client/src/index.js`
  - `client/src/components/ErrorBoundary.js`

---

## ✅ Verification After Installation

### Backend Verification
```bash
cd server
npm list @sentry/node @sentry/profiling-node
```

Expected:
```
toosila-backend@1.0.0
├── @sentry/node@7.x.x
└── @sentry/profiling-node@7.x.x
```

### Frontend Verification
```bash
cd client
npm list @sentry/react
```

Expected:
```
toosila-frontend@1.0.0
└── @sentry/react@7.x.x
```

### Test Imports
```bash
# Backend
cd server
node -e "require('@sentry/node'); console.log('✅ @sentry/node OK')"
node -e "require('@sentry/profiling-node'); console.log('✅ @sentry/profiling-node OK')"

# Frontend (from client directory)
cd ../client
node -e "require('@sentry/react'); console.log('✅ @sentry/react OK')"
```

---

## 📊 Summary

### Total Missing Packages: 3

**Backend:** 2 packages
- @sentry/node
- @sentry/profiling-node

**Frontend:** 1 package
- @sentry/react

### Installation Time
- Estimated: 1-2 minutes
- Download size: ~15-20 MB total

---

## 🎯 Quick Installation Script

Save this as `install-phase1-packages.sh` (or `.bat` for Windows):

### Bash/PowerShell Script
```bash
#!/bin/bash
echo "Installing Phase 1 missing packages..."

echo "📦 Installing backend packages..."
cd server
npm install @sentry/node @sentry/profiling-node

echo "📦 Installing frontend packages..."
cd ../client
npm install @sentry/react

echo "✅ All packages installed!"
echo ""
echo "Verify installation:"
cd ../server && npm list @sentry/node @sentry/profiling-node
cd ../client && npm list @sentry/react
```

---

## ⚠️ Important Notes

### Why These Are Required

1. **@sentry/node** - CRITICAL
   - Required by `server/config/sentry.js`
   - Server won't start if Sentry is enabled without this package
   - Error: `Cannot find module '@sentry/node'`

2. **@sentry/profiling-node** - OPTIONAL
   - Used for performance profiling
   - Can be removed from config if not needed
   - Enhances error tracking with performance data

3. **@sentry/react** - CRITICAL
   - Required by `client/src/config/sentry.js`
   - Frontend won't build without this package
   - Error: `Module not found: Error: Can't resolve '@sentry/react'`

### Sentry DSN Still Required

After installing packages, you still need to:
1. Sign up for Sentry account (https://sentry.io)
2. Create projects (backend + frontend)
3. Add DSN to environment variables

Without DSN, Sentry will be disabled but won't cause errors.

---

## 🚀 Post-Installation

After installing packages:

1. **Restart Development Servers**
   ```bash
   # Backend
   cd server
   npm run dev

   # Frontend (new terminal)
   cd client
   npm start
   ```

2. **Check for Errors**
   - No module errors should appear
   - Sentry initialization will log success or skip if no DSN

3. **Optional: Configure Sentry**
   - Add DSN to `.env` files
   - See `MONITORING.md` for setup instructions

---

**Created:** November 9, 2025
**Status:** Missing packages identified
**Action Required:** Run installation commands above
