import React from 'react';
import { games } from '../data/games';
import { compareLeaderboardEntries } from '../utils/leaderboardUtils';
import './Leaderboard.css';

interface LeaderboardEntry {
  name: string;
  score: number;
  subScore?: number;
  date: string;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  gameId?: string;
  currentNickname?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ entries, gameId, currentNickname }) => {
  const lb = games.find(g => g.id === gameId)?.leaderboard;

  const label      = lb?.primaryLabel   ?? 'Score';
  const unit       = lb?.primaryUnit    ?? '';
  const subLabel   = lb?.secondaryLabel ?? '';
  const subUnit    = lb?.secondaryUnit  ?? '';
  const title      = lb?.title          ?? 'Global Leaderboard';
  const subSortAsc = lb?.subSortAsc     ?? false;

  const top10 = [...entries]
    .sort((a, b) => compareLeaderboardEntries(a, b, subSortAsc))
    .slice(0, 10);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank >= 4 && rank <= 8) return '🔥';
    return rank;
  };

  const getEncouragement = (rank: number) => {
    if (rank >= 4 && rank <= 6) return "Almost There!";
    if (rank >= 7 && rank <= 8) return "Keep Pushing!";
    return "";
  };

  const podiumPlayers = [top10[1], top10[0], top10[2]].filter(p => p !== undefined);
  const remainingPlayers = top10.slice(3);

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header-section">
        <h3>🏆 {title}</h3>
      </div>

      {top10.length > 0 ? (
        <>
          <div className="leaderboard-podium">
            {podiumPlayers.map((entry, index) => {
              const originalRank = top10.indexOf(entry) + 1;
              const isMe = entry.name === currentNickname;

              return (
                <div key={index} className={`podium-item rank-${originalRank} ${isMe ? 'is-me' : ''}`}>
                  <div className="podium-crown">{originalRank === 1 ? '👑' : ''}</div>
                  <div className="podium-avatar">
                    <span className="rank-badge">{getRankIcon(originalRank)}</span>
                  </div>
                  <div className="podium-info">
                    <span className="player-name">{entry.name}</span>
                    <div className="player-score-group">
                      <span className="player-score">
                        {entry.score.toLocaleString()}{unit}
                      </span>
                      {subLabel && (
                        <span className="player-subscore">
                          {subLabel}: {subUnit}{entry.subScore || 0}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="podium-base"></div>
                </div>
              );
            })}
          </div>

          {remainingPlayers.length > 0 && (
            <div className="leaderboard-list">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>{label}</th>
                    {subLabel && <th>{subLabel}</th>}
                  </tr>
                </thead>
                <tbody>
                  {remainingPlayers.map((entry, index) => {
                    const rank = index + 4;
                    const isMe = entry.name === currentNickname;
                    const encouragement = getEncouragement(rank);

                    return (
                      <tr key={index} className={`rank-row rank-other ${isMe ? 'is-me' : ''}`}>
                        <td className="rank-cell">
                          <span className="rank-number">{getRankIcon(rank)}</span>
                        </td>
                        <td className="player-cell">
                          <div className="player-info">
                            <span className="player-name-text">{entry.name}</span>
                            {isMe && <span className="me-badge">YOU</span>}
                            {encouragement && <span className="cheer-text">{encouragement}</span>}
                          </div>
                        </td>
                        <td className="score-cell">{entry.score.toLocaleString()}{unit}</td>
                        {subLabel && <td className="subscore-cell">{subUnit}{entry.subScore || 0}</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className="no-data-box">No records yet. Be the first!</div>
      )}
    </div>
  );
};

export default Leaderboard;
