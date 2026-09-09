/* world_portal.js — Hell Portal: Gothic Cathedral Edition (pixel art).
 *
 * Layout (bottom-center of canvas):
 *   - Two carved stone pillars (demon skull cap, banded stone, glowing runes, chains)
 *   - Gothic arch beam with crenellated crown + dripping lava
 *   - Central pentagram keystone with glowing eye
 *   - Pointed gothic void with stepped pixel curve
 *   - Hellfire arch edge (gradient hot→cool outward)
 *   - Floating soul skulls + spinning energy ring inside void
 *   - Corruption column rising above when portalEnergy > 0
 */
function drawPortal() {
    if (window._portalPixiInstalled) return; // handled by portal_pixi.js
    window._legacyCanvasDirty = true;
    const L_W  = window.LOGICAL_WIDTH  || 1080;
    const L_H  = window.LOGICAL_HEIGHT || 1440;
    const roadW = (typeof getRoadWidth === 'function') ? getRoadWidth() : 342;
    const roadX = (typeof getRoadX    === 'function') ? getRoadX()    : (L_W - roadW) / 2;
    const CX = L_W / 2, CY = L_H;
    const time  = window.globalAnimTimer || 0;
    const pulse = (Math.sin(time * 2.5) + 1) / 2;
    const flick = (Math.sin(time * 7.3) + Math.sin(time * 11.7)) * 0.25 + 0.5;
    const pEnergy = window.portalEnergy || 0;
    const eRatio  = pEnergy / (window.maxPortalEnergy || 1500);

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // ── Grid + helpers ─────────────────────────────────────────
    const BS = 6;
    const bk = (lx, ly, bw, bh, c) => {
        ctx.fillStyle = c;
        ctx.fillRect(Math.floor(lx), Math.floor(ly), bw * BS, bh * BS);
    };
    const px = (lx, ly, c) => {
        ctx.fillStyle = c;
        ctx.fillRect(Math.floor(lx), Math.floor(ly), BS, BS);
    };

    // Palettes
    const S = ['#050302','#0e0706','#1a0e08','#28160c','#3a2014','#502c1e','#6a4028','#8a5a3a'];
    //          deepest                                                    rim-light
    const F = ['#180000','#3a0200','#6c0a00','#a01400','#d63000','#ff5500','#ff9933','#ffd866','#fff2c4'];
    //          ember     glow      coal      lava     ember     flame      bright    hot       white-hot
    const B = ['#2a2418','#6e604a','#bba886','#e8d8b0','#fff5d8']; // bone
    const V = ['#000000','#0a0008','#1a0010','#3a0028']; // void

    // ── Layout ─────────────────────────────────────────────────
    const PW = 9;
    const PH = 22;
    const AH = 7;
    const RH_void = Math.round((roadW - 2 * PW * BS) / 2 / BS);

    const lPillarX  = roadX;
    const rPillarX  = roadX + roadW - PW * BS;
    const pillarTopY = CY - PH * BS;
    const archTopY   = pillarTopY - AH * BS;
    const archLX     = lPillarX - BS;
    const archTW     = Math.round(roadW / BS) + 2;

    // ── 1. AMBIENT HELLFIRE BLOOM ──────────────────────────────
    ctx.globalCompositeOperation = 'screen';
    const bG = ctx.createRadialGradient(CX, CY - PH * BS * 0.35, 0, CX, CY - PH * BS * 0.35, (RH_void + PW + 18) * BS);
    bG.addColorStop(0,   `rgba(220,30,0,${0.42 + eRatio * 0.30 + pulse * 0.12})`);
    bG.addColorStop(0.35,`rgba(140,12,0,${0.22 + pulse * 0.08})`);
    bG.addColorStop(0.7, 'rgba(60,4,0,0.10)');
    bG.addColorStop(1,   'transparent');
    ctx.fillStyle = bG;
    ctx.beginPath();
    ctx.ellipse(CX, CY - PH * BS * 0.35, (RH_void + PW + 18) * BS, (RH_void + PW + 10) * BS * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // ── 2. GROUND CRACK FIRE LINES (radiating from base) ──────
    ctx.globalCompositeOperation = 'screen';
    for (let cr = 0; cr < 9; cr++) {
        const ang = -Math.PI / 2 + (cr - 4) * 0.22;
        const len = (40 + (cr * 13) % 22) * BS;
        const seg = Math.floor(len / BS);
        for (let s = 0; s < seg; s++) {
            const fr  = s * BS;
            const jit = Math.sin(s * 1.3 + cr) * 0.5;
            const fx  = CX + Math.cos(ang + jit * 0.1) * fr;
            const fy  = CY + Math.sin(ang + jit * 0.1) * fr * 0.35;
            const t   = s / seg;
            const a   = (1 - t) * (0.5 + flick * 0.35);
            ctx.globalAlpha = a;
            ctx.fillStyle = t < 0.2 ? F[8] : t < 0.4 ? F[7] : t < 0.65 ? F[5] : F[3];
            ctx.fillRect(Math.floor(fx / BS) * BS, Math.floor(fy / BS) * BS, BS, BS);
        }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // ── 3. PILLAR DRAWER ───────────────────────────────────────
    const drawPillar = (plx, mirror) => {
        // 3a. Drop shadow
        ctx.globalAlpha = 0.55;
        bk(plx + BS, pillarTopY + BS * 2, PW, PH, S[0]);
        ctx.globalAlpha = 1;

        // 3b. Stone body — banded with mortar lines
        for (let band = 0; band < PH; band++) {
            const by   = pillarTopY + band * BS;
            const mort = band % 4 === 3;
            const base = band < 3 ? S[3] : mort ? S[0] : (band % 2 === 0 ? S[1] : S[2]);
            bk(plx, by, PW, 1, base);
        }
        // Vertical rim highlight + occlusion
        for (let band = 0; band < PH; band++) {
            px(plx + (mirror ? (PW - 1) * BS : 0), pillarTopY + band * BS, band % 5 === 0 ? S[6] : S[4]);
            px(plx + (mirror ? 0 : (PW - 1) * BS), pillarTopY + band * BS, S[0]);
            px(plx + (mirror ? BS : (PW - 2) * BS), pillarTopY + band * BS, S[1]);
        }

        // 3c. Demon skull cap (top of pillar)
        const skullY = pillarTopY - BS * 5;
        const skullX = plx + (PW / 2 - 3) * BS;
        // Skull silhouette (6x5 art-pixels)
        bk(skullX,           skullY,           6, 4, B[0]);
        bk(skullX + BS,      skullY - BS,      4, 1, B[0]);  // cranium top
        bk(skullX,           skullY + 4 * BS,  6, 1, B[0]);  // jaw line
        // Mid-tone fill
        bk(skullX + BS,      skullY,           4, 3, B[1]);
        // Highlights
        bk(skullX + BS,      skullY - BS,      3, 1, B[2]);
        bk(skullX + BS,      skullY,           1, 2, B[3]);
        px(skullX + BS,      skullY - BS,      B[4]);
        // Eye sockets (glowing red)
        const skullEye = 0.55 + flick * 0.45;
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(255,40,30,${skullEye})`;
        ctx.fillRect(skullX + BS, skullY + BS, BS, 2 * BS);
        ctx.fillRect(skullX + 4 * BS, skullY + BS, BS, 2 * BS);
        // Eye after-glow
        ctx.fillStyle = `rgba(255,80,40,${skullEye * 0.5})`;
        ctx.fillRect(skullX, skullY, 2 * BS, 3 * BS);
        ctx.fillRect(skullX + 4 * BS, skullY, 2 * BS, 3 * BS);
        ctx.globalCompositeOperation = 'source-over';
        // Teeth
        for (let tk = 0; tk < 4; tk++) {
            px(skullX + (tk + 1) * BS, skullY + 4 * BS, B[2]);
        }
        // Crack on cranium
        px(skullX + 3 * BS, skullY - BS, B[0]);
        px(skullX + 3 * BS, skullY, B[0]);

        // 3d. Cap base (wider beam)
        bk(plx - 2 * BS, pillarTopY - BS, PW + 4, 1, S[5]);
        bk(plx - 3 * BS, pillarTopY,      PW + 6, 1, S[2]);
        bk(plx - 3 * BS, pillarTopY,      1, 1, S[7]);   // hot corner
        bk(plx + (PW + 2) * BS, pillarTopY, 1, 1, S[0]);

        // 3e. Glowing runes (4 rows)
        const drawRune = (ry) => {
            const rx    = plx + 3 * BS;
            const runeY = pillarTopY + ry * BS;
            const ra    = 0.45 + pulse * 0.45;
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = `rgba(255,30,30,${ra})`;
            ctx.fillRect(rx,      runeY,         BS,     4 * BS);
            ctx.fillRect(rx - BS, runeY + BS,    3 * BS, BS);
            ctx.fillRect(rx - BS, runeY + 3 * BS,3 * BS, BS);
            // Inner hot
            ctx.fillStyle = `rgba(255,180,120,${ra * 0.8})`;
            ctx.fillRect(rx, runeY + BS, BS, BS);
            ctx.fillRect(rx, runeY + 3 * BS, BS, BS);
            // Bloom
            ctx.fillStyle = `rgba(255,60,0,${ra * 0.18})`;
            ctx.fillRect(rx - 3 * BS, runeY - BS, 7 * BS, 7 * BS);
            ctx.globalCompositeOperation = 'source-over';
        };
        drawRune(6); drawRune(12); drawRune(18);

        // 3f. Chain links
        ctx.fillStyle = S[0];
        for (let ci = 0; ci < 8; ci++) {
            const cx_ = plx + (mirror ? 1 : 6) * BS;
            const cy_ = pillarTopY + 1 * BS + ci * BS * 3;
            ctx.fillRect(cx_,        cy_,           BS, BS);
            ctx.fillRect(cx_ - BS,   cy_ + BS,      BS, BS);
            ctx.fillRect(cx_ + BS,   cy_ + BS,      BS, BS);
            ctx.fillRect(cx_,        cy_ + 2 * BS,  BS, BS);
            // Chain highlight
            ctx.fillStyle = S[3];
            ctx.fillRect(cx_, cy_, BS, 1);
            ctx.fillStyle = S[0];
        }

        // 3g. Base scorch
        ctx.globalCompositeOperation = 'screen';
        for (let sc = 0; sc < 10; sc++) {
            const a = (1 - sc / 10) * (0.40 + pulse * 0.22);
            ctx.globalAlpha = a;
            ctx.fillStyle = sc < 3 ? F[8] : sc < 6 ? F[6] : sc < 8 ? F[5] : F[3];
            ctx.fillRect(plx, CY - (sc + 1) * BS, PW * BS, BS);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
    };
    drawPillar(lPillarX, false);
    drawPillar(rPillarX, true);

    // ── 4. STONE ARCH BEAM ─────────────────────────────────────
    for (let ax = 0; ax < archTW; ax++) {
        for (let ay = 0; ay < AH; ay++) {
            const mort = (ax % 6 === 5) || (ay === 3);
            const col = ay === 0 ? S[5] : ay === AH - 1 ? S[0] : mort ? S[0] : (ax % 3 === 0 ? S[1] : S[2]);
            bk(archLX + ax * BS, archTopY + ay * BS, 1, 1, col);
        }
        // Top-edge rim light
        px(archLX + ax * BS, archTopY, ax % 4 === 0 ? S[7] : S[6]);
    }

    // ── 5. CRENELLATIONS (merlons crown) ───────────────────────
    const MW = 4, MG = 3, MH = 5;
    for (let mx = 0; mx < archTW; mx += MW + MG) {
        for (let mrow = 0; mrow < MH; mrow++) {
            for (let mc = 0; mc < MW; mc++) {
                const col = mc === 0 ? S[6] : mc === MW - 1 ? S[0] : mrow === 0 ? S[5] : mrow === MH - 1 ? S[1] : S[3];
                bk(archLX + (mx + mc) * BS, archTopY - (MH - mrow) * BS, 1, 1, col);
            }
        }
        // Spike on top of every other merlon
        if ((mx / (MW + MG)) % 2 === 0) {
            bk(archLX + (mx + 1) * BS, archTopY - (MH + 2) * BS, 2, 2, S[1]);
            px(archLX + (mx + 1) * BS, archTopY - (MH + 2) * BS, S[6]);
        }
    }

    // ── 6. KEYSTONE w/ PENTAGRAM SIGIL + GLOWING EYE ───────────
    const KW = 13, KX = Math.floor(CX / BS) * BS - (KW / 2) * BS;
    const KH = AH + 3;
    const KY = archTopY - BS;
    // Stone block
    for (let ky = 0; ky < KH; ky++) {
        for (let kx = 0; kx < KW; kx++) {
            const edge  = kx === 0 || kx === KW - 1;
            const top   = ky === 0;
            const bot   = ky === KH - 1;
            const col   = edge ? S[0] : top ? S[5] : bot ? S[0] : ((kx + ky) % 5 === 0 ? S[3] : S[2]);
            bk(KX + kx * BS, KY + ky * BS, 1, 1, col);
        }
    }
    // Keystone rim light
    bk(KX + BS, KY, KW - 2, 1, S[6]);
    px(KX + BS, KY, S[7]);

    // Pentagram sigil + glowing eye
    ctx.globalCompositeOperation = 'screen';
    const sigA = 0.55 + pulse * 0.45;
    const sigCX = KX + (KW / 2) * BS;
    const sigCY = KY + (KH / 2) * BS + BS;
    // Pentagram star (5-point, pixel-traced)
    const pentR = 4 * BS;
    const drawLinePx = (x0, y0, x1, y1, col) => {
        const dx = x1 - x0, dy = y1 - y0;
        const steps = Math.max(Math.abs(dx), Math.abs(dy));
        ctx.fillStyle = col;
        for (let s = 0; s <= steps; s += BS / 2) {
            const t = s / steps;
            ctx.fillRect(Math.floor((x0 + dx * t) / BS) * BS, Math.floor((y0 + dy * t) / BS) * BS, BS, BS);
        }
    };
    const pts = [];
    for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
        pts.push([sigCX + Math.cos(a) * pentR, sigCY + Math.sin(a) * pentR]);
    }
    const order = [0, 2, 4, 1, 3, 0];
    for (let i = 0; i < 5; i++) {
        const [x0, y0] = pts[order[i]];
        const [x1, y1] = pts[order[i + 1]];
        drawLinePx(x0, y0, x1, y1, `rgba(255,30,30,${sigA})`);
    }
    // Center glowing eye
    ctx.fillStyle = `rgba(255,200,80,${sigA})`;
    ctx.fillRect(Math.floor(sigCX / BS) * BS - BS, Math.floor(sigCY / BS) * BS, 2 * BS, BS);
    ctx.fillStyle = `rgba(255,80,0,${sigA})`;
    ctx.fillRect(Math.floor(sigCX / BS) * BS, Math.floor(sigCY / BS) * BS, BS, BS);
    // Bloom
    ctx.fillStyle = `rgba(255,0,0,${sigA * 0.15})`;
    ctx.fillRect(sigCX - 5 * BS, sigCY - 5 * BS, 11 * BS, 11 * BS);
    ctx.globalCompositeOperation = 'source-over';

    // ── 7. LAVA DRIPS from arch underside ──────────────────────
    ctx.globalCompositeOperation = 'screen';
    for (let dr = 0; dr < 7; dr++) {
        const dxPx  = archLX + (4 + dr * 8) * BS;
        const phase = ((time * 0.8 + dr * 0.27) % 1);
        const dyPx  = archTopY + AH * BS + phase * 8 * BS;
        const a     = (1 - phase) * 0.85;
        ctx.globalAlpha = a;
        ctx.fillStyle = phase < 0.4 ? F[8] : phase < 0.7 ? F[7] : F[5];
        // Drip body
        ctx.fillRect(dxPx, archTopY + AH * BS, BS, dyPx - (archTopY + AH * BS));
        // Drop head
        ctx.fillRect(dxPx - BS, dyPx, 3 * BS, BS);
        ctx.fillRect(dxPx, dyPx + BS, BS, BS);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // ── 8. POINTED GOTHIC VOID ─────────────────────────────────
    const voidBaseY = archTopY + AH * BS;
    const totalRows = Math.ceil((CY - voidBaseY) / BS);
    const CURVE_ROWS = 22;
    const curveHW = (row) => {
        if (row >= CURVE_ROWS) return RH_void;
        const t = row / CURVE_ROWS;
        // Smoother gothic curve: blend of t^1.4 and t^2 → less aggressive point
        return Math.floor(RH_void * (t * t * 0.6 + t * 0.4));
    };
    for (let row = 0; row < totalRows; row++) {
        const ry = voidBaseY + row * BS;
        const hw = curveHW(row);
        if (hw <= 0) continue;
        // Layered void: deep core, mid, outer
        const layerCol = row < 4 ? V[0] : row < CURVE_ROWS * 0.5 ? V[0] : V[0];
        ctx.fillStyle = layerCol;
        ctx.fillRect(Math.floor(CX - hw * BS), ry, hw * 2 * BS, BS);
    }

    // ── 9. HELLFIRE ARCH EDGE ──────────────────────────────────
    ctx.globalCompositeOperation = 'screen';
    for (let row = 0; row < CURVE_ROWS + 14; row++) {
        const hw = row < CURVE_ROWS ? curveHW(row) : RH_void;
        if (hw <= 0) continue;
        const ry = voidBaseY + row * BS;
        const heat = 1 - row / (CURVE_ROWS + 14);
        const a = (0.62 + pulse * 0.35) * heat;
        const fc = row < 3 ? F[8] : row < 7 ? F[7] : row < 14 ? F[6] : F[4];
        ctx.globalAlpha = a;
        ctx.fillStyle = fc;
        ctx.fillRect(Math.floor((CX - hw * BS) / BS) * BS - 2 * BS, ry, 2 * BS, BS);
        ctx.fillRect(Math.floor((CX + hw * BS) / BS) * BS,           ry, 2 * BS, BS);
        ctx.fillStyle = F[8];
        ctx.fillRect(Math.floor((CX - hw * BS) / BS) * BS - BS, ry, BS, BS);
        ctx.fillRect(Math.floor((CX + hw * BS) / BS) * BS,       ry, BS, BS);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // ── 10. VOID DEPTH GLOW ────────────────────────────────────
    const vG = ctx.createRadialGradient(CX, CY, 0, CX, CY, RH_void * BS * 0.9);
    vG.addColorStop(0,   `rgba(110,0,10,${0.42 + eRatio * 0.30 + pulse * 0.10})`);
    vG.addColorStop(0.5, 'rgba(50,0,10,0.20)');
    vG.addColorStop(1,   'transparent');
    ctx.fillStyle = vG;
    ctx.beginPath(); ctx.ellipse(CX, CY, RH_void * BS * 0.9, RH_void * BS * 0.55, 0, 0, Math.PI * 2); ctx.fill();

    // ── 11. SPINNING ENERGY RING INSIDE VOID ───────────────────
    ctx.globalCompositeOperation = 'screen';
    const ringR = RH_void * BS * 0.55;
    const ringCY = CY - PH * BS * 0.35;
    for (let rg = 0; rg < 18; rg++) {
        const ang = (rg / 18) * Math.PI * 2 + time * 1.6;
        const rx  = CX + Math.cos(ang) * ringR;
        const ry  = ringCY + Math.sin(ang) * ringR * 0.42;
        const a   = (Math.sin(ang * 2 + time * 3) + 1) / 2;
        ctx.fillStyle = `rgba(255,${40 + Math.floor(a * 80)},${20 + Math.floor(a * 60)},${0.5 + a * 0.4})`;
        ctx.fillRect(Math.floor(rx / BS) * BS, Math.floor(ry / BS) * BS, BS, BS);
        // Inner ring (counter-spin)
        const ang2 = -ang * 1.3 + time * 0.9;
        const rx2  = CX + Math.cos(ang2) * ringR * 0.55;
        const ry2  = ringCY + Math.sin(ang2) * ringR * 0.55 * 0.42;
        ctx.fillStyle = `rgba(180,40,${100 + Math.floor(a * 100)},${0.45 + a * 0.35})`;
        ctx.fillRect(Math.floor(rx2 / BS) * BS, Math.floor(ry2 / BS) * BS, BS, BS);
    }
    ctx.globalCompositeOperation = 'source-over';

    // ── 12. FLOATING SOUL SKULLS inside void ───────────────────
    for (let sk = 0; sk < 4; sk++) {
        const phase = ((time * 0.35 + sk * 0.27) % 1);
        const sx = CX + Math.sin(time * 0.7 + sk * 1.9) * RH_void * BS * 0.4;
        const sy = CY - PH * BS * 0.10 - phase * PH * BS * 0.55;
        const a  = Math.sin(phase * Math.PI) * 0.7;
        if (a < 0.05) continue;
        ctx.globalAlpha = a;
        // Mini skull (3x3)
        ctx.fillStyle = B[0];
        ctx.fillRect(Math.floor(sx / BS) * BS - BS, Math.floor(sy / BS) * BS - BS, 3 * BS, 2 * BS);
        ctx.fillRect(Math.floor(sx / BS) * BS,      Math.floor(sy / BS) * BS + BS, BS,     BS);
        ctx.fillStyle = B[1];
        ctx.fillRect(Math.floor(sx / BS) * BS,      Math.floor(sy / BS) * BS - BS, BS,     BS);
        // Eye glow
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(255,40,40,${a})`;
        ctx.fillRect(Math.floor(sx / BS) * BS - BS, Math.floor(sy / BS) * BS, BS, BS);
        ctx.fillRect(Math.floor(sx / BS) * BS + BS, Math.floor(sy / BS) * BS, BS, BS);
        ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = 1;

    // ── 13. SOUL PIXELS rushing into void ──────────────────────
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 18; i++) {
        const prog = ((time * 0.95 + i * 0.19) % 1);
        const ang  = ((i / 9) * Math.PI) + Math.PI + Math.sin(time * 0.6 + i) * 0.35;
        const startR = RH_void * BS * 0.85;
        const sx = Math.floor((CX + Math.cos(ang) * startR * (1 - prog)) / BS) * BS;
        const sy = Math.floor((CY - PH * BS * 0.20 + Math.sin(ang) * startR * 0.5 * (1 - prog)) / BS) * BS;
        const a = (1 - prog) * 0.9;
        ctx.globalAlpha = a;
        ctx.fillStyle = prog < 0.4 ? F[8] : prog < 0.7 ? F[6] : F[4];
        ctx.fillRect(sx, sy, BS, BS);
        if (prog < 0.25) {
            ctx.fillStyle = F[7];
            ctx.globalAlpha = a * 0.4;
            ctx.fillRect(sx - BS, sy - BS, 3 * BS, 3 * BS);
        }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // ── 14. OUTER RUBBLE BLOCKS ────────────────────────────────
    const drawRubble = (bx, by, bw, bh, col) => bk(bx * BS + lPillarX - BS * 6, CY + by * BS, bw, bh, col);
    [[-4,0,3,2],[-5,-3,2,3],[-3,-1,4,2],[-7,-2,2,2]].forEach(([dx,dy,dw,dh],i) => {
        drawRubble(dx, dy, dw, dh, i % 2 === 0 ? S[1] : S[0]);
        if (i === 0) drawRubble(dx, dy, dw, 1, S[3]); // rim light
    });
    const drawRubbleR = (bx, by, bw, bh, col) => bk(rPillarX + PW * BS + bx * BS, CY + by * BS, bw, bh, col);
    [[1,0,3,2],[0,-3,2,3],[2,-1,4,2],[4,-2,2,2]].forEach(([dx,dy,dw,dh],i) => {
        drawRubbleR(dx, dy, dw, dh, i % 2 === 0 ? S[1] : S[0]);
        if (i === 0) drawRubbleR(dx, dy, dw, 1, S[3]);
    });

    // ── 15. CORRUPTION COLUMN (above arch when charged) ────────
    if (eRatio > 0.02) {
        const colH     = Math.floor(280 * eRatio);
        const colCX    = CX;
        const colBaseY = archTopY - MH * BS - 2 * BS;

        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // Core column (base wide → thin tip)
        for (let py = 0; py < colH; py += BS) {
            const t   = py / colH;
            const w   = Math.max(BS, Math.round((1 - t * 0.78) * 16) * BS);
            const a   = (1 - t) * eRatio * (0.55 + pulse * 0.20);
            const fk  = Math.sin(time * 4.0 + py * 0.07) * 0.10;
            ctx.globalAlpha = Math.max(0, a + fk);
            const r = Math.round(200 - t * 140);
            const g = 0;
            const b = Math.round(40 + t * 180);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(Math.floor((colCX - w / 2) / BS) * BS, colBaseY - py, w, BS);
        }

        // Fast wisps
        const wispCount = Math.floor(8 + eRatio * 14);
        for (let wi = 0; wi < wispCount; wi++) {
            const prog  = ((time * (0.6 + wi * 0.07) + wi * 0.31) % 1);
            const wpy   = colBaseY - prog * colH * 0.95;
            const wobble = Math.sin(time * 2.2 + wi * 1.3) * (10 + (1 - prog) * 16);
            const wx    = Math.floor((colCX + wobble) / BS) * BS;
            const wy    = Math.floor(wpy / BS) * BS;
            const wa    = (1 - prog) * eRatio * (0.7 + pulse * 0.25);
            ctx.globalAlpha = Math.max(0, wa);
            ctx.fillStyle = prog < 0.35 ? '#ff3300' : prog < 0.65 ? '#cc00ee' : '#7700ff';
            ctx.fillRect(wx, wy, BS, BS);
            ctx.globalAlpha = Math.max(0, wa * 0.3);
            ctx.fillRect(wx - BS, wy - BS, 3 * BS, 3 * BS);
        }

        // Outer soft glow
        ctx.globalAlpha = eRatio * 0.20;
        const glowW = Math.round(RH_void * BS * 0.6);
        const gCol  = ctx.createLinearGradient(colCX, colBaseY, colCX, colBaseY - colH);
        gCol.addColorStop(0,   'rgba(200,0,60,0.9)');
        gCol.addColorStop(0.4, 'rgba(140,0,180,0.6)');
        gCol.addColorStop(1,   'rgba(50,0,140,0)');
        ctx.fillStyle = gCol;
        ctx.fillRect(colCX - glowW, colBaseY - colH, glowW * 2, colH);

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
    }

    ctx.restore();
}

window.drawPortal = drawPortal;
window.drawAtmosphericEffects = () => {};
