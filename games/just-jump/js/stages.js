// Stage registry. Pure data, loaded from data/stages.json.
// Schema: id, name, color, startSpeed, targetSpeed, obstacleIds[], coinIds[]
(() => {
  const W = (window.OneJump = window.OneJump || {});

  const list = [];
  const byId = new Map();
  const unlocked = new Set();
  const STORE_KEY = 'jj_stages_unlocked';

  function register(stage) {
    if (!stage || !stage.id) throw new Error('stage needs id');
    list.push(stage);
    byId.set(stage.id, stage);
    if (list.length === 1) unlocked.add(stage.id);
    return stage;
  }

  function loadFromArray(arr) {
    for (const s of arr) register(s);
    loadPersisted();
  }

  function all()        { return list.slice(); }
  function get(id)      { return byId.get(id); }
  function getByIndex(i){ return list[Math.max(0, Math.min(list.length - 1, i))]; }
  function indexOf(id)  { return list.findIndex(s => s.id === id); }
  function next(id) {
    const i = indexOf(id);
    return i >= 0 && i < list.length - 1 ? list[i + 1] : null;
  }
  function isUnlocked(id) { return unlocked.has(id); }
  function unlock(id) {
    if (!byId.has(id) || unlocked.has(id)) return false;
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
      if (Array.isArray(arr)) for (const id of arr) if (byId.has(id)) unlocked.add(id);
    } catch (_) {}
  }

  W.Stages = { register, loadFromArray, all, get, getByIndex, indexOf, next, isUnlocked, unlock };
})();
