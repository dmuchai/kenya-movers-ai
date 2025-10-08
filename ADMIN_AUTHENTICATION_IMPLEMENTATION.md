# Admin Authentication & Authorization Implementation

## Overview
Implemented comprehensive role-based access control (RBAC) for the Admin Verification panel, ensuring that only authenticated administrators can view and manage mover verification requests.

## Changes Made

### 1. Database Migration - User Roles & Profiles
**File:** `supabase/migrations/20251008_part4_user_profiles_and_roles.sql`

Created a complete role-based access control system:

#### New Enum Type
```sql
CREATE TYPE user_role_enum AS ENUM (
  'customer',      -- Regular customers booking moves
  'mover',         -- Verified movers providing services
  'admin',         -- Platform administrators
  'super_admin'    -- Super administrators with full access
);
```

#### Profile Table Enhancement
- Added `role` column to existing `profiles` table
- Added `is_active`, `is_email_verified`, `is_phone_verified` columns
- Added `avatar_url`, `preferred_language` columns
- Added `notification_preferences` and `metadata` JSONB columns
- Added `last_sign_in_at` timestamp

#### Helper Functions
- `is_admin()` - Check if current user has admin/super_admin role
- `has_role(required_role)` - Check for specific role
- `get_user_role()` - Get current user's role
- `log_admin_action()` - Log actions for audit trail

#### Row-Level Security (RLS) Policies
**Movers Table:**
- Admins can view all movers
- Admins can update any mover (including verification status)
- Admins can delete movers

**Bookings Table:**
- Admins can view all bookings
- Admins can update any booking

**Payments Table:**
- Admins can view all payments
- Admins can update payments (for refunds, etc.)

**Ratings Table:**
- Admins can view all ratings
- Admins can moderate (update) ratings

**Notifications Table:**
- Admins can view all notifications

**Booking Requests Table:**
- Admins can view all booking requests

#### Audit Logging
Created `admin_audit_log` table to track all admin actions:
- Admin who performed the action
- Action type and target
- Before/after values
- IP address and user agent
- Timestamp

### 2. TypeScript Type Definitions
**File:** `src/types/auth.ts`

Created type-safe interfaces for authentication:
```typescript
export type UserRole = 'customer' | 'mover' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  role: UserRole;
  is_active: boolean;
  is_email_verified: boolean;
  // ... other profile fields
}

export interface AdminAuditLog {
  // Audit trail structure
}
```

### 3. Authentication Hook Enhancement
**File:** `src/hooks/useAuth.tsx`

Enhanced the `useAuth` hook to include role-based authorization:

**New Features:**
- Fetches user profile with role information on authentication
- Provides `isAdmin` boolean flag for easy access checks
- Exposes `profile` object with full user details
- Added `refreshProfile()` method to manually update profile
- Automatically syncs profile when user signs in/out

**Updated Interface:**
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileRow | null;  // NEW
  loading: boolean;
  isAdmin: boolean;             // NEW
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;  // NEW
}
```

### 4. Admin Verification Panel - Security Implementation
**File:** `src/pages/AdminVerification.tsx`

Completely secured the admin verification panel:

#### Authentication Checks
1. **Loading State:** Shows spinner while verifying authentication
2. **Unauthenticated Users:** Redirects to `/auth` sign-in page
3. **Unauthorized Users:** Shows access denied alert with current role
4. **Authorized Admins:** Full access to verification panel

#### Authorization Enforcement
- **Data Fetching:** Short-circuits if user is not admin
- **Action Handlers:** Validates admin role before allowing status updates
- **UI Controls:** Disables action buttons and textarea for non-admins
- **Visual Feedback:** Shows admin badge and loading states

#### Security Features
```typescript
// Auth check on mount
useEffect(() => {
  if (!authLoading) {
    if (!user) {
      // Redirect to sign-in
      navigate('/auth');
    }
    if (!isAdmin) {
      // Show unauthorized view
    }
  }
}, [user, isAdmin, authLoading]);

// Guard in data fetching
const fetchMovers = async () => {
  if (!user || !isAdmin) return;  // Short-circuit
  // ... fetch data
};

// Guard in actions
const handleVerification = async (...) => {
  if (!user || !isAdmin) {
    toast({ title: 'Unauthorized', ... });
    return;  // Short-circuit
  }
  // ... perform action
};
```

#### UI Enhancements
- Admin badge in header
- Loading spinners with meaningful messages
- Access denied alert with helpful information
- Disabled state for non-admin users with explanation
- Processing state indicators on buttons

### 5. Additional Improvements
**File:** `supabase/migrations/20251008_part2_marketplace_schema.sql`

Added automated notification cleanup:
- Created `delete_expired_notifications()` function
- Scheduled via pg_cron to run every 6 hours
- Automatically removes notifications past their `expires_at` date

## Server-Side Security

### RLS Policies
All sensitive operations are protected at the database level using Row-Level Security policies that check the user's role from the `profiles` table. This means:

1. **Defense in Depth:** Even if UI checks are bypassed, database enforces access control
2. **Consistent Security:** All database queries automatically apply RLS policies
3. **Audit Trail:** Admin actions can be logged for compliance

### Required Backend Implementation
The migration creates all necessary RLS policies. To ensure complete security:

1. **Apply Migration:** Run `20251008_part4_user_profiles_and_roles.sql` in Supabase SQL Editor
2. **Verify Policies:** Check that RLS is enabled on all sensitive tables
3. **Test Access:** Verify non-admin users cannot bypass restrictions
4. **Regenerate Types:** Run `npx supabase gen types typescript` to update TypeScript types

## Testing Checklist

### Admin User Flow
- [ ] Admin can sign in
- [ ] Admin sees verification panel
- [ ] Admin can view pending movers
- [ ] Admin can approve movers
- [ ] Admin can reject movers
- [ ] Admin can view/edit notes
- [ ] Actions are logged (if audit logging is active)

### Non-Admin User Flow
- [ ] Unauthenticated user is redirected to sign-in
- [ ] Customer user sees "Access Denied" message
- [ ] Mover user sees "Access Denied" message
- [ ] Non-admin cannot fetch mover data (API returns no data due to RLS)
- [ ] Non-admin cannot update verification status (API blocks due to RLS)

### Security Tests
- [ ] RLS policies prevent unauthorized SELECT queries
- [ ] RLS policies prevent unauthorized UPDATE queries
- [ ] Direct API calls without admin role are rejected
- [ ] Supabase client respects RLS policies
- [ ] Profile role cannot be self-modified

## Setup Instructions

### 1. Apply Database Migration
```bash
# In Supabase SQL Editor, run:
supabase/migrations/20251008_part4_user_profiles_and_roles.sql
```

### 2. Create Admin User
```sql
-- Manually set a user's role to admin
UPDATE profiles 
SET role = 'admin' 
WHERE user_id = '<user-uuid>';
```

### 3. Regenerate TypeScript Types
```bash
npx supabase gen types typescript \
  --project-id eyfvvtpbttmsqubxglyg \
  > src/integrations/supabase/types.ts
```

### 4. Test Authentication Flow
1. Sign out
2. Try to access `/admin-verification` (should redirect)
3. Sign in as non-admin user (should show access denied)
4. Sign in as admin user (should show full panel)

## Future Enhancements

### 1. Audit Logging UI
Create an admin dashboard to view the audit log:
```typescript
// Query admin actions
const { data } = await supabase
  .from('admin_audit_log')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(100);
```

### 2. Role Management UI
Allow super admins to manage user roles:
```typescript
// Update user role (only super_admin can do this)
const { error } = await supabase
  .from('profiles')
  .update({ role: 'admin' })
  .eq('user_id', targetUserId);
```

### 3. Permission Granularity
Add fine-grained permissions:
```sql
CREATE TABLE admin_permissions (
  admin_id UUID REFERENCES profiles(user_id),
  permission TEXT NOT NULL, -- 'verify_movers', 'manage_payments', etc.
  granted_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Two-Factor Authentication
Enhance security for admin accounts with 2FA.

### 5. Session Management
Track and manage active admin sessions:
- Force logout after inactivity
- Display active sessions
- Revoke specific sessions

## Security Best Practices

✅ **Implemented:**
- Role-based access control
- Row-level security policies
- Client-side auth checks
- Server-side RLS enforcement
- UI state management for auth
- Loading states during auth checks
- Helpful error messages
- Redirect flows for authentication

⚠️ **Still Needed:**
- Audit log UI for reviewing admin actions
- Two-factor authentication
- Session timeout configuration
- IP whitelisting for admin access (optional)
- Rate limiting on admin actions

## Documentation References

- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- [React Router Protected Routes](https://reactrouter.com/en/main/start/tutorial#protecting-routes)

---

**Date Implemented:** October 8, 2025  
**Migration File:** `20251008_part4_user_profiles_and_roles.sql`  
**Affected Components:** AdminVerification, useAuth hook  
**Status:** ✅ Complete - Ready for testing
