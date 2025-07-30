import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Calculator, Users } from "lucide-react";
import heroImage from "@/assets/hero-moving-truck.jpg";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 to-trust-blue/5">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Moving truck in Kenya" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-trust-blue/20"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-primary shadow-md">
            <MapPin className="w-4 h-4" />
            Trusted across Kenya's major cities
          </div>
          
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
            Moving Made{" "}
            <span className="bg-gradient-to-r from-primary to-trust-blue bg-clip-text text-transparent">
              Simple
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Get instant quotes from top-rated moving companies across Nairobi, Mombasa, Kisumu, and all major Kenyan cities.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              variant="hero" 
              size="lg" 
              className="w-full sm:w-auto text-lg px-8 py-4"
            >
              Get Free Quote
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto text-lg px-8 py-4 bg-white/90 backdrop-blur-sm border-2 hover:bg-white"
            >
              Compare Movers
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="pt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center gap-3 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
                <Calculator className="w-8 h-8 text-primary" />
                <h3 className="font-semibold text-lg">AI-Powered Estimates</h3>
                <p className="text-muted-foreground text-center">Get accurate pricing in seconds</p>
              </div>
              
              <div className="flex flex-col items-center gap-3 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
                <Users className="w-8 h-8 text-trust-blue" />
                <h3 className="font-semibold text-lg">Verified Companies</h3>
                <p className="text-muted-foreground text-center">Only trusted, rated movers</p>
              </div>
              
              <div className="flex flex-col items-center gap-3 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
                <MapPin className="w-8 h-8 text-warm-orange" />
                <h3 className="font-semibold text-lg">All Major Cities</h3>
                <p className="text-muted-foreground text-center">Coverage across Kenya</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;