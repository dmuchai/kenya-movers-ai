/**
 * Admin Verification Panel - Review and verify mover applications
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Phone, 
  Mail, 
  MapPin,
  Truck,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

type Mover = Database['public']['Tables']['movers']['Row'];
type VerificationStatus = Database['public']['Enums']['verification_status_enum'];

export default function AdminVerificationPanel() {
  const { toast } = useToast();
  const [movers, setMovers] = useState<Mover[]>([]);
  const [selectedMover, setSelectedMover] = useState<Mover | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<VerificationStatus>('documents_submitted');

  useEffect(() => {
    fetchMovers();
  }, [activeTab]);

  const fetchMovers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('movers')
        .select('*')
        .eq('verification_status', activeTab)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMovers(data || []);
    } catch (error) {
      console.error('Error fetching movers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load movers',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (
    moverId: string, 
    status: VerificationStatus,
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('movers')
        .update({
          verification_status: status,
          admin_notes: notes,
          verified_at: status === 'verified' ? new Date().toISOString() : null
        })
        .eq('id', moverId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Mover ${status === 'verified' ? 'approved' : 'rejected'} successfully`,
      });

      fetchMovers();
      setSelectedMover(null);
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update verification status',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mover Verification</h1>
        <p className="text-muted-foreground">
          Review and verify mover applications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List of movers */}
        <div className="lg:col-span-1">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as VerificationStatus)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="documents_submitted" className="text-xs">
                Pending
              </TabsTrigger>
              <TabsTrigger value="verified" className="text-xs">
                Verified
              </TabsTrigger>
              <TabsTrigger value="rejected" className="text-xs">
                Rejected
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 space-y-2">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading...
                </div>
              ) : movers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No movers found
                </div>
              ) : (
                movers.map(mover => (
                  <Card
                    key={mover.id}
                    className={`cursor-pointer transition-colors ${
                      selectedMover?.id === mover.id ? 'border-primary' : ''
                    }`}
                    onClick={() => setSelectedMover(mover)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-semibold">{mover.business_name}</h4>
                      <p className="text-sm text-muted-foreground">{mover.phone_primary}</p>
                      <div className="mt-2">
                        <Badge variant={
                          mover.verification_status === 'verified' ? 'default' :
                          mover.verification_status === 'rejected' ? 'destructive' :
                          'secondary'
                        }>
                          {mover.verification_status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </Tabs>
        </div>

        {/* Mover details */}
        <div className="lg:col-span-2">
          {selectedMover ? (
            <MoverDetailsPanel 
              mover={selectedMover} 
              onVerify={handleVerification}
              onClose={() => setSelectedMover(null)}
            />
          ) : (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                Select a mover to review their application
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Mover Details Panel
interface MoverDetailsPanelProps {
  mover: Mover;
  onVerify: (moverId: string, status: VerificationStatus, notes?: string) => Promise<void>;
  onClose: () => void;
}

function MoverDetailsPanel({ mover, onVerify, onClose }: MoverDetailsPanelProps) {
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const documents = mover.documents as Record<string, string> | null;

  const handleApprove = async () => {
    setIsProcessing(true);
    await onVerify(mover.id, 'verified', notes);
    setIsProcessing(false);
  };

  const handleReject = async () => {
    setIsProcessing(true);
    await onVerify(mover.id, 'rejected', notes);
    setIsProcessing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{mover.business_name}</CardTitle>
            <CardDescription>Review application details</CardDescription>
          </div>
          <Badge variant={
            mover.verification_status === 'verified' ? 'default' :
            mover.verification_status === 'rejected' ? 'destructive' :
            'secondary'
          }>
            {mover.verification_status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Contact Information */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contact Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span>{mover.phone_primary}</span>
            </div>
            {mover.phone_secondary && (
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span>{mover.phone_secondary}</span>
              </div>
            )}
            {mover.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span>{mover.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Business Details */}
        <div>
          <h4 className="font-semibold mb-3">Business Details</h4>
          <div className="space-y-2 text-sm">
            {mover.business_registration_number && (
              <p><strong>Registration:</strong> {mover.business_registration_number}</p>
            )}
            {mover.kra_pin && (
              <p><strong>KRA PIN:</strong> {mover.kra_pin}</p>
            )}
            {mover.years_experience && (
              <p><strong>Experience:</strong> {mover.years_experience} years</p>
            )}
          </div>
        </div>

        {/* Vehicle Information */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Vehicle Information
          </h4>
          <div className="flex flex-wrap gap-2 mb-2">
            {Array.isArray(mover.vehicle_types) && mover.vehicle_types.map((type, idx) => (
              <Badge key={idx} variant="outline">{type}</Badge>
            ))}
          </div>
          {mover.vehicle_plate_numbers && (
            <p className="text-sm"><strong>Plates:</strong> {(mover.vehicle_plate_numbers as string[]).join(', ')}</p>
          )}
        </div>

        {/* Service Area */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Service Area
          </h4>
          <p className="text-sm">
            <strong>Radius:</strong> {mover.service_radius_km} km
          </p>
        </div>

        {/* Documents */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Uploaded Documents
          </h4>
          {documents ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(documents).map(([key, url]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => window.open(url as string, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  {key.replace(/_/g, ' ')}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No documents uploaded</p>
          )}
        </div>

        {/* Admin Notes */}
        <div>
          <Label htmlFor="admin_notes">Admin Notes</Label>
          <Textarea
            id="admin_notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this verification..."
            rows={3}
          />
        </div>

        {/* Actions */}
        {mover.verification_status === 'documents_submitted' && (
          <div className="flex gap-3">
            <Button
              className="flex-1"
              onClick={handleApprove}
              disabled={isProcessing}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleReject}
              disabled={isProcessing}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
