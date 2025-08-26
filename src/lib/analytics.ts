// Analytics service for tracking user interactions
import { env } from '@/lib/env';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  user_id?: string;
}

class AnalyticsService {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized || !env.isProd) return;

    // Initialize Google Analytics 4 if tracking ID is provided
    const trackingId = env.VITE_GA_TRACKING_ID;
    if (trackingId) {
      await this.initializeGA4(trackingId);
    }

    this.isInitialized = true;
  }

  private async initializeGA4(trackingId: string) {
    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(arguments);
    }
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', trackingId, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }

  // Track custom events
  track(event: AnalyticsEvent) {
    if (!this.isInitialized || !env.isProd) {
      console.log('Analytics Event (Dev):', event);
      return;
    }

    // Google Analytics 4
    if ((window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        user_id: event.user_id,
      });
    }

    // Add other analytics providers here (Mixpanel, PostHog, etc.)
  }

  // Track page views
  trackPageView(page: string, title?: string) {
    if (!this.isInitialized || !env.isProd) {
      console.log('Page View (Dev):', page, title);
      return;
    }

    if ((window as any).gtag) {
      (window as any).gtag('config', env.VITE_GA_TRACKING_ID, {
        page_title: title || document.title,
        page_location: window.location.href,
        page_path: page,
      });
    }
  }

  // Track user identification
  identifyUser(userId: string, properties?: Record<string, any>) {
    if (!this.isInitialized || !env.isProd) {
      console.log('User Identified (Dev):', userId, properties);
      return;
    }

    if ((window as any).gtag) {
      (window as any).gtag('config', env.VITE_GA_TRACKING_ID, {
        user_id: userId,
        custom_map: properties,
      });
    }
  }

  // Business-specific tracking methods
  trackQuoteRequest(data: {
    from_location: string;
    to_location: string;
    property_size: string;
    estimated_cost?: number;
  }) {
    this.track({
      action: 'quote_request',
      category: 'engagement',
      label: `${data.from_location} to ${data.to_location}`,
      value: data.estimated_cost,
    });
  }

  trackMoverContact(moverId: string, method: 'whatsapp' | 'call' | 'email') {
    this.track({
      action: 'mover_contact',
      category: 'conversion',
      label: method,
      value: 1,
    });
  }

  trackBooking(data: {
    mover_id: string;
    quote_amount: number;
    services: string[];
  }) {
    this.track({
      action: 'booking_completed',
      category: 'conversion',
      label: data.services.join(','),
      value: data.quote_amount,
    });
  }
}

export const analytics = new AnalyticsService();

// React hook for analytics
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    analytics.initialize();
  }, []);

  useEffect(() => {
    analytics.trackPageView(location.pathname);
  }, [location]);

  return analytics;
};
