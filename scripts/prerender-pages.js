/**
 * Post-build script: generates static HTML shells for crawlers.
 *
 * Per-locale prerender (full hreflang + translated meta + body):
 *   - /              + /{lang}/
 *   - /play/{slug}   + /{lang}/play/{slug}
 *
 * English-only prerender (hreflang only points at self):
 *   - /about, /privacy, /contact, /my-games, /patchnote
 *   - /blog, /blog/{slug}, /blog/tag/{tag}
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import sharp from 'sharp';

const SUPPORTED_LOCALES = readdirSync('src/i18n/locales')
  .filter(f => f.endsWith('.json') && !f.startsWith('_') && !f.includes('.missing.') && !f.includes('.bak.'))
  .map(f => f.replace(/\.json$/, ''));

// Stable order: English first, others alpha-sorted.
SUPPORTED_LOCALES.sort((a, b) => (a === 'en' ? -1 : b === 'en' ? 1 : a.localeCompare(b)));

const BCP47 = {
  en: 'en_US', ja: 'ja_JP', ko: 'ko_KR',
};
const SITE = 'https://arcadedeck.net';
// Spellings people search the brand by (KO/JA transliterations, spaced and domain forms).
// Fed to WebSite/Organization alternateName so Google can map these queries to the site name.
const BRAND_ALIASES = [
  'Arcade Deck', 'ArcadeDeckNet', 'arcadedeck.net',
  '아케이드덱', '아케이드 덱', '아케이드덱닷넷', '아케이드덱넷',
  'アーケードデッキ', 'アーケードデック', 'アーケードデッキドットネット', 'アーケードデッキネット',
];
const prefix = (lang) => (lang === 'en' ? '' : '/' + lang.toLowerCase());
// Locale home is /ja, not /ja/ — firebase.json has trailingSlash:false, so the
// slashed form 301s and Search Console files it under "page with redirect".
const fullUrl = (lang, path) => `${SITE}${prefix(lang)}${lang !== 'en' && path === '/' ? '' : path}`;

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
  };
}

function ui(key, lang, fallback = '') {
  return overlays[lang]?.ui?.[key] || en.ui?.[key] || fallback;
}

// Localized genre label (`genre_{slug}` UI key), English name as fallback. Mirrors genreName in src/utils/genres.ts.
const genreName = (gn, lang) => ui('genre_' + genreSlug(gn), lang, gn);

function escAttr(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// **term** markup in locale text (see renderRich in GameInfoTabs.tsx).
const RICH = /\*\*(.+?)\*\*/g;
const rich = (s) => String(s ?? '').replace(RICH, '<strong>$1</strong>');
const strip = (s) => String(s ?? '').replace(RICH, '$1');
const paras = (s) => String(s ?? '').split('\n').map(p => p.trim()).filter(Boolean)
  .map(p => `<p style="line-height:1.7;">${rich(p)}</p>`).join('');

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
    lines.push(`<link rel="alternate" hreflang="${l}" href="${url}" />`);
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

// Game and genre shells build their <head> from scratch rather than rewriting
// index.html, so anything only present in the template is silently dropped from
// them. The AdSense publisher meta went missing on all 117 of those pages —
// the catalogue's best content, and exactly what a site reviewer crawls.
// Read it from the built template so there is one source of truth.
const adsenseMeta = (indexHtml.match(/<meta name="google-adsense-account"[^>]*>/) || [''])[0];

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
// PER-GAME PWA ICONS — /play/{slug}/icon-{192,512}.webp
// =====================================================================
// Each game is installable on its own (per-game manifest below). Manifest
// icons must be square, so center-crop the catalogue thumbnail at build time
// instead of committing 2 extra files per game to public/.
const ICON_SIZES = [192, 512];
for (const game of playableGames) {
  const dir = `dist/play/${game.slug}`;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  for (const size of ICON_SIZES) {
    await sharp(`public/${game.thumbnail}`)
      .resize(size, size, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(`${dir}/icon-${size}.webp`);
  }
}
const gameIcons = (slug) =>
  ICON_SIZES.map(size => ({ src: `/play/${slug}/icon-${size}.webp`, sizes: `${size}x${size}`, type: 'image/webp' }));

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
    // Self-contained per locale — ja/ko put "ArcadeDeck" at the front, so the
    // template must not append it again.
    // kind 'app' = a tool, not a game: no Play wording, WebApplication JSON-LD.
    const isApp = game.kind === 'app';
    const playFreeOn = isApp ? ui('seoFreeOnApp', lang, 'Free on ArcadeDeck') : ui('seoPlayFreeOn', lang, 'Play Free on ArcadeDeck');
    // Template, not prefix: ko/ja put the verb after the title ("X 플레이", "Xをプレイ").
    const playTitle = isApp ? t.title : ui('seoPlayTitle', lang, 'Play {title}').replace('{title}', t.title);
    const aboutH2 = ui('seoAboutThisGame', lang, 'About This Game');
    const howToH2 = isApp ? ui('seoHowToUse', lang, 'How to Use') : ui('seoHowToPlay', lang, 'How to Play');
    const tipsH2 = ui('seoProTips', lang, 'Pro Tips');
    const loreH2 = ui('seoWorldLore', lang, 'World Lore');
    const featH2 = ui('seoKeyFeatures', lang, 'Key Features');
    const moreH2 = ui('seoMoreLikeThis', lang, 'More Games Like This');
    const readBlogH2 = ui('seoReadOnBlog', lang, 'Read on the Blog');
    const genresLabel = ui('seoGenres', lang, 'Genres');

    const title = `${t.title} - ${playFreeOn}`;
    const desc = `${playTitle}: ${t.description} ${isApp ? ui('seoFreeOnlineApp', lang, 'Free browser app on ArcadeDeck. No download, no sign-up.') : ui('seoFreeOnlineGame', lang, 'Free online browser game on ArcadeDeck.')}`;
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

    // Per-game PWA manifest: distinct id + scope so a game installs as its
    // own home-screen app next to (not instead of) the root ArcadeDeck app.
    const appPath = `${prefix(lang)}${routePath}`;
    writeFileSync(`${dir}/manifest.webmanifest`, JSON.stringify({
      id: appPath,
      name: t.title,
      short_name: t.title,
      description: t.description,
      start_url: appPath,
      scope: appPath,
      lang,
      dir: 'ltr',
      theme_color: '#050507',
      background_color: '#050507',
      display: 'standalone',
      display_override: ['standalone', 'minimal-ui'],
      orientation: 'any',
      categories: isApp ? ['travel', 'utilities'] : ['games', 'entertainment'],
      icons: [
        ...gameIcons(slug),
        { src: '/play/' + slug + '/icon-512.webp', sizes: '512x512', type: 'image/webp', purpose: 'maskable' },
      ],
    }));

    const jsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': isApp ? 'WebApplication' : 'VideoGame',
      name: t.title,
      description: t.description,
      genre: game.genres.map(gn => genreName(gn, lang)),
      applicationCategory: isApp ? 'TravelApplication' : 'GameApplication',
      operatingSystem: 'Web Browser',
      image: thumbUrl,
      url: pageUrl,
      inLanguage: lang,
      author: { '@type': 'Organization', name: 'ArcadeDeck', url: SITE, sameAs: ['https://www.wikidata.org/wiki/Q141473972'] },
      publisher: {
        '@type': 'Organization', name: 'ArcadeDeck', url: SITE,
        logo: { '@type': 'ImageObject', url: `${SITE}/images/icon-512x512.webp` },
        sameAs: ['https://www.wikidata.org/wiki/Q141473972'],
      },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
      // Ties the free web edition to its paid PC release so the two are not read as rival pages.
      ...(game.steamUrl ? { sameAs: [game.steamUrl] } : {}),
    });

    const breadcrumbLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: ui('breadcrumbHome', lang, 'Home'), item: fullUrl(lang, '/') },
        { '@type': 'ListItem', position: 2, name: game.genres[0] ? genreName(game.genres[0], lang) : 'Games', item: fullUrl(lang, '/') },
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
      inLanguage: lang,
      mainEntity: faqPairs.map(p => ({
        '@type': 'Question',
        name: p.q,
        acceptedAnswer: { '@type': 'Answer', text: strip(p.a) },
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
      ? `<h2 style="margin-top:32px;font-size:1.3rem;">🎯 ${objectivesHeading}</h2><p style="line-height:1.7;">${rich(t.objectives)}</p>`
      : '';
    const controlsTableHtml = (Array.isArray(t.controlsTable) && t.controlsTable.length)
      ? `<h2 style="margin-top:32px;font-size:1.3rem;">${ctblHeading}</h2><table style="width:100%;border-collapse:collapse;margin-top:8px;"><thead><tr><th style="text-align:left;padding:8px;border-bottom:1px solid #2a2740;">${ctblKeyH}</th><th style="text-align:left;padding:8px;border-bottom:1px solid #2a2740;">${ctblActH}</th></tr></thead><tbody>${t.controlsTable.map(r => `<tr><td style="padding:8px;font-family:monospace;border-bottom:1px solid #1a1726;">${r.key}</td><td style="padding:8px;border-bottom:1px solid #1a1726;">${r.action}</td></tr>`).join('')}</tbody></table>`
      : '';
    const charactersHtml = (Array.isArray(t.characters) && t.characters.length)
      ? `<h2 style="margin-top:32px;font-size:1.3rem;">${castHeading}</h2><ul style="line-height:1.7;list-style:none;padding:0;">${t.characters.map(c => `<li style="margin-bottom:12px;"><strong>${c.name}</strong> <em style="color:#9aa;font-size:0.85rem;">${c.role}</em><br>${rich(c.desc)}</li>`).join('')}</ul>`
      : '';
    const faqStaticHtml = (Array.isArray(t.faq) && t.faq.length)
      ? `<h2 style="margin-top:32px;font-size:1.3rem;">${faqStaticHeading}</h2><dl style="line-height:1.7;">${t.faq.map(p => `<dt style="font-weight:700;color:#00d2ff;margin-top:12px;">${p.q}</dt><dd style="margin:4px 0 0 0;">${rich(p.a)}</dd>`).join('')}</dl>`
      : '';

    // UGC pointers — give crawlers a visible, indexable anchor for the
    // community surface (comments). The actual data is rendered
    // client-side from Firestore, but the prerender at least tells crawlers
    // that the page has user-generated content tied to it.
    const ugcCommunityH2 = ui('seoCommunityTitle', lang, 'Community');
    const ugcCommentsLine = ui(
      'seoCommentsIntro', lang,
      `Have a tip, a question or a bug report? Leave a comment below the game frame.`,
    );
    const ugcHtml = `<h2 style="margin-top:32px;font-size:1.3rem;">${ugcCommunityH2}</h2>
        <p style="line-height:1.7;">${ugcCommentsLine}</p>`;

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
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>${escAttr(title)}</title>
    <meta name="description" content="${escAttr(desc)}" />
    <meta name="keywords" content="${escAttr(t.title)}, ${escAttr(game.genres.map(gn => genreName(gn, lang)).join(', '))}, free online game, browser game, arcadedeck" />
    <meta name="robots" content="${robotsValue}" />
    <meta name="theme-color" content="#050507" />
    ${adsenseMeta}
    <link rel="icon" type="image/webp" href="/images/favicon.webp" />
    <link rel="manifest" href="${appPath}/manifest.webmanifest" />
    <link rel="apple-touch-icon" href="/play/${slug}/icon-192.webp" />
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
        ${game.isOriginal ? `<p style="color:#9aa;line-height:1.6;">${ui('seoCreditLine', lang, 'An original game designed and built by ArcadeDeck, a solo developer making Godot and HTML5 games since 2025.')} <a href="${SITE}/about" style="color:#00d2ff;">${ui('seoCreditAbout', lang, 'About ArcadeDeck')}</a></p>` : ''}

        <h2 style="margin-top:32px;font-size:1.3rem;">${aboutH2}</h2>
        <div>${paras(t.fullDescription)}</div>

        ${objectivesHtml}

        ${t.controls ? `<h2 style="margin-top:32px;font-size:1.3rem;">${howToH2}</h2><p style="line-height:1.6;">${t.controls}</p>` : ''}

        ${controlsTableHtml}

        ${t.tips ? `<h2 style="margin-top:32px;font-size:1.3rem;">${tipsH2}</h2><p style="line-height:1.6;">${rich(t.tips)}</p>` : ''}

        ${faqStaticHtml}

        ${t.lore ? `<h2 style="margin-top:32px;font-size:1.3rem;">${loreH2}</h2><div>${paras(t.lore)}</div>` : ''}

        ${charactersHtml}

        ${featuresHtml ? `<h2 style="margin-top:32px;font-size:1.3rem;">${featH2}</h2><ul style="line-height:1.8;">${featuresHtml}</ul>` : ''}

        ${ugcHtml}


        ${crossLinksHtml}

        ${relatedPostsHtml}

        ${game.steamUrl ? `<p style="margin-top:32px;"><a href="${game.steamUrl}" rel="noopener noreferrer" style="color:#00d2ff;">${ui('playerSteam', lang, 'Full version on Steam')}</a></p>` : ''}

        <p style="margin-top:32px;color:#9aa;">${genresLabel}: ${game.genres.map(gn => genreName(gn, lang)).join(', ')}</p>
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

// Mirrors generate-sitemap.js: a genre needs more than two games to be worth
// indexing. Thinner ones still get a page (the UI links to them) but are kept
// out of the sitemap and marked noindex below.
const indexableGenres = allGenres.filter(
  gn => playableGames.filter(g => g.genres.includes(gn)).length > 2,
);

for (const genre of allGenres) {
  const slug = genreSlug(genre);
  const inGenre = playableGames.filter(g => g.genres.includes(genre));
  const routePath = `/genre/${slug}`;

  for (const lang of SUPPORTED_LOCALES) {
    const dir = `dist${prefix(lang)}/genre/${slug}`;
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const pageUrl = fullUrl(lang, routePath);
    const titleTemplate = ui('seoGenrePageTitle', lang, '{genre} Games | Play Free on ArcadeDeck');
    const descTemplate = ui('seoGenrePageDescription', lang, 'Play {count} {genre} games free on ArcadeDeck. Original browser games made by ArcadeDeck, straight in your browser. No downloads, no sign-up.');
    const label = genreName(genre, lang);
    const title = titleTemplate.replace('{genre}', label).replace('{count}', String(inGenre.length));
    const desc = descTemplate.replace('{genre}', label).replace('{count}', String(inGenre.length));
    const heading = ui('genrePageHeading', lang, '{genre} Games').replace('{genre}', label);
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
      inLanguage: lang,
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
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>${escAttr(title)}</title>
    <meta name="description" content="${escAttr(desc)}" />
    <meta name="keywords" content="${escAttr(genre)}, free online ${escAttr(genre.toLowerCase())} games, browser games, arcadedeck" />
    <meta name="robots" content="${inGenre.length <= 2 ? 'noindex, follow' : 'index, follow'}" />
    <meta name="theme-color" content="#050507" />
    ${adsenseMeta}
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
// index.html carries two <noscript> blocks: the Google Fonts fallback in <head>
// (a bare <link>) and the crawler fallback in <body> (opens with a <div>).
// Anchor on that <div> — a bare /<noscript>/ matched the font link first and
// every shell rewrite silently landed its copy in <head> instead of <body>.
const NOSCRIPT_BLOCK_REGEX = /<noscript>\s*<div[\s\S]*?<\/noscript>/;
// #root holds the static shell React replaces on mount. It sits on one line.
const ROOT_BLOCK_REGEX = /<div id="root">.*<\/div>/;

// Put a shell's crawlable copy directly into #root so it is real visible HTML
// rather than noscript-only. Crawlers that do not execute JS — the AdSense
// reviewer among them — never see <noscript>, and every non-home shell was
// otherwise serving the home hero and the home game list. The body <noscript>
// is redundant once #root carries the copy, so it is dropped.
// Replacements use function form: post bodies contain `$`, which the string
// form of String.replace would interpret as a capture-group reference.
const renderShellBody = (shell, contentHtml) =>
  shell
    .replace(ROOT_BLOCK_REGEX, () => `<div id="root">${contentHtml}\n    </div>`)
    .replace(NOSCRIPT_BLOCK_REGEX, () => '');

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
    alternateName: BRAND_ALIASES,
    url: `${SITE}/`,
    inLanguage: SUPPORTED_LOCALES,
  }),
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ArcadeDeck',
    alternateName: BRAND_ALIASES,
    url: `${SITE}/`,
    logo: `${SITE}/images/icon-512x512.webp`,
    identifier: { '@type': 'PropertyValue', propertyID: 'wikidata', value: 'Q141473972' },
    sameAs: [
      'https://www.wikidata.org/wiki/Q141473972',
      'https://arcadedeck.itch.io',
      'https://ko-fi.com/developer_benjamink',
      'https://www.moddb.com/company/arcadedeck',
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
    inLanguage: lang,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: playableGames.map((g, i) => ({
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
  const homeDesc = ui('seoHomeDescription', lang, 'Play the best free online browser games on ArcadeDeck. High-quality Action, RPG, Strategy, and Idle games. No downloads, just pure fun!');
  const heroTitle = ui('homeHeroTitle', lang, 'Welcome to');

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
  shell = shell.replace(/<html lang="[^"]*">/, `<html lang="${lang}">`);

  // Title + description
  shell = shell.replace(/<title>[\s\S]*?<\/title>/, `<title>${escAttr(homeTitle)}</title>`);
  shell = shell.replace(/(<meta name="description" content=")[^"]*(")/, `$1${escAttr(homeDesc)}$2`);

  // Canonical + hreflang. The Featured Game thumbnail is the mobile LCP
  // element and React only renders it after hydration — preload it from the
  // shell so the fetch starts with HTML parsing (Lighthouse: LCP request discovery).
  const featured = games.find((g) => g.featured);
  const featuredPreload = featured
    ? `\n    <link rel="preload" as="image" href="/${featured.thumbnail.replace(/^\//, '')}" fetchpriority="high" />`
    : '';
  const canonicalBlock = `<link rel="canonical" href="${homeUrl}" />${featuredPreload}\n    ${hreflangBlock('/', null)}`;
  shell = shell.replace(/<link rel="canonical" href="[^"]*" \/>/, canonicalBlock);

  // og + twitter
  shell = shell.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${homeUrl}$2`);
  shell = shell.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escAttr(homeTitle)}$2`);
  shell = shell.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escAttr(homeDesc)}$2`);
  shell = shell.replace(/(<meta property="og:locale" content=")[^"]*(")/, `$1${BCP47[lang] || lang}$2`);
  // Drop existing og:locale:alternate(s) and inject the full set.
  shell = shell.replace(/\s*<meta property="og:locale:alternate" content="[^"]*" \/>/g, '');
  shell = shell.replace(/(<meta property="og:locale" content="[^"]*" \/>)/, `$1\n    ${ogLocaleAlts(lang)}`);
  shell = shell.replace(/(<meta name="twitter:url" content=")[^"]*(")/, `$1${homeUrl}$2`);
  shell = shell.replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escAttr(homeTitle)}$2`);
  shell = shell.replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${escAttr(homeDesc)}$2`);

  // Replace LCP shell hero text with translated version. Mirrors the <header>
  // Home.tsx renders so the static shell and the React tree share dimensions.
  const surprise = ui('homeRandomGame', lang, 'Surprise me');
  const heroHtml = `<header class="home-hero"><div class="container home-hero-content"><h1>${heroTitle} <span>ArcadeDeck</span></h1><div class="home-hero-nick"></div><div class="home-hero-actions"><button type="button" class="home-hero-random" disabled>${surprise}</button></div></div></header>`;

  // Visible catalogue below the hero. Without it #root carried ~115 characters
  // of text and the whole catalogue existed only in <noscript> + JSON-LD.
  // Text-only on purpose: it paints in the same frame as the hero, so LCP
  // timing is unchanged, and no images means no extra layout work before
  // React swaps the subtree.
  const catalogueItems = playableGames
    .map(g => {
      const tg = txt(g.id, lang);
      return `        <li style="margin-bottom:10px;"><a href="${fullUrl(lang, '/play/' + g.slug)}" style="color:#00d2ff;font-weight:600;text-decoration:none;">${tg.title || ''}</a> <span style="color:#9aa;">— ${tg.description || ''}</span></li>`;
    })
    .join('\n');
  // Only genres the sitemap considers indexable (>2 games). Linking the thin
  // one- and two-game genre pages from home would surface pages we chose not
  // to submit.
  const genreLinks = indexableGenres
    .map(gn => `<a href="${fullUrl(lang, '/genre/' + genreSlug(gn))}" style="color:#00d2ff;text-decoration:none;margin-right:12px;">${genreName(gn, lang)}</a>`)
    .join('');
  const catalogueHtml = `<div id="games"><div class="container" style="padding:24px 20px;font-family:system-ui,sans-serif;">
      <nav aria-label="${escAttr(ui('homeGenresAria', lang, 'Game genres'))}" style="margin-bottom:20px;font-size:0.9rem;">${genreLinks}</nav>
      <h2 style="font-size:1.3rem;margin:0 0 14px;">${ui('seoOurGames', lang, 'Our Games')}</h2>
      <ul style="line-height:1.6;font-size:0.95rem;list-style:none;padding:0;margin:0;">
${catalogueItems}
      </ul>
    </div></div>`;

  shell = shell.replace(ROOT_BLOCK_REGEX, () => `<div id="root">${heroHtml}${catalogueHtml}</div>`);

  // Replace noscript body.
  shell = shell.replace(NOSCRIPT_BLOCK_REGEX, () => `<noscript>${noscriptBody}\n    </noscript>`);

  // Inject home JSON-LD before </head>.
  shell = shell.replace('</head>', `${homeJsonLd(lang)}\n  </head>`);

  writeFileSync(`${dir}/index.html`, shell);
}

// =====================================================================
// ENGLISH-ONLY STATIC ROUTES — about / privacy / contact / my-games /
// blog (list) / patchnote.
// =====================================================================
const formatPostDate = (iso) =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });

const blogListNoscript = `
      <div style="background:#171424;color:#eaeaf0;font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto;">
        <h1>ArcadeDeck Blog</h1>
        <p>Patch notes, game design deep-dives, and strategy guides from the ArcadeDeck team.</p>
        <h2>Latest Posts</h2>
        <ul>
${posts
  .map((p) => `          <li><a href="/blog/${p.slug}">${p.title}</a> — <em>${formatPostDate(p.date)}</em>. ${p.excerpt}</li>`)
  .join('\n')}
        </ul>
        <p><a href="/">Browse all games</a> · <a href="/about">About ArcadeDeck</a></p>
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
  description: 'Patch notes, game design deep-dives, and strategy guides from the ArcadeDeck team.',
  inLanguage: 'en',
  blogPost: posts.map((p) => ({
    '@type': 'BlogPosting',
    headline: p.title,
    url: `${SITE}/blog/${p.slug}`,
    datePublished: p.date,
    description: p.excerpt,
  })),
});

// CHANGELOG.md `## History` lines — same regex as src/pages/PatchNote.tsx.
const CHANGELOG_LINE = /^- \*\*(v\d+\.\d+\.\d+)\*\* \((\d{4}-\d{2}-\d{2})\) — (.+)$/gm;
const releases = [...readFileSync('CHANGELOG.md', 'utf-8').matchAll(CHANGELOG_LINE)]
  .map(([, version, date, body]) => ({ version, date, body }));
const patchNoteNoscript = `
      <div style="background:#171424;color:#eaeaf0;font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto;">
        <h1>ArcadeDeck Patch Notes</h1>
        <p>Every release, newest first. New games bump MAJOR, features bump MINOR, fixes bump PATCH.</p>
${releases
  .map((r) => `        <h2>${r.version} — <em>${formatPostDate(r.date)}</em></h2>\n        <p>${escAttr(r.body)}</p>`)
  .join('\n')}
        <p><a href="/">Browse all games</a> · <a href="/blog">Blog</a></p>
      </div>`;

const routeShells = {
  patchnote: {
    title: 'Patch Notes | ArcadeDeck',
    description: 'Every ArcadeDeck release in one place: new games, features, UI changes, and balance fixes, newest first. MAJOR for games, MINOR for features, PATCH for fixes.',
    canonical: `${SITE}/patchnote`,
    noscript: patchNoteNoscript,
    extraLd: [breadcrumbLdFor('Patch Notes', `${SITE}/patchnote`)],
  },
  blog: {
    title: 'Blog | ArcadeDeck Devlog & Game Updates',
    description: 'The ArcadeDeck devlog: patch notes for every release, game design deep-dives on how our browser games are built, strategy guides, and Steam launch news.',
    canonical: `${SITE}/blog`,
    noscript: blogListNoscript,
    extraLd: [blogItemListLd, breadcrumbLdFor('Blog', `${SITE}/blog`)],
  },
  'my-games': {
    title: 'My Games | ArcadeDeck',
    description: 'Your personal ArcadeDeck library: recently played games, liked titles, personal bests, mastery badges, Deck Level, and your Gamer ID, all in your browser.',
    canonical: `${SITE}/my-games`,
    // Renders a per-visitor localStorage library: empty for every crawler, and
    // the prerendered copy describes a page no visitor actually sees. Keep it
    // out of the index rather than serve copy that never matches the render.
    noindex: true,
    extraLd: [breadcrumbLdFor('My Games', `${SITE}/my-games`)],
    noscript: `
      <div style="background:#171424;color:#eaeaf0;font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto;">
        <h1>My Games — Your ArcadeDeck Library</h1>
        <p>The My Games page is your personal hub on ArcadeDeck. It collects the games you have played most recently, the titles you have liked, and the Gamer ID currently associated with your comments.</p>
        <h2>Recently Played</h2>
        <p>Every game you launch is recorded locally in your browser. The five most recent titles appear here so you can resume a session in one click. The list is stored in localStorage — clearing your browser data will reset it.</p>
        <h2>Liked Games</h2>
        <p>Tap the heart icon on any game card or game page to add it to your liked list. Liked games surface here for quick access.</p>
        <h2>Your Gamer ID</h2>
        <p>Your Gamer ID is the nickname displayed on every comment you submit. You can change it at any time from the home page.</p>
        <h2>Privacy</h2>
        <p>ArcadeDeck never asks for an email, password, or any real personal information. Everything on the My Games page is stored client-side in your browser. See our <a href="/privacy">Privacy Policy</a> for full details.</p>
        <p><a href="/">Browse all games</a> · <a href="/blog">Read the blog</a></p>
      </div>`,
  },
  about: {
    title: 'About | ArcadeDeck',
    description: 'ArcadeDeck is a one-person indie game studio: every free browser game on the site is designed, built and updated by a solo developer working in Godot and HTML5 since 2025.',
    canonical: `${SITE}/about`,
    extraLd: [breadcrumbLdFor('About', `${SITE}/about`)],
    noscript: `
      <div style="background:#171424;color:#eaeaf0;font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto;">
        <h1>About ArcadeDeck</h1>
        <p>ArcadeDeck is a one-person indie game studio. Every game in the catalogue — ${playableGames.filter(g => g.kind !== 'app').length} of them today — is designed, programmed, tested and updated by one solo developer, who started making games in 2025 and works in Godot and HTML5. Nothing here is licensed, scraped or embedded from another portal: if a game is listed on ArcadeDeck, it was made for ArcadeDeck.</p>
        <h2>How the Games Are Made</h2>
        <p>Each game starts as a small prototype and ships only once it plays well in a browser tab, on a desktop and on a phone. Games are built either in Godot or directly in HTML5 with TypeScript, Canvas and WebGL, and they run without plugins or installs.</p>
        <p>Launch is not the end. Balance patches, new modes, controller support and bug fixes keep coming after release, and every one is logged on the <a href="/patchnote">Patch Notes</a> page. Longer write-ups — launch posts, design notes and update breakdowns — go on the <a href="/blog">Blog</a>.</p>
        <h2>What You Will Find</h2>
        <p>Tower defense like <a href="/play/flux-tower-defense">Flux Tower Defense</a> and <a href="/play/mythic-defenders-heroes-returns">Mythic Defenders: Heroes Returns</a>; roguelikes and auto-battlers set in the shared Kingdom of Ashes world, starting with <a href="/play/kingdom-of-ashes-fallen-era">Kingdom of Ashes - Fallen Era</a>; arcade games such as <a href="/play/climb-up">Climb Up!</a> and <a href="/play/skyfall">Skyfall</a>; a logic-gate puzzle in <a href="/play/only-nand">Only NAND</a>; Gomoku with seven AI levels in <a href="/play/omok">OMOK</a>; and party games for a group around one screen, like <a href="/play/ladder-game">Ladder Game</a> and <a href="/play/trick-or-lose">Trick or Lose</a>.</p>
        <p>Some titles — Kingdom of Ashes - Fallen Era, Shadow Runner and Flux Tower Defense — also have full versions on Steam. The browser editions stay free.</p>
        <h2>No Accounts, No Friction</h2>
        <p>No sign-up, no email capture, no paywall. Pick a nickname if you want to comment — everything else, including your personal bests, stays in your browser.</p>
        <h2>Desktop and Mobile</h2>
        <p>Games are checked at phone sizes for touch controls, layout and screen rotation. The few that need a keyboard or a gamepad are labelled on their page.</p>
        <h2>Contact</h2>
        <p>Questions, bug reports, partnership ideas, or game submissions: <a href="mailto:help@arcadedeck.net">help@arcadedeck.net</a>. Full contact options on the <a href="/contact">Contact page</a>.</p>
        <h2>Verified Profiles</h2>
        <p>ArcadeDeck is registered as a public knowledge entity on Wikidata.</p>
        <ul>
          <li><a href="https://www.wikidata.org/wiki/Q141473972" rel="me noopener" target="_blank">Wikidata: Q141473972</a></li>
          <li><a href="https://arcadedeck.itch.io" rel="me noopener" target="_blank">itch.io: arcadedeck.itch.io</a></li>
          <li><a href="https://ko-fi.com/developer_benjamink" rel="me noopener" target="_blank">Ko-fi: developer_benjamink</a></li>
          <li><a href="https://www.moddb.com/company/arcadedeck" rel="me noopener" target="_blank">ModDB: ArcadeDeck</a></li>
        </ul>
        <p><a href="/">Browse all games</a> · <a href="/privacy">Privacy Policy</a></p>
      </div>`,
  },
  privacy: {
    title: 'Privacy Policy | ArcadeDeck',
    description: 'Read the ArcadeDeck Privacy Policy: what data we collect, cookies, Google AdSense, Google Analytics, Firebase, your GDPR/CCPA rights, and how to contact us.',
    canonical: `${SITE}/privacy`,
    extraLd: [breadcrumbLdFor('Privacy', `${SITE}/privacy`)],
    noscript: `
      <div style="background:#171424;color:#eaeaf0;font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto;">
        <h1>ArcadeDeck Privacy Policy</h1>
        <p>This page summarises what data ArcadeDeck collects, how it is used, and the choices you have. Load the page with JavaScript enabled to view the fully formatted policy with all sections and links.</p>
        <h2>What We Collect</h2>
        <p>We collect only the minimum needed to operate the service: your self-chosen Gamer ID (nickname), comments you voluntarily submit, and standard automatic browser data (user-agent, screen size, language, approximate location from IP). We never ask for your real name, email, or password.</p>
        <h2>Cookies and Local Storage</h2>
        <p>Strictly necessary localStorage holds your Gamer ID, language, recently played games, and liked games. Google Analytics sets cookies for aggregate traffic measurement. Google AdSense and its partners may set cookies to deliver and measure ads.</p>
        <h2>Third-Party Services</h2>
        <p>ArcadeDeck relies on Google AdSense (advertising), Google Analytics (traffic measurement), Google Firebase / Firestore (comment storage), and Google Fonts (typography). Each operates under its own privacy policy.</p>
        <h2>Your Rights</h2>
        <p>Under GDPR and CCPA you may request access, correction, or deletion of your data, object to processing, withdraw advertising consent, or lodge a complaint with your local data protection authority. Email <a href="mailto:help@arcadedeck.net">help@arcadedeck.net</a> with your Gamer ID to exercise these rights.</p>
        <h2>Children</h2>
        <p>ArcadeDeck is not directed at children under 13 (or the local equivalent). We do not knowingly collect personal information from children.</p>
        <h2>Contact</h2>
        <p>Privacy questions: <a href="mailto:help@arcadedeck.net">help@arcadedeck.net</a>.</p>
      </div>`,
  },
  'fractured-realm': {
    title: 'The Fractured Realm — Web MMO | ArcadeDeck',
    description: 'Explore The Fractured Realm, a browser-based MMO adventure on ArcadeDeck. Quest, fight, and level up alongside other players — no download or install required.',
    canonical: `${SITE}/fractured-realm`,
    // Renders as a bare fullscreen iframe of an external build with no text of
    // its own. The prerendered description would be copy the visitor never
    // sees, so the page stays out of the index and the sitemap.
    noindex: true,
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
        <p><a href="/" style="color:#00d2ff;">Browse all ArcadeDeck games</a></p>
      </div>`,
  },
  contact: {
    title: 'Contact | ArcadeDeck',
    description: 'Contact ArcadeDeck — email help@arcadedeck.net for player support, bug reports, partnership inquiries, or to submit your own original browser game for review.',
    canonical: `${SITE}/contact`,
    extraLd: [breadcrumbLdFor('Contact', `${SITE}/contact`)],
    noscript: `
      <div style="background:#171424;color:#eaeaf0;font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto;">
        <h1>Contact ArcadeDeck</h1>
        <p>The fastest way to reach us is email. We answer every message — whether it is a bug report, a partnership inquiry, a game submission, or general feedback.</p>
        <h2>Support</h2>
        <p>Issues with a game or your Gamer ID: <a href="mailto:help@arcadedeck.net">help@arcadedeck.net</a>. Include the game name, your Gamer ID, and a short description of what happened. Screenshots speed up triage.</p>
        <h2>Game Submissions</h2>
        <p>If you have built an original browser game and want it featured on ArcadeDeck, send a playable URL plus a one-paragraph description to <a href="mailto:help@arcadedeck.net">help@arcadedeck.net</a>. We review submissions for quality, originality, and platform fit.</p>
        <h2>Partnerships and Press</h2>
        <p>Press kits, partnership proposals, and bulk inquiries can also be sent to the same address. Please mention "Partnership" or "Press" in the subject line so we can route it quickly.</p>
        <h2>Privacy and Data Requests</h2>
        <p>For GDPR, CCPA, or general privacy requests, see the <a href="/privacy">Privacy Policy</a>, then email us with your Gamer ID.</p>
        <p><a href="/">Browse all games</a> · <a href="/about">About ArcadeDeck</a></p>
      </div>`,
  },
};

// Every helper below writes into an HTML attribute or element text, so each
// value goes through escAttr first. Raw copy reaches these unescaped: a blog
// tag description carries double quotes and two post titles carry an
// ampersand, which closed the content attribute early and truncated the
// description on all 29 tag pages.
const replaceMeta = (html, name, value) =>
  html.replace(new RegExp(`(<meta name="${name}" content=")[^"]*(")`), `$1${escAttr(value)}$2`);
const replaceTitle = (html, value) => html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escAttr(value)}</title>`);
const replaceCanonical = (html, value) =>
  html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${escAttr(value)}$2`);
const injectHreflangSelf = (html, value) => {
  const block = `<link rel="canonical" href="${value}" />\n    <link rel="alternate" hreflang="en" href="${value}" />\n    <link rel="alternate" hreflang="x-default" href="${value}" />`;
  return html.replace(/<link rel="canonical" href="[^"]*" \/>/, block);
};
const replaceOgUrl = (html, value) =>
  html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${escAttr(value)}$2`);
const replaceOgTitle = (html, value) =>
  html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escAttr(value)}$2`);
const replaceOgDesc = (html, value) =>
  html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escAttr(value)}$2`);
const overrideTwitter = (shell, url, title, description) =>
  shell
    .replace(/(<meta (?:name|property)="twitter:url" content=")[^"]*(")/, `$1${escAttr(url)}$2`)
    .replace(/(<meta (?:name|property)="twitter:title" content=")[^"]*(")/, `$1${escAttr(title)}$2`)
    .replace(/(<meta (?:name|property)="twitter:description" content=")[^"]*(")/, `$1${escAttr(description)}$2`);

for (const [route, cfg] of Object.entries(routeShells)) {
  const dir = `dist/${route}`;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  let shell = renderShellBody(inlineCssOnce(indexHtml), cfg.noscript);
  shell = replaceTitle(shell, cfg.title);
  shell = replaceMeta(shell, 'description', cfg.description);
  if (cfg.noindex) shell = replaceMeta(shell, 'robots', 'noindex, follow');
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
  const title = post.title; // ponytail: no brand suffix — Bing flags titles >= 70 chars
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
      sameAs: ['https://www.wikidata.org/wiki/Q141473972'],
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

  let shell = renderShellBody(inlineCssOnce(indexHtml), postNoscript);
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
  const tagDesc = `All ArcadeDeck blog posts tagged "${label}" — strategy guides, game design notes, patch notes, Steam launch news, and monthly Hall of Fame recaps from the ArcadeDeck team.`;

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

  let shell = renderShellBody(inlineCssOnce(indexHtml), tagNoscript);
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

// Real 404 shell. firebase.json only rewrites known SPA routes to index.html,
// so every other path gets this file with a 404 status instead of a 200 that
// claims canonical = home (Search Console soft-404 / duplicate noise).
{
  let shell = replaceTitle(indexHtml, '404 - Page Not Found | ArcadeDeck');
  shell = replaceMeta(shell, 'robots', 'noindex, follow');
  shell = shell.replace(/\s*<link rel="canonical" href="[^"]*" \/>/, '');
  shell = shell.replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*" \/>/g, '');
  writeFileSync('dist/404.html', shell);
}

const localeShellCount = SUPPORTED_LOCALES.length;
console.log(
  `Pre-rendered ${playableGames.length} games × ${localeShellCount} locales` +
  ` + ${localeShellCount} home shells + ${allGenres.length} genres × ${localeShellCount} locales` +
  ` + ${Object.keys(routeShells).length} static routes` +
  ` + ${posts.length} blog posts + ${allTags.length} tag pages.`
);
