import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import BottomNavigation from "@/components/BottomNavigation";
import Hero from "@/components/Hero";
import QuoteForm from "@/components/QuoteForm";
import QuoteResults from "@/components/QuoteResults";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
const Index = () => {
  const [currentView, setCurrentView] = useState<"hero" | "quote" | "results">("hero");
  const [quoteData, setQuoteData] = useState(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleQuoteSubmit = (data: any) => {
    console.log('Quote submitted to Index page:', data);
    setIsLoadingResults(true);
    
    // Set quote data immediately and show results
    setQuoteData(data);
    setCurrentView("results");
    
    // Short delay just for smooth transition
    setTimeout(() => {
      setIsLoadingResults(false);
      toast({
        title: "Quote Generated!",
        description: "We found the best movers for you.",
      });
    }, 500);
  };

  const handleBookMover = (moverId: string) => {
    toast({
      title: "Booking Initiated",
      description: "You'll be contacted within 15 minutes.",
    });
  };

  const handleCompare = () => {
    toast({
      title: "Comparison View",
      description: "Compare all quotes side by side.",
    });
  };

  const startQuote = () => {
    setCurrentView("quote");
    navigate("/?quote=start");
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("quote") === "start") {
      setCurrentView("quote");
    }
  }, [location.search]);
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Main content with mobile bottom nav spacing */}
      <main className="pb-20 md:pb-0">
        {currentView === "hero" && (
          <div id="home">
            <Hero />
          </div>
        )}
        
        {currentView === "quote" && (
          <div id="quote" className="pt-16">
            <QuoteForm onSubmit={handleQuoteSubmit} />
          </div>
        )}
        
        {(currentView === "results" || isLoadingResults) && (
          <div id="results" className="pt-16">
            <QuoteResults 
              quoteData={quoteData}
              onBookMover={handleBookMover}
              onCompare={handleCompare}
              loading={isLoadingResults}
            />
          </div>
        )}
      </main>
      
      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
    </div>
  );
};

export default Index;
