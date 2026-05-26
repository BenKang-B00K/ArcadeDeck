import type { Game } from '../data/games';
import type {
  GameTranslation,
  LocaleOverlay,
  ControlEntry,
  FaqEntry,
  CharacterEntry,
  FeaturedComment,
} from './registry';
import { EN_OVERLAY } from './registry';

type StringField = 'title' | 'description' | 'fullDescription' | 'controls' | 'tips' | 'lore' | 'objectives';
type ArrayField = 'features';
type ObjectArrayField = 'controlsTable' | 'faq' | 'characters' | 'featuredComments';

function readString(overlay: LocaleOverlay | null, id: string, field: StringField): string | undefined {
  const v = overlay?.games?.[id]?.[field as keyof GameTranslation];
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

function readArray(overlay: LocaleOverlay | null, id: string, field: ArrayField): string[] | undefined {
  const v = overlay?.games?.[id]?.[field];
  if (!Array.isArray(v) || v.length === 0) return undefined;
  return v.filter((x): x is string => typeof x === 'string');
}

function readObjectArray<T>(
  overlay: LocaleOverlay | null,
  id: string,
  field: ObjectArrayField,
): T[] | undefined {
  const v = overlay?.games?.[id]?.[field];
  if (!Array.isArray(v) || v.length === 0) return undefined;
  return v as T[];
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

export function getLocalizedControlsTable(
  game: Game,
  lang: string,
  overlay: LocaleOverlay | null,
): ControlEntry[] {
  if (lang !== 'en') {
    const v = readObjectArray<ControlEntry>(overlay, game.id, 'controlsTable');
    if (v) return v;
  }
  return readObjectArray<ControlEntry>(EN_OVERLAY, game.id, 'controlsTable') ?? [];
}

export function getLocalizedFaq(
  game: Game,
  lang: string,
  overlay: LocaleOverlay | null,
): FaqEntry[] {
  if (lang !== 'en') {
    const v = readObjectArray<FaqEntry>(overlay, game.id, 'faq');
    if (v) return v;
  }
  return readObjectArray<FaqEntry>(EN_OVERLAY, game.id, 'faq') ?? [];
}

export function getLocalizedCharacters(
  game: Game,
  lang: string,
  overlay: LocaleOverlay | null,
): CharacterEntry[] {
  if (lang !== 'en') {
    const v = readObjectArray<CharacterEntry>(overlay, game.id, 'characters');
    if (v) return v;
  }
  return readObjectArray<CharacterEntry>(EN_OVERLAY, game.id, 'characters') ?? [];
}

export function getLocalizedFeatured(
  game: Game,
  lang: string,
  overlay: LocaleOverlay | null,
): FeaturedComment[] {
  if (lang !== 'en') {
    const v = readObjectArray<FeaturedComment>(overlay, game.id, 'featuredComments');
    if (v) return v;
  }
  return readObjectArray<FeaturedComment>(EN_OVERLAY, game.id, 'featuredComments') ?? [];
}

// English-only feature list. Used for structural checks (e.g. "Local Co-op",
// "PC Only" platform badges) where the marker is the canonical English string,
// not a translated label.
export function getEnFeatures(id: string): string[] {
  return readArray(EN_OVERLAY, id, 'features') ?? [];
}
