-- Add email column to profiles table
-- This migration adds the missing email column that's commonly needed for user profiles

ALTER TABLE profiles 
ADD COLUMN email TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN profiles.email IS 'User email address for contact and notifications';

-- Optional: Add an index for email lookups if needed
-- CREATE INDEX idx_profiles_email ON profiles(email);