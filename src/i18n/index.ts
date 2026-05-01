// Public surface for the i18n module.
//
// Adding a new language: see the comment at the top of registry.ts.

export { SUPPORTED_LOCALES, getLocaleLabel, type LocaleOverlay, type GameTranslation } from './registry';
export { useLocale, localeStore } from './store';
export { getLocalizedString, getLocalizedArray, getEnFeatures } from './getLocalized';
export { useUiText } from './useUiText';
