-- ============================================================================
-- MoveEasy Database Schema Migration - Part 2
-- ============================================================================
-- PART 5: PAYMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payments (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_reference TEXT UNIQUE NOT NULL, -- e.g., "PAY-2025-001234"
  
  -- Relationships
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  mover_id UUID REFERENCES public.movers(id),
  
  -- Payment Details
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'KES',
  payment_method payment_method_enum NOT NULL,
  payment_status payment_status_enum DEFAULT 'pending',
  
  -- Commission & Payouts
  commission_rate DECIMAL(5,2) NOT NULL, -- % taken by platform
  commission_amount DECIMAL(10,2) NOT NULL, -- Actual commission in currency
  mover_payout_amount DECIMAL(10,2) NOT NULL, -- Amount mover receives
  insurance_fee DECIMAL(10,2) DEFAULT 0.00, -- Insurance portion
  
  -- M-Pesa Specific
  mpesa_transaction_id TEXT, -- M-Pesa confirmation code
  mpesa_phone_number TEXT, -- Phone number used for payment
  mpesa_receipt_number TEXT,
  mpesa_transaction_date TIMESTAMPTZ,
  
  -- Card Payment Specific
  card_last_four TEXT,
  card_brand TEXT, -- 'visa', 'mastercard', etc.
  card_transaction_id TEXT,
  
  -- External Payment Gateway
  gateway_provider TEXT, -- 'mpesa', 'stripe', 'paystack', etc.
  gateway_transaction_id TEXT,
  gateway_response JSONB, -- Full response from payment gateway
  
  -- Escrow Management
  is_held_in_escrow BOOLEAN DEFAULT TRUE,
  escrow_released_at TIMESTAMPTZ,
  escrow_release_reason TEXT,
  
  -- Refunds
  is_refunded BOOLEAN DEFAULT FALSE,
  refund_amount DECIMAL(10,2),
  refund_reason TEXT,
  refunded_at TIMESTAMPTZ,
  refund_transaction_id TEXT,
  
  -- Retry & Error Handling
  retry_count INTEGER DEFAULT 0,
  last_error_message TEXT,
  last_error_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional payment metadata
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_commission CHECK (commission_amount >= 0 AND commission_amount <= amount),
  CONSTRAINT valid_payout CHECK (mover_payout_amount >= 0 AND mover_payout_amount <= amount)
);

-- Auto-generate payment reference
CREATE OR REPLACE FUNCTION generate_payment_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_reference IS NULL THEN
    NEW.payment_reference := 'PAY-' || 
                             TO_CHAR(NEW.created_at, 'YYYY-MM-DD-') || 
                             LPAD(nextval('payment_reference_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS payment_reference_seq;

CREATE TRIGGER trigger_generate_payment_reference
  BEFORE INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION generate_payment_reference();

-- Indexes
CREATE INDEX idx_payments_booking ON public.payments(booking_id);
CREATE INDEX idx_payments_customer ON public.payments(customer_id);
CREATE INDEX idx_payments_mover ON public.payments(mover_id);
CREATE INDEX idx_payments_status ON public.payments(payment_status);
CREATE INDEX idx_payments_mpesa_transaction ON public.payments(mpesa_transaction_id) WHERE mpesa_transaction_id IS NOT NULL;
CREATE INDEX idx_payments_created_at ON public.payments(created_at DESC);
CREATE INDEX idx_payments_escrow ON public.payments(is_held_in_escrow) WHERE is_held_in_escrow = TRUE;

-- Comments
COMMENT ON TABLE public.payments IS 'Payment transactions for bookings';
COMMENT ON COLUMN public.payments.is_held_in_escrow IS 'Payment held until move completion';

-- ============================================================================
-- PART 6: RATINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ratings (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES auth.users(id), -- Who is giving the rating
  rated_id UUID NOT NULL REFERENCES auth.users(id), -- Who is being rated
  rating_type rating_type_enum NOT NULL,
  
  -- Rating Details
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  review_title TEXT,
  
  -- Specific Rating Categories (optional detailed ratings)
  punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
  professionalism_rating INTEGER CHECK (professionalism_rating BETWEEN 1 AND 5),
  care_of_items_rating INTEGER CHECK (care_of_items_rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  value_for_money_rating INTEGER CHECK (value_for_money_rating BETWEEN 1 AND 5),
  
  -- Media
  photos TEXT[], -- URLs to photos uploaded with review
  
  -- Moderation
  is_verified BOOLEAN DEFAULT FALSE, -- Admin verified as legitimate
  is_hidden BOOLEAN DEFAULT FALSE, -- Hidden by admin/mover response
  hidden_reason TEXT,
  is_featured BOOLEAN DEFAULT FALSE, -- Featured positive review
  
  -- Response
  has_response BOOLEAN DEFAULT FALSE,
  response_text TEXT, -- Mover's response to review
  response_date TIMESTAMPTZ,
  
  -- Helpfulness (users can vote on reviews)
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT rating_unique_per_booking UNIQUE(booking_id, rater_id, rating_type),
  CONSTRAINT cannot_rate_self CHECK (rater_id != rated_id)
);

-- Indexes
CREATE INDEX idx_ratings_booking ON public.ratings(booking_id);
CREATE INDEX idx_ratings_rater ON public.ratings(rater_id);
CREATE INDEX idx_ratings_rated ON public.ratings(rated_id);
CREATE INDEX idx_ratings_type ON public.ratings(rating_type);
CREATE INDEX idx_ratings_rating_desc ON public.ratings(rating DESC);
CREATE INDEX idx_ratings_created_at ON public.ratings(created_at DESC);
CREATE INDEX idx_ratings_featured ON public.ratings(is_featured) WHERE is_featured = TRUE AND is_hidden = FALSE;

-- Update mover rating average automatically
CREATE OR REPLACE FUNCTION update_mover_rating()
RETURNS TRIGGER AS $$
DECLARE
  mover_user_id UUID;
  avg_rating DECIMAL(3,2);
  rating_count INTEGER;
BEGIN
  -- Get mover's user_id from the rated_id
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    SELECT user_id INTO mover_user_id 
    FROM public.movers 
    WHERE user_id = NEW.rated_id;
    
    IF mover_user_id IS NOT NULL THEN
      -- Calculate new average rating
      SELECT AVG(rating), COUNT(*) 
      INTO avg_rating, rating_count
      FROM public.ratings
      WHERE rated_id = NEW.rated_id 
        AND rating_type = 'customer_to_mover'
        AND is_hidden = FALSE;
      
      -- Update mover's rating
      UPDATE public.movers
      SET rating = COALESCE(avg_rating, 0),
          total_ratings = rating_count,
          updated_at = NOW()
      WHERE user_id = mover_user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mover_rating
  AFTER INSERT OR UPDATE ON public.ratings
  FOR EACH ROW
  WHEN (NEW.rating_type = 'customer_to_mover')
  EXECUTE FUNCTION update_mover_rating();

-- Comments
COMMENT ON TABLE public.ratings IS 'Two-way ratings between customers and movers';
COMMENT ON COLUMN public.ratings.rating_type IS 'Indicates who is rating whom';

-- ============================================================================
-- PART 7: MOVER LOCATIONS (Real-time GPS Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mover_locations (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  mover_id UUID NOT NULL REFERENCES public.movers(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id), -- If tracking during active booking
  
  -- Location Data
  location GEOGRAPHY(POINT) NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  
  -- Movement Data
  heading DECIMAL(5,2), -- Direction in degrees (0-360)
  speed DECIMAL(5,2), -- Speed in km/h
  altitude DECIMAL(8,2), -- Altitude in meters
  
  -- Accuracy & Quality
  accuracy DECIMAL(8,2), -- GPS accuracy in meters
  location_source TEXT DEFAULT 'gps', -- 'gps', 'network', 'manual'
  
  -- Battery & Device Info
  battery_level INTEGER CHECK (battery_level BETWEEN 0 AND 100),
  device_info JSONB,
  
  -- Timestamp
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partition by month for efficient querying of recent data
-- CREATE TABLE mover_locations_2025_10 PARTITION OF mover_locations
-- FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

-- Indexes
CREATE INDEX idx_mover_locations_mover ON public.mover_locations(mover_id, recorded_at DESC);
CREATE INDEX idx_mover_locations_booking ON public.mover_locations(booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX idx_mover_locations_location ON public.mover_locations USING GIST(location);
CREATE INDEX idx_mover_locations_recorded_at ON public.mover_locations(recorded_at DESC);

-- Function to get latest mover location
CREATE OR REPLACE FUNCTION get_latest_mover_location(p_mover_id UUID)
RETURNS TABLE (
  location GEOGRAPHY,
  latitude DECIMAL,
  longitude DECIMAL,
  recorded_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT ml.location, ml.latitude, ml.longitude, ml.recorded_at
  FROM public.mover_locations ml
  WHERE ml.mover_id = p_mover_id
  ORDER BY ml.recorded_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Automatically update mover's current_location
CREATE OR REPLACE FUNCTION update_mover_current_location()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.movers
  SET current_location = NEW.location,
      current_location_updated_at = NEW.recorded_at,
      last_active_at = NOW()
  WHERE id = NEW.mover_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mover_location
  AFTER INSERT ON public.mover_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_mover_current_location();

-- Comments
COMMENT ON TABLE public.mover_locations IS 'Real-time GPS tracking of mover locations';
COMMENT ON COLUMN public.mover_locations.accuracy IS 'GPS accuracy in meters, lower is better';

-- ============================================================================
-- PART 8: MOVER AVAILABILITY SCHEDULE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mover_availability_schedule (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  mover_id UUID NOT NULL REFERENCES public.movers(id) ON DELETE CASCADE,
  
  -- Schedule Details
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  
  -- Special Dates (holidays, off days)
  specific_date DATE, -- Override for specific dates
  is_override BOOLEAN DEFAULT FALSE, -- Is this an override of regular schedule?
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT unique_schedule UNIQUE(mover_id, day_of_week, specific_date)
);

-- Indexes
CREATE INDEX idx_availability_mover ON public.mover_availability_schedule(mover_id);
CREATE INDEX idx_availability_day ON public.mover_availability_schedule(day_of_week);
CREATE INDEX idx_availability_date ON public.mover_availability_schedule(specific_date) WHERE specific_date IS NOT NULL;

-- Comments
COMMENT ON TABLE public.mover_availability_schedule IS 'Mover working hours and availability calendar';

-- ============================================================================
-- PART 9: BOOKING REQUESTS (Pending Mover Assignments)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.booking_requests (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  mover_id UUID NOT NULL REFERENCES public.movers(id) ON DELETE CASCADE,
  
  -- Request Status
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'viewed', 'accepted', 'rejected', 'expired'
  
  -- Pricing
  offered_price DECIMAL(10,2), -- Mover can counter-offer different price
  
  -- Response
  response_notes TEXT,
  rejection_reason TEXT,
  
  -- Timing
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL, -- Auto-reject if not responded by this time
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_booking_mover UNIQUE(booking_id, mover_id)
);

-- Indexes
CREATE INDEX idx_booking_requests_booking ON public.booking_requests(booking_id);
CREATE INDEX idx_booking_requests_mover ON public.booking_requests(mover_id);
CREATE INDEX idx_booking_requests_status ON public.booking_requests(status);
CREATE INDEX idx_booking_requests_expires ON public.booking_requests(expires_at) WHERE status = 'sent';

-- Auto-expire old requests
CREATE OR REPLACE FUNCTION expire_old_booking_requests()
RETURNS void AS $$
BEGIN
  UPDATE public.booking_requests
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'sent'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule this to run every minute via pg_cron or cron job

-- Comments
COMMENT ON TABLE public.booking_requests IS 'Booking requests sent to individual movers for acceptance';

-- ============================================================================
-- PART 10: NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id),
  
  -- Notification Details
  type TEXT NOT NULL, -- 'booking_request', 'booking_accepted', 'payment_received', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Action Details
  action_url TEXT, -- Deep link to specific screen in app
  action_label TEXT, -- e.g., "View Booking", "Accept Request"
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  is_sent BOOLEAN DEFAULT FALSE, -- For push notifications
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  
  -- Priority
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Auto-delete old notifications
  
  -- Constraints
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- Indexes
CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_unsent ON public.notifications(is_sent) WHERE is_sent = FALSE;
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- Comments
COMMENT ON TABLE public.notifications IS 'In-app and push notifications for users';

-- ============================================================================
-- Continue in next file...
-- ============================================================================