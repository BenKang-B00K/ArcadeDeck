import React, { useEffect, useState } from 'react';
import { Trophy, Sparkles, RefreshCw, Home, X } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { getRankIcon } from '../utils/leaderboardIcons';
import { useUiText } from '../i18n';
import './GameResultModal.css';

interface GameResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameTitle: string;
  gameSlug: string;
  score: number;
  scoreUnit: string;
  resultType: 'personal-best' | 'first-score' | 'game-over';
  rank: number | null;
  onPlayAgain: () => void;
}

const GameResultModal: React.FC<GameResultModalProps> = ({
  isOpen,
  onClose,
  gameTitle,
  score,
  scoreUnit,
  resultType,
  rank,
  onPlayAgain,
}) => {
  useEscapeKey(onClose, isOpen);
  const uiT = useUiText();
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayScore(0);
      return;
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || score === 0) {
      setDisplayScore(score);
      return;
    }
    const start = performance.now();
    const duration = 900;
    let rafId = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.floor(score * eased));
      if (t < 1) rafId = requestAnimationFrame(tick);
      else setDisplayScore(score);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isOpen, score]);

  if (!isOpen) return null;

  const t = {
    headerBest: uiT('resultPersonalBest', 'New Personal Best!'),
    headerFirst: uiT('resultFirstScore', 'First Score!'),
    headerOver: uiT('resultGameOver', 'Game Over'),
    score: uiT('resultScore', 'Score'),
    rankLabel: uiT('resultRankLabel', 'Leaderboard'),
    rankPos: (r: number) => `#${r}`,
    playAgain: uiT('resultPlayAgain', 'Play Again'),
    home: uiT('resultBackHome', 'Back Home'),
    close: uiT('shareClose', 'Close'),
  };

  const headerText =
    resultType === 'personal-best' ? t.headerBest :
    resultType === 'first-score'   ? t.headerFirst :
    t.headerOver;

  const modalClass = `grm-modal grm-${resultType}`;

  return (
    <div className="grm-overlay" onClick={onClose}>
      <div className={modalClass} onClick={e => e.stopPropagation()}>
        <button className="grm-close" onClick={onClose} aria-label={t.close}><X size={16} aria-hidden="true" /></button>

        {(resultType === 'personal-best' || resultType === 'first-score') && (
          <div className="grm-sparkles" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className={`grm-spark grm-spark-${i}`} />
            ))}
          </div>
        )}

        <p className="grm-header-text">
          {resultType === 'personal-best' && <Trophy size={22} aria-hidden="true" />}
          {resultType === 'first-score' && <Sparkles size={22} aria-hidden="true" />}
          {' '}{headerText}
        </p>
        <p className="grm-game-title">{gameTitle}</p>

        <div className="grm-score-box">
          <span className="grm-score-num" aria-live="polite">{displayScore.toLocaleString()}</span>
          {scoreUnit && <span className="grm-score-unit">{scoreUnit}</span>}
        </div>

        {rank !== null && (
          <div className="grm-rank">
            <span className="grm-rank-icon">{getRankIcon(rank)}</span>
            <span className="grm-rank-text">
              {t.rankLabel} <strong>{t.rankPos(rank)}</strong>
            </span>
          </div>
        )}

        <div className="grm-cta-row">
          <button className="grm-btn grm-btn-play" onClick={() => { onClose(); onPlayAgain(); }}>
            <RefreshCw size={16} aria-hidden="true" /> {t.playAgain}
          </button>
          <a className="grm-btn grm-btn-home" href="/">
            <Home size={16} aria-hidden="true" /> {t.home}
          </a>
        </div>
      </div>
    </div>
  );
};

export default GameResultModal;
