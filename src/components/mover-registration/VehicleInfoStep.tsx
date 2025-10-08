/**
 * Step 2: Vehicle Information
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { RegistrationData } from '@/pages/MoverRegistration';
import { Truck, Package, Car } from 'lucide-react';

interface VehicleInfoStepProps {
  data: RegistrationData;
  onUpdate: (data: Partial<RegistrationData>) => void;
  onNext: () => void;
}

const VEHICLE_TYPES = [
  { value: 'pickup', label: 'Pickup Truck', icon: Truck, description: 'Small pickups for light moves' },
  { value: 'box_truck_small', label: 'Small Box Truck', icon: Package, description: '1-2 bedroom apartments' },
  { value: 'box_truck_medium', label: 'Medium Box Truck', icon: Package, description: '2-3 bedroom homes' },
  { value: 'box_truck_large', label: 'Large Box Truck', icon: Package, description: '3+ bedroom homes' },
  { value: 'container_truck', label: 'Container Truck', icon: Truck, description: 'Large commercial moves' },
  { value: 'van', label: 'Van', icon: Car, description: 'Small items and deliveries' },
];

export default function VehicleInfoStep({ data, onUpdate, onNext }: VehicleInfoStepProps) {
  const handleVehicleTypeToggle = (value: string) => {
    const current = data.vehicle_types || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onUpdate({ vehicle_types: updated });
  };

  const handlePlateNumbersChange = (value: string) => {
    const plates = value.split(',').map(p => p.trim()).filter(p => p);
    onUpdate({ vehicle_plate_numbers: plates });
  };

  const isValid = data.vehicle_types && data.vehicle_types.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Vehicle Information</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Tell us about your vehicles and moving capacity
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base mb-3 block">
            Vehicle Types <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-muted-foreground mb-4">
            Select all vehicle types you own or have access to
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {VEHICLE_TYPES.map((vehicle) => {
              const Icon = vehicle.icon;
              const isSelected = data.vehicle_types?.includes(vehicle.value);
              
              return (
                <div
                  key={vehicle.value}
                  onClick={() => handleVehicleTypeToggle(vehicle.value)}
                  className={`
                    flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors
                    ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                  `}
                >
                  <Checkbox
                    checked={isSelected}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{vehicle.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {vehicle.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <Label htmlFor="vehicle_plate_numbers">Vehicle Plate Numbers</Label>
          <Input
            id="vehicle_plate_numbers"
            value={data.vehicle_plate_numbers?.join(', ') || ''}
            onChange={(e) => handlePlateNumbersChange(e.target.value)}
            placeholder="e.g., KAA 123A, KBB 456B (separate with commas)"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter all vehicle registration numbers, separated by commas
          </p>
        </div>

        <div>
          <Label htmlFor="max_capacity_kg">Maximum Capacity (kg)</Label>
          <Input
            id="max_capacity_kg"
            type="number"
            min="0"
            value={data.max_capacity_kg || ''}
            onChange={(e) => onUpdate({ max_capacity_kg: parseInt(e.target.value) || undefined })}
            placeholder="e.g., 1000"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Maximum weight your largest vehicle can carry
          </p>
        </div>

        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Checkbox
              id="has_helpers"
              checked={data.has_helpers}
              onCheckedChange={(checked) => onUpdate({ 
                has_helpers: checked as boolean,
                helper_count: checked ? data.helper_count || 1 : 0
              })}
            />
            <Label htmlFor="has_helpers" className="cursor-pointer">
              I have helpers/crew members
            </Label>
          </div>

          {data.has_helpers && (
            <div>
              <Label htmlFor="helper_count">Number of Helpers</Label>
              <Input
                id="helper_count"
                type="number"
                min="1"
                max="20"
                value={data.helper_count}
                onChange={(e) => onUpdate({ helper_count: parseInt(e.target.value) || 1 })}
              />
            </div>
          )}
        </div>

        {!isValid && (
          <p className="text-sm text-destructive">
            Please select at least one vehicle type
          </p>
        )}
      </div>
    </div>
  );
}
