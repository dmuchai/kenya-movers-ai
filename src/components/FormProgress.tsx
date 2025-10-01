import { cn } from "@/lib/utils";
import { Check, Circle, AlertCircle } from "lucide-react";

interface ProgressStepProps {
  step: number;
  currentStep: number;
  title: string;
  description?: string;
  isValid?: boolean;
  hasError?: boolean;
}

const ProgressStep = ({ step, currentStep, title, description, isValid, hasError }: ProgressStepProps) => {
  const isCompleted = step < currentStep;
  const isCurrent = step === currentStep;
  const isPending = step > currentStep;

  return (
    <div className="flex flex-col items-center">
      <div className={cn(
        "relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
        isCompleted && "bg-green-500 text-white",
        isCurrent && !hasError && "bg-primary text-white ring-4 ring-primary/20",
        isCurrent && hasError && "bg-red-500 text-white ring-4 ring-red-500/20",
        isPending && "bg-gray-200 text-gray-500"
      )}>
        {isCompleted ? (
          <Check className="w-5 h-5" />
        ) : hasError && isCurrent ? (
          <AlertCircle className="w-5 h-5" />
        ) : (
          step
        )}
      </div>
      
      <div className="mt-2 text-center">
        <div className={cn(
          "text-xs font-medium",
          isCompleted && "text-green-600",
          isCurrent && "text-primary",
          isPending && "text-gray-500"
        )}>
          {title}
        </div>
        {description && (
          <div className="text-xs text-gray-500 mt-1 max-w-16 truncate">
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  stepValidation?: { [key: number]: boolean };
  stepErrors?: { [key: number]: boolean };
  className?: string;
}

const FormProgress = ({ 
  currentStep, 
  totalSteps, 
  stepValidation = {}, 
  stepErrors = {},
  className 
}: FormProgressProps) => {
  const stepInfo = [
    { title: "Location", description: "From & To" },
    { title: "Property", description: "Type & Size" },
    { title: "Details", description: "Floors & Access" },
    { title: "Date", description: "Moving Date" },
    { title: "Services", description: "Extra Services" }
  ];

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={cn("w-full", className)}>
      {/* Progress bar */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex justify-between items-start relative">
        {/* Connection lines */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
        <div 
          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 ease-out -z-10"
          style={{ width: `${Math.max(0, (currentStep - 1) / (totalSteps - 1) * 100)}%` }}
        />

        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          return (
            <ProgressStep
              key={stepNumber}
              step={stepNumber}
              currentStep={currentStep}
              title={stepInfo[index]?.title || `Step ${stepNumber}`}
              description={stepInfo[index]?.description}
              isValid={stepValidation[stepNumber]}
              hasError={stepErrors[stepNumber]}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FormProgress;