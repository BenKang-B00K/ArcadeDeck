#!/usr/bin/env node
/**
 * Convert generated cloud-puff artwork into game-ready sprites.
 *
 * Image generators cannot emit real alpha, so the workflow is:
 *   generate WHITE CLOUD ON PURE BLACK  ->  this script keys luminance to alpha  ->  WebP
 *
 * Usage:
 *   node scripts/sky-puff-textures.cjs raw/puff-a.png raw/puff-b.png raw/puff-c.png
 *   node scripts/sky-puff-textures.cjs raw/*.png --size 256 --quality 80
 *
 * Writes public/images/sky/puff-{a,b,c}.webp (256x256, alpha, sRGB).
 *
 * ponytail: luminance-keying only. If art ever ships with a real alpha channel,
 * pass --keep-alpha and this becomes a plain resize+encode.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'sky');
const NAMES = ['a', 'b', 'c', 'd', 'e', 'f'];

const argv = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = argv.indexOf('--' + name);
  return i === -1 ? dflt : argv[i + 1];
};
const has = name => argv.includes('--' + name);
const inputs = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--size' || argv[i] === '--quality') { i++; continue; }   // skip flag + its value
  if (argv[i].startsWith('--')) continue;
  inputs.push(argv[i]);
}

const SIZE = parseInt(flag('size', '256'), 10);
const QUALITY = parseInt(flag('quality', '80'), 10);
const KEEP_ALPHA = has('keep-alpha');

if (!inputs.length) {
  console.error('usage: node scripts/sky-puff-textures.cjs <image...> [--size 256] [--quality 80] [--keep-alpha]');
  process.exit(1);
}
if (inputs.length > NAMES.length) {
  console.error(`too many inputs (max ${NAMES.length})`);
  process.exit(1);
}

async function convert(src, name) {
  if (!fs.existsSync(src)) throw new Error(`missing input: ${src}`);

  const base = sharp(src).resize(SIZE, SIZE, { fit: 'cover' });
  let img;

  if (KEEP_ALPHA) {
    img = base.ensureAlpha();
  } else {
    // luminance -> alpha. RGB is forced near-white so the engine's per-instance
    // tint (zone hue + height shading) has a neutral base to multiply against;
    // all the shape information lives in the alpha channel.
    const { data, info } = await base.removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const px = info.width * info.height;
    const out = Buffer.alloc(px * 4);
    let maxL = 1;
    for (let i = 0; i < px; i++) {
      const l = 0.2126 * data[i * 3] + 0.7152 * data[i * 3 + 1] + 0.0722 * data[i * 3 + 2];
      if (l > maxL) maxL = l;
    }
    for (let i = 0; i < px; i++) {
      const l = 0.2126 * data[i * 3] + 0.7152 * data[i * 3 + 1] + 0.0722 * data[i * 3 + 2];
      const a = Math.min(255, Math.round((l / maxL) * 255));   // normalise so the brightest pixel is opaque
      out[i * 4] = 252; out[i * 4 + 1] = 253; out[i * 4 + 2] = 255; out[i * 4 + 3] = a;
    }
    img = sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } });
  }

  const dest = path.join(OUT_DIR, `puff-${name}.webp`);
  await img.webp({ quality: QUALITY, alphaQuality: 90 }).toFile(dest);
  const kb = (fs.statSync(dest).size / 1024).toFixed(1);
  console.log(`  ${path.basename(src)}  ->  images/sky/puff-${name}.webp   ${kb} KB`);
  return fs.statSync(dest).size;
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`sky puff sprites  ${SIZE}x${SIZE}  q${QUALITY}  ${KEEP_ALPHA ? '(keeping source alpha)' : '(luminance keyed to alpha)'}`);
  let total = 0;
  for (let i = 0; i < inputs.length; i++) total += await convert(inputs[i], NAMES[i]);
  console.log(`total ${(total / 1024).toFixed(1)} KB for ${inputs.length} sprite(s)`);
  if (total > 90 * 1024) console.warn('WARNING: over the ~90 KB sprite budget — ask for softer, larger-feature art or drop --quality');
})().catch(e => { console.error(e.message); process.exit(1); });
