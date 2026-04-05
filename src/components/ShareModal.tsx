import React, { useEffect, useRef } from 'react';
import './ShareModal.css';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameTitle: string;
  gameUrl: string;
  score?: number;
  scoreUnit?: string;
  lang: 'en' | 'ko';
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  gameTitle,
  gameUrl,
  score,
  scoreUnit = '',
  lang,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const pageUrl = gameUrl;

  const shareText = score != null
    ? lang === 'ko'
      ? `${gameTitle}에서 ${score.toLocaleString()}${scoreUnit}을 달성했어요! 당신도 도전해보세요 🎮 #ArcadeDeck`
      : `I scored ${score.toLocaleString()}${scoreUnit} in ${gameTitle}! Can you beat me? 🎮 #ArcadeDeck`
    : lang === 'ko'
      ? `${gameTitle} 지금 플레이 중! 🎮 #ArcadeDeck`
      : `Playing ${gameTitle} right now! 🎮 #ArcadeDeck`;

  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(pageUrl);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  const copyBtnRef = useRef<HTMLButtonElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    if (copyBtnRef.current) {
      copyBtnRef.current.textContent = lang === 'ko' ? '✅ 복사됨!' : '✅ Copied!';
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => {
        if (copyBtnRef.current) copyBtnRef.current.textContent = lang === 'ko' ? '🔗 링크 복사' : '🔗 Copy Link';
      }, 2000);
    }
  };

  useEffect(() => {
    return () => clearTimeout(copyTimerRef.current);
  }, []);

  const handleNativeShare = () => {
    navigator.share({
      title: gameTitle,
      text: shareText,
      url: pageUrl,
    }).catch(() => {});
  };

  const handleKakaoShare = () => {
    // Try deep link first (mobile app), fallback to kakaotalk web share
    const deepLink = `kakaotalk://msg/send?text=${encodedText}%0A${encodedUrl}`;
    const fallback = () => window.open(
      `https://story.kakao.com/share?url=${encodedUrl}&text=${encodedText}`,
      '_blank'
    );
    try {
      window.location.href = deepLink;
      // If app not installed, fallback after short delay
      setTimeout(fallback, 1500);
    } catch {
      fallback();
    }
  };

  const t = {
    title: lang === 'ko' ? '공유하기' : 'Share',
    score: lang === 'ko' ? '내 점수' : 'My Score',
    twitter: lang === 'ko' ? 'X(트위터)에 공유' : 'Share on X',
    kakao: lang === 'ko' ? '카카오톡 공유' : 'Share via KakaoTalk',
    copy: lang === 'ko' ? '🔗 링크 복사' : '🔗 Copy Link',
    native: lang === 'ko' ? '📤 더 보기...' : '📤 More options...',
    close: lang === 'ko' ? '닫기' : 'Close',
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={e => e.stopPropagation()}>
        <button className="share-modal-close" onClick={onClose} aria-label="Close">✕</button>

        <h3 className="share-modal-title">📢 {t.title}</h3>

        {score != null && (
          <div className="share-score-display">
            <span className="share-score-label">{t.score}</span>
            <span className="share-score-value">{score.toLocaleString()}{scoreUnit}</span>
          </div>
        )}

        <p className="share-preview-text">{shareText}</p>

        <div className="share-buttons">
          <a
            className="share-btn share-btn-twitter"
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t.twitter}
          >
            <svg className="share-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            {t.twitter}
          </a>

          <button
            className="share-btn share-btn-kakao"
            onClick={handleKakaoShare}
            aria-label={t.kakao}
          >
            <svg className="share-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.636 1.644 4.961 4.125 6.312L5.25 21l4.5-2.625C10.22 18.458 11.1 18.5 12 18.5c5.523 0 10-3.477 10-7.5S17.523 3 12 3z" />
            </svg>
            {t.kakao}
          </button>

          <button
            ref={copyBtnRef}
            className="share-btn share-btn-copy"
            onClick={handleCopyLink}
          >
            {t.copy}
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              className="share-btn share-btn-native"
              onClick={handleNativeShare}
            >
              {t.native}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
