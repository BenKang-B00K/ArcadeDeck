/* road_vfx_enhancer_pixi.js — Atmospheric VFX over road surface + seam edges.
 *
 * Two effect layers, both on vfxLayer with additive blend:
 *   1. Rising embers — soft glow sprites spawn on road, drift up, fade.
 *   2. Edge runners  — bright pulses travel along the inverted-T seam path.
 *
 * Pure Pixi v8, pooled, no per-frame allocations. Heat shimmer via subtle
 * ember spawn density near gates and portal.
 */

const _RVE_EMBER_COUNT  = 22;
const _RVE_RUNNER_COUNT = 6;
const _RVE_GLOW_TEX_SIZE = 64;

let _rveContainer  = null;
let _rveEmberCt    = null;
let _rveRunnerCt   = null;
let _rveGlowTex    = null;
let _rveEmbers     = [];   // {sprite, x, y, vx, vy, life, maxLife, tint}
let _rveRunners    = [];   // {sprite, segIdx, t, speed, life, maxLife}
let _rveInstalled  = false;
let _rveSegments   = null; // cached inverted-T path segments

if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        _rveContainer = null;
        _rveEmberCt   = null;
        _rveRunnerCt  = null;
        _rveEmbers    = [];
        _rveRunners   = [];
        _rveInstalled = false;
        _rveSegments  = null;
    });
}

function _rveEnsureGlowTex() {
    if (_rveGlowTex) return _rveGlowTex;
    const c = document.createElement('canvas');
    c.width = _RVE_GLOW_TEX_SIZE; c.height = _RVE_GLOW_TEX_SIZE;
    const g = c.getContext('2d');
    const r = _RVE_GLOW_TEX_SIZE / 2;
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0,    'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    grad.addColorStop(1,    'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, _RVE_GLOW_TEX_SIZE, _RVE_GLOW_TEX_SIZE);
    _rveGlowTex = PIXI.Texture.from(c);
    return _rveGlowTex;
}

function _rveBuildSegments() {
    const W = window.LOGICAL_WIDTH  || 1080;
    const H = window.LOGICAL_HEIGHT || 1440;
    const roadW = (typeof getRoadWidth === 'function') ? getRoadWidth() : 342;
    const roadX = (typeof getRoadX     === 'function') ? getRoadX()     : (W - roadW) / 2;
    const MERGE_Y   = H * 0.22;
    const barBottom = MERGE_Y * 0.1 + 220;

    // 4 segments of inverted-T seam. {x1,y1,x2,y2,len}
    const segs = [
        { x1: 0,             y1: barBottom, x2: roadX,         y2: barBottom },
        { x1: roadX,         y1: barBottom, x2: roadX,         y2: H         },
        { x1: W,             y1: barBottom, x2: roadX + roadW, y2: barBottom },
        { x1: roadX + roadW, y1: barBottom, x2: roadX + roadW, y2: H         },
    ];
    segs.forEach(s => { s.len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1); });
    return {
        segs, roadX, roadW, barBottom, W, H,
        roadTop: barBottom,
        roadBot: H,
    };
}

function _rveSpawnEmber(em, ctx) {
    // Bias spawn density toward portal (bottom) and gates (top of stem).
    const r = Math.random();
    let y;
    if (r < 0.35)      y = ctx.roadTop + Math.random() * 80;                              // near gates
    else if (r > 0.7)  y = ctx.roadBot - 40 - Math.random() * 120;                         // near portal
    else               y = ctx.roadTop + Math.random() * (ctx.roadBot - ctx.roadTop);      // middle
    em.x = ctx.roadX + 8 + Math.random() * (ctx.roadW - 16);
    em.y = y;
    em.vx = (Math.random() - 0.5) * 0.25;
    em.vy = -0.4 - Math.random() * 0.6;
    em.maxLife = 60 + Math.random() * 50;
    em.life = em.maxLife;
    em.size = 6 + Math.random() * 10;
    // Tint range: deep red 0xFF2200 → orange 0xFFAA33 → yellow 0xFFE066
    const t = Math.random();
    if (t < 0.55)       em.tint = 0xFF3300;
    else if (t < 0.9)   em.tint = 0xFFAA33;
    else                em.tint = 0xFFE066;
}

function _rveSpawnRunner(rn, ctx) {
    rn.segIdx  = Math.floor(Math.random() * ctx.segs.length);
    rn.t       = 0;
    rn.speed   = 0.004 + Math.random() * 0.006; // fraction of segment per frame @ dt=1
    rn.maxLife = 1 / rn.speed * 1.05;
    rn.life    = rn.maxLife;
}

function _rveInstall() {
    if (_rveInstalled || !window.vfxLayer || typeof PIXI === 'undefined') return;

    _rveContainer = new PIXI.Container();
    _rveContainer.blendMode = 'add';

    _rveEmberCt  = new PIXI.Container();
    _rveRunnerCt = new PIXI.Container();
    _rveContainer.addChild(_rveEmberCt);
    _rveContainer.addChild(_rveRunnerCt);

    const tex = _rveEnsureGlowTex();
    const ctx = _rveBuildSegments();
    _rveSegments = ctx;

    for (let i = 0; i < _RVE_EMBER_COUNT; i++) {
        const s = new PIXI.Sprite(tex);
        s.anchor.set(0.5, 0.5);
        s.blendMode = 'add';
        _rveEmberCt.addChild(s);
        const em = { sprite: s };
        _rveSpawnEmber(em, ctx);
        // Stagger initial lives so they don't all expire together.
        em.life = Math.random() * em.maxLife;
        _rveEmbers.push(em);
    }

    for (let i = 0; i < _RVE_RUNNER_COUNT; i++) {
        const s = new PIXI.Sprite(tex);
        s.anchor.set(0.5, 0.5);
        s.tint = 0xFFCC55;
        s.blendMode = 'add';
        _rveRunnerCt.addChild(s);
        const rn = { sprite: s };
        _rveSpawnRunner(rn, ctx);
        rn.t = Math.random(); // stagger
        _rveRunners.push(rn);
    }

    window.vfxLayer.addChild(_rveContainer);
    _rveInstalled = true;
    console.log('[road_vfx_enhancer_pixi] installed on vfxLayer.');
}

function updateRoadVfxEnhancer() {
    if (!_rveInstalled) {
        _rveInstall();
        if (!_rveInstalled) return;
    }
    const dt = window.dt || 1;
    const ctx = _rveSegments;

    // Embers: drift up, fade, respawn.
    for (let i = 0; i < _rveEmbers.length; i++) {
        const em = _rveEmbers[i];
        em.x += em.vx * dt;
        em.y += em.vy * dt;
        em.life -= dt;
        if (em.life <= 0 || em.y < ctx.roadTop - 20) {
            _rveSpawnEmber(em, ctx);
        }
        const k = Math.max(0, em.life / em.maxLife);
        const a = Math.sin(k * Math.PI) * 0.85;
        const sp = em.sprite;
        sp.x = em.x;
        sp.y = em.y;
        sp.alpha = a;
        sp.tint = em.tint;
        sp.width = sp.height = em.size * (0.6 + (1 - k) * 0.5);
    }

    // Edge runners: traverse one seam segment then jump to a new one.
    for (let i = 0; i < _rveRunners.length; i++) {
        const rn = _rveRunners[i];
        rn.t += rn.speed * dt;
        if (rn.t >= 1) {
            _rveSpawnRunner(rn, ctx);
        }
        const seg = ctx.segs[rn.segIdx];
        const sp = rn.sprite;
        sp.x = seg.x1 + (seg.x2 - seg.x1) * rn.t;
        sp.y = seg.y1 + (seg.y2 - seg.y1) * rn.t;
        // Fade-in/out across the run.
        const fade = Math.sin(rn.t * Math.PI);
        sp.alpha = 0.9 * fade;
        sp.width = sp.height = 18 + fade * 8;
    }
}

window.updateRoadVfxEnhancer = updateRoadVfxEnhancer;
