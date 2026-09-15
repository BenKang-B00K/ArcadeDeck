// Monochrome line icons, 24×24 Lucide-style. Inner elements only; wrapper added by svgIcon().

export const ICONS = {
  // beginner
  'target':        '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  'check-circle':  '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
  'gamepad':       '<rect x="2" y="7" width="20" height="11" rx="4"/><path d="M6 11v4M4 13h4M15 12h.01M18 14h.01"/>',
  'joystick':      '<rect x="4" y="16" width="16" height="5" rx="2"/><path d="M12 16V9"/><circle cx="12" cy="6" r="3"/>',
  'dumbbell':      '<path d="M8 12h8"/><path d="M4 9v6M7 7v10M17 7v10M20 9v6"/>',
  // score
  'hash':          '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
  'zap':           '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  'flame':         '<path d="M12 22c-4 0-7-3-7-7 0-3 2-5 3-7 1 2 2 3 3 3 0-3 1-6 3-8 1 3 5 6 5 12 0 4-3 7-7 7z"/><path d="M12 22c-2 0-3-1.5-3-3 0-2 1.5-3 3-5 1.5 2 3 3 3 5 0 1.5-1 3-3 3z"/>',
  'sparkles':      '<path d="M12 3c.5 4 2 6 6 7-4 1-5.5 3-6 7-.5-4-2-6-6-7 4-1 5.5-3 6-7z"/><path d="M5 3v4M3 5h4"/><path d="M19 17v4M17 19h4"/>',
  'comet':         '<circle cx="7" cy="17" r="4"/><path d="m10 14 11-11M9 11 17 3M13 15l8-8"/>',
  // level
  'sprout':        '<path d="M12 22V10"/><path d="M12 14c0-4 3-6 7-6 0 4-3 6-7 6z"/><path d="M12 10c0-3-2-5-6-5 0 3 2 5 6 5z"/>',
  'star':          '<path d="m12 2 3 6.5 7 1-5 5 1.2 7L12 18l-6.2 3.5L7 14.5l-5-5 7-1z"/>',
  'star-fill':     '<path fill="currentColor" d="m12 2 3 6.5 7 1-5 5 1.2 7L12 18l-6.2 3.5L7 14.5l-5-5 7-1z"/>',
  'medal':         '<circle cx="12" cy="15" r="6"/><path d="m8.5 10-3-8h4l2 5M15.5 10l3-8h-4l-2 5"/>',
  'crown':         '<path d="m3 8 4 4 5-8 5 8 4-4-2 11H5z"/><path d="M5 21h14"/>',
  'swords':        '<path d="M3 3l11 11M21 3 10 14"/><path d="M14 17 7 10M6 18l-2 2M18 18l2 2M4 16l4 4M20 16l-4 4"/>',
  'orbit':         '<circle cx="12" cy="12" r="3"/><path d="M4 12a8 8 0 1 0 16 0 8 8 0 1 0-16 0" transform="rotate(-30 12 12)"/><circle cx="19" cy="8" r="1.5" fill="currentColor"/>',
  // precision
  'gem':           '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9 3l3 6 3-6M12 9l-3 12M12 9l3 12"/>',
  'hexagon':       '<path d="M12 2 21 7v10l-9 5-9-5V7z"/>',
  'trophy':        '<path d="M8 21h8M12 17v4"/><path d="M7 4h10v6a5 5 0 0 1-10 0z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/>',
  'crosshair':     '<circle cx="12" cy="12" r="8"/><path d="M12 2v6M12 16v6M2 12h6M16 12h6"/>',
  // clutch
  'hourglass':     '<path d="M6 2h12M6 22h12"/><path d="M7 2v4l5 6 5-6V2M7 22v-4l5-6 5 6v4"/>',
  'skull':         '<path d="M4 11a8 8 0 1 1 16 0c0 3-2 4-2 6v4H6v-4c0-2-2-3-2-6z"/><circle cx="9" cy="11" r="1.5" fill="currentColor"/><circle cx="15" cy="11" r="1.5" fill="currentColor"/><path d="M10 17v4M14 17v4"/>',
  'shield':        '<path d="M12 22s8-3 8-10V5l-8-3-8 3v7c0 7 8 10 8 10z"/>',
  'anchor':        '<circle cx="12" cy="5" r="3"/><path d="M12 8v14"/><path d="M5 13a7 7 0 0 0 14 0"/><path d="M8 13h8"/>',
  'rotate-ccw':    '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
  // streaks
  'link':          '<path d="M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1.5 1.5"/><path d="M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6L12.5 17"/>',
  'infinity':      '<path d="M12 12c-2-2.7-3.5-4-5.5-4a4 4 0 0 0 0 8c2 0 3.5-1.3 5.5-4s3.5-4 5.5-4a4 4 0 0 1 0 8c-2 0-3.5-1.3-5.5-4z"/>',
  'rocket':        '<path d="M12 2c3 2 5 6 5 11l-5 4-5-4c0-5 2-9 5-11z"/><circle cx="12" cy="10" r="2"/><path d="M7 13l-3 3 3 1M17 13l3 3-3 1M10 19l2 3 2-3"/>',
  // cumulative
  'bar-chart':     '<path d="M3 21h18"/><path d="M6 21V12M12 21V5M18 21v-8"/>',
  'trending-up':   '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  'mountain':      '<path d="m2 20 7-12 4 6 3-4 6 10z"/><path d="m7 13 2-2 2 2"/>',
  'eye-off':       '<path d="M3 3l18 18"/><path d="M10.6 5.2A10 10 0 0 1 12 5c5 0 9 4 10 7-.4 1-1.3 2.5-2.6 3.8M6.6 6.6C4 8 2.6 10.4 2 12c1 3 5 7 10 7 1.8 0 3.4-.5 4.8-1.3"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  // fun
  'ghost':         '<path d="M4 22V11a8 8 0 0 1 16 0v11l-2.7-2-2.6 2-2.7-2-2.7 2-2.6-2z"/><circle cx="9" cy="11" r="1" fill="currentColor"/><circle cx="15" cy="11" r="1" fill="currentColor"/>',
  'tornado':       '<path d="M3 5h18M5 9h14M8 13h9M10 17h5M12 21h2"/>',
  'trending-down': '<path d="m3 7 6 6 4-4 8 8"/><path d="M15 17h6v-6"/>',
  'volume-x':      '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/>',
  // toolbar
  'volume':        '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
  // fallback
  'circle':        '<circle cx="12" cy="12" r="9"/>',
};

export function svgIcon(key) {
  const body = ICONS[key];
  if (!body) console.warn('svgIcon: unknown key', key);
  // Only the looked-up constant is interpolated, never the key → safe for innerHTML.
  return `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body || ICONS.circle}</svg>`;
}
