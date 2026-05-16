import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Gamepad2, Play, Trophy } from 'lucide-react';
import type { Game } from '../data/games';
import { useLocale, getLocalizedString, getEnFeatures, useUiText } from '../i18n';
import { thumb360, SRCSET_SIZES } from '../utils/thumb';
import './GameCard.css';

const prefetchedUrls = new Set<string>();

function prefetchGameUrl(url: string): void {
  if (!url || prefetchedUrls.has(url)) return;
  prefetchedUrls.add(url);
  try {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'document';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  } catch {
    // ignore prefetch errors — purely a perf hint
  }
}

interface GameCardProps {
  game: Game;
  onProductionClick?: () => void;
  isRecentlyPlayed?: boolean;
  onGenreClick?: (genre: string) => void;
  myRank?: number;
  maxTags?: number;
}

const GameCard: React.FC<GameCardProps> = ({ game, onProductionClick, isRecentlyPlayed = false, onGenreClick, myRank, maxTags }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { lang, overlay } = useLocale();
  const t = useUiText();
  const title = getLocalizedString(game, 'title', lang, overlay);

  const isRemote = game.thumbnail.startsWith('http');
  const thumbnailUrl = isRemote
    ? game.thumbnail
    : `${import.meta.env.BASE_URL}${game.thumbnail}`;
  const srcSet = isRemote
    ? undefined
    : `${import.meta.env.BASE_URL}${thumb360(game.thumbnail)} 360w, ${thumbnailUrl} 640w`;

  const handleClick = (e: React.MouseEvent) => {
    if (game.status === 'IN PRODUCTION') {
      e.preventDefault();
      if (onProductionClick) onProductionClick();
    }
  };

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (game.status === 'IN PRODUCTION' || !game.gameUrl) return;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => prefetchGameUrl(game.gameUrl), 120);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const isInProduction = game.status === 'IN PRODUCTION';

  // Show only the most important platform badge (priority: Co-op > PC Only > Mobile).
  // Read from the canonical English features list — these are semantic markers,
  // not display strings, so they should not change with locale.
  const enFeatures = getEnFeatures(game.id);
  const platformBadge = enFeatures.some(f => f.startsWith('Local Co-op'))
    ? <div className="platform-badge coop"><Gamepad2 size={12} aria-hidden="true" /> {t('gameCardCoop', 'Co-op')}</div>
    : enFeatures.includes('PC Only')
    ? <div className="platform-badge pc-only"><Monitor size={12} aria-hidden="true" /> {t('gameCardPcOnly', 'PC Only')}</div>
    : null;

  return (
    <Link
      to={`/play/${game.slug}`}
      className={`game-card${isInProduction ? ' card-coming-soon' : ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
    >
      {/* Row 1: Title + Badge + Rank */}
      <div className="card-title-row">
        <h3>{title}</h3>
        {game.isOriginal && <span className="original-dot" title={t('gameCardOriginal', 'Original')} />}
        {game.badge && (
          <span
            className={`game-badge badge-${
              game.badge === 'POPULAR'
                ? 'popular'
                : game.badge === 'UPDATE'
                  ? 'update'
                  : 'cantstop'
            }`}
          >
            {game.badge}
          </span>
        )}
        {myRank && (
          <span className={`my-rank-badge rank-tier-${myRank <= 3 ? myRank : 'other'}`}>
            <Trophy size={10} aria-hidden="true" />
            #{myRank}
          </span>
        )}
      </div>

      {/* Row 2: Image */}
      <div className={`card-image${imageLoaded ? '' : ' img-loading'}`}>
        <img
          src={thumbnailUrl}
          srcSet={srcSet}
          sizes={srcSet ? SRCSET_SIZES : undefined}
          alt={title}
          width="640"
          height="360"
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
        />
        {platformBadge}
        {isInProduction && (
          <div className="status-badge in-production">{t('gameCardComingSoon', 'Coming Soon')}</div>
        )}
        <div className="card-overlay">
          <button className="play-btn">
            {isInProduction ? t('gameCardComingSoon', 'Coming Soon') : isRecentlyPlayed ? <><Play size={14} aria-hidden="true" /> {t('gameCardResume', 'Resume')}</> : t('gameCardPlayNow', 'Play Now')}
          </button>
        </div>
      </div>

      {/* Row 3: Tags */}
      <div className="card-tags-row">
        {(maxTags ? game.genres.slice(0, maxTags) : game.genres).map((genre) => (
          <span
            key={`${game.id}-${genre}`}
            className={`genre-tag${onGenreClick ? ' clickable-genre' : ''}`}
            onClick={onGenreClick ? (e) => { e.preventDefault(); e.stopPropagation(); onGenreClick(genre); } : undefined}
          >{genre}</span>
        ))}
      </div>
    </Link>
  );
};

export default React.memo(GameCard);
