import { readFileSync, writeFileSync, readdirSync } from 'fs';

const games = JSON.parse(readFileSync('src/data/games.json', 'utf-8'));
const posts = JSON.parse(readFileSync('src/data/posts.json', 'utf-8'));
const today = new Date().toISOString().split('T')[0];

const SITE = 'https://arcadedeck.net';

// Locales discovered from src/i18n/locales — keep sitemap in lockstep with
// runtime overlay loader.
const SUPPORTED_LOCALES = readdirSync('src/i18n/locales')
  .filter(f => f.endsWith('.json') && !f.startsWith('_') && !f.includes('.missing.') && !f.includes('.bak.'))
  .map(f => f.replace(/\.json$/, ''));
SUPPORTED_LOCALES.sort((a, b) => (a === 'en' ? -1 : b === 'en' ? 1 : a.localeCompare(b)));

const HREFLANG = {
  en: 'en', de: 'de', es: 'es', 'es-LA': 'es-419', fr: 'fr',
  ja: 'ja', ko: 'ko', pt: 'pt', ru: 'ru', vi: 'vi', zh: 'zh',
};

const overlays = {};
for (const l of SUPPORTED_LOCALES) {
  try {
    overlays[l] = JSON.parse(readFileSync(`src/i18n/locales/${l}.json`, 'utf-8'));
  } catch {
    overlays[l] = {};
  }
}

const prefix = (lang) => (lang === 'en' ? '' : '/' + lang.toLowerCase());

// Locales that have at least one translation field for a given game id.
function gameLocales(id) {
  return SUPPORTED_LOCALES.filter(l => overlays[l]?.games?.[id]);
}

// Locales that should host a translated home (any locale we ship — even
// without per-game text the home shell is translated via UI strings).
const homeLocales = SUPPORTED_LOCALES;

function alternateBlock(routePath, langs) {
  const lines = langs.map(l =>
    `    <xhtml:link rel="alternate" hreflang="${HREFLANG[l] || l}" href="${SITE}${prefix(l)}${routePath}" />`
  );
  // x-default → English version.
  lines.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${routePath}" />`
  );
  return lines.join('\n');
}

function urlEntry(lang, routePath, priority, lastmod, alternateLangs = null) {
  const loc = `${SITE}${prefix(lang)}${routePath}`;
  const alts = alternateLangs && alternateLangs.length
    ? '\n' + alternateBlock(routePath, alternateLangs)
    : '';
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${priority}</priority>${alts}
  </url>`;
}

const entries = [];

// Multi-locale: home (/)
for (const lang of homeLocales) {
  entries.push(urlEntry(lang, '/', '1.0', today, homeLocales));
}

// Multi-locale: games
const playableGames = games.filter(g => g.status !== 'IN PRODUCTION');
for (const game of playableGames) {
  const langs = gameLocales(game.id);
  const includeLangs = langs.length ? langs : ['en'];
  for (const lang of includeLangs) {
    entries.push(urlEntry(lang, `/play/${game.slug}`, '0.9', today, includeLangs));
  }
}

// Multi-locale: genre landing pages
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
// Genres with ≤2 games are too thin to compete with the underlying game pages —
// the prerender marks them noindex,follow and we omit them from the sitemap so
// crawlers don't waste budget on pages we're explicitly de-emphasising.
const genreGameCount = new Map();
for (const g of playableGames) {
  for (const genre of g.genres) genreGameCount.set(genre, (genreGameCount.get(genre) || 0) + 1);
}
const indexableGenres = allGenres.filter(g => (genreGameCount.get(g) || 0) > 2);
for (const genre of indexableGenres) {
  const slug = genreSlug(genre);
  for (const lang of SUPPORTED_LOCALES) {
    entries.push(urlEntry(lang, `/genre/${slug}`, '0.7', today, SUPPORTED_LOCALES));
  }
}

// English-only routes
const englishOnlyRoutes = [
  { path: '/hall-of-fame', priority: '0.8' },
  { path: '/forum', priority: '0.7' },
  { path: '/blog', priority: '0.7' },
  { path: '/about', priority: '0.6' },
  { path: '/contact', priority: '0.5' },
  { path: '/privacy', priority: '0.4' },
  { path: '/fractured-realm', priority: '0.6' },
];
for (const r of englishOnlyRoutes) {
  entries.push(urlEntry('en', r.path, r.priority, today));
}

for (const p of posts) {
  entries.push(urlEntry('en', `/blog/${p.slug}`, '0.6', p.date));
}

const tagMap = new Map();
const tagPostCount = new Map();
posts.forEach((p) => {
  p.tags.forEach((t) => {
    const existing = tagMap.get(t);
    if (!existing || existing < p.date) tagMap.set(t, p.date);
    tagPostCount.set(t, (tagPostCount.get(t) || 0) + 1);
  });
});
// Single-post tags are thin and duplicate the underlying post — prerender sets
// them to noindex and we drop them from the sitemap so crawl budget goes to
// the canonical post page instead.
for (const [tag, lastmod] of Array.from(tagMap.entries()).sort(([a], [b]) => a.localeCompare(b))) {
  if ((tagPostCount.get(tag) || 0) <= 1) continue;
  entries.push(urlEntry('en', `/blog/tag/${tag}`, '0.5', lastmod));
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;

writeFileSync('public/sitemap.xml', xml);
console.log(
  `Sitemap generated with ${entries.length} URLs ` +
  `(${playableGames.length} games × locales, ${homeLocales.length} home variants, ` +
  `${posts.length} posts, ${tagMap.size} tags).`
);
