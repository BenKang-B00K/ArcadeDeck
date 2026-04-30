import React from 'react';

import { Landmark, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import GlobalLeaderboard from '../components/GlobalLeaderboard';
import './HallOfFame.css';

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
      </main>
    </div>
  );
};

export default HallOfFame;
