import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useUiText } from '../../i18n';
import './HelpfulThumbs.css';

type Vote = 'up' | 'down' | null;

interface Props {
  gameId: string;
  section: 'tips' | 'lore';
}

const HelpfulThumbs: React.FC<Props> = ({ gameId, section }) => {
  const t = useUiText();
  const lsKey = `feedback_${gameId}_${section}`;
  const [vote, setVote] = useState<Vote>(() => {
    try {
      const v = localStorage.getItem(lsKey);
      return v === 'up' || v === 'down' ? v : null;
    } catch {
      return null;
    }
  });
  const [thanks, setThanks] = useState(false);

  const handleVote = (next: 'up' | 'down') => {
    const newVote: Vote = vote === next ? null : next;
    setVote(newVote);
    try {
      if (newVote) localStorage.setItem(lsKey, newVote);
      else localStorage.removeItem(lsKey);
    } catch {
      // storage full / private mode — ignore
    }
    if (newVote) {
      setThanks(true);
      setTimeout(() => setThanks(false), 1800);
    }
  };

  return (
    <div className="helpful-thumbs" role="group" aria-label={t('helpfulPrompt', 'Was this helpful?')}>
      <span className="helpful-prompt">{t('helpfulPrompt', 'Was this helpful?')}</span>
      <button
        type="button"
        className={`helpful-btn${vote === 'up' ? ' active' : ''}`}
        onClick={() => handleVote('up')}
        aria-pressed={vote === 'up'}
        aria-label={t('helpfulYes', 'Yes, helpful')}
      >
        <ThumbsUp size={14} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`helpful-btn${vote === 'down' ? ' active down' : ''}`}
        onClick={() => handleVote('down')}
        aria-pressed={vote === 'down'}
        aria-label={t('helpfulNo', 'Not helpful')}
      >
        <ThumbsDown size={14} aria-hidden="true" />
      </button>
      {thanks && <span className="helpful-thanks">{t('helpfulThanks', 'Thanks!')}</span>}
    </div>
  );
};

export default HelpfulThumbs;
