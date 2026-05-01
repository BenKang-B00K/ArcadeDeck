import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';

import { Maximize, Heart, Link as LinkIcon, Home, X } from 'lucide-react';
import { games } from '../data/games';
import type { Game, LeaderboardEntry } from '../data/games';
import Navbar from '../components/Navbar';
import Leaderboard from '../components/Leaderboard';
import AdBanner from '../components/AdBanner';
import CommentSection from '../components/CommentSection';
import ShareModal from '../components/ShareModal';
import GameResultModal from '../components/GameResultModal';
import GameHeadMeta from '../components/gameplayer/GameHeadMeta';
import GameInfoTabs from '../components/gameplayer/GameInfoTabs';
import RelatedGames from '../components/gameplayer/RelatedGames';
import RelatedPosts from '../components/gameplayer/RelatedPosts';
import { isNewPersonalBest, compareLeaderboardEntries, formatScore } from '../utils/leaderboardUtils';
import { buildLeaderboardQuery } from '../utils/leaderboardQuery';
import { useNickname } from '../hooks/useNickname';
import { useNotification } from '../hooks/useNotification';
import { MAX_SCORE, AD_SLOTS, LEADERBOARD_FETCH_LIMIT } from '../constants/gameConstants';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc
} from "firebase/firestore/lite";
import { useUiText, useLocale, getLocalizedString } from '../i18n';
import './GamePlayer.css';

const GamePlayer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  // Support both slug-based (/play/gate-of-hell) and legacy id-based (/play/1) URLs
  const id = games.find(g => g.slug === slug)?.id ?? slug;
  const game = useMemo<Game | null>(() => games.find(g => g.id === id) ?? null, [id]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const nickname = useNickname();
  const [isLiked, setIsLiked] = useState<boolean>(() =>
    localStorage.getItem(`liked_${id}`) === 'true'
  );
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const { lang, overlay } = useLocale();
  const { notification, showNotification } = useNotification(4000);
  const [gameResult, setGameResult] = useState<{
    score: number; unit: string;
    resultType: 'personal-best' | 'first-score' | 'game-over';
    rank: number | null;
  } | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const uiT = useUiText();
  // Forces re-render so getWrapperStyle() recomputes after viewport rotation/resize.
  const [, setOrientationTick] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const gameWrapperRef = useRef<HTMLDivElement>(null);

  const t = {
    back: uiT('playerBack', 'ArcadeDeck'),
    player: uiT('playerLabel', 'Player'),
    edit: uiT('playerEdit', 'Edit'),
    save: uiT('homeNicknameSave', 'Save'),
    fullscreen: uiT('playerFullscreen', 'Fullscreen'),
    load: uiT('playerLoad', 'Load'),
    share: uiT('shareTitle', 'Share'),
    overview: uiT('playerOverview', 'Overview'),
    howToPlay: uiT('playerControls', 'Controls'),
    tips: uiT('playerTips', 'Pro Tips'),
    lore: uiT('playerLore', 'World Lore'),
    features: uiT('playerFeatures', 'Key Features'),
    original: uiT('playerOriginal', 'Original Content'),
    last: uiT('playerLast', 'Last'),
    bestScore: uiT('resultPersonalBest', 'New Personal Best!'),
    gameOver: uiT('resultGameOver', 'Game Over!'),
    scoreSubmitted: uiT('playerScoreSubmitted', 'Score submitted!'),
    currentProgress: uiT('playerCurrentProgress', 'Current Progress:'),
  };

  const fetchLeaderboard = useCallback(async (): Promise<LeaderboardEntry[]> => {
    if (!id) return [];
    const lb = games.find(g => g.id === id)?.leaderboard;
    if (!lb) return [];
    const subSortAsc = lb.subSortAsc ?? false;
    const dualSort = lb.dualSort ?? false;

    const mapDoc = (doc: { data: () => Record<string, unknown> }): LeaderboardEntry => {
      const data = doc.data() as { name: string; score: number; subScore?: number; createdAt?: { toDate?: () => Date } };
      return {
        name: data.name,
        score: data.score,
        subScore: Number(data.subScore) || 0,
        date: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : 'Unknown'
      };
    };

    const finalize = (entries: LeaderboardEntry[]) => {
      const sorted = [...entries].sort((a, b) => compareLeaderboardEntries(a, b, subSortAsc));
      setLeaderboard(sorted);
      return sorted;
    };

    try {
      const q = buildLeaderboardQuery(db, id, { dualSort, subSortAsc, limit: LEADERBOARD_FETCH_LIMIT });
      const querySnapshot = await getDocs(q);
      return finalize(querySnapshot.docs.map(mapDoc));
    } catch (error) {
      console.error("Error fetching leaderboard: ", error);
      try {
        const qSimple = query(
          collection(db, "leaderboards"),
          where("gameId", "==", id),
          limit(LEADERBOARD_FETCH_LIMIT)
        );
        const snapSimple = await getDocs(qSimple);
        return finalize(snapSimple.docs.map(mapDoc));
      } catch (e) {
        console.error("Critical leaderboard error:", e);
        showNotification(uiT('playerLeaderboardError', 'Failed to load leaderboard.'), 'error');
        return [];
      }
    }
  }, [id, uiT, showNotification]);

  const handleGameComplete = useCallback(async (score: number, subScore?: number) => {
    if (!id) return;
    const lb = games.find(g => g.id === id)?.leaderboard;
    if (!lb) return;

    const primaryUnit    = lb.primaryUnit    ?? '';
    const secondaryLabel = lb.secondaryLabel ?? '';
    const secondaryUnit  = lb.secondaryUnit  ?? '';
    const subSortAsc     = lb.subSortAsc     ?? false;

    const buildSubPart = (sub: number) =>
      secondaryLabel ? ` (${secondaryLabel}: ${secondaryUnit}${sub})` : '';

    try {
      const q = query(
        collection(db, "leaderboards"),
        where("gameId", "==", id),
        where("name", "==", nickname),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      const currentSubScore = subScore ?? 0;

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const prevData = docSnap.data();
        const prevScore    = Number(prevData.score)    || 0;
        const prevSubScore = Number(prevData.subScore) || 0;

        const isNewBest = isNewPersonalBest(score, currentSubScore, prevScore, prevSubScore, subSortAsc);

        if (isNewBest) {
          await updateDoc(doc(db, "leaderboards", docSnap.id), {
            score,
            subScore: currentSubScore,
            createdAt: serverTimestamp()
          });
          const updatedEntries = await fetchLeaderboard();
          const myRank = updatedEntries.findIndex(e => e.name === nickname) + 1;
          setGameResult({ score, unit: primaryUnit, resultType: 'personal-best', rank: myRank > 0 ? myRank : null });
          return;
        } else {
          showNotification(
            `${t.gameOver} ${formatScore(score, primaryUnit)}${buildSubPart(currentSubScore)} (Best: ${formatScore(prevScore, primaryUnit)})`,
            'info'
          );
        }
      } else {
        await addDoc(collection(db, "leaderboards"), {
          gameId: id,
          name: nickname,
          score,
          subScore: currentSubScore,
          createdAt: serverTimestamp()
        });
        const updatedEntries = await fetchLeaderboard();
        const myRank = updatedEntries.findIndex(e => e.name === nickname) + 1;
        setGameResult({ score, unit: primaryUnit, resultType: 'first-score', rank: myRank > 0 ? myRank : null });
        return;
      }

      const updatedEntries = await fetchLeaderboard();
      const myRank = updatedEntries.findIndex(e => e.name === nickname) + 1;

      if (myRank > 0 && myRank <= 3) {
        setShowLeaderboard(true);
      }
    } catch (error) {
      console.error("Error submitting score: ", error);
      showNotification(uiT('playerScoreSubmitError', 'Failed to submit score. Please try again.'), 'error');
    }
  }, [id, nickname, uiT, t.gameOver, fetchLeaderboard, showNotification]);

  useEffect(() => {
    if (!game || !id) return;
    const recentlyPlayed = JSON.parse(localStorage.getItem('recently_played') || '[]');
    const updatedList = [game.id, ...recentlyPlayed.filter((gid: string) => gid !== game.id)].slice(0, 4);
    localStorage.setItem('recently_played', JSON.stringify(updatedList));
  }, [id, game]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    void fetchLeaderboard();

    // Derive the allowed origin from the game's iframe URL
    const lg = games.find(g => g.id === id);
    let allowedOrigin: string | null = null;
    if (lg?.gameUrl) {
      try {
        allowedOrigin = new URL(lg.gameUrl).origin;
      } catch {
        allowedOrigin = null;
      }
    }

    const handleMessage = (event: MessageEvent) => {
      // Block messages from any origin other than the game's own domain
      if (!allowedOrigin || event.origin !== allowedOrigin) return;

      const types = ['GAME_SCORE', 'SCORE_UPDATE', 'gameOver', 'GAME_OVER'];
      if (event.data && types.includes(event.data.type)) {
        const rawScore = event.data.score;
        const rawSubScore = event.data.subScore;

        const score = typeof rawScore === 'number' ? rawScore : Number(rawScore);
        const subScore = typeof rawSubScore === 'number' ? rawSubScore : (rawSubScore !== undefined ? Number(rawSubScore) : undefined);

        // Validate score is a safe, non-negative finite number within a sane ceiling
        if (rawScore === undefined || isNaN(score) || !isFinite(score) || score < 0 || score > MAX_SCORE) return;

        const safeSubScore = (subScore !== undefined && !isNaN(subScore) && isFinite(subScore) && subScore >= 0 && subScore <= MAX_SCORE)
          ? subScore
          : undefined;

        void handleGameComplete(score, safeSubScore);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [id, fetchLeaderboard, handleGameComplete]);

  useEffect(() => {
    if (isPseudoFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPseudoFullscreen]);

  // Re-render on orientation change to recalculate game wrapper size (debounced)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setOrientationTick(t => t + 1), 150);
    };
    window.addEventListener('orientationchange', handleResize);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const el = gameWrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [game]);

  const handleFullscreen = () => {
    const element = iframeRef.current;
    if (!element) return;

    try {
      const el = element as HTMLIFrameElement & {
        webkitRequestFullscreen?: () => void;
        mozRequestFullScreen?: () => void;
        msRequestFullscreen?: () => void;
      };
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      } else {
        // Pseudo-fullscreen for iOS iPhone
        setIsPseudoFullscreen(true);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
      // Fallback
      setIsPseudoFullscreen(true);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  if (!game) return <div className="not-found"><h2>Not found</h2><Link to="/">Home</Link></div>;

  const getWrapperStyle = () => {
    const ratio = game.aspectRatio || '16/9';
    const [wStr, hStr] = ratio.split('/');
    const w = parseInt(wStr);
    const h = parseInt(hStr);
    const rNum = w / h;

    // We want the game to be as large as possible but fit within the viewport
    // max-height should be around 80-85vh to leave room for UI
    return { 
      width: `min(100%, calc(85dvh * ${rNum}))`,
      maxWidth: ratio === '9/16' ? '500px' : '1200px',
      aspectRatio: ratio.replace('/', ' / '),
      margin: '0 auto 50px auto',
      display: 'block'
    };
  };

  const wrapperStyle = getWrapperStyle();
  const thumbnailUrl = game.thumbnail.startsWith('http') 
    ? game.thumbnail 
    : `${import.meta.env.BASE_URL}${game.thumbnail}`;

  return (
    <div className="game-player-page" style={{ 
      backgroundImage: `linear-gradient(rgba(5, 5, 7, 0.8), rgba(5, 5, 7, 0.9)), url(${thumbnailUrl})` 
    }}>
      <GameHeadMeta game={game} lang={lang} overlay={overlay} />

      {notification && (
        <div className={`notification-toast ${notification.type} animate-in`}>
          <span className="notification-message">{notification.message}</span>
        </div>
      )}

      <Navbar />
      <main className="container player-container">
        {/* ── Compact top bar: back + player ── */}
        <div className="player-header-flex">
          <Link to="/" className="back-button-modern">
            <Home size={16} aria-hidden="true" /> {t.back}
          </Link>
          <div className="player-info-container">
            <span className="player-name-val">{nickname}</span>
          </div>
        </div>

        <nav className="breadcrumbs game-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">›</span>
          <span className="breadcrumb-current">{getLocalizedString(game, 'title', lang, overlay)}</span>
        </nav>

        {/* ── Game title + controls in one row ── */}
        <div className="game-header-section">
          <div className="details-header centered-header">
            <h1>{getLocalizedString(game, 'title', lang, overlay)}</h1>
            <span className="genre-label">{game.genres[0]}</span>
          </div>

          <div className="game-controls">
            <button className="control-btn primary fullscreen-btn" onClick={handleFullscreen}>
              <Maximize size={16} aria-hidden="true" /> {t.fullscreen}
            </button>
            <button className={`control-btn like-btn ${isLiked ? 'active' : ''}`} onClick={() => { const n = !isLiked; setIsLiked(n); localStorage.setItem(`liked_${id}`, String(n)); }}>
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} aria-hidden="true" />
            </button>
            <button className="control-btn share-btn" onClick={() => handleShare()}>
              <LinkIcon size={16} aria-hidden="true" /> {t.share}
            </button>
          </div>
        </div>

        <div ref={gameWrapperRef} className={`game-screen-wrapper ${isPseudoFullscreen ? 'pseudo-fullscreen' : ''} ambient-glow`} style={wrapperStyle}>
          {isPseudoFullscreen && (
            <button className="exit-pseudo-btn" onClick={() => setIsPseudoFullscreen(false)}>
              <X size={16} aria-hidden="true" /> {uiT('playerCloseFullscreen', 'Close Fullscreen')}
            </button>
          )}
          {iframeLoading && (
            <div className="iframe-loader">
              <div className="spinner"></div>
              <p>{uiT('playerLoadingGame', 'Loading game...')}</p>
            </div>
          )}
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={game.gameUrl}
            title={getLocalizedString(game, 'title', 'en', null)}
            frameBorder="0"
            allowFullScreen
            allow="fullscreen; autoplay; gamepad; clipboard-write"
            className="game-iframe"
            onLoad={() => setIframeLoading(false)}
          ></iframe>
        </div>
        
        <div className="player-ad-container">
          {!iframeLoading && <AdBanner slot={AD_SLOTS.GAME_PLAYER} style={{ margin: '0' }} />}
        </div>

        <GameInfoTabs game={game} lang={lang} overlay={overlay} activeTab={activeTab} setActiveTab={setActiveTab} />

        {game.leaderboard && <Leaderboard entries={leaderboard} gameId={game.id} currentNickname={nickname} />}
        <CommentSection gameId={game.id} currentNickname={nickname} />

        <RelatedPosts gameSlug={game.slug} />
        <RelatedGames current={game} />
      </main>

      {/* ── Sticky Controls Bar ── */}
      {showStickyBar && !isPseudoFullscreen && (
        <div className="sticky-controls-bar">
          <button className="sticky-btn sticky-fullscreen" onClick={handleFullscreen}>
            <Maximize size={16} aria-hidden="true" /> {uiT('playerFullscreen', 'Fullscreen')}
          </button>
          <button className={`sticky-btn sticky-like ${isLiked ? 'liked' : ''}`} aria-label={isLiked ? 'Unlike this game' : 'Like this game'} onClick={() => { const n = !isLiked; setIsLiked(n); localStorage.setItem(`liked_${id}`, String(n)); }}>
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
          <button className="sticky-btn sticky-share" onClick={handleShare}>
            <LinkIcon size={16} aria-hidden="true" /> {uiT('shareTitle', 'Share')}
          </button>
        </div>
      )}

      {game.leaderboard && showLeaderboard && (
        <div className="leaderboard-modal-overlay" onClick={() => setShowLeaderboard(false)}>
          <div className="leaderboard-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setShowLeaderboard(false)} aria-label="Close leaderboard"><X size={18} aria-hidden="true" /></button>
            <div className="modal-inner-scroll">
              <Leaderboard entries={leaderboard} gameId={game.id} currentNickname={nickname} />
            </div>
          </div>
        </div>
      )}

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        gameTitle={getLocalizedString(game, 'title', lang, overlay)}
        gameUrl={`https://arcadedeck.net/play/${game.slug}`}
      />

      <GameResultModal
        isOpen={gameResult !== null}
        onClose={() => setGameResult(null)}
        gameTitle={getLocalizedString(game, 'title', lang, overlay)}
        gameSlug={game.slug}
        score={gameResult?.score ?? 0}
        scoreUnit={gameResult?.unit ?? ''}
        resultType={gameResult?.resultType ?? 'game-over'}
        rank={gameResult?.rank ?? null}
        onPlayAgain={() => { setIframeKey(k => k + 1); setIframeLoading(true); }}
      />
    </div>
  );
};

export default GamePlayer;
