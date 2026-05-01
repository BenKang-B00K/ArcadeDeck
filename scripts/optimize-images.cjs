/**
 * One-shot image optimizer.
 * Pass 1: Resize oversized banner WebPs in public/images to TARGET_WIDTH.
 * Pass 2: Emit a {slug}-360.webp variant for every non-system game thumbnail
 *         so <img srcset> can serve a smaller file to desktop card slots
 *         (~351px css width). Browsers pick by DPR.
 *
 * Run manually:
 *   node scripts/optimize-images.cjs
 *
 * Skips: favicons, app icons, full-bleed banners and bg images.
 * Already-360 variants are skipped from pass 1 and regenerated in pass 2.
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
sharp.cache(false);

const DIR = path.join(__dirname, '..', 'public', 'images');
const TARGET_WIDTH = 640;
const VARIANT_WIDTH = 360;
const QUALITY = 70;
// Only re-encode a file if it is either bigger than this OR wider than
// TARGET_WIDTH. Keeps already-optimized small files untouched, but catches
// oversized banners regardless of their on-disk byte count (Lighthouse
// flags display-size mismatch even on tiny files).
const SIZE_THRESHOLD = 50 * 1024;

const SKIP = new Set([
  'favicon.webp',
  'icon-192x192.webp',
  'icon-512x512.webp',
  'arcadedeck-banner.webp',
  'bg.webp',
  'hall-of-fame-bg.webp',
  'my-rank-bg.webp',
  'blog-bg.webp',
]);

const isVariant = (f) => /-360\.webp$/i.test(f);

(async () => {
  const allFiles = fs.readdirSync(DIR).filter(f => f.toLowerCase().endsWith('.webp'));

  // Pass 1: resize oversized masters.
  let totalBefore = 0, totalAfter = 0;
  for (const f of allFiles) {
    if (SKIP.has(f) || isVariant(f)) continue;
    const p = path.join(DIR, f);
    const before = fs.statSync(p).size;
    const meta = await sharp(p).metadata();
    const tooWide = (meta.width || 0) > TARGET_WIDTH;
    const tooBig = before >= SIZE_THRESHOLD;
    if (!tooWide && !tooBig) continue;
    if ((meta.width || 0) <= TARGET_WIDTH && before < 200 * 1024) continue;
    const buf = await sharp(p)
      .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();
    const tmp = p + '.tmp';
    fs.writeFileSync(tmp, buf);
    fs.renameSync(tmp, p);
    const after = buf.length;
    totalBefore += before;
    totalAfter += after;
    console.log(`resize ${f}: ${(before/1024).toFixed(0)}K -> ${(after/1024).toFixed(0)}K`);
  }
  console.log(`Resize total: ${(totalBefore/1024).toFixed(0)}K -> ${(totalAfter/1024).toFixed(0)}K (saved ${((totalBefore-totalAfter)/1024).toFixed(0)}K)`);

  // Pass 2: emit 360w variant for each game thumbnail. Always regenerate so
  // changes to the master propagate. Skips system images and existing -360
  // files.
  let variantBytes = 0;
  for (const f of fs.readdirSync(DIR).filter(x => x.toLowerCase().endsWith('.webp'))) {
    if (SKIP.has(f) || isVariant(f)) continue;
    const p = path.join(DIR, f);
    const out = path.join(DIR, f.replace(/\.webp$/i, '-360.webp'));
    const buf = await sharp(p)
      .resize({ width: VARIANT_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();
    const tmp = out + '.tmp';
    fs.writeFileSync(tmp, buf);
    fs.renameSync(tmp, out);
    variantBytes += buf.length;
    console.log(`variant ${path.basename(out)}: ${(buf.length/1024).toFixed(0)}K`);
  }
  console.log(`Variants total: ${(variantBytes/1024).toFixed(0)}K`);
})();
