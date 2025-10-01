import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

interface ValidationFeedbackProps {
  type: "error" | "success" | "warning" | "info";
  message: string;
  className?: string;
}

export const ValidationFeedback = ({ type, message, className }: ValidationFeedbackProps) => {
  const icons = {
    error: AlertCircle,
    success: CheckCircle,
    warning: AlertCircle,
    info: Info
  };

  const styles = {
    error: "text-red-600 bg-red-50 border-red-200",
    success: "text-green-600 bg-green-50 border-green-200",
    warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
    info: "text-blue-600 bg-blue-50 border-blue-200"
  };

  const Icon = icons[type];

  return (
    <div className={cn(
      "flex items-start gap-2 p-3 rounded-lg border text-sm",
      styles[type],
      className
    )}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};

interface FieldValidationProps {
  field: string;
  value: any;
  required?: boolean;
  rules?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
  showSuccess?: boolean;
}

export const useFieldValidation = ({ field, value, required, rules, showSuccess }: FieldValidationProps) => {
  const validateField = () => {
    if (required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return { isValid: false, message: `${field} is required`, type: 'error' as const };
    }

    if (!value) {
      return { isValid: true, message: '', type: 'success' as const };
    }

    if (rules?.minLength && value.length < rules.minLength) {
      return { 
        isValid: false, 
        message: `${field} must be at least ${rules.minLength} characters`, 
        type: 'error' as const 
      };
    }

    if (rules?.maxLength && value.length > rules.maxLength) {
      return { 
        isValid: false, 
        message: `${field} must be no more than ${rules.maxLength} characters`, 
        type: 'error' as const 
      };
    }

    if (rules?.pattern && !rules.pattern.test(value)) {
      return { 
        isValid: false, 
        message: `${field} format is invalid`, 
        type: 'error' as const 
      };
    }

    if (rules?.custom) {
      const customError = rules.custom(value);
      if (customError) {
        return { isValid: false, message: customError, type: 'error' as const };
      }
    }

    return { 
      isValid: true, 
      message: showSuccess ? `${field} looks good!` : '', 
      type: 'success' as const 
    };
  };

  return validateField();
};

interface FormFieldProps {
  children: React.ReactNode;
  validation?: ReturnType<typeof useFieldValidation>;
  hint?: string;
  className?: string;
}

export const FormField = ({ children, validation, hint, className }: FormFieldProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
      
      {hint && !validation?.message && (
        <ValidationFeedback type="info" message={hint} />
      )}
      
      {validation?.message && (
        <ValidationFeedback 
          type={validation.type} 
          message={validation.message} 
        />
      )}
    </div>
  );
};