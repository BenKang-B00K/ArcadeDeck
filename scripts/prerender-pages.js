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

// Inline CSS: replace render-blocking <link rel="stylesheet"> with <style> tag.
// Vite's hashed CSS is ~8 KiB; inlining cuts a ~490ms render-blocking request
// off the LCP critical path. The original link is dropped from every built HTML.
const cssLinkRegex = /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g;
const cssHrefs = [...baseHead.matchAll(cssLinkRegex)].map(m => m[1]);
const inlinedCss = cssHrefs
  .map(href => {
    const path = href.startsWith('/') ? `dist${href}` : `dist/${href}`;
    return readFileSync(path, 'utf-8');
  })
  .join('\n');
const inlinedStyle = inlinedCss ? `<style>${inlinedCss}</style>` : '';
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
    <meta property="og:site_name" content="ArcadeDeck" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:locale:alternate" content="ko_KR" />
    <meta property="og:title" content="${game.title} - ArcadeDeck" />
    <meta property="og:description" content="${game.description}" />
    <meta property="og:image" content="${thumbUrl}" />
    <meta property="og:url" content="${pageUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${game.title} - ArcadeDeck" />
    <meta name="twitter:description" content="${game.description}" />
    <meta name="twitter:image" content="${thumbUrl}" />
    <script type="application/ld+json">${jsonLd}</script>
    ${inlinedStyle}
    ${modulePreloads}
  </head>
  <body>
    <div id="root">
      <!--
        Visible pre-rendered content for crawlers and users on slow connections.
        React replaces this entire subtree on mount, so JS-enabled users never
        see it. Do not hide with display:none or off-screen tricks — that
        triggers cloaking penalties (AdSense, Google webspam).
      -->
      <main style="max-width:900px;margin:0 auto;padding:40px 20px;font-family:system-ui,sans-serif;color:#fff;background:#050507;min-height:100vh;">
        <h1 style="font-size:2rem;margin-bottom:8px;">${game.title}</h1>
        ${game.titleKo ? `<p style="color:#9aa;margin:0 0 20px;font-size:1.1rem;">${game.titleKo}</p>` : ''}
        <p style="font-size:1.1rem;line-height:1.6;">${game.description}</p>
        ${game.descriptionKo ? `<p style="color:#bbb;line-height:1.6;">${game.descriptionKo}</p>` : ''}

        <h2 style="margin-top:32px;font-size:1.3rem;">About This Game</h2>
        <div style="line-height:1.7;">${(game.fullDescription || '').replace(/\n/g, '<br>')}</div>
        ${game.fullDescriptionKo ? `<div style="margin-top:12px;color:#bbb;line-height:1.7;">${game.fullDescriptionKo.replace(/\n/g, '<br>')}</div>` : ''}

        ${game.controls ? `<h2 style="margin-top:32px;font-size:1.3rem;">How to Play</h2><p style="line-height:1.6;">${game.controls}</p>` : ''}
        ${game.controlsKo ? `<p style="color:#bbb;line-height:1.6;">${game.controlsKo}</p>` : ''}

        ${game.tips ? `<h2 style="margin-top:32px;font-size:1.3rem;">Pro Tips</h2><p style="line-height:1.6;">${game.tips}</p>` : ''}
        ${game.tipsKo ? `<p style="color:#bbb;line-height:1.6;">${game.tipsKo}</p>` : ''}

        ${game.lore ? `<h2 style="margin-top:32px;font-size:1.3rem;">World Lore</h2><div style="line-height:1.7;font-style:italic;">${game.lore.replace(/\n/g, '<br>')}</div>` : ''}
        ${game.loreKo ? `<div style="margin-top:12px;color:#bbb;line-height:1.7;font-style:italic;">${game.loreKo.replace(/\n/g, '<br>')}</div>` : ''}

        ${featuresHtml ? `<h2 style="margin-top:32px;font-size:1.3rem;">Key Features</h2><ul style="line-height:1.8;">${featuresHtml}</ul>` : ''}

        <p style="margin-top:32px;color:#9aa;">Genres: ${game.genres.join(', ')}</p>
        <p style="color:#9aa;">Loading interactive game… If it doesn't load, <a href="${pageUrl}" style="color:#00d2ff;">visit ${pageUrl}</a>.</p>
      </main>
    </div>
    ${scriptTags}
  </body>
</html>`;

  writeFileSync(`${dir}/index.html`, html);
}

// Rewrite the home noscript with the current playable games list so
// non-JS crawlers always see an up-to-date catalogue.
const noscriptItems = playableGames
  .map(g => `          <li><a href="/play/${g.slug}">${g.title}</a> — ${g.description}</li>`)
  .join('\n');

const homeHtml = indexHtml
  .replace(
    /(<h2>Our Games<\/h2>\s*<ul>)[\s\S]*?(<\/ul>)/,
    `$1\n${noscriptItems}\n        $2`
  )
  .replace(cssLinkRegex, (() => {
    let first = true;
    return () => {
      if (!first) return '';
      first = false;
      return inlinedStyle;
    };
  })());

writeFileSync('dist/index.html', homeHtml);

// Also generate static pages for other routes
const staticRoutes = ['about', 'privacy', 'contact', 'hall-of-fame', 'my-games'];
for (const route of staticRoutes) {
  const dir = `dist/${route}`;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/index.html`, homeHtml);
}

console.log(`Pre-rendered ${playableGames.length} game pages + ${staticRoutes.length} static routes (noscript synced).`);
