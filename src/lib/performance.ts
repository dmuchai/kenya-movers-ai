// Performance monitoring utility
import React, { useEffect, useRef } from 'react';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track component render time
  trackRender(componentName: string, startTime: number) {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    this.metrics.set(`render_${componentName}`, renderTime);

    // Log slow renders in development
    if (import.meta.env.DEV && renderTime > 100) {
      console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
  }

  // Track API call performance
  trackApiCall(endpoint: string, startTime: number, success: boolean) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    this.metrics.set(`api_${endpoint}_${success ? 'success' : 'error'}`, duration);

    // Log slow API calls
    if (duration > 5000) {
      console.warn(`Slow API call: ${endpoint} took ${duration.toFixed(2)}ms`);
    }
  }

  // Get Core Web Vitals
  getCoreWebVitals() {
    return new Promise((resolve) => {
      if ('web-vital' in window) {
        // If using web-vitals library
        resolve(this.metrics);
      } else {
        // Fallback metrics
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        resolve({
          fcp: navigation.responseStart - navigation.fetchStart,
          lcp: navigation.loadEventEnd - navigation.fetchStart,
          cls: 0, // Would need additional measurement
          fid: 0, // Would need additional measurement
        });
      }
    });
  }

  // Report metrics (in production, send to analytics service)
  reportMetrics() {
    if (import.meta.env.PROD) {
      // Example: Send to Google Analytics, Mixpanel, etc.
      console.log('Performance metrics:', Object.fromEntries(this.metrics));
    }
  }
}

// React hook for performance tracking
export const usePerformanceTracking = (componentName: string) => {
  const startTime = useRef(performance.now());
  const monitor = PerformanceMonitor.getInstance();

  useEffect(() => {
    monitor.trackRender(componentName, startTime.current);
  }, [componentName, monitor]);
};

// HOC for performance tracking
export const withPerformanceTracking = <T extends object>(
  Component: React.ComponentType<T>,
  componentName: string
): React.ComponentType<T> => {
  const WrappedComponent = (props: T) => {
    usePerformanceTracking(componentName);
    return React.createElement(Component, props);
  };
  
  WrappedComponent.displayName = `withPerformanceTracking(${componentName})`;
  return WrappedComponent;
};
