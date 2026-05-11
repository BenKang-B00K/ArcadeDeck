import React from 'react';

import { Landmark, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import GlobalLeaderboard from '../components/GlobalLeaderboard';
import { useUiText } from '../i18n';
import './HallOfFame.css';

const HallOfFame: React.FC = () => {
  const t = useUiText();
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  React.useEffect(() => {
    document.title = 'Hall of Fame | ArcadeDeck Legends';
  }, []);

  return (
    <div className="hall-of-fame-page">
      <>
        <meta name="description" content="Witness the legends of ArcadeDeck. Check out the top players and historical records of our most competitive browser games." />
        <meta property="og:title" content="Hall of Fame | ArcadeDeck Legends" />
        <meta property="og:description" content="Are you among the legends? Check the global leaderboards and monthly archives." />
        <meta property="og:url" content="https://arcadedeck.net/hall-of-fame" />
      </>
      <Navbar />
      <main className="container hof-container">
        <header className="hof-header">
          <h1><Landmark size={28} aria-hidden="true" /> {t('hofTitle', 'Hall of Fame Archive')}</h1>
          <p>{t('hofSubtitle', 'The Eternal Records of ArcadeDeck Legends')}</p>
          <p className="hof-intro">{t('hofIntro', 'Every score submitted across ArcadeDeck is ranked here in real time. The leaders of each game claim glory for the current month — at month\'s end, the top names are immortalized in the Hall of Fame archive. Compete, climb, and leave your mark.')}</p>
        </header>

        <section className="archive-section">
          <h2 className="archive-title"><Sparkles size={20} aria-hidden="true" /> {t('hofCurrentLeaders', 'Current Leaders')} ({currentMonth})</h2>
          <GlobalLeaderboard />
        </section>
      </main>
    </div>
  );
};

export default HallOfFame;
