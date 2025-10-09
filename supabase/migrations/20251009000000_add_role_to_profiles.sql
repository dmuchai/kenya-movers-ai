-- Add role column to profiles table
-- This enables role-based access control

-- Create enum for user roles if it doesn't exist
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'mover', 'admin', 'super_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'customer';

-- Create index for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Update existing users to have customer role (safe default)
UPDATE public.profiles 
SET role = 'customer' 
WHERE role IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.role IS 'User role for access control: customer, mover, admin, or super_admin';
