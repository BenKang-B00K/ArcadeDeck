import React, { useState, useMemo, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, X, Edit3 } from 'lucide-react';
import Navbar from '../components/Navbar';
import GameGrid from '../components/GameGrid';
import GameCard from '../components/GameCard';
import AdBanner from '../components/AdBanner';
import { games } from '../data/games';
import { compareLeaderboardEntries } from '../utils/leaderboardUtils';
import { BANNED_WORDS, RANDOM_ID_MIN, RANDOM_ID_MAX, AD_SLOTS, LEADERBOARD_FETCH_LIMIT } from '../constants/gameConstants';
import './Home.css';

const GlobalLeaderboard = lazy(() => import('../components/GlobalLeaderboard'));

const Home: React.FC = () => {
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
  const [recentlyPlayedIds, setRecentlyPlayedIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [userRanks, setUserRanks] = useState<Record<string, number>>({});

  React.useEffect(() => {
    const saved = localStorage.getItem('recently_played');
    const recentlyPlayed = saved ? JSON.parse(saved) : [];
    setRecentlyPlayedIds(recentlyPlayed);
  }, []);

  // Fetch user's rank for each game they've played
  React.useEffect(() => {
    const fetchUserRanks = async () => {
      try {
        const [{ db }, { collection, query, where, getDocs, orderBy, limit }] = await Promise.all([
          import('../firebase'),
          import('firebase/firestore/lite'),
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
            query(collection(db, "leaderboards"), where("gameId", "==", gameId), orderBy("score", "desc"), limit(LEADERBOARD_FETCH_LIMIT))
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

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Extract all unique genres from data (memoized — games array is static)
  const allGenres = useMemo(() => ['All', ...new Set(games.flatMap(g => g.genres))], []);

  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = { All: games.length };
    games.forEach(g => g.genres.forEach(genre => { counts[genre] = (counts[genre] || 0) + 1; }));
    return counts;
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
        import('firebase/firestore'),
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

  return (
    <div className="home-page">
      <Helmet>
        <title>ArcadeDeck | Play the Best Online Browser Games</title>
        <meta name="description" content="Discover and play the highest quality free online browser games on ArcadeDeck. Join our community, compete on global leaderboards, and find your next favorite game!" />
        <meta name="keywords" content="free browser games, online games, play free games, arcadedeck, action games, rpg games, idle games, browser arcade" />
        <link rel="canonical" href="https://arcadedeck.net/" />

        {/* Open Graph & Twitter Card */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="ArcadeDeck | The Ultimate Free Browser Games Platform" />
        <meta property="og:description" content="Play the best free online browser games on ArcadeDeck. No downloads required. Join now and start playing!" />
        <meta property="og:image" content="https://arcadedeck.net/images/ArcadeDeck%20Banner.webp" />
        <meta property="og:url" content="https://arcadedeck.net/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ArcadeDeck | The Ultimate Free Browser Games Platform" />
        <meta name="twitter:description" content="Play the best free online browser games on ArcadeDeck. No downloads required. Join now and start playing!" />
        <meta name="twitter:image" content="https://arcadedeck.net/images/ArcadeDeck%20Banner.webp" />

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
      </Helmet>

      {notification && (
        <div className={`notification-toast ${notification.type} animate-in`}>
          <span className="notification-message">{notification.message}</span>
        </div>
      )}

      <Navbar />

      <main>
      {/* ── Hero: welcome + Gamer ID ── */}
      <header className="hero">
        <div className="container hero-content">
          <h1>Welcome to <span data-text="ArcadeDeck">ArcadeDeck</span></h1>
          <p>Dozens of handcrafted browser games. Pick one, jump in, and see how far you can go.</p>

          {isEditing ? (
            <div className="hero-gamer-display editing">
              <form onSubmit={handleSaveName} className="hero-gamer-form">
                <div className="hero-gamer-row">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    maxLength={12}
                    placeholder="Enter nickname..."
                    aria-label="Game nickname"
                    autoFocus
                  />
                </div>
                <div className="hero-gamer-row">
                  <button type="submit">Save</button>
                  <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
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
                aria-label="Click to change nickname"
              >
                <div className="hero-gamer-row">
                  <span className="hero-gamer-label">Game Nickname</span>
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
      </header>

      {/* ── Compact Global Ranking Bar ── */}
      <div className="container">
        <Suspense fallback={<div style={{ minHeight: 64 }} />}>
          <GlobalLeaderboard variant="compact" />
        </Suspense>
      </div>

      {/* ── Search + Genre filters (sticky) ── */}
      <div id="games-grid" className="games-grid-main-wrapper">
        <div className="container games-grid-section">
          <div className="genre-filters-container">
            <div className="genre-search-row">
              <div className="inline-search-wrapper">
                <Search size={15} className="inline-search-icon" aria-hidden="true" />
                <input
                  type="search"
                  className="inline-search-input"
                  placeholder="Search..."
                  aria-label="Search games"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="inline-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search"><X size={14} aria-hidden="true" /></button>
                )}
              </div>
              <div className="genre-filters">
                {allGenres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => {
                      setSelectedGenre(genre);
                      sessionStorage.setItem('selected_genre', genre);
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
                .map(g => (
                  <Link key={`quick-${g.id}`} to={`/play/${g.slug}`} className="quick-card">
                    <img src={`${import.meta.env.BASE_URL}${g.thumbnail}`} alt={g.title} width="640" height="360" loading="lazy" decoding="async" />
                    <span className="quick-card-title">{g.title}</span>
                  </Link>
                ))
              }
            </div>
          </div>
        )}

        {/* ── Recently Played (only for returning users) ── */}
        {recentlyPlayedGames.length > 0 && !searchQuery && selectedGenre === 'All' && (
          <div className="container">
            <section className="recently-played-section">
              <h2 className="section-title-small" style={{ textAlign: 'left', marginBottom: '20px' }}>Jump <span>Back In</span></h2>
              <div className="game-grid small-grid">
                {recentlyPlayedGames.map(game => (
                  <GameCard
                    key={`recent-${game.id}`}
                    game={game}
                    isRecentlyPlayed
                    maxTags={2}
                    onProductionClick={() => showNotification('This game is coming soon!', 'info')}
                  />
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
          <GameGrid
            selectedGenre={selectedGenre}
            searchQuery={searchQuery}
            userRanks={userRanks}
            onProductionClick={() => showNotification('This game is coming soon!', 'info')}
            onGenreClick={(genre) => {
              setSelectedGenre(genre);
              sessionStorage.setItem('selected_genre', genre);
              document.getElementById('games-grid')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
      </div>

      {/* ── Bottom Ad ── */}
      <section className="bottom-ad-section">
        <div className="container">
          <AdBanner slot={AD_SLOTS.HOME_BOTTOM} style={{ margin: '0' }} />
        </div>
      </section>
      </main>

      <footer className="footer">
        <div className="container footer-container">
          <p>&copy; 2026 ArcadeDeck. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/about" className="footer-link">About Us</Link>
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
            <Link to="/contact" className="footer-link">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
