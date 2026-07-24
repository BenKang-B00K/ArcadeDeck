/**
 * Submit ArcadeDeck URLs to IndexNow (Bing, Yandex, Seznam, Naver).
 *
 * Usage:
 *   node scripts/ping-indexnow.js              # ping all blog + tag URLs
 *   node scripts/ping-indexnow.js --posts-only # blog post URLs only
 *   node scripts/ping-indexnow.js --since=2026-04-01  # only items modified on/after date
 *   node scripts/ping-indexnow.js --all        # everything (games + blog + tags + static)
 *
 * IndexNow accepts up to 10,000 URLs per request. The key file lives at
 * https://arcadedeck.net/{KEY}.txt and must contain the same key string.
 *
 * No auth, no API token. The key file is the proof of ownership.
 */

import { readFileSync } from 'fs';

const KEY = '5b8e2f47a9c14d3e6b0f9d2c7a5e1f83';
const HOST = 'arcadedeck.net';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/IndexNow';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const sinceArg = args.find((a) => a.startsWith('--since='));
const since = sinceArg ? sinceArg.split('=')[1] : null;

const games = JSON.parse(readFileSync('src/data/games.json', 'utf-8'));
const posts = JSON.parse(readFileSync('src/data/posts.json', 'utf-8'));

const tagSet = new Set();
posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
const tags = Array.from(tagSet).sort();

const filteredPosts = since
  ? posts.filter((p) => (p.dateModified || p.date) >= since)
  : posts;

const postUrls = filteredPosts.map((p) => `https://${HOST}/blog/${p.slug}`);
const tagUrls = tags.map((t) => `https://${HOST}/blog/tag/${t}`);
const gameUrls = games
  .filter((g) => g.status !== 'IN PRODUCTION')
  .map((g) => `https://${HOST}/play/${g.slug}`);
const staticUrls = [
  `https://${HOST}/`,
  `https://${HOST}/blog`,
  `https://${HOST}/about`,
];

let urlList;
if (flag('--all')) {
  urlList = [...staticUrls, ...gameUrls, ...postUrls, ...tagUrls];
} else if (flag('--posts-only')) {
  urlList = postUrls;
} else {
  urlList = [...postUrls, ...tagUrls];
}

if (urlList.length === 0) {
  console.log('No URLs to submit. Exiting.');
  process.exit(0);
}

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList,
};

console.log(`Submitting ${urlList.length} URL(s) to IndexNow:`);
urlList.forEach((u) => console.log(`  ${u}`));

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});

const body = await res.text();
console.log(`\nIndexNow response: ${res.status} ${res.statusText}`);
if (body) console.log(body);

if (res.status >= 200 && res.status < 300) {
  console.log('\nSuccess. Bing/Yandex/Seznam/Naver will fetch these URLs shortly.');
} else if (res.status === 422) {
  console.error('\n422: URL list rejected. Common causes: key file not yet deployed at', KEY_LOCATION);
  process.exit(1);
} else {
  console.error('\nUnexpected status. Check that the key file is reachable at', KEY_LOCATION);
  process.exit(1);
}
