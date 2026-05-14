import { useLocale as nextIntlUseLocale } from 'next-intl';
import { useCallback } from 'react';

export function useLocale() {
  const locale = nextIntlUseLocale() as 'en' | 'ru';

  const setLocale = useCallback((newLocale: 'en' | 'ru') => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('preferred-locale', newLocale);
    window.location.href = `/?locale=${newLocale}`;
  }, []);

  return { locale, setLocale };
}
