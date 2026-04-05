import { readFileSync, writeFileSync } from 'fs';

const games = JSON.parse(readFileSync('src/data/games.json', 'utf-8'));
const today = new Date().toISOString().split('T')[0];

const staticPages = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/hall-of-fame', changefreq: 'monthly', priority: '0.8' },
  { path: '/about', changefreq: 'yearly', priority: '0.6' },
  { path: '/contact', changefreq: 'yearly', priority: '0.5' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.4' },
];

const gamePages = games
  .filter(g => g.status !== 'IN PRODUCTION')
  .map(g => ({
    path: `/play/${g.slug}`,
    changefreq: 'weekly',
    priority: '0.9',
  }));

const allPages = [...staticPages, ...gamePages];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    p => `  <url>
    <loc>https://arcadedeck.net${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

writeFileSync('public/sitemap.xml', xml);
console.log(`Sitemap generated with ${allPages.length} URLs.`);
