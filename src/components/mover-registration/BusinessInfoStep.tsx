/**
 * Step 1: Business Information
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RegistrationData } from '@/pages/MoverRegistration';

interface BusinessInfoStepProps {
  data: RegistrationData;
  onUpdate: (data: Partial<RegistrationData>) => void;
  onNext: () => void;
}

export default function BusinessInfoStep({ data, onUpdate, onNext }: BusinessInfoStepProps) {
  const handleChange = (field: keyof RegistrationData, value: any) => {
    onUpdate({ [field]: value });
  };

  const isValid = data.business_name && data.phone_primary;

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
            placeholder="e.g., Swift Movers Kenya"
            required
          />
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
              placeholder="+254 700 000 000"
              required
            />
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
            placeholder="contact@swiftmovers.co.ke"
          />
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
      </div>
    </div>
  );
}
