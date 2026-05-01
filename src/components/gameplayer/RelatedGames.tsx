import React from 'react';
import { Gamepad2 } from 'lucide-react';
import GameCard from '../GameCard';
import { games } from '../../data/games';
import type { Game } from '../../data/games';
import { useUiText } from '../../i18n';

interface Props {
  current: Game;
}

const RelatedGames: React.FC<Props> = ({ current }) => {
  const t = useUiText();
  const related = games.filter(
    g => g.id !== current.id &&
         g.status !== 'IN PRODUCTION' &&
         g.genres.some(genre => current.genres.includes(genre))
  ).slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className="related-games-section">
      <h3 className="related-games-title">
        <Gamepad2 size={18} aria-hidden="true" /> {t('relatedGamesTitle', 'You Might Also Like')}
      </h3>
      <div className="related-games-grid">
        {related.map(g => <GameCard key={g.id} game={g} />)}
      </div>
    </div>
  );
};

export default RelatedGames;
