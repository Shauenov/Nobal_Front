import { getLocale as nextIntlGetLocale } from 'next-intl/server';
import { defaultLocale, locales, type Locale } from '@/i18n.config';

export async function getLocale(): Promise<Locale> {
  try {
    const locale = await nextIntlGetLocale();
    if (locales.includes(locale as Locale)) {
      return locale as Locale;
    }
  } catch {
    // Fall through to default
  }
  return defaultLocale;
}
