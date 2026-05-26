// Locale registry. Every language is an overlay file under src/i18n/locales/{lang}.json.
// English is the canonical source of truth and ships with the main bundle so
// it is always available as a fallback. Other locales lazy-load on demand.
//
// Adding a new language:
//   1. Drop a JSON file at src/i18n/locales/{lang}.json.
//      Shape: { "label": "日本語", "ui": { ... }, "games": { "<id>": { ... } } }
//      (see src/i18n/locales/_template.json for the full shape.)
//   2. Done. The build's import.meta.glob picks it up automatically and the
//      LanguageSwitcher will list it.

import enOverlayRaw from './locales/en.json';

const overlayModules = import.meta.glob('./locales/*.json', { eager: false });

export const EN_OVERLAY: LocaleOverlay = enOverlayRaw as LocaleOverlay;

const DISCOVERED_OVERLAY_LANGS: string[] = Object.keys(overlayModules)
  .map(p => {
    const m = p.match(/\.\/locales\/([^./]+)\.json$/);
    return m ? m[1] : null;
  })
  .filter((l): l is string => !!l && !l.startsWith('_'));

// English first; everything else alpha-sorted.
export const SUPPORTED_LOCALES: string[] = (() => {
  const rest = DISCOVERED_OVERLAY_LANGS.filter(l => l !== 'en').sort();
  return ['en', ...rest];
})();

// English (default locale) lives at the root; other locales sit under a
// lower-cased path prefix (e.g. /de, /es-la). These helpers keep the
// canonical form ↔ URL form mapping in one place.
export function localeToUrlPrefix(lang: string): string {
  if (!lang || lang === 'en') return '';
  return '/' + lang.toLowerCase();
}

export function matchLocaleSlug(slug: string | undefined | null): string | null {
  if (!slug) return null;
  const lower = slug.toLowerCase();
  return SUPPORTED_LOCALES.find(l => l.toLowerCase() === lower) ?? null;
}

// Strip a leading locale segment from a path. Returns the canonical
// English-equivalent path (always starts with "/").
export function stripLocalePrefix(pathname: string): { lang: string; rest: string } {
  const seg = pathname.split('/')[1] ?? '';
  const matched = matchLocaleSlug(seg);
  if (matched && matched !== 'en') {
    const rest = pathname.slice(seg.length + 1) || '/';
    return { lang: matched, rest: rest.startsWith('/') ? rest : '/' + rest };
  }
  return { lang: 'en', rest: pathname || '/' };
}

// BCP-47 codes for og:locale + hreflang. Keep aligned with locale codes
// surfaced to crawlers.
export const LOCALE_BCP47: Record<string, string> = {
  en: 'en_US',
  de: 'de_DE',
  es: 'es_ES',
  'es-LA': 'es_419',
  fr: 'fr_FR',
  ja: 'ja_JP',
  ko: 'ko_KR',
  pt: 'pt_BR',
  ru: 'ru_RU',
  vi: 'vi_VN',
  zh: 'zh_CN',
};

// hreflang attribute values (BCP-47 with hyphens).
export const LOCALE_HREFLANG: Record<string, string> = {
  en: 'en',
  de: 'de',
  es: 'es',
  'es-LA': 'es-419',
  fr: 'fr',
  ja: 'ja',
  ko: 'ko',
  pt: 'pt',
  ru: 'ru',
  vi: 'vi',
  zh: 'zh',
};

// Load overlay JSON on demand. English is bundled eagerly and returned synchronously-wrapped.
export async function loadOverlay(lang: string): Promise<LocaleOverlay | null> {
  if (lang === 'en') return EN_OVERLAY;
  const key = `./locales/${lang}.json`;
  const loader = overlayModules[key];
  if (!loader) return null;
  const mod = await loader() as { default: LocaleOverlay };
  return mod.default;
}

export interface LocaleOverlay {
  // Display name shown in the language switcher (e.g. "日本語"). Falls back
  // to the locale code if missing.
  label?: string;
  // UI string overrides keyed by stable identifier.
  ui?: Record<string, string>;
  // Per-game field overrides keyed by game id. Each entry mirrors the
  // translatable fields (title, description, fullDescription, controls, tips,
  // lore, features). Missing fields fall back to English.
  games?: Record<string, GameTranslation>;
}

export interface ControlEntry { key: string; action: string; }
export interface FaqEntry { q: string; a: string; }
export interface CharacterEntry { name: string; role: string; desc: string; }
export interface FeaturedComment { name: string; text: string; badge?: string; }

export interface GameTranslation {
  title?: string;
  description?: string;
  fullDescription?: string;
  controls?: string;
  tips?: string;
  lore?: string;
  features?: string[];
  // Structured long-mode fields (all optional). Rendered as subsections in
  // the Long view of the corresponding section.
  objectives?: string;
  controlsTable?: ControlEntry[];
  faq?: FaqEntry[];
  characters?: CharacterEntry[];
  featuredComments?: FeaturedComment[];
}

export function getLocaleLabel(lang: string, overlay: LocaleOverlay | null): string {
  return overlay?.label ?? lang;
}
