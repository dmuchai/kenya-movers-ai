/**
 * Mover Registration Page - Multi-step form for movers to register
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { moverService } from '@/services/moverService';
import { storageService } from '@/services/storageService';

// Import step components
import BusinessInfoStep from '@/components/mover-registration/BusinessInfoStep';
import VehicleInfoStep from '@/components/mover-registration/VehicleInfoStep';
import ServiceAreaStep from '@/components/mover-registration/ServiceAreaStep';
import DocumentUploadStep from '@/components/mover-registration/DocumentUploadStep';
import ReviewStep from '@/components/mover-registration/ReviewStep';

export interface RegistrationData {
  // Business Info
  business_name: string;
  business_registration_number?: string;
  kra_pin?: string;
  phone_primary: string;
  phone_secondary?: string;
  email?: string;
  bio?: string;
  years_experience?: number;
  
  // Vehicle Info
  vehicle_types: string[];
  vehicle_plate_numbers?: string[];
  max_capacity_kg?: number;
  has_helpers: boolean;
  helper_count: number;
  
  // Service Area
  service_radius_km: number;
  primary_location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  
  // Documents
  documents: {
    national_id?: File;
    drivers_license?: File;
    vehicle_logbook?: File;
    insurance_certificate?: File;
    kra_pin_certificate?: File;
    business_permit?: File;
    good_conduct_certificate?: File;
  };
  
  profile_image?: File;
}

const STEPS = [
  { id: 1, title: 'Business Information', component: BusinessInfoStep },
  { id: 2, title: 'Vehicle Information', component: VehicleInfoStep },
  { id: 3, title: 'Service Area', component: ServiceAreaStep },
  { id: 4, title: 'Documents', component: DocumentUploadStep },
  { id: 5, title: 'Review & Submit', component: ReviewStep },
];

export default function MoverRegistration() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    business_name: '',
    phone_primary: '',
    vehicle_types: [],
    has_helpers: false,
    helper_count: 0,
    service_radius_km: 10,
    primary_location: {
      latitude: 0,
      longitude: 0,
      address: ''
    },
    documents: {}
  });

  const progress = (currentStep / STEPS.length) * 100;
  const CurrentStepComponent = STEPS[currentStep - 1].component;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepData = (stepData: Partial<RegistrationData>) => {
    setRegistrationData(prev => ({ ...prev, ...stepData }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload profile image if provided
      let profileImageUrl;
      if (registrationData.profile_image) {
        const result = await storageService.uploadFile(
          'mover-profiles',
          registrationData.profile_image,
          user.id
        );
        profileImageUrl = result.url;
      }

      // Upload documents
      const documentUrls: Record<string, string> = {};
      for (const [key, file] of Object.entries(registrationData.documents)) {
        if (file) {
          const result = await storageService.uploadFile(
            'mover-documents',
            file as File,
            `${user.id}/documents`
          );
          documentUrls[key] = result.url;
        }
      }

      // Create mover profile with all details using Supabase insert directly
      const { error: insertError } = await supabase
        .from('movers')
        .insert({
          user_id: user.id,
          business_name: registrationData.business_name,
          business_registration_number: registrationData.business_registration_number,
          kra_pin: registrationData.kra_pin,
          phone_primary: registrationData.phone_primary,
          phone_secondary: registrationData.phone_secondary,
          email: registrationData.email,
          bio: registrationData.bio,
          years_experience: registrationData.years_experience,
          vehicle_types: registrationData.vehicle_types as any,
          vehicle_plate_numbers: registrationData.vehicle_plate_numbers,
          max_capacity_kg: registrationData.max_capacity_kg,
          has_helpers: registrationData.has_helpers,
          helper_count: registrationData.helper_count,
          service_radius_km: registrationData.service_radius_km,
          primary_location: `POINT(${registrationData.primary_location.longitude} ${registrationData.primary_location.latitude})`,
          profile_image_url: profileImageUrl,
          documents: documentUrls,
          verification_status: 'documents_submitted',
          availability_status: 'offline',
          is_accepting_bookings: false
        });

      if (insertError) throw insertError;

      toast({
        title: 'Registration Submitted!',
        description: 'Your application has been submitted for verification. We will review your documents and get back to you within 24-48 hours.',
      });

      navigate('/mover-dashboard');
      
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Failed to submit registration',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Mover Registration</CardTitle>
          <CardDescription>
            Complete all steps to register as a mover on MoveEasy
          </CardDescription>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2">
              {STEPS.map(step => (
                <div
                  key={step.id}
                  className={`text-xs ${
                    step.id === currentStep
                      ? 'text-primary font-semibold'
                      : step.id < currentStep
                      ? 'text-green-600'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.id}. {step.title}
                </div>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <CurrentStepComponent
            data={registrationData}
            onUpdate={handleStepData}
            onNext={handleNext}
          />

          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
            >
              Back
            </Button>

            {currentStep < STEPS.length ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
