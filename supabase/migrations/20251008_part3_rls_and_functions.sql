-- ============================================================================
-- MoveEasy Database Schema Migration - Part 3
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- ============================================================================
-- PART 11: ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.movers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mover_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mover_availability_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 12: RLS POLICIES FOR MOVERS TABLE
-- ============================================================================

-- Anyone can view verified movers (public profiles)
CREATE POLICY "Public movers are viewable by everyone"
  ON public.movers FOR SELECT
  USING (verification_status = 'verified' AND deleted_at IS NULL);

-- Movers can view their own profile
CREATE POLICY "Movers can view own profile"
  ON public.movers FOR SELECT
  USING (auth.uid() = user_id);

-- Movers can update their own profile (except verification status)
CREATE POLICY "Movers can update own profile"
  ON public.movers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can create mover profiles
CREATE POLICY "Users can create mover profile"
  ON public.movers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: Admin policies commented out - add profiles table with role column first
-- CREATE POLICY "Admins can view all movers"
--   ON public.movers FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.profiles
--       WHERE id = auth.uid() AND role = 'admin'
--     )
--   );

-- CREATE POLICY "Admins can update any mover"
--   ON public.movers FOR UPDATE
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.profiles
--       WHERE id = auth.uid() AND role = 'admin'
--     )
--   );

-- ============================================================================
-- PART 13: RLS POLICIES FOR BOOKINGS TABLE
-- ============================================================================

-- Customers can view their own bookings
CREATE POLICY "Customers can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = customer_id);

-- Movers can view bookings assigned to them
CREATE POLICY "Movers can view assigned bookings"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.movers
      WHERE movers.id = bookings.mover_id
        AND movers.user_id = auth.uid()
    )
  );

-- Customers can create bookings
CREATE POLICY "Customers can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Customers can update their own bookings (before accepted)
CREATE POLICY "Customers can update own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = customer_id AND status = 'pending')
  WITH CHECK (auth.uid() = customer_id);

-- Movers can update bookings assigned to them
CREATE POLICY "Movers can update assigned bookings"
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.movers
      WHERE movers.id = bookings.mover_id
        AND movers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.movers
      WHERE movers.id = bookings.mover_id
        AND movers.user_id = auth.uid()
    )
  );

-- Note: Admin policies commented out - add profiles table with role column first
-- CREATE POLICY "Admins can view all bookings"
--   ON public.bookings FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.profiles
--       WHERE id = auth.uid() AND role = 'admin'
--     )
--   );

-- ============================================================================
-- PART 14: RLS POLICIES FOR PAYMENTS TABLE
-- ============================================================================

-- Customers can view their own payments
CREATE POLICY "Customers can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = customer_id);

-- Movers can view payments for their bookings
CREATE POLICY "Movers can view their payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.movers
      WHERE movers.id = payments.mover_id
        AND movers.user_id = auth.uid()
    )
  );

-- System can create payments (via service role)
-- No public insert policy - handled by backend functions

-- Note: Admin policies commented out - add profiles table with role column first
-- CREATE POLICY "Admins can view all payments"
--   ON public.payments FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.profiles
--       WHERE id = auth.uid() AND role = 'admin'
--     )
--   );

-- ============================================================================
-- PART 15: RLS POLICIES FOR RATINGS TABLE
-- ============================================================================

-- Anyone can view non-hidden ratings
CREATE POLICY "Public can view visible ratings"
  ON public.ratings FOR SELECT
  USING (is_hidden = FALSE);

-- Users can view ratings they gave or received
CREATE POLICY "Users can view own ratings"
  ON public.ratings FOR SELECT
  USING (auth.uid() = rater_id OR auth.uid() = rated_id);

-- Users can create ratings for their completed bookings
CREATE POLICY "Users can create ratings"
  ON public.ratings FOR INSERT
  WITH CHECK (
    auth.uid() = rater_id
    AND EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = booking_id
        AND bookings.status = 'completed'
        AND (bookings.customer_id = auth.uid() OR 
             bookings.mover_id IN (
               SELECT id FROM public.movers WHERE user_id = auth.uid()
             ))
    )
  );

-- Users can update their own ratings (within 24 hours)
CREATE POLICY "Users can update own ratings"
  ON public.ratings FOR UPDATE
  USING (
    auth.uid() = rater_id 
    AND created_at > NOW() - INTERVAL '24 hours'
  )
  WITH CHECK (auth.uid() = rater_id);

-- Movers can respond to ratings
CREATE POLICY "Movers can respond to ratings"
  ON public.ratings FOR UPDATE
  USING (
    auth.uid() = rated_id
    AND rating_type = 'customer_to_mover'
  )
  WITH CHECK (
    auth.uid() = rated_id
    AND rating_type = 'customer_to_mover'
  );

-- ============================================================================
-- PART 16: RLS POLICIES FOR MOVER LOCATIONS TABLE
-- ============================================================================

-- Movers can insert their own locations
CREATE POLICY "Movers can insert own locations"
  ON public.mover_locations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.movers
      WHERE movers.id = mover_id
        AND movers.user_id = auth.uid()
    )
  );

-- Customers can view mover locations during active bookings
CREATE POLICY "Customers can view mover location during booking"
  ON public.mover_locations FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM public.bookings
      WHERE customer_id = auth.uid()
        AND status IN ('accepted', 'mover_en_route', 'in_progress')
    )
  );

-- Movers can view their own location history
CREATE POLICY "Movers can view own locations"
  ON public.mover_locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.movers
      WHERE movers.id = mover_id
        AND movers.user_id = auth.uid()
    )
  );

-- Note: Admin policies commented out - add profiles table with role column first
-- CREATE POLICY "Admins can view all locations"
--   ON public.mover_locations FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.profiles
--       WHERE id = auth.uid() AND role = 'admin'
--     )
--   );

-- ============================================================================
-- PART 17: RLS POLICIES FOR BOOKING REQUESTS TABLE
-- ============================================================================

-- Movers can view requests sent to them
CREATE POLICY "Movers can view own requests"
  ON public.booking_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.movers
      WHERE movers.id = mover_id
        AND movers.user_id = auth.uid()
    )
  );

-- Customers can view requests for their bookings
CREATE POLICY "Customers can view booking requests"
  ON public.booking_requests FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM public.bookings
      WHERE customer_id = auth.uid()
    )
  );

-- Movers can update requests sent to them
CREATE POLICY "Movers can update own requests"
  ON public.booking_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.movers
      WHERE movers.id = mover_id
        AND movers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.movers
      WHERE movers.id = mover_id
        AND movers.user_id = auth.uid()
    )
  );

-- System can create booking requests (via service role)

-- ============================================================================
-- PART 18: RLS POLICIES FOR NOTIFICATIONS TABLE
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- System can create notifications (via service role)

-- ============================================================================
-- PART 19: RLS POLICIES FOR MOVER AVAILABILITY SCHEDULE
-- ============================================================================

-- Movers can manage their own schedule
CREATE POLICY "Movers can manage own schedule"
  ON public.mover_availability_schedule FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.movers
      WHERE movers.id = mover_id
        AND movers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.movers
      WHERE movers.id = mover_id
        AND movers.user_id = auth.uid()
    )
  );

-- Public can view mover schedules (for booking availability)
CREATE POLICY "Public can view mover schedules"
  ON public.mover_availability_schedule FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.movers
      WHERE movers.id = mover_id
        AND movers.verification_status = 'verified'
    )
  );

-- ============================================================================
-- PART 20: HELPER FUNCTIONS FOR GEOSPATIAL QUERIES
-- ============================================================================

-- Find nearby movers within radius
CREATE OR REPLACE FUNCTION find_nearby_movers(
  p_location GEOGRAPHY,
  p_radius_km INTEGER DEFAULT 20,
  p_min_rating DECIMAL DEFAULT 3.0
)
RETURNS TABLE (
  mover_id UUID,
  business_name TEXT,
  distance_km DECIMAL,
  rating DECIMAL,
  total_moves INTEGER,
  vehicle_types vehicle_type_enum[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.business_name,
    ROUND((ST_Distance(m.current_location, p_location) / 1000)::NUMERIC, 2) as distance_km,
    m.rating,
    m.total_moves,
    m.vehicle_types
  FROM public.movers m
  WHERE m.verification_status = 'verified'
    AND m.availability_status = 'online'
    AND m.is_accepting_bookings = TRUE
    AND m.deleted_at IS NULL
    AND m.rating >= p_min_rating
    AND ST_DWithin(m.current_location, p_location, p_radius_km * 1000) -- Convert km to meters
  ORDER BY ST_Distance(m.current_location, p_location) ASC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql STABLE;

-- Calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance_km(
  p_location1 GEOGRAPHY,
  p_location2 GEOGRAPHY
)
RETURNS DECIMAL AS $$
BEGIN
  RETURN ROUND((ST_Distance(p_location1, p_location2) / 1000)::NUMERIC, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Check if location is within mover's service area
CREATE OR REPLACE FUNCTION is_location_in_service_area(
  p_mover_id UUID,
  p_location GEOGRAPHY
)
RETURNS BOOLEAN AS $$
DECLARE
  mover_record RECORD;
BEGIN
  SELECT service_areas, primary_location, service_radius_km
  INTO mover_record
  FROM public.movers
  WHERE id = p_mover_id;
  
  -- Check if location is in any service area polygon
  IF mover_record.service_areas IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM unnest(mover_record.service_areas) AS area
      WHERE ST_Contains(area::geometry, p_location::geometry)
    ) THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  -- Fallback: check if within service radius from primary location
  IF mover_record.primary_location IS NOT NULL THEN
    IF ST_DWithin(
      mover_record.primary_location, 
      p_location, 
      mover_record.service_radius_km * 1000
    ) THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- PART 21: ANALYTICS & REPORTING FUNCTIONS
-- ============================================================================

-- Get mover performance stats
CREATE OR REPLACE FUNCTION get_mover_stats(p_mover_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_bookings', COUNT(*),
    'completed_bookings', COUNT(*) FILTER (WHERE status = 'completed'),
    'cancelled_bookings', COUNT(*) FILTER (WHERE status LIKE 'cancelled%'),
    'total_earnings', SUM(final_price) FILTER (WHERE status = 'completed'),
    'average_rating', (SELECT rating FROM public.movers WHERE id = p_mover_id),
    'acceptance_rate', (SELECT acceptance_rate FROM public.movers WHERE id = p_mover_id),
    'completion_rate', (SELECT completion_rate FROM public.movers WHERE id = p_mover_id),
    'this_month_earnings', SUM(final_price) FILTER (
      WHERE status = 'completed' 
        AND DATE_TRUNC('month', completed_at) = DATE_TRUNC('month', CURRENT_DATE)
    ),
    'this_month_bookings', COUNT(*) FILTER (
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    )
  ) INTO result
  FROM public.bookings
  WHERE mover_id = p_mover_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get platform statistics
CREATE OR REPLACE FUNCTION get_platform_stats(p_date_from DATE DEFAULT CURRENT_DATE - INTERVAL '30 days')
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_bookings', COUNT(*),
    'total_revenue', SUM(p.commission_amount),
    'total_gmv', SUM(p.amount),
    'average_booking_value', AVG(b.final_price),
    'active_movers', (
      SELECT COUNT(*) FROM public.movers 
      WHERE verification_status = 'verified' 
        AND last_active_at > CURRENT_DATE - INTERVAL '7 days'
    ),
    'total_customers', (
      SELECT COUNT(DISTINCT customer_id) FROM public.bookings
      WHERE created_at >= p_date_from
    ),
    'completion_rate', 
      ROUND((COUNT(*) FILTER (WHERE b.status = 'completed')::NUMERIC / 
             NULLIF(COUNT(*), 0) * 100), 2)
  ) INTO result
  FROM public.bookings b
  LEFT JOIN public.payments p ON p.booking_id = b.id
  WHERE b.created_at >= p_date_from;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- PART 22: CREATE INDEXES FOR OPTIMIZATION
-- ============================================================================

-- Additional composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bookings_customer_status_date 
  ON public.bookings(customer_id, status, scheduled_date DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_mover_status_date 
  ON public.bookings(mover_id, status, scheduled_date DESC);

CREATE INDEX IF NOT EXISTS idx_movers_verification_rating 
  ON public.movers(verification_status, rating DESC) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_payments_mover_completed 
  ON public.payments(mover_id, created_at DESC) 
  WHERE payment_status = 'completed';

-- ============================================================================
-- PART 23: GRANT PERMISSIONS
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT ON public.movers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
GRANT SELECT ON public.payments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.ratings TO authenticated;
GRANT SELECT, INSERT ON public.mover_locations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mover_availability_schedule TO authenticated;
GRANT SELECT, UPDATE ON public.booking_requests TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION find_nearby_movers TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_distance_km TO authenticated;
GRANT EXECUTE ON FUNCTION is_location_in_service_area TO authenticated;
GRANT EXECUTE ON FUNCTION get_mover_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_platform_stats TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'MoveEasy Marketplace Schema Migration Completed Successfully';
  RAISE NOTICE 'Tables Created: movers, bookings, payments, ratings, mover_locations, mover_availability_schedule, booking_requests, notifications';
  RAISE NOTICE 'RLS Policies: Enabled and configured for all tables';
  RAISE NOTICE 'Helper Functions: Created for geospatial queries and analytics';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Verify all tables created: SELECT tablename FROM pg_tables WHERE schemaname = ''public'';';
  RAISE NOTICE '2. Test RLS policies with different user roles';
  RAISE NOTICE '3. Populate sample data for testing';
  RAISE NOTICE '4. Update application code to use new schema';
END $$;