// Environment configuration and validation
const requiredEnvVars = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
} as const;

const optionalEnvVars = {
  VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  VITE_GA_TRACKING_ID: import.meta.env.VITE_GA_TRACKING_ID,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME || 'MoveEasy Moving Planner',
  VITE_APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:8080',
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
} as const;

// Validate required environment variables
function validateEnvironment() {
  const missing: string[] = [];
  
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }

  // Warn about missing optional variables in development
  if (import.meta.env.DEV) {
    Object.entries(optionalEnvVars).forEach(([key, value]) => {
      if (!value && key !== 'VITE_APP_NAME' && key !== 'VITE_APP_URL' && key !== 'VITE_APP_ENV') {
        console.warn(`Optional environment variable ${key} is not set`);
      }
    });
  }
}

// Initialize environment validation
validateEnvironment();

export const env = {
  ...requiredEnvVars,
  ...optionalEnvVars,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  isPreview: import.meta.env.VITE_VERCEL_ENV === 'preview',
} as const;

export default env;
