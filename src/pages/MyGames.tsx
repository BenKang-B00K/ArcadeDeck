import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Trophy, Rocket, Medal } from 'lucide-react';
import Navbar from '../components/Navbar';
import { games } from '../data/games';
import type { Game } from '../data/games';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore/lite';
import { compareLeaderboardEntries, formatScore } from '../utils/leaderboardUtils';
import { buildLeaderboardQuery } from '../utils/leaderboardQuery';
import { thumb360, SRCSET_SIZES } from '../utils/thumb';
import { useNickname } from '../hooks/useNickname';
import { LEADERBOARD_FETCH_LIMIT } from '../constants/gameConstants';
import { useUiText, useLocale, getLocalizedString } from '../i18n';
import './MyGames.css';

interface GameWithRank extends Game {
  rank?: number;
  score?: number;
  subScore?: number;
}

const MyGames = () => {
  const t = useUiText();
  const { lang, overlay } = useLocale();
  const [rankedGames, setRankedGames] = useState<GameWithRank[]>([]);
  const [noRankGames, setNoRankGames] = useState<GameWithRank[]>([]);
  const [loading, setLoading] = useState(true);
  const nickname = useNickname();

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

          const lbQuery = buildLeaderboardQuery(db, game.id, { limit: LEADERBOARD_FETCH_LIMIT });
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

  useEffect(() => {
    document.title = 'My Gaming Stats & Ranks | ArcadeDeck';
  }, []);

  return (
    <div className="my-games-page">
      <>
        <meta name="description" content="Check your personal ranking, achievements, and game progress on ArcadeDeck. Track your performance across all universes!" />
        <meta property="og:title" content="My Gaming Stats & Ranks | ArcadeDeck" />
        <meta property="og:url" content="https://arcadedeck.net/my-games" />
        <meta name="robots" content="noindex, follow" />
      </>
      <Navbar />
      <main className="container">
        <header className="my-games-header">
          <h1>{t('myRankTitle', 'My')} <span>{t('myRankSpan', 'Ranking')}</span></h1>
          <p className="subtitle">{t('myRankSubtitle', 'Track your performance across all universes')}</p>
          <div className="nickname-badge">{t('myRankOperator', 'Operator')}: {nickname}</div>
        </header>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>{t('myRankLoading', 'Scanning universes for your records...')}</p>
          </div>
        ) : (
          <div className="my-games-content">
            <section className="ranked-section">
              <h2 className="section-title"><Trophy size={20} aria-hidden="true" /> {t('myRankTop3', 'Top 3 Achievements')}</h2>
              {rankedGames.length > 0 ? (
                <div className="my-games-grid">
                  {rankedGames.map(game => {
                    const title = getLocalizedString(game, 'title', lang, overlay);
                    return (
                      <div key={game.id} className={`my-game-card rank-${game.rank}`}>
                        <div className="rank-badge-large">
                          <Medal size={24} className={`rank-medal rank-${game.rank}`} aria-hidden="true" />
                          <span className="rank-num">{game.rank === 1 ? t('myRank1st', '1st') : game.rank === 2 ? t('myRank2nd', '2nd') : t('myRank3rd', '3rd')}</span>
                        </div>
                        <img
                          src={game.thumbnail}
                          srcSet={`${thumb360(game.thumbnail)} 360w, ${game.thumbnail} 640w`}
                          sizes={SRCSET_SIZES}
                          alt={title}
                          className="card-thumb"
                          width="640"
                          height="360"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="card-info">
                          <h3>{title}</h3>
                          <div className="score-info">
                            <span className="score-val">{formatScore(game.score ?? 0)}</span>
                            <span className="score-label">{t('myRankScore', 'Score')}</span>
                          </div>
                          <Link to={`/play/${game.id}`} className="play-again-btn">{t('myRankPlayAgain', 'Play Again')}</Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <p>{t('myRankEmpty', "You haven't reached the Top 3 in any game yet. Time to level up!")}</p>
                </div>
              )}
            </section>

            <section className="no-rank-section">
              <h2 className="section-title"><Rocket size={20} aria-hidden="true" /> {t('myRankMissions', 'Missions for You')}</h2>
              <p className="section-desc">{t('myRankMissionsDesc', "Games where you haven't secured a top rank yet.")}</p>
              <div className="my-games-list">
                {noRankGames.map(game => {
                  const title = getLocalizedString(game, 'title', lang, overlay);
                  return (
                    <Link key={game.id} to={`/play/${game.id}`} className="mini-game-card">
                      <img
                        src={game.thumbnail}
                        srcSet={`${thumb360(game.thumbnail)} 360w, ${game.thumbnail} 640w`}
                        sizes={SRCSET_SIZES}
                        alt={title}
                        width="640"
                        height="360"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="mini-info">
                        <h4>{title}</h4>
                        <span className="genre-tag">{game.genres[0]}</span>
                      </div>
                      <span className="go-arrow">→</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyGames;
