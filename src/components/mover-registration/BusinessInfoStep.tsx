/**
 * Step 1: Business Information
 */

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RegistrationData } from '@/pages/MoverRegistration';

interface BusinessInfoStepProps {
  data: RegistrationData;
  onUpdate: (data: Partial<RegistrationData>) => void;
  onNext: () => void;
}

export default function BusinessInfoStep({ data, onUpdate, onNext }: BusinessInfoStepProps) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const handleChange = (field: keyof RegistrationData, value: any) => {
    onUpdate({ [field]: value });
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleBlur = (field: keyof RegistrationData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields validation
    if (!data.business_name?.trim()) {
      errors.business_name = 'Business name is required';
    }

    if (!data.phone_primary?.trim()) {
      errors.phone_primary = 'Primary phone number is required';
    } else if (!/^(\+254|0)[17]\d{8}$/.test(data.phone_primary.replace(/\s+/g, ''))) {
      errors.phone_primary = 'Please enter a valid Kenyan phone number';
    }

    // Optional email validation
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    setAttemptedSubmit(true);
    
    // Prevent advancing if form is not valid
    if (!isValid) {
      // Show errors for empty required fields
      const errors: Record<string, string> = {};
      if (!data.business_name?.trim()) {
        errors.business_name = 'Business name is required';
      }
      if (!data.phone_primary?.trim()) {
        errors.phone_primary = 'Primary phone number is required';
      }
      setValidationErrors(errors);
      return;
    }
    
    // Validate form with full validation before advancing
    if (validateForm()) {
      onNext();
    }
  };

  const isValid = data.business_name && data.phone_primary;
  
  // Show error if field is touched or submit was attempted
  const shouldShowError = (field: string) => {
    return (touched[field] || attemptedSubmit) && validationErrors[field];
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Business Information</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Tell us about your moving business
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="business_name">
            Business Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="business_name"
            value={data.business_name}
            onChange={(e) => handleChange('business_name', e.target.value)}
            onBlur={() => handleBlur('business_name')}
            placeholder="e.g., Swift Movers Kenya"
            required
            className={shouldShowError('business_name') ? 'border-red-500' : ''}
          />
          {shouldShowError('business_name') && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.business_name || 'Business name is required'}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone_primary">
              Primary Phone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone_primary"
              type="tel"
              value={data.phone_primary}
              onChange={(e) => handleChange('phone_primary', e.target.value)}
              onBlur={() => handleBlur('phone_primary')}
              placeholder="+254 700 000 000"
              required
              className={shouldShowError('phone_primary') ? 'border-red-500' : ''}
            />
            {shouldShowError('phone_primary') && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.phone_primary || 'Primary phone number is required'}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone_secondary">Secondary Phone</Label>
            <Input
              id="phone_secondary"
              type="tel"
              value={data.phone_secondary || ''}
              onChange={(e) => handleChange('phone_secondary', e.target.value)}
              placeholder="+254 700 000 000"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={data.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="contact@swiftmovers.co.ke"
            className={shouldShowError('email') ? 'border-red-500' : ''}
          />
          {shouldShowError('email') && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="business_registration_number">
              Business Registration Number
            </Label>
            <Input
              id="business_registration_number"
              value={data.business_registration_number || ''}
              onChange={(e) => handleChange('business_registration_number', e.target.value)}
              placeholder="e.g., BN-2023-123456"
            />
          </div>

          <div>
            <Label htmlFor="kra_pin">KRA PIN</Label>
            <Input
              id="kra_pin"
              value={data.kra_pin || ''}
              onChange={(e) => handleChange('kra_pin', e.target.value)}
              placeholder="e.g., A001234567B"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="years_experience">Years of Experience</Label>
          <Input
            id="years_experience"
            type="number"
            min="0"
            value={data.years_experience || ''}
            onChange={(e) => handleChange('years_experience', parseInt(e.target.value) || 0)}
            placeholder="e.g., 5"
          />
        </div>

        <div>
          <Label htmlFor="bio">Business Description</Label>
          <Textarea
            id="bio"
            value={data.bio || ''}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Tell customers about your moving services, specialties, and what makes you unique..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-1">
            This will be shown on your profile to potential customers
          </p>
        </div>

        {attemptedSubmit && !isValid && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              Please fill in all required fields before proceeding.
            </p>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleNext}
            disabled={!isValid}
            size="lg"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
