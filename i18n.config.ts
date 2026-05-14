import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'ru'] as const;
export const defaultLocale = 'ru' as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  const locale = await import('@/lib/i18n/getLocale').then((m) => m.getLocale());
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
