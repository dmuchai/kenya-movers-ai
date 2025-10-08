import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, MapPin, Calendar, DollarSign, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MoverProfile from '@/components/MoverProfile';
import QuoteResponseForm from '@/components/QuoteResponseForm';
import Navigation from '@/components/Navigation';

interface Quote {
  id: string;
  from_location: string;
  to_location: string;
  moving_date: string;
  property_size: string;
  additional_services: string[];
  special_requirements: string;
  status: string;
  created_at: string;
}

interface QuoteResponse {
  id: string;
  quote_id: string;
  quoted_price: number;
  estimated_duration: string;
  response_message: string;
  status: string;
  created_at: string;
  quotes: Quote;
}

export default function MoverDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [availableQuotes, setAvailableQuotes] = useState<Quote[]>([]);
  const [myResponses, setMyResponses] = useState<QuoteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showResponseForm, setShowResponseForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchQuotes();
      fetchMyResponses();
    } else {
      // If no user, stop loading immediately
      setLoading(false);
    }
  }, [user]);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailableQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast({
        title: "Error",
        description: "Failed to load available quotes",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const fetchMyResponses = async () => {
    try {
      // First get the mover profile to filter responses
      const { data: moverData } = await supabase
        .from('movers')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!moverData) {
        setMyResponses([]);
        return;
      }

      const { data, error } = await supabase
        .from('quote_responses')
        .select('*')
        .eq('mover_id', moverData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch quote details for each response
      const responsesWithQuotes = await Promise.all(
        (data || []).map(async (response) => {
          const { data: quoteData } = await supabase
            .from('quotes')
            .select('*')
            .eq('id', response.quote_id)
            .single();
          
          return {
            ...response,
            quotes: quoteData
          };
        })
      );

      setMyResponses(responsesWithQuotes.filter(r => r.quotes) as QuoteResponse[]);
    } catch (error) {
      console.error('Error fetching responses:', error);
      toast({
        title: "Error",
        description: "Failed to load your responses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowResponseForm(true);
  };

  const handleResponseSubmitted = () => {
    setShowResponseForm(false);
    setSelectedQuote(null);
    fetchQuotes();
    fetchMyResponses();
    toast({
      title: "Success",
      description: "Your quote response has been submitted"
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="flex justify-center items-center min-h-[400px] pt-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto py-8 px-4 pt-24">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-r from-primary to-trust-blue rounded-lg">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mover Dashboard</h1>
            <p className="text-muted-foreground">Manage your moving business</p>
          </div>
      </div>

      <Tabs defaultValue="quotes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quotes">Available Quotes</TabsTrigger>
          <TabsTrigger value="responses">My Responses</TabsTrigger>
          <TabsTrigger value="profile">Company Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Available Moving Requests</h2>
            <Badge variant="secondary">{availableQuotes.length} active requests</Badge>
          </div>
          
          {availableQuotes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Truck className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No quotes available</h3>
                <p className="text-muted-foreground text-center">
                  Check back later for new moving requests from customers.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {availableQuotes.map((quote) => (
                <Card key={quote.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        {quote.from_location} → {quote.to_location}
                      </CardTitle>
                      <Badge variant="outline">{quote.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDate(quote.moving_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{quote.property_size}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>Posted {formatDate(quote.created_at)}</span>
                      </div>
                    </div>
                    
                    {quote.additional_services.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Additional Services:</p>
                        <div className="flex flex-wrap gap-2">
                          {quote.additional_services.map((service, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {quote.special_requirements && (
                      <div>
                        <p className="text-sm font-medium mb-1">Special Requirements:</p>
                        <p className="text-sm text-muted-foreground">{quote.special_requirements}</p>
                      </div>
                    )}
                    
                    <Button 
                      onClick={() => handleRespondToQuote(quote)}
                      className="w-full"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Submit Quote
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="responses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">My Quote Responses</h2>
            <Badge variant="secondary">{myResponses.length} total responses</Badge>
          </div>
          
          {myResponses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DollarSign className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No responses yet</h3>
                <p className="text-muted-foreground text-center">
                  Start responding to quotes to see your submissions here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myResponses.map((response) => (
                <Card key={response.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        {response.quotes.from_location} → {response.quotes.to_location}
                      </CardTitle>
                      <Badge variant={response.status === 'accepted' ? 'default' : 'secondary'}>
                        {response.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span>KSh {response.quoted_price.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{response.estimated_duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDate(response.quotes.moving_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{response.quotes.property_size}</span>
                      </div>
                    </div>
                    
                    {response.response_message && (
                      <div>
                        <p className="text-sm font-medium mb-1">Your Message:</p>
                        <p className="text-sm text-muted-foreground">{response.response_message}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile">
          <MoverProfile />
        </TabsContent>
      </Tabs>

      {showResponseForm && selectedQuote && (
        <QuoteResponseForm
          quote={selectedQuote}
          onClose={() => setShowResponseForm(false)}
          onSubmit={handleResponseSubmitted}
        />
      )}
      </div>
    </>
  );
}