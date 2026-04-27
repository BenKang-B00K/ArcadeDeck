import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Gamepad2, Play, Trophy } from 'lucide-react';
import type { GameLight } from '../data/games';
import './GameCard.css';

interface GameCardProps {
  game: GameLight;
  onProductionClick?: () => void;
  isRecentlyPlayed?: boolean;
  onGenreClick?: (genre: string) => void;
  myRank?: number;
  maxTags?: number;
}

const GameCard: React.FC<GameCardProps> = ({ game, onProductionClick, isRecentlyPlayed = false, onGenreClick, myRank, maxTags }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const thumbnailUrl = game.thumbnail.startsWith('http')
    ? game.thumbnail
    : `${import.meta.env.BASE_URL}${game.thumbnail}`;

  const handleClick = (e: React.MouseEvent) => {
    if (game.status === 'IN PRODUCTION') {
      e.preventDefault();
      if (onProductionClick) onProductionClick();
    }
  };

  const isInProduction = game.status === 'IN PRODUCTION';

  // Show only the most important platform badge (priority: Co-op > PC Only > Mobile)
  const platformBadge = game.features?.some(f => f.startsWith('Local Co-op'))
    ? <div className="platform-badge coop"><Gamepad2 size={12} aria-hidden="true" /> Co-op</div>
    : game.features?.includes('PC Only')
    ? <div className="platform-badge pc-only"><Monitor size={12} aria-hidden="true" /> PC Only</div>
    : null;

  return (
    <Link to={`/play/${game.slug}`} className={`game-card${isInProduction ? ' card-coming-soon' : ''}`} onClick={handleClick}>
      {/* Row 1: Title + Badge + Rank */}
      <div className="card-title-row">
        <h3>{game.title}</h3>
        {game.isOriginal && <span className="original-dot" title="Original" />}
        {game.badge && (
          <span className={`game-badge badge-${game.badge === 'POPULAR' ? 'popular' : 'cantstop'}`}>
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
          alt={game.title}
          width="640"
          height="360"
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
        />
        {platformBadge}
        {isInProduction && (
          <div className="status-badge in-production">Coming Soon</div>
        )}
        <div className="card-overlay">
          <button className="play-btn">
            {isInProduction ? 'Coming Soon' : isRecentlyPlayed ? <><Play size={14} aria-hidden="true" /> Resume</> : 'Play Now'}
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
