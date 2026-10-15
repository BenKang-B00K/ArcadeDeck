import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { TOUCH_ONLY, type Game } from '../../data/games';
import { getLocalizedString, useUiText } from '../../i18n';
import { genreName } from '../../utils/genres';
import type { LocaleOverlay } from '../../i18n';

interface Props {
  game: Game;
  lang: string;
  overlay: LocaleOverlay | null;
  onPlay: () => void;
}

const GameHero: React.FC<Props> = ({ game, lang, overlay, onPlay }) => {
  const uiT = useUiText();
  const title = getLocalizedString(game, 'title', lang, overlay);
  const description = getLocalizedString(game, 'description', lang, overlay);
  const bannerSrc = game.pageBg ?? game.thumbnail;
  const bannerUrl = bannerSrc.startsWith('http')
    ? bannerSrc
    : `${import.meta.env.BASE_URL}${bannerSrc}`;

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
        <div className="hero-meta">
          {game.genres[0] && <span className="hero-genre">{genreName(uiT, game.genres[0])}</span>}
          {game.isOriginal && (
            <Link to="/about" className="hero-credit">{uiT('playerCreditOriginal', 'ArcadeDeck original')}</Link>
          )}
        </div>
        <h2 className="hero-title">{title}</h2>
        {/* Hero height is fixed (16/9), so the notice takes the tagline's slot. */}
        {TOUCH_ONLY && game.platform === 'PC'
          ? <p className="mobile-badge pc-only">{uiT('playerPcOnlyNotice', 'Needs a keyboard or mouse — play this one on a PC.')}</p>
          : TOUCH_ONLY && game.platform === 'PAD'
          ? <p className="mobile-badge pc-only">{uiT('playerPadNotice', 'No touch controls — connect a gamepad, or play on a PC.')}</p>
          : <p className="hero-tagline">{description}</p>}
        <button
          type="button"
          className="hero-play-btn"
          onClick={onPlay}
        >
          <Play size={22} aria-hidden="true" />
          {game.kind === 'app' ? uiT('playerOpenApp', 'Open App') : uiT('playerPlayNow', 'Play Now')}
        </button>
        {game.steamUrl && (
          <a
            className="hero-steam-link"
            href={game.steamUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {uiT('playerSteam', 'Full version on Steam')}
          </a>
        )}
      </div>
    </div>
  );
};

export default GameHero;
