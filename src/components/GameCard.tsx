import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Game } from '../data/games';
import './GameCard.css';

interface GameCardProps {
  game: Game;
  onProductionClick?: () => void;
  isRecentlyPlayed?: boolean;
  onGenreClick?: (genre: string) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onProductionClick, isRecentlyPlayed = false, onGenreClick }) => {
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

  const getLanguageBadge = () => {
    switch (game.id) {
      case '13': return 'KO'; // Timing Chef
      case '11': return 'EN'; // Dicefall Chronicles
      case '10': return 'EN'; // Endless War
      case '9': return 'KO/EN'; // 40th Century
      case '2': return 'EN'; // Galaxy Launch
      case '1': return 'KO'; // Gate of Hell
      case '14': return 'KO/EN'; // Fruit Frenzy
      default: return null;
    }
  };

  const languageBadge = getLanguageBadge();

  return (
    <Link to={`/play/${game.slug}`} className="game-card" onClick={handleClick}>
      <div className={`card-image${imageLoaded ? '' : ' img-loading'}`}>
        <img
          src={thumbnailUrl}
          alt={game.title}
          onLoad={() => setImageLoaded(true)}
        />
        {game.isOriginal && (
          <div className="original-badge">Original</div>
        )}
        {game.features?.includes('Web & Mobile Friendly') && (
          <div className="mobile-friendly-badge">📱 Mobile Ready</div>
        )}
        {languageBadge && (
          <div className="language-badge">{languageBadge}</div>
        )}
        {game.status && (
          <div className={`status-badge ${game.status === 'PLAYABLE' ? 'playable' : 'in-production'}`}>
            {game.status}
          </div>
        )}
        {isRecentlyPlayed && (
          <div className="continue-badge">▶ Continue</div>
        )}
        <div className="card-overlay">
          <button className="play-btn">{isRecentlyPlayed ? '▶ Resume' : 'Play Now'}</button>
        </div>
      </div>
      <div className="card-info">
        <div className="genres-list">
          {game.genres.map((genre, idx) => (
            <span
              key={idx}
              className={`genre-tag${onGenreClick ? ' clickable-genre' : ''}`}
              onClick={onGenreClick ? (e) => { e.preventDefault(); e.stopPropagation(); onGenreClick(genre); } : undefined}
            >{genre}</span>
          ))}
        </div>
        <h3>{game.title}</h3>
        <p>{game.description}</p>
      </div>
    </Link>
  );
};

export default GameCard;
