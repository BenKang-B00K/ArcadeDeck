import React, { useEffect, useRef } from 'react';
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

const RANK_ICONS: Record<number, string> = { 1: '👑', 2: '🥈', 3: '🥉' };

const GameResultModal: React.FC<GameResultModalProps> = ({
  isOpen,
  onClose,
  gameTitle,
  gameSlug,
  score,
  scoreUnit,
  resultType,
  rank,
  lang,
  onPlayAgain,
}) => {
  const copyBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const pageUrl = `https://arcadedeck.net/play/${gameSlug}`;

  const shareText =
    lang === 'ko'
      ? `${gameTitle}에서 ${score.toLocaleString()}${scoreUnit}을 달성했어요! 도전해보세요 🎮 #ArcadeDeck`
      : `I scored ${score.toLocaleString()}${scoreUnit} in ${gameTitle}! Can you beat me? 🎮 #ArcadeDeck`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pageUrl);
    const btn = copyBtnRef.current;
    if (btn) {
      btn.textContent = lang === 'ko' ? '✅ 복사됨!' : '✅ Copied!';
      setTimeout(() => { if (copyBtnRef.current) copyBtnRef.current.textContent = lang === 'ko' ? '🔗 링크 복사' : '🔗 Copy Link'; }, 2000);
    }
  };

  const handleKakao = () => {
    const deepLink = `kakaotalk://msg/send?text=${encodeURIComponent(shareText + '\n' + pageUrl)}`;
    const fallback = () => window.open(`https://story.kakao.com/share?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
    try {
      window.location.href = deepLink;
      setTimeout(fallback, 1500);
    } catch {
      fallback();
    }
  };

  const handleNativeShare = () => {
    navigator.share({ title: gameTitle, text: shareText, url: pageUrl }).catch(() => {});
  };

  const t = {
    headerBest: lang === 'ko' ? '🏆 새로운 개인 최고 기록!' : '🏆 New Personal Best!',
    headerFirst: lang === 'ko' ? '✨ 첫 점수 등록!' : '✨ First Score!',
    headerOver: lang === 'ko' ? '게임 오버' : 'Game Over',
    score: lang === 'ko' ? '점수' : 'Score',
    rankLabel: lang === 'ko' ? '리더보드' : 'Leaderboard',
    rankPos: (r: number) => lang === 'ko' ? `${r}위` : `#${r}`,
    shareTitle: lang === 'ko' ? '결과 공유하기' : 'Share Your Result',
    twitter: lang === 'ko' ? 'X(트위터)' : 'X (Twitter)',
    kakao: '카카오톡',
    copy: lang === 'ko' ? '🔗 링크 복사' : '🔗 Copy Link',
    nativeShare: lang === 'ko' ? '📤 더 보기' : '📤 More',
    playAgain: lang === 'ko' ? '🔄 다시 플레이' : '🔄 Play Again',
    home: lang === 'ko' ? '🏠 홈으로' : '🏠 Back Home',
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
        <button className="grm-close" onClick={onClose} aria-label={t.close}>✕</button>

        {(resultType === 'personal-best' || resultType === 'first-score') && (
          <div className="grm-sparkles" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className={`grm-spark grm-spark-${i}`} />
            ))}
          </div>
        )}

        <p className="grm-header-text">{headerText}</p>
        <p className="grm-game-title">{gameTitle}</p>

        <div className="grm-score-box">
          <span className="grm-score-num">{score.toLocaleString()}</span>
          {scoreUnit && <span className="grm-score-unit">{scoreUnit}</span>}
        </div>

        {rank !== null && (
          <div className="grm-rank">
            <span className="grm-rank-icon">{RANK_ICONS[rank] ?? '🔥'}</span>
            <span className="grm-rank-text">
              {t.rankLabel} <strong>{t.rankPos(rank)}</strong>
            </span>
          </div>
        )}

        <div className="grm-divider">
          <span>{t.shareTitle}</span>
        </div>

        <div className="grm-share-row">
          <a className="grm-share-btn grm-twitter" href={twitterUrl} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            {t.twitter}
          </a>

          <button className="grm-share-btn grm-kakao" onClick={handleKakao}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.636 1.644 4.961 4.125 6.312L5.25 21l4.5-2.625C10.22 18.458 11.1 18.5 12 18.5c5.523 0 10-3.477 10-7.5S17.523 3 12 3z" />
            </svg>
            {t.kakao}
          </button>

          <button className="grm-share-btn grm-copy" ref={copyBtnRef} onClick={handleCopy}>
            {t.copy}
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button className="grm-share-btn grm-native" onClick={handleNativeShare}>
              {t.nativeShare}
            </button>
          )}
        </div>

        <div className="grm-cta-row">
          <button className="grm-btn grm-btn-play" onClick={() => { onClose(); onPlayAgain(); }}>
            {t.playAgain}
          </button>
          <a className="grm-btn grm-btn-home" href="/">
            {t.home}
          </a>
        </div>
      </div>
    </div>
  );
};

export default GameResultModal;
