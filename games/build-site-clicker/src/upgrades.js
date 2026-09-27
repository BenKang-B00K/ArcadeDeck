// upgrade table: cost = base × k^level, paid in clicks
export const UPGRADES = [
  { id: 'power', icon: 'hammer', base: 10, k: 1.5, max: Infinity, name: 'Build power', desc: '+1 build point per hammer hit, +8 % compounding' },
  { id: 'crew', icon: 'worker', base: 100, k: 1.3, max: Infinity, name: 'Crew', desc: '+1 crew per click · crews ride one worker per tier' },
  { id: 'speed', icon: 'bolt', base: 50, k: 1.4, max: 20, name: 'Walk speed', desc: '+15 % walk speed per level' }, // cap: linear gain vs exponential cost
  { id: 'pay', icon: 'coin', base: 300, k: 1.8, max: 10, name: 'Payroll', desc: 'hammer hits pay +1 % of their build points as clicks' },
  { id: 'luck', icon: 'dice', base: 5000, k: 1.9, max: 25, name: 'Lucky swing', desc: '+2 % chance a hit counts ×5' },
];
export const CRIT = 5;
export const cost = (u, lvl) => Math.round(u.base * u.k ** lvl);

// what the upgrade levels mean for the sim
// crew value → workers by tier: tier n is worth 10^(n-1) base workers, e.g. 23 → [2×tier2, 3×tier1]
export function crewTiers(n) {
  const out = [];
  for (let tier = Math.floor(Math.log10(n)) + 1; tier >= 1; tier--) { const w = 10 ** (tier - 1), c = Math.floor(n / w); if (c) out.push({ tier, count: c, worth: w }); n -= c * w; }
  return out;
}

export const derived = up => ({
  power: Math.round((1 + up.power) * 1.08 ** up.power), // +1 and ×1.08 per level: keeps up with ×1.4 level growth
  crew: 1 + up.crew,
  speed: 1.6 * (1 + 0.15 * up.speed),
  pay: 0.01 * up.pay,
  luck: 0.02 * up.luck,
});
// levels you can afford in one go (buy-max): returns [levels, total cost]
export function bulk(u, lvl, have) {
  let n = 0, c = 0;
  while (lvl + n < u.max && c + cost(u, lvl + n) <= have) c += cost(u, lvl + n++);
  return [n, c];
}
