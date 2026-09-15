import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Rocket, Flame, Gamepad2, Trophy, Share2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { games, deviceGames } from '../data/games';
import type { Game } from '../data/games';
import { thumb360, SRCSET_SIZES } from '../utils/thumb';
import { useNickname } from '../hooks/useNickname';
import { getCurrentStreak, readStreak } from '../utils/streak';
import { TIER_META, XP_PER_LEVEL, deckStats, formatScore, readPB, tierOf } from '../utils/pb';
import { useUiText, useLocale, getLocalizedString } from '../i18n';
import './MyGames.css';

// ponytail: everything here is localStorage-only — no network, no loading state.
function readRecentlyPlayed(): Game[] {
  try {
    const ids: string[] = JSON.parse(localStorage.getItem('recently_played') || '[]');
    return ids.map(id => games.find(g => g.id === id)).filter((g): g is Game => Boolean(g));
  } catch {
    return [];
  }
}

const MyGames = () => {
  const t = useUiText();
  const { lang, overlay } = useLocale();
  const nickname = useNickname();
  const [streak] = useState(() => ({ current: getCurrentStreak(), best: readStreak().best }));
  const deck = useMemo(() => deckStats(), []);
  const [copied, setCopied] = useState(false);

  // ponytail: native share sheet where it exists, clipboard everywhere else.
  const handleShareDeck = async () => {
    const text = t('deckShareText', 'ArcadeDeck Deck Level {lvl} — {played}/{total} games played, {mastered} mastered 🎮')
      .replace('{lvl}', String(deck.level))
      .replace('{played}', String(deck.played))
      .replace('{total}', String(deck.total))
      .replace('{mastered}', String(deck.mastered));
    const url = 'https://arcadedeck.net/';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'ArcadeDeck', text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // user dismissed the share sheet, or clipboard is blocked — nothing to do
    }
  };
  const recentGames = useMemo(() => readRecentlyPlayed(), []);
  const otherGames = useMemo(
    () => deviceGames.filter(g => !recentGames.some(r => r.id === g.id)),
    [recentGames],
  );

  useEffect(() => {
    document.title = 'My Games | ArcadeDeck';
  }, []);

  const renderCard = (game: Game) => {
    const title = getLocalizedString(game, 'title', lang, overlay);
    const pb = readPB(game.id);
    const meta = TIER_META[tierOf(game.id, pb)];
    // Absolute path, or a locale-prefixed URL (/ja/my-games) resolves the
    // relative "images/…" against the prefix and 404s.
    const thumbUrl = `${import.meta.env.BASE_URL}${game.thumbnail}`;
    return (
      <Link key={game.id} to={`/play/${game.slug}`} className="mini-game-card">
        <img
          src={thumbUrl}
          srcSet={`${import.meta.env.BASE_URL}${thumb360(game.thumbnail)} 360w, ${thumbUrl} 640w`}
          sizes={SRCSET_SIZES}
          alt={title}
          width="640"
          height="360"
          loading="lazy"
          decoding="async"
        />
        <div className="mini-info">
          <h4>{title}</h4>
          <span className="genre-tag">{game.genres[0]}</span>
          {pb > 0 && (
            <span className="mini-pb">
              {getLocalizedString(game, 'scoreLabel', lang, overlay) || t('pbScore', 'Score')} {formatScore(pb)}
            </span>
          )}
        </div>
        {meta && (
          <span className={`mini-tier ${meta.cls}`} title={t(meta.key, meta.en)}>
            <Trophy size={13} aria-hidden="true" />
          </span>
        )}
        <span className="go-arrow">→</span>
      </Link>
    );
  };

  return (
    <div className="my-games-page">
      <>
        <meta name="description" content="Your personal ArcadeDeck library — recently played games and your Gamer ID, stored in your browser." />
        <meta property="og:title" content="My Games | ArcadeDeck" />
        <meta property="og:url" content="https://arcadedeck.net/my-games" />
        <meta name="robots" content="noindex, follow" />
      </>
      <Navbar />
      <main className="container">
        <header className="my-games-header">
          <h1>{t('myGamesTitle', 'My')} <span>{t('myGamesSpan', 'Games')}</span></h1>
          <p className="subtitle">{t('myGamesSubtitle', 'Your library, saved right here in this browser')}</p>
          <div className="nickname-badge">{t('myGamesOperator', 'Operator')}: {nickname}</div>

          <div className="deck-panel">
            <div className="deck-level">
              <span className="deck-level-num">{deck.level}</span>
              <span className="deck-level-word">{t('deckLevel', 'Deck Level')}</span>
            </div>
            <div className="deck-bar" role="progressbar" aria-valuemin={0} aria-valuemax={XP_PER_LEVEL} aria-valuenow={deck.xpIntoLevel}>
              <span style={{ width: `${(deck.xpIntoLevel / XP_PER_LEVEL) * 100}%` }} />
            </div>
            <p className="deck-xp">{t('deckXp', '{a} / {b} XP to level {n}')
              .replace('{a}', String(deck.xpIntoLevel))
              .replace('{b}', String(XP_PER_LEVEL))
              .replace('{n}', String(deck.level + 1))}</p>
            <ul className="deck-stats">
              <li><strong>{deck.played}/{deck.total}</strong> {t('deckPlayed', 'played')}</li>
              <li><strong>{deck.mastered}</strong> {t('deckMastered', 'mastered')}</li>
              <li><strong>{deck.bestStreak}</strong> {t('deckBestStreak', 'best streak')}</li>
            </ul>
            <button type="button" className="deck-share" onClick={handleShareDeck}>
              <Share2 size={15} aria-hidden="true" /> {copied ? t('deckShareCopied', 'Copied!') : t('deckShare', 'Share my deck')}
            </button>
          </div>
          {streak.best > 0 && (
            <div className="ach-row" aria-label={t('myAchAriaLabel', 'Achievements')}>
              {streak.current >= 3 && (
                <span className="ach-badge tier-flame">
                  <Flame size={14} aria-hidden="true" />
                  <span className="ach-label">{t('myAchStreak', '{n}-Day Streak').replace('{n}', String(streak.current))}</span>
                </span>
              )}
              {streak.best > streak.current && streak.best >= 3 && (
                <span className="ach-badge tier-bronze" title={t('myAchBestStreak', 'Best Streak')}>
                  <Flame size={14} aria-hidden="true" />
                  <span className="ach-label">{t('myAchBestStreakLabel', 'Best: {n} days').replace('{n}', String(streak.best))}</span>
                </span>
              )}
            </div>
          )}
        </header>

        <div className="my-games-content">
          {recentGames.length > 0 ? (
            <section className="no-rank-section">
              <h2 className="section-title"><Gamepad2 size={20} aria-hidden="true" /> {t('myGamesRecent', 'Recently Played')}</h2>
              <div className="my-games-list">{recentGames.map(renderCard)}</div>
            </section>
          ) : (
            <div className="my-games-empty empty-state">
              <Rocket size={40} aria-hidden="true" />
              <h2>{t('myGamesEmptyTitle', 'Nothing played yet')}</h2>
              <p>{t('myGamesEmptyDesc', 'Pick a game below — it will show up here next time you visit.')}</p>
            </div>
          )}

          <section className="no-rank-section">
            <h2 className="section-title"><Rocket size={20} aria-hidden="true" /> {t('myGamesAll', 'More to Play')}</h2>
            <p className="section-desc">{t('myGamesAllDesc', 'The rest of the ArcadeDeck catalogue.')}</p>
            <div className="my-games-list">{otherGames.map(renderCard)}</div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default MyGames;
