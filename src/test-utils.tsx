// Basic test utilities and mock data
// Note: Install @testing-library/react and jest for actual testing

// Basic test utilities and mock data
// Note: Install @testing-library/react and jest for actual testing

// Test utilities and mock data for MoveLink Moving Planner
// Install @testing-library/react, @testing-library/jest-dom, and jest for full testing

// Mock data for development and testing
export const testData = {
  user: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z',
  },
  
  quote: {
    id: '123e4567-e89b-12d3-a456-426614174001',
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    from_location: 'Nairobi',
    to_location: 'Mombasa',
    moving_date: '2024-02-01',
    property_size: '2-bedroom',
    additional_services: ['Packing'],
    status: 'pending',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  
  mover: {
    id: '123e4567-e89b-12d3-a456-426614174002',
    company_name: 'Test Movers Ltd',
    contact_email: 'info@testmovers.com',
    contact_phone: '+254712345678',
    hourly_rate: 5000,
    service_areas: ['Nairobi', 'Mombasa'],
    license_number: 'TM001',
    description: 'Professional moving services',
  },
};

// Environment utilities
export const envUtils = {
  isDevelopment: () => import.meta.env.DEV,
  isProduction: () => import.meta.env.PROD,
  getEnv: (key: string) => import.meta.env[key],
};

// Performance debugging
export const debugUtils = {
  logPerformance: (label: string, fn: () => void) => {
    if (envUtils.isDevelopment()) {
      const start = performance.now();
      fn();
      const end = performance.now();
      console.log(`${label} took ${(end - start).toFixed(2)} milliseconds`);
    } else {
      fn();
    }
  },
  
  logApiCall: (endpoint: string, data?: any) => {
    if (envUtils.isDevelopment()) {
      console.log(`API Call: ${endpoint}`, data);
    }
  },
  
  logError: (error: Error, context?: string) => {
    if (envUtils.isDevelopment()) {
      console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    }
  },
};

// Component testing helpers (requires @testing-library/react)
export const testHelpers = {
  // Mock window.matchMedia for responsive components
  mockMatchMedia: (matches: boolean) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  },
  
  // Mock IntersectionObserver
  mockIntersectionObserver: () => {
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  },
};

export default {
  testData,
  envUtils,
  debugUtils,
  testHelpers,
};

export const mockMover = {
  id: '123e4567-e89b-12d3-a456-426614174002',
  company_name: 'Test Movers Ltd',
  contact_email: 'info@testmovers.com',
  contact_phone: '+254712345678',
  hourly_rate: 5000,
  service_areas: ['Nairobi', 'Mombasa'],
  license_number: 'TM001',
  description: 'Professional moving services',
};

// Development utilities
export const isDevelopment = () => import.meta.env.DEV;
export const isProduction = () => import.meta.env.PROD;

// Debug helpers
export const logPerformance = (label: string, fn: () => void) => {
  if (isDevelopment()) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${label} took ${end - start} milliseconds`);
  } else {
    fn();
  }
};

export const mockMover = {
  id: '123e4567-e89b-12d3-a456-426614174002',
  company_name: 'Test Movers Ltd',
  contact_email: 'info@testmovers.com',
  contact_phone: '+254712345678',
  hourly_rate: 5000,
  service_areas: ['Nairobi', 'Mombasa'],
  license_number: 'TM001',
  description: 'Professional moving services',
};

// Development utilities
export const isDevelopment = () => import.meta.env.DEV;
export const isProduction = () => import.meta.env.PROD;

// Debug helpers
export const logPerformance = (label: string, fn: () => void) => {
  if (isDevelopment()) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${label} took ${end - start} milliseconds`);
  } else {
    fn();
  }
};

// Common test data
export const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
};

export const mockQuote = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  user_id: mockUser.id,
  from_location: 'Nairobi',
  to_location: 'Mombasa',
  moving_date: '2024-02-01',
  property_size: '2-bedroom',
  additional_services: ['Packing'],
  status: 'pending',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};
