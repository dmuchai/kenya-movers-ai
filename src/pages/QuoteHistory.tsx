import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Home, Package, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ReviewForm } from "@/components/ReviewForm";
import Navigation from "@/components/Navigation";
import BottomNavigation from "@/components/BottomNavigation";

interface Quote {
  id: string;
  from_location: string;
  to_location: string;
  moving_date: string;
  property_size: string;
  additional_services: string[];
  status: string;
  special_requirements: string | null;
  estimated_cost: number | null;
  created_at: string;
  updated_at: string;
}

const QuoteHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchQuotes();

    // Set up real-time subscription for quotes
    const channel = supabase
      .channel('quote-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quotes',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Quote update:', payload);
          fetchQuotes(); // Refetch quotes when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchQuotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast({
        title: "Error loading quotes",
        description: "Unable to load your quote history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'quoted':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'booked':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'quoted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'booked':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (!user) {
    return (
      <>
        <Navigation />
        <div className="max-w-4xl mx-auto p-6 pt-24 pb-24 md:pb-8">
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
              <p className="text-muted-foreground mb-4">Please sign in to view your quote history.</p>
              <Button onClick={() => window.location.href = '/auth'}>Sign In</Button>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="max-w-4xl mx-auto p-6 pt-24 pb-24 md:pb-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
          </div>
        </div>
        <BottomNavigation />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="max-w-4xl mx-auto p-6 pt-24 pb-24 md:pb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Quote History</h2>
          <p className="text-muted-foreground">
            Track all your moving quote requests and their status.
          </p>
        </div>

      {quotes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No quotes yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't submitted any quote requests yet.
            </p>
            <Button>Get Your First Quote</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(quote.status)}
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                    </Badge>
                    {quote.estimated_cost && (
                      <Badge variant="outline">
                        KSh {quote.estimated_cost.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(quote.created_at), 'MMM dd, yyyy')}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>From:</strong> {quote.from_location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>To:</strong> {quote.to_location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Date:</strong> {format(new Date(quote.moving_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Size:</strong> {quote.property_size}
                    </span>
                  </div>
                </div>

                {quote.additional_services.length > 0 && (
                  <div className="mb-3">
                    <span className="text-sm font-medium">Additional Services:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {quote.additional_services.map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {quote.special_requirements && (
                  <div className="mb-3">
                    <span className="text-sm font-medium">Special Requirements:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {quote.special_requirements}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {quote.status === 'quoted' && (
                    <Button size="sm">
                      Book Mover
                    </Button>
                  )}
                  {quote.status === 'completed' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowReviewForm(showReviewForm === quote.id ? null : quote.id)}
                    >
                      {showReviewForm === quote.id ? 'Cancel Review' : 'Write Review'}
                    </Button>
                  )}
                </div>

                {showReviewForm === quote.id && quote.status === 'completed' && (
                  <div className="mt-4 pt-4 border-t">
                    <ReviewForm
                      quoteId={quote.id}
                      moverId="temp-mover-id" // This should come from quote responses
                      onReviewSubmitted={() => {
                        setShowReviewForm(null);
                        toast({
                          title: "Review Submitted",
                          description: "Thank you for your feedback!"
                        });
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
      <BottomNavigation />
    </>
  );
};

export default QuoteHistory;