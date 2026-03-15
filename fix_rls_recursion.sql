-- ============================================================================
-- FIX: Infinite RLS Recursion on profiles table
-- Run this entire script in the Supabase SQL Editor
-- ============================================================================

-- STEP 1: Fix the is_admin() function (uses "id" but should be "user_id")
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix has_role() function (same bug)
CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role::TEXT = required_role
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix get_user_role() function (same bug)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role::TEXT INTO user_role
  FROM public.profiles
  WHERE user_id = auth.uid();
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- STEP 2: Drop all existing policies on profiles to start clean
DROP POLICY IF EXISTS "Allow anonymous profile creation" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to view their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.profiles;
-- Drop any other policies that may exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
-- Drop remaining old public-role policies visible in verification output
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- STEP 3: Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create clean, non-recursive RLS policies

-- Allow anonymous users to insert profiles (for guest quotes)
CREATE POLICY "anon_insert_profiles"
  ON public.profiles FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "auth_insert_own_profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to read their own profile (no subquery on profiles = no recursion)
CREATE POLICY "auth_select_own_profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to update their own profile
CREATE POLICY "auth_update_own_profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin SELECT policy: uses is_admin() which is SECURITY DEFINER (bypasses RLS, no recursion)
CREATE POLICY "admin_select_all_profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admin UPDATE policy: uses is_admin() which is SECURITY DEFINER
CREATE POLICY "admin_update_any_profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (is_admin() AND user_id != auth.uid());

-- STEP 5: Grant necessary permissions
GRANT SELECT ON public.profiles TO authenticated;
GRANT INSERT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;
GRANT INSERT ON public.profiles TO anon;

-- STEP 6: Verify policies (check output in Supabase SQL Editor)
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
