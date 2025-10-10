# Database Schema Migration Guide
## MoveLink Marketplace - Uber-like Moving Platform

---

## 📋 Overview

This guide walks you through executing the comprehensive database schema redesign that transforms MoveLink from a quote generator to a full two-sided marketplace platform.

---

## 🎯 What's Being Created

### **New Tables (8 total)**
1. **movers** - Mover profiles, verification, availability
2. **bookings** - Customer booking requests and job tracking
3. **payments** - Payment transactions, escrow, commissions
4. **ratings** - Two-way ratings between customers and movers
5. **mover_locations** - Real-time GPS tracking
6. **mover_availability_schedule** - Mover working hours
7. **booking_requests** - Pending mover assignments
8. **notifications** - In-app and push notifications

### **Custom Types (6 enums)**
- `verification_status` - Mover verification states
- `availability_status` - Online/offline/busy
- `booking_status` - Booking lifecycle states
- `payment_status` - Payment processing states
- `payment_method` - M-Pesa, card, cash, etc.
- `vehicle_type` - Types of moving vehicles

### **Helper Functions (5 total)**
- `find_nearby_movers()` - Proximity search
- `calculate_distance_km()` - Distance calculations
- `is_location_in_service_area()` - Service area checking
- `get_mover_stats()` - Performance analytics
- `get_platform_stats()` - Business intelligence

### **Row Level Security (RLS)**
- Comprehensive policies for all tables
- Customer/mover/admin role separation
- Secure data access controls

---

## 🚀 Step-by-Step Execution

### **Step 1: Backup Your Current Database**

Before making any changes, create a backup:

```bash
# In Supabase Dashboard
1. Go to Database → Backups
2. Click "Create Backup"
3. Wait for completion
4. Note the backup timestamp
```

**Or via CLI:**
```bash
supabase db dump > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

### **Step 2: Verify PostGIS Extension (REQUIRED - Fail Fast)**

⚠️ **CRITICAL**: The schema requires PostGIS for geospatial features. Verify it's enabled **BEFORE** running any migrations to fail fast if missing.

**Why check first?** If PostGIS is not enabled, all migrations will fail with geography/geometry type errors. Checking now saves time and prevents partial migration failures.

#### **Check if PostGIS is enabled:**
```sql
-- Run this in SQL Editor
SELECT 
  extname AS extension_name,
  extversion AS version,
  'PostGIS is enabled ✓' AS status
FROM pg_extension 
WHERE extname = 'postgis';
```

**Expected Result:**
```
extension_name | version | status
postgis        | 3.x.x   | PostGIS is enabled ✓
```

#### **If NOT enabled (no rows returned):**
```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify it was enabled
SELECT extname, extversion FROM pg_extension WHERE extname = 'postgis';
```

**After enabling**, you should see:
- `postgis` extension listed
- Version 3.0 or higher recommended

#### **Troubleshooting:**
- **Error: "permission denied"** → Contact your Supabase admin or check project permissions
- **Extension not available** → PostGIS should be available by default in Supabase; contact support
- **Version < 3.0** → Still usable, but update recommended for better performance

✅ **Checkpoint**: Only proceed to Step 3 if PostGIS is confirmed enabled.

---

### **Step 3: Access Supabase SQL Editor**

1. Open your Supabase project dashboard at `https://supabase.com/dashboard`
2. Select your project from the project list
3. In the left sidebar, look for the **SQL Editor** icon (it looks like a database or terminal icon)
4. Click on **SQL Editor** to open the SQL query interface
5. You should see:
   - A query editor panel in the center
   - A "Run" button (or use Ctrl+Enter / Cmd+Enter to execute)
   - Optional: A history of previous queries on the left

**Tip**: The SQL Editor is typically located below "Database" and above "Functions" in the sidebar menu.

---

### **Step 4: Execute Migration Part 1 (Core Tables)**

**File**: `supabase/migrations/20251008_part1_marketplace_schema.sql`

1. Open the file in your code editor
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **"Run"** button (or press Ctrl+Enter)
5. Wait for completion (should take ~10-15 seconds)

**Expected Output:**
```
Success. No rows returned
```

**Verify Part 1 Completion:**
```sql
-- Run this query to verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('movers', 'bookings');
```

**Expected Result:**
```
 table_name 
------------
 movers
 bookings
```

---

### **Step 5: Execute Migration Part 2 (Additional Tables)**

**File**: `supabase/migrations/20251008_part2_marketplace_schema.sql`

1. Copy the entire contents of Part 2
2. Paste into SQL Editor (clear previous query first)
3. Click **"Run"**
4. Wait for completion (~10 seconds)

**Verify Part 2 Completion:**
```sql
-- Check all new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected Tables:**
- bookings
- booking_requests
- mover_availability_schedule
- mover_locations
- movers
- notifications
- payments
- quotes (existing)
- profiles (existing)
- ratings

---

### **Step 6: Execute Migration Part 3 (RLS & Functions)**

**File**: `supabase/migrations/20251008_part3_rls_and_functions.sql`

1. Copy Part 3 contents
2. Paste into SQL Editor
3. Click **"Run"**
4. Wait for completion (~15-20 seconds)

**Verify Part 3 Completion:**

**Check RLS is enabled:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('movers', 'bookings', 'payments');
```

**Expected Result:**
```
  tablename  | rowsecurity 
-------------+-------------
 movers      | t
 bookings    | t
 payments    | t
```

**Check functions were created:**
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%mover%';
```

**Expected Functions:**
- find_nearby_movers
- get_mover_stats
- is_location_in_service_area
- update_mover_rating
- update_mover_current_location
- etc.

---

### **Step 7: PostGIS Extension Verification Complete**

✅ **Note**: PostGIS extension verification was completed in **Step 2**. If you skipped that step, go back and verify PostGIS is enabled before proceeding.

All geospatial functions (geography, geometry types, ST_* functions) should now be available.

---

### **Step 8: Insert Sample Data (Optional but Recommended)**

Create test data to verify everything works.

**⚠️ IMPORTANT**: The `auth.uid()` function returns `NULL` when run from the SQL Editor because the SQL session is not authenticated through Supabase Auth. You must retrieve a valid user ID first.

#### **Get a Valid User ID**

Run this query to find an existing user:
```sql
-- Get the first user from your auth.users table
SELECT id, email 
FROM auth.users 
LIMIT 1;
```

**Copy the `id` value** (it will look like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

If no users exist, you need to create one through your application's sign-up flow first, or create one manually:
```sql
-- Optional: Create a test user (if none exist)
-- You'll need to use Supabase Auth API or your app's sign-up for proper user creation
```

#### **Insert Test Mover**

**Replace `'YOUR_USER_ID_HERE'`** with the actual user ID you copied above:

```sql
-- Insert a test mover
INSERT INTO public.movers (
  user_id,
  business_name,
  phone_primary,
  vehicle_types,
  service_radius_km,
  verification_status
) VALUES (
  'YOUR_USER_ID_HERE'::uuid, -- Replace with actual user ID from auth.users
  'Test Movers Kenya',
  '+254712345678',
  ARRAY['pickup', 'box_truck_small']::vehicle_type[],
  15,
  'verified'
);

-- Verify insertion
SELECT id, business_name, verification_status, user_id
FROM public.movers 
WHERE business_name = 'Test Movers Kenya';
```

**Alternative**: If you want to use `auth.uid()` dynamically (though it will be NULL in SQL Editor):
```sql
-- This uses COALESCE to provide a fallback
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Try to get current auth user, fallback to first user in system
  v_user_id := COALESCE(
    auth.uid(),
    (SELECT id FROM auth.users LIMIT 1)
  );
  
  -- Insert with the resolved user_id
  INSERT INTO public.movers (
    user_id,
    business_name,
    phone_primary,
    vehicle_types,
    service_radius_km,
    verification_status
  ) VALUES (
SELECT COUNT(*) as function_count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND (routine_name LIKE '%mover%' OR routine_name LIKE '%booking%');
    'Test Movers Kenya',
    '+254712345678',
    ARRAY['pickup', 'box_truck_small']::vehicle_type[],
    15,
    'verified'
  );
  
  RAISE NOTICE 'Inserted test mover with user_id: %', v_user_id;
END $$;

-- Verify insertion
SELECT id, business_name, verification_status, user_id
FROM public.movers 
WHERE business_name = 'Test Movers Kenya';
```

---

## 🔍 Verification Checklist

After completing all migrations, verify:

### ✅ **Tables Created**
```sql
SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'movers', 'bookings', 'payments', 'ratings', 
    'mover_locations', 'mover_availability_schedule',
    'booking_requests', 'notifications'
  );
```
**Expected**: `table_count = 8`

### ✅ **Enums Created**
```sql
SELECT typname FROM pg_type 
WHERE typname IN (
  'verification_status', 'availability_status', 
  'booking_status', 'payment_status'
);
```
**Expected**: 4+ enum types

### ✅ **Indexes Created**
```sql
SELECT COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('movers', 'bookings', 'payments');
```
**Expected**: 30+ indexes

### ✅ **RLS Policies**
```sql
SELECT COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public';
```
**Expected**: 25+ policies

### ✅ **Functions Created**
```sql
SELECT COUNT(*) as function_count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%mover%' OR routine_name LIKE '%booking%';
```
**Expected**: 10+ functions

---

## 🚨 Troubleshooting

### **Error: "relation already exists"**
-- Check existing tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- WARNING: DROP CASCADE will permanently delete the table, all data,
-- and ALL dependent objects (foreign keys, views, triggers, etc.)
-- This cannot be undone without a backup!
-- Only run this if you're certain you want to start fresh:
DROP TABLE IF EXISTS public.movers CASCADE;
-- Then re-run migration
```sql
-- Drop and recreate
DROP TYPE IF EXISTS verification_status CASCADE;
-- Then re-run migration
```

### **Error: "extension postgis does not exist"**
**Solution**: PostGIS not installed.
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### **Error: "permission denied"**
**Solution**: You may not have admin access.
- Verify you're logged in as project owner
- Check Supabase dashboard for proper permissions

### **Slow Query Execution**
**Solution**: Large migration may take time.
- Wait 30-60 seconds
- Check Supabase dashboard for any error notifications
- Review Supabase logs: Database → Logs

---

## 📊 Post-Migration Testing

### **Test 1: Create a Mover Profile**
```sql
INSERT INTO public.movers (
  user_id, business_name, phone_primary, 
  vehicle_types, verification_status
) VALUES (
  'your-user-id-here',
  'Test Moving Company',
  '+254700000000',
  ARRAY['pickup']::vehicle_type[],
  'verified'
) RETURNING *;
```

### **Test 2: Find Nearby Movers**
```sql
-- Find movers near Nairobi CBD
SELECT * FROM find_nearby_movers(
  ST_GeographyFromText('POINT(36.8219 -1.2921)'),
  20, -- 20km radius
  3.0  -- min rating 3.0
);
```

### **Test 3: Create a Test Booking**
```sql
INSERT INTO public.bookings (
  customer_id,
  pickup_address,
  pickup_location,
  dropoff_address,
  dropoff_location,
  scheduled_date,
  scheduled_time_start,
  property_size,
  estimated_price
) VALUES (
  'your-user-id',
  'Westlands, Nairobi',
  ST_GeographyFromText('POINT(36.8095 -1.2672)'),
  'Kilimani, Nairobi',
  ST_GeographyFromText('POINT(36.7871 -1.2944)'),
  CURRENT_DATE + INTERVAL '7 days',
  '09:00:00',
  '2BR',
  25000.00
) RETURNING *;
```

### **Test 4: Verify RLS is Working**
```sql
-- As a customer, try to view all movers (should only see verified ones)
SELECT COUNT(*) FROM public.movers WHERE verification_status = 'verified';

-- Try to update another user's mover profile (should fail)
UPDATE public.movers 
SET business_name = 'Hacked!' 
WHERE user_id != auth.uid();
-- Expected: 0 rows updated (RLS blocking)
```

---

## 🔄 Rollback Plan

If something goes wrong, restore from backup:

### **Option 1: Supabase Dashboard (RECOMMENDED)**
1. Go to Database → Backups
2. Find your pre-migration backup
3. Click "Restore"
4. Confirm restoration

---

### **Option 2: SQL Rollback**

```sql
/*
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║                    ⚠️  CRITICAL WARNING - READ THIS FIRST ⚠️              ║
║                                                                           ║
║  THE FOLLOWING OPERATIONS ARE IRREVERSIBLE AND WILL PERMANENTLY DELETE:  ║
║                                                                           ║
║  • ALL TABLES (movers, bookings, payments, ratings, etc.)                ║
║  • ALL DATA stored in those tables                                       ║
║  • ALL FOREIGN KEY RELATIONSHIPS                                         ║
║  • ALL INDEXES, TRIGGERS, AND CONSTRAINTS                                ║
║  • ALL ROW-LEVEL SECURITY POLICIES                                       ║
║                                                                           ║
║  ⛔ MANDATORY STEPS BEFORE PROCEEDING:                                    ║
║                                                                           ║
║  1. CREATE A FULL DATABASE BACKUP                                        ║
║     → Supabase Dashboard > Database > Backups > Create Backup            ║
║                                                                           ║
║  2. VERIFY YOU ARE IN THE CORRECT ENVIRONMENT                            ║
║     → Run: SELECT current_database();                                    ║
║     → CONFIRM this is NOT your production database                       ║
║                                                                           ║
║  3. EXPORT CRITICAL DATA (if needed for recovery)                        ║
║     → Run: COPY (SELECT * FROM public.movers) TO '/tmp/movers.csv';     ║
║     → Repeat for other tables you need to preserve                       ║
║                                                                           ║
║  4. REQUIRED CONFIRMATION - Type this command first:                     ║
║     → SELECT 'I confirm this is NOT production and I have a backup'      ║
║          AS confirmation;                                                ║
║                                                                           ║
║  5. ONLY AFTER COMPLETING STEPS 1-4, uncomment and run the DROP commands ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
*/

-- STEP 1: VERIFY ENVIRONMENT (REQUIRED)
SELECT 
  current_database() AS database_name,
  current_user AS current_user,
  version() AS postgres_version;

-- STEP 2: CONFIRMATION (REQUIRED - READ THE WARNING ABOVE)
SELECT 'I confirm this is NOT production and I have a backup' AS confirmation;

-- STEP 3: UNCOMMENT THE FOLLOWING LINES TO EXECUTE ROLLBACK
-- ⚠️  WARNING: Remove the '--' comment prefix ONLY after completing verification steps

-- Drop all new tables (CASCADE will delete dependent objects)
-- DROP TABLE IF EXISTS public.notifications CASCADE;
-- DROP TABLE IF EXISTS public.booking_requests CASCADE;
-- DROP TABLE IF EXISTS public.mover_availability_schedule CASCADE;
-- DROP TABLE IF EXISTS public.mover_locations CASCADE;
-- DROP TABLE IF EXISTS public.ratings CASCADE;
-- DROP TABLE IF EXISTS public.payments CASCADE;
-- DROP TABLE IF EXISTS public.bookings CASCADE;
-- DROP TABLE IF EXISTS public.movers CASCADE;

-- Drop enums (CASCADE will handle dependencies)
-- DROP TYPE IF EXISTS verification_status CASCADE;
-- DROP TYPE IF EXISTS availability_status CASCADE;
-- DROP TYPE IF EXISTS booking_status CASCADE;
-- DROP TYPE IF EXISTS payment_status CASCADE;
-- DROP TYPE IF EXISTS payment_method CASCADE;
-- DROP TYPE IF EXISTS vehicle_type CASCADE;
-- DROP TYPE IF EXISTS rating_type CASCADE;

-- STEP 4: VERIFY ROLLBACK COMPLETION
-- SELECT COUNT(*) as remaining_tables
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
--   AND table_name IN (
--     'movers', 'bookings', 'payments', 'ratings', 
--     'mover_locations', 'mover_availability_schedule',
--     'booking_requests', 'notifications'
--   );
-- Expected: remaining_tables = 0

/*
╔═══════════════════════════════════════════════════════════════════════════╗
║  ✅ IF ROLLBACK SUCCESSFUL:                                               ║
║     • All tables should be removed                                        ║
║     • All data is permanently deleted                                     ║
║     • You can now restore from backup or re-run migrations                ║
║                                                                           ║
║  ⛔ IF YOU MADE A MISTAKE:                                                 ║
║     • STOP IMMEDIATELY                                                    ║
║     • Restore from your backup (Option 1 above)                           ║
║     • Contact your database administrator if unsure                       ║
╚═══════════════════════════════════════════════════════════════════════════╝
*/
```

---

## 📈 Next Steps After Migration

1. **Update Application Code**
   - Update TypeScript types to match new schema
   - Implement mover registration flow
   - Build booking creation components
   - Add real-time location tracking

2. **Test All User Flows**
   - Customer registration → booking creation
   - Mover registration → profile verification
   - Booking acceptance → job completion
   - Payment processing → payout

3. **Populate Initial Data**
   - Add verified movers (seed data)
   - Create test bookings
   - Set up mover availability schedules

4. **Monitor Performance**
   - Check query performance with `EXPLAIN ANALYZE`
   - Monitor index usage
   - Optimize slow queries

---

## 💡 Pro Tips

1. **Run migrations during low traffic** to avoid disruptions
2. **Test in development environment first** before production
3. **Keep the SQL files** in version control for future reference
4. **Document any custom changes** you make to the schema
5. **Set up database monitoring** to track performance post-migration

---

## 📚 Additional Resources

- [Supabase SQL Editor Docs](https://supabase.com/docs/guides/database/sql-editor)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Success Confirmation

You'll know the migration was successful when:

1. All 8 tables are created and visible in Database → Tables
2. Sample queries return data without errors
3. RLS policies block unauthorized access appropriately
4. Geospatial functions work (find_nearby_movers returns results)
5. No error messages in Supabase logs

**Congratulations! Your database is now ready for a full marketplace platform! 🎉**

---

## 🆘 Need Help?

If you encounter issues:

1. Check Supabase dashboard logs: Database → Logs
2. Review this guide's troubleshooting section
3. Test queries one at a time to isolate errors
4. Verify your Supabase project has sufficient permissions
5. Check Supabase status page for any ongoing issues

---

**Document Version**: 1.0  
**Last Updated**: October 8, 2025  
**Compatible With**: Supabase PostgreSQL 15+