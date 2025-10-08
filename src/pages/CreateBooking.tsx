/**
 * Booking Creation Page - Customer-facing form to create a moving request
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { bookingService, type CreateBookingInput } from '@/services/bookingService';
import { locationService } from '@/services/locationService';
import LocationAutocomplete, { type LocationValue } from '@/components/LocationAutocomplete';
import { format } from 'date-fns';
import { CalendarIcon, MapPin, Clock, Home, Package, DollarSign, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const PROPERTY_SIZES = [
  { value: 'studio', label: 'Studio', rooms: '1 room' },
  { value: '1_bedroom', label: '1 Bedroom', rooms: '1-2 rooms' },
  { value: '2_bedroom', label: '2 Bedroom', rooms: '2-3 rooms' },
  { value: '3_bedroom', label: '3 Bedroom', rooms: '3-4 rooms' },
  { value: '4_bedroom', label: '4+ Bedroom', rooms: '4+ rooms' },
  { value: 'office', label: 'Office', rooms: 'Commercial space' },
];

const ADDITIONAL_SERVICES = [
  { id: 'packing', label: 'Packing Services', price: 2000 },
  { id: 'unpacking', label: 'Unpacking Services', price: 1500 },
  { id: 'furniture_assembly', label: 'Furniture Assembly/Disassembly', price: 3000 },
  { id: 'storage', label: 'Temporary Storage', price: 5000 },
  { id: 'cleaning', label: 'Cleaning Services', price: 2500 },
];

interface BookingFormData {
  pickup_location: LocationValue | null;
  dropoff_location: LocationValue | null;
  scheduled_date: Date | undefined;
  scheduled_time: string;
  property_size: string;
  special_instructions: string;
  additional_services: string[];
  has_fragile_items: boolean;
  requires_insurance: boolean;
}

export default function CreateBooking() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [distance, setDistance] = useState<number | null>(null);

  const [formData, setFormData] = useState<BookingFormData>({
    pickup_location: null,
    dropoff_location: null,
    scheduled_date: undefined,
    scheduled_time: '09:00',
    property_size: '2_bedroom',
    special_instructions: '',
    additional_services: [],
    has_fragile_items: false,
    requires_insurance: false,
  });

  // Calculate estimated price when key fields change
  useEffect(() => {
    if (formData.pickup_location && formData.dropoff_location && formData.property_size) {
      calculateEstimatedPrice();
    }
  }, [
    formData.pickup_location, 
    formData.dropoff_location, 
    formData.property_size,
    formData.additional_services
  ]);

  const calculateEstimatedPrice = async () => {
    if (!formData.pickup_location || !formData.dropoff_location) return;

    try {
      // Calculate distance
      const dist = await locationService.calculateDistance(
        {
          latitude: formData.pickup_location.location.lat,
          longitude: formData.pickup_location.location.lng
        },
        {
          latitude: formData.dropoff_location.location.lat,
          longitude: formData.dropoff_location.location.lng
        }
      );
      
      setDistance(dist);

      // Base price calculation (simplified)
      const propertySizeMultiplier = {
        'studio': 1,
        '1_bedroom': 1.5,
        '2_bedroom': 2,
        '3_bedroom': 2.5,
        '4_bedroom': 3,
        'office': 2.5
      }[formData.property_size] || 2;

      const basePricePerKm = 100; // KES per km
      const basePrice = Math.max(2000, dist * basePricePerKm * propertySizeMultiplier);

      // Add additional services
      const additionalServicesTotal = formData.additional_services.reduce((sum, serviceId) => {
        const service = ADDITIONAL_SERVICES.find(s => s.id === serviceId);
        return sum + (service?.price || 0);
      }, 0);

      const total = Math.round(basePrice + additionalServicesTotal);
      setEstimatedPrice(total);

    } catch (error) {
      console.error('Error calculating price:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pickup_location || !formData.dropoff_location) {
      toast({
        title: 'Missing Information',
        description: 'Please select both pickup and dropoff locations',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.scheduled_date) {
      toast({
        title: 'Missing Information',
        description: 'Please select a moving date',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const bookingData: CreateBookingInput = {
        customer_id: user.id,
        pickup_address: formData.pickup_location.formatted_address,
        pickup_latitude: formData.pickup_location.location.lat,
        pickup_longitude: formData.pickup_location.location.lng,
        dropoff_address: formData.dropoff_location.formatted_address,
        dropoff_latitude: formData.dropoff_location.location.lat,
        dropoff_longitude: formData.dropoff_location.location.lng,
        scheduled_date: format(formData.scheduled_date, 'yyyy-MM-dd'),
        scheduled_time_start: formData.scheduled_time,
        property_size: formData.property_size,
        estimated_price: estimatedPrice,

        special_instructions: formData.special_instructions || undefined,
        additional_services: formData.additional_services,
        has_fragile_items: formData.has_fragile_items,
        requires_insurance: formData.requires_insurance,
      };

      await bookingService.create(bookingData);

      toast({
        title: 'Booking Created!',
        description: 'Your moving request has been submitted. We\'ll match you with available movers shortly.',
      });

      navigate('/quote-history');

    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Failed',
        description: error instanceof Error ? error.message : 'Failed to create booking',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      additional_services: prev.additional_services.includes(serviceId)
        ? prev.additional_services.filter(id => id !== serviceId)
        : [...prev.additional_services, serviceId]
    }));
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create Moving Booking</CardTitle>
          <CardDescription>
            Tell us about your move and we'll match you with verified movers
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Locations */}
            <div className="space-y-4">
              <div>
                <LocationAutocomplete
                  label="Pickup Location"
                  placeholder="Where are you moving from?"
                  value={formData.pickup_location}
                  onChange={(value) => setFormData(prev => ({ ...prev, pickup_location: value }))}
                />
              </div>

              <div>
                <LocationAutocomplete
                  label="Dropoff Location"
                  placeholder="Where are you moving to?"
                  value={formData.dropoff_location}
                  onChange={(value) => setFormData(prev => ({ ...prev, dropoff_location: value }))}
                />
              </div>

              {distance !== null && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Distance: {distance.toFixed(1)} km</span>
                </div>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Moving Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.scheduled_date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.scheduled_date ? (
                        format(formData.scheduled_date, 'PPP')
                      ) : (
                        'Pick a date'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.scheduled_date}
                      onSelect={(date) => setFormData(prev => ({ ...prev, scheduled_date: date }))}
// At the top of the file, add:
import { startOfDay } from 'date-fns';

// …later in your JSX where the calendar is rendered:
                      disabled={(date) => date < startOfDay(new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="time">Preferred Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                />
              </div>
            </div>

            {/* Property Size */}
            <div>
              <Label className="text-base mb-3 block">Property Size</Label>
              <RadioGroup
                value={formData.property_size}
                onValueChange={(value) => setFormData(prev => ({ ...prev, property_size: value }))}
                className="grid grid-cols-2 md:grid-cols-3 gap-3"
              >
                {PROPERTY_SIZES.map(size => (
                  <Label
                    key={size.value}
                    htmlFor={size.value}
                    className={cn(
                      'flex flex-col items-start gap-2 p-4 border rounded-lg cursor-pointer transition-colors',
                      formData.property_size === size.value && 'border-primary bg-primary/5'
                    )}
                  >
                    <RadioGroupItem value={size.value} id={size.value} className="sr-only" />
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      <span className="font-medium">{size.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{size.rooms}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {/* Additional Services */}
            <div>
              <Label className="text-base mb-3 block">Additional Services</Label>
              <div className="space-y-2">
                {ADDITIONAL_SERVICES.map(service => (
                  <div
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={formData.additional_services.includes(service.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{service.label}</p>
                      <p className="text-sm text-muted-foreground">+KES {service.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <Label htmlFor="instructions">Special Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.special_instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                placeholder="Any special requirements, accessibility notes, or specific items to move..."
                rows={3}
              />
            </div>

            {/* Additional Options */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="fragile"
                  checked={formData.has_fragile_items}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_fragile_items: checked as boolean }))}
                />
                <Label htmlFor="fragile" className="cursor-pointer">
                  I have fragile items that need extra care
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="insurance"
                  checked={formData.requires_insurance}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_insurance: checked as boolean }))}
                />
                <Label htmlFor="insurance" className="cursor-pointer">
                  I want to add moving insurance
                </Label>
              </div>
            </div>

            {/* Price Estimate */}
            {estimatedPrice > 0 && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Estimated Price</p>
                      <p className="text-3xl font-bold text-primary">
                        KES {estimatedPrice.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Final price may vary based on mover quotes
                      </p>
                    </div>
                    <DollarSign className="h-12 w-12 text-primary/30" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting || !formData.pickup_location || !formData.dropoff_location || !formData.scheduled_date}
            >
              {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
