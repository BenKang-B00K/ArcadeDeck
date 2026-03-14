import React, { useState } from 'react';
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
import { BANNED_WORDS } from '../constants/gameConstants';
import './Home.css';

const Home: React.FC = () => {
  const [nickname, setNickname] = React.useState<string>(() => {
    const saved = localStorage.getItem('player_nickname');
    if (saved) return saved;
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const initialName = `Player#${randomId}`;
    localStorage.setItem('player_nickname', initialName);
    return initialName;
  });
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempName, setTempName] = React.useState(nickname);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [recentlyPlayedIds, setRecentlyPlayedIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem('recently_played');
    if (saved) {
      setRecentlyPlayedIds(JSON.parse(saved));
    }
  }, []);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Extract all unique genres from data
  const allGenres = ['All', ...new Set(games.flatMap(g => g.genres))];

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalName = tempName.trim();
    if (!finalName) return;

    // Check for inappropriate words
    const lowerCaseName = finalName.toLowerCase();
    const hasBannedWord = BANNED_WORDS.some(word => lowerCaseName.includes(word.toLowerCase()));

    if (hasBannedWord) {
      alert("Inappropriate language detected. Please choose a different nickname.");
      return;
    }

    // Check for nickname duplication
    const q = query(collection(db, "leaderboards"), where("name", "==", finalName), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty && finalName !== nickname) {
      const uniqueId = Math.floor(1000 + Math.random() * 9000);
      finalName = `${finalName}#${uniqueId}`;
      alert(`This name is already taken. To ensure uniqueness, we've assigned you a tag: ${finalName}`);
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
    alert('Link copied to clipboard!');
  };

  const recentlyPlayedGames = games.filter(g => recentlyPlayedIds.includes(g.id))
    .sort((a, b) => recentlyPlayedIds.indexOf(a.id) - recentlyPlayedIds.indexOf(b.id));

  const neverPlayedGames = games.filter(g => !recentlyPlayedIds.includes(g.id))
    .sort(() => Math.random() - 0.5) // Shuffle for variety
    .slice(0, 3); // Minimalist: only show top 3 recommendations

  return (
    <div className="home-page">
      <Helmet>
        <title>ArcadeDeck | The Ultimate Free Browser Games Platform</title>
        <meta name="description" content="Play the best free online browser games on ArcadeDeck. Top Action, RPG, Strategy, and Idle games with global leaderboards. No downloads needed!" />
        <meta name="keywords" content="free games, browser games, online games, arcadedeck, action, rpg, clicker games" />
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
                <input 
                  type="text" 
                  value={tempName} 
                  onChange={(e) => setTempName(e.target.value)}
                  maxLength={12}
                  placeholder="Enter Gamer ID..."
                  autoFocus
                />
                <button type="submit">Initialize Profile</button>
                <p className="nickname-info-msg">* If the name exists, a unique #ID will be added automatically.</p>
              </form>
            ) : (
              <div className="home-nickname-display" onClick={() => { setTempName(nickname.split('#')[0]); setIsEditing(true); }}>
                <span className="player-label">CURRENT GAMER</span>
                <span className="player-name">{nickname}</span>
                <span className="edit-hint">[Click to Change]</span>
              </div>
            )}
          </div>

          <div className="social-share-container">
            <button className="share-btn twitter" onClick={handleShareTwitter}>𝕏 Share</button>
            <button className="share-btn facebook" onClick={handleShareFacebook}>f Share</button>
            <button className="share-btn copy" onClick={handleCopyLink}>🔗 Copy Link</button>
          </div>
        </div>
      </header>
      
      <div className="container">
        <div className="ad-banner-wrapper">
          <AdBanner />
        </div>

        {recentlyPlayedGames.length > 0 && selectedGenre === 'All' && (
          <section className="recently-played-section">
            <div className="container">
              <h2 className="section-title-small" style={{ textAlign: 'left', marginBottom: '20px' }}>Jump <span>Back In</span></h2>
              <div className="game-grid small-grid">
                {recentlyPlayedGames.map(game => (
                  <GameCard 
                    key={`recent-${game.id}`} 
                    game={game} 
                    onProductionClick={() => showNotification('PLEASE COME BACK LATER 🚧', 'info')} 
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {neverPlayedGames.length > 0 && recentlyPlayedIds.length > 0 && selectedGenre === 'All' && (
          <section className="never-played-section-minimal">
            <h2 className="section-title-small">Why not <span>Try These?</span></h2>
            <div className="minimal-game-grid">
              {neverPlayedGames.map(game => (
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
        
        <div className="home-global-leaderboard-container">
          <GlobalLeaderboard />
        </div>
      </div>

      <div id="games-grid">
        <div className="container games-grid-section">
          <div className="genre-filters">
            {allGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => {
                  setSelectedGenre(genre);
                }}
                className={`genre-btn ${selectedGenre === genre ? 'active' : ''}`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
        <GameGrid 
          selectedGenre={selectedGenre} 
          onProductionClick={() => showNotification('PLEASE COME BACK LATER 🚧', 'info')}
        />
      </div>

      {/* Bottom Ad Section */}
      <section className="bottom-ad-section">
        <div className="container">
          <p className="ad-thanks-msg">Thank you for your Contribution</p>
          <AdBanner placeholderText="Enjoy ArcadeDeck" style={{ margin: '0' }} />
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
