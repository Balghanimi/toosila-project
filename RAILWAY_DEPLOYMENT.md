# 🚂 Railway Deployment Guide - Toosila Project

## 📋 Overview
This guide will help you deploy both the **Backend (Node.js/Express)** and **Frontend (React)** on Railway.

---

## 🔧 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code is already pushed to GitHub
3. **Railway CLI** (optional): `npm install -g @railway/cli`

---

## 🗄️ Step 1: Deploy PostgreSQL Database

### Using Railway Dashboard:
1. Go to [railway.app](https://railway.app/new)
2. Click **"+ New Project"**
3. Select **"Provision PostgreSQL"**
4. Wait for deployment to complete
5. **Copy the connection details** (you'll need them later)

### Connection Details Available in Railway:
- `DATABASE_URL` (full connection string)
- Or individual variables: `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

---

## 🖥️ Step 2: Deploy Backend Server

### 2.1: Create Backend Service

1. In Railway Dashboard, click **"+ New"** → **"GitHub Repo"**
2. Select your `toosila-project` repository
3. Railway will detect it's a Node.js project
4. Click **"Add variables"** to configure environment

### 2.2: Configure Backend Environment Variables

Add these variables in Railway Dashboard:

```env
# Database Configuration (from Step 1)
DATABASE_URL=postgresql://user:password@host:port/database

# OR individual variables:
DB_HOST=your-db-host.railway.app
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=railway

# Server Configuration
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://your-frontend.up.railway.app

# JWT Security (generate new secrets for production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-change-this-too

# Email Configuration (optional - for email verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@toosila.app

# AI Moderation (optional - if you have Anthropic API key)
ANTHROPIC_API_KEY=your-anthropic-key-here
```

### 2.3: Set Root Directory

Since your backend is in the `/server` folder:

1. Go to **Settings** → **Service Settings**
2. Set **Root Directory** to: `server`
3. Build Command: `npm install`
4. Start Command: `npm start` or `node server.js`

### 2.4: Enable Trust Proxy

Your backend already has this configured in server.js:
```javascript
app.set('trust proxy', true);
```
This is required for Railway!

### 2.5: Deploy

Click **"Deploy"** and wait for the build to complete.

**Your backend URL will be**: `https://your-backend.up.railway.app`

---

## 🌐 Step 3: Deploy Frontend (React)

### 3.1: Create Frontend Service

1. In the same Railway project, click **"+ New"** → **"GitHub Repo"**
2. Select your repository again (for frontend service)
3. Railway will detect it's a Node.js/React project

### 3.2: Configure Frontend Environment Variables

```env
# Backend API URL (from Step 2)
REACT_APP_API_URL=https://your-backend.up.railway.app
REACT_APP_BACKEND_URL=https://your-backend.up.railway.app

# Optional
REACT_APP_DEFAULT_LOCALE=ar
```

### 3.3: Set Root Directory and Build

1. Go to **Settings** → **Service Settings**
2. Set **Root Directory** to: `client`
3. Build Command: `npm install && npm run build`
4. Start Command: `npx serve -s build -l $PORT`

**Important**: Railway provides a `$PORT` environment variable automatically.

### 3.4: Install Serve Package

If `serve` is not in your dependencies, add it:

In `client/package.json`, add to dependencies:
```json
"dependencies": {
  "serve": "^14.2.0",
  ...
}
```

Or update the start command to:
```bash
npm install -g serve && serve -s build -l $PORT
```

### 3.5: Deploy

Click **"Deploy"**.

**Your frontend URL will be**: `https://your-frontend.up.railway.app`

---

## 🔄 Step 4: Update CORS Configuration

After getting your frontend URL, update backend CORS:

1. Go to your backend service in Railway
2. Add/Update environment variable:
   ```env
   FRONTEND_URL=https://your-frontend.up.railway.app
   ```
3. Your backend (`server/server.js`) already has CORS configured to use this variable

---

## 🗃️ Step 5: Run Database Migrations

### Option 1: Using Railway CLI
```bash
railway login
railway link  # Select your project
railway run npm run db:setup
```

### Option 2: Using Railway Dashboard
1. Go to your backend service
2. Click **"Deployments"** → Select latest deployment
3. Click **"View Logs"**
4. In the service, add a one-time deploy command or run manually:
   - Go to Settings → Add a Build Command: `npm run db:setup`
   - Or use the CLI method above

### Option 3: Connect Directly to Database
```bash
# Get DATABASE_URL from Railway dashboard
psql "postgresql://user:password@host:port/database"

# Then run your SQL migrations manually
\i path/to/your/migration.sql
```

---

## ✅ Step 6: Verify Deployment

### Backend Health Check:
```bash
curl https://your-backend.up.railway.app/api/health
```

Should return something like:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### Frontend Check:
Open `https://your-frontend.up.railway.app` in your browser.

### Test Full Flow:
1. Register a new user
2. Login
3. Create an offer/demand
4. Check admin panel

---

## 🔐 Security Checklist

- [ ] Changed `JWT_SECRET` and `JWT_REFRESH_SECRET` from defaults
- [ ] Set `NODE_ENV=production`
- [ ] Configured `FRONTEND_URL` correctly for CORS
- [ ] Database is secured (Railway handles this)
- [ ] Email credentials are set (if using email features)
- [ ] Environment variables are not exposed in frontend build

---

## 📊 Monitoring & Logs

### View Logs:
1. Go to Railway Dashboard
2. Select your service
3. Click **"Deployments"** → **"View Logs"**

### Check Metrics:
- CPU usage
- Memory usage
- Request count
- Error rates

All available in Railway dashboard under **"Metrics"** tab.

---

## 🚀 Automatic Deployments

Railway automatically redeploys when you push to GitHub:

1. Push to `main` branch:
   ```bash
   git add .
   git commit -m "feat: update feature"
   git push origin main
   ```

2. Railway detects the push and triggers deployment automatically

---

## 💰 Pricing Note

- **Free Tier**: $5 credit/month (enough for small projects)
- **Pro Plan**: $20/month (recommended for production)
- Charges: ~$0.000463/GB-hour for usage

For your project (Backend + Frontend + Database):
- Expected cost: ~$10-15/month on free tier (if optimized)
- Production recommended: Pro plan ($20/month)

---

## 🐛 Troubleshooting

### Backend Won't Start
- Check logs for errors
- Verify `PORT` is not hardcoded (use `process.env.PORT || 5001`)
- Ensure all environment variables are set
- Check database connection string

### Frontend Shows API Errors
- Verify `REACT_APP_API_URL` is correct
- Check CORS configuration in backend
- Ensure backend is running and accessible

### Database Connection Failed
- Verify `DATABASE_URL` is correct
- Check if migrations ran successfully
- Ensure database service is running

### Build Failed
- Check Node version compatibility
- Review build logs for specific errors
- Verify all dependencies are in `package.json`

---

## 📞 Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Railway Status**: https://status.railway.app

---

## 🔗 Quick Links

After deployment, bookmark these:

- **Frontend**: `https://your-frontend.up.railway.app`
- **Backend API**: `https://your-backend.up.railway.app/api`
- **Admin Panel**: `https://your-frontend.up.railway.app/admin`
- **Railway Dashboard**: https://railway.app/dashboard

---

**Happy Deploying! 🚂**
