import { useCallback, useRef } from 'react';
import type React from 'react';

// Mouse-coord 3D tilt. Writes --rx / --ry CSS vars (degrees) on the element
// the ref points at. Active only on hover-capable pointers and when the user
// has not requested reduced motion. Pair with CSS:
//   transform: perspective(800px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));
export function useTilt<T extends HTMLElement = HTMLElement>(maxDeg = 6) {
  const ref = useRef<T | null>(null);

  const canTilt = useCallback(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (!window.matchMedia('(hover: hover)').matches) return false;
    return true;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<T>) => {
    if (!canTilt()) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * 2 * maxDeg;
    const rx = -(py - 0.5) * 2 * maxDeg;
    el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
    el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
  }, [canTilt, maxDeg]);

  const onMouseLeave = useCallback((e: React.MouseEvent<T>) => {
    const el = e.currentTarget;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }, []);

  return { ref, tiltHandlers: { onMouseMove, onMouseLeave } };
}
