import { useState } from "react";
import { Link } from "react-router-dom";
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
import { MapPin, Home, Building, Calendar as CalendarIcon, Package, ArrowRight, ChevronLeft, User, Upload, X, Image as ImageIcon } from "lucide-react";
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
import { uploadMultiplePhotos, deleteQuotePhoto } from "@/lib/photoUpload";

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
  
  // Photo upload state
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  // Enhanced form data state
  const [formData, setFormData] = useState({
    fromLocation: "",
    toLocation: "",
    fromPlace: null as any,
    toPlace: null as any,
    propertyType: "",
    currentPropertySize: "",
    currentPropertyType: "",
    // Contact info for anonymous quotes
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    destinationPropertyType: "",
    currentFloor: "",
    destinationFloor: "",
    elevatorCurrent: "no" as "yes" | "no",
    elevatorDestination: "no" as "yes" | "no",
    movingDate: null as Date | null,
    additionalServices: [] as string[],
    specialRequirements: "",
    acceptTerms: false,
    inventory: {
      beds: 0,
      fridge: false,
      fridgeLiters: 0,
      washingMachine: false,
      sofaSet: false,
      sofaConfiguration: "",
      tv: false,
      tvInches: 0,
      diningSet: false,
      diningChairs: 0,
      wardrobe: 0,
      cooker: false,
      cookerType: "",
      bulkyItemPhotos: [] as string[],
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

  // Handle photo uploads
  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploadingPhotos(true);
    setUploadProgress({ current: 0, total: files.length });
    
    try {
      const fileArray = Array.from(files);
      const userId = user?.id || 'guest';
      const quoteId = 'temp'; // Will be updated with actual quote ID after submission
      
      const uploadedUrls = await uploadMultiplePhotos(
        fileArray,
        userId,
        quoteId,
        (current, total) => {
          setUploadProgress({ current, total });
        }
      );
      
      // Add uploaded URLs to existing photos
      const existingPhotos = formData.inventory.bulkyItemPhotos || [];
      updateInventory("bulkyItemPhotos", [...existingPhotos, ...uploadedUrls]);
      
      toast({
        title: "Photos uploaded successfully",
        description: `${uploadedUrls.length} photo(s) uploaded`,
      });
    } catch (error) {
      console.error('Photo upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload photos",
        variant: "destructive",
      });
    } finally {
      setUploadingPhotos(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  // Handle photo deletion
  const handlePhotoDelete = async (photoUrl: string) => {
    try {
      const success = await deleteQuotePhoto(photoUrl);
      
      if (success) {
        const updatedPhotos = formData.inventory.bulkyItemPhotos.filter(url => url !== photoUrl);
        updateInventory("bulkyItemPhotos", updatedPhotos);
        
        toast({
          title: "Photo deleted",
          description: "Photo removed successfully",
        });
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Photo delete error:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete photo",
        variant: "destructive",
      });
    }
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
        // For guest users, validate contact information
        if (!user) {
          if (!formData.contactName?.trim()) {
            errors.contactName = "Name is required";
            isValid = false;
          }
          if (!formData.contactEmail?.trim()) {
            errors.contactEmail = "Email is required";
            isValid = false;
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
            errors.contactEmail = "Please enter a valid email address";
            isValid = false;
          }
          if (!formData.contactPhone?.trim()) {
            errors.contactPhone = "Phone number is required";
            isValid = false;
          }
        }
        // Validate terms acceptance for all users
        if (!formData.acceptTerms) {
          errors.acceptTerms = "You must accept the Terms & Conditions and Privacy Policy to continue";
          isValid = false;
        }
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
    // Validate all steps before submission
    if (!validateAllSteps()) {
      // Find the first step with errors
      const firstErrorStep = Object.keys(stepErrors).find(key => stepErrors[parseInt(key)]);
      const errorMessages = Object.values(fieldErrors).filter(msg => msg);
      
      toast({
        title: "Please fix the following errors:",
        description: errorMessages.length > 0 
          ? errorMessages.slice(0, 3).join(". ") + (errorMessages.length > 3 ? "..." : "")
          : "Check the highlighted fields and try again.",
        variant: "destructive",
      });
      
      // Navigate to first step with errors
      if (firstErrorStep) {
        setStep(parseInt(firstErrorStep));
      }
      return;
    }

    startLoading();
    setSubmitProgress(0);
    setSubmitMessage("Saving quote details...");

    try {
      // Map property size to DB-allowed values and save quote to database
      const currentPropertySizeDB = mapPropertySizeToDB(formData.currentPropertySize);
      
      // Prepare quote data - include user_id only if user is logged in
      const quoteInsertData: any = {
        from_location: formData.fromLocation,
        to_location: formData.toLocation,
        moving_date: formData.movingDate?.toISOString().split('T')[0],
        property_size: currentPropertySizeDB,
        additional_services: formData.additionalServices,
        special_requirements: formData.specialRequirements || null,
        // Property access details
        current_property_type: formData.currentPropertyType || null,
        destination_property_type: formData.destinationPropertyType || null,
        current_floor: parseInt(formData.currentFloor) || 0,
        destination_floor: parseInt(formData.destinationFloor) || 0,
        elevator_current: formData.elevatorCurrent,
        elevator_destination: formData.elevatorDestination,
        // Detailed inventory
        inventory: formData.inventory,
        // Terms acceptance timestamp
        terms_accepted_at: formData.acceptTerms ? new Date().toISOString() : null,
      };
      
      // Add user_id if logged in, otherwise prepare data for anonymous submission
      if (user) {
        quoteInsertData.user_id = user.id;
      } else {
        // For anonymous quotes, store contact info in dedicated columns
        quoteInsertData.contact_name = formData.contactName || null;
        quoteInsertData.contact_email = formData.contactEmail || null;
        quoteInsertData.contact_phone = formData.contactPhone || null;
        // Note: user_id will be handled by the edge function for anonymous quotes
      }
      
      let quoteData;
      let error;

      if (user) {
        // Authenticated users: use direct database insert
        const result = await supabase
          .from('quotes')
          .insert(quoteInsertData)
          .select()
          .single();
        quoteData = result.data;
        error = result.error;
      } else {
        // Anonymous users: use edge function to bypass all constraints
        try {
          console.log('Submitting anonymous quote via edge function...');
          
          const { data, error: functionError } = await supabase.functions.invoke('submit-quote', {
            body: { 
              quoteData: quoteInsertData, 
              isAnonymous: true,
              contactInfo: {
                name: formData.contactName,
                email: formData.contactEmail,
                phone: formData.contactPhone
              }
            }
          });
          
          console.log('Function response:', data, 'Error:', functionError);
          
          if (functionError) {
            console.error('Function invocation error:', functionError);
            throw functionError;
          }
          if (!data || !data.success) {
            const errorMsg = data?.error || 'Unknown error from submit-quote function';
            console.error('Function returned error:', errorMsg);
            throw new Error(errorMsg);
          }
          
          quoteData = data.data;
          console.log('Anonymous quote submitted successfully via function:', quoteData);
        } catch (err) {
          console.error('Anonymous quote submission failed:', err);
          error = err;
        }
      }

      if (error) {
        console.error('Quote submission error:', error);
        toast({
          title: "Error submitting quote",
          description: `Failed to save quote: ${error.message || 'Please try again'}`,
          variant: "destructive",
        });
        return;
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
            {/* Optional: Show friendly auth prompt for non-logged-in users */}
            {!user && step === 1 && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Save your quote?</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Sign in to track your quotes and get personalized recommendations
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => window.location.href = '/auth'}
                        className="text-xs"
                      >
                        Sign In
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs"
                      >
                        Continue as Guest
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
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
              <div>
                <Label className="mb-2 block">Elevator at current location?</Label>
                <Select value={formData.elevatorCurrent} onValueChange={(v: "yes" | "no") => updateFormData("elevatorCurrent", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Elevator at destination?</Label>
                <Select value={formData.elevatorDestination} onValueChange={(v: "yes" | "no") => updateFormData("elevatorDestination", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label className="mb-2 block">Number of Beds</Label>
                <Input type="number" min={0} value={formData.inventory.beds}
                  onChange={(e) => updateInventory("beds", Number(e.target.value))} 
                  placeholder="e.g., 2"
                />
              </div>
              <div>
                <Label className="mb-2 block">Number of Wardrobes</Label>
                <Input type="number" min={0} value={formData.inventory.wardrobe}
                  onChange={(e) => updateInventory("wardrobe", Number(e.target.value))} 
                  placeholder="e.g., 3"
                />
              </div>
            </div>

            <div className="space-y-4">
              {/* Sofa Set */}
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox id="sofaSet" checked={formData.inventory.sofaSet}
                    onCheckedChange={(v) => updateInventory("sofaSet", Boolean(v))} />
                  <Label htmlFor="sofaSet" className="font-semibold">Sofa Set</Label>
                </div>
                {formData.inventory.sofaSet && (
                  <div className="pl-6 space-y-3">
                    <Label className="mb-2 block text-sm">Sofa Configuration</Label>
                    <Select value={formData.inventory.sofaConfiguration} 
                      onValueChange={(v) => updateInventory("sofaConfiguration", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select configuration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3-seater">3-seater (single piece)</SelectItem>
                        <SelectItem value="5-seater-3-1-1">5-seater (3-1-1)</SelectItem>
                        <SelectItem value="5-seater-3-2">5-seater (3-2)</SelectItem>
                        <SelectItem value="7-seater-3-3-1">7-seater (3-3-1)</SelectItem>
                        <SelectItem value="7-seater-3-2-2">7-seater (3-2-2)</SelectItem>
                        <SelectItem value="9-seater">9-seater</SelectItem>
                        <SelectItem value="other">Other (specify in special requirements)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Dining Set */}
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox id="diningSet" checked={formData.inventory.diningSet}
                    onCheckedChange={(v) => updateInventory("diningSet", Boolean(v))} />
                  <Label htmlFor="diningSet" className="font-semibold">Dining Set</Label>
                </div>
                {formData.inventory.diningSet && (
                  <div className="pl-6">
                    <Label className="mb-2 block text-sm">Number of Chairs</Label>
                    <Input type="number" min={0} max={20} value={formData.inventory.diningChairs}
                      onChange={(e) => updateInventory("diningChairs", Number(e.target.value))} 
                      placeholder="e.g., 6"
                    />
                  </div>
                )}
              </div>

              {/* Fridge */}
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox id="fridge" checked={formData.inventory.fridge}
                    onCheckedChange={(v) => updateInventory("fridge", Boolean(v))} />
                  <Label htmlFor="fridge" className="font-semibold">Fridge</Label>
                </div>
                {formData.inventory.fridge && (
                  <div className="pl-6">
                    <Label className="mb-2 block text-sm">Fridge Capacity (liters)</Label>
                    <Input type="number" min={0} value={formData.inventory.fridgeLiters}
                      onChange={(e) => updateInventory("fridgeLiters", Number(e.target.value))} 
                      placeholder="e.g., 200"
                    />
                  </div>
                )}
              </div>

              {/* TV */}
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox id="tv" checked={formData.inventory.tv}
                    onCheckedChange={(v: boolean) => updateInventory("tv", v)} />
                  <Label htmlFor="tv" className="font-semibold">TV</Label>
                </div>
                {formData.inventory.tv && (
                  <div className="pl-6">
                    <Label className="mb-2 block text-sm">TV Size (inches)</Label>
                    <Input type="number" min={0} value={formData.inventory.tvInches}
                      onChange={(e) => updateInventory("tvInches", Number(e.target.value))} 
                      placeholder="e.g., 55"
                    />
                  </div>
                )}
              </div>

              {/* Washing Machine */}
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center space-x-2">
                  <Checkbox id="wm" checked={formData.inventory.washingMachine}
                    onCheckedChange={(v) => updateInventory("washingMachine", Boolean(v))} />
                  <Label htmlFor="wm" className="font-semibold">Washing Machine</Label>
                </div>
              </div>

              {/* Cooker */}
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox id="cooker" checked={formData.inventory.cooker}
                    onCheckedChange={(v) => updateInventory("cooker", Boolean(v))} />
                  <Label htmlFor="cooker" className="font-semibold">Cooker</Label>
                </div>
                {formData.inventory.cooker && (
                  <div className="pl-6">
                    <Label className="mb-2 block text-sm">Cooker Type</Label>
                    <Select value={formData.inventory.cookerType} 
                      onValueChange={(v) => updateInventory("cookerType", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gas">Gas Cooker</SelectItem>
                        <SelectItem value="electric">Electric Cooker</SelectItem>
                        <SelectItem value="gas-electric">Gas & Electric</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Photo upload for bulky items */}
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <Label className="mb-2 block font-semibold text-foreground flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                Bulky or Special Items (Optional)
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Upload photos of large or unusual items for a more accurate quote (Max 5MB per photo, JPEG/PNG/WebP)
              </p>
              
              {/* Upload button */}
              <div className="mb-3">
                <label htmlFor="photo-upload" className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-primary/30 bg-white hover:bg-primary/5 cursor-pointer transition-colors",
                  uploadingPhotos && "opacity-50 cursor-not-allowed"
                )}>
                  <Upload className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {uploadingPhotos ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...` : 'Choose Photos'}
                  </span>
                </label>
                <Input 
                  id="photo-upload"
                  type="file" 
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/heic" 
                  multiple 
                  onChange={(e) => handlePhotoUpload(e.target.files)}
                  disabled={uploadingPhotos}
                  className="hidden"
                />
              </div>
              
              {/* Photo thumbnails */}
              {formData.inventory.bulkyItemPhotos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    {formData.inventory.bulkyItemPhotos.length} photo(s) uploaded
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {formData.inventory.bulkyItemPhotos.map((photoUrl, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                        <img 
                          src={photoUrl} 
                          alt={`Bulky item ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <button
                          type="button"
                          onClick={() => handlePhotoDelete(photoUrl)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                          aria-label="Delete photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Upload progress */}
              {uploadingPhotos && (
                <div className="mt-2">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
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
            
            {/* Contact info for guest users */}
            {!user && (
              <div className="p-5 bg-primary/5 rounded-xl border border-primary/20 mb-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Your Contact Information
                </h3>
                <p className="text-sm text-muted-foreground mb-4">We'll send your quote to this email</p>
                <div className="space-y-4">
                  <FormField
                    validation={useFieldValidation({
                      field: "Name",
                      value: formData.contactName,
                      required: true
                    })}
                  >
                    <Label htmlFor="contactName">Full Name *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => updateFormData("contactName", e.target.value)}
                      placeholder="Enter your name"
                      className="input-enhanced"
                    />
                  </FormField>
                  
                  <FormField
                    validation={useFieldValidation({
                      field: "Email",
                      value: formData.contactEmail,
                      required: true
                    })}
                  >
                    <Label htmlFor="contactEmail">Email Address *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => updateFormData("contactEmail", e.target.value)}
                      placeholder="your.email@example.com"
                      className="input-enhanced"
                    />
                  </FormField>
                  
                  <FormField
                    validation={useFieldValidation({
                      field: "Phone",
                      value: formData.contactPhone,
                      required: true
                    })}
                  >
                    <Label htmlFor="contactPhone">Phone Number *</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => updateFormData("contactPhone", e.target.value)}
                      placeholder="+254 700 000 000"
                      className="input-enhanced"
                    />
                  </FormField>
                </div>
              </div>
            )}
            
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

            {/* Terms & Privacy Consent */}
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="acceptTerms" 
                  checked={formData.acceptTerms}
                  onCheckedChange={(v) => updateFormData("acceptTerms", Boolean(v))}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="acceptTerms" className="text-sm leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <Link to="/terms" className="text-primary font-medium underline hover:text-primary/80" target="_blank">
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-primary font-medium underline hover:text-primary/80" target="_blank">
                      Privacy Policy
                    </Link>
                  </Label>
                  {fieldErrors.acceptTerms && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.acceptTerms}</p>
                  )}
                </div>
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
                  disabled={!formData.acceptTerms || loading}
                  loadingText={submitMessage || "Submitting..."}
                  variant="default"
                  size="lg"
                  className="flex items-center gap-2 min-h-[48px] px-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
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