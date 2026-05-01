import type { Game } from '../data/games';
import type { GameTranslation, LocaleOverlay } from './registry';
import { EN_OVERLAY } from './registry';

type StringField = 'title' | 'description' | 'fullDescription' | 'controls' | 'tips' | 'lore';
type ArrayField = 'features';

function readString(overlay: LocaleOverlay | null, id: string, field: StringField): string | undefined {
  const v = overlay?.games?.[id]?.[field as keyof GameTranslation];
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

function readArray(overlay: LocaleOverlay | null, id: string, field: ArrayField): string[] | undefined {
  const v = overlay?.games?.[id]?.[field];
  if (!Array.isArray(v) || v.length === 0) return undefined;
  return v.filter((x): x is string => typeof x === 'string');
}

// Resolve a string field for the active locale.
//   non-en + overlay has it → overlay value
//   else                    → English (EN_OVERLAY)
export function getLocalizedString(
  game: Game,
  field: StringField,
  lang: string,
  overlay: LocaleOverlay | null,
): string {
  if (lang !== 'en') {
    const v = readString(overlay, game.id, field);
    if (v !== undefined) return v;
  }
  return readString(EN_OVERLAY, game.id, field) ?? '';
}

// Resolve a string-array field (currently only `features`).
export function getLocalizedArray(
  game: Game,
  field: ArrayField,
  lang: string,
  overlay: LocaleOverlay | null,
): string[] {
  if (lang !== 'en') {
    const v = readArray(overlay, game.id, field);
    if (v !== undefined) return v;
  }
  return readArray(EN_OVERLAY, game.id, field) ?? [];
}

// English-only feature list. Used for structural checks (e.g. "Local Co-op",
// "PC Only" platform badges) where the marker is the canonical English string,
// not a translated label.
export function getEnFeatures(id: string): string[] {
  return readArray(EN_OVERLAY, id, 'features') ?? [];
}
