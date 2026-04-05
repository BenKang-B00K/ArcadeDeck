import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import { games } from '../data/games';
import type { Game } from '../data/games';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { compareLeaderboardEntries } from '../utils/leaderboardUtils';
import { LEADERBOARD_FETCH_LIMIT } from '../constants/gameConstants';
import './MyGames.css';

interface GameWithRank extends Game {
  rank?: number;
  score?: number;
  subScore?: number;
}

const MyGames = () => {
  const [rankedGames, setRankedGames] = useState<GameWithRank[]>([]);
  const [noRankGames, setNoRankGames] = useState<GameWithRank[]>([]);
  const [loading, setLoading] = useState(true);
  const nickname = localStorage.getItem('player_nickname') || 'Explorer';

  useEffect(() => {
    const fetchMyRanks = async () => {
      setLoading(true);
      const ranked: GameWithRank[] = [];
      const noRank: GameWithRank[] = [];

      try {
        // Step 1: Fetch all user scores in one query
        const userScoresSnap = await getDocs(
          query(collection(db, "leaderboards"), where("name", "==", nickname))
        );
        const userScoresByGame = new Map<string, { score: number; subScore: number }>();
        userScoresSnap.docs.forEach(doc => {
          const d = doc.data();
          userScoresByGame.set(d.gameId, { score: d.score, subScore: d.subScore || 0 });
        });

        // Step 2: Only fetch leaderboards for games the user has played
        const playedGames = games.filter(g => userScoresByGame.has(g.id));
        const unplayedGames = games.filter(g => !userScoresByGame.has(g.id));
        noRank.push(...unplayedGames);

        const promises = playedGames.map(async (game) => {
          const userData = userScoresByGame.get(game.id)!;
          const subSortAsc = game.leaderboard?.subSortAsc ?? false;

          const lbQuery = query(
            collection(db, "leaderboards"),
            where("gameId", "==", game.id),
            orderBy("score", "desc"),
            limit(LEADERBOARD_FETCH_LIMIT)
          );
          const lbSnap = await getDocs(lbQuery);
          const docs = lbSnap.docs.map(d => d.data());

          docs.sort((a, b) => compareLeaderboardEntries(
            { score: a.score ?? 0, subScore: a.subScore ?? 0 },
            { score: b.score ?? 0, subScore: b.subScore ?? 0 },
            subSortAsc
          ));

          const index = docs.findIndex(d => d.name === nickname);
          const rank = index !== -1 ? index + 1 : 101;

          if (rank >= 1 && rank <= 3) {
            ranked.push({ ...game, rank, score: userData.score, subScore: userData.subScore });
          } else {
            noRank.push(game);
          }
        });

        await Promise.all(promises);
        ranked.sort((a, b) => (a.rank || 0) - (b.rank || 0));

        setRankedGames(ranked);
        setNoRankGames(noRank);
      } catch (error) {
        console.error("Error fetching my ranks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRanks();
  }, [nickname]);

  return (
    <div className="my-games-page">
      <Helmet>
        <title>My Gaming Stats & Ranks | ArcadeDeck</title>
        <meta name="description" content="Check your personal ranking, achievements, and game progress on ArcadeDeck. Track your performance across all universes!" />
        <meta property="og:title" content="My Gaming Stats & Ranks | ArcadeDeck" />
        <meta property="og:url" content="https://arcadedeck.net/my-games" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Navbar />
      <div className="container">
        <header className="my-games-header">
          <h1>My <span>Ranking</span></h1>
          <p className="subtitle">Track your performance across all universes</p>
          <div className="nickname-badge">Operator: {nickname}</div>
        </header>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Scanning universes for your records...</p>
          </div>
        ) : (
          <div className="my-games-content">
            <section className="ranked-section">
              <h2 className="section-title">🏆 Top 3 Achievements</h2>
              {rankedGames.length > 0 ? (
                <div className="my-games-grid">
                  {rankedGames.map(game => (
                    <div key={game.id} className={`my-game-card rank-${game.rank}`}>
                      <div className="rank-badge-large">
                        {game.rank === 1 ? '🥇' : game.rank === 2 ? '🥈' : '🥉'}
                        <span className="rank-num">{game.rank}st</span>
                      </div>
                      <img src={game.thumbnail} alt={game.title} className="card-thumb" />
                      <div className="card-info">
                        <h3>{game.title}</h3>
                        <div className="score-info">
                          <span className="score-val">{game.score?.toLocaleString()}</span>
                          <span className="score-label">Score</span>
                        </div>
                        <Link to={`/play/${game.id}`} className="play-again-btn">Play Again</Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>You haven't reached the Top 3 in any game yet. Time to level up!</p>
                </div>
              )}
            </section>

            <section className="no-rank-section">
              <h2 className="section-title">🚀 Missions for You</h2>
              <p className="section-desc">Games where you haven't secured a top rank yet.</p>
              <div className="my-games-list">
                {noRankGames.map(game => (
                  <Link key={game.id} to={`/play/${game.id}`} className="mini-game-card">
                    <img src={game.thumbnail} alt={game.title} />
                    <div className="mini-info">
                      <h4>{game.title}</h4>
                      <span className="genre-tag">{game.genres[0]}</span>
                    </div>
                    <span className="go-arrow">→</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGames;
