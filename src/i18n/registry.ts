// Locale registry. Built-in languages live in code: 'en' uses the base game
// fields (title, description, ...), 'ko' uses the *Ko-suffixed siblings on
// each games.json entry.
//
// To add another language (e.g. 'ja'):
//   1. Drop a JSON file at src/i18n/locales/{lang}.json.
//      Shape: { "label": "日本語", "ui": { ... }, "games": { "<id>": { ... } } }
//      (see src/i18n/locales/_template.json for the full shape.)
//   2. Done. The build's import.meta.glob picks it up automatically and the
//      LanguageSwitcher will list it.
//
// No code changes required — overlays are loaded lazily on demand and cached.

const overlayModules = import.meta.glob('./locales/*.json', { eager: false });

const BUILTIN: Record<string, string> = {
  en: 'English',
  ko: '한국어',
};

const DISCOVERED_OVERLAY_LANGS: string[] = Object.keys(overlayModules)
  .map(p => {
    const m = p.match(/\.\/locales\/([^./]+)\.json$/);
    return m ? m[1] : null;
  })
  .filter((l): l is string => !!l && !l.startsWith('_'));

// Built-in first, then any drop-in overlays.
export const SUPPORTED_LOCALES: string[] = [
  ...Object.keys(BUILTIN),
  ...DISCOVERED_OVERLAY_LANGS.filter(l => !(l in BUILTIN)),
];

export function isBuiltinLocale(lang: string): boolean {
  return lang in BUILTIN;
}

export function hasOverlay(lang: string): boolean {
  return `./locales/${lang}.json` in overlayModules;
}

// Load overlay JSON on demand. Returns null for built-in or unknown languages.
export async function loadOverlay(lang: string): Promise<LocaleOverlay | null> {
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
  // UI string overrides keyed by stable identifier. Reserved for future use
  // when UI strings get extracted; safe to leave empty.
  ui?: Record<string, string>;
  // Per-game field overrides keyed by game id. Each entry mirrors the
  // translatable fields from games.json (title, description, fullDescription,
  // controls, tips, lore, features). Missing fields fall back to English.
  games?: Record<string, GameTranslation>;
}

export interface GameTranslation {
  title?: string;
  description?: string;
  fullDescription?: string;
  controls?: string;
  tips?: string;
  lore?: string;
  features?: string[];
}

export function getLocaleLabel(lang: string, overlay: LocaleOverlay | null): string {
  return BUILTIN[lang] ?? overlay?.label ?? lang;
}
