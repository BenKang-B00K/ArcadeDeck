import React, { useEffect } from 'react';
import type { Game } from '../../data/games';
import type { LocaleOverlay } from '../../i18n';
import { getLocalizedString } from '../../i18n';
import { genreSlug } from '../../utils/genres';
import { useUiText } from '../../i18n/useUiText';

interface Props {
  game: Game;
  lang: string;
  overlay: LocaleOverlay | null;
}

const GameHeadMeta: React.FC<Props> = ({ game, lang, overlay }) => {
  const titleEn = getLocalizedString(game, 'title', 'en', null);
  const descEn = getLocalizedString(game, 'description', 'en', null);
  const title = getLocalizedString(game, 'title', lang, overlay);
  const desc = getLocalizedString(game, 'description', lang, overlay);
  const imageUrl = `https://arcadedeck.net/${encodeURI(game.thumbnail)}`;
  const pageUrl = `https://arcadedeck.net/play/${game.slug}`;
  const isApp = game.kind === 'app';
  const uiT = useUiText();
  const playFreeOn = isApp ? uiT('seoFreeOnApp', 'Free on ArcadeDeck') : uiT('seoPlayFreeOn', 'Play Free on ArcadeDeck');

  useEffect(() => {
    document.title = `${title} - ${playFreeOn}`;
  }, [title, playFreeOn]);

  // Point the install prompt at the per-game manifest (written by
  // prerender-pages.js) so this game installs as its own app. Chrome
  // re-evaluates installability when the manifest link's href changes.
  // Swapping the existing link (vs. adding a second) matters: the browser
  // only honours the first <link rel="manifest"> in the document.
  useEffect(() => {
    const appPath = `${lang === 'en' ? '' : '/' + lang}/play/${game.slug}`;
    const swap = (rel: string, href: string, restore: string) => {
      let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
      return () => { link.href = restore; };
    };
    const undoManifest = swap('manifest', `${appPath}/manifest.webmanifest`, '/manifest.webmanifest');
    const undoIcon = swap('apple-touch-icon', `/play/${game.slug}/icon-192.webp`, '/images/icon-192x192.webp');
    return () => { undoManifest(); undoIcon(); };
  }, [game.slug, lang]);

  return (
    <>
      <html lang={lang} />
      <meta name="description" content={`Play ${title}: ${desc} Free online browser game on ArcadeDeck.`} />
      <meta name="keywords" content={`${titleEn}, ${game.genres.join(', ')}, free online game, browser game, arcadedeck`} />
      <link rel="canonical" href={pageUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="ArcadeDeck" />
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
          "@type": isApp ? "WebApplication" : "VideoGame",
          "name": titleEn,
          "alternateName": title !== titleEn ? title : undefined,
          "description": descEn,
          "genre": game.genres,
          "applicationCategory": isApp ? "TravelApplication" : "GameApplication",
          "operatingSystem": "Web Browser",
          "image": imageUrl,
          "url": pageUrl,
          "author": {
            "@type": "Organization",
            "name": "ArcadeDeck",
            "url": "https://arcadedeck.net",
            "sameAs": ["https://www.wikidata.org/wiki/Q141473972"]
          },
          "publisher": {
            "@type": "Organization",
            "name": "ArcadeDeck",
            "url": "https://arcadedeck.net",
            "logo": {
              "@type": "ImageObject",
              "url": "https://arcadedeck.net/images/icon-512x512.webp"
            },
            "sameAs": ["https://www.wikidata.org/wiki/Q141473972"]
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
            {
              "@type": "ListItem",
              "position": 2,
              "name": game.genres[0] || "Games",
              "item": game.genres[0]
                ? `https://arcadedeck.net/genre/${genreSlug(game.genres[0])}`
                : "https://arcadedeck.net/",
            },
            { "@type": "ListItem", "position": 3, "name": titleEn, "item": pageUrl },
          ],
        })}
      </script>
    </>
  );
};

export default GameHeadMeta;
