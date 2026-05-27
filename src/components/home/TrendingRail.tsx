import React from 'react';
import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import type { Game } from '../../data/games';
import { useLocale, getLocalizedString, useUiText } from '../../i18n';
import { thumb360, SRCSET_SIZES } from '../../utils/thumb';
import './TrendingRail.css';

interface TrendingRailProps {
  games: Game[];
}

const TrendingRail: React.FC<TrendingRailProps> = ({ games }) => {
  const t = useUiText();
  const { lang, overlay } = useLocale();
  if (games.length === 0) return null;

  // Duplicate the list so the CSS marquee can loop seamlessly.
  const loop = [...games, ...games];

  return (
    <section className="trending-rail">
      <div className="container">
        <div className="trending-rail-header">
          <h2 className="trending-rail-title">
            <Flame size={22} aria-hidden="true" className="trending-rail-flame" />
            {t('homeTrendingTitle', 'Trending')} <span>{t('homeTrendingSpan', 'Right Now')}</span>
          </h2>
        </div>
      </div>

      <div className="trending-rail-viewport">
        <div className="trending-rail-track" aria-label={t('homeTrendingAria', 'Trending games carousel')}>
          {loop.map((g, idx) => {
            const title = getLocalizedString(g, 'title', lang, overlay);
            const thumb = `${import.meta.env.BASE_URL}${g.thumbnail}`;
            const srcSet = `${import.meta.env.BASE_URL}${thumb360(g.thumbnail)} 360w, ${thumb} 640w`;
            const eager = idx < 4;
            return (
              <Link
                key={`trend-${g.id}-${idx}`}
                to={`/play/${g.slug}`}
                className="trending-card"
                aria-hidden={idx >= games.length}
                tabIndex={idx >= games.length ? -1 : 0}
              >
                <div className="trending-card-image">
                  <img
                    src={thumb}
                    srcSet={srcSet}
                    sizes={SRCSET_SIZES}
                    alt={title}
                    width="640"
                    height="360"
                    loading={eager ? 'eager' : 'lazy'}
                    fetchPriority={eager ? 'high' : 'auto'}
                    decoding="async"
                  />
                </div>
                <div className="trending-card-meta">
                  <span className="trending-card-title">{title}</span>
                  <span className="trending-card-genre">{g.genres[0]}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrendingRail;
