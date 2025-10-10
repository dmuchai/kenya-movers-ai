import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HelpCircle, MessageCircle, Phone, Mail, ExternalLink } from "lucide-react";

const Help = () => {
  return (
    <>
      <Navigation />
      <div className="container mx-auto py-8 px-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <HelpCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Help Center</h1>
            <p className="text-muted-foreground">
              Find answers to common questions about MoveLink Moving Planner
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Getting Started
                </CardTitle>
                <CardDescription>
                  Learn how to use MoveLink Moving Planner for your moving needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">How to get a quote</h4>
                    <p className="text-sm text-muted-foreground">
                      Enter your moving details and get instant AI-powered estimates
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Choosing a mover</h4>
                    <p className="text-sm text-muted-foreground">
                      Review profiles, ratings, and quotes to make the best choice
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Booking your move</h4>
                    <p className="text-sm text-muted-foreground">
                      Confirm your booking and track your moving progress
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Common Questions
                </CardTitle>
                <CardDescription>
                  Frequently asked questions about our service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">How accurate are the quotes?</h4>
                    <p className="text-sm text-muted-foreground">
                      Our AI provides estimates based on distance, property size, and services
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">What areas do you cover?</h4>
                    <p className="text-sm text-muted-foreground">
                      We cover all major cities and towns across Kenya
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">How do I cancel a booking?</h4>
                    <p className="text-sm text-muted-foreground">
                      Contact the mover directly or reach out to our support team
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Need More Help?</CardTitle>
              <CardDescription>
                Can't find what you're looking for? Get in touch with our support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild>
                  <Link to="/contact">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Support
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href="tel:+254710583121">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Us: +254 710 583 121
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://wa.me/254710583121" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    WhatsApp Support
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Help;