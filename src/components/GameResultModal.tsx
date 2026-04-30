import React from 'react';
import { Trophy, Sparkles, RefreshCw, Home, X } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { getRankIcon } from '../utils/leaderboardIcons';
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
  lang: 'en' | 'ko';
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
  lang,
  onPlayAgain,
}) => {
  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  const t = {
    headerBest: lang === 'ko' ? '새로운 개인 최고 기록!' : 'New Personal Best!',
    headerFirst: lang === 'ko' ? '첫 점수 등록!' : 'First Score!',
    headerOver: lang === 'ko' ? '게임 오버' : 'Game Over',
    score: lang === 'ko' ? '점수' : 'Score',
    rankLabel: lang === 'ko' ? '리더보드' : 'Leaderboard',
    rankPos: (r: number) => lang === 'ko' ? `${r}위` : `#${r}`,
    playAgain: lang === 'ko' ? '다시 플레이' : 'Play Again',
    home: lang === 'ko' ? '홈으로' : 'Back Home',
    close: lang === 'ko' ? '닫기' : 'Close',
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
          <span className="grm-score-num">{score.toLocaleString()}</span>
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
