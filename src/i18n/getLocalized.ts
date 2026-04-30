import type { Game, GameLight } from '../data/games';
import type { GameTranslation, LocaleOverlay } from './registry';

type AnyGame = GameLight | Game;
type StringField = 'title' | 'description' | 'fullDescription' | 'controls' | 'tips' | 'lore';
type ArrayField = 'features';

// Suffix used on games.json for the built-in Korean translation
// (titleKo, descriptionKo, fullDescriptionKo, ...).
const KO_SUFFIX = 'Ko';

function koField(field: string): string {
  return field + KO_SUFFIX;
}

// Resolve a string field for the active locale.
//   en   → game[field]
//   ko   → game[fieldKo] ?? game[field]
//   else → overlay.games[id][field] ?? game[field]
export function getLocalizedString(
  game: AnyGame,
  field: StringField,
  lang: string,
  overlay: LocaleOverlay | null,
): string {
  const base = (game as unknown as Record<string, unknown>)[field];
  if (lang === 'en') return typeof base === 'string' ? base : '';
  if (lang === 'ko') {
    const ko = (game as unknown as Record<string, unknown>)[koField(field)];
    if (typeof ko === 'string' && ko.length > 0) return ko;
    return typeof base === 'string' ? base : '';
  }
  const t = overlay?.games?.[game.id] as GameTranslation | undefined;
  const fromOverlay = t?.[field];
  if (typeof fromOverlay === 'string' && fromOverlay.length > 0) return fromOverlay;
  return typeof base === 'string' ? base : '';
}

// Resolve a string-array field (currently only `features`).
export function getLocalizedArray(
  game: AnyGame,
  field: ArrayField,
  lang: string,
  overlay: LocaleOverlay | null,
): string[] {
  const base = (game as unknown as Record<string, unknown>)[field];
  const baseArr = Array.isArray(base) ? base.filter((x): x is string => typeof x === 'string') : [];
  if (lang === 'en') return baseArr;
  if (lang === 'ko') {
    const ko = (game as unknown as Record<string, unknown>)[koField(field)];
    if (Array.isArray(ko) && ko.length > 0) return ko.filter((x): x is string => typeof x === 'string');
    return baseArr;
  }
  const t = overlay?.games?.[game.id] as GameTranslation | undefined;
  const fromOverlay = t?.[field];
  if (Array.isArray(fromOverlay) && fromOverlay.length > 0) return fromOverlay;
  return baseArr;
}
