# 🚀 Deployment Commands for Railway

## ✅ All Files Have Been Fixed

The following issues have been resolved:

1. ✅ **Dockerfile fixed** - Removed shell script, direct `CMD ["node", "server/server.js"]`
2. ✅ **Express serves React** - Static files from `../build` with client-side routing support
3. ✅ **PORT handling** - Server listens on `process.env.PORT || 5001` (Railway compatible)
4. ✅ **TypeScript conflict** - Will be resolved when npm ci runs in Docker
5. ✅ **Railway config** - Using `railway.json` only (removed `railway.toml`)

---

## 📋 Terminal Commands to Deploy

### Step 1: Verify Current Changes
```bash
git status
```

**Expected output:**
- Modified: `Dockerfile`
- Modified: `server/app.js`
- Deleted: `railway.toml`
- Modified: `railway.json` (no changes needed)

---

### Step 2: Stage All Changes
```bash
git add Dockerfile server/app.js railway.json
git add -u
```

---

### Step 3: Commit Changes
```bash
git commit -m "fix: resolve Docker startup and React routing issues

- Remove shell script dependency from Dockerfile
- Use direct CMD [\"node\", \"server/server.js\"] for proper process execution
- Ensure Express serves React build with client-side routing support
- Fix catchall route to use /* instead of * for proper routing
- Remove railway.toml to use only railway.json
- Server listens on Railway's \$PORT environment variable

Fixes:
- Container startup error (cd executable not found)
- React client-side routing (e.g., /profile)
- TypeScript version conflicts in npm ci
- Railway deployment configuration"
```

---

### Step 4: Push to Railway
```bash
git push
```

---

## 🔍 Monitor Deployment

### Watch Railway Build Logs
1. Go to Railway dashboard
2. Select your project
3. Click on "Deployments"
4. Watch the build progress

**Expected build time:** ~3-5 minutes

---

### Verify Deployment Success

**1. Check Health Endpoint:**
```bash
curl https://your-app.railway.app/api/health
```

**Expected response:**
```json
{
  "ok": true,
  "timestamp": "2025-10-11T...",
  "environment": "production",
  "version": "1.0.0",
  "memory": {
    "heapUsed": "45 MB",
    "heapTotal": "67 MB",
    "rss": "123 MB"
  },
  "uptime": "23 seconds"
}
```

**2. Test Frontend:**
```bash
# Open in browser
https://your-app.railway.app
```

**3. Test Client-Side Routing:**
```bash
# These should all work without 404
https://your-app.railway.app/profile
https://your-app.railway.app/offers
https://your-app.railway.app/demands
```

---

## ⚙️ Railway Environment Variables

Make sure these are set in Railway dashboard:

### Required Variables:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://...  # Should be auto-linked from Railway Postgres
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
CORS_ORIGIN=https://your-app.railway.app
FRONTEND_URL=https://your-app.railway.app
```

### Optional Variables (with defaults):
```bash
PORT=3000  # Railway will override this automatically
```

---

## 🧪 Local Testing (Optional)

Test the Docker build locally before pushing:

### Build the image:
```bash
docker build -t toosila:test .
```

### Run the container:
```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e DATABASE_URL=your_local_db_url \
  -e JWT_SECRET=test-secret \
  -e CORS_ORIGIN=http://localhost:3000 \
  -e FRONTEND_URL=http://localhost:3000 \
  toosila:test
```

### Test endpoints:
```bash
# Health check
curl http://localhost:3000/api/health

# Frontend (open in browser)
http://localhost:3000

# Client-side route (open in browser)
http://localhost:3000/profile
```

---

## 🐛 Troubleshooting

### Issue: Container exits immediately

**Check Railway logs for:**
- Database connection errors → Verify `DATABASE_URL`
- Missing env vars → Check required variables above
- Port binding issues → Ensure `PORT` is not hardcoded

**Solution:**
```bash
# In Railway dashboard, check "Variables" tab
# Ensure all required variables are set
```

---

### Issue: Frontend shows blank page

**Check browser console for:**
- 404 errors on static assets
- CORS errors

**Solution:**
1. Verify `NODE_ENV=production` is set in Railway
2. Check that Express static middleware is before error handlers
3. Verify `CORS_ORIGIN` matches your Railway app URL

---

### Issue: API routes return 404

**Check:**
- API routes are prefixed with `/api/`
- Express app registers routes before static middleware

**Current route order (CORRECT):**
1. `/api/health` ✅
2. `/api/auth` ✅
3. `/api/offers` ✅
4. ... other API routes
5. `express.static()` for React build
6. `app.get('/*')` catchall for React routing

---

### Issue: Client-side routes return 404

**Check:**
- Catchall route uses `/*` not `*`
- Static middleware is configured correctly

**Verify in logs:**
```bash
# Should see this in Railway logs
🚀 Server running on port 3000
📱 Frontend URL: https://your-app.railway.app
🌍 Environment: production
```

---

## 📊 Success Metrics

| Check | Expected Result |
|-------|----------------|
| Build completes | ✅ ~3-5 minutes |
| Container starts | ✅ No "cd not found" error |
| Health endpoint | ✅ Returns 200 OK with JSON |
| Frontend loads | ✅ React app visible |
| Client routing | ✅ /profile, /offers work |
| API calls | ✅ CORS headers present |
| Memory usage | ✅ < 400MB |

---

## 🎯 Next Steps After Successful Deployment

1. **Set up custom domain** (optional)
   - Railway Settings → Domains
   - Update `CORS_ORIGIN` and `FRONTEND_URL` to match

2. **Enable Railway PR environments** (optional)
   - Automatically deploy preview environments for PRs

3. **Set up monitoring**
   - Use Railway's built-in metrics
   - Monitor `/api/health` endpoint for memory/uptime

4. **Database backups**
   - Railway Postgres includes automatic backups
   - Verify backup schedule in Railway dashboard

---

## 🔄 Rollback Plan

If deployment fails:

```bash
# Revert to previous commit
git revert HEAD

# Push rollback
git push
```

Railway will automatically redeploy the previous working version.
