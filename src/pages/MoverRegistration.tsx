/**
 * Mover Registration Page - Multi-step form for movers to register
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { moverService } from '@/services/moverService';
import { storageService } from '@/services/storageService';
import { Truck, AlertCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  primary_location?: {
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
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    business_name: '',
    phone_primary: '',
    vehicle_types: [],
    has_helpers: false,
    helper_count: 0,
    service_radius_km: 10,
    // primary_location is undefined by default - must be set by user
    documents: {}
  });

  const [hasExistingRegistration, setHasExistingRegistration] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);

  const progress = (currentStep / STEPS.length) * 100;
  const CurrentStepComponent = STEPS[currentStep - 1].component;

  // Check if user already has a mover registration
  useEffect(() => {
    const checkExistingRegistration = async () => {
      if (!user) {
        setCheckingRegistration(false);
        return;
      }

      try {
        const { data: moverData, error } = await supabase
          .from('movers')
          .select('id, verification_status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking mover registration:', error);
        }

        if (moverData) {
          console.log('Existing mover registration found:', moverData);
          setHasExistingRegistration(true);
        }
      } catch (error) {
        console.error('Failed to check registration:', error);
      } finally {
        setCheckingRegistration(false);
      }
    };

    checkExistingRegistration();
  }, [user]);

  // Show loading while checking authentication or existing registration
  if (authLoading || checkingRegistration) {
    return (
      <>
        <Navigation />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  // Check if user already has a mover registration
  if (hasExistingRegistration) {
    return (
      <>
        <Navigation />
        <div className="container max-w-3xl mx-auto py-8 px-4 pt-24">
          <Card>
            <CardHeader>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-trust-blue rounded-full mx-auto mb-4">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-center text-2xl">Registration Already Submitted</CardTitle>
              <CardDescription className="text-center">
                You have already submitted a mover registration application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your application has been submitted and is being reviewed by our verification team.
                  You cannot submit a new registration while your current application is being processed.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-1">What happens next?</h3>
                  <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-md mx-auto">
                    <li>• Our team will review your documents and information</li>
                    <li>• You'll receive an email notification about your verification status</li>
                    <li>• The review process typically takes 24-48 hours</li>
                    <li>• Once approved, you can start accepting bookings</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate('/mover-dashboard')}
                >
                  Go to Mover Dashboard
                </Button>
                <Button 
                  variant="outline"
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate('/')}
                >
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Require authentication to access registration
  if (!user) {
    return (
      <>
        <Navigation />
        <div className="container max-w-3xl mx-auto py-8 px-4 pt-24">
          <Card>
            <CardHeader>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-trust-blue rounded-full mx-auto mb-4">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-center text-2xl">Sign In Required</CardTitle>
              <CardDescription className="text-center">
                You need to create an account or sign in before registering your moving company
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Why sign in first?</strong> We need to link your mover profile to your account
                  so you can manage your business, receive quote requests, and access your dashboard.
                </AlertDescription>
              </Alert>
              
              {/* New Users */}
              <div className="space-y-3">
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-1">New to MoveLink?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Create a free account to register your moving company
                  </p>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-trust-blue hover:opacity-90" 
                  size="lg"
                  onClick={() => navigate('/auth?redirect=/mover-registration')}
                >
                  Create Free Account
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Existing Users */}
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full border-2"
                  size="lg"
                  onClick={() => navigate('/auth?redirect=/mover-registration')}
                >
                  Sign In to Continue
                </Button>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground text-center">
                  After authentication, you'll be redirected back to complete your mover registration
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  /**
   * Validates registration data for a specific step
   * @param step - The step number (1-5) to validate
   * @param data - The registration data to validate
   * @returns Object with isValid flag and error message if validation fails
   */
  const validateStep = (step: number, data: RegistrationData): { isValid: boolean; error?: string } => {
    switch (step) {
      case 1: // Business Information
        if (!data.business_name?.trim()) {
          return { isValid: false, error: 'Business name is required' };
        }
        if (!data.phone_primary?.trim()) {
          return { isValid: false, error: 'Primary phone number is required' };
        }
        // Validate phone format (Kenyan phone numbers)
        const phoneRegex = /^(\+254|0)[17]\d{8}$/;
        if (!phoneRegex.test(data.phone_primary.replace(/\s+/g, ''))) {
          return { isValid: false, error: 'Please enter a valid Kenyan phone number (+254 or 07XX/01XX)' };
        }
        // Validate email format if provided
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          return { isValid: false, error: 'Please enter a valid email address' };
        }
        return { isValid: true };

      case 2: // Vehicle Information
        if (!data.vehicle_types || data.vehicle_types.length === 0) {
          return { isValid: false, error: 'Please select at least one vehicle type' };
        }
        return { isValid: true };

      case 3: // Service Area
        if (!data.primary_location) {
          return { isValid: false, error: 'Please select your primary operating location' };
        }
        const { latitude, longitude } = data.primary_location;
        // Validate coordinates are present and valid numbers
        if (
          typeof latitude !== 'number' ||
          typeof longitude !== 'number' ||
          isNaN(latitude) ||
          isNaN(longitude)
        ) {
          return { isValid: false, error: 'Invalid location coordinates. Please select a valid location.' };
        }
        // Reject default (0, 0) coordinates
        if (latitude === 0 && longitude === 0) {
          return { isValid: false, error: 'Please select a real location. Default coordinates are not allowed.' };
        }
        // Validate location is within Kenya bounds (lat: -5 to 5, lng: 33 to 43)
        if (latitude < -5 || latitude > 5 || longitude < 33 || longitude > 43) {
          return { isValid: false, error: 'Please select a location within Kenya' };
        }
        return { isValid: true };

      case 4: // Documents
        // Check required documents: national_id, drivers_license, vehicle_logbook, insurance_certificate
        const requiredDocs = ['national_id', 'drivers_license', 'vehicle_logbook', 'insurance_certificate'];
        const missingDocs = requiredDocs.filter(doc => !data.documents[doc as keyof typeof data.documents]);
        if (missingDocs.length > 0) {
          return {
            isValid: false,
            error: `Please upload all required documents: ${missingDocs.map(d => d.replace(/_/g, ' ')).join(', ')}`
          };
        }
        return { isValid: true };

      case 5: // Review & Submit
        // Final validation - all previous steps should already be valid
        return { isValid: true };

      default:
        return { isValid: true };
    }
  };

  const handleNext = async () => {
    if (currentStep >= STEPS.length) {
      return; // Already on last step
    }

    // Validate current step before advancing
    const validation = validateStep(currentStep, registrationData);
    
    if (!validation.isValid) {
      toast({
        title: 'Validation Error',
        description: validation.error || 'Please complete all required fields before proceeding.',
        variant: 'destructive'
      });
      return; // Don't advance if validation fails
    }

    // Validation passed, advance to next step
    setCurrentStep(currentStep + 1);
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
    // Validate all required fields before submission
    if (!registrationData.business_name || !registrationData.phone_primary) {
      toast({
        title: 'Validation Error',
        description: 'Please complete all required fields.',
        variant: 'destructive'
      });
      return;
    }

    // Comprehensive location validation
    if (!registrationData.primary_location) {
      toast({
        title: 'Location Required',
        description: 'Please select your primary operating location before submitting.',
        variant: 'destructive'
      });
      return;
    }

    const { latitude, longitude } = registrationData.primary_location;
    
    // Check that latitude and longitude are present and valid numbers
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      isNaN(latitude) ||
      isNaN(longitude)
    ) {
      toast({
        title: 'Invalid Location',
        description: 'The selected location coordinates are invalid. Please select a valid location.',
        variant: 'destructive'
      });
      return;
    }

    // Check that coordinates are not default (0, 0) values
    if (latitude === 0 && longitude === 0) {
      toast({
        title: 'Invalid Location',
        description: 'Please select a real location. Default coordinates are not allowed.',
        variant: 'destructive'
      });
      return;
    }

    // Basic validation for realistic Kenya coordinates
    // Kenya roughly: lat -5 to 5, lng 34 to 42
    if (latitude < -5 || latitude > 5 || longitude < 33 || longitude > 43) {
      toast({
        title: 'Location Out of Range',
        description: 'Please select a location within Kenya.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Starting mover registration submission...');
      console.log('Registration data:', {
        business_name: registrationData.business_name,
        has_profile_image: !!registrationData.profile_image,
        document_count: Object.keys(registrationData.documents).length,
        vehicle_types: registrationData.vehicle_types,
        location: registrationData.primary_location
      });
      
      // Get current user
      console.log('Fetching authenticated user...');
      let user;
      try {
        const response = await supabase.auth.getUser();
        console.log('Auth response:', response);
        user = response.data.user;
        
        if (!user) {
          console.error('No authenticated user found in response');
          throw new Error('User not authenticated');
        }
        
        console.log('User authenticated successfully:', user.id);
      } catch (authError) {
        console.error('Error fetching user:', authError);
        throw new Error(`Authentication check failed: ${authError instanceof Error ? authError.message : 'Unknown error'}`);
      }

      // Upload profile image if provided
      let profileImageUrl;
      if (registrationData.profile_image) {
        console.log('Uploading profile image...');
        try {
          const result = await storageService.uploadFile(
            'mover-profiles',
            registrationData.profile_image,
            user.id
          );
          profileImageUrl = result.url;
          console.log('Profile image uploaded successfully:', profileImageUrl);
        } catch (uploadError) {
          console.error('Profile image upload failed:', uploadError);
          throw new Error(`Failed to upload profile image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
        }
      }

      // Upload documents in parallel for better performance
      console.log('Uploading documents...');
      const documentUrls: Record<string, string> = {};
      const uploadPromises = Object.entries(registrationData.documents)
        .filter(([_, file]) => file)
        .map(async ([key, file]) => {
          try {
            const result = await storageService.uploadFile(
              'mover-documents',
              file as File,
              `${user.id}/documents`
            );
            console.log(`Document ${key} uploaded:`, result.url);
            return [key, result.url] as [string, string];
          } catch (docError) {
            console.error(`Failed to upload document ${key}:`, docError);
            throw new Error(`Failed to upload ${key}: ${docError instanceof Error ? docError.message : 'Unknown error'}`);
          }
        });
      
      const uploadedDocs = await Promise.all(uploadPromises);
      uploadedDocs.forEach(([key, url]) => {
        documentUrls[key] = url;
      });
      console.log('All documents uploaded successfully:', documentUrls);

      // Create mover profile with all details using Supabase insert directly
      console.log('Inserting mover profile into database...');
      const moverData = {
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
        primary_location: `POINT(${registrationData.primary_location!.longitude.toFixed(6)} ${registrationData.primary_location!.latitude.toFixed(6)})`,
        profile_image_url: profileImageUrl,
        documents: documentUrls,
        verification_status: 'documents_submitted',
        availability_status: 'offline',
        is_accepting_bookings: false
      };
      
      console.log('Mover data to insert:', moverData);
      
      const { error: insertError } = await supabase
        .from('movers')
        .insert(moverData);

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        throw new Error(`Database error: ${insertError.message} (Code: ${insertError.code})`);
      }

      console.log('Mover profile created successfully');

      // Update user's role to 'mover' in profiles table
      console.log('Updating user role to mover...');
      const { error: roleUpdateError } = await supabase
        .from('profiles')
        .update({ role: 'mover' })
        .eq('user_id', user.id);

      if (roleUpdateError) {
        console.error('Failed to update role:', roleUpdateError);
        // Don't throw error - registration succeeded, role update is secondary
        console.warn('Mover profile created but role update failed. Admin may need to update manually.');
      } else {
        console.log('User role updated to mover successfully');
      }

      toast({
        title: 'Registration Submitted!',
        description:
          'Your application has been submitted for verification. We will review your documents and get back to you within 24-48 hours.'
      });

      navigate('/mover-dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      
      // Enhanced error logging
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      
      // Show detailed error message
      let errorMessage = 'Failed to submit registration';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide helpful hints for common errors
        if (error.message.includes('bucket')) {
          errorMessage += '\n\nHint: Storage buckets may not be configured. Please run the storage migration in Supabase.';
        } else if (error.message.includes('role') || error.message.includes('column')) {
          errorMessage += '\n\nHint: Database schema may be incomplete. Please run all migrations in Supabase.';
        } else if (error.message.includes('authenticated')) {
          errorMessage += '\n\nHint: Please sign out and sign in again.';
        }
      }
      
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="container max-w-5xl mx-auto py-8 px-4 pt-24">
        {/* Welcome Header */}
        <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-trust-blue rounded-full mb-4">
          <Truck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4">
          Join Kenya's Leading Moving Platform
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
          Register your moving company and connect with thousands of customers looking for trusted movers
        </p>
        
        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8 mb-8">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
            <div className="text-2xl font-bold text-primary mb-1">1000+</div>
            <div className="text-sm text-muted-foreground">Monthly Quote Requests</div>
          </div>
          <div className="p-4 bg-success/5 rounded-lg border border-success/10">
            <div className="text-2xl font-bold text-success mb-1">24/7</div>
            <div className="text-sm text-muted-foreground">Business Opportunities</div>
          </div>
          <div className="p-4 bg-trust-blue/5 rounded-lg border border-trust-blue/10">
            <div className="text-2xl font-bold text-trust-blue mb-1">Free</div>
            <div className="text-sm text-muted-foreground">No Monthly Fees</div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Registration</CardTitle>
          <CardDescription>
            Fill out all required information to get verified and start receiving quote requests
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
    </>
  );
}
