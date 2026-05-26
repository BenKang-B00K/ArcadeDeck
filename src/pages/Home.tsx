import React, { useState, useMemo, lazy, Suspense, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { Search, X, Edit3, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import GameCard from '../components/GameCard';
import AdBanner from '../components/AdBanner';
import { games } from '../data/games';
import { compareLeaderboardEntries } from '../utils/leaderboardUtils';
import { useNotification } from '../hooks/useNotification';
import { BANNED_WORDS, RANDOM_ID_MIN, RANDOM_ID_MAX, AD_SLOTS, LEADERBOARD_FETCH_LIMIT } from '../constants/gameConstants';
import { useUiText, useLocale } from '../i18n';
import { SkeletonGrid } from '../components/Skeleton';
import HeroCarousel from '../components/home/HeroCarousel';
import StatsStrip from '../components/home/StatsStrip';
import ScrollProgress from '../components/home/ScrollProgress';
import BackToTop from '../components/home/BackToTop';
import { getLocalizedString } from '../i18n';
import { thumb360, SRCSET_SIZES } from '../utils/thumb';
import './Home.css';

const GlobalLeaderboard = lazy(() => import('../components/GlobalLeaderboard'));
const GameGrid = lazy(() => import('../components/GameGrid'));
const TrendingRail = lazy(() => import('../components/home/TrendingRail'));

const safeSetSession = (key: string, value: string): void => {
  try { sessionStorage.setItem(key, value); } catch { /* quota / private mode */ }
};

const Home: React.FC = () => {
  const t = useUiText();
  const { lang, overlay } = useLocale();
  const [nickname, setNickname] = React.useState<string>(() => {
    const saved = localStorage.getItem('player_nickname');
    if (saved) return saved;
    const randomId = Math.floor(RANDOM_ID_MIN + Math.random() * (RANDOM_ID_MAX - RANDOM_ID_MIN + 1));
    const initialName = `Player#${randomId}`;
    localStorage.setItem('player_nickname', initialName);
    return initialName;
  });
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempName, setTempName] = React.useState(nickname);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentlyPlayedIds, setRecentlyPlayedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('recently_played');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'recently_played') return;
      try {
        setRecentlyPlayedIds(e.newValue ? JSON.parse(e.newValue) : []);
      } catch {
        setRecentlyPlayedIds([]);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const { notification, showNotification } = useNotification(3000);
  const [userRanks, setUserRanks] = useState<Record<string, number>>({});

  // Fetch user's rank for each game they've played
  React.useEffect(() => {
    const fetchUserRanks = async () => {
      try {
        const [{ db }, { collection, query, where, getDocs }, { buildLeaderboardQuery }] = await Promise.all([
          import('../firebase'),
          import('firebase/firestore/lite'),
          import('../utils/leaderboardQuery'),
        ]);
        const userScoresSnap = await getDocs(
          query(collection(db, "leaderboards"), where("name", "==", nickname))
        );
        if (userScoresSnap.empty) return;

        const playedGameIds = new Set<string>();
        userScoresSnap.docs.forEach(doc => playedGameIds.add(doc.data().gameId));

        const ranks: Record<string, number> = {};
        const promises = [...playedGameIds].map(async (gameId) => {
          const game = games.find(g => g.id === gameId);
          if (!game) return;
          const subSortAsc = game.leaderboard?.subSortAsc ?? false;
          const lbSnap = await getDocs(
            buildLeaderboardQuery(db, gameId, { limit: LEADERBOARD_FETCH_LIMIT })
          );
          const docs = lbSnap.docs.map(d => d.data());
          docs.sort((a, b) => compareLeaderboardEntries(
            { score: a.score ?? 0, subScore: a.subScore ?? 0 },
            { score: b.score ?? 0, subScore: b.subScore ?? 0 },
            subSortAsc
          ));
          const idx = docs.findIndex(d => d.name === nickname);
          if (idx !== -1) ranks[gameId] = idx + 1;
        });
        await Promise.all(promises);
        setUserRanks(ranks);
      } catch (err) {
        console.error("Error fetching user ranks:", err);
      }
    };
    // Defer to idle so firebase chunk doesn't compete with FCP/LCP.
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    if (ric) ric(() => fetchUserRanks());
    else setTimeout(fetchUserRanks, 1500);
  }, [nickname]);

  // Extract all unique genres from data (memoized — games array is static)
  const allGenres = useMemo(() => ['All', ...new Set(games.flatMap(g => g.genres))], []);

  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = { All: games.length };
    games.forEach(g => g.genres.forEach(genre => { counts[genre] = (counts[genre] || 0) + 1; }));
    return counts;
  }, []);

  // Featured: prefer POPULAR + UPDATE badged, top up to 5 with newest by id.
  const featuredGames = useMemo(() => {
    const badged = games.filter(g => g.badge === 'POPULAR' || g.badge === 'UPDATE' || g.badge === 'NEW');
    const byNewest = [...games].sort((a, b) => parseInt(b.id) - parseInt(a.id));
    const seen = new Set<string>();
    const picks = [];
    for (const g of [...badged, ...byNewest]) {
      if (seen.has(g.id)) continue;
      seen.add(g.id);
      picks.push(g);
      if (picks.length >= 5) break;
    }
    return picks;
  }, []);

  // Trending: PLAYABLE games with leaderboards, sorted by lastUpdated desc, top 10.
  const trendingGames = useMemo(() => {
    return games
      .filter(g => g.leaderboard)
      .sort((a, b) => (a.lastUpdated || '').localeCompare(b.lastUpdated || '')) // asc
      .reverse() // desc
      .slice(0, 10);
  }, []);

  const totalOriginals = useMemo(() => games.filter(g => g.isOriginal).length, []);
  const totalPlays = useMemo(() => recentlyPlayedIds.length, [recentlyPlayedIds]);

  // Scroll-reveal: observe any element with `.reveal-section` and add `.in-view`.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll('.reveal-section').forEach(el => el.classList.add('in-view'));
      return;
    }
    const io = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    );
    document.querySelectorAll('.reveal-section').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [selectedGenre, searchQuery, recentlyPlayedIds.length]);

  // Sticky filter bar: toggle `.is-stuck` when sentinel (placed right before bar)
  // leaves the viewport (scrolled past the navbar offset).
  const stickySentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = stickySentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const bar = document.querySelector('.genre-filters-container');
        if (!bar) return;
        if (entry.intersectionRatio === 0) bar.classList.add('is-stuck');
        else bar.classList.remove('is-stuck');
      },
      { threshold: [0, 1], rootMargin: '-70px 0px 0px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalName = tempName.trim();
    if (!finalName) return;

    // Check for inappropriate words
    const lowerCaseName = finalName.toLowerCase();
    const hasBannedWord = BANNED_WORDS.some(word => lowerCaseName.includes(word.toLowerCase()));

    if (hasBannedWord) {
      showNotification("Inappropriate language detected. Please choose a different nickname.", 'error');
      return;
    }

    // Check for nickname duplication
    try {
      const [{ db }, { collection, query, where, getDocs, limit }] = await Promise.all([
        import('../firebase'),
        import('firebase/firestore/lite'),
      ]);
      const q = query(collection(db, "leaderboards"), where("name", "==", finalName), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty && finalName !== nickname) {
        const uniqueId = Math.floor(RANDOM_ID_MIN + Math.random() * (RANDOM_ID_MAX - RANDOM_ID_MIN + 1));
        finalName = `${finalName}#${uniqueId}`;
        showNotification(`Name taken — assigned unique tag: ${finalName}`, 'info');
      }
    } catch (error) {
      console.error("Error checking nickname:", error);
      showNotification("Could not verify name. Saving anyway.", 'info');
    }

    setNickname(finalName);
    localStorage.setItem('player_nickname', finalName);
    setIsEditing(false);
  };

  const recentlyPlayedGames = games.filter(g => recentlyPlayedIds.includes(g.id))
    .sort((a, b) => recentlyPlayedIds.indexOf(a.id) - recentlyPlayedIds.indexOf(b.id));

  const recentlyUpdatedGames = useMemo(
    () =>
      games
        .filter((g): g is typeof g & { lastUpdated: string } => Boolean(g.lastUpdated))
        .sort((a, b) => (a.lastUpdated < b.lastUpdated ? 1 : -1))
        .slice(0, 8),
    [],
  );

  const formatUpdateDate = (iso: string) =>
    new Date(iso + 'T00:00:00Z').toLocaleDateString(lang === 'en' ? 'en-US' : lang, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });

  React.useEffect(() => {
    document.title = 'ArcadeDeck | Play the Best Online Browser Games';
  }, []);

  return (
    <div className="home-page">
      <>
        <meta name="description" content="Discover and play the highest quality free online browser games on ArcadeDeck. Join our community, compete on global leaderboards, and find your next favorite game!" />
        <meta name="keywords" content="free browser games, online games, play free games, arcadedeck, action games, rpg games, idle games, browser arcade" />
        <link rel="canonical" href="https://arcadedeck.net/" />

        {/* Open Graph & Twitter Card */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="ArcadeDeck | The Ultimate Free Browser Games Platform" />
        <meta property="og:description" content="Play the best free online browser games on ArcadeDeck. No downloads required. Join now and start playing!" />
        <meta property="og:image" content="https://arcadedeck.net/images/arcadedeck-banner.webp" />
        <meta property="og:url" content="https://arcadedeck.net/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ArcadeDeck | The Ultimate Free Browser Games Platform" />
        <meta name="twitter:description" content="Play the best free online browser games on ArcadeDeck. No downloads required. Join now and start playing!" />
        <meta name="twitter:image" content="https://arcadedeck.net/images/arcadedeck-banner.webp" />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "ArcadeDeck",
            "url": "https://arcadedeck.net/",
            "description": "The Ultimate Free Browser Games Platform",
            "inLanguage": ["en", "ko"],
            "publisher": {
              "@type": "Organization",
              "name": "ArcadeDeck",
              "url": "https://arcadedeck.net"
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://arcadedeck.net/?search={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </>

      {notification && (
        <div className={`notification-toast ${notification.type} animate-in`}>
          <span className="notification-message">{notification.message}</span>
        </div>
      )}

      <ScrollProgress />
      <Navbar />

      <main>
        {/* ── Hero Carousel: featured games ── */}
        <HeroCarousel slides={featuredGames} />

        {/* ── Stats Strip ── */}
        <StatsStrip
          totalGames={games.length}
          totalGenres={allGenres.length - 1}
          totalOriginals={totalOriginals}
          totalPlays={totalPlays}
        />

        {/* ── Gamer ID Card ── */}
        <section className="gamer-id-section reveal-section">
          <div className="container">
            <div className="gamer-id-wrapper">
              {isEditing ? (
                <div className="hero-gamer-display editing">
                  <form onSubmit={handleSaveName} className="hero-gamer-form">
                    <div className="hero-gamer-row">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        maxLength={12}
                        placeholder={t('homeNicknamePlaceholder', 'Enter nickname...')}
                        aria-label={t('homeNicknameAriaLabel', 'Game nickname')}
                        autoFocus
                      />
                    </div>
                    <div className="hero-gamer-row">
                      <button type="submit">{t('homeNicknameSave', 'Save')}</button>
                      <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>{t('homeNicknameCancel', 'Cancel')}</button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="hero-gamer-spotlight">
                  <span className="neon-arrow neon-arrow-left" aria-hidden="true">&#9654;</span>
                  <div
                    className="hero-gamer-display"
                    role="button"
                    tabIndex={0}
                    onClick={() => { setTempName(''); setIsEditing(true); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTempName(''); setIsEditing(true); } }}
                    aria-label={t('homeNicknameChangeAria', 'Click to change nickname')}
                  >
                    <div className="hero-gamer-row">
                      <span className="hero-gamer-label">{t('homeNicknameLabel', 'Game Nickname')}</span>
                    </div>
                    <div className="hero-gamer-row">
                      <strong className="hero-gamer-name">{nickname}</strong>
                      <Edit3 size={14} className="hero-gamer-edit-icon" aria-hidden="true" />
                    </div>
                  </div>
                  <span className="neon-arrow neon-arrow-right" aria-hidden="true">&#9664;</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Compact Global Ranking Bar ── */}
        <div className="container reveal-section">
          <Suspense fallback={<div style={{ minHeight: 88, margin: '16px 0' }} />}>
            <GlobalLeaderboard variant="compact" />
          </Suspense>
        </div>

        {/* ── Trending Rail (auto-scrolling marquee) ── */}
        <Suspense fallback={<div style={{ minHeight: 240 }} />}>
          <TrendingRail games={trendingGames} />
        </Suspense>

        <div className="neon-scanline reveal-section" aria-hidden="true" />

        {/* ── Search + Genre filters (sticky) ── */}
        <div id="games-grid" className="games-grid-main-wrapper">
          <div ref={stickySentinelRef} className="sticky-sentinel" aria-hidden="true" />
          <div className="container games-grid-section">
            <div className="genre-filters-container">
              <div className="genre-search-row">
                <div className="inline-search-wrapper">
                  <Search size={15} className="inline-search-icon" aria-hidden="true" />
                  <input
                    type="search"
                    className="inline-search-input"
                    placeholder={t('homeSearchPlaceholder', 'Search...')}
                    aria-label={t('homeSearchAriaLabel', 'Search games')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="inline-search-clear" onClick={() => setSearchQuery('')} aria-label={t('homeSearchClearAria', 'Clear search')}><X size={14} aria-hidden="true" /></button>
                  )}
                </div>
                <div className="genre-filters">
                  {allGenres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => {
                        setSelectedGenre(genre);
                        safeSetSession('selected_genre', genre);
                      }}
                      className={`genre-btn ${selectedGenre === genre ? 'active' : ''}`}
                    >
                      <span className="btn-text">{genre}</span>
                      <span className="genre-count">{genreCounts[genre] || 0}</span>
                      {selectedGenre === genre && <span className="active-dot"></span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Genre Quick Results (mini cards below filter bar) ── */}
          {selectedGenre !== 'All' && (
            <div className="container">
              <div className="genre-quick-results">
                {games
                  .filter(g => g.genres.includes(selectedGenre))
                  .sort((a, b) => parseInt(b.id) - parseInt(a.id))
                  .map(g => {
                    const title = getLocalizedString(g, 'title', lang, overlay);
                    return (
                      <Link key={`quick-${g.id}`} to={`/play/${g.slug}`} className="quick-card">
                        <img
                          src={`${import.meta.env.BASE_URL}${g.thumbnail}`}
                          srcSet={`${import.meta.env.BASE_URL}${thumb360(g.thumbnail)} 360w, ${import.meta.env.BASE_URL}${g.thumbnail} 640w`}
                          sizes={SRCSET_SIZES}
                          alt={title}
                          width="640"
                          height="360"
                          loading="lazy"
                          decoding="async"
                        />
                        <span className="quick-card-title">{title}</span>
                      </Link>
                    );
                  })
                }
              </div>
            </div>
          )}

          {/* ── Recently Played (only for returning users) ── */}
          {recentlyPlayedGames.length > 0 && !searchQuery && selectedGenre === 'All' && (
            <div className="container">
              <section className="recently-played-section neon-panel reveal-section">
                <h2 className="section-greeting">
                  <span className="section-greeting-text">{t('homeRecentGreeting', 'Jump back in,')}</span>
                  {' '}
                  <strong className="section-greeting-name">{nickname}</strong>
                  <ArrowRight size={20} className="section-greeting-arrow" aria-hidden="true" />
                </h2>
                <div className="game-grid small-grid small-grid-scroll">
                  {recentlyPlayedGames.map((game, i) => (
                    <div key={`recent-${game.id}`} className="reveal-stagger" style={{ '--i': i } as React.CSSProperties}>
                      <GameCard
                        game={game}
                        isRecentlyPlayed
                        maxTags={2}
                        recentIndex={i}
                        onProductionClick={() => showNotification(t('homeComingSoonNotification', 'This game is coming soon!'), 'info')}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ── Recently Updated ── */}
          {recentlyUpdatedGames.length > 0 && !searchQuery && selectedGenre === 'All' && (
            <div className="container">
              <section className="recently-updated-section neon-panel reveal-section">
                <h2 className="section-title-small" style={{ textAlign: 'left', marginBottom: '20px' }}>
                  <span className="live-dot" aria-hidden="true"></span>
                  {t('homeUpdatedTitle', 'Recently')} <span>{t('homeUpdatedSpan', 'Updated')}</span>
                </h2>
                <div className="game-grid small-grid">
                  {recentlyUpdatedGames.map((game, i) => (
                    <div key={`updated-${game.id}`} className="updated-card-wrapper reveal-stagger" style={{ '--i': i } as React.CSSProperties}>
                      <div className="updated-date-pill">
                        <Sparkles size={12} aria-hidden="true" />
                        <span>{t('homeUpdatedOn', 'Updated {date}').replace('{date}', formatUpdateDate(game.lastUpdated))}</span>
                      </div>
                      <GameCard
                        game={game}
                        maxTags={2}
                        onProductionClick={() => showNotification(t('homeComingSoonNotification', 'This game is coming soon!'), 'info')}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          <div className="container">
            <div className="ad-banner-wrapper">
              <AdBanner slot={AD_SLOTS.HOME_TOP} />
            </div>
          </div>

          {/* ── Main Game Grid ── */}
          <div className="container grid-content-wrapper">
            <Suspense fallback={<SkeletonGrid count={8} />}>
              <GameGrid
                selectedGenre={selectedGenre}
                searchQuery={searchQuery}
                userRanks={userRanks}
                onProductionClick={() => showNotification(t('homeComingSoonNotification', 'This game is coming soon!'), 'info')}
                onGenreClick={(genre) => {
                  setSelectedGenre(genre);
                  safeSetSession('selected_genre', genre);
                  document.getElementById('games-grid')?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </Suspense>
          </div>
        </div>

        {/* ── Bottom Ad ── */}
        <section className="bottom-ad-section">
          <div className="container">
            <AdBanner slot={AD_SLOTS.HOME_BOTTOM} style={{ margin: '0' }} />
          </div>
        </section>
      </main>

      <BackToTop />

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
