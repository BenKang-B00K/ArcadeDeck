import { readFileSync, writeFileSync, readdirSync } from 'fs';

const games = JSON.parse(readFileSync('src/data/games.json', 'utf-8'));
const posts = JSON.parse(readFileSync('src/data/posts.json', 'utf-8'));
const today = new Date().toISOString().split('T')[0];

const SITE = 'https://arcadedeck.net';

// Previous run's <lastmod> per <loc>. A build is not a content change, so a URL
// keeps the date it already had unless the underlying data says otherwise —
// stamping every URL with today's date is a freshness signal crawlers discount.
const previousLastmod = (() => {
  const map = new Map();
  try {
    const xml = readFileSync('public/sitemap.xml', 'utf-8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) {
      map.set(m[1], m[2]);
    }
  } catch { /* first run — no sitemap yet */ }
  return map;
})();

const newest = (dates) => dates.filter(Boolean).sort().pop();

// Real date if the data carries one, else whatever this URL said last time,
// else today (a genuinely new URL).
const stableLastmod = (loc, preferred) => preferred || previousLastmod.get(loc) || today;

// Locales discovered from src/i18n/locales — keep sitemap in lockstep with
// runtime overlay loader.
const SUPPORTED_LOCALES = readdirSync('src/i18n/locales')
  .filter(f => f.endsWith('.json') && !f.startsWith('_') && !f.includes('.missing.') && !f.includes('.bak.'))
  .map(f => f.replace(/\.json$/, ''));
SUPPORTED_LOCALES.sort((a, b) => (a === 'en' ? -1 : b === 'en' ? 1 : a.localeCompare(b)));

const overlays = {};
for (const l of SUPPORTED_LOCALES) {
  try {
    overlays[l] = JSON.parse(readFileSync(`src/i18n/locales/${l}.json`, 'utf-8'));
  } catch {
    overlays[l] = {};
  }
}

const prefix = (lang) => (lang === 'en' ? '' : '/' + lang.toLowerCase());
// Locale home is /ja, not /ja/ (firebase.json trailingSlash:false 301s the slashed form).
const url = (lang, routePath) => `${SITE}${prefix(lang)}${lang !== 'en' && routePath === '/' ? '' : routePath}`;

// Locales that have at least one translation field for a given game id.
function gameLocales(id) {
  return SUPPORTED_LOCALES.filter(l => overlays[l]?.games?.[id]);
}

// Locales that should host a translated home (any locale we ship — even
// without per-game text the home shell is translated via UI strings).
const homeLocales = SUPPORTED_LOCALES;

function alternateBlock(routePath, langs) {
  const lines = langs.map(l =>
    `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(l, routePath)}" />`
  );
  // x-default → English version.
  lines.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${routePath}" />`
  );
  return lines.join('\n');
}

function urlEntry(lang, routePath, priority, preferredLastmod, alternateLangs = null) {
  const loc = url(lang, routePath);
  const lastmod = stableLastmod(loc, preferredLastmod);
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
const homeLastmod = newest([...games.map(g => g.lastUpdated), ...posts.map(p => p.date)]);
for (const lang of homeLocales) {
  entries.push(urlEntry(lang, '/', '1.0', homeLastmod, homeLocales));
}

// Multi-locale: games
const playableGames = games.filter(g => g.status !== 'IN PRODUCTION');
for (const game of playableGames) {
  const langs = gameLocales(game.id);
  const includeLangs = langs.length ? langs : ['en'];
  for (const lang of includeLangs) {
    entries.push(urlEntry(lang, `/play/${game.slug}`, '0.9', game.lastUpdated, includeLangs));
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
  const genreLastmod = newest(
    playableGames.filter(g => g.genres.includes(genre)).map(g => g.lastUpdated),
  );
  for (const lang of SUPPORTED_LOCALES) {
    entries.push(urlEntry(lang, `/genre/${slug}`, '0.7', genreLastmod, SUPPORTED_LOCALES));
  }
}

// English-only routes
const englishOnlyRoutes = [
  { path: '/forum', priority: '0.7' },
  { path: '/blog', priority: '0.7', lastmod: newest(posts.map(p => p.date)) },
  { path: '/about', priority: '0.6' },
  { path: '/contact', priority: '0.5' },
  { path: '/privacy', priority: '0.4' },
];
// Not listed: /my-games and /fractured-realm. Both render content no crawler
// can see (a localStorage library, a fullscreen external iframe) and the
// prerender marks them noindex, so submitting them only spends crawl budget.
for (const r of englishOnlyRoutes) {
  entries.push(urlEntry('en', r.path, r.priority, r.lastmod));
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
