import { useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import QuoteForm from "@/components/QuoteForm";
import QuoteResults from "@/components/QuoteResults";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [currentView, setCurrentView] = useState<"hero" | "quote" | "results">("hero");
  const [quoteData, setQuoteData] = useState(null);
  const { toast } = useToast();

  const handleQuoteSubmit = (data: any) => {
    setQuoteData(data);
    setCurrentView("results");
    toast({
      title: "Quote Generated!",
      description: "We found the best movers for you.",
    });
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
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {currentView === "hero" && (
        <div id="home">
          <Hero />
          {/* Call to action to start quote */}
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <button 
              onClick={startQuote}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-trust-blue text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Start Your Free Quote
            </button>
          </div>
        </div>
      )}
      
      {currentView === "quote" && (
        <div id="quote" className="pt-16">
          <QuoteForm onSubmit={handleQuoteSubmit} />
        </div>
      )}
      
      {currentView === "results" && quoteData && (
        <div id="results" className="pt-16">
          <QuoteResults 
            quoteData={quoteData}
            onBookMover={handleBookMover}
            onCompare={handleCompare}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
