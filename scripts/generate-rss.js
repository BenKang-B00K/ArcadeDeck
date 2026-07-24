import { readFileSync, writeFileSync } from 'fs';

const games = JSON.parse(readFileSync('src/data/games.json', 'utf-8'));
const posts = JSON.parse(readFileSync('src/data/posts.json', 'utf-8'))
  .slice()
  .sort((a, b) => (a.date < b.date ? 1 : -1));

const SITE = 'https://arcadedeck.net';
const FEED_URL = `${SITE}/rss.xml`;
const DEFAULT_IMAGE = `${SITE}/images/arcadedeck-banner.webp`;
const buildDate = new Date().toUTCString();

const xmlEscape = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const cdata = (str = '') => `<![CDATA[${String(str).replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;

const items = posts.map((p) => {
  const url = `${SITE}/blog/${p.slug}`;
  const pubDate = new Date(p.date + 'T00:00:00Z').toUTCString();
  const relatedGame = (p.relatedGames || [])
    .map((s) => games.find((g) => g.slug === s))
    .find((g) => g);
  const enclosureUrl = relatedGame
    ? `${SITE}/${encodeURI(relatedGame.thumbnail)}`
    : DEFAULT_IMAGE;
  const categories = (p.tags || [])
    .map((t) => `      <category>${xmlEscape(t)}</category>`)
    .join('\n');

  return `    <item>
      <title>${xmlEscape(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>noreply@arcadedeck.net (${xmlEscape(p.author)})</author>
${categories}
      <description>${cdata(p.excerpt)}</description>
      <content:encoded>${cdata(p.content)}</content:encoded>
      <enclosure url="${enclosureUrl}" type="image/webp" length="0" />
      <media:content url="${enclosureUrl}" medium="image" type="image/webp" />
    </item>`;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>ArcadeDeck Blog</title>
    <link>${SITE}/blog</link>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml" />
    <description>Patch notes, game design deep-dives, and strategy guides from the ArcadeDeck team.</description>
    <language>en-us</language>
    <copyright>Copyright ${new Date().getUTCFullYear()} ArcadeDeck</copyright>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <pubDate>${buildDate}</pubDate>
    <ttl>60</ttl>
    <generator>ArcadeDeck custom RSS</generator>
    <image>
      <url>${SITE}/images/icon-512x512.webp</url>
      <title>ArcadeDeck Blog</title>
      <link>${SITE}/blog</link>
    </image>
${items.join('\n')}
  </channel>
</rss>
`;

writeFileSync('public/rss.xml', xml);
console.log(`RSS feed generated with ${posts.length} items.`);
