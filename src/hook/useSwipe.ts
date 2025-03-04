import { useRef, useEffect } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';
type SwipeCallback = (direction: Direction) => void;

interface SwipeOptions {
  threshold?: number;
  timeout?: number;
}

export const useSwipe = (
  onSwipe: SwipeCallback,
  options: SwipeOptions = {}
) => {
  const { threshold = 50, timeout = 300 } = options;
  const ref = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const startTime = useRef<number>(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      startTime.current = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startTime.current) return;

      const deltaX = e.changedTouches[0].clientX - startX.current;
      const deltaY = e.changedTouches[0].clientY - startY.current;
      const deltaTime = Date.now() - startTime.current;

      if (deltaTime > timeout) return;

      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (Math.max(absDeltaX, absDeltaY) > threshold) {
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          onSwipe(deltaX > 0 ? 'right' : 'left');
        } else {
          // Vertical swipe
          onSwipe(deltaY > 0 ? 'down' : 'up');
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipe, threshold, timeout]);

  return { ref };
};