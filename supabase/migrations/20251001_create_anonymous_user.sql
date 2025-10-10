-- Create anonymous user for guest quote submissions
-- This user represents all anonymous/guest users who submit quotes

INSERT INTO profiles (user_id, email, first_name, last_name, phone_number, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'anonymous@movelink.app',
  'Anonymous',
  'User',
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Ensure this anonymous user can have quotes
-- (The existing RLS policies should handle this, but this ensures the user exists)