/**
 * Post-build script: generates static HTML shells for crawlers.
 *
 * Per-locale prerender (full hreflang + translated meta + body):
 *   - /              + /{lang}/
 *   - /play/{slug}   + /{lang}/play/{slug}
 *
 * English-only prerender (hreflang only points at self):
 *   - /about, /privacy, /contact, /hall-of-fame, /my-games
 *   - /blog, /blog/{slug}, /blog/tag/{tag}
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';

const SUPPORTED_LOCALES = readdirSync('src/i18n/locales')
  .filter(f => f.endsWith('.json') && !f.startsWith('_') && !f.includes('.missing.') && !f.includes('.bak.'))
  .map(f => f.replace(/\.json$/, ''));

// Stable order: English first, others alpha-sorted.
SUPPORTED_LOCALES.sort((a, b) => (a === 'en' ? -1 : b === 'en' ? 1 : a.localeCompare(b)));

const BCP47 = {
  en: 'en_US', de: 'de_DE', fr: 'fr_FR',
  ja: 'ja_JP', ko: 'ko_KR', zh: 'zh_CN',
};
const HREFLANG = {
  en: 'en', de: 'de', fr: 'fr',
  ja: 'ja', ko: 'ko', zh: 'zh',
};
const HTML_LANG = {
  en: 'en', de: 'de', fr: 'fr',
  ja: 'ja', ko: 'ko', zh: 'zh',
};

const SITE = 'https://arcadedeck.net';
const prefix = (lang) => (lang === 'en' ? '' : '/' + lang.toLowerCase());
const fullUrl = (lang, path) => `${SITE}${prefix(lang)}${path}`;

const games = JSON.parse(readFileSync('src/data/games.json', 'utf-8'));
const posts = JSON.parse(readFileSync('src/data/posts.json', 'utf-8'))
  .slice()
  .sort((a, b) => (a.date < b.date ? 1 : -1));
const indexHtml = readFileSync('dist/index.html', 'utf-8');

const overlays = {};
for (const l of SUPPORTED_LOCALES) {
  try {
    overlays[l] = JSON.parse(readFileSync(`src/i18n/locales/${l}.json`, 'utf-8'));
  } catch {
    overlays[l] = {};
  }
}
const en = overlays.en || {};

function txt(id, lang) {
  const o = overlays[lang]?.games?.[id] || {};
  const f = en.games?.[id] || {};
  const pickArr = (k) => (Array.isArray(o[k]) ? o[k] : (Array.isArray(f[k]) ? f[k] : []));
  return {
    title: o.title || f.title || '',
    description: o.description || f.description || '',
    fullDescription: o.fullDescription || f.fullDescription || '',
    controls: o.controls || f.controls || '',
    tips: o.tips || f.tips || '',
    lore: o.lore || f.lore || '',
    features: pickArr('features'),
    objectives: o.objectives || f.objectives || '',
    controlsTable: pickArr('controlsTable'),
    faq: pickArr('faq'),
    characters: pickArr('characters'),
    featuredComments: pickArr('featuredComments'),
  };
}

function ui(key, lang, fallback = '') {
  return overlays[lang]?.ui?.[key] || en.ui?.[key] || fallback;
}

function escAttr(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// hreflang block: list every locale that has a translation entry for `gameId`,
// or all locales for catalog/static pages (pass gameId=null).
function hreflangBlock(routePath, gameId = null) {
  const langs = gameId
    ? SUPPORTED_LOCALES.filter(l => overlays[l]?.games?.[gameId])
    : SUPPORTED_LOCALES;
  const seen = new Set();
  const lines = [];
  for (const l of langs) {
    const url = fullUrl(l, routePath);
    if (seen.has(url)) continue;
    seen.add(url);
    lines.push(`<link rel="alternate" hreflang="${HREFLANG[l] || l}" href="${url}" />`);
  }
  // x-default → English
  lines.push(`<link rel="alternate" hreflang="x-default" href="${fullUrl('en', routePath)}" />`);
  return lines.join('\n    ');
}

function ogLocaleAlts(activeLang, scopeLangs = SUPPORTED_LOCALES) {
  return scopeLangs
    .filter(l => l !== activeLang)
    .map(l => `<meta property="og:locale:alternate" content="${BCP47[l] || l}" />`)
    .join('\n    ');
}

// Extract head/scripts/CSS from the built index.html so each shell can be
// self-contained (inline CSS + module preloads + bundled scripts).
const headMatch = indexHtml.match(/<head>([\s\S]*?)<\/head>/);
const baseHead = headMatch ? headMatch[1] : '';
const scriptMatches = indexHtml.match(/<script[\s\S]*?<\/script>/g) || [];
const scriptTags = scriptMatches.join('\n    ');

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

// Same-genre cross-links for the static game shell. Boosts crawl + internal
// PageRank without polluting the React tree.
function sameGenreLinks(game, lang, limit = 3) {
  const out = [];
  const seen = new Set([game.id]);
  for (const g of playableGames) {
    if (seen.has(g.id)) continue;
    if (!g.genres.some(x => game.genres.includes(x))) continue;
    out.push(g);
    seen.add(g.id);
    if (out.length >= limit) break;
  }
  return out;
}

// =====================================================================
// PER-LOCALE GAME SHELLS — /play/{slug} + /{lang}/play/{slug}
// =====================================================================
for (const lang of SUPPORTED_LOCALES) {
  for (const game of playableGames) {
    const slug = game.slug;
    const routePath = `/play/${slug}`;
    const dir = `dist${prefix(lang)}/play/${slug}`;
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const t = txt(game.id, lang);
    const tEn = txt(game.id, 'en');
    const playFreeOn = ui('seoPlayFreeOn', lang, 'Play Free on');
    const playPrefix = ui('seoPlayPrefix', lang, 'Play');
    const aboutH2 = ui('seoAboutThisGame', lang, 'About This Game');
    const howToH2 = ui('seoHowToPlay', lang, 'How to Play');
    const tipsH2 = ui('seoProTips', lang, 'Pro Tips');
    const loreH2 = ui('seoWorldLore', lang, 'World Lore');
    const featH2 = ui('seoKeyFeatures', lang, 'Key Features');
    const moreH2 = ui('seoMoreLikeThis', lang, 'More Games Like This');
    const readBlogH2 = ui('seoReadOnBlog', lang, 'Read on the Blog');
    const genresLabel = ui('seoGenres', lang, 'Genres');

    const title = `${t.title} - ${playFreeOn} ArcadeDeck`;
    const desc = `${playPrefix} ${t.title}: ${t.description} ${ui('seoFreeOnlineGame', lang, 'Free online browser game on ArcadeDeck.')}`;
    const thumbUrl = `${SITE}/${encodeURI(game.thumbnail)}`;
    const pageUrl = fullUrl(lang, routePath);
    // Hero banner is the LCP element on the click-to-start page. Preload it
    // in <head> so the fetch starts in parallel with HTML parsing.
    const heroBannerSrc = game.pageBg || game.thumbnail || '';
    const heroBannerHref = heroBannerSrc
      ? (heroBannerSrc.startsWith('http') ? heroBannerSrc : `/${heroBannerSrc.replace(/^\//, '')}`)
      : '';
    const heroPreload = heroBannerHref
      ? `<link rel="preload" as="image" href="${escAttr(heroBannerHref)}" fetchpriority="high" />`
      : '';
    // If this locale has no translation for the game, the page would just be
    // an English duplicate at a localized URL — point the canonical at the
    // English original so search engines consolidate signals there. The shell
    // still ships so SPA navigation works for users who picked the language.
    const hasTranslation = lang === 'en' || !!overlays[lang]?.games?.[game.id];
    const canonical = hasTranslation ? pageUrl : fullUrl('en', routePath);
    const robotsValue = hasTranslation ? 'index, follow' : 'noindex, follow';
    const ogAlts = ogLocaleAlts(lang, SUPPORTED_LOCALES.filter(l => overlays[l]?.games?.[game.id]));

    const jsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: t.title,
      description: t.description,
      genre: game.genres,
      applicationCategory: 'GameApplication',
      operatingSystem: 'Web Browser',
      image: thumbUrl,
      url: pageUrl,
      inLanguage: HREFLANG[lang] || lang,
      author: { '@type': 'Organization', name: 'ArcadeDeck', url: SITE, sameAs: ['https://www.wikidata.org/wiki/Q139585213'] },
      publisher: {
        '@type': 'Organization', name: 'ArcadeDeck', url: SITE,
        logo: { '@type': 'ImageObject', url: `${SITE}/images/icon-512x512.webp` },
        sameAs: ['https://www.wikidata.org/wiki/Q139585213'],
      },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
    });

    const breadcrumbLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: ui('breadcrumbHome', lang, 'Home'), item: fullUrl(lang, '/') },
        { '@type': 'ListItem', position: 2, name: game.genres[0] || 'Games', item: fullUrl(lang, '/') },
        { '@type': 'ListItem', position: 3, name: t.title, item: pageUrl },
      ],
    });

    // FAQ schema — Google rewards FAQ-rich pages for both rich results and
    // AdSense "substantive content" signals. Prefer authored t.faq when it
    // exists; otherwise synthesise five Q/A pairs from the game's metadata so
    // the answers are authentic, not boilerplate.
    const isMobileAspect = String(game.aspectRatio || '').startsWith('9');
    const mobileAnswer = isMobileAspect
      ? `Yes — ${t.title} is built mobile-first and runs in any modern mobile browser. Tap controls are sized for one-handed play.`
      : `Yes — ${t.title} runs in any modern mobile browser. The game is optimised for desktop play, but mobile controls are available.`;
    const faqPairs = (Array.isArray(t.faq) && t.faq.length > 0)
      ? t.faq.filter(p => p && p.q && p.a)
      : [
          { q: `What is ${t.title}?`, a: `${t.description} ${t.fullDescription || ''}`.replace(/\s+/g, ' ').trim() },
          { q: `How do I play ${t.title}?`, a: t.controls },
          { q: `What tips will help me improve at ${t.title}?`, a: t.tips },
          { q: `Is ${t.title} free to play on ArcadeDeck?`, a: `Yes — ${t.title} is completely free to play on ArcadeDeck. No downloads, no sign-ups, no in-app purchases. Open the page and start playing.` },
          { q: `Can I play ${t.title} on a mobile device?`, a: mobileAnswer },
        ].filter(p => p.a && p.a.length > 4);
    const faqLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: HREFLANG[lang] || lang,
      mainEntity: faqPairs.map(p => ({
        '@type': 'Question',
        name: p.q,
        acceptedAnswer: { '@type': 'Answer', text: p.a },
      })),
    });

    const featuresHtml = t.features.map(f => `<li>${f}</li>`).join('');

    // Structured long-mode subsections — rendered into the SEO body so crawlers
    // index them even before React mounts.
    const objectivesHeading = ui('playerObjectives', lang, 'Objectives');
    const ctblHeading = ui('controlsTableHeading', lang, 'Quick Reference');
    const ctblKeyH = ui('controlsTableKey', lang, 'Input');
    const ctblActH = ui('controlsTableAction', lang, 'Action');
    const faqStaticHeading = ui('faqHeading', lang, 'FAQ');
    const castHeading = ui('charactersHeading', lang, 'Cast');

    const objectivesHtml = t.objectives
      ? `<h2 style="margin-top:32px;font-size:1.3rem;">🎯 ${objectivesHeading}</h2><p style="line-height:1.7;">${t.objectives}</p>`
      : '';
    const controlsTableHtml = (Array.isArray(t.controlsTable) && t.controlsTable.length)
      ? `<h2 style="margin-top:32px;font-size:1.3rem;">${ctblHeading}</h2><table style="width:100%;border-collapse:collapse;margin-top:8px;"><thead><tr><th style="text-align:left;padding:8px;border-bottom:1px solid #2a2740;">${ctblKeyH}</th><th style="text-align:left;padding:8px;border-bottom:1px solid #2a2740;">${ctblActH}</th></tr></thead><tbody>${t.controlsTable.map(r => `<tr><td style="padding:8px;font-family:monospace;border-bottom:1px solid #1a1726;">${r.key}</td><td style="padding:8px;border-bottom:1px solid #1a1726;">${r.action}</td></tr>`).join('')}</tbody></table>`
      : '';
    const charactersHtml = (Array.isArray(t.characters) && t.characters.length)
      ? `<h2 style="margin-top:32px;font-size:1.3rem;">${castHeading}</h2><ul style="line-height:1.7;list-style:none;padding:0;">${t.characters.map(c => `<li style="margin-bottom:12px;"><strong>${c.name}</strong> <em style="color:#9aa;font-size:0.85rem;">${c.role}</em><br>${c.desc}</li>`).join('')}</ul>`
      : '';
    const faqStaticHtml = (Array.isArray(t.faq) && t.faq.length)
      ? `<h2 style="margin-top:32px;font-size:1.3rem;">${faqStaticHeading}</h2><dl style="line-height:1.7;">${t.faq.map(p => `<dt style="font-weight:700;color:#00d2ff;margin-top:12px;">${p.q}</dt><dd style="margin:4px 0 0 0;">${p.a}</dd>`).join('')}</dl>`
      : '';
    const featuredCommentsHeading = ui('seoPlayerHighlights', lang, 'Player Highlights');
    const featuredCommentsHtml = (Array.isArray(t.featuredComments) && t.featuredComments.length)
      ? `<h2 style="margin-top:32px;font-size:1.3rem;">${featuredCommentsHeading}</h2>${t.featuredComments.map(c => `<blockquote style="border-left:3px solid #00d2ff;background:rgba(0,210,255,0.04);padding:12px 16px;margin:12px 0;border-radius:0 8px 8px 0;"><p style="margin:0 0 6px;line-height:1.6;">"${c.text}"</p><cite style="color:#9aa;font-style:normal;font-size:0.85rem;">— ${c.name}${c.badge ? ` <span style=\"color:#00d2ff;font-weight:700;\">(${c.badge})</span>` : ''}</cite></blockquote>`).join('')}`
      : '';

    // UGC pointers — give crawlers a visible, indexable anchor for the
    // community surfaces (leaderboard, comments, forum). The actual data is
    // rendered client-side from Firestore, but the prerender at least tells
    // crawlers that the page has user-generated content tied to it.
    const lbTitle = (game.leaderboard && game.leaderboard.title) || `${t.title} Leaderboard`;
    const lbPrimary = (game.leaderboard && game.leaderboard.primaryLabel) || 'Score';
    const ugcCommunityH2 = ui('seoCommunityTitle', lang, 'Community & Leaderboard');
    const ugcLeaderboardLine = ui(
      'seoLeaderboardIntro', lang,
      `Every score posted in ${t.title} updates the global "${lbTitle}" leaderboard, sorted by ${lbPrimary}. Top players are archived to the Hall of Fame at the end of every month.`,
    );
    const ugcCommentsLine = ui(
      'seoCommentsIntro', lang,
      `Players share strategies, post personal-best replays, and discuss tactics in the comments section below the game frame.`,
    );
    const ugcForumLink = ui('seoForumLinkLabel', lang, 'Visit the ArcadeDeck player forum');
    const ugcHallLink = ui('seoHallLinkLabel', lang, 'Hall of Fame');
    const ugcHtml = `<h2 style="margin-top:32px;font-size:1.3rem;">${ugcCommunityH2}</h2>
        <p style="line-height:1.7;">${ugcLeaderboardLine}</p>
        <p style="line-height:1.7;">${ugcCommentsLine}</p>
        <p style="line-height:1.7;"><a href="${fullUrl(lang, '/forum')}" style="color:#00d2ff;">${ugcForumLink}</a> · <a href="${fullUrl(lang, '/hall-of-fame')}" style="color:#00d2ff;">${ugcHallLink}</a></p>`;

    const gameRelatedPosts = postsForGame(slug);
    const relatedPostsHtml = gameRelatedPosts.length
      ? `<h2 style="margin-top:32px;font-size:1.3rem;">${readBlogH2}</h2><ul style="line-height:1.8;">${gameRelatedPosts
          .map((p) => `<li><a href="${SITE}/blog/${p.slug}" style="color:#00d2ff;">${p.title}</a> — ${p.excerpt}</li>`)
          .join('')}</ul>`
      : '';

    // Same-genre cross-links: 3 anchors at the bottom of the page. Using
    // absolute URLs in the per-locale prefix so crawlers reach the right
    // language shell directly.
    const crossLinks = sameGenreLinks(game, lang);
    const crossLinksHtml = crossLinks.length
      ? `<h2 style="margin-top:32px;font-size:1.3rem;">${moreH2}</h2><ul style="line-height:1.8;">${crossLinks
          .map((g) => {
            const gt = txt(g.id, lang);
            return `<li><a href="${fullUrl(lang, '/play/' + g.slug)}" style="color:#00d2ff;">${gt.title}</a> — ${gt.description}</li>`;
          }).join('')}</ul>`
      : '';

    const html = `<!doctype html>
<html lang="${HTML_LANG[lang] || lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>${escAttr(title)}</title>
    <meta name="description" content="${escAttr(desc)}" />
    <meta name="keywords" content="${escAttr(t.title)}, ${escAttr(game.genres.join(', '))}, free online game, browser game, arcadedeck" />
    <meta name="robots" content="${robotsValue}" />
    <meta name="theme-color" content="#050507" />
    <link rel="icon" type="image/webp" href="/images/favicon.webp" />
    <link rel="apple-touch-icon" href="/images/icon-192x192.webp" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <link rel="canonical" href="${canonical}" />
    ${heroPreload}
    ${hreflangBlock(routePath, game.id)}
    <link rel="alternate" type="application/rss+xml" title="ArcadeDeck Blog" href="${SITE}/rss.xml" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="ArcadeDeck" />
    <meta property="og:locale" content="${BCP47[lang] || lang}" />
    ${ogAlts}
    <meta property="og:title" content="${escAttr(t.title)} - ArcadeDeck" />
    <meta property="og:description" content="${escAttr(t.description)}" />
    <meta property="og:image" content="${thumbUrl}" />
    <meta property="og:url" content="${pageUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escAttr(t.title)} - ArcadeDeck" />
    <meta name="twitter:description" content="${escAttr(t.description)}" />
    <meta name="twitter:image" content="${thumbUrl}" />
    <script type="application/ld+json">${jsonLd}</script>
    <script type="application/ld+json">${breadcrumbLd}</script>
    ${faqPairs.length ? `<script type="application/ld+json">${faqLd}</script>` : ''}
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
          <a href="${fullUrl(lang, '/')}" style="color:#00d2ff;">${ui('breadcrumbHome', lang, 'Home')}</a> &rsaquo; <span>${t.title}</span>
        </nav>
        <h1 style="font-size:2rem;margin-bottom:8px;">${t.title}</h1>
        <p style="font-size:1.1rem;line-height:1.6;">${t.description}</p>

        <h2 style="margin-top:32px;font-size:1.3rem;">${aboutH2}</h2>
        <div style="line-height:1.7;">${(t.fullDescription || '').replace(/\n/g, '<br>')}</div>

        ${objectivesHtml}

        ${t.controls ? `<h2 style="margin-top:32px;font-size:1.3rem;">${howToH2}</h2><p style="line-height:1.6;">${t.controls}</p>` : ''}

        ${controlsTableHtml}

        ${t.tips ? `<h2 style="margin-top:32px;font-size:1.3rem;">${tipsH2}</h2><p style="line-height:1.6;">${t.tips}</p>` : ''}

        ${faqStaticHtml}

        ${t.lore ? `<h2 style="margin-top:32px;font-size:1.3rem;">${loreH2}</h2><div style="line-height:1.7;font-style:italic;">${t.lore.replace(/\n/g, '<br>')}</div>` : ''}

        ${charactersHtml}

        ${featuresHtml ? `<h2 style="margin-top:32px;font-size:1.3rem;">${featH2}</h2><ul style="line-height:1.8;">${featuresHtml}</ul>` : ''}

        ${ugcHtml}

        ${featuredCommentsHtml}

        ${crossLinksHtml}

        ${relatedPostsHtml}

        <p style="margin-top:32px;color:#9aa;">${genresLabel}: ${game.genres.join(', ')}</p>
        <p style="color:#9aa;">${ui('seoLoadingGame', lang, 'Loading interactive game…')} <a href="${pageUrl}" style="color:#00d2ff;">${pageUrl}</a></p>
      </main>
    </div>
    ${scriptTags}
  </body>
</html>`;

    writeFileSync(`${dir}/index.html`, html);
  }
}

// =====================================================================
// PER-LOCALE GENRE LANDING PAGES — /genre/{slug} + /{lang}/genre/{slug}
// =====================================================================
function genreSlug(name) {
  return String(name).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

const allGenres = (() => {
  const set = new Set();
  for (const g of playableGames) {
    for (const genre of g.genres) set.add(genre);
  }
  return Array.from(set).sort();
})();

for (const genre of allGenres) {
  const slug = genreSlug(genre);
  const inGenre = playableGames.filter(g => g.genres.includes(genre));
  const routePath = `/genre/${slug}`;

  for (const lang of SUPPORTED_LOCALES) {
    const dir = `dist${prefix(lang)}/genre/${slug}`;
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const pageUrl = fullUrl(lang, routePath);
    const titleTemplate = ui('seoGenrePageTitle', lang, '{genre} Games | Play Free on ArcadeDeck');
    const descTemplate = ui('seoGenrePageDescription', lang, 'Play {count} {genre} games free on ArcadeDeck. Curated browser titles with global leaderboards. No downloads, no sign-up.');
    const title = titleTemplate.replace('{genre}', genre).replace('{count}', String(inGenre.length));
    const desc = descTemplate.replace('{genre}', genre).replace('{count}', String(inGenre.length));
    const heading = ui('genrePageHeading', lang, '{genre} Games').replace('{genre}', genre);
    const subheading = ui('genrePageSubheading', lang, '{count} games in this genre on ArcadeDeck.').replace('{count}', String(inGenre.length));
    const listLabel = ui('genreGameList', lang, 'Games in this genre');

    const itemsHtml = inGenre.map((g) => {
      const gt = txt(g.id, lang);
      const href = fullUrl(lang, `/play/${g.slug}`);
      return `          <li><a href="${href}" style="color:#00d2ff;">${gt.title || ''}</a> — ${gt.description || ''}</li>`;
    }).join('\n');

    const collectionLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      url: pageUrl,
      description: desc,
      inLanguage: HREFLANG[lang] || lang,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: inGenre.map((g, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: fullUrl(lang, `/play/${g.slug}`),
          name: txt(g.id, lang).title || '',
        })),
      },
    });
    const breadcrumbLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: ui('breadcrumbHome', lang, 'Home'), item: fullUrl(lang, '/') },
        { '@type': 'ListItem', position: 2, name: heading, item: pageUrl },
      ],
    });

    const html = `<!doctype html>
<html lang="${HTML_LANG[lang] || lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>${escAttr(title)}</title>
    <meta name="description" content="${escAttr(desc)}" />
    <meta name="keywords" content="${escAttr(genre)}, free online ${escAttr(genre.toLowerCase())} games, browser games, arcadedeck" />
    <meta name="robots" content="${inGenre.length <= 2 ? 'noindex, follow' : 'index, follow'}" />
    <meta name="theme-color" content="#050507" />
    <link rel="icon" type="image/webp" href="/images/favicon.webp" />
    <link rel="apple-touch-icon" href="/images/icon-192x192.webp" />
    <link rel="canonical" href="${pageUrl}" />
    ${hreflangBlock(routePath, null)}
    <link rel="alternate" type="application/rss+xml" title="ArcadeDeck Blog" href="${SITE}/rss.xml" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="ArcadeDeck" />
    <meta property="og:locale" content="${BCP47[lang] || lang}" />
    ${ogLocaleAlts(lang)}
    <meta property="og:title" content="${escAttr(title)}" />
    <meta property="og:description" content="${escAttr(desc)}" />
    <meta property="og:image" content="${SITE}/images/arcadedeck-banner.webp" />
    <meta property="og:url" content="${pageUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escAttr(title)}" />
    <meta name="twitter:description" content="${escAttr(desc)}" />
    <meta name="twitter:image" content="${SITE}/images/arcadedeck-banner.webp" />
    <script type="application/ld+json">${collectionLd}</script>
    <script type="application/ld+json">${breadcrumbLd}</script>
    ${inlinedStyle}
    ${modulePreloads}
  </head>
  <body>
    <div id="root">
      <main style="max-width:900px;margin:0 auto;padding:40px 20px;font-family:system-ui,sans-serif;color:#fff;background:#050507;min-height:100vh;">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#9aa;margin-bottom:16px;">
          <a href="${fullUrl(lang, '/')}" style="color:#00d2ff;">${ui('breadcrumbHome', lang, 'Home')}</a> &rsaquo; <span>${heading}</span>
        </nav>
        <h1 style="font-size:2rem;margin-bottom:8px;">${heading}</h1>
        <p style="font-size:1rem;line-height:1.6;color:#9aa;">${subheading}</p>
        <h2 style="margin-top:32px;font-size:1.3rem;">${listLabel}</h2>
        <ul style="line-height:1.8;">
${itemsHtml}
        </ul>
      </main>
    </div>
    ${scriptTags}
  </body>
</html>`;
    writeFileSync(`${dir}/index.html`, html);
  }
}

// =====================================================================
// PER-LOCALE HOME SHELLS — / + /{lang}/
// =====================================================================
const NOSCRIPT_BLOCK_REGEX = /<noscript>[\s\S]*?<\/noscript>/;
const inlineCssOnce = (html) => {
  let first = true;
  return html.replace(cssLinkRegex, () => {
    if (!first) return '';
    first = false;
    return inlinedStyle;
  });
};

const homeJsonLd = (lang) => [
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ArcadeDeck',
    alternateName: ui('siteAlternateName', lang, 'ArcadeDeck — Free Browser Games'),
    url: `${SITE}/`,
    inLanguage: SUPPORTED_LOCALES.map(l => HREFLANG[l] || l),
  }),
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ArcadeDeck',
    alternateName: '아케이드덱',
    url: `${SITE}/`,
    logo: `${SITE}/images/icon-512x512.webp`,
    identifier: { '@type': 'PropertyValue', propertyID: 'wikidata', value: 'Q139585213' },
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
    url: fullUrl(lang, '/'),
    inLanguage: HREFLANG[lang] || lang,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: playableGames.slice(0, 20).map((g, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: fullUrl(lang, `/play/${g.slug}`),
        name: txt(g.id, lang).title || '',
      })),
    },
  }),
]
  .map((j) => `<script type="application/ld+json">${j}</script>`)
  .join('\n    ');

for (const lang of SUPPORTED_LOCALES) {
  const dir = lang === 'en' ? 'dist' : `dist${prefix(lang)}`;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const homeUrl = fullUrl(lang, '/');
  const homeTitle = ui('seoHomeTitle', lang, 'ArcadeDeck | The Ultimate Free Browser Games Platform');
  const homeDesc = ui('seoHomeDescription', lang, 'Play the best free online browser games on ArcadeDeck. High-quality Action, RPG, Strategy, and Idle games with global leaderboards. No downloads, just pure fun!');
  const heroTitle = ui('homeHeroTitle', lang, 'Welcome to');
  const heroSub = ui('homeHeroSubtitle', lang, 'Dozens of handcrafted browser games. Pick one, jump in, and see how far you can go.');

  const noscriptItems = playableGames
    .map(g => {
      const tg = txt(g.id, lang);
      return `          <li><a href="${fullUrl(lang, '/play/' + g.slug)}">${tg.title || ''}</a> — ${tg.description || ''}</li>`;
    })
    .join('\n');

  const noscriptBody = `
      <div style="background:#171424;color:#eaeaf0;font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto;">
        <h1>${heroTitle} ArcadeDeck</h1>
        <p>${homeDesc}</p>
        <h2>${ui('seoOurGames', lang, 'Our Games')}</h2>
        <ul>
${noscriptItems}
        </ul>
        <p>${ui('seoEnableJs', lang, 'Please enable JavaScript to play games on ArcadeDeck.')}</p>
      </div>`;

  let shell = inlineCssOnce(indexHtml);

  // Set <html lang> for the shell.
  shell = shell.replace(/<html lang="[^"]*">/, `<html lang="${HTML_LANG[lang] || lang}">`);

  // Title + description
  shell = shell.replace(/<title>[\s\S]*?<\/title>/, `<title>${escAttr(homeTitle)}</title>`);
  shell = shell.replace(/(<meta name="description" content=")[^"]*(")/, `$1${escAttr(homeDesc)}$2`);

  // Canonical + hreflang
  const canonicalBlock = `<link rel="canonical" href="${homeUrl}" />\n    ${hreflangBlock('/', null)}`;
  shell = shell.replace(/<link rel="canonical" href="[^"]*" \/>/, canonicalBlock);

  // og + twitter
  shell = shell.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${homeUrl}$2`);
  shell = shell.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escAttr(homeTitle)}$2`);
  shell = shell.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escAttr(homeDesc)}$2`);
  shell = shell.replace(/(<meta property="og:locale" content=")[^"]*(")/, `$1${BCP47[lang] || lang}$2`);
  // Drop existing og:locale:alternate(s) and inject the full set.
  shell = shell.replace(/\s*<meta property="og:locale:alternate" content="[^"]*" \/>/g, '');
  shell = shell.replace(/(<meta property="og:locale" content="[^"]*" \/>)/, `$1\n    ${ogLocaleAlts(lang)}`);
  shell = shell.replace(/(<meta property="twitter:url" content=")[^"]*(")/, `$1${homeUrl}$2`);
  shell = shell.replace(/(<meta property="twitter:title" content=")[^"]*(")/, `$1${escAttr(homeTitle)}$2`);
  shell = shell.replace(/(<meta property="twitter:description" content=")[^"]*(")/, `$1${escAttr(homeDesc)}$2`);

  // Replace LCP shell hero text with translated version.
  // Includes placeholder for the gamer-id spotlight so the static-shell hero
  // matches the post-hydration React tree dimensions — prevents Lighthouse
  // from re-detecting a larger LCP candidate when React mounts.
  const nickLabel = ui('homeNicknameLabel', lang, 'Game Nickname');
  shell = shell.replace(
    /<header class="hero">[\s\S]*?<\/header>/,
    `<header class="hero"><div class="container hero-content"><h1>${heroTitle} <span data-text="ArcadeDeck">ArcadeDeck</span></h1><p>${heroSub}</p><div class="hero-gamer-spotlight"><span class="neon-arrow neon-arrow-left" aria-hidden="true">&#9654;</span><div class="hero-gamer-display"><div class="hero-gamer-row"><span class="hero-gamer-label">${nickLabel}</span></div><div class="hero-gamer-row"><strong class="hero-gamer-name">&nbsp;</strong></div></div><span class="neon-arrow neon-arrow-right" aria-hidden="true">&#9664;</span></div></div></header>`,
  );

  // Replace noscript body.
  shell = shell.replace(NOSCRIPT_BLOCK_REGEX, `<noscript>${noscriptBody}\n    </noscript>`);

  // Inject home JSON-LD before </head>.
  shell = shell.replace('</head>', `${homeJsonLd(lang)}\n  </head>`);

  writeFileSync(`${dir}/index.html`, shell);
}

// =====================================================================
// ENGLISH-ONLY STATIC ROUTES — about / privacy / contact / hall-of-fame /
// my-games / blog (list).
// =====================================================================
const formatPostDate = (iso) =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });

const blogListNoscript = `
      <div style="background:#171424;color:#eaeaf0;font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto;">
        <h1>ArcadeDeck Blog</h1>
        <p>Patch notes, game design deep-dives, strategy guides, and monthly Hall of Fame recaps from the ArcadeDeck team.</p>
        <h2>Latest Posts</h2>
        <ul>
${posts
  .map((p) => `          <li><a href="/blog/${p.slug}">${p.title}</a> — <em>${formatPostDate(p.date)}</em>. ${p.excerpt}</li>`)
  .join('\n')}
        </ul>
        <p><a href="/">Browse all games</a> · <a href="/hall-of-fame">Hall of Fame</a> · <a href="/about">About ArcadeDeck</a></p>
      </div>`;

const breadcrumbLdFor = (label, url) =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: label, item: url },
    ],
  });

const blogItemListLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'ArcadeDeck Blog',
  url: `${SITE}/blog`,
  description: 'Patch notes, game design deep-dives, strategy guides, and monthly Hall of Fame recaps from the ArcadeDeck team.',
  inLanguage: 'en',
  blogPost: posts.map((p) => ({
    '@type': 'BlogPosting',
    headline: p.title,
    url: `${SITE}/blog/${p.slug}`,
    datePublished: p.date,
    description: p.excerpt,
  })),
});

const routeShells = {
  blog: {
    title: 'Blog | ArcadeDeck Devlog & Game Updates',
    description: 'The ArcadeDeck devlog: patch notes, game design deep-dives, strategy guides, and monthly Hall of Fame recaps.',
    canonical: `${SITE}/blog`,
    noscript: blogListNoscript,
    extraLd: [blogItemListLd, breadcrumbLdFor('Blog', `${SITE}/blog`)],
  },
  'hall-of-fame': {
    title: 'Hall of Fame | ArcadeDeck Legends',
    description: 'Witness the legends of ArcadeDeck. Check the top players and historical records of our most competitive browser games.',
    canonical: `${SITE}/hall-of-fame`,
    extraLd: [breadcrumbLdFor('Hall of Fame', `${SITE}/hall-of-fame`)],
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
    canonical: `${SITE}/my-games`,
    extraLd: [breadcrumbLdFor('My Games', `${SITE}/my-games`)],
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
    canonical: `${SITE}/about`,
    extraLd: [breadcrumbLdFor('About', `${SITE}/about`)],
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
    canonical: `${SITE}/privacy`,
    extraLd: [breadcrumbLdFor('Privacy', `${SITE}/privacy`)],
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
  forum: {
    title: 'Player Forum | ArcadeDeck Community',
    description: 'Discuss games, share strategies, and connect with other ArcadeDeck players in the community forum.',
    canonical: `${SITE}/forum`,
    extraLd: [breadcrumbLdFor('Forum', `${SITE}/forum`)],
    noscript: `
      <div style="background:#171424;color:#eaeaf0;font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto;">
        <nav aria-label="Breadcrumb" style="color:#9aa;font-size:0.85rem;margin-bottom:12px;">
          <a href="/" style="color:#00d2ff;">Home</a> &rsaquo;
          <span>Forum</span>
        </nav>
        <h1>ArcadeDeck Player Forum</h1>
        <p>Talk about games, share tips, post strategies, and meet other players on the ArcadeDeck community forum. No account required — pick a nickname and post.</p>
        <h2>Categories</h2>
        <ul>
          <li><strong>General</strong> — anything ArcadeDeck-related.</li>
          <li><strong>Game Talk</strong> — discuss specific games in the catalogue.</li>
          <li><strong>Suggestions</strong> — feature ideas, new games, site feedback.</li>
          <li><strong>Off-Topic</strong> — everything else gamers care about.</li>
        </ul>
        <p>Enable JavaScript to browse threads, post new topics, and reply to other players. <a href="/" style="color:#00d2ff;">Browse all games</a> · <a href="/hall-of-fame" style="color:#00d2ff;">Hall of Fame</a></p>
      </div>`,
  },
  'fractured-realm': {
    title: 'The Fractured Realm — Web MMO | ArcadeDeck',
    description: 'Explore The Fractured Realm, a browser-based MMO adventure hosted on ArcadeDeck.',
    canonical: `${SITE}/fractured-realm`,
    extraLd: [breadcrumbLdFor('The Fractured Realm', `${SITE}/fractured-realm`)],
    noscript: `
      <div style="background:#0a0a12;color:#eaeaf0;font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto;line-height:1.7;">
        <nav aria-label="Breadcrumb" style="color:#9aa;font-size:0.85rem;margin-bottom:12px;">
          <a href="/" style="color:#00d2ff;">Home</a> &rsaquo;
          <span>The Fractured Realm</span>
        </nav>
        <h1>The Fractured Realm — Web MMO</h1>
        <p>The Fractured Realm is a browser-based MMO adventure. Explore a shattered world, level up, and meet other players directly in your browser — no downloads, no installs.</p>
        <h2>About the Game</h2>
        <p>The game runs in a fullscreen frame on this page. Enable JavaScript to load the experience, or open the source build directly at <a href="https://the-fractured-realm-webmmo.pages.dev/" style="color:#00d2ff;" rel="noopener">the-fractured-realm-webmmo.pages.dev</a>.</p>
        <h2>What to Expect</h2>
        <ul>
          <li>Persistent web world you can return to from any device.</li>
          <li>Real-time exploration and combat in a fractured fantasy realm.</li>
          <li>No installs, no sign-ups required — just pick a name and play.</li>
        </ul>
        <p><a href="/" style="color:#00d2ff;">Browse all ArcadeDeck games</a> · <a href="/hall-of-fame" style="color:#00d2ff;">Hall of Fame</a></p>
      </div>`,
  },
  contact: {
    title: 'Contact | ArcadeDeck',
    description: 'Contact ArcadeDeck — email help@arcadedeck.net for support, bug reports, partnership inquiries, or game submissions.',
    canonical: `${SITE}/contact`,
    extraLd: [breadcrumbLdFor('Contact', `${SITE}/contact`)],
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
  html.replace(new RegExp(`(<meta name="${name}" content=")[^"]*(")`), `$1${value}$2`);
const replaceTitle = (html, value) => html.replace(/<title>[\s\S]*?<\/title>/, `<title>${value}</title>`);
const replaceCanonical = (html, value) =>
  html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${value}$2`);
const injectHreflangSelf = (html, value) => {
  const block = `<link rel="canonical" href="${value}" />\n    <link rel="alternate" hreflang="en" href="${value}" />\n    <link rel="alternate" hreflang="x-default" href="${value}" />`;
  return html.replace(/<link rel="canonical" href="[^"]*" \/>/, block);
};
const replaceOgUrl = (html, value) =>
  html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${value}$2`);
const replaceOgTitle = (html, value) =>
  html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${value}$2`);
const replaceOgDesc = (html, value) =>
  html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${value}$2`);
const overrideTwitter = (shell, url, title, description) => {
  const esc = (s) => String(s).replace(/"/g, '&quot;');
  return shell
    .replace(/(<meta (?:name|property)="twitter:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta (?:name|property)="twitter:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta (?:name|property)="twitter:description" content=")[^"]*(")/, `$1${esc(description)}$2`);
};

for (const [route, cfg] of Object.entries(routeShells)) {
  const dir = `dist/${route}`;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  let shell = inlineCssOnce(indexHtml).replace(NOSCRIPT_BLOCK_REGEX, `<noscript>${cfg.noscript}\n    </noscript>`);
  shell = replaceTitle(shell, cfg.title);
  shell = replaceMeta(shell, 'description', cfg.description);
  shell = replaceCanonical(shell, cfg.canonical);
  shell = injectHreflangSelf(shell, cfg.canonical);
  shell = replaceOgUrl(shell, cfg.canonical);
  shell = replaceOgTitle(shell, cfg.title);
  shell = replaceOgDesc(shell, cfg.description);
  shell = overrideTwitter(shell, cfg.canonical, cfg.title, cfg.description);
  // Drop stale og:locale:alternate from the root template — these pages are English-only.
  shell = shell.replace(/\s*<meta property="og:locale:alternate" content="[^"]*" \/>/g, '');

  if (Array.isArray(cfg.extraLd) && cfg.extraLd.length) {
    const extraLdTags = cfg.extraLd
      .map((j) => `<script type="application/ld+json">${j}</script>`)
      .join('\n    ');
    shell = shell.replace('</head>', `${extraLdTags}\n  </head>`);
  }

  writeFileSync(`${dir}/index.html`, shell);
}

// =====================================================================
// BLOG POSTS — English-only.
// =====================================================================
const DEFAULT_OG_IMAGE = `${SITE}/images/blog/blog-default-cover.webp`;

const absoluteImageUrl = (raw) => {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const trimmed = raw.replace(/^\//, '');
  return `${SITE}/${encodeURI(trimmed)}`;
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

  const url = `${SITE}/blog/${post.slug}`;
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
  .map((g) => {
    const gt = txt(g.id, 'en');
    const thumb360Path = g.thumbnail.replace(/\.webp$/i, '-360.webp');
    return `          <a href="/play/${g.slug}" style="display:flex;flex-direction:column;background:rgba(255,255,255,0.04);border:1px solid #2a2740;border-radius:12px;overflow:hidden;text-decoration:none;color:inherit;">
            <img src="/${encodeURI(g.thumbnail)}" srcset="/${encodeURI(thumb360Path)} 360w, /${encodeURI(g.thumbnail)} 640w" sizes="(min-width: 769px) 220px, 100vw" alt="${gt.title || ''} cover" loading="lazy" decoding="async" style="width:100%;aspect-ratio:16/9;object-fit:cover;display:block;" />
            <div style="padding:12px 14px;">
              <h3 style="font-size:0.98rem;margin:0 0 4px;color:#fff;">${gt.title || ''}</h3>
              <p style="font-size:0.82rem;margin:0;color:#9aa;line-height:1.45;">${gt.description || ''}</p>
              <p style="margin:8px 0 0;"><strong style="color:#00d2ff;">▶ Play free →</strong></p>
            </div>
          </a>`;
  })
  .join('\n')}
        </div>
      </section>`
    : '';

  const postImage =
    absoluteImageUrl(post.coverImage) ||
    (relatedGames.length ? `${SITE}/${encodeURI(relatedGames[0].thumbnail)}` : DEFAULT_OG_IMAGE);
  const postImageAlt =
    post.coverImageAlt ||
    (relatedGames.length ? `${(txt(relatedGames[0].id, 'en').title || '')} cover art` : `${post.title} — ArcadeDeck Blog`);
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
    author: { '@type': 'Organization', name: post.author, url: `${SITE}/about` },
    publisher: {
      '@type': 'Organization', name: 'ArcadeDeck', url: SITE,
      logo: { '@type': 'ImageObject', url: `${SITE}/images/icon-512x512.webp` },
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
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  });

  let shell = inlineCssOnce(indexHtml).replace(NOSCRIPT_BLOCK_REGEX, `<noscript>${postNoscript}\n    </noscript>`);
  shell = replaceTitle(shell, title);
  shell = replaceMeta(shell, 'description', post.excerpt);
  shell = replaceCanonical(shell, url);
  shell = injectHreflangSelf(shell, url);
  shell = replaceOgUrl(shell, url);
  shell = replaceOgTitle(shell, title);
  shell = replaceOgDesc(shell, post.excerpt);
  shell = overrideTwitter(shell, url, title, post.excerpt);
  // Drop stale og:locale:alternate from the root template — blog is English-only.
  shell = shell.replace(/\s*<meta property="og:locale:alternate" content="[^"]*" \/>/g, '');
  shell = shell.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${postImage}$2`);
  shell = shell.replace(/(<meta (?:name|property)="twitter:image" content=")[^"]*(")/, `$1${postImage}$2`);
  const articleTagMetas = post.tags.map((t) => `    <meta property="article:tag" content="${t}" />`).join('\n');
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
  shell = shell.replace(/(<meta name="keywords" content=")[^"]*(")/, `$1${post.tags.join(', ')}$2`);
  shell = shell.replace(/(<meta name="author" content=")[^"]*(")/, `$1${post.author}$2`);
  shell = shell.replace(
    /<meta property="og:type" content="website" \/>/,
    `<meta property="og:type" content="article" />\n    <meta property="article:published_time" content="${post.date}" />\n    <meta property="article:modified_time" content="${dateModified}" />\n    <meta property="article:section" content="${articleSection}" />\n    <meta property="article:author" content="${post.author}" />\n${articleTagMetas}`,
  );
  shell = shell.replace(
    '</head>',
    `<script type="application/ld+json">${articleJsonLd}</script>\n    <script type="application/ld+json">${breadcrumbLd}</script>\n  </head>`,
  );

  writeFileSync(`${dir}/index.html`, shell);
}

// =====================================================================
// BLOG TAG PAGES — English-only.
// =====================================================================
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
  const tagUrl = `${SITE}/blog/tag/${tag}`;
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
  .map((p) => `          <li><a href="/blog/${p.slug}">${p.title}</a> — <em>${formatPostDate(p.date)}</em>. ${p.excerpt}</li>`)
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
    inLanguage: 'en',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: matches.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE}/blog/${p.slug}`,
        name: p.title,
      })),
    },
  });
  const tagBreadcrumbLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog` },
      { '@type': 'ListItem', position: 3, name: label, item: tagUrl },
    ],
  });

  let shell = inlineCssOnce(indexHtml).replace(NOSCRIPT_BLOCK_REGEX, `<noscript>${tagNoscript}\n    </noscript>`);
  shell = replaceTitle(shell, tagTitle);
  shell = replaceMeta(shell, 'description', tagDesc);
  // Single-post tag pages are too thin to index — point the canonical at the
  // single underlying post and tell crawlers not to compete with it.
  if (matches.length <= 1) {
    shell = replaceMeta(shell, 'robots', 'noindex, follow');
  }
  shell = replaceCanonical(shell, tagUrl);
  shell = injectHreflangSelf(shell, tagUrl);
  shell = replaceOgUrl(shell, tagUrl);
  shell = replaceOgTitle(shell, tagTitle);
  shell = replaceOgDesc(shell, tagDesc);
  shell = overrideTwitter(shell, tagUrl, tagTitle, tagDesc);
  shell = shell.replace(/\s*<meta property="og:locale:alternate" content="[^"]*" \/>/g, '');
  const tagLdTags = [tagItemListLd, tagBreadcrumbLd]
    .map((j) => `<script type="application/ld+json">${j}</script>`)
    .join('\n    ');
  shell = shell.replace('</head>', `${tagLdTags}\n  </head>`);
  writeFileSync(`${dir}/index.html`, shell);
}

const localeShellCount = SUPPORTED_LOCALES.length;
console.log(
  `Pre-rendered ${playableGames.length} games × ${localeShellCount} locales` +
  ` + ${localeShellCount} home shells + ${allGenres.length} genres × ${localeShellCount} locales` +
  ` + ${Object.keys(routeShells).length} static routes` +
  ` + ${posts.length} blog posts + ${allTags.length} tag pages.`
);
