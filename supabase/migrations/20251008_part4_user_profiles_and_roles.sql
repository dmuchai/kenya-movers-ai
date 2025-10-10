-- ============================================================================
-- MoveLink Database Schema Migration - Part 4
-- User Profiles and Role-Based Access Control
-- ============================================================================

-- ============================================================================
-- PART 1: USER ROLES ENUM
-- ============================================================================

CREATE TYPE user_role_enum AS ENUM (
  'customer',      -- Regular customers booking moves
  'mover',         -- Verified movers providing services
  'admin',         -- Platform administrators
  'super_admin'    -- Super administrators with full access
);

-- ============================================================================
-- PART 2: ALTER EXISTING PROFILES TABLE TO ADD ROLE SUPPORT
-- ============================================================================

-- Add role column to existing profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS role user_role_enum DEFAULT 'customer' NOT NULL,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
    "email": true,
    "sms": true,
    "push": true,
    "marketing": false
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles(is_active) WHERE is_active = TRUE;

-- Comments
COMMENT ON COLUMN public.profiles.role IS 'User role determining access level';
COMMENT ON COLUMN public.profiles.is_active IS 'Whether user account is active';

-- ============================================================================
-- PART 3: AUTO-UPDATE PROFILE ROLE ON USER SIGNUP (if metadata contains role)
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_profile_role_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Update role if provided in user metadata
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    UPDATE public.profiles
    SET role = (NEW.raw_user_meta_data->>'role')::user_role_enum
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_sync_profile_role'
  ) THEN
    CREATE TRIGGER trigger_sync_profile_role
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION sync_profile_role_on_signup();
  END IF;
END$$;

-- ============================================================================
-- PART 4: UPDATE LAST SIGN IN
-- ============================================================================

CREATE OR REPLACE FUNCTION update_last_sign_in()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET last_sign_in_at = NEW.last_sign_in_at
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_last_sign_in
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION update_last_sign_in();

-- ============================================================================
-- PART 5: ADDITIONAL RLS POLICIES FOR PROFILES (Admin access)
-- ============================================================================

-- Note: Basic user policies already exist, adding admin policies

-- Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can update user roles (except their own)
DROP POLICY IF EXISTS "Admins can update user roles" ON public.profiles;
CREATE POLICY "Admins can update user roles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
    AND user_id != auth.uid() -- Cannot change own role
  );

-- ============================================================================
-- PART 6: HELPER FUNCTIONS FOR ROLE CHECKS
-- ============================================================================

-- Check if current user has admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user has specific role
CREATE OR REPLACE FUNCTION has_role(required_role user_role_enum)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role = required_role
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role_enum AS $$
DECLARE
  user_role user_role_enum;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 7: UPDATE ADMIN POLICIES FOR MOVERS TABLE
-- ============================================================================

-- Admins can view all movers
CREATE POLICY "Admins can view all movers"
  ON public.movers FOR SELECT
  USING (is_admin());

-- Admins can update any mover (including verification status)
CREATE POLICY "Admins can update any mover"
  ON public.movers FOR UPDATE
  USING (is_admin());

-- Admins can delete movers
CREATE POLICY "Admins can delete movers"
  ON public.movers FOR DELETE
  USING (is_admin());

-- ============================================================================
-- PART 8: UPDATE ADMIN POLICIES FOR BOOKINGS TABLE
-- ============================================================================

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  USING (is_admin());

-- Admins can update any booking
CREATE POLICY "Admins can update any booking"
  ON public.bookings FOR UPDATE
  USING (is_admin());

-- ============================================================================
-- PART 9: UPDATE ADMIN POLICIES FOR PAYMENTS TABLE
-- ============================================================================

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (is_admin());

-- Admins can update payments (for refunds, etc.)
CREATE POLICY "Admins can update any payment"
  ON public.payments FOR UPDATE
  USING (is_admin());

-- ============================================================================
-- PART 10: ADMIN POLICIES FOR OTHER TABLES
-- ============================================================================

-- Ratings: Admins can view and moderate all ratings
CREATE POLICY "Admins can view all ratings"
  ON public.ratings FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can moderate ratings"
  ON public.ratings FOR UPDATE
  USING (is_admin());

-- Notifications: Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
  ON public.notifications FOR SELECT
  USING (is_admin());

-- Booking Requests: Admins can view all booking requests
CREATE POLICY "Admins can view all booking_requests"
  ON public.booking_requests FOR SELECT
  USING (is_admin());

-- ============================================================================
-- PART 11: AUDIT LOG FOR ADMIN ACTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Admin who performed the action
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Action details
  action TEXT NOT NULL, -- 'verify_mover', 'reject_mover', 'update_booking', etc.
  target_table TEXT NOT NULL,
  target_id UUID,
  
  -- Changes
  old_values JSONB,
  new_values JSONB,
  
  -- Context
  reason TEXT,
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_admin_audit_admin ON public.admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_action ON public.admin_audit_log(action);
CREATE INDEX idx_admin_audit_created_at ON public.admin_audit_log(created_at DESC);

-- RLS Policy
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
  ON public.admin_audit_log FOR SELECT
  USING (is_admin());

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action TEXT,
  p_target_table TEXT,
  p_target_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_id,
    action,
    target_table,
    target_id,
    old_values,
    new_values,
    reason
  ) VALUES (
    auth.uid(),
    p_action,
    p_target_table,
    p_target_id,
    p_old_values,
    p_new_values,
    p_reason
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.admin_audit_log IS 'Audit trail of all admin actions';
COMMENT ON FUNCTION log_admin_action IS 'Log an admin action for audit purposes';

-- ============================================================================
-- PART 12: GRANT PERMISSIONS
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.admin_audit_log TO authenticated;

-- ============================================================================
-- Migration Complete
-- ============================================================================

COMMENT ON TYPE user_role_enum IS 'User roles for role-based access control';
