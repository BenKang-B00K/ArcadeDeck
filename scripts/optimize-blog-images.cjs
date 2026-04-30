/**
 * Blog image optimizer.
 * Resizes hero (1200w) + inline (1600w) WebPs in public/images/blog/
 * and re-encodes at q72 for OG/social bandwidth budget.
 *   node scripts/optimize-blog-images.cjs
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
sharp.cache(false);

const DIR = path.join(__dirname, '..', 'public', 'images', 'blog');
const HERO_WIDTH = 1200;
const INLINE_WIDTH = 1600;
const COVER_WIDTH = 1200;
const QUALITY = 72;

(async () => {
  const files = fs.readdirSync(DIR).filter((f) => f.toLowerCase().endsWith('.webp'));
  let totalBefore = 0;
  let totalAfter = 0;

  for (const f of files) {
    const full = path.join(DIR, f);
    const before = fs.statSync(full).size;
    totalBefore += before;

    const isInline = f.includes('-inline');
    const targetWidth = isInline ? INLINE_WIDTH : f.startsWith('blog-default-cover') ? COVER_WIDTH : HERO_WIDTH;

    const buf = await sharp(full)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 6 })
      .toBuffer();

    fs.writeFileSync(full, buf);
    const after = buf.length;
    totalAfter += after;
    const pct = ((1 - after / before) * 100).toFixed(1);
    console.log(`${f}: ${(before / 1024).toFixed(0)}K -> ${(after / 1024).toFixed(0)}K (${pct}% smaller)`);
  }

  console.log(
    `\nTotal: ${(totalBefore / 1024).toFixed(0)}K -> ${(totalAfter / 1024).toFixed(0)}K (${((1 - totalAfter / totalBefore) * 100).toFixed(1)}% smaller)`,
  );
})();
