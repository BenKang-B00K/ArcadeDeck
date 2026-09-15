import React, { lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { deviceGames as games } from '../data/games';
import { genreFromSlug } from '../utils/genres';
import { useUiText, useLocale, getLocalizedString } from '../i18n';

const GameGrid = lazy(() => import('../components/GameGrid'));

const Genre: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const genre = genreFromSlug(slug);
  const t = useUiText();
  const { lang, overlay } = useLocale();

  if (!genre) {
    return (
      <>
        <Navbar />
        <main className="container" style={{ padding: '60px 20px', minHeight: '60vh' }}>
          <h1>{t('genreNotFoundTitle', 'Genre not found')}</h1>
          <p>
            <Link to="/">{t('genreBackHome', '← Browse all games')}</Link>
          </p>
        </main>
      </>
    );
  }

  const gamesInGenre = games.filter(g => g.genres.includes(genre));
  const heading = t('genrePageHeading', '{genre} Games').replace('{genre}', genre);
  const subheading = t('genrePageSubheading', '{count} games in this genre on ArcadeDeck.')
    .replace('{count}', String(gamesInGenre.length));

  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: '24px 20px 0' }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: 8 }}>
          <Link to="/">{t('breadcrumbHome', 'Home')}</Link> &rsaquo; <span>{genre}</span>
        </nav>
        <h1 style={{ marginBottom: 4 }}>{heading}</h1>
        <p style={{ opacity: 0.75, marginBottom: 16 }}>{subheading}</p>
        {/* Brief intro lifted from the active locale's UI strings (falls back
            to English). Helps SEO body content for the locale-prefixed shell. */}
        {(() => {
          const intro = t(`genreIntro_${slug}`, '');
          return intro ? <p style={{ lineHeight: 1.6, marginBottom: 24 }}>{intro}</p> : null;
        })()}
      </main>
      <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
        <GameGrid selectedGenre={genre} />
      </Suspense>
      <section className="container" style={{ padding: '24px 20px 48px' }}>
        <h2 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.8 }}>
          {t('genreGameList', 'Games in this genre')}
        </h2>
        <ul style={{ lineHeight: 1.8 }}>
          {gamesInGenre.map((g) => (
            <li key={g.id}>
              <Link to={`/play/${g.slug}`}>{getLocalizedString(g, 'title', lang, overlay)}</Link>
              {' — '}
              {getLocalizedString(g, 'description', lang, overlay)}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};

export default Genre;
