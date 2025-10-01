import React, { useState, useCallback, useEffect } from 'react';

interface UseLoadingOptions {
  initialLoading?: boolean;
  timeout?: number; // Auto-clear loading after timeout
}

export const useLoading = (options: UseLoadingOptions = {}) => {
  const { initialLoading = false, timeout } = options;
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  const startLoading = useCallback(() => {
    setLoading(true);
    setError(null);
    
    if (timeout) {
      setTimeout(() => {
        setLoading(false);
      }, timeout);
    }
  }, [timeout]);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const setLoadingWithError = useCallback((errorMessage: string) => {
    setLoading(false);
    setError(errorMessage);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setError: setLoadingWithError,
    reset
  };
};

// Hook for managing multiple loading states
export const useMultipleLoading = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return Boolean(loadingStates[key]);
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  const resetAll = useCallback(() => {
    setLoadingStates({});
  }, []);

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    resetAll,
    loadingStates
  };
};

// Hook for async operations with loading state
export const useAsyncOperation = <T = any>() => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (operation: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setData(null);
    setError(null);
  }, []);

  return {
    loading,
    data,
    error,
    execute,
    reset
  };
};

// Hook for debounced loading states (useful for search)
export const useDebouncedLoading = (delay: number = 300) => {
  const [loading, setLoading] = useState(false);
  const [debouncedLoading, setDebouncedLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLoading(loading);
    }, delay);

    return () => clearTimeout(timer);
  }, [loading, delay]);

  return {
    loading,
    debouncedLoading,
    setLoading
  };
};