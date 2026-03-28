import React from 'react';
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
  const isGateOfHell = gameId === '1';
  const isGalaxyLaunch = gameId === '2';
  const isGemMerge = gameId === '5';
  
  let label = 'Score';
  let unit = '';
  let subLabel = '';
  let subUnit = '';
  let title = 'Global Leaderboard';

  if (isGateOfHell) {
    label = 'Depth';
    unit = ' Depth';
    subLabel = '';
    title = 'Survivor Leaderboard';
  } else if (isGalaxyLaunch) {
    label = 'Conquests';
    unit = '';
    subLabel = 'Max Planet Level';
    subUnit = 'Lv.';
    title = 'Ultimate Conqueror';
  } else if (isGemMerge) {
    label = 'Total Score';
    unit = ' pts';
    subLabel = 'Merges';
    title = 'Master Merger Leaderboard';
  } else if (gameId === '7') {
    label = 'Level';
    unit = ' level';
    subLabel = 'Clicks';
    subUnit = '';
    title = 'Fastest Clicker Leaderboard';
  } else if (gameId === '8') {
    label = 'Win Rate';
    unit = '%';
    subLabel = 'Total Wins';
    subUnit = '';
    title = 'Omok Grandmaster Leaderboard';
  } else if (gameId === '9') {
    label = 'Stage';
    unit = '';
    subLabel = 'Artifacts';
    subUnit = '';
    title = 'Void Survivor Leaderboard';
  } else if (gameId === '10') {
    label = 'Waves';
    unit = ' waves';
    subLabel = 'Battles';
    subUnit = '';
    title = 'Eternal War Leaderboard';
  } else if (gameId === '11') {
    label = 'Chapters';
    unit = ' Chapters';
    subLabel = 'Stages';
    subUnit = '';
    title = 'Dicefall Chronicles Leaderboard';
  } else if (gameId === '12') {
    label = 'Heroes';
    unit = ' heroes';
    subLabel = 'Monsters';
    subUnit = '';
    title = 'Heroes of the Last Nexus Leaderboard';
  } else if (gameId === '13') {
    label = 'Total Stars';
    unit = ' Stars';
    subLabel = 'Receipts';
    subUnit = '';
    title = 'Timing Chef Master Leaderboard';
  }

  // Common Sort Logic: Score first (DESC)
  // Tie-breaker: SubScore (DESC by default, ASC for Gem Merge)
  const top10 = [...entries].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (isGemMerge) {
      // For Gem Merge, fewer merges for the same score is better
      return (a.subScore || 0) - (b.subScore || 0);
    }
    return (b.subScore || 0) - (a.subScore || 0);
  }).slice(0, 10);

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

  const podiumPlayers = [
    top10[1], // 2nd
    top10[0], // 1st
    top10[2], // 3rd
  ].filter(p => p !== undefined);

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
