export const W = 400, H = 600, WT = 26;
export const DROP_Y    = 68;
export const DANGER_Y  = 130;
export const GRAVITY   = 0.8;
export const COOLDOWN  = 550;

export const GEMS = [
  { r:  16, color: 0xff4757, hi: 0xff6b81, score: 1   },
  { r:  22, color: 0xff6348, hi: 0xff9f89, score: 3   },
  { r:  29, color: 0xffa502, hi: 0xffcc67, score: 6   },
  { r:  37, color: 0x2ed573, hi: 0x7bed9f, score: 10  },
  { r:  46, color: 0x1e90ff, hi: 0x74b9ff, score: 15  },
  { r:  56, color: 0x9b59b6, hi: 0xd7bde2, score: 21  },
  { r:  66, color: 0xfd79a8, hi: 0xffb3cb, score: 28  },
  { r:  77, color: 0x00cec9, hi: 0x81ecec, score: 36  },
  { r:  89, color: 0xe17055, hi: 0xfab1a0, score: 45  },
  { r: 101, color: 0x6c5ce7, hi: 0xb2abf2, score: 55  },
  { r: 114, color: 0xf9ca24, hi: 0xf8efba, score: 100 },
];

export const TIERS = [
  { min:    0, label: null,              cls: '',       overlay: 0x6c5ce7, overlayMax: 0.00  },
  { min:   50, label: '✨ NICE!',        cls: 'tier-1', overlay: 0x9b59b6, overlayMax: 0.04  },
  { min:  150, label: '🔥 HOT STREAK!', cls: 'tier-2', overlay: 0xfd79a8, overlayMax: 0.055 },
  { min:  350, label: '⚡ ON FIRE!',    cls: 'tier-3', overlay: 0xff6348, overlayMax: 0.075 },
  { min:  700, label: '💫 BLAZING!',    cls: 'tier-4', overlay: 0xffa502, overlayMax: 0.095 },
  { min: 1200, label: '💎 LEGENDARY!',  cls: 'tier-5', overlay: 0xf9ca24, overlayMax: 0.13  },
];

export const COMBO_WINDOW = 1300;

export const hexStr = n => '#' + n.toString(16).padStart(6, '0');

// Spawns are always Lv1; a combo of ×N upgrades the next spawn to Lv N (capped). Skill, not luck.
export const COMBO_TIER_CAP = 4;

// Physics outline is inflated by this many px so gems never visually touch
export const GEM_GAP = 2.5;
