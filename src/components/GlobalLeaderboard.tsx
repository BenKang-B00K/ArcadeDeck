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

const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({ onDataLoaded }) => {
  const [podiumPlayers, setPodiumPlayers] = useState<GlobalRank[]>([]);
  const [loading, setLoading] = useState(true);
  const isInitialMount = useRef(true);

  const calculateGlobalRanking = useCallback(async () => {
    setLoading(true);
    const playerPoints: Record<string, GlobalRank> = {};

    try {
      const promises = games.map(async (game) => {
        let q;
        if (['2', '7', '8', '9', '10', '11', '12', '13'].includes(game.id)) {
          q = query(
            collection(db, "leaderboards"),
            where("gameId", "==", game.id),
            orderBy("score", "desc"),
            orderBy("subScore", "desc"),
            limit(3)
          );
        } else {
          q = query(
            collection(db, "leaderboards"),
            where("gameId", "==", game.id),
            orderBy("score", "desc"),
            limit(3)
          );
        }

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
        .slice(0, 3)
        .map((p, i) => ({ ...p, originalRank: i + 1 }));

      // Podium Order: 2nd - 1st - 3rd
      const podiumOrder = [
        sorted[1], // 2nd
        sorted[0], // 1st
        sorted[2], // 3rd
      ].filter(p => p !== undefined);

      setPodiumPlayers(podiumOrder);
      
      // Notify parent after setting local state
      if (onDataLoaded) {
        onDataLoaded(sorted);
      }
    } catch (error) {
      console.error("Error calculating global ranking:", error);
    } finally {
      setLoading(false);
    }
  }, [onDataLoaded]);

  useEffect(() => {
    if (isInitialMount.current) {
      calculateGlobalRanking();
      isInitialMount.current = false;
    }
  }, [calculateGlobalRanking]);

  if (loading) return <div className="global-loader">Loading Hall of Fame...</div>;
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
        <button className="refresh-btn" onClick={calculateGlobalRanking}>
          🔄 Sync Stats
        </button>
      </div>
    </div>
  );
};

export default GlobalLeaderboard;

