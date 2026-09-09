/* world_road.js - Hellish Night Background & Soul Road */

const getRoadWidth = () => 342;
const getRoadX = () => (window.LOGICAL_WIDTH - getRoadWidth()) / 2;
const SLAB_HEIGHT = 120;

// ─ Image assets (lazy-loaded; fallback to procedural until ready) ─
const _roadTileImg = new Image();
_roadTileImg.src = 'images/world/road_tile.webp';
let _roadTileReady = false;
let _roadTilePattern = null;
_roadTileImg.onload = () => { _roadTileReady = true; };

const _centerGargoyleImg = new Image();
_centerGargoyleImg.src = 'images/world/center_gargoyle.webp';
let _cgReady = false;
_centerGargoyleImg.onload = () => { _cgReady = true; };

const _crowdImg = new Image();
_crowdImg.src = 'images/world/crowd_sprites.webp';
let _crowdReady = false;
_crowdImg.onload = () => { _crowdReady = true; };

// Draws center throne gargoyle. Image path now handled by world_pixi.js (PIXI sprite on worldLayer).
// Procedural fallback only when PIXI texture not loaded yet.
function _drawCenterGargoyle(cx, cy, S, p, t) {
    if (_cgReady) return; // PIXI sprite covers it
    _drawGargoyleArt(cx, cy, S, p, t);
}

/**
 * Front-facing gargoyle pixel art — used for both the static throne statue
 * and the game-over fly-out animation.
 * @param {number} gx - center x
 * @param {number} gy - center y (body pivot)
 * @param {number} S  - scale (logical px per art-unit)
 * @param {number} p  - pollution 0..1 (controls wing spread + eye intensity)
 * @param {number} t  - animation timer
 */
function _drawGargoyleArt(gx, gy, S, p, t) {
    const bk = (dx, dy, w, h, col) => {
        ctx.fillStyle = col;
        ctx.fillRect(Math.round(gx + dx * S), Math.round(gy + dy * S), Math.round(w * S), Math.round(h * S));
    };

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    const wingSpan = 3 + p * 15;   // 3 (folded) → 18 (full-spread) units
    const wingRise = p * 8;         // 0 → 8 units upward at tip

    // ── Wings (drawn BEHIND body) ──
    const wFill = `rgba(${Math.floor(14+p*18)},0,${Math.floor(9+p*13)},0.95)`;

    // Left membrane
    ctx.fillStyle = wFill;
    ctx.beginPath();
    ctx.moveTo(Math.round(gx - 3*S), Math.round(gy - 2*S));
    ctx.bezierCurveTo(
        Math.round(gx - (4 + wingSpan*0.35)*S), Math.round(gy - (2 + wingRise*0.40)*S),
        Math.round(gx - (3 + wingSpan*0.75)*S), Math.round(gy - (1 + wingRise*0.90)*S),
        Math.round(gx - (2 + wingSpan)*S),       Math.round(gy - wingRise*S)
    );
    ctx.bezierCurveTo(
        Math.round(gx - (3 + wingSpan*0.85)*S), Math.round(gy + (2 - wingRise*0.10)*S),
        Math.round(gx - (3 + wingSpan*0.40)*S), Math.round(gy + (3 - wingRise*0.05)*S),
        Math.round(gx - 3*S),                    Math.round(gy + 2*S)
    );
    ctx.closePath();
    ctx.fill();

    // Right membrane (mirror)
    ctx.fillStyle = wFill;
    ctx.beginPath();
    ctx.moveTo(Math.round(gx + 3*S), Math.round(gy - 2*S));
    ctx.bezierCurveTo(
        Math.round(gx + (4 + wingSpan*0.35)*S), Math.round(gy - (2 + wingRise*0.40)*S),
        Math.round(gx + (3 + wingSpan*0.75)*S), Math.round(gy - (1 + wingRise*0.90)*S),
        Math.round(gx + (2 + wingSpan)*S),       Math.round(gy - wingRise*S)
    );
    ctx.bezierCurveTo(
        Math.round(gx + (3 + wingSpan*0.85)*S), Math.round(gy + (2 - wingRise*0.10)*S),
        Math.round(gx + (3 + wingSpan*0.40)*S), Math.round(gy + (3 - wingRise*0.05)*S),
        Math.round(gx + 3*S),                    Math.round(gy + 2*S)
    );
    ctx.closePath();
    ctx.fill();

    // Wing bone ribs
    ctx.strokeStyle = `rgba(${Math.floor(22+p*28)},0,${Math.floor(14+p*18)},0.75)`;
    ctx.lineWidth = Math.max(1, S * 0.25);
    ctx.lineCap = 'round';
    const drawWingBones = (side) => {
        const ribs = [
            [gx+side*3*S, gy-S, gx+side*(2+wingSpan)*S,         gy-wingRise*S],
            [gx+side*3*S, gy-S, gx+side*(2+wingSpan*0.55)*S,    gy-(wingRise*0.5+2)*S],
            [gx+side*3*S, gy-S, gx+side*(2+wingSpan*0.80)*S,    gy+(wingRise>2?-1:1)*S],
        ];
        ribs.forEach(([x1,y1,x2,y2]) => {
            ctx.beginPath();
            ctx.moveTo(Math.round(x1), Math.round(y1));
            ctx.lineTo(Math.round(x2), Math.round(y2));
            ctx.stroke();
        });
    };
    drawWingBones(-1);
    drawWingBones(1);

    // Wing-tip embers (pollution > 35%)
    if (p > 0.35) {
        ctx.globalCompositeOperation = 'screen';
        const ta = (p - 0.35) * 0.9;
        const tipR = 15 * p * S / 8;
        [gx-(2+wingSpan)*S, gx+(2+wingSpan)*S].forEach(wx => {
            const wy = gy - wingRise*S;
            const wg = ctx.createRadialGradient(wx, wy, 0, wx, wy, tipR);
            wg.addColorStop(0,   `rgba(255,50,0,${ta*0.85})`);
            wg.addColorStop(0.5, `rgba(180,0,40,${ta*0.35})`);
            wg.addColorStop(1,   'transparent');
            ctx.fillStyle = wg;
            ctx.beginPath(); ctx.arc(wx, wy, tipR, 0, Math.PI*2); ctx.fill();
        });
        ctx.globalCompositeOperation = 'source-over';
    }

    // ── Throne back ──
    bk(-5,  -5,  2, 9,   '#160009');   // left pillar
    bk( 3,  -5,  2, 9,   '#160009');   // right pillar
    bk(-5,  -6, 10, 1.5, '#1c000c');   // cap bar
    bk(-5,  -8,  2, 2,   '#110007');   bk(-2,  -7.5, 1.5, 1.5, '#0f0006');
    bk( 0.5,-7.5, 1.5,1.5,'#0f0006'); bk( 3,  -8,  2, 2,   '#110007');   // spikes

    // ── Throne base ──
    bk(-5,  4,  10, 1.5, '#1a000e');   // armrests
    bk(-6,  5,  12, 2,   '#180010');   // seat
    bk(-5.5,6.5,11, 1.5, '#140008');
    bk(-6,  7.5,12, 2,   '#120007');

    // ── Body (seated) ──
    bk(-3,  -3,  6, 6,   '#280018');
    bk(-2,  -3,  4, 1.5, '#340020');   // collar
    bk(-1.5,-1.5,3, 1,   '#1e0012');
    bk(-1.5, 0,  3, 1,   '#1e0012');
    bk(-1.5, 1.5,3, 1,   '#1e0012');
    bk(-3,  3,   6, 2,   '#220014');   // lap
    bk(-5.5,2,   3, 1.5, '#200014');   // left arm
    bk( 2.5,2,   3, 1.5, '#200014');   // right arm
    for (let ci = 0; ci < 3; ci++) {
        bk(-5.5 + ci*0.85, 3.2, 0.7, 1.8, '#150009');
        bk( 2.5 + ci*0.85, 3.2, 0.7, 1.8, '#150009');
    }

    // ── Head ──
    bk(-3.5,-11,  7, 6.5, '#2e001e');
    bk(-3.5,-11,  7, 1.5, '#3a0028');  // brow ridge
    bk(-4,  -9.5, 1, 2,   '#240018');  // cheekbones
    bk( 3,  -9.5, 1, 2,   '#240018');
    bk(-2.5,-6,   5, 2,   '#260018');  // snout/jaw
    bk(-2,  -5,   1, 1.5, '#170010');  // fangs
    bk(-0.5,-5,   1, 1.5, '#1a0012');
    bk( 1,  -5,   1, 1.5, '#170010');

    // ── Horns ──
    bk(-3.5,-16,  2, 5.5, '#1e0012');
    bk(-4,  -17,  2, 2,   '#140009');
    bk( 1.5,-16,  2, 5.5, '#1e0012');
    bk( 2,  -17,  2, 2,   '#140009');
    if (p > 0.5) {
        ctx.globalCompositeOperation = 'screen';
        const hg = (p - 0.5) * 1.3;
        ctx.fillStyle = `rgba(255,20,0,${hg*0.4})`;
        ctx.fillRect(Math.round(gx-4.5*S), Math.round(gy-18*S), Math.round(3*S), Math.round(7*S));
        ctx.fillRect(Math.round(gx+1.5*S), Math.round(gy-18*S), Math.round(3*S), Math.round(7*S));
        ctx.globalCompositeOperation = 'source-over';
    }

    // ── Glowing red eyes ──
    ctx.globalCompositeOperation = 'screen';
    const ep = 0.65 + Math.sin(t * 2.8) * 0.35;
    const es = 0.5 + p * 0.5;
    ctx.fillStyle = `rgba(255,10,30,${ep*es})`;
    ctx.fillRect(Math.round(gx-2.8*S), Math.round(gy-9.5*S), Math.round(1.6*S), Math.round(1.6*S));
    ctx.fillRect(Math.round(gx+1.2*S), Math.round(gy-9.5*S), Math.round(1.6*S), Math.round(1.6*S));
    const eyeR = (28 + p*22) * S/8;
    const eg = ctx.createRadialGradient(gx, gy-9*S, 0, gx, gy-9*S, eyeR);
    eg.addColorStop(0,   `rgba(255,0,0,${ep*es*0.7})`);
    eg.addColorStop(0.4, `rgba(200,0,0,${ep*es*0.3})`);
    eg.addColorStop(1,   'transparent');
    ctx.fillStyle = eg;
    ctx.beginPath(); ctx.ellipse(gx, gy-9*S, eyeR, eyeR*0.6, 0, 0, Math.PI*2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // ── Pedestal runes ──
    ctx.globalCompositeOperation = 'screen';
    const runeA = 0.15 + Math.sin(t*1.5)*0.1 + p*0.3;
    ctx.fillStyle = `rgba(120,0,200,${runeA})`;
    for (let ri = 0; ri < 5; ri++) {
        ctx.fillRect(Math.round(gx+(-4.5+ri*1.6)*S), Math.round(gy+6.5*S), Math.round(0.6*S), Math.round(1.8*S));
    }
    ctx.globalCompositeOperation = 'source-over';

    // ── Ambient aura ──
    ctx.globalCompositeOperation = 'screen';
    const ar = (50 + p*90) * S/8;
    const aura = ctx.createRadialGradient(gx, gy+8*S, 0, gx, gy+8*S, ar);
    aura.addColorStop(0,   `rgba(80,0,120,${0.22+p*0.38})`);
    aura.addColorStop(0.5, `rgba(40,0,80,${0.08+p*0.12})`);
    aura.addColorStop(1,   'transparent');
    ctx.fillStyle = aura;
    ctx.beginPath(); ctx.arc(gx, gy+8*S, ar, 0, Math.PI*2); ctx.fill();
    if (p > 0.55) {
        const rb = (p-0.55)*0.55;
        const rg = ctx.createRadialGradient(gx, gy-9*S, 0, gx, gy-9*S, 70*S/8*p);
        rg.addColorStop(0,   `rgba(200,0,0,${rb*0.5})`);
        rg.addColorStop(0.5, `rgba(120,0,0,${rb*0.2})`);
        rg.addColorStop(1,   'transparent');
        ctx.fillStyle = rg;
        ctx.beginPath(); ctx.arc(gx, gy-9*S, 70*S/8*p, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    ctx.restore();
}

/**
 * Draws the full hellish night background + the cursed soul road.
 * Theme: A dark night where evil entities crawl from a dimensional rift
 * toward a massive Hell Portal, while exorcists hold the flanks.
 */
function drawLavaRoad() {
    const time = window.globalAnimTimer || 0;
    const H = window.LOGICAL_HEIGHT || 1440;
    const W = window.LOGICAL_WIDTH || 1080;
    const roadWidth = getRoadWidth();
    const roadX = getRoadX();
    const roadMid = roadX + roadWidth / 2;

    ctx.save();

    // ═══════════════════════════════════════════════
    // LAYER 0: DEEP NIGHT SKY (Full Background)
    // ═══════════════════════════════════════════════
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0.0,  '#000000');
    skyGrad.addColorStop(0.15, '#03000a');
    skyGrad.addColorStop(0.5,  '#08001a');
    skyGrad.addColorStop(0.75, '#150010');
    skyGrad.addColorStop(0.9,  '#2a000a');
    skyGrad.addColorStop(1.0,  '#3d0000');
    // Sky gradient only paints BELOW MERGE_Y so top_bg PIXI sprite shows above.
    // Clip out road stem so pixi road tile (below ctx2d sprite) stays visible.
    const _mergeY = H * 0.22;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.rect(roadX, 0, roadWidth, H);
    ctx.clip('evenodd');

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, _mergeY, W, H - _mergeY);

    // Faint hellfire glow bleeding from below (also below MERGE_Y so top_bg visible)
    const hellGlow = ctx.createRadialGradient(W/2, H, 0, W/2, H, W * 0.8);
    hellGlow.addColorStop(0,   'rgba(180, 0, 0, 0.35)');
    hellGlow.addColorStop(0.4, 'rgba(80, 0, 0, 0.15)');
    hellGlow.addColorStop(1,   'transparent');
    ctx.fillStyle = hellGlow;
    ctx.fillRect(0, _mergeY, W, H - _mergeY);

    // Top backdrop image rendered by world_pixi.js via PIXI sprite (stage zIndex below canvas).

    // Distant hellfire horizon band
    const horizGrad = ctx.createLinearGradient(0, H * 0.7, 0, H);
    horizGrad.addColorStop(0,   'transparent');
    horizGrad.addColorStop(0.5, 'rgba(120, 10, 0, 0.18)');
    horizGrad.addColorStop(1,   'rgba(200, 30, 0, 0.28)');
    ctx.fillStyle = horizGrad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // ═══════════════════════════════════════════════
    // LAYER 4: T-SHAPE ROAD (horizontal bar + vertical stem)
    // ═══════════════════════════════════════════════
    const MERGE_Y   = H * 0.22;


    // ── UNIFIED HELLBLACK ROAD ──────────────────────────────────
    const PS = 32;
    ctx.imageSmoothingEnabled = false;

    // Build tile pattern once image loads
    if (_roadTileReady && !_roadTilePattern) {
        _roadTilePattern = ctx.createPattern(_roadTileImg, 'repeat');
    }

    const fillRoadRegion = () => {
        if (_roadTilePattern) {
            ctx.fillStyle = _roadTilePattern;
            ctx.fillRect(0, 0, W, H);   // pattern auto-clips to current clip()
        } else {
            // Procedural fallback: near-black tile with hell-red noise
            for (let ty = 0; ty < H+PS; ty += PS) {
                for (let tx = 0; tx < W+PS; tx += PS) {
                    const h = ((tx/PS|0)*3 ^ (ty/PS|0)*7) & 3;
                    ctx.fillStyle = `rgb(${3+h},0,${1+h})`;
                    ctx.fillRect(tx, ty, PS, PS);
                }
            }
        }
    };

    // Road fill rendered by road_pixi.js (T-shape mask). Y-arm ctx2d fallback removed.

    // ── CRACK BORDER LINES ───────────────────────────────────────
    const _crackS = (pf, lw, col) => { ctx.beginPath(); pf(); ctx.strokeStyle=col; ctx.lineWidth=lw; ctx.stroke(); };
    const drawCrackBorder = (pf, alpha) => {
        const pulse = 0.80 + Math.sin(time*1.3)*0.20;
        ctx.save(); ctx.lineCap='round'; ctx.lineJoin='round';
        _crackS(pf, 6,   `rgba(80,5,0,${(alpha*0.95).toFixed(2)})`);
        _crackS(pf, 3,   `rgba(200,60,0,${(alpha*0.80).toFixed(2)})`);
        ctx.globalCompositeOperation = 'screen';
        _crackS(pf, 1.5, `rgba(255,150,20,${(alpha*pulse*0.90).toFixed(2)})`);
        ctx.restore();
    };
    // T-shape: horizontal bar (top/bottom edges across full width, minus stem cutout)
    // + vertical stem (left/right edges from bar bottom to canvas bottom).
    const _barH = 220;
    const _barTopY = MERGE_Y * 0.1;
    const _barBotY = _barTopY + _barH;
    // Bar top edge (full width)
    drawCrackBorder(() => { ctx.moveTo(0, _barTopY); ctx.lineTo(W, _barTopY); }, 0.75);
    // Bar bottom edges (left + right of stem)
    drawCrackBorder(() => { ctx.moveTo(0, _barBotY); ctx.lineTo(roadX, _barBotY); }, 0.75);
    drawCrackBorder(() => { ctx.moveTo(roadX + roadWidth, _barBotY); ctx.lineTo(W, _barBotY); }, 0.75);
    // Bar end caps (left + right)
    drawCrackBorder(() => { ctx.moveTo(0, _barTopY); ctx.lineTo(0, _barBotY); }, 0.55);
    drawCrackBorder(() => { ctx.moveTo(W, _barTopY); ctx.lineTo(W, _barBotY); }, 0.55);
    // Stem edges (from bar bottom to canvas bottom)
    drawCrackBorder(() => { ctx.moveTo(roadX, _barBotY); ctx.lineTo(roadX, H); }, 0.75);
    drawCrackBorder(() => { ctx.moveTo(roadX + roadWidth, _barBotY); ctx.lineTo(roadX + roadWidth, H); }, 0.75);

    // ── DIRECTION ARROWS (tailless crack chevrons) ──
    // Draw a tailless crack chevron: tip points in travel direction (angle=0 → down)
    const drawCrackArrow = (cx, cy, angle, size, alpha) => {
        const pulse = 0.55 + Math.sin(time*2.0 + cx*0.03 + cy*0.015)*0.25;
        const a = alpha * pulse;
        const len=size*0.65, hw=size*0.55;
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(angle);
        ctx.lineCap='round'; ctx.lineJoin='round';
        const pf = () => { ctx.moveTo(-hw,-len); ctx.lineTo(0,0); ctx.lineTo(hw,-len); };
        ctx.beginPath(); pf(); ctx.strokeStyle=`rgba(120,8,0,${(a*0.9).toFixed(2)})`; ctx.lineWidth=4; ctx.stroke();
        ctx.beginPath(); pf(); ctx.strokeStyle=`rgba(220,80,0,${(a*0.75).toFixed(2)})`; ctx.lineWidth=2; ctx.stroke();
        ctx.save(); ctx.globalCompositeOperation='screen';
        ctx.beginPath(); pf(); ctx.strokeStyle=`rgba(255,160,30,${(a*0.85).toFixed(2)})`; ctx.lineWidth=1.2; ctx.stroke();
        ctx.restore(); ctx.restore();
    };
    // Horizontal bar arrows (point toward center stem from both ends)
    const _barCenterY = _barTopY + _barH * 0.5;
    [0.10, 0.22, 0.34].forEach(fx => {
        // Left half: point right (angle = -π/2 so arrow tip points +x)
        drawCrackArrow(W * fx, _barCenterY, -Math.PI / 2, 30, 0.45);
        // Right half mirrored
        drawCrackArrow(W * (1 - fx), _barCenterY, Math.PI / 2, 30, 0.45);
    });
    // Stem arrows (pointing straight down)
    [0.18,0.35,0.52,0.69,0.86].forEach(fy => {
        drawCrackArrow(roadMid, MERGE_Y+(H-MERGE_Y)*fy, 0, 36, 0.55);
    });

    // Y-arm portal glow removed (gates relocated to bar ends).
    // Y-void getVoidX + dark seating fill removed for T-shape — top_bg sprite covers area.

    // --- Pixel-art entity drawing functions ---
    const drawGargoyle = (cx, cy, s) => {
        ctx.save(); ctx.translate(cx, cy);
        // Wings
        ctx.fillStyle = '#160012';
        ctx.beginPath(); ctx.moveTo(-s*5,-s*3); ctx.lineTo(-s*14,-s*10); ctx.lineTo(-s*12,s*2); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(s*5,-s*3); ctx.lineTo(s*14,-s*10); ctx.lineTo(s*12,s*2); ctx.closePath(); ctx.fill();
        // Body
        ctx.fillStyle = '#200018'; ctx.fillRect(-s*3,-s*7,s*6,s*10);
        // Head
        ctx.fillStyle = '#280020'; ctx.fillRect(-s*2.5,-s*12,s*5,s*6);
        // Horns
        ctx.fillStyle = '#0f0009';
        ctx.fillRect(-s*2.5,-s*15,s*1.5,s*4); ctx.fillRect(s*1,-s*15,s*1.5,s*4);
        // Glowing red eyes
        ctx.globalCompositeOperation = 'screen';
        const ep = 0.55 + Math.sin(time*2.2+cx*0.05)*0.45;
        ctx.fillStyle = `rgba(255,0,30,${ep})`;
        ctx.fillRect(-s*2,-s*10,s*1.5,s*1.5); ctx.fillRect(s*0.5,-s*10,s*1.5,s*1.5);
        // Eye bloom
        const eg = ctx.createRadialGradient(0,-s*10,0,0,-s*10,s*5);
        eg.addColorStop(0,`rgba(255,0,0,${ep*0.25})`); eg.addColorStop(1,'transparent');
        ctx.fillStyle=eg; ctx.beginPath(); ctx.arc(0,-s*10,s*5,0,Math.PI*2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        // Pedestal
        ctx.fillStyle = '#0c0008'; ctx.fillRect(-s*4,s*3,s*8,s*2.5);
        ctx.restore();
    };

    const drawDemon = (cx, cy, s) => {
        ctx.save(); ctx.translate(cx, cy);
        // Body
        ctx.fillStyle = '#280020'; ctx.fillRect(-s*2.5,-s*6,s*5,s*8);
        // Head
        ctx.fillStyle = '#340028'; ctx.fillRect(-s*2.5,-s*10.5,s*5,s*5);
        // Horns (curved)
        ctx.strokeStyle = '#150010'; ctx.lineWidth = s*1.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-s*2,-s*10); ctx.quadraticCurveTo(-s*4,-s*14,-s*2.5,-s*15); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s*2,-s*10); ctx.quadraticCurveTo(s*4,-s*14,s*2.5,-s*15); ctx.stroke();
        // Amber eyes
        ctx.globalCompositeOperation = 'screen';
        const ep = 0.5+Math.sin(time*1.8+cx*0.08)*0.5;
        ctx.fillStyle = `rgba(255,160,0,${ep})`;
        ctx.fillRect(-s*1.8,-s*8.5,s*1.2,s*1.2); ctx.fillRect(s*0.6,-s*8.5,s*1.2,s*1.2);
        ctx.globalCompositeOperation = 'source-over';
        // Tail
        ctx.strokeStyle='#1c0016'; ctx.lineWidth=s*1.2; ctx.lineCap='round';
        ctx.beginPath(); ctx.moveTo(s*2.5,0); ctx.quadraticCurveTo(s*5,s*2.5,s*4,s*6); ctx.stroke();
        ctx.restore();
    };

    const drawGhost = (cx, cy, s) => {
        const bob = Math.sin(time*1.6+cx*0.09)*s*1.5;
        ctx.save(); ctx.translate(cx, cy+bob);
        ctx.globalCompositeOperation = 'screen';
        const a = 0.35+Math.sin(time*1.9+cx*0.07)*0.12;
        const gb = ctx.createRadialGradient(0,-s*2,0,0,-s*2,s*6);
        gb.addColorStop(0,`rgba(200,230,255,${a})`); gb.addColorStop(0.5,`rgba(100,155,255,${a*0.5})`); gb.addColorStop(1,'transparent');
        ctx.fillStyle=gb; ctx.beginPath(); ctx.ellipse(0,-s*2,s*5.5,s*8,0,0,Math.PI*2); ctx.fill();
        // Eye sockets (dark holes)
        ctx.fillStyle=`rgba(0,0,50,${a*2.5})`;
        ctx.fillRect(-s*2,-s*4,s*1.5,s*1.5); ctx.fillRect(s*0.5,-s*4,s*1.5,s*1.5);
        // Wispy bottom
        ctx.strokeStyle=`rgba(160,205,255,${a*0.8})`; ctx.lineWidth=s*1.3; ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(-s*4.5,s*3.5); ctx.quadraticCurveTo(-s*2.5,s*7,0,s*3.5);
        ctx.quadraticCurveTo(s*2.5,s*7,s*4.5,s*3.5); ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
    };

    const drawSkull = (cx, cy, s) => {
        ctx.save(); ctx.translate(cx, cy);
        ctx.fillStyle = '#1e0018';
        ctx.beginPath(); ctx.arc(0,-s*2.5,s*3,0,Math.PI*2); ctx.fill();
        ctx.fillRect(-s*3,-s*2.5,s*6,s*3.5);
        ctx.globalCompositeOperation = 'screen';
        const ep = 0.35+Math.sin(time*2.8+cx*0.12)*0.35;
        ctx.fillStyle=`rgba(140,0,255,${ep})`;
        ctx.beginPath(); ctx.arc(-s*1.1,-s*2.8,s*0.9,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(s*1.1,-s*2.8,s*0.9,0,Math.PI*2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
    };

    // Crowd rows: y from top(tiny) to bottom(large), scale grows, spacing grows
    const crowdRows = [
        { y:  5, s:0.55, sp:  8, types:[3,3,2,3] },
        { y: 13, s:0.60, sp:  9, types:[3,2,3,3] },
        { y: 22, s:0.65, sp: 10, types:[3,3,1,3] },
        { y: 31, s:0.70, sp: 11, types:[2,3,3,1] },
        { y: 41, s:0.80, sp: 12, types:[3,1,2,3] },
        { y: 52, s:0.90, sp: 14, types:[1,3,2,1] },
        { y: 64, s:1.00, sp: 16, types:[2,1,3,2] },
        { y: 78, s:1.10, sp: 18, types:[1,2,1,3] },
        { y: 93, s:1.25, sp: 22, types:[0,1,2,1,0] },
        { y:111, s:1.40, sp: 26, types:[0,2,0,1,2] },
        { y:132, s:1.65, sp: 32, types:[0,1,0,2,0] },
        { y:156, s:1.90, sp: 38, types:[0,2,1,0,2] },
        { y:182, s:2.20, sp: 46, types:[0,1,0,1,0] },
    ];

    const drawFns = [drawGargoyle, drawDemon, drawGhost, drawSkull];

    // Central Gargoyle removed.

    // ═══════════════════════════════════════════════
    // LAYER 4.2: ROAD EDGE BORDERS & TORCH DECORATIONS
    // ═══════════════════════════════════════════════

    // --- Hellfire Torches along the stem edges ---
    const drawTorch = (tx, ty) => {
        const flame = time * 3.2 + tx * 0.08;
        const flicker = Math.sin(flame) * 0.25 + Math.cos(flame * 1.7) * 0.15;

        ctx.save();
        ctx.translate(tx, ty);

        // Stone bracket base
        ctx.fillStyle = '#150008';
        ctx.fillRect(-3, -16, 6, 14);
        ctx.fillStyle = '#220010';
        ctx.fillRect(-4, -3, 8, 4);

        // Torch bowl (iron ring)
        ctx.strokeStyle = '#1c0010';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -16, 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#0a0005';
        ctx.fill();

        // Flame glow bloom
        ctx.globalCompositeOperation = 'screen';
        const bloom = ctx.createRadialGradient(0, -22, 0, 0, -22, 22 + flicker * 6);
        bloom.addColorStop(0,   `rgba(255, 120, 0, ${0.55 + flicker * 0.2})`);
        bloom.addColorStop(0.4, `rgba(220, 40, 0, ${0.20 + flicker * 0.1})`);
        bloom.addColorStop(1,   'transparent');
        ctx.fillStyle = bloom;
        ctx.beginPath(); ctx.ellipse(0, -22, 18, 24, 0, 0, Math.PI * 2); ctx.fill();

        // Flame shape (teardrop)
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.bezierCurveTo(
            5 + flicker * 3,  -20,
            4 + flicker * 2,  -32 - flicker * 4,
            flicker * 2,      -38 - flicker * 5
        );
        ctx.bezierCurveTo(
            -4 + flicker * 2, -32 - flicker * 4,
            -5 + flicker,     -20,
            0,                -14
        );
        const fg = ctx.createLinearGradient(0, -14, 0, -38);
        fg.addColorStop(0,   `rgba(255, 200, 60, 0.95)`);
        fg.addColorStop(0.4, `rgba(255, 80, 0, 0.85)`);
        fg.addColorStop(1,   `rgba(200, 10, 0, 0.3)`);
        ctx.fillStyle = fg;
        ctx.fill();

        // Inner bright core
        ctx.beginPath();
        ctx.ellipse(flicker, -22, 2.5, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 240, 180, 0.9)`;
        ctx.fill();

        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
    };

    // Torch positions — left edge (roadX) and right edge (roadX+roadWidth) along stem
    const torchYPositions = [
        MERGE_Y + (H - MERGE_Y) * 0.08,
        MERGE_Y + (H - MERGE_Y) * 0.25,
        MERGE_Y + (H - MERGE_Y) * 0.44,
        MERGE_Y + (H - MERGE_Y) * 0.63,
        MERGE_Y + (H - MERGE_Y) * 0.82,
    ];
    torchYPositions.forEach(ty => {
        drawTorch(roadX,             ty);
        drawTorch(roadX + roadWidth, ty);
    });

    // Y-arm outer-edge torches removed (Y-shape gone).
    // T-bar edge torches (top + bottom of bar, flanking stem)
    const _torchBarH = 220;
    const _torchBarTopY = MERGE_Y * 0.1;
    const _torchBarBotY = _torchBarTopY + _torchBarH;
    [W * 0.08, W * 0.20, W * 0.32, W * 0.68, W * 0.80, W * 0.92].forEach(tx => {
        drawTorch(tx, _torchBarBotY);
    });


    ctx.restore();
}

/**
 * Global Shadow drawing function for units and enemies.
 */
function drawShadow(lx, ly, size = 10) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(lx, ly + 25, size, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

window.getRoadWidth = getRoadWidth;
window.getRoadX = getRoadX;
window.drawLavaRoad = drawLavaRoad;
window.drawShadow = drawShadow;

