import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import GameGrid from '../components/GameGrid';
import GameCard from '../components/GameCard';
import AdBanner from '../components/AdBanner';
import GlobalLeaderboard from '../components/GlobalLeaderboard';
import { games } from '../data/games';
import { db } from '../firebase';
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { BANNED_WORDS, RANDOM_ID_MIN, RANDOM_ID_MAX, AD_SLOTS } from '../constants/gameConstants';
import './Home.css';

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
  const [selectedGenre, setSelectedGenre] = useState<string>(() =>
    sessionStorage.getItem('selected_genre') || 'All'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [recentlyPlayedIds, setRecentlyPlayedIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [recommendedGames, setRecommendedGames] = useState<any[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem('recently_played');
    const recentlyPlayed = saved ? JSON.parse(saved) : [];
    setRecentlyPlayedIds(recentlyPlayed);

    // Genre-based recommendations: prefer games matching the user's played genres
    const playedGames = games.filter(g => recentlyPlayed.includes(g.id));
    const playedGenres = new Set(playedGames.flatMap(g => g.genres));
    const neverPlayed = games
      .filter(g => !recentlyPlayed.includes(g.id) && g.status !== 'IN PRODUCTION')
      .map(g => ({ game: g, score: g.genres.filter(genre => playedGenres.has(genre)).length }))
      .sort((a, b) => b.score - a.score || Math.random() - 0.5)
      .map(({ game }) => game)
      .slice(0, 3);
    setRecommendedGames(neverPlayed);
  }, []);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Extract all unique genres from data (memoized — games array is static)
  const allGenres = useMemo(() => ['All', ...new Set(games.flatMap(g => g.genres))], []);

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

  const handleShareTwitter = () => {
    const text = `Check out my Gamer ID: ${nickname} on ArcadeDeck! The best free browser games platform.`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showNotification('Link copied to clipboard! 🔗', 'success');
  };

  const recentlyPlayedGames = games.filter(g => recentlyPlayedIds.includes(g.id))
    .sort((a, b) => recentlyPlayedIds.indexOf(a.id) - recentlyPlayedIds.indexOf(b.id));

  return (
    <div className="home-page">
      <Helmet>
        <title>ArcadeDeck | Play Best Free Online Browser Games</title>
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
      <header className="hero">
        <div className="container hero-content">
          <h1>Explore Every Universe, Every <span>Genre</span></h1>
          <p>Your Personal Gaming Deck</p>
          
          <div className="home-nickname-wrapper">
            <div className="nickname-guide">
              <span className="guide-icon">⚡</span>
              <p>INITIATE YOUR GAMER ID</p>
            </div>
            
            {isEditing ? (
              <form onSubmit={handleSaveName} className="home-nickname-form">
                <div className="nickname-input-wrapper">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    maxLength={12}
                    placeholder="Enter Gamer ID..."
                    autoFocus
                  />
                  <span className={`nickname-char-count${tempName.length >= 10 ? ' near-limit' : ''}`}>
                    {tempName.length}/12
                  </span>
                </div>
                <button type="submit">Initialize Profile</button>
                <p className="nickname-info-msg">* If the name exists, a unique #ID will be added automatically.</p>
              </form>
            ) : (
              <div
                className="home-nickname-display"
                role="button"
                tabIndex={0}
                aria-label="Change your gamer ID"
                onClick={() => { setTempName(nickname.split('#')[0]); setIsEditing(true); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTempName(nickname.split('#')[0]); setIsEditing(true); } }}
              >
                <span className="player-label">CURRENT GAMER</span>
                <span className="player-name">{nickname}</span>
                <span className="edit-hint">[Click to Change]</span>
              </div>
            )}
          </div>

          <div className="social-share-container">
            <button className="share-btn twitter" onClick={handleShareTwitter} aria-label="Share on X (Twitter)">𝕏 Share</button>
            <button className="share-btn facebook" onClick={handleShareFacebook} aria-label="Share on Facebook">f Share</button>
            <button className="share-btn copy" onClick={handleCopyLink} aria-label="Copy link to clipboard">🔗 Copy Link</button>
          </div>
        </div>
      </header>
      
      <div className="container">
        <div className="ad-banner-wrapper">
          <AdBanner slot={AD_SLOTS.HOME_TOP} />
        </div>

        {recentlyPlayedGames.length > 0 && (
          <section className="recently-played-section">
            <div className="container">
              <h2 className="section-title-small" style={{ textAlign: 'left', marginBottom: '20px' }}>Jump <span>Back In</span></h2>
              <div className="game-grid small-grid">
                {recentlyPlayedGames.map(game => (
                  <GameCard
                    key={`recent-${game.id}`}
                    game={game}
                    isRecentlyPlayed
                    onProductionClick={() => showNotification('PLEASE COME BACK LATER 🚧', 'info')}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {recommendedGames.length > 0 && recentlyPlayedIds.length > 0 && (
          <section className="never-played-section-minimal">
            <h2 className="section-title-small">Why not <span>Try These?</span></h2>
            <div className="minimal-game-grid">
              {recommendedGames.map(game => (
                <Link key={`never-${game.id}`} to={`/play/${game.id}`} className="minimal-game-card">
                  <div className="minimal-thumb">
                    <img src={`${import.meta.env.BASE_URL}${game.thumbnail}`} alt={game.title} />
                  </div>
                  <div className="minimal-info">
                    <h4>{game.title}</h4>
                    <p>{game.genres[0]}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <div id="games-grid" className="games-grid-main-wrapper">
        <div className="container games-grid-section">
          <div className="section-header-modern">
            <h2 className="section-title-main">🎮 Discover <span>Your Next Adventure</span></h2>
            <p className="section-subtitle-main">Filter by genre and find the perfect game for your current mood</p>
          </div>
          <div className="game-search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="game-search-input"
              placeholder="Search games..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear-btn" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          <div className="genre-filters-container">
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
                  {selectedGenre === genre && <span className="active-dot"></span>}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="container grid-content-wrapper">
          <GameGrid
            selectedGenre={selectedGenre}
            searchQuery={searchQuery}
            onProductionClick={() => showNotification('PLEASE COME BACK LATER 🚧', 'info')}
            onGenreClick={(genre) => {
              setSelectedGenre(genre);
              sessionStorage.setItem('selected_genre', genre);
              document.getElementById('games-grid')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
      </div>

      <div className="container">
        <div className="home-global-leaderboard-container">
          <GlobalLeaderboard />
        </div>
      </div>

      {/* Bottom Ad Section */}
      <section className="bottom-ad-section">
        <div className="container">
          <p className="ad-thanks-msg">Thank you for your Contribution</p>
          <AdBanner slot={AD_SLOTS.HOME_BOTTOM} placeholderText="Enjoy ArcadeDeck" style={{ margin: '0' }} />
        </div>
      </section>

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
