/**
 * One-shot PNG quantizer for hosted game builds whose code requests .png by
 * name (so a WebP swap is not an option): re-encodes every PNG under a dir
 * in place as an 8-bit palette PNG, ~65% smaller at UI-icon sizes.
 *
 *   node scripts/quantize-png.cjs games/flux-tower-defense/entity_image
 *
 * Run again after re-copying a build; already-palette files stay put.
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
sharp.cache(false);

const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/quantize-png.cjs <dir>'); process.exit(1); }

(async () => {
  let before = 0, after = 0;
  for (const f of fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.png'))) {
    const p = path.join(dir, f);
    const meta = await sharp(p).metadata();
    if (meta.paletteBitDepth) continue; // already quantized
    const src = fs.readFileSync(p);
    const buf = await sharp(src).png({ palette: true, quality: 80, effort: 7 }).toBuffer();
    if (buf.length >= src.length) continue;
    before += src.length; after += buf.length;
    fs.writeFileSync(p, buf);
  }
  console.log(`${dir}: ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB`);
})();
