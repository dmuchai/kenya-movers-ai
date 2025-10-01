import { useCallback } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'selection' | 'impact' | 'notification';

interface HapticOptions {
  enabled?: boolean;
  pattern?: HapticPattern;
  duration?: number;
}

export const useHapticFeedback = (options: HapticOptions = {}) => {
  const { enabled = true } = options;

  const triggerHaptic = useCallback((pattern: HapticPattern = 'light') => {
    if (!enabled) return;

    // Check if the device supports haptic feedback
    if ('vibrate' in navigator) {
      let vibrationPattern: number | number[];

      switch (pattern) {
        case 'light':
          vibrationPattern = 10;
          break;
        case 'medium':
          vibrationPattern = 20;
          break;
        case 'heavy':
          vibrationPattern = 30;
          break;
        case 'selection':
          vibrationPattern = [5];
          break;
        case 'impact':
          vibrationPattern = [10, 5, 10];
          break;
        case 'notification':
          vibrationPattern = [50, 30, 50];
          break;
        default:
          vibrationPattern = 10;
      }

      navigator.vibrate(vibrationPattern);
    }

    // For iOS devices with haptic feedback support
    if ('Haptics' in window) {
      try {
        const haptics = (window as any).Haptics;
        switch (pattern) {
          case 'light':
            haptics.impact({ style: 'light' });
            break;
          case 'medium':
            haptics.impact({ style: 'medium' });
            break;
          case 'heavy':
            haptics.impact({ style: 'heavy' });
            break;
          case 'selection':
            haptics.selection();
            break;
          case 'notification':
            haptics.notification({ style: 'success' });
            break;
          default:
            haptics.impact({ style: 'light' });
        }
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
      }
    }
  }, [enabled]);

  // Specific haptic feedback methods
  const lightImpact = useCallback(() => triggerHaptic('light'), [triggerHaptic]);
  const mediumImpact = useCallback(() => triggerHaptic('medium'), [triggerHaptic]);
  const heavyImpact = useCallback(() => triggerHaptic('heavy'), [triggerHaptic]);
  const selectionChanged = useCallback(() => triggerHaptic('selection'), [triggerHaptic]);
  const notificationSuccess = useCallback(() => triggerHaptic('notification'), [triggerHaptic]);

  return {
    triggerHaptic,
    lightImpact,
    mediumImpact,
    heavyImpact,
    selectionChanged,
    notificationSuccess,
  };
};

// Hook for button interactions with haptic feedback
export const useHapticButton = () => {
  const { lightImpact, mediumImpact } = useHapticFeedback();

  const onPress = useCallback(() => {
    lightImpact();
  }, [lightImpact]);

  const onLongPress = useCallback(() => {
    mediumImpact();
  }, [mediumImpact]);

  return { onPress, onLongPress };
};

// Hook for form interactions with haptic feedback
export const useHapticForm = () => {
  const { selectionChanged, notificationSuccess, mediumImpact } = useHapticFeedback();

  const onFieldChange = useCallback(() => {
    selectionChanged();
  }, [selectionChanged]);

  const onStepComplete = useCallback(() => {
    notificationSuccess();
  }, [notificationSuccess]);

  const onError = useCallback(() => {
    mediumImpact();
  }, [mediumImpact]);

  return { onFieldChange, onStepComplete, onError };
};

// Hook for navigation interactions with haptic feedback
export const useHapticNavigation = () => {
  const { lightImpact, selectionChanged } = useHapticFeedback();

  const onTabChange = useCallback(() => {
    selectionChanged();
  }, [selectionChanged]);

  const onPageTransition = useCallback(() => {
    lightImpact();
  }, [lightImpact]);

  return { onTabChange, onPageTransition };
};