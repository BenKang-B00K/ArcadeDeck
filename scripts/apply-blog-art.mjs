// Wires generated blog art into src/data/posts.json. Idempotent: only inserts images whose files exist in public/images/blog/.
// Run after dropping <slug>-poster|mid|final.webp: node scripts/apply-blog-art.mjs
import fs from 'node:fs';
import vm from 'node:vm';

const art = vm.runInNewContext(fs.readFileSync('scripts/blog-art-data.js', 'utf8') + ';window.BLOG_ART', { window: {} });
const file = 'src/data/posts.json';
const posts = JSON.parse(fs.readFileSync(file, 'utf8'));
// srcset 800/1600 when the optimizer's -800 variant exists; poster is the LCP image (eager + high priority), the rest lazy.
const fig = (slug, kind, alt, lcp) => {
  const base = `/images/blog/${slug}-${kind}`;
  const srcset = fs.existsSync(`public${base}-800.webp`)
    ? ` srcset="${base}-800.webp 800w, ${base}.webp 1600w" sizes="(max-width: 800px) 100vw, 800px"`
    : '';
  return `<figure><img src="${base}.webp"${srcset} alt="${alt.replace(/"/g, '&quot;')}" ${lcp ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="1600" height="900" /></figure>`;
};

let n = 0;
for (const post of posts) {
  const a = art[post.slug];
  if (!a) continue;
  const has = (k) => fs.existsSync(`public/images/blog/${post.slug}-${k}.webp`);
  const done = (k) => post.content.includes(`${post.slug}-${k}.webp`);
  if (has('poster')) {
    if (!done('poster')) {
      // the old hero figure is replaced by the poster
      post.content = post.content.replace(/<figure><img src="[^"]*-hero\.webp"[^>]*\/?><\/figure>/, '');
      post.content = fig(post.slug, 'poster', a.p.a, true) + post.content;
      n++;
    }
    // og:image = 1200x630 crop (optimizer output); fall back to the 16:9 poster until it exists
    post.coverImage = `images/blog/${post.slug}-${has('og') ? 'og' : 'poster'}.webp`;
    post.coverImageAlt = a.p.a;
  }
  if (has('mid') && !done('mid')) {
    const hs = [...post.content.matchAll(/<h2[ >]/g)].map((m) => m.index);
    const mid = post.content.length / 2;
    const at = hs.length ? hs.reduce((b, i) => (Math.abs(i - mid) < Math.abs(b - mid) ? i : b)) : -1;
    if (at > 0) { post.content = post.content.slice(0, at) + fig(post.slug, 'mid', a.m.a) + post.content.slice(at); n++; }
  }
  if (has('final') && !done('final')) {
    const at = post.content.lastIndexOf('</p>') + 4;
    post.content = post.content.slice(0, at) + fig(post.slug, 'final', a.f.a) + post.content.slice(at);
    n++;
  }
}
fs.writeFileSync(file, JSON.stringify(posts, null, 2) + '\n');
console.log(`inserted ${n} images`);
