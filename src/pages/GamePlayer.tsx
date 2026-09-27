import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';

import { Maximize, Minimize, Heart, Link as LinkIcon, Home, X, Trophy } from 'lucide-react';
import { games, GENRE_HUE } from '../data/games';
import type { Game } from '../data/games';
import Navbar from '../components/Navbar';
import AdBanner from '../components/AdBanner';
import CommentSection from '../components/CommentSection';
import ShareModal from '../components/ShareModal';
import GameHeadMeta from '../components/gameplayer/GameHeadMeta';
import GameHero from '../components/gameplayer/GameHero';
import GameInfoTabs from '../components/gameplayer/GameInfoTabs';
import RelatedGames from '../components/gameplayer/RelatedGames';
import RelatedPosts from '../components/gameplayer/RelatedPosts';
import { useNickname } from '../hooks/useNickname';
import { AD_SLOTS } from '../constants/gameConstants';
import { MAX_SCORE, formatScore, nextTierAt, readPB, recordPlayed, savePB, tierLabel, tierMeta, tierOf } from '../utils/pb';
import { useUiText, useLocale, getLocalizedString } from '../i18n';
import { genreSlug } from '../utils/genres';
import '../components/GameCard.css';
import './GamePlayer.css';

const GamePlayer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  // Support both slug-based (/play/gate-of-hell) and legacy id-based (/play/1) URLs
  const id = games.find(g => g.slug === slug)?.id ?? slug;
  const game = useMemo<Game | null>(() => games.find(g => g.id === id) ?? null, [id]);
  const nickname = useNickname();
  const [isLiked, setIsLiked] = useState<boolean>(() =>
    localStorage.getItem(`liked_${id}`) === 'true'
  );
  const [pb, setPb] = useState<number>(() => readPB(id ?? ''));
  const [isNewBest, setIsNewBest] = useState(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const { lang, overlay } = useLocale();
  const [activeTab, setActiveTab] = useState('overview');
  const [showStickyBar, setShowStickyBar] = useState(false);
  // Click-to-start gate. Iframe stays unmounted until user clicks PLAY,
  // so we don't burn bandwidth + LCP on a hidden game frame.
  // ?play=1 deep link skips the hero for share-direct flows.
  const [gameStarted, setGameStarted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('play') === '1';
  });
  const uiT = useUiText();
  // Forces re-render so getWrapperStyle() recomputes after viewport rotation/resize.
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const gameWrapperRef = useRef<HTMLDivElement>(null);

  const t = {
    back: uiT('playerBack', 'ArcadeDeck'),
    fullscreen: uiT('playerFullscreen', 'Fullscreen'),
  };

  useEffect(() => {
    if (!game || !id) return;
    const recentlyPlayed = JSON.parse(localStorage.getItem('recently_played') || '[]');
    const updatedList = [game.id, ...recentlyPlayed.filter((gid: string) => gid !== game.id)].slice(0, 5);
    localStorage.setItem('recently_played', JSON.stringify(updatedList));
    recordPlayed(game.id);
    void import('../utils/streak').then(m => m.recordPlayToday());
  }, [id, game]);

  // Personal best. Games post their final score to the parent frame; we keep
  // the best one in localStorage and push the resulting Deck XP to the global
  // leaderboard.
  useEffect(() => {
    if (!game) return;
    setPb(readPB(game.id));
    setIsNewBest(false);
    let allowedOrigin: string;
    try {
      allowedOrigin = new URL(game.gameUrl).origin;
    } catch {
      return;
    }

    const SCORE_TYPES = ['GAME_OVER', 'GAME_SCORE', 'SCORE_UPDATE', 'gameOver'];
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== allowedOrigin) return;
      const data = event.data as { type?: string; score?: unknown } | null;
      if (!data || !data.type || !SCORE_TYPES.includes(data.type)) return;

      const score = Number(data.score);
      if (!Number.isFinite(score) || score <= 0 || score > MAX_SCORE) return;

      if (savePB(game.id, score)) {
        setPb(score);
        setIsNewBest(true);
        void import('../utils/leaderboard').then(m => m.syncLeaderboard());
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [game]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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

  // ponytail: webkit prefix kept for older Safari; moz/ms dropped (Firefox <64, IE11).
  useEffect(() => {
    const onChange = () => {
      const d = document as Document & { webkitFullscreenElement?: Element | null };
      setIsNativeFullscreen(!!(d.fullscreenElement || d.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  // Browser shortcuts eat keys games bind: ESC tap exits fullscreen (pause
  // menus), Ctrl+W closes the tab (WASD + Ctrl crouch). Keyboard Lock
  // (Chrome/Edge) forwards locked keys to the game while fullscreen; only
  // press-and-hold ESC exits. Lock persists across fullscreen sessions and
  // also covers fullscreen requested by the game itself. No-op on
  // Firefox/Safari. Not locking Tab on purpose: it would swallow Alt+Tab.
  useEffect(() => {
    const kb = (navigator as Navigator & {
      keyboard?: { lock(keys?: string[]): Promise<void>; unlock(): void };
    }).keyboard;
    if (!kb?.lock) return;
    kb.lock(['Escape', 'KeyW']).catch(() => {});
    return () => kb.unlock();
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

  // Click PLAY → start game AND request fullscreen in same user-gesture tick.
  // Target the wrapper (already mounted) so iframe mounts inside the fullscreen
  // element a render later. Fallback to pseudo-fullscreen on browsers without
  // Element.requestFullscreen (iOS Safari).
  // Native fullscreen, else pseudo-fullscreen (iOS Safari has no
  // requestFullscreen; Chrome rejects with "not granted" outside a gesture).
  const enterFullscreen = (element: HTMLElement) => {
    const el = element as HTMLElement & { webkitRequestFullscreen?: () => void };
    try {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => setIsPseudoFullscreen(true));
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else {
        setIsPseudoFullscreen(true);
      }
    } catch {
      setIsPseudoFullscreen(true);
    }
  };

  const handlePlay = () => {
    setGameStarted(true);
    // Opt-out per game: skip auto-fullscreen when autoFullscreen === false.
    // Manual Fullscreen button stays available.
    if (game?.autoFullscreen === false) return;
    if (gameWrapperRef.current) enterFullscreen(gameWrapperRef.current);
  };

  const handleFullscreen = () => {
    if (isPseudoFullscreen) {
      setIsPseudoFullscreen(false);
      return;
    }

    if (isNativeFullscreen) {
      const d = document as Document & { webkitExitFullscreen?: () => void };
      try {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (d.webkitExitFullscreen) d.webkitExitFullscreen();
      } catch (err) {
        console.error("Exit fullscreen error:", err);
      }
      return;
    }

    if (iframeRef.current) enterFullscreen(iframeRef.current);
  };

  const isFs = isNativeFullscreen || isPseudoFullscreen;

  // Keys go to whatever is focused; without this the first Space/arrow after
  // entering fullscreen scrolls the page instead of reaching the game.
  useEffect(() => {
    if (isFs) iframeRef.current?.focus({ preventScroll: true });
  }, [isFs]);
  const fullscreenLabel = isFs ? uiT('playerExitFullscreen', 'Exit') : t.fullscreen;
  const FsIcon = isFs ? Minimize : Maximize;

  const handleShare = () => {
    setShowShareModal(true);
  };

  const toggleLike = () => {
    const n = !isLiked;
    setIsLiked(n);
    localStorage.setItem(`liked_${id}`, String(n));
  };
  const likeLabel = isLiked ? uiT('unlikeGame', 'Unlike this game') : uiT('likeGame', 'Like this game');

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
  const bgSrc = game.pageBg ?? game.thumbnail;
  const bgUrl = bgSrc.startsWith('http')
    ? bgSrc
    : `${import.meta.env.BASE_URL}${bgSrc}`;

  return (
    <div className="game-player-page" style={{
      backgroundImage: `linear-gradient(rgba(5, 5, 7, 0.8), rgba(5, 5, 7, 0.9)), url(${bgUrl})`
    }}>
      <GameHeadMeta game={game} lang={lang} overlay={overlay} />

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
          <Link to="/">{uiT('breadcrumbHome', 'Home')}</Link>
          <span aria-hidden="true">›</span>
          {game.genres[0] && (
            <>
              <Link to={`/genre/${genreSlug(game.genres[0])}`}>{game.genres[0]}</Link>
              <span aria-hidden="true">›</span>
            </>
          )}
          <span className="breadcrumb-current">{getLocalizedString(game, 'title', lang, overlay)}</span>
        </nav>

        {/* ── Game title + controls in one row ── */}
        <div className="game-header-section">
          <div className="details-header centered-header">
            <h1>{getLocalizedString(game, 'title', lang, overlay)}</h1>
            <div className="game-genres">
              {game.genres.map((g, i) => (
                <Link
                  key={g}
                  to={`/genre/${genreSlug(g)}`}
                  className={`genre-tag ${i === 0 ? 'main' : 'sub'} clickable-genre`}
                  style={{ '--h': GENRE_HUE[g] ?? 260 } as React.CSSProperties}
                >{g}</Link>
              ))}
            </div>
          </div>

          {pb > 0 && (() => {
            const tier = tierOf(game.id, pb);
            const meta = tierMeta(tier);
            const next = nextTierAt(game.id, pb);
            const label = getLocalizedString(game, 'scoreLabel', lang, overlay) || uiT('pbScore', 'Score');
            return (
              <div className="pb-row" aria-live="polite">
                <span className={`pb-chip ${meta ? meta.cls : ''}`}>
                  <Trophy size={14} aria-hidden="true" />
                  <span>{uiT('pbBest', 'Best')} {label}: <strong>{formatScore(pb)}</strong></span>
                  {meta && <span className="pb-tier">{tierLabel(meta, uiT)}</span>}
                </span>
                {isNewBest && <span className="pb-new">{uiT('pbNewBest', 'New best!')}</span>}
                {next !== null && (
                  <span className="pb-next">
                    {uiT('pbNextTier', '{n} to next tier').replace('{n}', formatScore(next - pb))}
                  </span>
                )}
              </div>
            );
          })()}

          <div className="game-controls">
            {gameStarted && (
              <button className="control-btn primary fullscreen-btn" onClick={handleFullscreen} aria-pressed={isFs}>
                <FsIcon size={16} aria-hidden="true" /> {fullscreenLabel}
              </button>
            )}
            <button className={`control-btn like-btn ${isLiked ? 'active' : ''}`} onClick={toggleLike} aria-label={likeLabel}>
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} aria-hidden="true" />
            </button>
            <button className="control-btn share-btn" onClick={() => handleShare()}>
              <LinkIcon size={16} aria-hidden="true" /> {uiT('shareTitle', 'Share')}
            </button>
          </div>
        </div>

        <div ref={gameWrapperRef} className={`game-screen-wrapper ${isPseudoFullscreen ? 'pseudo-fullscreen' : ''} ambient-glow`} style={gameStarted ? wrapperStyle : undefined}>
          {isPseudoFullscreen && (
            <button className="exit-pseudo-btn" onClick={() => setIsPseudoFullscreen(false)}>
              <X size={16} aria-hidden="true" /> {uiT('playerCloseFullscreen', 'Close Fullscreen')}
            </button>
          )}
          {!gameStarted ? (
            <GameHero
              game={game}
              lang={lang}
              overlay={overlay}
              onPlay={handlePlay}
            />
          ) : (
            <>
              {iframeLoading && (
                <div className="iframe-loader">
                  <div className="spinner"></div>
                  <p>{uiT('playerLoadingGame', 'Loading game...')}</p>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={lang === 'en' ? game.gameUrl : `${game.gameUrl}?lang=${lang}`}
                title={getLocalizedString(game, 'title', 'en', null)}
                frameBorder="0"
                allowFullScreen
                allow="fullscreen; autoplay; gamepad; clipboard-write; web-share"
                className="game-iframe"
                onLoad={() => {
                  setIframeLoading(false);
                  iframeRef.current?.focus({ preventScroll: true });
                }}
              ></iframe>
            </>
          )}
        </div>

        <div className="player-ad-container">
          {(!gameStarted || !iframeLoading) && <AdBanner slot={AD_SLOTS.GAME_PLAYER} style={{ margin: '0' }} />}
        </div>

        <GameInfoTabs game={game} lang={lang} overlay={overlay} activeTab={activeTab} setActiveTab={setActiveTab} pb={pb} />

        <CommentSection gameId={game.id} currentNickname={nickname} />

        <RelatedPosts gameSlug={game.slug} />
        <RelatedGames current={game} />
      </main>

      {/* ── Sticky Controls Bar ── */}
      {showStickyBar && !isPseudoFullscreen && gameStarted && (
        <div className="sticky-controls-bar">
          <button className="sticky-btn sticky-fullscreen" onClick={handleFullscreen} aria-pressed={isFs}>
            <FsIcon size={16} aria-hidden="true" /> {fullscreenLabel}
          </button>
          <button className={`sticky-btn sticky-like ${isLiked ? 'liked' : ''}`} aria-label={likeLabel} onClick={toggleLike}>
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
          <button className="sticky-btn sticky-share" onClick={handleShare}>
            <LinkIcon size={16} aria-hidden="true" /> {uiT('shareTitle', 'Share')}
          </button>
        </div>
      )}

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        gameTitle={getLocalizedString(game, 'title', lang, overlay)}
        gameUrl={`https://arcadedeck.net/play/${game.slug}`}
      />
    </div>
  );
};

export default GamePlayer;
