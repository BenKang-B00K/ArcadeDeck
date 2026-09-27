// Player skin registry. Pure data — colors only.
// Data lives in data/skins.json. Load via Skins.loadFromArray(arr).
//
// Skin schema:
//   id, name, cost
//   aura, cape, body, core, antenna, eyes, mouth, blush
// See data/skins.json for current definitions.
(() => {
  const W = (window.OneJump = window.OneJump || {});

  const registry = new Map();
  let activeId = null;
  const unlocked = new Set();
  const STORE_KEY = 'jj_unlocked';

  function register(skin) {
    if (!skin || !skin.id) throw new Error('skin needs id');
    if (skin.cost == null) skin.cost = 0;
    registry.set(skin.id, skin);
    if (skin.cost === 0) unlocked.add(skin.id);
    if (activeId === null) activeId = skin.id;
    return skin;
  }

  function loadFromArray(arr) {
    for (const skin of arr) register(skin);
    loadPersisted();
  }

  function get(id)    { return registry.get(id) || registry.get(activeId); }
  function all()      { return Array.from(registry.values()); }
  function setActive(id) {
    if (registry.has(id) && unlocked.has(id)) activeId = id;
  }
  function active()   { return registry.get(activeId); }
  function isUnlocked(id) { return unlocked.has(id); }
  function unlock(id) {
    if (!registry.has(id)) return false;
    unlocked.add(id);
    persist();
    return true;
  }
  function persist() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(Array.from(unlocked))); } catch (_) {}
  }
  function loadPersisted() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) for (const id of arr) unlocked.add(id);
    } catch (_) {}
  }

  W.Skins = { loadFromArray, get, all, setActive, active, isUnlocked, unlock };
})();
