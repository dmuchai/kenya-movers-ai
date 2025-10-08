/**
 * Find Movers Page - Search for nearby movers using PostGIS
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { locationService } from '@/services/locationService';
import LocationAutocomplete, { type LocationValue } from '@/components/LocationAutocomplete';
import { 
  MapPin, 
  Star, 
  Truck, 
  Phone, 
  Mail, 
  Navigation, 
  Filter,
  CheckCircle,
  Users
} from 'lucide-react';

const VEHICLE_TYPES = [
  { value: 'pickup', label: 'Pickup Truck' },
  { value: 'box_truck_small', label: 'Small Box Truck' },
  { value: 'box_truck_medium', label: 'Medium Box Truck' },
  { value: 'box_truck_large', label: 'Large Box Truck' },
  { value: 'container_truck', label: 'Container Truck' },
  { value: 'van', label: 'Van' },
];

// Type returned by find_nearby_movers function
interface NearbyMover {
  mover_id: string;
  business_name: string;
  distance_km: number;
  rating: number;
  total_moves: number;
  vehicle_types: string[];
}

export default function FindMovers() {
  const { toast } = useToast();
  const [searchLocation, setSearchLocation] = useState<LocationValue | null>(null);
  const [searchRadius, setSearchRadius] = useState(20);
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [movers, setMovers] = useState<NearbyMover[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleSearch = async () => {
    if (!searchLocation) {
      toast({
        title: 'Location Required',
        description: 'Please select a location to search',
        variant: 'destructive'
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await locationService.findNearbyMovers(
        searchLocation.location.lat,
        searchLocation.location.lng,
        searchRadius,
        selectedVehicleTypes.length > 0 ? selectedVehicleTypes : undefined
      );

      // Validate response has expected structure
      const validatedMovers = results.filter((m: any) =>
        m.mover_id && m.business_name && typeof m.distance_km === 'number'
      ) as NearbyMover[];
      setMovers(validatedMovers);

      if (results.length === 0) {
        toast({
          title: 'No Movers Found',
          description: 'Try expanding your search radius or removing vehicle type filters',
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search Failed',
        description: 'Failed to search for movers. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const coords = await locationService.getCurrentLocation();
      const address = await locationService.reverseGeocode(coords.latitude, coords.longitude);
      
      // Create a LocationValue object
      const location: LocationValue = {
        description: address,
        place_id: 'current-location',
        formatted_address: address,
        location: {
          lat: coords.latitude,
          lng: coords.longitude
        }
      };
      
      setSearchLocation(location);
      
      toast({
        title: 'Location Set',
        description: 'Using your current location',
      });
    } catch (error) {
      console.error('Location error:', error);
      toast({
        title: 'Location Error',
        description: 'Failed to get your current location',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const toggleVehicleType = (type: string) => {
    setSelectedVehicleTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Movers</h1>
        <p className="text-muted-foreground">
          Search for verified movers near your location
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search Filters */}
        <Card className="lg:col-span-1 h-fit sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location Search */}
            <div>
              <LocationAutocomplete
                label="Search Location"
                placeholder="Enter your location..."
                value={searchLocation}
                onChange={setSearchLocation}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={handleUseCurrentLocation}
                disabled={isLoadingLocation}
              >
                <Navigation className="mr-2 h-4 w-4" />
                {isLoadingLocation ? 'Getting Location...' : 'Use Current Location'}
              </Button>
            </div>

            {/* Search Radius */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Search Radius</Label>
                <span className="text-sm font-semibold text-primary">
                  {searchRadius} km
                </span>
              </div>
              <Slider
                value={[searchRadius]}
                onValueChange={(value) => setSearchRadius(value[0])}
                min={5}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>5 km</span>
                <span>50 km</span>
                <span>100 km</span>
              </div>
            </div>

            <Separator />

  <div>
    <Label className="mb-3 block">Vehicle Types</Label>
    <div className="space-y-2">
      {VEHICLE_TYPES.map(vehicle => (
        <label
          htmlFor={`vehicle-${vehicle.value}`}
          key={vehicle.value}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Checkbox
            id={`vehicle-${vehicle.value}`}
            checked={selectedVehicleTypes.includes(vehicle.value)}
            onCheckedChange={() => toggleVehicleType(vehicle.value)}
          />
          <span className="text-sm">{vehicle.label}</span>
        </label>
      ))}
    </div>
  </div>
                    />
                    <span className="text-sm">{vehicle.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleSearch}
              disabled={isSearching || !searchLocation}
            >
              {isSearching ? 'Searching...' : 'Search Movers'}
            </Button>
          </CardContent>
        </Card>

        {/* Search Results */}
        <div className="lg:col-span-3 space-y-4">
          {movers.length === 0 && !isSearching && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No Results Yet</p>
                <p className="text-sm">
                  Use the filters on the left to search for movers in your area
                </p>
              </CardContent>
            </Card>
          )}

          {isSearching && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p>Searching for movers...</p>
              </CardContent>
            </Card>
          )}

          {movers.map(mover => (
            <MoverCard key={mover.mover_id} mover={mover} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Mover Card Component
interface MoverCardProps {
  mover: NearbyMover;
}

function MoverCard({ mover }: MoverCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-start gap-4 flex-1">
            <Avatar className="h-20 w-20">
              <AvatarFallback>
                {mover.business_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    {mover.business_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {mover.distance_km.toFixed(1)} km away
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating and Stats */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{mover.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({mover.total_moves} moves)
                  </span>
                </div>
              </div>

              {/* Vehicle Types */}
              <div className="flex flex-wrap gap-2 mb-4">
                {mover.vehicle_types.map((type, idx) => (
                  <Badge key={idx} variant="outline" className="flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    {type.replace(/_/g, ' ')}
                  </Badge>
                ))}
  // TODO: Implement navigation to mover profile and quote request flow
  <div className="flex flex-wrap gap-2">
    <Button 
      size="sm" 
      variant="default"
      onClick={() => { /* TODO: Navigate to mover profile */ }}
    >
      View Profile
    </Button>
    <Button 
      size="sm" 
      variant="outline"
      onClick={() => { /* TODO: Open quote request modal */ }}
    >
      Request Quote
    </Button>
  </div>
                </Button>
                <Button size="sm" variant="outline">
                  Request Quote
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
