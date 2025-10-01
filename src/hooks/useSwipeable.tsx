import { useCallback, useEffect, useRef, useState } from 'react';

interface SwipeOptions {
  threshold?: number;
  preventDefaultTouchMoveEvent?: boolean;
  trackMouse?: boolean;
}

interface SwipeEventData {
  dir: 'Left' | 'Right' | 'Up' | 'Down';
  deltaX: number;
  deltaY: number;
  absX: number;
  absY: number;
  velocity: number;
}

interface SwipeHandlers {
  onSwipe?: (eventData: SwipeEventData) => void;
  onSwipeLeft?: (eventData: SwipeEventData) => void;
  onSwipeRight?: (eventData: SwipeEventData) => void;
  onSwipeUp?: (eventData: SwipeEventData) => void;
  onSwipeDown?: (eventData: SwipeEventData) => void;
  onTap?: () => void;
}

export const useSwipeable = (
  handlers: SwipeHandlers,
  options: SwipeOptions = {}
) => {
  const {
    threshold = 50,
    preventDefaultTouchMoveEvent = false,
    trackMouse = false,
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const startTimeRef = useRef<number>(0);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isSwiping = useRef(false);

  const updatePos = useCallback((x: number, y: number) => {
    const deltaX = x - startPosRef.current.x;
    const deltaY = y - startPosRef.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const time = Date.now() - startTimeRef.current;
    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / time;

    // Determine if this is a significant swipe
    if (absX > threshold || absY > threshold) {
      const isHorizontal = absX > absY;
      const dir = isHorizontal
        ? deltaX > 0 ? 'Right' : 'Left'
        : deltaY > 0 ? 'Down' : 'Up';

      const eventData: SwipeEventData = {
        dir,
        deltaX,
        deltaY,
        absX,
        absY,
        velocity,
      };

      handlers.onSwipe?.(eventData);
      
      switch (dir) {
        case 'Left':
          handlers.onSwipeLeft?.(eventData);
          break;
        case 'Right':
          handlers.onSwipeRight?.(eventData);
          break;
        case 'Up':
          handlers.onSwipeUp?.(eventData);
          break;
        case 'Down':
          handlers.onSwipeDown?.(eventData);
          break;
      }
      
      return true; // Indicates a swipe occurred
    }
    
    return false;
  }, [threshold, handlers]);

  // Touch event handlers
  const onTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    startPosRef.current = { x: touch.clientX, y: touch.clientY };
    startTimeRef.current = Date.now();
    isSwiping.current = false;
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (preventDefaultTouchMoveEvent) {
      e.preventDefault();
    }
    isSwiping.current = true;
  }, [preventDefaultTouchMoveEvent]);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    const touch = e.changedTouches[0];
    const swiped = updatePos(touch.clientX, touch.clientY);
    
    // If no swipe detected and it was a short touch, trigger tap
    if (!swiped && !isSwiping.current && Date.now() - startTimeRef.current < 300) {
      handlers.onTap?.();
    }
  }, [updatePos, handlers]);

  // Mouse event handlers (for desktop testing)
  const onMouseDown = useCallback((e: MouseEvent) => {
    if (!trackMouse) return;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startTimeRef.current = Date.now();
    isSwiping.current = false;
  }, [trackMouse]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!trackMouse) return;
    isSwiping.current = true;
  }, [trackMouse]);

  const onMouseUp = useCallback((e: MouseEvent) => {
    if (!trackMouse) return;
    const swiped = updatePos(e.clientX, e.clientY);
    
    if (!swiped && !isSwiping.current && Date.now() - startTimeRef.current < 300) {
      handlers.onTap?.();
    }
  }, [trackMouse, updatePos, handlers]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add touch event listeners
    element.addEventListener('touchstart', onTouchStart, { passive: false });
    element.addEventListener('touchmove', onTouchMove, { passive: false });
    element.addEventListener('touchend', onTouchEnd, { passive: false });

    // Add mouse event listeners if tracking mouse
    if (trackMouse) {
      element.addEventListener('mousedown', onMouseDown);
      element.addEventListener('mousemove', onMouseMove);
      element.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
      
      if (trackMouse) {
        element.removeEventListener('mousedown', onMouseDown);
        element.removeEventListener('mousemove', onMouseMove);
        element.removeEventListener('mouseup', onMouseUp);
      }
    };
  }, [onTouchStart, onTouchMove, onTouchEnd, onMouseDown, onMouseMove, onMouseUp, trackMouse]);

  return { ref: elementRef };
};

// Hook for handling swipe gestures in form steps
export const useSwipeNavigation = (
  currentStep: number,
  totalSteps: number,
  onStepChange: (step: number) => void,
  canNavigate?: (direction: 'prev' | 'next') => boolean
) => {
  const swipeHandlers = useSwipeable({
    onSwipeLeft: () => {
      if (currentStep < totalSteps && (!canNavigate || canNavigate('next'))) {
        onStepChange(currentStep + 1);
      }
    },
    onSwipeRight: () => {
      if (currentStep > 1 && (!canNavigate || canNavigate('prev'))) {
        onStepChange(currentStep - 1);
      }
    },
  }, {
    threshold: 50,
    preventDefaultTouchMoveEvent: false,
  });

  return swipeHandlers;
};

// Hook for handling swipe to dismiss
export const useSwipeToDismiss = (
  onDismiss: () => void,
  threshold: number = 100
) => {
  const swipeHandlers = useSwipeable({
    onSwipeUp: (data) => {
      if (data.absY > threshold && data.velocity > 0.5) {
        onDismiss();
      }
    },
    onSwipeDown: (data) => {
      if (data.absY > threshold && data.velocity > 0.5) {
        onDismiss();
      }
    },
  }, {
    threshold,
    preventDefaultTouchMoveEvent: true,
  });

  return swipeHandlers;
};