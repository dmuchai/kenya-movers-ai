-- ============================================================================
-- Add Inventory Fields to Quotes Table
-- ============================================================================
-- Purpose: Store detailed inventory information for accurate quote estimation
-- Author: MoveLink Engineering
-- Date: October 12, 2025
-- 
-- This migration adds:
-- - Inventory JSONB column to store detailed household items
-- - Property details (floors, elevators) for access assessment
-- - Contact information for anonymous quotes
-- ============================================================================

-- Add inventory column to quotes table
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS inventory JSONB DEFAULT '{
  "beds": 0,
  "wardrobe": 0,
  "sofaSet": false,
  "sofaConfiguration": "",
  "diningSet": false,
  "diningChairs": 0,
  "fridge": false,
  "fridgeLiters": 0,
  "tv": false,
  "tvInches": 0,
  "washingMachine": false,
  "cooker": false,
  "cookerType": "",
  "bulkyItemPhotos": []
}'::jsonb;

-- Add property access details for movers to assess labor requirements
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS current_property_type TEXT,
ADD COLUMN IF NOT EXISTS destination_property_type TEXT,
ADD COLUMN IF NOT EXISTS current_floor INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS destination_floor INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS elevator_current TEXT DEFAULT 'no' CHECK (elevator_current IN ('yes', 'no')),
ADD COLUMN IF NOT EXISTS elevator_destination TEXT DEFAULT 'no' CHECK (elevator_destination IN ('yes', 'no'));

-- Add contact information for anonymous quotes (guest users)
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Add acceptance of terms and conditions timestamp
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;

-- Create index on inventory for JSONB queries
CREATE INDEX IF NOT EXISTS idx_quotes_inventory ON public.quotes USING GIN (inventory);

-- Create index on property details for filtering
CREATE INDEX IF NOT EXISTS idx_quotes_property_size ON public.quotes(property_size) WHERE property_size IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_moving_date ON public.quotes(moving_date) WHERE moving_date IS NOT NULL;

-- Create index for anonymous quotes (contact email lookups)
CREATE INDEX IF NOT EXISTS idx_quotes_contact_email ON public.quotes(contact_email) WHERE contact_email IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN public.quotes.inventory IS 'Detailed household inventory in JSONB format with specific items, quantities, and configurations';
COMMENT ON COLUMN public.quotes.current_floor IS 'Floor number of current location (0 = ground floor)';
COMMENT ON COLUMN public.quotes.destination_floor IS 'Floor number of destination location (0 = ground floor)';
COMMENT ON COLUMN public.quotes.elevator_current IS 'Whether current location has elevator access (yes/no)';
COMMENT ON COLUMN public.quotes.elevator_destination IS 'Whether destination has elevator access (yes/no)';
COMMENT ON COLUMN public.quotes.contact_name IS 'Contact name for anonymous quotes (guest users)';
COMMENT ON COLUMN public.quotes.contact_email IS 'Contact email for anonymous quotes';
COMMENT ON COLUMN public.quotes.contact_phone IS 'Contact phone for anonymous quotes';
COMMENT ON COLUMN public.quotes.terms_accepted_at IS 'Timestamp when user accepted Terms & Conditions and Privacy Policy';

-- ============================================================================
-- Sample Inventory Structure (for reference)
-- ============================================================================
-- {
--   "beds": 2,
--   "wardrobe": 3,
--   "sofaSet": true,
--   "sofaConfiguration": "5-seater-3-2",
--   "diningSet": true,
--   "diningChairs": 6,
--   "fridge": true,
--   "fridgeLiters": 200,
--   "tv": true,
--   "tvInches": 55,
--   "washingMachine": true,
--   "cooker": true,
--   "cookerType": "gas",
--   "bulkyItemPhotos": ["https://storage.supabase.co/...photo1.jpg", "...photo2.jpg"]
-- }
-- ============================================================================
