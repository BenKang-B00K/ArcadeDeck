import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { games } from '../data/games';
import type { Game } from '../data/games';
import Navbar from '../components/Navbar';
import Leaderboard from '../components/Leaderboard';
import AdBanner from '../components/AdBanner';
import CommentSection from '../components/CommentSection';
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
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [nickname] = useState<string>(localStorage.getItem('player_nickname') || 'Explorer');
  const [lastSave, setLastSave] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [lang, setLang] = useState<'en' | 'ko'>('en');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
    overview: lang === 'en' ? '📖 Overview' : '📖 게임 개요',
    howToPlay: lang === 'en' ? '🕹️ Controls' : '🕹️ 조작 방법',
    tips: lang === 'en' ? '💡 Pro Tips' : '💡 플레이 팁',
    lore: lang === 'en' ? '📜 World Lore' : '📜 게임 세계관',
    features: lang === 'en' ? '✨ Key Features' : '✨ 주요 특징',
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
      let q;
      if (['2', '7', '8', '9', '10', '11'].includes(id)) {
        q = query(
          collection(db, "leaderboards"),
          where("gameId", "==", id),
          orderBy("score", "desc"),
          orderBy("subScore", "desc"),
          limit(100) 
        );
      } else {
        q = query(
          collection(db, "leaderboards"),
          where("gameId", "==", id),
          orderBy("score", "desc"),
          limit(100) 
        );
      }
      
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
        return [];
      }
    }
  };

  useEffect(() => {
    const foundGame = games.find(g => g.id === id);
    if (foundGame) {
      setGame(foundGame);
      const savedTime = localStorage.getItem(`game_save_${foundGame.id}`);
      if (savedTime) setLastSave(savedTime);

      // Recently Played Logic
      const recentlyPlayed = JSON.parse(localStorage.getItem('recently_played') || '[]');
      const updatedList = [foundGame.id, ...recentlyPlayed.filter((gid: string) => gid !== foundGame.id)].slice(0, 4);
      localStorage.setItem('recently_played', JSON.stringify(updatedList));
    }
    fetchLeaderboard();
    window.scrollTo(0, 0);

    const handleMessage = (event: MessageEvent) => {
      const types = ['GAME_SCORE', 'SCORE_UPDATE', 'gameOver', 'GAME_OVER'];
      if (event.data && types.includes(event.data.type)) {
        const rawScore = event.data.score;
        const rawSubScore = event.data.subScore;
        
        const score = typeof rawScore === 'number' ? rawScore : Number(rawScore);
        const subScore = typeof rawSubScore === 'number' ? rawSubScore : (rawSubScore !== undefined ? Number(rawSubScore) : undefined);
        
        if (rawScore !== undefined && !isNaN(score)) {
          handleGameComplete(score, subScore);
        }
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

  const handleGameComplete = async (score: number, subScore?: number) => {
    if (!id) return;

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
        const prevScore = Number(prevData.score) || 0;
        const prevSubScore = Number(prevData.subScore) || 0;

        let isNewBest = false;
        
        if (id === '5') { 
          if (score > prevScore) {
            isNewBest = true;
          } else if (score === prevScore && currentSubScore < prevSubScore) {
            isNewBest = true;
          }
        } else {
          if (score > prevScore) {
            isNewBest = true;
          } else if (score === prevScore && currentSubScore > prevSubScore) {
            isNewBest = true;
          }
        }

        if (isNewBest) {
          await updateDoc(doc(db, "leaderboards", docSnap.id), {
            score: score,
            subScore: currentSubScore,
            createdAt: serverTimestamp()
          });
          
          if (id === '2') {
            showNotification(`${t.bestScore} 🔥 ${score} (Best Planet Level: Lv.${currentSubScore})`, 'success');
          } else if (id === '7') {
            showNotification(`${t.bestScore} 🔥 ${score} level (Clicks: ${currentSubScore})`, 'success');
          } else if (id === '8') {
            showNotification(`${t.bestScore} 🔥 ${score}% (Wins: ${currentSubScore})`, 'success');
          } else if (id === '9') {
            showNotification(`${t.bestScore} 🔥 Stage ${score} (Artifacts: ${currentSubScore})`, 'success');
          } else if (id === '10') {
            showNotification(`${t.bestScore} 🔥 ${score} Waves (Battles: ${currentSubScore})`, 'success');
          } else {
            const subLabel = id === '1' ? '' : (id === '5' ? 'Merges' : 'SubScore');
            const unit = id === '1' ? ' Depth' : (id === '5' ? ' pts' : '');
            const subScoreMsg = subLabel ? ` (${subLabel}: ${currentSubScore})` : '';
            showNotification(`${t.bestScore} 🔥 ${score.toLocaleString()}${unit}${subScoreMsg}`, 'success');
          }
        } else {
          if (id === '2') {
            showNotification(`${t.currentProgress} ${score} (Planet Level: Lv.${currentSubScore})`, 'info');
          } else if (id === '7') {
            showNotification(`${t.gameOver} ${score} level (Clicks: ${currentSubScore})`, 'info');
          } else if (id === '8') {
            showNotification(`${t.gameOver} ${score}% (Wins: ${currentSubScore}) (Best: ${prevScore}%)`, 'info');
          } else if (id === '9') {
            showNotification(`${t.gameOver} Stage ${score} (Artifacts: ${currentSubScore}) (Best: Stage ${prevScore})`, 'info');
          } else if (id === '10') {
            showNotification(`${t.gameOver} ${score} Waves (Battles: ${currentSubScore}) (Best: ${prevScore} Waves)`, 'info');
          } else {
            const subLabel = id === '1' ? '' : (id === '5' ? 'Merges' : 'SubScore');
            const unit = id === '1' ? ' Depth' : (id === '5' ? ' pts' : '');
            const subScoreMsg = subLabel ? ` (${subLabel}: ${currentSubScore})` : '';
            showNotification(`${t.gameOver} ${score.toLocaleString()}${unit}${subScoreMsg} (Best: ${prevScore.toLocaleString()})`, 'info');
          }
        }
      } else {
        await addDoc(collection(db, "leaderboards"), {
          gameId: id,
          name: nickname,
          score: score,
          subScore: currentSubScore,
          createdAt: serverTimestamp()
        });

        if (id === '2') {
          showNotification(`${t.scoreSubmitted} 🏆 ${score} (Planet Level: Lv.${currentSubScore})`, 'success');
        } else if (id === '7') {
          showNotification(`${t.scoreSubmitted} 🏆 ${score} level (Clicks: ${currentSubScore})`, 'success');
        } else if (id === '8') {
          showNotification(`${t.scoreSubmitted} 🏆 ${score}% (Wins: ${currentSubScore})`, 'success');
        } else if (id === '9') {
          showNotification(`${t.scoreSubmitted} 🏆 Stage ${score} (Artifacts: ${currentSubScore})`, 'success');
        } else if (id === '10') {
          showNotification(`${t.scoreSubmitted} 🏆 ${score} Waves (Battles: ${currentSubScore})`, 'success');
        } else {
          const subLabel = id === '1' ? '' : (id === '5' ? 'Merges' : 'SubScore');
          const unit = id === '1' ? ' Depth' : (id === '5' ? ' pts' : '');
          const subScoreMsg = subLabel ? ` (${subLabel}: ${currentSubScore})` : '';
          showNotification(`${t.scoreSubmitted} 🏆 ${score.toLocaleString()}${unit}${subScoreMsg}`, 'success');
        }
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

  const handleFullscreen = () => {
    const element = iframeRef.current as any;
    if (!element) return;

    try {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
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
    navigator.clipboard.writeText(window.location.href);
    showNotification(lang === 'en' ? 'Link copied to clipboard! 🔗' : '링크가 클립보드에 복사되었습니다! 🔗', 'success');
  };

  if (!game) return <div className="not-found"><h2>Not found</h2><Link to="/">Home</Link></div>;

  const getWrapperStyle = () => {
    const ratio = game.aspectRatio || '16/9';
    const [wStr, hStr] = ratio.split('/');
    const w = parseInt(wStr);
    const h = parseInt(hStr);
    const rNum = w / h;

    if (ratio === '16/9') {
      return { 
        width: `min(95vw, calc(85vh * ${rNum}))`, 
        maxWidth: '1200px', 
        aspectRatio: '16/9',
        margin: '0 auto 50px auto',
        display: 'block'
      };
    } else if (ratio === '1/1' || ratio === '16/16') {
      return { 
        width: `min(95vw, 85vh, 800px)`, 
        maxWidth: '100%',
        aspectRatio: '1/1',
        margin: '0 auto 50px auto',
        display: 'block'
      };
    } else if (ratio === '9/16') {
      return { 
        width: `min(95vw, calc(85vh * ${rNum}), 700px)`, 
        maxWidth: '100%',
        aspectRatio: '9/16',
        margin: '0 auto 50px auto',
        display: 'block'
      };
    }
    
    // Default fallback
    return { 
      width: `min(95vw, calc(85vh * ${rNum}), 1200px)`, 
      maxWidth: '100%',
      aspectRatio: ratio,
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
        <title>{lang === 'ko' ? game.titleKo : game.title} - Play Free on ArcadeDeck</title>
        <meta name="description" content={lang === 'ko' ? game.descriptionKo : game.description} />
        <meta property="og:title" content={`${lang === 'ko' ? game.titleKo : game.title} - ArcadeDeck`} />
        <meta property="og:description" content={lang === 'ko' ? game.descriptionKo : game.description} />
      </Helmet>
      
      {notification && (
        <div className={`notification-toast ${notification.type} animate-in`}>
          <span className="notification-message">{notification.message}</span>
        </div>
      )}

      <Navbar />
      <div className="container player-container">
        <div className="player-header-flex">
          <div className="player-info-container">
            <div className="nickname-display-static">
              <span className="player-label">{t.player}:</span>
              <span className="player-name-val">{nickname}</span>
            </div>
            <button 
              className="lang-toggle-btn-modern" 
              onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
            >
              <span className="icon">🌐</span> {lang === 'en' ? '한국어' : 'English'}
            </button>
          </div>
          <Link to="/" className="back-button-modern">
            <span className="icon">🏡</span> {t.back}
          </Link>
        </div>

        <div className="game-header-section">
          <div className="details-header centered-header">
            {game.isOriginal && <div className="original-badge-player">{t.original}</div>}
            <h1>{lang === 'ko' ? game.titleKo : game.title}</h1>
            <div className="badge-row">
              <span className="genre-label">{game.genres[0]}</span>
              {lastSave && <span className="save-badge">{t.last}: {lastSave}</span>}
            </div>
          </div>

          <div className="game-controls">
            <button className="control-btn primary fullscreen-btn" onClick={handleFullscreen}>
              <span className="icon">⛶</span> {t.fullscreen}
            </button>
            <button className={`control-btn like-btn ${isLiked ? 'active' : ''}`} onClick={() => setIsLiked(!isLiked)}>
              {isLiked ? '❤️' : '🤍'}
            </button>
            <button className="control-btn share-btn" onClick={handleShare}>
              <span className="icon">🔗</span> {t.share}
            </button>
          </div>
        </div>

        <div className={`game-screen-wrapper ${isPseudoFullscreen ? 'pseudo-fullscreen' : ''} ambient-glow`} style={wrapperStyle}>
          {isPseudoFullscreen && (
            <button className="exit-pseudo-btn" onClick={() => setIsPseudoFullscreen(false)}>
              ✕ {lang === 'en' ? 'Close Fullscreen' : '전체화면 닫기'}
            </button>
          )}
          {iframeLoading && (
            <div className="iframe-loader">
              <div className="spinner"></div>
              <p>{lang === 'en' ? 'Loading game...' : '게임을 불러오는 중...'}</p>
            </div>
          )}
          <iframe 
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
          <AdBanner style={{ margin: '0' }} />
        </div>

        <div className="game-details-modern">
          <section className="detail-card overview-card">
            <h2 className="detail-title">{t.overview}</h2>
            <div className="detail-content">
              {lang === 'ko' ? game.fullDescriptionKo : game.fullDescription}
            </div>
          </section>

          <div className="detail-grid">
            <section className="detail-card control-card">
              <h2 className="detail-title">{t.howToPlay}</h2>
              <div className="detail-content highlight">
                {lang === 'ko' ? game.controlsKo : game.controls}
              </div>
            </section>

            {(game.tips || game.tipsKo) && (
              <section className="detail-card tips-card">
                <h2 className="detail-title">{t.tips}</h2>
                <div className="detail-content tip-highlight">
                  {lang === 'ko' ? game.tipsKo : game.tips}
                </div>
              </section>
            )}
          </div>

          <div className="detail-grid-secondary">
            {(game.lore || game.loreKo) && (
              <section className="detail-card lore-card">
                <h2 className="detail-title">{t.lore}</h2>
                <div className="detail-content italic">
                  {lang === 'ko' ? game.loreKo : game.lore}
                </div>
              </section>
            )}

            {((game.features && game.features.length > 0) || (game.featuresKo && game.featuresKo.length > 0)) && (
              <section className="detail-card features-card">
                <h2 className="detail-title">{t.features}</h2>
                <div className="detail-content">
                  <ul className="feature-tags">
                    {(lang === 'ko' ? game.featuresKo : game.features)?.map((feat, idx) => (
                      <li key={idx} className="feature-tag-item">#{feat}</li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </div>
        </div>

        <Leaderboard entries={leaderboard} gameId={game.id} currentNickname={nickname} />
        <CommentSection gameId={game.id} currentNickname={nickname} />
      </div>

      {showLeaderboard && (
        <div className="leaderboard-modal-overlay" onClick={() => setShowLeaderboard(false)}>
          <div className="leaderboard-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setShowLeaderboard(false)}>✕</button>
            <div className="modal-inner-scroll">
              <Leaderboard entries={leaderboard} gameId={game.id} currentNickname={nickname} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePlayer;
