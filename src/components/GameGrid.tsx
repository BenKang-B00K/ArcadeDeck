import React, { useMemo } from 'react';
import { Search } from 'lucide-react';
import { games } from '../data/games';
import GameCard from './GameCard';
import { useUiText, useLocale, getLocalizedString } from '../i18n';
import './GameGrid.css';

interface GameGridProps {
  selectedGenre?: string;
  searchQuery?: string;
  onProductionClick?: () => void;
  onGenreClick?: (genre: string) => void;
  userRanks?: Record<string, number>;
}

const GameGrid: React.FC<GameGridProps> = ({ selectedGenre = 'All', searchQuery = '', onProductionClick, onGenreClick, userRanks = {} }) => {
  const t = useUiText();
  const { lang, overlay } = useLocale();
  const processedGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = games.filter(g => {
      const matchesGenre = selectedGenre === 'All' || g.genres.includes(selectedGenre);
      // Search across English (canonical) and the active locale so users can find
      // games whether they typed the English title or the localized one.
      const titleEn = getLocalizedString(g, 'title', 'en', null).toLowerCase();
      const descEn = getLocalizedString(g, 'description', 'en', null).toLowerCase();
      const titleLocal = lang === 'en' ? '' : getLocalizedString(g, 'title', lang, overlay).toLowerCase();
      const descLocal = lang === 'en' ? '' : getLocalizedString(g, 'description', lang, overlay).toLowerCase();
      const matchesSearch = !q ||
        titleEn.includes(q) ||
        descEn.includes(q) ||
        titleLocal.includes(q) ||
        descLocal.includes(q) ||
        g.genres.some(genre => genre.toLowerCase().includes(q));
      return matchesGenre && matchesSearch;
    });
    return [...filtered].sort((a, b) => parseInt(b.id) - parseInt(a.id));
  }, [selectedGenre, searchQuery, lang, overlay]);

  const isFiltered = selectedGenre !== 'All' || searchQuery.trim() !== '';
  const title = isFiltered ? `${selectedGenre}` : t('gameGridAll', 'All');

  return (
    <section className="game-grid-section">
      <div className="container">
        <h2 className="section-title">
          {title} <span>{t('gameGridGames', 'Games')}</span> <span className="game-count">({processedGames.length})</span>
        </h2>
        <div className="game-grid">
          {processedGames.length > 0 ? (
            processedGames.map((game) => <GameCard key={game.id} game={game} onProductionClick={onProductionClick} onGenreClick={onGenreClick} myRank={userRanks[game.id]} />)
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><Search size={32} aria-hidden="true" /></div>
              <h3 className="empty-state-title">{t('gameGridNoResults', 'No results found')}</h3>
              <p className="empty-state-desc">{t('gameGridNoResultsHint', 'Try a different keyword or genre.')}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GameGrid;
