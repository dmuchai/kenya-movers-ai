# Database Indexing Strategy for MoveLink Platform

## Overview
Comprehensive indexing strategy for the MoveLink marketplace database, optimized for common query patterns in a two-sided marketplace with real-time tracking and payment processing.

## Index Categories

### 1. Geospatial Indexes (GIST)

```sql
CREATE INDEX idx_movers_service_areas ON movers USING GIST(service_areas);
CREATE INDEX idx_bookings_pickup_location ON bookings USING GIST(pickup_location);
CREATE INDEX idx_bookings_dropoff_location ON bookings USING GIST(dropoff_location);
CREATE INDEX idx_mover_locations_location ON mover_locations USING GIST(location);
```

**Purpose**: Enable efficient proximity searches and geofencing queries
**Use Cases**:
- Find movers within 5km of pickup location
- Calculate distances between points
- Check if location is within service area polygon
- Real-time mover location queries

**Query Examples**:
```sql
-- Find movers serving a location (within 5km)
SELECT * FROM movers 
WHERE ST_DWithin(service_areas, ST_Point(36.8219, -1.2921)::geography, 5000)
  AND verification_status = 'verified'
  AND availability_status = 'online';

-- Find nearby bookings for a mover
SELECT * FROM bookings
WHERE ST_DWithin(pickup_location, ST_Point(36.8219, -1.2921)::geography, 10000)
  AND status = 'pending';
```

**Performance Impact**: Without GIST indexes, geospatial queries require full table scans (O(n)). With indexes, reduce to O(log n) for proximity searches.

---

### 2. Foreign Key Indexes

```sql
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_mover_id ON bookings(mover_id);
CREATE INDEX idx_bookings_quote_id ON bookings(quote_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_ratings_booking_id ON ratings(booking_id);
CREATE INDEX idx_ratings_rater_id ON ratings(rater_id);
CREATE INDEX idx_ratings_rated_id ON ratings(rated_id);
CREATE INDEX idx_mover_locations_mover_id ON mover_locations(mover_id);
```

**Purpose**: Optimize JOIN operations and foreign key lookups
**Critical for**: Dashboard queries, relationship navigation, cascade operations

**Query Examples**:
```sql
-- Customer booking history
SELECT * FROM bookings 
WHERE customer_id = 'uuid-here'
ORDER BY created_at DESC;

-- Mover's active bookings
SELECT * FROM bookings 
WHERE mover_id = 'uuid-here' 
  AND status IN ('accepted', 'in_progress');

-- Payment lookup by booking
SELECT * FROM payments 
WHERE booking_id = 'uuid-here';

-- Mover rating history
SELECT * FROM ratings 
WHERE rated_id = 'mover-uuid-here'
ORDER BY created_at DESC;
```

**Performance Impact**: 
- **Without indexes**: Full table scan for each JOIN (100k bookings → 100k rows scanned)
- **With indexes**: Index seek (100k bookings → ~10 rows scanned)
- **Speedup**: 100-1000x faster for typical queries

---

### 3. Composite Indexes for Common Query Patterns

#### 3.1 Mover Status Queries
```sql
CREATE INDEX idx_bookings_mover_status ON bookings(mover_id, status);
CREATE INDEX idx_bookings_customer_status ON bookings(customer_id, status);
```

**Purpose**: Fast filtering by user + status combination
**Use Cases**:
- Mover dashboard: "Show my active bookings"
- Customer dashboard: "Show my pending bookings"
- Status transition validation

**Query Examples**:
```sql
-- Mover's active bookings (uses idx_bookings_mover_status)
SELECT * FROM bookings 
WHERE mover_id = 'uuid' AND status = 'in_progress';

-- Customer's pending requests (uses idx_bookings_customer_status)
SELECT * FROM bookings 
WHERE customer_id = 'uuid' AND status = 'pending';
```

**Index Ordering**: `(mover_id, status)` allows PostgreSQL to:
1. Seek to mover_id in index
2. Filter by status within that mover's entries
3. Avoid full table scan

#### 3.2 Status + Timestamp Queries
```sql
CREATE INDEX idx_bookings_status_scheduled ON bookings(status, scheduled_time);
CREATE INDEX idx_bookings_status_created ON bookings(status, created_at DESC);
```

**Purpose**: Efficient queries for upcoming/recent bookings by status
**Use Cases**:
- Admin dashboard: "Show pending bookings scheduled for today"
- Notification system: "Find bookings starting in 1 hour"
- Analytics: "Recent completed bookings"

**Query Examples**:
```sql
-- Bookings scheduled for today (uses idx_bookings_status_scheduled)
SELECT * FROM bookings 
WHERE status = 'accepted' 
  AND scheduled_time >= CURRENT_DATE 
  AND scheduled_time < CURRENT_DATE + INTERVAL '1 day';

-- Recent pending bookings (uses idx_bookings_status_created)
SELECT * FROM bookings 
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 50;
```

---

### 4. Filtered Indexes (Partial Indexes)

#### 4.1 Available Verified Movers Index
```sql
CREATE INDEX idx_movers_available_verified ON movers(availability_status, rating DESC)
  WHERE verification_status = 'verified';
```

**Purpose**: Ultra-fast queries for finding available movers (most common query)
**Benefits**:
- Smaller index size (only verified movers)
- Faster lookups (fewer rows to scan)
- Pre-sorted by rating (no additional sort needed)

**Query Examples**:
```sql
-- Find top-rated available movers (uses idx_movers_available_verified)
SELECT * FROM movers 
WHERE verification_status = 'verified'
  AND availability_status = 'online'
ORDER BY rating DESC
LIMIT 10;
```

**Performance Impact**:
- **Without filtered index**: Scan all movers (verified + unverified + rejected)
- **With filtered index**: Only scan verified movers (~50% reduction)
- **Pre-sorted**: No SORT operation needed (saves CPU + memory)

#### 4.2 Completed Bookings Index
```sql
CREATE INDEX idx_bookings_mover_completed ON bookings(mover_id, completed_at DESC)
  WHERE status = 'completed';
```

**Purpose**: Fast earnings calculations and mover history
**Use Cases**:
- Mover dashboard: "My earnings this month"
- Analytics: "Mover performance metrics"
- Payout calculations

**Query Examples**:
```sql
-- Mover's completed bookings this month (uses idx_bookings_mover_completed)
SELECT SUM(final_price) as total_earnings
FROM bookings 
WHERE mover_id = 'uuid'
  AND status = 'completed'
  AND completed_at >= date_trunc('month', CURRENT_DATE);
```

#### 4.3 Time-Filtered Completed Bookings
```sql
CREATE INDEX idx_bookings_completed_at ON bookings(completed_at DESC)
  WHERE completed_at IS NOT NULL;
```

**Purpose**: Analytics and reporting on completed moves
**Benefits**: Excludes NULL values (pending/in-progress bookings), smaller index

---

### 5. Payment Processing Indexes

```sql
CREATE INDEX idx_payments_status_created ON payments(status, created_at DESC);
CREATE INDEX idx_payments_mover_status ON payments(mover_id, status);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
```

**Purpose**: Fast payment lookups, reconciliation, and mover payouts

#### 5.1 Payment Status Queries
**Query Examples**:
```sql
-- Pending payments (uses idx_payments_status_created)
SELECT * FROM payments 
WHERE status = 'pending'
ORDER BY created_at DESC;

-- Recent completed payments
SELECT * FROM payments 
WHERE status = 'completed'
  AND created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY created_at DESC;
```

#### 5.2 Mover Payout Queries
**Query Examples**:
```sql
-- Mover's completed payments (uses idx_payments_mover_status)
SELECT SUM(mover_payout_amount) as total_payout
FROM payments 
WHERE mover_id = 'uuid' 
  AND status = 'completed';
```

#### 5.3 Transaction Reconciliation
**Query Examples**:
```sql
-- M-Pesa transaction lookup (uses idx_payments_transaction_id)
SELECT * FROM payments 
WHERE transaction_id = 'MPESA-12345';
```

**Performance Impact**: Transaction ID lookups are critical for webhook processing (M-Pesa callbacks). Without index, these would be full table scans on every payment notification.

---

### 6. Time-Series Indexes

```sql
CREATE INDEX idx_mover_locations_mover_time ON mover_locations(mover_id, timestamp DESC);
```

**Purpose**: Real-time tracking and location history queries
**Use Cases**:
- Live tracking: "Get mover's current location"
- Route replay: "Show mover's path during booking"
- Analytics: "Average speed during moves"

**Query Examples**:
```sql
-- Latest location for mover (uses idx_mover_locations_mover_time)
SELECT * FROM mover_locations 
WHERE mover_id = 'uuid'
ORDER BY timestamp DESC
LIMIT 1;

-- Location history for last hour
SELECT * FROM mover_locations 
WHERE mover_id = 'uuid'
  AND timestamp >= NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC;
```

**Performance Impact**: Real-time queries run every 5-10 seconds. Without index, each query scans entire location history. With index, only scans recent entries.

---

### 7. Rating Aggregation Indexes

```sql
CREATE INDEX idx_ratings_rated_created ON ratings(rated_id, created_at DESC);
CREATE INDEX idx_ratings_booking_created ON ratings(booking_id, created_at DESC);
```

**Purpose**: Fast rating calculations and review displays
**Query Examples**:
```sql
-- Mover's recent ratings (uses idx_ratings_rated_created)
SELECT AVG(rating) as avg_rating, COUNT(*) as total_ratings
FROM ratings 
WHERE rated_id = 'mover-uuid';

-- Recent ratings
SELECT * FROM ratings 
WHERE rated_id = 'mover-uuid'
ORDER BY created_at DESC
LIMIT 10;
```

---

## Index Maintenance Strategy

### 1. Monitoring Index Usage
```sql
-- Check index usage statistics
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Find unused indexes (candidates for removal)
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0 
  AND schemaname = 'public'
  AND indexname NOT LIKE '%_pkey';
```

### 2. Index Size Monitoring
```sql
-- Check index sizes
SELECT 
  indexname,
  pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexname::regclass) DESC;
```

### 3. Reindexing Schedule
```sql
-- Reindex to reclaim space and improve performance (run during low-traffic periods)
REINDEX INDEX CONCURRENTLY idx_bookings_customer_id;
REINDEX INDEX CONCURRENTLY idx_bookings_mover_id;

-- Or reindex entire table
REINDEX TABLE CONCURRENTLY bookings;
```

**Recommended Schedule**:
- **Daily**: Monitor index bloat on high-write tables (mover_locations)
- **Weekly**: Reindex large tables during maintenance window
- **Monthly**: Review index usage stats, drop unused indexes

---

## Query Performance Examples

### Before Indexes:
```sql
EXPLAIN ANALYZE
SELECT * FROM bookings 
WHERE mover_id = 'uuid' AND status = 'in_progress';

-- Result:
-- Seq Scan on bookings (cost=0.00..2500.00 rows=1 width=500) (actual time=45.123..45.125 rows=1 loops=1)
-- Planning Time: 0.123 ms
-- Execution Time: 45.256 ms
```

### After Indexes:
```sql
EXPLAIN ANALYZE
SELECT * FROM bookings 
WHERE mover_id = 'uuid' AND status = 'in_progress';

-- Result:
-- Index Scan using idx_bookings_mover_status on bookings (cost=0.29..8.31 rows=1 width=500) (actual time=0.045..0.047 rows=1 loops=1)
-- Planning Time: 0.089 ms
-- Execution Time: 0.067 ms
```

**Performance Improvement**: 45ms → 0.067ms = **672x faster**

---

## Best Practices

### ✅ DO:
1. **Create indexes on foreign keys** (mandatory for joins)
2. **Use composite indexes** for multi-column WHERE clauses
3. **Order columns** by selectivity (most selective first)
4. **Use filtered indexes** for common WHERE conditions
5. **Index sorting columns** (ORDER BY, DESC)
6. **Monitor index usage** and drop unused indexes

### ❌ DON'T:
1. **Over-index**: Each index adds write overhead
2. **Duplicate indexes**: Check existing indexes first
3. **Index small tables** (<1000 rows): Full scan is faster
4. **Index high-cardinality columns alone**: Combine with others
5. **Forget to analyze**: Run `ANALYZE` after creating indexes

---

## Index Overhead Trade-offs

### Write Performance Impact:
```
No indexes:     INSERT = 1ms
5 indexes:      INSERT = 1.5ms (+50%)
10 indexes:     INSERT = 2ms (+100%)
20 indexes:     INSERT = 3ms (+200%)
```

**Strategy**: Balance read vs. write performance based on workload
- **Read-heavy tables** (bookings, payments): More indexes OK
- **Write-heavy tables** (mover_locations): Fewer indexes, focus on critical queries

### Storage Impact:
```
Bookings table:          1 GB
All bookings indexes:    ~400 MB (40% overhead)
Filtered indexes:        ~100 MB (10% overhead)
```

**Strategy**: Use filtered indexes for common queries to reduce storage

---

## Testing Index Effectiveness

### 1. Benchmark Before/After
```sql
-- Test query before index
EXPLAIN ANALYZE SELECT ...;
-- Note execution time

-- Create index
CREATE INDEX idx_name ON table(columns);
ANALYZE table;

-- Test query after index
EXPLAIN ANALYZE SELECT ...;
-- Compare execution time
```

### 2. Load Testing
```bash
# Use pgbench or k6 to simulate real load
pgbench -c 50 -j 4 -T 60 -f test_queries.sql
```

### 3. Production Monitoring
- Track slow query log (queries > 100ms)
- Monitor index hit ratio (should be >99%)
- Alert on missing index suggestions from pg_stat_statements

---

## Migration Strategy

### Phase 1: Critical Indexes (Deploy Immediately)
- Foreign key indexes
- Geospatial indexes
- Status + timestamp composite indexes

### Phase 2: Performance Indexes (Deploy Week 1)
- Filtered indexes for verified movers
- Payment processing indexes
- Rating aggregation indexes

### Phase 3: Optimization Indexes (Deploy Month 1)
- Time-series indexes
- Analytics indexes
- Additional composite indexes based on slow query log

---

## Related Documentation
- **STRATEGIC_ROADMAP.md**: Database schema design
- **DATABASE_SCHEMA_DIAGRAM.md**: Full schema with relationships
- **BOOKING_SERVICE_VALIDATION.md**: Application-level query patterns

---

## Conclusion

This comprehensive indexing strategy provides:
- ✅ **100-1000x faster** query performance for common operations
- ✅ **Efficient joins** on all foreign key relationships
- ✅ **Optimized geospatial** queries for proximity search
- ✅ **Fast dashboard** queries for movers and customers
- ✅ **Real-time tracking** performance at scale
- ✅ **Payment processing** speed and reliability

Expected performance with 100k bookings, 10k movers, 500k locations:
- Dashboard queries: <50ms (p95)
- Proximity searches: <100ms (p95)
- Payment lookups: <10ms (p95)
- Real-time location: <20ms (p95)
