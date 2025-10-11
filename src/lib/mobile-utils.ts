/**
 * Mobile-specific utilities for better UX on mobile devices
 */

import { App as CapacitorApp } from '@capacitor/app';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';

/**
 * Check if running on a mobile device
 */
export const isMobile = () => {
  return Capacitor.isNativePlatform();
};

/**
 * Setup Android hardware back button handler
 * Prevents app from exiting when navigating back
 */
export const setupBackButtonHandler = (navigate: (path: string) => void) => {
  if (!isMobile()) return;

  CapacitorApp.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      // On root page, show exit confirmation
      CapacitorApp.exitApp();
    }
  });
};

/**
 * Setup keyboard event handlers to scroll inputs into view
 */
export const setupKeyboardHandlers = () => {
  if (!isMobile()) return;

  Keyboard.addListener('keyboardWillShow', (info) => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      setTimeout(() => {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }

    // Add padding to body to account for keyboard
    document.body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
    document.body.classList.add('keyboard-open');
  });

  Keyboard.addListener('keyboardWillHide', () => {
    document.body.style.setProperty('--keyboard-height', '0px');
    document.body.classList.remove('keyboard-open');
  });
};

/**
 * Scroll element into view above keyboard
 */
export const scrollElementIntoView = (element: HTMLElement) => {
  if (!element) return;
  
  setTimeout(() => {
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'nearest'
    });
  }, 100);
};

/**
 * Remove all listeners on cleanup
 */
export const cleanupMobileListeners = async () => {
  if (!isMobile()) return;

  await CapacitorApp.removeAllListeners();
  await Keyboard.removeAllListeners();
};
