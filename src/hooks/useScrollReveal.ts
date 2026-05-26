import { useEffect, useRef } from 'react';

// Adds class `.in-view` to the element the ref points at the first time it
// enters the viewport, then unobserves. Pair with CSS that defines the
// resting (.reveal) and active (.reveal.in-view) states.
export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No IO support → reveal immediately.
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('in-view');
      return;
    }

    const io = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1, ...options },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [options]);

  return ref;
}
