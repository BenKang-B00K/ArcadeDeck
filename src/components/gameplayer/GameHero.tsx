import React from 'react';
import { Play } from 'lucide-react';
import type { Game, LeaderboardEntry } from '../../data/games';
import { getLocalizedString, useUiText } from '../../i18n';
import type { LocaleOverlay } from '../../i18n';
import { formatScore } from '../../utils/leaderboardUtils';

interface Props {
  game: Game;
  lang: string;
  overlay: LocaleOverlay | null;
  topEntry: LeaderboardEntry | null;
  onPlay: () => void;
}

const GameHero: React.FC<Props> = ({ game, lang, overlay, topEntry, onPlay }) => {
  const uiT = useUiText();
  const title = getLocalizedString(game, 'title', lang, overlay);
  const description = getLocalizedString(game, 'description', lang, overlay);
  const bannerSrc = game.pageBg ?? game.thumbnail;
  const bannerUrl = bannerSrc.startsWith('http')
    ? bannerSrc
    : `${import.meta.env.BASE_URL}${bannerSrc}`;
  const showTopScore = !!game.leaderboard && !!topEntry;
  const primaryUnit = game.leaderboard?.primaryUnit ?? '';

  return (
    // Hero forces 16/9 cinematic banner regardless of game.aspectRatio.
    // Post-click iframe reverts to native aspect via getWrapperStyle().
    <div className="game-hero">
      <img
        className="hero-banner"
        src={bannerUrl}
        alt=""
        fetchPriority="high"
        decoding="async"
        loading="eager"
      />
      <div className="hero-overlay" />
      <div className="hero-content">
        {game.genres[0] && <span className="hero-genre">{game.genres[0]}</span>}
        <h2 className="hero-title">{title}</h2>
        <p className="hero-tagline">{description}</p>
        <button
          type="button"
          className="hero-play-btn"
          onClick={onPlay}
        >
          <Play size={22} aria-hidden="true" />
          {uiT('playerPlayNow', 'Play Now')}
        </button>
        {showTopScore && topEntry && (
          <div className="hero-top-score">
            <span aria-hidden="true">🏆</span> #1 {topEntry.name} — {formatScore(topEntry.score, primaryUnit)}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameHero;
