-- Automatically update profile role when mover is created
-- This ensures data consistency between movers and profiles tables

-- Function to update profile role to 'mover'
CREATE OR REPLACE FUNCTION update_profile_role_on_mover_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's role in profiles table to 'mover'
  UPDATE public.profiles
  SET role = 'mover'
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new mover is created
DROP TRIGGER IF EXISTS trigger_update_profile_role_on_mover_creation ON public.movers;

CREATE TRIGGER trigger_update_profile_role_on_mover_creation
  AFTER INSERT ON public.movers
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_role_on_mover_creation();

-- Add comment for documentation
COMMENT ON FUNCTION update_profile_role_on_mover_creation() IS 
  'Automatically updates user role to mover in profiles table when mover record is created';
