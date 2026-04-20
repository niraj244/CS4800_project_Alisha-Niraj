# VibeFit Backend — 1000+ Concurrent Users on Free Tier

## The constraint

Render free web service: **512 MB RAM, 0.1 CPU, sleeps after 15 min idle.**

MongoDB Atlas M0: **512 MB storage, ~500 max connections.**

## How we handle 1000+ concurrent browsers

### The key insight
1000 concurrent browsers ≠ 1000 concurrent API requests.

A user browsing the shop makes maybe one API call every few seconds, and most of those calls are for the same product listing data that doesn't change. With caching, the backend only sees a fraction of the browser traffic.

### Layer 1 — LRU in-memory cache
`lru-cache` caches hot GET responses (product listings, categories) for 60 seconds.

- Cache hit → response in <5ms, zero DB query
- With 1000 users browsing: ~80% cache hit rate → backend handles ~200 real DB queries/min instead of 1000+
- Cache is per-instance (in-memory), acceptable because the data is public and stale for max 60s

Implementation: `server/utils/cache.js` (add in Phase 3 when product controller is updated).

### Layer 2 — MongoDB connection pooling
`maxPoolSize: 20` in Mongoose connection options.

Atlas M0 supports ~500 connections. With one Render instance, 20 pooled connections are reused across all requests. Mongoose queues requests when all 20 are busy rather than opening new connections.

### Layer 3 — Keep-alive ping (prevent cold starts)
Render free tier sleeps after 15 minutes of no traffic.

**Fix**: Use [cron-job.org](https://cron-job.org) (free) to ping `https://vibefit-api.onrender.com/healthz` every 10 minutes.

Cold start time: ~20-30 seconds. With keep-alive, cold starts never happen during business hours.

### Layer 4 — Compression
`compression` middleware enabled. JSON responses are gzip'd before sending.

Typical product listing response: ~15KB uncompressed → ~3KB compressed. Reduces server bandwidth and network time.

### Layer 5 — DB query optimization
- MongoDB indexes on `Product.slug`, `Product.category`, `Product.price`, `Order.userId`, `Order.createdAt`, `User.email`
- No N+1 queries in paginated endpoints (single query + countDocuments)
- `totalSalesController` uses `$group` aggregation instead of loading all orders into JS heap

### Peak load estimate

| Scenario | Concurrent browsers | Actual API req/s | Cached req/s | DB req/s |
|---|---|---|---|---|
| Normal day | 100 | ~10 | ~8 | ~2 |
| Sale/launch | 1000 | ~100 | ~80 | ~20 |
| Viral spike | 3000 | ~300 | ~240 | ~60 |

At 60 DB req/s, Atlas M0 is fine. At 300 DB req/s, Atlas M0 may throttle — the caching layer is the buffer.

### What breaks at true scale (>2000 concurrent)

1. Single Render instance becomes CPU-bound. Fix: upgrade to Render Starter ($7/mo) or use Railway.
2. Atlas M0 connection limit. Fix: upgrade to Atlas M2 ($9/mo).
3. In-memory LRU cache not shared across instances. Fix: add Upstash Redis free tier.

For the current launch target of 1000 concurrent users, the free tier is sufficient.

## Environment setup checklist

- [ ] Create MongoDB Atlas M0 cluster
- [ ] Whitelist `0.0.0.0/0` in Atlas Network Access
- [ ] Create Atlas DB user with readWrite on `vibefit` database
- [ ] Deploy to Render using `render.yaml` blueprint
- [ ] Set all env vars in Render dashboard (never commit to git)
- [ ] Add cron-job.org ping to `/healthz` every 10 minutes
- [ ] Verify `/healthz` returns `{"status":"ok"}` after deploy
