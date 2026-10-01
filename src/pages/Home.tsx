import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Shuffle, Edit3, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import GameCard from '../components/GameCard';
import GameGrid from '../components/GameGrid';
import HeroBackground from '../components/HeroBackground';
import AdBanner from '../components/AdBanner';
import { games, deviceGames, GENRE_HUE, type Game } from '../data/games';
import { useToast } from '../contexts/useToast';
import { BANNED_WORDS, AD_SLOTS } from '../constants/gameConstants';
import { useUiText, useLocale, getLocalizedString } from '../i18n';
import { genreName } from '../utils/genres';
import { readNickname, saveNickname } from '../hooks/useNickname';
import { deckStats, readCachedRank } from '../utils/pb';
import './Home.css';

const ALL_GENRES = ['All', ...new Set(deviceGames.flatMap(g => g.genres))];
const PLAYABLE = deviceGames.filter(g => g.status !== 'IN PRODUCTION' && g.gameUrl);
const FEATURED = deviceGames.filter(g => g.featured);
const COOP_GENRE = 'Local Co-op';
const COOP = deviceGames.filter(g => g.genres.includes(COOP_GENRE)).sort((a, b) => parseInt(b.id) - parseInt(a.id));

// Hero banner rotates one step per page load (public/images/banner/banner-01..16).
// Module scope so in-app navigation back to Home keeps the same art.
const BANNER_COUNT = 16;
const BANNER = (() => {
  let n = Math.floor(Math.random() * BANNER_COUNT);
  try {
    const prev = Number(localStorage.getItem('heroBanner'));
    if (Number.isInteger(prev) && prev >= 0) n = (prev + 1) % BANNER_COUNT;
    localStorage.setItem('heroBanner', String(n));
  } catch { /* storage blocked: random pick */ }
  const base = `${import.meta.env.BASE_URL}images/banner/banner-${String(n + 1).padStart(2, '0')}`;
  return { '--hero-banner': `url(${base}.webp)`, '--hero-banner-sm': `url(${base}-768.webp)` } as React.CSSProperties;
})();

// Full-width spotlight for the Featured Game section. Thumbnail is 640w, so the
// image column caps at ~half the container; description fills the rest.
const FeaturedCard: React.FC<{ game: Game }> = ({ game }) => {
  const t = useUiText();
  const { lang, overlay } = useLocale();
  const title = getLocalizedString(game, 'title', lang, overlay);
  const description = getLocalizedString(game, 'description', lang, overlay);
  return (
    <Link to={`/play/${game.slug}`} className="featured-card">
      <div className="featured-card-image">
        <img src={`${import.meta.env.BASE_URL}${game.thumbnail}`} alt={title} width="640" height="360" decoding="async" fetchPriority="high" />
      </div>
      <div className="featured-card-body">
        <div className="card-tags-row">
          {game.genres.map((genre, i) => (
            <span key={genre} className={`genre-tag ${i === 0 ? 'main' : 'sub'}`} style={{ '--h': GENRE_HUE[genre] ?? 260 } as React.CSSProperties}>{genreName(t, genre)}</span>
          ))}
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
        <span className="play-btn">{game.kind === 'app' ? t('gameCardOpenApp', 'Open') : t('gameCardPlayNow', 'Play Now')}</span>
      </div>
    </Link>
  );
};

const readRecent = (): string[] => {
  try { return JSON.parse(localStorage.getItem('recently_played') || '[]'); } catch { return []; }
};

const Home: React.FC = () => {
  const t = useUiText();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [genre, setGenre] = useState('All');
  const [nickname, setNickname] = useState(readNickname);
  const [editing, setEditing] = useState(false);
  const [rank, setRank] = useState(readCachedRank);
  const [unranked] = useState(() => deckStats().xp <= 0);

  // Global rank: cached value paints instantly, then one aggregation read
  // refreshes it. Dynamic import keeps Firestore out of the Home chunk, and
  // players with no XP yet skip the fetch entirely.
  useEffect(() => {
    if (deckStats().xp <= 0) return;
    let live = true;
    void import('../utils/leaderboard')
      .then(m => m.syncLeaderboard().then(() => m.fetchMyRank()))
      .then(r => { if (live) setRank(r); })
      .catch(() => { /* offline — keep cached rank */ });
    return () => { live = false; };
  }, [nickname]);

  const recent = useMemo(
    // Stored newest-first (GamePlayer prepends on play); show the 4 latest.
    () => readRecent().slice(0, 4).flatMap(id => { const g = games.find(x => x.id === id); return g ? [g] : []; }),
    [],
  );

  // Same key the prerendered shell uses, so /ja and /ko keep their localized title after hydration.
  const homeTitle = t('seoHomeTitle', 'ArcadeDeck | The Ultimate Free Browser Games Platform');
  useEffect(() => { document.title = homeTitle; }, [homeTitle]);

  const comingSoon = () => showToast(t('homeComingSoonNotification', 'This game is coming soon!'), 'info', 3000);

  const surprise = () => {
    const g = PLAYABLE[Math.floor(Math.random() * PLAYABLE.length)];
    if (g) navigate(`/play/${g.slug}`);
  };

  const pickGenre = (g: string) => {
    setGenre(g);
    document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' });
  };

  const saveNick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get('nick') ?? '').trim();
    if (!name) return;
    const lower = name.toLowerCase();
    if (BANNED_WORDS.some(w => lower.includes(w.toLowerCase()))) {
      showToast(t('homeNicknameBanned', 'Inappropriate language detected. Please choose a different nickname.'), 'error', 3000);
      return;
    }
    if (!saveNickname(name)) {
      showToast(t('homeNicknameStorageError', 'Could not save your nickname — your browser is blocking site storage.'), 'error', 4000);
      return;
    }
    setNickname(name);
    setEditing(false);
    showToast(t('homeNicknameSaved', 'Nickname saved. We will remember it next time you visit.'), 'success', 3000);
  };

  const unfiltered = genre === 'All';
  const showRecent = recent.length > 0 && unfiltered;
  const showFeatured = FEATURED.length > 0 && unfiltered;
  const showCoop = COOP.length > 0 && unfiltered;

  // Head meta / JSON-LD are baked by scripts/prerender-pages.js. The static
  // shell in index.html mirrors this <header> so the LCP element is stable.
  return (
    <div className="home-page">
      <HeroBackground />
      <Navbar />

      <main>
        <header className="home-hero" style={BANNER}>
          <div className="container home-hero-content">
            <h1>{t('homeHeroTitle', 'Welcome to')} <span>ArcadeDeck</span></h1>

            <div className="home-hero-nick">
              {editing ? (
                <form className="home-hero-nick-card" onSubmit={saveNick}>
                  <span className="home-hero-nick-avatar" aria-hidden="true">{nickname.charAt(0).toUpperCase()}</span>
                  <input name="nick" defaultValue={nickname} maxLength={12} autoFocus placeholder={t('homeNicknamePlaceholder', 'Enter nickname...')} aria-label={t('homeNicknameAriaLabel', 'Game nickname')} />
                  <button type="submit" className="home-hero-nick-save" aria-label={t('homeNicknameSave', 'Save')}><Check size={16} aria-hidden="true" /></button>
                  <button type="button" className="home-hero-nick-cancel" onClick={() => setEditing(false)} aria-label={t('homeNicknameCancel', 'Cancel')}><X size={16} aria-hidden="true" /></button>
                </form>
              ) : (
                <button type="button" className="home-hero-nick-card home-hero-nick-btn" onClick={() => setEditing(true)} title={t('homeNicknameChangeAria', 'Click to change nickname')}>
                  <span className="home-hero-nick-avatar" aria-hidden="true">{nickname.charAt(0).toUpperCase()}</span>
                  <span className="home-hero-nick-text">
                    <small>{t('homeNickPrefix', 'Playing as')}</small>
                    <strong>
                      {nickname}
                      <span className="home-hero-rank" title={t(unranked ? 'homeRankUnranked' : 'homeRankTitle', 'Global rank')}>#{rank ?? '???'}</span>
                    </strong>
                  </span>
                  <Edit3 size={14} aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="home-hero-actions">
              <button type="button" className="home-hero-random" onClick={surprise}>
                <Shuffle size={16} aria-hidden="true" />
                {t('homeRandomGame', 'Surprise me')}
              </button>
            </div>
          </div>
        </header>

        <div id="games">
          <div className="container">
            <nav className="genre-filters" aria-label={t('homeGenresAria', 'Game genres')}>
              {ALL_GENRES.map(g => (
                <button key={g} type="button" className={g === genre ? 'active' : ''} aria-pressed={g === genre} style={{ '--h': GENRE_HUE[g] ?? 260 } as React.CSSProperties} onClick={() => setGenre(g)}>
                  {genreName(t, g)}
                </button>
              ))}
            </nav>

            {showFeatured && (
              <section className="recent-section">
                <h2 className="section-title">{t('homeFeaturedTitle', 'Featured')} {t('homeFeaturedSpan', 'Game')}</h2>
                {FEATURED.map(g => <FeaturedCard key={g.id} game={g} />)}
              </section>
            )}

            {showRecent && (
              <section className="recent-section">
                <h2 className="section-title">{t('homeRecentTitle', 'Jump')} {t('homeRecentSpan', 'Back In')}</h2>
                <div className="game-grid">
                  {recent.map(g => <GameCard key={g.id} game={g} onProductionClick={comingSoon} />)}
                </div>
              </section>
            )}

            {showCoop && (
              <section className="recent-section">
                <h2 className="section-title">
                  {t('homeCoopTitle', 'Local Co-op')} {t('gameGridGames', 'Games')}
                  <span className="section-count">{COOP.length}</span>
                </h2>
                <div className="game-grid">
                  {COOP.map(g => <GameCard key={g.id} game={g} onProductionClick={comingSoon} onGenreClick={pickGenre} />)}
                </div>
              </section>
            )}
          </div>

          <GameGrid selectedGenre={genre} excludeGenre={showCoop ? COOP_GENRE : undefined} onProductionClick={comingSoon} onGenreClick={pickGenre} />

          <div className="container">
            <AdBanner slot={AD_SLOTS.HOME_BOTTOM} />
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container footer-container">
          <p>&copy; 2026 ArcadeDeck. {t('footerAllRights', 'All rights reserved.')}</p>
          <div className="footer-links">
            <Link to="/about" className="footer-link">{t('footerAbout', 'About Us')}</Link>
            <Link to="/privacy" className="footer-link">{t('footerPrivacy', 'Privacy Policy')}</Link>
            <Link to="/contact" className="footer-link">{t('footerContact', 'Contact')}</Link>
            <a href="https://ko-fi.com/developer_benjamink" target="_blank" rel="noopener noreferrer" className="footer-link footer-link-support">{t('footerSupport', 'Support')} ♥</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
