/**
 * Step 5: Review & Submit
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RegistrationData } from '@/pages/MoverRegistration';
import { Building2, Phone, Mail, Truck, MapPin, FileText, CheckCircle2 } from 'lucide-react';

interface ReviewStepProps {
  data: RegistrationData;
  onUpdate: (data: Partial<RegistrationData>) => void;
  onNext: () => void;
}

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  pickup: 'Pickup Truck',
  box_truck_small: 'Small Box Truck',
  box_truck_medium: 'Medium Box Truck',
  box_truck_large: 'Large Box Truck',
  container_truck: 'Container Truck',
  van: 'Van',
};

export default function ReviewStep({ data, onUpdate, onNext }: ReviewStepProps) {
  const documentsCount = Object.keys(data.documents).filter(key => data.documents[key as keyof typeof data.documents]).length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Review Your Application</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Please review all information before submitting. You can go back to edit any section.
        </p>
      </div>

      <div className="space-y-4">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ReviewField label="Business Name" value={data.business_name} />
            {data.business_registration_number && (
              <ReviewField label="Registration Number" value={data.business_registration_number} />
            )}
            {data.kra_pin && (
              <ReviewField label="KRA PIN" value={data.kra_pin} />
            )}
            <ReviewField label="Primary Phone" value={data.phone_primary} icon={<Phone className="h-3 w-3" />} />
            {data.phone_secondary && (
              <ReviewField label="Secondary Phone" value={data.phone_secondary} icon={<Phone className="h-3 w-3" />} />
            )}
            {data.email && (
              <ReviewField label="Email" value={data.email} icon={<Mail className="h-3 w-3" />} />
            )}
            {data.years_experience && (
              <ReviewField label="Years of Experience" value={`${data.years_experience} years`} />
            )}
            {data.bio && (
              <ReviewField label="Description" value={data.bio} />
            )}
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Vehicle Types</p>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const types = Array.isArray(data.vehicle_types) ? data.vehicle_types : [];
                  return types.length > 0 ? (
                    types.map(type => (
                      <Badge key={type} variant="secondary">
                        {VEHICLE_TYPE_LABELS[type] || type}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No vehicle types specified</span>
                  );
                })()}
              </div>
            </div>
            
            {data.vehicle_plate_numbers && data.vehicle_plate_numbers.length > 0 && (
              <ReviewField 
                label="Plate Numbers" 
                value={data.vehicle_plate_numbers.join(', ')} 
              />
            )}
            
            {data.max_capacity_kg && (
              <ReviewField 
                label="Max Capacity" 
                value={`${data.max_capacity_kg} kg`} 
              />
            )}
            
            <ReviewField 
              label="Helpers Available" 
              value={data.has_helpers ? `Yes (${data.helper_count} helper${data.helper_count > 1 ? 's' : ''})` : 'No'} 
            />
          </CardContent>
        </Card>

        {/* Service Area */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Service Area
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.primary_location?.address ? (
              <ReviewField 
                label="Primary Location" 
                value={data.primary_location.address}
                icon={<MapPin className="h-3 w-3" />}
              />
            ) : (
              <ReviewField 
                label="Primary Location" 
                value="Not specified"
              />
            )}
            {data.service_radius_km != null ? (
              <ReviewField 
                label="Service Radius" 
                value={`${data.service_radius_km} km`} 
              />
            ) : (
              <ReviewField 
                label="Service Radius" 
                value="Not specified"
              />
            )}
            {data.primary_location?.address && data.service_radius_km != null && (
              <div className="text-xs text-muted-foreground">
                Coverage: {data.service_radius_km} km from {data.primary_location.address}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>{documentsCount} document{documentsCount !== 1 ? 's' : ''} uploaded</span>
            </div>
            {data.profile_image && (
              <div className="flex items-center gap-2 text-sm mt-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Profile photo uploaded</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
              What happens next?
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-disc list-inside">
              <li>Your application will be reviewed by our verification team</li>
              <li>We'll verify all documents and information provided</li>
              <li>You'll receive an email notification about your verification status</li>
              <li>The review process typically takes 24-48 hours</li>
              <li>Once approved, you can start accepting bookings!</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Note: Submit button is in the main form navigation, not here */}
    </div>
  );
}

// Helper component for displaying review fields
interface ReviewFieldProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

function ReviewField({ label, value, icon }: ReviewFieldProps) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2 mt-1">
        {icon}
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}
