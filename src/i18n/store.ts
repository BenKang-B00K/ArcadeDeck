import { useSyncExternalStore } from 'react';
import { SUPPORTED_LOCALES, loadOverlay, type LocaleOverlay } from './registry';

const STORAGE_KEY = 'arcadedeck_lang';
const DEFAULT_LOCALE = 'en';

function detectInitial(): string {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LOCALES.includes(saved)) return saved;
  } catch { /* private mode / quota */ }
  const navLang = navigator.language?.slice(0, 2);
  if (navLang && SUPPORTED_LOCALES.includes(navLang)) return navLang;
  return DEFAULT_LOCALE;
}

let currentLocale: string = detectInitial();
let currentOverlay: LocaleOverlay | null = null;
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
  // Kick off overlay load for non-built-in initial locale.
  void hydrateOverlay(currentLocale);
}

export const localeStore = {
  getLocale(): string {
    return currentLocale;
  },
  getOverlay(): LocaleOverlay | null {
    return currentOverlay;
  },
  async setLocale(lang: string): Promise<void> {
    if (!SUPPORTED_LOCALES.includes(lang) || lang === currentLocale) return;
    currentLocale = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* ignore */ }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
    currentOverlay = null;
    notify();
    await hydrateOverlay(lang);
  },
  subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },
};

export function useLocale(): { lang: string; overlay: LocaleOverlay | null; setLocale: (l: string) => Promise<void> } {
  const lang = useSyncExternalStore(
    localeStore.subscribe,
    localeStore.getLocale,
    () => DEFAULT_LOCALE,
  );
  const overlay = useSyncExternalStore(
    localeStore.subscribe,
    localeStore.getOverlay,
    () => null,
  );
  return { lang, overlay, setLocale: localeStore.setLocale };
}
