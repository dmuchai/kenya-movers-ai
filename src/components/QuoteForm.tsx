import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Home, Building, Calendar as CalendarIcon, Package, ArrowRight, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface QuoteFormProps {
  onSubmit: (data: any) => void;
}

const QuoteForm = ({ onSubmit }: QuoteFormProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fromLocation: "",
    toLocation: "",
    propertyType: "",
    propertySize: "",
    currentFloor: "",
    destinationFloor: "",
    movingDate: null as Date | null,
    inventory: {
      beds: 0,
      fridge: false,
      washingMachine: false,
      sofaSeats: 0,
      sofaShape: "",
      tv: false,
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
    { value: "residential", label: "Residential" },
    { value: "office", label: "Office" },
    { value: "shop", label: "Shop/Commercial" }
  ];

  const residentialSizes = [
    "Bedsitter", "1BR", "2BR", "3BR", "4BR", "5BR+", "Maisonette", "Villa"
  ];

  const officeSizes = [
    "Small Office (1-5 desks)", "Medium Office (6-15 desks)", 
    "Large Office (16-30 desks)", "Corporate Office (30+ desks)"
  ];

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateInventory = (item: string, value: any) => {
    setFormData(prev => ({ 
      ...prev, 
      inventory: { ...prev.inventory, [item]: value }
    }));
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    onSubmit(formData);
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
              <div>
                <Label htmlFor="from" className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Moving from
                </Label>
                <Select value={formData.fromLocation} onValueChange={(value) => updateFormData("fromLocation", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your current city" />
                  </SelectTrigger>
                  <SelectContent>
                    {kenyanCities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="to" className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-trust-blue" />
                  Moving to
                </Label>
                <Select value={formData.toLocation} onValueChange={(value) => updateFormData("toLocation", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your destination city" />
                  </SelectTrigger>
                  <SelectContent>
                    {kenyanCities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Property Details</h2>
              <p className="text-muted-foreground">Tell us about your current home or office</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Building className="w-4 h-4 text-primary" />
                  Property type
                </Label>
                <Select value={formData.propertyType} onValueChange={(value) => updateFormData("propertyType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.propertyType && (
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Home className="w-4 h-4 text-trust-blue" />
                    Size
                  </Label>
                  <Select value={formData.propertySize} onValueChange={(value) => updateFormData("propertySize", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {(formData.propertyType === "residential" ? residentialSizes : officeSizes).map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentFloor" className="mb-2 block">Current floor</Label>
                  <Input
                    id="currentFloor"
                    type="number"
                    placeholder="e.g., 3"
                    value={formData.currentFloor}
                    onChange={(e) => updateFormData("currentFloor", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="destinationFloor" className="mb-2 block">Destination floor</Label>
                  <Input
                    id="destinationFloor"
                    type="number"
                    placeholder="e.g., 1"
                    value={formData.destinationFloor}
                    onChange={(e) => updateFormData("destinationFloor", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">What are you moving?</h2>
              <p className="text-muted-foreground">Help us estimate the right truck size</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Number of beds</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.inventory.beds}
                    onChange={(e) => updateInventory("beds", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Wardrobes</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.inventory.wardrobe}
                    onChange={(e) => updateInventory("wardrobe", parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-semibold">Appliances & Electronics</Label>
                <div className="space-y-3">
                  {[
                    { key: "fridge", label: "Refrigerator" },
                    { key: "washingMachine", label: "Washing Machine" },
                    { key: "tv", label: "TV" },
                    { key: "diningTable", label: "Dining Table" }
                  ].map(item => (
                    <div key={item.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.key}
                        checked={formData.inventory[item.key as keyof typeof formData.inventory] as boolean}
                        onCheckedChange={(checked) => updateInventory(item.key, checked)}
                      />
                      <Label htmlFor={item.key}>{item.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Sofa set (number of seats)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g., 5"
                    value={formData.inventory.sofaSeats}
                    onChange={(e) => updateInventory("sofaSeats", parseInt(e.target.value) || 0)}
                  />
                  <Select value={formData.inventory.sofaShape} onValueChange={(value) => updateInventory("sofaShape", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Shape" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="straight">Straight</SelectItem>
                      <SelectItem value="l-shaped">L-shaped</SelectItem>
                      <SelectItem value="u-shaped">U-shaped</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="boxes" className="mb-2 block">Estimated boxes/containers</Label>
                <Input
                  id="boxes"
                  type="number"
                  min="0"
                  placeholder="e.g., 20"
                  value={formData.inventory.boxes}
                  onChange={(e) => updateInventory("boxes", parseInt(e.target.value) || 0)}
                />
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
            
            {formData.movingDate && (
              <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-trust-blue/10 rounded-lg border border-primary/20">
                <h3 className="font-semibold text-lg mb-3">Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Route:</span> {formData.fromLocation} → {formData.toLocation}</p>
                  <p><span className="font-medium">Property:</span> {formData.propertySize} {formData.propertyType}</p>
                  <p><span className="font-medium">Date:</span> {format(formData.movingDate, "PPP")}</p>
                  <p><span className="font-medium">Items:</span> {formData.inventory.beds} beds, {formData.inventory.boxes} boxes, and more</p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card className="shadow-lg border-0 bg-gradient-to-b from-white to-gray-50/50">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-primary">
            <Package className="w-6 h-6" />
            Get Your Moving Quote
          </CardTitle>
          
          {/* Progress bar */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    i <= step ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                  )}>
                    {i}
                  </div>
                  {i < 4 && (
                    <div className={cn(
                      "w-12 h-1 mx-1",
                      i < step ? "bg-primary" : "bg-gray-200"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {renderStep()}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            {step < 4 ? (
              <Button
                onClick={nextStep}
                disabled={
                  (step === 1 && (!formData.fromLocation || !formData.toLocation)) ||
                  (step === 2 && (!formData.propertyType || !formData.propertySize))
                }
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!formData.movingDate}
                variant="hero"
                className="flex items-center gap-2"
              >
                Get Quotes
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuoteForm;