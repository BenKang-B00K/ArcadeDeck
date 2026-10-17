import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Flame, Gamepad2, Trophy, Share2, Medal, Globe } from 'lucide-react';
import Navbar from '../components/Navbar';
import { games } from '../data/games';
import type { Game } from '../data/games';
import { thumb360, SRCSET_SIZES } from '../utils/thumb';
import { useNickname } from '../hooks/useNickname';
import { getCurrentStreak, readStreak } from '../utils/streak';
import { XP_PER_LEVEL, deckStats, formatScore, nextTierAt, readCachedRank, readPB, tierLabel, tierMeta, tierOf, tierProgress } from '../utils/pb';
import { fetchMyRank, fetchTop, playerId, syncLeaderboard } from '../utils/leaderboard';
import type { LbRow } from '../utils/leaderboard';
import { useUiText, useLocale, getLocalizedString } from '../i18n';
import { genreName } from '../utils/genres';
import EmptyArt from '../components/EmptyArt';
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
  const [top, setTop] = useState<LbRow[] | null>(null);
  const [rank, setRank] = useState(readCachedRank);
  const me = useMemo(() => playerId(), []);
  const rankTitle = t(rank === null && deck.xp <= 0 ? 'homeRankUnranked' : 'homeRankTitle', 'Global rank');

  // Push our row (no-op when unchanged), then read the top table + our rank.
  useEffect(() => {
    let live = true;
    syncLeaderboard()
      .then(() => Promise.all([fetchTop(), fetchMyRank()]))
      .then(([rows, r]) => { if (live) { setTop(rows); setRank(r); } })
      .catch(() => { if (live) setTop([]); });
    return () => { live = false; };
  }, []);

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
  const recentGames = useMemo(() => readRecentlyPlayed().slice(0, 5), []);
  // Scores aren't comparable across games, so rank by tier, then how close to
  // the next one, then raw score as a last tiebreak.
  const bestGames = useMemo(
    () => games
      .map(g => ({ g, pb: readPB(g.id) }))
      .filter(x => x.pb > 0)
      .map(x => ({ ...x, tier: tierOf(x.g.id, x.pb), pct: tierProgress(x.g.id, x.pb) }))
      .sort((a, b) => b.tier - a.tier || b.pct - a.pct || b.pb - a.pb)
      .slice(0, 5)
      .map(x => x.g),
    [],
  );

  useEffect(() => {
    document.title = 'My Games | ArcadeDeck';
  }, []);

  const renderCard = (game: Game, rank?: number) => {
    const title = getLocalizedString(game, 'title', lang, overlay);
    const pb = readPB(game.id);
    const tier = tierOf(game.id, pb);
    const meta = tierMeta(tier);
    const next = pb > 0 ? nextTierAt(game.id, pb) : null;
    // Tier the next threshold actually lands on — capped games collapse
    // several tiers onto one score, so this can be well past tier + 1.
    const nextMeta = next !== null ? tierMeta(tierOf(game.id, next)) : null;
    const pct = tierProgress(game.id, pb);
    // Absolute path, or a locale-prefixed URL (/ja/my-games) resolves the
    // relative "images/…" against the prefix and 404s.
    const thumbUrl = `${import.meta.env.BASE_URL}${game.thumbnail}`;
    return (
      <Link key={game.id} to={`/play/${game.slug}`} className={`mini-game-card ${meta ? meta.cls : ''}`}>
        {rank !== undefined && <span className="mini-rank" aria-hidden="true">{rank}</span>}
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
          <div className="mini-meta">
            <span className="genre-tag">{genreName(t, game.genres[0])}</span>
            {game.badge === 'UPDATE' && <span className="game-badge badge-update">{game.badge}</span>}
            {pb > 0 && (
              <span className="mini-pb">
                {getLocalizedString(game, 'scoreLabel', lang, overlay) || t('pbScore', 'Score')} <strong>{formatScore(pb)}</strong>
              </span>
            )}
          </div>
          {next !== null && nextMeta && (
            <div className="mini-next">
              <span className="mini-next-bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
              <span className="mini-next-label">
                {t('pbToTier', '{n} to {tier}').replace('{n}', formatScore(next - pb)).replace('{tier}', tierLabel(nextMeta, t))}
              </span>
            </div>
          )}
        </div>
        {meta && (
          <span className={`mini-tier ${meta.cls}`}>
            <Trophy size={14} aria-hidden="true" />
            <span>{tierLabel(meta, t)}</span>
          </span>
        )}
        <span className="go-arrow" aria-hidden="true">→</span>
      </Link>
    );
  };

  return (
    <div className="my-games-page">
      <>
        <meta name="description" content="Your personal ArcadeDeck library: recently played games, liked titles, personal bests, mastery badges, Deck Level, and your Gamer ID, all in your browser." />
        <meta property="og:title" content="My Games | ArcadeDeck" />
        <meta property="og:url" content="https://arcadedeck.net/my-games" />
        <meta name="robots" content="noindex, follow" />
      </>
      <Navbar />
      <main className="container">
        <header className="my-games-header">
          <h1>{t('myGamesTitle', 'My')} <span>{t('myGamesSpan', 'Games')}</span></h1>
          <p className="subtitle">{t('myGamesSubtitle', 'Your library, saved right here in this browser')}</p>
        </header>

        <section className="deck-wall" aria-label={t('deckLevel', 'Deck Level')}>
          <div className="deck-wall-inner">
            <div className="nickname-badge">{t('myGamesOperator', 'Operator')}: {nickname}</div>
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
            <button type="button" className="deck-share" onClick={handleShareDeck}>
              <Share2 size={15} aria-hidden="true" /> {copied ? t('deckShareCopied', 'Copied!') : t('deckShare', 'Share my deck')}
            </button>
          </div>
        </section>

        <section className="lb-section" aria-label={t('lbTitle', 'Global Leaderboard')}>
          <h2 className="section-title">
            <Globe size={20} aria-hidden="true" /> {t('lbTitle', 'Global Leaderboard')}
            <span className="section-count" title={rankTitle}>{t('lbYourRank', 'You: #{n}').replace('{n}', String(rank ?? '???'))}</span>
          </h2>
          {top === null ? (
            <p className="lb-empty">{t('lbLoading', 'Loading…')}</p>
          ) : top.length === 0 ? (
            <p className="lb-empty">{t('lbEmpty', 'No one ranked yet — finish a run to claim the first spot.')}</p>
          ) : (
            <ol className="lb-list">
              {top.map((row, i) => (
                <li key={row.id} className={row.id === me ? 'lb-me' : ''}>
                  <span className="lb-rank">{i + 1}</span>
                  <span className="lb-nick">{row.nickname}{row.id === me && <small>{t('lbYou', 'you')}</small>}</span>
                  <span className="lb-level">{t('lbLevel', 'Lv {n}').replace('{n}', String(row.level))}</span>
                  <span className="lb-xp">{formatScore(row.xp)} XP</span>
                </li>
              ))}
              {!top.some(r => r.id === me) && (
                <li className="lb-gap" aria-hidden="true">…</li>
              )}
              {!top.some(r => r.id === me) && (
                <li className="lb-me" title={rankTitle}>
                  <span className="lb-rank">{rank ?? '???'}</span>
                  <span className="lb-nick">{nickname}<small>{t('lbYou', 'you')}</small></span>
                  <span className="lb-level">{t('lbLevel', 'Lv {n}').replace('{n}', String(deck.level))}</span>
                  <span className="lb-xp">{formatScore(deck.xp)} XP</span>
                </li>
              )}
            </ol>
          )}
        </section>

        <div className="my-games-cols">
          <section className="no-rank-section">
            <h2 className="section-title"><Medal size={20} aria-hidden="true" /> {t('myGamesBest', 'My Best Games')} <span className="section-count">{bestGames.length}</span></h2>
            {bestGames.length > 0 ? (
              <div className="my-games-list">{bestGames.map((g, i) => renderCard(g, i + 1))}</div>
            ) : (
              <div className="my-games-empty empty-state">
                <Trophy size={40} aria-hidden="true" />
                <h2>{t('myGamesBestEmptyTitle', 'No records yet')}</h2>
                <p>{t('myGamesBestEmptyDesc', 'Finish a run to set a personal best — it lands here with its Bronze / Silver / Gold tier.')}</p>
                <Link to="/" className="empty-cta-btn">{t('myGamesBrowse', 'Browse games')}</Link>
              </div>
            )}
          </section>

          <section className="no-rank-section">
            <h2 className="section-title"><Gamepad2 size={20} aria-hidden="true" /> {t('myGamesRecent', 'Recently Played')} <span className="section-count">{recentGames.length}</span></h2>
            {recentGames.length > 0 ? (
              <div className="my-games-list">{recentGames.map(g => renderCard(g))}</div>
            ) : (
              <div className="my-games-empty empty-state">
                <EmptyArt pose="sleep" />
                <h2>{t('myGamesEmptyTitle', 'Nothing played yet')}</h2>
                <p>{t('myGamesEmptyDesc', 'Pick a game from the catalogue — it will show up here next time you visit.')}</p>
                <Link to="/" className="empty-cta-btn">{t('myGamesBrowse', 'Browse games')}</Link>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default MyGames;
