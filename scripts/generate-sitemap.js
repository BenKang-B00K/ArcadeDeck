import { readFileSync, writeFileSync } from 'fs';

const games = JSON.parse(readFileSync('src/data/games.json', 'utf-8'));
const posts = JSON.parse(readFileSync('src/data/posts.json', 'utf-8'));
const today = new Date().toISOString().split('T')[0];

const staticPages = [
  { path: '/', priority: '1.0', lastmod: today },
  { path: '/hall-of-fame', priority: '0.8', lastmod: today },
  { path: '/blog', priority: '0.7', lastmod: today },
  { path: '/about', priority: '0.6', lastmod: today },
  { path: '/contact', priority: '0.5', lastmod: today },
  { path: '/privacy', priority: '0.4', lastmod: today },
];

const gamePages = games
  .filter(g => g.status !== 'IN PRODUCTION')
  .map(g => ({
    path: `/play/${g.slug}`,
    priority: '0.9',
    lastmod: today,
  }));

const blogPages = posts.map(p => ({
  path: `/blog/${p.slug}`,
  priority: '0.6',
  lastmod: p.date,
}));

const tagMap = new Map();
posts.forEach((p) => {
  p.tags.forEach((t) => {
    const existing = tagMap.get(t);
    if (!existing || existing < p.date) tagMap.set(t, p.date);
  });
});
const tagPages = Array.from(tagMap.entries())
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([tag, lastmod]) => ({
    path: `/blog/tag/${tag}`,
    priority: '0.5',
    lastmod,
  }));

const allPages = [...staticPages, ...gamePages, ...blogPages, ...tagPages];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    p => `  <url>
    <loc>https://arcadedeck.net${p.path}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

writeFileSync('public/sitemap.xml', xml);
console.log(`Sitemap generated with ${allPages.length} URLs (${gamePages.length} games, ${blogPages.length} posts, ${tagPages.length} tags).`);
