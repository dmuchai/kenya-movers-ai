# Geography Function Type Safety Enhancement

## Overview
Replaced `any` types with proper type-safe definitions for PostGIS geography function parameters in `src/types/database.ts`.

## Changes Made

### Updated Function Signatures (Lines 652-673)

#### Before
```typescript
Functions: {
  find_nearby_movers: {
    Args: {
      p_location: any;
      p_radius_km?: number;
      p_min_rating?: number;
    };
    Returns: NearbyMover[];
  };
  calculate_distance_km: {
    Args: {
      p_location1: any;
      p_location2: any;
    };
    Returns: number;
  };
  is_location_in_service_area: {
    Args: {
      p_mover_id: string;
      p_location: any;
    };
    Returns: boolean;
  };
}
```

#### After
```typescript
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
}
```

### Type Definition
The location parameters now accept either:
1. **GeoJSON Point Object**: `{ type: 'Point', coordinates: [longitude, latitude] }`
2. **WKT String**: `'POINT(longitude latitude)'`

This matches how PostGIS `GEOGRAPHY` columns work in the database.

## Benefits

### 1. **Type Safety**
TypeScript now validates location parameter types:

```typescript
// ✅ Valid - WKT string (current usage)
await supabase.rpc('find_nearby_movers', {
  p_location: 'POINT(36.8219 -1.2921)',
  p_radius_km: 10
});

// ✅ Valid - GeoJSON Point object
await supabase.rpc('find_nearby_movers', {
  p_location: {
    type: 'Point',
    coordinates: [36.8219, -1.2921]
  },
  p_radius_km: 10
});

// ❌ Invalid - TypeScript error
await supabase.rpc('find_nearby_movers', {
  p_location: { lat: -1.2921, lng: 36.8219 }, // Not a valid Point type
  p_radius_km: 10
});
```

### 2. **IDE Autocomplete**
Developers get autocomplete for Point object structure:
- `type: 'Point'`
- `coordinates: [number, number]`

### 3. **Consistency with Schema**
Matches the type system used throughout the codebase:
- `Booking.pickup_location: Point`
- `Booking.dropoff_location: Point`
- `Mover.current_location: Point`
- `MoverLocation.location: Point`

### 4. **Backwards Compatible**
Existing code using WKT strings continues to work without changes.

## Usage Examples

### Using WKT String (Current Pattern)
```typescript
import { supabase } from '@/integrations/supabase/client';

// Find nearby movers using WKT string
const { data, error } = await supabase.rpc('find_nearby_movers', {
  p_location: `POINT(${longitude} ${latitude})`,
  p_radius_km: 20,
  p_min_rating: 4.0
});
```

### Using GeoJSON Point Object
```typescript
import { supabase } from '@/integrations/supabase/client';
import type { Point } from 'geojson';

// Create a Point object
const userLocation: Point = {
  type: 'Point',
  coordinates: [36.8219, -1.2921] // [longitude, latitude]
};

// Find nearby movers using Point object
const { data, error } = await supabase.rpc('find_nearby_movers', {
  p_location: userLocation,
  p_radius_km: 20,
  p_min_rating: 4.0
});
```

### Calculate Distance
```typescript
// Using WKT strings
const distance = await supabase.rpc('calculate_distance_km', {
  p_location1: 'POINT(36.8219 -1.2921)', // Nairobi CBD
  p_location2: 'POINT(36.7073 -1.3044)'  // Kibera
});

// Using Point objects
const pickupLocation: Point = {
  type: 'Point',
  coordinates: [36.8219, -1.2921]
};

const dropoffLocation: Point = {
  type: 'Point',
  coordinates: [36.7073, -1.3044]
};

const distance = await supabase.rpc('calculate_distance_km', {
  p_location1: pickupLocation,
  p_location2: dropoffLocation
});
```

### Check Service Area
```typescript
// Using WKT string
const inServiceArea = await supabase.rpc('is_location_in_service_area', {
  p_mover_id: moverId,
  p_location: `POINT(${longitude} ${latitude})`
});

// Using Point object
const customerLocation: Point = {
  type: 'Point',
  coordinates: [longitude, latitude]
};

const inServiceArea = await supabase.rpc('is_location_in_service_area', {
  p_mover_id: moverId,
  p_location: customerLocation
});
```

## Type Conversion Helpers

### WKT to Point
```typescript
import type { Point } from 'geojson';

function wktToPoint(wkt: string): Point | null {
  // Parse "POINT(lng lat)" format
  const match = wkt.match(/POINT\(([+-]?\d+\.?\d*)\s+([+-]?\d+\.?\d*)\)/);
  if (!match) return null;
  
  return {
    type: 'Point',
    coordinates: [parseFloat(match[1]), parseFloat(match[2])]
  };
}

// Usage
const wkt = 'POINT(36.8219 -1.2921)';
const point = wktToPoint(wkt);
```

### Point to WKT
```typescript
import type { Point } from 'geojson';

function pointToWkt(point: Point): string {
  const [lng, lat] = point.coordinates;
  return `POINT(${lng} ${lat})`;
}

// Usage
const point: Point = {
  type: 'Point',
  coordinates: [36.8219, -1.2921]
};
const wkt = pointToWkt(point); // "POINT(36.8219 -1.2921)"
```

### Coordinates to WKT
```typescript
function coordinatesToWkt(longitude: number, latitude: number): string {
  return `POINT(${longitude} ${latitude})`;
}

// Usage
const wkt = coordinatesToWkt(36.8219, -1.2921);
```

### Coordinates to Point
```typescript
import type { Point } from 'geojson';

function coordinatesToPoint(longitude: number, latitude: number): Point {
  return {
    type: 'Point',
    coordinates: [longitude, latitude]
  };
}

// Usage
const point = coordinatesToPoint(36.8219, -1.2921);
```

## Database Functions

### find_nearby_movers

**Purpose**: Find verified movers within a specified radius of a location, sorted by distance.

**Parameters**:
- `p_location`: Point or WKT string (required)
- `p_radius_km`: Search radius in kilometers (default: 20)
- `p_min_rating`: Minimum mover rating (default: 3.0)

**Returns**: Array of nearby movers with distance, rating, and vehicle types.

**SQL Definition**:
```sql
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
)
```

### calculate_distance_km

**Purpose**: Calculate the great-circle distance between two geographic points in kilometers.

**Parameters**:
- `p_location1`: First location (Point or WKT string)
- `p_location2`: Second location (Point or WKT string)

**Returns**: Distance in kilometers (decimal).

**SQL Definition**:
```sql
CREATE OR REPLACE FUNCTION calculate_distance_km(
  p_location1 GEOGRAPHY,
  p_location2 GEOGRAPHY
)
RETURNS DECIMAL
```

### is_location_in_service_area

**Purpose**: Check if a location is within a mover's service radius from their primary location.

**Parameters**:
- `p_mover_id`: Mover's UUID
- `p_location`: Location to check (Point or WKT string)

**Returns**: Boolean indicating if location is within service area.

**SQL Definition**:
```sql
CREATE OR REPLACE FUNCTION is_location_in_service_area(
  p_mover_id UUID,
  p_location GEOGRAPHY
)
RETURNS BOOLEAN
```

## Existing Code Impact

### Files Using These Functions

1. **src/services/moverService.ts** (Line 176)
   ```typescript
   const { data, error } = await supabase.rpc('find_nearby_movers', {
     p_location: `POINT(${longitude} ${latitude})`,
     p_radius_km: radiusKm,
     p_min_rating: minRating
   });
   ```
   ✅ **Status**: No changes needed (WKT strings still work)

2. **src/services/locationService.ts** (Line 79)
   ```typescript
   const { data, error } = await supabase.rpc('find_nearby_movers', {
     p_location: location,
     p_radius_km: radiusKm,
     p_min_rating: 0
   });
   ```
   ✅ **Status**: No changes needed (WKT strings still work)

### No Breaking Changes
All existing code continues to work because:
- WKT string format is still accepted (`Point | string`)
- Type checking is now stricter but doesn't break valid usage
- Invalid calls will now be caught at compile time

## Testing

### Unit Tests for Type Conversion
```typescript
import { describe, it, expect } from 'vitest';
import type { Point } from 'geojson';

describe('Geography Type Conversions', () => {
  it('should convert WKT to Point', () => {
    const wkt = 'POINT(36.8219 -1.2921)';
    const point = wktToPoint(wkt);
    
    expect(point).toEqual({
      type: 'Point',
      coordinates: [36.8219, -1.2921]
    });
  });
  
  it('should convert Point to WKT', () => {
    const point: Point = {
      type: 'Point',
      coordinates: [36.8219, -1.2921]
    };
    const wkt = pointToWkt(point);
    
    expect(wkt).toBe('POINT(36.8219 -1.2921)');
  });
});
```

### Integration Tests
```typescript
describe('Geography Functions', () => {
  it('should accept WKT string for find_nearby_movers', async () => {
    const { data, error } = await supabase.rpc('find_nearby_movers', {
      p_location: 'POINT(36.8219 -1.2921)',
      p_radius_km: 10
    });
    
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
  
  it('should accept Point object for find_nearby_movers', async () => {
    const location: Point = {
      type: 'Point',
      coordinates: [36.8219, -1.2921]
    };
    
    const { data, error } = await supabase.rpc('find_nearby_movers', {
      p_location: location,
      p_radius_km: 10
    });
    
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});
```

## Best Practices

### 1. Prefer Point Objects for New Code
While WKT strings work, GeoJSON Point objects are:
- Type-safe with autocomplete
- Consistent with the rest of the schema
- Industry standard (RFC 7946)

### 2. Use Helper Functions
Create reusable conversion functions in `src/utils/geography.ts`:
```typescript
export { wktToPoint, pointToWkt, coordinatesToPoint, coordinatesToWkt };
```

### 3. Validate Coordinates
Always validate latitude/longitude ranges:
```typescript
function isValidCoordinates(lng: number, lat: number): boolean {
  return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
}
```

### 4. Document Format in Comments
When using WKT strings, document the format:
```typescript
// WKT format: "POINT(longitude latitude)"
const location = `POINT(${lng} ${lat})`;
```

## Related Documentation

- [GeoJSON Type Safety Enhancement](./GEOJSON_TYPE_SAFETY.md)
- [Database Schema Diagram](./DATABASE_SCHEMA_DIAGRAM.md) - PostGIS functions section
- [PostGIS Documentation](https://postgis.net/docs/manual-3.3/)
- [RFC 7946: The GeoJSON Format](https://tools.ietf.org/html/rfc7946)

## Migration Path

### Phase 1: Current State ✅
- Types updated to `Point | string`
- All existing WKT string usage continues working
- TypeScript compilation passes

### Phase 2: Gradual Migration (Optional)
Consider migrating to Point objects where appropriate:
```typescript
// Before
const location = `POINT(${lng} ${lat})`;

// After
const location: Point = {
  type: 'Point',
  coordinates: [lng, lat]
};
```

### Phase 3: Utility Functions (Recommended)
Create `src/utils/geography.ts` with conversion helpers for the team.

## Verification

✅ **TypeScript Compilation**: Passed with no errors
✅ **Backwards Compatibility**: All existing code works unchanged
✅ **Type Safety**: Location parameters now properly typed
✅ **Documentation**: Updated with examples and best practices

## Next Steps

1. ✅ Types updated successfully
2. ✅ TypeScript compilation verified
3. 📝 Consider adding geography utility functions
4. 📝 Update team documentation with usage patterns
5. 📝 Add JSDoc comments to function interfaces
