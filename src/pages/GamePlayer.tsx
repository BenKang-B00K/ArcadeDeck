import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Maximize, Heart, Link as LinkIcon, Home, Globe, Gamepad2, BookOpen, Joystick, Lightbulb, ScrollText, Sparkles, X } from 'lucide-react';
import { games } from '../data/games';
import type { Game } from '../data/games';
import Navbar from '../components/Navbar';
import Leaderboard from '../components/Leaderboard';
import AdBanner from '../components/AdBanner';
import CommentSection from '../components/CommentSection';
import ShareModal from '../components/ShareModal';
import GameResultModal from '../components/GameResultModal';
import GameCard from '../components/GameCard';
import { isNewPersonalBest } from '../utils/leaderboardUtils';
import { MAX_SCORE, AD_SLOTS } from '../constants/gameConstants';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc
} from "firebase/firestore";
import './GamePlayer.css';

interface LeaderboardEntry {
  name: string;
  score: number;
  subScore?: number;
  date: string;
}

const GamePlayer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  // Support both slug-based (/play/gate-of-hell) and legacy id-based (/play/1) URLs
  const id = games.find(g => g.slug === slug)?.id ?? slug;
  const [game, setGame] = useState<Game | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [nickname] = useState<string>(localStorage.getItem('player_nickname') || 'Explorer');
  const [isLiked, setIsLiked] = useState<boolean>(() =>
    localStorage.getItem(`liked_${id}`) === 'true'
  );
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [lang, setLang] = useState<'en' | 'ko'>('en');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [gameResult, setGameResult] = useState<{
    score: number; unit: string;
    resultType: 'personal-best' | 'first-score' | 'game-over';
    rank: number | null;
  } | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [, setOrientationTick] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const gameWrapperRef = useRef<HTMLDivElement>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const t = {
    back: lang === 'en' ? 'Arcade Deck' : '아케이드 홈',
    player: lang === 'en' ? 'Player' : '플레이어',
    edit: lang === 'en' ? 'Edit' : '편집',
    save: lang === 'en' ? 'Save' : '저장',
    fullscreen: lang === 'en' ? 'Fullscreen' : '전체화면',
    load: lang === 'en' ? 'Load' : '불러오기',
    share: lang === 'en' ? 'Share' : '공유',
    overview: lang === 'en' ? 'Overview' : '게임 개요',
    howToPlay: lang === 'en' ? 'Controls' : '조작 방법',
    tips: lang === 'en' ? 'Pro Tips' : '플레이 팁',
    lore: lang === 'en' ? 'World Lore' : '게임 세계관',
    features: lang === 'en' ? 'Key Features' : '주요 특징',
    original: lang === 'en' ? 'Original Content' : '오리지널 콘텐츠',
    last: lang === 'en' ? 'Last' : '최근',
    bestScore: lang === 'en' ? 'New Personal Best!' : '새로운 개인 최고 기록!',
    gameOver: lang === 'en' ? 'Game Over!' : '게임 종료!',
    scoreSubmitted: lang === 'en' ? 'Score submitted!' : '점수가 등록되었습니다!',
    currentProgress: lang === 'en' ? 'Current Progress:' : '현재 진행 상황:',
  };

  const fetchLeaderboard = async () => {
    if (!id) return [];
    try {
      const dualSort = games.find(g => g.id === id)?.leaderboard?.dualSort ?? false;
      const q = dualSort
        ? query(collection(db, "leaderboards"), where("gameId", "==", id), orderBy("score", "desc"), orderBy("subScore", "desc"), limit(100))
        : query(collection(db, "leaderboards"), where("gameId", "==", id), orderBy("score", "desc"), limit(100));
      
      const querySnapshot = await getDocs(q);
      const entries = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          name: data.name,
          score: data.score,
          subScore: Number(data.subScore) || 0,
          date: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : 'Unknown'
        };
      }) as LeaderboardEntry[];

      setLeaderboard(entries);
      return entries;
    } catch (error) {
      console.error("Error fetching leaderboard: ", error);
      try {
        const qSimple = query(
          collection(db, "leaderboards"),
          where("gameId", "==", id),
          limit(100)
        );
        const snapSimple = await getDocs(qSimple);
        const simpleEntries = snapSimple.docs.map(doc => {
          const data = doc.data();
          return {
            name: data.name,
            score: data.score,
            subScore: Number(data.subScore) || 0,
            date: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : 'Unknown'
          };
        }) as LeaderboardEntry[];
        setLeaderboard(simpleEntries);
        return simpleEntries;
      } catch (e) {
        console.error("Critical leaderboard error:", e);
        showNotification(lang === 'ko' ? '리더보드를 불러올 수 없습니다.' : 'Failed to load leaderboard.', 'error');
        return [];
      }
    }
  };

  const handleGameComplete = async (score: number, subScore?: number) => {
    if (!id) return;

    // Resolve leaderboard display config from games data (no hardcoded IDs)
    const lb = games.find(g => g.id === id)?.leaderboard;
    const primaryUnit    = lb?.primaryUnit    ?? '';
    const secondaryLabel = lb?.secondaryLabel ?? '';
    const secondaryUnit  = lb?.secondaryUnit  ?? '';
    const subSortAsc     = lb?.subSortAsc     ?? false;

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
            `${t.gameOver} ${score.toLocaleString()}${primaryUnit}${buildSubPart(currentSubScore)} (Best: ${prevScore.toLocaleString()}${primaryUnit})`,
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
    }
  };

  useEffect(() => {
    const foundGame = games.find(g => g.id === id);
    if (foundGame) {
      setGame(foundGame);

      // Recently Played Logic
      const recentlyPlayed = JSON.parse(localStorage.getItem('recently_played') || '[]');
      const updatedList = [foundGame.id, ...recentlyPlayed.filter((gid: string) => gid !== foundGame.id)].slice(0, 4);
      localStorage.setItem('recently_played', JSON.stringify(updatedList));
    }
    fetchLeaderboard();
    window.scrollTo(0, 0);

    // Derive the allowed origin from the game's iframe URL
    let allowedOrigin: string | null = null;
    if (foundGame?.gameUrl) {
      try {
        allowedOrigin = new URL(foundGame.gameUrl).origin;
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

        handleGameComplete(score, safeSubScore);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [id, nickname]);

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
      <Helmet>
        <html lang={lang === 'ko' ? 'ko' : 'en'} />
        <title>{lang === 'ko' ? game.titleKo : game.title} - Play Free on ArcadeDeck</title>
        <meta name="description" content={lang === 'ko' ? `${game.titleKo}: ${game.descriptionKo} ArcadeDeck에서 무료로 즐기세요!` : `Play ${game.title}: ${game.description} Free online browser game on ArcadeDeck.`} />
        <meta name="keywords" content={`${game.title}, ${game.genres.join(', ')}, free online game, browser game, arcadedeck`} />
        <link rel="canonical" href={`https://arcadedeck.net/play/${game.slug}`} />

        {/* Open Graph & Twitter Card */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="ArcadeDeck" />
        <meta property="og:locale" content={lang === 'ko' ? 'ko_KR' : 'en_US'} />
        <meta property="og:locale:alternate" content={lang === 'ko' ? 'en_US' : 'ko_KR'} />
        <meta property="og:title" content={`${lang === 'ko' ? game.titleKo : game.title} - ArcadeDeck`} />
        <meta property="og:description" content={lang === 'ko' ? game.descriptionKo : game.description} />
        <meta property="og:image" content={`https://arcadedeck.net/${encodeURI(game.thumbnail)}`} />
        <meta property="og:url" content={`https://arcadedeck.net/play/${game.slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${lang === 'ko' ? game.titleKo : game.title} - ArcadeDeck`} />
        <meta name="twitter:description" content={lang === 'ko' ? game.descriptionKo : game.description} />
        <meta name="twitter:image" content={`https://arcadedeck.net/${encodeURI(game.thumbnail)}`} />

        {/* JSON-LD Structured Data — VideoGame schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoGame",
            "name": game.title,
            "alternateName": game.titleKo,
            "description": game.description,
            "genre": game.genres,
            "applicationCategory": "GameApplication",
            "operatingSystem": "Web Browser",
            "inLanguage": ["en", "ko"],
            "image": `https://arcadedeck.net/${encodeURI(game.thumbnail)}`,
            "url": `https://arcadedeck.net/play/${game.slug}`,
            "author": {
              "@type": "Organization",
              "name": "ArcadeDeck",
              "url": "https://arcadedeck.net"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            }
          })}
        </script>
      </Helmet>
      
      {notification && (
        <div className={`notification-toast ${notification.type} animate-in`}>
          <span className="notification-message">{notification.message}</span>
        </div>
      )}

      <Navbar />
      <div className="container player-container">
        {/* ── Compact top bar: back + player + lang ── */}
        <div className="player-header-flex">
          <Link to="/" className="back-button-modern">
            <Home size={16} aria-hidden="true" /> {t.back}
          </Link>
          <div className="player-info-container">
            <span className="player-name-val">{nickname}</span>
            <button
              className="lang-toggle-btn-modern"
              onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
              aria-label="Toggle language"
            >
              <Globe size={14} aria-hidden="true" /> {lang === 'en' ? 'KO' : 'EN'}
            </button>
          </div>
        </div>

        {/* ── Game title + controls in one row ── */}
        <div className="game-header-section">
          <div className="details-header centered-header">
            <h1>{lang === 'ko' ? game.titleKo : game.title}</h1>
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
              <X size={16} aria-hidden="true" /> {lang === 'en' ? 'Close Fullscreen' : '전체화면 닫기'}
            </button>
          )}
          {iframeLoading && (
            <div className="iframe-loader">
              <div className="spinner"></div>
              <p>{lang === 'en' ? 'Loading game...' : '게임을 불러오는 중...'}</p>
            </div>
          )}
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={game.gameUrl}
            title={game.title}
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

        {/* ── Info Sections (all visible for SEO + AdSense content depth) ── */}
        <div className="game-info-tabs">
          <nav className="tab-nav" aria-label={lang === 'ko' ? '게임 정보 바로가기' : 'Jump to game info'}>
            <a href="#section-overview" className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <BookOpen size={14} aria-hidden="true" /> {lang === 'ko' ? '개요' : 'Overview'}
            </a>
            <a href="#section-controls" className={`tab-btn ${activeTab === 'controls' ? 'active' : ''}`} onClick={() => setActiveTab('controls')}>
              <Joystick size={14} aria-hidden="true" /> {lang === 'ko' ? '조작법' : 'Controls'}
            </a>
            {(game.tips || game.tipsKo) && (
              <a href="#section-tips" className={`tab-btn ${activeTab === 'tips' ? 'active' : ''}`} onClick={() => setActiveTab('tips')}>
                <Lightbulb size={14} aria-hidden="true" /> {lang === 'ko' ? '팁' : 'Tips'}
              </a>
            )}
            {(game.lore || game.loreKo) && (
              <a href="#section-lore" className={`tab-btn ${activeTab === 'lore' ? 'active' : ''}`} onClick={() => setActiveTab('lore')}>
                <ScrollText size={14} aria-hidden="true" /> {lang === 'ko' ? '세계관' : 'Lore'}
              </a>
            )}
            {((game.features?.length ?? 0) > 0) && (
              <a href="#section-features" className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`} onClick={() => setActiveTab('features')}>
                <Sparkles size={14} aria-hidden="true" /> {lang === 'ko' ? '특징' : 'Features'}
              </a>
            )}
          </nav>

          <section id="section-overview" className="info-section detail-card">
            <h2 className="info-section-title"><BookOpen size={18} aria-hidden="true" /> {lang === 'ko' ? '개요' : 'Overview'}</h2>
            <div className="detail-content">{lang === 'ko' ? game.fullDescriptionKo : game.fullDescription}</div>
          </section>
          <section id="section-controls" className="info-section detail-card">
            <h2 className="info-section-title"><Joystick size={18} aria-hidden="true" /> {lang === 'ko' ? '조작법' : 'Controls'}</h2>
            <div className="detail-content highlight">{lang === 'ko' ? game.controlsKo : game.controls}</div>
          </section>
          {(game.tips || game.tipsKo) && (
            <section id="section-tips" className="info-section detail-card">
              <h2 className="info-section-title"><Lightbulb size={18} aria-hidden="true" /> {lang === 'ko' ? '팁' : 'Pro Tips'}</h2>
              <div className="detail-content tip-highlight">{lang === 'ko' ? game.tipsKo : game.tips}</div>
            </section>
          )}
          {(game.lore || game.loreKo) && (
            <section id="section-lore" className="info-section detail-card">
              <h2 className="info-section-title"><ScrollText size={18} aria-hidden="true" /> {lang === 'ko' ? '세계관' : 'World Lore'}</h2>
              <div className="detail-content italic">{lang === 'ko' ? game.loreKo : game.lore}</div>
            </section>
          )}
          {((game.features?.length ?? 0) > 0) && (
            <section id="section-features" className="info-section detail-card">
              <h2 className="info-section-title"><Sparkles size={18} aria-hidden="true" /> {lang === 'ko' ? '특징' : 'Key Features'}</h2>
              <ul className="feature-tags">
                {(lang === 'ko' ? game.featuresKo : game.features)?.map((feat, idx) => (
                  <li key={idx} className="feature-tag-item">#{feat}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <Leaderboard entries={leaderboard} gameId={game.id} currentNickname={nickname} />
        <CommentSection gameId={game.id} currentNickname={nickname} />

        {/* ── Related Games ── */}
        {(() => {
          const related = games.filter(
            g => g.id !== game.id &&
                 g.status !== 'IN PRODUCTION' &&
                 g.genres.some(genre => game.genres.includes(genre))
          ).slice(0, 3);
          if (related.length === 0) return null;
          return (
            <div className="related-games-section">
              <h3 className="related-games-title">
                <Gamepad2 size={18} aria-hidden="true" /> {lang === 'ko' ? '비슷한 게임' : 'You Might Also Like'}
              </h3>
              <div className="related-games-grid">
                {related.map(g => <GameCard key={g.id} game={g} />)}
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── Sticky Controls Bar ── */}
      {showStickyBar && !isPseudoFullscreen && (
        <div className="sticky-controls-bar">
          <button className="sticky-btn sticky-fullscreen" onClick={handleFullscreen}>
            <Maximize size={16} aria-hidden="true" /> {lang === 'ko' ? '전체화면' : 'Fullscreen'}
          </button>
          <button className={`sticky-btn sticky-like ${isLiked ? 'liked' : ''}`} aria-label={isLiked ? 'Unlike this game' : 'Like this game'} onClick={() => { const n = !isLiked; setIsLiked(n); localStorage.setItem(`liked_${id}`, String(n)); }}>
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
          <button className="sticky-btn sticky-share" onClick={handleShare}>
            <LinkIcon size={16} aria-hidden="true" /> {lang === 'ko' ? '공유' : 'Share'}
          </button>
        </div>
      )}

      {showLeaderboard && (
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
        gameTitle={lang === 'ko' ? (game.titleKo ?? game.title) : game.title}
        gameUrl={`https://arcadedeck.net/play/${game.slug}`}
        lang={lang}
      />

      <GameResultModal
        isOpen={gameResult !== null}
        onClose={() => setGameResult(null)}
        gameTitle={lang === 'ko' ? (game.titleKo ?? game.title) : game.title}
        gameSlug={game.slug}
        score={gameResult?.score ?? 0}
        scoreUnit={gameResult?.unit ?? ''}
        resultType={gameResult?.resultType ?? 'game-over'}
        rank={gameResult?.rank ?? null}
        lang={lang}
        onPlayAgain={() => { setIframeKey(k => k + 1); setIframeLoading(true); }}
      />
    </div>
  );
};

export default GamePlayer;
