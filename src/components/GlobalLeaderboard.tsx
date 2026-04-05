import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { games } from '../data/games';
import './GlobalLeaderboard.css';

interface GlobalRank {
  name: string;
  totalPoints: number;
  medals: { gold: number, silver: number, bronze: number };
  originalRank?: number;
}

interface GlobalLeaderboardProps {
  onDataLoaded?: (players: GlobalRank[]) => void;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'arcadedeck_rank_cache';

function getCachedRanks(): GlobalRank[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { sorted, expiresAt } = JSON.parse(raw);
    if (Date.now() < expiresAt) return sorted;
    sessionStorage.removeItem(CACHE_KEY);
  } catch { /* ignore corrupt cache */ }
  return null;
}

function setCachedRanks(sorted: GlobalRank[]): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ sorted, expiresAt: Date.now() + CACHE_TTL_MS }));
  } catch { /* storage full — ignore */ }
}

const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({ onDataLoaded }) => {
  const [podiumPlayers, setPodiumPlayers] = useState<GlobalRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const isInitialMount = useRef(true);
  const isFetchingRef = useRef(false);

  const buildPodium = (sorted: GlobalRank[]) => {
    // Podium Order: 2nd - 1st - 3rd
    return [sorted[1], sorted[0], sorted[2]].filter(p => p !== undefined);
  };

  const applyResult = useCallback((sorted: GlobalRank[]) => {
    const withRank = sorted.map((p, i) => ({ ...p, originalRank: i + 1 }));
    setPodiumPlayers(buildPodium(withRank));
    if (onDataLoaded) onDataLoaded(withRank);
    setLoading(false);
    setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [onDataLoaded]);

  const calculateGlobalRanking = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    // Return cached result if still fresh
    const cached = getCachedRanks();
    if (cached) {
      applyResult(cached);
      isFetchingRef.current = false;
      return;
    }

    const playerPoints: Record<string, GlobalRank> = {};

    try {
      const promises = games.map(async (game) => {
        const dualSort = game.leaderboard?.dualSort ?? false;
        const q = dualSort
          ? query(
              collection(db, "leaderboards"),
              where("gameId", "==", game.id),
              orderBy("score", "desc"),
              orderBy("subScore", "desc"),
              limit(3)
            )
          : query(
              collection(db, "leaderboards"),
              where("gameId", "==", game.id),
              orderBy("score", "desc"),
              limit(3)
            );

        const snapshot = await getDocs(q);
        snapshot.docs.forEach((doc, index) => {
          const data = doc.data();
          const name = data.name;
          const rank = index + 1;
          const points = rank === 1 ? 3 : rank === 2 ? 2 : 1;

          if (!playerPoints[name]) {
            playerPoints[name] = {
              name,
              totalPoints: 0,
              medals: { gold: 0, silver: 0, bronze: 0 }
            };
          }

          playerPoints[name].totalPoints += points;
          if (rank === 1) playerPoints[name].medals.gold++;
          if (rank === 2) playerPoints[name].medals.silver++;
          if (rank === 3) playerPoints[name].medals.bronze++;
        });
      });

      await Promise.all(promises);

      const sorted = Object.values(playerPoints)
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 3);

      setCachedRanks(sorted);

      applyResult(sorted);
    } catch (err) {
      console.error("Error calculating global ranking:", err);
      setError("Failed to load rankings.");
      setLoading(false);
    } finally {
      isFetchingRef.current = false;
    }
  }, [applyResult]);

  const handleRefresh = useCallback(async () => {
    sessionStorage.removeItem(CACHE_KEY);
    setIsSyncing(true);
    await calculateGlobalRanking();
    setIsSyncing(false);
  }, [calculateGlobalRanking]);

  useEffect(() => {
    if (isInitialMount.current) {
      calculateGlobalRanking();
      isInitialMount.current = false;
    }
  }, [calculateGlobalRanking]);

  if (loading) return <div className="global-loader">Loading Hall of Fame...</div>;
  if (error) return <div className="global-loader" style={{ color: '#ff6b6b' }}>{error}</div>;
  if (podiumPlayers.length === 0) return null;

  return (
    <div className="global-leaderboard-section">
      <h2 className="section-title">🏆 Global Ranking</h2>
      <p className="section-subtitle">The Best Players of ArcadeDeck</p>

      <div className="hall-of-fame-podium">
        {podiumPlayers.map((player) => (
          <div key={player.name} className={`podium-card rank-${player.originalRank}`}>
            <div className="podium-crown">{player.originalRank === 1 ? '👑' : ''}</div>
            <div className="podium-rank-badge">{player.originalRank}</div>
            <div className="podium-info">
              <div className="podium-name">{player.name}</div>

              <div className="medal-case">
                {player.medals.gold > 0 && <span className="medal gold">🥇{player.medals.gold}</span>}
                {player.medals.silver > 0 && <span className="medal silver">🥈{player.medals.silver}</span>}
                {player.medals.bronze > 0 && <span className="medal bronze">🥉{player.medals.bronze}</span>}
              </div>

              <div className="podium-points">
                <span className="points-num">{player.totalPoints}</span>
                <span className="points-label">PTS</span>
              </div>
            </div>
            <div className="podium-base"></div>
          </div>
        ))}
      </div>

      <div className="hall-of-fame-footer">
        <Link to="/hall-of-fame" className="hof-link-btn">
          <span className="icon">🏆</span> Hall of Fame
        </Link>
        <div className="point-info">
          * 1st: 3pts | 2nd: 2pts | 3rd: 1pt
        </div>
        <div className="refresh-area">
          {lastUpdated && (
            <span className="last-updated-label">Updated {lastUpdated}</span>
          )}
          <button className="refresh-btn" onClick={handleRefresh} disabled={isSyncing}>
            {isSyncing ? '⏳ Syncing...' : '🔄 Sync Stats'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalLeaderboard;
