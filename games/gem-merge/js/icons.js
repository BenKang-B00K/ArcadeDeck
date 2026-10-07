// Inline SVG icons (24×24 viewBox). Bodies are shared by the DOM UI and achievements.
export const ICON = {
  gem:     '<path d="M6 3h12l4 6-10 13L2 9z"/><path d="M2 9h20M8 3l4 6 4-6M12 9l-3 13M12 9l3 13" stroke="#0a0a1a" stroke-width="1" fill="none"/>',
  sparkle: '<path d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2z"/>',
  bolt:    '<path d="M13 2L4 14h7l-1 8 10-13h-7z"/>',
  flame:   '<path d="M12 2c0 5-6 7-6 13a6 6 0 0 0 12 0c0-3-2-5-3-6 0 3-2 4-2 4 1-3-1-7-1-11z"/>',
  crown:   '<path d="M3 19L2 6l6 4 4-7 4 7 6-4-1 13z"/>',
  hexagon: '<path d="M12 2l9 5v10l-9 5-9-5V7z"/>',
  star6:   '<path d="M12 1l3 6h7l-4 5 4 5h-7l-3 6-3-6H2l4-5-4-5h7z"/>',
  star8:   '<path d="M12 1l2.5 6L20 4l-3 5.5 6 2.5-6 2.5 3 5.5-5.5-3L12 23l-2.5-6L4 20l3-5.5L1 12l6-2.5L4 4l5.5 3z"/>',
  cushion: '<rect x="3" y="3" width="18" height="18" rx="6"/>',
  trophy:  '<path d="M5 2h14v7a7 7 0 0 1-14 0zM3 4h2v5H3zM19 4h2v5h-2zM11 15h2v3h3v3H8v-3h3z"/>',
  medal:   '<path d="M7 1h4l1 4 1-4h4l-3 8h-4z"/><circle cx="12" cy="15" r="7"/>',
  layers:  '<path d="M12 2l10 5.5L12 13 2 7.5z"/><path d="M4.5 11l7.5 4 7.5-4 2.5 1.5L12 18 2 12.5z" opacity=".7"/><path d="M4.5 16l7.5 4 7.5-4 2.5 1.5L12 23 2 17.5z" opacity=".45"/>',
  book:    '<path d="M2 4h8a2 2 0 0 1 2 2v15a2 2 0 0 0-2-2H2z"/><path d="M22 4h-8a2 2 0 0 0-2 2v15a2 2 0 0 1 2-2h8z" opacity=".6"/>',
  mouse:   '<rect x="6.5" y="2.5" width="11" height="19" rx="5.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 5.5v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  touch:   '<path d="M9 22l-4.5-6.5a1.6 1.6 0 0 1 2.6-1.9L9 16V5a1.5 1.5 0 0 1 3 0v6.5l4.6 1.1A2 2 0 0 1 18 14.5V22z"/>',
  // Speaker: .on waves show normally, .off cross shows when the button has .muted (css)
  speaker: '<path d="M3 9v6h4l5 4V5L7 9z"/><g class="on" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18.5 6a9 9 0 0 1 0 12"/></g><g class="off" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 9l5 6M21 9l-5 6"/></g>',
};

export const svg = (body, color, cls = 'icon') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="currentColor"${color ? ` style="color:${color}"` : ''}>${body}</svg>`;
export const icon = (name, color, cls) => svg(ICON[name], color, cls);
