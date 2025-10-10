import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    urgency: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
      urgency: ""
    });
    setLoading(false);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Navigation />
      <div className="container mx-auto py-8 px-4 pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Mail className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
            <p className="text-muted-foreground">
              Get in touch with our team for support, feedback, or partnership opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Get in Touch</CardTitle>
                  <CardDescription>
                    Multiple ways to reach our support team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">+254 710 583 121</p>
                      <p className="text-sm text-muted-foreground">+254 723 751 144</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">movelink@gmail.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">
                        Nairobi, Kenya<br />
                        Westlands Business District
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Business Hours</p>
                      <p className="text-sm text-muted-foreground">
                        Mon - Fri: 8:00 AM - 6:00 PM<br />
                        Sat: 9:00 AM - 4:00 PM<br />
                        Sun: Closed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" asChild>
                    <a href="tel:+254710583121">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="https://wa.me/254710583121" target="_blank" rel="noopener noreferrer">
                      <Send className="w-4 h-4 mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="mailto:movelink@gmail.com">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => updateFormData("name", e.target.value)}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateFormData("email", e.target.value)}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => updateFormData("subject", e.target.value)}
                          placeholder="What is this about?"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="urgency">Urgency Level</Label>
                        <Select value={formData.urgency} onValueChange={(value) => updateFormData("urgency", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select urgency level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low - General inquiry</SelectItem>
                            <SelectItem value="medium">Medium - Need assistance</SelectItem>
                            <SelectItem value="high">High - Urgent support needed</SelectItem>
                            <SelectItem value="critical">Critical - Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => updateFormData("message", e.target.value)}
                        placeholder="Please describe your inquiry in detail..."
                        rows={6}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;