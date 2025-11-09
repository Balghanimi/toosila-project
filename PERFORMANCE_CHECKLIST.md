# Performance Optimization Checklist

Use this checklist to track implementation of performance optimizations.

---

## Phase 1: Database Optimization

### Database Indexes
- [ ] Install dependencies (none needed for this)
- [ ] Review migration file: `server/migrations/006_add_performance_indexes.sql`
- [ ] Run migration: `npm run db:migrate:006`
- [ ] Verify indexes created (check migration output)
- [ ] Test query performance (should see faster queries in logs)

**Expected Time:** 5 minutes
**Expected Result:** Database queries 50-85% faster

---

## Phase 2: Redis Caching

### Redis Installation
- [ ] Install Redis dependency: `npm install redis`
- [ ] (Optional) Install Redis server locally
  - Windows: Download from https://github.com/microsoftarchive/redis/releases
  - Mac: `brew install redis`
  - Linux: `sudo apt-get install redis-server`
- [ ] Start Redis server: `redis-server`
- [ ] Test connection: `redis-cli ping` (should return PONG)

**OR**
- [ ] Skip Redis installation (app will work without it)

### Redis Configuration
- [ ] Add REDIS_URL to .env
- [ ] Add REDIS_ENABLED=true to .env
- [ ] Verify Redis files exist:
  - [ ] `server/config/redis.js`
  - [ ] `server/middlewares/cache.js`
- [ ] Check server.js imports Redis correctly
- [ ] Check routes use cache middleware

### Testing Redis
- [ ] Start server: `npm run dev`
- [ ] Look for "Redis: Successfully connected" in logs
  - OR "Redis: Running without cache" (if skipped Redis)
- [ ] Test endpoint: `curl -I http://localhost:5001/api/offers`
- [ ] Check for X-Cache header (first request: MISS, second: HIT)
- [ ] Verify faster response times on cached requests

**Expected Time:** 10-15 minutes
**Expected Result:** API responses 60-95% faster (when cached)

---

## Phase 3: Load Testing

### Installation
- [ ] Install load testing tools: `npm install artillery autocannon --save-dev`
- [ ] Verify test files exist:
  - [ ] `tests/load/api-load-test.yml`
  - [ ] `tests/load/stress-test.yml`
  - [ ] `tests/load/quick-test.sh`

### Running Tests
- [ ] Ensure server is running: `npm run dev`
- [ ] Run quick test: `npm run load:quick`
- [ ] Review results (should show >100 req/sec, <200ms avg latency)
- [ ] (Optional) Run full test: `npm run load:test`
- [ ] (Optional) Run stress test: `npm run load:stress`

### Baseline Metrics
- [ ] Record "before" metrics (if not already done)
- [ ] Record "after" metrics
- [ ] Compare improvements
- [ ] Document results

**Expected Time:** 10-20 minutes
**Expected Result:** Clear performance metrics, 100+ req/sec throughput

---

## Phase 4: Performance Monitoring

### Setup
- [ ] Verify performance middleware exists: `server/middlewares/performance.js`
- [ ] Add ENABLE_PERFORMANCE_TRACKING=true to .env (optional)
- [ ] Restart server

### Testing
- [ ] Make some API requests
- [ ] Check logs for performance metrics
- [ ] Look for X-Response-Time headers
- [ ] Check for slow request warnings (>1000ms)
- [ ] (Optional) Access metrics endpoint: `GET /api/health/performance`

**Expected Time:** 5 minutes
**Expected Result:** Detailed performance tracking and logging

---

## Phase 5: Frontend Optimization (Optional)

### Bundle Analysis
- [ ] Navigate to client directory: `cd client`
- [ ] Build project: `npm run build`
- [ ] Analyze bundle: `npx source-map-explorer 'build/static/js/*.js'`
- [ ] Identify large dependencies
- [ ] Review LazyRoutes example: `client/src/components/LazyRoutes.example.js`

### Implementation
- [ ] Implement lazy loading for routes
- [ ] Add React.Suspense with loading component
- [ ] Test lazy-loaded routes
- [ ] Rebuild and re-analyze bundle
- [ ] Compare before/after sizes

### Cleanup
- [ ] Run: `npx depcheck` (find unused dependencies)
- [ ] Remove unused packages
- [ ] Remove unused code
- [ ] Optimize images (if any)

**Expected Time:** 30-60 minutes
**Expected Result:** Bundle size reduced by 20-30%

---

## Phase 6: Production Deployment

### Pre-Deployment
- [ ] All tests passing
- [ ] Documentation reviewed
- [ ] Environment variables documented
- [ ] Rollback plan understood

### Railway Deployment
- [ ] Add Redis service in Railway dashboard
- [ ] Copy REDIS_URL to Railway environment variables
- [ ] Add REDIS_ENABLED=true to Railway environment
- [ ] Ensure DATABASE_URL is set (should already be)
- [ ] Deploy application

### Post-Deployment
- [ ] Check deployment logs for successful migration
- [ ] Verify Redis connection in logs
- [ ] Test health endpoint: `GET https://your-app.railway.app/api/health`
- [ ] Run load test against production (be gentle!)
- [ ] Monitor performance metrics

**Expected Time:** 15-30 minutes
**Expected Result:** Production deployment with all optimizations active

---

## Phase 7: Verification & Testing

### Functional Testing
- [ ] All existing features work
- [ ] No regressions detected
- [ ] User flows unchanged
- [ ] Error rates normal (<0.1%)

### Performance Testing
- [ ] Database queries faster (check logs)
- [ ] API responses faster (check headers)
- [ ] Cache hit rate 50-70% (check Redis stats)
- [ ] Load tests pass all thresholds
- [ ] Frontend loads faster (measure in browser)

### Monitoring Setup
- [ ] Performance metrics accessible
- [ ] Logs show performance data
- [ ] Slow request alerts working
- [ ] Cache stats available

**Expected Time:** 20-30 minutes
**Expected Result:** All tests passing, performance improved

---

## Completion Checklist

### Must-Have (Core Optimizations)
- [ ] Database indexes migrated
- [ ] Redis installed and configured (or consciously skipped)
- [ ] Cache middleware applied to routes
- [ ] Cache invalidation working
- [ ] Load testing tools installed
- [ ] Performance monitoring active

### Nice-to-Have (Additional Optimizations)
- [ ] Frontend bundle optimized
- [ ] Lazy loading implemented
- [ ] APM tool integrated
- [ ] Automated alerts set up
- [ ] CDN configured

### Documentation
- [ ] Read PERFORMANCE_OPTIMIZATION.md
- [ ] Read QUICK_START_PERFORMANCE.md
- [ ] Read PERFORMANCE_SUMMARY.md
- [ ] Team trained on new features
- [ ] Rollback procedures documented

---

## Success Metrics

Track these metrics before and after:

### Database Performance
- [ ] User login query time: ___ms → ___ms (Target: 95% faster)
- [ ] Offer search query time: ___ms → ___ms (Target: 70% faster)
- [ ] Booking lookup time: ___ms → ___ms (Target: 75% faster)

### API Performance
- [ ] GET /api/offers response: ___ms → ___ms (Target: 90% faster w/ cache)
- [ ] GET /api/demands response: ___ms → ___ms (Target: 90% faster w/ cache)
- [ ] Cache hit rate: 0% → ___% (Target: 50-70%)

### Frontend Performance
- [ ] Bundle size: ___KB → ___KB (Target: 20-30% smaller)
- [ ] Initial load time: ___s → ___s (Target: 30-40% faster)
- [ ] Time to interactive: ___s → ___s (Target: 30-40% faster)

### Infrastructure
- [ ] Throughput: ___req/sec → ___req/sec (Target: 100%+ increase)
- [ ] Error rate: ___% → ___% (Target: <0.1%)
- [ ] Database load: High → Low (Target: 50-70% reduction)

### Overall
- [ ] Performance score: 75/100 → ___/100 (Target: 90+/100)

---

## Troubleshooting

### Common Issues

**Issue:** Migration fails with "index already exists"
- [ ] Check if indexes already created
- [ ] Skip migration or drop and recreate

**Issue:** Redis won't connect
- [ ] Verify Redis server is running
- [ ] Check REDIS_URL is correct
- [ ] Check firewall settings
- [ ] OR disable Redis: `REDIS_ENABLED=false`

**Issue:** Cache not working
- [ ] Check Redis connection in logs
- [ ] Verify cache middleware applied to routes
- [ ] Check X-Cache headers in responses
- [ ] Test cache invalidation

**Issue:** Load tests failing
- [ ] Ensure server is running
- [ ] Check port is correct (5001)
- [ ] Review error messages
- [ ] Start with quick test first

**Issue:** Performance not improving
- [ ] Verify indexes created (check database)
- [ ] Verify Redis connected (check logs)
- [ ] Run load tests to measure
- [ ] Check slow query logs

---

## Timeline

Recommended implementation schedule:

### Day 1 (1-2 hours)
- [ ] Phase 1: Database Optimization
- [ ] Phase 2: Redis Caching (setup)

### Day 2 (1-2 hours)
- [ ] Phase 2: Redis Caching (testing)
- [ ] Phase 3: Load Testing

### Day 3 (1 hour)
- [ ] Phase 4: Performance Monitoring
- [ ] Phase 7: Verification

### Week 2 (optional)
- [ ] Phase 5: Frontend Optimization

### Week 3 (deployment)
- [ ] Phase 6: Production Deployment
- [ ] Final testing and monitoring

---

## Sign-Off

Once all items are checked:

- [ ] All optimizations implemented
- [ ] All tests passing
- [ ] Performance targets met (75% → 90%+)
- [ ] Documentation complete
- [ ] Team trained
- [ ] Monitoring active

**Project Lead Sign-Off:** _________________ Date: _______

**Developer Sign-Off:** _________________ Date: _______

**QA Sign-Off:** _________________ Date: _______

---

**Congratulations! Performance optimization complete! 🚀**

Performance Score: **90%+** ✅
