-- ============================================================================
-- MoveEasy Database Schema Migration - Two-Sided Marketplace
-- ============================================================================
-- Purpose: Transform from quote generator to Uber-like moving platform
-- Author: AI Engineering Consultant
-- Date: October 8, 2025
-- 
-- This migration creates the complete database schema for:
-- - Mover profiles and onboarding
-- - Real-time bookings and dispatch
-- - Payment processing and escrow
-- - Ratings and reviews
-- - Location tracking
-- - Commission and earnings management
-- ============================================================================

-- ============================================================================
-- PART 1: ENABLE EXTENSIONS
-- ============================================================================

-- Enable PostGIS for geospatial queries (proximity search, service areas)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PART 2: CUSTOM TYPES (ENUMS)
-- ============================================================================

-- Drop types if they exist (for clean re-runs)
DROP TYPE IF EXISTS verification_status_enum CASCADE;
DROP TYPE IF EXISTS availability_status_enum CASCADE;
DROP TYPE IF EXISTS booking_status_enum CASCADE;
DROP TYPE IF EXISTS payment_status_enum CASCADE;
DROP TYPE IF EXISTS payment_method_enum CASCADE;
DROP TYPE IF EXISTS vehicle_type_enum CASCADE;
DROP TYPE IF EXISTS rating_type_enum CASCADE;

-- Mover verification status
CREATE TYPE verification_status_enum AS ENUM (
  'pending',           -- Just registered, documents under review
  'documents_submitted', -- Documents uploaded, awaiting verification
  'verified',          -- Fully verified, can accept bookings
  'suspended',         -- Temporarily suspended (violations)
  'rejected'           -- Failed verification
);

-- Mover availability status
CREATE TYPE availability_status_enum AS ENUM (
  'online',            -- Available to accept bookings
  'offline',           -- Not accepting bookings
  'busy'               -- Currently on a job
);

-- Booking status flow
CREATE TYPE booking_status_enum AS ENUM (
  'pending',           -- Customer created, waiting for mover acceptance
  'accepted',          -- Mover accepted, awaiting scheduled time
  'mover_en_route',    -- Mover traveling to pickup location
  'in_progress',       -- Move in progress
  'completed',         -- Move completed successfully
  'cancelled_customer', -- Cancelled by customer
  'cancelled_mover',   -- Cancelled by mover
  'cancelled_system',  -- Cancelled by system (timeout, etc.)
  'disputed'           -- Under dispute resolution
);

-- Payment status
CREATE TYPE payment_status_enum AS ENUM (
  'pending',           -- Payment initiated
  'processing',        -- Payment being processed
  'completed',         -- Payment successful
  'failed',            -- Payment failed
  'refunded',          -- Payment refunded
  'held_escrow'        -- Held in escrow until move completion
);

-- Payment methods
CREATE TYPE payment_method_enum AS ENUM (
  'mpesa',             -- M-Pesa (primary for Kenya)
  'card',              -- Credit/Debit card
  'cash',              -- Cash payment
  'bank_transfer'      -- Bank transfer
);

-- Vehicle types
CREATE TYPE vehicle_type_enum AS ENUM (
  'pickup',            -- Pickup truck
  'box_truck_small',   -- Small box truck (1-2 ton)
  'box_truck_medium',  -- Medium box truck (3-5 ton)
  'box_truck_large',   -- Large box truck (7+ ton)
  'container_truck',   -- Container truck
  'van'                -- Van/minibus
);

-- Rating types (who is rating whom)
CREATE TYPE rating_type_enum AS ENUM (
  'customer_to_mover', -- Customer rating mover
  'mover_to_customer'  -- Mover rating customer
);

-- ============================================================================
-- PART 3: MOVERS TABLE
-- ============================================================================

-- Drop table if exists (for clean re-runs)
DROP TABLE IF EXISTS public.movers CASCADE;

CREATE TABLE public.movers (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Business Information
  business_name TEXT NOT NULL,
  business_registration_number TEXT, -- Kenya business registration
  kra_pin TEXT, -- Kenya Revenue Authority PIN
  phone_primary TEXT NOT NULL,
  phone_secondary TEXT,
  email TEXT,
  
  -- Service Details
  vehicle_types vehicle_type_enum[] NOT NULL DEFAULT '{}', -- Array of vehicle types
  vehicle_plate_numbers TEXT[], -- Corresponding plate numbers
  max_capacity_kg INTEGER, -- Maximum load capacity in kg
  has_helpers BOOLEAN DEFAULT FALSE, -- Has additional helpers/crew
  helper_count INTEGER DEFAULT 0,
  
  -- Service Areas (Geographic Coverage)
  -- Using PostGIS geography for accurate distance calculations
  service_areas GEOGRAPHY(POLYGON)[], -- Array of service area polygons
  primary_location GEOGRAPHY(POINT), -- Main base/garage location
  service_radius_km INTEGER DEFAULT 20, -- Service radius from primary location
  
  -- Availability
  availability_status availability_status_enum DEFAULT 'offline',
  current_location GEOGRAPHY(POINT), -- Updated in real-time
  current_location_updated_at TIMESTAMPTZ,
  is_accepting_bookings BOOLEAN DEFAULT TRUE,
  
  -- Verification & Documents
  verification_status verification_status_enum DEFAULT 'pending',
  verification_notes TEXT, -- Admin notes during verification
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  
  -- Documents (stored as URLs to Supabase Storage)
  documents JSONB DEFAULT '{
    "national_id": null,
    "drivers_license": null,
    "vehicle_logbook": null,
    "insurance_certificate": null,
    "kra_pin_certificate": null,
    "business_permit": null,
    "good_conduct_certificate": null
  }'::jsonb,
  
  -- Performance Metrics
  rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_ratings INTEGER DEFAULT 0,
  total_moves INTEGER DEFAULT 0,
  completed_moves INTEGER DEFAULT 0,
  cancelled_moves INTEGER DEFAULT 0,
  acceptance_rate DECIMAL(5,2) DEFAULT 100.00, -- % of requests accepted
  completion_rate DECIMAL(5,2) DEFAULT 100.00, -- % of accepted jobs completed
  average_response_time_seconds INTEGER DEFAULT 0,
  
  -- Financial
  total_earnings DECIMAL(12,2) DEFAULT 0.00,
  pending_payout DECIMAL(12,2) DEFAULT 0.00,
  commission_rate DECIMAL(5,2) DEFAULT 15.00, -- Platform commission %
  payment_details JSONB DEFAULT '{
    "mpesa_number": null,
    "bank_name": null,
    "account_number": null,
    "account_name": null
  }'::jsonb,
  
  -- Subscription & Features
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMPTZ,
  featured_until TIMESTAMPTZ, -- Featured listing expiry
  
  -- Metadata
  bio TEXT,
  profile_image_url TEXT,
  cover_image_url TEXT,
  languages TEXT[] DEFAULT ARRAY['English', 'Swahili'],
  years_experience INTEGER,
  specializations TEXT[], -- e.g., ['fragile_items', 'office_moves', 'piano_moving']
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ, -- Soft delete
  
  -- Constraints
  CONSTRAINT mover_user_unique UNIQUE(user_id),
  CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT valid_rates CHECK (acceptance_rate >= 0 AND acceptance_rate <= 100 
                                AND completion_rate >= 0 AND completion_rate <= 100)
);

-- Indexes for performance
CREATE INDEX idx_movers_user_id ON public.movers(user_id);
CREATE INDEX idx_movers_verification_status ON public.movers(verification_status);
CREATE INDEX idx_movers_availability ON public.movers(availability_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_movers_rating ON public.movers(rating DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_movers_location ON public.movers USING GIST(current_location) WHERE deleted_at IS NULL;
-- Note: service_areas is an array of polygons - we'll query using individual polygons or primary_location instead
-- CREATE INDEX idx_movers_service_areas ON public.movers USING GIST(service_areas);
CREATE INDEX idx_movers_primary_location ON public.movers USING GIST(primary_location) WHERE deleted_at IS NULL;
CREATE INDEX idx_movers_active ON public.movers(availability_status, verification_status) 
  WHERE deleted_at IS NULL;

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_movers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_movers_updated_at
  BEFORE UPDATE ON public.movers
  FOR EACH ROW
  EXECUTE FUNCTION update_movers_updated_at();

-- Comments
COMMENT ON TABLE public.movers IS 'Moving service providers registered on the platform';
COMMENT ON COLUMN public.movers.service_areas IS 'Geographic polygons where mover provides services';
COMMENT ON COLUMN public.movers.acceptance_rate IS 'Percentage of booking requests accepted by mover';

-- ============================================================================
-- PART 4: BOOKINGS TABLE
-- ============================================================================

-- Drop table if exists (for clean re-runs)
DROP TABLE IF EXISTS public.bookings CASCADE;

CREATE TABLE public.bookings (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number TEXT UNIQUE NOT NULL, -- Human-readable booking ref (e.g., "MB-2025-001234")
  
  -- Relationships
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  mover_id UUID REFERENCES public.movers(id),
  quote_id UUID REFERENCES public.quotes(id), -- Link to original quote
  
  -- Status
  status booking_status_enum DEFAULT 'pending',
  status_history JSONB DEFAULT '[]'::jsonb, -- Track status changes with timestamps
  
  -- Location Details
  pickup_address TEXT NOT NULL,
  pickup_location GEOGRAPHY(POINT) NOT NULL,
  pickup_location_details JSONB DEFAULT '{
    "floor_number": null,
    "has_elevator": false,
    "access_notes": null,
    "contact_name": null,
    "contact_phone": null
  }'::jsonb,
  
  dropoff_address TEXT NOT NULL,
  dropoff_location GEOGRAPHY(POINT) NOT NULL,
  dropoff_location_details JSONB DEFAULT '{
    "floor_number": null,
    "has_elevator": false,
    "access_notes": null,
    "contact_name": null,
    "contact_phone": null
  }'::jsonb,
  
  -- Timing
  scheduled_date DATE NOT NULL,
  scheduled_time_start TIME NOT NULL,
  scheduled_time_end TIME, -- Optional time window
  preferred_arrival_time TIMESTAMPTZ,
  actual_start_time TIMESTAMPTZ,
  actual_completion_time TIMESTAMPTZ,
  estimated_duration_minutes INTEGER,
  actual_duration_minutes INTEGER,
  
  -- Move Details
  property_size TEXT NOT NULL, -- 'Bedsitter', '1BR', '2BR', etc.
  inventory JSONB DEFAULT '{}'::jsonb,
  additional_services TEXT[] DEFAULT '{}', -- ['packing', 'unpacking', 'assembly']
  special_instructions TEXT,
  has_fragile_items BOOLEAN DEFAULT FALSE,
  requires_insurance BOOLEAN DEFAULT FALSE,
  
  -- Distance & Route
  distance_meters INTEGER,
  estimated_distance_meters INTEGER,
  route_polyline TEXT, -- Encoded polyline for route visualization
  
  -- Pricing
  estimated_price DECIMAL(10,2) NOT NULL,
  quoted_price DECIMAL(10,2), -- Price offered by mover (may differ from estimate)
  final_price DECIMAL(10,2),
  price_breakdown JSONB DEFAULT '{
    "base_price": 0,
    "distance_charge": 0,
    "labor_charge": 0,
    "inventory_charge": 0,
    "services_charge": 0,
    "surge_multiplier": 1.0,
    "discount": 0,
    "insurance_fee": 0,
    "total": 0
  }'::jsonb,
  currency TEXT DEFAULT 'KES',
  
  -- Dynamic Pricing Factors
  demand_multiplier DECIMAL(4,2) DEFAULT 1.00, -- Demand-based pricing
  surge_multiplier DECIMAL(4,2) DEFAULT 1.00, -- Surge pricing multiplier
  time_of_day_multiplier DECIMAL(4,2) DEFAULT 1.00,
  
  -- Real-time Tracking
  tracking_data JSONB DEFAULT '[]'::jsonb, -- Array of location updates with timestamps
  last_tracked_location GEOGRAPHY(POINT),
  last_tracked_at TIMESTAMPTZ,
  
  -- Communication
  customer_notes TEXT,
  mover_notes TEXT,
  admin_notes TEXT,
  
  -- Completion Details
  completion_photos TEXT[], -- URLs to photos taken at completion
  completion_signature TEXT, -- Customer signature URL
  completion_notes TEXT,
  
  -- Dispute & Issues
  has_dispute BOOLEAN DEFAULT FALSE,
  dispute_reason TEXT,
  dispute_status TEXT, -- 'open', 'investigating', 'resolved'
  reported_issues TEXT[],
  
  -- Performance Metrics
  customer_satisfaction_score INTEGER CHECK (customer_satisfaction_score BETWEEN 1 AND 5),
  mover_satisfaction_score INTEGER CHECK (mover_satisfaction_score BETWEEN 1 AND 5),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (scheduled_date >= CURRENT_DATE),
  CONSTRAINT valid_locations CHECK (pickup_location IS NOT NULL AND dropoff_location IS NOT NULL),
  CONSTRAINT valid_price CHECK (estimated_price > 0)
);

-- Auto-generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_number IS NULL THEN
    NEW.booking_number := 'MB-' || 
                          TO_CHAR(NEW.created_at, 'YYYY-MM-DD-') || 
                          LPAD(nextval('booking_number_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS booking_number_seq;

CREATE TRIGGER trigger_generate_booking_number
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION generate_booking_number();

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_updated_at();

-- Status history tracking
CREATE OR REPLACE FUNCTION track_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status_history := OLD.status_history || jsonb_build_object(
      'from_status', OLD.status,
      'to_status', NEW.status,
      'changed_at', NOW(),
      'changed_by', current_setting('request.jwt.claims', true)::jsonb->>'sub'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_booking_status
  BEFORE UPDATE OF status ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION track_booking_status_change();

-- Indexes
CREATE INDEX idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX idx_bookings_mover ON public.bookings(mover_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_scheduled_date ON public.bookings(scheduled_date);
CREATE INDEX idx_bookings_created_at ON public.bookings(created_at DESC);
CREATE INDEX idx_bookings_pickup_location ON public.bookings USING GIST(pickup_location);
CREATE INDEX idx_bookings_dropoff_location ON public.bookings USING GIST(dropoff_location);
CREATE INDEX idx_bookings_active ON public.bookings(status, scheduled_date) 
  WHERE status IN ('pending', 'accepted', 'mover_en_route', 'in_progress');

-- Comments
COMMENT ON TABLE public.bookings IS 'Customer booking requests and move jobs';
COMMENT ON COLUMN public.bookings.booking_number IS 'Human-readable booking reference number';
COMMENT ON COLUMN public.bookings.demand_multiplier IS 'Dynamic pricing multiplier based on demand';

-- ============================================================================
-- Continue in next file due to length...
-- ============================================================================