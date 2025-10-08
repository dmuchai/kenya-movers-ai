# RLS GRANT Permissions Fix - Movers Table

## Overview
Fixed missing GRANT permissions for the `movers` table to allow INSERT and UPDATE operations required by RLS policies. Without these base privileges, the RLS policies for mover profile creation and updates would be ineffective.

## Problem

**Original GRANT Statement (Line 532):**
```sql
GRANT SELECT ON public.movers TO authenticated;
```

**Issues:**
1. ❌ **Missing INSERT privilege** - Users cannot create mover profiles
2. ❌ **Missing UPDATE privilege** - Movers cannot update their own profiles
3. ❌ **RLS policies ineffective** - Even if policies allow operations, base privileges are missing
4. ❌ **Silent failures** - Operations fail with "permission denied" errors

### RLS Policies That Require These Privileges

#### 1. "Users can create mover profile" (INSERT)
```sql
CREATE POLICY "Users can create mover profile"
  ON public.movers FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**Without INSERT grant:**
```sql
-- User attempts to create mover profile
INSERT INTO public.movers (user_id, business_name, phone_primary, ...)
VALUES (auth.uid(), 'Test Movers', '+254712345678', ...);

-- ❌ Error: permission denied for table movers
```

#### 2. "Movers can update own profile" (UPDATE)
```sql
CREATE POLICY "Movers can update own profile"
  ON public.movers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Without UPDATE grant:**
```sql
-- Mover attempts to update their profile
UPDATE public.movers
SET business_name = 'Updated Business Name'
WHERE user_id = auth.uid();

-- ❌ Error: permission denied for table movers
```

## Solution

**Updated GRANT Statement (Line 532):**
```sql
GRANT SELECT, INSERT, UPDATE ON public.movers TO authenticated;
```

**Why these privileges:**
- ✅ **SELECT** - View mover profiles (public + own)
- ✅ **INSERT** - Create new mover profiles (mover registration)
- ✅ **UPDATE** - Update own mover profile (profile management)
- ❌ **DELETE** - Not granted (soft delete via `deleted_at` column, admin-only)

## Understanding PostgreSQL RLS + GRANT Interaction

### Two-Layer Security Model

PostgreSQL security works with **two layers**:

#### Layer 1: Base Privileges (GRANT/REVOKE)
```sql
GRANT SELECT, INSERT, UPDATE ON table TO role;
```
- **Purpose:** Controls **what operations are possible** at all
- **Scope:** Table-level permissions
- **Applied first:** Before RLS policies are evaluated

#### Layer 2: Row Level Security (RLS Policies)
```sql
CREATE POLICY "policy_name" ON table FOR operation USING (condition);
```
- **Purpose:** Controls **which rows** can be accessed/modified
- **Scope:** Row-level permissions
- **Applied second:** Only if base privileges exist

### How They Work Together

```
User attempts operation
         ↓
1. Check GRANT privileges (Layer 1)
   ├─ Has privilege? → Continue to Layer 2
   └─ No privilege? → ❌ PERMISSION DENIED (stop here)
         ↓
2. Check RLS policies (Layer 2)
   ├─ Policy allows? → ✅ Operation succeeds
   └─ Policy denies? → ❌ No rows affected (or error)
```

### Example: INSERT Operation

**Scenario:** User creating mover profile

```sql
INSERT INTO public.movers (user_id, business_name, phone_primary)
VALUES (auth.uid(), 'Test Movers', '+254712345678');
```

**With complete setup (GRANT + RLS):**
```
1. Check base privileges:
   ✅ User has INSERT privilege (via GRANT)
   
2. Check RLS policy "Users can create mover profile":
   Policy condition: WITH CHECK (auth.uid() = user_id)
   ✅ auth.uid() matches user_id in INSERT data
   
3. Result: ✅ Row inserted successfully
```

**With only RLS (no GRANT):**
```
1. Check base privileges:
   ❌ User has NO INSERT privilege
   
2. RLS policy is never evaluated (stopped at Layer 1)
   
3. Result: ❌ ERROR: permission denied for table movers
```

**With only GRANT (no RLS):**
```
1. Check base privileges:
   ✅ User has INSERT privilege
   
2. RLS is not enabled
   ✅ Any INSERT succeeds (no row-level filtering)
   
3. Result: ⚠️ Security risk - users can insert data for other users
```

## Comparison with Other Tables

### Current GRANT Statements

| Table | SELECT | INSERT | UPDATE | DELETE | Rationale |
|-------|--------|--------|--------|--------|-----------|
| `movers` | ✅ | ✅ | ✅ | ❌ | Users create/update profiles; no direct delete (soft delete) |
| `bookings` | ✅ | ✅ | ✅ | ❌ | Customers create/update bookings; no direct delete |
| `payments` | ✅ | ❌ | ❌ | ❌ | Read-only for users; created by system (service role) |
| `ratings` | ✅ | ✅ | ✅ | ❌ | Users create/update ratings; no delete (moderation) |
| `mover_locations` | ✅ | ✅ | ❌ | ❌ | Movers insert location updates; immutable history |
| `booking_requests` | ✅ | ❌ | ✅ | ❌ | Movers respond to requests; created by system |
| `notifications` | ✅ | ❌ | ✅ | ✅ | Users read/delete notifications; created by system |
| `mover_availability_schedule` | ✅ | ✅ | ✅ | ✅ | Full CRUD for movers' own schedules |

### Why `movers` Table Needs INSERT and UPDATE

1. **INSERT - Mover Registration Flow:**
   ```typescript
   // User registers as mover (frontend)
   const { data, error } = await supabase
     .from('movers')
     .insert({
       user_id: user.id,  // RLS: Must match auth.uid()
       business_name: 'Swift Movers',
       phone_primary: '+254712345678',
       // ... other fields
     });
   
   // Without INSERT grant: permission denied ❌
   // With INSERT grant: RLS policy evaluated ✅
   ```

2. **UPDATE - Profile Management:**
   ```typescript
   // Mover updates their profile
   const { data, error } = await supabase
     .from('movers')
     .update({
       business_name: 'Swift Movers Kenya',
       bio: 'Professional moving services...',
       availability_status: 'online'
     })
     .eq('user_id', user.id);  // RLS: Ensures updating own profile
   
   // Without UPDATE grant: permission denied ❌
   // With UPDATE grant: RLS policy evaluated ✅
   ```

3. **SELECT - Profile Viewing:**
   ```typescript
   // Public views mover profiles
   const { data, error } = await supabase
     .from('movers')
     .select('*')
     .eq('verification_status', 'verified');  // RLS: Only verified profiles
   
   // SELECT grant was already present ✅
   ```

## Before vs After Behavior

### BEFORE Fix (Missing INSERT/UPDATE)

#### Mover Registration
```typescript
// User attempts to create mover profile
const { data, error } = await supabase.from('movers').insert({
  user_id: user.id,
  business_name: 'Test Movers',
  phone_primary: '+254712345678'
});

console.log(error);
// ❌ {
//   message: "permission denied for table movers",
//   code: "42501"  // Insufficient privilege
// }
```

#### Profile Update
```typescript
// Mover attempts to update profile
const { data, error } = await supabase
  .from('movers')
  .update({ business_name: 'New Name' })
  .eq('user_id', user.id);

console.log(error);
// ❌ {
//   message: "permission denied for table movers",
//   code: "42501"
// }
```

### AFTER Fix (With INSERT/UPDATE)

#### Mover Registration
```typescript
// User creates mover profile
const { data, error } = await supabase.from('movers').insert({
  user_id: user.id,  // Must match auth.uid() per RLS
  business_name: 'Test Movers',
  phone_primary: '+254712345678'
});

console.log(data);
// ✅ {
//   id: 'uuid',
//   user_id: 'user-uuid',
//   business_name: 'Test Movers',
//   verification_status: 'pending',
//   ...
// }
```

#### Profile Update
```typescript
// Mover updates their profile
const { data, error } = await supabase
  .from('movers')
  .update({ 
    business_name: 'New Name',
    bio: 'Updated bio' 
  })
  .eq('user_id', user.id);

console.log(data);
// ✅ [{ id: 'uuid', business_name: 'New Name', ... }]
```

#### Unauthorized Update (Blocked by RLS)
```typescript
// User tries to update someone else's profile
const { data, error } = await supabase
  .from('movers')
  .update({ rating: 5.0 })  // Try to boost rating
  .eq('id', 'other-mover-id');

console.log(data);
// ✅ [] - No rows updated (RLS policy blocks)
// No error thrown, but operation has no effect
```

## Testing Recommendations

### Test 1: Verify Base Privileges

```sql
-- Check current privileges for authenticated role
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'movers'
  AND grantee = 'authenticated';

-- Expected results:
-- ✅ SELECT
-- ✅ INSERT
-- ✅ UPDATE
```

### Test 2: Test Mover Registration (INSERT)

```typescript
import { createClient } from '@supabase/supabase-js';

// Test as authenticated user
const supabase = createClient(url, anonKey);

// 1. Sign up user
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: 'testmover@example.com',
  password: 'password123'
});

if (authError) throw authError;

// 2. Create mover profile
const { data, error } = await supabase.from('movers').insert({
  user_id: authData.user.id,
  business_name: 'Test Movers Ltd',
  phone_primary: '+254712345678',
  vehicle_types: ['pickup']
});

console.assert(error === null, 'INSERT should succeed');
console.assert(data !== null, 'Data should be returned');
console.log('✅ Mover registration successful:', data);
```

### Test 3: Test Profile Update (UPDATE)

```typescript
// As authenticated mover
const { data, error } = await supabase
  .from('movers')
  .update({
    business_name: 'Updated Business Name',
    bio: 'New bio description',
    availability_status: 'online'
  })
  .eq('user_id', authData.user.id)
  .select();

console.assert(error === null, 'UPDATE should succeed');
console.assert(data.length > 0, 'Should update one row');
console.log('✅ Profile update successful:', data);
```

### Test 4: Test RLS Protection (UPDATE)

```typescript
// Try to update another mover's profile (should be blocked by RLS)
const { data, error } = await supabase
  .from('movers')
  .update({ rating: 5.0 })  // Try to manipulate rating
  .eq('id', 'some-other-mover-id')
  .select();

console.assert(data.length === 0, 'Should not update any rows');
console.log('✅ RLS protection working: unauthorized update blocked');
```

### Test 5: Test Public SELECT

```typescript
// As unauthenticated user (or authenticated)
const { data, error } = await supabase
  .from('movers')
  .select('id, business_name, rating, total_moves')
  .eq('verification_status', 'verified');

console.assert(error === null, 'SELECT should succeed');
console.assert(data.length >= 0, 'Should return verified movers');
console.log('✅ Public profile viewing works:', data);
```

## Common Errors Without Proper GRANTs

### Error 1: Permission Denied on INSERT
```
PostgresError: permission denied for table movers
CODE: 42501
```

**Cause:** Missing `INSERT` privilege
**Fix:** `GRANT INSERT ON public.movers TO authenticated;`

### Error 2: Permission Denied on UPDATE
```
PostgresError: permission denied for table movers
CODE: 42501
```

**Cause:** Missing `UPDATE` privilege
**Fix:** `GRANT UPDATE ON public.movers TO authenticated;`

### Error 3: Silent Failure (No Error, No Rows)
```typescript
const { data, error } = await supabase.from('movers').update({ ... });
// error: null
// data: []  <-- No rows updated
```

**Cause:** RLS policy blocks operation (not a GRANT issue)
**Check:** Verify RLS policy conditions are met (e.g., `auth.uid() = user_id`)

## PostgreSQL Roles Hierarchy

```
postgres (superuser)
  ├─ supabase_admin (service role)
  │    └─ Full access to all tables
  │
  ├─ authenticator (connection pooler role)
  │    └─ Limited, switches to other roles
  │
  ├─ authenticated (logged-in users)
  │    ├─ Privileges: GRANT statements control base access
  │    └─ RLS: Policies control row-level access
  │
  └─ anon (anonymous users)
       ├─ Privileges: Typically read-only
       └─ RLS: More restrictive policies
```

## Security Best Practices

### 1. Always Use Both GRANT and RLS
```sql
-- ❌ Bad: Only GRANT (no row filtering)
GRANT ALL ON table TO authenticated;

-- ❌ Bad: Only RLS (base privileges missing)
CREATE POLICY "policy" ON table USING (...);

-- ✅ Good: GRANT + RLS (defense in depth)
GRANT SELECT, INSERT, UPDATE ON table TO authenticated;
CREATE POLICY "policy" ON table USING (...);
```

### 2. Principle of Least Privilege
```sql
-- ❌ Too permissive
GRANT ALL ON public.movers TO authenticated;

-- ✅ Just what's needed
GRANT SELECT, INSERT, UPDATE ON public.movers TO authenticated;
-- No DELETE (use soft delete via deleted_at column)
```

### 3. Separate Service Role Operations
```sql
-- ❌ Don't grant to authenticated
GRANT INSERT ON public.payments TO authenticated;

-- ✅ Payments created by backend via service role
-- Users only have SELECT to view their own payments
GRANT SELECT ON public.payments TO authenticated;
```

### 4. Test with Actual Users
```typescript
// Test with different roles
await testAsAuthenticatedUser();
await testAsAnonymousUser();
await testAsServiceRole();
```

## Migration Safety

### Safe to Apply
✅ **Yes** - This is a GRANT statement that adds privileges

### No Breaking Changes
✅ **Additive change** - Only grants new privileges, doesn't revoke existing ones

### Rollback (If Needed)
```sql
-- Remove INSERT and UPDATE privileges (revert to original)
REVOKE INSERT, UPDATE ON public.movers FROM authenticated;

-- Keep only SELECT
GRANT SELECT ON public.movers TO authenticated;
```

### Verification Query
```sql
-- Check what privileges authenticated role has
SELECT 
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'movers'
  AND grantee = 'authenticated';

-- Expected output:
-- privilege_type
-- --------------
-- SELECT
-- INSERT
-- UPDATE
```

## Related RLS Policies Reference

### Policies That Now Work Correctly

#### 1. Mover Registration (INSERT)
```sql
-- Policy definition (line 43)
CREATE POLICY "Users can create mover profile"
  ON public.movers FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```
- **Privilege required:** `INSERT`
- **Policy logic:** User can only insert rows where `user_id` matches their own ID
- **Use case:** Mover registration form submission

#### 2. Profile Management (UPDATE)
```sql
-- Policy definition (line 35)
CREATE POLICY "Movers can update own profile"
  ON public.movers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```
- **Privilege required:** `UPDATE`
- **Policy logic:** Movers can only update their own profile
- **Use case:** Updating business info, availability status, location

#### 3. Public Viewing (SELECT)
```sql
-- Policy definition (line 25)
CREATE POLICY "Public movers are viewable by everyone"
  ON public.movers FOR SELECT
  USING (verification_status = 'verified' AND deleted_at IS NULL);
```
- **Privilege required:** `SELECT` (was already granted)
- **Policy logic:** Anyone can view verified, non-deleted movers
- **Use case:** Browse movers, search for services

#### 4. Own Profile Viewing (SELECT)
```sql
-- Policy definition (line 30)
CREATE POLICY "Movers can view own profile"
  ON public.movers FOR SELECT
  USING (auth.uid() = user_id);
```
- **Privilege required:** `SELECT` (was already granted)
- **Policy logic:** Movers can view their own profile even if not verified
- **Use case:** Profile management dashboard

## Files Changed

**supabase/migrations/20251008_part3_rls_and_functions.sql**
- Line 532: Changed `GRANT SELECT` to `GRANT SELECT, INSERT, UPDATE` for `public.movers` table

## Verification Checklist

✅ **Base privileges added** - INSERT and UPDATE granted to authenticated role
✅ **RLS policies exist** - Policies for INSERT and UPDATE already defined
✅ **No over-privileging** - DELETE not granted (soft delete pattern used)
✅ **Consistent with other tables** - Matches pattern used for `bookings` table
✅ **Security maintained** - RLS policies still enforce row-level restrictions
✅ **Testing provided** - Complete test scripts for validation

The `movers` table now has the proper base privileges for the RLS policies to function correctly, allowing users to register as movers and manage their profiles! 🎉
