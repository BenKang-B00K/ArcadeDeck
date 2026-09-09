/* world_gate.js — Pixel-art Hell Gate. Top-down summoning portals at road arms.
 *
 * Redesigned to match world_portal's craft language:
 *   - Strict BS=6 block grid (no anti-aliased ellipse/arc for art)
 *   - Shared S/F/B/V palette stacks (cohesion with main hell portal)
 *   - Dense layered hellfire composition:
 *       1. Ambient bloom         8. Void depth glow
 *       2. Ground crack fire     9. Counter-spinning energy rings
 *       3. Stone rim (banded)   10. Pentagram sigil + glowing eye
 *       4. Crenellation merlons 11. Block-grid demon skulls (8 cardinal)
 *       5. Chain drapes         12. Emerging horned demon head
 *       6. Inner void disk      13. Soul pixels rushing center
 *       7. Hellfire void edge   14. Floating mini soul skulls
 *
 * Signature preserved (cx, cy, R, time) — spawning_gates_pixi.js bake unchanged.
 */

const _GATE_BS = 6;

// Palettes — identical stacks to world_portal.js for visual cohesion.
const _GATE_S = ['#050302','#0e0706','#1a0e08','#28160c','#3a2014','#502c1e','#6a4028','#8a5a3a'];
const _GATE_F = ['#180000','#3a0200','#6c0a00','#a01400','#d63000','#ff5500','#ff9933','#ffd866','#fff2c4'];
const _GATE_B = ['#2a2418','#6e604a','#bba886','#e8d8b0','#fff5d8'];
const _GATE_V = ['#000000','#0a0008','#1a0010','#3a0028'];

/** Block-grid demon skull (Portal style). x,y = top-left pixel of 4×4 block silhouette. */
function _gate_drawSkull(x, y, eyeFlick) {
    const BS = _GATE_BS;
    const B  = _GATE_B;
    const sn = (n) => Math.floor(n / BS) * BS;
    const px0 = sn(x), py0 = sn(y);
    // Silhouette 4×3 + jaw line
    ctx.fillStyle = B[0];
    ctx.fillRect(px0,         py0,           4 * BS, 3 * BS);
    ctx.fillRect(px0,         py0 + 3 * BS,  4 * BS, BS);
    // Mid-tone fill
    ctx.fillStyle = B[1];
    ctx.fillRect(px0 + BS,    py0,           2 * BS, 2 * BS);
    // Cranium highlight
    ctx.fillStyle = B[2];
    ctx.fillRect(px0 + BS,    py0,           BS,     BS);
    ctx.fillStyle = B[4];
    ctx.fillRect(px0 + BS,    py0,           BS,     1);
    // Glowing eye sockets
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `rgba(255,40,30,${eyeFlick})`;
    ctx.fillRect(px0,         py0 + BS,      BS,     BS);
    ctx.fillRect(px0 + 3 * BS,py0 + BS,      BS,     BS);
    ctx.fillStyle = `rgba(255,80,40,${eyeFlick * 0.5})`;
    ctx.fillRect(px0 - BS,    py0,           2 * BS, 2 * BS);
    ctx.fillRect(px0 + 3 * BS,py0,           2 * BS, 2 * BS);
    ctx.globalCompositeOperation = 'source-over';
    // Teeth
    ctx.fillStyle = B[2];
    ctx.fillRect(px0 + BS,        py0 + 3 * BS, BS, BS);
    ctx.fillRect(px0 + 2 * BS,    py0 + 3 * BS, BS, BS);
    // Crack on cranium
    ctx.fillStyle = B[0];
    ctx.fillRect(px0 + 2 * BS,    py0,           BS, BS);
}

/**
 * Pixel-art Hell Gate summoning portal at (cx, cy). R = outer radius.
 * Top-down isometric view (Y-squash PY=0.42). All art snapped to BS=6 grid.
 */
function _drawSummoningCircle(cx, cy, R, time) {
    const BS = _GATE_BS;
    const S = _GATE_S, F = _GATE_F, B = _GATE_B, V = _GATE_V;
    const PY = 0.42;
    const pulse = (Math.sin(time * 2.5) + 1) / 2;
    const flick = (Math.sin(time * 7.3) + Math.sin(time * 11.7)) * 0.25 + 0.5;

    const sn = (n) => Math.floor(n / BS) * BS;
    const px = (lx, ly, c) => { ctx.fillStyle = c; ctx.fillRect(sn(lx), sn(ly), BS, BS); };
    const bk = (lx, ly, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(sn(lx), sn(ly), w * BS, h * BS); };

    ctx.save();
    ctx.translate(sn(cx), sn(cy));
    ctx.imageSmoothingEnabled = false;

    // ── 1. AMBIENT HELLFIRE BLOOM ──────────────────────────────
    ctx.globalCompositeOperation = 'screen';
    const bG = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.55);
    bG.addColorStop(0,    `rgba(220,30,0,${0.42 + pulse * 0.20})`);
    bG.addColorStop(0.35, `rgba(140,12,0,${0.22 + pulse * 0.08})`);
    bG.addColorStop(0.7,  'rgba(60,4,0,0.10)');
    bG.addColorStop(1,    'transparent');
    ctx.fillStyle = bG;
    ctx.beginPath();
    ctx.ellipse(0, 0, R * 1.55, R * 1.55 * PY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // ── 2. GROUND CRACK FIRE LINES (radiating from rim) ───────
    ctx.globalCompositeOperation = 'screen';
    for (let cr = 0; cr < 14; cr++) {
        const ang = (cr / 14) * Math.PI * 2;
        const startBlk = Math.floor(R / BS) + 1;
        const segs     = startBlk + Math.floor(R * 0.5 / BS);
        for (let s = startBlk; s < segs; s++) {
            const fr  = s * BS;
            const jit = Math.sin(s * 1.3 + cr) * 0.5;
            const fx  = Math.cos(ang + jit * 0.05) * fr;
            const fy  = Math.sin(ang + jit * 0.05) * fr * PY;
            const t   = (s - startBlk) / (segs - startBlk);
            const a   = (1 - t) * (0.5 + flick * 0.35);
            ctx.globalAlpha = a;
            ctx.fillStyle = t < 0.2 ? F[8] : t < 0.4 ? F[7] : t < 0.65 ? F[5] : F[3];
            ctx.fillRect(sn(fx), sn(fy), BS, BS);
        }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // ── 3. STONE RIM RING (pixel-stepped, banded, lit upper-left) ──
    const rimROuter = R;
    const rimRInner = R - 4 * BS;
    const LIT_DIR   = -Math.PI * 3 / 4;
    for (let by = -rimROuter; by <= rimROuter; by += BS) {
        for (let bx = -rimROuter; bx <= rimROuter; bx += BS) {
            // Un-squash Y for true radial distance (top-down isometric)
            const ny = by / PY;
            const d  = Math.sqrt(bx * bx + ny * ny);
            if (d > rimROuter || d < rimRInner) continue;
            const ang  = Math.atan2(ny, bx);
            const lit  = Math.cos(ang - LIT_DIR);
            const band = Math.floor((rimROuter - d) / BS);
            const mort = band === 1 || band === 3;  // mortar lines
            let col;
            if (lit > 0.5)       col = mort ? S[2] : S[6];
            else if (lit > 0)    col = mort ? S[1] : S[4];
            else if (lit > -0.5) col = mort ? S[0] : S[2];
            else                 col = mort ? S[0] : S[1];
            ctx.fillStyle = col;
            ctx.fillRect(sn(bx), sn(by), BS, BS);
        }
    }
    // Rim hot edge — bright stone where lit
    for (let ang = 0; ang < Math.PI * 2; ang += 0.035) {
        const lit = Math.cos(ang - LIT_DIR);
        if (lit < 0.45) continue;
        const rx = Math.cos(ang) * (rimROuter - BS);
        const ry = Math.sin(ang) * (rimROuter - BS) * PY;
        px(rx, ry, S[7]);
    }
    // Rim deep shadow — dark stone where unlit
    for (let ang = 0; ang < Math.PI * 2; ang += 0.035) {
        const lit = Math.cos(ang - LIT_DIR);
        if (lit > -0.5) continue;
        const rx = Math.cos(ang) * (rimROuter - BS);
        const ry = Math.sin(ang) * (rimROuter - BS) * PY;
        px(rx, ry, S[0]);
    }

    // ── 4. CRENELLATION MERLONS around outer rim ──────────────
    const merlonCount = 14;
    for (let mi = 0; mi < merlonCount; mi++) {
        const ang  = (mi / merlonCount) * Math.PI * 2;
        const mr   = rimROuter + BS;
        const mx   = Math.cos(ang) * mr;
        const my   = Math.sin(ang) * mr * PY;
        const lit  = Math.cos(ang - LIT_DIR);
        const top  = lit > 0 ? S[5] : S[1];
        const side = lit > 0 ? S[3] : S[0];
        // 2x2 merlon body
        ctx.fillStyle = side;
        ctx.fillRect(sn(mx - BS), sn(my - BS), 2 * BS, 2 * BS);
        // Top cap
        ctx.fillStyle = top;
        ctx.fillRect(sn(mx - BS), sn(my - BS), 2 * BS, BS);
        // Spike on every other merlon
        if (mi % 2 === 0) {
            ctx.fillStyle = lit > 0 ? S[6] : S[2];
            ctx.fillRect(sn(mx), sn(my - 2 * BS), BS, BS);
        }
    }

    // ── 5. CHAIN DRAPES (4 diagonal positions, links into void) ──
    for (let ck = 0; ck < 4; ck++) {
        const ang = (ck / 4) * Math.PI * 2 + Math.PI / 4;
        for (let ci = 0; ci < 5; ci++) {
            const cr   = rimROuter - BS - ci * BS * 1.4;
            const cxL  = Math.cos(ang) * cr;
            const cyL  = Math.sin(ang) * cr * PY;
            // Link body
            ctx.fillStyle = S[0];
            ctx.fillRect(sn(cxL),       sn(cyL),      BS, BS);
            ctx.fillRect(sn(cxL) - BS,  sn(cyL) + BS, BS, BS);
            ctx.fillRect(sn(cxL) + BS,  sn(cyL) + BS, BS, BS);
            // Highlight
            ctx.fillStyle = S[3];
            ctx.fillRect(sn(cxL),       sn(cyL),      BS, 1);
        }
    }

    // ── 6. INNER VOID DISK (pure black, pixel-stepped) ────────
    const voidR = R - 5 * BS;
    ctx.fillStyle = V[0];
    for (let by = -voidR; by <= voidR; by += BS) {
        for (let bx = -voidR; bx <= voidR; bx += BS) {
            const ny = by / PY;
            if (bx * bx + ny * ny > voidR * voidR) continue;
            ctx.fillRect(sn(bx), sn(by), BS, BS);
        }
    }

    // ── 7. HELLFIRE VOID EDGE (orange rim hugging void interior) ──
    ctx.globalCompositeOperation = 'screen';
    for (let ang = 0; ang < Math.PI * 2; ang += 0.022) {
        for (let step = 0; step < 4; step++) {
            const fr = voidR + step * BS;
            const fx = Math.cos(ang) * fr;
            const fy = Math.sin(ang) * fr * PY;
            const a  = (0.62 + pulse * 0.35) * (1 - step / 4);
            ctx.globalAlpha = a;
            ctx.fillStyle = step < 1 ? F[8] : step < 2 ? F[7] : step < 3 ? F[6] : F[4];
            ctx.fillRect(sn(fx), sn(fy), BS, BS);
        }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // ── 8. VOID DEPTH GLOW ────────────────────────────────────
    const vG = ctx.createRadialGradient(0, 0, 0, 0, 0, voidR * 0.95);
    vG.addColorStop(0,   `rgba(110,0,10,${0.42 + pulse * 0.18})`);
    vG.addColorStop(0.5, 'rgba(50,0,10,0.20)');
    vG.addColorStop(1,   'transparent');
    ctx.fillStyle = vG;
    ctx.beginPath();
    ctx.ellipse(0, 0, voidR * 0.95, voidR * 0.95 * PY, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 9. COUNTER-SPINNING ENERGY RINGS inside void ──────────
    ctx.globalCompositeOperation = 'screen';
    const ringR1 = voidR * 0.72;
    const ringR2 = voidR * 0.42;
    for (let rg = 0; rg < 22; rg++) {
        const ang = (rg / 22) * Math.PI * 2 + time * 1.6;
        const rx  = Math.cos(ang) * ringR1;
        const ry  = Math.sin(ang) * ringR1 * PY;
        const a   = (Math.sin(ang * 2 + time * 3) + 1) / 2;
        ctx.fillStyle = `rgba(255,${40 + Math.floor(a * 80)},${20 + Math.floor(a * 60)},${0.5 + a * 0.4})`;
        ctx.fillRect(sn(rx), sn(ry), BS, BS);
        // Counter-spin inner
        const ang2 = -ang * 1.3 + time * 0.9;
        const rx2  = Math.cos(ang2) * ringR2;
        const ry2  = Math.sin(ang2) * ringR2 * PY;
        ctx.fillStyle = `rgba(180,40,${100 + Math.floor(a * 100)},${0.45 + a * 0.35})`;
        ctx.fillRect(sn(rx2), sn(ry2), BS, BS);
    }
    ctx.globalCompositeOperation = 'source-over';

    // ── 10. PENTAGRAM SIGIL (pixel-traced) + GLOWING EYE ──────
    ctx.globalCompositeOperation = 'screen';
    const sigA  = 0.55 + pulse * 0.45;
    const pentR = voidR * 0.58;
    const drawLinePx = (x0, y0, x1, y1, col) => {
        const dx = x1 - x0, dy = y1 - y0;
        const steps = Math.max(Math.abs(dx), Math.abs(dy));
        ctx.fillStyle = col;
        for (let s = 0; s <= steps; s += BS / 2) {
            const t = s / steps;
            ctx.fillRect(sn(x0 + dx * t), sn(y0 + dy * t), BS, BS);
        }
    };
    const pts = [];
    for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
        pts.push([Math.cos(a) * pentR, Math.sin(a) * pentR * PY]);
    }
    const order = [0, 2, 4, 1, 3, 0];
    for (let i = 0; i < 5; i++) {
        const [x0, y0] = pts[order[i]];
        const [x1, y1] = pts[order[i + 1]];
        drawLinePx(x0, y0, x1, y1, `rgba(255,30,30,${sigA})`);
    }
    // Center glowing eye
    ctx.fillStyle = `rgba(255,200,80,${sigA})`;
    ctx.fillRect(-BS, 0, 2 * BS, BS);
    ctx.fillStyle = `rgba(255,80,0,${sigA})`;
    ctx.fillRect(0, 0, BS, BS);
    // Bloom
    ctx.fillStyle = `rgba(255,0,0,${sigA * 0.15})`;
    ctx.fillRect(-5 * BS, -5 * BS, 11 * BS, 11 * BS);
    ctx.globalCompositeOperation = 'source-over';

    // ── 11. 8 BLOCK-GRID DEMON SKULLS on rim (slow orbit) ─────
    const skR = (rimROuter + rimRInner) / 2 - BS;
    for (let i = 0; i < 8; i++) {
        const a    = (i / 8) * Math.PI * 2 + time * 0.18;
        const sx   = Math.cos(a) * skR;
        const sy   = Math.sin(a) * skR * PY;
        const eyeF = 0.55 + flick * 0.45;
        // 4×4 skull, center on rim point
        _gate_drawSkull(sx - 2 * BS, sy - 2 * BS, eyeF);
    }

    // ── 12. EMERGING HORNED DEMON HEAD (rises from void) ──────
    const emergePhase = ((time * 0.42) % 1);
    const ea = Math.sin(emergePhase * Math.PI);
    if (ea > 0.08) {
        ctx.globalAlpha = ea;
        const ey = -voidR * 0.45 * emergePhase * PY;
        // Horns (block grid)
        ctx.fillStyle = '#0a0008';
        ctx.fillRect(sn(-4 * BS), sn(ey - 5 * BS), BS, 4 * BS);
        ctx.fillRect(sn(-3 * BS), sn(ey - 6 * BS), BS, 3 * BS);
        ctx.fillRect(sn( 3 * BS), sn(ey - 5 * BS), BS, 4 * BS);
        ctx.fillRect(sn( 2 * BS), sn(ey - 6 * BS), BS, 3 * BS);
        // Horn tip highlight
        ctx.fillStyle = '#3a0028';
        ctx.fillRect(sn(-3 * BS), sn(ey - 6 * BS), BS, BS);
        ctx.fillRect(sn( 2 * BS), sn(ey - 6 * BS), BS, BS);
        // Skull silhouette (6×3 + jaw line + cranium top)
        ctx.fillStyle = '#050003';
        ctx.fillRect(sn(-3 * BS), sn(ey - 3 * BS), 6 * BS, 3 * BS);
        ctx.fillRect(sn(-2 * BS), sn(ey - 4 * BS), 4 * BS, BS);
        ctx.fillRect(sn(-3 * BS), sn(ey),          6 * BS, BS);
        // Mid-tone fill
        ctx.fillStyle = '#1a000a';
        ctx.fillRect(sn(-2 * BS), sn(ey - 2 * BS), 4 * BS, 2 * BS);
        // Fang jaw
        ctx.fillStyle = '#1a000a';
        ctx.fillRect(sn(-2 * BS), sn(ey + BS),     BS, 2 * BS);
        ctx.fillRect(sn( BS),     sn(ey + BS),     BS, 2 * BS);
        // Glowing eyes
        ctx.globalCompositeOperation = 'screen';
        const eyeGlow = 0.85 + Math.sin(time * 6) * 0.15;
        ctx.fillStyle = `rgba(255,40,40,${ea * eyeGlow})`;
        ctx.fillRect(sn(-2 * BS), sn(ey - 2 * BS), BS, BS);
        ctx.fillRect(sn( BS),     sn(ey - 2 * BS), BS, BS);
        // Eye after-glow
        ctx.fillStyle = `rgba(255,80,40,${ea * 0.5})`;
        ctx.fillRect(sn(-3 * BS), sn(ey - 3 * BS), 2 * BS, 2 * BS);
        ctx.fillRect(sn( BS),     sn(ey - 3 * BS), 2 * BS, 2 * BS);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
    }

    // ── 13. SOUL PIXELS rushing into center ───────────────────
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 20; i++) {
        const prog = ((time * 0.95 + i * 0.19) % 1);
        const ang  = (i / 10) * Math.PI + Math.sin(time * 0.6 + i) * 0.35;
        const startR = voidR * 0.9;
        const sx = Math.cos(ang) * startR * (1 - prog);
        const sy = Math.sin(ang) * startR * PY * (1 - prog);
        const a  = (1 - prog) * 0.9;
        ctx.globalAlpha = a;
        ctx.fillStyle = prog < 0.4 ? F[8] : prog < 0.7 ? F[6] : F[4];
        ctx.fillRect(sn(sx), sn(sy), BS, BS);
        if (prog < 0.25) {
            ctx.fillStyle = F[7];
            ctx.globalAlpha = a * 0.4;
            ctx.fillRect(sn(sx) - BS, sn(sy) - BS, 3 * BS, 3 * BS);
        }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // ── 14. FLOATING MINI SOUL SKULLS inside void ─────────────
    for (let sk = 0; sk < 3; sk++) {
        const phase = ((time * 0.35 + sk * 0.31) % 1);
        const sx = Math.sin(time * 0.7 + sk * 1.9) * voidR * 0.35;
        const sy = (voidR * 0.10 - phase * voidR * 0.50) * PY;
        const a  = Math.sin(phase * Math.PI) * 0.7;
        if (a < 0.05) continue;
        ctx.globalAlpha = a;
        // Mini skull (3×2 + chin)
        ctx.fillStyle = B[0];
        ctx.fillRect(sn(sx) - BS, sn(sy) - BS, 3 * BS, 2 * BS);
        ctx.fillRect(sn(sx),      sn(sy) + BS, BS,     BS);
        ctx.fillStyle = B[1];
        ctx.fillRect(sn(sx),      sn(sy) - BS, BS,     BS);
        // Eye glow
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(255,40,40,${a})`;
        ctx.fillRect(sn(sx) - BS, sn(sy), BS, BS);
        ctx.fillRect(sn(sx) + BS, sn(sy), BS, BS);
        ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = 1;

    ctx.restore();
}

/**
 * Dual summoning portals at the top of each Y-road arm.
 * Pixi bake path used when available (spawning_gates_pixi.js); ctx2d fallback otherwise.
 */
function drawSpawningGate() {
    if (window._spawnGatesPixiInstalled) return; // handled by spawning_gates_pixi.js
    window._legacyCanvasDirty = true;
    const L_WIDTH  = window.LOGICAL_WIDTH  || 1080;
    const L_HEIGHT = window.LOGICAL_HEIGHT || 1440;
    const roadW    = (typeof getRoadWidth === 'function') ? getRoadWidth() : 342;
    const ARM_TOP_W = roadW / 2;
    const MERGE_Y   = L_HEIGHT * 0.22;
    const time      = window.globalAnimTimer || 0;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    const portalR = 110;
    const portalY = MERGE_Y * 0.24;
    _drawSummoningCircle(ARM_TOP_W * 0.60,            portalY, portalR, time);
    _drawSummoningCircle(L_WIDTH - ARM_TOP_W * 0.60,  portalY, portalR, time);

    ctx.restore();
}

window.drawSpawningGate = drawSpawningGate;
