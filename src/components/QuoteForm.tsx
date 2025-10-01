import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Home, Building, Calendar as CalendarIcon, Package, ArrowRight, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { fetchDistanceMatrix, invokeAIQuoteEstimation, generateAIQuoteEstimation } from '@/services/api';
import FormProgress from "@/components/FormProgress";
import { FormField, useFieldValidation } from "@/components/FormValidation";
import { LoadingButton, LoadingOverlay, PulsingDot } from "@/components/ui/loading";
import { useLoading } from "@/hooks/useLoading";
import { useSwipeNavigation } from "@/hooks/useSwipeable";
import { useHapticForm } from "@/hooks/useHapticFeedback";

interface QuoteFormProps {
  onSubmit: (data: any) => void;
}

const QuoteForm = ({ onSubmit }: QuoteFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const { loading, startLoading, stopLoading } = useLoading();
  const [stepValidation, setStepValidation] = useState<{ [key: number]: boolean }>({});
  const [stepErrors, setStepErrors] = useState<{ [key: number]: boolean }>({});
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitMessage, setSubmitMessage] = useState("");
  const { onFieldChange, onStepComplete, onError } = useHapticForm();

  // Enhanced form data state
  const [formData, setFormData] = useState({
    fromLocation: "",
    toLocation: "",
    fromPlace: null as any,
    toPlace: null as any,
    propertyType: "",
    currentPropertySize: "",
    currentPropertyType: "",
    destinationPropertyType: "",
    currentFloor: "",
    destinationFloor: "",
    elevatorCurrent: false,
    elevatorDestination: false,
    movingDate: null as Date | null,
    additionalServices: [] as string[],
    specialRequirements: "",
    inventory: {
      beds: 0,
      fridge: false,
      fridgeLiters: 0,
      washingMachine: false,
      sofaSeats: 0,
      sofaShape: "",
      tv: false,
      tvInches: 0,
      diningTable: false,
      wardrobe: 0,
      boxes: 0,
    }
  });

  const kenyanCities = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Nyeri", "Eldoret", 
    "Thika", "Machakos", "Meru", "Kericho", "Malindi", "Garissa"
  ];

  const propertyTypes = [
    { value: "bungalow", label: "Bungalow" },
    { value: "apartment", label: "Apartment" },
    { value: "maisonette", label: "Maisonette" },
    { value: "office", label: "Office" },
  ];

  const propertySizes = [
    "Bedsitter", "1BR", "2BR", "3BR", "4BR", "5BR+", "Maisonette", "Villa"
  ];

  const mapPropertySizeToDB = (size: string): string => {
    switch (size) {
      case 'Bedsitter': return 'studio';
      case '1BR': return '1-bedroom';
      case '2BR': return '2-bedroom';
      case '3BR': return '3-bedroom';
      case '4BR': return '4-bedroom';
      case '5BR+':
      case 'Maisonette':
      case 'Villa':
        return 'house';
      default:
        return 'house';
    }
  };

  const availableServices = [
    "Packing", "Unpacking", "Furniture Assembly", "Cleaning", "Storage", "Insurance"
  ];

  const updateFormData = (field: string, value: any) => {
    onFieldChange(); // Haptic feedback for field changes
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateInventory = (item: string, value: any) => {
    onFieldChange(); // Haptic feedback for inventory changes
    setFormData(prev => ({ 
      ...prev, 
      inventory: { ...prev.inventory, [item]: value }
    }));
  };

  // Validation functions
  const validateStep = (stepNumber: number): boolean => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    switch (stepNumber) {
      case 1:
        if (!formData.fromLocation.trim()) {
          errors.fromLocation = "From location is required";
          isValid = false;
        }
        if (!formData.toLocation.trim()) {
          errors.toLocation = "To location is required";
          isValid = false;
        }
        break;
      case 2:
        if (!formData.currentPropertySize) {
          errors.currentPropertySize = "Property size is required";
          isValid = false;
        }
        if (!formData.currentPropertyType) {
          errors.currentPropertyType = "Property type is required";
          isValid = false;
        }
        break;
      case 3:
        if (!formData.currentFloor) {
          errors.currentFloor = "Current floor is required";
          isValid = false;
        }
        if (!formData.destinationFloor) {
          errors.destinationFloor = "Destination floor is required";
          isValid = false;
        }
        break;
      case 4:
        if (!formData.movingDate) {
          errors.movingDate = "Moving date is required";
          isValid = false;
        } else {
          const selectedDate = new Date(formData.movingDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            errors.movingDate = "Moving date cannot be in the past";
            isValid = false;
          }
        }
        break;
      case 5:
        // Step 5 is optional services, no strict validation required
        break;
      default:
        break;
    }

    setFieldErrors(prev => ({ ...prev, ...errors }));
    setStepValidation(prev => ({ ...prev, [stepNumber]: isValid }));
    setStepErrors(prev => ({ ...prev, [stepNumber]: !isValid }));
    
    return isValid;
  };

  const validateAllSteps = (): boolean => {
    let allValid = true;
    for (let i = 1; i <= 5; i++) {
      if (!validateStep(i)) {
        allValid = false;
      }
    }
    return allValid;
  };

  const toggleService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.includes(service)
        ? prev.additionalServices.filter(s => s !== service)
        : [...prev.additionalServices, service]
    }));
  };

  const nextStep = () => {
    if (validateStep(step) && step < 5) {
      onStepComplete(); // Haptic feedback for successful step completion
      setStep(step + 1);
    } else if (!validateStep(step)) {
      onError(); // Haptic feedback for validation error
    }
  };

  const prevStep = () => {
    if (step > 1) {
      onFieldChange(); // Light haptic feedback for navigation
      setStep(step - 1);
    }
  };

  // Enhanced navigation with validation checks for swipe gestures
  const canNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') return step > 1;
    if (direction === 'next') return step < 5 && validateStep(step);
    return false;
  };

  // Swipe navigation setup
  const swipeHandlers = useSwipeNavigation(
    step, 
    5, 
    (newStep) => {
      if (newStep > step) {
        nextStep();
      } else {
        prevStep();
      }
    },
    canNavigate
  );

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a quote request.",
        variant: "destructive",
      });
      return;
    }

    // Validate all steps before submission
    if (!validateAllSteps()) {
      toast({
        title: "Please complete all required fields",
        description: "Check the highlighted fields and try again.",
        variant: "destructive",
      });
      return;
    }

    startLoading();
    setSubmitProgress(0);
    setSubmitMessage("Saving quote details...");

    try {
      // Map property size to DB-allowed values and save quote to database
      const currentPropertySizeDB = mapPropertySizeToDB(formData.currentPropertySize);
      const { data: quoteData, error } = await supabase
        .from('quotes')
        .insert({
          user_id: user.id,
          from_location: formData.fromLocation,
          to_location: formData.toLocation,
          moving_date: formData.movingDate?.toISOString().split('T')[0],
          property_size: currentPropertySizeDB,
          additional_services: formData.additionalServices,
          special_requirements: formData.specialRequirements || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Call the original onSubmit with the saved quote data
      setSubmitProgress(25);
      setSubmitMessage("Calculating distance...");
      
      // New: fetch distance and generate AI estimate
        try {
          const origins = formData.fromPlace?.location
            ? [`${formData.fromPlace.location.lat},${formData.fromPlace.location.lng}`]
            : [formData.fromLocation]
          const destinations = formData.toPlace?.location
            ? [`${formData.toPlace.location.lat},${formData.toPlace.location.lng}`]
            : [formData.toLocation]

          setSubmitProgress(50);
          const dm = await fetchDistanceMatrix(origins, destinations);
          
          setSubmitProgress(75);
          setSubmitMessage("Generating AI estimate...");
          const first = dm.distances?.[0];
          const aiEstimate = await invokeAIQuoteEstimation({ ...formData, distance_meters: first?.distance_meters });
          
          setSubmitProgress(100);
          setSubmitMessage("Quote submitted successfully!");
          
          setTimeout(() => {
            onSubmit({
              ...formData,
              id: quoteData.id,
              status: quoteData.status,
              created_at: quoteData.created_at,
              distance: first ? first.text.distance : null,
              duration: first ? first.text.duration : null,
              distance_meters: first?.distance_meters,
              duration_seconds: first?.duration_seconds,
              aiEstimate,
            });
          }, 500);
        } catch (e) {
          console.warn('Distance matrix / AI estimate failed', e);
          setSubmitProgress(100);
          setSubmitMessage("Quote saved - estimates will be calculated later");
          
          setTimeout(() => {
            onSubmit({
              ...formData,
              id: quoteData.id,
              status: quoteData.status,
              created_at: quoteData.created_at,
            });
          }, 500);
        }

      toast({
        title: "Quote request submitted!",
        description: "Your quote has been saved and movers will be notified.",
      });

    } catch (error) {
      console.error('Error saving quote:', error);
      toast({
        title: "Error submitting quote",
        description: "There was a problem saving your quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      stopLoading();
      setSubmitProgress(0);
      setSubmitMessage("");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Where are you moving?</h2>
              <p className="text-muted-foreground">Tell us your current and new location</p>
            </div>
            
            <div className="space-y-4">
              <FormField
                validation={useFieldValidation({
                  field: "From location",
                  value: formData.fromLocation,
                  required: true
                })}
                hint="Search for your current address or city"
              >
                <Label htmlFor="from" className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Moving from
                </Label>
                <LocationAutocomplete
                  label=""
                  value={formData.fromPlace}
                  onChange={(val) => {
                    updateFormData("fromPlace", val);
                    updateFormData("fromLocation", val?.formatted_address || val?.description || "");
                  }}
                  placeholder="Search pickup location"
                />
              </FormField>
              
              <FormField
                validation={useFieldValidation({
                  field: "To location",
                  value: formData.toLocation,
                  required: true
                })}
                hint="Search for your destination address or city"
              >
                <Label htmlFor="to" className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-trust-blue" />
                  Moving to
                </Label>
                <LocationAutocomplete
                  label=""
                  value={formData.toPlace}
                  onChange={(val) => {
                    updateFormData("toPlace", val);
                    updateFormData("toLocation", val?.formatted_address || val?.description || "");
                  }}
                  placeholder="Search destination location"
                />
              </FormField>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Property Details & Access</h2>
              <p className="text-muted-foreground">Property type, size, floors, and elevator access</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Current property type</Label>
                <Select value={formData.currentPropertyType} onValueChange={(v) => updateFormData("currentPropertyType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Destination property type</Label>
                <Select value={formData.destinationPropertyType} onValueChange={(v) => updateFormData("destinationPropertyType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Home className="w-4 h-4 text-primary" />
                  Property Size
                </Label>
                <Select value={formData.currentPropertySize} onValueChange={(value) => updateFormData("currentPropertySize", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property size" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertySizes.map(size => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Current floor (0 = Ground)</Label>
                <Input type="number" min={0} value={formData.currentFloor} onChange={(e) => updateFormData("currentFloor", e.target.value)} />
              </div>
              <div>
                <Label className="mb-2 block">Destination floor (0 = Ground)</Label>
                <Input type="number" min={0} value={formData.destinationFloor} onChange={(e) => updateFormData("destinationFloor", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="elevatorCurrent" checked={formData.elevatorCurrent} onCheckedChange={(v) => updateFormData("elevatorCurrent", Boolean(v))} />
                <Label htmlFor="elevatorCurrent">Elevator at current location</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="elevatorDestination" checked={formData.elevatorDestination} onCheckedChange={(v) => updateFormData("elevatorDestination", Boolean(v))} />
                <Label htmlFor="elevatorDestination">Elevator at destination</Label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Inventory Details</h2>
              <p className="text-muted-foreground">Tell us what needs to be moved</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Beds</Label>
                <Input type="number" min={0} value={formData.inventory.beds}
                  onChange={(e) => updateInventory("beds", Number(e.target.value))} />
              </div>
              <div>
                <Label className="mb-2 block">Wardrobes</Label>
                <Input type="number" min={0} value={formData.inventory.wardrobe}
                  onChange={(e) => updateInventory("wardrobe", Number(e.target.value))} />
              </div>
              <div>
                <Label className="mb-2 block">Sofa seats (total)</Label>
                <Input type="number" min={0} value={formData.inventory.sofaSeats}
                  onChange={(e) => updateInventory("sofaSeats", Number(e.target.value))} />
              </div>
              <div>
                <Label className="mb-2 block">Boxes (estimate)</Label>
                <Input type="number" min={0} value={formData.inventory.boxes}
                  onChange={(e) => updateInventory("boxes", Number(e.target.value))} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="fridge" checked={formData.inventory.fridge}
                  onCheckedChange={(v) => updateInventory("fridge", Boolean(v))} />
                <Label htmlFor="fridge">Fridge</Label>
              </div>
              {formData.inventory.fridge && (
                <div className="pl-6">
                  <Label className="mb-2 block">Fridge size (liters)</Label>
                  <Input type="number" min={0} value={formData.inventory.fridgeLiters}
                    onChange={(e) => updateInventory("fridgeLiters", Number(e.target.value))} />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox id="tv" checked={formData.inventory.tv}
                  onCheckedChange={(v) => updateInventory("tv", Boolean(v))} />
                <Label htmlFor="tv">TV</Label>
              </div>
              {formData.inventory.tv && (
                <div className="pl-6">
                  <Label className="mb-2 block">TV size (inches)</Label>
                  <Input type="number" min={0} value={formData.inventory.tvInches}
                    onChange={(e) => updateInventory("tvInches", Number(e.target.value))} />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox id="wm" checked={formData.inventory.washingMachine}
                  onCheckedChange={(v) => updateInventory("washingMachine", Boolean(v))} />
                <Label htmlFor="wm">Washing Machine</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="dt" checked={formData.inventory.diningTable}
                  onCheckedChange={(v) => updateInventory("diningTable", Boolean(v))} />
                <Label htmlFor="dt">Dining Table</Label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">When are you moving?</h2>
              <p className="text-muted-foreground">Select your preferred moving date</p>
            </div>
            
            <div className="flex justify-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full max-w-sm justify-start text-left font-normal h-12",
                      !formData.movingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.movingDate ? format(formData.movingDate, "PPP") : "Pick a moving date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.movingDate || undefined}
                    onSelect={(date) => updateFormData("movingDate", date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Review Your Quote</h2>
              <p className="text-muted-foreground">Please review your information before submitting</p>
            </div>
            
            <div className="p-6 bg-gradient-to-r from-primary/10 to-trust-blue/10 rounded-lg border border-primary/20">
              <h3 className="font-semibold text-lg mb-3">Quote Summary</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Route:</span> {formData.fromLocation} → {formData.toLocation}</p>
                <p><span className="font-medium">Property Size:</span> {formData.currentPropertySize}</p>
                {formData.movingDate && (
                  <p><span className="font-medium">Date:</span> {format(formData.movingDate, "PPP")}</p>
                )}
                {formData.additionalServices.length > 0 && (
                  <p><span className="font-medium">Services:</span> {formData.additionalServices.join(", ")}</p>
                )}
                {formData.specialRequirements && (
                  <p><span className="font-medium">Special Requirements:</span> {formData.specialRequirements}</p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <LoadingOverlay loading={loading} text={submitMessage}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="card-enhanced shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <CardTitle className="flex items-center justify-center gap-2 text-primary mb-6">
              <Package className="w-6 h-6" />
              Get Your Moving Quote
            </CardTitle>
            
            {/* Enhanced Progress Indicator */}
            <FormProgress 
              currentStep={step}
              totalSteps={5}
              stepValidation={stepValidation}
              stepErrors={stepErrors}
            />
          </CardHeader>
          
          {/* Enhanced form content with swipe navigation */}
          <CardContent className="p-6" {...swipeHandlers.ref}>
            {/* Swipe hint indicator */}
            <div className="text-center mb-4 md:hidden">
              <div className="text-xs text-neutral-400 font-medium">
                💡 Swipe left/right to navigate between steps
              </div>
            </div>
            
            <div className="relative">
              {/* Step content with enhanced animations */}
              <div className="min-h-[400px] transition-all duration-300 ease-out">
                {renderStep()}
              </div>
            </div>
            
            {/* Enhanced progress during submission */}
            {loading && submitProgress > 0 && (
              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Processing...</span>
                  <span className="text-sm text-muted-foreground">{submitProgress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${submitProgress}%` }}
                  />
                </div>
                {submitMessage && (
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <PulsingDot size="sm" className="mr-2" />
                    {submitMessage}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-between mt-8 gap-4">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1 || loading}
                className="flex items-center gap-2 min-h-[48px] px-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              {step < 5 ? (
                <Button
                  onClick={nextStep}
                  disabled={
                    loading ||
                    (step === 1 && (!formData.fromLocation || !formData.toLocation)) ||
                    (step === 2 && !formData.currentPropertySize) ||
                    (step === 4 && !formData.movingDate)
                  }
                  className="flex items-center gap-2 min-h-[48px] px-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <LoadingButton
                  onClick={handleSubmit}
                  loading={loading}
                  loadingText={submitMessage || "Submitting..."}
                  variant="default"
                  size="lg"
                  className="flex items-center gap-2 min-h-[48px] px-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02]"
                >
                  Submit Quote
                  <ArrowRight className="w-4 h-4" />
                </LoadingButton>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </LoadingOverlay>
  );
};

export default QuoteForm;