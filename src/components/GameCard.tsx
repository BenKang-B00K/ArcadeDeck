import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Smartphone, Gamepad2 } from 'lucide-react';
import { GENRE_HUE, type Game } from '../data/games';
import { useLocale, getLocalizedString, useUiText } from '../i18n';
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
    // purely a perf hint
  }
}

interface GameCardProps {
  game: Game;
  onProductionClick?: () => void;
  onGenreClick?: (genre: string) => void;
}


const GameCard: React.FC<GameCardProps> = ({ game, onProductionClick, onGenreClick }) => {
  const { lang, overlay } = useLocale();
  const t = useUiText();
  const title = getLocalizedString(game, 'title', lang, overlay);
  const isInProduction = game.status === 'IN PRODUCTION';

  const isRemote = game.thumbnail.startsWith('http');
  const thumbnailUrl = isRemote ? game.thumbnail : `${import.meta.env.BASE_URL}${game.thumbnail}`;
  const srcSet = isRemote ? undefined : `${import.meta.env.BASE_URL}${thumb360(game.thumbnail)} 360w, ${thumbnailUrl} 640w`;

  const handleClick = (e: React.MouseEvent) => {
    if (isInProduction) {
      e.preventDefault();
      onProductionClick?.();
    }
  };

  // Prefetch the game document after a short hover so quick mouse passes don't fire it.
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleMouseEnter = () => {
    if (isInProduction || !game.gameUrl) return;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => prefetchGameUrl(game.gameUrl), 120);
  };
  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
  };

  // Platform badge from structural config, not translatable copy.
  const players = game.players
    ? (game.players[0] === game.players[1] ? `${game.players[0]}P` : `${game.players[0]}–${game.players[1]}P`)
    : null;
  const platformBadge = game.genres.includes('Local Co-op')
    ? <span className="platform-badge"><Gamepad2 size={12} aria-hidden="true" /> {t('gameCardCoop', 'Co-op')}{players && <b className="players-chip">{players}</b>}</span>
    : game.platform === 'PC'
    ? <span className="platform-badge"><Monitor size={12} aria-hidden="true" /> {t('gameCardPcOnly', 'PC Only')}</span>
    : game.platform === 'MOBILE'
    ? <span className="platform-badge"><Smartphone size={12} aria-hidden="true" /> {t('gameCardMobileOnly', 'Mobile Only')}</span>
    : <span className="platform-badge"><Monitor size={12} aria-hidden="true" /><Smartphone size={12} aria-hidden="true" /> {t('gameCardBoth', 'PC / Mobile')}</span>;

  const badgeClass =
    game.badge === 'POPULAR' ? 'popular'
    : game.badge === 'UPDATE' ? 'update'
    : game.badge === 'NEW' ? 'new'
    : 'cantstop';

  return (
    <Link
      to={`/play/${game.slug}`}
      className={`game-card${isInProduction ? ' card-coming-soon' : ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
    >
      <div className="card-title-row">
        <h3>{title}</h3>
        {game.isOriginal && <span className="original-dot" title={t('gameCardOriginal', 'Original')} />}
        {game.badge && <span className={`game-badge badge-${badgeClass}`}>{game.badge}</span>}
      </div>

      <div className="card-image">
        <img
          src={thumbnailUrl}
          srcSet={srcSet}
          sizes={srcSet ? SRCSET_SIZES : undefined}
          alt={title}
          width="640"
          height="360"
          loading="lazy"
          decoding="async"
        />
        {platformBadge}
        {isInProduction && <span className="status-badge">{t('gameCardComingSoon', 'Coming Soon')}</span>}
        <div className="card-overlay" aria-hidden="true">
          <span className="play-btn">{isInProduction ? t('gameCardComingSoon', 'Coming Soon') : game.kind === 'app' ? t('gameCardOpenApp', 'Open') : t('gameCardPlayNow', 'Play Now')}</span>
        </div>
      </div>

      <div className="card-tags-row">
        {game.genres.map((genre, i) => (
          <span
            key={`${game.id}-${genre}`}
            className={`genre-tag ${i === 0 ? 'main' : 'sub'}${onGenreClick ? ' clickable-genre' : ''}`}
            style={{ '--h': GENRE_HUE[genre] ?? 260 } as React.CSSProperties}
            onClick={onGenreClick ? (e) => { e.preventDefault(); e.stopPropagation(); onGenreClick(genre); } : undefined}
          >{genre}</span>
        ))}
      </div>
    </Link>
  );
};

export default React.memo(GameCard);
