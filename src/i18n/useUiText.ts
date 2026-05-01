import { useLocale } from './store';

// Returns a translator function. Usage:
//   const t = useUiText();
//   <h1>{t('homeHeroTitle', 'Discover Free Browser Games')}</h1>
// Always pass an English fallback as the second arg — that's the source of truth and what English users see.
export function useUiText(): (key: string, fallback: string) => string {
  const { overlay } = useLocale();
  return (key, fallback) => {
    const v = overlay?.ui?.[key];
    return typeof v === 'string' && v.length > 0 ? v : fallback;
  };
}
