/**
 * TypeScript Types for MoveEasy Marketplace Database Schema
 * 
 * Auto-generated from Supabase schema
 * These types match the database schema created in migration files
 * 
 * Usage:
 * import { Mover, Booking, Payment } from '@/types/database'
 */

import type { Point, Polygon } from 'geojson';

// ============================================================================
// ENUMS (matching database custom types)
// ============================================================================

export type VerificationStatus = 
  | 'pending' 
  | 'documents_submitted' 
  | 'verified' 
  | 'suspended' 
  | 'rejected';

export type AvailabilityStatus = 
  | 'online' 
  | 'offline' 
  | 'busy';

export type BookingStatus = 
  | 'pending' 
  | 'accepted' 
  | 'mover_en_route' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled_customer' 
  | 'cancelled_mover' 
  | 'cancelled_system' 
  | 'disputed';

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'refunded' 
  | 'held_escrow';

export type PaymentMethod = 
  | 'mpesa' 
  | 'card' 
  | 'cash' 
  | 'bank_transfer';

export type VehicleType = 
  | 'pickup' 
  | 'box_truck_small' 
  | 'box_truck_medium' 
  | 'box_truck_large' 
  | 'container_truck' 
  | 'van';

export type RatingType = 
  | 'customer_to_mover' 
  | 'mover_to_customer';

// ============================================================================
// DATABASE TABLES
// ============================================================================

export interface Mover {
  // Primary identification
  id: string;
  user_id: string;
  
  // Business Information
  business_name: string;
  business_registration_number?: string;
  kra_pin?: string;
  phone_primary: string;
  phone_secondary?: string;
  email?: string;
  
  // Service Details
  vehicle_types: VehicleType[];
  vehicle_plate_numbers?: string[];
  max_capacity_kg?: number;
  has_helpers: boolean;
  helper_count: number;
  
  // Service Areas (PostGIS geography types serialized as GeoJSON)
  service_areas?: Polygon[];
  primary_location?: Point;
  service_radius_km: number;
  
  // Availability
  availability_status: AvailabilityStatus;
  current_location?: Point;
  current_location_updated_at?: string;
  is_accepting_bookings: boolean;
  
  // Verification & Documents
  verification_status: VerificationStatus;
  verification_notes?: string;
  verified_at?: string;
  verified_by?: string;
  documents: {
    national_id?: string;
    drivers_license?: string;
    vehicle_logbook?: string;
    insurance_certificate?: string;
    kra_pin_certificate?: string;
    business_permit?: string;
    good_conduct_certificate?: string;
  };
  
  // Performance Metrics
  rating: number;
  total_ratings: number;
  total_moves: number;
  completed_moves: number;
  cancelled_moves: number;
  acceptance_rate: number;
  completion_rate: number;
  average_response_time_seconds: number;
  
  // Financial
  total_earnings: number;
  pending_payout: number;
  commission_rate: number;
  payment_details: {
    mpesa_number?: string;
    bank_name?: string;
    account_number?: string;
    account_name?: string;
  };
  
  // Subscription & Features
  is_premium: boolean;
  premium_expires_at?: string;
  featured_until?: string;
  
  // Metadata
  bio?: string;
  profile_image_url?: string;
  cover_image_url?: string;
  languages: string[];
  years_experience?: number;
  specializations?: string[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
  last_active_at?: string;
  deleted_at?: string;
}

export interface Booking {
  // Primary identification
  id: string;
  booking_number: string;
  
  // Relationships
  customer_id: string;
  mover_id?: string;
  quote_id?: string;
  
  // Status
  status: BookingStatus;
  status_history: Array<{
    from_status: BookingStatus;
    to_status: BookingStatus;
    changed_at: string;
    changed_by?: string;
  }>;
  
  // Location Details
  pickup_address: string;
  pickup_location: Point;
  pickup_location_details: {
    floor_number?: number;
    has_elevator: boolean;
    access_notes?: string;
    contact_name?: string;
    contact_phone?: string;
  };
  
  dropoff_address: string;
  dropoff_location: Point;
  dropoff_location_details: {
    floor_number?: number;
    has_elevator: boolean;
    access_notes?: string;
    contact_name?: string;
    contact_phone?: string;
  };
  
  // Timing
  scheduled_date: string;
  scheduled_time_start: string;
  scheduled_time_end?: string;
  preferred_arrival_time?: string;
  actual_start_time?: string;
  actual_completion_time?: string;
  estimated_duration_minutes?: number;
  actual_duration_minutes?: number;
  
  // Move Details
  property_size: string;
  inventory: Record<string, any>;
  additional_services: string[];
  special_instructions?: string;
  has_fragile_items: boolean;
  requires_insurance: boolean;
  
  // Distance & Route
  distance_meters?: number;
  estimated_distance_meters?: number;
  route_polyline?: string;
  
  // Pricing
  estimated_price: number;
  quoted_price?: number;
  final_price?: number;
  price_breakdown: {
    base_price: number;
    distance_charge: number;
    labor_charge: number;
    inventory_charge: number;
    services_charge: number;
    surge_multiplier: number;
    discount: number;
    insurance_fee: number;
    total: number;
  };
  currency: string;
  
  // Dynamic Pricing Factors
  demand_multiplier: number;
  surge_multiplier: number;
  time_of_day_multiplier: number;
  
  // Real-time Tracking
  tracking_data: Array<{
    location: Point;
    timestamp: string;
    heading?: number;
    speed?: number;
  }>;
  last_tracked_location?: Point;
  last_tracked_at?: string;
  
  // Communication
  customer_notes?: string;
  mover_notes?: string;
  admin_notes?: string;
  
  // Completion Details
  completion_photos?: string[];
  completion_signature?: string;
  completion_notes?: string;
  
  // Dispute & Issues
  has_dispute: boolean;
  dispute_reason?: string;
  dispute_status?: string;
  reported_issues?: string[];
  
  // Performance Metrics
  customer_satisfaction_score?: number;
  mover_satisfaction_score?: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  accepted_at?: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
}

export interface Payment {
  // Primary identification
  id: string;
  payment_reference: string;
  
  // Relationships
  booking_id: string;
  customer_id: string;
  mover_id?: string;
  
  // Payment Details
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  
  // Commission & Payouts
  commission_rate: number;
  commission_amount: number;
  mover_payout_amount: number;
  insurance_fee: number;
  
  // M-Pesa Specific
  mpesa_transaction_id?: string;
  mpesa_phone_number?: string;
  mpesa_receipt_number?: string;
  mpesa_transaction_date?: string;
  
  // Card Payment Specific
  card_last_four?: string;
  card_brand?: string;
  card_transaction_id?: string;
  
  // External Payment Gateway
  gateway_provider?: string;
  gateway_transaction_id?: string;
  gateway_response?: Record<string, any>;
  
  // Escrow Management
  is_held_in_escrow: boolean;
  escrow_released_at?: string;
  escrow_release_reason?: string;
  
  // Refunds
  is_refunded: boolean;
  refund_amount?: number;
  refund_reason?: string;
  refunded_at?: string;
  refund_transaction_id?: string;
  
  // Retry & Error Handling
  retry_count: number;
  last_error_message?: string;
  last_error_at?: string;
  
  // Metadata
  metadata: Record<string, any>;
  notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  completed_at?: string;
  failed_at?: string;
}

export interface Rating {
  // Primary identification
  id: string;
  
  // Relationships
  booking_id: string;
  rater_id: string;
  rated_id: string;
  rating_type: RatingType;
  
  // Rating Details
  rating: number; // 1-5
  review_text?: string;
  review_title?: string;
  
  // Specific Rating Categories
  punctuality_rating?: number;
  professionalism_rating?: number;
  care_of_items_rating?: number;
  communication_rating?: number;
  value_for_money_rating?: number;
  
  // Media
  photos?: string[];
  
  // Moderation
  is_verified: boolean;
  is_hidden: boolean;
  hidden_reason?: string;
  is_featured: boolean;
  
  // Response
  has_response: boolean;
  response_text?: string;
  response_date?: string;
  
  // Helpfulness
  helpful_count: number;
  unhelpful_count: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface MoverLocation {
  // Primary identification
  id: string;
  
  // Relationships
  mover_id: string;
  booking_id?: string;
  
  // Location Data
  location: Point;
  latitude: number;
  longitude: number;
  
  // Movement Data
  heading?: number;
  speed?: number;
  altitude?: number;
  
  // Accuracy & Quality
  accuracy?: number;
  location_source: string;
  
  // Battery & Device Info
  battery_level?: number;
  device_info?: Record<string, any>;
  
  // Timestamp
  recorded_at: string;
  created_at: string;
}

export interface MoverAvailabilitySchedule {
  // Primary identification
  id: string;
  
  // Relationships
  mover_id: string;
  
  // Schedule Details
  day_of_week: number; // 0=Sunday, 6=Saturday
  start_time: string;
  end_time: string;
  is_available: boolean;
  
  // Special Dates
  specific_date?: string;
  is_override: boolean;
  
  // Notes
  notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface BookingRequest {
  // Primary identification
  id: string;
  
  // Relationships
  booking_id: string;
  mover_id: string;
  
  // Request Status
  status: 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  
  // Pricing
  offered_price?: number;
  
  // Response
  response_notes?: string;
  rejection_reason?: string;
  
  // Timing
  sent_at: string;
  viewed_at?: string;
  responded_at?: string;
  expires_at: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface Notification {
  // Primary identification
  id: string;
  
  // Relationships
  user_id: string;
  booking_id?: string;
  
  // Notification Details
  type: string;
  title: string;
  message: string;
  
  // Action Details
  action_url?: string;
  action_label?: string;
  
  // Status
  is_read: boolean;
  is_sent: boolean;
  sent_at?: string;
  read_at?: string;
  
  // Priority
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Metadata
  metadata: Record<string, any>;
  
  // Timestamps
  created_at: string;
  expires_at?: string;
}

// ============================================================================
// HELPER FUNCTION RETURN TYPES
// ============================================================================

export interface NearbyMover {
  mover_id: string;
  business_name: string;
  distance_km: number;
  rating: number;
  total_moves: number;
  vehicle_types: VehicleType[];
}

export interface MoverStats {
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_earnings: number;
  average_rating: number;
  acceptance_rate: number;
  completion_rate: number;
  this_month_earnings: number;
  this_month_bookings: number;
}

export interface PlatformStats {
  total_bookings: number;
  total_revenue: number;
  total_gmv: number;
  average_booking_value: number;
  active_movers: number;
  total_customers: number;
  completion_rate: number;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateMoverRequest {
  business_name: string;
  phone_primary: string;
  email?: string;
  vehicle_types: VehicleType[];
  service_radius_km?: number;
}

export interface CreateBookingRequest {
  pickup_address: string;
  pickup_location: {
    latitude: number;
    longitude: number;
  };
  dropoff_address: string;
  dropoff_location: {
    latitude: number;
    longitude: number;
  };
  scheduled_date: string;
  scheduled_time_start: string;
  property_size: string;
  inventory?: Record<string, any>;
  additional_services?: string[];
  special_instructions?: string;
}

export interface CreatePaymentRequest {
  booking_id: string;
  amount: number;
  payment_method: PaymentMethod;
  mpesa_phone_number?: string;
}

export interface CreateRatingRequest {
  booking_id: string;
  rated_id: string;
  rating_type: RatingType;
  rating: number;
  review_text?: string;
  review_title?: string;
}

export interface UpdateMoverLocationRequest {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  battery_level?: number;
}

// ============================================================================
// SUPABASE QUERY HELPERS
// ============================================================================

export type Database = {
  public: {
    Tables: {
      movers: {
        Row: Mover;
        Insert: Omit<Mover, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Mover, 'id' | 'user_id' | 'created_at'>>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, 'id' | 'booking_number' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Booking, 'id' | 'booking_number' | 'customer_id' | 'created_at'>>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, 'id' | 'payment_reference' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Payment, 'id' | 'payment_reference' | 'created_at'>>;
      };
      ratings: {
        Row: Rating;
        Insert: Omit<Rating, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Rating, 'id' | 'booking_id' | 'rater_id' | 'rated_id' | 'created_at'>>;
      };
      mover_locations: {
        Row: MoverLocation;
        Insert: Omit<MoverLocation, 'id' | 'created_at'>;
        Update: Partial<Omit<MoverLocation, 'id' | 'mover_id' | 'created_at'>>;
      };
      mover_availability_schedule: {
        Row: MoverAvailabilitySchedule;
        Insert: Omit<MoverAvailabilitySchedule, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MoverAvailabilitySchedule, 'id' | 'mover_id' | 'created_at'>>;
      };
      booking_requests: {
        Row: BookingRequest;
        Insert: Omit<BookingRequest, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BookingRequest, 'id' | 'booking_id' | 'mover_id' | 'created_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id' | 'user_id' | 'created_at'>>;
      };
    };
    Functions: {
      find_nearby_movers: {
        Args: {
          p_location: Point | string; // GeoJSON Point or WKT string (e.g., 'POINT(lng lat)')
          p_radius_km?: number;
          p_min_rating?: number;
        };
        Returns: NearbyMover[];
      };
      calculate_distance_km: {
        Args: {
          p_location1: Point | string; // GeoJSON Point or WKT string
          p_location2: Point | string; // GeoJSON Point or WKT string
        };
        Returns: number;
      };
      is_location_in_service_area: {
        Args: {
          p_mover_id: string;
          p_location: Point | string; // GeoJSON Point or WKT string
        };
        Returns: boolean;
      };
      get_mover_stats: {
        Args: {
          p_mover_id: string;
        };
        Returns: MoverStats;
      };
      get_platform_stats: {
        Args: {
          p_date_from?: string;
        };
        Returns: PlatformStats;
      };
    };
  };
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithTimestamps<T> = T & {
  created_at: string;
  updated_at: string;
};

export type WithoutTimestamps<T> = Omit<T, 'created_at' | 'updated_at'>;
