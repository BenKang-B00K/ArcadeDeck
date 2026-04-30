import React from 'react';
import type { Game } from '../../data/games';

interface Props {
  game: Game;
  lang: 'en' | 'ko';
}

const GameHeadMeta: React.FC<Props> = ({ game, lang }) => {
  const title = lang === 'ko' ? (game.titleKo ?? game.title) : game.title;
  const desc = lang === 'ko' ? (game.descriptionKo ?? game.description) : game.description;
  const imageUrl = `https://arcadedeck.net/${encodeURI(game.thumbnail)}`;
  const pageUrl = `https://arcadedeck.net/play/${game.slug}`;

  return (
    <>
      <html lang={lang === 'ko' ? 'ko' : 'en'} />
      <title>{title} - Play Free on ArcadeDeck</title>
      <meta name="description" content={lang === 'ko'
        ? `${title}: ${desc} ArcadeDeck에서 무료로 즐기세요!`
        : `Play ${game.title}: ${game.description} Free online browser game on ArcadeDeck.`} />
      <meta name="keywords" content={`${game.title}, ${game.genres.join(', ')}, free online game, browser game, arcadedeck`} />
      <link rel="canonical" href={pageUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="ArcadeDeck" />
      <meta property="og:locale" content={lang === 'ko' ? 'ko_KR' : 'en_US'} />
      <meta property="og:locale:alternate" content={lang === 'ko' ? 'en_US' : 'ko_KR'} />
      <meta property="og:title" content={`${title} - ArcadeDeck`} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={pageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${title} - ArcadeDeck`} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={imageUrl} />

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "VideoGame",
          "name": game.title,
          "alternateName": game.titleKo,
          "description": game.description,
          "genre": game.genres,
          "applicationCategory": "GameApplication",
          "operatingSystem": "Web Browser",
          "inLanguage": ["en", "ko"],
          "image": imageUrl,
          "url": pageUrl,
          "author": {
            "@type": "Organization",
            "name": "ArcadeDeck",
            "url": "https://arcadedeck.net",
            "sameAs": ["https://www.wikidata.org/wiki/Q139585213"]
          },
          "publisher": {
            "@type": "Organization",
            "name": "ArcadeDeck",
            "url": "https://arcadedeck.net",
            "logo": {
              "@type": "ImageObject",
              "url": "https://arcadedeck.net/images/icon-512x512.webp"
            },
            "sameAs": ["https://www.wikidata.org/wiki/Q139585213"]
          },
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        })}
      </script>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://arcadedeck.net/" },
            { "@type": "ListItem", "position": 2, "name": game.genres[0] || "Games", "item": "https://arcadedeck.net/" },
            { "@type": "ListItem", "position": 3, "name": game.title, "item": pageUrl },
          ],
        })}
      </script>
    </>
  );
};

export default GameHeadMeta;
