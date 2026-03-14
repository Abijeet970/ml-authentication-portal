import { useEffect } from 'react';

export function useBehaviorTracker() {
  useEffect(() => {
    const handleMouseMove = (_e: MouseEvent) => {
      // In a real app, record metrics for ML processing
    };
    
    const handleKeyDown = (_e: KeyboardEvent) => {
      // Record keydown timings for ML processing
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
