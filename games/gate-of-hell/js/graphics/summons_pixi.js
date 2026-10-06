/* summons_pixi.js — Pure Pixi sprite path for friendly summons (skeletons + ghosts).
 *
 * Each summon = PIXI.Text label + thin HP bar (Graphics on overlayLayer).
 * Per-summon record pooled, GC'd against window.friendlySkeletons + friendlyGhosts.
 *
 * Why PIXI.Text (not baked sprite)? Only 2 distinct labels ("해골", "망령"),
 * cheap to instantiate and pool. Pixi caches the text texture per instance.
 */

const _summonActive = new Map(); // summon obj → { text, hpBar, kind }
const _summonTextPoolSkel  = [];
const _summonTextPoolGhost = [];
const _summonHpPool        = [];

if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        _summonActive.clear();
        _summonTextPoolSkel.length = 0;
        _summonTextPoolGhost.length = 0;
        _summonHpPool.length = 0;
    });
}

const SUMMON_STYLE_SKEL = {
    fontFamily: 'Cinzel, serif',
    fontSize: 20, fontWeight: 'bold', // 11 rendered ~4 CSS px on phones
    fill: 0xDDDDDD,
    stroke: { color: 0x000000, width: 2, join: 'round' },
    dropShadow: { color: 0xDDDDDD, blur: 5, alpha: 0.8, distance: 0 },
    align: 'center',
};
const SUMMON_STYLE_GHOST = {
    fontFamily: 'Cinzel, serif',
    fontSize: 20, fontWeight: 'bold',
    fill: 0x00E5FF,
    stroke: { color: 0x000000, width: 2, join: 'round' },
    dropShadow: { color: 0x00E5FF, blur: 5, alpha: 0.8, distance: 0 },
    align: 'center',
};

function _acquireSummonText(kind) {
    const pool = kind === 'skeleton' ? _summonTextPoolSkel : _summonTextPoolGhost;
    let t = pool.pop();
    if (!t) {
        const _T = window.t || ((k, f) => f);
        const label = kind === 'skeleton' ? _T('ui.summons.skeleton', '해골') : _T('ui.summons.ghost', '망령');
        const style = kind === 'skeleton' ? SUMMON_STYLE_SKEL : SUMMON_STYLE_GHOST;
        t = new PIXI.Text({ text: label, style });
        t.anchor.set(0.5, 0.5);
    }
    t.visible = true;
    if (window.entityLayer) window.entityLayer.addChild(t);
    return t;
}

function _acquireSummonHp() {
    let g = _summonHpPool.pop() || new PIXI.Graphics();
    g.visible = true;
    if (window.overlayLayer) window.overlayLayer.addChild(g);
    return g;
}

function _releaseSummon(record) {
    if (!record) return;
    if (record.text) {
        record.text.visible = false;
        if (record.text.parent) record.text.parent.removeChild(record.text);
        (record.kind === 'skeleton' ? _summonTextPoolSkel : _summonTextPoolGhost).push(record.text);
    }
    if (record.hpBar) {
        record.hpBar.clear();
        record.hpBar.visible = false;
        if (record.hpBar.parent) record.hpBar.parent.removeChild(record.hpBar);
        _summonHpPool.push(record.hpBar);
    }
}

function gcPixiSummonSprites() {
    const skel  = window.friendlySkeletons || [];
    const ghost = window.friendlyGhosts || [];
    const live = new Set([...skel, ...ghost]);
    for (const [s, record] of _summonActive) {
        if (!live.has(s) || (s.hp !== undefined && s.hp <= 0)) {
            _releaseSummon(record);
            _summonActive.delete(s);
        }
    }
}

function renderPixiSummons() {
    if (typeof window.friendlySkeletons === 'undefined') return;
    gcPixiSummonSprites();
    const skel  = window.friendlySkeletons || [];
    const ghost = window.friendlyGhosts || [];
    const W = window.LOGICAL_WIDTH || 1080;

    skel.forEach(s => _renderOne(s, 'skeleton', W));
    ghost.forEach(s => _renderOne(s, 'ghost',   W));
}

function _renderOne(s, kind, W) {
    const lx = (s.x / 100) * W;
    const ly = s.y;
    let record = _summonActive.get(s);
    if (!record) {
        record = { text: _acquireSummonText(kind), hpBar: _acquireSummonHp(), kind };
        _summonActive.set(s, record);
    }
    record.text.x = lx;
    record.text.y = ly;

    const hr = Math.max(0, (s.hp || 100) / (s.maxHp || 100));
    const bw = 40;
    const bx = lx - bw / 2;
    const by = ly - 18; // clears the 20px label
    const color = kind === 'skeleton' ? 0xDDDDDD : 0x00E5FF;
    const hp = record.hpBar;
    hp.clear();
    hp.rect(bx, by, bw, 3).fill({ color: 0x000000, alpha: 0.6 });
    if (hr > 0) hp.rect(bx, by, bw * hr, 3).fill({ color, alpha: 1 });
}

window.renderPixiSummons    = renderPixiSummons;
window.gcPixiSummonSprites  = gcPixiSummonSprites;
