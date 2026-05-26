// Public surface for the i18n module.
//
// Adding a new language: see the comment at the top of registry.ts.

export {
  SUPPORTED_LOCALES,
  getLocaleLabel,
  type LocaleOverlay,
  type GameTranslation,
  type ControlEntry,
  type FaqEntry,
  type CharacterEntry,
  type FeaturedComment,
} from './registry';
export { useLocale, localeStore } from './store';
export {
  getLocalizedString,
  getLocalizedArray,
  getLocalizedControlsTable,
  getLocalizedFaq,
  getLocalizedCharacters,
  getLocalizedFeatured,
  getEnFeatures,
} from './getLocalized';
export { useUiText } from './useUiText';
