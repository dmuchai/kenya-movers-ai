import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  Truck,
  Clock,
  Shield,
  Phone,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Zap,
  Users,
  Award,
  Send,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sendWhatsAppMessage } from '@/services/api';

interface QuoteResultsProps {
  quoteData: any;
  onBookMover: (moverId: string) => void;
  onCompare: () => void;
}

const QuoteResults = ({ quoteData, onBookMover, onCompare }: QuoteResultsProps) => {
  const [savedMovers, setSavedMovers] = useState<string[]>([]);

  const aiEstimate = quoteData.aiEstimate?.total || 0;
  const breakdown = quoteData.aiEstimate?.breakdown || [];
  const clarifying = quoteData.aiEstimate?.clarifyingQuestions || [];
  const distanceText = quoteData.distance;
  const durationText = quoteData.duration;

  // Mock moving companies data
  const movingCompanies = [
    {
      id: "rapid-movers",
      name: "Rapid Movers Kenya",
      rating: 4.8,
      reviews: 324,
      price: aiEstimate * 0.95,
      originalPrice: aiEstimate * 1.1,
      duration: "4-6 hours",
      verified: true,
      featured: true,
      services: ["Packing", "Loading", "Transportation", "Unpacking"],
      specialties: ["Fragile Items", "Piano Moving"],
      image: "🚛",
      badges: ["Best Price", "Fast Response"]
    },
    {
      id: "safe-move",
      name: "SafeMove Express",
      rating: 4.9,
      reviews: 189,
      price: aiEstimate * 1.05,
      duration: "3-5 hours",
      verified: true,
      services: ["Packing", "Loading", "Transportation", "Unpacking", "Storage"],
      specialties: ["Office Moving", "Delicate Electronics"],
      image: "🏠",
      badges: ["Top Rated", "Insurance Included"]
    },
    {
      id: "city-movers",
      name: "City Movers Limited",
      rating: 4.6,
      reviews: 267,
      price: aiEstimate * 1.15,
      duration: "5-7 hours",
      verified: true,
      services: ["Loading", "Transportation", "Basic Unpacking"],
      specialties: ["Long Distance", "Commercial"],
      image: "📦",
      badges: ["Established 2010"]
    }
  ];

  const toggleSaved = (moverId: string) => {
    setSavedMovers(prev => 
      prev.includes(moverId) 
        ? prev.filter(id => id !== moverId)
        : [...prev, moverId]
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* AI Estimate Card */}
      <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-trust-blue/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl">AI Instant Estimate</h2>
              <p className="text-sm text-muted-foreground font-normal">Based on your requirements</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-3xl font-bold text-primary">
                KSH {aiEstimate ? aiEstimate.toLocaleString() : '—'}
              </p>
              <p className="text-muted-foreground">
                {quoteData.fromLocation} → {quoteData.toLocation} • {quoteData.propertySize}
                {distanceText && (
                  <> • {distanceText}{durationText && ` / ${durationText}`}</>
                )}
              </p>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="mb-2">
                ⚡ Instant
              </Badge>
              <p className="text-sm text-muted-foreground">
                Updated in real-time
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2"><Info className="w-4 h-4" /> Breakdown</p>
              <ul className="text-xs space-y-1">
                {breakdown.map((b: any) => (
                  <li key={b.label} className="flex justify-between">
                    <span>{b.label}</span>
                    <span className="font-medium">KSH {b.amount.toLocaleString()}</span>
                  </li>
                ))}
                {breakdown.length === 0 && <li className="text-muted-foreground">No breakdown available</li>}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2"><Info className="w-4 h-4" /> Clarifying Questions</p>
              <ul className="text-xs space-y-1">
                {clarifying.map((q: any) => (
                  <li key={q.id}>• {q.question}</li>
                ))}
                {clarifying.length === 0 && <li className="text-muted-foreground">None needed</li>}
              </ul>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>✓ Includes basic loading, transportation, and unloading</span>
            <span>• Extra services may add costs</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const phone = window.prompt('Enter WhatsApp number (E.164, e.g. 2547XXXXXXXX)');
                if (!phone) return;
                try {
                  const msg = `Moving estimate: KSH ${aiEstimate.toLocaleString()} for ${quoteData.propertySize} ${quoteData.fromLocation} -> ${quoteData.toLocation}${distanceText ? ' ('+distanceText+')' : ''}.`;
                  await sendWhatsAppMessage({ to: phone, text: msg });
                  alert('WhatsApp message sent');
                } catch (e) {
                  alert('Failed to send WhatsApp message');
                  console.error(e);
                }
              }}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Send to WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Company Quotes Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Company Quotes</h2>
          <p className="text-muted-foreground">Compare offers from verified movers</p>
        </div>
        <Button variant="outline" onClick={onCompare} className="flex items-center gap-2">
          <Award className="w-4 h-4" />
          Compare All
        </Button>
      </div>

      {/* Company Cards */}
      <div className="space-y-4">
        {movingCompanies.map((company, index) => (
          <Card 
            key={company.id} 
            className={cn(
              "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
              company.featured && "border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-trust-blue/5"
            )}
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Company Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-4xl">{company.image}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold">{company.name}</h3>
                        {company.verified && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {company.featured && (
                          <Badge className="text-xs bg-warm-orange text-white">
                            Featured
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{company.rating}</span>
                          <span className="text-muted-foreground">({company.reviews} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{company.duration}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {company.badges.map((badge) => (
                          <Badge key={badge} variant="outline" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium mb-1">Services included:</p>
                          <div className="flex flex-wrap gap-1">
                            {company.services.map((service) => (
                              <span key={service} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {company.specialties.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-1">Specialties:</p>
                            <p className="text-sm text-muted-foreground">
                              {company.specialties.join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator orientation="vertical" className="hidden lg:block h-32" />

                {/* Pricing & Actions */}
                <div className="lg:w-64 space-y-4">
                  <div className="text-center lg:text-right">
                    <div className="mb-2">
                      {company.originalPrice && company.originalPrice > company.price && (
                        <p className="text-sm text-muted-foreground line-through">
                          KSH {company.originalPrice.toLocaleString()}
                        </p>
                      )}
                      <p className="text-2xl font-bold text-primary">
                        KSH {company.price.toLocaleString()}
                      </p>
                    </div>
                    
                    {company.originalPrice && company.originalPrice > company.price && (
                      <Badge className="bg-green-100 text-green-800 mb-3">
                        Save KSH {(company.originalPrice - company.price).toLocaleString()}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        onClick={() => onBookMover(company.id)}
                      >
                        Book Now
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleSaved(company.id)}
                        className={savedMovers.includes(company.id) ? "text-primary" : ""}
                      >
                        {savedMovers.includes(company.id) ? (
                          <BookmarkCheck className="w-4 h-4" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 text-center p-6 bg-gradient-to-r from-primary/10 to-trust-blue/10 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Need help choosing?</h3>
        <p className="text-muted-foreground mb-4">
          Our moving experts can help you find the perfect mover for your needs
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Talk to Expert
          </Button>
          <Button onClick={onCompare}>
            <Award className="w-4 h-4 mr-2" />
            Compare All Quotes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuoteResults;