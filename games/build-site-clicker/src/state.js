const KEY = 'build-site-clicker';

export const state = {
  clicks: 0, total: 0,   // spendable / lifetime
  level: 1, points: 0,   // current landmark progress (build points)
  up: { power: 0, crew: 0, speed: 0, pay: 0, luck: 0 },
  bulk: false,           // shop buys max affordable
};

const UP0 = { ...state.up };
export function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) { Object.assign(state, s); state.up = { ...state.up, ...s.up }; if (state.up.swing) { state.up.power += state.up.swing; delete state.up.swing; }
    if (state.up.auto) { for (let i = 0; i < state.up.auto; i++) state.clicks += Math.round(200 * 2 ** i); delete state.up.auto; } // ⏱️ removed: refund
    delete state.saved; } } catch {}
  for (const k in UP0) state.up[k] = Math.max(0, Math.floor(+state.up[k] || 0)); // heal NaN / null levels (saved during a stale-file mix)
}
export function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
