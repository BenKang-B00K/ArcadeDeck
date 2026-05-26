import React, { useEffect } from 'react';
import './ScrollProgress.css';

// Single passive scroll listener writes --scroll-progress (0..1) on <html>.
// CSS uses scaleX(var(--scroll-progress)) so we never read layout.
const ScrollProgress: React.FC = () => {
  useEffect(() => {
    const root = document.documentElement;
    let rafId = 0;
    let pending = false;

    const update = () => {
      pending = false;
      const max = (root.scrollHeight - window.innerHeight) || 1;
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      root.style.setProperty('--scroll-progress', p.toFixed(4));
    };

    const onScroll = () => {
      if (pending) return;
      pending = true;
      rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(rafId);
      root.style.removeProperty('--scroll-progress');
    };
  }, []);

  return <div className="scroll-progress" aria-hidden="true" />;
};

export default ScrollProgress;
