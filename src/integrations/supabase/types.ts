export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      booking_requests: {
        Row: {
          booking_id: string
          created_at: string | null
          expires_at: string
          id: string
          mover_id: string
          offered_price: number | null
          rejection_reason: string | null
          responded_at: string | null
          response_notes: string | null
          sent_at: string | null
          status: string
          updated_at: string | null
          viewed_at: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          mover_id: string
          offered_price?: number | null
          rejection_reason?: string | null
          responded_at?: string | null
          response_notes?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string | null
          viewed_at?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          mover_id?: string
          offered_price?: number | null
          rejection_reason?: string | null
          responded_at?: string | null
          response_notes?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_mover_id_fkey"
            columns: ["mover_id"]
            isOneToOne: false
            referencedRelation: "movers"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          accepted_at: string | null
          actual_completion_time: string | null
          actual_duration_minutes: number | null
          actual_start_time: string | null
          additional_services: string[] | null
          admin_notes: string | null
          booking_number: string
          cancellation_reason: string | null
          cancelled_at: string | null
          completed_at: string | null
          completion_notes: string | null
          completion_photos: string[] | null
          completion_signature: string | null
          created_at: string | null
          currency: string | null
          customer_id: string
          customer_notes: string | null
          customer_satisfaction_score: number | null
          demand_multiplier: number | null
          dispute_reason: string | null
          dispute_status: string | null
          distance_meters: number | null
          dropoff_address: string
          dropoff_location: unknown
          dropoff_location_details: Json | null
          estimated_distance_meters: number | null
          estimated_duration_minutes: number | null
          estimated_price: number
          final_price: number | null
          has_dispute: boolean | null
          has_fragile_items: boolean | null
          id: string
          inventory: Json | null
          last_tracked_at: string | null
          last_tracked_location: unknown | null
          mover_id: string | null
          mover_notes: string | null
          mover_satisfaction_score: number | null
          pickup_address: string
          pickup_location: unknown
          pickup_location_details: Json | null
          preferred_arrival_time: string | null
          price_breakdown: Json | null
          property_size: string
          quote_id: string | null
          quoted_price: number | null
          reported_issues: string[] | null
          requires_insurance: boolean | null
          route_polyline: string | null
          scheduled_date: string
          scheduled_time_end: string | null
          scheduled_time_start: string
          special_instructions: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["booking_status_enum"] | null
          status_history: Json | null
          surge_multiplier: number | null
          time_of_day_multiplier: number | null
          tracking_data: Json | null
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          actual_completion_time?: string | null
          actual_duration_minutes?: number | null
          actual_start_time?: string | null
          additional_services?: string[] | null
          admin_notes?: string | null
          booking_number: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          completion_photos?: string[] | null
          completion_signature?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id: string
          customer_notes?: string | null
          customer_satisfaction_score?: number | null
          demand_multiplier?: number | null
          dispute_reason?: string | null
          dispute_status?: string | null
          distance_meters?: number | null
          dropoff_address: string
          dropoff_location: unknown
          dropoff_location_details?: Json | null
          estimated_distance_meters?: number | null
          estimated_duration_minutes?: number | null
          estimated_price: number
          final_price?: number | null
          has_dispute?: boolean | null
          has_fragile_items?: boolean | null
          id?: string
          inventory?: Json | null
          last_tracked_at?: string | null
          last_tracked_location?: unknown | null
          mover_id?: string | null
          mover_notes?: string | null
          mover_satisfaction_score?: number | null
          pickup_address: string
          pickup_location: unknown
          pickup_location_details?: Json | null
          preferred_arrival_time?: string | null
          price_breakdown?: Json | null
          property_size: string
          quote_id?: string | null
          quoted_price?: number | null
          reported_issues?: string[] | null
          requires_insurance?: boolean | null
          route_polyline?: string | null
          scheduled_date: string
          scheduled_time_end?: string | null
          scheduled_time_start: string
          special_instructions?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["booking_status_enum"] | null
          status_history?: Json | null
          surge_multiplier?: number | null
          time_of_day_multiplier?: number | null
          tracking_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          actual_completion_time?: string | null
          actual_duration_minutes?: number | null
          actual_start_time?: string | null
          additional_services?: string[] | null
          admin_notes?: string | null
          booking_number?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          completion_photos?: string[] | null
          completion_signature?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string
          customer_notes?: string | null
          customer_satisfaction_score?: number | null
          demand_multiplier?: number | null
          dispute_reason?: string | null
          dispute_status?: string | null
          distance_meters?: number | null
          dropoff_address?: string
          dropoff_location?: unknown
          dropoff_location_details?: Json | null
          estimated_distance_meters?: number | null
          estimated_duration_minutes?: number | null
          estimated_price?: number
          final_price?: number | null
          has_dispute?: boolean | null
          has_fragile_items?: boolean | null
          id?: string
          inventory?: Json | null
          last_tracked_at?: string | null
          last_tracked_location?: unknown | null
          mover_id?: string | null
          mover_notes?: string | null
          mover_satisfaction_score?: number | null
          pickup_address?: string
          pickup_location?: unknown
          pickup_location_details?: Json | null
          preferred_arrival_time?: string | null
          price_breakdown?: Json | null
          property_size?: string
          quote_id?: string | null
          quoted_price?: number | null
          reported_issues?: string[] | null
          requires_insurance?: boolean | null
          route_polyline?: string | null
          scheduled_date?: string
          scheduled_time_end?: string | null
          scheduled_time_start?: string
          special_instructions?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["booking_status_enum"] | null
          status_history?: Json | null
          surge_multiplier?: number | null
          time_of_day_multiplier?: number | null
          tracking_data?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_mover_id_fkey"
            columns: ["mover_id"]
            isOneToOne: false
            referencedRelation: "movers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      mover_availability_schedule: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          is_override: boolean | null
          mover_id: string
          notes: string | null
          specific_date: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          is_override?: boolean | null
          mover_id: string
          notes?: string | null
          specific_date?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          is_override?: boolean | null
          mover_id?: string
          notes?: string | null
          specific_date?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mover_availability_schedule_mover_id_fkey"
            columns: ["mover_id"]
            isOneToOne: false
            referencedRelation: "movers"
            referencedColumns: ["id"]
          },
        ]
      }
      mover_locations: {
        Row: {
          accuracy: number | null
          altitude: number | null
          battery_level: number | null
          booking_id: string | null
          created_at: string | null
          device_info: Json | null
          heading: number | null
          id: string
          latitude: number
          location: unknown
          location_source: string | null
          longitude: number
          mover_id: string
          recorded_at: string
          speed: number | null
        }
        Insert: {
          accuracy?: number | null
          altitude?: number | null
          battery_level?: number | null
          booking_id?: string | null
          created_at?: string | null
          device_info?: Json | null
          heading?: number | null
          id?: string
          latitude: number
          location: unknown
          location_source?: string | null
          longitude: number
          mover_id: string
          recorded_at?: string
          speed?: number | null
        }
        Update: {
          accuracy?: number | null
          altitude?: number | null
          battery_level?: number | null
          booking_id?: string | null
          created_at?: string | null
          device_info?: Json | null
          heading?: number | null
          id?: string
          latitude?: number
          location?: unknown
          location_source?: string | null
          longitude?: number
          mover_id?: string
          recorded_at?: string
          speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mover_locations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mover_locations_mover_id_fkey"
            columns: ["mover_id"]
            isOneToOne: false
            referencedRelation: "movers"
            referencedColumns: ["id"]
          },
        ]
      }
      movers: {
        Row: {
          acceptance_rate: number | null
          availability_status:
            | Database["public"]["Enums"]["availability_status_enum"]
            | null
          average_response_time_seconds: number | null
          bio: string | null
          business_name: string
          business_registration_number: string | null
          cancelled_moves: number | null
          commission_rate: number | null
          completed_moves: number | null
          completion_rate: number | null
          cover_image_url: string | null
          created_at: string | null
          current_location: unknown | null
          current_location_updated_at: string | null
          deleted_at: string | null
          documents: Json | null
          email: string | null
          featured_until: string | null
          has_helpers: boolean | null
          helper_count: number | null
          id: string
          is_accepting_bookings: boolean | null
          is_premium: boolean | null
          kra_pin: string | null
          languages: string[] | null
          last_active_at: string | null
          max_capacity_kg: number | null
          payment_details: Json | null
          pending_payout: number | null
          phone_primary: string
          phone_secondary: string | null
          premium_expires_at: string | null
          primary_location: unknown | null
          profile_image_url: string | null
          rating: number | null
          service_areas: unknown[] | null
          service_radius_km: number | null
          specializations: string[] | null
          total_earnings: number | null
          total_moves: number | null
          total_ratings: number | null
          updated_at: string | null
          user_id: string
          vehicle_plate_numbers: string[] | null
          vehicle_types: Database["public"]["Enums"]["vehicle_type_enum"][]
          verification_notes: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status_enum"]
            | null
          verified_at: string | null
          verified_by: string | null
          years_experience: number | null
        }
        Insert: {
          acceptance_rate?: number | null
          availability_status?:
            | Database["public"]["Enums"]["availability_status_enum"]
            | null
          average_response_time_seconds?: number | null
          bio?: string | null
          business_name: string
          business_registration_number?: string | null
          cancelled_moves?: number | null
          commission_rate?: number | null
          completed_moves?: number | null
          completion_rate?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          current_location?: unknown | null
          current_location_updated_at?: string | null
          deleted_at?: string | null
          documents?: Json | null
          email?: string | null
          featured_until?: string | null
          has_helpers?: boolean | null
          helper_count?: number | null
          id?: string
          is_accepting_bookings?: boolean | null
          is_premium?: boolean | null
          kra_pin?: string | null
          languages?: string[] | null
          last_active_at?: string | null
          max_capacity_kg?: number | null
          payment_details?: Json | null
          pending_payout?: number | null
          phone_primary: string
          phone_secondary?: string | null
          premium_expires_at?: string | null
          primary_location?: unknown | null
          profile_image_url?: string | null
          rating?: number | null
          service_areas?: unknown[] | null
          service_radius_km?: number | null
          specializations?: string[] | null
          total_earnings?: number | null
          total_moves?: number | null
          total_ratings?: number | null
          updated_at?: string | null
          user_id: string
          vehicle_plate_numbers?: string[] | null
          vehicle_types?: Database["public"]["Enums"]["vehicle_type_enum"][]
          verification_notes?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status_enum"]
            | null
          verified_at?: string | null
          verified_by?: string | null
          years_experience?: number | null
        }
        Update: {
          acceptance_rate?: number | null
          availability_status?:
            | Database["public"]["Enums"]["availability_status_enum"]
            | null
          average_response_time_seconds?: number | null
          bio?: string | null
          business_name?: string
          business_registration_number?: string | null
          cancelled_moves?: number | null
          commission_rate?: number | null
          completed_moves?: number | null
          completion_rate?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          current_location?: unknown | null
          current_location_updated_at?: string | null
          deleted_at?: string | null
          documents?: Json | null
          email?: string | null
          featured_until?: string | null
          has_helpers?: boolean | null
          helper_count?: number | null
          id?: string
          is_accepting_bookings?: boolean | null
          is_premium?: boolean | null
          kra_pin?: string | null
          languages?: string[] | null
          last_active_at?: string | null
          max_capacity_kg?: number | null
          payment_details?: Json | null
          pending_payout?: number | null
          phone_primary?: string
          phone_secondary?: string | null
          premium_expires_at?: string | null
          primary_location?: unknown | null
          profile_image_url?: string | null
          rating?: number | null
          service_areas?: unknown[] | null
          service_radius_km?: number | null
          specializations?: string[] | null
          total_earnings?: number | null
          total_moves?: number | null
          total_ratings?: number | null
          updated_at?: string | null
          user_id?: string
          vehicle_plate_numbers?: string[] | null
          vehicle_types?: Database["public"]["Enums"]["vehicle_type_enum"][]
          verification_notes?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status_enum"]
            | null
          verified_at?: string | null
          verified_by?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          booking_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          is_sent: boolean | null
          message: string
          metadata: Json | null
          priority: string | null
          read_at: string | null
          sent_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          booking_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          is_sent?: boolean | null
          message: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          sent_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          booking_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          is_sent?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          card_brand: string | null
          card_last_four: string | null
          card_transaction_id: string | null
          commission_amount: number
          commission_rate: number
          completed_at: string | null
          created_at: string | null
          currency: string | null
          customer_id: string
          escrow_release_reason: string | null
          escrow_released_at: string | null
          failed_at: string | null
          gateway_provider: string | null
          gateway_response: Json | null
          gateway_transaction_id: string | null
          id: string
          insurance_fee: number | null
          is_held_in_escrow: boolean | null
          is_refunded: boolean | null
          last_error_at: string | null
          last_error_message: string | null
          metadata: Json | null
          mover_id: string | null
          mover_payout_amount: number
          mpesa_phone_number: string | null
          mpesa_receipt_number: string | null
          mpesa_transaction_date: string | null
          mpesa_transaction_id: string | null
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method_enum"]
          payment_reference: string
          payment_status:
            | Database["public"]["Enums"]["payment_status_enum"]
            | null
          refund_amount: number | null
          refund_reason: string | null
          refund_transaction_id: string | null
          refunded_at: string | null
          retry_count: number | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          card_brand?: string | null
          card_last_four?: string | null
          card_transaction_id?: string | null
          commission_amount: number
          commission_rate: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id: string
          escrow_release_reason?: string | null
          escrow_released_at?: string | null
          failed_at?: string | null
          gateway_provider?: string | null
          gateway_response?: Json | null
          gateway_transaction_id?: string | null
          id?: string
          insurance_fee?: number | null
          is_held_in_escrow?: boolean | null
          is_refunded?: boolean | null
          last_error_at?: string | null
          last_error_message?: string | null
          metadata?: Json | null
          mover_id?: string | null
          mover_payout_amount: number
          mpesa_phone_number?: string | null
          mpesa_receipt_number?: string | null
          mpesa_transaction_date?: string | null
          mpesa_transaction_id?: string | null
          notes?: string | null
          payment_method: Database["public"]["Enums"]["payment_method_enum"]
          payment_reference: string
          payment_status?:
            | Database["public"]["Enums"]["payment_status_enum"]
            | null
          refund_amount?: number | null
          refund_reason?: string | null
          refund_transaction_id?: string | null
          refunded_at?: string | null
          retry_count?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          card_brand?: string | null
          card_last_four?: string | null
          card_transaction_id?: string | null
          commission_amount?: number
          commission_rate?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string
          escrow_release_reason?: string | null
          escrow_released_at?: string | null
          failed_at?: string | null
          gateway_provider?: string | null
          gateway_response?: Json | null
          gateway_transaction_id?: string | null
          id?: string
          insurance_fee?: number | null
          is_held_in_escrow?: boolean | null
          is_refunded?: boolean | null
          last_error_at?: string | null
          last_error_message?: string | null
          metadata?: Json | null
          mover_id?: string | null
          mover_payout_amount?: number
          mpesa_phone_number?: string | null
          mpesa_receipt_number?: string | null
          mpesa_transaction_date?: string | null
          mpesa_transaction_id?: string | null
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method_enum"]
          payment_reference?: string
          payment_status?:
            | Database["public"]["Enums"]["payment_status_enum"]
            | null
          refund_amount?: number | null
          refund_reason?: string | null
          refund_transaction_id?: string | null
          refunded_at?: string | null
          retry_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_mover_id_fkey"
            columns: ["mover_id"]
            isOneToOne: false
            referencedRelation: "movers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          phone_number: string | null
          preferred_contact_method: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          preferred_contact_method?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          preferred_contact_method?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quote_responses: {
        Row: {
          created_at: string
          estimated_duration: string | null
          id: string
          mover_id: string
          quote_id: string
          quoted_price: number
          response_message: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimated_duration?: string | null
          id?: string
          mover_id: string
          quote_id: string
          quoted_price: number
          response_message?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimated_duration?: string | null
          id?: string
          mover_id?: string
          quote_id?: string
          quoted_price?: number
          response_message?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_quote_responses_quote_id"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          additional_services: string[] | null
          created_at: string
          estimated_cost: number | null
          from_location: string
          id: string
          moving_date: string
          property_size: string
          special_requirements: string | null
          status: string
          to_location: string
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_services?: string[] | null
          created_at?: string
          estimated_cost?: number | null
          from_location: string
          id?: string
          moving_date: string
          property_size: string
          special_requirements?: string | null
          status?: string
          to_location: string
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_services?: string[] | null
          created_at?: string
          estimated_cost?: number | null
          from_location?: string
          id?: string
          moving_date?: string
          property_size?: string
          special_requirements?: string | null
          status?: string
          to_location?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ratings: {
        Row: {
          booking_id: string
          care_of_items_rating: number | null
          communication_rating: number | null
          created_at: string | null
          has_response: boolean | null
          helpful_count: number | null
          hidden_reason: string | null
          id: string
          is_featured: boolean | null
          is_hidden: boolean | null
          is_verified: boolean | null
          photos: string[] | null
          professionalism_rating: number | null
          punctuality_rating: number | null
          rated_id: string
          rater_id: string
          rating: number
          rating_type: Database["public"]["Enums"]["rating_type_enum"]
          response_date: string | null
          response_text: string | null
          review_text: string | null
          review_title: string | null
          unhelpful_count: number | null
          updated_at: string | null
          value_for_money_rating: number | null
        }
        Insert: {
          booking_id: string
          care_of_items_rating?: number | null
          communication_rating?: number | null
          created_at?: string | null
          has_response?: boolean | null
          helpful_count?: number | null
          hidden_reason?: string | null
          id?: string
          is_featured?: boolean | null
          is_hidden?: boolean | null
          is_verified?: boolean | null
          photos?: string[] | null
          professionalism_rating?: number | null
          punctuality_rating?: number | null
          rated_id: string
          rater_id: string
          rating: number
          rating_type: Database["public"]["Enums"]["rating_type_enum"]
          response_date?: string | null
          response_text?: string | null
          review_text?: string | null
          review_title?: string | null
          unhelpful_count?: number | null
          updated_at?: string | null
          value_for_money_rating?: number | null
        }
        Update: {
          booking_id?: string
          care_of_items_rating?: number | null
          communication_rating?: number | null
          created_at?: string | null
          has_response?: boolean | null
          helpful_count?: number | null
          hidden_reason?: string | null
          id?: string
          is_featured?: boolean | null
          is_hidden?: boolean | null
          is_verified?: boolean | null
          photos?: string[] | null
          professionalism_rating?: number | null
          punctuality_rating?: number | null
          rated_id?: string
          rater_id?: string
          rating?: number
          rating_type?: Database["public"]["Enums"]["rating_type_enum"]
          response_date?: string | null
          response_text?: string | null
          review_text?: string | null
          review_title?: string | null
          unhelpful_count?: number | null
          updated_at?: string | null
          value_for_money_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          mover_id: string
          quote_id: string
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mover_id: string
          quote_id: string
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mover_id?: string
          quote_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: { "": unknown }
        Returns: number
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_pointoutside: {
        Args: { "": unknown }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: { geom: unknown }
        Returns: number
      }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      addauth: {
        Args: { "": string }
        Returns: boolean
      }
      addgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
        Returns: string
      }
      box: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box3d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3dtobox: {
        Args: { "": unknown }
        Returns: unknown
      }
      bytea: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      calculate_distance_km: {
        Args: { p_location1: unknown; p_location2: unknown }
        Returns: number
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
          | { column_name: string; schema_name: string; table_name: string }
          | { column_name: string; table_name: string }
        Returns: string
      }
      dropgeometrytable: {
        Args:
          | { catalog_name: string; schema_name: string; table_name: string }
          | { schema_name: string; table_name: string }
          | { table_name: string }
        Returns: string
      }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      expire_old_booking_requests: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      find_nearby_movers: {
        Args: {
          p_location: unknown
          p_min_rating?: number
          p_radius_km?: number
        }
        Returns: {
          business_name: string
          distance_km: number
          mover_id: string
          rating: number
          total_moves: number
          vehicle_types: Database["public"]["Enums"]["vehicle_type_enum"][]
        }[]
      }
      geography: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      geography_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_send: {
        Args: { "": unknown }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geography_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry: {
        Args:
          | { "": string }
          | { "": string }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
        Returns: unknown
      }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_hash: {
        Args: { "": unknown }
        Returns: number
      }
      geometry_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_recv: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_send: {
        Args: { "": unknown }
        Returns: string
      }
      geometry_sortsupport: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geometry_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometrytype: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      get_latest_mover_location: {
        Args: { p_mover_id: string }
        Returns: {
          latitude: number
          location: unknown
          longitude: number
          recorded_at: string
        }[]
      }
      get_mover_stats: {
        Args: { p_mover_id: string }
        Returns: Json
      }
      get_platform_stats: {
        Args: { p_date_from?: string }
        Returns: Json
      }
      get_proj4_from_srid: {
        Args: { "": number }
        Returns: string
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gidx_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_location_in_service_area: {
        Args: { p_location: unknown; p_mover_id: string }
        Returns: boolean
      }
      json: {
        Args: { "": unknown }
        Returns: Json
      }
      jsonb: {
        Args: { "": unknown }
        Returns: Json
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      path: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      point: {
        Args: { "": unknown }
        Returns: unknown
      }
      polygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      populate_geometry_columns: {
        Args:
          | { tbl_oid: unknown; use_typmod?: boolean }
          | { use_typmod?: boolean }
        Returns: string
      }
      postgis_addbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_dropbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: { "": unknown }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_type: {
        Args: { "": number }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      spheroid_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      spheroid_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlength: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dperimeter: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle: {
        Args:
          | { line1: unknown; line2: unknown }
          | { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
        Returns: number
      }
      st_area: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_area2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_asbinary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_asewkt: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asgeojson: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; options?: number }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
        Returns: string
      }
      st_asgml: {
        Args:
          | { "": string }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_ashexewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_askml: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
          | { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
        Returns: string
      }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: {
        Args: { format?: string; geom: unknown }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; rel?: number }
          | { geom: unknown; maxdecimaldigits?: number; rel?: number }
        Returns: string
      }
      st_astext: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_astwkb: {
        Args:
          | {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
          | {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
        Returns: string
      }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_boundary: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer: {
        Args:
          | { geom: unknown; options?: string; radius: number }
          | { geom: unknown; quadsegs: number; radius: number }
        Returns: unknown
      }
      st_buildarea: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_centroid: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      st_cleangeometry: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      st_collect: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collectionextract: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_convexhull: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_coorddim: {
        Args: { geometry: unknown }
        Returns: number
      }
      st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_dimension: {
        Args: { "": unknown }
        Returns: number
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance: {
        Args:
          | { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_distancesphere: {
        Args:
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; radius: number }
        Returns: number
      }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dump: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_endpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_envelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_expand: {
        Args:
          | { box: unknown; dx: number; dy: number }
          | { box: unknown; dx: number; dy: number; dz?: number }
          | { dm?: number; dx: number; dy: number; dz?: number; geom: unknown }
        Returns: unknown
      }
      st_exteriorring: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force3d: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_forcecollection: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcecurve: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcerhr: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcesfs: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_generatepoints: {
        Args:
          | { area: unknown; npoints: number }
          | { area: unknown; npoints: number; seed: number }
        Returns: unknown
      }
      st_geogfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geohash: {
        Args:
          | { geog: unknown; maxchars?: number }
          | { geom: unknown; maxchars?: number }
        Returns: string
      }
      st_geomcollfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometrytype: {
        Args: { "": unknown }
        Returns: string
      }
      st_geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromgeojson: {
        Args: { "": Json } | { "": Json } | { "": string }
        Returns: unknown
      }
      st_geomfromgml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: { marc21xml: string }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_gmltosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_hasarc: {
        Args: { geometry: unknown }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_isclosed: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_iscollection: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isempty: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isring: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_issimple: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvalid: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: { "": unknown }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_length: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_length2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_letters: {
        Args: { font?: Json; letters: string }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linemerge: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linetocurve: {
        Args: { geometry: unknown }
        Returns: unknown
      }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_m: {
        Args: { "": unknown }
        Returns: number
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makepolygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { "": unknown } | { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multi: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_ndims: {
        Args: { "": unknown }
        Returns: number
      }
      st_node: {
        Args: { g: unknown }
        Returns: unknown
      }
      st_normalize: {
        Args: { geom: unknown }
        Returns: unknown
      }
      st_npoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_nrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numgeometries: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorring: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpatches: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { "": unknown } | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_perimeter2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_pointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_points: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonize: {
        Args: { "": unknown[] }
        Returns: unknown
      }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_reverse: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid: {
        Args: { geog: unknown; srid: number } | { geom: unknown; srid: number }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid: {
        Args: { geog: unknown } | { geom: unknown }
        Returns: number
      }
      st_startpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_summary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_transform: {
        Args:
          | { from_proj: string; geom: unknown; to_proj: string }
          | { from_proj: string; geom: unknown; to_srid: number }
          | { geom: unknown; to_proj: string }
        Returns: unknown
      }
      st_triangulatepolygon: {
        Args: { g1: unknown }
        Returns: unknown
      }
      st_union: {
        Args:
          | { "": unknown[] }
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; gridsize: number }
        Returns: unknown
      }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: { wkb: string }
        Returns: unknown
      }
      st_wkttosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      st_x: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmin: {
        Args: { "": unknown }
        Returns: number
      }
      st_y: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymax: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymin: {
        Args: { "": unknown }
        Returns: number
      }
      st_z: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmflag: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmin: {
        Args: { "": unknown }
        Returns: number
      }
      text: {
        Args: { "": unknown }
        Returns: string
      }
      unlockrows: {
        Args: { "": string }
        Returns: number
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      availability_status_enum: "online" | "offline" | "busy"
      booking_status_enum:
        | "pending"
        | "accepted"
        | "mover_en_route"
        | "in_progress"
        | "completed"
        | "cancelled_customer"
        | "cancelled_mover"
        | "cancelled_system"
        | "disputed"
      payment_method_enum: "mpesa" | "card" | "cash" | "bank_transfer"
      payment_status_enum:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
        | "held_escrow"
      rating_type_enum: "customer_to_mover" | "mover_to_customer"
      vehicle_type_enum:
        | "pickup"
        | "box_truck_small"
        | "box_truck_medium"
        | "box_truck_large"
        | "container_truck"
        | "van"
      verification_status_enum:
        | "pending"
        | "documents_submitted"
        | "verified"
        | "suspended"
        | "rejected"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      availability_status_enum: ["online", "offline", "busy"],
      booking_status_enum: [
        "pending",
        "accepted",
        "mover_en_route",
        "in_progress",
        "completed",
        "cancelled_customer",
        "cancelled_mover",
        "cancelled_system",
        "disputed",
      ],
      payment_method_enum: ["mpesa", "card", "cash", "bank_transfer"],
      payment_status_enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
        "held_escrow",
      ],
      rating_type_enum: ["customer_to_mover", "mover_to_customer"],
      vehicle_type_enum: [
        "pickup",
        "box_truck_small",
        "box_truck_medium",
        "box_truck_large",
        "container_truck",
        "van",
      ],
      verification_status_enum: [
        "pending",
        "documents_submitted",
        "verified",
        "suspended",
        "rejected",
      ],
    },
  },
} as const
