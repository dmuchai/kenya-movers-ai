import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, DollarSign, Clock, MessageSquare } from 'lucide-react';

interface Quote {
  id: string;
  from_location: string;
  to_location: string;
  moving_date: string;
  property_size: string;
  additional_services: string[];
  special_requirements: string;
}

interface QuoteResponseFormProps {
  quote: Quote;
  onClose: () => void;
  onSubmit: () => void;
}

export default function QuoteResponseForm({ quote, onClose, onSubmit }: QuoteResponseFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [moverProfile, setMoverProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    quoted_price: '',
    estimated_duration: '',
    response_message: ''
  });

  useEffect(() => {
    fetchMoverProfile();
  }, [user]);

  const fetchMoverProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('movers')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setMoverProfile(data);
      
      if (!data) {
        toast({
          title: "Profile Required",
          description: "Please complete your company profile before submitting quotes",
          variant: "destructive"
        });
        onClose();
      }
    } catch (error) {
      console.error('Error fetching mover profile:', error);
      toast({
        title: "Error",
        description: "Failed to load your profile",
        variant: "destructive"
      });
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!moverProfile) {
      toast({
        title: "Error",
        description: "Company profile not found",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('quote_responses')
        .insert({
          quote_id: quote.id,
          mover_id: moverProfile.id,
          quoted_price: parseFloat(formData.quoted_price),
          estimated_duration: formData.estimated_duration,
          response_message: formData.response_message
        });

      if (error) throw error;

      onSubmit();
    } catch (error: any) {
      console.error('Error submitting response:', error);
      if (error.code === '23505') {
        toast({
          title: "Already Responded",
          description: "You have already submitted a quote for this request",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit quote response",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Submit Quote Response
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quote Details */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h3 className="font-medium">Move Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">From:</span> {quote.from_location}
              </div>
              <div>
                <span className="text-muted-foreground">To:</span> {quote.to_location}
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span> {new Date(quote.moving_date).toLocaleDateString()}
              </div>
              <div>
                <span className="text-muted-foreground">Property:</span> {quote.property_size}
              </div>
            </div>
            {quote.additional_services.length > 0 && (
              <div>
                <span className="text-muted-foreground">Services:</span> {quote.additional_services.join(', ')}
              </div>
            )}
            {quote.special_requirements && (
              <div>
                <span className="text-muted-foreground">Requirements:</span> {quote.special_requirements}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quotedPrice" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Quoted Price (KSh) *
                </Label>
                <Input
                  id="quotedPrice"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.quoted_price}
                  onChange={(e) => handleInputChange('quoted_price', e.target.value)}
                  placeholder="15000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedDuration" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Estimated Duration *
                </Label>
                <Select
                  value={formData.estimated_duration}
                  onValueChange={(value) => handleInputChange('estimated_duration', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2-4 hours">2-4 hours</SelectItem>
                    <SelectItem value="4-6 hours">4-6 hours</SelectItem>
                    <SelectItem value="6-8 hours">6-8 hours</SelectItem>
                    <SelectItem value="1 day">1 day</SelectItem>
                    <SelectItem value="2 days">2 days</SelectItem>
                    <SelectItem value="3+ days">3+ days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responseMessage" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Message to Customer
              </Label>
              <Textarea
                id="responseMessage"
                value={formData.response_message}
                onChange={(e) => handleInputChange('response_message', e.target.value)}
                placeholder="Introduce your company and explain what's included in your quote..."
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.quoted_price || !formData.estimated_duration}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Quote'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}