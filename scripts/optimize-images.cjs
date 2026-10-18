/**
 * One-shot image optimizer. Two modes, same resize→encode→write loop.
 *
 *   node scripts/optimize-images.cjs         # public/images (game banners)
 *   node scripts/optimize-images.cjs --blog  # public/images/blog (hero/inline; poster/mid/final -> 1600w + -800 + poster -og 1200x630)
 *
 * Game mode:
 *   Pass 1 — resize oversized banner WebPs to TARGET_WIDTH (640w q70).
 *   Pass 2 — emit a {slug}-360.webp variant for every non-system thumbnail so
 *            <img srcset> can serve a smaller file to desktop card slots
 *            (~351px css width). Browsers pick by DPR.
 *   Skips favicons, app icons, full-bleed banners and bg images. Already-360
 *   variants are skipped from pass 1 and regenerated in pass 2.
 *
 * Blog mode:
 *   Single pass — inline images to 1600w, everything else to 1200w, q72.
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
sharp.cache(false);

const BLOG = process.argv.includes('--blog');

const TARGET_WIDTH = 640;
const VARIANT_WIDTH = 360;
const QUALITY = BLOG ? 72 : 70;
const DIR = path.join(__dirname, '..', 'public', 'images', ...(BLOG ? ['blog'] : []));

// Game mode only: re-encode a file if it is either bigger than this OR wider
// than TARGET_WIDTH. Keeps already-optimized small files untouched, but catches
// oversized banners regardless of their on-disk byte count (Lighthouse flags
// display-size mismatch even on tiny files).
const SIZE_THRESHOLD = 50 * 1024;

const SKIP = new Set([
  'favicon.webp',
  'icon-192x192.webp',
  'icon-512x512.webp',
  'arcadedeck-banner.webp',
  'bg.webp',
  'my-rank-bg.webp',
  'blog-bg.webp',
  'gate-of-hell-bg.webp',
]);

const isVariant = (f) => /-360\.webp$/i.test(f);
const listWebp = () => fs.readdirSync(DIR).filter(f => f.toLowerCase().endsWith('.webp'));
const kb = (bytes) => (bytes / 1024).toFixed(0) + 'K';

// Resize `src` to `width` and write the result to `out` (atomic via .tmp).
// Returns the encoded byte length.
async function encode(src, out, width) {
  const buf = await sharp(src)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: QUALITY, alphaQuality: 40, ...(BLOG ? { effort: 6 } : {}) })
    .toBuffer();
  const tmp = out + '.tmp';
  fs.writeFileSync(tmp, buf);
  fs.renameSync(tmp, out);
  return buf.length;
}

(async () => {
  let totalBefore = 0, totalAfter = 0;

  if (BLOG) {
    for (const f of listWebp()) {
      if (/-(og|800)\.webp$/.test(f)) continue; // derived below
      const p = path.join(DIR, f);
      const before = fs.statSync(p).size;
      const art = /-(poster|mid|final)\.webp$/.test(f);
      if (!art) continue; // legacy hero/inline already optimized; re-encoding is lossy
      // Re-encoding is lossy: skip art whose -800 sibling is already newer than the source.
      const v800 = p.replace(/\.webp$/, '-800.webp');
      if (fs.existsSync(v800) && fs.statSync(v800).mtimeMs >= fs.statSync(p).mtimeMs) continue;
      const after = await encode(p, p, art ? 1600 : 1200);
      if (art) {
        // 800w for srcset; poster also gets the 1200x630 social crop (og:image).
        await encode(p, p.replace(/\.webp$/, '-800.webp'), 800);
        if (/-poster\.webp$/.test(f)) {
          const og = p.replace(/-poster\.webp$/, '-og.webp');
          fs.writeFileSync(og, await sharp(p).resize(1200, 630, { fit: 'cover' }).webp({ quality: QUALITY, effort: 6 }).toBuffer());
        }
      }
      totalBefore += before;
      totalAfter += after;
      console.log(`${f}: ${kb(before)} -> ${kb(after)} (${((1 - after / before) * 100).toFixed(1)}% smaller)`);
    }
    console.log(`\nTotal: ${kb(totalBefore)} -> ${kb(totalAfter)}`);
    return;
  }

  // Pass 1: resize oversized masters.
  for (const f of listWebp()) {
    if (SKIP.has(f) || isVariant(f)) continue;
    const p = path.join(DIR, f);
    const before = fs.statSync(p).size;
    const width = (await sharp(p).metadata()).width || 0;
    if (width <= TARGET_WIDTH && before < SIZE_THRESHOLD) continue;
    if (width <= TARGET_WIDTH && before < 200 * 1024) continue;
    const after = await encode(p, p, TARGET_WIDTH);
    totalBefore += before;
    totalAfter += after;
    console.log(`resize ${f}: ${kb(before)} -> ${kb(after)}`);
  }
  console.log(`Resize total: ${kb(totalBefore)} -> ${kb(totalAfter)} (saved ${kb(totalBefore - totalAfter)})`);

  // Pass 2: emit 360w variant for each game thumbnail. Always regenerate so
  // changes to the master propagate.
  let variantBytes = 0;
  for (const f of listWebp()) {
    if (SKIP.has(f) || isVariant(f)) continue;
    const out = path.join(DIR, f.replace(/\.webp$/i, '-360.webp'));
    const bytes = await encode(path.join(DIR, f), out, VARIANT_WIDTH);
    variantBytes += bytes;
    console.log(`variant ${path.basename(out)}: ${kb(bytes)}`);
  }
  console.log(`Variants total: ${kb(variantBytes)}`);
})();
