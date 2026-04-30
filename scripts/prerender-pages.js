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
const posts = JSON.parse(readFileSync('src/data/posts.json', 'utf-8'))
  .slice()
  .sort((a, b) => (a.date < b.date ? 1 : -1));
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

const postsForGame = (slug) =>
  posts.filter((p) => Array.isArray(p.relatedGames) && p.relatedGames.includes(slug));

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
    "author": { "@type": "Organization", "name": "ArcadeDeck", "url": "https://arcadedeck.net", "sameAs": ["https://www.wikidata.org/wiki/Q139585213"] },
    "publisher": { "@type": "Organization", "name": "ArcadeDeck", "url": "https://arcadedeck.net", "logo": { "@type": "ImageObject", "url": "https://arcadedeck.net/images/icon-512x512.webp" }, "sameAs": ["https://www.wikidata.org/wiki/Q139585213"] },
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD", "availability": "https://schema.org/InStock" }
  });

  const breadcrumbLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://arcadedeck.net/" },
      { "@type": "ListItem", "position": 2, "name": game.genres[0] || "Games", "item": "https://arcadedeck.net/" },
      { "@type": "ListItem", "position": 3, "name": game.title, "item": pageUrl },
    ],
  });

  const featuresHtml = (game.features || []).map(f => `<li>${f}</li>`).join('');

  const gameRelatedPosts = postsForGame(slug);
  const relatedPostsHtml = gameRelatedPosts.length
    ? `<h2 style="margin-top:32px;font-size:1.3rem;">Read on the Blog</h2><ul style="line-height:1.8;">${gameRelatedPosts
        .map((p) => `<li><a href="/blog/${p.slug}" style="color:#00d2ff;">${p.title}</a> — ${p.excerpt}</li>`)
        .join('')}</ul>`
    : '';

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
    <link rel="icon" type="image/webp" href="/images/favicon.webp" />
    <link rel="apple-touch-icon" href="/images/icon-192x192.webp" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <link rel="canonical" href="${pageUrl}" />
    ${game.titleKo ? `<link rel="alternate" hreflang="en" href="${pageUrl}" />
    <link rel="alternate" hreflang="ko" href="${pageUrl}" />
    <link rel="alternate" hreflang="x-default" href="${pageUrl}" />` : `<link rel="alternate" hreflang="en" href="${pageUrl}" />
    <link rel="alternate" hreflang="x-default" href="${pageUrl}" />`}
    <link rel="alternate" type="application/rss+xml" title="ArcadeDeck Blog" href="https://arcadedeck.net/rss.xml" />
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
    <script type="application/ld+json">${breadcrumbLd}</script>
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
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#9aa;margin-bottom:16px;">
          <a href="/" style="color:#00d2ff;">Home</a> &rsaquo; <span>${game.title}</span>
        </nav>
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

        ${relatedPostsHtml}

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

// Inline CSS in the home shell too. Each route shell starts from raw
// indexHtml; we run the css-replace once per shell.
const inlineCssOnce = (html) => {
  let first = true;
  return html.replace(cssLinkRegex, () => {
    if (!first) return '';
    first = false;
    return inlinedStyle;
  });
};

const homeJsonLd = [
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ArcadeDeck',
    alternateName: 'ArcadeDeck — Free Browser Games',
    url: 'https://arcadedeck.net/',
    inLanguage: ['en', 'ko'],
  }),
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ArcadeDeck',
    alternateName: '아케이드덱',
    url: 'https://arcadedeck.net/',
    logo: 'https://arcadedeck.net/images/icon-512x512.webp',
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'wikidata',
      value: 'Q139585213',
    },
    sameAs: [
      'https://www.wikidata.org/wiki/Q139585213',
      'https://arcadedeck.itch.io',
      'https://ko-fi.com/developer_benjamink',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'help@arcadedeck.net',
      contactType: 'customer support',
      availableLanguage: ['English', 'Korean'],
    },
  }),
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'ArcadeDeck Games Catalog',
    url: 'https://arcadedeck.net/',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: playableGames.slice(0, 20).map((g, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://arcadedeck.net/play/${g.slug}`,
        name: g.title,
      })),
    },
  }),
]
  .map((j) => `<script type="application/ld+json">${j}</script>`)
  .join('\n    ');

const homeHtml = inlineCssOnce(
  indexHtml
    .replace(
      /(<h2>Our Games<\/h2>\s*<ul>)[\s\S]*?(<\/ul>)/,
      `$1\n${noscriptItems}\n        $2`,
    )
    .replace('</head>', `${homeJsonLd}\n  </head>`),
);

writeFileSync('dist/index.html', homeHtml);

// Per-route shells with unique noscript bodies. Each shell mirrors the
// page's user-visible copy so crawlers (incl. AdSense reviewer) see
// route-specific content rather than the home games list.
const NOSCRIPT_BLOCK_REGEX = /<noscript>[\s\S]*?<\/noscript>/;

const formatPostDate = (iso) =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

const blogListNoscript = `
      <div style="background:#171424;color:#eaeaf0;font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto;">
        <h1>ArcadeDeck Blog</h1>
        <p>Patch notes, game design deep-dives, strategy guides, and monthly Hall of Fame recaps from the ArcadeDeck team.</p>
        <h2>Latest Posts</h2>
        <ul>
${posts
  .map(
    (p) =>
      `          <li><a href="/blog/${p.slug}">${p.title}</a> — <em>${formatPostDate(p.date)}</em>. ${p.excerpt}</li>`,
  )
  .join('\n')}
        </ul>
        <p><a href="/">Browse all games</a> · <a href="/hall-of-fame">Hall of Fame</a> · <a href="/about">About ArcadeDeck</a></p>
      </div>`;

const breadcrumbLdFor = (label, url) =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://arcadedeck.net/' },
      { '@type': 'ListItem', position: 2, name: label, item: url },
    ],
  });

const blogItemListLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'ArcadeDeck Blog',
  url: 'https://arcadedeck.net/blog',
  description:
    'Patch notes, game design deep-dives, strategy guides, and monthly Hall of Fame recaps from the ArcadeDeck team.',
  blogPost: posts.map((p) => ({
    '@type': 'BlogPosting',
    headline: p.title,
    url: `https://arcadedeck.net/blog/${p.slug}`,
    datePublished: p.date,
    description: p.excerpt,
  })),
});

const routeShells = {
  blog: {
    title: 'Blog | ArcadeDeck Devlog & Game Updates',
    description: 'The ArcadeDeck devlog: patch notes, game design deep-dives, strategy guides, and monthly Hall of Fame recaps.',
    canonical: 'https://arcadedeck.net/blog',
    noscript: blogListNoscript,
    extraLd: [blogItemListLd, breadcrumbLdFor('Blog', 'https://arcadedeck.net/blog')],
  },
  'hall-of-fame': {
    title: 'Hall of Fame | ArcadeDeck Legends',
    description: 'Witness the legends of ArcadeDeck. Check the top players and historical records of our most competitive browser games.',
    canonical: 'https://arcadedeck.net/hall-of-fame',
    extraLd: [breadcrumbLdFor('Hall of Fame', 'https://arcadedeck.net/hall-of-fame')],
    noscript: `
      <div style="background:#171424;color:#eaeaf0;font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto;">
        <h1>Hall of Fame — ArcadeDeck Legends</h1>
        <p>The eternal record of ArcadeDeck's most accomplished players. Each month we crown the top three legends across our entire game catalogue, then archive their names for posterity.</p>
        <h2>How the Hall of Fame Works</h2>
        <p>Every playable game on ArcadeDeck contributes points to the global leaderboard. Players earn points by claiming top ranks on individual game leaderboards, with bonus weight for first place finishes. At the end of each month, the cumulative point totals are frozen and the top three players are inducted into the historical archive.</p>
        <h2>Current Month</h2>
        <p>Live rankings update in real time. Visit the page with JavaScript enabled to see who is leading right now and how far ahead they are. Every score you submit on a game leaderboard counts towards the running monthly total.</p>
        <h2>How to Climb</h2>
        <ul>
          <li>Pick a game you genuinely enjoy — sustained play beats one-off attempts.</li>
          <li>Read the per-game tips and controls before grinding for top scores.</li>
          <li>Watch the secondary tiebreaker on dual-sort leaderboards (e.g. Gem Merge rewards lower move counts).</li>
          <li>Comment on game pages to share strategies with other contenders.</li>
        </ul>
        <p><a href="/">Browse all games</a> · <a href="/about">About ArcadeDeck</a></p>
      </div>`,
  },
  'my-games': {
    title: 'My Games | ArcadeDeck',
    description: 'Your personal ArcadeDeck library. Recently played games, liked titles, and your active Gamer ID — all synced to your browser.',
    canonical: 'https://arcadedeck.net/my-games',
    extraLd: [breadcrumbLdFor('My Games', 'https://arcadedeck.net/my-games')],
    noscript: `
      <div style="background:#171424;color:#eaeaf0;font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto;">
        <h1>My Games — Your ArcadeDeck Library</h1>
        <p>The My Games page is your personal hub on ArcadeDeck. It collects the games you have played most recently, the titles you have liked, and the Gamer ID currently associated with your scores and comments.</p>
        <h2>Recently Played</h2>
        <p>Every game you launch is recorded locally in your browser. The five most recent titles appear here so you can resume a session in one click. The list is stored in localStorage — clearing your browser data will reset it.</p>
        <h2>Liked Games</h2>
        <p>Tap the heart icon on any game card or game page to add it to your liked list. Liked games surface here for quick access and contribute to community popularity rankings on the home page.</p>
        <h2>Your Gamer ID</h2>
        <p>Your Gamer ID is the nickname displayed on every leaderboard and comment you submit. You can change it at any time from this page; existing scores remain attached to whatever name was active when they were submitted.</p>
        <h2>Privacy</h2>
        <p>ArcadeDeck never asks for an email, password, or any real personal information. Everything on the My Games page is stored client-side in your browser. See our <a href="/privacy">Privacy Policy</a> for full details.</p>
        <p><a href="/">Browse all games</a> · <a href="/hall-of-fame">Hall of Fame</a></p>
      </div>`,
  },
  about: {
    title: 'About | ArcadeDeck',
    description: 'About ArcadeDeck — a curated home for original, free-to-play browser games with global leaderboards and zero sign-up friction.',
    canonical: 'https://arcadedeck.net/about',
    extraLd: [breadcrumbLdFor('About', 'https://arcadedeck.net/about')],
    noscript: `
      <div style="background:#171424;color:#eaeaf0;font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto;">
        <h1>About ArcadeDeck</h1>
        <p>ArcadeDeck is a curated home for original, free-to-play browser games. Every title in the catalogue is built specifically for the web — no downloads, no installs, no sign-up walls. Pick a game, hit play, and you are in within seconds.</p>
        <h2>What We Stand For</h2>
        <p>We believe casual browser games deserve the same craft and polish as their console and mobile counterparts. Each ArcadeDeck game is hand-selected for tight controls, fair difficulty curves, and replay value. You will find Action, RPG, Strategy, Idle, Roguelike, Tower Defense, Puzzle, and Casual genres represented, with new titles added regularly.</p>
        <h2>Global Leaderboards</h2>
        <p>Every game ships with a real-time global leaderboard powered by Firebase. Scores are validated client-side and clamped server-side, with custom secondary sort rules per game (for example, Gem Merge tiebreaks on lowest move count). Compete, climb, and watch the Hall of Fame for monthly champions.</p>
        <h2>Built for Speed</h2>
        <p>The site is a React 19 single-page app deployed on Firebase Hosting with aggressive code splitting, image optimisation, and pre-rendered HTML for every game page. Lighthouse performance scores are a first-class concern — we want you in the game, not staring at a loader.</p>
        <h2>Contact</h2>
        <p>Questions, bug reports, partnership ideas, or game submissions: <a href="mailto:help@arcadedeck.net">help@arcadedeck.net</a>. Full contact options on the <a href="/contact">Contact page</a>.</p>
        <h2>Verified Profiles</h2>
        <p>ArcadeDeck is registered as a public knowledge entity on Wikidata.</p>
        <ul>
          <li><a href="https://www.wikidata.org/wiki/Q139585213" rel="me noopener" target="_blank">Wikidata: Q139585213</a></li>
          <li><a href="https://arcadedeck.itch.io" rel="me noopener" target="_blank">itch.io: arcadedeck.itch.io</a></li>
          <li><a href="https://ko-fi.com/developer_benjamink" rel="me noopener" target="_blank">Ko-fi: developer_benjamink</a></li>
        </ul>
        <p><a href="/">Browse all games</a> · <a href="/privacy">Privacy Policy</a></p>
      </div>`,
  },
  privacy: {
    title: 'Privacy Policy | ArcadeDeck',
    description: 'Read the ArcadeDeck Privacy Policy: data we collect, cookies, Google AdSense, Google Analytics, Firebase, GDPR/CCPA rights, and contact details.',
    canonical: 'https://arcadedeck.net/privacy',
    extraLd: [breadcrumbLdFor('Privacy', 'https://arcadedeck.net/privacy')],
    noscript: `
      <div style="background:#171424;color:#eaeaf0;font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto;">
        <h1>ArcadeDeck Privacy Policy</h1>
        <p>This page summarises what data ArcadeDeck collects, how it is used, and the choices you have. Load the page with JavaScript enabled to view the fully formatted policy with all sections and links.</p>
        <h2>What We Collect</h2>
        <p>We collect only the minimum needed to operate the service: your self-chosen Gamer ID (nickname), game scores, comments you voluntarily post, and standard automatic browser data (user-agent, screen size, language, approximate location from IP). We never ask for your real name, email, or password.</p>
        <h2>Cookies and Local Storage</h2>
        <p>Strictly necessary localStorage holds your Gamer ID, language, recently played games, and liked games. Google Analytics sets cookies for aggregate traffic measurement. Google AdSense and its partners may set cookies to deliver and measure ads.</p>
        <h2>Third-Party Services</h2>
        <p>ArcadeDeck relies on Google AdSense (advertising), Google Analytics (traffic measurement), Google Firebase / Firestore (leaderboard and comment storage), and Google Fonts (typography). Each operates under its own privacy policy.</p>
        <h2>Your Rights</h2>
        <p>Under GDPR and CCPA you may request access, correction, or deletion of your data, object to processing, withdraw advertising consent, or lodge a complaint with your local data protection authority. Email <a href="mailto:help@arcadedeck.net">help@arcadedeck.net</a> with your Gamer ID to exercise these rights.</p>
        <h2>Children</h2>
        <p>ArcadeDeck is not directed at children under 13 (or the local equivalent). We do not knowingly collect personal information from children.</p>
        <h2>Contact</h2>
        <p>Privacy questions: <a href="mailto:help@arcadedeck.net">help@arcadedeck.net</a>.</p>
      </div>`,
  },
  contact: {
    title: 'Contact | ArcadeDeck',
    description: 'Contact ArcadeDeck — email help@arcadedeck.net for support, bug reports, partnership inquiries, or game submissions.',
    canonical: 'https://arcadedeck.net/contact',
    extraLd: [breadcrumbLdFor('Contact', 'https://arcadedeck.net/contact')],
    noscript: `
      <div style="background:#171424;color:#eaeaf0;font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto;">
        <h1>Contact ArcadeDeck</h1>
        <p>The fastest way to reach us is email. We answer every message — whether it is a bug report, a partnership inquiry, a game submission, or general feedback.</p>
        <h2>Support</h2>
        <p>Issues with a game, leaderboard, or your Gamer ID: <a href="mailto:help@arcadedeck.net">help@arcadedeck.net</a>. Include the game name, your Gamer ID, and a short description of what happened. Screenshots speed up triage.</p>
        <h2>Game Submissions</h2>
        <p>If you have built an original browser game and want it featured on ArcadeDeck, send a playable URL plus a one-paragraph description to <a href="mailto:help@arcadedeck.net">help@arcadedeck.net</a>. We review submissions for quality, originality, and platform fit.</p>
        <h2>Partnerships and Press</h2>
        <p>Press kits, partnership proposals, and bulk inquiries can also be sent to the same address. Please mention "Partnership" or "Press" in the subject line so we can route it quickly.</p>
        <h2>Privacy and Data Requests</h2>
        <p>For GDPR, CCPA, or general privacy requests, see the <a href="/privacy">Privacy Policy</a>, then email us with your Gamer ID and the affected games.</p>
        <p><a href="/">Browse all games</a> · <a href="/about">About ArcadeDeck</a></p>
      </div>`,
  },
};

const replaceMeta = (html, name, value) =>
  html.replace(
    new RegExp(`(<meta name="${name}" content=")[^"]*(")`),
    `$1${value}$2`
  );
const replaceTitle = (html, value) =>
  html.replace(/<title>[\s\S]*?<\/title>/, `<title>${value}</title>`);
const replaceCanonical = (html, value) =>
  html.replace(
    /(<link rel="canonical" href=")[^"]*(")/,
    `$1${value}$2`
  );
const injectHreflang = (html, value) => {
  const block = `<link rel="canonical" href="${value}" />\n    <link rel="alternate" hreflang="en" href="${value}" />\n    <link rel="alternate" hreflang="x-default" href="${value}" />`;
  return html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    block,
  );
};
const replaceOgUrl = (html, value) =>
  html.replace(
    /(<meta property="og:url" content=")[^"]*(")/,
    `$1${value}$2`
  );
const replaceOgTitle = (html, value) =>
  html.replace(
    /(<meta property="og:title" content=")[^"]*(")/,
    `$1${value}$2`
  );
const replaceOgDesc = (html, value) =>
  html.replace(
    /(<meta property="og:description" content=")[^"]*(")/,
    `$1${value}$2`
  );

const overrideTwitter = (shell, url, title, description) => {
  const esc = (s) => String(s).replace(/"/g, '&quot;');
  return shell
    .replace(
      /(<meta (?:name|property)="twitter:url" content=")[^"]*(")/,
      `$1${url}$2`,
    )
    .replace(
      /(<meta (?:name|property)="twitter:title" content=")[^"]*(")/,
      `$1${esc(title)}$2`,
    )
    .replace(
      /(<meta (?:name|property)="twitter:description" content=")[^"]*(")/,
      `$1${esc(description)}$2`,
    );
};

for (const [route, cfg] of Object.entries(routeShells)) {
  const dir = `dist/${route}`;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  let shell = inlineCssOnce(indexHtml).replace(
    NOSCRIPT_BLOCK_REGEX,
    `<noscript>${cfg.noscript}\n    </noscript>`
  );
  shell = replaceTitle(shell, cfg.title);
  shell = replaceMeta(shell, 'description', cfg.description);
  shell = replaceCanonical(shell, cfg.canonical);
  shell = injectHreflang(shell, cfg.canonical);
  shell = replaceOgUrl(shell, cfg.canonical);
  shell = replaceOgTitle(shell, cfg.title);
  shell = replaceOgDesc(shell, cfg.description);
  shell = overrideTwitter(shell, cfg.canonical, cfg.title, cfg.description);

  if (Array.isArray(cfg.extraLd) && cfg.extraLd.length) {
    const extraLdTags = cfg.extraLd
      .map((j) => `<script type="application/ld+json">${j}</script>`)
      .join('\n    ');
    shell = shell.replace('</head>', `${extraLdTags}\n  </head>`);
  }

  writeFileSync(`${dir}/index.html`, shell);
}

// Per-blog-post static shells with full post HTML in noscript so crawlers
// (search engines, AdSense reviewer) see the article body without JS.
const DEFAULT_OG_IMAGE = 'https://arcadedeck.net/images/blog/blog-default-cover.webp';

const absoluteImageUrl = (raw) => {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const trimmed = raw.replace(/^\//, '');
  return `https://arcadedeck.net/${encodeURI(trimmed)}`;
};

const wordCountOf = (html) =>
  String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean).length;

for (const post of posts) {
  const dir = `dist/blog/${post.slug}`;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const url = `https://arcadedeck.net/blog/${post.slug}`;
  const title = `${post.title} | ArcadeDeck Blog`;
  const tagsHtml = post.tags
    .map((t) => `<a href="/blog/tag/${t}" style="color:#00d2ff;text-decoration:none;">#${t}</a>`)
    .join(' ');

  const relatedGames = (post.relatedGames || [])
    .map((s) => games.find((g) => g.slug === s))
    .filter((g) => g && g.status !== 'IN PRODUCTION');
  const relatedHtml = relatedGames.length
    ? `<section aria-label="Related games" style="margin-top:40px;padding-top:28px;border-top:1px solid #2a2740;">
        <h2 style="margin:0 0 16px;font-size:1.05rem;text-transform:uppercase;letter-spacing:0.06em;color:#fff;">Play the games</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;">
${relatedGames
  .map(
    (g) => `          <a href="/play/${g.slug}" style="display:flex;flex-direction:column;background:rgba(255,255,255,0.04);border:1px solid #2a2740;border-radius:12px;overflow:hidden;text-decoration:none;color:inherit;">
            <img src="/${encodeURI(g.thumbnail)}" alt="${g.title} cover" loading="lazy" decoding="async" style="width:100%;aspect-ratio:16/9;object-fit:cover;display:block;" />
            <div style="padding:12px 14px;">
              <h3 style="font-size:0.98rem;margin:0 0 4px;color:#fff;">${g.title}</h3>
              <p style="font-size:0.82rem;margin:0;color:#9aa;line-height:1.45;">${g.description}</p>
              <p style="margin:8px 0 0;"><strong style="color:#00d2ff;">▶ Play free →</strong></p>
            </div>
          </a>`,
  )
  .join('\n')}
        </div>
      </section>`
    : '';

  const postImage =
    absoluteImageUrl(post.coverImage) ||
    (relatedGames.length
      ? `https://arcadedeck.net/${encodeURI(relatedGames[0].thumbnail)}`
      : DEFAULT_OG_IMAGE);
  const postImageAlt =
    post.coverImageAlt ||
    (relatedGames.length ? `${relatedGames[0].title} cover art` : `${post.title} — ArcadeDeck Blog`);
  const articleSection = (post.tags && post.tags[0]) || 'News';
  const wordCount = wordCountOf(post.content);
  const readingMinutes = Math.max(1, Math.round(wordCount / 220));
  const dateModified = post.dateModified || post.date;

  const postNoscript = `
      <div style="background:#171424;color:#eaeaf0;font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto;line-height:1.7;">
        <nav aria-label="Breadcrumb" style="color:#9aa;font-size:0.85rem;margin-bottom:12px;">
          <a href="/" style="color:#00d2ff;">Home</a> &rsaquo;
          <a href="/blog" style="color:#00d2ff;">Blog</a> &rsaquo;
          <span>${post.title}</span>
        </nav>
        <h1 style="font-size:1.8rem;margin-bottom:8px;">${post.title}</h1>
        <p style="color:#9aa;font-size:0.85rem;margin:0 0 20px;"><time datetime="${post.date}">${formatPostDate(post.date)}</time> · ${post.author} · ${tagsHtml}</p>
        ${post.content}
        ${relatedHtml}
        <p style="margin-top:32px;"><a href="/blog" style="color:#00d2ff;">More from the ArcadeDeck blog</a> · <a href="/" style="color:#00d2ff;">Browse all games</a></p>
      </div>`;

  const articleJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: [postImage],
    datePublished: post.date,
    dateModified,
    author: {
      '@type': 'Organization',
      name: post.author,
      url: 'https://arcadedeck.net/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ArcadeDeck',
      url: 'https://arcadedeck.net',
      logo: {
        '@type': 'ImageObject',
        url: 'https://arcadedeck.net/images/icon-512x512.webp',
      },
      sameAs: ['https://www.wikidata.org/wiki/Q139585213'],
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    articleSection,
    keywords: post.tags.join(', '),
    wordCount,
    timeRequired: `PT${readingMinutes}M`,
    inLanguage: 'en',
  });

  const breadcrumbLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://arcadedeck.net/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://arcadedeck.net/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  });

  let shell = inlineCssOnce(indexHtml).replace(
    NOSCRIPT_BLOCK_REGEX,
    `<noscript>${postNoscript}\n    </noscript>`,
  );
  shell = replaceTitle(shell, title);
  shell = replaceMeta(shell, 'description', post.excerpt);
  shell = replaceCanonical(shell, url);
  shell = injectHreflang(shell, url);
  shell = replaceOgUrl(shell, url);
  shell = replaceOgTitle(shell, title);
  shell = replaceOgDesc(shell, post.excerpt);
  shell = overrideTwitter(shell, url, title, post.excerpt);
  // og:image override for the post (use related game thumb if any)
  shell = shell.replace(
    /(<meta property="og:image" content=")[^"]*(")/,
    `$1${postImage}$2`,
  );
  shell = shell.replace(
    /(<meta (?:name|property)="twitter:image" content=")[^"]*(")/,
    `$1${postImage}$2`,
  );
  // Inject og:image:alt + twitter:image:alt + Twitter labels right after twitter:image
  const articleTagMetas = post.tags
    .map((t) => `    <meta property="article:tag" content="${t}" />`)
    .join('\n');
  const extraSocialMeta = `
    <meta property="og:image:alt" content="${postImageAlt}" />
    <meta name="twitter:image:alt" content="${postImageAlt}" />
    <meta name="twitter:label1" content="Reading time" />
    <meta name="twitter:data1" content="${readingMinutes} min" />
    <meta name="twitter:label2" content="Filed under" />
    <meta name="twitter:data2" content="${articleSection}" />`;
  shell = shell.replace(
    /(<meta (?:name|property)="twitter:image" content="[^"]*" \/>)/,
    `$1${extraSocialMeta}`,
  );
  // Override generic keywords + author with post-specific values
  shell = shell.replace(
    /(<meta name="keywords" content=")[^"]*(")/,
    `$1${post.tags.join(', ')}$2`,
  );
  shell = shell.replace(
    /(<meta name="author" content=")[^"]*(")/,
    `$1${post.author}$2`,
  );
  // og:type article for posts
  shell = shell.replace(
    /<meta property="og:type" content="website" \/>/,
    `<meta property="og:type" content="article" />\n    <meta property="article:published_time" content="${post.date}" />\n    <meta property="article:modified_time" content="${dateModified}" />\n    <meta property="article:section" content="${articleSection}" />\n    <meta property="article:author" content="${post.author}" />\n${articleTagMetas}`,
  );
  // Inject BlogPosting + BreadcrumbList JSON-LD before </head>
  shell = shell.replace(
    '</head>',
    `<script type="application/ld+json">${articleJsonLd}</script>\n    <script type="application/ld+json">${breadcrumbLd}</script>\n  </head>`,
  );

  writeFileSync(`${dir}/index.html`, shell);
}

// Per-tag blog index pages: /blog/tag/{tag}/index.html. Crawlers and AdSense
// reviewer see the tagged-post list in noscript; React replaces on mount.
const allTags = (() => {
  const set = new Set();
  posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
  return Array.from(set).sort();
})();

const formatTagLabel = (t) =>
  t
    .split('-')
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');

for (const tag of allTags) {
  const matches = posts.filter((p) => p.tags.includes(tag));
  if (!matches.length) continue;
  const dir = `dist/blog/tag/${tag}`;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const tagUrl = `https://arcadedeck.net/blog/tag/${tag}`;
  const label = formatTagLabel(tag);
  const tagTitle = `${label} | ArcadeDeck Blog`;
  const tagDesc = `All ArcadeDeck blog posts tagged "${label}" — strategy guides, design notes, patch notes, and recaps.`;

  const tagNoscript = `
      <div style="background:#171424;color:#eaeaf0;font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto;">
        <nav aria-label="Breadcrumb" style="color:#9aa;font-size:0.85rem;margin-bottom:12px;">
          <a href="/" style="color:#00d2ff;">Home</a> &rsaquo;
          <a href="/blog" style="color:#00d2ff;">Blog</a> &rsaquo;
          <span>#${tag}</span>
        </nav>
        <h1>#${label}</h1>
        <p>${matches.length} post${matches.length === 1 ? '' : 's'} tagged <strong>${label}</strong> on the ArcadeDeck devlog.</p>
        <h2>Posts</h2>
        <ul>
${matches
  .map(
    (p) =>
      `          <li><a href="/blog/${p.slug}">${p.title}</a> — <em>${formatPostDate(p.date)}</em>. ${p.excerpt}</li>`,
  )
  .join('\n')}
        </ul>
        <p><a href="/blog">All blog posts</a> · <a href="/">Browse all games</a></p>
      </div>`;

  const tagItemListLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: tagTitle,
    url: tagUrl,
    description: tagDesc,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: matches.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://arcadedeck.net/blog/${p.slug}`,
        name: p.title,
      })),
    },
  });
  const tagBreadcrumbLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://arcadedeck.net/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://arcadedeck.net/blog' },
      { '@type': 'ListItem', position: 3, name: label, item: tagUrl },
    ],
  });

  let shell = inlineCssOnce(indexHtml).replace(
    NOSCRIPT_BLOCK_REGEX,
    `<noscript>${tagNoscript}\n    </noscript>`,
  );
  shell = replaceTitle(shell, tagTitle);
  shell = replaceMeta(shell, 'description', tagDesc);
  shell = replaceCanonical(shell, tagUrl);
  shell = injectHreflang(shell, tagUrl);
  shell = replaceOgUrl(shell, tagUrl);
  shell = replaceOgTitle(shell, tagTitle);
  shell = replaceOgDesc(shell, tagDesc);
  shell = overrideTwitter(shell, tagUrl, tagTitle, tagDesc);
  const tagLdTags = [tagItemListLd, tagBreadcrumbLd]
    .map((j) => `<script type="application/ld+json">${j}</script>`)
    .join('\n    ');
  shell = shell.replace('</head>', `${tagLdTags}\n  </head>`);
  writeFileSync(`${dir}/index.html`, shell);
}

console.log(`Pre-rendered ${playableGames.length} game pages + ${Object.keys(routeShells).length} static routes + ${posts.length} blog posts + ${allTags.length} tag pages (per-route noscript bodies).`);
