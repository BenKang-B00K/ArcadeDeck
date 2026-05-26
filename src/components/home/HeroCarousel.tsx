import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import type { Game } from '../../data/games';
import { useLocale, getLocalizedString, useUiText } from '../../i18n';
import './HeroCarousel.css';

interface HeroCarouselProps {
  slides: Game[];
  intervalMs?: number;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides, intervalMs = 5500 }) => {
  const t = useUiText();
  const { lang, overlay } = useLocale();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Preload first slide bg as soon as we mount so LCP image is hinted to the browser.
  useEffect(() => {
    const first = slides[0];
    if (!first) return;
    const href = `${import.meta.env.BASE_URL}${first.pageBg || first.thumbnail}`;
    const existing = document.head.querySelector(`link[rel="preload"][data-hero="1"]`);
    if (existing) existing.remove();
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = href;
    link.setAttribute('data-hero', '1');
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [slides]);

  // Autoplay (respect reduced motion + paused state + tab visibility).
  useEffect(() => {
    if (slides.length <= 1) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (paused) return;
    if (typeof document !== 'undefined' && document.hidden) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [slides.length, paused, intervalMs]);

  // Pause when tab hidden.
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Mouse parallax — only when hover supported + motion allowed.
  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width - 0.5;
    const my = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--mx', mx.toFixed(3));
    el.style.setProperty('--my', my.toFixed(3));
  };

  const onMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty('--mx', '0');
    e.currentTarget.style.setProperty('--my', '0');
  };

  // Keyboard nav.
  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActive((i) => (i - 1 + slides.length) % slides.length);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActive((i) => (i + 1) % slides.length);
    }
  };

  if (slides.length === 0) return null;

  return (
    <section
      className="hero-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={t('homeHeroCarouselAria', 'Featured games')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={(e) => { setPaused(false); onMouseLeave(e); }}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onMouseMove={onMouseMove}
      onKeyDown={onKeyDown}
      tabIndex={-1}
    >
      <div className="hero-carousel-track" aria-live="polite">
        {slides.map((g, i) => {
          const isActive = i === active;
          const title = getLocalizedString(g, 'title', lang, overlay);
          const desc = getLocalizedString(g, 'fullDescription', lang, overlay)
            || getLocalizedString(g, 'description', lang, overlay);
          const tagline = desc.split('. ')[0] + (desc.includes('. ') ? '.' : '');
          const bg = `${import.meta.env.BASE_URL}${g.pageBg || g.thumbnail}`;
          return (
            <div
              key={g.id}
              className={`hero-slide${isActive ? ' is-active' : ''}`}
              aria-hidden={!isActive}
            >
              <div
                className="hero-slide-bg"
                style={{ backgroundImage: `url(${bg})` }}
              />
              <div className="hero-slide-scrim" />
              <div className="container hero-slide-content">
                <span className="hero-slide-eyebrow">{t('homeHeroFeatured', 'Featured')}</span>
                <h1 className="hero-slide-title" data-text={title}>{title}</h1>
                {tagline && <p className="hero-slide-tagline">{tagline}</p>}
                <div className="hero-slide-actions">
                  <Link to={`/play/${g.slug}`} className="hero-cta hero-cta-primary">
                    <Play size={18} aria-hidden="true" />
                    {t('homeHeroCtaPlay', 'Play Now')}
                  </Link>
                  <a href="#games-grid" className="hero-cta hero-cta-ghost">
                    {t('homeHeroCtaBrowse', 'Browse All')}
                  </a>
                </div>
                <div className="hero-slide-genres" aria-hidden="true">
                  {g.genres.slice(0, 3).map((genre) => (
                    <span key={`${g.id}-${genre}`} className="hero-slide-genre">{genre}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            className="hero-carousel-nav prev"
            onClick={() => setActive((i) => (i - 1 + slides.length) % slides.length)}
            aria-label={t('homeHeroPrevAria', 'Previous featured game')}
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="hero-carousel-nav next"
            onClick={() => setActive((i) => (i + 1) % slides.length)}
            aria-label={t('homeHeroNextAria', 'Next featured game')}
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>

          <div className="hero-carousel-dots" role="tablist">
            {slides.map((g, i) => (
              <button
                key={`dot-${g.id}`}
                type="button"
                role="tab"
                className={`hero-carousel-dot${i === active ? ' is-active' : ''}`}
                aria-selected={i === active}
                aria-label={t('homeHeroIndicatorAria', 'Go to slide {n}').replace('{n}', String(i + 1))}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroCarousel;
