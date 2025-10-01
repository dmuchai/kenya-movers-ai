import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const LoadingSpinner = ({ size = 'md', className, text }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground animate-pulse">{text}</span>}
    </div>
  );
};

export const PageLoader = ({ text = "Loading..." }: { text?: string }) => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

export const ComponentLoader = ({ text }: { text?: string }) => (
  <div className="flex items-center justify-center py-8">
    <LoadingSpinner text={text} />
  </div>
);

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const LoadingButton = ({
  loading = false,
  loadingText,
  children,
  className = "",
  disabled,
  variant = "default",
  size = "md",
  ...props
}: LoadingButtonProps) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 active:scale-[0.98]",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70 active:scale-[0.98]",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80 active:scale-[0.98]",
    ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80 active:scale-[0.98]"
  };

  const sizeClasses = {
    sm: "h-9 px-3 text-sm min-w-[80px]",
    md: "h-10 px-4 py-2 min-w-[100px]",
    lg: "h-11 px-8 min-w-[120px]"
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        loading && "cursor-wait",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || "Loading..."}
        </>
      ) : (
        children
      )}
    </button>
  );
};

interface LoadingOverlayProps {
  loading: boolean;
  text?: string;
  children: React.ReactNode;
  className?: string;
}

export const LoadingOverlay = ({
  loading,
  text = "Loading...",
  children,
  className = ""
}: LoadingOverlayProps) => {
  return (
    <div className={cn("relative", className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-md z-10 animate-in fade-in duration-200">
          <div className="bg-card p-6 rounded-lg shadow-lg border animate-in slide-in-from-bottom-4 duration-300">
            <LoadingSpinner size="lg" text={text} />
          </div>
        </div>
      )}
    </div>
  );
};

interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  animated?: boolean;
}

export const ProgressBar = ({
  progress,
  className = "",
  showPercentage = false,
  animated = true
}: ProgressBarProps) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium">Progress</div>
        {showPercentage && (
          <div className="text-sm text-muted-foreground">
            {Math.round(clampedProgress)}%
          </div>
        )}
      </div>
      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            "h-full bg-primary rounded-full transition-all duration-500 ease-out",
            animated && clampedProgress > 0 && clampedProgress < 100 && "animate-pulse"
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

interface PulsingDotProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const PulsingDot = ({ 
  className = "", 
  size = "md" 
}: PulsingDotProps) => {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4"
  };

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "bg-primary rounded-full animate-ping absolute inline-flex opacity-75",
        sizeClasses[size]
      )} />
      <div className={cn(
        "bg-primary rounded-full relative inline-flex",
        sizeClasses[size]
      )} />
    </div>
  );
};

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export const TypewriterText = ({
  text,
  speed = 50,
  className = "",
  onComplete
}: TypewriterTextProps) => {
  const [displayText, setDisplayText] = React.useState("");
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  React.useEffect(() => {
    setDisplayText("");
    setCurrentIndex(0);
  }, [text]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};
