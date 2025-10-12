import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Calculator, Users, Sparkles, Shield, Award, CheckCircle, Clock } from "lucide-react";
import heroImage from "@/assets/hero-moving-truck.jpg";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-pattern">
      {/* Enhanced Background with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Moving truck in Kenya" 
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-trust-blue/10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent"></div>
      </div>
      
      {/* Floating Elements for Visual Interest */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/5 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-32 right-16 w-32 h-32 bg-trust-blue/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/3 right-20 w-16 h-16 bg-warm-orange/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* Content */}
      <div className="relative z-10 container-enhanced py-20 text-center">
        <div className="space-y-8 animate-slide-in-up">
          {/* Enhanced Badge */}
          <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-full px-6 py-3 text-sm font-semibold text-primary shadow-lg border border-primary/10 hover:shadow-xl transition-all duration-300">
            <Shield className="w-4 h-4 text-trust-blue" />
            Trusted by 10,000+ Kenyans
            <CheckCircle className="w-4 h-4 text-success" />
          </div>
          
          {/* Enhanced Main Heading with Better Typography */}
          <h1 className="text-hero animate-fade-in-scale" style={{ animationDelay: '0.2s' }}>
            Find{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-primary via-trust-blue to-primary bg-clip-text text-transparent animate-shimmer">
                Professional, Reliable, Trusted
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 to-trust-blue/30 rounded-full"></div>
            </span>
            {" "}Movers
          </h1>
          
          <p className="text-xl md:text-2xl text-neutral-600 max-w-4xl mx-auto leading-relaxed animate-slide-in-up font-medium" style={{ animationDelay: '0.4s' }}>
            Connect with <span className="text-trust-blue font-semibold">verified, professional moving companies</span> you can trust.
            Get instant quotes, compare services, and move with confidence.
          </p>
          
          {/* Trust Indicators Pills */}
          <div className="flex flex-wrap justify-center gap-3 pt-4 animate-slide-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-neutral-700 shadow-md border border-primary/10">
              <Shield className="w-4 h-4 text-trust-blue" />
              Licensed & Insured
            </div>
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-neutral-700 shadow-md border border-primary/10">
              <Award className="w-4 h-4 text-warm-orange" />
              Top-Rated Service
            </div>
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-neutral-700 shadow-md border border-primary/10">
              <CheckCircle className="w-4 h-4 text-success" />
              Background Checked
            </div>
          </div>
          
          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
            <Button 
              className="btn-primary-enhanced w-full sm:w-auto text-lg px-10 py-4 min-h-[56px] font-bold group shadow-2xl"
              asChild
            >
              <Link to="/?quote=start" aria-label="Start free moving quote">
                <Calculator className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Get Free Quote Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
            
            <Button 
              className="btn-secondary-enhanced w-full sm:w-auto text-lg px-8 py-4 min-h-[56px] font-semibold group"
              style={{ 
                background: 'linear-gradient(to right, #ffffff, #f8fafc)',
                color: '#1e293b',
                border: '2px solid #e2e8f0'
              }}
              asChild
            >
              <Link to="/find-movers" aria-label="Browse verified movers">
                <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Browse Movers
              </Link>
            </Button>
          </div>
          
          {/* Mover CTA - Distinct Section */}
          <div className="pt-8 animate-slide-in-up" style={{ animationDelay: '0.7s' }}>
            <div className="card-enhanced max-w-2xl mx-auto p-6 bg-gradient-to-r from-primary/5 to-trust-blue/5 border-2 border-primary/20">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left">
                  <h3 className="font-bold text-lg text-foreground mb-1 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Are you a Moving Company?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Join our network and grow your business
                  </p>
                </div>
                <Button 
                  className="bg-gradient-to-r from-primary to-trust-blue text-white font-semibold px-6 py-3 hover:shadow-lg transition-all"
                  asChild
                >
                  <Link to="/mover-registration">
                    Join as a Mover
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Enhanced Trust Indicators */}
          <div className="pt-16 animate-slide-in-up" style={{ animationDelay: '0.8s' }}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Move, Your Peace of Mind</h2>
              <p className="text-neutral-600">We only work with the best so you don't have to worry</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="card-enhanced group p-8 hover-lift border-2 border-trust-blue/20">
                <div className="w-16 h-16 bg-gradient-to-br from-trust-blue to-trust-blue-light rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-foreground">100% Professional</h3>
                <p className="text-neutral-600 leading-relaxed">Every mover is licensed, insured, and background-checked. Your belongings are in safe, trained hands.</p>
              </div>
              
              <div className="card-enhanced group p-8 hover-lift border-2 border-primary/20">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-foreground">Proven Reliability</h3>
                <p className="text-neutral-600 leading-relaxed">Only top-rated companies with verified reviews and consistent on-time delivery track records.</p>
              </div>
              
              <div className="card-enhanced group p-8 hover-lift border-2 border-success/20">
                <div className="w-16 h-16 bg-gradient-to-br from-success to-success rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-foreground">Trusted by Thousands</h3>
                <p className="text-neutral-600 leading-relaxed">Join 10,000+ satisfied customers who chose professional, stress-free moving experiences.</p>
              </div>
            </div>
            
            {/* Additional Benefits Section */}
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="card-enhanced p-6 bg-gradient-to-r from-neutral-50 to-white border border-neutral-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Quick Response Time</h4>
                      <p className="text-sm text-neutral-600">Get quotes within minutes and schedule your move at your convenience</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-trust-blue/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <MapPin className="w-5 h-5 text-trust-blue" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">All Over Kenya</h4>
                      <p className="text-sm text-neutral-600">Coverage in Nairobi, Mombasa, Kisumu, and 44+ cities nationwide</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Statistics */}
          <div className="pt-12 animate-slide-in-up" style={{ animationDelay: '1s' }}>
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 max-w-4xl mx-auto shadow-xl border border-white/20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                  <div className="text-sm text-neutral-600 font-medium">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-trust-blue mb-2">500+</div>
                  <div className="text-sm text-neutral-600 font-medium">Verified Movers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-warm-orange mb-2">47</div>
                  <div className="text-sm text-neutral-600 font-medium">Cities Covered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-2">4.9★</div>
                  <div className="text-sm text-neutral-600 font-medium">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;