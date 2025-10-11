# Railway Environment Variables Setup Guide

## 🎯 Required Environment Variables

Your application is now building successfully on Railway! However, you need to configure the following environment variables in Railway for the application to run.

## 📋 Environment Variables to Add

Go to your Railway project → Select your service → Go to **Variables** tab, and add the following:

### 1. Database Configuration (Required)

If you're using Railway's PostgreSQL plugin, these will be automatically set. Otherwise, add:

```bash
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=toosila
DB_USER=postgres
DB_PASSWORD=your-secure-database-password
DB_SSL=true
```

### 2. JWT Configuration (Required for Production)

```bash
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

**⚠️ IMPORTANT:** Generate strong, random secrets for production. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. CORS & Frontend Configuration (Required for Production)

```bash
CORS_ORIGIN=https://your-railway-app-url.railway.app
FRONTEND_URL=https://your-railway-app-url.railway.app
ALLOWED_ORIGINS=https://your-railway-app-url.railway.app
```

Replace `your-railway-app-url.railway.app` with your actual Railway deployment URL.

### 4. Node Environment (Recommended)

```bash
NODE_ENV=production
PORT=3000
```

**Note:** Railway automatically sets `PORT`, so this is optional.

### 5. Optional Configurations

```bash
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info

# File Upload
MAX_FILE_SIZE=10mb
```

## 🚀 Quick Setup Steps

1. **Go to Railway Dashboard**
   - Navigate to your project
   - Select your service
   - Click on the **Variables** tab

2. **Add Required Variables**
   - Click **+ New Variable**
   - Add each variable from the list above
   - Click **Save**

3. **Deploy PostgreSQL (If needed)**
   - Click **+ New** → **Database** → **Add PostgreSQL**
   - Railway will automatically set: `DATABASE_URL`, `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
   - You may need to map these to your app's expected variable names:
     ```
     DB_HOST=${{Postgres.PGHOST}}
     DB_PORT=${{Postgres.PGPORT}}
     DB_NAME=${{Postgres.PGDATABASE}}
     DB_USER=${{Postgres.PGUSER}}
     DB_PASSWORD=${{Postgres.PGPASSWORD}}
     ```

4. **Redeploy**
   - After adding variables, Railway will automatically redeploy
   - Check the logs to ensure no errors

## 🔍 Verify Deployment

After setting the environment variables, check your Railway logs for:

✅ **Success indicators:**
```
✅ Server running on port 3000
✅ Database connected successfully
```

❌ **Error indicators:**
```
❌ Missing required environment variables: [...]
❌ Database connection failed
```

## 📝 Example Configuration

Here's a complete example configuration (replace with your actual values):

```env
# Database (from Railway PostgreSQL)
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_SSL=true

# JWT Secrets (generate your own!)
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_REFRESH_SECRET=z6y5x4w3v2u1t0s9r8q7p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1

# Frontend & CORS
CORS_ORIGIN=https://toosila-production.up.railway.app
FRONTEND_URL=https://toosila-production.up.railway.app
ALLOWED_ORIGINS=https://toosila-production.up.railway.app

# Environment
NODE_ENV=production
LOG_LEVEL=info
```

## 🎉 Next Steps

Once configured, your application should start successfully!

If you encounter any issues, check the Railway logs and ensure all required variables are set correctly.
