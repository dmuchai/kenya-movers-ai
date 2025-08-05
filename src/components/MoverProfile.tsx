import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building } from 'lucide-react';

interface MoverProfileData {
  company_name: string;
  contact_email: string;
  contact_phone: string;
  license_number: string;
  service_areas: string[];
  description: string;
  hourly_rate: number;
}

export default function MoverProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<MoverProfileData>({
    company_name: '',
    contact_email: user?.email || '',
    contact_phone: '',
    license_number: '',
    service_areas: [],
    description: '',
    hourly_rate: 0
  });
  const [serviceAreasInput, setServiceAreasInput] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('movers')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          company_name: data.company_name || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          license_number: data.license_number || '',
          service_areas: data.service_areas || [],
          description: data.description || '',
          hourly_rate: data.hourly_rate || 0
        });
        setServiceAreasInput(data.service_areas?.join(', ') || '');
      }
    } catch (error) {
      console.error('Error fetching mover profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const serviceAreas = serviceAreasInput
        .split(',')
        .map(area => area.trim())
        .filter(area => area.length > 0);

      const { error } = await supabase
        .from('movers')
        .upsert({
          user_id: user?.id,
          company_name: profile.company_name,
          contact_email: profile.contact_email,
          contact_phone: profile.contact_phone,
          license_number: profile.license_number,
          service_areas: serviceAreas,
          description: profile.description,
          hourly_rate: profile.hourly_rate
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Company profile updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof MoverProfileData, value: string | number) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-6 h-6" />
          Company Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={profile.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="Your moving company name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={profile.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="company@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={profile.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                placeholder="+254 700 000 000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={profile.license_number}
                onChange={(e) => handleInputChange('license_number', e.target.value)}
                placeholder="Your business license number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate (KSh)</Label>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                step="100"
                value={profile.hourly_rate}
                onChange={(e) => handleInputChange('hourly_rate', parseFloat(e.target.value) || 0)}
                placeholder="1500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceAreas">Service Areas</Label>
              <Input
                id="serviceAreas"
                value={serviceAreasInput}
                onChange={(e) => setServiceAreasInput(e.target.value)}
                placeholder="Nairobi, Kiambu, Machakos"
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple areas with commas
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Company Description</Label>
            <Textarea
              id="description"
              value={profile.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Tell customers about your moving services, experience, and what makes you special..."
              rows={4}
            />
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}