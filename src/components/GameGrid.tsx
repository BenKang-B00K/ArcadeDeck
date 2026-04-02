import React, { useState, useMemo } from 'react';
import { games } from '../data/games';
import GameCard from './GameCard';
import { ITEMS_PER_PAGE } from '../constants/gameConstants';
import './GameGrid.css';

interface GameGridProps {
  selectedGenre?: string;
  searchQuery?: string;
  onProductionClick?: () => void;
  onGenreClick?: (genre: string) => void;
}

const GameGrid: React.FC<GameGridProps> = ({ selectedGenre = 'All', searchQuery = '', onProductionClick, onGenreClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const processedGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = games.filter(g => {
      const matchesGenre = selectedGenre === 'All' || g.genres.includes(selectedGenre);
      const matchesSearch = !q ||
        g.title.toLowerCase().includes(q) ||
        (g.titleKo ?? '').toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.genres.some(genre => genre.toLowerCase().includes(q));
      return matchesGenre && matchesSearch;
    });
    return [...filtered].sort((a, b) => parseInt(b.id) - parseInt(a.id));
  }, [selectedGenre, searchQuery]);

  // Reset page when filter/search changes
  React.useEffect(() => { setCurrentIndex(0); }, [selectedGenre, searchQuery]);

  const handleNext = () => {
    if (currentIndex + ITEMS_PER_PAGE < processedGames.length) {
      setCurrentIndex(currentIndex + ITEMS_PER_PAGE);
    }
  };

  const handlePrev = () => {
    if (currentIndex - ITEMS_PER_PAGE >= 0) {
      setCurrentIndex(currentIndex - ITEMS_PER_PAGE);
    }
  };

  const isFiltered = selectedGenre !== 'All' || searchQuery.trim() !== '';

  // If search or genre is active, show a single unified grid
  if (isFiltered) {
    return (
      <section className="game-grid-section">
        <div className="container">
          <h2 className="section-title">
            <>{selectedGenre} <span>Games</span></>
          </h2>
          <div className="game-grid">
            {processedGames.length > 0 ? (
              processedGames.map((game) => <GameCard key={game.id} game={game} onProductionClick={onProductionClick} onGenreClick={onGenreClick} />)
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3 className="empty-state-title">No results found</h3>
                <p className="empty-state-desc">Try a different keyword or genre.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Default 'All' view with Slider/Carousel
  return (
    <div className="game-grids-container">
      <section className="game-grid-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">All <span>Games</span> <span className="game-count">({processedGames.length})</span></h2>
            <div className="grid-nav-buttons">
              <button
                className={`nav-btn prev ${currentIndex === 0 ? 'disabled' : ''}`}
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                ←
              </button>
              <button
                className={`nav-btn next ${currentIndex + ITEMS_PER_PAGE >= processedGames.length ? 'disabled' : ''}`}
                onClick={handleNext}
                disabled={currentIndex + ITEMS_PER_PAGE >= processedGames.length}
              >
                →
              </button>
            </div>
          </div>
          <div className="game-grid all-games-grid">
            {processedGames.slice(currentIndex, currentIndex + ITEMS_PER_PAGE).map((game) => (
              <GameCard key={game.id} game={game} onProductionClick={onProductionClick} onGenreClick={onGenreClick} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default GameGrid;
