// Card slots: ~351px on desktop (>=769px viewport); two columns below that
// (~45vw). DPR-2 phones land on the 360w variant, DPR-3 still pick 640w.
export const SRCSET_SIZES = '(min-width: 769px) 360px, 45vw';

export const thumb360 = (thumbPath: string): string =>
  thumbPath.replace(/\.webp$/i, '-360.webp');
