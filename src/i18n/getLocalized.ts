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

type StringField = 'title' | 'description' | 'fullDescription' | 'controls' | 'tips' | 'lore' | 'objectives' | 'scoreLabel';
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

// Resolve a structured (object-array) field. Field name fixes the element type:
//   'controlsTable' → ControlEntry, 'faq' → FaqEntry, etc.
interface ObjectArrayTypes {
  controlsTable: ControlEntry;
  faq: FaqEntry;
  characters: CharacterEntry;
  featuredComments: FeaturedComment;
}

export function getLocalizedObjects<F extends ObjectArrayField>(
  game: Game,
  field: F,
  lang: string,
  overlay: LocaleOverlay | null,
): ObjectArrayTypes[F][] {
  type T = ObjectArrayTypes[F];
  if (lang !== 'en') {
    const v = readObjectArray<T>(overlay, game.id, field);
    if (v) return v;
  }
  return readObjectArray<T>(EN_OVERLAY, game.id, field) ?? [];
}
