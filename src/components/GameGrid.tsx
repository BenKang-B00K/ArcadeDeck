import React, { useMemo } from 'react';
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

// Precompute top genres by populated count — used by the empty state suggestions.
const TOP_GENRES: string[] = (() => {
  const counts: Record<string, number> = {};
  for (const g of games) {
    for (const genre of g.genres) {
      counts[genre] = (counts[genre] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genre]) => genre);
})();

const GameGrid: React.FC<GameGridProps> = ({ selectedGenre = 'All', searchQuery = '', onProductionClick, onGenreClick, userRanks = {} }) => {
  const t = useUiText();
  const { lang, overlay } = useLocale();
  const processedGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = games.filter(g => {
      const matchesGenre = selectedGenre === 'All' || g.genres.includes(selectedGenre);
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
  const eyebrow = isFiltered
    ? selectedGenre !== 'All' ? selectedGenre : t('gameGridEyebrowSearch', 'Results')
    : t('gameGridEyebrowAll', 'The Collection');
  const bigTitle = isFiltered && selectedGenre !== 'All'
    ? `${selectedGenre} ${t('gameGridGames', 'Games')}`
    : `${t('gameGridAll', 'All')} ${t('gameGridGames', 'Games')}`;
  const titleChars = bigTitle.split('');

  // Re-key the count chip whenever it changes so its enter animation re-plays.
  const countKey = `count-${processedGames.length}-${selectedGenre}-${searchQuery}`;

  return (
    <section className="game-grid-section">
      <div className="container">
        <div className="section-heading reveal-section">
          <span className="section-eyebrow">{eyebrow}</span>
          <h2 className="section-title-big" aria-label={bigTitle}>
            <span className="title-bracket" aria-hidden="true">[</span>
            <span className="title-letters" aria-hidden="true">
              {titleChars.map((ch, i) => (
                <span
                  key={`${ch}-${i}`}
                  className="title-letter"
                  style={{ '--i': i } as React.CSSProperties}
                >{ch === ' ' ? ' ' : ch}</span>
              ))}
            </span>
            <span className="title-bracket" aria-hidden="true">]</span>
          </h2>
          <span key={countKey} className="section-count-chip">
            <span className="section-count-num">{processedGames.length}</span>
            <span className="section-count-label">{t('gameGridCountSuffix', 'games')}</span>
          </span>
        </div>

        <div className="game-grid">
          {processedGames.length > 0 ? (
            processedGames.map((game) => <GameCard key={game.id} game={game} onProductionClick={onProductionClick} onGenreClick={onGenreClick} myRank={userRanks[game.id]} />)
          ) : (
            <div className="empty-state">
              <div className="empty-state-block" aria-hidden="true">
                <div className="empty-state-screen">
                  <span className="empty-state-scanlines"></span>
                  <span className="empty-state-glitch">NO SIGNAL</span>
                </div>
              </div>
              <h3 className="empty-state-title">{t('gameGridNoResults', 'No results found')}</h3>
              <p className="empty-state-desc">{t('gameGridNoResultsHint', 'Try a different keyword or genre.')}</p>
              {onGenreClick && TOP_GENRES.length > 0 && (
                <div className="empty-state-suggest">
                  <span className="empty-state-suggest-label">{t('gameGridEmptyTrySuffix', 'Try one of these:')}</span>
                  <div className="empty-state-suggest-chips">
                    {TOP_GENRES.map(g => (
                      <button
                        key={`suggest-${g}`}
                        type="button"
                        className="empty-state-chip"
                        onClick={() => onGenreClick(g)}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
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
