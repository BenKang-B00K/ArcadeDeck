// Card slots: ~351px on desktop (>=769px viewport), ~100vw on mobile.
// Prefer the 360w variant on desktop; mobile picks 640w via DPR.
export const SRCSET_SIZES = '(min-width: 769px) 360px, 100vw';

export const thumb360 = (thumbPath: string): string =>
  thumbPath.replace(/\.webp$/i, '-360.webp');
