/**
 * Post-build script: generates static HTML shells for each game page
 * so that search engine crawlers see rich text content without JS execution.
 *
 * Each /play/{slug}/index.html contains:
 * - Full meta tags (title, description, OG, Twitter, JSON-LD)
 * - All game text (description, controls, tips, lore, features)
 * - A script that boots the SPA for interactive users
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

const games = JSON.parse(readFileSync('src/data/games.json', 'utf-8'));
const indexHtml = readFileSync('dist/index.html', 'utf-8');

// Extract everything inside <head>...</head> from built index.html
const headMatch = indexHtml.match(/<head>([\s\S]*?)<\/head>/);
const baseHead = headMatch ? headMatch[1] : '';

// Extract script tags from built index.html body
const scriptMatches = indexHtml.match(/<script[\s\S]*?<\/script>/g) || [];
const scriptTags = scriptMatches.join('\n    ');

// Also grab link tags for CSS from head
const cssLinks = (baseHead.match(/<link[^>]*rel="stylesheet"[^>]*>/g) || []).join('\n    ');
const modulePreloads = (baseHead.match(/<link[^>]*rel="modulepreload"[^>]*>/g) || []).join('\n    ');

const playableGames = games.filter(g => g.status !== 'IN PRODUCTION');

for (const game of playableGames) {
  const slug = game.slug;
  const dir = `dist/play/${slug}`;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const title = `${game.title} - Play Free on ArcadeDeck`;
  const desc = `Play ${game.title}: ${game.description} Free online browser game on ArcadeDeck.`;
  const thumbUrl = `https://arcadedeck.net/${encodeURI(game.thumbnail)}`;
  const pageUrl = `https://arcadedeck.net/play/${slug}`;

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": game.title,
    "alternateName": game.titleKo || game.title,
    "description": game.description,
    "genre": game.genres,
    "applicationCategory": "GameApplication",
    "operatingSystem": "Web Browser",
    "inLanguage": ["en", "ko"],
    "image": thumbUrl,
    "url": pageUrl,
    "author": { "@type": "Organization", "name": "ArcadeDeck", "url": "https://arcadedeck.net" },
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD", "availability": "https://schema.org/InStock" }
  });

  const featuresHtml = (game.features || []).map(f => `<li>${f}</li>`).join('');
  const featuresKoHtml = (game.featuresKo || []).map(f => `<li>${f}</li>`).join('');

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>${title}</title>
    <meta name="description" content="${desc}" />
    <meta name="keywords" content="${game.title}, ${game.genres.join(', ')}, free online game, browser game, arcadedeck" />
    <meta name="robots" content="index, follow" />
    <meta name="theme-color" content="#050507" />
    <link rel="icon" type="image/webp" href="/images/Favicon.webp" />
    <link rel="apple-touch-icon" href="/images/icon-192x192.webp" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <link rel="canonical" href="${pageUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${game.title} - ArcadeDeck" />
    <meta property="og:description" content="${game.description}" />
    <meta property="og:image" content="${thumbUrl}" />
    <meta property="og:url" content="${pageUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${game.title} - ArcadeDeck" />
    <meta name="twitter:description" content="${game.description}" />
    <meta name="twitter:image" content="${thumbUrl}" />
    <script type="application/ld+json">${jsonLd}</script>
    ${cssLinks}
    ${modulePreloads}
  </head>
  <body>
    <div id="root"></div>
    <!-- Static content for SEO crawlers -->
    <div id="seo-content" style="position:absolute;left:-9999px;top:-9999px;">
      <h1>${game.title}</h1>
      ${game.titleKo ? `<h2>${game.titleKo}</h2>` : ''}
      <p>${game.description}</p>
      ${game.descriptionKo ? `<p>${game.descriptionKo}</p>` : ''}

      <h2>About This Game</h2>
      <div>${(game.fullDescription || '').replace(/\n/g, '<br>')}</div>
      ${game.fullDescriptionKo ? `<div>${game.fullDescriptionKo.replace(/\n/g, '<br>')}</div>` : ''}

      ${game.controls ? `<h2>How to Play</h2><p>${game.controls}</p>` : ''}
      ${game.controlsKo ? `<p>${game.controlsKo}</p>` : ''}

      ${game.tips ? `<h2>Pro Tips</h2><p>${game.tips}</p>` : ''}
      ${game.tipsKo ? `<p>${game.tipsKo}</p>` : ''}

      ${game.lore ? `<h2>World Lore</h2><div>${game.lore.replace(/\n/g, '<br>')}</div>` : ''}
      ${game.loreKo ? `<div>${game.loreKo.replace(/\n/g, '<br>')}</div>` : ''}

      ${featuresHtml ? `<h2>Key Features</h2><ul>${featuresHtml}</ul>` : ''}
      ${featuresKoHtml ? `<ul>${featuresKoHtml}</ul>` : ''}

      <p>Genres: ${game.genres.join(', ')}</p>
      <p>Play free at <a href="${pageUrl}">${pageUrl}</a></p>
    </div>
    ${scriptTags}
  </body>
</html>`;

  writeFileSync(`${dir}/index.html`, html);
}

// Also generate static pages for other routes
const staticRoutes = ['about', 'privacy', 'contact', 'hall-of-fame', 'my-games'];
for (const route of staticRoutes) {
  const dir = `dist/${route}`;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  // Copy the SPA index.html so these routes also work on refresh
  writeFileSync(`${dir}/index.html`, indexHtml);
}

console.log(`Pre-rendered ${playableGames.length} game pages + ${staticRoutes.length} static routes.`);
