// Card slots: ~351px on desktop (>=769px viewport), ~100vw on mobile.
// Prefer the 360w variant on desktop; mobile picks 640w via DPR.
export const SRCSET_SIZES = '(min-width: 769px) 360px, 100vw';

export const thumb360 = (thumbPath: string): string =>
  thumbPath.replace(/\.webp$/i, '-360.webp');

// Returns a `srcset` value for a thumbnail path or undefined if the path is
// remote (http(s)) — we only ship variants for local /images/*.webp files.
export const thumbSrcSet = (thumbUrl: string, base: string = ''): string | undefined => {
  if (/^https?:\/\//i.test(thumbUrl)) return undefined;
  const small = thumb360(thumbUrl);
  return `${base}${small} 360w, ${base}${thumbUrl} 640w`;
};
