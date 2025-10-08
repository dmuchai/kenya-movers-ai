/**
 * Location Service - Handle geolocation and location-based queries
 */

import { supabase } from '@/integrations/supabase/client';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationResult {
  address: string;
  coordinates: Coordinates;
  placeId?: string;
}

export const locationService = {
  /**
   * Get current user location using browser geolocation
   */
  getCurrentLocation: (): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  },

  /**
   * Calculate distance between two points in kilometers
   * Uses Haversine formula (simple calculation without PostGIS)
   */
  calculateDistance: async (
    point1: Coordinates,
    point2: Coordinates
  ): Promise<number> => {
    // Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  /**
   * Find nearby movers using PostGIS function
   */
  findNearbyMovers: async (
    latitude: number,
    longitude: number,
    radiusKm: number,
    vehicleTypes?: string[]
  ) => {
    const location = `POINT(${longitude} ${latitude})`;
    
    const { data, error } = await supabase.rpc('find_nearby_movers', {
      p_location: location,
      p_radius_km: radiusKm,
      p_min_rating: 0
    });

    if (error) throw error;
    
    // Filter by vehicle types if provided (client-side filtering)
    // Filter by vehicle types if provided (client-side filtering)
    if (vehicleTypes && vehicleTypes.length > 0) {
      return data.filter((mover: any) => 
        mover.vehicle_types?.some((type: string) => vehicleTypes.includes(type))
      );
    }
    
    return data;
  },

  /**
   * Format coordinates as PostGIS POINT string
   */
  toPostGISPoint: (latitude: number, longitude: number): string => {
    return `POINT(${longitude} ${latitude})`;
  },

  /**
   * Parse PostGIS POINT string to coordinates
   */
  fromPostGISPoint: (point: string): Coordinates | null => {
    const match = point.match(/POINT\(([0-9.-]+) ([0-9.-]+)\)/);
    if (!match) return null;
    
    return {
      longitude: parseFloat(match[1]),
      latitude: parseFloat(match[2])
    };
  },

  /**
   * Reverse geocode coordinates to address (requires Google Maps API)
   */
  reverseGeocode: async (
    latitude: number,
    longitude: number
  ): Promise<string> => {
    // This would use Google Maps Geocoding API
    // For now, return coordinates as string
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
};
