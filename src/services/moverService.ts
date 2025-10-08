/**
 * Mover Service - Type-safe database operations for movers
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type aliases from Supabase generated types
type Mover = Database['public']['Tables']['movers']['Row'];
type MoverInsert = Database['public']['Tables']['movers']['Insert'];
type MoverUpdate = Database['public']['Tables']['movers']['Update'];
type VerificationStatus = Database['public']['Enums']['verification_status_enum'];
type AvailabilityStatus = Database['public']['Enums']['availability_status_enum'];
type VehicleType = Database['public']['Enums']['vehicle_type_enum'];

export interface CreateMoverInput {
  user_id: string;
  business_name: string;
  phone_primary: string;
  vehicle_types: VehicleType[];
  email?: string;
  service_radius_km?: number;
}

export interface UpdateMoverInput {
  business_name?: string;
  phone_primary?: string;
  phone_secondary?: string;
  email?: string;
  vehicle_types?: VehicleType[];
  vehicle_plate_numbers?: string[];
  max_capacity_kg?: number;
  has_helpers?: boolean;
  helper_count?: number;
  service_radius_km?: number;
  bio?: string;
  profile_image_url?: string;
  years_experience?: number;
  specializations?: string[];
}

export const moverService = {
  /**
   * Get all movers, optionally filtered by verification status
   */
  getAll: async (status?: VerificationStatus): Promise<Mover[]> => {
    let query = supabase
      .from('movers')
      .select('*')
      .is('deleted_at', null)
      .order('rating', { ascending: false });
    
    if (status) {
      query = query.eq('verification_status', status);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Get verified movers only (public view)
   */
  getVerified: async (): Promise<Mover[]> => {
    const { data, error } = await supabase
      .from('movers')
      .select('*')
      .eq('verification_status', 'verified')
      .is('deleted_at', null)
      .order('rating', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single mover by ID
   */
  getById: async (id: string): Promise<Mover | null> => {
    const { data, error } = await supabase
      .from('movers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  /**
   * Get mover by user ID
   */
  getByUserId: async (userId: string): Promise<Mover | null> => {
    const { data, error } = await supabase
      .from('movers')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  /**
   * Create a new mover profile
   */
  create: async (input: CreateMoverInput): Promise<Mover> => {
    const { data, error } = await supabase
      .from('movers')
      .insert({
        user_id: input.user_id,
        business_name: input.business_name,
        phone_primary: input.phone_primary,
        email: input.email,
        vehicle_types: input.vehicle_types,
        service_radius_km: input.service_radius_km || 20,
        verification_status: 'pending' as VerificationStatus,
        availability_status: 'offline' as AvailabilityStatus,
        is_accepting_bookings: false,
        has_helpers: false,
        helper_count: 0
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update mover profile
   */
  update: async (id: string, updates: UpdateMoverInput): Promise<Mover> => {
    const { data, error } = await supabase
      .from('movers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update mover availability status
   */
  updateAvailability: async (
    id: string, 
    status: AvailabilityStatus, 
    isAcceptingBookings: boolean
  ): Promise<Mover> => {
    const { data, error } = await supabase
      .from('movers')
      .update({
        availability_status: status,
        is_accepting_bookings: isAcceptingBookings,
        last_active_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Find nearby movers using PostGIS
   */
  findNearby: async (
    latitude: number,
    longitude: number,
    radiusKm: number = 20,
    minRating: number = 3.0
  ) => {
    const { data, error } = await supabase.rpc('find_nearby_movers', {
      p_location: `POINT(${longitude} ${latitude})`,
      p_radius_km: radiusKm,
      p_min_rating: minRating
    });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Get mover statistics
   */
  getStats: async (moverId: string) => {
    const { data, error } = await supabase.rpc('get_mover_stats', {
      p_mover_id: moverId
    });
    
    if (error) throw error;
    return data;
  },

  /**
   * Soft delete mover profile
   */
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('movers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  }
};
