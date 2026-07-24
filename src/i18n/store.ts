import { useSyncExternalStore } from 'react';
import {
  SUPPORTED_LOCALES,
  loadOverlay,
  EN_OVERLAY,
  localeToUrlPrefix,
  stripLocalePrefix,
  type LocaleOverlay,
} from './registry';

const STORAGE_KEY = 'arcadedeck_lang';
const DEFAULT_LOCALE = 'en';

function detectInitial(): string {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  // 1. URL prefix is authoritative — a visitor landing on /de/... must see German.
  const fromUrl = stripLocalePrefix(window.location.pathname).lang;
  if (fromUrl !== DEFAULT_LOCALE) return fromUrl;
  // 2. Persisted choice from a previous visit.
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LOCALES.includes(saved)) return saved;
  } catch { /* private mode / quota */ }
  // 3. Browser default.
  const navLang = navigator.language?.slice(0, 2);
  if (navLang && SUPPORTED_LOCALES.includes(navLang)) return navLang;
  return DEFAULT_LOCALE;
}

// Fixed for the page's lifetime: navigateToLocale switches language with a
// full-page load, so the locale is decided once at boot.
const currentLocale: string = detectInitial();
// English overlay is bundled eagerly, so we can seed the cache for 'en'
// without an async hop. Other locales hydrate after loadOverlay resolves.
let currentOverlay: LocaleOverlay | null = currentLocale === 'en' ? EN_OVERLAY : null;
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

async function hydrateOverlay(lang: string): Promise<void> {
  currentOverlay = await loadOverlay(lang);
  notify();
}

if (typeof document !== 'undefined') {
  document.documentElement.lang = currentLocale;
  if (currentLocale !== 'en') void hydrateOverlay(currentLocale);
}

export const localeStore = {
  getLocale(): string {
    return currentLocale;
  },
  getOverlay(): LocaleOverlay | null {
    return currentOverlay;
  },
  // Switch language by navigating to the locale-prefixed equivalent of the
  // current URL. This forces a full reload so the visitor lands on the
  // pre-rendered shell for the new locale (correct meta + JSON-LD for SEO).
  navigateToLocale(lang: string): void {
    if (!SUPPORTED_LOCALES.includes(lang) || typeof window === 'undefined') return;
    if (lang === currentLocale) return;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* ignore */ }
    const { rest } = stripLocalePrefix(window.location.pathname);
    const target = (localeToUrlPrefix(lang) + rest) || '/';
    window.location.assign(target + window.location.search + window.location.hash);
  },
  subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },
};

export function useLocale(): {
  lang: string;
  overlay: LocaleOverlay | null;
  navigateToLocale: (l: string) => void;
} {
  const lang = useSyncExternalStore(
    localeStore.subscribe,
    localeStore.getLocale,
    () => DEFAULT_LOCALE,
  );
  const overlay = useSyncExternalStore(
    localeStore.subscribe,
    localeStore.getOverlay,
    () => EN_OVERLAY,
  );
  return {
    lang,
    overlay,
    navigateToLocale: localeStore.navigateToLocale,
  };
}
