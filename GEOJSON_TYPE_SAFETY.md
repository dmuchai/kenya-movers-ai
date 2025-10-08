# GeoJSON Type Safety Enhancement

## Overview
Replaced generic `any` types with proper GeoJSON type definitions (`Point` and `Polygon`) for all location-based fields in the database schema to improve type safety and developer experience.

## Changes Made

### 1. Added GeoJSON Type Import
```typescript
import type { Point, Polygon } from 'geojson';
```

The `@types/geojson` package provides standard TypeScript definitions for GeoJSON geometry types as defined by [RFC 7946](https://tools.ietf.org/html/rfc7946).

### 2. Updated Type Definitions

#### Mover Interface (Lines 89-90, 95)

**Before:**
```typescript
service_areas?: any[]; // GeoJSON polygons
primary_location?: any; // GeoJSON point
current_location?: any; // GeoJSON point
```

**After:**
```typescript
service_areas?: Polygon[];
primary_location?: Point;
current_location?: Point;
```

**Fields Updated:**
- `service_areas` - Array of Polygon geometries defining mover's service coverage
- `primary_location` - Point geometry for mover's business address
- `current_location` - Point geometry for real-time mover location

#### Booking Interface (Lines 176, 186, 242, 247)

**Before:**
```typescript
pickup_location: any; // GeoJSON point
dropoff_location: any; // GeoJSON point
tracking_data: Array<{
  location: any; // GeoJSON point
  ...
}>;
last_tracked_location?: any; // GeoJSON point
```

**After:**
```typescript
pickup_location: Point;
dropoff_location: Point;
tracking_data: Array<{
  location: Point;
  ...
}>;
last_tracked_location?: Point;
```

**Fields Updated:**
- `pickup_location` - Point geometry for pickup address
- `dropoff_location` - Point geometry for dropoff address
- `tracking_data[].location` - Point geometry for each tracking update
- `last_tracked_location` - Point geometry for most recent location

#### MoverLocation Interface (Line 400)

**Before:**
```typescript
location: any; // GeoJSON point
```

**After:**
```typescript
location: Point;
```

**Fields Updated:**
- `location` - Point geometry for recorded mover location

## Benefits

### 1. **Type Safety**
TypeScript now enforces correct GeoJSON structure:

```typescript
// ✅ Valid - proper Point structure
const booking: Booking = {
  pickup_location: {
    type: 'Point',
    coordinates: [36.8219, -1.2921] // [longitude, latitude]
  },
  // ... other fields
};

// ❌ Invalid - TypeScript error
const booking: Booking = {
  pickup_location: {
    lat: -1.2921,
    lng: 36.8219
  }, // Error: Type doesn't match Point
  // ... other fields
};
```

### 2. **IDE Autocomplete**
Developers get autocomplete for GeoJSON properties:
- `type: 'Point' | 'Polygon'`
- `coordinates: [number, number] | [number, number][][]`
- `bbox?: [number, number, number, number]`

### 3. **Standards Compliance**
All GeoJSON data follows RFC 7946 specification:
- Point: `{ type: 'Point', coordinates: [lng, lat] }`
- Polygon: `{ type: 'Polygon', coordinates: [[[lng, lat], ...]] }`

### 4. **Integration Ready**
Type-safe integration with mapping libraries:
- Mapbox GL JS
- Leaflet
- Google Maps
- PostGIS (via Supabase)

## GeoJSON Type Reference

### Point Type
```typescript
interface Point {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  bbox?: [number, number, number, number]; // Optional bounding box
}
```

**Example:**
```typescript
const nairobiCBD: Point = {
  type: 'Point',
  coordinates: [36.8219, -1.2921] // Nairobi CBD
};
```

### Polygon Type
```typescript
interface Polygon {
  type: 'Polygon';
  coordinates: [number, number][][]; // Array of linear rings
  bbox?: [number, number, number, number];
}
```

**Example:**
```typescript
const serviceArea: Polygon = {
  type: 'Polygon',
  coordinates: [[
    [36.7, -1.3], // Southwest corner
    [36.9, -1.3], // Southeast corner
    [36.9, -1.1], // Northeast corner
    [36.7, -1.1], // Northwest corner
    [36.7, -1.3]  // Close the ring
  ]]
};
```

## Usage Examples

### Creating a Booking with Location
```typescript
import type { Booking, Point } from '@/types/database';

const pickupLocation: Point = {
  type: 'Point',
  coordinates: [36.8219, -1.2921] // Nairobi CBD
};

const dropoffLocation: Point = {
  type: 'Point',
  coordinates: [36.7073, -1.3044] // Kibera
};

const booking: Partial<Booking> = {
  pickup_address: '123 Kenyatta Avenue, Nairobi',
  pickup_location: pickupLocation,
  dropoff_address: '456 Kibera Drive, Nairobi',
  dropoff_location: dropoffLocation,
  // ... other fields
};

// Insert into database
const { data, error } = await supabase
  .from('bookings')
  .insert(booking);
```

### Setting Mover Service Area
```typescript
import type { Mover, Polygon } from '@/types/database';

// Define service area covering Nairobi County
const nairobiServiceArea: Polygon = {
  type: 'Polygon',
  coordinates: [[
    [36.6, -1.4],
    [37.1, -1.4],
    [37.1, -1.1],
    [36.6, -1.1],
    [36.6, -1.4]
  ]]
};

const moverUpdate: Partial<Mover> = {
  service_areas: [nairobiServiceArea],
  service_radius_km: 50
};

await supabase
  .from('movers')
  .update(moverUpdate)
  .eq('id', moverId);
```

### Real-time Location Tracking
```typescript
import type { Point } from '@/types/database';

const currentLocation: Point = {
  type: 'Point',
  coordinates: [36.8500, -1.2800]
};

await supabase
  .from('mover_locations')
  .insert({
    mover_id: moverId,
    booking_id: bookingId,
    location: currentLocation,
    latitude: currentLocation.coordinates[1],
    longitude: currentLocation.coordinates[0],
    heading: 180,
    speed: 45,
    recorded_at: new Date().toISOString()
  });
```

### Working with Mapbox
```typescript
import mapboxgl from 'mapbox-gl';
import type { Point } from '@/types/database';

function addMarker(map: mapboxgl.Map, location: Point, title: string) {
  new mapboxgl.Marker()
    .setLngLat(location.coordinates)
    .setPopup(new mapboxgl.Popup().setText(title))
    .addTo(map);
}

// Add pickup marker
addMarker(map, booking.pickup_location, 'Pickup Location');

// Add dropoff marker
addMarker(map, booking.dropoff_location, 'Dropoff Location');
```

### Type Guards for Validation
```typescript
import type { Point, Polygon } from 'geojson';

function isValidPoint(value: any): value is Point {
  return (
    value &&
    value.type === 'Point' &&
    Array.isArray(value.coordinates) &&
    value.coordinates.length === 2 &&
    typeof value.coordinates[0] === 'number' &&
    typeof value.coordinates[1] === 'number'
  );
}

function isValidPolygon(value: any): value is Polygon {
  return (
    value &&
    value.type === 'Polygon' &&
    Array.isArray(value.coordinates) &&
    value.coordinates.length > 0 &&
    Array.isArray(value.coordinates[0])
  );
}

// Usage
if (!isValidPoint(booking.pickup_location)) {
  throw new Error('Invalid pickup location format');
}
```

## Database Integration

### PostGIS to GeoJSON Conversion

The database stores locations as PostGIS `geography` types, which Supabase automatically converts to GeoJSON:

**SQL Query:**
```sql
SELECT 
  id,
  ST_AsGeoJSON(pickup_location)::json as pickup_location,
  ST_AsGeoJSON(dropoff_location)::json as dropoff_location
FROM bookings;
```

**Supabase Client:**
```typescript
// Automatic conversion - no manual parsing needed
const { data } = await supabase
  .from('bookings')
  .select('id, pickup_location, dropoff_location')
  .single();

// data.pickup_location is already a Point type
const [lng, lat] = data.pickup_location.coordinates;
```

### Inserting GeoJSON into PostGIS

Supabase automatically converts GeoJSON to PostGIS:

```typescript
const location: Point = {
  type: 'Point',
  coordinates: [36.8219, -1.2921]
};

// Supabase handles conversion automatically
await supabase
  .from('bookings')
  .insert({
    pickup_location: location,
    // ... other fields
  });
```

## Migration Notes

### Existing Code
Code that was using `any` types will continue to work, but now benefits from type checking:

**Before (no type safety):**
```typescript
const location = booking.pickup_location;
const lat = location.coordinates[1]; // No autocomplete, no validation
```

**After (type-safe):**
```typescript
const location: Point = booking.pickup_location;
const [lng, lat] = location.coordinates; // Autocomplete and validation
```

### Breaking Changes
**None** - This is purely additive type safety. The runtime behavior remains unchanged.

### Potential Issues
If existing code was incorrectly using location fields (e.g., `{ lat, lng }` instead of GeoJSON), TypeScript will now catch these errors at compile time.

## Testing

### Type Validation Tests
```typescript
import { describe, it, expect } from 'vitest';
import type { Point, Polygon } from 'geojson';

describe('GeoJSON Type Validation', () => {
  it('should accept valid Point geometry', () => {
    const point: Point = {
      type: 'Point',
      coordinates: [36.8219, -1.2921]
    };
    
    expect(point.type).toBe('Point');
    expect(point.coordinates).toHaveLength(2);
  });
  
  it('should accept valid Polygon geometry', () => {
    const polygon: Polygon = {
      type: 'Polygon',
      coordinates: [[
        [36.7, -1.3],
        [36.9, -1.3],
        [36.9, -1.1],
        [36.7, -1.1],
        [36.7, -1.3]
      ]]
    };
    
    expect(polygon.type).toBe('Polygon');
    expect(polygon.coordinates[0]).toHaveLength(5);
  });
});
```

## Related Files

- **Type Definitions**: `src/types/database.ts`
- **Database Migrations**: 
  - `supabase/migrations/20251008_part2_marketplace_schema.sql`
- **Usage Examples**:
  - `src/components/LocationAutocomplete.tsx`
  - `src/pages/MoverDashboard.tsx`
  - `src/services/api.ts`

## Further Reading

- [RFC 7946: The GeoJSON Format](https://tools.ietf.org/html/rfc7946)
- [PostGIS GeoJSON Documentation](https://postgis.net/docs/ST_AsGeoJSON.html)
- [Mapbox GL JS GeoJSON Source](https://docs.mapbox.com/mapbox-gl-js/api/sources/#geojsonsource)
- [@types/geojson NPM Package](https://www.npmjs.com/package/@types/geojson)

## Next Steps

Consider adding helper functions for common GeoJSON operations:
- Distance calculation between Points
- Point-in-Polygon checks for service area validation
- Bounding box generation
- Coordinate transformation utilities
