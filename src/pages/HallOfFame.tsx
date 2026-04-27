import React from 'react';

import { Landmark, Sparkles, FolderOpen, Medal } from 'lucide-react';
import Navbar from '../components/Navbar';
import GlobalLeaderboard from '../components/GlobalLeaderboard';
import './HallOfFame.css';

interface MonthlyWinner {
  rank: number;
  name: string;
  score: string | number;
}

interface MonthlyArchive {
  month: string;
  winners: MonthlyWinner[];
}

const archiveData: MonthlyArchive[] = [
  {
    month: 'March 2026',
    winners: [
      { rank: 1, name: 'Playerkt', score: '12 pts' },
      { rank: 2, name: 'GG',       score: '10 pts' },
      { rank: 3, name: 'BEN',      score: '7 pts'  },
    ],
  },
];

const HallOfFame: React.FC = () => {
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="hall-of-fame-page">
      <>
        <title>Hall of Fame | ArcadeDeck Legends</title>
        <meta name="description" content="Witness the legends of ArcadeDeck. Check out the top players and historical records of our most competitive browser games." />
        <meta property="og:title" content="Hall of Fame | ArcadeDeck Legends" />
        <meta property="og:description" content="Are you among the legends? Check the global leaderboards and monthly archives." />
        <meta property="og:url" content="https://arcadedeck.net/hall-of-fame" />
      </>
      <Navbar />
      <main className="container hof-container">
        <header className="hof-header">
          <h1><Landmark size={28} aria-hidden="true" /> Hall of Fame Archive</h1>
          <p>The Eternal Records of ArcadeDeck Legends</p>
        </header>

        <section className="archive-section">
          <h2 className="archive-title"><Sparkles size={20} aria-hidden="true" /> Current Leaders ({currentMonth})</h2>
          <GlobalLeaderboard />
        </section>

        <section className="historical-archive">
          <h2 className="archive-title"><FolderOpen size={20} aria-hidden="true" /> Monthly Records</h2>
          {archiveData.length > 0 ? (
            <div className="archive-grid">
              {archiveData.map((data, idx) => (
                <div key={idx} className="archive-card">
                  <h3>{data.month}</h3>
                  <ul className="winner-list">
                    {data.winners.map((w) => (
                      <li key={w.rank} className={`winner-item rank-${w.rank}`}>
                        <span className="rank-symbol"><Medal size={16} className={`rank-medal rank-${w.rank}`} aria-hidden="true" /></span>
                        <span className="winner-name">{w.name}</span>
                        <span className="winner-score">{w.score}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-archive-msg">
              <p>No historical records yet. The legends of {currentMonth} will be archived soon!</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default HallOfFame;
