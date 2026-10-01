import React, { useMemo } from 'react';
import { deviceGames as games } from '../data/games';
import GameCard from './GameCard';
import { useUiText, useLocale, getLocalizedString } from '../i18n';
import { genreName } from '../utils/genres';
import './GameGrid.css';

interface GameGridProps {
  selectedGenre?: string;
  searchQuery?: string;
  onProductionClick?: () => void;
  onGenreClick?: (genre: string) => void;
  excludeGenre?: string;
}

// Top 3 genres by game count — suggested when a search comes up empty.
const TOP_GENRES: string[] = (() => {
  const counts: Record<string, number> = {};
  for (const g of games) for (const genre of g.genres) counts[genre] = (counts[genre] || 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([genre]) => genre);
})();

const GameGrid: React.FC<GameGridProps> = ({ selectedGenre = 'All', searchQuery = '', onProductionClick, onGenreClick, excludeGenre }) => {
  const t = useUiText();
  const { lang, overlay } = useLocale();

  const processedGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = games.filter(g => {
      const matchesGenre = selectedGenre === 'All' || g.genres.includes(selectedGenre);
      if (!matchesGenre || (excludeGenre && g.genres.includes(excludeGenre))) return false;
      if (!q) return true;
      const haystack = [
        getLocalizedString(g, 'title', 'en', null),
        getLocalizedString(g, 'description', 'en', null),
        lang === 'en' ? '' : getLocalizedString(g, 'title', lang, overlay),
        lang === 'en' ? '' : getLocalizedString(g, 'description', lang, overlay),
        ...g.genres,
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });
    return filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id));
  }, [selectedGenre, searchQuery, lang, overlay, excludeGenre]);

  const title = selectedGenre !== 'All'
    ? `${genreName(t, selectedGenre)} ${t('gameGridGames', 'Games')}`
    : `${t('gameGridAll', 'All')} ${t('gameGridGames', 'Games')}`;

  return (
    <section className="game-grid-section">
      <div className="container">
        <h2 className="section-title">
          {title}
          <span className="section-count">{processedGames.length}</span>
        </h2>

        <div className="game-grid">
          {processedGames.length > 0 ? (
            processedGames.map(game => (
              <GameCard key={game.id} game={game} onProductionClick={onProductionClick} onGenreClick={onGenreClick} />
            ))
          ) : (
            <div className="empty-state">
              <h3>{t('gameGridNoResults', 'No results found')}</h3>
              <p>{t('gameGridNoResultsHint', 'Try a different keyword or genre.')}</p>
              {onGenreClick && (
                <div className="empty-state-chips">
                  {TOP_GENRES.map(g => (
                    <button key={g} type="button" className="empty-state-chip" onClick={() => onGenreClick(g)}>{genreName(t, g)}</button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GameGrid;
