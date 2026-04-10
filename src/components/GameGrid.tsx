import React, { useMemo } from 'react';
import { Search } from 'lucide-react';
import { games } from '../data/games';
import GameCard from './GameCard';
import './GameGrid.css';

interface GameGridProps {
  selectedGenre?: string;
  searchQuery?: string;
  onProductionClick?: () => void;
  onGenreClick?: (genre: string) => void;
  userRanks?: Record<string, number>;
}

const GameGrid: React.FC<GameGridProps> = ({ selectedGenre = 'All', searchQuery = '', onProductionClick, onGenreClick, userRanks = {} }) => {
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

  const isFiltered = selectedGenre !== 'All' || searchQuery.trim() !== '';
  const title = isFiltered ? `${selectedGenre}` : 'All';

  return (
    <section className="game-grid-section">
      <div className="container">
        <h2 className="section-title">
          {title} <span>Games</span> <span className="game-count">({processedGames.length})</span>
        </h2>
        <div className="game-grid">
          {processedGames.length > 0 ? (
            processedGames.map((game) => <GameCard key={game.id} game={game} onProductionClick={onProductionClick} onGenreClick={onGenreClick} myRank={userRanks[game.id]} />)
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><Search size={32} aria-hidden="true" /></div>
              <h3 className="empty-state-title">No results found</h3>
              <p className="empty-state-desc">Try a different keyword or genre.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GameGrid;
