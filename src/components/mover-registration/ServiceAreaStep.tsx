/**
 * Step 3: Service Area
 */

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RegistrationData } from '@/pages/MoverRegistration';
import LocationAutocomplete, { type LocationValue } from '@/components/LocationAutocomplete';
import { locationService } from '@/services/locationService';
import { MapPin, Navigation } from 'lucide-react';

interface ServiceAreaStepProps {
  data: RegistrationData;
  onUpdate: (data: Partial<RegistrationData>) => void;
  onNext: () => void;
}

export default function ServiceAreaStep({ data, onUpdate, onNext }: ServiceAreaStepProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationValue, setLocationValue] = useState<LocationValue | null>(null);

  const handleLocationChange = (location: LocationValue | null) => {
    setLocationValue(location);
    if (location) {
      onUpdate({
        primary_location: {
          latitude: location.location.lat,
          longitude: location.location.lng,
          address: location.formatted_address
        }
      });
    }
  };

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const coords = await locationService.getCurrentLocation();
      const address = await locationService.reverseGeocode(coords.latitude, coords.longitude);
      
      onUpdate({
        primary_location: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          address: address
        }
      });
    } catch (error) {
      console.error('Failed to get location:', error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const isValid = data.primary_location?.latitude !== 0 && data.primary_location?.longitude !== 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Service Area</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Define where you operate and your service radius
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base mb-3 block">
            Primary Operating Location <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-muted-foreground mb-3">
            This is your main base of operations
          </p>

          <div className="space-y-3">
            <LocationAutocomplete
              label=""
              value={locationValue}
              onChange={handleLocationChange}
              placeholder="Search for your business location..."
            />

            <Button
              type="button"
              variant="outline"
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
              className="w-full"
            >
              <Navigation className="mr-2 h-4 w-4" />
              {isGettingLocation ? 'Getting Location...' : 'Use My Current Location'}
            </Button>
          </div>

          {data.primary_location?.address && (
            <div className="mt-3 p-3 bg-muted rounded-lg flex items-start gap-2">
              <MapPin className="h-4 w-4 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Selected Location</p>
                <p className="text-xs text-muted-foreground">
                  {data.primary_location.address}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.primary_location.latitude.toFixed(6)}, {data.primary_location.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label htmlFor="service_radius" className="text-base">
              Service Radius
            </Label>
            <span className="text-sm font-semibold text-primary">
              {data.service_radius_km} km
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            How far from your base location are you willing to travel for jobs?
          </p>

          <div className="space-y-4">
            <Slider
              id="service_radius"
              value={[data.service_radius_km]}
              onValueChange={(value) => onUpdate({ service_radius_km: value[0] })}
              min={5}
              max={100}
              step={5}
              className="w-full"
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 km</span>
              <span>25 km</span>
              <span>50 km</span>
              <span>75 km</span>
              <span>100 km</span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Service Coverage:</strong> You'll receive booking requests from customers within {data.service_radius_km} km of your location.
            </p>
          </div>
        </div>

        {!isValid && (
          <p className="text-sm text-destructive">
            Please select your primary operating location
          </p>
        )}
      </div>
    </div>
  );
}
