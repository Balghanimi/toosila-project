# Migration Plan: Optimized Docker + Monorepo

## Phase 1: Preparation (5-10 minutes)

### 1.1 Backup Current State
```bash
git add .
git commit -m "chore: backup before Docker optimization"
git push
```

### 1.2 Test Current Backend Static Serving
```bash
# Build the frontend
cd client && npm run build && cd ..

# Copy build to server location (temporary test)
cp -r client/build ./build

# Start server with production env
NODE_ENV=production PORT=3000 node server/server.js

# Test in browser: http://localhost:3000
# Verify: Frontend loads AND http://localhost:3000/api/health works
```

## Phase 2: Implement Optimized Dockerfile (10-15 minutes)

### 2.1 Replace Dockerfile
```bash
# Backup old Dockerfile
mv Dockerfile Dockerfile.old

# Activate optimized version
mv Dockerfile.optimized Dockerfile

# Update .dockerignore
mv .dockerignore.optimized .dockerignore
```

### 2.2 Test Locally
```bash
# Build the image
docker build -t toosila:test .

# Run with env vars
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e DATABASE_URL=your_db_url \
  toosila:test

# Test in browser
curl http://localhost:3000/api/health
curl http://localhost:3000  # Should serve React app
```

### 2.3 Verify Image Size
```bash
# Old image size
docker images toosila:old

# New image size (should be 40-50% smaller)
docker images toosila:test
```

## Phase 3: Deploy to Railway (5 minutes)

### 3.1 Commit Changes
```bash
git add Dockerfile .dockerignore
git commit -m "feat: optimize Dockerfile for Railway deployment

- Single-process architecture (Express serves both API + frontend)
- Removed redundant npm ci calls and global serve installation
- Proper multi-stage caching for faster builds
- Added dumb-init for graceful shutdown handling
- Reduced image size by 40-50%
- Fixed TypeScript lockfile conflicts"
git push
```

### 3.2 Monitor Railway Deployment
1. Watch build logs for errors
2. Check build time (should be 2-4 minutes faster)
3. Verify health check endpoint: `https://your-app.railway.app/api/health`
4. Test frontend: `https://your-app.railway.app`

### 3.3 Rollback Plan (if needed)
```bash
git revert HEAD
git push
# Railway will automatically redeploy previous version
```

## Phase 4: Optional - NPM Workspaces (15-20 minutes)

### 4.1 Implement Workspaces
```bash
# Replace root package.json
mv package.json.proposal package.json

# Remove TypeScript from root (client already has it)
# Edit package.json manually

# Regenerate lockfile
rm package-lock.json
rm client/package-lock.json
rm server/package-lock.json
npm install

# Verify workspace structure
npm ls --workspaces
```

### 4.2 Update Dockerfile for Workspaces
No changes needed! The optimized Dockerfile already supports this structure.

### 4.3 Test Locally
```bash
# Run dev mode
npm run dev

# Build client
npm run client:build

# Start server
npm run server:start
```

### 4.4 Deploy
```bash
git add package.json package-lock.json
git rm client/package-lock.json server/package-lock.json
git commit -m "refactor: migrate to npm workspaces for better dependency management"
git push
```

## Phase 5: Monitoring & Optimization (Ongoing)

### 5.1 Add Memory Monitoring
Update `server/app.js` health check endpoint with memory stats (see section 6.E above)

### 5.2 Configure Railway Environment Variables
In Railway dashboard:
- Set `NODE_ENV=production` (mark as "no rebuild trigger")
- Set `LOG_LEVEL=info` (mark as "no rebuild trigger")
- Database credentials should already be linked

### 5.3 Enable Build Caching
Railway automatically caches Docker layers. Monitor:
- First build: ~5-8 minutes
- Cached builds (no dependency changes): ~2-3 minutes
- Full rebuilds (dependency changes): ~4-6 minutes

## Validation Checklist

- [ ] Frontend loads at root URL
- [ ] API endpoints work at `/api/*`
- [ ] Health check returns 200 OK
- [ ] Database connections work
- [ ] Authentication flow works
- [ ] Static assets (CSS, JS, images) load correctly
- [ ] No CORS errors in browser console
- [ ] Build time reduced by 30-50%
- [ ] Image size reduced by 40-50%
- [ ] Memory usage under 400MB
- [ ] No TypeScript version conflicts

## Troubleshooting

### Issue: Frontend shows blank page
**Solution:** Check browser console for 404 errors. Verify `express.static` path in app.js

### Issue: API returns 404
**Solution:** Ensure API routes are registered BEFORE static file middleware

### Issue: Railway build fails with "module not found"
**Solution:** Check .dockerignore isn't excluding necessary files

### Issue: Container exits immediately
**Solution:** Check Railway logs for Node.js errors. Verify DATABASE_URL is set

### Issue: Slow build times persist
**Solution:** Verify .dockerignore is properly configured. Check Railway build logs for cache hits

## Estimated Total Migration Time
- **Minimum (Docker only):** 20-30 minutes
- **With NPM Workspaces:** 35-50 minutes
- **With thorough testing:** 1-2 hours

## Success Metrics

| Metric | Before | Target | Actual |
|--------|--------|--------|--------|
| Build time | ~8-10 min | ~3-5 min | ___ |
| Image size | ~800MB | ~400MB | ___ |
| Memory usage | ~350MB | ~250MB | ___ |
| Cold start | ~15s | ~8s | ___ |
| Health check | Frontend only | Backend API | ___ |
