import React, { useEffect, useRef, useState } from 'react';
import { Gamepad2, Sparkles, Tags, Users } from 'lucide-react';
import { useUiText } from '../../i18n';
import './StatsStrip.css';

interface StatItem {
  key: string;
  label: string;
  value: number;
  icon: React.ReactNode;
  suffix?: string;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const Tile: React.FC<{ item: StatItem; index: number; play: boolean }> = ({ item, index, play }) => {
  // Lazy init handles the reduced-motion path without a synchronous setState in effect.
  const [display, setDisplay] = useState(() => (prefersReducedMotion() ? item.value : 0));

  useEffect(() => {
    if (!play) return;
    if (prefersReducedMotion()) return; // initial state already === item.value
    const duration = 1200;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(item.value * easeOutCubic(t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, item.value]);

  return (
    <div className="stats-tile reveal" style={{ '--i': index } as React.CSSProperties}>
      <span className="stats-tile-icon" aria-hidden="true">{item.icon}</span>
      <span className="stats-tile-value">
        {display.toLocaleString()}{item.suffix ?? ''}
      </span>
      <span className="stats-tile-label">{item.label}</span>
    </div>
  );
};

interface StatsStripProps {
  totalGames: number;
  totalGenres: number;
  totalOriginals: number;
  totalPlays?: number;
}

const StatsStrip: React.FC<StatsStripProps> = ({ totalGames, totalGenres, totalOriginals, totalPlays }) => {
  const t = useUiText();
  const ref = useRef<HTMLDivElement | null>(null);
  // Lazy init — if IO is unsupported, play immediately on mount.
  const [play, setPlay] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('in-view');
      return;
    }
    const io = new IntersectionObserver(
      (entries, observer) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setPlay(true);
            el.classList.add('in-view');
            observer.unobserve(e.target);
          }
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const items: StatItem[] = [
    { key: 'games', label: t('homeStatsGamesLabel', 'Games'), value: totalGames, icon: <Gamepad2 size={20} /> },
    { key: 'genres', label: t('homeStatsGenresLabel', 'Genres'), value: totalGenres, icon: <Tags size={20} /> },
    { key: 'originals', label: t('homeStatsOriginalsLabel', 'Originals'), value: totalOriginals, icon: <Sparkles size={20} /> },
  ];
  if (typeof totalPlays === 'number' && totalPlays > 0) {
    items.push({ key: 'plays', label: t('homeStatsPlaysLabel', 'Plays'), value: totalPlays, icon: <Users size={20} /> });
  }

  return (
    <div ref={ref} className="stats-strip reveal-section">
      {items.map((item, i) => (
        <Tile key={item.key} item={item} index={i} play={play} />
      ))}
    </div>
  );
};

export default StatsStrip;
